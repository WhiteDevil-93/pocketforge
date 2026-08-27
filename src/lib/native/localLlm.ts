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

/** One model file sitting in app-private storage — every import writes a new
 *  file and nothing before this ever deleted one, so this can list several. */
export interface ModelFile {
  path: string;
  name: string;
  size: number;
}

/** Server lifecycle snapshot, mirroring LocalLlmPlugin's serverStatusChanged events. */
export interface LocalLlmServerStatus {
  state: 'stopped' | 'loading' | 'ready' | 'error';
  port?: number;
  error?: string;
  /** Which InferenceEngine backend served this 'ready' state, e.g. "llamaCpp" or
   *  "litertLm:GPU" — undefined outside 'ready'. LiteRT-LM's NPU/GPU/CPU fallback
   *  (docs/litertlm-android-adapter.md §4.1) means the winning backend isn't
   *  knowable in advance; sampler settings are also inert on NPU (§4.2), so this is
   *  worth showing the user, not just logging. */
  backend?: string;
  /** Whether the loaded engine can accept image content (docs/litertlm-vl-integration.md
   *  §8) — absent outside 'ready' (matching `port`/`error`/`backend`'s own convention),
   *  and false for the llama.cpp/GGUF path, which never supports images. Gates the (not
   *  yet built) image-attach UI: a text-only .litertlm import should not show a control
   *  that will only ever error. */
  visionAvailable?: boolean;
}

export interface ChatOnceOptions {
  /** Opaque id echoed back on every event; lets JS ignore events from other in-flight calls. */
  requestId: string;
  /** OpenAI-shaped chat messages (role/content/tool_calls/tool_call_id), JSON-serializable. */
  messages: unknown[];
  /** OpenAI-shaped function schemas (see toLocalToolSchema), JSON-serializable. */
  tools: unknown[];
  /** When true, the native side renders history as plain-text tool-call blocks
   *  instead of LiteRT-LM's native ToolCall/Content.ToolResponse types — see
   *  ChatRequest.kt's parseChatRequest and textToolProtocol.ts. Omitted/false is
   *  the native-calling path, unaffected. */
  textToolProtocol?: boolean;
}

/** Fully-assembled assistant turn, resolved once the native SSE stream hits [DONE]. */
export interface ChatOnceResult {
  role: string;
  content: string;
  thought?: string;
  tool_calls?: Array<{
    id?: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
}

/** Streaming events re-emitted by the native SSE parser while chatOnce runs. */
export type ChatOnceEvent =
  | { type: 'token'; requestId: string; text: string }
  | { type: 'thought'; requestId: string; text: string }
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
  startServer(options: { modelPath?: string }): Promise<LocalLlmServerStatus>;
  stopServer(): Promise<LocalLlmServerStatus>;
  getServerStatus(): Promise<LocalLlmServerStatus>;
  listModelFiles(): Promise<{ files: ModelFile[] }>;
  deleteModelFile(options: { path: string }): Promise<void>;
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

/** Lists every imported model file sitting in app-private storage. */
export function listModelFiles(): Promise<{ files: ModelFile[] }> {
  return localLlm.listModelFiles();
}

/** Deletes an imported model file. Rejects if that path is the one currently
 *  loaded/serving — stop the server first. */
export function deleteModelFile(path: string): Promise<void> {
  return localLlm.deleteModelFile({ path });
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

/**
 * Starts the foreground llama-server with the imported model. Resolves
 * immediately with a 'loading' status; readiness arrives via
 * serverStatusChanged / getServerStatus once the model finishes loading.
 */
export function startServer(modelPath: string): Promise<LocalLlmServerStatus> {
  return localLlm.startServer({ modelPath });
}

/** Stops the foreground llama-server and frees the loaded model from memory. */
export function stopServer(): Promise<LocalLlmServerStatus> {
  return localLlm.stopServer();
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
