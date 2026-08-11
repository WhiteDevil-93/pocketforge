// ============================================================================
// PocketForge — Battle Data shared types
// Every type used by the competitive stats panel, the Smogon snapshot loader,
// and the PokéAPI hydration layer lives here so later beads share one surface.
// ============================================================================

/** Physical / Special / Status classification of a move. */
export type MoveCategory = 'Physical' | 'Special' | 'Status' | (string & {});

/**
 * Smogon format identifier, e.g. 'gen9vgc2025' or 'gen9ou'.
 * The literal members cover the formats this app tracks; the `(string & {})`
 * fallback keeps new monthly formats from breaking the type.
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
  | 'gen9doublesou'
  | 'gen9randombattle'
  | (string & {});

/** Smogon rating cutoffs the monthly stats are published at (1500/1630/1760/1825+). */
export type RatingCutoff = 1500 | 1630 | 1760 | 1825 | (number & {});

export const RATING_CUTOFFS: readonly RatingCutoff[] = [1500, 1630, 1760, 1825] as const;

export const DEFAULT_RATING_CUTOFF: RatingCutoff = 1630;

/** Base of every ranked row in a Smogon dump: position + share of teams using it. */
export interface RankedEntryBase {
  rank: number;
  usagePercent: number;
}

/**
 * A ranked move from the usage dump, hydrated with PokéAPI metadata.
 * Hydration fields are nullable: usage data is always present, but a resource
 * may not exist on PokéAPI (Z-/Max moves) or the fetch may have failed.
 */
export interface RankedMove {
  rank: number;
  name: string;
  usagePercent: number;
  type: string | null;
  category: MoveCategory | null;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number | null;
  /** Human-readable target description, e.g. "All adjacent opponents". */
  target: string | null;
  effectShort: string | null;
  effectFull: string | null;
  spriteUrl: string | null;
}

export interface RankedItem {
  rank: number;
  name: string;
  usagePercent: number;
  description: string | null;
  spriteUrl: string | null;
}

export interface RankedAbility {
  rank: number;
  name: string;
  usagePercent: number;
  description: string | null;
  effectShort: string | null;
  effectFull: string | null;
}

export interface EvSpread {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export interface RankedSpread {
  rank: number;
  nature: string;
  evs: EvSpread;
  /** Compact EV spread string from the dump, e.g. '252 HP / 252 Atk / 4 Def'. */
  evsText: string | null;
  usagePercent: number;
}

export interface RankedTeammate {
  rank: number;
  name: string;
  usagePercent: number;
  spriteUrl: string | null;
}

export interface RankedMatchup {
  rank: number;
  /** Species name of the opposing Pokémon. */
  opponent: string;
  /** How often this Pokémon is used against the opponent's team. */
  usagePercent: number;
  winRate: number | null;
  lossRate: number | null;
  /** KO-chance text from the dump when the source provides it, else null. */
  koChance: string | null;
  spriteUrl: string | null;
}

/** Complete per-species competitive dataset for one format at one rating cutoff. */
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
  lastUpdated: string;
  /**
   * Best-effort derived metrics. Smogon dumps do not expose move-level
   * win/loss correlation, so these are either heuristic or absent.
   */
  winningMoves?: RankedMove[];
  losingMoves?: RankedMove[];
  derivedMetrics?: 'derived' | 'not-enough-data';
}

// ----------------------------------------------------------------------------
// Hydrated static-data payloads (PokéAPI layer)
// ----------------------------------------------------------------------------

export interface HydratedMove {
  id: string;
  name: string;
  type: string;
  category: MoveCategory;
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
  /** Human-readable target description, e.g. "All adjacent opponents". */
  target: string;
  effectShort: string;
  effectFull: string;
  spriteUrl: string;
}

export interface HydratedItem {
  id: string;
  name: string;
  description: string;
  spriteUrl: string;
}

export interface HydratedAbility {
  id: string;
  name: string;
  /** Short Pokédex-style description. */
  description: string;
  effectShort: string;
  effectFull: string;
}

export interface PokemonSpeciesInfo {
  id: number;
  name: string;
  genus: string;
  flavorText: string;
  spriteUrl: string;
  types: string[];
}
