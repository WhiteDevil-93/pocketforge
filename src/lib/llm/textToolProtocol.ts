import type { ToolCall, ToolDefinition, ToolParameterSchema } from './types';
import { ALL_TOOLS } from './tools';
import { WRITE_TOOLS } from './writeTools';

/**
 * A text-based tool-calling protocol for on-device models that can't emit native
 * function calls.
 *
 * Small fine-tunes routinely lose native tool-calling: a QLoRA that never saw
 * function-call examples during training will happily discuss calling a tool while
 * never emitting one, and the observable result is a model that narrates ("the
 * system has recorded your team") instead of acting. Worse, declaring tools to such
 * a model is not free — the schemas are injected into its prompt in the backend's
 * native tool format, which a model that doesn't understand that format has to make
 * sense of anyway.
 *
 * So this protocol does the opposite of the native path: it declares NO tools to the
 * backend and instead teaches the format in plain prose in the system prompt, then
 * recovers calls by parsing the model's own text output. Following an output template
 * is a far weaker requirement than native function calling, and is the last capability
 * a degraded instruct-tune tends to lose.
 *
 * Deliberately NOT the default — a local model that does support native calls is
 * better served by them (real token-level formatting, no parser to fool). Gated behind
 * AppSettings.localToolProtocol so the two can be compared on the same device.
 */

/** Opening marker. Chosen to be unlikely in ordinary prose and easy for a small model
 *  to reproduce exactly — angle-bracket tags appear throughout instruct-tuning data. */
const OPEN_TAG = '<tool_call>';
const CLOSE_TAG = '</tool_call>';
// Every terminator extractBlocks treats as ending a block, besides CLOSE_TAG
// itself: the observed on-device failure was the model closing with `</tool>`
// (the tag learned, the exact spelling not) instead of CLOSE_TAG. Shared here —
// rather than hard-coded separately in extractBlocks' regex and
// isInsideToolCallBlock — precisely because that duplication is what let the
// two drift apart the first time: extractBlocks was widened to accept `</tool>`
// without isInsideToolCallBlock learning about it, so a block closed that way
// parsed correctly but streaming stayed suppressed for the rest of the turn.
const CLOSE_MARKERS = [CLOSE_TAG, '</tool>'];

/** Renders one parameter as `name: type` (marking optionals), compact enough that the
 *  whole catalog stays affordable in a small model's context window. Full JSON Schema
 *  per tool would cost several thousand tokens and crowd out the conversation. */
function renderParams(schema: ToolParameterSchema): string {
  const required = new Set(schema.required ?? []);
  return Object.entries(schema.properties)
    .map(([name, spec]) => (required.has(name) ? `${name}: ${spec.type}` : `${name}?: ${spec.type}`))
    .join(', ');
}

/**
 * Renders the tool catalog as prose for the system prompt, plus the exact output
 * format the model must produce. Descriptions are kept because they carry the
 * "when to use this" signal that a bare signature doesn't.
 */
export function buildTextToolCatalog(tools: ToolDefinition[]): string {
  const lines = tools.map((tool) => `- ${tool.name}(${renderParams(tool.parameters)}) — ${tool.description}`);
  // Worked examples, not just a spec. A degraded instruct-tune reproduces a
  // concrete exchange far more reliably than it follows an abstract description
  // — the observed failure was emitting `<tool_call>create_team</tool_call>`,
  // the tag learned but the body missing, so the body is shown filled in every
  // time it appears below.
  return `You do not have native function calling. To use a tool you WRITE the call as \
text. Copy this shape exactly — the tags, then a JSON object with "name" and "arguments":

${OPEN_TAG}{"name": "create_team", "arguments": {"name": "Tsareena Balance"}}${CLOSE_TAG}

Worked example — the user says "build me a team around Tsareena":

You write:
${OPEN_TAG}{"name": "create_team", "arguments": {"name": "Tsareena Balance"}}${CLOSE_TAG}

You then STOP. The result arrives as a new message. You then write:
${OPEN_TAG}{"name": "get_legal_moves", "arguments": {"species": "Tsareena"}}${CLOSE_TAG}

You STOP again, read the legal moves, and only then write:
${OPEN_TAG}{"name": "add_pokemon", "arguments": {"species": "Tsareena", "moves": ["Power Whip", "Triple Axel", "U-turn", "Helping Hand"], "level": 50}}${CLOSE_TAG}

You repeat that for all six Pokemon, then call validate_team. Do the whole job — do \
not stop after one call to ask the user what to do next.

Rules:
- ALWAYS include the "arguments" object. ${OPEN_TAG}create_team${CLOSE_TAG} with no \
arguments does nothing — it will be rejected.
- NEVER write a result yourself. Do not write "Successfully created..." or \
"Team setup complete". You have not created anything until a result message comes back \
to you. If you did not emit a ${OPEN_TAG} block, nothing happened.
- If a call is rejected, read the error, fix the arguments, and call it again. A \
rejection tells you exactly what was wrong.
- Never invent species, moves, or abilities. Call get_legal_moves and lookup_pokemon \
and use what they return.

Available tools:
${lines.join('\n')}`;
}

