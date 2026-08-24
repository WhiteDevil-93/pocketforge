package com.whitedevil93.pocketforge.engine

import android.content.Context
import android.util.Log
import com.google.ai.edge.litertlm.Backend
import com.google.ai.edge.litertlm.Conversation
import com.google.ai.edge.litertlm.ConversationConfig
import com.google.ai.edge.litertlm.Engine
import com.google.ai.edge.litertlm.EngineConfig
import com.google.ai.edge.litertlm.LogSeverity
import com.google.ai.edge.litertlm.Message
import com.google.ai.edge.litertlm.MessageCallback
import com.google.ai.edge.litertlm.ToolException
import com.whitedevil93.pocketforge.GenerationCallback
import java.util.concurrent.CancellationException
import java.util.concurrent.CountDownLatch
import java.util.concurrent.atomic.AtomicBoolean
import org.json.JSONArray
import org.json.JSONObject

/**
 * LiteRT-LM binding for a .litertlm bundle — see docs/litertlm-android-adapter.md.
 *
 * One [Conversation] per [generate] call, built entirely from that request's history
 * (§4.2) — nothing is replayed as traffic, so there is no cross-request state here
 * beyond [activeConversation], which exists only so a concurrent [cancel] has
 * something to reach. Tool calls (§4.4) are declared to the model but never executed
 * here — `automaticToolCalling = false` on every Conversation this class creates, so
 * a call is always surfaced back to TypeScript via `onToolCallDelta` and executed by
 * the real handlers in `toolRunner.ts`, the same as the llama.cpp backend.
 */
