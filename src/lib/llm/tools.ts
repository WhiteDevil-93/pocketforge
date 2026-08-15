// ============================================================================
// PocketForge — AI tool registry
//
// The model never computes game numbers itself — it calls these tools, which
// run the app's real calculators, and reports back only what they return.
// Every handler is a thin wrapper around an existing src/utils function.
// ============================================================================

import type { Pokemon, Team } from '../../types';
import { useStore } from '../../store/useStore';
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
import { getMovepoolForSpecies, getPokedexEntry } from '../../utils/movepoolQuery';
import { getDefaultLevelForFormat } from '../format';
import { getCalcGenForFormat } from '../showdown';
import { WRITE_TOOLS } from './writeTools';
import type { ToolDefinition } from './types';

const WEATHERS: Weather[] = ['none', 'sun', 'rain', 'sand', 'snow', 'harsh-sun', 'heavy-rain'];
const TERRAINS: Terrain[] = ['none', 'electric', 'grassy', 'psychic', 'misty'];

// Ollama's hosted search/fetch REST API — documented at https://docs.ollama.com/capabilities/web-search.
// Authenticated with the same API key as chat, so no separate credential is needed.
const WEB_SEARCH_URL = 'https://ollama.com/api/web_search';
const WEB_FETCH_URL = 'https://ollama.com/api/web_fetch';
const WEB_REQUEST_TIMEOUT_MS = 10_000;
const MAX_SEARCH_RESULTS = 10;
const DEFAULT_SEARCH_RESULTS = 5;
const SEARCH_SNIPPET_LIMIT = 1000;
const FETCH_CONTENT_LIMIT = 6000;

function truncate(text: string, limit: number): string {
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

/** Combines two abort signals without requiring AbortSignal.any — this app's minSdk 24
 *  Android target can run on WebViews old enough not to have it. */
function combineAbortSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  const controller = new AbortController();
  if (a.aborted || b.aborted) {
    controller.abort();
  } else {
    const onAbort = () => controller.abort();
    a.addEventListener('abort', onAbort, { once: true });
    b.addEventListener('abort', onAbort, { once: true });
  }
  return controller.signal;
}

/** Shared POST helper for the web_search/web_fetch tools — aborts on its own timeout
 *  (rather than relying solely on runToolCall's race) so a stalled request doesn't keep
 *  running in the background after the tool call has already "timed out" upstream, and
 *  also honors the caller's own signal so a user-initiated stop cancels it immediately
 *  instead of leaving it running for up to WEB_REQUEST_TIMEOUT_MS regardless. */
async function callOllamaWebApi(
  url: string,
  apiKey: string,
  body: Record<string, unknown>,
  callerSignal?: AbortSignal
): Promise<unknown> {
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), WEB_REQUEST_TIMEOUT_MS);
  const signal = callerSignal ? combineAbortSignals(callerSignal, timeoutController.signal) : timeoutController.signal;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { error: `Web request failed (${res.status} ${res.statusText})${text ? `: ${text}` : ''}` };
    }
    return await res.json();
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timer);
  }
}

function isWebApiError(data: unknown): data is { error: string } {
  return typeof data === 'object' && data !== null && 'error' in data;
}

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
 *  explicit useTera flag), so populating it for either side by default would
 *  silently Terastallize them on every query. The calculate_damage handler applies
 *  each side's real teraType itself, only when its useTera / isDefenderTerastallized
 *  flag is requested. */
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

/**
 * Get the active team from the live store.
 * Read tools use this instead of ctx.team (which is a stale snapshot from turn start)
 * so that after create_team mutations, read tools see the newly active team.
 */
function getLiveActiveTeam(): Team | { error: string } {
  const { teams, currentTeamId } = useStore.getState();
  const team = teams.find((t) => t.id === currentTeamId) ?? null;
  return team ?? { error: 'No team is currently open in the app.' };
}

/**
 * Get the active team's format from the live store (or undefined if no team open).
 * Used by tools that need format context but don't need the full team.
 */
