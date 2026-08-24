# Integrating the VL `.litertlm` bundle into PocketForge

**Status:** plan only — no code written. Blocked on steps 1–7 of
`docs/litertlm-android-adapter.md`, which are also unimplemented.

## Context

`vgc_e4b_v5_heretic_vl.litertlm` (4.03 GB) is built and on the Hub — a Gemma 4 E4B QLoRA
fine-tune exported with the vision tower attached (`tensors=2076 vision_tower=658`). It is a
superset of the text bundle: same text weights, plus vision, for only ~165 MB more.

Nothing in PocketForge can feed it an image today. There is no camera, no file input, and no
image handling anywhere in `src/` — `ChatMessage.content` is a bare `string`. The Kotlin side
has no LiteRT-LM engine at all yet.

The outcome: a user photographs or picks a screenshot of a team (Showdown export, team preview,
a VGC report), and the on-device model reads it and builds the team in the app — plus a generic
"attach an image and ask about it" path on the same plumbing.

**This plan layers on top of `docs/litertlm-android-adapter.md`.** That document plans the text
path — the `InferenceEngine` seam, format sniffing, `LiteRtLmEngine`, streaming, tool calls —
as steps 1–7. Everything here is steps 8+ and assumes those have landed. Section references
below (§4.2, §4.4 …) point into that document.

### Decisions taken

| | |
|---|---|
| Feature | Both — build the plumbing once, ship the structured team importer as the headline, expose generic attach on top |
| Image source | Gallery **and** camera |
| Backends | Local LiteRT only; image controls hidden when `aiBackend !== 'localLiteRt'` |

## What already exists and must be reused

This is the finding that shrinks the work most: **the extract → validate → write pipeline is
already built and in production.**

- `src/lib/llm/writeTools.ts` — `create_team`, `add_pokemon`, `update_pokemon`, `remove_pokemon`
- `src/lib/llm/tools.ts` — `lookup_pokemon`, `get_legal_moves`, `validate_team`, `get_active_team`
- `src/lib/llm/systemPrompt.ts` — already instructs: call `create_team`, then per Pokémon call
  `get_legal_moves` / `lookup_pokemon` *before* `add_pokemon`, then `validate_team` and fix what
  it reports. "Illegal data will be rejected — use the rejection to correct yourself."
- `src/lib/llm/toolRunner.ts` — `runToolCall` with a 15 s per-tool timeout
- `src/lib/llm/localLlamaCpp.ts` — owns the multi-turn tool loop; one `chatOnce` per model turn

So the team importer is **not** a new structured-extraction feature. It is an image plus a
task-specific instruction dropped onto the loop that already exists. The model's hallucinations
are already contained: `add_pokemon` rejects illegal species/moves/abilities against the real
Pokédex, and `validate_team` catches the rest. Do not build a parallel extraction path, a JSON
schema for team output, or a separate validator.

Also reusable:
- `src/lib/platform.ts:13` `isNativeApp()` — the guard convention for anything Capacitor
- `src/hooks/use-ai-readiness.ts` — existing backend + server-state gating
- `android/.../LocalLlmPlugin.kt:107` `pickModelFile` / `@ActivityCallback onPickModelResult` —
  the Capacitor 8 `startActivityForResult` pattern, if a custom picker is ever needed
- The `FileProvider` already declared in `AndroidManifest.xml`

## Design

### Image transport: base64 through the existing bridge

`ChatOnceOptions.messages` is typed `unknown[]` (`src/lib/native/localLlm.ts:36`), so images can
flow through the plugin boundary with **no change to the bridge signature**. Use OpenAI content
parts, which the wire format already implies:

```ts
content: [
  { type: 'text', text: 'Build this team.' },
  { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,…' } },
]
```

On the Kotlin side, `Content.ImageBytes(bytes: ByteArray)` exists in LiteRT-LM's `Message.kt`
alongside `Content.ImageFile(absolutePath)`. **Use `ImageBytes`** — it takes the decoded base64
directly, so no temp file, no `FileProvider` grant, nothing to clean up.

Downscale *before* the image crosses the bridge. `@capacitor/camera` does this natively via
`width`/`height`/`quality`, so a 12 MP screenshot never becomes a 16 MB base64 string in the
WebView. Gemma 4's vision tower works at a fixed input resolution; oversending buys nothing.

### `ChatMessage` widening

