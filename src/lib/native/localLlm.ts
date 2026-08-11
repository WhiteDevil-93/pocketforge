// ============================================================================
// PocketForge — LocalLlm native bridge (llama.cpp model import)
// ============================================================================
//
// Thin TypeScript wrapper over the LocalLlm Capacitor plugin. This module must
// ONLY be imported dynamically behind an isNativeApp() guard (see the
// use-native-shell.ts convention) so the web/PWA build never pulls Capacitor
// Android code into the bundle.

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

export interface LocalLlmPlugin {
  ping(): Promise<{ message: string; nativeInfo: string }>;
  pickModelFile(): Promise<PickModelResult>;
  addListener(
    eventName: 'modelImportProgress',
    listenerFunc: (progress: ModelImportProgress) => void,
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

/** Subscribe to chunked-copy progress events ({ bytesCopied, totalBytes, percent }). */
export function addModelImportProgressListener(
  listener: (progress: ModelImportProgress) => void,
): Promise<PluginListenerHandle> {
  return localLlm.addListener('modelImportProgress', listener);
}
