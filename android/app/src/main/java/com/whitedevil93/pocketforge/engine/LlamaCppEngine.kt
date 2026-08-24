package com.whitedevil93.pocketforge.engine

import com.whitedevil93.pocketforge.GenerationCallback
import java.util.concurrent.atomic.AtomicBoolean

/**
 * llama.cpp binding — the original GGUF path, moved here verbatim from
 * [com.whitedevil93.pocketforge.LocalLlmService] behind the [InferenceEngine] seam.
 *
 * The native library (pokekit-llm) is loaded once, in LocalLlmPlugin's companion init,
 * before any service start; JNI symbols below resolve against that same process-wide load.
 */
class LlamaCppEngine private constructor(private val handle: Long) : InferenceEngine {
    override val backendId: String = "llamaCpp"

    /** Guards against a double nativeUnloadModel/nativeFreeModel — both are
     *  documented idempotent on the native side, but close() may be called
     *  from more than one teardown path (see LocalLlmService's callers). */
    private val closed = AtomicBoolean(false)

    override fun generate(requestBodyJson: String, callback: GenerationCallback) {
        nativeGenerate(handle, requestBodyJson, callback)
    }

    override fun cancel() {
        nativeCancel(handle)
    }

    override fun close() {
        if (!closed.compareAndSet(false, true)) return
        nativeUnloadModel(handle)
        nativeFreeModel(handle)
    }

    private external fun nativeGenerate(handle: Long, requestBodyJson: String, callback: GenerationCallback)
    private external fun nativeCancel(handle: Long)
    private external fun nativeUnloadModel(handle: Long)
    private external fun nativeFreeModel(handle: Long)

    companion object {
        /** @throws EngineLoadError.Native if the native load fails for any reason. */
        fun load(modelPath: String): LlamaCppEngine {
            val handle = nativeLoadModel(modelPath)
            if (handle == 0L) {
                throw EngineLoadError.Native("Native model load failed for $modelPath")
            }
            return LlamaCppEngine(handle)
        }

        // Static native method (no session handle exists yet) — bound to the
        // outer class LlamaCppEngine in bytecode via @JvmStatic, matching the
        // JNI export's (JNIEnv*, jclass, jstring) signature.
        @JvmStatic
        private external fun nativeLoadModel(path: String): Long
    }
}
