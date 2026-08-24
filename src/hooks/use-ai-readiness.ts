import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { isNativeApp } from '../lib/platform';
import type { LocalLlmServerStatus } from '../lib/native/localLlm';

export interface AiReadiness {
  /** True when a chat request could actually be sent right now. */
  isConfigured: boolean;
  isLocalBackend: boolean;
  /**
   * Live on-device server status. Always null in the browser and on the cloud
   * backend, where there is no local server for readiness to mean anything.
   */
  serverStatus: LocalLlmServerStatus | null;
}

/**
 * Single source of truth for whether the AI assistant is usable right now.
 *
 * Every surface that offers chat has to agree on this: a launcher that renders
 * while ChatSheet reports "not configured" is worse than no launcher at all, and
 * the two drift the moment the rule is written down twice.
 *
 * The native module is imported dynamically so the web/PWA bundle never pulls
 * the Capacitor plugin registration in.
 */
export function useAiReadiness(): AiReadiness {
  const settings = useStore((s) => s.settings);
  const [serverStatus, setServerStatus] = useState<LocalLlmServerStatus | null>(null);

  // Any on-device backend counts as local — llama.cpp and LiteRT-LM share the
  // same OpenAI-shaped HTTP contract, so nothing here needs to distinguish them.
  const isLocalBackend = settings.aiBackend !== 'ollamaCloud';

  // Only the native shell has a local server to be ready; the browser build's
  // status state is meaningless (and would otherwise gate the cloud path).
  const effectiveServerStatus = isNativeApp() && isLocalBackend ? serverStatus : null;

  // The local backend needs a model imported AND the llama-server live — NOT an
  // API key (there is none). The cloud backend keeps the existing key+model check.
  const isConfigured = settings.aiEnabled
    ? isLocalBackend
      ? settings.localModelPath.trim().length > 0 && effectiveServerStatus?.state === 'ready'
      : settings.ollamaApiKey.trim().length > 0 && settings.ollamaModel.trim().length > 0
    : false;

  useEffect(() => {
    if (!isNativeApp() || !isLocalBackend) return;
    let cancelled = false;
    let remove: (() => void) | undefined;
    void (async () => {
      const { getServerStatus, addServerStatusChangedListener } = await import(
        '../lib/native/localLlm'
      );
      if (cancelled) return;
      const apply = (status: LocalLlmServerStatus) => {
        if (!cancelled) setServerStatus(status);
      };
      const handle = await addServerStatusChangedListener(apply);
      if (cancelled) {
        void handle.remove();
        return;
      }
      remove = () => void handle.remove();
      // Snapshot first — serverStatusChanged only fires on transitions, so a
      // server already ready before this mounted would otherwise never surface.
      // A failed snapshot must still resolve to an explicit state rather than
      // leaving serverStatus stuck at its initial null indefinitely.
      void getServerStatus()
        .then(apply)
        .catch(() => apply({ state: 'error', error: 'Could not read server status' }));
    })();
    return () => {
      cancelled = true;
      remove?.();
    };
  }, [isLocalBackend]);

  return { isConfigured, isLocalBackend, serverStatus: effectiveServerStatus };
}
