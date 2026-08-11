// ============================================================================
// PocketForge — Competitive Battle Data runtime (Smogon snapshot consumer)
//
// Loads the committed Smogon snapshot (src/data/generated/smogonStats.ts),
// hydrates ranked rows with PokéAPI metadata via the pokeapi.ts layer and
// exposes getPokemonBattleData(pokemon, format, cutoff?) → BattleData.
//
// The snapshot is imported statically here; consumers that want to keep it out
// of the initial bundle should dynamic-import this module (see
// src/components/battle-data/BattleDataPanel.tsx).
//
// NO numbers are computed at runtime — every percentage/rank is read straight
// from the parsed dump (rounding happens only in the UI layer). Rows that
// cannot be hydrated (unknown moves/items/abilities) are dropped, never
// fabricated.
// ============================================================================

import { SMOGON_STATS_SNAPSHOT } from '@/data/generated/smogonStats';
import { getPokemonByName } from '@/data/pokemonData';
import { getSpriteUrl } from '@/data/sprites';
import { hydrateRankedAbility, hydrateRankedItem, hydrateRankedMove, type HydrateOptions } from './pokeapi';
import type {
  BattleData,
  BattleFormatId,
  EvSpread,
  RankedAbility,
  RankedItem,
  RankedMatchup,
  RankedMove,
  RankedSpread,
  RankedTeammate,
  RatingCutoff,
} from './types';

// ----------------------------------------------------------------------------
// Snapshot shape (mirrors src/data/generated/smogonStats.ts)
// ----------------------------------------------------------------------------

export interface SmogonRankedRowSeed {
  rank: number;
  name: string;
  usagePercent: number;
}

export interface SmogonSpreadSeed {
  rank: number;
  nature: string;
  evs: EvSpread;
  evsText: string;
  usagePercent: number;
}

export interface SmogonCheckSeed {
  rank: number;
  opponent: string;
  usagePercent: number;
  winRate: number | null;
  lossRate: number | null;
  koChance: number | null;
  koChanceText: string | null;
  switchInChance: number | null;
}

export interface SmogonPokemonSeed {
  rank: number;
  /** Previous-month rank minus current rank; null when unknown (new/absent). */
  rankChange: number | null;
  usagePercent: number;
  rawCount: number;
  moves: SmogonRankedRowSeed[];
  items: SmogonRankedRowSeed[];
  abilities: SmogonRankedRowSeed[];
  spreads: SmogonSpreadSeed[];
  teammates: SmogonRankedRowSeed[];
  checksAndCounters: SmogonCheckSeed[];
}

export interface SmogonCutoffSnapshot {
  cutoff: number;
  battles: number;
  lastUpdated: string;
  rankChangeAvailable: boolean;
  rankChangeSourceMonth: string | null;
  pokemon: Record<string, SmogonPokemonSeed>;
}

export interface SmogonFormatSnapshot {
  format: string;
  defaultCutoff: number;
  cutoffs: Record<string, SmogonCutoffSnapshot>;
}

export interface SmogonStatsSnapshot {
  metadata: {
    schemaVersion: number;
    sourceName: string;
    sourceUrl: string;
    month: string;
    fetchedAt: string;
    formats: string[];
    rankChangeAvailable: boolean;
    rankChangeSourceMonth: string | null;
    notes: string[];
  };
  formats: Record<string, SmogonFormatSnapshot>;
}

export interface BattleDataOptions {
  /** Rating cutoff to read from the snapshot; falls back to the format's
   * default cutoff when the requested one isn't stored. */
  ratingCutoff?: RatingCutoff;
  /** Options forwarded to the PokéAPI hydration layer. */
  fetchOptions?: HydrateOptions;
}

/** Metadata about one format present in the snapshot (for format selectors). */
export interface BattleFormatInfo {
  format: BattleFormatId;
  defaultCutoff: RatingCutoff;
  cutoffs: RatingCutoff[];
  battles: number;
  lastUpdated: string;
}

const snapshot = SMOGON_STATS_SNAPSHOT as SmogonStatsSnapshot;

// ----------------------------------------------------------------------------
// Lookup helpers
// ----------------------------------------------------------------------------

