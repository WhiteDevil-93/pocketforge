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

Everything below is taken from the upstream Kotlin API doc and from Google's own
`gallery` app, not inferred — see §11 for the exact sources. Where something is still
unverified it is marked **UNVERIFIED** rather than guessed.

### 4.1 Engine construction

```kotlin
val engineConfig = EngineConfig(
    modelPath      = modelPath,
    backend        = preferredBackend,          // Backend.CPU() | Backend.GPU() | Backend.NPU(nativeLibraryDir = …)
    visionBackend  = null,                      // set only for the VL bundle — see §8
    audioBackend   = null,
    maxNumTokens   = MAX_NUM_TOKENS,            // ENGINE-level, not per-request — see §4.2
    cacheDir       = context.cacheDir.absolutePath,
)
val engine = Engine(engineConfig)
engine.initialize()
```

`Engine` and `Conversation` are both `AutoCloseable` and the upstream examples use
`.use { }`. That fits `InferenceEngine : AutoCloseable` from §2 with no adaptation.

Also worth setting once, at plugin load, so the native layer stops flooding logcat:

```kotlin
Engine.setNativeMinLogSeverity(LogSeverity.ERROR)
```

**Backend fallback.** The gallery picks a single backend from a user setting and does
*not* fall back. PocketForge has no such setting and should walk NPU → GPU → CPU. This is
not defensive padding: LiteRT-LM issue #2114 is a GPU `initialize()` failure on the
Galaxy S26 Exynos (Xclipse 960 + ANGLE-CL), i.e. a current flagship. A GPU-only build
would simply not start there.

```kotlin
private fun backends(nativeLibraryDir: String): List<Pair<String, () -> Backend>> = listOf(
    "NPU" to { Backend.NPU(nativeLibraryDir = nativeLibraryDir) },
    "GPU" to { Backend.GPU() },
    "CPU" to { Backend.CPU() },
)

fun load(modelPath: String, context: Context): LiteRtLmEngine {
    val attempted = mutableListOf<String>()
    var last: Throwable? = null
    for ((name, make) in backends(context.applicationInfo.nativeLibraryDir)) {
        attempted += name
        val engine = Engine(EngineConfig(modelPath = modelPath, backend = make(), /* … */))
        try {
            engine.initialize()
            return LiteRtLmEngine(engine, backendName = name)
        } catch (e: Exception) {           // Errors (OOM, UnsatisfiedLinkError) deliberately propagate
            Log.w(TAG, "backend $name unavailable: ${e.message}")
            engine.close()                 // a half-initialised engine still holds native memory
            last = e
        }
    }
    throw EngineLoadError.BackendUnavailable(attempted, last)
}
```

Two corrections against my first draft: the catch is `Exception`, not
`LiteRtLmJniException` alone (#2114 shows init failures that are not necessarily JNI
exceptions), and a failed `initialize()` must still `close()` its engine before the next
attempt — otherwise a three-step fallback leaks two engines' worth of native allocation
on the way to CPU.

`cacheDir` holds compiled kernels; the upstream comment is "this can improve 2nd load
time". It is evictable — losing it costs one slow load, not a failure — so `cacheDir`,
not `filesDir`. A cold NPU→GPU→CPU walk is *three* `initialize()` calls, so
`LOAD_WATCHDOG_MS` (15 min) stays as it is, and each attempt must be logged so a slow
start is diagnosable.

### 4.2 Conversation construction — history maps to `initialMessages`

This is the correction that matters most against my first draft. I assumed history had to
be replayed by sending messages. It does not: `ConversationConfig` takes it directly.

```kotlin
val conversationConfig = ConversationConfig(
    systemInstruction = Contents.of("You are a helpful assistant."),
    initialMessages   = listOf(
        Message.user("What is the capital city of the United States?"),
        Message.model("Washington, D.C."),
    ),
    samplerConfig     = SamplerConfig(topK = 10, topP = 0.95, temperature = 0.8),
    tools             = listOf(tool(SomeOpenApiTool())),
    automaticToolCalling = false,
)
val conversation = engine.createConversation(conversationConfig)
```

So the mapping from one stateless `/v1/chat/completions` body is direct and clean:

