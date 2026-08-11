# On-device llama.cpp backend — verification checklist

Ordered on-device verification checklist for PocketForge's on-device LLM path
(Capacitor plugin → foreground service → local OpenAI-compatible server →
`src/lib/llm/localLlamaCpp.ts`).

| | |
|---|---|
| Target device | Galaxy S25 Ultra (arm64-v8a only) |
| Model | `vgc_gemma2.gguf` (~2.78 GB, Gemma-2 tool-calling fine-tune) |
| App id | `com.whitedevil93.pocketforge` |
| Native module | `pokekit-llm` (vendored llama.cpp, tag b10362, in `third_party/llama.cpp`) |

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

What is **not** real yet — the inference engine itself:

- `LocalLlmService` currently serves a **health-only HTTP stub** (every path
  answers `{"status":"ok"}`); `nativeLoadModel` in `pokekit-llm.cpp` is a no-op.
  Nothing answers `/v1/chat/completions` with SSE yet.

Consequence for this checklist: sections [1](#1-model-import-saf), [2](#2-foreground-service-start),
[5](#5-streaming-ux-stop--memory) (abort/memory parts), [6](#6-backend-switching--gating), and
[7](#7-backupexport-hygiene) can pass on the current build. Sections
[3](#3-chat-template-round-trip-top-priority) and [4](#4-tool-call-correctness) — and token streaming in
section 5 — require the real engine behind the service (either llama.cpp linked
in-process or a spawned `llama-server`), plus the physical device. Until then,
a chat turn against the stub resolves with an **empty** assistant message
(the stub's non-SSE response is skipped by the parser) — that is expected, not
a chat-template failure.

---

## Prerequisites

1. Debug APK from `.github/workflows/android.yml` (Build Android APK →
   `debug`) or `npm run android:apk`. Install: `adb install <apk>`.
2. `vgc_gemma2.gguf` available to the SAF picker (e.g. in Downloads) and
   ~3 GB free app storage.
3. A team open in the Builder (needed for the tool-calling tests).
4. `adb logcat -s LocalLlmPlugin LocalLlmService` running in a side terminal.

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
4. Loopback probe (works on the current stub, no model output needed):
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

---

## 3. Chat-template round-trip (top priority)

**Requires the real inference engine (see "Current state" above) + device.**
Open question carried over from Phase 3: does `llama-server --jinja`
round-trip this Gemma-2 fine-tune's chat/tool-call template out of the box, or
does it need a `--chat-template-file` override?

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
       not convey the tool schema (check `--jinja` / template file);
     - malformed tool calls (empty arguments, unknown tool names) → the TS
       side tolerates this (`parseToolCallArguments` returns `{}` and the
       handler reports the missing parameter), but it means the model's
       tool-call format isn't being parsed — go to the override procedure.

### Where the server args are configured

There is currently **no spawned `llama-server` process**: the service listens
via the embedded stub. When the real engine lands, it is configured from:

- `android/app/src/main/java/com/whitedevil93/pocketforge/LocalLlmService.kt`
  — `handleStart()` owns the model path and the chosen port; this is where the
  engine (in-process llama.cpp or a spawned `llama-server` binary) must be
  started, and therefore where its args live.
- `android/app/src/main/cpp/pokekit-llm.cpp` — `nativeLoadModel`/
  `nativeUnloadModel`/`nativeFreeModel` JNI entry points.

Whatever serves `/v1/chat/completions` must speak OpenAI SSE (`data:` chunks,
`delta.content` / `delta.tool_calls` by index, `[DONE]` terminator) — that is
the exact contract `LocalLlmPlugin.chatOnce` parses.

### If `--jinja` doesn't work: `--chat-template-file` override

If the engine is launched as a `llama-server` process, args are passed at
spawn time in `LocalLlmService.handleStart`:

```text
# built-in Jinja template from the GGUF metadata (default expectation)
llama-server -m <modelPath> --host 127.0.0.1 --port <port> --jinja

# override: ship/import a known-good tool template and point at it instead
llama-server -m <modelPath> --host 127.0.0.1 --port <port> \
  --chat-template-file <templatePath>
```

Notes:

- The template inside `vgc_gemma2.gguf` lives in its GGUF metadata
  (`tokenizer.chat_template`); `--jinja` renders it with the bundled minja
  engine. Extract it to inspect what the model was actually fine-tuned with.
- Keep the override file in app-private storage next to the model (same
  `filesDir` import path is the natural home).
- Tool-call *parsing* (turning the model's raw text back into
  `tool_calls`) is a separate knob — check the pinned llama.cpp tag's
  `llama-server --help` for its tool-parser options; a template fix alone may
  not be enough for a custom fine-tune.
- Cheap pre-check without the phone: run the pinned llama.cpp `llama-server`
  on a dev machine with the same GGUF and POST one chat completion with a
  `tools` array. Template regressions reproduce identically there.

---

## 4. Tool-call correctness

**Requires the real engine + device.** The one rule that matters: **the model
must never do arithmetic — every number comes from the TS calculators.**

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
   *(On the current stub this step shows the empty-reply behaviour described
   in "Current state"; re-run once the engine lands.)*
2. While streaming, tap the **stop** (square) button.
   - **Expect:** streaming stops immediately, the partial reply is kept as a
     message, and **no error banner** appears (abort is not an error).
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
     shows `handleStop`. Memory: `adb shell dumpsys meminfo
     com.whitedevil93.pocketforge` before Stop vs after — the working set
     must drop by (most of) the loaded model's footprint.
   - On the current stub the model is never actually loaded, so the delta is
     ~0 — re-verify the drop once the engine lands (`nativeUnloadModel`/
     `nativeFreeModel` are currently no-ops).
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
  llama.cpp native module all compile into a real arm64-v8a APK.

Everything above this line in the document is **not** covered by CI and
**must** be run on the Galaxy S25 Ultra with `vgc_gemma2.gguf`.
