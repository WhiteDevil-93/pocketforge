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
only TypeScript edits are the settings union and its store migration (§7).

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

**Resolved from source.** `schema/core/litertlm_read.cc` checks
`content.substr(0, 8) == "LITERTLM"` — the magic is the eight ASCII bytes `LITERTLM` at
offset 0, immediately followed by three `uint32` version fields:

```
offset 0   8 bytes   "LITERTLM"
offset 8   uint32    major_version
offset 12  uint32    minor_version
offset 16  uint32    patch_version
```

`ReadHeaderFromLiteRTLM` rejects the file outright when
`header->major_version != LITERTLM_MAJOR_VERSION`, and `schema/core/litertlm_header.h`
pins that at `LITERTLM_MAJOR_VERSION = 1` (current format 1.6.0). So the Kotlin validator
should read 20 bytes, not 8, and check the major version too — that turns a future
format break into "this model was built for a newer LiteRT-LM" at import time instead of
an opaque `initialize()` failure minutes later.

```kotlin
private val LITERTLM_MAGIC = "LITERTLM".toByteArray(Charsets.US_ASCII)
private const val LITERTLM_SUPPORTED_MAJOR = 1
```

Prior art worth knowing: `timmyy123/LLM-Hub` is a shipping open-source Android/iOS app
that imports `.task`, `.litertlm`, `.gguf`, `.mnn` and QNN models side by side — the same
multi-format import this section describes, already in production.

`copyInChunks` then reads `MAGIC_WINDOW` bytes instead of four, sniffs, rejects `null`
with a message naming both accepted formats, and prepends the window to the output
exactly as it does today (`:217`). Everything else in the import path — the SAF
`ACTION_OPEN_DOCUMENT` flow, `MIN_MODEL_BYTES`, throttled `modelImportProgress` events,
`COPY_BUFFER_SIZE` — is format-agnostic and unchanged. Worth noting: 3.87 GB through
`copyInChunks` at 256 KB a time is a long copy with the progress UI as the only feedback;
confirm `filesDir` has ~4 GB free *before* starting rather than failing at 90 %.

## 4. `LiteRtLmEngine`

Everything below is read out of the LiteRT-LM Kotlin sources
(`kotlin/java/com/google/ai/edge/litertlm/`) and Google's `gallery` app — see §11. Nothing
here is inferred from documentation prose alone.

### 4.1 Engine construction

`EngineConfig` in full (`Config.kt`):

```kotlin
data class EngineConfig(
  val modelPath: String,
  val backend: Backend = Backend.CPU(),
  val visionBackend: Backend? = null,   // null ⇒ vision executor not initialised
  val audioBackend: Backend? = null,    // null ⇒ audio executor not initialised
  val maxNumTokens: Int? = null,        // sum of input+output = KV-cache size
  val maxNumImages: Int? = null,
  val cacheDir: String? = null,         // defaults to modelPath's dir; ":nocache" disables
)
```

`maxNumTokens` is **the context window**, documented as "equivalent to the size of the
kv-cache" — it is not an output cap. Leave it `null` to take the model's own value unless
memory forces a smaller KV cache.

`cacheDir` defaulting to *the model's directory* matters here: PocketForge imports models
into `filesDir`, so leaving it unset writes compiled kernels next to a 3.87 GB file in
app-private storage that never gets evicted. Set it explicitly to
`context.cacheDir.absolutePath` so the OS can reclaim it.

Backends (`Config.kt`), all four:

```kotlin
data class CPU(val threadCount: Int? = null) : Backend("CPU")
class      GPU                               : Backend("GPU")
data class NPU(val nativeLibraryDir: String = "") : Backend("NPU")
class      GOOGLE_TENSOR                     : Backend("GOOGLE_TENSOR_ARTISAN")
```

`GOOGLE_TENSOR` is a distinct backend from `NPU` and is the Pixel path — the gallery maps
both its NPU and TPU settings onto `Backend.NPU`, so it never exercises this one. Worth
including in the chain on Pixel hardware, but only after NPU/GPU/CPU is proven.

