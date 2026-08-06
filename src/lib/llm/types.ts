// ============================================================================
// PocketForge — Shared types for the Ollama Cloud AI assistant
// ============================================================================

export type ChatRole = 'system' | 'user' | 'assistant' | 'tool';

export interface ToolCall {
  /** Present when the server assigns call ids; not all backends send one. */
  id?: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ChatMessage {
  role: ChatRole;
  content: string;
  /** Only on assistant messages that requested tool calls. */
  toolCalls?: ToolCall[];
  /** Only on role: 'tool' messages — which tool produced this result. */
  toolName?: string;
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
