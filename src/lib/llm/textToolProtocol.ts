import type { ToolCall, ToolDefinition, ToolParameterSchema } from './types';
import { ALL_TOOLS } from './tools';

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
 *  text shown to the user. */
interface ParsedBlock {
  call: ToolCall;
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
 *
 * It had learned the tag from the prompt but not the JSON body. A strict parser
 * scored that as "no calls", let the raw tags leak into the transcript, and the
 * model then narrated a success that never happened. Every shape below is one a
 * small model actually reaches for, so each is accepted and normalised rather
 * than discarded — a recovered call with missing arguments still reaches the
 * validator, whose rejection the model can act on, which is strictly better than
 * silence.
 *
 * The tool name is checked against the real registry, so `void` and other
 * hallucinated tokens are dropped instead of becoming phantom calls.
 */
function extractBlocks(content: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const patterns = [
    // Opening tag through any plausible close: the documented </tool_call>, a
    // truncated </tool>, or the next opening tag / end of string when the model
    // never closed it at all.
    /<tool_call>\s*([\s\S]*?)\s*(?:<\/tool_call>|<\/tool>|(?=<tool_call>)|$)/g,
    // A fenced block whose body looks like a call — tolerated, not advertised.
    /```(?:json)?\s*(\{[\s\S]*?"name"[\s\S]*?\})\s*```/g,
  ];
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      const call = toToolCall(match[1]);
      if (call) blocks.push({ call, start: match.index, end: match.index + match[0].length });
    }
  }
  blocks.sort((a, b) => a.start - b.start);
  const kept: ParsedBlock[] = [];
  for (const block of blocks) {
    if (kept.every((k) => block.start >= k.end || block.end <= k.start)) kept.push(block);
  }
  return kept;
}

/** Real tool names, so a hallucinated token never becomes a phantom call. */
const KNOWN_TOOL_NAMES = new Set(ALL_TOOLS.map((t) => t.name));

/** First balanced {...} run in a string, or null. Avoids a greedy match
 *  swallowing trailing prose after the arguments object. */
function firstJsonObject(text: string): string | null {
  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) return text.slice(start, i + 1);
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
      if (typeof parsed.name === 'string' && KNOWN_TOOL_NAMES.has(parsed.name)) {
        return { name: parsed.name, arguments: asArgs(parsed.arguments ?? parsed.parameters ?? parsed.args) };
      }
      // {"create_team": {...}}
      const keys = Object.keys(parsed);
      if (keys.length === 1 && KNOWN_TOOL_NAMES.has(keys[0])) {
        return { name: keys[0], arguments: asArgs(parsed[keys[0]]) };
      }
    } catch {
      // fall through to the bare-name forms
    }
    return null;
  }

  // Leading identifier, optionally followed by an arguments object.
  const named = /^([a-z_][a-z0-9_]*)\s*\(?\s*([\s\S]*)$/i.exec(text);
  if (!named) return null;
  const [, name, rest] = named;
  if (!KNOWN_TOOL_NAMES.has(name)) return null;

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
    calls: blocks.map((b) => b.call),
    cleanedContent: cleaned.replace(/\n{3,}/g, '\n\n').trim(),
  };
}

/** True when the reply contains at least one recoverable call. */
export function hasTextToolCalls(content: string): boolean {
  return extractBlocks(content).length > 0;
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
  return content.indexOf(CLOSE_TAG, lastOpen) === -1;
}
