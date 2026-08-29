// ============================================================================
// PocketForge — On-device llama.cpp chat client
//
// Mirrors ollamaCloud.ts' multi-turn tool-calling loop almost line-for-line
// (same MAX_TOOL_ITERATIONS bound, same accumulate/branch/append-tool-message
// shape), but each model turn is ONE call to the native LocalLlm.chatOnce
// bridge — a non-blocking HTTP+SSE round-trip against the local llama-server on
// 127.0.0.1. TypeScript keeps owning the loop and every tool execution: the
// model never computes numbers, the app's calculators do.
//
// The local backend has no API key and no model selector — exactly one imported
// model exists, served by LocalLlmService — so the options are just
// { history, ctx, onEvent, signal }.
// ============================================================================

import type { ChatMessage, ContentPart, LlmStreamEvent, ToolCall, ToolContext } from './types';
import { toLocalToolSchema } from './tools';
import { isInsideToolCallBlock, parseTextToolCalls } from './textToolProtocol';
import { runToolCall } from './toolRunner';
import type { ChatOnceEvent, ChatOnceResult } from '../native/localLlm';

// Allow enough iterations for prescribed workflow: create_team, 6 members with
// get_legal_moves/lookup_pokemon/add_pokemon per member, validate_team, and corrections
const MAX_TOOL_ITERATIONS = 60;
// Per-model-turn ceiling, re-armed at the start of every loop iteration so a single
// slow on-device generation gets the full budget the native layer grants it
// (LiteRtLmEngine.GENERATION_TIMEOUT_MS = 300_000) instead of a single timer spanning
// the whole multi-turn conversation.
const TURN_TIMEOUT_MS = 300_000;

// ---- OpenAI wire format (what the local llama-server speaks) ----------------

interface WireToolCall {
  id?: string;
  type: 'function';
  function: { name: string; arguments: string };
}

interface WireMessage {
  role: string;
  content: string | ContentPart[];
  tool_calls?: WireToolCall[];
  tool_call_id?: string;
}

/**
 * Converts a ChatMessage to the OpenAI chat wire shape used by llama-server.
 *
 * Unlike Ollama (which echoes tool arguments as objects and pairs tool results
 * with a `tool_name`), OpenAI streams a tool call's argument JSON as a STRING
 * and pairs a tool result with the assistant call's `tool_call_id`. The id
 * pairing walks the history in order: every assistant message that requested
 * tool calls pushes its call ids into [pendingToolCallIds], and each following
 * `role: 'tool'` message consumes the next one — tool results always directly
 * follow the assistant message that requested them, one result per call.
 *
 * The same history is re-sent every turn, so missing ids are synthesized
 * deterministically from the call's name + position — identical on every send.
 */
function toWireMessage(message: ChatMessage, pendingToolCallIds: string[]): WireMessage {
  const wire: WireMessage = { role: message.role, content: message.content };
  if (message.role === 'assistant' && message.toolCalls?.length) {
    wire.tool_calls = message.toolCalls.map((call, i) => {
      const id = call.id ?? `call_pf_${call.name}_${i}`;
      pendingToolCallIds.push(id);
      return {
        id,
        type: 'function',
        function: { name: call.name, arguments: JSON.stringify(call.arguments) },
      };
    });
  } else if (message.role === 'tool') {
    const id = pendingToolCallIds.shift();
    if (id) wire.tool_call_id = id;
  }
  return wire;
}

/** OpenAI streams tool-call arguments as one JSON string (in fragments). A malformed
 *  fragment (truncated stream, wrong template) yields {} rather than a crash — the
 *  tool handler will then report the missing parameters instead. */
