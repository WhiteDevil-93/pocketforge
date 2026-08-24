// ============================================================================
// PocketForge — Shared types for the AI assistant backends
// (Ollama Cloud and the on-device llama.cpp server)
// ============================================================================

export type ChatRole = 'system' | 'user' | 'assistant' | 'tool';

export interface ToolCall {
  /** Present when the server assigns call ids; not all backends send one. */
  id?: string;
  name: string;
  arguments: Record<string, unknown>;
}

/**
 * One piece of a multi-part message — the OpenAI content-parts shape, unchanged, so
 * it can flow straight through the native bridge (see localLlamaCpp.ts's toWireMessage)
 * to the LiteRT-LM engine's request parser without any reshaping in between.
 * docs/litertlm-vl-integration.md's "Image transport" design.
 */
export type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

export interface ChatMessage {
  role: ChatRole;
  /** Plain text for every existing message. An array only ever appears on a user
   *  message carrying an attached image (docs/litertlm-vl-integration.md) — the
   *  local LiteRT-LM backend is the only consumer that does anything with the
   *  array form; every other call site should use contentToText() rather than
   *  assume content is a string. */
  content: string | ContentPart[];
  /** Only on assistant messages that requested tool calls. */
  toolCalls?: ToolCall[];
  /** Only on role: 'tool' messages — which tool produced this result. */
  toolName?: string;
}

/**
 * Flattens content to plain text — for history display, stripSpecialTokens, and any
 * other place that only ever needs a string (an assistant/tool/system message's
 * content is always already a plain string; this only does real work for a user
 * message carrying an image). Image parts render as a fixed placeholder rather than
 * their base64 data — a real inline thumbnail is the attach-UI's job, not this
 * fallback's (docs/litertlm-vl-integration.md step 12).
 */
export function contentToText(content: string | ContentPart[]): string {
  if (typeof content === 'string') return content;
  return content.map((part) => (part.type === 'text' ? part.text : '[image]')).join('');
}

/** JSON-Schema subset used to describe a tool's parameters to the model. */
export interface ToolParameterSchema {
  type: 'object';
  properties: Record<string, { type: string; description: string; enum?: string[] }>;
  required?: string[];
}

export interface ToolContext {
  /** The team currently open in the app, if any. Tools ground themselves in this. */
  team: import('../../types').Team | null;
  /** Ollama Cloud API key, forwarded only to tools that make outbound requests
   *  (web_search, web_fetch) — sent nowhere except ollama.com. */
  apiKey?: string;
  /** The sendMessage call's own abort signal (user stop, overall timeout) — forwarded so a
   *  network-backed tool can cancel its request rather than letting it run to completion
   *  after the result would just be discarded anyway. */
  signal?: AbortSignal;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameterSchema;
  /** Runs entirely client-side against existing app data — never trust the model's arithmetic. */
  handler: (args: Record<string, unknown>, ctx: ToolContext) => Promise<unknown> | unknown;
}

/** Streaming events surfaced to the UI while a reply is being generated. */
export type LlmStreamEvent =
  | { type: 'token'; text: string }
  | { type: 'toolCall'; name: string }
  | { type: 'toolResult'; name: string; result: unknown }
  | { type: 'done'; message: ChatMessage }
  | { type: 'error'; message: string };
