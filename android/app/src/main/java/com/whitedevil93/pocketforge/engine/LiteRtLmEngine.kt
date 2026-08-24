package com.whitedevil93.pocketforge.engine

import android.content.Context
import android.util.Log
import com.google.ai.edge.litertlm.Backend
import com.google.ai.edge.litertlm.Engine
import com.google.ai.edge.litertlm.EngineConfig
import com.google.ai.edge.litertlm.LogSeverity
import com.whitedevil93.pocketforge.GenerationCallback
import java.util.concurrent.atomic.AtomicBoolean

/**
 * LiteRT-LM binding for a .litertlm bundle — see docs/litertlm-android-adapter.md.
 *
 * Step 4 (this file): engine construction and the NPU→GPU→CPU backend fallback.
 * [generate] and [cancel] get their real implementation in step 5, once request
 * parsing and Conversation construction are wired up; until then [generate] fails
 * loudly (LocalLlmService's existing catch-and-report path turns that into a normal
 * SSE error frame) and [cancel] is a genuine no-op, not a placeholder — every
 * LocalLlmService teardown path calls `engine?.cancel()` unconditionally, including
 * right after a load with nothing yet generating, so it must never throw.
 */
class LiteRtLmEngine private constructor(
    private val engine: Engine,
    backendName: String,
) : InferenceEngine {
    override val backendId: String = "litertLm:$backendName"

    private val closed = AtomicBoolean(false)

    override fun generate(requestBodyJson: String, callback: GenerationCallback) {
        throw UnsupportedOperationException(
            "LiteRT-LM generation not implemented yet — see docs/litertlm-android-adapter.md step 5"
        )
    }

    override fun cancel() {
        // No Conversation exists yet to cancel (step 5 adds one). Intentionally empty.
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
         * @throws EngineLoadError.BackendUnavailable if every backend fails.
         */
        fun load(modelPath: String, context: Context): LiteRtLmEngine {
            val attempted = mutableListOf<String>()
            var last: Throwable? = null
            for ((name, makeBackend) in backends(context.applicationInfo.nativeLibraryDir)) {
                attempted += name
                val candidate = Engine(
                    EngineConfig(
                        modelPath = modelPath,
                        backend = makeBackend(),
                        // Defaults to the model's own directory otherwise — for a model
                        // imported into filesDir that means unevictable compiled kernels
                        // parked next to a multi-GB file. cacheDir is OS-reclaimable.
                        cacheDir = context.cacheDir.absolutePath,
                    )
                )
                try {
                    candidate.initialize()
                    Log.i(TAG, "loaded on backend=$name")
                    return LiteRtLmEngine(candidate, name)
                } catch (e: Exception) {
                    // Catching Exception, not Throwable: an Error (OOM,
                    // UnsatisfiedLinkError) is not this backend's problem to retry
                    // around and propagates immediately, failing the whole load.
                    Log.w(TAG, "backend $name unavailable: ${e.message}")
                    // A half-initialized engine still holds native memory; free it
                    // before the next attempt so a 3-step fallback doesn't leak two
                    // engines' worth of allocation on the way to CPU.
                    try {
                        candidate.close()
                    } catch (closeError: Exception) {
                        Log.w(TAG, "close() after failed init also failed: ${closeError.message}")
                    }
                    last = e
                }
            }
            throw EngineLoadError.BackendUnavailable(attempted, last)
        }
    }
}
