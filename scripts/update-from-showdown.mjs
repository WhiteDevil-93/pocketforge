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

async function fetchShowdownData(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return res.text();
}

// Strip function definitions and other non-JSON syntax from Showdown TS data
// Returns cleaned object literal text that can be parsed with new Function()
function stripToJSObject(text) {
  // Remove comments
  text = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  // Extract just the object literal from export statement
  const exportMatch = text.match(/export\s+(?:const|let|var)\s+\w+\s*:\s*\{[\s\S]*?\}\s*=\s*(\{[\s\S]*?\});?\s*$/);
  if (exportMatch) {
    text = exportMatch[1];
  } else {
    const altMatch = text.match(/=\s*(\{[\s\S]*\})\s*;?\s*$/);
    if (!altMatch) throw new Error('Could not extract object from export statement');
    text = altMatch[1];
  }

  // Remove all function definitions using a state machine
  // We look for: identifier(...) { ... } and skip the whole thing
  const result = [];
  let i = 0;
  while (i < text.length) {
    if (/[a-zA-Z_]/.test(text[i])) {
      let j = i;
      while (j < text.length && /[a-zA-Z0-9_]/.test(text[j])) j++;
      const word = text.slice(i, j);

      let k = j;
      while (k < text.length && /\s/.test(text[k])) k++;

      if (k < text.length && text[k] === '(') {
        // Find matching )
        let parenDepth = 1;
        k++;
        while (k < text.length && parenDepth > 0) {
          if (text[k] === '(') parenDepth++;
          else if (text[k] === ')') parenDepth--;
          else if (text[k] === '"' || text[k] === "'" || text[k] === '`') {
            const qc = text[k++];
            while (k < text.length && text[k] !== qc) {
              if (text[k] === '\\') k++;
              k++;
            }
          }
          k++;
        }

        // Skip whitespace
        while (k < text.length && /\s/.test(text[k])) k++;

        if (k < text.length && text[k] === '{') {
          // This is a function definition - skip it entirely
          let braceDepth = 1;
          k++;
          while (k < text.length && braceDepth > 0) {
            if (text[k] === '{') braceDepth++;
            else if (text[k] === '}') braceDepth--;
            else if (text[k] === '"' || text[k] === "'" || text[k] === '`') {
              const qc = text[k++];
              while (k < text.length && text[k] !== qc) {
                if (text[k] === '\\') k++;
                k++;
              }
            }
            k++;
          }
          // Also skip trailing comma if present
          while (k < text.length && /\s/.test(text[k])) k++;
          if (k < text.length && text[k] === ',') k++;
          i = k;
          continue;
        }
      }
    }
    result.push(text[i]);
    i++;
  }

  return result.join('');
}

function parseShowdownData(content) {
  const cleaned = stripToJSObject(content);
  // Use Function constructor to evaluate the cleaned object literal
  const code = 'return ' + cleaned;
  try {
    const fn = new Function(code);
    return fn();
  } catch (err) {
    throw new Error('Failed to parse Showdown data: ' + err.message);
  }
}

function transformPokemonData(pokedex) {
  return Object.entries(pokedex)
    .filter(([key, val]) => val && typeof val === 'object' && val.num > 0)
    .map(([key, val]) => {
      const abilities = val.abilities || {};
      const regularAbilities = [];
      let hiddenAbility = '';
      for (const [k, v] of Object.entries(abilities)) {
        if (!v) continue;
        if (k === 'H' || k === 'H1') {
          hiddenAbility = v;
        } else if (!k.startsWith('H')) {
          regularAbilities.push(v);
        }
      }
      return {
        id: val.num || 0,
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
        abilities: regularAbilities,
        hiddenAbility,
        sprite: key.toLowerCase(),
        learnset: [], // Will be populated separately from learnsets
      };
    });
}

