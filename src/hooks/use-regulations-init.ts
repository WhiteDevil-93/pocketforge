// ============================================================================
// PocketForge — Regulations OTA initialization hook
//
// Preloads regulation data on app startup via the OTA system.
// Falls back to bundled data if fetch fails.
// ============================================================================

import { useEffect } from 'react';
import { getRegulationData } from '../lib/regulations/regulationsFetch';
import { preloadBundledRegulations, initializeRegulationCache } from '../lib/regulations/regulationsRuntime';
import { getBundledRegulationData } from '../lib/regulations/regulationsBundled';

/**
 * Initialize regulations OTA system on app startup.
 * 1. Preload bundled data immediately (synchronous)
 * 2. Fetch updated data asynchronously (non-blocking)
 */
export function useRegulationsInit(): void {
  useEffect(() => {
    const regulationIds = ['champions-ma', 'champions-mb'];

    // Synchronously preload bundled data
    preloadBundledRegulations(regulationIds);

    // Asynchronously fetch and cache updates (non-blocking, fire-and-forget)
    for (const id of regulationIds) {
      const bundledFallback = getBundledRegulationData(id);
      if (bundledFallback) {
        getRegulationData(id, bundledFallback).then((data) => {
          if (data) {
            initializeRegulationCache(id, data);
          }
        }).catch(() => {
          // Silently fail — bundled data already loaded
        });
      }
    }
  }, []);
}
