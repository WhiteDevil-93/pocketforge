// ============================================================================
// PocketForge — Type Coverage Utilities
// ============================================================================

import type { Team } from '../types';
import { getEffectiveness, TYPE_NAMES } from '../data/typesData';
import { getPokemonByName } from '../data/pokemonData';

/**
 * Get offensive type coverage for a single Pokemon's moves
 */
export function getMoveCoverage(_moves: string[]): Record<string, boolean> {
  const coverage: Record<string, boolean> = {};
  for (const type of TYPE_NAMES) {
    coverage[type] = false;
  }

  // This is a simplified version - would need move data to map moves to types
  // For now, we assume moves are stored with their types elsewhere
  // A full implementation would look up each move's type and mark it

  return coverage;
}

/**
 * Get team defensive coverage — how many team members are weak/resist/immune to each type
 */
export function getTeamDefensiveCoverage(team: Team): Record<string, { weak: number; resist: number; immune: number; neutral: number }> {
  const result: Record<string, { weak: number; resist: number; immune: number; neutral: number }> = {};

  // Initialize
  for (const type of TYPE_NAMES) {
    result[type] = { weak: 0, resist: 0, immune: 0, neutral: 0 };
  }

  for (const pokemon of team.pokemon) {
    const dexEntry = getPokemonByName(pokemon.species);
    if (!dexEntry) continue;

    const types = dexEntry.types;

    for (const attackingType of TYPE_NAMES) {
      const effectiveness = getEffectiveness(attackingType, types);

      if (effectiveness === 0) {
        result[attackingType].immune++;
      } else if (effectiveness > 1) {
        result[attackingType].weak++;
      } else if (effectiveness < 1) {
        result[attackingType].resist++;
      } else {
        result[attackingType].neutral++;
      }
    }
  }

  return result;
}

/**
 * Get team offensive coverage — which types the team can hit super-effectively
 * Based on STAB types of all team members
 */
export function getTeamOffensiveCoverage(team: Team): Record<string, boolean> {
  const coverage: Record<string, boolean> = {};
  for (const type of TYPE_NAMES) {
    coverage[type] = false;
  }

  for (const pokemon of team.pokemon) {
    const dexEntry = getPokemonByName(pokemon.species);
    if (!dexEntry) continue;

    for (const stabType of dexEntry.types) {
      for (const targetType of TYPE_NAMES) {
        if (getEffectiveness(stabType, [targetType]) > 1) {
          coverage[targetType] = true;
        }
      }
    }
  }

  return coverage;
}

/**
 * Get a summary of type coverage gaps
 */
export function getCoverageGaps(team: Team): { uncoveredTypes: string[]; weakTypes: string[] } {
  const offensive = getTeamOffensiveCoverage(team);
  const defensive = getTeamDefensiveCoverage(team);

  const uncoveredTypes = Object.entries(offensive)
    .filter(([, covered]) => !covered)
    .map(([type]) => type);

  const weakTypes = Object.entries(defensive)
    .filter(([, stats]) => stats.weak > stats.resist + stats.immune)
    .map(([type]) => type);

  return { uncoveredTypes, weakTypes };
}

/**
 * Calculate a team balance score (0-100)
 */
export function getTeamBalanceScore(team: Team): number {
  if (team.pokemon.length === 0) return 0;

  const defensive = getTeamDefensiveCoverage(team);
  const offensive = getTeamOffensiveCoverage(team);

  // Count how many types are covered offensively
  const coveredTypes = Object.values(offensive).filter(Boolean).length;
  const offensiveScore = (coveredTypes / TYPE_NAMES.length) * 50;

  // Count how many types the team isn't heavily weak to
  let defensiveScore = 0;
  for (const type of TYPE_NAMES) {
    const stats = defensive[type];
    if (stats.weak === 0 || stats.resist + stats.immune >= stats.weak) {
      defensiveScore += 50 / TYPE_NAMES.length;
    }
  }

  return Math.round(offensiveScore + defensiveScore);
}
