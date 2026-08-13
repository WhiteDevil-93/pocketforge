// ============================================================================
// PocketForge — AI write tools (team creation and editing)
//
// The read-only tools in tools.ts let the model reason about a team. These let
// it BUILD one. Everything here mutates the real Zustand store, so every field
// is validated against the same game data the Builder UI uses before it lands:
// a model that invents an illegal move, a fake ability or a 600-EV spread gets
// a specific error back and can correct itself, rather than writing nonsense
// into a saved team.
//
// The store is read through useStore.getState() rather than ctx.team, because
// ctx.team is a snapshot taken when the turn started — stale the moment an
// earlier tool call in the same turn has already written to it.
// ============================================================================

import { useStore } from '../../store/useStore';
import { getAllNatureNames } from '../../data/naturesData';
import { TYPE_NAMES } from '../../data/typesData';
import { getChampionsMovesForSpecies, isChampionsFormatId, isEligibleForChampionsFormat } from '../../data/championsLegality';
import { getMovepoolForSpecies, getPokedexEntry } from '../../utils/movepoolQuery';
import { getCalcGenForFormat } from '../showdown';
import type { EVs, Pokemon, Team } from '../../types';
import type { ToolDefinition } from './types';

/** Per-stat EV ceiling and the total budget, matching validation.ts. */
const MAX_EV_PER_STAT = 252;
const MAX_EV_TOTAL = 508;
const MAX_TEAM_SIZE = 6;
const MAX_MOVES = 4;