class LiteRtLmEngine private constructor(
    private val engine: Engine,
    private val backendName: String,
    override val visionAvailable: Boolean,
) : InferenceEngine {
    override val backendId: String = "litertLm:$backendName"

    private val closed = AtomicBoolean(false)

    /** The Conversation currently in flight, if any — set for the duration of one
     *  [generate] call so a concurrent [cancel] (from a different thread: the client
     *  disconnected, or the service is tearing down) has something to reach. @Volatile
     *  because cancel() reads it from whatever thread called it, unrelated to the
     *  thread running generate(). */
    @Volatile private var activeConversation: Conversation? = null

    /**
     * Runs one turn: builds a fresh Conversation from the parsed request (per
     * docs/litertlm-android-adapter.md §4.2 — history and prior state are all
     * *configuration* here, nothing is replayed), streams the response via the
     * [MessageCallback] overload (no coroutine scope needed — this is already called
     * from a plain HTTP worker thread), and blocks until the turn is fully done. The
     * blocking contract matches [InferenceEngine.generate]'s and mirrors how
     * LlamaCppEngine's nativeGenerate already behaves from LocalLlmService's POV.
     */
    override fun generate(requestBodyJson: String, callback: GenerationCallback) {
        val parsed = parseChatRequest(requestBodyJson, visionAvailable)
        // §4.2: SamplerConfig is inert on NPU (the gallery's own pattern passes null
        // there) — build it as null on that backend rather than silently ignoring a
        // request's sampler settings without saying so anywhere.
        val samplerConfig = if (backendName == "NPU") null else parsed.samplerConfig
        val conversation = try {
            engine.createConversation(
                ConversationConfig(
                    systemInstruction = parsed.systemInstruction,
                    initialMessages = parsed.initialMessages,
                    samplerConfig = samplerConfig,
                    tools = parsed.tools,
                    // §4.4: PocketForge's tools are TypeScript in the WebView, not
                    // Kotlin — the model's calls must come back to us to execute, not
                    // be run in-process by the library.
                    automaticToolCalling = false,
                )
            )
        } catch (e: ToolException) {
            // A malformed tool schema is a request-shape problem, not a generation
            // failure — ToolManager's eager parsing (inside createConversation) throws
            // before any inference happens, so report it as that distinct case rather
            // than the generic "LiteRT-LM generation failed" message.
            callback.onError("Invalid tool declaration: ${e.message}")
            return
        }
        activeConversation = conversation
        try {
            val latch = CountDownLatch(1)
            val assembled = StringBuilder()
            val toolCallsLog = JSONArray()
            var toolCallIndex = 0
            val messageCallback = object : MessageCallback {
                override fun onMessage(message: Message) {
                    // contents and toolCalls are independent fields on Message, not
                    // mutually exclusive — handle both rather than assuming a chunk is
                    // one or the other (e.g. lead-in text before a tool call).
                    val piece = message.toString()
                    if (piece.isNotEmpty()) {
                        assembled.append(piece)
                        callback.onToken(piece)
                    }
                    // §4.4: with automaticToolCalling = false, a tool call is delivered
                    // whole here rather than executed by the library.
                    for (toolCall in message.toolCalls) {
                        val index = toolCallIndex++
                        // org.json (already used throughout this app), not the Gson the
                        // library pulls in transitively — one JSON library to depend on.
                        val argumentsJson = JSONObject(toolCall.arguments).toString()
                        toolCallsLog.put(
                            JSONObject().put("name", toolCall.name).put("arguments", argumentsJson)
                        )
                        // One delta per call with the complete name/arguments — the TS
                        // ToolCallAccumulator concatenates fragments by index, so a
                        // single whole-value fragment is handled correctly as-is. The
                        // index is monotonic across this whole generate() call, never
                        // reset per onMessage, so it can never be reused even if tool
                        // calls arrive across more than one onMessage invocation.
                        callback.onToolCallDelta(index, toolCall.name, argumentsJson)
                    }
                }

                override fun onDone() {
                    // toolCallsLog is diagnostic only — LocalLlmService.handleChatCompletions
                    // logs onDone's second argument but never sends it to the client; the
                    // client already has the tool calls from the onToolCallDelta stream.
                    callback.onDone(assembled.toString(), toolCallsLog.toString())
                    latch.countDown()
                }

                override fun onError(throwable: Throwable) {
                    if (throwable is CancellationException) {
                        // §4.3: a cancelled generation arrives here, not onDone() — this
                        // is the client-disconnect / server-stop path, not a failure.
                        callback.onDone(assembled.toString(), toolCallsLog.toString())
                    } else {
                        callback.onError(throwable.message ?: "LiteRT-LM generation failed")
                    }
                    latch.countDown()
                }
            }
            conversation.sendMessageAsync(
                parsed.lastMessage,
                messageCallback,
                maxOutputToken = parsed.maxOutputToken,
                repetitionPenaltyConfig = parsed.repetitionPenaltyConfig,
            )
            try {
                latch.await()
            } catch (e: InterruptedException) {
                Thread.currentThread().interrupt()
                throw IllegalStateException("Interrupted while waiting for LiteRT-LM generation", e)
            }
        } finally {
            activeConversation = null
            // Conversation.close() throws if already closed, unlike InferenceEngine's
            // own idempotent contract — but nothing else ever closes this instance, so
            // exactly one close() here is correct, not merely defensive.
            conversation.close()
        }
    }

    override fun cancel() {
        val conversation = activeConversation ?: return
        try {
            // A no-op when idle (per its own KDoc); the IllegalStateException it can
            // throw means the conversation was already closed — a real race against
            // generate()'s finally block, not a bug, so swallow it like the idle case.
            conversation.cancelProcess()
        } catch (_: IllegalStateException) {
            Log.d(TAG, "cancelProcess on an already-closed conversation — ignoring")
        }
    }

    override fun close() {
        if (!closed.compareAndSet(false, true)) return
        engine.close()
    }

    companion object {
        private const val TAG = "LiteRtLmEngine"

        init {
            // Quiets LiteRT-LM's native logging; harmless to call more than once,
            // and this only runs once per process (companion init).
            Engine.setNativeMinLogSeverity(LogSeverity.ERROR)
        }

        /**
         * Backend preference order. NPU and GPU are tried first for speed, but either
         * can fail to initialize on real hardware — LiteRT-LM issue #2114 documents GPU
         * init failing outright on a Galaxy S26 Exynos (Xclipse 960 + ANGLE-CL), a
         * current flagship — so CPU is the guaranteed floor every device can reach.
         */
        private fun backends(nativeLibraryDir: String): List<Pair<String, () -> Backend>> = listOf(
            "NPU" to { Backend.NPU(nativeLibraryDir = nativeLibraryDir) },
            "GPU" to { Backend.GPU() },
            "CPU" to { Backend.CPU() },
        )

        /**
         * Walks the backend fallback chain, returning the first that initializes.
         * Vision is a load-time EngineConfig choice, not a per-request toggle
         * (docs/litertlm-vl-integration.md §8) — for each backend, try it with
         * `visionBackend` set first, and if that specific attempt fails, retry the
         * *same* backend without vision before moving on to the next one. A
         * text-only bundle (no vision tower to initialize) is expected to fail the
         * vision-enabled attempt, not the backend itself — this is what lets the
         * same code path serve both bundle types without the caller declaring which
         * one was imported.
         *
         * @throws EngineLoadError.BackendUnavailable if every backend fails, with and
         *   without vision.
         */
        fun load(modelPath: String, context: Context): LiteRtLmEngine {
            val attempted = mutableListOf<String>()
            var last: Throwable? = null
            for ((name, makeBackend) in backends(context.applicationInfo.nativeLibraryDir)) {
                for (withVision in booleanArrayOf(true, false)) {
                    val label = if (withVision) "$name+vision" else name
                    attempted += label
                    val backendInstance = makeBackend()
                    val candidate = Engine(
                        EngineConfig(
                            modelPath = modelPath,
                            backend = backendInstance,
                            visionBackend = if (withVision) backendInstance else null,
                            // The importer sends one screenshot at a time; leaving this
                            // at the model default risks a larger KV allocation than
                            // needed on a device already carrying several GB of weights.
                            maxNumImages = if (withVision) 1 else null,
                            // Defaults to the model's own directory otherwise — for a
                            // model imported into filesDir that means unevictable
                            // compiled kernels parked next to a multi-GB file.
                            // cacheDir is OS-reclaimable.
                            cacheDir = context.cacheDir.absolutePath,
                        )
                    )
                    try {
                        candidate.initialize()
                        Log.i(TAG, "loaded on backend=$name visionAvailable=$withVision")
                        return LiteRtLmEngine(candidate, name, visionAvailable = withVision)
                    } catch (e: Exception) {
                        // Catching Exception, not Throwable: an Error (OOM,
                        // UnsatisfiedLinkError) is not this attempt's problem to retry
                        // around and propagates immediately, failing the whole load.
                        Log.w(TAG, "backend $label unavailable: ${e.message}")
                        // A half-initialized engine still holds native memory; free it
                        // before the next attempt so this fallback doesn't leak an
                        // engine's worth of allocation on the way to the next one.
                        try {
                            candidate.close()
                        } catch (closeError: Exception) {
                            Log.w(TAG, "close() after failed init also failed: ${closeError.message}")
                        }
                        last = e
                    }
                }
            }
            throw EngineLoadError.BackendUnavailable(attempted, last)
        }
    }
}
