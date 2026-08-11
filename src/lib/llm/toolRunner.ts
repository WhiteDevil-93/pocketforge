// ============================================================================
// PocketForge — shared tool-call executor
//
// Pure extraction of the per-tool execution + timeout logic that every LLM
// backend (Ollama Cloud and the on-device llama.cpp server) uses to run a
// model's tool calls against the app's real calculators. The model never
// computes numbers itself — all math happens inside these handlers.
// ============================================================================

import { getToolByName } from './tools';
import type { ToolCall, ToolContext } from './types';

/** How long a single tool handler may run before its result is treated as a
 *  timeout. The local llama.cpp backend can be slow, but the calculators are
 *  all local and synchronous — 15s is far more than any of them needs. */
export const TOOL_TIMEOUT_MS = 15_000;

export async function runToolCall(call: ToolCall, ctx: ToolContext): Promise<unknown> {
  const tool = getToolByName(call.name);
  if (!tool) return { error: `Unknown tool "${call.name}".` };

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Tool "${call.name}" timed out.`)), TOOL_TIMEOUT_MS);
  });

  try {
    return await Promise.race([Promise.resolve(tool.handler(call.arguments, ctx)), timeout]);
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timer);
  }
}
