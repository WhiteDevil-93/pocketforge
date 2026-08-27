// ============================================================================
// PocketForge — Champions Regulation legality helpers
// ============================================================================
// Uses OTA-fetched regulation data (with bundled fallback)

import { getRegulationRoster, getRegulationBannedMoves, getRegulationBannedItems, getRegulationLearnset, getRegulationCacheVersion } from '../lib/regulations/regulationsRuntime';
import { CHAMPIONS_META } from './championsMeta';
import { getItemByName } from './itemsData';
import { getMoveByName } from './movesData';

export { CHAMPIONS_META };

// Cached Sets for fast lookups — rebuilt when data loads
let maRosterSet = new Set<string>();
let mbRosterSet = new Set<string>();
let bannedItemSet = new Set<string>();
let bannedMoveSet = new Set<string>();

/** Update cached Sets from runtime regulation data. */
function updateRegulationSets(): void {
  const maRoster = getRegulationRoster('champions-ma');
  const mbRoster = getRegulationRoster('champions-mb');
  const bannedItems = getRegulationBannedItems('champions-mb');
  const bannedMoves = getRegulationBannedMoves('champions-mb');

  maRosterSet = new Set(maRoster.map(normalizeSlug));
  mbRosterSet = new Set(mbRoster.map(normalizeSlug));
  bannedItemSet = new Set(bannedItems);
  bannedMoveSet = new Set(bannedMoves);
}

/**
 * Version of the regulation cache these Sets were built from; -1 until built.
 *
 * Rebuilding once at module load was silently wrong: the regulation cache is
 * still empty at that point (preloadBundledRegulations runs from an effect in
 * App.tsx, long after every module has evaluated), so the Sets were captured
 * empty and never refreshed. Every Champions eligibility check then returned
 * false for every species — which rejected all add_pokemon calls on a Champions
 * team and emptied the Builder/PokemonEditor species pickers. Rebuilding lazily
 * against the cache version fixes it for the bundled preload and any later OTA
 * refresh, with no ordering assumption to get wrong again.
 */
let setsVersion = -1;

/** Rebuilds the cached Sets if regulation data has changed since they were built. */
function ensureRegulationSets(): void {
  const version = getRegulationCacheVersion();
  if (version === setsVersion) return;
  updateRegulationSets();
  setsVersion = version;
}

/** Normalize species / item / move names to PS-style slugs. */
export function normalizeSlug(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, '').replace(/-/g, '').replace(/[^a-z0-9]/g, '');
}

export function isEligibleForChampionsMA(species: string): boolean {
  if (!species) return false;
  ensureRegulationSets();
  return maRosterSet.has(normalizeSlug(species));
}

export function isEligibleForChampionsMB(species: string): boolean {
  if (!species) return false;
  ensureRegulationSets();
  return mbRosterSet.has(normalizeSlug(species));
}

/** Active ranked regulation (M-B). */
export function isEligibleForChampions(species: string): boolean {
  return isEligibleForChampionsMB(species);
}

export function isChampionsItemLegal(itemName: string): boolean {
  if (!itemName) return true;
  ensureRegulationSets();
  const entry = getItemByName(itemName);
  const id = entry?.id || normalizeSlug(itemName);
  return !bannedItemSet.has(id);
}

export function isChampionsMoveLegal(moveName: string): boolean {
  if (!moveName) return true;
  ensureRegulationSets();
  const entry = getMoveByName(moveName);
  const id = entry?.id || normalizeSlug(moveName);
  return !bannedMoveSet.has(id);
}

/** Legal moves for a species under the current Champions regulation learnset. */
export function getChampionsMovesForSpecies(species: string): string[] {
  ensureRegulationSets();
  const slug = normalizeSlug(species);
  const moveIds = getRegulationLearnset('champions-mb', slug);
  if (!moveIds?.length) return [];
  const names: string[] = [];
  for (const id of moveIds) {
    if (bannedMoveSet.has(id)) continue;
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
  const pool = getRegulationLearnset('champions-mb', slug);
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