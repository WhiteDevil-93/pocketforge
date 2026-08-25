import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { isNativeApp } from '../lib/platform';
import type { LocalLlmServerStatus } from '../lib/native/localLlm';

/**
 * Discriminated readiness state — replaces the old single isConfigured
 * boolean, which collapsed 'the server is still loading the model' and 'the
 * server crashed with an error' into the identical "AI Assistant isn't set
 * up yet" presentation, and made the Ask-AI launcher vanish in both cases
 * exactly when a user watching it load would expect it to appear soon.
 */
export type AiReadinessStatus =
  | 'ready'
  | 'starting'
  | 'server-error'
  | 'server-stopped'
  | 'no-model'
  | 'not-configured'
  | 'disabled';

export interface AiReadiness {
  /** True when a chat request could actually be sent right now — equivalent to status === 'ready'. */
  isConfigured: boolean;
  status: AiReadinessStatus;
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
  // Gating on isNativeApp() here (not just at the call sites) matters: without
  // it, a web session left with a persisted aiBackend of 'localLlamaCpp' (e.g.
  // after restoring an Android backup in the browser) would evaluate every
  // local-only branch below even though nothing local can ever run — the
  // actual dead end this fixes.
  const isLocalBackend = isNativeApp() && settings.aiBackend !== 'ollamaCloud';

  // Only the native shell has a local server to be ready; the browser build's
  // status state is meaningless (and would otherwise gate the cloud path).
  const effectiveServerStatus = isLocalBackend ? serverStatus : null;

  const status: AiReadinessStatus = !settings.aiEnabled
    ? 'disabled'
    : isLocalBackend
      ? settings.localModelPath.trim().length === 0
        ? 'no-model'
        : effectiveServerStatus?.state === 'ready'
          ? 'ready'
          : effectiveServerStatus?.state === 'error'
            ? 'server-error'
            : effectiveServerStatus?.state === 'stopped'
              ? 'server-stopped'
              // 'loading', or no snapshot has arrived yet — both read as "wait".
              : 'starting'
      : settings.ollamaApiKey.trim().length > 0 && settings.ollamaModel.trim().length > 0
        ? 'ready'
        : 'not-configured';

  useEffect(() => {
    if (!isLocalBackend) return;
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

  return { isConfigured: status === 'ready', status, isLocalBackend, serverStatus: effectiveServerStatus };
}
