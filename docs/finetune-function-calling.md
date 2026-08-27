# Restoring function calling in a PocketForge fine-tune

`vgc_e4b_v5_heretic` answers fluently and never calls a tool. It will state that
a team was created while the builder stays empty. This document covers why, and
how to retrain so the capability comes back without losing the VGC knowledge the
tune already carries.

## Why it happens

A QLoRA does not add knowledge to a frozen model — it shifts weights. Train on
narrow data (VGC prose) with no function-call examples in the mix and the
behaviour that was never reinforced decays. Tool calling is unusually fragile to
this because it is a *format* behaviour: the model must emit precise structured
tokens rather than plausible text, and plausible text is exactly what the
training data rewarded.

Two things confirm the diagnosis rather than assuming it:

- **The app side is verified correct.** `PassthroughTool.getToolDescriptionJsonString()`
  returns `{"name", "description", "parameters"}`, which is exactly the shape
  LiteRT-LM's `OpenApiTool` documents. `automaticToolCalling = false` and reading
  `message.toolCalls` both match the reference API. The gallery's `mobileactions`
  module does function calling with stock Gemma on this same stack, so the
  capability exists in the runtime.
- **The model emits no call syntax at all.** A call that LiteRT-LM received but
  failed to parse would leak its raw syntax into the message content and appear
  in the transcript. Nothing does. The model is not producing malformed calls —
  it is producing none.

There is a second, independent failure worth knowing about because it masked
this one: `championsLegality`'s roster Sets were built once at module load,
before the regulation cache was populated, so every Champions eligibility check
returned false and `add_pokemon` rejected every species. Fixed separately (the
Sets now rebuild lazily against a cache version). Both had to be true for the
builder to stay empty; fixing only one would not have been enough.

## Generating the dataset

```bash
npm run generate-training-data          # → training-data/{train,eval}.jsonl
```

The generator does not write examples by hand. It **executes the app's real tool
handlers** against the real store and records what actually happened, so:

- arguments are legal (moves come from the same movepool the validator checks),
- results are byte-identical to what the model sees at inference time,
- a rejection in the data is a rejection the validator genuinely produced.

Hand-written examples drift from the app the moment either changes, and worse,
teach movesets that do not exist — the exact failure being trained out. Re-run
the generator whenever the tools or the regulation data change.

Current output: ~94 conversations, ~660 tool calls, all 12 non-web tools covered.

### What is in it, and why

| Shape | Why it is there |
|---|---|
| Full six-Pokemon builds | The long dependent chain — `create_team` → per member `lookup_pokemon` → `get_legal_moves` → `add_pokemon` → `validate_team`. This is the behaviour that was lost, so it is the best-represented shape. |
| Self-correction | An `add_pokemon` the validator genuinely rejects, then the lookup, then a successful retry. Teaches that a rejection is information to act on, not a reason to apologise and stop. |
| Single read calls | One per tool, so no tool is absent. |
| Editing | `update_pokemon` / `remove_pokemon`, each preceded by `get_active_team`. |
| Plain chat, no tools | Without these the model learns "always call something" and fires `create_team` at "hello". Over-triggering is as broken as never calling. |

## Format

Output is OpenAI-shaped messages JSONL:

```jsonc
{"messages":[
  {"role":"system","content":"..."},
  {"role":"user","content":"Build me a VGC team around Garchomp."},
  {"role":"assistant","content":"","tool_calls":[
    {"id":"call_1","type":"function","function":{"name":"create_team","arguments":"{\"name\":\"VGC Core 1\"}"}}]},
  {"role":"tool","tool_call_id":"call_1","name":"create_team","content":"{\"ok\":true,...}"},
  {"role":"assistant","content":"Built the team..."}
]}
```

It is deliberately **not** pre-rendered into Gemma's tool tags. Every training
stack (TRL, Unsloth, axolotl) applies the target model's own chat template, which
is what converts this into the native format. Baking one in here would hard-code
a format this repo cannot verify and make the data unusable for any other base
model.

> If your training stack does **not** apply a chat template with tool support,
> render these messages with the template shipped alongside the base Gemma 4
> checkpoint rather than writing tags by hand.

## Training notes

- **Mix ratio matters more than volume.** Function-call data should be a
  meaningful minority of the run alongside your existing VGC data — commonly
  cited around 10–30%. Train on this set alone and you will trade the VGC
  knowledge for tool calling, which is the same problem in the other direction.
  Tune empirically against `eval.jsonl`.
- **Multi-turn is the point.** Single-call examples teach format; only examples
  where the assistant calls a tool, reads the result, and calls the next based on
  it teach chaining. A six-Pokemon build is ~20 dependent calls.
- **Keep the system prompt identical** to `buildSystemPrompt({ includeWebTools: false })`.
  The generator embeds the real one; if the app's prompt changes, regenerate
  rather than letting training and inference diverge.
- **Mask loss to assistant turns only** (standard for chat SFT) so the model is
  not trained to reproduce tool result JSON.

## Verifying it worked

1. `npm run generate-training-data` and confirm the summary reports 12 tools.
2. After training, load the model on-device and ask
   *"Build me a VGC doubles team with Tsareena as the focal point."*
3. Success is the builder filling in and tool pills appearing in the transcript.
4. Partial success — `tool_calls` emitted but arguments rejected — is still
   progress: the format landed, and `writeTools`' rejection messages are written
   to be self-correcting in-turn. That is what the self-correction examples train.

## If retraining is not an option

Settings → AI Assistant → **Text-based tool calls** switches the on-device path
to a prompt-taught format parsed out of the reply (`src/lib/llm/textToolProtocol.ts`).
It asks strictly less of the model than native function calling. It does not
help with chaining if the model cannot track turn state — the failing transcript
showed it fabricating the user's own messages, which is a prerequisite failure
that no output format fixes.
