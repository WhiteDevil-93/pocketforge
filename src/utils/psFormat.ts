// ============================================================================
// PocketForge — Pokemon Showdown Format Import/Export
// ============================================================================

import type { Team, Pokemon, EVs, IVs } from '../types';

const DEFAULT_EVS: EVs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
const DEFAULT_IVS: IVs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };

/** Parse an EV/IV line like "EVs: 252 HP / 4 Atk / 252 Spe" */
function parseEVsIVs(line: string, maxVal: number): Partial<EVs> {
  const result: Partial<EVs> = {};
  const parts = line.split(':');
  const values = parts.length > 1 ? parts[1] : line;
  const entries = values.split('/');

  for (const entry of entries) {
    const match = entry.trim().match(/^(\d+)\s+(hp|atk|def|spa|spd|spe)$/i);
    if (match) {
      const val = parseInt(match[1], 10);
      const stat = match[2].toLowerCase() as keyof EVs;
      result[stat] = Math.min(val, maxVal);
    }
  }
  return result;
}

function parseNature(line: string): string {
  const match = line.match(/^(\w+)\s+Nature/i);
  return match ? match[1] : 'Serious';
}

function parseAbility(line: string): string {
  const match = line.match(/^Ability:\s*(.+)$/i);
  return match ? match[1].trim() : '';
}

function parseLevel(line: string): number {
  const match = line.match(/^Level:\s*(\d+)$/i);
  return match ? parseInt(match[1], 10) : 100;
}

function parseGender(speciesLine: string): 'M' | 'F' | '' {
  if (/\(M\)/.test(speciesLine)) return 'M';
  if (/\(F\)/.test(speciesLine)) return 'F';
  return '';
}

function parseShiny(line: string): boolean {
  return /shiny:\s*yes/i.test(line);
}

function parseTeraType(line: string): string {
  const match = line.match(/^Tera Type:\s*(.+)$/i);
  return match ? match[1].trim() : '';
}

/** Clean species name from line like "Zard (Charizard) (M) @ Choice Specs" */
function parseSpecies(line: string): string {
  let cleaned = line.split('@')[0].trim();
  cleaned = cleaned.replace(/\s*\((?:M|F)\)/g, '');
  // Nickname (Species) form
  const nicknameMatch = cleaned.match(/^.+?\s*\(([^)]+)\)\s*$/);
  if (nicknameMatch) return nicknameMatch[1].trim();
  cleaned = cleaned.replace(/^-\s*/, '');
  return cleaned.trim();
}

function parseItem(line: string): string {
  const match = line.match(/@\s*(.+)$/);
  return match ? match[1].trim() : '';
}

function parseNickname(line: string): string | undefined {
  const cleaned = line.split('@')[0].trim().replace(/\s*\((?:M|F)\)/g, '');
  const nicknameMatch = cleaned.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (nicknameMatch && nicknameMatch[1]) {
    return nicknameMatch[1].trim();
  }
  return undefined;
}

/** Import a single Pokemon from PS format lines */
export function importPokemonFromPSFormat(lines: string[]): Partial<Pokemon> {
  const pokemon: Partial<Pokemon> = {
    level: 100,
    gender: '',
    shiny: false,
    moves: [],
    evs: { ...DEFAULT_EVS },
    ivs: { ...DEFAULT_IVS },
    nature: 'Serious',
  };

  const moveLines: string[] = [];
  let speciesParsed = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('-')) {
      const moveName = line.substring(1).trim();
      if (moveName) moveLines.push(moveName);
    } else if (/^Ability:/i.test(line)) {
      pokemon.ability = parseAbility(line);
    } else if (/^EVs:/i.test(line)) {
      const evs = parseEVsIVs(line, 252);
      pokemon.evs = { ...DEFAULT_EVS, ...evs };
    } else if (/^IVs:/i.test(line)) {
      const ivs = parseEVsIVs(line, 31);
      pokemon.ivs = { ...DEFAULT_IVS, ...ivs };
    } else if (/Nature\b/i.test(line)) {
      pokemon.nature = parseNature(line);
    } else if (/^Level:/i.test(line)) {
      pokemon.level = parseLevel(line);
    } else if (/^Shiny:/i.test(line)) {
      pokemon.shiny = parseShiny(line);
    } else if (/^Tera Type:/i.test(line)) {
      pokemon.teraType = parseTeraType(line);
    } else if (/^Happiness:/i.test(line)) {
      // Not stored
    } else if (!speciesParsed) {
      pokemon.species = parseSpecies(line);
      pokemon.gender = parseGender(line);
      const item = parseItem(line);
      if (item) pokemon.item = item;
      const nickname = parseNickname(line);
      if (nickname && nickname !== pokemon.species) pokemon.nickname = nickname;
      speciesParsed = true;
    }
  }

  pokemon.moves = moveLines.slice(0, 4);
  return pokemon;
}

