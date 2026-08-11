// ============================================================================
// PocketForge — PokéAPI static-data layer
//
// Fetches and caches moves / items / abilities / species metadata from
// PokéAPI (https://pokeapi.co/api/v2/), hydrated with the repo's bundled
// generated data (src/data/movesData.ts, itemsData.ts, pokemonData.ts,
// sprites.ts) where possible so runtime network calls stay low.
//
// Cache chain (offline-first): memory -> IndexedDB -> localStorage -> network.
// Data is static per generation, so cached records never expire by default;
// app updates bust the cache via clearPokeApiCache().
// ============================================================================

import { MOVES, getMoveByName } from '@/data/movesData';
import { getItemByName, getItemSpriteUrl } from '@/data/itemsData';
import { getPokemonByName } from '@/data/pokemonData';
import { getSpriteUrl } from '@/data/sprites';
import type {
  HydratedAbility,
  HydratedItem,
  HydratedMove,
  HydratedSpecies,
  HydrationSource,
  MoveCategory,
  RankedAbility,
  RankedItem,
  RankedMove,
} from './types';

// ----------------------------------------------------------------------------
// Public constants
// ----------------------------------------------------------------------------

export const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
export const POKEAPI_CACHE_PREFIX = 'pokeapi-v2';
export const DEFAULT_POKEAPI_CONCURRENCY = 6;
export const DEFAULT_POKEAPI_RETRIES = 3;

/** PokéAPI resource families this layer caches. */
export type PokeApiResource = 'move' | 'item' | 'ability' | 'pokemon' | 'pokemon-species';

export interface PokeApiFetchOptions {
  /** Override the fetch implementation (defaults to the global fetch). */
  fetchImpl?: typeof fetch;
  /** Number of attempts per network request (default 3, exponential backoff). */
  retries?: number;
  /**
   * Max age of a cached record in ms before it is re-fetched.
   * Defaults to Infinity — PokéAPI data is static per generation; use
   * clearPokeApiCache() for app-update cache busting.
   */
  maxAgeMs?: number;
}

// ----------------------------------------------------------------------------
// Cache layer
// ----------------------------------------------------------------------------

interface CacheRecord<T> {
  key: string;
  data: T;
  storedAt: number;
}

const DB_NAME = 'pocketforge-pokeapi';
const DB_VERSION = 1;
const DB_STORE = 'resources';

const memoryCache = new Map<string, CacheRecord<unknown>>();
const negativeCache = new Set<string>();
const inflight = new Map<string, Promise<unknown>>();

let dbPromise: Promise<IDBDatabase | null> | null = null;

function getDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase | null>((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(DB_STORE)) {
          request.result.createObjectStore(DB_STORE, { keyPath: 'key' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

async function idbGet<T>(key: string): Promise<CacheRecord<T> | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    return await new Promise<CacheRecord<T> | null>((resolve) => {
      const transaction = db.transaction(DB_STORE, 'readonly');
      const request = transaction.objectStore(DB_STORE).get(key);
      request.onsuccess = () => resolve((request.result as CacheRecord<T> | undefined) ?? null);
      request.onerror = () => resolve(null);
      transaction.onabort = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function idbSet<T>(record: CacheRecord<T>): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(DB_STORE, 'readwrite');
      transaction.objectStore(DB_STORE).put(record);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    return true;
  } catch {
    return false;
  }
}

async function idbDelete(key: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(DB_STORE, 'readwrite');
      transaction.objectStore(DB_STORE).delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } catch {
    /* ignore — best-effort delete */
  }
}

function lsGet<T>(key: string): CacheRecord<T> | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheRecord<T>;
    if (parsed === null || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function lsSet<T>(key: string, record: CacheRecord<T>): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

function lsRemove(key: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore — best-effort remove */
  }
}

function isStale(record: CacheRecord<unknown>, maxAgeMs: number): boolean {
  if (maxAgeMs === Infinity) return false;
  return Date.now() - record.storedAt > maxAgeMs;
}

async function cacheGet<T>(key: string, maxAgeMs: number): Promise<T | null> {
  const memory = memoryCache.get(key) as CacheRecord<T> | undefined;
  if (memory) {
    if (isStale(memory, maxAgeMs)) {
      memoryCache.delete(key);
    } else {
      return memory.data;
    }
  }
  const fromIdb = await idbGet<T>(key);
  if (fromIdb) {
    memoryCache.set(key, fromIdb as CacheRecord<unknown>);
    if (isStale(fromIdb, maxAgeMs)) {
      await idbDelete(key);
      return null;
    }
    return fromIdb.data;
  }
  const fromLs = lsGet<T>(key);
  if (fromLs) {
    memoryCache.set(key, fromLs as CacheRecord<unknown>);
    if (isStale(fromLs, maxAgeMs)) {
      lsRemove(key);
      return null;
    }
    return fromLs.data;
  }
  return null;
}

async function cacheSet<T>(key: string, data: T): Promise<void> {
  const record: CacheRecord<T> = { key, data, storedAt: Date.now() };
  memoryCache.set(key, record as CacheRecord<unknown>);
  const wroteIdb = await idbSet(record);
  if (!wroteIdb) lsSet(key, record);
}

export function cacheKeyFor(resource: PokeApiResource, id: string | number): string {
  return `${POKEAPI_CACHE_PREFIX}-${resource}-${String(id).trim().toLowerCase()}`;
}

/**
 * Cache-bust hook for app updates. Wipes every cached PokéAPI resource
 * (memory, IndexedDB and localStorage), forcing a fresh fetch next read.
 */
export async function clearPokeApiCache(): Promise<void> {
  memoryCache.clear();
  negativeCache.clear();
  const db = await getDb();
  if (db) {
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(DB_STORE, 'readwrite');
        transaction.objectStore(DB_STORE).clear();
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
    } catch {
      /* ignore — best-effort clear */
    }
  }
  if (typeof localStorage === 'undefined') return;
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(POKEAPI_CACHE_PREFIX)) toRemove.push(key);
  }
  for (const key of toRemove) lsRemove(key);
}

// ----------------------------------------------------------------------------
// Fetch plumbing: in-flight dedupe, concurrency cap, retries with backoff
// ----------------------------------------------------------------------------

class AsyncLimiter {
  private active = 0;
  private queue: Array<() => void> = [];
  private readonly limit: number;

  constructor(limit: number) {
    this.limit = Math.max(1, Math.floor(limit));
  }

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.active >= this.limit) {
      await new Promise<void>((resolve) => {
        this.queue.push(resolve);
      });
    }
    this.active += 1;
    try {
      return await task();
    } finally {
      this.active -= 1;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

let limiter = new AsyncLimiter(DEFAULT_POKEAPI_CONCURRENCY);
let fetchImplOverride: typeof fetch | undefined;

function resolveFetchImpl(options: PokeApiFetchOptions): typeof fetch {
  const chosen = options.fetchImpl ?? fetchImplOverride;
  if (chosen) return chosen;
  if (typeof fetch === 'function') return fetch;
  return async () => {
    throw new Error('PokéAPI fetch unavailable in this environment');
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchWithRetry(url: string, fetchImpl: typeof fetch, retries: number): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetchImpl(url);
      if (response.status === 404) return response;
      if (!response.ok) {
        throw new Error(`PokéAPI request failed with status ${response.status}: ${url}`);
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < retries - 1) {
        const backoff = 300 * 2 ** attempt + Math.floor(Math.random() * 200);
        await delay(backoff);
      }
    }
  }
  throw lastError;
}

