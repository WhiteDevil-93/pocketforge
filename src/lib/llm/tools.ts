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
import { getMegaByStone, isMegaStone } from '../../data/megaData';
import { getChampionsMovesForSpecies, isChampionsFormatId } from '../../data/championsLegality';
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
import { getDefaultLevelForFormat } from '../format';
import { getCalcGenForFormat } from '../showdown';
import type { ToolContext, ToolDefinition } from './types';

const WEATHERS: Weather[] = ['none', 'sun', 'rain', 'sand', 'snow', 'harsh-sun', 'heavy-rain'];
const TERRAINS: Terrain[] = ['none', 'electric', 'grassy', 'psychic', 'misty'];

/** Tool-call arguments are declared as JSON-Schema booleans, but not every backend is strict
 *  about sending an actual boolean back — accept true, "true", and "1" defensively. */
function isTruthyFlag(value: unknown): boolean {
  return value === true || value === 'true' || value === '1';
}

// ---- Resolution helpers ------------------------------------------------------

function findTeamMember(team: Team | null, nameOrNickname: string): Pokemon | undefined {
  const q = nameOrNickname.trim().toLowerCase();
  return team?.pokemon.find(
    (p) => p.species.toLowerCase() === q || (p.nickname ?? '').toLowerCase() === q
  );
}

/** Resolves a team member's active Mega form (PocketForge models Mega state as
 *  megaActive + a Mega Stone equipped as the held item — see PokemonEditor.tsx). */
function resolveMega(member: Pokemon | undefined) {
  if (!member?.megaActive || !member.item || !isMegaStone(member.item)) return undefined;
  return getMegaByStone(member.item);
}

/** A Pokemon (team-member shape) for calculateSpeed/outspeeds: real spread if on the
 *  active team, otherwise a neutral-nature 0 EV / 31 IV baseline at the format's
 *  standard level (50 for Champions/VGC-style formats, 100 otherwise). When Mega
 *  Evolution is active, points calculateSpeed at the Mega's own species entry so its
 *  real base Speed and ability are used, rather than the base form's. */
