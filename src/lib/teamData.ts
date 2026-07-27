import { DEFAULT_FORMAT } from '../data/formatsData';
import type { EVs, IVs, Pokemon, Team } from '../types';
import { getDefaultLevelForFormat } from './format';

export const DEFAULT_EVS: EVs = {
  hp: 0,
  atk: 0,
  def: 0,
  spa: 0,
  spd: 0,
  spe: 0,
};

export const DEFAULT_IVS: IVs = {
  hp: 31,
  atk: 31,
  def: 31,
  spa: 31,
  spd: 31,
  spe: 31,
};

export function normalizePokemonData(
  value: Partial<Pokemon> | null | undefined,
  format = DEFAULT_FORMAT,
): Pokemon {
  const pokemon = value ?? {};

  return {
    id: pokemon.id || crypto.randomUUID(),
    species: pokemon.species || '',
    nickname: pokemon.nickname || undefined,
    level: pokemon.level || getDefaultLevelForFormat(format),
    gender: pokemon.gender === 'M' || pokemon.gender === 'F' ? pokemon.gender : '',
    shiny: Boolean(pokemon.shiny),
    ability: pokemon.ability || '',
    item: pokemon.item || '',
    teraType: pokemon.teraType || '',
    moves: Array.isArray(pokemon.moves) ? pokemon.moves.filter(Boolean).slice(0, 4) : [],
    evs: { ...DEFAULT_EVS, ...(pokemon.evs ?? {}) },
    ivs: { ...DEFAULT_IVS, ...(pokemon.ivs ?? {}) },
    nature: pokemon.nature || 'Serious',
    megaActive: Boolean(pokemon.megaActive),
    megaStone: pokemon.megaStone || undefined,
  };
}

export function normalizeTeamData(value: Partial<Team> | null | undefined): Team {
  const team = value ?? {};
  const format = team.format || DEFAULT_FORMAT;
  const now = new Date().toISOString();

  return {
    id: team.id || crypto.randomUUID(),
    name: team.name || 'Untitled Team',
    format,
    folder: team.folder || 'My Teams',
    pokemon: Array.isArray(team.pokemon)
      ? team.pokemon.slice(0, 6).map((pokemon) => normalizePokemonData(pokemon, format))
      : [],
    createdAt: team.createdAt || now,
    updatedAt: team.updatedAt || now,
    isValid: Boolean(team.isValid),
    validationErrors: Array.isArray(team.validationErrors) ? team.validationErrors : undefined,
    record: team.record,
  };
}