async function fetchResource<T extends { id?: number; name?: string }>(resource: PokeApiResource, id: string | number, options: PokeApiFetchOptions): Promise<T | null> {
  const key = cacheKeyFor(resource, id);
  if (negativeCache.has(key)) return null;
  const cached = await cacheGet<T>(key, options.maxAgeMs ?? Infinity);
  if (cached !== null) return cached;

  const inflightKey = `${resource}:${key}`;
  const existing = inflight.get(inflightKey);
  if (existing) return existing as Promise<T | null>;

  const request = limiter.run(async () => {
    try {
      const slug = String(id).trim().toLowerCase();
      const url = `${POKEAPI_BASE_URL}/${resource}/${encodeURIComponent(slug)}/`;
      const fetchImpl = resolveFetchImpl(options);
      const response = await fetchWithRetry(url, fetchImpl, options.retries ?? DEFAULT_POKEAPI_RETRIES);
      if (response.status === 404) {
        negativeCache.add(key);
        return null;
      }
      const data = (await response.json()) as T;
      await cacheResource(resource, key, data);
      return data;
    } catch (error) {
      // Network failures degrade to null; hydrate* falls back to local data.
      console.warn(`[pokeapi] failed to fetch ${resource}/${String(id)}:`, error);
      return null;
    }
  });
  inflight.set(inflightKey, request);
  try {
    return await request;
  } finally {
    inflight.delete(inflightKey);
  }
}

/** Store a fetched resource under its primary key plus id/name alias keys. */
async function cacheResource<T extends { id?: number; name?: string }>(resource: PokeApiResource, primaryKey: string, data: T): Promise<void> {
  await cacheSet(primaryKey, data);
  const aliases = new Set<string>();
  if (typeof data.id === 'number' && data.id >= 0) aliases.add(cacheKeyFor(resource, data.id));
  if (typeof data.name === 'string' && data.name.length > 0) aliases.add(cacheKeyFor(resource, data.name));
  for (const alias of aliases) {
    if (alias !== primaryKey) await cacheSet(alias, data);
  }
}

// ----------------------------------------------------------------------------
// Name normalization & PokéAPI response shapes
// ----------------------------------------------------------------------------

/**
 * Convert a user-facing name ('Thunderbolt', "King's Shield") to a PokéAPI
 * slug. Apostrophes are dropped entirely (PokéAPI: "King's Shield" ->
 * 'kings-shield'); other non-alphanumeric runs become single hyphens.
 */
export function toPokeApiSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toApiId(nameOrId: string | number): string {
  if (typeof nameOrId === 'number') return String(nameOrId);
  if (/^\d+$/.test(nameOrId.trim())) return nameOrId.trim();
  return toPokeApiSlug(nameOrId);
}

function capitalize(value: string): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** 'wonder-guard' -> 'Wonder Guard'. */
function titleCase(slug: string): string {
  return slug
    .split('-')
    .map((part) => capitalize(part))
    .join(' ');
}

// Reverse index so API-only lookups (by numeric id) still get the canonical
// local display name, e.g. PokéAPI 'thunder-bolt' -> local 'Thunderbolt'.
let localMoveNamesByCompactId: Map<string, string> | null = null;

function localMoveNameForApiSlug(apiSlug: string): string | undefined {
  if (!apiSlug) return undefined;
  if (!localMoveNamesByCompactId) {
    localMoveNamesByCompactId = new Map(MOVES.map((entry) => [entry.id, entry.name]));
  }
  const compact = apiSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
  return localMoveNamesByCompactId.get(compact);
}

function toMoveCategory(raw: string | undefined): MoveCategory {
  const normalized = (raw ?? '').toLowerCase();
  if (normalized === 'physical') return 'Physical';
  if (normalized === 'special') return 'Special';
  return 'Status';
}

function sourceOf(apiPresent: boolean, localPresent: boolean): HydrationSource {
  if (apiPresent && localPresent) return 'mixed';
  if (apiPresent) return 'pokeapi';
  return 'local';
}

