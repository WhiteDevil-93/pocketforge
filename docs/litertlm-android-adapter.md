# Kotlin adapter plan: running `.litertlm` via LiteRT-LM alongside llama.cpp

**Status:** plan only — no code written yet.
**Target artefacts:** `vgc_e4b_v5_heretic.litertlm` (3.87 GB, text) and
`vgc_e4b_v5_heretic_vl.litertlm` (4.03 GB, text + vision), both in
`WhiteDevil6969/vgc-e4b-v5-litert`.
**Goal:** run those bundles on device without disturbing the existing
GGUF/llama.cpp path or any TypeScript above the bridge.

---

## 0. Architectural reality check

PocketForge's Android side is **not** a Compose app. There are three Kotlin/Java files:

| file | role |
|---|---|
| `LocalLlmPlugin.kt` | Capacitor `Plugin` — SAF import, `startServer`/`stopServer`/`getServerStatus`/`chatOnce`, SSE→event fan-out |
| `LocalLlmService.kt` | foreground `Service` — model lifecycle, a hand-rolled HTTP/SSE server on `127.0.0.1`, five JNI externals |
| `MainActivity.java` | Capacitor host |

All UI is React/TypeScript in the WebView. So the usual Android house style —
Compose, Hilt, `@HiltViewModel`, `StateFlow` screens, Repository→UseCase layering —
**has nothing to attach to here** and must not be retrofitted as part of this work.
What does carry over, and is binding on this plan:

- model load on `Dispatchers.IO` / a dedicated thread, never main;
- token streaming through `callbackFlow`/`channelFlow`, not ad-hoc listeners;
- `onTrimMemory` unload for a 4 GB resident model;
- sealed error types, `Result<T>` at boundaries, no exceptions thrown at the plugin layer;
- never `GlobalScope`;
- R8 keep rules for every JNI-visible class;
- no magic numbers — named constants, as the file already does.

## 1. The invariant

Everything above the JNI boundary already agrees on one contract:

```
localLlamaCpp.ts  →  LocalLlmPlugin.chatOnce()  →  HTTP POST 127.0.0.1:<port>/v1/chat/completions
                  ←  chatOnceEvent (requestId-tagged)  ←  SSE frames
```

`src/lib/llm/localLlamaCpp.ts:6` states it explicitly: the multi-turn tool loop lives in
TypeScript, and **each model turn is exactly one `chatOnce` call**. `LocalLlmService.kt:480`
(`handleChatCompletions`) writes three frame shapes — `delta.content`, `delta.tool_calls[]`,
and `[DONE]` — and `LocalLlmPlugin.kt:481` (`chatOnce`) parses them back into
`chatOnceEvent`s.

**This contract does not change.** LiteRT-LM is swapped in *below* `GenerationCallback`
(`LocalLlmService.kt:29`). If the plan is executed correctly, `src/lib/llm/`,
`src/lib/native/localLlm.ts`, and every component above them compile untouched, and the
only TypeScript edits are the settings union and its store migration (§6).

## 2. Engine abstraction

Today the service *is* the llama.cpp binding: `nativeHandle: Long` is a companion field
(`LocalLlmService.kt:55`) touched from `handleStart`, `handleStop`, `abortLoad`,
`onDestroy`, and `handleChatCompletions`. Introduce a seam.

```kotlin
// android/app/src/main/java/com/whitedevil93/pocketforge/engine/InferenceEngine.kt
package com.whitedevil93.pocketforge.engine

/**
 * One loaded model. Implementations own their own native/runtime resources and
 * must be safe to close() from a thread other than the one that generate()s.
 */
interface InferenceEngine : AutoCloseable {
    /** Human-readable backend id surfaced in getServerStatus (e.g. "llamaCpp", "litertLm:GPU"). */
    val backendId: String

    /**
     * Runs ONE model turn. Blocking — callers are already on a worker thread.
     * @param requestBodyJson the raw OpenAI-shaped body as received by /v1/chat/completions
     */
    fun generate(requestBodyJson: String, callback: GenerationCallback)

    /** Cooperative abort of an in-flight generate(); safe to call when idle. */
    fun cancel()
}

sealed class EngineLoadError(message: String, cause: Throwable? = null) : Exception(message, cause) {
    class UnsupportedFormat(path: String) : EngineLoadError("Unrecognised model container: $path")
    class BackendUnavailable(val attempted: List<String>, cause: Throwable?) :
        EngineLoadError("No usable LiteRT-LM backend (tried ${attempted.joinToString(" → ")})", cause)
    class Native(message: String, cause: Throwable?) : EngineLoadError(message, cause)
}
```