const EV_KEYS: (keyof EVs)[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

/** Shape returned when a tool rejects the model's arguments. Always includes
 *  what was wrong AND what would be acceptable, so the model can retry without
 *  guessing a second time. */
function fail(error: string, extra?: Record<string, unknown>) {
  return { ok: false, error, ...extra };
}

// ---- Store access -----------------------------------------------------------

/** The live active team, or an error the model can act on. */
function activeTeam(): Team | { error: string } {
  const { teams, currentTeamId } = useStore.getState();
  const team = teams.find((t) => t.id === currentTeamId) ?? null;
  if (!team) {
    return { error: 'No team is open. Call create_team first, or ask which team to work on.' };
  }
  return team;
}

/** Resolve format to its generation, accounting for custom formats. */
function getGenForFormat(formatId: string | undefined): number {
  if (!formatId) return 9;
  // Check if it's a custom format (id starts with 'custom-')
  if (formatId.startsWith('custom-')) {
    const customFormat = useStore.getState().customFormats.find((f) => f.id === formatId);
    return customFormat?.generation ?? 9;
  }
  return getCalcGenForFormat(formatId);
}

function isError(value: unknown): value is { error: string } {
  return typeof value === 'object' && value !== null && 'error' in value;
}

/** Compact team summary returned after every mutation, so the model always sees
 *  the real post-write state instead of assuming its edit applied verbatim. */
function summarize(team: Team) {
  return {
    teamId: team.id,
    name: team.name,
    format: team.format,
    slots: `${team.pokemon.length}/${MAX_TEAM_SIZE}`,
    pokemon: team.pokemon.map((p, index) => ({
      index,
      species: p.species,
      nickname: p.nickname || undefined,
      item: p.item || undefined,
      ability: p.ability || undefined,
      nature: p.nature,
      teraType: p.teraType || undefined,
      moves: p.moves.filter(Boolean),
      evs: p.evs,
    })),
  };
}

function reread(teamId: string): Team | undefined {
  return useStore.getState().teams.find((t) => t.id === teamId);
}

// ---- Validation -------------------------------------------------------------

function resolveSpecies(raw: unknown, gen: number) {
  const name = String(raw ?? '').trim();
  if (!name) return { error: 'species is required.' };
  const entry = getPokedexEntry(name, gen);
  if (!entry) return { error: `"${name}" is not a species in this generation. Check the spelling.` };
  return entry;
}

/**
 * Legal-move check against the same source get_legal_moves reports from,
 * including the Champions-regulation narrowing — otherwise the model could read
 * a legal movepool from one tool and write an illegal one through another.
 */
async function validateMoves(
  species: string,
  moves: unknown,
  format: string | undefined,
  gen: number
): Promise<string[] | { error: string; legalExamples?: string[] }> {
  if (moves === undefined) return [];
  if (!Array.isArray(moves)) return { error: 'moves must be an array of move names.' };
  if (moves.length > MAX_MOVES) {
    return { error: `A Pokemon can have at most ${MAX_MOVES} moves, got ${moves.length}.` };
  }

  const names = moves.map((m) => String(m ?? '').trim()).filter(Boolean);
  const pool = await getMovepoolForSpecies(species, gen);
  const scoped = isChampionsFormatId(format ?? '')
    ? (() => {
        const legal = new Set(getChampionsMovesForSpecies(species).map((m) => m.toLowerCase()));
        return pool.filter((m) => legal.has(m.name.toLowerCase()));
      })()
    : pool;

  const byLower = new Map(scoped.map((m) => [m.name.toLowerCase(), m.name]));
  const resolved: string[] = [];
  const illegal: string[] = [];
  for (const name of names) {
    const match = byLower.get(name.toLowerCase());
    if (match) resolved.push(match);
    else illegal.push(name);
  }

  if (illegal.length > 0) {
    return {
      error:
        `${species} cannot learn: ${illegal.join(', ')}` +
        (isChampionsFormatId(format ?? '') ? ' (in this Champions regulation)' : '') +
        '. Call get_legal_moves before choosing moves.',
      legalExamples: scoped.slice(0, 15).map((m) => m.name),
    };
  }

  const seen = new Set<string>();
  for (const move of resolved) {
    const key = move.toLowerCase();
    if (seen.has(key)) return { error: `Duplicate move "${move}" — each move can appear once.` };
    seen.add(key);
  }
  return resolved;
}

function validateAbility(
  ability: unknown,
  entry: { abilities: string[]; hiddenAbility?: string }
): string | { error: string; legal: string[] } {
  if (ability === undefined) return '';
  const name = String(ability).trim();
  if (!name) return '';
  const legal = [...entry.abilities, ...(entry.hiddenAbility ? [entry.hiddenAbility] : [])];
  const match = legal.find((a) => a.toLowerCase() === name.toLowerCase());
  if (!match) return { error: `"${name}" is not one of this species' abilities.`, legal };
  return match;
}

function validateNature(nature: unknown): string | { error: string; legal: string[] } {
  if (nature === undefined) return '';
  const name = String(nature).trim();
  if (!name) return '';
  const all = getAllNatureNames();
  const match = all.find((n) => n.toLowerCase() === name.toLowerCase());
  if (!match) return { error: `"${name}" is not a nature.`, legal: all };
  return match;
}

function validateTeraType(tera: unknown): string | { error: string; legal: string[] } {
  if (tera === undefined) return '';
  const name = String(tera).trim();
  if (!name) return '';
  const match = TYPE_NAMES.find((t) => t.toLowerCase() === name.toLowerCase());
  if (!match) return { error: `"${name}" is not a type.`, legal: [...TYPE_NAMES] };
  return match;
}

/**
 * EV spread check. The model is allowed to choose a spread — that's judgement,
 * not arithmetic — but the budget is enforced here so an over-cap spread never
 * reaches a team and silently invalidates it.
 */
function validateEvs(evs: unknown): Partial<EVs> | { error: string } {
  if (evs === undefined) return {};
  if (typeof evs !== 'object' || evs === null || Array.isArray(evs)) {
    return { error: 'evs must be an object like { "spe": 252, "atk": 252, "hp": 4 }.' };
  }
  const input = evs as Record<string, unknown>;
  const out: Partial<EVs> = {};
  let total = 0;

  for (const [key, value] of Object.entries(input)) {
    const stat = EV_KEYS.find((k) => k === key.toLowerCase());
    if (!stat) {
      return { error: `"${key}" is not an EV stat. Use ${EV_KEYS.join(', ')}.` };
    }
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0 || n > MAX_EV_PER_STAT) {
      return { error: `EVs for ${stat} must be a whole number 0-${MAX_EV_PER_STAT}, got ${String(value)}.` };
    }
    out[stat] = n;
    total += n;
  }

  if (total > MAX_EV_TOTAL) {
    return { error: `EV total is ${total}, over the ${MAX_EV_TOTAL} limit. Reduce the spread.` };
  }
  return out;
}

function validateLevel(level: unknown): number | undefined | { error: string } {
  if (level === undefined) return undefined;
  const n = Number(level);
  if (!Number.isInteger(n) || n < 1 || n > 100) {
    return { error: `level must be a whole number 1-100, got ${String(level)}.` };
  }
  return n;
}

