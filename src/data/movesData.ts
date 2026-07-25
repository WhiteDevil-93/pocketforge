import { Dex } from '@pkmn/dex';

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

const mapDexMoveToMoveEntry = (m: any): MoveEntry => {
  return {
    id: m.id,
    name: m.name,
    type: m.type,
    category: m.category,
    power: m.basePower,
    accuracy: typeof m.accuracy === 'number' ? m.accuracy : 100,
    pp: m.pp,
    priority: m.priority,
    description: m.shortDesc || m.desc || '',
    target: m.target || 'normal',
  };
};

const toMoveId = (name: string): string =>
  name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

const HIDDEN_POWER_TYPES = [
  'Bug',
  'Dark',
  'Dragon',
  'Electric',
  'Fighting',
  'Fire',
  'Flying',
  'Ghost',
  'Grass',
  'Ground',
  'Ice',
  'Poison',
  'Psychic',
  'Rock',
  'Steel',
  'Water',
];

const hiddenPowerVariants: MoveEntry[] = HIDDEN_POWER_TYPES.map((type) => {
  const move = Dex.moves.get(`Hidden Power ${type}`);
  return {
    ...mapDexMoveToMoveEntry(move),
    id: `hiddenpower${type.toLowerCase()}`,
  };
});

export const MOVES: MoveEntry[] = [
  ...Dex.moves.all()
  .filter(m => m.exists && m.isNonstandard !== 'Custom')
  .map(mapDexMoveToMoveEntry),
  ...hiddenPowerVariants,
];

export const MOVES_BY_ID = new Map(MOVES.map(m => [m.id, m]));

export function getMoveByName(name: string): MoveEntry | undefined {
  if (!name) return undefined;
  const id = toMoveId(name);
  return MOVES_BY_ID.get(id) || MOVES.find(m => toMoveId(m.name) === id);
}

export function searchMoves(query: string): MoveEntry[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];
  return MOVES.filter(m => m.name.toLowerCase().includes(normalized)).slice(0, 20);
}

export function getMovesByType(type: string): MoveEntry[] {
  const tLower = type.toLowerCase();
  return MOVES.filter(m => m.type.toLowerCase() === tLower);
}

export function getMovesForPokemon(_pokemonName: string): MoveEntry[] {
  return MOVES;
}

export function getAllMoveNames(): string[] {
  return MOVES.map(m => m.name);
}
