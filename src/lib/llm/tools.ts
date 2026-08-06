// ============================================================================
// PocketForge — AI tool registry
//
// The model never computes game numbers itself — it calls these tools, which
// run the app's real calculators, and reports back only what they return.
// Every handler is a thin wrapper around an existing src/utils function.
// ============================================================================

import type { Pokemon, Team } from '../../types';
import { getPokemonByName } from '../../data/pokemonData';
import { getMoveByName } from '../../data/movesData';
import {
  calculateDamage,
  getDefaultCalcPokemon,
  getDefaultField,
  type CalcPokemon,
  type CalcMove,
  type Weather,
  type Terrain,
} from '../../utils/damageCalc';
import { calculateSpeed } from '../../utils/speedCalculator';
import { validateTeam } from '../../utils/validation';
import { getCoverageGaps, getTeamBalanceScore } from '../../utils/typeChart';
import { analyzeTeamWeaknesses, suggestCoverageMoves } from '../../utils/weaknessAnalyzer';
import { explainEVSpread } from '../../utils/evExplainer';
import { getMovepoolForSpecies } from '../../utils/movepoolQuery';
import type { ToolContext, ToolDefinition } from './types';

const WEATHERS: Weather[] = ['none', 'sun', 'rain', 'sand', 'snow', 'harsh-sun', 'heavy-rain'];
const TERRAINS: Terrain[] = ['none', 'electric', 'grassy', 'psychic', 'misty'];

// ---- Resolution helpers ------------------------------------------------------

function findTeamMember(team: Team | null, nameOrNickname: string): Pokemon | undefined {
  const q = nameOrNickname.trim().toLowerCase();
  return team?.pokemon.find(
    (p) => p.species.toLowerCase() === q || (p.nickname ?? '').toLowerCase() === q
  );
}

/** A Pokemon (team-member shape) for calculateSpeed/outspeeds: real spread if on the
 *  active team, otherwise a level-100 neutral-nature 0 EV / 31 IV baseline. */
function resolveSpeedSubject(team: Team | null, nameOrNickname: string): Pokemon | { error: string } {
  const member = findTeamMember(team, nameOrNickname);
  if (member) return member;

  const dex = getPokemonByName(nameOrNickname);
  if (!dex) return { error: `Unknown species "${nameOrNickname}".` };

  return {
    id: 'generic',
    species: dex.name,
    level: 100,
    gender: '',
    shiny: false,
    ability: '',
    item: undefined,
    teraType: undefined,
    moves: [],
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    nature: 'Serious',
  };
}

/** A CalcPokemon for calculateDamage: real spread if on the active team, otherwise
 *  the app's own default build (getDefaultCalcPokemon) with real species data. */
function resolveCalcSubject(team: Team | null, nameOrNickname: string): CalcPokemon | { error: string } {
  const dex = getPokemonByName(nameOrNickname);
  if (!dex) return { error: `Unknown species "${nameOrNickname}".` };

  const member = findTeamMember(team, nameOrNickname);
  const base = getDefaultCalcPokemon();

  return {
    ...base,
    name: dex.name,
    baseStats: dex.baseStats,
    types: dex.types,
    ...(member && {
      level: member.level,
      evs: member.evs,
      ivs: member.ivs,
      nature: member.nature,
      ability: member.ability,
      item: member.item || '',
      teraType: member.teraType,
    }),
  };
}

function requireTeam(ctx: ToolContext): Team | { error: string } {
  return ctx.team ?? { error: 'No team is currently open in the app.' };
}

// ---- Tool definitions ---------------------------------------------------------