const TARGET_LABELS: Record<string, string> = {
  'specific-move': 'A specific move',
  'selected-pokemon': 'One opposing Pokémon',
  'selected-pokemon-me-first': 'The user',
  'all-other-pokemon': 'All other Pokémon',
  'all-allies': 'All allies',
  'all-opponents': 'All opposing Pokémon',
  'all-pokemon': 'All Pokémon on the field',
  ally: 'An ally',
  allies: 'One ally',
  'entire-field': 'The entire field',
  user: 'The user',
  'random-opponent': 'A random opposing Pokémon',
  'user-or-ally': 'The user or an ally',
  'opponents-field': 'The opposing side of the field',
  'users-field': "The user's side of the field",
  'fainting-pokemon': 'A fainting Pokémon',
};

function targetDescription(apiTargetName: string | undefined): string {
  if (!apiTargetName) return '';
  return TARGET_LABELS[apiTargetName] ?? '';
}

/** Showdown type-icon sprite URL for a move — no network needed. */
export function typeSpriteUrl(type: string): string {
  if (!type) return '';
  return `https://play.pokemonshowdown.com/sprites/types/${type}.png`;
}

function englishFlavor(entries: Array<{ flavor_text?: string; text?: string; language?: { name?: string } }>): string {
  for (const entry of entries) {
    if (entry.language?.name !== 'en') continue;
    // Moves/abilities use 'flavor_text'; items use 'text'.
    const text = entry.flavor_text ?? entry.text;
    if (text) return text.replace(/\n|\f/g, ' ').trim();
  }
  return '';
}

interface PokeApiMove {
  id: number;
  name: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number | null;
  type: { name: string } | null;
  damage_class: { name: string } | null;
  target: { name: string } | null;
  effect_entries: Array<{ effect: string; short_effect: string; language: { name: string } }>;
  flavor_text_entries: Array<{ flavor_text: string; language: { name: string } }>;
}

interface PokeApiItem {
  id: number;
  name: string;
  category: { name: string } | null;
  effect_entries: Array<{ effect: string; short_effect: string; language: { name: string } }>;
  flavor_text_entries: Array<{ flavor_text: string; language: { name: string } }>;
  sprites: { default: string | null } | null;
}

interface PokeApiAbility {
  id: number;
  name: string;
  effect_entries: Array<{ effect: string; short_effect: string; language: { name: string } }>;
  flavor_text_entries: Array<{ flavor_text: string; language: { name: string } }>;
}

interface PokeApiPokemon {
  id: number;
  name: string;
  types: Array<{ type: { name: string } }>;
  abilities: Array<{ ability: { name: string } }>;
  sprites: {
    front_default: string | null;
    other: { 'official-artwork': { front_default: string | null } } | null;
  } | null;
}

// ----------------------------------------------------------------------------
// Hydration API
// ----------------------------------------------------------------------------

/**
 * Hydrate a move from local generated data + PokéAPI enrichment.
 * Returns null only when the move exists in neither source.
 */
export async function hydrateMove(nameOrId: string | number, options: PokeApiFetchOptions = {}): Promise<HydratedMove | null> {
  const local = typeof nameOrId === 'string' ? getMoveByName(nameOrId) : undefined;
  const api = await fetchResource<PokeApiMove>('move', toApiId(nameOrId), options);
  if (!local && !api) return null;

  const name = local?.name ?? (api ? localMoveNameForApiSlug(api.name) ?? titleCase(api.name) : String(nameOrId));
  const type = local?.type ?? (api?.type?.name ? capitalize(api.type.name) : '');
  const category = toMoveCategory(local?.category ?? api?.damage_class?.name ?? '');
  const power = local?.power ?? api?.power ?? 0;
  const accuracy = local?.accuracy ?? api?.accuracy ?? 0;
  const pp = local?.pp ?? api?.pp ?? 0;
  const priority = local?.priority ?? api?.priority ?? 0;
  const target = targetDescription(api?.target?.name ?? '') || local?.target || '';

  let effectShort = '';
  let effectFull = '';
  if (api) {
    for (const entry of api.effect_entries ?? []) {
      if (entry.language?.name !== 'en') continue;
      effectShort = effectShort || (entry.short_effect ?? '').trim();
      effectFull = effectFull || (entry.effect ?? '').trim();
      if (effectShort && effectFull) break;
    }
    if (!effectShort) effectShort = englishFlavor(api.flavor_text_entries ?? []);
    if (!effectFull) effectFull = effectShort;
  }

  return {
    id: api?.id ?? null,
    name,
    type,
    category,
    power,
    accuracy,
    pp,
    priority,
    target,
    effectShort,
    effectFull,
    spriteUrl: typeSpriteUrl(type),
    source: sourceOf(api !== null, local !== undefined),
  };
}