`LocalLlmService` then holds `@Volatile private var engine: InferenceEngine?` in place of
`nativeHandle`, and the five call sites collapse:

| current | becomes |
|---|---|
| `nativeLoadModel(path)` → handle | `EngineFactory.load(path, context)` → `InferenceEngine` |
| `nativeGenerate(h, body, cb)` | `engine.generate(body, cb)` |
| `nativeCancel(h)` | `engine.cancel()` |
| `nativeUnloadModel(h)` + `nativeFreeModel(h)` | `engine.close()` (idempotent) |
| `nativeHandle == 0L` guard | `engine == null` guard |

`nativeHandle` is public-read on the companion, but nothing outside `LocalLlmService.kt`
references it (verified by grep across `android/`), so it can simply be deleted rather than
shimmed. The four-state machine (`stopped`/`loading`/`ready`/`error`), the
`LOAD_WATCHDOG_MS` handler, `transition()`, `getStatusSnapshot()`, and the whole HTTP
server stay exactly as they are.

`LlamaCppEngine` is a pure move: the existing five `external fun` declarations relocate
into it verbatim, with `System.loadLibrary("pokekit-llm")` in its companion. **No
behaviour change to the GGUF path** — that is the acceptance criterion for step 1.

## 3. Format detection and import

Two places hard-code GGUF and will reject a `.litertlm` outright:

- `LocalLlmPlugin.kt:208` — `copyInChunks` reads four bytes and throws
  `"Not a GGUF model"` unless they are `GGUF_MAGIC`. This is a *good* check; it should
  become format-dispatching rather than being removed.
- `LocalLlmPlugin.kt:416` — `dispatchStart` auto-discovers a model with
  `it.name.endsWith(".gguf", ignoreCase = true)`.

Also `sanitizeFileName`'s `"model.gguf"` default (`:294`) and the error string at `:423`.

```kotlin
enum class ModelFormat(val magic: ByteArray, val extension: String) {
    GGUF("GGUF".toByteArray(Charsets.US_ASCII), "gguf"),
    LITERTLM(LITERTLM_MAGIC, "litertlm");

    companion object {
        /** Longest magic wins the read; sniff() consumes exactly MAGIC_WINDOW bytes. */
        const val MAGIC_WINDOW = 8
        fun sniff(head: ByteArray): ModelFormat? =
            values().firstOrNull { head.size >= it.magic.size &&
                head.copyOf(it.magic.size).contentEquals(it.magic) }
    }
}
```

**Open item:** the `.litertlm` container magic must be read off the real artefact
(`xxd -l 16 vgc_e4b_v5_heretic.litertlm`, or from LiteRT-LM's
`schema/core/litertlm_header.fbs`) before this constant is written. Do not guess it —
a wrong magic turns every import into a false "not a model" rejection. Until it is
confirmed, gate LiteRT imports on extension **and** a successful `Engine.initialize()`,
never on a guessed byte string.

`copyInChunks` then reads `MAGIC_WINDOW` bytes instead of four, sniffs, rejects `null`
with a message naming both accepted formats, and prepends the window to the output
exactly as it does today (`:217`). Everything else in the import path — the SAF
`ACTION_OPEN_DOCUMENT` flow, `MIN_MODEL_BYTES`, throttled `modelImportProgress` events,
`COPY_BUFFER_SIZE` — is format-agnostic and unchanged. Worth noting: 3.87 GB through
`copyInChunks` at 256 KB a time is a long copy with the progress UI as the only feedback;
confirm `filesDir` has ~4 GB free *before* starting rather than failing at 90 %.

## 4. `LiteRtLmEngine`