export const TOOLS: ToolDefinition[] = [
  {
    name: 'get_active_team',
    description:
      "Get the user's currently open team: format, and each member's species, level, item, " +
      'ability, nature, Tera type, and moves. Call this first in any conversation about "my team".',
    parameters: { type: 'object', properties: {} },
    handler: (_args, ctx) => {
      const team = requireTeam(ctx);
      if ('error' in team) return team;
      return {
        name: team.name,
        format: team.format,
        pokemon: team.pokemon.map((p) => ({
          species: p.species,
          nickname: p.nickname,
          level: p.level,
          item: p.item,
          ability: p.ability,
          nature: p.nature,
          teraType: p.teraType,
          moves: p.moves,
        })),
      };
    },
  },

  {
    name: 'analyze_team',
    description:
      'Run the real type-coverage and weakness analysis on the active team: shared weaknesses, ' +
      'offensive coverage gaps, and a 0-100 balance score. Use this for coaching questions.',
    parameters: { type: 'object', properties: {} },
    handler: (_args, ctx) => {
      const team = requireTeam(ctx);
      if ('error' in team) return team;
      const weaknesses = analyzeTeamWeaknesses(team);
      const gaps = getCoverageGaps(team);
      return {
        balanceScore: getTeamBalanceScore(team),
        sharedWeaknesses: weaknesses.weaknesses.map((w) => ({
          type: w.type,
          weakCount: w.weakCount,
          weakMembers: w.weakMembers,
        })),
        uncoveredOffensiveTypes: gaps.uncoveredTypes,
        suggestedCoverageTypes: suggestCoverageMoves(team),
      };
    },
  },

  {
    name: 'validate_team',
    description:
      'Check the active team against its format\'s legality rules (species clause, item clause, ' +
      'level caps, Champions whitelists, etc). Use before telling the user a team is tournament-legal.',
    parameters: { type: 'object', properties: {} },
    handler: async (_args, ctx) => {
      const team = requireTeam(ctx);
      if ('error' in team) return team;
      return validateTeam(team);
    },
  },

  {
    name: 'explain_evs',
    description:
      "Explain a team member's EV spread: inferred role, what each investment does, speed tier, " +
      'and bulk/offense notes. species must match a Pokemon on the active team.',
    parameters: {
      type: 'object',
      properties: {
        species: { type: 'string', description: 'Species or nickname of a Pokemon on the active team.' },
      },
      required: ['species'],
    },
    handler: (args, ctx) => {
      const team = requireTeam(ctx);
      if ('error' in team) return team;
      const member = findTeamMember(team, String(args.species));
      if (!member) return { error: `"${args.species}" is not on the active team.` };
      return explainEVSpread(member);
    },
  },

  {
    name: 'calculate_speed',
    description:
      "Calculate a Pokemon's real final Speed stat, accounting for item, ability, and field " +
      'modifiers. Uses the real spread if the species is on the active team, otherwise a neutral ' +
      'level 100 baseline. Never estimate a speed value yourself — always call this.',
    parameters: {
      type: 'object',
      properties: {
        species: { type: 'string', description: 'Species or nickname to calculate Speed for.' },
        tailwind: { type: 'string', description: '"true" if Tailwind is active on its side.' },
        paralyzed: { type: 'string', description: '"true" if the Pokemon is paralyzed.' },
        weather: { type: 'string', description: 'Active weather.', enum: WEATHERS },
        terrain: { type: 'string', description: 'Active terrain.', enum: TERRAINS },
      },
      required: ['species'],
    },
    handler: (args, ctx) => {
      const subject = resolveSpeedSubject(ctx.team, String(args.species));
      if ('error' in subject) return subject;
      const speed = calculateSpeed(subject, {
        tailwindActive: args.tailwind === 'true',
        paralyzed: args.paralyzed === 'true',
        weather: typeof args.weather === 'string' ? args.weather : undefined,
        terrain: typeof args.terrain === 'string' ? args.terrain : undefined,
      });
      return { species: subject.species, speed };
    },
  },

  {
    name: 'calculate_damage',
    description:
      'Calculate a real damage roll for one move from an attacker to a defender, including type ' +
      'effectiveness, STAB, and KO chance. Uses real spreads for Pokemon on the active team. Never ' +
      'estimate damage percentages yourself — always call this.',
    parameters: {
      type: 'object',
      properties: {
        attacker: { type: 'string', description: 'Attacking Pokemon: species or nickname.' },
        defender: { type: 'string', description: 'Defending Pokemon: species or nickname.' },
        move: { type: 'string', description: 'Move name, e.g. "Ice Beam".' },
        weather: { type: 'string', description: 'Active weather.', enum: WEATHERS },
        terrain: { type: 'string', description: 'Active terrain.', enum: TERRAINS },
        useTera: { type: 'string', description: '"true" if the attacker has Terastallized.' },
      },
      required: ['attacker', 'defender', 'move'],
    },
    handler: (args, ctx) => {
      const attacker = resolveCalcSubject(ctx.team, String(args.attacker));
      if ('error' in attacker) return attacker;
      const defender = resolveCalcSubject(ctx.team, String(args.defender));
      if ('error' in defender) return defender;

      const moveEntry = getMoveByName(String(args.move));
      if (!moveEntry) return { error: `Unknown move "${args.move}".` };
      const move: CalcMove = {
        name: moveEntry.name,
        type: moveEntry.type,
        category: moveEntry.category as CalcMove['category'],
        power: moveEntry.power,
        accuracy: moveEntry.accuracy,
      };

      const field = getDefaultField();
      if (typeof args.weather === 'string' && (WEATHERS as string[]).includes(args.weather)) {
        field.weather = args.weather as Weather;
      }
      if (typeof args.terrain === 'string' && (TERRAINS as string[]).includes(args.terrain)) {
        field.terrain = args.terrain as Terrain;
      }

      const result = calculateDamage(attacker, defender, move, field, false, args.useTera === 'true');
      return {
        move: move.name,
        minPercent: result.minPercent,
        maxPercent: result.maxPercent,
        koChance: result.koChance,
        effectiveness: result.effectivenessLabel,
        isStab: result.isStab,
      };
    },
  },

  {
    name: 'lookup_pokemon',
    description: "Get a Pokemon's types, base stats, and abilities.",
    parameters: {
      type: 'object',
      properties: { species: { type: 'string', description: 'Species name.' } },
      required: ['species'],
    },
    handler: (args) => {
      const dex = getPokemonByName(String(args.species));
      if (!dex) return { error: `Unknown species "${args.species}".` };
      return {
        name: dex.name,
        types: dex.types,
        baseStats: dex.baseStats,
        abilities: dex.abilities,
        hiddenAbility: dex.hiddenAbility,
      };
    },
  },

  {
    name: 'get_legal_moves',
    description:
      "List moves a species can actually learn (including inherited pre-evolution moves), " +
      'optionally filtered by a search query. Use before suggesting a moveset change.',
    parameters: {
      type: 'object',
      properties: {
        species: { type: 'string', description: 'Species name.' },
        query: { type: 'string', description: 'Optional substring to filter move names by.' },
      },
      required: ['species'],
    },
    handler: async (args) => {
      const moves = await getMovepoolForSpecies(String(args.species));
      const query = typeof args.query === 'string' ? args.query.toLowerCase() : '';
      const filtered = query ? moves.filter((m) => m.name.toLowerCase().includes(query)) : moves;
      return filtered
        .slice(0, 30)
        .map((m) => ({ name: m.name, type: m.type, category: m.category, power: m.power }));
    },
  },
];

export function getToolByName(name: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.name === name);
}

/** Ollama's tool-calling wire format (OpenAI-compatible function schema). */
export function toOllamaToolSchema() {
  return TOOLS.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}