function transformMovesData(moves) {
  return Object.entries(moves)
    .filter(([key, val]) => val && typeof val === 'object' && val.num >= 0)
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

function transformItemsData(items) {
  return Object.entries(items)
    .filter(([key, val]) => val && typeof val === 'object' && val.name)
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

function transformTypeChart(typechart) {
  const chart = {};
  for (const [type, data] of Object.entries(typechart)) {
    if (typeof data === 'object') {
      chart[type] = { damageTaken: data.damageTaken || {} };
    }
  }
  return chart;
}

function generatePokemonFile(pokemon) {
  return `// Auto-generated from Pokemon Showdown — do not edit manually
// Last updated: ${new Date().toISOString()}

export interface PokedexEntry {
  id: number;
  name: string;
  types: string[];
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  abilities: string[];
  hiddenAbility: string;
  sprite: string;
  learnset: string[];
}

export const POKEDEX: PokedexEntry[] = ${JSON.stringify(pokemon, null, 2)};

export const POKEMON_BY_ID = new Map(POKEDEX.map(p => [p.id, p]));
export const POKEMON_BY_NAME = new Map(POKEDEX.map(p => [p.name.toLowerCase(), p]));
export const POKEMON_BY_SLUG = new Map(POKEDEX.map(p => [p.sprite.toLowerCase(), p]));

export function getPokemonByName(name: string): PokedexEntry | undefined {
  const normalized = name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  return POKEDEX.find(p =>
    p.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized ||
    p.sprite === normalized
  );
}

export function getPokemonById(id: number): PokedexEntry | undefined {
  return POKEDEX.find(p => p.id === id);
}

export function searchPokemon(query: string): PokedexEntry[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];
  return POKEDEX.filter(p =>
    p.name.toLowerCase().includes(normalized)
  ).slice(0, 20);
}

export function getPokemonByType(type: string): PokedexEntry[] {
  return POKEDEX.filter(p =>
    p.types.map(t => t.toLowerCase()).includes(type.toLowerCase())
  );
}

export function getSpriteUrl(name: string, animated = false): string {
  const normalized = name.toLowerCase().trim().replace(/\\s+/g, '').replace(/[^a-z0-9-]/g, '');
  if (animated) {
    return \`https://play.pokemonshowdown.com/sprites/ani/\${normalized}.gif\`;
  }
  return \`https://play.pokemonshowdown.com/sprites/gen5/\${normalized}.png\`;
}

export function getAllPokemonNames(): string[] {
  return POKEDEX.map(p => p.name);
}

export function getViablePokemon(_format?: string): PokedexEntry[] {
  return POKEDEX;
}
`;
}

function generateMovesFile(moves) {
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

export function getMoveByName(name: string): MoveEntry | undefined {
  return MOVES.find(m => m.name.toLowerCase() === name.toLowerCase().trim());
}

export function searchMoves(query: string): MoveEntry[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];
  return MOVES.filter(m => m.name.toLowerCase().includes(normalized)).slice(0, 20);
}

export function getMovesByType(type: string): MoveEntry[] {
  return MOVES.filter(m => m.type.toLowerCase() === type.toLowerCase());
}

export function getMovesForPokemon(_pokemonName: string): MoveEntry[] {
  return MOVES;
}

export function getAllMoveNames(): string[] {
  return MOVES.map(m => m.name);
}
`;
}

function generateItemsFile(items) {
  return `// Auto-generated from Pokemon Showdown — do not edit manually
// Last updated: ${new Date().toISOString()}

export interface ItemEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  fling: number;
  onPlate: any;
  onDrive: any;
  onMemory: any;
  megaStone: any;
  megaEvolves: any;
  zMove: any;
  zMoveType: any;
  zMoveFrom: any;
  naturalGift: any;
  isBerry: boolean;
  isGem: boolean;
  isPokeball: boolean;
}

export const ITEMS: ItemEntry[] = ${JSON.stringify(items, null, 2)};

export const ITEMS_BY_ID = new Map(ITEMS.map(i => [i.id, i]));

export function getItemByName(name: string): ItemEntry | undefined {
  return ITEMS.find(i => i.name.toLowerCase() === name.toLowerCase().trim());
}

export function searchItems(query: string): ItemEntry[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];
  return ITEMS.filter(i => i.name.toLowerCase().includes(normalized)).slice(0, 15);
}

export function getAllItemNames(): string[] {
  return ITEMS.map(i => i.name);
}

export function getItemSpriteUrl(itemName: string): string {
  const normalized = itemName.toLowerCase().replace(/\\s+/g, '').replace(/'/g, '').replace(/-/g, '');
  return \`https://play.pokemonshowdown.com/sprites/itemicons/\${normalized}.png\`;
}
`;
}

function generateTypesFile(typechart) {
  return `// Auto-generated from Pokemon Showdown — do not edit manually
// Last updated: ${new Date().toISOString()}

export const TYPE_NAMES = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
  "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy",
] as const;

export type TypeName = typeof TYPE_NAMES[number];

export const TYPE_CHART: Record<string, any> = ${JSON.stringify(typechart, null, 2)};

export const TYPES = Object.keys(TYPE_CHART);

export function getEffectiveness(attackingType: string, defendingTypes: string[]): number {
  let mult = 1;
  const atk = attackingType.toLowerCase();
  for (const def of defendingTypes) {
    const dmg = TYPE_CHART[atk]?.damageTaken[def.toLowerCase()] ?? 0;
    if (dmg === 1) mult *= 2;
    else if (dmg === 2) mult *= 0.5;
    else if (dmg === 3) mult = 0;
  }
  return mult;
}

export function getAllTypes(): string[] {
  return [...TYPE_NAMES];
}

export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    Normal: "#A8A77A", Fire: "#EE8130", Water: "#6390F0", Electric: "#F7D02C",
    Grass: "#7AC74C", Ice: "#96D9D6", Fighting: "#C22E28", Poison: "#A33EA1",
    Ground: "#E2BF65", Flying: "#A98FF3", Psychic: "#F95587", Bug: "#A6B91A",
    Rock: "#B6A136", Ghost: "#735797", Dragon: "#6F35FC", Dark: "#705746",
    Steel: "#B7B7CE", Fairy: "#D685AD",
  };
  return colors[type] || "#94A3B8";
}
`;
}

async function main() {
  console.log('Fetching Pokemon Showdown data...\n');

  const [pokedexRaw, movesRaw, itemsRaw, typechartRaw] = await Promise.all([
    fetchShowdownData(ENDPOINTS.pokedex),
    fetchShowdownData(ENDPOINTS.moves),
    fetchShowdownData(ENDPOINTS.items),
    fetchShowdownData(ENDPOINTS.typechart),
  ]);

  console.log('Parsing Showdown data...');
  const pokedex = parseShowdownData(pokedexRaw);
  const moves = parseShowdownData(movesRaw);
  const items = parseShowdownData(itemsRaw);
  const typechart = parseShowdownData(typechartRaw);

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
