// ============================================================================
// PocketForge — Pokemon Showdown Format Import/Export
// ============================================================================

import type { Team, Pokemon, EVs, IVs } from '../types';
import { getPokemonByName as _getPokemonByName } from '../data/pokemonData';
void _getPokemonByName;

const DEFAULT_EVS: EVs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
const DEFAULT_IVS: IVs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };

/**
 * Parse an EV/IV line like "EVs: 252 HP / 4 Atk / 252 Spe"
 */
function parseEVsIVs(line: string, maxVal: number): Partial<EVs> {
  const result: Partial<EVs> = {};
  const parts = line.split(':'); // Remove prefix like "EVs:"
  const values = parts.length > 1 ? parts[1] : line;
  const entries = values.split('/');

  for (const entry of entries) {
    const match = entry.trim().match(/^(\\d+)\\s+(hp|atk|def|spa|spd|spe)$/i);
    if (match) {
      const val = parseInt(match[1], 10);
      const stat = match[2].toLowerCase() as keyof EVs;
      result[stat] = Math.min(val, maxVal);
    }
  }
  return result;
}

/**
 * Parse a nature line like "Modest Nature"
 */
function parseNature(line: string): string {
  const match = line.match(/^(\\w+)\\s+Nature/i);
  return match ? match[1] : "Serious";
}

/**
 * Parse an ability line like "Ability: Blaze"
 */
function parseAbility(line: string): string {
  const match = line.match(/^Ability:\\s*(.+)$/i);
  return match ? match[1].trim() : "";
}

/**
 * Parse level like "Level: 50"
 */
function parseLevel(line: string): number {
  const match = line.match(/^Level:\\s*(\\d+)$/i);
  return match ? parseInt(match[1], 10) : 100;
}

/**
 * Parse gender from line or species marker
 */
function parseGender(speciesLine: string): 'M' | 'F' | '' {
  if (speciesLine.includes('(M)')) return 'M';
  if (speciesLine.includes('(F)')) return 'F';
  return '';
}

/**
 * Parse shiny
 */
function parseShiny(line: string): boolean {
  return line.toLowerCase().includes('shiny: yes');
}

/**
 * Parse tera type
 */
function parseTeraType(line: string): string {
  const match = line.match(/^Tera Type:\\s*(.+)$/i);
  return match ? match[1].trim() : "";
}

/**
 * Parse happiness
 */
function _parseHappiness(line: string): number | undefined {
  const match = line.match(/^Happiness:\\s*(\\d+)$/i);
  return match ? parseInt(match[1], 10) : undefined;
}
(void _parseHappiness);

/**
 * Clean species name from line like "Charizard (M) @ Choice Specs"
 */
function parseSpecies(line: string): string {
  // Remove item (everything after @)
  let cleaned = line.split('@')[0].trim();
  // Remove gender marker
  cleaned = cleaned.replace(/\\s*\\([MF]\\)/, '');
  // Remove nickname (format: "Nickname (Species)")
  const nicknameMatch = cleaned.match(/^\\w+\\s*\\((.+?)\\)$/);
  if (nicknameMatch) {
    return nicknameMatch[1].trim();
  }
  // Remove leading dash if present
  cleaned = cleaned.replace(/^-\\s*/, '');
  return cleaned.trim();
}

/**
 * Parse item from line like "Charizard @ Choice Specs"
 */
function parseItem(line: string): string {
  const match = line.match(/@\\s*(.+)$/);
  return match ? match[1].trim() : "";
}

/**
 * Parse nickname from line like "Zard (Charizard) @ Choice Specs"
 */
function parseNickname(line: string): string | undefined {
  const cleaned = line.split('@')[0].trim();
  const parenIdx = cleaned.indexOf('(');
  if (parenIdx > 0) {
    return cleaned.slice(0, parenIdx).trim() || undefined;
  }
  return undefined;
}

/**
 * Import a single Pokemon from PS format lines
 */
