// ============================================================================
// PocketForge — Ollama Cloud chat client
//
// Talks to https://ollama.com/api/chat directly from the browser/WebView — no
// server of our own, consistent with the rest of the app. The API key comes
// from AppSettings (localStorage) and is sent only to ollama.com over HTTPS.
//
// NOTE: this has been built carefully against Ollama's documented API shape
// (https://docs.ollama.com/api/authentication, github.com/ollama/ollama/blob/main/docs/api.md)
// but has not been exercised against a live key in this environment. The one
// place most likely to need a tweak against a real response is how a
// completed tool call is echoed back — see `toWireMessage` below.
// ============================================================================

import type { ChatMessage, LlmStreamEvent, ToolCall, ToolContext } from './types';
import { toOllamaToolSchema } from './tools';
import { runToolCall } from './toolRunner';

const CHAT_URL = 'https://ollama.com/api/chat';
// A full build is exactly 20 prescribed calls (create_team + 6 members ×
// get_legal_moves/lookup_pokemon/add_pokemon + validate_team) with zero room left
// over — the system prompt also tells the model to call update_pokemon to fix
// whatever validate_team rejects, and any add_pokemon rejection needs a retry
// call too, so the bare minimum leaves no headroom for the corrections the app
// itself asks for. The extra 12 covers a realistic number of those without
// letting a truly stuck loop run away. Kept identical to localLlamaCpp.ts's
// bound — see that file's header comment for why the two mirror each other.
const MAX_TOOL_ITERATIONS = 32;
// Per-iteration ceiling, reset before each generation (see resetIterationTimeout
// below) rather than a single budget for the whole sendMessage call — this
// detects one stalled generation (Ollama Cloud accepted the request and never
// streamed a first chunk), which is what the timer is actually meant to catch.
// A single overall timeout here previously aborted mid-build on exactly the
// workflow this file exists to support: a real team build is ~20 sequential
// generations, and 90s was nowhere near enough to cover all of them.
const REQUEST_TIMEOUT_MS = 90_000;

interface WireToolCall {
  function: { name: string; arguments: Record<string, unknown> };
}

interface WireMessage {
  role: string;
  content: string;
  tool_calls?: WireToolCall[];
  tool_name?: string;
}

interface WireChunk {
  message?: { role: string; content?: string; tool_calls?: WireToolCall[] };
  done?: boolean;
  error?: string;
}

function toWireMessage(message: ChatMessage): WireMessage {
  if (typeof message.content !== 'string') {
    // Image content (docs/litertlm-vl-integration.md) is a LiteRT-LM-only feature —
    // the attach UI gates on the local backend, so this should never actually fire in
    // practice, but a silent flatten-to-text would answer as if Ollama saw an image
    // it never received. Reject instead of guessing what the user wanted.
    throw new Error('Image content is not supported on the Ollama Cloud backend.');
  }
  const wire: WireMessage = { role: message.role, content: message.content };
  if (message.toolCalls?.length) {
    wire.tool_calls = message.toolCalls.map((c) => ({
      function: { name: c.name, arguments: c.arguments },
    }));
  }
  if (message.role === 'tool' && message.toolName) {
    wire.tool_name = message.toolName;
  }
  return wire;
}

async function* streamChatOnce(
  apiKey: string,
  model: string,
  history: ChatMessage[],
  signal: AbortSignal
): AsyncGenerator<WireChunk> {
  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: history.map(toWireMessage),
      tools: toOllamaToolSchema(),
      stream: true,
    }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ollama Cloud request failed (${res.status} ${res.statusText})${text ? `: ${text}` : ''}`);
  }
  if (!res.body) throw new Error('Ollama Cloud response had no body.');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          yield JSON.parse(trimmed) as WireChunk;
        } catch {
          // Skip a keep-alive or partially-framed line rather than losing the whole
          // reply — the tokens already streamed would otherwise be thrown away too.
        }
      }
    }
    if (buffer.trim()) {
      try {
        yield JSON.parse(buffer.trim()) as WireChunk;
      } catch {
        // Trailing partial chunk — ignore.
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export interface SendMessageOptions {
  apiKey: string;
  model: string;
  history: ChatMessage[];
  ctx: ToolContext;
  onEvent: (event: LlmStreamEvent) => void;
  signal?: AbortSignal;
}

/**
 * Sends the conversation to Ollama Cloud, resolving any tool calls the model makes
 * against the real app calculators, and looping until it returns a plain answer.
 * Returns the full updated history (user/assistant/tool turns appended).
 */
export async function sendMessage({
  apiKey,
  model,
  history,
  ctx,
  onEvent,
  signal,
}: SendMessageOptions): Promise<ChatMessage[]> {
  // Trimmed once here rather than trusting every save site — a key copy-pasted with a
  // trailing newline would pass a non-empty check but fail Ollama's exact-match auth.
  apiKey = apiKey.trim();
  if (!apiKey) {
    const message = 'No Ollama Cloud API key is set. Add one in Settings → AI Assistant.';
    onEvent({ type: 'error', message });
    throw new Error(message);
  }

  const controller = new AbortController();
  if (signal?.aborted) {
    // The 'abort' event only fires on the *transition* to aborted — if the caller's
    // signal was already tripped before we got here, listening for it would wait forever.
    controller.abort();
  }
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort);
  // Reset before each iteration's generation, not set once for the whole loop —
  // see REQUEST_TIMEOUT_MS's comment for why a single budget here was wrong.
  let iterationTimeout: ReturnType<typeof setTimeout> | undefined;
  const resetIterationTimeout = () => {
    if (iterationTimeout) clearTimeout(iterationTimeout);
    iterationTimeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  };
  resetIterationTimeout();

  let messages = [...history];
  // web_search/web_fetch need the API key to call ollama.com's web API, and this request's
  // own abort signal so a user stop / overall timeout cancels an in-flight web request
  // instead of leaving it running for no reason — forwarded here rather than requiring
  // every caller of sendMessage to include them in ctx themselves.
  const toolCtx: ToolContext = { ...ctx, apiKey, signal: controller.signal };

  try {
    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
      if (iteration > 0) resetIterationTimeout();
      let content = '';
      let toolCalls: ToolCall[] = [];

      for await (const chunk of streamChatOnce(apiKey, model, messages, controller.signal)) {
        if (chunk.error) throw new Error(chunk.error);

        const delta = chunk.message?.content ?? '';
        if (delta) {
          content += delta;
          onEvent({ type: 'token', text: delta });
        }

        if (chunk.message?.tool_calls?.length) {
          // Ollama can split one turn's tool calls across multiple streamed chunks —
          // accumulate rather than replace, or earlier calls in the same turn are lost.
          toolCalls = [
            ...toolCalls,
            ...chunk.message.tool_calls.map((c) => ({
              name: c.function.name,
              arguments: c.function.arguments,
            })),
          ];
        }
      }

      if (toolCalls.length === 0) {
        const assistantMessage: ChatMessage = { role: 'assistant', content };
        messages = [...messages, assistantMessage];
        onEvent({ type: 'done', message: assistantMessage });
        return messages;
      }

      messages = [...messages, { role: 'assistant', content, toolCalls }];

      for (const call of toolCalls) {
        onEvent({ type: 'toolCall', name: call.name });
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
    if (iterationTimeout) clearTimeout(iterationTimeout);
    signal?.removeEventListener('abort', abort);
  }
}
