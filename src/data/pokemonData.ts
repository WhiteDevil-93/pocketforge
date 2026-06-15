import { Dex } from '@pkmn/dex';

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

const mapDexSpeciesToPokedexEntry = (s: any): PokedexEntry => {
  const abilities: string[] = [];
  if (s.abilities['0']) abilities.push(s.abilities['0']);
  if (s.abilities['1']) abilities.push(s.abilities['1']);
  const hiddenAbility = s.abilities['H'] || '';
  
  return {
    id: s.num,
    name: s.name,
    types: s.types,
    baseStats: {
      hp: s.baseStats.hp,
      atk: s.baseStats.atk,
      def: s.baseStats.def,
      spa: s.baseStats.spa,
      spd: s.baseStats.spd,
      spe: s.baseStats.spe,
    },
    abilities,
    hiddenAbility,
    sprite: s.id,
    learnset: [],
  };
};

export const POKEDEX: PokedexEntry[] = Dex.species.all()
  .filter(s => s.exists && s.num > 0 && s.isNonstandard !== 'Custom' && !s.isCosmeticForme)
  .map(mapDexSpeciesToPokedexEntry);

export const POKEMON_BY_ID = new Map(POKEDEX.map(p => [p.id, p]));
export const POKEMON_BY_NAME = new Map(POKEDEX.map(p => [p.name.toLowerCase(), p]));
export const POKEMON_BY_SLUG = new Map(POKEDEX.map(p => [p.sprite.toLowerCase(), p]));

export function getPokemonByName(name: string): PokedexEntry | undefined {
  if (!name) return undefined;
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
  const tLower = type.toLowerCase();
  return POKEDEX.filter(p =>
    p.types.map(t => t.toLowerCase()).includes(tLower)
  );
}

export function getSpriteUrl(name: string, animated = false): string {
  const normalized = name.toLowerCase().trim().replace(/\s+/g, '').replace(/[^a-z0-9-]/g, '');
  if (animated) {
    return `https://play.pokemonshowdown.com/sprites/ani/${normalized}.gif`;
  }
  return `https://play.pokemonshowdown.com/sprites/gen5/${normalized}.png`;
}

export function getAllPokemonNames(): string[] {
  return POKEDEX.map(p => p.name);
}

export function getViablePokemon(_format?: string): PokedexEntry[] {
  return POKEDEX;
}