/** One parsed block plus the span it occupied, so the caller can strip it from the
 *  text shown to the user.
 *
 *  [call] is null for a block that opened with the real ${OPEN_TAG} tag but whose
 *  name resolves to no tool. That span is still stripped — protocol syntax must
 *  never reach the transcript — but it produces no call, so an invented name
 *  never becomes a phantom one. */
interface ParsedBlock {
  call: ToolCall | null;
  start: number;
  end: number;
}

/**
 * Recovers call blocks from a reply.
 *
 * Deliberately permissive, because an observed degraded fine-tune emits:
 *
 *     <tool_call>create_team</tool_call>          bare name, no arguments
 *     <tool_call>void</tool>                      garbage, malformed close tag
 *     <tool_call>add_to_friendship_list</tool>     hallucinated tool name
 *
 * It had learned the tag from the prompt but not which names or bodies are real.
 * Every shape above is one a small model actually reaches for, so each is
 * accepted and normalised rather than discarded — a recovered call with missing
 * arguments still reaches the validator, whose rejection the model can act on,
 * which is strictly better than silence.
 *
 * Names are resolved against the real registry with a conservative nearest-match
 * (see resolveToolName), so a fumbled `get_active_info` becomes `get_active_team`
 * while an invented `add_to_friendship_list` still resolves to nothing and never
 * becomes a phantom call.
 *
 * An unresolved block is nonetheless STRIPPED when it was delimited by the real
 * ${OPEN_TAG} tag. Leaving those in place is what put raw
 * `<tool_call>add_to_friendship_list</tool>` in front of the user in the
 * transcript. Whether a name resolves is a question about tool dispatch; whether
 * protocol syntax is shown to the user is a separate one, and its answer is
 * always no. A fenced ```json block is a weaker signal — it may be ordinary
 * content worth reading — so that pattern is left alone unless it really parses
 * as a call.
 */
function extractBlocks(content: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  // Opening tag through any plausible close (CLOSE_MARKERS), or the next opening
  // tag / end of string when the model never closed it at all.
  const closeAlternation = CLOSE_MARKERS.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const patterns: Array<{ regex: RegExp; stripWhenUnresolved: boolean }> = [
    {
      regex: new RegExp(`${OPEN_TAG}\\s*([\\s\\S]*?)\\s*(?:${closeAlternation}|(?=${OPEN_TAG})|$)`, 'g'),
      stripWhenUnresolved: true,
    },
    // A fenced block whose body looks like a call — tolerated, not advertised.
    { regex: /```(?:json)?\s*(\{[\s\S]*?"name"[\s\S]*?\})\s*```/g, stripWhenUnresolved: false },
  ];
  for (const { regex, stripWhenUnresolved } of patterns) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      const call = toToolCall(match[1]);
      if (!call && !stripWhenUnresolved) continue;
      blocks.push({ call, start: match.index, end: match.index + match[0].length });
    }
  }
  blocks.sort((a, b) => a.start - b.start);
  const kept: ParsedBlock[] = [];
  for (const block of blocks) {
    if (kept.every((k) => block.start >= k.end || block.end <= k.start)) kept.push(block);
  }
  return kept;
}

/** Lowercase name → canonical registry name, so a hallucinated token never
 *  becomes a phantom call. Keyed lowercase because the bare-name regex below
 *  matches case-insensitively (a small model reproduces `Create_Team` or
 *  `CREATE_TEAM` as readily as `create_team`) — a case-sensitive Set.has()
 *  here would silently drop every call whose case the model got wrong. */