| OpenAI body | LiteRT-LM |
|---|---|
| `messages[0]` with `role: "system"` | `ConversationConfig.systemInstruction = Contents.of(text)` |
| all `messages[1..n-1]` | `initialMessages` — `Message.user(…)` / `Message.model(…)` / `Message.tool(…)` |
| final `messages[n]` (`role: "user"` or `role: "tool"`) | the argument to `sendMessageAsync(…)` |
| `tools[]` | `ConversationConfig.tools` (§4.4) |
| `temperature` / `top_p` / `top_k` | `SamplerConfig(temperature: Double, topP: Double, topK: Int)` |
| `max_tokens` | **no per-request equivalent** — see below |

`systemInstruction` is `Contents`, not `String`; `Contents.of(…)` wraps it.
`src/lib/llm/systemPrompt.ts` sends the system prompt as `messages[0]`, so it must be
lifted out of the array into `systemInstruction` — leaving it as a user turn will degrade
the fine-tune.

Three constraints fall out that the first draft did not know about:

1. **`maxNumTokens` is an `EngineConfig` field, not a per-conversation or per-request
   one.** OpenAI's `max_tokens` therefore cannot be honoured per request. Pick one
   engine-level ceiling as a named constant, and either ignore `max_tokens` from the body
   or enforce it in Kotlin by stopping collection early and emitting `[DONE]`. Prefer the
   latter — the TS layer does set it, and silently ignoring it is a behaviour change from
   the llama.cpp path.
2. **`SamplerConfig` must be `null` on NPU.** The gallery does exactly this:
   `samplerConfig = if (preferredBackend is Backend.NPU) null else SamplerConfig(…)`.
   So on an NPU device, `temperature`/`top_p`/`top_k` from the request are silently
   inert. That difference must reach the user — it is one more reason for the
   `backend` field on `getServerStatus` (§7).
3. **One `Conversation` per HTTP request**, built from `initialMessages` and closed in a
   `finally`. Since history is config rather than replayed traffic, this is much less
   objectionable than the first draft feared, and the prefix-cache idea in that draft
   should be dropped until measurement says otherwise.

### 4.3 Streaming and cancellation

```kotlin
conversation
    .sendMessageAsync(Contents.of(contents))
    .catch  { callback.onError(it.message ?: "LiteRT-LM generation failed") }
    .onCompletion { … }
    .collect { message -> callback.onToken(message.toString()) }
```

`sendMessageAsync` accepts either a `String` or `Contents`. Three send styles exist —
synchronous `sendMessage`, `sendMessageAsync(text, MessageCallback)` with
`onMessage`/`onDone`/`onError`, and `sendMessageAsync(text): Flow<Message>`. The
`MessageCallback` variant maps almost one-to-one onto `GenerationCallback` and is
arguably the better fit here, since `handleChatCompletions` writes SSE synchronously on
the HTTP worker thread and does not want a coroutine scope at all. **Use the callback
variant**; keep the Flow variant in reserve if `extraContext` or operators are needed.

**Chunks are deltas, not cumulative** — the gallery appends each one
(`appendModelResponse(partialResponse = it.toString())`) and the upstream TUI example
prints each in a loop. That maps straight onto `callback.onToken(piece)` with no
diffing. **UNVERIFIED** in the sense that no doc states it in words: assert it once at
runtime during step 5 (a cumulative stream would show quadratic growth in frame sizes
and is trivially visible in logcat).

**Cancellation is `conversation.cancelProcess()`**, not coroutine cancellation — my first
draft was wrong here. The gallery wraps it in `IllegalStateException` handling, because
calling it when no generation is in flight throws.

```kotlin
override fun cancel() {
    try {
        conversation?.cancelProcess()
    } catch (e: IllegalStateException) {
        Log.d(TAG, "cancelProcess with no generation in flight — ignoring")
    }
}
```

This matters for a path that already exists: `writeSse` returns false on client
disconnect and `handleChatCompletions` (`LocalLlmService.kt:494`) calls cancel
immediately. Routing that to `cancelProcess()` preserves the behaviour exactly.

### 4.4 Tool calls — `automaticToolCalling = false`