Per `docs/on-device-llm.md`, pinned at `com.google.ai.edge.litertlm:litertlm-android:0.15.0`.

```kotlin
class LiteRtLmEngine private constructor(
    private val engine: Engine,
    override val backendId: String,
) : InferenceEngine {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    @Volatile private var turn: Job? = null

    companion object {
        private const val TAG = "LiteRtLmEngine"

        /** Preference order; each entry is tried once and its failure recorded. */
        private fun backends(nativeLibraryDir: String) = listOf(
            "NPU" to { Backend.NPU(nativeLibraryDir) },
            "GPU" to { Backend.GPU() },
            "CPU" to { Backend.CPU() },
        )

        fun load(modelPath: String, context: Context): LiteRtLmEngine {
            val attempted = mutableListOf<String>()
            var last: Throwable? = null
            for ((name, make) in backends(context.applicationInfo.nativeLibraryDir)) {
                attempted += name
                try {
                    val engine = Engine(
                        EngineConfig(
                            modelPath = modelPath,
                            backend = make(),
                            cacheDir = context.cacheDir.absolutePath,
                        )
                    )
                    engine.initialize()          // ~10 s; caller is already off-main
                    return LiteRtLmEngine(engine, "litertLm:$name")
                } catch (e: LiteRtLmJniException) {
                    Log.w(TAG, "backend $name unavailable: ${e.message}")
                    last = e
                }
            }
            throw EngineLoadError.BackendUnavailable(attempted, last)
        }
    }
}
```

Notes that matter:

- `initialize()` is the ~10 s cost and it already runs on the `"llm-model-load"` thread
  (`LocalLlmService.kt:235`), inside the watchdog. Nothing needs restructuring — but a
  cold NPU→GPU→CPU walk is *three* initialize attempts, so `LOAD_WATCHDOG_MS`
  (15 min) should stay generous, and each attempt should be logged so a user's
  "it took forever" is diagnosable.
- `cacheDir` gets compiled kernels. It is evictable by the OS; a wipe costs one slow
  first load, not a failure. Do **not** move it to `filesDir`.
- The fallback loop swallows `LiteRtLmJniException` only. Anything else (OOM,
  `UnsatisfiedLinkError`) propagates immediately — retrying CPU after an OOM just
  burns two minutes before failing anyway.

### 4.1 Request translation — the real work

llama.cpp takes the OpenAI body whole and applies the chat template natively.
LiteRT-LM does not: `createConversation(ConversationConfig(systemInstruction, samplerConfig))`
plus `conversation.sendMessageAsync(text): Flow<Message>`. So `generate()` must parse the
body itself:

```kotlin
override fun generate(requestBodyJson: String, callback: GenerationCallback) {
    val req = ChatRequest.parse(requestBodyJson)      // org.json, no new dependency
    val conversation = engine.createConversation(
        ConversationConfig(
            systemInstruction = req.systemInstruction,
            samplerConfig = req.samplerConfig(),
        )
    )
    // ... replay req.history, then stream req.lastUserMessage
}
```

Three decisions fall out of this, and they are the ones to get right:

1. **Statelessness.** `/v1/chat/completions` is stateless: the TS layer resends the whole
   history every turn, including after each tool result. A `Conversation` is stateful.
   The correct mapping is **one `Conversation` per HTTP request**, with prior turns
   replayed into it before the final user message is streamed. That is correct but
   re-prefills the whole history each turn. Mitigation, if prefill latency proves painful:
   cache one `Conversation` keyed by a hash of the message prefix and reuse it when the
   incoming history is an extension of the cached one. **Do not build the cache first** —
   measure with the exported `PREFILL_LENGTHS` buckets (32/64/128/256/512) and only then
   decide.
2. **Sampler.** `temperature`, `top_p`, `top_k`, `max_tokens` come off the request body
   where present; defaults live in one named constant block, not inline literals.
3. **System prompt.** `src/lib/llm/systemPrompt.ts` sends the system message as
   `messages[0]`. It maps to `ConversationConfig.systemInstruction`, not to a replayed
   turn — passing it as a user turn will degrade the fine-tune's behaviour.