**Backend fallback.** The gallery picks one backend from a user setting and does not fall
back. PocketForge has no such setting and should walk NPU → GPU → CPU. Not defensive
padding: LiteRT-LM issue #2114 is a GPU `initialize()` failure on the Galaxy S26 Exynos
(Xclipse 960 + ANGLE-CL) — a current flagship where a GPU-only build simply would not start.

```kotlin
fun load(modelPath: String, context: Context): LiteRtLmEngine {
    val attempted = mutableListOf<String>()
    var last: Throwable? = null
    for ((name, make) in backends(context.applicationInfo.nativeLibraryDir)) {
        attempted += name
        val engine = Engine(EngineConfig(modelPath = modelPath, backend = make(), /* … */))
        try {
            engine.initialize()
            return LiteRtLmEngine(engine, backendName = name)
        } catch (e: Exception) {      // Errors (OOM, UnsatisfiedLinkError) deliberately propagate
            Log.w(TAG, "backend $name unavailable: ${e.message}")
            engine.close()            // a half-initialised engine still holds native memory
            last = e
        }
    }
    throw EngineLoadError.BackendUnavailable(attempted, last)
}
```

Catch `Exception`, not `LiteRtLmJniException` alone (#2114 shows init failures that are
not necessarily JNI exceptions), and `close()` each failed engine before the next attempt —
otherwise a three-step walk leaks two engines' worth of native allocation on the way to CPU.

Also worth setting once at plugin load: `Engine.setNativeMinLogSeverity(LogSeverity.ERROR)`.

A cold NPU→GPU→CPU walk is *three* `initialize()` calls, so `LOAD_WATCHDOG_MS` (15 min)
stays as it is, and each attempt must be logged.

### 4.2 Conversation construction

`ConversationConfig` (`Config.kt`), abbreviated to the fields that matter here:

```kotlin
data class ConversationConfig(
  val systemInstruction: Contents? = null,   // "prepend[ed] to initialMessages"
  val initialMessages: List<Message> = listOf(),
  val tools: List<ToolProvider> = listOf(),
  val samplerConfig: SamplerConfig? = null,  // null ⇒ engine defaults
  val automaticToolCalling: Boolean = true,
  val channels: List<Channel>? = null,       // e.g. a thinking channel
  val extraContext: Map<String, Any> = emptyMap(),
  val prefillPrefaceOnInit: Boolean = false,
  val maxOutputToken: Int? = null,
  val thinkingConfig: ThinkingConfig? = null,
  val enableResponseFormat: Boolean = false,
)
```

Mapping one stateless `/v1/chat/completions` body:

| OpenAI body | LiteRT-LM |
|---|---|
| `messages[0]` `role: "system"` | `systemInstruction = Contents.of(text)` |
| `messages[1..n-1]` | `initialMessages` — `Message.user` / `Message.model` / `Message.tool` |
| `messages[n]` | argument to `sendMessageAsync(…)` |
| `tools[]` | `tools` (§4.4) |
| `temperature` / `top_p` / `top_k` | `SamplerConfig` — **with validation, see below** |
| `max_tokens` | `maxOutputToken` (per-call arg **or** config field) |
| `presence_penalty` / `frequency_penalty` | `RepetitionPenaltyConfig` |

Corrections against the previous draft, all from source:

1. **`max_tokens` does map.** `sendMessage`/`sendMessageAsync` both take
   `maxOutputToken: Int? = null` as a per-call parameter, and `ConversationConfig` carries
   a default. The earlier claim that it was engine-level-only conflated it with
   `maxNumTokens` (context size). Pass the request's `max_tokens` straight through.
2. **`SamplerConfig` validates in `init` and throws.**
   ```kotlin
   data class SamplerConfig(val topK: Int, val topP: Double, val temperature: Double, val seed: Int = 0) {
     init {
       require(topK > 0)                    // "topK should be positive"
       require(topP in 0.0..1.0)
       require(temperature >= 0)
     }
   }
   ```
   This is a live trap: in llama.cpp `top_k = 0` means *disabled*, and any client sending
   that gets an `IllegalArgumentException` here. Validate and clamp before constructing —
   omit `SamplerConfig` entirely (pass `null`, meaning engine defaults) rather than
   coercing a nonsense value.