/** Hydrate a held item from local generated data + PokéAPI enrichment. */
export async function hydrateItem(nameOrId: string | number, options: PokeApiFetchOptions = {}): Promise<HydratedItem | null> {
  const local = typeof nameOrId === 'string' ? getItemByName(nameOrId) : undefined;
  const api = await fetchResource<PokeApiItem>('item', toApiId(nameOrId), options);
  if (!local && !api) return null;

  const name = local?.name ?? (api?.name ? titleCase(api.name) : String(nameOrId));

  let description = '';
  if (api) {
    for (const entry of api.effect_entries ?? []) {
      if (entry.language?.name !== 'en') continue;
      description = description || (entry.short_effect ?? '').trim() || (entry.effect ?? '').trim();
      if (description) break;
    }
    if (!description) description = englishFlavor(api.flavor_text_entries ?? []);
  }
  description = description || local?.description || '';

  const spriteUrl = api?.sprites?.default ?? getItemSpriteUrl(name);
  const category = local?.category ?? api?.category?.name ?? '';

  return {
    id: api?.id ?? null,
    name,
    description,
    category,
    spriteUrl,
    source: sourceOf(api !== null, local !== undefined),
  };
}

/** Hydrate an ability from PokéAPI (the repo has no local ability data file). */
export async function hydrateAbility(nameOrId: string | number, options: PokeApiFetchOptions = {}): Promise<HydratedAbility | null> {
  const api = await fetchResource<PokeApiAbility>('ability', toApiId(nameOrId), options);
  if (!api) return null;

  let shortDescription = '';
  let description = '';
  for (const entry of api.effect_entries ?? []) {
    if (entry.language?.name !== 'en') continue;
    shortDescription = shortDescription || (entry.short_effect ?? '').trim();
    description = description || (entry.effect ?? '').trim();
    if (shortDescription && description) break;
  }
  if (!shortDescription) shortDescription = englishFlavor(api.flavor_text_entries ?? []);
  if (!description) description = shortDescription;

  return {
    id: api.id,
    name: titleCase(api.name) || String(nameOrId),
    description,
    shortDescription,
    source: 'pokeapi',
  };
}

/** Hydrate a species from local generated data + PokéAPI (sprite/artwork). */
export async function hydrateSpecies(nameOrId: string | number, options: PokeApiFetchOptions = {}): Promise<HydratedSpecies | null> {
  const local = typeof nameOrId === 'string' ? getPokemonByName(nameOrId) : undefined;
  const api = await fetchResource<PokeApiPokemon>('pokemon', toApiId(nameOrId), options);
  if (!local && !api) return null;

  const name = local?.name ?? (api?.name ? titleCase(api.name) : String(nameOrId));
  const types = local && local.types.length > 0
    ? local.types
    : (api?.types ?? []).map((t) => capitalize(t.type?.name ?? '')).filter((t) => t.length > 0);
  const abilities = local && local.abilities.length > 0
    ? local.abilities
    : (api?.abilities ?? []).map((a) => titleCase(a.ability?.name ?? '')).filter((a) => a.length > 0);
  const spriteUrl = local ? getSpriteUrl(local.name) : (api?.sprites?.front_default ?? '');
  const officialArtworkUrl = api?.sprites?.other?.['official-artwork']?.front_default ?? api?.sprites?.front_default ?? null;

  return {
    id: api?.id ?? null,
    name,
    types,
    abilities,
    spriteUrl,
    officialArtworkUrl,
    source: sourceOf(api !== null, local !== undefined),
  };
}

