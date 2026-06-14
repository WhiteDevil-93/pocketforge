// ============================================================================
// PocketForge — Team Validation Utilities
// ============================================================================

import type { Team, Pokemon, ValidationResult } from '../types';
import { getTotalEVs } from './statCalc';
import { getPokemonByName } from '../data/pokemonData';
import { FORMATS } from '../data/formatsData';

/**
 * Validate a single Pokemon's EV spread
 */
function validatePokemonEVs(pokemon: Pokemon, index: number): string[] {
  const errors: string[] = [];
  const totalEVs = getTotalEVs(pokemon.evs);

  if (totalEVs > 508) {
    errors.push(`Pokemon #${index + 1} (${pokemon.species}): Total EVs (${totalEVs}) exceed 508`);
  }

  for (const [stat, value] of Object.entries(pokemon.evs)) {
    if (value > 252) {
      errors.push(`Pokemon #${index + 1} (${pokemon.species}): ${stat.toUpperCase()} EV (${value}) exceeds 252`);
    }
    if (value < 0) {
      errors.push(`Pokemon #${index + 1} (${pokemon.species}): ${stat.toUpperCase()} EV cannot be negative`);
    }
  }

  // Check IV ranges
  for (const [stat, value] of Object.entries(pokemon.ivs)) {
    if (value > 31) {
      errors.push(`Pokemon #${index + 1} (${pokemon.species}): ${stat.toUpperCase()} IV (${value}) exceeds 31`);
    }
    if (value < 0) {
      errors.push(`Pokemon #${index + 1} (${pokemon.species}): ${stat.toUpperCase()} IV cannot be negative`);
    }
  }

  // Check level range
  if (pokemon.level < 1 || pokemon.level > 100) {
    errors.push(`Pokemon #${index + 1} (${pokemon.species}): Level must be 1-100`);
  }

  // Check moves count
  if (pokemon.moves.length === 0) {
    errors.push(`Pokemon #${index + 1} (${pokemon.species}): No moves selected`);
  }

  // Check ability
  if (!pokemon.ability) {
    errors.push(`Pokemon #${index + 1} (${pokemon.species}): No ability selected`);
  }

  return errors;
}

/**
 * Validate species clause (no duplicate species)
 */
function validateSpeciesClause(pokemon: Pokemon[]): string[] {
  const errors: string[] = [];
  const speciesCounts: Record<string, number> = {};

  for (const p of pokemon) {
    const species = p.species.toLowerCase();
    speciesCounts[species] = (speciesCounts[species] || 0) + 1;
  }

  for (const [species, count] of Object.entries(speciesCounts)) {
    if (count > 1) {
      errors.push(`Species Clause: ${count} copies of ${species} (max 1)`);
    }
  }

  return errors;
}

/**
 * Validate a full team against format rules
 */
export function validateTeam(team: Team, formatId?: string): ValidationResult {
  const errors: string[] = [];

  // Check team name
  if (!team.name || team.name.trim().length === 0) {
    errors.push("Team name is required");
  }

  // Check Pokemon count
  if (team.pokemon.length === 0) {
    errors.push("Team must have at least 1 Pokemon");
  }
  if (team.pokemon.length > 6) {
    errors.push("Team cannot have more than 6 Pokemon");
  }

  // Validate each Pokemon
  for (let i = 0; i < team.pokemon.length; i++) {
    const pokeErrors = validatePokemonEVs(team.pokemon[i], i);
    errors.push(...pokeErrors);

    // Check if species exists
    const dexEntry = getPokemonByName(team.pokemon[i].species);
    if (!dexEntry) {
      errors.push(`Pokemon #${i + 1}: Unknown species "${team.pokemon[i].species}"`);
    }
  }

  // Species clause
  const speciesErrors = validateSpeciesClause(team.pokemon);
  errors.push(...speciesErrors);

  // Format-specific validation
  const format = formatId || team.format;
  if (format) {
    const formatData = FORMATS.find(f => f.id === format);
    if (formatData) {
      // Item clause check
      if (formatData.rules.includes('item-clause')) {
        const itemCounts: Record<string, number> = {};
        for (const p of team.pokemon) {
          if (p.item) {
            const item = p.item.toLowerCase();
            itemCounts[item] = (itemCounts[item] || 0) + 1;
          }
        }
        for (const [item, count] of Object.entries(itemCounts)) {
          if (count > 1) {
            errors.push(`Item Clause: ${count} Pokemon hold ${item} (max 1 in ${formatData.name})`);
          }
        }
      }

      // Gen 9-specific: Tera Type check
      if (formatData.generation >= 9) {
        for (let i = 0; i < team.pokemon.length; i++) {
          if (!team.pokemon[i].teraType) {
            // Warning-level: not an error but worth noting
            // errors.push(`Pokemon #${i + 1} (${team.pokemon[i].species}): No Tera Type set`);
          }
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Quick validation check (returns boolean only)
 */
export function isTeamValid(team: Team, formatId?: string): boolean {
  return validateTeam(team, formatId).isValid;
}
