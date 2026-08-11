// ============================================================================
// PocketForge — PokéAPI static-data layer
//
// Fetch + cache moves, items, abilities and species metadata from
// https://pokeapi.co/api/v2/ and map it into the hydrated fields the
// BattleData types need. Data is static per generation, so the cache is
// effectively infinite; app updates can clear it via clearPokeApiCache().
//
// Offline-first strategy:
//   1. Local bundled data (src/data/movesData.ts, itemsData.ts, pokemonData.ts)
//      supplies type/power/accuracy/pp/priority/target/sprite instantly.
//   2. PokéAPI only enriches the fields local data lacks (effect text,
//      readable targets, English flavor) — once, then cached forever.
//   3. Cache backend: IndexedDB when available, localStorage as a fallback,
//      in-memory otherwise (keeps the module testable in Node/SSR).
// ============================================================================

import { getMoveByName, type MoveEntry } from '../../data/movesData';
import { getItemByName, getItemSpriteUrl } from '../../data/itemsData';
import { getPokemonByName } from '../../data/pokemonData';
import { getSpriteUrl } from '../../data/sprites';
import type {
  HydratedAbility,
  HydratedItem,
  HydratedMove,
  MoveCategory,
  PokemonSpeciesInfo,
  RankedAbility,
  RankedEntryBase,
  RankedItem,
  RankedMove,
} from './types';

export const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
/** Prefix for every cache key, e.g. `pokeapi-v2-move-ice-beam`. */
export const POKEAPI_CACHE_PREFIX = 'pokeapi-v2';
/** Upper bound on simultaneous PokéAPI requests (rate limit is ~100 req/min). */
export const MAX_CONCURRENCY = 6;
/** Retries per request before giving up (429/5xx/network errors back off). */
export const MAX_RETRIES = 3;

export type PokeApiResource = 'move' | 'item' | 'ability' | 'pokemon-species';

export interface HydrateOptions {
  signal?: AbortSignal;
  /** Injectable fetch for tests. Defaults to global fetch. */
  fetchImpl?: typeof fetch;
  /** Override the per-request retry count. */
  retries?: number;
}

// ----------------------------------------------------------------------------
// Cache backend: IndexedDB (preferred) → localStorage → memory
// ----------------------------------------------------------------------------

export type CacheBackendName = 'indexeddb' | 'localstorage' | 'memory';

interface CacheRecord {
  /** Present only in IndexedDB records (object store keyPath). */
  key?: string;
  value: unknown;
  storedAt: number;
}

interface CacheBackend {
  readonly name: CacheBackendName;
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  clear(prefix: string): Promise<void>;
}

class MemoryCacheBackend implements CacheBackend {
  readonly name: CacheBackendName = 'memory';
  private readonly store = new Map<string, CacheRecord>();

  async get<T>(key: string): Promise<T | undefined> {
    return this.store.get(key)?.value as T | undefined;
  }

  async set(key: string, value: unknown): Promise<void> {
    this.store.set(key, { value, storedAt: Date.now() });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(prefix: string): Promise<void> {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }
}

class LocalStorageCacheBackend implements CacheBackend {
  readonly name: CacheBackendName = 'localstorage';

  private read(key: string): CacheRecord | undefined {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as CacheRecord) : undefined;
    } catch {
      return undefined;
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.read(key)?.value as T | undefined;
  }

  async set(key: string, value: unknown): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify({ value, storedAt: Date.now() } satisfies CacheRecord));
    } catch {
      // Quota exceeded / private mode — cache writes are best-effort.
    }
  }

  async delete(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch {
      // Best-effort.
    }
  }

  async clear(prefix: string): Promise<void> {
    try {
      for (let i = localStorage.length - 1; i >= 0; i -= 1) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) localStorage.removeItem(key);
      }
    } catch {
      // Best-effort.
    }
  }
}

const IDB_NAME = 'pocketforge-pokeapi-cache';
const IDB_VERSION = 1;
const IDB_STORE = 'entries';

function openIndexedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
    request.onblocked = () => reject(new Error('IndexedDB open blocked'));
  });
}

class IndexedDbCacheBackend implements CacheBackend {
  readonly name: CacheBackendName = 'indexeddb';
  private readonly db: IDBDatabase;

  constructor(db: IDBDatabase) {
    this.db = db;
  }

  async get<T>(key: string): Promise<T | undefined> {
    return new Promise<T | undefined>((resolve, reject) => {
      const tx = this.db.transaction(IDB_STORE, 'readonly');
      const request = tx.objectStore(IDB_STORE).get(key);
      request.onsuccess = () => {
        const record = request.result as CacheRecord | undefined;
        resolve(record?.value as T | undefined);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async set(key: string, value: unknown): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const tx = this.db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put({ key, value, storedAt: Date.now() } satisfies CacheRecord);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  async delete(key: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const tx = this.db.transaction(IDB_STORE, 'readwrite');
      const request = tx.objectStore(IDB_STORE).delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(prefix: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const tx = this.db.transaction(IDB_STORE, 'readwrite');
      const range = IDBKeyRange.bound(prefix, `${prefix}\uffff`);
      const request = tx.objectStore(IDB_STORE).delete(range);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

let activeBackend: CacheBackend | null = null;
let backendPromise: Promise<CacheBackend> | null = null;

async function resolveBackend(): Promise<CacheBackend> {
  if (activeBackend) return activeBackend;
  if (!backendPromise) {
    backendPromise = (async () => {
      if (typeof indexedDB !== 'undefined') {
        try {
          const db = await openIndexedDb();
          return new IndexedDbCacheBackend(db);
        } catch {
          // IndexedDB unavailable/blocked — fall through to localStorage.
        }
      }
      if (typeof localStorage !== 'undefined') {
        try {
          const probe = `${POKEAPI_CACHE_PREFIX}-probe`;
          localStorage.setItem(probe, '1');
          localStorage.removeItem(probe);
          return new LocalStorageCacheBackend();
        } catch {
          // localStorage unavailable (SSR/tests/private mode) — use memory.
        }
      }
      return new MemoryCacheBackend();
    })();
  }
  activeBackend = await backendPromise;
  return activeBackend;
}

async function cacheGet<T>(key: string): Promise<T | undefined> {
  try {
    return await (await resolveBackend()).get<T>(key);
  } catch {
    return undefined;
  }
}

async function cacheSet(key: string, value: unknown): Promise<void> {
  try {
    await (await resolveBackend()).set(key, value);
  } catch {
    // Cache writes are best-effort — never fail a hydration because of them.
  }
}

export interface PokeApiCache {
  readonly backend: CacheBackendName;
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown): Promise<void>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
}

/** Resolve the active cache backend name without touching the network. */
export async function getPokeApiCacheBackend(): Promise<CacheBackendName> {
  return (await resolveBackend()).name;
}

/** Handle to the active cache for callers that need direct access. */
export async function getPokeApiCache(): Promise<PokeApiCache> {
  const backend = await resolveBackend();
  return {
    backend: backend.name,
    get: <T>(key: string) => backend.get<T>(key),
    set: (key: string, value: unknown) => backend.set(key, value),
    has: async (key: string) => (await backend.get<unknown>(key)) !== undefined,
    delete: (key: string) => backend.delete(key),
  };
}

/**
 * Cache-bust hook for app updates: drops every cached PokéAPI response
 * (storedAt metadata is not consulted at read time — data is static).
 */
export async function clearPokeApiCache(): Promise<void> {
  try {
    await (await resolveBackend()).clear(POKEAPI_CACHE_PREFIX);
  } catch {
    // Best-effort.
  }
  inflight.clear();
}

// ----------------------------------------------------------------------------
// Normalization + keying
// ----------------------------------------------------------------------------

/** 'Ice Beam' / 'ice-beam' / 'ICE BEAM' → 'ice-beam' (PokéAPI slug form). */
export function toPokeApiId(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/** Cache key shape: pokeapi-v2-{resource}-{id}. */
export function cacheKeyFor(resource: PokeApiResource, id: string): string {
  return `${POKEAPI_CACHE_PREFIX}-${resource}-${toPokeApiId(id)}`;
}

// ----------------------------------------------------------------------------
// HTTP: retries + backoff + in-flight dedupe + concurrency cap
// ----------------------------------------------------------------------------

interface FetchJsonOptions {
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
  retries?: number;
  baseBackoffMs?: number;
}

function notFoundError(url: string): Error {
  const error = new Error(`PokeAPI resource not found: ${url}`);
  error.name = 'PokeApiNotFoundError';
  return error;
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof Error && error.name === 'PokeApiNotFoundError';
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJson<T>(url: string, options: FetchJsonOptions = {}): Promise<T> {
  const { signal, fetchImpl = (...args: Parameters<typeof fetch>) => fetch(...args), retries = MAX_RETRIES, baseBackoffMs = 300 } = options;
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetchImpl(url, { signal });
      if (response.ok) return (await response.json()) as T;
      if (response.status === 404) throw notFoundError(url);
      const retryable = response.status === 429 || response.status >= 500;
      lastError = new Error(`PokeAPI request failed (${response.status}) for ${url}`);
      if (!retryable) throw lastError;
    } catch (error) {
      if (isNotFoundError(error) || isAbortError(error)) throw error;
      lastError = error;
    }
    if (attempt < retries) {
      await delay(baseBackoffMs * 2 ** attempt + Math.random() * baseBackoffMs);
    }
  }
  throw lastError ?? new Error(`PokeAPI request failed for ${url}`);
}

const inflight = new Map<string, Promise<unknown>>();

/** Read-through cache: memory → IndexedDB/localStorage → fetch → store. */
async function fetchCachedResource<T>(
  resource: PokeApiResource,
  id: string,
  options: HydrateOptions = {},
): Promise<T | null> {
  const key = cacheKeyFor(resource, id);
  const cached = await cacheGet<T>(key);
  if (cached !== undefined) return cached;

  let promise = inflight.get(key) as Promise<T | null> | undefined;
  if (!promise) {
    const url = `${POKEAPI_BASE_URL}/${resource}/${encodeURIComponent(id)}`;
    promise = (async () => {
      const value = await fetchJson<T>(url, options);
      await cacheSet(key, value);
      return value;
    })();
    inflight.set(key, promise);
    void promise.then(
      () => inflight.delete(key),
      () => inflight.delete(key),
    );
  }

  try {
    return await promise;
  } catch (error) {
    if (isAbortError(error)) throw error;
    return null;
  }
}

function createConcurrencyLimiter(limit: number): { run: <T>(task: () => Promise<T>) => Promise<T> } {
  let active = 0;
  const queue: Array<() => void> = [];
  return {
    async run<T>(task: () => Promise<T>): Promise<T> {
      if (active >= limit) {
        await new Promise<void>(resolve => queue.push(resolve));
      }
      active += 1;
      try {
        return await task();
      } finally {
        active -= 1;
        const next = queue.shift();
        if (next) next();
      }
    },
  };
}

// ----------------------------------------------------------------------------
// PokéAPI response shapes (subset we consume; English text only)
// ----------------------------------------------------------------------------

interface PokeApiNamedResource {
  name: string;
  url: string;
}

interface PokeApiEffectEntry {
  effect: string;
  short_effect: string;
  language: PokeApiNamedResource;
}

interface PokeApiFlavorTextEntry {
  flavor_text: string;
  language: PokeApiNamedResource;
}

interface PokeApiNameEntry {
  name: string;
  language: PokeApiNamedResource;
}

interface PokeApiMove {
  id: number;
  name: string;
  names: PokeApiNameEntry[];
  type: PokeApiNamedResource | null;
  damage_class: PokeApiNamedResource | null;
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
  target: PokeApiNamedResource | null;
  effect_entries: PokeApiEffectEntry[];
}

interface PokeApiItem {
  id: number;
  name: string;
  names: PokeApiNameEntry[];
  effect_entries: PokeApiEffectEntry[];
  flavor_text_entries: PokeApiFlavorTextEntry[];
  sprites: { default: string | null } | null;
}

interface PokeApiAbility {
  id: number;
  name: string;
  names: PokeApiNameEntry[];
  effect_entries: PokeApiEffectEntry[];
  flavor_text_entries: PokeApiFlavorTextEntry[];
}

interface PokeApiSpecies {
  id: number;
  name: string;
  names: PokeApiNameEntry[];
  genera: Array<{ genus: string; language: PokeApiNamedResource }>;
  flavor_text_entries: PokeApiFlavorTextEntry[];
}

// ----------------------------------------------------------------------------
// Mapping helpers (pure, testable)
// ----------------------------------------------------------------------------

function englishEffect(entries: PokeApiEffectEntry[] | undefined): PokeApiEffectEntry | undefined {
  return entries?.find(entry => entry.language.name === 'en');
}

function englishFlavorText(entries: PokeApiFlavorTextEntry[] | undefined): string | undefined {
  const entry = entries?.find(e => e.language.name === 'en');
  if (!entry) return undefined;
  return entry.flavor_text.replace(/[\n\f\r]/g, ' ').replace(/\s+/g, ' ').trim();
}

function englishName(entries: PokeApiNameEntry[] | undefined): string | undefined {
  return entries?.find(entry => entry.language.name === 'en')?.name;
}

function capitalize(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function humanizeSlug(value: string): string {
  return capitalize(value.replace(/[-_]/g, ' '));
}

const POKEAPI_TARGET_LABELS: Record<string, string> = {
  'selected-pokemon': 'Selected target',
  'all-other-pokemon': 'All other Pokémon',
  'all-opponents': 'All adjacent opponents',
  'entire-field': 'Entire field',
  'selected-pokemon-me-first': 'Selected target (Me First)',
  ally: 'One ally',
  'users-field': "The user's side of the field",
  'user-or-ally': 'The user or an ally',
  'opponents-field': "The opponent's side of the field",
  user: 'The user',
  'random-opponent': 'A random opponent',
  'all-allies': 'All allies',
  'fainting-pokemon': 'The fainted Pokémon',
  'all-pokemon': 'All Pokémon',
};

function pokeApiTargetLabel(raw: string | undefined): string {
  if (!raw) return '';
  return POKEAPI_TARGET_LABELS[raw] ?? humanizeSlug(raw);
}

const SHOWDOWN_TARGET_LABELS: Record<string, string> = {
  normal: 'Selected target',
  any: 'Any adjacent target',
  self: 'The user',
  allies: 'All allies',
  allAdjacentFoes: 'All adjacent opponents',
  adjacentFoe: 'One adjacent opponent',
  allAdjacent: 'All adjacent Pokémon',
  all: 'All other Pokémon',
  allySide: "The user's side of the field",
  foeSide: "The opponent's side of the field",
  allyTeam: "The user's team",
  adjacentAlly: 'One adjacent ally',
  adjacentAllyOrSelf: 'The user or one adjacent ally',
  randomNormal: 'A random target',
  scripted: 'Varies (scripted target)',
};

function showdownTargetLabel(raw: string | undefined): string {
  if (!raw) return '';
  return SHOWDOWN_TARGET_LABELS[raw] ?? raw;
}

function toMoveCategory(raw: string | undefined): MoveCategory {
  const value = raw?.toLowerCase() ?? '';
  if (value === 'physical') return 'Physical';
  if (value === 'special') return 'Special';
  if (value === 'status') return 'Status';
  return value ? capitalize(value) : 'Status';
}

function buildHydratedMove(id: string, name: string, local: MoveEntry | undefined, poke: PokeApiMove | null): HydratedMove {
  const effect = poke ? englishEffect(poke.effect_entries) : undefined;
  const localCategory = local ? (local.category as MoveCategory) : undefined;
  const type = local?.type ?? (poke?.type ? capitalize(poke.type.name) : '');
  const power = local ? (local.power > 0 ? local.power : null) : poke && poke.power !== null && poke.power > 0 ? poke.power : null;
  const accuracy = local ? (local.accuracy > 0 ? local.accuracy : null) : poke && poke.accuracy !== null && poke.accuracy > 0 ? poke.accuracy : null;
  return {
    id,
    name,
    type,
    category: localCategory ?? toMoveCategory(poke?.damage_class?.name),
    power,
    accuracy,
    pp: local?.pp ?? poke?.pp ?? 0,
    priority: local?.priority ?? poke?.priority ?? 0,
    target: local ? showdownTargetLabel(local.target) : pokeApiTargetLabel(poke?.target?.name),
    effectShort: effect?.short_effect ?? '',
    effectFull: effect?.effect ?? '',
    spriteUrl: '',
  };
}

// ----------------------------------------------------------------------------
// Public hydration API
// ----------------------------------------------------------------------------

/**
 * Hydrate a move by name or PokéAPI id. Local bundled data supplies the base
 * stats instantly; PokéAPI enriches effect text + readable target (cached).
 * Returns null only when neither source knows the move.
 */
export async function hydrateMove(nameOrId: string, options: HydrateOptions = {}): Promise<HydratedMove | null> {
  if (!nameOrId) return null;
  const id = toPokeApiId(nameOrId);
  if (!id) return null;
  const local = getMoveByName(nameOrId) ?? getMoveByName(id);
  const poke = await fetchCachedResource<PokeApiMove>('move', id, options);
  if (!local && !poke) return null;
  return buildHydratedMove(id, local?.name ?? englishName(poke?.names) ?? poke?.name ?? nameOrId, local, poke);
}

export async function hydrateItem(nameOrId: string, options: HydrateOptions = {}): Promise<HydratedItem | null> {
  if (!nameOrId) return null;
  const id = toPokeApiId(nameOrId);
  if (!id) return null;
  const local = getItemByName(nameOrId) ?? getItemByName(id);
  const poke = await fetchCachedResource<PokeApiItem>('item', id, options);
  if (!local && !poke) return null;
  const effect = poke ? englishEffect(poke.effect_entries) : undefined;
  const flavor = poke ? englishFlavorText(poke.flavor_text_entries) : undefined;
  return {
    id,
    name: local?.name ?? englishName(poke?.names) ?? poke?.name ?? nameOrId,
    description: effect?.effect ?? flavor ?? '',
    spriteUrl: local ? getItemSpriteUrl(local.name) : (poke?.sprites?.default ?? ''),
  };
}

export async function hydrateAbility(nameOrId: string, options: HydrateOptions = {}): Promise<HydratedAbility | null> {
  if (!nameOrId) return null;
  const id = toPokeApiId(nameOrId);
  if (!id) return null;
  const poke = await fetchCachedResource<PokeApiAbility>('ability', id, options);
  if (!poke) return null;
  const effect = englishEffect(poke.effect_entries);
  const flavor = englishFlavorText(poke.flavor_text_entries);
  return {
    id,
    name: englishName(poke.names) ?? poke.name,
    description: flavor ?? effect?.effect ?? '',
    effectShort: effect?.short_effect ?? flavor ?? '',
    effectFull: effect?.effect ?? flavor ?? '',
  };
}

export async function hydratePokemonSpecies(nameOrId: string, options: HydrateOptions = {}): Promise<PokemonSpeciesInfo | null> {
  if (!nameOrId) return null;
  const local = getPokemonByName(nameOrId) ?? getPokemonByName(toPokeApiId(nameOrId));
  const id = local ? String(local.id) : toPokeApiId(nameOrId);
  if (!id) return null;
  const poke = await fetchCachedResource<PokeApiSpecies>('pokemon-species', id, options);
  if (!local && !poke) return null;
  const genus = poke?.genera?.find(g => g.language.name === 'en')?.genus ?? '';
  const flavorText = poke ? (englishFlavorText(poke.flavor_text_entries) ?? '') : '';
  return {
    id: local?.id ?? poke?.id ?? 0,
    name: local?.name ?? englishName(poke?.names) ?? poke?.name ?? nameOrId,
    genus,
    flavorText,
    spriteUrl: local ? getSpriteUrl(local.name) : '',
    types: local?.types ?? [],
  };
}

// ----------------------------------------------------------------------------
// Batch helpers (dedupe + concurrency cap, cache-first)
// ----------------------------------------------------------------------------

async function runBatched<T>(
  names: readonly string[],
  hydrate: (nameOrId: string, options: HydrateOptions) => Promise<T | null>,
  options: HydrateOptions,
): Promise<Map<string, T | null>> {
  const limiter = createConcurrencyLimiter(MAX_CONCURRENCY);
  const uniqueIds = Array.from(new Set(names.map(toPokeApiId).filter(Boolean)));
  const results = await Promise.all(uniqueIds.map(id => limiter.run(() => hydrate(id, options))));
  const map = new Map<string, T | null>();
  uniqueIds.forEach((id, index) => map.set(id, results[index]));
  return map;
}

/** Hydrate many moves at once (deduped, concurrency-capped). Keys are PokéAPI ids. */
export async function hydrateMoves(names: readonly string[], options: HydrateOptions = {}): Promise<Map<string, HydratedMove | null>> {
  return runBatched(names, hydrateMove, options);
}

export async function hydrateItems(names: readonly string[], options: HydrateOptions = {}): Promise<Map<string, HydratedItem | null>> {
  return runBatched(names, hydrateItem, options);
}

export async function hydrateAbilities(names: readonly string[], options: HydrateOptions = {}): Promise<Map<string, HydratedAbility | null>> {
  return runBatched(names, hydrateAbility, options);
}

// ----------------------------------------------------------------------------
// Ranked-row hydration (usage row → hydrated Ranked* type)
// ----------------------------------------------------------------------------

export async function hydrateRankedMove(row: RankedEntryBase & { name: string }, options: HydrateOptions = {}): Promise<RankedMove> {
  const hydrated = await hydrateMove(row.name, options);
  return {
    rank: row.rank,
    name: row.name,
    usagePercent: row.usagePercent,
    type: hydrated?.type ?? null,
    category: hydrated?.category ?? null,
    power: hydrated?.power ?? null,
    accuracy: hydrated?.accuracy ?? null,
    pp: hydrated?.pp ?? null,
    priority: hydrated?.priority ?? null,
    target: hydrated?.target ?? null,
    effectShort: hydrated?.effectShort ?? null,
    effectFull: hydrated?.effectFull ?? null,
    spriteUrl: hydrated?.spriteUrl ?? null,
  };
}

export async function hydrateRankedItem(row: RankedEntryBase & { name: string }, options: HydrateOptions = {}): Promise<RankedItem> {
  const hydrated = await hydrateItem(row.name, options);
  return {
    rank: row.rank,
    name: row.name,
    usagePercent: row.usagePercent,
    description: hydrated?.description ?? null,
    spriteUrl: hydrated?.spriteUrl ?? null,
  };
}

export async function hydrateRankedAbility(row: RankedEntryBase & { name: string }, options: HydrateOptions = {}): Promise<RankedAbility> {
  const hydrated = await hydrateAbility(row.name, options);
  return {
    rank: row.rank,
    name: row.name,
    usagePercent: row.usagePercent,
    description: hydrated?.description ?? null,
    effectShort: hydrated?.effectShort ?? null,
    effectFull: hydrated?.effectFull ?? null,
  };
}