/** Resolves a slot the model referred to by index, nickname or species. */
function findSlot(team: Team, target: unknown): number | { error: string; onTeam?: string[] } {
  const raw = String(target ?? '').trim();
  if (!raw) return { error: 'target is required (slot index, nickname, or species).' };

  const asIndex = Number(raw);
  if (Number.isInteger(asIndex) && String(asIndex) === raw) {
    if (asIndex < 0 || asIndex >= team.pokemon.length) {
      return { error: `Slot ${asIndex} is empty. The team has ${team.pokemon.length} Pokemon.` };
    }
    return asIndex;
  }

  const lower = raw.toLowerCase();
  const byNickname = team.pokemon.findIndex((p) => (p.nickname || '').toLowerCase() === lower);
  if (byNickname >= 0) return byNickname;
  const bySpecies = team.pokemon.findIndex((p) => p.species.toLowerCase() === lower);
  if (bySpecies >= 0) return bySpecies;

  return {
    error: `No Pokemon matching "${raw}" on this team.`,
    onTeam: team.pokemon.map((p) => p.species),
  };
}

/**
 * Shared field validation for add_pokemon and update_pokemon. Returns either the
 * validated Pokemon patch or the first failure — nothing is written unless every
 * field passes, so a partly-wrong call never half-applies.
 */
async function buildPatch(
  args: Record<string, unknown>,
  species: string,
  format: string | undefined
): Promise<Partial<Pokemon> | { error: string; extra?: Record<string, unknown> }> {
  const gen = getGenForFormat(format);
  const entry = getPokedexEntry(species, gen);
  if (!entry) return { error: `"${species}" is not a species in this generation.` };

  const patch: Partial<Pokemon> = {};

  const moves = await validateMoves(species, args.moves, format, gen);
  if (isError(moves)) return { error: moves.error, extra: { legalExamples: moves.legalExamples } };
  if (args.moves !== undefined) patch.moves = moves;

  const ability = validateAbility(args.ability, entry);
  if (isError(ability)) return { error: ability.error, extra: { legal: ability.legal } };
  if (ability) patch.ability = ability;

  const nature = validateNature(args.nature);
  if (isError(nature)) return { error: nature.error, extra: { legal: nature.legal } };
  if (nature) patch.nature = nature;

  const teraType = validateTeraType(args.teraType);
  if (isError(teraType)) return { error: teraType.error, extra: { legal: teraType.legal } };
  if (teraType) patch.teraType = teraType;

  const evs = validateEvs(args.evs);
  if (isError(evs)) return { error: evs.error };
  if (args.evs !== undefined) {
    // Spread over a zeroed base: a partial spread must not inherit stray EVs
    // from whatever the slot happened to hold before.
    patch.evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, ...evs };
  }

  const level = validateLevel(args.level);
  if (isError(level)) return { error: level.error };
  if (level !== undefined) patch.level = level;

  if (args.item !== undefined && args.item !== null) patch.item = String(args.item).trim();
  if (args.nickname !== undefined && args.nickname !== null) patch.nickname = String(args.nickname).trim();

  return patch;
}

// ---- Tool definitions -------------------------------------------------------

const POKEMON_FIELDS = {
  nickname: { type: 'string', description: 'Optional nickname.' },
  level: { type: 'number', description: 'Level 1-100.' },
  item: { type: 'string', description: 'Held item name.' },
  ability: { type: 'string', description: "Must be one of the species' legal abilities." },
  nature: { type: 'string', description: 'Nature name, e.g. Adamant.' },
  teraType: { type: 'string', description: 'Tera type (Gen 9).' },
  moves: {
    type: 'array',
    description: 'Up to 4 move names. Must be legal for the species — call get_legal_moves first.',
  },
  evs: {
    type: 'object',
    description: 'EV spread, e.g. {"atk":252,"spe":252,"hp":4}. Max 252 per stat, 508 total.',
  },
} as const;

