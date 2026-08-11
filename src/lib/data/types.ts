// ============================================================================
// PocketForge — Battle Data shared types
// All types for the competitive Battle Data feature live here (NOT src/types).
// ============================================================================

/**
 * Identifiers for Smogon ladder formats. The union covers the formats the
 * Battle Data pipeline targets; the `(string & {})` tail keeps the type open
 * so arbitrary future format ids (new gens/VGC regulations) remain assignable.
 */
export type BattleFormatId =
  | 'gen9vgc2025'
  | 'gen9vgc2024'
  | 'gen9vgc2023'
  | 'gen9ou'
  | 'gen9uu'
  | 'gen9ru'
  | 'gen9nu'
  | 'gen9pu'
  | 'gen9zu'
  | 'gen9ubers'
  | 'gen9anythinggoes'
  | 'gen8ou'
  | 'gen8vgc2021'
  | 'gen7ou'
  | 'gen6ou'
  | 'gen5ou'
  | 'gen4ou'
  | 'gen3ou'
  | 'gen2ou'
  | 'gen1ou'
  | (string & {});

/**
 * Smogon monthly-stats rating cutoffs. 0 = all players, otherwise the standard
 * ladder tiers (1500/1630/1760/1825). The `(number & {})` tail keeps the union
 * open for cutoffs Smogon may add in the future.
 */
export type RatingCutoff = 0 | 1500 | 1630 | 1760 | 1825 | (number & {});

/** Physical / Special / Status classification for a move. */
export type MoveCategory = 'Physical' | 'Special' | 'Status';

/** The six EV stats, in Smogon spread order (HP / Atk / Def / SpA / SpD / Spe). */
export type EvStat = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe';

/** A nature + EV allocation, e.g. { hp: 252, atk: 252, def: 4 }. */
export type EvSpread = Partial<Record<EvStat, number>>;

/** Where a hydrated value came from — local generated data and/or PokéAPI. */
export type HydrationSource = 'local' | 'pokeapi' | 'mixed';

/** One ranked move inside a BattleData payload. */
export interface RankedMove {
  rank: number;
  name: string;
  usagePercent: number;
  type: string;
  category: MoveCategory;
  power: number;
  accuracy: number;
  pp: number;
  priority: number;
  target: string;
  effectShort: string;
  effectFull: string;
  spriteUrl: string;
}

/** One ranked held item inside a BattleData payload. */
export interface RankedItem {
  rank: number;
  name: string;
  usagePercent: number;
  description: string;
  spriteUrl: string;
}

/** One ranked ability inside a BattleData payload. */
export interface RankedAbility {
  rank: number;
  name: string;
  usagePercent: number;
  description: string;
  shortDescription: string;
}

/** One ranked nature + EV spread inside a BattleData payload. */
export interface RankedSpread {
  rank: number;
  nature: string;
  evs: EvSpread;
  /** Human-readable spread, e.g. '252 HP / 252 Atk / 4 Def'. */
  evsText: string;
  usagePercent: number;
}

/** One ranked teammate inside a BattleData payload. */
export interface RankedTeammate {
  rank: number;
  name: string;
  usagePercent: number;
  spriteUrl: string;
}

/**
 * One entry from the Smogon 'Checks and Counters' section. Win/loss rates and
 * KO chances are only present in some dump versions — nullable fields are
 * `null` when the source dump did not carry them.
 */
export interface RankedMatchup {
  rank: number;
  opponent: string;
  /** Usage % of the opponent against this Pokémon. */
  usagePercent: number;
  winRate: number | null;
  lossRate: number | null;
  /** KO chance as a percentage (0-100), when reported. */
  koChance: number | null;
  /** Free-form KO chance text from the dump, when reported. */
  koChanceText: string | null;
  /** Switch-in chance as a percentage (0-100), when reported. */
  switchInChance: number | null;
  spriteUrl: string;
}

/**
 * Derived 'Winning Moves' / 'Losing Moves' lists.
 *
 * Smogon monthly dumps do NOT expose per-move win/loss correlation, so these
 * lists are empty unless `available` is true. Every value must come straight
 * from the parsed dump — when the heuristic cannot be computed honestly,
 * `available` is `false` and `method` explains why, so the UI can render an
 * explicit 'Not enough data' state instead of fabricated numbers.
 */
export interface MatchupMoves {
  /** True when the derivation below produced real, dump-backed lists. */
  available: boolean;
  /** How the lists were derived (or why they are empty / flagged). */
  method: string;
  winningMoves: RankedMove[];
  losingMoves: RankedMove[];
}

/** The full competitive profile for one Pokémon in one format. */
export interface BattleData {
  pokemon: string;
  format: BattleFormatId;
  rank: number;
  rankChange: number;
  usagePercent: number;
  rawCount: number;
  ratingCutoff: RatingCutoff;
  moves: RankedMove[];
  items: RankedItem[];
  abilities: RankedAbility[];
  spreads: RankedSpread[];
  teammates: RankedTeammate[];
  checksAndCounters: RankedMatchup[];
  /** Derived winning/losing move lists (empty + flagged when unavailable). */
  matchupMoves: MatchupMoves;
  lastUpdated: string;
}

// ----------------------------------------------------------------------------
// Hydrated (PokéAPI-enriched) shapes returned by src/lib/data/pokeapi.ts
// ----------------------------------------------------------------------------

/** A move hydrated from local data + PokéAPI, ready for RankedMove rendering. */
export interface HydratedMove {
  id: number | null;
  name: string;
  type: string;
  category: MoveCategory;
  power: number;
  accuracy: number;
  pp: number;
  priority: number;
  target: string;
  effectShort: string;
  effectFull: string;
  spriteUrl: string;
  source: HydrationSource;
}

/** An item hydrated from local data + PokéAPI, ready for RankedItem rendering. */
export interface HydratedItem {
  id: number | null;
  name: string;
  description: string;
  category: string;
  spriteUrl: string;
  source: HydrationSource;
}

/** An ability hydrated from PokéAPI (no local ability file exists yet). */
export interface HydratedAbility {
  id: number | null;
  name: string;
  description: string;
  shortDescription: string;
  source: HydrationSource;
}

/** A species hydrated from local data + PokéAPI. */
export interface HydratedSpecies {
  id: number | null;
  name: string;
  types: string[];
  abilities: string[];
  /** Showdown sprite URL (or PokéAPI sprite when the species is API-only). */
  spriteUrl: string;
  /** PokéAPI official artwork URL when available. */
  officialArtworkUrl: string | null;
  source: HydrationSource;
}
