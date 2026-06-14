// ============================================================================
// PocketForge — Stat Calculation Utilities
// ============================================================================

import type { EVs, IVs } from '../types';
import { getNatureByName } from '../data/naturesData';

/**
 * Calculate a non-HP stat value
 * Formula: ((2 * Base + IV + EV/4) * Level/100 + 5) * Nature
 */
export function calculateStat(
  baseStat: number,
  ev: number,
  iv: number,
  level: number,
  nature: string,
  statName: string
): number {
  const natureMultiplier = getNatureMultiplier(nature, statName);
  const evPortion = Math.floor(ev / 4);
  const base = 2 * baseStat + iv + evPortion;
  const scaled = Math.floor((base * level) / 100);
  const raw = Math.floor((scaled + 5) * natureMultiplier);
  return raw;
}

/**
 * Calculate HP stat value
 * Formula: ((2 * Base + IV + EV/4) * Level/100) + Level + 10
 */
export function calculateHP(
  baseHP: number,
  ev: number,
  iv: number,
  level: number
): number {
  const evPortion = Math.floor(ev / 4);
  const base = 2 * baseHP + iv + evPortion;
  const scaled = Math.floor((base * level) / 100);
  return scaled + level + 10;
}

/**
 * Get nature multiplier for a stat
 */
export function getNatureMultiplier(nature: string, stat: string): number {
  const n = getNatureByName(nature);
  if (!n) return 1.0;

  const s = stat.toLowerCase();
  if (n.increased === s) return 1.1;
  if (n.decreased === s) return 0.9;
  return 1.0;
}

/**
 * Get total EVs invested
 */
export function getTotalEVs(evs: EVs): number {
  return evs.hp + evs.atk + evs.def + evs.spa + evs.spd + evs.spe;
}

/**
 * Get remaining EVs (max 508 usable, 510 total)
 */
export function getRemainingEVs(evs: EVs): number {
  return 508 - getTotalEVs(evs);
}

/**
 * Check if EV spread is valid (total <= 508, each stat <= 252)
 */
export function isValidEVSpread(evs: EVs): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const total = getTotalEVs(evs);

  if (total > 508) {
    errors.push(`Total EVs (${total}) exceed 508`);
  }

  for (const [stat, value] of Object.entries(evs)) {
    if (value > 252) {
      errors.push(`${stat.toUpperCase()} EV (${value}) exceeds 252`);
    }
    if (value < 0) {
      errors.push(`${stat.toUpperCase()} EV cannot be negative`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Calculate all stats for a Pokemon at once
 */
export function calculateAllStats(
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number },
  evs: EVs,
  ivs: IVs,
  level: number,
  nature: string
): { hp: number; atk: number; def: number; spa: number; spd: number; spe: number } {
  return {
    hp: calculateHP(baseStats.hp, evs.hp, ivs.hp, level),
    atk: calculateStat(baseStats.atk, evs.atk, ivs.atk, level, nature, "atk"),
    def: calculateStat(baseStats.def, evs.def, ivs.def, level, nature, "def"),
    spa: calculateStat(baseStats.spa, evs.spa, ivs.spa, level, nature, "spa"),
    spd: calculateStat(baseStats.spd, evs.spd, ivs.spd, level, nature, "spd"),
    spe: calculateStat(baseStats.spe, evs.spe, ivs.spe, level, nature, "spe"),
  };
}

/**
 * Get stat color class name
 */
export function getStatColorClass(stat: string): string {
  const map: Record<string, string> = {
    hp: "text-stat-hp",
    atk: "text-stat-atk",
    def: "text-stat-def",
    spa: "text-stat-spa",
    spd: "text-stat-spd",
    spe: "text-stat-spe",
  };
  return map[stat.toLowerCase()] || "";
}

/**
 * Get stat abbreviation
 */
export function getStatAbbreviation(stat: string): string {
  const map: Record<string, string> = {
    hp: "HP", atk: "Atk", def: "Def", spa: "SpA", spd: "SpD", spe: "Spe",
  };
  return map[stat.toLowerCase()] || stat.toUpperCase();
}
