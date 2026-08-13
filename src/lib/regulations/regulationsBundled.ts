// ============================================================================
// PocketForge — Bundled regulation data adapter
//
// Converts bundled static data (championsRoster, etc.) to RegulationData format.
// Used as fallback when OTA fetch is unavailable.
// ============================================================================

import { CHAMPIONS_MA_ROSTER, CHAMPIONS_MB_ROSTER } from '../../data/championsRoster';
import { CHAMPIONS_BANNED_ITEMS } from '../../data/championsBannedItems';
import { CHAMPIONS_BANNED_MOVES } from '../../data/championsBannedMoves';
import { CHAMPIONS_LEARNSETS } from '../../data/championsLearnsets';
import { CHAMPIONS_META } from '../../data/championsMeta';
import type { RegulationData } from './regulationsFetch';

/**
 * Convert bundled Champions data to RegulationData format.
 * Returns data for the specified regulation ID.
 */
export function getBundledRegulationData(regulationId: string): RegulationData | null {
  if (regulationId === 'champions-ma') {
    return {
      id: 'champions-ma',
      version: '1.0.0',
      roster: CHAMPIONS_MA_ROSTER,
      bannedMoves: CHAMPIONS_BANNED_MOVES,
      bannedItems: CHAMPIONS_BANNED_ITEMS,
      learnsets: CHAMPIONS_LEARNSETS,
      meta: {
        updatedAt: CHAMPIONS_META.updatedAt,
        source: 'bundled' as const,
      },
    };
  }

  if (regulationId === 'champions-mb') {
    return {
      id: 'champions-mb',
      version: '1.0.0',
      roster: CHAMPIONS_MB_ROSTER,
      bannedMoves: CHAMPIONS_BANNED_MOVES,
      bannedItems: CHAMPIONS_BANNED_ITEMS,
      learnsets: CHAMPIONS_LEARNSETS,
      meta: {
        updatedAt: CHAMPIONS_META.updatedAt,
        source: 'bundled' as const,
      },
    };
  }

  return null;
}
