// ============================================================================
// PocketForge — Champions Regulation legality helpers
// ============================================================================
// Generated rosters/banlists are refreshed by scripts/update-from-showdown.mjs

import { CHAMPIONS_MA_ROSTER, CHAMPIONS_MB_ROSTER } from './championsRoster';
import { CHAMPIONS_BANNED_ITEMS } from './championsBannedItems';
import { CHAMPIONS_BANNED_MOVES } from './championsBannedMoves';
import { CHAMPIONS_LEARNSETS } from './championsLearnsets';
import { CHAMPIONS_META } from './championsMeta';
import { getItemByName } from './itemsData';
import { getMoveByName } from './movesData';

export { CHAMPIONS_META };
export { CHAMPIONS_MB_ROSTER };

/** Normalize species / item / move names to PS-style slugs. */
export function normalizeSlug(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, '').replace(/-/g, '').replace(/[^a-z0-9]/g, '');
}

const MA_ROSTER_SET = new Set(CHAMPIONS_MA_ROSTER.map(normalizeSlug));
const MB_ROSTER_SET = new Set(CHAMPIONS_MB_ROSTER.map(normalizeSlug));
const BANNED_ITEM_SET = new Set(CHAMPIONS_BANNED_ITEMS);
const BANNED_MOVE_SET = new Set(CHAMPIONS_BANNED_MOVES);

export function isEligibleForChampionsMA(species: string): boolean {
  if (!species) return false;
  return MA_ROSTER_SET.has(normalizeSlug(species));
}

export function isEligibleForChampionsMB(species: string): boolean {
  if (!species) return false;
  return MB_ROSTER_SET.has(normalizeSlug(species));
}

/** Active ranked regulation (M-B). */
export function isEligibleForChampions(species: string): boolean {
  return isEligibleForChampionsMB(species);
}

export function isChampionsItemLegal(itemName: string): boolean {
  if (!itemName) return true;
  const entry = getItemByName(itemName);
  const id = entry?.id || normalizeSlug(itemName);
  return !BANNED_ITEM_SET.has(id);
}

export function isChampionsMoveLegal(moveName: string): boolean {
  if (!moveName) return true;
  const entry = getMoveByName(moveName);
  const id = entry?.id || normalizeSlug(moveName);
  return !BANNED_MOVE_SET.has(id);
}

/** Legal moves for a species under the current Champions regulation learnset. */
export function getChampionsMovesForSpecies(species: string): string[] {
  const slug = normalizeSlug(species);
  const moveIds = CHAMPIONS_LEARNSETS[slug];
  if (!moveIds?.length) return [];
  const names: string[] = [];
  for (const id of moveIds) {
    if (BANNED_MOVE_SET.has(id)) continue;
    const move = getMoveByName(id) || getMoveByName(
      id.replace(/([a-z])([A-Z])/g, '$1 $2')
    );
    names.push(move?.name || id);
  }
  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}

export function isMoveLegalForChampionsSpecies(species: string, moveName: string): boolean {
  if (!isChampionsMoveLegal(moveName)) return false;
  const slug = normalizeSlug(species);
  const pool = CHAMPIONS_LEARNSETS[slug];
  if (!pool?.length) return isChampionsMoveLegal(moveName);
  const move = getMoveByName(moveName);
  const id = move?.id || normalizeSlug(moveName);
  return pool.includes(id);
}

export function isChampionsFormatId(formatId: string): boolean {
  return formatId.toLowerCase().startsWith('champions');
}

export function isEligibleForChampionsFormat(species: string, formatId: string): boolean {
  if (formatId === 'champions-ma') return isEligibleForChampionsMA(species);
  return isEligibleForChampionsMB(species);
}