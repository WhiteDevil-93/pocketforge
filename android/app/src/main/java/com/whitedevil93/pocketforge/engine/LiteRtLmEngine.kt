package com.whitedevil93.pocketforge.engine

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.google.ai.edge.litertlm.Backend
import com.google.ai.edge.litertlm.Capabilities
import com.google.ai.edge.litertlm.Conversation
import com.google.ai.edge.litertlm.ConversationConfig
import com.google.ai.edge.litertlm.Engine
import com.google.ai.edge.litertlm.EngineConfig
import com.google.ai.edge.litertlm.ExperimentalApi
import com.google.ai.edge.litertlm.ExperimentalFlags
import com.google.ai.edge.litertlm.LogSeverity
import com.google.ai.edge.litertlm.Message
import com.google.ai.edge.litertlm.MessageCallback
import com.google.ai.edge.litertlm.ToolException
import com.whitedevil93.pocketforge.GenerationCallback
import java.io.File
import java.util.UUID
import java.util.concurrent.CancellationException
import java.util.concurrent.ConcurrentHashMap
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
                    // Constrains sampling to the declared tool schemas, so a malformed
                    // or invented tool call cannot be emitted rather than having to be
                    // recovered afterwards (see configureExperimentalFlags). Set only
                    // when tools were actually declared: under the text protocol
                    // parsed.tools is empty, and asking the engine to honour a response
                    // format it has no schema for is a request for it to constrain
                    // ordinary prose.
                    enableResponseFormat = parsed.tools.isNotEmpty(),
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
                    // Capture thinking channel (Gemma 4)
                    val thought = message.channels["thought"]?.toString()
                    if (!thought.isNullOrEmpty()) {
                        callback.onThoughtToken(thought)
                    }

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

        /**
         * Serialises the process-global [ExperimentalFlags] write with the engine
         * construction that reads it.
         *
         * The flags are a singleton, set per backend attempt so a fallback from GPU to
         * CPU can turn the accelerator-only choices back off. That is correct only while
         * one load runs at a time — and this app cannot assume that.
         * LocalLlmService.interruptLoad() interrupts the loading thread and drops the
         * reference without joining it, and Engine.initialize() is not interruptible, so
         * a stop-then-immediately-retry leaves the old fallback loop running alongside
         * the new one. (The crash guard's per-attempt token exists for exactly that
         * overlap.) Interleaved, one attempt's CPU write lands between another's write
         * and its construction, so a GPU engine comes up with speculative decoding off,
         * or a CPU engine comes up with it on — inverting the gating this code exists
         * to enforce, silently and only sometimes.
         *
         * A lock rather than a per-attempt copy because the flags simply have no
         * per-engine form to pass. Waiting costs nothing that was not already being
         * spent: the load being waited on could not have been interrupted anyway.
         */
        private val engineConstructionLock = ReentrantLock()

        /**
         * Context budget the KV cache is sized from (EngineConfig.maxNumTokens).
         *
         * Measured, not guessed. Estimating tokens at ~4 chars over the 95 real
         * tool-calling conversations in training-data/train.jsonl — generated by
         * executing this app's own handlers, so the tool results are the real ones —
         * the full message array at end of turn runs to a median of 1,000 tokens but a
         * p90 of 7,415 and a max of 7,478, that maximum being a six-Pokemon build:
         * 43 messages across 20 tool-call turns. 18% of those conversations exceed
         * 4,096, which is what this constant was first set to; that would have failed
         * mid-build on precisely the flow the assistant exists for.
         *
         * 16,384 clears the measured worst case by more than 2x — enough slack for the
         * ~400-token system prompt, a thinking block, and the reply itself, and for JSON
         * tokenizing worse than 4 chars/token — while still reserving 8x less KV cache
         * than a 128K default. A turn that somehow ran all 60 tool iterations could
         * still exceed it, but a turn behaving that way is already pathological.
         */
        private const val MAX_CONTEXT_TOKENS = 16_384

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

        /** Marks a speculative-decoding probe as in flight; see probeDrafterOnce. */
        private const val KEY_PENDING_PROBE = "pending_probe"

        /** Suffixed per model id: the probe aborted the process for this bundle. */
        private const val KEY_PROBE_CRASHED_PREFIX = "probe_crashed:"

        // Tokens (see pendingValue below) for load() attempts currently in flight in
        // *this* process. A token found in SharedPreferences but missing from this
        // set could only get there one way: the process that wrote it is gone — a
        // real crash, since this set (unlike SharedPreferences) cannot survive a
        // process restart. A token that IS in this set belongs to a still-running
        // attempt in this same process — proof it hasn't crashed anything — which
        // matters because LocalLlmService's interruptLoad() interrupts and drops the
        // old Thread reference without joining it, and Engine.initialize() isn't
        // interruptible, so a stop-then-immediately-retry can leave an old load()
        // still running when a new one starts and reads the old one's own marker.
        private val liveAttemptTokens = ConcurrentHashMap.newKeySet<String>()

        /** Guards the one-time [Engine.setNativeMinLogSeverity] call below. */
        private val nativeLoggingConfigured = AtomicBoolean(false)

        /**
         * Deliberately NOT a companion `init {}` block, which is where this used to
         * live. A companion init runs on first access to this class — i.e. the moment
         * `LiteRtLmEngine.load(...)` is called, before a single line of [load]'s body.
         * Touching [Engine] there is what triggers LiteRT-LM's own native library
         * load and its static constructors, so a device where that `.so` aborts (a
         * missing or incompatible vendor NPU stub, a failing static ctor) killed the
         * process *before any crash marker could be written* — leaving [load]'s guard
         * structurally unable to ever learn about it, no matter how many times the
         * user retried. Called from inside the guarded span instead, so the very
         * first native touch of this library is covered like every other one.
         */
        private fun configureNativeLoggingOnce() {
            if (!nativeLoggingConfigured.compareAndSet(false, true)) return
            Engine.setNativeMinLogSeverity(LogSeverity.ERROR)
        }

        /**
         * Sets the process-global [ExperimentalFlags] for the backend attempt about to
         * be made. Re-run per attempt rather than once: these are read at Engine
         * construction, and a fallback from GPU down to CPU must be able to turn the
         * GPU-only choices back off rather than inherit them.
         *
         * **Speculative decoding / multi-token prediction.** Autoregressive decode is
         * bound by memory bandwidth, not FLOPs — every active parameter is streamed
         * from DRAM per generated token — so a bundled drafter model that proposes k
         * tokens for the target model to verify in one parallel pass is close to free
         * throughput (Google reports up to 2.2x on mobile GPU, 1.5x on mobile CPU).
         *
         * Two conditions gate it. First, the drafter has to actually be in the bundle:
         * [Capabilities] probes the file for one, so a bundle exported without it is
         * left alone instead of being asked for a speedup it cannot give. Second, it is
         * enabled only on the accelerator backends. Google's own guidance is
         * "universal on GPU, selective on CPU" — on CPU the drafting pass competes for
         * the same cores as verification, so on an open-ended generative turn (which is
         * most of what this app asks for) a low acceptance rate can cost more than it
         * saves. CPU here is the fallback floor for devices that failed NPU and GPU;
         * spending their scarcer cycles on speculation is the wrong bet.
         *
         * **Constrained decoding.** The one failure mode that has actually hurt this
         * app on-device is a fine-tune emitting a tool call that does not parse — an
         * invented tool name, a truncated argument object. Constrained decoding moves
         * that from a parsing problem to a sampling one: the engine masks every token
         * that would violate the declared tool schema, so a malformed call cannot be
         * generated in the first place. This does NOT retire
         * `src/lib/llm/textToolProtocol.ts`: under the text protocol TypeScript declares
         * no tools at all (ChatRequest.parseTools returns empty), so there is no schema
         * here to constrain and the parser remains the only recovery. It is the native
         * tool-calling path that this hardens.
         */
        @OptIn(ExperimentalApi::class)
        private fun configureExperimentalFlags(backendLabel: String, drafterAvailable: Boolean) {
            val acceleratorBacked = backendLabel == "NPU" || backendLabel == "GPU"
            val speculative = acceleratorBacked && drafterAvailable
            ExperimentalFlags.enableSpeculativeDecoding = speculative

            // Enabled unconditionally: it is inert when a Conversation declares no
            // tools and no response format, which is exactly the text-protocol case.
            ExperimentalFlags.enableConversationConstrainedDecoding = true

            // Gemma 4's thinking scratchpad is a means, not an answer. Dropping it from
            // the KV cache once a turn closes stops several hundred tokens of reasoning
            // per turn from crowding out the actual conversation in later turns.
            ExperimentalFlags.filterChannelContentFromKvCache = true

            Log.i(TAG, "flags: speculativeDecoding=$speculative on $backendLabel")
        }

        /**
         * Whether this bundle carries a drafter model for speculative decoding, run once
         * per [load] under its own crash marker.
         *
         * The probe reads the model file through native code, so like everything else in
         * this class it can abort the process rather than throw. It must NOT be guarded by
         * the backend marker, though, and this is the whole reason it has its own: the
         * probe depends only on the bundle, not on the backend. Sharing the backend marker
         * meant a probe crash was recorded against whichever label happened to be current;
         * the next launch skipped that label, reached the next one, ran the same
         * bundle-dependent probe, and crashed again — walking the fallback chain one
         * launch at a time until every backend was blacklisted, with Engine.initialize()
         * never once attempted. A model-wide marker instead disables just this
         * optimisation on the next launch and leaves the backend chain untouched.
         *
         * Failure of any kind is reported as "no drafter": an unusable probe is a reason
         * to skip an optimisation, never a reason to fail the load.
         */
        private fun probeDrafterOnce(
            modelPath: String,
            modelId: String,
            prefs: SharedPreferences,
            commitLogged: SharedPreferences.Editor.(String) -> Unit,
        ): Boolean {
            val crashedKey = "$KEY_PROBE_CRASHED_PREFIX$modelId"
            if (prefs.getBoolean(crashedKey, false)) {
                Log.i(TAG, "skipping speculative-decoding probe for model=$modelId — crashed previously")
                return false
            }

            // A marker left set is only crash evidence if the attempt that wrote it is
            // NOT still running in this process. interruptLoad() interrupts the loading
            // thread and drops it without joining, and neither Capabilities nor
            // Engine.initialize() is interruptible, so a stop-then-retry leaves the old
            // probe genuinely alive alongside the new one. Without the token check the
            // retry would read its predecessor's marker as a crash and disable
            // speculative decoding for this bundle permanently, on a bundle that never
            // crashed. This mirrors what the backend marker already does via
            // liveAttemptTokens; the probe marker not having it was the gap.
            prefs.getString(KEY_PENDING_PROBE, null)?.let { raw ->
                val marker = runCatching {
                    JSONObject(raw).let { it.getString("modelId") to it.getString("token") }
                }.getOrNull()
                when {
                    marker == null -> {
                        Log.w(TAG, "pending probe marker was malformed, discarding: $raw")
                        prefs.edit().remove(KEY_PENDING_PROBE).commitLogged("clearing malformed probe marker")
                    }
                    marker.second in liveAttemptTokens ->
                        Log.i(TAG, "probe marker for model=${marker.first} belongs to a load still running here — not a crash")
                    marker.first == modelId -> {
                        Log.w(TAG, "speculative-decoding probe crashed the process for model=$modelId — disabling it")
                        prefs.edit().putBoolean(crashedKey, true).remove(KEY_PENDING_PROBE)
                            .commitLogged("recording probe crash for $modelId")
                        return false
                    }
                    else -> {
                        // Crashed probing a different bundle. Record it against that one
                        // rather than this one, and carry on.
                        Log.w(TAG, "speculative-decoding probe crashed for a different model=${marker.first} — disabling it there")
                        prefs.edit()
                            .putBoolean("$KEY_PROBE_CRASHED_PREFIX${marker.first}", true)
                            .remove(KEY_PENDING_PROBE)
                            .commitLogged("recording probe crash for ${marker.first}")
                    }
                }
            }

            val probeToken = UUID.randomUUID().toString()
            liveAttemptTokens += probeToken
            prefs.edit()
                .putString(KEY_PENDING_PROBE, JSONObject().put("modelId", modelId).put("token", probeToken).toString())
                .commitLogged("marking probe pending for $modelId")
            return try {
                Capabilities(modelPath).use { it.hasSpeculativeDecodingSupport() }
            } catch (e: Exception) {
                Log.w(TAG, "speculative-decoding probe failed, assuming unsupported: ${e.message}")
                false
            } finally {
                // Order matters. Between retiring the token and clearing the marker there
                // is an instant where the marker is set and its token is no longer live —
                // exactly the state the crash check above reads as "a probe died here".
                // A retry landing in that window would record a permanent crash for a
                // bundle whose probe had just finished normally. Clearing first means the
                // marker is only ever present-with-a-live-token or absent.
                //
                // Clear only our own marker: a concurrent probe may have overwritten it,
                // and erasing theirs would leave their crash undetectable.
                val stillOurs = runCatching {
                    JSONObject(prefs.getString(KEY_PENDING_PROBE, "{}")!!).optString("token") == probeToken
                }.getOrDefault(false)
                if (stillOurs) {
                    prefs.edit().remove(KEY_PENDING_PROBE).commitLogged("clearing probe marker for $modelId")
                }
                liveAttemptTokens -= probeToken
            }
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

            // Content-derived, not just the file name: LocalLlmPlugin.importModel()
            // deletes and replaces an existing file with the same display name on
            // re-import (LocalLlmPlugin.kt ~191-196), so a filename-only identity
            // would let a crash recorded against a broken bundle wrongly follow a
            // later, fixed bundle imported under the same name. Size+mtime is a
            // cheap stand-in for a full content hash — expensive to compute against
            // a multi-GB file on every load — and changes on any real replacement.
            val modelFile = File(modelPath)
            val modelId = "${modelFile.name}:${modelFile.length()}:${modelFile.lastModified()}"

            // Logged unconditionally, not enforced as a precondition: a backend may mmap
            // rather than copy the weights, so "file is bigger than free RAM" is not by
            // itself a reason to refuse the load. But when the OS low-memory killer takes
            // the process during a load, it leaves no Java stack trace anywhere — this
            // line is then the only evidence distinguishing that from a native abort.
            runCatching {
                val memInfo = android.app.ActivityManager.MemoryInfo()
                (context.getSystemService(Context.ACTIVITY_SERVICE) as android.app.ActivityManager)
                    .getMemoryInfo(memInfo)
                Log.i(TAG, "load starting: model=${modelFile.name} sizeMb=${modelFile.length() / (1024 * 1024)} " +
                    "availMemMb=${memInfo.availMem / (1024 * 1024)} totalMemMb=${memInfo.totalMem / (1024 * 1024)} " +
                    "lowMemory=${memInfo.lowMemory} thresholdMb=${memInfo.threshold / (1024 * 1024)}")
            }.onFailure { Log.w(TAG, "could not read memory info: ${it.message}") }
            fun knownCrashKey(id: String) = "$KEY_KNOWN_CRASH_LABELS_PREFIX$id"
            val knownCrashLabels = prefs.getStringSet(knownCrashKey(modelId), emptySet())!!.toMutableSet()

            prefs.getString(KEY_PENDING_LABEL, null)?.let { raw ->
                val marker = runCatching {
                    JSONObject(raw).let { Triple(it.getString("modelId"), it.getString("label"), it.getString("token")) }
                }.getOrNull()
                when {
                    marker == null -> {
                        Log.w(TAG, "pending crash marker was malformed, discarding: $raw")
                        prefs.edit().remove(KEY_PENDING_LABEL).commitLogged("clearing malformed pending marker")
                    }
                    marker.third in liveAttemptTokens -> {
                        // Belongs to an attempt still running in *this* process — see
                        // liveAttemptTokens' declaration for why that's proof it hasn't
                        // crashed anything. Leave it alone entirely: it isn't stale, and
                        // that attempt's own finally block owns clearing it.
                        Log.i(TAG, "pending marker for ${marker.second}/${marker.first} belongs to " +
                            "a still-running attempt in this process — not a crash, leaving it")
                    }
                    else -> {
                        val (crashedModelId, crashedLabel, _) = marker
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
                        prefs.edit().remove(KEY_PENDING_LABEL).commitLogged("clearing stale pending marker")
                    }
                }
            }

            val attempted = mutableListOf<String>()
            var last: Throwable? = null
            // Once per load, not once per attempt: the probe depends only on the bundle,
            // and running it inside the loop is what let a single probe crash consume the
            // whole backend chain. See probeDrafterOnce.
            val drafterAvailable = probeDrafterOnce(modelPath, modelId, prefs) { commitLogged(it) }

            for ((name, makeBackend) in backends(context.applicationInfo.nativeLibraryDir)) {
                for (withVision in booleanArrayOf(true, false)) {
                    val label = if (withVision) "$name+vision" else name
                    if (label in knownCrashLabels) {
                        Log.i(TAG, "skipping backend=$label for model=$modelId — crashed the process on a previous load")
                        attempted += "$label (skipped — crashed previously)"
                        continue
                    }
                    attempted += label
                    // Written with commit() (synchronous, durable) rather than apply():
                    // if anything below crashes the process, an async write might never
                    // have reached disk, and this whole guard exists for exactly that
                    // moment. The random token both lets this attempt's own finally
                    // block tell its marker apart from one written by a second,
                    // overlapping load() for the same label, and (via liveAttemptTokens
                    // above) lets any load() distinguish "still running in this process"
                    // from "the process that wrote this is gone" — LocalLlmService's
                    // interruptLoad() interrupts and drops the old Thread reference
                    // without joining it, and Engine.initialize() isn't interruptible,
                    // so a stop-then-immediately-retry can leave the old load() still
                    // running when a new one starts and reads the old one's own marker.
                    val attemptToken = UUID.randomUUID().toString()
                    val pendingValue = JSONObject()
                        .put("modelId", modelId)
                        .put("label", label)
                        .put("token", attemptToken)
                        .toString()
                    liveAttemptTokens += attemptToken
                    prefs.edit().putString(KEY_PENDING_LABEL, pendingValue)
                        .commitLogged("marking $label pending for $modelId")
                    // candidate is constructed *inside* the guarded span, not before it:
                    // a bad NPU/GPU delegate can crash the process while its native
                    // library is being loaded during Backend.NPU()/Backend.GPU() or
                    // during Engine(EngineConfig(...)) construction itself, not only
                    // inside initialize() — LiteRT-LM issue #2114 documents the latter,
                    // but a construction-time crash is exactly as real and this guard
                    // must cover every native-adjacent call for this attempt, not just
                    // the last one, or a crash there leaves no marker to detect it by.
                    var candidate: Engine? = null
                    try {
                        // First statement inside the guard on purpose: this is the call
                        // that pulls in LiteRT-LM's native library on this process's very
                        // first load attempt. See configureNativeLoggingOnce's KDoc.
                        configureNativeLoggingOnce()
                        // engineConstructionLock spans the flag write AND the construction
                        // that reads it — see the lock's own KDoc for why they cannot be
                        // separated.
                        //
                        // lockInterruptibly, not withLock's lock(): interruptLoad() stops a
                        // load by interrupting its thread, and a thread parked in lock()
                        // ignores that entirely. A user who stopped a load and retried would
                        // otherwise have the stopped attempt sit out the older load's
                        // multi-minute initialize(), then run its own in full — and the two
                        // together can blow LOAD_WATCHDOG_MS (15 min) even when either alone
                        // would have finished inside it. The re-check after acquisition
                        // covers the interrupt that arrives while queued, which
                        // lockInterruptibly cannot observe once it has been granted the lock.
                        engineConstructionLock.lockInterruptibly()
                        val loaded = try {
                            if (Thread.interrupted()) {
                                throw InterruptedException("load was stopped while queued behind another engine construction")
                            }
                            configureExperimentalFlags(name, drafterAvailable)
                            val backendInstance = makeBackend()
                            val built = Engine(
                                EngineConfig(
                                    modelPath = modelPath,
                                    backend = backendInstance,
                                    // ALWAYS use GPU for vision if available to avoid SIGSEGV on CPU;
                                    // a device without GPU support will throw here and trigger the
                                    // visionAvailable = false fallback (docs/litertlm-vl-integration.md §8).
                                    visionBackend = if (withVision) Backend.GPU() else null,
                                    // The importer sends one screenshot at a time; leaving this
                                    // at the model default risks a larger KV allocation than
                                    // needed on a device already carrying several GB of weights.
                                    maxNumImages = if (withVision) 1 else null,
                                    // Defaults to the model's own directory otherwise — for a
                                    // model imported into filesDir that means unevictable
                                    // compiled kernels parked next to a multi-GB file.
                                    // cacheDir is OS-reclaimable.
                                    cacheDir = context.cacheDir.absolutePath,
                                    // The KV cache is sized from this, so leaving it at a
                                    // Gemma 4 bundle's own 128K default reserves a cache
                                    // orders of magnitude larger than this app fills. But the
                                    // budget has to cover a whole *turn*, not a whole message:
                                    // localLlamaCpp.sendMessage appends each assistant call
                                    // and each JSON tool result to the array and resends the
                                    // lot, so context grows monotonically across up to
                                    // MAX_TOOL_ITERATIONS passes, and useChatStore's 40-message
                                    // trim does not run until the turn is already back in the
                                    // UI. See MAX_CONTEXT_TOKENS for how the number was picked.
                                    maxNumTokens = MAX_CONTEXT_TOKENS,
                                )
                            )
                            // Published to [candidate] BEFORE the throwing call, never
                            // after: initialize() failing is the normal path here — the
                            // NPU→GPU→CPU fallback is built on those throws — and if the
                            // only reference lived in this lambda's return value, a throw
                            // would unwind past the assignment and leave the catch below
                            // with nothing to close. Every failed attempt would then leak
                            // a multi-GB native allocation, and the fallback would walk
                            // itself out of memory before reaching the backend that works.
                            candidate = built
                            // initialize() is inside the lock too: the flags are read
                            // while the engine is being brought up, not only at the
                            // constructor call, and serialising the expensive load is
                            // wanted anyway — two multi-GB engines coming up at once is
                            // an OOM risk in its own right.
                            built.initialize()
                            built
                        } finally {
                            engineConstructionLock.unlock()
                        }
                        Log.i(TAG, "loaded on backend=$name visionAvailable=$withVision")
                        return LiteRtLmEngine(loaded, name, visionAvailable = withVision)
                    } catch (e: InterruptedException) {
                        // Distinct from the generic handler below on purpose: an interrupt
                        // means the user stopped this load, not that this backend is
                        // unusable. Falling through to the next backend would spend minutes
                        // initializing something nobody is waiting for. Restore the flag and
                        // let it out; the finally below still frees the half-built engine
                        // and clears this attempt's marker.
                        Thread.currentThread().interrupt()
                        try {
                            candidate?.close()
                        } catch (closeError: Exception) {
                            Log.w(TAG, "failed to close interrupted engine: ${closeError.message}")
                        }
                        throw e
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
                        // candidate can be null here if makeBackend()/Engine(...) itself
                        // is what threw, before ever reaching initialize().
                        try {
                            candidate?.close()
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
                        liveAttemptTokens -= attemptToken
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