function compact(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function cutoffSnapshotFor(formatSnap: SmogonFormatSnapshot, requested: RatingCutoff | undefined): SmogonCutoffSnapshot | null {
  const requestedKey = requested !== undefined ? String(requested) : '';
  return formatSnap.cutoffs[requestedKey] ?? formatSnap.cutoffs[String(formatSnap.defaultCutoff)] ?? null;
}

function findSpeciesSeed(
  cutoffSnap: SmogonCutoffSnapshot,
  pokemon: string,
): { seed: SmogonPokemonSeed; name: string } | null {
  const trimmed = pokemon.trim();
  if (!trimmed) return null;

  const canonical = getPokemonByName(trimmed)?.name;
  if (canonical) {
    const seed = cutoffSnap.pokemon[canonical];
    if (seed) return { seed, name: canonical };
  }

  // Tolerant fallback: compact-key match against every snapshot species so
  // casing/space/hyphen variants of form names still resolve.
  const needle = compact(trimmed);
  for (const [key, seed] of Object.entries(cutoffSnap.pokemon)) {
    if (compact(key) === needle) return { seed, name: key };
  }
  return null;
}

function snapshotCutoffFor(format: BattleFormatId, ratingCutoff: RatingCutoff | undefined): SmogonCutoffSnapshot | null {
  const formatSnap = snapshot.formats[format];
  if (!formatSnap) return null;
  return cutoffSnapshotFor(formatSnap, ratingCutoff);
}

// ----------------------------------------------------------------------------
// Public API
// ----------------------------------------------------------------------------

/** Raw metadata about the committed snapshot (no hydration, always available). */
export function getSmogonSnapshotInfo(): {
  month: string;
  fetchedAt: string;
  sourceUrl: string;
  sourceName: string;
  rankChangeAvailable: boolean;
  rankChangeSourceMonth: string | null;
  notes: string[];
} {
  return { ...snapshot.metadata };
}

/** Formats present in the snapshot, for building a format selector. */
export function getAvailableBattleFormats(): BattleFormatInfo[] {
  return Object.values(snapshot.formats).map((formatSnap) => {
    const cutoffSnap = cutoffSnapshotFor(formatSnap, formatSnap.defaultCutoff);
    return {
      format: formatSnap.format,
      defaultCutoff: formatSnap.defaultCutoff,
      cutoffs: Object.keys(formatSnap.cutoffs).map((key) => Number(key)),
      battles: cutoffSnap?.battles ?? 0,
      lastUpdated: cutoffSnap?.lastUpdated ?? '',
    };
  });
}

/** The snapshot's default rating cutoff for a format, or null if absent. */
export function getDefaultRatingCutoff(format: BattleFormatId): RatingCutoff | null {
  const formatSnap = snapshot.formats[format];
  return formatSnap ? formatSnap.defaultCutoff : null;
}

/**
 * Synchronous seed lookup: returns the raw snapshot record for a Pokémon in a
 * format (usage/rank/sections) without PokéAPI hydration. Returns null when
 * the format, cutoff or species isn't in the snapshot.
 */
export function getPokemonBattleDataSeed(
  pokemon: string,
  format: BattleFormatId,
  ratingCutoff?: RatingCutoff,
): { pokemon: string; seed: SmogonPokemonSeed; cutoff: SmogonCutoffSnapshot } | null {
  const cutoffSnap = snapshotCutoffFor(format, ratingCutoff);
  if (!cutoffSnap) return null;
  const found = findSpeciesSeed(cutoffSnap, pokemon);
  if (!found) return null;
  return { pokemon: found.name, seed: found.seed, cutoff: cutoffSnap };
}

/**
 * Full BattleData for a Pokémon in a format: usage/rank sections from the
 * committed Smogon snapshot, hydrated with PokéAPI metadata (moves/items/
 * abilities). Returns null when the snapshot has no data for the request.
 */
export async function getPokemonBattleData(
  pokemon: string,
  format: BattleFormatId,
  options: BattleDataOptions = {},
): Promise<BattleData | null> {
  const located = getPokemonBattleDataSeed(pokemon, format, options.ratingCutoff);
  if (!located) return null;
  const { pokemon: name, seed, cutoff } = located;
  const fetchOptions = options.fetchOptions ?? {};

  const [moves, items, abilities] = await Promise.all([
    hydrateRankedRows(seed.moves, (entry) => hydrateRankedMove(entry, fetchOptions)),
    hydrateRankedRows(seed.items, (entry) => hydrateRankedItem(entry, fetchOptions)),
    hydrateRankedRows(seed.abilities, (entry) => hydrateRankedAbility(entry, fetchOptions)),
  ]);

  return {
    pokemon: name,
    format,
    rank: seed.rank,
    rankChange: seed.rankChange ?? 0,
    usagePercent: seed.usagePercent,
    rawCount: seed.rawCount,
    ratingCutoff: cutoff.cutoff,
    moves,
    items,
    abilities,
    spreads: seed.spreads.map(toRankedSpread),
    teammates: seed.teammates.map(toRankedTeammate),
    checksAndCounters: seed.checksAndCounters.map(toRankedMatchup),
    lastUpdated: cutoff.lastUpdated,
    // Smogon monthly dumps expose move *usage* only — per-move win/loss
    // correlation is not available, so the winning/losing move tabs render an
    // explicit 'Not enough data' state rather than fabricated numbers.
    winningMoves: undefined,
    losingMoves: undefined,
    derivedMetrics: 'not-enough-data',
  };
}

// ----------------------------------------------------------------------------
// Hydration + mapping
// ----------------------------------------------------------------------------

async function hydrateRankedRows<T>(
  seeds: SmogonRankedRowSeed[],
  hydrate: (seed: SmogonRankedRowSeed) => Promise<T | null>,
): Promise<T[]> {
  const results: Array<T | null> = await Promise.all(seeds.map((seed) => hydrate(seed)));
  return results.filter((entry): entry is T => entry !== null);
}

function toRankedSpread(seed: SmogonSpreadSeed): RankedSpread {
  return {
    rank: seed.rank,
    nature: seed.nature,
    evs: seed.evs,
    evsText: seed.evsText,
    usagePercent: seed.usagePercent,
  };
}

function toRankedTeammate(seed: SmogonRankedRowSeed): RankedTeammate {
  return {
    rank: seed.rank,
    name: seed.name,
    usagePercent: seed.usagePercent,
    spriteUrl: getSpriteUrl(seed.name),
  };
}

function toRankedMatchup(seed: SmogonCheckSeed): RankedMatchup {
  return {
    rank: seed.rank,
    opponent: seed.opponent,
    usagePercent: seed.usagePercent,
    winRate: seed.winRate,
    lossRate: seed.lossRate,
    koChance: seed.koChanceText ?? (seed.koChance !== null ? String(seed.koChance) : null),
    spriteUrl: getSpriteUrl(seed.opponent),
  };
}

// Re-export the hydrated Ranked* row types for consumers that build on the
// BattleData contract without importing pokeapi.ts directly.
export type { RankedMove, RankedItem, RankedAbility, RankedMatchup, RankedTeammate, RankedSpread };
