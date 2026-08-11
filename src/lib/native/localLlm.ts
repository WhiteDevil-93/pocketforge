// ============================================================================
// PocketForge — LocalLlm native bridge (llama.cpp model import + chat + server)
// ============================================================================
//
// Thin TypeScript wrapper over the LocalLlm Capacitor plugin. This module must
// ONLY be imported dynamically behind an isNativeApp() guard (see the
// use-native-shell.ts convention) so the web/PWA build never pulls Capacitor
// Android code into the bundle. `import type` of the interfaces below is fine
// anywhere — it is erased at compile time.

import { registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

export interface ModelImportProgress {
  bytesCopied: number;
  totalBytes: number;
  percent: number;
}

export interface PickModelResult {
  /** Absolute path of the imported model inside app-private storage. */
  path: string;
  /** Display name of the imported model file. */
  name: string;
  /** Size of the copied model in bytes. */
  size: number;
}

/** Server lifecycle snapshot, mirroring LocalLlmPlugin's serverStatusChanged events. */
export interface LocalLlmServerStatus {
  state: 'stopped' | 'loading' | 'ready' | 'error';
  port?: number;
  error?: string;
}

export interface ChatOnceOptions {
  /** Opaque id echoed back on every event; lets JS ignore events from other in-flight calls. */
  requestId: string;
  /** OpenAI-shaped chat messages (role/content/tool_calls/tool_call_id), JSON-serializable. */
  messages: unknown[];
  /** OpenAI-shaped function schemas (see toLocalToolSchema), JSON-serializable. */
  tools: unknown[];
}

/** Fully-assembled assistant turn, resolved once the native SSE stream hits [DONE]. */
export interface ChatOnceResult {
  role: string;
  content: string;
  tool_calls?: Array<{
    id?: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
}

/** Streaming events re-emitted by the native SSE parser while chatOnce runs. */
export type ChatOnceEvent =
  | { type: 'token'; requestId: string; text: string }
  | {
      type: 'toolCallDelta';
      requestId: string;
      /** Array position in the chunk's delta.tool_calls — the accumulation key. */
      index: number;
      /** Fragment of the tool name; concatenate across chunks by index. */
      name: string;
      /** Fragment of the argument JSON string; concatenate across chunks by index. */
      argumentsDelta: string;
      id?: string;
    };

export interface LocalLlmPlugin {
  ping(): Promise<{ message: string; nativeInfo: string }>;
  pickModelFile(): Promise<PickModelResult>;
  chatOnce(options: ChatOnceOptions): Promise<ChatOnceResult>;
  getServerStatus(): Promise<LocalLlmServerStatus>;
  addListener(
    eventName: 'modelImportProgress',
    listenerFunc: (progress: ModelImportProgress) => void,
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'chatOnceEvent',
    listenerFunc: (event: ChatOnceEvent) => void,
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'serverStatusChanged',
    listenerFunc: (status: LocalLlmServerStatus) => void,
  ): Promise<PluginListenerHandle>;
  removeAllListeners(): Promise<void>;
}

const localLlm = registerPlugin<LocalLlmPlugin>('LocalLlm');

export function pingLocalLlm(): Promise<{ message: string; nativeInfo: string }> {
  return localLlm.ping();
}

/** Launches the SAF picker and imports the selected GGUF into app-private storage. */
export function pickModelFile(): Promise<PickModelResult> {
  return localLlm.pickModelFile();
}

/**
 * One non-blocking HTTP+SSE round-trip against the local llama-server. Resolves
 * with the fully-assembled assistant message once the stream hits [DONE]; the
 * caller should also subscribe to chatOnceEvent (matching `requestId`) to
 * stream tokens / tool-call deltas as they arrive.
 */
export function chatOnce(options: ChatOnceOptions): Promise<ChatOnceResult> {
  return localLlm.chatOnce(options);
}

export function addChatOnceEventListener(
  listener: (event: ChatOnceEvent) => void,
): Promise<PluginListenerHandle> {
  return localLlm.addListener('chatOnceEvent', listener);
}

export function getServerStatus(): Promise<LocalLlmServerStatus> {
  return localLlm.getServerStatus();
}

export function addServerStatusChangedListener(
  listener: (status: LocalLlmServerStatus) => void,
): Promise<PluginListenerHandle> {
  return localLlm.addListener('serverStatusChanged', listener);
}

/** Subscribe to chunked-copy progress events ({ bytesCopied, totalBytes, percent }). */
export function addModelImportProgressListener(
  listener: (progress: ModelImportProgress) => void,
): Promise<PluginListenerHandle> {
  return localLlm.addListener('modelImportProgress', listener);
}