### 4.2 Streaming

```kotlin
turn = scope.launch {
    try {
        conversation.sendMessageAsync(req.lastUserMessage)
            .collect { message -> callback.onToken(message.deltaText()) }
        callback.onDone(assembled.toString(), toolCallsJson)
    } catch (e: CancellationException) {
        throw e                                   // cancel() path, not an error
    } catch (e: LiteRtLmJniException) {
        callback.onError(e.message ?: "LiteRT-LM generation failed")
    } finally {
        conversation.close()
    }
}
```

`generate()` is declared blocking (§2) because `handleChatCompletions` writes SSE
straight to the socket on the HTTP worker thread — so it `runBlocking`s on `turn!!.join()`,
or simpler, collects the flow directly on the calling thread with `runBlocking`. Either is
fine; what is **not** fine is returning early and letting the service close the socket
while the flow is still emitting.

`callback.onToken` already does the right thing on client disconnect: `writeSse` returns
false and the service calls cancel (`LocalLlmService.kt:494`). That wiring is preserved
for free by routing `cancel()` to `turn?.cancel()`.

### 4.3 Tool calls

LiteRT-LM supports native function calling with constrained decoding
(`docs/on-device-llm.md:123`), and it is tempting to move the tool loop into Kotlin.
**Don't.** `localLlamaCpp.ts` owns that loop, and `src/lib/llm/toolRunner.ts` /
`tools.ts` / `writeTools.ts` execute the tools in the WebView where the data lives.
The adapter's job is to emit tool calls in the shape the existing SSE contract already
carries:

```kotlin
callback.onToolCallDelta(index, nameDelta, argsDelta)
```

Phase 1: pass the tool declarations from the request body into LiteRT-LM's function-call
config, and map each emitted call onto `onToolCallDelta` with a stable `index` — the TS
`ToolCallAccumulator` keys on array index, so the index must be per-turn monotonic and
must not be reused. If LiteRT-LM emits complete calls rather than fragments, send one
delta per call carrying the whole name and arguments; the accumulator handles that case
correctly (concatenating a single fragment is a no-op).

Constrained decoding is a *quality* win over llama.cpp here, not a structural change.
Take it, and change nothing above the bridge.

## 5. Gradle, manifest, R8

```kotlin
// android/app/build.gradle
implementation("com.google.ai.edge.litertlm:litertlm-android:0.15.0")
```

Version pinned in the catalog if one exists — no hardcoded version in `build.gradle`.

```xml
<!-- AndroidManifest.xml, inside <application> -->
<uses-native-library android:name="libOpenCL.so" android:required="false"/>
<uses-native-library android:name="libvndksupport.so" android:required="false"/>
```

`required="false"` matters: a device without OpenCL must still install and fall through
to CPU.

- `abiFilters` — arm64-v8a only. The bundle plus the runtime is not worth shipping for
  32-bit, and NPU delegates are arm64 anyway.
- R8/ProGuard keeps: `GenerationCallback` (JNI/reflection target from the existing native
  lib), `InferenceEngine` implementations, and whatever LiteRT-LM's own consumer rules
  don't already cover. Verify with a release build, not a debug one.
- APK/AAB size is unaffected — the model is side-loaded via SAF, never bundled.

## 6. TypeScript surface

Minimal, and deliberately so:

- `src/types/index.ts:193` —
  `aiBackend: 'ollamaCloud' | 'localLlamaCpp' | 'localLiteRt';`
- `src/store/useStore.ts` — bump `version: 3` → `4` and extend `migrate` to default the
  new field. The existing v2→v3 comment explains exactly why the bump is mandatory:
  zustand skips `migrate` when versions match and the default `merge` shallow-replaces
  `settings` wholesale, so a missing field crashes on first access. Same trap applies here.
- Optional `localModelFormat: 'gguf' | 'litertlm'` on settings, so the UI can show which
  runtime a given imported file will use. Alternative: derive it in the plugin and return
  it in `getServerStatus`, which is less state to migrate. **Prefer the status field.**