function getLiveActiveTeamFormat(fallback?: { format?: string }): string | undefined {
  const { teams, currentTeamId } = useStore.getState();
  const team = teams.find((t) => t.id === currentTeamId);
  return team?.format ?? fallback?.format;
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
      let team = getLiveActiveTeam();
      if ('error' in team && ctx?.team) team = ctx.team;
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
      let team = getLiveActiveTeam();
      if ('error' in team && ctx?.team) team = ctx.team;
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
      let team = getLiveActiveTeam();
      if ('error' in team && ctx?.team) team = ctx.team;
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
      let team = getLiveActiveTeam();
      if ('error' in team && ctx?.team) team = ctx.team;
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
      let liveTeam = getLiveActiveTeam();
      if ('error' in liveTeam && ctx?.team) liveTeam = ctx.team;
      const teamArg = 'error' in liveTeam ? null : liveTeam;
      const subject = resolveSpeedSubject(teamArg, String(args.species));
      if ('error' in subject) return subject;
      const format = getLiveActiveTeamFormat();
      const speed = calculateSpeed(
        subject,
        {
          tailwindActive: isTruthyFlag(args.tailwind),
          paralyzed: isTruthyFlag(args.paralyzed),
          weather: resolveWeather(args.weather),
          terrain: resolveTerrain(args.terrain),
        },
        getCalcGenForFormat(format)
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
        isDefenderTerastallized: {
          type: 'boolean',
          description: "Whether the defender has Terastallized (uses the defender's own configured Tera type).",
        },
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
      let liveTeam = getLiveActiveTeam();
      if ('error' in liveTeam && ctx?.team) liveTeam = ctx.team;
      const teamArg = 'error' in liveTeam ? null : liveTeam;
      const attacker = resolveCalcSubject(teamArg, String(args.attacker));
      if ('error' in attacker) return attacker;
      const defender = resolveCalcSubject(teamArg, String(args.defender));
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
      // resolveCalcSubject's doc comment), so both sides' real Tera types are only
      // attached here, and only when the corresponding flag was actually requested.
      const useTera = isTruthyFlag(args.useTera);
      if (useTera) {
        const attackerMember = findTeamMember(teamArg, String(args.attacker));
        if (attackerMember?.teraType) attacker.teraType = attackerMember.teraType;
      }
      if (isTruthyFlag(args.isDefenderTerastallized)) {
        const defenderMember = findTeamMember(teamArg, String(args.defender));
        if (defenderMember?.teraType) defender.teraType = defenderMember.teraType;
      }

      const format = getLiveActiveTeamFormat();
      const result = calculateDamage(
        attacker,
        defender,
        move,
        field,
        isTruthyFlag(args.isSpreadMove),
        useTera,
        getCalcGenForFormat(format)
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
    description:
      "Get a Pokemon's types, base stats, and abilities for the active team's generation " +
      '(typing and stats can differ in older formats — e.g. Clefairy is Normal-type before Gen 6).',
    parameters: {
      type: 'object',
      properties: { species: { type: 'string', description: 'Species name.' } },
      required: ['species'],
    },
    handler: (args, ctx) => {
      const format = getLiveActiveTeamFormat(ctx?.team);
      const dex = getPokedexEntry(String(args.species), getCalcGenForFormat(format));
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
      const format = getLiveActiveTeamFormat(ctx?.team);
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

  {
    name: 'web_search',
    description:
      'Search the live web — for tournament rulings, patch notes, recent tier lists, or anything ' +
      "not covered by this app's own data. Prefer the dedicated tools (calculate_damage, " +
      'calculate_speed, validate_team, lookup_pokemon, etc.) for game mechanics and the active ' +
      'team — never use this as a substitute for those. Returns titles, URLs, and short excerpts; ' +
      'cite the source URL when you use a result.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query.' },
        maxResults: {
          type: 'number',
          description: `Number of results to return (1-${MAX_SEARCH_RESULTS}, default ${DEFAULT_SEARCH_RESULTS}).`,
        },
      },
      required: ['query'],
    },
    handler: async (args, ctx) => {
      if (!ctx.apiKey) return { error: 'No Ollama Cloud API key is available for web search.' };
      const query = String(args.query ?? '').trim();
      if (!query) return { error: 'A search query is required.' };

      const requested = Number(args.maxResults);
      const maxResults = Number.isFinite(requested)
        ? Math.min(Math.max(Math.trunc(requested), 1), MAX_SEARCH_RESULTS)
        : DEFAULT_SEARCH_RESULTS;

      const data = await callOllamaWebApi(WEB_SEARCH_URL, ctx.apiKey, { query, max_results: maxResults }, ctx.signal);
      if (isWebApiError(data)) return data;

      const rawResults = (data as { results?: unknown }).results;
      const results = Array.isArray(rawResults) ? rawResults : [];
      return {
        results: results.slice(0, maxResults).map((r) => {
          const result = r as { title?: string; url?: string; content?: string };
          return {
            title: result.title ?? '',
            url: result.url ?? '',
            content: truncate(result.content ?? '', SEARCH_SNIPPET_LIMIT),
          };
        }),
      };
    },
  },

  {
    name: 'web_fetch',
    description:
      "Fetch and read a specific web page's content — use when the user gives a URL directly, or " +
      'to read the full text of a promising web_search result.',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Full page URL, including https://.' },
      },
      required: ['url'],
    },
    handler: async (args, ctx) => {
      if (!ctx.apiKey) return { error: 'No Ollama Cloud API key is available for web access.' };
      const url = String(args.url ?? '').trim();
      if (!url) return { error: 'A URL is required.' };

      const data = await callOllamaWebApi(WEB_FETCH_URL, ctx.apiKey, { url }, ctx.signal);
      if (isWebApiError(data)) return data;

      const page = data as { title?: string; content?: string };
      const content = page.content ?? '';
      return {
        title: page.title ?? '',
        content: truncate(content, FETCH_CONTENT_LIMIT),
        truncated: content.length > FETCH_CONTENT_LIMIT,
      };
    },
  },
];

/** Read-only tools plus the mutating ones from writeTools.ts. Kept in one
 *  registry so both backends advertise the same surface — the write tools have
 *  no API-key or network dependency, so nothing gates them per-backend. */
export const ALL_TOOLS: ToolDefinition[] = [...TOOLS, ...WRITE_TOOLS];

export function getToolByName(name: string): ToolDefinition | undefined {
  return ALL_TOOLS.find((t) => t.name === name);
}

/** Ollama's tool-calling wire format (OpenAI-compatible function schema). */
export function toOllamaToolSchema() {
  return ALL_TOOLS.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}

/** Tool schema for the on-device llama.cpp backend: the Ollama schema minus the
 *  Ollama-Cloud-hosted web tools (web_search/web_fetch). Those have no local
 *  equivalent and need an API key the local backend never has, so advertising
 *  them to a local model would only produce calls that always fail. */
export function toLocalToolSchema() {
  const webOnlyTools = new Set(['web_search', 'web_fetch']);
  return toOllamaToolSchema().filter((tool) => !webOnlyTools.has(tool.function.name));
}
