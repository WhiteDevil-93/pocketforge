// ============================================================================
// PocketForge — Weakness Analyzer Utilities
// ============================================================================

import type { Team } from '../types';
import { TYPE_NAMES, getEffectiveness } from '../data/typesData';
import { getPokemonByName } from '../data/pokemonData';
import {
  getTeamDefensiveCoverage,
  getTeamOffensiveCoverage,
  getCoverageGaps,
} from './typeChart';

export interface TypeCoverageRow {
  /** Attacking type being analyzed */
  type: string;
  /** Number of team members weak to this type */
  weakCount: number;
  /** Number of team members that resist this type */
  resistCount: number;
  /** Number of team members immune to this type */
  immuneCount: number;
  /** Number of team members taking neutral damage */
  neutralCount: number;
  /** Pokémon (by species name) that resist or are immune to this type */
  coveredBy: string[];
  /** Pokémon (by species name) that are weak to this type */
  weakMembers: string[];
}

export interface WeaknessAnalysis {
  /** Per-type breakdown across the team */
  rows: TypeCoverageRow[];
  /** Rows where at least one team member is weak to the type, sorted by severity */
  weaknesses: TypeCoverageRow[];
  /** Attacking types the team currently lacks STAB coverage for */
  uncoveredOffensiveTypes: string[];
}

/**
 * Analyze a team's defensive weaknesses and which members cover each weakness.
 */
export function analyzeTeamWeaknesses(team: Team): WeaknessAnalysis {
  const defensive = getTeamDefensiveCoverage(team);

  const rows: TypeCoverageRow[] = TYPE_NAMES.map((attackingType) => {
    const stats = defensive[attackingType];
    const coveredBy: string[] = [];
    const weakMembers: string[] = [];

    for (const pokemon of team.pokemon) {
      const dexEntry = getPokemonByName(pokemon.species);
      if (!dexEntry) continue;

      const effectiveness = getEffectiveness(attackingType, dexEntry.types);
      const displayName = pokemon.nickname || pokemon.species;

      if (effectiveness === 0 || effectiveness < 1) {
        coveredBy.push(displayName);
      } else if (effectiveness > 1) {
        weakMembers.push(displayName);
      }
    }

    return {
      type: attackingType,
      weakCount: stats.weak,
      resistCount: stats.resist,
      immuneCount: stats.immune,
      neutralCount: stats.neutral,
      coveredBy,
      weakMembers,
    };
  });

  const weaknesses = rows
    .filter((row) => row.weakCount > 0)
    .sort((a, b) => {
      // Most severe first: highest weak count, then lowest coverage
      if (b.weakCount !== a.weakCount) return b.weakCount - a.weakCount;
      return a.coveredBy.length - b.coveredBy.length;
    });

  const { uncoveredTypes } = getCoverageGaps(team);

  return {
    rows,
    weaknesses,
    uncoveredOffensiveTypes: uncoveredTypes,
  };
}

/**
 * Suggest attacking types the team should add STAB coverage for.
 * Returns the list of types currently not covered super-effectively
 * by any team member's STAB.
 */
export function suggestCoverageMoves(team: Team): string[] {
  const offensive = getTeamOffensiveCoverage(team);
  return TYPE_NAMES.filter((type) => !offensive[type]);
}