export function importPokemonFromPSFormat(lines: string[]): Partial<Pokemon> {
  const pokemon: Partial<Pokemon> = {
    level: 100,
    gender: '',
    shiny: false,
    moves: [],
    evs: { ...DEFAULT_EVS },
    ivs: { ...DEFAULT_IVS },
    nature: "Serious",
  };

  let moveLines: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('-')) {
      // Move line
      const moveName = line.substring(1).trim();
      if (moveName) moveLines.push(moveName);
    } else if (line.startsWith('Ability:')) {
      pokemon.ability = parseAbility(line);
    } else if (line.startsWith('EVs:')) {
      const evs = parseEVsIVs(line, 252);
      pokemon.evs = { ...DEFAULT_EVS, ...evs };
    } else if (line.startsWith('IVs:')) {
      const ivs = parseEVsIVs(line, 31);
      pokemon.ivs = { ...DEFAULT_IVS, ...ivs };
    } else if (line.includes('Nature')) {
      pokemon.nature = parseNature(line);
    } else if (line.startsWith('Level:')) {
      pokemon.level = parseLevel(line);
    } else if (line.startsWith('Shiny:')) {
      pokemon.shiny = parseShiny(line);
    } else if (line.startsWith('Tera Type:')) {
      pokemon.teraType = parseTeraType(line);
    } else if (line.startsWith('Happiness:')) {
      // Not stored in our model
    } else {
      // Species line (first non-empty, non-move line)
      pokemon.species = parseSpecies(line);
      pokemon.gender = parseGender(line);
      const item = parseItem(line);
      if (item) pokemon.item = item;
      const nickname = parseNickname(line);
      if (nickname) pokemon.nickname = nickname;
    }
  }

  pokemon.moves = moveLines.slice(0, 4);
  return pokemon;
}

/**
 * Export a single Pokemon to PS format string
 */
export function exportPokemonToPSFormat(pokemon: Pokemon): string {
  const lines: string[] = [];

  // Species line with nickname and item
  let speciesLine = pokemon.species;
  if (pokemon.nickname) {
    speciesLine = `${pokemon.nickname} (${pokemon.species})`;
  }
  if (pokemon.gender) {
    speciesLine += ` (${pokemon.gender})`;
  }
  if (pokemon.item) {
    speciesLine += ` @ ${pokemon.item}`;
  }
  lines.push(speciesLine);

  // Ability
  if (pokemon.ability) {
    lines.push(`Ability: ${pokemon.ability}`);
  }

  // Level
  if (pokemon.level && pokemon.level !== 100) {
    lines.push(`Level: ${pokemon.level}`);
  }

  // Shiny
  if (pokemon.shiny) {
    lines.push(`Shiny: Yes`);
  }

  // Tera Type
  if (pokemon.teraType) {
    lines.push(`Tera Type: ${pokemon.teraType}`);
  }

  // EVs
  const evEntries = Object.entries(pokemon.evs)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${v} ${k.toUpperCase()}`)
    .join(' / ');
  if (evEntries) {
    lines.push(`EVs: ${evEntries}`);
  }

  // Nature
  lines.push(`${pokemon.nature} Nature`);

  // IVs (only show non-31 IVs)
  const ivEntries = Object.entries(pokemon.ivs)
    .filter(([, v]) => v !== 31)
    .map(([k, v]) => `${v} ${k.toUpperCase()}`)
    .join(' / ');
  if (ivEntries) {
    lines.push(`IVs: ${ivEntries}`);
  }

  // Moves
  for (const move of pokemon.moves) {
    lines.push(`- ${move}`);
  }

  return lines.join('\n');
}

/**
 * Import a full team from PS format text
 */
export function importTeamFromPSFormat(text: string): Partial<Team> {
  const lines = text.split('\n').map(l => l.trim());
  const team: Partial<Team> = {
    pokemon: [],
  };

  // Try to extract team name from first comment line
  if (lines[0]?.startsWith('===')) {
    const nameMatch = lines[0].match(/===\\s*(.+?)\\s*===/);
    if (nameMatch) team.name = nameMatch[1].trim();
  }

  // Parse each Pokemon (separated by blank lines)
  const pokemonBlocks: string[][] = [];
  let currentBlock: string[] = [];

  for (const line of lines) {
    if (line === '' || line.startsWith('===')) {
      if (currentBlock.length > 0) {
        pokemonBlocks.push(currentBlock);
        currentBlock = [];
      }
    } else {
      currentBlock.push(line);
    }
  }
  if (currentBlock.length > 0) {
    pokemonBlocks.push(currentBlock);
  }

  for (const block of pokemonBlocks.slice(0, 6)) {
    const parsed = importPokemonFromPSFormat(block);
    if (parsed.species) {
      team.pokemon!.push(parsed as Pokemon);
    }
  }

  return team;
}

/**
 * Export a full team to PS format string
 */
export function exportTeamToPSFormat(team: Team): string {
  const lines: string[] = [];

  // Team name header
  if (team.name) {
    lines.push(`=== ${team.name} ===`);
    lines.push('');
  }

  // Format
  if (team.format) {
    lines.push(`// Format: ${team.format}`);
  }

  // Each Pokemon (separated by blank lines)
  for (let i = 0; i < team.pokemon.length; i++) {
    if (i > 0) lines.push('');
    lines.push(exportPokemonToPSFormat(team.pokemon[i]));
  }

  return lines.join('\n');
}
