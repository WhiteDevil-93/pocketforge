import type { Team } from '../../types';
import type { AITeamPayload } from './types';

export function teamToAIPayload(team: Team): AITeamPayload {
  return {
    name: team.name,
    format: team.format,
    pokemon: team.pokemon.map((p) => ({
      species: p.species,
      nickname: p.nickname,
      level: p.level,
      ability: p.ability,
      item: p.item,
      teraType: p.teraType,
      moves: p.moves,
      evs: { ...p.evs },
      ivs: { ...p.ivs },
      nature: p.nature,
    })),
  };
}