function resolveSpeedSubject(team: Team | null, nameOrNickname: string): Pokemon | { error: string } {
  const member = findTeamMember(team, nameOrNickname);
  if (member) {
    const mega = resolveMega(member);
    return mega ? { ...member, species: mega.megaName, ability: mega.ability } : member;
  }

  const dex = getPokemonByName(nameOrNickname);
  if (!dex) return { error: `Unknown species "${nameOrNickname}".` };

  return {
    id: 'generic',
    species: dex.name,
    level: getDefaultLevelForFormat(team?.format),
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

/** A CalcPokemon for calculateDamage: real spread if on the active team, otherwise the
 *  app's own default build (getDefaultCalcPokemon) with real species data at the
 *  format's standard level. Resolves the team member FIRST so a nickname (which the
 *  dex has never heard of) still works, and swaps in Mega stats/typing/ability when
 *  Mega Evolution is active.
 *
 *  Deliberately never sets teraType here: calculateDamage applies a defender's
 *  teraType unconditionally (unlike the attacker's, which it gates behind the
 *  explicit useTera flag), so populating it for both sides would silently
 *  Terastallize the defender on every query. The calculate_damage handler applies
 *  the attacker's real teraType itself, only when useTera is requested. */
function resolveCalcSubject(team: Team | null, nameOrNickname: string): CalcPokemon | { error: string } {
  const member = findTeamMember(team, nameOrNickname);
  const dex = getPokemonByName(member?.species ?? nameOrNickname);
  if (!dex) return { error: `Unknown species "${nameOrNickname}".` };

  const mega = resolveMega(member);
  const base = getDefaultCalcPokemon();

  return {
    ...base,
    name: mega?.megaName ?? dex.name,
    baseStats: mega?.baseStats ?? dex.baseStats,
    types: mega ? mega.types.filter((t): t is string => Boolean(t)) : dex.types,
    level: member?.level ?? getDefaultLevelForFormat(team?.format),
    ...(member && {
      evs: member.evs,
      ivs: member.ivs,
      nature: member.nature,
      ability: mega?.ability ?? member.ability,
      item: member.item || '',
    }),
  };
}

function requireTeam(ctx: ToolContext): Team | { error: string } {
  return ctx.team ?? { error: 'No team is currently open in the app.' };
}

/** Only forward a weather/terrain string if it's one calculateSpeed/calculateDamage actually
 *  recognize — an out-of-schema value should silently no-op rather than reach the calculator. */
function resolveWeather(value: unknown): Weather | undefined {
  return typeof value === 'string' && (WEATHERS as string[]).includes(value)
    ? (value as Weather)
    : undefined;
}
function resolveTerrain(value: unknown): Terrain | undefined {
  return typeof value === 'string' && (TERRAINS as string[]).includes(value)
    ? (value as Terrain)
    : undefined;
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
      "baseline at the active format's standard level (returned alongside the speed — don't " +
      'assume level 100). Never estimate a speed value yourself — always call this.',
    parameters: {
      type: 'object',
      properties: {
        species: { type: 'string', description: 'Species or nickname to calculate Speed for.' },
        tailwind: { type: 'boolean', description: 'Whether Tailwind is active on its side.' },
        paralyzed: { type: 'boolean', description: 'Whether the Pokemon is paralyzed.' },
        weather: { type: 'string', description: 'Active weather.', enum: WEATHERS },
        terrain: { type: 'string', description: 'Active terrain.', enum: TERRAINS },
      },
      required: ['species'],
    },
    handler: (args, ctx) => {
      const subject = resolveSpeedSubject(ctx.team, String(args.species));
      if ('error' in subject) return subject;
      const speed = calculateSpeed(
        subject,
        {
          tailwindActive: isTruthyFlag(args.tailwind),
          paralyzed: isTruthyFlag(args.paralyzed),
          weather: resolveWeather(args.weather),
          terrain: resolveTerrain(args.terrain),
        },
        getCalcGenForFormat(ctx.team?.format)
      );
      return { species: subject.species, level: subject.level, speed };
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
        useTera: { type: 'boolean', description: 'Whether the attacker has Terastallized.' },
        isSpreadMove: {
          type: 'boolean',
          description:
            'Whether this hits multiple targets in a doubles/Champions battle (e.g. Earthquake, ' +
            'Rock Slide, Dazzling Gleam with both opposing slots filled) — spread moves deal reduced damage.',
        },
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
      const weather = resolveWeather(args.weather);
      const terrain = resolveTerrain(args.terrain);
      if (weather) field.weather = weather;
      if (terrain) field.terrain = terrain;

      // calculateDamage applies a defender's teraType unconditionally (see
      // resolveCalcSubject's doc comment), so the attacker's real Tera type is only
      // attached here, and only when useTera was actually requested.
      const useTera = isTruthyFlag(args.useTera);
      if (useTera) {
        const attackerMember = findTeamMember(ctx.team, String(args.attacker));
        if (attackerMember?.teraType) attacker.teraType = attackerMember.teraType;
      }

      const result = calculateDamage(
        attacker,
        defender,
        move,
        field,
        isTruthyFlag(args.isSpreadMove),
        useTera,
        getCalcGenForFormat(ctx.team?.format)
      );
      // effectivenessLabel is derived from raw type matchups alone, so it can say
      // "super effective" even when an ability (Levitate, Flash Fire, ...) negated the
      // hit entirely. Flag that mismatch rather than reporting a misleading label.
      const effectiveness =
        result.maxPercent === 0 && result.effectivenessLabel !== 'no effect'
          ? `${result.effectivenessLabel} by type, but the actual damage was 0% — an ability likely negated it`
          : result.effectivenessLabel;

      return {
        move: move.name,
        minPercent: result.minPercent,
        maxPercent: result.maxPercent,
        koChance: result.koChance,
        effectiveness,
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
      'restricted to the active format\'s legal movepool when it\'s a Champions regulation, ' +
      'optionally filtered by a search query. Use before suggesting a moveset change.',
    parameters: {
      type: 'object',
      properties: {
        species: { type: 'string', description: 'Species name.' },
        query: { type: 'string', description: 'Optional substring to filter move names by.' },
      },
      required: ['species'],
    },
    handler: async (args, ctx) => {
      const format = ctx.team?.format;
      const moves = await getMovepoolForSpecies(String(args.species), getCalcGenForFormat(format));
      const scoped = isChampionsFormatId(format ?? '')
        ? (() => {
            const legal = new Set(getChampionsMovesForSpecies(String(args.species)).map((m) => m.toLowerCase()));
            return moves.filter((m) => legal.has(m.name.toLowerCase()));
          })()
        : moves;
      const query = typeof args.query === 'string' ? args.query.toLowerCase() : '';
      const filtered = query ? scoped.filter((m) => m.name.toLowerCase().includes(query)) : scoped;
      // Flag truncation explicitly — a model reading a bare list of 30 has no way to tell
      // it's incomplete, and could wrongly claim a real move doesn't exist.
      return {
        totalMatches: filtered.length,
        truncated: filtered.length > 30,
        moves: filtered
          .slice(0, 30)
          .map((m) => ({ name: m.name, type: m.type, category: m.category, power: m.power })),
      };
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