const TOOL_NAME_BY_LOWERCASE = new Map(ALL_TOOLS.map((t) => [t.name.toLowerCase(), t.name]));

/** Levenshtein distance, iterative single-row. Only ever run against the ~14-name
 *  tool registry on a name the exact lookup already missed, so the O(n·m) cost is
 *  irrelevant here. */
function editDistance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

/** Max share of the written name that may differ from the tool it resolves to.
 *  Observed on-device: `get_active_info` for `get_active_team` — 4 edits over 15
 *  characters (0.27). Pure hallucinations sat far outside it in the same
 *  transcript (`add_to_friendship_list` at 0.73, `void` at 2.25), so this cleanly
 *  separates a fumbled name from an invented one. */
const FUZZY_MAX_RATIO = 0.4;
/** How much better the winner must be than the runner-up. Several real tools are
 *  only 3-5 edits apart (web_search/web_fetch, update_pokemon/remove_pokemon), so
 *  a distance threshold ALONE could silently resolve to the wrong tool and edit
 *  the user's team in a way they never asked for. When two candidates are close,
 *  guessing is worse than reporting an unknown tool, so this bails instead. */
const FUZZY_MIN_MARGIN = 2;

/** Tools that mutate the user's team. Never reached by fuzzy matching — see
 *  resolveToolName. */
const MUTATING_TOOL_NAMES = new Set(WRITE_TOOLS.map((t) => t.name.toLowerCase()));

/**
 * Resolves any-case tool name text to its canonical registry name, or null.
 *
 * Falls back to a nearest-match when the exact lookup misses, because a degraded
 * fine-tune reproduces a name approximately even with the real catalog in front
 * of it — recovering `get_active_team` from `get_active_info` turns a dead turn
 * into a real call.
 *
 * That fallback is restricted to READ-ONLY tools. Lexical distance does not
 * preserve meaning: `remove_team` is 4 edits from `create_team` over 11
 * characters with its runner-up 6 away, so it clears both the ratio and the
 * margin — and a model trying to remove a team would have silently created and
 * activated one instead. The margin rule only rules out ambiguity between two
 * candidates; it cannot tell that two names mean opposite things. Since a wrong
 * guess here edits the user's data, a fumbled write name is dropped instead: the
 * model gets no call rather than the wrong one, which is recoverable. Reads
 * carry no such cost, and the one failure actually observed on-device
 * (`get_active_info`) is a read.
 */
function resolveToolName(name: string): string | null {
  const lowered = name.toLowerCase();
  const exact = TOOL_NAME_BY_LOWERCASE.get(lowered);
  if (exact) return exact;

  let best: { name: string; distance: number } | null = null;
  let runnerUp = Infinity;
  for (const [candidateLower, canonical] of TOOL_NAME_BY_LOWERCASE) {
    // A write tool is only ever reachable by an exact name, checked above.
    if (MUTATING_TOOL_NAMES.has(candidateLower)) continue;
    const distance = editDistance(lowered, candidateLower);
    if (!best || distance < best.distance) {
      if (best) runnerUp = best.distance;
      best = { name: canonical, distance };
    } else if (distance < runnerUp) {
      runnerUp = distance;
    }
  }
  if (!best) return null;
  if (best.distance > lowered.length * FUZZY_MAX_RATIO) return null;
  if (runnerUp - best.distance < FUZZY_MIN_MARGIN) return null;
  return best.name;
}

/** First balanced {...} run in a string, or null. Avoids a greedy match
 *  swallowing trailing prose after the arguments object.
 *
 *  Tracks whether it is inside a JSON string literal so a brace inside a value —
 *  a team named "Team }{" — doesn't unbalance the count and truncate the object
 *  early. Backslash-escapes the scanner past an escaped quote inside a string. */
function firstJsonObject(text: string): string | null {
  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return text.slice(start, i + 1);
  }
  return null;
}

