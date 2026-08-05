# On-device LLM in PocketForge — design notes

**Status: parked.** No code in the repo implements any of this. It is written down so the
research isn't lost, and so a model can be dropped in later without re-deriving the design.

Researched August 2026, against Gemma 4 E2B. Target device: Samsung Galaxy S25 Ultra.

---

## Why this document exists

PocketForge is a React PWA. Running a language model inside it usefully means running it
**on-device**, which means an Android app — hence the Capacitor conversion that landed
alongside these notes. The conversion is a prerequisite for everything below, but the two are
otherwise independent.

---

## Runtime: LiteRT-LM

Use **LiteRT-LM**, Google's on-device GenAI runtime.

```gradle
// Pin explicitly. 0.15.0 was current as of 2026-08-01.
implementation("com.google.ai.edge.litertlm:litertlm-android:0.15.0")
```

Do **not** use the MediaPipe LLM Inference API (`@mediapipe/tasks-genai`,
`com.google.mediapipe:tasks-genai`) — Google has it in maintenance-only mode and points new
work at LiteRT-LM.

### Kotlin API shape

```kotlin
val engineConfig = EngineConfig(
    modelPath = "/path/to/model.litertlm",
    backend = Backend.GPU(),
    cacheDir = context.cacheDir.path,   // speeds up subsequent loads
)
val engine = Engine(engineConfig)
engine.initialize()                     // up to ~10s — never on the main thread

engine.createConversation(
    ConversationConfig(
        systemInstruction = Contents.of("..."),
        samplerConfig = SamplerConfig(topK = 40, topP = 0.95, temperature = 0.8),
    )
).use { conversation ->
    conversation.sendMessageAsync("...")   // Flow<Message>
        .catch { /* ... */ }
        .collect { /* stream tokens out */ }
}

engine.close()
```

Errors from the native layer surface as `LiteRtLmJniException`.

### Backends

Fallback chain: `Backend.NPU(nativeLibraryDir)` → `Backend.GPU()` → `Backend.CPU()`, catching
at each step and reporting which one won.

The GPU backend requires these in `AndroidManifest.xml`:

```xml
<uses-native-library android:name="libOpenCL.so" android:required="false"/>
<uses-native-library android:name="libvndksupport.so" android:required="false"/>
```

---

## Target hardware

| | |
|---|---|
| Device | Galaxy S25 Ultra |
| SoC | Snapdragon 8 Elite (**SM8750**), Adreno 830 |
| RAM | 12 GB |

Reference performance for Gemma 4 E2B on LiteRT-LM (Google's published figures, S26 Ultra):

| Backend | Prefill tok/s | Decode tok/s | TTFT | Resident memory |
|---|---|---|---|---|
| GPU | 3,808 | 52 | 0.3 s | ~676 MB |
| CPU | 557 | 46.9 | 1.8 s | ~1,733 MB |

With speculative decoding on GPU, decode reaches 66–92 tok/s depending on task type.

Gemma 4 E2B uses mixed 2/4/8-bit quantization: text-only weights are ~0.8 GB resident, while
the 1.12 GB embedding table is memory-mapped. Vision and audio submodels load on demand.

---

## Model format

Everything above is **model-agnostic** — it needs a `.litertlm` file, not specifically Gemma.
A custom fine-tune has to be converted to `.litertlm` to run through LiteRT-LM, but the plugin,
tool layer, and UI described here don't change.

Google's published Gemma 4 E2B builds (`litert-community/gemma-4-E2B-it-litert-lm` on
Hugging Face):

| File | Size | Notes |
|---|---|---|
| `gemma-4-E2B-it_qualcomm_sm8750.litertlm` | 3.02 GB | NPU build for the S25 Ultra's exact SoC |
| `gemma-4-E2B-it.litertlm` | 2.59 GB | Generic mobile GPU/CPU |
| `gemma-4-E2B-it-web.litertlm` | 2.0 GB | WebGPU, text-only |

**Never bundle the model in the APK.** Opt-in download on first use via Android
`DownloadManager` (survives app death, resumable, respects a Wi-Fi-only constraint) into the
app-specific external files dir. Verify size/hash before marking it ready.

---

## The one rule that matters

> **The model must never do arithmetic.**

It will hallucinate damage rolls and speed tiers, confidently and plausibly. This is the
failure mode that would make the feature worse than useless in a competitive team builder.

Gemma 4 and LiteRT-LM support native **function calling with constrained decoding**. So the
model handles language and judgement, and every number comes from the calculators PocketForge
already has:

| Tool | Backed by |
|---|---|
| `calculate_damage` | `calculateDamage`, `getKoChance` — `src/utils/damageCalc.ts` |
| `calculate_speed`, `does_outspeed` | `calculateSpeed`, `outspeeds` — `src/utils/speedCalculator.ts` |
| `analyze_team` | `analyzeTeamWeaknesses`, `analyzeTeamSynergy`, `getCoverageGaps` |
| `validate_team` | `validateTeam` — `src/utils/validation.ts` |
| `lookup_pokemon` | `getPokedexEntry` — `src/utils/movepoolQuery.ts` |
| `get_legal_moves` | `getMovepoolForSpecies` — `src/utils/movepoolQuery.ts` |
| `suggest_coverage` | `suggestCoverageMoves` — `src/utils/weaknessAnalyzer.ts` |
| `explain_evs`, `min_speed_evs` | `explainEVSpread`, `calculateMinSpeedEVs` |