- `LocalLlmServerStatus` (`src/lib/native/localLlm.ts:30`) gains an optional
  `backend?: string` carrying `InferenceEngine.backendId` — this is how "running on NPU"
  vs "fell back to CPU" reaches the user, and it is worth surfacing given the 10× spread.

Nothing in `src/lib/llm/localLlamaCpp.ts` changes. Its name becomes a slight misnomer;
renaming it is a separate, mechanical commit and should not be bundled with this work.

## 7. Memory

A 3.87 GB resident model on a phone is the dominant risk.

- **Single engine invariant.** `handleStart` already refuses to start when `state == "ready"`.
  Keep that, and make `EngineFactory.load` assert no other engine is live.
- **`onTrimMemory`.** `LocalLlmService` does not currently override it. Add it: at
  `TRIM_MEMORY_COMPLETE`/`TRIM_MEMORY_RUNNING_CRITICAL`, close the engine and
  `transition("stopped", …)` so the UI shows a truthful state rather than a stale "ready"
  pointing at freed memory. This is the single highest-value addition in the plan, and it
  benefits the GGUF path too.
- **Foreground type.** Already `FOREGROUND_SERVICE_TYPE_SPECIAL_USE` on API 34+
  (`LocalLlmService.kt:334`) — correct, no change.
- The VL bundle is only ~165 MB (4.3 %) larger than the text one. Vision is not a memory
  problem; it is an *input path* problem (§8).

## 8. Scope: text first, VL later

`vgc_e4b_v5_heretic_vl.litertlm` is a superset — it contains the full text export plus the
vision tower, so it runs text-only workloads identically. But nothing in the current stack
can feed it an image: `chatOnce` takes `messages` as text, the SSE contract has no image
part, and `ConversationConfig` would need image inputs plumbed through. **Ship the text
bundle first.** Adding VL later touches `ChatRequest.parse` (OpenAI `image_url` content
parts), the plugin's `chatOnce` signature, and the TS `ChatOnceOptions` — a separate piece
of work with its own plan, not a flag.

## 9. Sequencing

1. **Seam, no behaviour change.** Add `InferenceEngine`, move the five externals into
   `LlamaCppEngine`, rewire `LocalLlmService`. Ship and verify the GGUF path is byte-for-byte
   unchanged in behaviour. *No LiteRT dependency yet.*
2. **Format detection.** `ModelFormat` sniffing in `copyInChunks`, extension-agnostic
   discovery in `dispatchStart`, error strings updated. Verify a `.litertlm` imports and a
   junk file is still rejected.
3. **Dependency + manifest + R8.** Add the library, confirm a release build runs and the
   GGUF path still works with LiteRT on the classpath.
4. **`LiteRtLmEngine` load path.** Backend fallback, `initialize()`, status reporting
   `backendId`. Success criterion: server reaches `ready` on the real 3.87 GB bundle,
   with the chosen backend visible in `getServerStatus`.
5. **Generation.** `ChatRequest.parse`, conversation construction, streaming to
   `onToken`/`onDone`, cancel wiring. Success criterion: a single-turn chat streams to the
   WebView with no TypeScript changes at all.
6. **Tool calls.** Declarations in, `onToolCallDelta` out, verified against the existing
   `toolRunner.ts` loop on a real calculator call.
7. **`onTrimMemory` + TS settings/migration.**

Each step is independently shippable and independently revertible. Step 1 is the one that
must be perfect; if it regresses the GGUF path, stop and fix before continuing.

## 10. Open questions

- **`.litertlm` magic bytes** — must be read off the artefact before §3's constant is
  written (see the warning there).
- **Does `Conversation` expose prefix reuse** across constructions, or is a per-request
  conversation genuinely a full re-prefill? Determines whether §4.1's cache is needed.
- **Function-call emission granularity** — whole calls or fragments? Determines the
  `onToolCallDelta` index bookkeeping.
- **NPU availability** on the actual target device. The published S26 Ultra figures do not
  transfer; the fallback chain must be exercised on real hardware before any performance
  claim is made in the UI.
- `docs/local-llm-verification.md` is written entirely for `vgc_gemma2.gguf` on llama.cpp
  and does not cover this path. It needs a LiteRT-LM section once step 5 lands.