`content: string` becomes `content: string | ContentPart[]`, with `ContentPart` a small union
of text and image parts. Keep `string` valid — every existing call site, all 14 tools, and the
whole Ollama Cloud path then compile untouched. Add a `contentToText(content)` helper for the
places that need a plain string (history display, `stripSpecialTokens`, storage).

`ollamaCloud.ts` is explicitly out of scope: it serialises `content` straight through, so it
must reject or flatten array content rather than silently sending something Ollama won't parse.

### Vision at engine level

`visionBackend` and `maxNumImages` are `EngineConfig` fields (adapter plan §4.1), so vision is
decided at **load** time, not per request. It cannot be a runtime toggle.

Rather than adding a setting the user has to understand, extend the backend fallback walk: try
each backend with `visionBackend` set; if `initialize()` fails, retry that backend without it
before moving on. A text-only bundle then loads text-only, the VL bundle loads with vision, and
neither needs the user to declare which they imported. Report the outcome as
`visionAvailable: boolean` on `getServerStatus`, and hide the image controls when it is false.

Set `maxNumImages = 1` explicitly. The importer sends one screenshot; leaving it at the model
default risks a larger KV allocation than needed on a device already carrying 4 GB of weights.

## Work

Steps continue the numbering in `docs/litertlm-android-adapter.md` (that plan ends at 7).

**8. Vision-capable engine load. Done, pending build/device verification.**
`LiteRtLmEngine.load` now tries each backend twice: `visionBackend` set (same `Backend`
instance as `backend`) and `maxNumImages = 1` first, then — only if that specific attempt
throws — the same backend again without vision, before moving to the next backend. A
text-only bundle is expected to fail the vision-enabled attempt (no vision tower to
initialize), not the backend itself, which is what lets one code path serve both bundle
types without the caller declaring which one was imported. `InferenceEngine` gained a
`visionAvailable: Boolean` alongside `backendId`; `LlamaCppEngine` reports it hard-coded
`false` (GGUF never supports images in this app). Plumbed the same way `backendId` was in
the adapter plan's step 7: a `LocalLlmService` companion field, a 5th `transition()`
parameter (defaulted `false`, so no existing call site needed touching except the one
`"ready"` transition), through to `getStatusSnapshot()` →
`LocalLlmPlugin.statusToJSObject`/`emitServerStatusChanged` → TS's
`LocalLlmServerStatus.visionAvailable?: boolean` (optional, matching `port`/`error`/
`backend`'s own convention of being absent outside `'ready'` — not required, which an
earlier pass of this edit briefly got wrong).
**Not yet verified** — needs both real bundles on real hardware: the VL bundle
(`vgc_e4b_v5_heretic_vl.litertlm`) reaching `ready` with `visionAvailable: true` and
showing which backend won *with* vision, and the text-only bundle
(`vgc_e4b_v5_heretic.litertlm`) reaching `ready` with `visionAvailable: false` after its
vision-enabled attempts fail as expected (worth confirming they fail the way this design
assumes, i.e. cleanly and specifically on the vision-enabled attempt, not by crashing the
whole load).

**9. Image plumbing, Kotlin.** In the request parser (§4.2), map OpenAI content parts onto
`Contents.of(Content.Text(…), Content.ImageBytes(…))`. Reject an image part with a clear error
when `visionAvailable` is false rather than silently dropping it — a silently text-only answer
about an image the user attached is worse than a refusal. Cap decoded image bytes and fail the
request above the cap.

**10. Image plumbing, TypeScript.** Widen `ChatMessage.content`; add `contentToText`; update
`toWireMessage` in `localLlamaCpp.ts` to pass array content through; make `ollamaCloud.ts`
reject it. Everything else in `src/lib/llm/` should compile unchanged — if it doesn't, the
union was widened in the wrong place.

**11. Capture.** Add `@capacitor/camera`, wrap it in `src/lib/native/imagePicker.ts` behind
`isNativeApp()` (mirroring `src/lib/native/localLlm.ts`), returning base64 + mime. Use
`CameraSource.Prompt` so one call offers camera and gallery. Add `CAMERA` to the manifest;
verify on-device whether `READ_MEDIA_IMAGES` is needed for the installed plugin version — recent
versions use the Android Photo Picker and need no gallery permission. Handle permission-denied
as a normal state, not an error toast.