**Schema caution:** `calculateDamage` takes fully-populated `CalcPokemon` objects (base stats,
EVs, IVs, nature, ability, item, types). Do not expose that shape to the model — it will fill
it in wrong. Expose a thin schema (species name, optional set overrides, move name, field
conditions) and hydrate `CalcPokemon` inside the handler from `getPokedexEntry` plus
`getDefaultCalcPokemon` / `getDefaultField`.

---

## The tool round-trip

This is the one genuinely tricky part of the design.

PocketForge's calculators are **TypeScript running in the WebView**. LiteRT-LM's
`@Tool`-annotated Kotlin functions are **synchronous**. Bridging a synchronous Kotlin tool to
an async WebView round-trip means blocking a native thread on the WebView — deadlock-prone.

Use manual tool calling instead, which is designed for exactly this:

1. Kotlin calls `conversation.sendMessage(...)`, inspects `responseMessage.toolCalls`.
2. For each call, emit a `toolCall` event to JS: `{ id, name, arguments }`.
3. JS resolves it against the tool registry, runs the existing util, calls back with
   `resolveToolCall({ id, result })`.
4. Kotlin resumes:
   `conversation.sendMessage(Message.tool(Contents.of(Content.ToolResponse(name, json))))`.
5. Loop until the response carries no tool calls, streaming tokens throughout.

Create the conversation with `automaticToolCalling = false`. Cap tool iterations (~5) and add a
per-call timeout so a confused model can't spin.

---

## Architecture sketch

```
┌─ WebView (existing React app) ───────────────────────────────┐
│  ChatSheet / AI coaching section on Analysis                 │
│  useLlm() hook  →  LlmBackend interface                      │
│      ├── NativeLlmBackend   (Capacitor plugin)               │
│      └── UnavailableBackend (web/PWA build)                  │
│  toolRegistry: name → existing src/utils fn + JSON schema    │
└───────────────▲──────────────────────────┬───────────────────┘
                │ toolCall event           │ resolveToolCall
┌───────────────┴──────────────────────────▼───────────────────┐
│  Capacitor plugin (Kotlin)                                   │
│  LiteRT-LM Engine + Conversation                             │
│  Backend.NPU → Backend.GPU → Backend.CPU                     │
└──────────────────────────────────────────────────────────────┘
```

Keep the `LlmBackend` interface and an `UnavailableBackend` implementation so the GitHub Pages
build still compiles and runs with the feature simply reported as unavailable. Dynamic-import
the native backend so plugin code never enters the web bundle.

### UI surfaces

- **Chat** — a sheet built on the existing `BottomSheet` used by `FormatPickerSheet`
  (`src/pages/SettingsPage.tsx`). Serialize the current team into the system preface with
  `exportTeamToPSFormat` (`src/utils/psFormat.ts`) — compact, and close to a format the model
  will have seen.
- **Coaching** — a section on `src/pages/Analysis.tsx` fed the *existing* `AnalysisResult` from
  `analyzeTeam`, rendered alongside `SuggestionCard`. Grounded, so the model narrates real
  computed data instead of inventing matchups.
- **Settings** — a `FEATURES` entry plus a model-management row (download / backend / delete)
  reusing the `StorageBar` pattern.

New `AppSettings` fields (`aiEnabled`, `aiBackendPreference`, `aiWifiOnlyDownload`) need no
store version bump — `migrate` in `src/store/useStore.ts` already spreads `DEFAULT_SETTINGS`
over persisted settings, so new keys fill in automatically.

---

## Prior art

`@capgo/capacitor-llm` (8.1.3) already bridges LiteRT-LM `.litertlm` models to a WebView with
streaming and model download. It has **no tool calling**, which is the whole point here, so it
can't be used directly — but its plugin skeleton, download flow, and event shapes are a useful
reference.

---

## Rejected: running it in the browser

Google publishes `gemma-4-E2B-it-web.litertlm` (2.0 GB) which runs via WebGPU with
`@litert-lm/core`, and would drop into the PWA with no Android app at all. Rejected as the
primary route because:

- Every published web benchmark is desktop (MacBook Pro M4 Max: 73 tok/s, **~1800 MB of GPU
  memory**). Google publishes no mobile-browser figures.
- Mobile `maxStorageBufferBindingSize` can be as low as 128 MB where the runtime needs
  ~500 MB+. Whether Chrome on an S25 Ultra clears it is unverified.
- The web build is text-only — no vision, no audio.
- No NPU access, so it forfeits the SoC-specific build entirely.

Still worth keeping as an optional third `LlmBackend` implementation, gated behind a runtime
probe of `navigator.gpu.requestAdapter()` → `limits.maxStorageBufferBindingSize`. Mainly useful
for desktop browsers.

---

## References

- [LiteRT-LM Android guide](https://ai.google.dev/edge/litert-lm/android)
- [LiteRT-LM Kotlin API](https://github.com/google-ai-edge/LiteRT-LM/blob/main/docs/api/kotlin/getting_started.md)
- [LiteRT-LM Web API](https://ai.google.dev/edge/litert-lm/js)
- [Gemma 4 E2B LiteRT-LM model card](https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm)
- [Gemma 4 announcement](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/)
