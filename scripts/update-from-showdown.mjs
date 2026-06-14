import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SHOWDOWN_BASE = 'https://raw.githubusercontent.com/smogon/pokemon-showdown/master/data';

const ENDPOINTS = {
  pokedex: `${SHOWDOWN_BASE}/pokedex.ts`,
  moves: `${SHOWDOWN_BASE}/moves.ts`,
  items: `${SHOWDOWN_BASE}/items.ts`,
  typechart: `${SHOWDOWN_BASE}/typechart.ts`,
};

const OUTPUTS = {
  pokemon: join(__dirname, '..', 'src', 'data', 'pokemonData.ts'),
  moves: join(__dirname, '..', 'src', 'data', 'movesData.ts'),
  items: join(__dirname, '..', 'src', 'data', 'itemsData.ts'),
  types: join(__dirname, '..', 'src', 'data', 'typesData.ts'),
};

async function fetchShowdownData(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return res.text();
}

// Parse Pokemon Showdown's TS export format into JS objects
function parseShowdownTS(content: string): Record<string, any> {
  const entries: Record<string, any> = {};
  
  // Remove comments
  content = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  
  // Extract the export object
  const exportMatch = content.match(/export\s+(?:const|let|var)\s+\w+\s*:\s*\{[\s\S]*?\}\s*=\s*(\{[\s\S]*?\});?\s*$/);
  if (!exportMatch) {
    // Try alternate format: export const Pokedex: {[k: string]: ...} = { ... };
    const altMatch = content.match(/=\s*(\{[\s\S]*\})\s*;?\s*$/);
    if (!altMatch) throw new Error('Could not parse export object from Showdown data');
    content = altMatch[1];
  } else {
    content = exportMatch[1];
  }
  
  // Simple recursive parser for Showdown's flat object format
  function parseValue(str: string): any {
    str = str.trim();
    if (str === 'true') return true;
    if (str === 'false') return false;
    if (str === 'null') return null;
    if (str === 'undefined') return undefined;
    if (/^-?\d+$/.test(str)) return parseInt(str, 10);
    if (/^-?\d+\.\d+$/.test(str)) return parseFloat(str);
    if (str.startsWith('"') && str.endsWith('"')) return str.slice(1, -1).replace(/\\"/g, '"');
    if (str.startsWith("'") && str.endsWith("'")) return str.slice(1, -1).replace(/\\'/g, "'");
    if (str.startsWith('[') && str.endsWith(']')) {
      const inner = str.slice(1, -1);
      if (!inner.trim()) return [];
      return splitTopLevel(inner).map(parseValue);
    }
    if (str.startsWith('{') && str.endsWith('}')) {
      const inner = str.slice(1, -1);
      if (!inner.trim()) return {};
      const result: Record<string, any> = {};
      for (const pair of splitTopLevel(inner)) {
        const colonIdx = pair.indexOf(':');
        if (colonIdx > 0) {
          const key = pair.slice(0, colonIdx).trim().replace(/["']/g, '');
          result[key] = parseValue(pair.slice(colonIdx + 1));
        }
      }
      return result;
    }
    return str;
  }
  
  function splitTopLevel(str: string): string[] {
    const parts: string[] = [];
    let d = 0;
    let s = false;
    let sc = '';
    let cur = '';
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if (s) {
        cur += c;
        if (c === '\\') { cur += str[++i] ?? ''; continue; }
        if (c === sc) { s = false; continue; }
      } else if (c === '"' || c === "'") {
        s = true; sc = c; cur += c;
      } else if (c === '[' || c === '{' || c === '(') {
        d++; cur += c;
      } else if (c === ']' || c === '}' || c === ')') {
        d--; cur += c;
        if (d < 0) { break; }
      } else if (c === ',' && d === 0) {
        parts.push(cur.trim());
        cur = '';
        continue;
      } else {
        cur += c;
      }
    }
    if (cur.trim()) parts.push(cur.trim());
    return parts;
  }
  
  // Manual parse of top-level entries
  let pos = 0;
  while (pos < content.length) {
    while (pos < content.length && /\s/.test(content[pos])) pos++;
    if (pos >= content.length) break;
    
    let key = '';
    if (content[pos] === '"' || content[pos] === "'") {
      const qc = content[pos++];
      while (pos < content.length && content[pos] !== qc) {
        if (content[pos] === '\\') key += content[pos++];
        key += content[pos++];
      }
      pos++;
    } else {
      while (pos < content.length && content[pos] !== ':' && !/\s/.test(content[pos])) {
        key += content[pos++];
      }
    }
    
    while (pos < content.length && content[pos] !== ':') pos++;
    if (pos >= content.length) break;
    pos++;
    
    let value = '';
    let vd = 0;
    let vs = false;
    let vsc = '';
    while (pos < content.length) {
      const c = content[pos];
      if (vs) {
        value += c;
        if (c === '\\') { value += content[++pos] ?? ''; pos++; continue; }
        if (c === vsc) { vs = false; pos++; continue; }
        pos++;
      } else if (c === '"' || c === "'") {
        vs = true; vsc = c; value += c; pos++;
      } else if (c === '[' || c === '{' || c === '(') {
        vd++; value += c; pos++;
      } else if (c === ']' || c === '}' || c === ')') {
        vd--; value += c; pos++;
        if (vd < 0) { break; }
      } else if (c === ',' && vd === 0) {
        pos++;
        break;
      } else {
        value += c; pos++;
      }
    }
    
    if (key) {
      entries[key] = parseValue(value);
    }
  }
  
  return entries;
}

function transformPokemonData(pokedex: Record<string, any>): any[] {
  return Object.entries(pokedex)
    .filter(([key, val]) => val && typeof val === 'object' && val.num > 0)
    .map(([key, val]) => ({
      id: key,
      name: val.name || key,
      types: val.types || [],
      baseStats: {
        hp: val.baseStats?.hp || 0,
        atk: val.baseStats?.atk || 0,
        def: val.baseStats?.def || 0,
        spa: val.baseStats?.spa || 0,
        spd: val.baseStats?.spd || 0,
        spe: val.baseStats?.spe || 0,
      },
      abilities: Object.values(val.abilities || {}),
      weight: val.weightkg || 0,
      height: val.heightm || 0,
      learnset: [], // Will be populated separately from learnsets
    }));
}

function transformMovesData(moves: Record<string, any>): any[] {
  return Object.entries(moves)
    .filter(([key, val]) => val && typeof val === 'object' && val.num > 0)
    .map(([key, val]) => ({
      id: key,
      name: val.name || key,
      type: val.type || 'Normal',
      category: val.category || 'Physical',
      power: val.basePower || 0,
      accuracy: val.accuracy === true ? 100 : (val.accuracy || 0),
      pp: val.pp || 0,
      priority: val.priority || 0,
      description: val.shortDesc || val.desc || '',
      target: val.target || 'normal',
    }));
}

function transformItemsData(items: Record<string, any>): any[] {
  return Object.entries(items)
    .filter(([key, val]) => val && typeof val === 'object')
    .map(([key, val]) => ({
      id: key,
      name: val.name || key,
      description: val.shortDesc || val.desc || '',
      category: val.itemUser ? 'species-specific' : (val.isBerry ? 'berry' : 'item'),
      fling: val.fling?.basePower || 0,
      onPlate: val.onPlate || false,
      onDrive: val.onDrive || false,
      onMemory: val.onMemory || false,
      megaStone: val.megaStone || null,
      megaEvolves: val.megaEvolves || null,
      zMove: val.zMove || null,
      zMoveType: val.zMoveType || null,
      zMoveFrom: val.zMoveFrom || null,
      naturalGift: val.naturalGift || null,
      isBerry: val.isBerry || false,
      isGem: val.isGem || false,
      isPokeball: val.isPokeball || false,
    }));
}

function transformTypeChart(typechart: Record<string, any>): Record<string, any> {
  const chart: Record<string, any> = {};
  for (const [type, data] of Object.entries(typechart)) {
    if (typeof data === 'object') {
      chart[type] = { damageTaken: data.damageTaken || {} };
    }
  }
  return chart;
}

function generatePokemonFile(pokemon: any[]): string {
  return `// Auto-generated from Pokemon Showdown — do not edit manually
// Last updated: ${new Date().toISOString()}

export interface PokemonEntry {
  id: string;
  name: string;
  types: string[];
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  abilities: string[];
  weight: number;
  height: number;
  learnset: string[];
}

export const POKEDEX: PokemonEntry[] = ${JSON.stringify(pokemon, null, 2)};

export const POKEMON_BY_ID = new Map(POKEDEX.map(p => [p.id, p]));
`;
}

function generateMovesFile(moves: any[]): string {
  return `// Auto-generated from Pokemon Showdown — do not edit manually
// Last updated: ${new Date().toISOString()}

export interface MoveEntry {
  id: string;
  name: string;
  type: string;
  category: string;
  power: number;
  accuracy: number;
  pp: number;
  priority: number;
  description: string;
  target: string;
}

export const MOVES: MoveEntry[] = ${JSON.stringify(moves, null, 2)};

export const MOVES_BY_ID = new Map(MOVES.map(m => [m.id, m]));
`;
}

function generateItemsFile(items: any[]): string {
  return `// Auto-generated from Pokemon Showdown — do not edit manually
// Last updated: ${new Date().toISOString()}

export interface ItemEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  fling: number;
  onPlate: boolean;
  onDrive: boolean;
  onMemory: boolean;
  megaStone: string | null;
  megaEvolves: string | null;
  zMove: string | null;
  zMoveType: string | null;
  zMoveFrom: string | null;
  naturalGift: any;
  isBerry: boolean;
  isGem: boolean;
  isPokeball: boolean;
}

export const ITEMS: ItemEntry[] = ${JSON.stringify(items, null, 2)};

export const ITEMS_BY_ID = new Map(ITEMS.map(i => [i.id, i]));
`;
}

function generateTypesFile(typechart: Record<string, any>): string {
  return `// Auto-generated from Pokemon Showdown — do not edit manually
// Last updated: ${new Date().toISOString()}

export const TYPE_CHART = ${JSON.stringify(typechart, null, 2)};

export const TYPES = Object.keys(TYPE_CHART);

export function getEffectiveness(attackingType: string, defendingTypes: string[]): number {
  let mult = 1;
  for (const def of defendingTypes) {
    const dmg = TYPE_CHART[attackingType]?.damageTaken[def] ?? 0;
    if (dmg === 1) mult *= 2;
    else if (dmg === 2) mult *= 0.5;
    else if (dmg === 3) mult = 0;
  }
  return mult;
}
`;
}

async function main(): Promise<void> {
  console.log('Fetching Pokemon Showdown data...\n');
  
  const [pokedexRaw, movesRaw, itemsRaw, typechartRaw] = await Promise.all([
    fetchShowdownData(ENDPOINTS.pokedex),
    fetchShowdownData(ENDPOINTS.moves),
    fetchShowdownData(ENDPOINTS.items),
    fetchShowdownData(ENDPOINTS.typechart),
  ]);
  
  console.log('Parsing Showdown data...');
  const pokedex = parseShowdownTS(pokedexRaw);
  const moves = parseShowdownTS(movesRaw);
  const items = parseShowdownTS(itemsRaw);
  const typechart = parseShowdownTS(typechartRaw);
  
  console.log('Transforming data...');
  const pokemon = transformPokemonData(pokedex);
  const movesList = transformMovesData(moves);
  const itemsList = transformItemsData(items);
  const typesData = transformTypeChart(typechart);
  
  console.log(`\n  Pokemon: ${pokemon.length} entries`);
  console.log(`  Moves: ${movesList.length} entries`);
  console.log(`  Items: ${itemsList.length} entries`);
  console.log(`  Types: ${Object.keys(typesData).length} entries`);
  
  const pokemonFile = generatePokemonFile(pokemon);
  const movesFile = generateMovesFile(movesList);
  const itemsFile = generateItemsFile(itemsList);
  const typesFile = generateTypesFile(typesData);
  
  const files = [
    { path: OUTPUTS.pokemon, content: pokemonFile },
    { path: OUTPUTS.moves, content: movesFile },
    { path: OUTPUTS.items, content: itemsFile },
    { path: OUTPUTS.types, content: typesFile },
  ];
  
  let changed = false;
  for (const file of files) {
    const dir = dirname(file.path);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    
    const oldHash = existsSync(file.path) ? createHash('sha256').update(readFileSync(file.path, 'utf-8')).digest('hex') : '';
    const newHash = createHash('sha256').update(file.content).digest('hex');
    
    if (oldHash !== newHash) {
      writeFileSync(file.path, file.content, 'utf-8');
      console.log(`\n  Updated: ${file.path}`);
      changed = true;
    } else {
      console.log(`  Unchanged: ${file.path}`);
    }
  }
  
  if (!changed) {
    console.log('\nNo changes detected — data is already up to date.');
  } else {
    console.log('\nDone! New data written to src/data/');
  }
  
  if (process.stdout.isTTY === false) {
    console.log(`\n::set-output name=changed::${changed}`);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