LiteRT-LM supports two tool styles: `@Tool`/`@ToolParam`-annotated Kotlin functions on a
`ToolSet` (what the gallery's `MobileActionsTools.kt` uses), and `OpenApiTool` with a raw
JSON schema. **PocketForge needs the second, in manual mode.**

The reason is structural. `@Tool` functions are executed *by LiteRT-LM, in Kotlin*.
PocketForge's tools are TypeScript running in the WebView — `src/lib/llm/toolRunner.ts`,
`tools.ts`, `writeTools.ts` — operating on data that only exists there. Kotlin cannot
execute them. And `localLlamaCpp.ts:6` already owns the multi-turn loop.

So:

```kotlin
/** Carries an OpenAI tool declaration through to the model. execute() is never
 *  invoked because the conversation sets automaticToolCalling = false; the call
 *  is surfaced to TypeScript and executed there. */
private class PassthroughTool(private val schemaJson: String) : OpenApiTool {
    override fun getToolDescriptionJsonString(): String = schemaJson
    override fun execute(paramsJsonString: String): String =
        throw IllegalStateException("execute() unreachable with automaticToolCalling = false")
}
```

The OpenAI `tools[]` entries are `{"type":"function","function":{"name","description","parameters"}}`;
`getToolDescriptionJsonString()` wants `{"name","description","parameters"}`. The
translation is unwrapping `.function` — no schema rewriting.

The model then returns a `Message` with `toolCalls` populated, each having `.name` and
`.arguments`, which map onto the existing SSE frame:

```kotlin
callback.onToolCallDelta(index, toolCall.name, toolCall.arguments)
```

Emit one delta per call with the complete name and arguments. The TS
`ToolCallAccumulator` keys on array index and concatenates fragments, so a single
whole-value fragment is handled correctly; the index must be per-turn monotonic and never
reused.

Coming back the other way, the TS layer sends tool results as `role: "tool"` history
entries on the next request. Those map to `Message.tool(Contents.of(Content.ToolResponse(name, resultJson)))`
in `initialMessages` (§4.2).

**UNVERIFIED, and the one thing to test first in step 6:** the upstream manual-tool-calling
example uses the *synchronous* `sendMessage` and reads `toolCalls` off the returned
`Message`. Whether `toolCalls` is populated on a streamed chunk via `sendMessageAsync` —
and if so, on which chunk — is not documented. If it turns out tool calls only surface
synchronously, the engine must use `sendMessage` when `tools[]` is non-empty and
`sendMessageAsync` otherwise. That is a small branch, but it has to be discovered before
§4.3's streaming design is locked, not after.

Constrained decoding is a genuine quality win over the llama.cpp path. Take it, change
nothing above the bridge.

## 5. Gradle, manifest, R8

```kotlin
implementation("com.google.ai.edge.litertlm:litertlm-android:0.15.0")
```

Version pinned via the catalog if one exists — never `latest.release`, which the upstream
docs use for brevity and which makes builds irreproducible. Note a discrepancy to settle
before writing the line: `docs/on-device-llm.md` records 0.15.0, while Google's own
gallery app is on 0.10.0. Confirm 0.15.0 actually resolves and that the API shapes in this
document hold on it — the `tools` / `automaticToolCalling` surface is recent.

```xml
<!-- AndroidManifest.xml, inside <application> -->
<uses-native-library android:name="libvndksupport.so" android:required="false"/>
<uses-native-library android:name="libOpenCL.so" android:required="false"/>
```

Confirmed required for the GPU backend by the upstream Android guide. `required="false"`
matters — a device without OpenCL must still install and fall through to CPU.

- `abiFilters` — arm64-v8a only.
- R8/ProGuard keeps: `GenerationCallback` (JNI target of the existing native lib),
  `InferenceEngine` implementations, and the `PassthroughTool` / `OpenApiTool` subclass
  (reflection-reached by the tool registry). Verify against a **release** build.
- APK/AAB size is unaffected — the model is side-loaded via SAF, never bundled.

## 6. Memory

A 3.87 GB resident model on a phone is the dominant risk.

- **Single engine invariant.** `handleStart` already refuses to start when `state == "ready"`.
  Keep it, and make `EngineFactory.load` assert no other engine is live.
- **`onTrimMemory`.** `LocalLlmService` does not override it today. Add it: at
  `TRIM_MEMORY_COMPLETE` / `TRIM_MEMORY_RUNNING_CRITICAL`, close the engine and
  `transition("stopped", …)` so the UI shows a truthful state rather than a stale "ready"
  pointing at freed memory. Highest-value single addition in this plan, and it benefits
  the GGUF path too.
- **Foreground type.** Already `FOREGROUND_SERVICE_TYPE_SPECIAL_USE` on API 34+
  (`LocalLlmService.kt:334`) — correct, no change.
- A failed backend attempt must `close()` before the next is tried (§4.1) or the fallback
  walk itself becomes a memory problem.

## 7. TypeScript surface

Minimal, and deliberately so:

- `src/types/index.ts:193` —
  `aiBackend: 'ollamaCloud' | 'localLlamaCpp' | 'localLiteRt';`
- `src/store/useStore.ts` — bump `version: 3` → `4` and extend `migrate` to default the
  new field. The existing v2→v3 comment spells out why the bump is mandatory: zustand
  skips `migrate` when versions match, and the default `merge` shallow-replaces `settings`
  wholesale, crashing on first access to a missing field. Same trap here.
- `LocalLlmServerStatus` (`src/lib/native/localLlm.ts:30`) gains `backend?: string`
  carrying `InferenceEngine.backendId` (e.g. `"litertLm:GPU"`). This is how "running on
  NPU" vs "fell back to CPU" reaches the user — worth surfacing on its own given the
  performance spread, and now doubly so because **sampler settings are inert on NPU**
  (§4.2) and the UI should say so rather than showing live-looking temperature controls.
- Prefer this status field over a persisted `localModelFormat` setting: less state to
  migrate, and it cannot go stale against the actually-loaded model.

Nothing in `src/lib/llm/localLlamaCpp.ts` changes. Its name becomes a slight misnomer;
renaming it is a separate mechanical commit, not part of this work.

## 8. Scope: text first, VL later

`vgc_e4b_v5_heretic_vl.litertlm` is a superset — it contains the full text export plus the
vision tower, so it serves text-only workloads identically. Two things block using it as
VL today:

1. Nothing in the stack can feed it an image. `chatOnce` takes text `messages`, the SSE
   contract has no image part, and `ChatOnceOptions` would need widening.
2. **`visionBackend` is an `EngineConfig` field**, so vision is enabled at *load* time,
   not per request. It cannot be a runtime toggle — it is a different engine
   configuration, and on the gallery's pattern
   (`visionBackend = if (shouldEnableImage) visionBackend else null`) it is driven by a
   persisted setting decided before load.

The input types are `Content.ImageFile(path)` and `Content.AudioBytes(bytes)`, sent via
`Contents.of(Content.ImageFile(…), Content.Text(…))`. Note the E4B export also carries an
audio tower, so `audioBackend` is available on the same bundle — a separate piece of work
again, with its own plan.

**Ship the text bundle first.**

## 9. Sequencing

1. **Seam, no behaviour change.** Add `InferenceEngine`, move the five externals into
   `LlamaCppEngine`, rewire `LocalLlmService`. Verify the GGUF path is unchanged.
   *No LiteRT dependency yet.* This step must be perfect; if it regresses GGUF, stop.
2. **Format detection.** `ModelFormat` sniffing in `copyInChunks`, extension-agnostic
   discovery in `dispatchStart`, error strings updated.
3. **Dependency + manifest + R8.** Confirm a release build runs and GGUF still works with
   LiteRT on the classpath. Settle the 0.10.0/0.15.0 version question here.
4. **`LiteRtLmEngine` load path.** Backend fallback with per-attempt `close()`,
   `initialize()`, `backendId` in status. Success: `ready` on the real 3.87 GB bundle with
   the chosen backend visible.
5. **Generation.** Request parsing → `systemInstruction` / `initialMessages` /
   `SamplerConfig`, `MessageCallback` wiring, `cancelProcess()`. Assert the delta
   assumption in logcat. Success: single-turn chat streams to the WebView with **zero**
   TypeScript changes.
6. **Tool calls.** Resolve the streamed-`toolCalls` question (§4.4) *first*, then
   `PassthroughTool` + `automaticToolCalling = false` + `onToolCallDelta`, verified
   against the real `toolRunner.ts` loop on a calculator call.
7. **`onTrimMemory` + TS settings/migration.**

Each step is independently shippable and revertible.

## 10. Open questions

- **`.litertlm` container magic bytes** — must be read off the artefact (see §3). Still
  the one blocking unknown for the import path.
- **Streamed `toolCalls`** — populated on `sendMessageAsync` chunks, or synchronous
  `sendMessage` only? Decides whether §4.3 and §4.4 can share one code path (§9 step 6).
- **Chunk semantics** — deltas, per the gallery and the TUI example, but assert it at
  runtime rather than trusting the inference.
- **Library version** — 0.15.0 (per `docs/on-device-llm.md`) vs 0.10.0 (per the gallery).
  Confirm the `tools` / `automaticToolCalling` API exists on whichever is pinned.
- **`max_tokens`** — enforce in Kotlin by early-stopping, or accept engine-level only?
  Recommendation is to enforce, since the llama.cpp path honours it.
- **NPU availability on the target device.** The published S26 Ultra figures do not
  transfer, and LiteRT-LM #2114 shows GPU init failing outright on a current Exynos
  flagship. Exercise the whole fallback chain on real hardware before any performance
  claim reaches the UI.
- `docs/local-llm-verification.md` is written entirely for `vgc_gemma2.gguf` on llama.cpp
  and needs a LiteRT-LM section once step 5 lands.

## 11. Sources

Everything in §4–§5 is taken from these, not from memory:

- [LiteRT-LM Kotlin getting-started](https://github.com/google-ai-edge/LiteRT-LM/blob/main/docs/api/kotlin/getting_started.md)
  — `EngineConfig`, `ConversationConfig`, `initialMessages`, `SamplerConfig`, the three
  send styles, `Contents`/`Content`, `@Tool`/`@ToolParam`, `OpenApiTool`,
  `automaticToolCalling`, manual `toolCalls` → `Content.ToolResponse` → `Message.tool`,
  `extraContext`.
- [LiteRT-LM TUI example `Main.kt`](https://github.com/google-ai-edge/LiteRT-LM/blob/main/kotlin/java/com/google/ai/edge/litertlm/example/Main.kt)
  — `.use {}` lifecycle, `setNativeMinLogSeverity`, per-chunk printing.
- [gallery `LlmChatModelHelper.kt`](https://github.com/google-ai-edge/gallery/blob/main/Android/src/app/src/main/java/com/google/ai/edge/gallery/ui/llmchat/LlmChatModelHelper.kt)
  — `maxNumTokens`, `visionBackend`/`audioBackend`, the conditional `cacheDir`,
  backend selection, **`samplerConfig = null` on NPU**, `cancelProcess()` with
  `IllegalStateException` handling, close ordering (conversation then engine).
- [gallery `customtasks/mobileactions`](https://github.com/google-ai-edge/gallery/tree/main/Android/src/app/src/main/java/com/google/ai/edge/gallery/customtasks/mobileactions)
  — `Actions.kt`, `MobileActionsModule.kt`, `MobileActionsScreen.kt`,
  `MobileActionsTask.kt`, `MobileActionsTools.kt`, `MobileActionsViewModel.kt`. The
  working reference for `ToolSet` + `@Tool`, and for `sendMessageAsync(Contents.of(…))`
  with `.catch`/`.onCompletion`/`.collect`. Caveat: it is Compose + Hilt + ViewModel, so
  only `LlmChatModelHelper` and `MobileActionsTools` transfer to PocketForge's
  plugin/service shape — and `MobileActionsTools` shows the `@Tool` style PocketForge
  specifically must *not* use (§4.4).
- [Get Started with LiteRT-LM on Android](https://developers.google.com/edge/litert-lm/android)
  — the two `<uses-native-library>` manifest entries for the GPU backend.
- [LiteRT-LM issue #2114](https://github.com/google-ai-edge/LiteRT-LM/issues/2114)
  — GPU `initialize()` failure on Galaxy S26 Exynos (Xclipse 960 + ANGLE-CL); the
  concrete justification for the fallback chain.
