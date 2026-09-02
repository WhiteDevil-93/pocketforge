# Producing a `.litertlm` bundle PocketForge can load

PocketForge never converts models. It imports a finished `.litertlm` (or `.gguf`) file through
the SAF picker and hands the path to LiteRT-LM. That makes the export step someone else's job —
but the export flags are not free choices, and three of them fail *inside our app*, at runtime,
with errors that point nowhere near the real cause. This documents the flags and what breaks
without them.

The conversion tool is `litert-torch`. `docs/finetune-function-calling.md` deliberately declines
to bake a conversion step into the training pipeline (it would hard-code a toolchain version into
a notebook); this file is where that decision's missing half lives.

```bash
uv tool install litert-torch-nightly

litert-torch export_hf \
  --model=google/gemma-4-E4B-it \
  --output_dir=/tmp/gemma4_e4b \
  --quantize dynamic_wi4_afp32 \
  --externalize_embedder \
  --task image_text_to_text \
  --jinja_chat_template_override=litert-community/gemma-4-E4B-it-litert-lm
```

---

## Why each flag is mandatory

### `--externalize_embedder`

Gemma 4's Per-Layer Embeddings put **more than half the checkpoint into lookup tables** — 2.8B
embedding parameters against 2.3B active layer parameters in E2B. Without this flag the export
packs them into the main graph as constant tensors, and the runtime allocates physical DRAM for
the whole thing.

With it, the export emits three artifacts — `model_quantized.tflite` (attention, FFN, norms),
`embedder_quantized.tflite`, and `per_layer_embedder_quantized.tflite` — bundled into the one
`.litertlm` container. At load, LiteRT-LM allocates hardware buffers only for the Transformer
graph and `mmap`s the embedder files. Token lookup is sparse — one row of `L × d_ple` per decoded
token — so the kernel demand-pages 4KB/16KB blocks on a minor fault and drops those clean,
read-only pages first under pressure.

That is the difference between ~790 MB of resident decoder weights plus a lazily-mapped 1.12 GB
table, and a single allocation the OOM killer terminates. **Failure mode: the app is killed by
the low-memory killer during model load, on mid-tier devices, with no exception to catch.**

### `--task image_text_to_text`

Use this **even for a text-only fine-tune.** Exporting with `--task text_generation` produces a
graph whose input signatures omit the multimodal embedding placeholders. The bundle loads
without complaint and then emits corrupted tokens, or segfaults during prefill.

Our loader makes this worse rather than better: `LiteRtLmEngine.load` tries each backend with
`visionBackend` set and retries the *same* backend without it, so a graph with missing
placeholders can still land on the no-vision retry and report a successful load. **Failure mode:
`visionAvailable` reads false on a model you know has vision, or generation returns garbage.**

### `--jinja_chat_template_override`

Hugging Face's stock Gemma 4 templates use Jinja filters — `.map()`, `.get()` — that LiteRT-LM's
lightweight C++ regex-based Jinja parser does not implement. The failure is not at load; it is on
the **first message dispatch**, as an uncaught exception.

Point this at the matching `litert-community/...-litert-lm` repo for the variant you are
exporting. In our stack the exception surfaces through `LocalLlmService`'s catch as a generic
"LiteRT-LM generation failed", which tells you nothing about templates.

### Export all three artifacts in one invocation

The base embedder, the per-layer embedder, and the Transformer graph must come from a **single**
`export_hf` call. Splicing a stock embedder alongside a custom-LoRA graph produces tensor-shape
and quantization-scale mismatches that surface at the `embedding_lookup::EvalHybrid` interface,
deep in native code, long after load.

---

## Quantization

`dynamic_wi4_afp32` — INT4 weights, dynamic FP32 activations — is the standard mobile profile.
Attention and FFN projections go to 4-bit symmetric integers with group-wise scaling; embedding
tables stay at 8-bit (`dynamic_wi8_afp32`) or packed low-bit indices, because lexical fidelity
degrades faster than layer weights do. Vision and audio encoders stay dormant on disk and load
only when a payload of that type arrives.

## Speculative decoding

If the bundle carries a drafter model, decode gets substantially faster for free — Google reports
up to 2.2x on mobile GPU. `LiteRtLmEngine` probes for one with `Capabilities.hasSpeculativeDecodingSupport()`
and enables `ExperimentalFlags.enableSpeculativeDecoding` only on the NPU and GPU backends, so a
bundle without a drafter is simply left alone. Nothing needs configuring on our side; it is worth
checking that your export includes one.

## Verifying a bundle before shipping it

The failure modes above are all silent-ish, so check in this order:

1. **Import it.** A load that survives is not proof — but a load that OOMs or crashes the process
   points at `--externalize_embedder`.
2. **Send one message.** An immediate generation failure on the *first* dispatch, with the model
   otherwise loaded, is the Jinja template.
3. **Check the reported backend and vision flag** in Settings. `visionAvailable` false on a
   vision bundle points at `--task`.
4. **Ask for a tool call.** Garbage arguments or misshapen calls that survive constrained decoding
   point at a spliced embedder.