// ----------------------------------------------------------------------------
// Batch variants (concurrency is capped by the shared limiter)
// ----------------------------------------------------------------------------

async function runBatched<T>(inputs: Array<string | number>, fn: (input: string | number) => Promise<T>): Promise<Array<T>> {
  return Promise.all(inputs.map((input) => fn(input)));
}

export function hydrateMoves(names: Array<string | number>, options?: PokeApiFetchOptions): Promise<Array<HydratedMove | null>> {
  return runBatched(names, (name) => hydrateMove(name, options));
}

export function hydrateItems(names: Array<string | number>, options?: PokeApiFetchOptions): Promise<Array<HydratedItem | null>> {
  return runBatched(names, (name) => hydrateItem(name, options));
}

export function hydrateAbilities(names: Array<string | number>, options?: PokeApiFetchOptions): Promise<Array<HydratedAbility | null>> {
  return runBatched(names, (name) => hydrateAbility(name, options));
}

export function hydrateSpeciesList(names: Array<string | number>, options?: PokeApiFetchOptions): Promise<Array<HydratedSpecies | null>> {
  return runBatched(names, (name) => hydrateSpecies(name, options));
}

// ----------------------------------------------------------------------------
// Ranked-seed hydration: turn Smogon rank rows into fully hydrated Ranked* rows
// ----------------------------------------------------------------------------

export interface RankedMoveSeed {
  rank: number;
  name: string;
  usagePercent: number;
}

export interface RankedItemSeed {
  rank: number;
  name: string;
  usagePercent: number;
}

export interface RankedAbilitySeed {
  rank: number;
  name: string;
  usagePercent: number;
}

/** Hydrate a Smogon-ranked move row into a full RankedMove (null if unknown). */
export async function hydrateRankedMove(seed: RankedMoveSeed, options: PokeApiFetchOptions = {}): Promise<RankedMove | null> {
  const hydrated = await hydrateMove(seed.name, options);
  if (!hydrated) return null;
  return {
    rank: seed.rank,
    name: hydrated.name,
    usagePercent: seed.usagePercent,
    type: hydrated.type,
    category: hydrated.category,
    power: hydrated.power,
    accuracy: hydrated.accuracy,
    pp: hydrated.pp,
    priority: hydrated.priority,
    target: hydrated.target,
    effectShort: hydrated.effectShort,
    effectFull: hydrated.effectFull,
    spriteUrl: hydrated.spriteUrl,
  };
}

/** Hydrate a Smogon-ranked item row into a full RankedItem (null if unknown). */
export async function hydrateRankedItem(seed: RankedItemSeed, options: PokeApiFetchOptions = {}): Promise<RankedItem | null> {
  const hydrated = await hydrateItem(seed.name, options);
  if (!hydrated) return null;
  return {
    rank: seed.rank,
    name: hydrated.name,
    usagePercent: seed.usagePercent,
    description: hydrated.description,
    spriteUrl: hydrated.spriteUrl,
  };
}

/** Hydrate a Smogon-ranked ability row into a full RankedAbility (null if unknown). */
export async function hydrateRankedAbility(seed: RankedAbilitySeed, options: PokeApiFetchOptions = {}): Promise<RankedAbility | null> {
  const hydrated = await hydrateAbility(seed.name, options);
  if (!hydrated) return null;
  return {
    rank: seed.rank,
    name: hydrated.name,
    usagePercent: seed.usagePercent,
    description: hydrated.description,
    shortDescription: hydrated.shortDescription,
  };
}

// ----------------------------------------------------------------------------
// Test hooks
// ----------------------------------------------------------------------------

/** Override the fetch implementation globally (useful for tests). */
export function setPokeApiFetch(fetchImpl: typeof fetch | undefined): void {
  fetchImplOverride = fetchImpl;
}

/** Set the global concurrency cap for in-flight PokéAPI requests. */
export function setPokeApiConcurrency(limit: number): void {
  limiter = new AsyncLimiter(Math.max(1, Math.floor(limit)));
}
