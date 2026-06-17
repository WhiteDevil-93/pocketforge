// ============================================================================
// PocketForge — Pokemon Showdown Format Import/Export using @pkmn/sets
// ============================================================================

import { Team as ShowdownTeam } from '@pkmn/sets';
import { getDexForFormat, parseFormatGen } from '../lib/showdown';
import { DEFAULT_FORMAT } from '../data/formatsData';
import type { Team, Pokemon, EVs, IVs } from '../types';

export { parseFormatGen };

/**
 * Helper to ensure a statistics object is fully populated.
 */
function normalizeEVs(evs: any): EVs {
  return {
    hp: evs?.hp ?? 0,
    atk: evs?.atk ?? 0,
    def: evs?.def ?? 0,
    spa: evs?.spa ?? 0,
    spd: evs?.spd ?? 0,
    spe: evs?.spe ?? 0,
  };
}

function normalizeIVs(ivs: any): IVs {
  return {
    hp: ivs?.hp ?? 31,
    atk: ivs?.atk ?? 31,
    def: ivs?.def ?? 31,
    spa: ivs?.spa ?? 31,
    spd: ivs?.spd ?? 31,
    spe: ivs?.spe ?? 31,
  };
}

/**
 * Import a single Pokemon from Showdown format lines or text.
 */
export function importPokemonFromPSFormat(lines: string[]): Partial<Pokemon> {
  const text = lines.join('\n');
  let format = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('// Format:')) {
      format = trimmed.replace('// Format:', '').trim();
    }
  }
  try {
    const parsed = ShowdownTeam.import(text, getDexForFormat(format || 'gen9'));
    if (parsed && parsed.team && parsed.team.length > 0) {
      const mon = parsed.team[0];
      return {
        id: crypto.randomUUID(),
        species: mon.species || '',
        nickname: mon.name || undefined,
        level: mon.level || 100,
        gender: mon.gender as 'M' | 'F' | '',
        shiny: mon.shiny || false,
        ability: mon.ability || '',
        item: mon.item || undefined,
        teraType: mon.teraType || undefined,
        moves: mon.moves || [],
        evs: normalizeEVs(mon.evs),
        ivs: normalizeIVs(mon.ivs),
        nature: mon.nature || 'Serious',
      };
    }
  } catch (err) {
    console.error('Failed to import single Pokémon:', err);
  }
  return {};
}

/**
 * Export a single Pokemon to Showdown format string.
 */
export function exportPokemonToPSFormat(pokemon: Pokemon, formatOrGen: string | number = 9): string {
  const format = typeof formatOrGen === 'string' ? formatOrGen : `gen${formatOrGen}`;
  const pkmnSet = {
    name: pokemon.nickname || '',
    species: pokemon.species,
    gender: pokemon.gender,
    item: pokemon.item || '',
    ability: pokemon.ability,
    evs: { ...pokemon.evs },
    ivs: { ...pokemon.ivs },
    nature: pokemon.nature || 'Serious',
    level: pokemon.level || 100,
    shiny: pokemon.shiny || false,
    teraType: pokemon.teraType || '',
    moves: pokemon.moves || [],
  };

  try {
    const genDex = getDexForFormat(format);
    const team = new ShowdownTeam([pkmnSet], genDex);
    return team.export(genDex).trim();
  } catch (err) {
    console.error('Failed to export Pokémon:', err);
    return '';
  }
}

/**
 * Import a full team from Showdown format text.
 */
export function importTeamFromPSFormat(text: string): Partial<Team> {
  const team: Partial<Team> = {
    pokemon: [],
  };

  // Pre-parse the team to extract metadata like name and format,
  // and strip comments and header lines so they don't confuse the Showdown parser.
  let name = '';
  let format = '';
  const lines = text.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('===')) {
      const match = trimmed.match(/===\s*(.+?)\s*===/);
      if (match) name = match[1].trim();
    } else if (trimmed.startsWith('// Format:')) {
      format = trimmed.replace('// Format:', '').trim();
    }
  }

  // Filter out any lines starting with double-slash comments or header triple equals
  const cleanedText = lines
    .filter((l) => !l.trim().startsWith('//') && !l.trim().startsWith('==='))
    .join('\n');

  try {
    const genDex = getDexForFormat(format || 'gen9');
    const parsed = ShowdownTeam.import(cleanedText, genDex);
    if (parsed && parsed.team) {
      team.name = name || parsed.name || 'Imported Team';
      team.format = format || parsed.format || DEFAULT_FORMAT;
      team.pokemon = parsed.team.map((mon) => ({
        id: crypto.randomUUID(),
        species: mon.species || '',
        nickname: mon.name || undefined,
        level: mon.level || 100,
        gender: (mon.gender as 'M' | 'F' | '') || '',
        shiny: mon.shiny || false,
        ability: mon.ability || '',
        item: mon.item || undefined,
        teraType: mon.teraType || undefined,
        moves: mon.moves || [],
        evs: normalizeEVs(mon.evs),
        ivs: normalizeIVs(mon.ivs),
        nature: mon.nature || 'Serious',
      }));
    }
  } catch (err) {
    console.error('Failed to import Showdown team:', err);
    throw new Error(err instanceof Error ? err.message : 'Invalid Showdown format');
  }

  return team;
}

/**
 * Export a full team to Showdown format string.
 */
export function exportTeamToPSFormat(team: Team): string {
  const lines: string[] = [];

  if (team.name) {
    lines.push(`=== ${team.name} ===`);
    lines.push('');
  }

  if (team.format) {
    lines.push(`// Format: ${team.format}`);
  }

  const sets = team.pokemon.map((pokemon) => ({
    name: pokemon.nickname || '',
    species: pokemon.species,
    gender: pokemon.gender,
    item: pokemon.item || '',
    ability: pokemon.ability,
    evs: { ...pokemon.evs },
    ivs: { ...pokemon.ivs },
    nature: pokemon.nature || 'Serious',
    level: pokemon.level || 100,
    shiny: pokemon.shiny || false,
    teraType: pokemon.teraType || '',
    moves: pokemon.moves || [],
  }));

  try {
    const genDex = getDexForFormat(team.format);
    const showdownTeam = new ShowdownTeam(sets, genDex);
    const exportedText = showdownTeam.export(genDex);
    
    if (team.format && exportedText.trim().startsWith('// Format:')) {
      // The library might have prepended its own Format line, let's clean it up
      const exportedLines = exportedText.split('\n');
      if (exportedLines[0].trim().startsWith('// Format:')) {
        exportedLines.shift();
      }
      lines.push(exportedLines.join('\n'));
    } else {
      lines.push(exportedText);
    }
  } catch (err) {
    console.error('Failed to export team:', err);
  }

  return lines.join('\n');
}

/**
 * Validate Showdown format syntax.
 */
export function validateShowdownFormat(text: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!text.trim()) {
    return { isValid: false, errors: ['Empty input.'] };
  }

  try {
    const parsed = importTeamFromPSFormat(text);
    if (!parsed.pokemon || parsed.pokemon.length === 0) {
      errors.push('No Pokémon detected. Make sure each entry has a species line.');
    } else {
      parsed.pokemon.forEach((p, i) => {
        if (!p.species) errors.push(`Pokémon #${i + 1}: missing species.`);
        if (p.moves && p.moves.length > 4) errors.push(`Pokémon #${i + 1}: more than 4 moves.`);
      });
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : 'Invalid Showdown format syntax.');
  }

  return { isValid: errors.length === 0, errors };
}
