package com.whitedevil93.pocketforge.engine

import com.whitedevil93.pocketforge.GenerationCallback

/**
 * One loaded model, behind a single seam so [com.whitedevil93.pocketforge.LocalLlmService]
 * does not depend on which backend (llama.cpp today, LiteRT-LM later) is serving it.
 *
 * Implementations own their own native/runtime resources. [close] must be safe to call more
 * than once and from a different thread than the one that calls [generate].
 */
interface InferenceEngine : AutoCloseable {
    /** Backend id surfaced on getServerStatus, e.g. "llamaCpp" or "litertLm:GPU". */
    val backendId: String

    /** Whether this loaded instance can accept image content — see
     *  docs/litertlm-vl-integration.md §8. Always false for [LlamaCppEngine]; for
     *  [LiteRtLmEngine] it reflects whether the vision executor actually initialized
     *  for the specific model file that was loaded, not just which backend won. */
    val visionAvailable: Boolean

    /**
     * Runs ONE model turn. Blocking — callers are already on a worker thread
     * (the HTTP request thread in [com.whitedevil93.pocketforge.LocalLlmService]).
     *
     * @param requestBodyJson the raw OpenAI-shaped body as received by /v1/chat/completions
     */
    fun generate(requestBodyJson: String, callback: GenerationCallback)

    /** Cooperative abort of an in-flight [generate]; safe to call when idle. */
    fun cancel()
}

/** Failures from loading a model into an [InferenceEngine]. */
sealed class EngineLoadError(message: String, cause: Throwable? = null) : Exception(message, cause) {
    class Native(message: String, cause: Throwable? = null) : EngineLoadError(message, cause)

    /** Every backend in a fallback chain (e.g. NPU → GPU → CPU) failed to initialize. */
    class BackendUnavailable(attempted: List<String>, cause: Throwable?) :
        EngineLoadError("No usable backend (tried ${attempted.joinToString(" → ")})", cause)
}