3. **`samplerConfig = null` means "use the engine's defaults"**, not "no sampling". The
   gallery passes `null` on NPU (`if (preferredBackend is Backend.NPU) null else …`), so
   on an NPU device the request's sampler settings are inert. That difference must reach
   the user — see §7.
4. **Free upgrades over the llama.cpp path.** `RepetitionPenaltyConfig` carries
   `presencePenalty` and `frequencyPenalty` documented as "OpenAI style", so those request
   fields map directly. `channels` exposes a thinking channel into `Message.channels`,
   separate from the primary response — relevant if the fine-tune ever emits reasoning.
5. `prefillPrefaceOnInit = false` (the default) is right: setting it makes
   `createConversation()` block on prefill.
6. `systemInstruction` is `Contents`, not `String`. `src/lib/llm/systemPrompt.ts` sends it
   as `messages[0]`, so lift it out of the array — leaving it as a user turn degrades the
   fine-tune.

One `Conversation` per HTTP request, built from `initialMessages` and closed in a
`finally`. Since history is *configuration* rather than replayed traffic, the prefix-cache
idea from the first draft is dropped.

### 4.3 Streaming and cancellation

Use the `MessageCallback` overload, not the `Flow` one. `Flow<Message>` is literally a
`callbackFlow` wrapper around `MessageCallback` in `Conversation.kt`, and
`handleChatCompletions` writes SSE synchronously on the HTTP worker thread — it has no use
for a coroutine scope.

```kotlin
interface MessageCallback {
    fun onMessage(message: Message)   // "Called when a new message chunk is available"
    fun onDone()
    fun onError(throwable: Throwable)
}
```

