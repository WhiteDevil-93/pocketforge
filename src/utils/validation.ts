// ============================================================================
// PocketForge — Team Validation Utilities
// ============================================================================

import type { Team, Pokemon, ValidationResult } from '../types';
import { getTotalEVs } from './statCalc';
import { getPokemonByName } from '../data/pokemonData';
import { FORMATS } from '../data/formatsData';
import {
  isEligibleForChampionsMA,
  isChampionsItemLegal,
  isMoveLegalForChampionsSpecies,
  isChampionsFormatId,
} from '../data/championsLegality';
import { isMegaStone } from '../data/megaData';
import { Dex, getGen, parseFormatGen } from '../lib/showdown';

function isChampionsFormat(formatId: string): boolean {
  return isChampionsFormatId(formatId);
}

/**
 * Helper to resolve the base species name to check learnsets.
 * Battle-only and Mega/Gmax forms inherit learnsets from their base species.
 */
function getBaseSpeciesName(speciesName: string, gen: any): string {
  const spec = gen.species.get(speciesName) || Dex.species.get(speciesName);
  if (spec) {
    if (spec.battleOnly && typeof spec.battleOnly === 'string') {
      return spec.battleOnly;
    }
    if (spec.changesFrom && typeof spec.changesFrom === 'string') {
      return spec.changesFrom;
    }
    if (spec.baseSpecies && spec.baseSpecies !== spec.name) {
      return spec.baseSpecies;
    }
  }
  return speciesName.split('-')[0];
}

/**
 * Validate a single Pokemon's EV spread
 */
function validatePokemonEVs(pokemon: Pokemon, index: number, formatId?: string): string[] {
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

  for (const [stat, value] of Object.entries(pokemon.ivs)) {
    if (value > 31) {
      errors.push(`Pokemon #${index + 1} (${pokemon.species}): ${stat.toUpperCase()} IV (${value}) exceeds 31`);
    }
    if (value < 0) {
      errors.push(`Pokemon #${index + 1} (${pokemon.species}): ${stat.toUpperCase()} IV cannot be negative`);
    }
  }

  if (pokemon.level < 1 || pokemon.level > 100) {
    errors.push(`Pokemon #${index + 1} (${pokemon.species}): Level must be 1-100`);
  }

  if (formatId && isChampionsFormat(formatId) && pokemon.level !== 50) {
    errors.push(`Pokemon #${index + 1} (${pokemon.species}): Level must be 50 in Champions formats`);
  }

  if (pokemon.moves.length === 0) {
    errors.push(`Pokemon #${index + 1} (${pokemon.species}): No moves selected`);
  }

  if (!pokemon.ability) {
    errors.push(`Pokemon #${index + 1} (${pokemon.species}): No ability selected`);
  }

  return errors;
}

function validateSpeciesClause(pokemon: Pokemon[]): string[] {
  const errors: string[] = [];
  const speciesCounts: Record<string, number> = {};

  for (const p of pokemon) {
    if (!p.species) continue;
    const species = p.species.toLowerCase();
    speciesCounts[species] = (speciesCounts[species] || 0) + 1;
  }

  for (const [species, count] of Object.entries(speciesCounts)) {
    if (count > 1) {
      const prettyName = species.charAt(0).toUpperCase() + species.slice(1);
      errors.push(`Species Clause: ${count} copies of ${prettyName} (max 1)`);
    }
  }

  return errors;
}

function validateMegaOnce(pokemon: Pokemon[]): string[] {
  const megaHolders = pokemon.filter((p) => p.item && isMegaStone(p.item));
  if (megaHolders.length > 1) {
    return [
      `Mega Once: ${megaHolders.length} Pokémon hold Mega Stones (${megaHolders.map((p) => p.species).join(', ')}). Only one may Mega Evolve per battle.`,
    ];
  }
  return [];
}

/**
 * Validate a full team against format rules
 */
export async function validateTeam(team: Team, formatId?: string): Promise<ValidationResult> {
  const errors: string[] = [];

  if (!team.name || team.name.trim().length === 0) {
    errors.push('Team name is required');
  }

  if (team.pokemon.length === 0) {
    errors.push('Team must have at least 1 Pokemon');
  }
  if (team.pokemon.length > 6) {
    errors.push('Team cannot have more than 6 Pokemon');
  }

  const format = formatId || team.format;
  const genNum = parseFormatGen(format);
  const gen = getGen(genNum);

  for (let i = 0; i < team.pokemon.length; i++) {
    const mon = team.pokemon[i];
    const pokeErrors = validatePokemonEVs(mon, i, format);
    errors.push(...pokeErrors);

    const dexEntry = getPokemonByName(mon.species);
    if (!dexEntry) {
      errors.push(`Pokemon #${i + 1}: Unknown species "${mon.species}"`);
    } else {
      // Validate move legality using learnset API
      const baseSpecies = getBaseSpeciesName(mon.species, gen);
      for (const move of mon.moves) {
        if (move) {
          try {
            const canLearn = await gen.learnsets.canLearn(baseSpecies, move);
            if (!canLearn) {
              errors.push(`Pokemon #${i + 1} (${mon.species}): Cannot learn move "${move}" in Generation ${genNum}`);
            }
          } catch (err) {
            console.error(`Failed to validate move legality for ${mon.species} - ${move}:`, err);
          }
        }
      }
    }
  }

  errors.push(...validateSpeciesClause(team.pokemon));

  if (format) {
    const formatData = FORMATS.find((f) => f.id === format);
    if (formatData) {
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
            const prettyItem = item.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            errors.push(`Item Clause: ${count} Pokemon hold ${prettyItem} (max 1 in ${formatData.name})`);
          }
        }
      }

      if (formatData.rules.includes('mega-once')) {
        errors.push(...validateMegaOnce(team.pokemon));
      }

      if (isChampionsFormat(formatData.id)) {
        for (let i = 0; i < team.pokemon.length; i++) {
          const mon = team.pokemon[i];
          if (!isEligibleForChampionsMA(mon.species)) {
            errors.push(`${mon.species} is not eligible for ${formatData.name}`);
          }
          if (mon.item && !isChampionsItemLegal(mon.item)) {
            errors.push(`${mon.species}: ${mon.item} is not legal in ${formatData.name}`);
          }
          for (const move of mon.moves) {
            if (move && !isMoveLegalForChampionsSpecies(mon.species, move)) {
              errors.push(`${mon.species}: ${move} is not legal in ${formatData.name}`);
            }
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

export async function isTeamValid(team: Team, formatId?: string): Promise<boolean> {
  const result = await validateTeam(team, formatId);
  return result.isValid;
}