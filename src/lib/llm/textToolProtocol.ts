import type { ToolCall, ToolDefinition, ToolParameterSchema } from './types';

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
  return `You do not have native function calling. To use a tool you must WRITE the call \
as text, in exactly this format, on its own line:

${OPEN_TAG}{"name": "tool_name", "arguments": {"key": "value"}}${CLOSE_TAG}

Rules for tool calls:
- Emit the tags exactly as shown. The JSON between them must be valid JSON on a single line.
- You may emit several calls in one reply, each in its own ${OPEN_TAG} block.
- After you emit calls, STOP and wait. The results come back as a new message; only \
then continue.
- Never describe a call you did not emit, and never claim a tool succeeded before you \
have seen its result. If you did not emit a ${OPEN_TAG} block, nothing happened.

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

/** Accepts the documented tagged form, and also a bare ```json fence or naked object,
 *  because a small model will drift from the template it was given — recovering a
 *  well-formed call in the wrong wrapper is strictly better than dropping it. */
function extractBlocks(content: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const patterns = [
    // The documented form.
    new RegExp(`${OPEN_TAG}\\s*([\\s\\S]*?)\\s*${CLOSE_TAG}`, 'g'),
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
  // A tagged block can also match the fence pattern; keep the earliest-starting,
  // and drop anything overlapping one already accepted.
  blocks.sort((a, b) => a.start - b.start);
  const kept: ParsedBlock[] = [];
  for (const block of blocks) {
    if (kept.every((k) => block.start >= k.end || block.end <= k.start)) kept.push(block);
  }
  return kept;
}

/** Validates the JSON body is actually a call. Anything else — prose, a schema the
 *  model echoed back, a half-written object — is not a call and is left as text. */
function toToolCall(raw: string): ToolCall | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.trim());
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
  const record = parsed as Record<string, unknown>;
  const name = record.name;
  if (typeof name !== 'string' || name.length === 0) return null;
  const args = record.arguments;
  return {
    name,
    arguments:
      typeof args === 'object' && args !== null && !Array.isArray(args)
        ? (args as Record<string, unknown>)
        : {},
  };
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