function asArgs(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/**
 * Normalises one block body into a call, accepting every shape observed or
 * plausible:
 *   {"name":"create_team","arguments":{...}}   the documented form
 *   {"create_team":{...}}                      name-as-key
 *   create_team                                bare name
 *   create_team {"name":"X"}                   name then arguments
 *   create_team({"name":"X"})                  call syntax
 * Returns null for anything whose name is not a real tool.
 */
function toToolCall(raw: string): ToolCall | null {
  const text = raw.trim();
  if (!text) return null;

  // JSON-object forms first — the documented shape and its name-as-key variant.
  const objectText = text.startsWith('{') ? firstJsonObject(text) : null;
  if (objectText) {
    try {
      const parsed = JSON.parse(objectText) as Record<string, unknown>;
      if (typeof parsed.name === 'string') {
        const resolved = resolveToolName(parsed.name);
        if (resolved) {
          return { name: resolved, arguments: asArgs(parsed.arguments ?? parsed.parameters ?? parsed.args) };
        }
      }
      // {"create_team": {...}}
      const keys = Object.keys(parsed);
      if (keys.length === 1) {
        const resolved = resolveToolName(keys[0]);
        if (resolved) return { name: resolved, arguments: asArgs(parsed[keys[0]]) };
      }
    } catch {
      // fall through to the bare-name forms
    }
    return null;
  }

  // Leading identifier, optionally followed by an arguments object.
  const named = /^([a-z_][a-z0-9_]*)\s*\(?\s*([\s\S]*)$/i.exec(text);
  if (!named) return null;
  const [, rawName, rest] = named;
  const name = resolveToolName(rawName);
  if (!name) return null;

  const argText = firstJsonObject(rest);
  if (!argText) return { name, arguments: {} };
  try {
    const parsed = JSON.parse(argText) as Record<string, unknown>;
    // `create_team {"arguments":{...}}` nests; `create_team {"name":"X"}` does not.
    const nested = parsed.arguments ?? parsed.parameters ?? parsed.args;
    return { name, arguments: nested !== undefined ? asArgs(nested) : asArgs(parsed) };
  } catch {
    return { name, arguments: {} };
  }
}

/**
 * Pulls tool calls out of a model's text reply.
 *
 * @returns the recovered calls and the reply with those blocks removed — the user
 *   should never see the raw call syntax, the same way a native call never appears
 *   in the transcript. Whitespace left behind by removal is collapsed so stripping a
 *   call doesn't leave a ragged gap mid-sentence.
 */
export function parseTextToolCalls(content: string): { calls: ToolCall[]; cleanedContent: string } {
  const blocks = extractBlocks(content);
  if (blocks.length === 0) return { calls: [], cleanedContent: content };

  let cleaned = '';
  let cursor = 0;
  for (const block of blocks) {
    cleaned += content.slice(cursor, block.start);
    cursor = block.end;
  }
  cleaned += content.slice(cursor);

  return {
    // Null-call blocks were stripped above but contribute no call — an invented
    // name must not become a phantom one.
    calls: blocks.map((b) => b.call).filter((c): c is ToolCall => c !== null),
    cleanedContent: cleaned.replace(/\n{3,}/g, '\n\n').trim(),
  };
}

/** True when the reply contains at least one recoverable call. Blocks whose name
 *  resolved to nothing don't count — they are stripped from the transcript, but
 *  there is no call to make. */
export function hasTextToolCalls(content: string): boolean {
  return extractBlocks(content).some((b) => b.call !== null);
}

/**
 * True when [content] — a partially-streamed reply — currently sits inside an
 * unclosed call block, so the caller should hold the token back rather than paint
 * half-written JSON into the transcript. A native tool call never appears in the
 * transcript; a text one shouldn't either.
 *
 * The opening tag itself streams in before this can trip (it is only recognizable
 * once complete), so a few characters of `<tool_call>` may still flash by. The final
 * message is always the cleaned text, so nothing survives the turn.
 */
export function isInsideToolCallBlock(content: string): boolean {
  const lastOpen = content.lastIndexOf(OPEN_TAG);
  if (lastOpen === -1) return false;
  const searchFrom = lastOpen + OPEN_TAG.length;
  // Terminated by any marker extractBlocks accepts (CLOSE_MARKERS), or by a
  // later opening tag — extractBlocks treats that as implicitly closing the
  // previous block too (the (?=OPEN_TAG) lookahead in its pattern).
  if (CLOSE_MARKERS.some((marker) => content.indexOf(marker, searchFrom) !== -1)) return false;
  return content.indexOf(OPEN_TAG, searchFrom) === -1;
}
