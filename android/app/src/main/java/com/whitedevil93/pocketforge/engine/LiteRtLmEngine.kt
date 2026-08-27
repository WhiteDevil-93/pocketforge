package com.whitedevil93.pocketforge.engine

import android.content.Context
import android.content.SharedPreferences
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
import java.io.File
import java.util.UUID
import java.util.concurrent.CancellationException
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.locks.ReentrantLock
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

    /** Held for the entire duration of [generate] — mirrors LlamaCppEngine's
     *  native generateMutex, which close()/teardown already waits on before
     *  freeing anything. [close] needs the same guarantee here: cancel()'s
     *  conversation.cancelProcess() only *requests* cancellation and returns
     *  immediately, so without this a close() called right after cancel()
     *  (LocalLlmService's forceStop/handleStop both do exactly that) could
     *  free the engine while generate()'s still-running sendMessageAsync call
     *  is using it. */
    private val generationLock = ReentrantLock()

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
        generationLock.lock()
        try {
            generateLocked(requestBodyJson, callback)
        } finally {
            generationLock.unlock()
        }
    }

    private fun generateLocked(requestBodyJson: String, callback: GenerationCallback) {
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
                if (!latch.await(GENERATION_TIMEOUT_MS, TimeUnit.MILLISECONDS)) {
                    throw IllegalStateException("Timed out waiting for LiteRT-LM generation to complete")
                }
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
        if (generationLock.tryLock()) {
            try {
                engine.close()
            } finally {
                generationLock.unlock()
            }
            return
        }
        // A generation is still winding down — cancelProcess() (already called by
        // the caller: forceStop/handleStop both call cancel() immediately before
        // close()) only requests cancellation and returns asynchronously, so the
        // lock isn't released until generate()'s in-flight call actually observes
        // it and returns. Finish the wait on a background thread instead of
        // blocking whoever called close(): two of its three call sites
        // (the load watchdog, onTrimMemory) run on the main thread, and blocking
        // that for a stuck generation would be a guaranteed ANR, not a fix.
        // generate()'s own GENERATION_TIMEOUT_MS bounds this to at most a few
        // minutes even in the worst case.
        Thread({
            generationLock.lock()
            try {
                engine.close()
            } finally {
                generationLock.unlock()
            }
        }, "litertlm-engine-close").start()
    }

    companion object {
        private const val TAG = "LiteRtLmEngine"

        // Bounds the wait for the LiteRT-LM callback below — without it, a
        // library bug that never calls onDone/onError would park the HTTP
        // worker thread forever. Matches LocalLlmPlugin's own READ_TIMEOUT_MS,
        // an existing precedent for "how long a generation is allowed to take"
        // in this codebase, generous enough for a long on-device reply.
        private const val GENERATION_TIMEOUT_MS = 300_000L

        // Crash-loop guard: a bad GPU/NPU delegate can abort the whole process during
        // Engine.initialize() (LiteRT-LM issue #2114) rather than throwing a catchable
        // Exception — `catch (e: Exception)` below never sees it, because there's no
        // Kotlin frame left to catch into. The only signal available after that is
        // "we wrote KEY_PENDING_LABEL before the call and never got to clear it," so a
        // dangling value found on the *next* load() is treated as proof that label
        // killed the process and is skipped permanently on this device from then on.
        // Excluded from Android backup/device-transfer (see res/xml/data_extraction_rules.xml,
        // res/xml/backup_rules.xml) — this records what crashes *this device's*
        // drivers, and must never follow a restore onto different hardware.
        private const val PREFS_NAME = "litertlm_crash_guard"
        private const val KEY_PENDING_LABEL = "pending_label"
        // Suffixed per model file name (LiteRtLmEngine.load's modelId) rather than
        // one device-wide set: a backend that crashes loading one bundle (e.g. a
        // vision bundle needing more VRAM than a device's GPU has) must not also
        // get blacklisted for a smaller, unrelated bundle that would load on it fine.
        private const val KEY_KNOWN_CRASH_LABELS_PREFIX = "known_crash_labels:"

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
         * A label that crashed the whole process loading this same model file on a
         * previous call (see the PREFS_NAME/KEY_PENDING_LABEL guard above) is skipped
         * without being retried; the same label crashing while loading a *different*
         * model does not affect this one.
         *
         * @throws EngineLoadError.BackendUnavailable if every non-skipped backend
         *   fails, with and without vision.
         */
        fun load(modelPath: String, context: Context): LiteRtLmEngine {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

            // commit() is synchronous specifically so a durability failure is knowable —
            // silently proceeding as if a write landed would defeat the point of using
            // commit() over apply() in the first place.
            fun SharedPreferences.Editor.commitLogged(what: String) {
                if (!commit()) Log.w(TAG, "SharedPreferences commit failed: $what")
            }

            // The imported bundle's file name — stable across reloads of the same
            // model, distinct across different ones (see KEY_KNOWN_CRASH_LABELS_PREFIX).
            val modelId = File(modelPath).name
            fun knownCrashKey(id: String) = "$KEY_KNOWN_CRASH_LABELS_PREFIX$id"
            val knownCrashLabels = prefs.getStringSet(knownCrashKey(modelId), emptySet())!!.toMutableSet()

            prefs.getString(KEY_PENDING_LABEL, null)?.let { raw ->
                val marker = runCatching {
                    JSONObject(raw).let { it.getString("modelId") to it.getString("label") }
                }.getOrNull()
                if (marker == null) {
                    Log.w(TAG, "pending crash marker was malformed, discarding: $raw")
                } else {
                    val (crashedModelId, crashedLabel) = marker
                    Log.w(TAG, "backend=$crashedLabel for model=$crashedModelId never returned on " +
                        "the previous load — it crashed the process; skipping it for that model on " +
                        "this device from now on")
                    val crashedModelKnown =
                        prefs.getStringSet(knownCrashKey(crashedModelId), emptySet())!!.toMutableSet()
                    crashedModelKnown += crashedLabel
                    prefs.edit()
                        .putStringSet(knownCrashKey(crashedModelId), crashedModelKnown)
                        .commitLogged("recording crash for $crashedModelId/$crashedLabel")
                    if (crashedModelId == modelId) knownCrashLabels += crashedLabel
                }
                prefs.edit().remove(KEY_PENDING_LABEL).commitLogged("clearing stale pending marker")
            }

            val attempted = mutableListOf<String>()
            var last: Throwable? = null
            for ((name, makeBackend) in backends(context.applicationInfo.nativeLibraryDir)) {
                for (withVision in booleanArrayOf(true, false)) {
                    val label = if (withVision) "$name+vision" else name
                    if (label in knownCrashLabels) {
                        Log.i(TAG, "skipping backend=$label for model=$modelId — crashed the process on a previous load")
                        attempted += "$label (skipped — crashed previously)"
                        continue
                    }
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
                    // Written with commit() (synchronous, durable) rather than apply():
                    // if initialize() crashes the process on the next line, an async
                    // write might never have reached disk, and this whole guard exists
                    // for exactly that moment. The random token lets this attempt's own
                    // finally block below tell its marker apart from one written by a
                    // second, overlapping load() for the same label — LocalLlmService's
                    // interruptLoad() interrupts and drops the old Thread reference
                    // without joining it, and Engine.initialize() isn't interruptible,
                    // so a stop-then-immediately-retry can leave the old load() still
                    // running when a new one starts. Without the token, whichever
                    // attempt's finally runs first would erase the marker out from
                    // under the other one.
                    val pendingValue = JSONObject()
                        .put("modelId", modelId)
                        .put("label", label)
                        .put("token", UUID.randomUUID().toString())
                        .toString()
                    prefs.edit().putString(KEY_PENDING_LABEL, pendingValue)
                        .commitLogged("marking $label pending for $modelId")
                    try {
                        candidate.initialize()
                        Log.i(TAG, "loaded on backend=$name visionAvailable=$withVision")
                        return LiteRtLmEngine(candidate, name, visionAvailable = withVision)
                    } catch (e: Exception) {
                        // Catching Exception, not Throwable: an Error (OOM,
                        // UnsatisfiedLinkError) is not this attempt's problem to retry
                        // around and propagates immediately, failing the whole load —
                        // but the finally below still clears the marker for it, since
                        // LocalLlmService's outer catch(Throwable) means an Error here
                        // reaches Kotlin too and never actually crashes the process.
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
                    } finally {
                        // Runs for the success return above, the caught Exception case,
                        // and an uncaught Error alike (JVM finally semantics: it runs
                        // during normal unwinding regardless of throwable type) — the
                        // only way to skip it is the process dying outright before
                        // unwinding can happen, which is precisely the one case this
                        // marker exists to detect. Only clear it if it's still the
                        // value *this* attempt wrote — see pendingValue's comment above.
                        if (prefs.getString(KEY_PENDING_LABEL, null) == pendingValue) {
                            prefs.edit().remove(KEY_PENDING_LABEL)
                                .commitLogged("clearing pending marker for $label/$modelId")
                        }
                    }
                }
            }
            throw EngineLoadError.BackendUnavailable(attempted, last)
        }
    }
}