function parseToolCallArguments(raw: string): Record<string, unknown> {
  if (!raw.trim()) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

// ---- Native bridge ----------------------------------------------------------

/**
 * Runs ONE model turn against the native LocalLlm.chatOnce bridge.
 *
 * Registers a chatOnceEvent listener (filtered by a per-call requestId so
 * concurrent turns can't cross-talk — e.g. a stopped request still finishing
 * while a new one streams), forwards OpenAI-shaped messages + the local tool
 * schema, and resolves with the native side's fully-assembled message.
 */
async function chatOnceBridge(
  messages: ChatMessage[],
  onEvent: (event: ChatOnceEvent) => void,
  declareTools: boolean,
  textToolProtocol: boolean,
): Promise<ChatOnceResult> {
  // Dynamically imported behind the isNativeApp() convention: the web/PWA build
  // must never pull the native plugin registration into the bundle.
  const { chatOnce, addChatOnceEventListener } = await import('../native/localLlm');
  const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const pendingToolCallIds: string[] = [];

  const handle = await addChatOnceEventListener((event) => {
    if (event.requestId === requestId) onEvent(event);
  });
  try {
    return await chatOnce({
      requestId,
      messages: messages.map((m) => toWireMessage(m, pendingToolCallIds)),
      // Empty under the text protocol: the schemas are taught in the system prompt
      // instead, and declaring them here too would hand the model two competing
      // call formats — the native one it can't produce, and the text one it can.
      tools: declareTools ? toLocalToolSchema() : [],
      // Tells the native side how to render prior assistant/tool turns when
      // re-sending history — see ChatOnceOptions.textToolProtocol.
      textToolProtocol,
    });
  } finally {
    await handle.remove();
  }
}

// ---- sendMessage ------------------------------------------------------------

export interface LocalSendMessageOptions {
  history: ChatMessage[];
  ctx: ToolContext;
  onEvent: (event: LlmStreamEvent) => void;
  signal?: AbortSignal;
  /** Recover tool calls by parsing the model's text instead of declaring tools to
   *  the backend — for a fine-tune that lost native function calling. The caller
   *  must pair this with buildSystemPrompt({ textToolProtocol: true }), which is
   *  what teaches the model the format; see textToolProtocol.ts. */
  textToolProtocol?: boolean;
}

/**
 * Sends the conversation to the on-device llama.cpp server, resolving any tool
 * calls the model makes against the real app calculators, and looping until it
 * returns a plain answer. Returns the full updated history
 * (user/assistant/tool turns appended).
 */
export async function sendMessage({
  history,
  ctx,
  onEvent,
  signal,
  textToolProtocol = false,
}: LocalSendMessageOptions): Promise<ChatMessage[]> {
  const controller = new AbortController();
  if (signal?.aborted) {
    // The 'abort' event only fires on the *transition* to aborted — if the caller's
    // signal was already tripped before we got here, listening for it would wait forever.
    controller.abort();
  }
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort);
  let turnTimeout: ReturnType<typeof setTimeout> | undefined;

  let messages = [...history];
  // No apiKey on the local backend — the web tools are excluded from the schema
  // and none of the remaining tools need outbound credentials.
  const toolCtx: ToolContext = { ...ctx, signal: controller.signal };

  try {
    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
      turnTimeout = setTimeout(() => controller.abort(), TURN_TIMEOUT_MS);

      let content = '';
      let thought = '';
      let toolCalls: ToolCall[] = [];
      // Index-keyed accumulation of the streamed tool_call deltas (the native side
      // accumulates the same deltas and returns the authoritative result on [DONE];
      // this local mirror both powers the loop shape and serves as a fallback).
      const deltaAccumulator: Array<{ id?: string; name: string; argumentsRaw: string }> = [];

      const assembled = await chatOnceBridge(messages, (event) => {
        // A user stop / per-turn timeout aborts the controller; the native request may
        // keep streaming for a moment — don't surface those late events as if live.
        if (controller.signal.aborted) return;
        if (event.type === 'token') {
          content += event.text;
          // Under the text protocol the call syntax arrives as ordinary tokens; hold
          // it back so half-written JSON never paints into the transcript.
          if (!textToolProtocol || !isInsideToolCallBlock(content)) {
            onEvent({ type: 'token', text: event.text });
          }
        } else if (event.type === 'thought') {
          thought += event.text;
          onEvent({ type: 'token', thought: event.text });
        } else if (event.type === 'toolCallDelta') {
          // ACCUMULATE BY INDEX: OpenAI streams a single tool call's name/argument
          // JSON across multiple chunks keyed by array position, so earlier calls in
          // the same turn would be lost if we replaced rather than appended.
          while (deltaAccumulator.length <= event.index) {
            deltaAccumulator.push({ name: '', argumentsRaw: '' });
          }
          const entry = deltaAccumulator[event.index];
          if (event.id) entry.id = event.id;
          if (event.name) entry.name += event.name;
          if (event.argumentsDelta) entry.argumentsRaw += event.argumentsDelta;
        }
      }, !textToolProtocol, textToolProtocol);
      clearTimeout(turnTimeout);

      // The native request can't be cancelled mid-flight, so an aborted stream still
      // resolves here — bail out so the loop mirrors ollamaCloud's abort semantics
      // (no tool execution, no history mutation) instead of continuing with a
      // truncated turn.
      if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');

      const accumulatedByIndex: ToolCall[] = deltaAccumulator
        .filter((d) => d.name.length > 0 || d.argumentsRaw.length > 0)
        .map((d) => ({
          id: d.id,
          name: d.name,
          arguments: parseToolCallArguments(d.argumentsRaw),
        }));

      // The native side accumulated the very same deltas by index and resolved with
      // the fully-assembled message — prefer it (single source of truth), falling
      // back to our event-level accumulation if it is ever missing or empty.
      toolCalls =
        assembled.tool_calls?.length
          ? assembled.tool_calls.map((tc) => ({
              id: tc.id,
              name: tc.function.name,
              arguments: parseToolCallArguments(tc.function.arguments),
            }))
          : accumulatedByIndex;

      // Text protocol: the calls are in the prose, not in tool_calls. Recover them
      // and strip them from what the user sees. Checked only when the native path
      // produced nothing, so enabling this can never suppress a real native call —
      // a model that manages both is still served by the stronger mechanism.
      // Parse the AUTHORITATIVE text, not just the streamed mirror: the no-call
      // branch below shows `assembled.content` when the native side supplied it,
      // so cleaning only `content` left the raw tag on screen in exactly the case
      // this exists to handle — a block whose name resolved to nothing, which is
      // stripped but yields no call. Assign the cleaned text unconditionally
      // (not just when a call was recovered) for the same reason.
      let cleanedByTextProtocol = false;
      if (textToolProtocol && toolCalls.length === 0) {
        const recovered = parseTextToolCalls(assembled.content ?? content);
        content = recovered.cleanedContent;
        cleanedByTextProtocol = true;
        if (recovered.calls.length > 0) toolCalls = recovered.calls;
      }

      if (toolCalls.length === 0) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          // `content` is already the cleaned form of assembled.content here, so
          // preferring assembled.content again would undo the stripping.
          content: cleanedByTextProtocol ? content : (assembled.content ?? content),
          thought: assembled.thought ?? thought,
        };
        messages = [...messages, assistantMessage];
        onEvent({ type: 'done', message: assistantMessage });
        return messages;
      }

      messages = [...messages, { role: 'assistant', content, thought, toolCalls }];

      for (const call of toolCalls) {
        onEvent({ type: 'toolCall', name: call.name, args: call.arguments });
        const result = await runToolCall(call, toolCtx);
        onEvent({ type: 'toolResult', name: call.name, result });
        messages = [
          ...messages,
          { role: 'tool', content: JSON.stringify(result), toolName: call.name },
        ];
      }
    }

    throw new Error('The assistant made too many tool calls in a row without answering.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    onEvent({ type: 'error', message });
    // Attach accumulated messages to error so ChatPanel can preserve tool call history
    const err = error instanceof Error ? error : new Error(message);
    (err as unknown as Record<string, unknown>).partialMessages = messages;
    throw err;
  } finally {
    clearTimeout(turnTimeout);
    signal?.removeEventListener('abort', abort);
  }
}
