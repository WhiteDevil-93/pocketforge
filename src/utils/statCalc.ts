// ============================================================================
// PocketForge — Stat Calculation Utilities
// ============================================================================

import type { EVs, IVs } from '../types';
import { getGen } from '../lib/showdown';

/**
 * Calculate a non-HP stat value using @pkmn/data engine
 */
export function calculateStat(
  baseStat: number,
  ev: number,
  iv: number,
  level: number,
  nature: string,
  statName: string
): number {
  const gen = getGen(9);
  const statKey = statName.toLowerCase() as any;
  const natureObj = gen.natures.get(nature);
  return gen.stats.calc(statKey, baseStat, iv, ev, level, natureObj);
}

/**
 * Calculate HP stat value using @pkmn/data engine
 */
export function calculateHP(
  baseHP: number,
  ev: number,
  iv: number,
  level: number
): number {
  const gen = getGen(9);
  return gen.stats.calc('hp', baseHP, iv, ev, level);
}

/**
 * Get nature multiplier for a stat (delegates to @pkmn/data)
 */
export function getNatureMultiplier(nature: string, stat: string): number {
  const gen = getGen(9);
  const natureObj = gen.natures.get(nature);
  if (!natureObj) return 1.0;
  if (natureObj.plus === stat.toLowerCase()) return 1.1;
  if (natureObj.minus === stat.toLowerCase()) return 0.9;
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
    def: calculateStat(baseStats.def, evs.def, evs.def, level, nature, "def"),
    spa: calculateStat(baseStats.spa, evs.spa, evs.spa, level, nature, "spa"),
    spd: calculateStat(baseStats.spd, evs.spd, evs.spd, level, nature, "spd"),
    spe: calculateStat(baseStats.spe, evs.spe, evs.spe, level, nature, "spe"),
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
