# On-device LLM backend — verification checklist

Ordered on-device verification checklist for PocketForge's on-device LLM path
(Capacitor plugin → foreground service → local OpenAI-compatible server →
`src/lib/llm/localLlamaCpp.ts`). Sections 1–7 cover the original llama.cpp/GGUF
engine; [section 8](#8-vision-litert-lm-vl-bundle) covers the newer LiteRT-LM
engine (`docs/litertlm-android-adapter.md`, `docs/litertlm-vl-integration.md`),
text-only and vision.

| | |
|---|---|
| Target device | Galaxy S25 Ultra (arm64-v8a only) |
| Model (sections 1–7) | `vgc_gemma2.gguf` (~2.78 GB, Gemma-2 tool-calling fine-tune, llama.cpp engine) |
| Models (section 8) | `vgc_e4b_v5_heretic.litertlm` (3.87 GB, text-only) and `vgc_e4b_v5_heretic_vl.litertlm` (4.03 GB, same weights + vision tower), both LiteRT-LM engine |
| App id | `com.whitedevil93.pocketforge` |
| Native module | `pokekit-llm` (vendored llama.cpp, tag b10362, in `third_party/llama.cpp`) for sections 1–7; LiteRT-LM Kotlin API (`com.google.ai.edge.litertlm`, pinned `0.16.0`) for section 8 |

**Ground rule: do not mark anything here as verified unless it was observed on
the physical device with the real model.** Everything that can be checked
without hardware lives in CI (see [What CI covers](#what-ci-covers-automated-checks)
at the bottom) — this document is only for what CI cannot prove.

Legend: each step states **Expect** (what you should see) and, where useful,
**Fail means** (the likely cause).

---

## Current state of the stack (read first)

What is real and wired as of this writing:

- Native toolchain: llama.cpp compiles into `libpokekit-llm.so` (arm64-v8a), `ping`
  returns llama.cpp build info (`LocalLlmPlugin.kt`, `pokekit-llm.cpp`).
- Model import: SAF picker → GGUF magic + size validation → chunked copy with
  progress events → persisted `localModelPath`/`localModelName` (`LocalLlmPlugin.kt`).
- Foreground service: notification, off-main-thread model-load thread, port
  selection, `stopped → loading → ready/error` transitions
  (`LocalLlmService.kt`, `specialUse` FGS).
- Chat wire: TS owns the multi-turn tool loop (`localLlamaCpp.ts`), each model
  turn is one `chatOnce` POST to `http://127.0.0.1:<port>/v1/chat/completions`
  with SSE streaming and index-keyed tool-call-delta accumulation
  (`LocalLlmPlugin.kt`).
- Settings: backend switch, import row, server start/stop row, backup redaction
  (`SettingsPage.tsx`).

What the engine does now (Phases 6a–6c):

- `nativeLoadModel` really loads the GGUF into a llama.cpp session (returns a
  handle, 0 on failure); `nativeUnloadModel`/`nativeFreeModel` release it.
  The fake `Thread.sleep(400)` loading delay is gone — loading now takes real
  time (multi-GB model into RAM on the `llm-model-load` thread; the UI must
  stay responsive and the notification shows "Loading").
- `nativeGenerate` runs real llama.cpp decode/sample on a worker thread and
  streams SSE via JNI callbacks (`LocalLlmPlugin.kt` → TS).
- `nativeCancel` aborts an in-flight generation (early exit, partial reply
  kept, no error banner).
- `handleClient` reads the request body and answers `/v1/chat/completions`
  with real token/tool-call deltas + `[DONE]` (`LocalLlmService.kt`).
- Phase 6c added chat-template/tool-parser diagnostics + tuning knobs — the
  logcat keys to watch and the override knobs are wired into
  [Section 3](#3-chat-template-round-trip-top-priority) below.

Consequence for this checklist: the inference engine itself is no longer the
gate. Everything that exercises inference must still be run on the **physical
Galaxy S25 Ultra with `vgc_gemma2.gguf`** — CI proves the JS-visible contract
and that the native engine compiles into the APK (see
[What CI covers](#what-ci-covers-automated-checks)), but it cannot prove
inference correctness on device. Sections
[1](#1-model-import-saf), [2](#2-foreground-service-start),
[6](#6-backend-switching--gating), and [7](#7-backupexport-hygiene) already
passed against the scaffolding and are unaffected by the engine replacement;
[3](#3-chat-template-round-trip-top-priority), [4](#4-tool-call-correctness),
and the streaming parts of [5](#5-streaming-ux-stop--memory) are the remaining
hardware pass.

---

## Prerequisites

1. Debug APK from `.github/workflows/android.yml` (Build Android APK →
   `debug`) or `npm run android:apk`. Install: `adb install <apk>`.
2. `vgc_gemma2.gguf` available to the SAF picker (e.g. in Downloads) and
   ~3 GB free app storage.
3. A team open in the Builder (needed for the tool-calling tests).
4. `adb logcat -s LocalLlmPlugin LocalLlmService pokekit-llm` running in a side
   terminal (`pokekit-llm` carries the native Phase 6c diagnostics — see
   [Section 3](#3-chat-template-round-trip-top-priority)).

---

## 1. Model import (SAF)

1. Settings → AI Assistant → toggle the backend to **On-device**, then tap
   **Import model**.
   - **Expect:** the system document picker (SAF) opens.
2. Select `vgc_gemma2.gguf`.
   - **Expect:** the import progress bar appears and advances 0 → 100 % with a
     `bytesCopied / totalBytes` counter (events throttle at ~1 % steps; for a
     2.78 GB file that is ~27–28 MB per step). The UI must stay responsive
     during the copy (it runs on a background thread).
   - **Fail means:** no progress events → check `modelImportProgress` listener
     wiring; frozen UI → copy left the background thread.
3. When the copy finishes, the row must show the model name
   (`vgc_gemma2.gguf`), its size (~2.78 GB), and the absolute path
   `/data/user/0/com.whitedevil93.pocketforge/files/vgc_gemma2.gguf`.
   - Verify on the device (debug builds allow `run-as`):
     `adb shell run-as com.whitedevil93.pocketforge ls -l files/` — exactly one
     `.gguf`, and **no leftover `.partial` file**.
4. Persistence: force-stop and relaunch (`adb shell am force-stop
   com.whitedevil93.pocketforge`). Settings → AI Assistant must still show the
   imported model (persisted `localModelPath`/`localModelName`, store v3).

Negative checks:

5. Repeat import with a non-GGUF file (e.g. a `.txt`).
   - **Expect:** rejected *before any copy* with "Not a GGUF model: the file
     does not start with the 'GGUF' magic bytes"; previous model untouched.
6. Repeat with a file < 1 MiB.
   - **Expect:** rejected with a too-small error.
7. Cancel the picker.
   - **Expect:** no error surfaced, previous model untouched.

---

## 2. Foreground service start

1. With the model imported, tap **Start** on the "On-device server" row.
   - **Expect:** the call returns immediately with `loading` (it must not block
     the UI), and a silent ongoing notification appears: **PocketForge LLM —
     Loading model…** (channel "Local LLM").
2. Watch the status line and logcat.
   - **Expect:** status transitions `Loading model…` → `Ready · port <N>`;
     logcat shows `LocalLlmService: ready on port <N>`; notification text
     becomes `Ready on 127.0.0.1:<N>`.
   - **Fail means:** `error` state with message → model file missing/too small
     or port bind failure.
3. While loading, scroll/switch tabs in the app.
   - **Expect:** UI stays fully responsive — the load runs on the
     `llm-model-load` thread, never the main thread.
4. Loopback probe (no model output needed):
   ```sh
   adb forward tcp:18080 tcp:<N>
   curl -s http://127.0.0.1:18080/health
   ```
   - **Expect:** `{"status":"ok"}`. This proves the service port, the
     loopback bind, and the cleartext-loopback network-security config are all
     live without any inference.

Negative checks:

5. Without any model imported, the **Start** button must be disabled.
6. With a model path that no longer exists, `startServer` must resolve an
   `error` status ("Model file not found: …"), not crash.
7. Recovery from a dead service with stale state: while `loading` (or once
   `ready`), stop the service out from under the app without killing the
   process — `adb shell am stopservice com.whitedevil93.pocketforge/.LocalLlmService`.
   - **Expect:** the status line falls back to `Stopped` (never a stale
     `Loading model…`/`Ready`), and tapping **Start** again re-attempts the
     load from scratch — a fresh `Loading model…` → `Ready` cycle.
8. Restart after failure: trigger any error (step 6 above), then tap **Start**
   again with a valid model path.
   - **Expect:** a fresh load attempt; the error never wedges the row.
9. Permission denial: on Android 13+ revoke/deny notifications
   (`Settings → Apps → PocketForge → Notifications`), then tap **Start**.
   - **Expect:** an error status with the retry hint appears in the row (not
     a silent no-op); after granting, **Start** works normally.
10. Load watchdog: only trips if a load exceeds 15 minutes
    (`LocalLlmService.LOAD_WATCHDOG_MS`) — expect an `error` status with
    "timed out … tap Start to retry" rather than an eternal `Loading model…`.

---

## 3. Chat-template round-trip (top priority)

**Requires the physical device + model (the engine is real — see "Current
state" above).** Open question carried over from Phase 3: does the engine's
Jinja path round-trip this Gemma-2 fine-tune's chat/tool-call template out of
the box, or does it need the `kChatTemplateOverride` fallback (below)?

With the server `ready` and a team open in the Builder:

1. Settings → AI Assistant → **Chat**. Send a plain message, e.g.
   "Hello — in one sentence, what can you help me with?"
   - **Expect:** tokens stream in; a coherent reply; no raw template artifacts.
   - **Fail means:** output containing literal template markers
     (`<start_of_turn>`, `{{`, `{{ bos_token }}`, etc.) → the chat template is
     not being applied — go to the override procedure below.
2. Send a tool-forcing message, e.g. "What is my team's biggest shared
   weakness?" or "How hard does [team member]'s [move] hit [opponent]?"
   - **Expect:** a tool chip appears (e.g. `analyze team` / `calculate
     damage`), the tool result comes back, and the model answers using it.
   - **Fail means:**
     - no tool call at all for an obvious calculator question → template did
       not convey the tool schema (check the `pokekit-llm` diagnostics under
       "Where the tuning knobs live" below);
     - malformed tool calls (empty arguments, unknown tool names) → the TS
       side tolerates this (`parseToolCallArguments` returns `{}` and the
       handler reports the missing parameter), but it means the model's
       tool-call format isn't being parsed — go to the override procedure.

### Where the tuning knobs live (Phase 6c diagnostics)

The engine runs in-process (there is **no spawned `llama-server` process**):
`LocalLlmService.kt` owns the model path + port and drives
`nativeLoadModel`/`nativeUnloadModel`/`nativeFreeModel`, and `pokekit-llm.cpp`
runs decode/sample in `nativeGenerate` and serves `/v1/chat/completions`.
Whatever serves that endpoint must speak OpenAI SSE (`data:` chunks,
`delta.content` / `delta.tool_calls` by index, `[DONE]` terminator) — that is
the exact contract `LocalLlmPlugin.chatOnce` parses.

Diagnostics and knobs are all in `android/app/src/main/cpp/pokekit-llm.cpp`:

- **Logcat tag `pokekit-llm`.** At model load, `nativeLoadModel` logs the
  template source (INFO; a WARN if the metadata key is missing):
  - `nativeLoadModel: chat template override=…` — the override value in use
  - `nativeLoadModel: chat template was_explicit=0|1` — the
    `common_chat_templates_was_explicit` result: `1` means the override
    supplied the template explicitly, `0` means the model's embedded
    `tokenizer.chat_template` metadata was used
  - `nativeLoadModel: chat template source=…` / `chat template source
    (tool_use)=…` — where the template came from
  - `nativeLoadModel: model tokenizer.chat_template=…` — the GGUF's raw
    embedded Jinja (truncated to 2048 chars)
  - `nativeLoadModel: representative apply format=… grammar=…` — the
    `common_chat_format` that `common_chat_templates_apply` chose for a
    representative tool-calling request, and whether it produced a grammar
- **Chat-template override knob — `kChatTemplateOverride`** (top-of-file
  constant). `""` (default) uses the model's embedded template; a file path
  reads that file's contents as the Jinja source (the `--chat-template-file`
  equivalent); `"chatml"` selects the built-in chatml source; any other
  non-empty string is used verbatim as raw Jinja. One-line change, rebuild,
  reinstall.
- **Parser-selection knob — `kParserFormatOverride`** (same file). Default
  `kParserFormatFromApply` keeps whatever `apply()` produced (for the
  Gemma-2 autoparser path that is `COMMON_CHAT_FORMAT_PEG_NATIVE`);
  alternatives are `COMMON_CHAT_FORMAT_PEG_GEMMA4`,
  `COMMON_CHAT_FORMAT_PEG_MINIMAX_M3`, and `COMMON_CHAT_FORMAT_CONTENT_ONLY`
  (pure content parser, no tool-call extraction). Only change this if the
  default parser misses well-formed model output; do not hand-roll parsing.

### If the template round-trip fails: `kChatTemplateOverride` (fallback path)

If a chat turn shows literal template artifacts or the tool schema is not
conveyed, force a known-good template via the `kChatTemplateOverride`
constant in `pokekit-llm.cpp`:

1. Export a known-good template to a file in app-private storage next to the
   model (the same `filesDir` import path is the natural home). For the stock
   Gemma template, the `models/templates/*.jinja` files shipped in
   `third_party/llama.cpp` are a starting point.
2. Point the constant at it: `kChatTemplateOverride = "<path>";` — a file
   path is read and its contents used as the Jinja template source (mirrors
   `llama-server --chat-template-file <templatePath>`).
3. Rebuild + reinstall, reload the model, and re-check logcat: `chat template
   override=<path>` with `chat template was_explicit=1` confirms the override
   took effect.

Notes:

- The template inside `vgc_gemma2.gguf` lives in its GGUF metadata
  (`tokenizer.chat_template`); the engine renders it with the bundled minja
  engine. Extract it to inspect what the model was actually fine-tuned with.
- Tool-call *parsing* (turning the model's raw text back into
  `tool_calls`) is a separate knob — `kParserFormatOverride` in the same file
  (see "Where the tuning knobs live" above); a template fix alone may not be
  enough for a custom fine-tune.
- Cheap pre-check without the phone: build the pinned llama.cpp `llama-server`
  on a dev machine, run it with the same GGUF, and POST one chat completion
  with a `tools` array. Template regressions reproduce identically there
  (recipe in the `pokekit-llm.cpp` header comment).

---

## 4. Tool-call correctness

**Requires the physical device + model (the engine is real).** The one rule
that matters: **the model must never do arithmetic — every number comes from
the TS calculators.**

1. Ask for a damage roll between two Pokemon that are also in the app's
   Calculator page (e.g. your team member vs a common wall).
   - **Expect:** the `calculate damage` chip appears during streaming, and the
     reported percent range / KO chance **exactly match** what the Calculator
     page shows for the same matchup.
2. Ask a speed question ("Does my [species] outspeed base [species]?") —
   **Expect:** `calculate speed` chip; numbers match the Speed stat the
   Builder shows for that spread.
3. Ask "Is my team legal?" — **Expect:** `validate team` chip; the verdict
   matches the Builder's validation.
4. Tempt it: "quick estimate, no tools — how much does Focus Blast do to
   Chansey?"
   - **Expect:** it still calls the tool (the system prompt forbids guessing).
   - **Fail means:** any number appearing in a reply *without* a tool chip is
     a hallucination path — record the exact prompt and template config.

---

## 5. Streaming UX, stop & memory

1. With the server ready, send a longer question and watch the reply.
   - **Expect:** tokens stream in progressively (not one block at the end).
2. While streaming, tap the **stop** (square) button.
   - **Expect:** streaming stops immediately, the partial reply is kept as a
     message, and **no error banner** appears (abort is not an error).
   - How it works now: Stop → `nativeCancel` → early exit in `nativeGenerate`
     (partial reply kept, no error banner).
3. Send another message and close the chat sheet mid-stream (drag down).
   - **Expect:** the in-flight request is aborted (nothing keeps updating in
     the background), and reopening the sheet works normally — no stuck
     spinner.
   - Note: closing the sheet does **not** stop the server — by design,
     server stop is an explicit action (see step 4). If the desired UX is
     auto-stop-on-close, that is a product decision and a code change, not a
     defect in the current behaviour.
4. Settings → AI Assistant → **Stop**.
   - **Expect:** notification disappears, status shows `Stopped`, logcat
     shows `handleStop`; a generation in flight is aborted (Stop →
     `nativeCancel` → early exit, partial reply kept, no error banner).
     Memory: `adb shell dumpsys meminfo
     com.whitedevil93.pocketforge` before Stop vs after — the working set
     must drop by (most of) the loaded model's footprint. This is the
     Phase 6a lifecycle proof: `nativeUnloadModel`/`nativeFreeModel` release
     the loaded session on stop.
5. Battery/thermal sanity during a few minutes of continuous chat — expect
     sustained generation without the app being killed by the system while
     the foreground notification is up.

---

## 6. Backend switching & gating

1. Settings → AI Assistant: toggle **Ollama Cloud ↔ On-device**.
   - Cloud selected → the "API Key & Model" row appears.
   - On-device selected → "Import model" + "On-device server" rows appear.
2. Gating (`hasAiConfig`) per backend:
   - Cloud: the **Chat** row is disabled until both API key and model are set
     ("Not configured" → "Configured · <model>").
   - On-device: the Chat row subtitle walks "Import a model first" →
     "Start the on-device server first" → "Ask about your team" as each
     prerequisite completes (server must actually be `ready`).
3. Open **Chat** while unconfigured — **Expect:** the setup hint (never a
   broken composer).
4. In a desktop browser / PWA build: the **On-device** toggle must be
   disabled with the tooltip "On-device AI requires the Android app", and the
   cloud path must work unchanged.
5. Switch backends between messages — **Expect:** each send uses the selected
   backend; on-device sends never include an API key and the local system
   prompt contains no web-tool guidance (covered by CI).

---

## 7. Backup/export hygiene

1. Set up state worth leaking: import the local model (On-device) **and**
   enter an Ollama API key (Ollama Cloud).
2. Settings → Data Management → **Full App Backup**, then open the downloaded
   `pocketforge-backup-<date>.json`.
   - **Expect:** `state.settings` contains **none** of `ollamaApiKey`,
     `localModelPath`, `localModelName`. Teams, folders, custom formats, and
     Nuzlocke data are all still present.
   - Quick check:
     ```sh
     jq '.store | fromjson | .state.settings | has("ollamaApiKey"), has("localModelPath"), has("localModelName")' \
       pocketforge-backup-*.json
     # expect: false false false
     ```
3. Restore that backup (Restore Full Backup) on a fresh profile.
   - **Expect:** the app reloads cleanly; the merge backfills
     `ollamaApiKey: ''`, `localModelPath: ''`, `localModelName: ''`,
     `aiBackend: 'ollamaCloud'` — no crash on undefined settings keys
     (this merge behaviour is regression-tested in CI).
4. "Export All Teams" must contain teams only — no settings object at all.

---

## 8. Vision (LiteRT-LM VL bundle)

**Requires the physical device + both `.litertlm` bundles** (`vgc_e4b_v5_heretic.litertlm`
text-only, `vgc_e4b_v5_heretic_vl.litertlm` text+vision — see the table at the top). This
section is new relative to 1–7: the engine, the backend fallback walk, and the whole
image-attach path are all LiteRT-LM-specific and share none of the llama.cpp code those
sections exercise. Background: `docs/litertlm-android-adapter.md` (text path, steps 1–7) and
`docs/litertlm-vl-integration.md` (vision path, steps 8–14).

### 8.1 Engine load & backend fallback

1. Import `vgc_e4b_v5_heretic_vl.litertlm`, tap **Start** on the "On-device server" row.
   - **Expect:** status reaches `Ready · port <N>`; the "Enable AI Assistant" and "Backend"
     subtitles both show a backend name of the form `LiteRT-LM · <NPU|GPU|CPU>` (whichever
     backend actually won); the new "On-device server" subtitle below the Start/Stop row
     reads **"Vision available — attach photos in Chat"** with the eye icon.
   - Logcat: watch for the NPU→GPU→CPU walk, each backend tried with `visionBackend` set
     first — confirm which backend won and whether any vision-enabled attempt failed and
     fell through before succeeding (that fallthrough, not a hard failure, is expected
     behaviour on hardware without NPU vision support).
2. Stop the server, import `vgc_e4b_v5_heretic.litertlm` instead (same import flow), Start.
   - **Expect:** reaches `Ready`; the subtitle instead reads **"Vision not available — this
     model is text-only. Import a VL bundle to attach images."**
   - Logcat: confirm the no-vision retry actually fires for the winning backend (i.e. the
     text bundle's load does *not* silently reuse a vision-capable attempt) rather than
     failing the load outright.
   - **Fail means:** if the text bundle's status ever shows "Vision available", the format
     detection or the vision-retry logic is wrong — file a bug against
     `LiteRtLmEngine.load`, don't paper over it in the UI.

### 8.2 Attach control gating

With `vgc_e4b_v5_heretic_vl.litertlm` loaded and the server `ready`:

1. Open **Chat**. **Expect:** an attach (camera/image) control next to the composer.
2. Tap it. **Expect:** the native chooser offers **Camera** and **Photos** in one prompt
   (`CameraSource.Prompt`). Pick a photo.
   - **Expect:** a thumbnail appears above the composer with a remove (×) affordance;
     removing it clears the attachment without sending anything.
3. Deny the camera permission when prompted (first run only — `Settings → Apps →
   PocketForge → Permissions` to reset it for a repeat test).
   - **Expect:** the picker simply closes with no attachment and **no error toast** — this
     is a normal outcome (`ImagePickCancelledError`), not a failure state.
4. Stop the server, start it again with `vgc_e4b_v5_heretic.litertlm` (text-only) loaded,
   reopen **Chat**.
   - **Expect:** the attach control is gone entirely — confirms the gate reads live
     `visionAvailable` off the server status rather than a stale/cached value from the
     previous session.
5. Switch **AI Assistant → Backend** to **Ollama Cloud** with the VL bundle still imported
   on-device.
   - **Expect:** no attach control in Chat — the control is gated on the local server's
     `visionAvailable`, not on having *any* `.litertlm` file sitting in storage.

### 8.3 Generic attach-and-ask

With the VL bundle `ready`:

1. Attach a photo of anything (not a team screenshot) and ask "what is in this image?".
   - **Expect:** a coherent streamed answer describing the actual photo content.
   - **Fail means:** a generic/hallucinated answer unrelated to the photo → the image bytes
     are not reaching the model — check the content-part JSON crossing the bridge
     (`ChatRequest.kt`'s `decodeImageDataUrl`) and that `Content.ImageBytes` is actually
     attached to the `Conversation`, not dropped.
2. Attach an image over ~8 MiB decoded (a high-res photo without native downscaling — e.g.
   push one directly via `adb shell content` rather than through the picker, which always
   downscales).
   - **Expect:** a clear rejection error, not a crash or a silent text-only answer
     (`ChatRequest.kt`'s `MAX_IMAGE_BYTES` cap).
3. Tap **stop** mid-stream on an image-attached turn. **Expect:** same behaviour as the
   text-only stop button (section 5) — partial reply kept, no error banner.

### 8.4 Team import (the headline feature)

1. From the empty-chat state, tap **"Import team from screenshot"**.
   - **Expect:** the picker opens immediately (no text composer step first).
2. Run this against a corpus of **at least 10 real screenshots**, covering: a clean Showdown
   text export screenshotted, a team preview screen, a photographed (not screenshotted)
   phone/monitor showing a team, and at least one deliberately bad case (blurry, cropped,
   partially off-screen).
   - **Expect per image:** the model calls `create_team` then `add_pokemon` per Pokemon
     (tool chips visible during streaming, matching the existing tool-call UX), then
     `validate_team`; the final reply summarizes what it read so a wrong species/move/EV
     spread is visible and correctable, not silently written in.
   - **Record, don't eyeball:** for each image, note whether the resulting team is an exact
     match to the screenshot (species, moves, ability, item, nature, EVs, teraType, level)
     — "looks plausible" is not a pass. This is the plan's own go/no-go gate
     (`docs/litertlm-vl-integration.md`'s Risks section): a low exact-match rate means the
     UI needs to become a confirm-before-write draft flow instead of direct writes, which is
     a follow-up task, not a bug in this pass.
   - **Expect on the bad-case image:** the model says explicitly what it couldn't read
     (per the `includeImageImport` system-prompt guidance in `systemPrompt.ts`) rather than
     inventing plausible-sounding values for the blurry/cropped parts.
3. Confirm the import always starts a **fresh** conversation (per-message history isn't
   polluted by whatever was on screen before the import button was tapped).

### 8.5 Memory

1. `adb shell dumpsys meminfo com.whitedevil93.pocketforge` right after the VL bundle
   reaches `ready`, then again after sending one image-attached turn.
   - **Expect:** a working-set increase consistent with the extra vision executor + one
     image's worth of KV cache — not an unbounded climb turn over turn (each request builds
     one fresh `Conversation`, so nothing should accumulate across turns).
2. Background the app for a few minutes with the VL server still `ready` (trigger
   `onTrimMemory` — `adb shell am send-trim-memory com.whitedevil93.pocketforge
   RUNNING_CRITICAL` if backgrounding alone doesn't trip it on this device).
   - **Expect:** the service force-stops per the existing `onTrimMemory` handling (shared
     with the llama.cpp path, `docs/litertlm-android-adapter.md` step 7) — the vision-loaded
     engine is not exempt from this.

### 8.6 Regression

1. With `vgc_gemma2.gguf` (llama.cpp, section 1–5) imported and running — **Expect:** no
   attach control anywhere, no vision subtitle text, everything in sections 1–7 unaffected.
2. Switch back to **Ollama Cloud** — **Expect:** unaffected; no image affordance appears
   anywhere in the app for the cloud backend, on any device.

---

## What CI covers (automated checks)

Hardware-free, deterministic, run by `npm run check` locally and by
`npm run lint` + `npm run verify` + `npm run build` in CI:

**`verify_integration.mjs` (via `npm run verify`):**

- Local tool schema: `toLocalToolSchema()` advertises exactly the 8
  calculator tools and **excludes `web_search`/`web_fetch`**; every advertised
  tool exists in the registry; entries are OpenAI-compatible.
- System-prompt gating: the local backend's prompt never mentions the web
  tools; the cloud prompt keeps them.
- `localLlamaCpp.ts`'s `sendMessage` imports cleanly outside the native shell
  (the native bridge stays a dynamic import).
- Native wiring consistency (static file checks — these are cross-file
  invariants that a successful compile does *not* enforce):
  - `MainActivity` registers `LocalLlmPlugin`;
  - Capacitor plugin name matches TS ↔ Kotlin (`"LocalLlm"`);
  - every bridge method exists on both sides (`ping`, `pickModelFile`,
    `chatOnce`, `startServer`, `stopServer`, `getServerStatus`);
  - event names match both sides (`modelImportProgress`, `chatOnceEvent`,
    `serverStatusChanged`);
  - `System.loadLibrary("pokekit-llm")` matches the CMake target;
  - manifest declares the `specialUse` foreground service + permissions;
  - cleartext HTTP stays loopback-only; ABI stays `arm64-v8a`.
- AI tool registry correctness (10 tools, handlers wired to the real
  calculators: damage, speed, analysis, validation, lookups, EVs — including
  nickname, Mega, Tera-flag, and generation-scoping regressions).
- `web_search`/`web_fetch` against a mocked Ollama endpoint (offline).
- Persisted-settings merge backfill (`aiBackend`, `localModelPath`,
  `localModelName`, `ollamaApiKey`) for pre-feature installs and redacted
  backups.
- Plus all team/movepool/calculator/type-chart regressions.

**Build gates:**

- `npm run lint` (eslint) + `npm run build` (`tsc -b` typecheck + Vite web
  bundle) — proves the TS half of the local backend compiles.
- `.github/workflows/android.yml` (manual dispatch) runs `npm run lint`,
  `npm run verify`, `npm run build:android`, then `./gradlew assembleDebug` —
  proves the Kotlin plugin, the Java bridge registration, and the vendored
  llama.cpp native module all compile into a real arm64-v8a APK. This covers
  the real native engine (`nativeLoadModel`/`nativeGenerate`/`nativeCancel`)
  compiling into the APK via `./gradlew assembleDebug` — a compile gate only.
  CI does **not** cover inference correctness: that is device-only, which is
  what this checklist verifies.

Everything above this line in the document is **not** covered by CI and
**must** be run on the Galaxy S25 Ultra — sections 1–7 with `vgc_gemma2.gguf`, section 8 with
both `.litertlm` bundles. CI's Android workflow compiles the LiteRT-LM engine into the APK the
same way it does for llama.cpp (a compile gate only, same caveat) — the Gradle dependency, the
manifest's `uses-native-library` entries, and the Kotlin sources all build, but backend
selection, `visionAvailable`, and extraction accuracy are exactly the parts CI cannot see.
