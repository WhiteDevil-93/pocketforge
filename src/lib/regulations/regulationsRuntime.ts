// ============================================================================
// PocketForge — Runtime regulation data access
//
// Provides access to regulation data (bundled + OTA updates).
// Initialized on app startup; used by championsLegality and other modules.
// ============================================================================

import type { RegulationData } from './regulationsFetch';
import { getBundledRegulationData } from './regulationsBundled';

/**
 * Runtime regulation cache — maps regulation IDs to their data.
 * Initialized with bundled data, updated by OTA fetches.
 */
const regulationCache: Record<string, RegulationData> = {};

/**
 * Initialize the cache with bundled data for the given regulation ID.
 * Called by the OTA preloader on app startup.
 */
export function initializeRegulationCache(regulationId: string, data: RegulationData): void {
  regulationCache[regulationId] = data;
}

/**
 * Get regulation data by ID.
 * Returns cached data (bundled or previously fetched via OTA).
 * Returns null if the regulation ID is unknown.
 */
export function getRegulationDataSync(regulationId: string): RegulationData | null {
  return regulationCache[regulationId] || null;
}

/**
 * Get roster for a regulation (species list).
 * Returns empty array if regulation not found.
 */
export function getRegulationRoster(regulationId: string): string[] {
  return getRegulationDataSync(regulationId)?.roster || [];
}

/**
 * Get banned moves for a regulation (move IDs).
 * Returns empty array if regulation not found.
 */
export function getRegulationBannedMoves(regulationId: string): string[] {
  return getRegulationDataSync(regulationId)?.bannedMoves || [];
}

/**
 * Get banned items for a regulation (item IDs).
 * Returns empty array if regulation not found.
 */
export function getRegulationBannedItems(regulationId: string): string[] {
  return getRegulationDataSync(regulationId)?.bannedItems || [];
}

/**
 * Get legal move learnset for a species in a regulation.
 * Returns empty array if regulation or species not found.
 * Returns move IDs (strings).
 */
export function getRegulationLearnset(regulationId: string, speciesSlug: string): string[] {
  const data = getRegulationDataSync(regulationId);
  return data?.learnsets[speciesSlug] || [];
}

/**
 * Preload all regulations from bundled data on app startup.
 * Called by useRegulationsInit hook.
 */
export function preloadBundledRegulations(regulationIds: string[]): void {
  for (const id of regulationIds) {
    const bundled = getBundledRegulationData(id);
    if (bundled) {
      initializeRegulationCache(id, bundled);
    }
  }
}