export const WRITE_TOOLS: ToolDefinition[] = [
  {
    name: 'create_team',
    description:
      'Create a new empty team and make it the active team. Use this before adding Pokemon ' +
      'when the user wants a new team. Returns the new team.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Team name.' },
        format: {
          type: 'string',
          description: "Format id, e.g. gen9vgc2026regj. Defaults to the user's default format.",
        },
      },
      required: ['name'],
    },
    handler: (args) => {
      const name = String(args.name ?? '').trim();
      if (!name) return fail('name is required.');

      const store = useStore.getState();
      const format = args.format === undefined ? undefined : String(args.format).trim() || undefined;
      const teamId = store.createTeam(name, format);
      const team = reread(teamId);
      if (!team) return fail('Team creation failed.');
      return { ok: true, created: true, ...summarize(team) };
    },
  },

  {
    name: 'add_pokemon',
    description:
      'Add a Pokemon to the active team, optionally with moves, item, ability, nature, ' +
      'Tera type and EVs. Every field is validated against real legality data — call ' +
      'get_legal_moves and lookup_pokemon first so the call succeeds on the first try.',
    parameters: {
      type: 'object',
      properties: {
        species: { type: 'string', description: 'Species name, e.g. Flutter Mane.' },
        ...POKEMON_FIELDS,
      },
      required: ['species'],
    },
    handler: async (args) => {
      const team = activeTeam();
      if (isError(team)) return fail(team.error);
      if (team.pokemon.length >= MAX_TEAM_SIZE) {
        return fail(`The team is already full (${MAX_TEAM_SIZE}). Remove one first.`);
      }

      const gen = getGenForFormat(team.format);
      const entry = resolveSpecies(args.species, gen);
      if (isError(entry)) return fail(entry.error);

      if (isChampionsFormatId(team.format) && !isEligibleForChampionsFormat(entry.name, team.format)) {
        return fail(`"${entry.name}" is not in the Champions roster for this regulation.`);
      }

      const patch = await buildPatch(args, entry.name, team.format);
      if (isError(patch)) return fail(patch.error, patch.extra);

      useStore.getState().addPokemon(team.id, { species: entry.name, ...patch });

      const after = reread(team.id);
      if (!after) return fail('Team disappeared while adding.');
      // The store caps at 6 and silently no-ops past it; confirm the write landed.
      if (after.pokemon.length === team.pokemon.length) {
        return fail('The Pokemon was not added — the team may be full.');
      }
      return { ok: true, added: entry.name, ...summarize(after) };
    },
  },

  {
    name: 'update_pokemon',
    description:
      'Change fields on a Pokemon already on the active team. Identify it by slot index, ' +
      'nickname or species. Only the fields you pass are changed.',
    parameters: {
      type: 'object',
      properties: {
        target: {
          type: 'string',
          description: 'Slot index (0-5), nickname, or species of the Pokemon to change.',
        },
        ...POKEMON_FIELDS,
      },
      required: ['target'],
    },
    handler: async (args) => {
      const team = activeTeam();
      if (isError(team)) return fail(team.error);

      const index = findSlot(team, args.target);
      if (isError(index)) return fail(index.error, { onTeam: index.onTeam });

      const current = team.pokemon[index];
      const patch = await buildPatch(args, current.species, team.format);
      if (isError(patch)) return fail(patch.error, patch.extra);
      if (Object.keys(patch).length === 0) {
        return fail('No fields to change. Pass at least one of moves, item, ability, nature, teraType, evs, level, nickname.');
      }

      // The store may have changed while buildPatch awaited legality data.
      const fresh = reread(team.id);
      if (!fresh) return fail('Team disappeared while updating.');
      const freshIndex = findSlot(fresh, args.target);
      if (isError(freshIndex)) return fail(freshIndex.error, { onTeam: freshIndex.onTeam });
      if (fresh.pokemon[freshIndex].species !== current.species) {
        return fail('The team changed while validating. Read it again and retry.');
      }
      useStore.getState().updatePokemon(team.id, freshIndex, patch);

      const after = reread(team.id);
      if (!after) return fail('Team disappeared while updating.');
      return { ok: true, updated: current.species, changed: Object.keys(patch), ...summarize(after) };
    },
  },

  {
    name: 'remove_pokemon',
    description:
      'Remove a Pokemon from the active team by slot index, nickname or species.',
    parameters: {
      type: 'object',
      properties: {
        target: {
          type: 'string',
          description: 'Slot index (0-5), nickname, or species of the Pokemon to remove.',
        },
      },
      required: ['target'],
    },
    handler: (args) => {
      const team = activeTeam();
      if (isError(team)) return fail(team.error);

      const index = findSlot(team, args.target);
      if (isError(index)) return fail(index.error, { onTeam: index.onTeam });

      const removed = team.pokemon[index].species;
      useStore.getState().removePokemon(team.id, index);

      const after = reread(team.id);
      if (!after) return fail('Team disappeared while removing.');
      return { ok: true, removed, ...summarize(after) };
    },
  },
];