**Chunks are deltas** — confirmed by the KDoc on `MessageCallback.onMessage` ("a new
message chunk"), by the gallery appending each one, and by the TUI example printing each
in a loop. Maps straight onto `callback.onToken(piece)`, no diffing.

**Cancellation.** `conversation.cancelProcess()` — and two things the first draft got wrong:

- It is **a no-op when no inference is running**. The `IllegalStateException` it can throw
  comes from `checkIsAlive()`, i.e. a *closed* conversation, not an idle one. Guard for
  the closed case, not the idle one.
- **A cancelled generation arrives as `onError`, not `onDone`.**
  `JniMessageCallbackImpl.onError` maps native `statusCode == 1` (`kCancelled`) to a
  `CancellationException`. So the naive wiring writes an SSE `{"error": …}` frame every
  time a user navigates away mid-stream:

```kotlin
override fun onError(throwable: Throwable) {
    if (throwable is CancellationException) {
        callback.onDone(assembled.toString(), toolCallsJson)   // clean stop, not a failure
    } else {
        callback.onError(throwable.message ?: "LiteRT-LM generation failed")
    }
}
```

This matters for a path that already exists: `writeSse` returns false on client
disconnect and `handleChatCompletions` (`LocalLlmService.kt:494`) cancels immediately.

### 4.4 Tool calls — `automaticToolCalling = false`

LiteRT-LM offers two tool styles: `@Tool`/`@ToolParam` on a `ToolSet` (reflection over
Kotlin functions — what the gallery's `MobileActionsTools.kt` uses), and `OpenApiTool`
with a raw JSON schema. **PocketForge needs the second, in manual mode**, because
`@Tool` functions are executed *by LiteRT-LM in Kotlin* and PocketForge's tools are
TypeScript in the WebView (`toolRunner.ts`, `tools.ts`, `writeTools.ts`) operating on data
Kotlin cannot reach.

**Manual mode works on the streaming path — verified.** `JniMessageCallbackImpl.onMessage`:

```kotlin
if (messageJsonObject.has("tool_calls")) {
    if (!automaticToolCalling) {
        callback.onMessage(jsonToMessage(messageJsonObject))
        return
    }
    …
}
```

So `MessageCallback.onMessage` delivers a `Message` with `toolCalls` populated. The
sync-vs-async branch the previous draft reserved as a contingency is **not needed** —
delete it from the plan.

`OpenApiTool` wants exactly `{"name", "description", "parameters"}`, per its own KDoc.
OpenAI declarations are `{"type":"function","function":{name, description, parameters}}`,
so the translation is unwrapping `.function` — no schema rewriting.

```kotlin
/** Carries an OpenAI tool declaration through to the model. execute() is unreachable
 *  because the conversation sets automaticToolCalling = false; the call is surfaced to
 *  TypeScript and executed there. */
private class PassthroughTool(private val schemaJson: String) : OpenApiTool {
    override fun getToolDescriptionJsonString(): String = schemaJson
    override fun execute(paramsJsonString: String): String =
        throw IllegalStateException("execute() unreachable with automaticToolCalling = false")
}
```

`tool(openApiTool)` parses that JSON **at registration** and throws `ToolException` on
malformed input. Catch it and fail the request as a 400 rather than letting it surface as
a generation error.

**`ToolCall.arguments` is a `Map`, not a string** — `data class ToolCall(val name: String,
val arguments: Map<String, Any?>)`. The SSE contract carries `arguments` as a JSON string
that `parseToolCallArguments` in `localLlamaCpp.ts` later `JSON.parse`s, so the map must
be serialised on the way out:

```kotlin
callback.onToolCallDelta(index, toolCall.name, gson.toJson(toolCall.arguments))
```

One delta per call, complete name and arguments. The TS `ToolCallAccumulator` keys on
array index and concatenates fragments, so a single whole-value fragment is handled
correctly; the index must be per-turn monotonic and never reused.

Coming back, TS sends tool results as `role: "tool"` history entries, which map to
`Message.tool(Contents.of(Content.ToolResponse(name, response)))` in `initialMessages`.
Note `Content.ToolResponse(val name: String, val response: Any?)` — `response` is `Any?`,
so the raw result JSON string can go in directly.

`RECURRING_TOOL_CALL_LIMIT` and the automatic re-send loop in `onDone` only apply when
`automaticToolCalling = true`; in manual mode neither is reachable. `enableResponseFormat`
+ `ResponseFormat` is a *separate* constrained-decoding facility (LLGuidance) and is not
needed for tool calling.

## 5. Gradle, manifest, R8

Latest release is **v0.16.0** (per the repo README, "a quick follow up to v0.15.0"), so
the version question from the previous draft resolves upward — the gallery's 0.10.0 is
simply old. Pin explicitly; never `latest.release`, which the upstream docs use for
brevity and which makes builds irreproducible.

```kotlin
implementation("com.google.ai.edge.litertlm:litertlm-android:0.16.0")
```

```xml
<!-- AndroidManifest.xml, inside <application> -->
<uses-native-library android:name="libvndksupport.so" android:required="false"/>
<uses-native-library android:name="libOpenCL.so" android:required="false"/>
```

`required="false"` matters — a device without OpenCL must still install and fall through
to CPU.

- `abiFilters` — arm64-v8a only.
- R8/ProGuard keeps: `GenerationCallback` (JNI target of the existing native lib),
  `InferenceEngine` implementations, and the `OpenApiTool` subclass. Note LiteRT-LM's
  `tool(ToolSet)` path uses Kotlin reflection (`toolClass.functions`, annotation
  scanning) — PocketForge does not use that path, but if it ever does, those classes need
  full member keeps. Verify against a **release** build.
- APK/AAB size is unaffected — the model is side-loaded via SAF, never bundled.

## 6. Memory

- **Single engine invariant.** `handleStart` already refuses to start when `state == "ready"`.
  Keep it, and make `EngineFactory.load` assert no other engine is live.
- **`onTrimMemory`.** `LocalLlmService` does not override it today. Add it: at
  `TRIM_MEMORY_COMPLETE` / `TRIM_MEMORY_RUNNING_CRITICAL`, close the engine and
  `transition("stopped", …)` so the UI shows a truthful state rather than a stale "ready"
  pointing at freed memory. Highest-value single addition here, and it helps the GGUF path too.
- **Foreground type.** Already `FOREGROUND_SERVICE_TYPE_SPECIAL_USE` on API 34+
  (`LocalLlmService.kt:334`) — correct, no change.
- A failed backend attempt must `close()` before the next is tried (§4.1).
- `maxNumTokens` is the lever if the KV cache proves too large on a given device — it is
  the one memory knob that does not require re-exporting the model.
- `Conversation.getTokenCount()` returns KV-cache occupancy (prefill + decode) and is the
  cheapest instrument for seeing how close a long chat is running to `maxNumTokens`.

## 7. TypeScript surface

- `src/types/index.ts:193` —
  `aiBackend: 'ollamaCloud' | 'localLlamaCpp' | 'localLiteRt';`
- `src/store/useStore.ts` — bump `version: 3` → `4` and extend `migrate` to default the
  new field. The existing v2→v3 comment spells out why the bump is mandatory: zustand
  skips `migrate` when versions match, and the default `merge` shallow-replaces `settings`
  wholesale, crashing on first access to a missing field.
- `LocalLlmServerStatus` (`src/lib/native/localLlm.ts:30`) gains `backend?: string`
  carrying `InferenceEngine.backendId` (e.g. `"litertLm:GPU"`). This is how "running on
  NPU" vs "fell back to CPU" reaches the user — worth surfacing for the performance spread
  alone, and doubly so because **sampler settings are inert on NPU** (§4.2) and the UI
  should say so rather than showing live-looking temperature controls.
- Prefer that status field over a persisted `localModelFormat` setting: less state to
  migrate, and it cannot go stale against the actually-loaded model.

Nothing in `src/lib/llm/localLlamaCpp.ts` changes. Its name becomes a slight misnomer;
renaming it is a separate mechanical commit.

## 8. Scope: text first, VL later

`vgc_e4b_v5_heretic_vl.litertlm` is a superset — full text export plus vision tower, so it
serves text-only workloads identically. Two things block using it *as* VL today:

1. Nothing in the stack can feed it an image. `chatOnce` takes text `messages`, the SSE
   contract has no image part, and `ChatOnceOptions` would need widening.
2. **`visionBackend` is an `EngineConfig` field** — vision is enabled at *load* time, not
   per request, and `maxNumImages` is likewise engine-level. It cannot be a runtime toggle;
   it is a different engine configuration, driven by a setting decided before load (which
   is exactly how the gallery does it).

Inputs are `Content.ImageFile(path)` / `Content.AudioBytes(bytes)` via
`Contents.of(Content.ImageFile(…), Content.Text(…))`. The E4B export also carries an audio
tower, so `audioBackend` is available on the same bundle — again separate work.

**Ship the text bundle first.**

## 9. Sequencing

1. **Seam, no behaviour change. Done.** `InferenceEngine`/`EngineLoadError` added in
   `android/.../engine/InferenceEngine.kt`; the five externals moved into
   `android/.../engine/LlamaCppEngine.kt`, with `nativeLoadModel` rebound as a static JNI
   method (`@JvmStatic external fun` in its companion) since no session handle exists until
   after load. The JNI exports in `pokekit-llm.cpp` were renamed to match
   (`Java_..._engine_LlamaCppEngine_native*`; `nativeLoadModel`'s second parameter changed
   from `jobject` to `jclass` to match the static call). `LocalLlmService` now holds
   `engine: InferenceEngine?` instead of the companion `nativeHandle: Long`, with a
   `teardownEngine()` helper replacing the repeated unload+free+zero sequence at every call
   site. Behaviour is unchanged: same load/cancel/close ordering, same idempotency, same
   error paths. **Not yet verified against a real build** — this environment has no Android
   SDK/NDK, so the actual `assembleDebug` + on-device GGUF regression pass (per §"Verification"
   above) is still outstanding.
   *No LiteRT dependency yet.* This step must be perfect; if it regresses GGUF, stop.
2. **Format detection. Done.** `LocalLlmPlugin.kt` gained `ModelFormat`
   (GGUF/LITERTLM) and `FormatSniffResult`. `copyInChunks` now reads a 20-byte header
   window (was 4), sniffs both magics via `sniffFormat`, and rejects a `.litertlm` file
   at an unsupported major version with a clear message rather than failing opaquely at
   engine load — exactly the resolved-from-source design in §3. `dispatchStart`'s
   auto-discovery now matches any known extension instead of hardcoding `.gguf`.
   `sanitizeFileName`'s blank-name fallback dropped the baked-in `.gguf` extension
   (`imported-model`, no extension); `ensureFormatExtension` attaches the *sniffed*
   format's extension once `copyInChunks` returns, so a mislabeled or extension-less SAF
   pick still lands under a name `dispatchStart` will find. Error strings and doc
   comments updated to stop assuming GGUF. **Not yet verified against a real build**
   (no Android SDK/NDK in this environment) — needs the same on-device pass as step 1,
   plus importing an actual `.litertlm` file and confirming it's accepted, renamed
   correctly, and discovered.
3. **Dependency + manifest + R8. Done, pending build verification.** Pinned
   `com.google.ai.edge.litertlm:litertlm-android:0.16.0` in `variables.gradle` /
   `app/build.gradle` (not `latest.release`). Added the two `<uses-native-library
   required="false">` entries for the GPU backend to `AndroidManifest.xml`. Added R8
   keep rules for `GenerationCallback` and `engine.**` to `proguard-rules.pro` — these
   are currently **dormant**, since release `minifyEnabled` is `false` project-wide and
   this step didn't turn it on (a real minification pass needs its own whole-app test
   cycle, out of scope here); a TODO marks where the step-6 `OpenApiTool` keep goes.
   `abiFilters 'arm64-v8a'` was already the project's only target — no change needed.
   **Not verified against a real build** (no Android SDK/NDK in this environment):
   still needed are confirming the 0.16.0 artifact actually resolves from
   `mavenCentral()`/`google()` (both already declared at the `allprojects` level, so
   no new repository was added — but the artifact's actual presence there is
   unconfirmed), that `minSdkVersion 24` satisfies whatever floor LiteRT-LM's AAR
   manifest declares, and that GGUF still works with LiteRT-LM on the classpath.
4. **`LiteRtLmEngine` load path. Done, pending build/device verification.** Added
   `engine/LiteRtLmEngine.kt`: the NPU→GPU→CPU backend fallback from §4.1, each failed
   attempt `close()`d before the next, explicit `cacheDir = context.cacheDir`,
   `backendId = "litertLm:$name"`. Added `EngineLoadError.BackendUnavailable` (all
   three backends failed). `generate()`/`cancel()` are deliberately not implemented
   yet — `cancel()` is a genuine no-op (every teardown path in `LocalLlmService` calls
   it unconditionally, so it must never throw even with nothing to cancel);
   `generate()` throws, which `LocalLlmService`'s existing catch-and-report path in
   `handleChatCompletions` already turns into a normal SSE error frame. Real
   generation is step 5.
   Also promoted `ModelFormat` out of `LocalLlmPlugin.kt` (was file-private) into
   `engine/ModelFormat.kt` so `LocalLlmService.handleStart` can dispatch on it:
   extension → `ModelFormat` → `LlamaCppEngine.load` or `LiteRtLmEngine.load`. This
   trusts the file's extension at load time rather than re-sniffing bytes, which is
   safe only because step 2's `ensureFormatExtension` already guarantees the extension
   matches the content-sniffed format at import time — the two steps compose into one
   guarantee, not two independent checks.
   **Not yet verified against a real build or device** (no Android SDK/NDK in this
   environment, and no S25 Ultra to test the backend chain on) — needs: a release
   build with the classpath from step 3, importing the real
   `vgc_e4b_v5_heretic.litertlm` bundle, confirming the service reaches `ready` with
   `backendId` visible in `getServerStatus`, and confirming which backend the real
   device actually lands on (per LiteRT-LM #2114, GPU init failing on some hardware is
   expected, not a bug — the point of the chain is that CPU still succeeds).
5. **Generation. Done, pending build/device verification.** Added
   `engine/ChatRequest.kt` (`parseChatRequest`): the OpenAI body → `systemInstruction`
   (from `messages[0]` if `role: "system"`) / `initialMessages` (everything between) /
   `lastMessage` (the final entry, the actual `sendMessageAsync` argument) mapping from
   §4.2, plus `SamplerConfig` requiring all three of `temperature`/`top_p`/`top_k`
   present and in-range or falling back to `null` rather than guessing the missing
   ones or crashing on `SamplerConfig`'s own validation, `max_tokens` → `maxOutputToken`
   (`>0` or `null`), and `presence_penalty`/`frequency_penalty` → `RepetitionPenaltyConfig`.
   None of these extra fields are sent by this app's TypeScript layer today — parsed
   anyway so a future client that does send them isn't a second Kotlin change.
   `LiteRtLmEngine.generate()` builds one `Conversation` per call, wires the
   `MessageCallback` overload (not `Flow` — no coroutine scope needed on a plain HTTP
   worker thread), and blocks on a `CountDownLatch` released by `onDone`/`onError` so
   the method's blocking contract matches `LlamaCppEngine`'s. `onError` implements the
   `CancellationException`-is-not-an-error branch from §4.3 exactly. `SamplerConfig` is
   forced to `null` on the NPU backend per §4.2 point 3. `cancel()` now does real work:
   reads a `@Volatile activeConversation` set for the duration of one `generate()` call
   (so a `cancel()` from a different thread — client disconnect, service teardown — has
   something to reach) and calls `cancelProcess()`, swallowing the
   `IllegalStateException` a race against `generate()`'s own `finally`-block close can
   produce. Tool calls are still step 6 — every turn reports an empty `[]` tool-calls
   array regardless of what the model does with them.
   **Not yet verified against a real build or device** — needs everything step 4 still
   needs, plus actually sending a chat message through the real 3.87 GB bundle and
   confirming a token stream reaches the WebView with no TypeScript changes, and
   confirming a client disconnect mid-stream reaches `cancel()` and does not surface as
   a spurious SSE error frame.
6. **Tool calls.** `PassthroughTool` + `automaticToolCalling = false`, `ToolCall.arguments`
   serialised to JSON, verified against the real `toolRunner.ts` loop on a calculator call.
7. **`onTrimMemory` + TS settings/migration.**

Each step is independently shippable and revertible.

## 10. Open questions

The format magic, the streamed-`toolCalls` question, the chunk semantics, the library
version and the `max_tokens` mapping are all now settled from source. What remains:

- **NPU availability on the target device.** The published S26 Ultra figures do not
  transfer, and #2114 shows GPU init failing outright on a current Exynos flagship.
  Exercise the whole fallback chain on real hardware before any performance claim reaches
  the UI. Whether `Backend.GOOGLE_TENSOR` is worth adding depends on the same test.
- **Does the fine-tune emit a thinking channel?** If so, `channels` needs configuring or
  reasoning tokens will land in the primary response — and they count against
  `maxOutputToken`.
- **KV-cache sizing.** `maxNumTokens` left `null` takes the model's default; whether that
  fits alongside a 3.87 GB weight set on a mid-range device is a measurement, not a guess.
- `docs/local-llm-verification.md` is written entirely for `vgc_gemma2.gguf` on llama.cpp
  and needs a LiteRT-LM section once step 5 lands.

## 11. Sources

Read directly, not recalled:

- `schema/core/litertlm_read.cc`, `schema/core/litertlm_header.h`,
  `schema/core/litertlm_header_schema.fbs` — the `LITERTLM` magic, the three `uint32`
  version fields, the major-version rejection, `LITERTLM_MAJOR_VERSION = 1` (format 1.6.0),
  the section union (`TFLiteModel`, `SP_Tokenizer`, `LlmMetadataProto`,
  `HF_Tokenizer_Zlib`, `TFLiteWeights`, `EmbeddingMetadataProto`, `ExecutorMetadataProto`)
  and the 16 KiB section block alignment.
- `kotlin/java/com/google/ai/edge/litertlm/Config.kt` — `EngineConfig`,
  `ConversationConfig`, `SamplerConfig` (and its `require` validation), the four `Backend`
  variants, `RepetitionPenaltyConfig`, `NoRepeatNgramConfig`, `SuppressTokensConfig`,
  `ThinkingConfig`, `Channel`, `LoraConfig`.
- `…/Conversation.kt` — `resolveResponseFormat`, the `sendMessage` tool loop and
  `RECURRING_TOOL_CALL_LIMIT`, `JniMessageCallbackImpl` (manual tool calls on the
  streaming path; `kCancelled` → `CancellationException`), `cancelProcess()` as a no-op
  when idle, `Flow` as a `callbackFlow` over `MessageCallback`, `getTokenCount()`,
  `MessageCallback` KDoc confirming chunk semantics.
- `…/Message.kt` — `ToolCall(name, arguments: Map<String, Any?>)`,
  `Content.ToolResponse(name, response: Any?)`, `Message.user/model/tool`, `Contents.of`.
- `…/Tool.kt` — `OpenApiTool` and its required description keys, `tool()` providers,
  `ToolException` at registration, the reflection-based `ToolSet` path.
- [gallery `LlmChatModelHelper.kt`](https://github.com/google-ai-edge/gallery/blob/main/Android/src/app/src/main/java/com/google/ai/edge/gallery/ui/llmchat/LlmChatModelHelper.kt)
  — `samplerConfig = null` on NPU, conditional `cacheDir`, close ordering.
- [gallery `customtasks/mobileactions`](https://github.com/google-ai-edge/gallery/tree/main/Android/src/app/src/main/java/com/google/ai/edge/gallery/customtasks/mobileactions)
  — the `ToolSet` + `@Tool` reference. Compose + Hilt, so only the helper transfers, and
  it demonstrates the tool style PocketForge specifically must *not* use (§4.4).
- [Kotlin getting-started](https://github.com/google-ai-edge/LiteRT-LM/blob/main/docs/api/kotlin/getting_started.md)
  and [`Main.kt`](https://github.com/google-ai-edge/LiteRT-LM/blob/main/kotlin/java/com/google/ai/edge/litertlm/example/Main.kt).
- [Android guide](https://developers.google.com/edge/litert-lm/android) — the two
  `<uses-native-library>` entries.
- [LiteRT-LM issue #2114](https://github.com/google-ai-edge/LiteRT-LM/issues/2114) — GPU
  `initialize()` failure on Galaxy S26 Exynos; the concrete case for the fallback chain.

## 12. Adjacent: AI Edge Gallery agent skills

Not part of this adapter, but it bears on §4.4 and §6, so it is recorded here rather than
lost.

Google's AI Edge Gallery has an **agent-skills** mechanism, documented in the community
`StrinGhost/gemma-skills` repo (the `gemma4-agent-skills` GitHub topic, 8 repos). A skill
is a folder with a `SKILL.md` — YAML frontmatter (`name`, `description`, optional
`require-secret` / `require-secret-description`) plus instructions — and optionally
`scripts/index.html`, which the app loads into a **hidden webview** and calls through a
global `window['ai_edge_gallery_get_result'](data)` returning a stringified
`{result}` or `{error}`. Skills can also return `{image: {base64}}` or
`{webview: {url, aspectRatio}}` to render in the chat.

**PocketForge already has the hard part.** That whole architecture exists to give an
on-device model a JavaScript execution environment. PocketForge *is* a WebView app —
`toolRunner.ts`, `tools.ts` and `writeTools.ts` already run exactly there, over data that
only exists there. The Gallery pattern is what you build when you don't have that.

One idea does transfer, and it is worth costing:

**Progressive disclosure of tool declarations.** The Gallery puts only each skill's *name
and description* in the system prompt, and loads the full instructions only once the model
triggers it. PocketForge sends all 14 tool declarations (10 in `tools.ts`, 4 in
`writeTools.ts`, ~2.4 KB of description text plus JSON parameter schemas) on **every**
request. Under §4.2's one-conversation-per-request model that whole block is re-prefilled
on every turn *and* on every tool round-trip, against a fixed KV cache sized by
`maxNumTokens`. On a cloud backend this is a rounding error; on a 3.87 GB on-device model
it is prefill latency and context budget paid repeatedly.

Two ways to cut it, neither blocking on this adapter:

1. Declare a small always-on set plus a single generic dispatcher, Gallery-style, and let
   the model pull a fuller schema on demand.
2. Filter the declared set by app state — the write tools are meaningless without an
   active team.

`Conversation.getTokenCount()` (§6) is the instrument for deciding whether this is worth
doing: measure the prefill cost of the declaration block on a real device before
restructuring anything.

**Caveat.** `gemma-skills` is a community repo documenting Google's app format, not a
published spec, and the topic is new. The `SKILL.md` shape is a reasonable convention to
borrow from; it is not something to build a dependency on.