**12. Attach button.** In `src/components/ai/ChatPanel.tsx` (`handleSend`, ~line 106), add a
pending-attachment slot next to the `input` state, an attach control by the send button, and a
thumbnail with a remove affordance. Gate the control on
`isNativeApp() && aiBackend === 'localLiteRt' && visionAvailable`. This is the generic path and
should ship before the importer — it exercises every layer end to end with a trivial UI.

**13. Team import.** A "Import from screenshot" entry point that composes the same message with
a task-specific instruction telling the model to read the image and use the existing team tools.
The instruction belongs in `systemPrompt.ts` as a new `buildSystemPrompt` option (e.g.
`includeImageImport`), keeping all prompt text in one file. No new tools. Then the honest work:
prompt iteration against real screenshots until extraction is reliable, and a UI that shows what
the model wrote so a wrong read is visible and correctable.

**14. Settings + docs.** Surface `visionAvailable` in the Settings AI section so a user who
imported the text bundle understands why there is no attach button. Add a VL section to
`docs/local-llm-verification.md`.

## Files

- `android/.../LocalLlmService.kt` — engine load (step 8), content-part parsing (9), status
- `android/.../LocalLlmPlugin.kt` — `visionAvailable` in `statusToJSObject`
- `android/app/src/main/AndroidManifest.xml` — `CAMERA`
- `src/lib/llm/types.ts` — `ContentPart`, widened `ChatMessage.content`, `contentToText`
- `src/lib/llm/localLlamaCpp.ts` — `toWireMessage` passthrough
- `src/lib/llm/ollamaCloud.ts` — reject array content
- `src/lib/llm/systemPrompt.ts` — `includeImageImport` guidance
- `src/lib/native/localLlm.ts` — `visionAvailable` on `LocalLlmServerStatus`
- `src/lib/native/imagePicker.ts` — new
- `src/components/ai/ChatPanel.tsx` — attachment state, attach control, thumbnail
- `src/pages/SettingsPage.tsx` — vision status
- `package.json` — `@capacitor/camera`

## Verification

Each step is independently checkable; do not batch.

1. **Step 8, on device.** Import the VL bundle, start the server, confirm `ready` with
   `visionAvailable: true` and which backend won. Then the text bundle → `visionAvailable: false`.
   Watch logcat for the no-vision retry firing on the text bundle rather than failing the load.
2. **Steps 9–10, without UI.** Drive `chatOnce` from the console with a hand-built content-part
   message and a small test image. Confirms transport before any picker exists.
3. **Step 11.** Camera and gallery both return base64; denying the permission leaves the app in
   a sane state.
4. **Step 12, end to end.** Attach a photo, ask "what is in this image", confirm a sensible
   streamed answer. Then attach with the text bundle loaded and confirm the control is hidden.
5. **Step 13, the real test.** A corpus of ~10 real screenshots — Showdown exports, team preview
   screens, a photographed screen, a deliberately bad one (blurry, cropped, partial). For each:
   does the model call `create_team`/`add_pokemon`, does `validate_team` pass, and does the
   resulting team match the image? Count exact matches, not "looks plausible". A wrong species
   silently written into a team is the failure mode that matters.
6. **Regression.** With `aiBackend: 'ollamaCloud'`, chat still works and no image control
   appears. With `localLlamaCpp` and a GGUF model, unchanged.
7. `npm run lint` / `tsc` clean; existing tests pass.

## Risks

- **Extraction accuracy is the whole feature and cannot be planned, only measured.** A 4-bit
  quantised E4B reading small text in a compressed screenshot may be poor. Step 5 of
  verification is the go/no-go — if exact-match rate is low, the fallback is presenting
  extraction as a *draft* the user confirms field by field, which is a different UI. Budget for
  finding this out.
- **Memory.** Vision adds an executor and image tokens to the KV cache on top of 4.03 GB of
  weights. `Conversation.getTokenCount()` (adapter plan §6) is the instrument; `maxNumTokens`
  is the lever. The `onTrimMemory` unload from step 7 matters more here than on the text path.
- **Prefill latency.** An image is worth a lot of tokens, and each turn re-prefills the whole
  history under the one-conversation-per-request model (§4.2). A multi-turn correction
  conversation carrying a screenshot may be slow enough to need the image dropped from history
  after the first turn.
- **`@capacitor/camera` permission behaviour** varies by version and API level — verify on real
  hardware, don't infer from docs.