/** Export a single Pokemon to PS format string */
export function exportPokemonToPSFormat(pokemon: Pokemon): string {
  const lines: string[] = [];

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

  if (pokemon.ability) lines.push(`Ability: ${pokemon.ability}`);
  if (pokemon.level && pokemon.level !== 100) lines.push(`Level: ${pokemon.level}`);
  if (pokemon.shiny) lines.push('Shiny: Yes');
  if (pokemon.teraType) lines.push(`Tera Type: ${pokemon.teraType}`);

  const evEntries = Object.entries(pokemon.evs)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${v} ${k.toUpperCase()}`)
    .join(' / ');
  if (evEntries) lines.push(`EVs: ${evEntries}`);

  lines.push(`${pokemon.nature} Nature`);

  const ivEntries = Object.entries(pokemon.ivs)
    .filter(([, v]) => v !== 31)
    .map(([k, v]) => `${v} ${k.toUpperCase()}`)
    .join(' / ');
  if (ivEntries) lines.push(`IVs: ${ivEntries}`);

  for (const move of pokemon.moves) {
    lines.push(`- ${move}`);
  }

  return lines.join('\n');
}

/** Import a full team from PS format text */
export function importTeamFromPSFormat(text: string): Partial<Team> {
  const lines = text.split('\n').map((l) => l.trim());
  const team: Partial<Team> = {
    pokemon: [],
  };

  if (lines[0]?.startsWith('===')) {
    const nameMatch = lines[0].match(/===\s*(.+?)\s*===/);
    if (nameMatch) team.name = nameMatch[1].trim();
  }

  for (const line of lines) {
    const fmtMatch = line.match(/^\/\/\s*Format:\s*(\S+)/i);
    if (fmtMatch) {
      team.format = fmtMatch[1].trim();
      break;
    }
  }

  const pokemonBlocks: string[][] = [];
  let currentBlock: string[] = [];

  for (const line of lines) {
    if (line.startsWith('//')) continue;
    if (line === '' || line.startsWith('===')) {
      if (currentBlock.length > 0) {
        pokemonBlocks.push(currentBlock);
        currentBlock = [];
      }
    } else {
      currentBlock.push(line);
    }
  }
  if (currentBlock.length > 0) pokemonBlocks.push(currentBlock);

  for (const block of pokemonBlocks.slice(0, 6)) {
    const parsed = importPokemonFromPSFormat(block);
    if (parsed.species) {
      team.pokemon!.push(parsed as Pokemon);
    }
  }

  return team;
}

/** Export a full team to PS format string */
export function exportTeamToPSFormat(team: Team): string {
  const lines: string[] = [];

  if (team.name) {
    lines.push(`=== ${team.name} ===`);
    lines.push('');
  }

  if (team.format) {
    lines.push(`// Format: ${team.format}`);
  }

  for (let i = 0; i < team.pokemon.length; i++) {
    if (i > 0 || team.format) lines.push('');
    lines.push(exportPokemonToPSFormat(team.pokemon[i]));
  }

  return lines.join('\n');
}

/** Validate Showdown format syntax */
export function validateShowdownFormat(text: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!text.trim()) {
    return { isValid: false, errors: ['Empty input.'] };
  }
  const parsed = importTeamFromPSFormat(text);
  if (!parsed.pokemon || parsed.pokemon.length === 0) {
    errors.push('No Pokémon detected. Make sure each entry has a species line.');
  } else {
    parsed.pokemon.forEach((p, i) => {
      if (!p.species) errors.push(`Pokémon #${i + 1}: missing species.`);
      if (p.moves && p.moves.length > 4) errors.push(`Pokémon #${i + 1}: more than 4 moves.`);
    });
  }
  return { isValid: errors.length === 0, errors };
}
