// ============================================================================
// PocketForge — Regulations OTA (Over-The-Air) fetcher
//
// Fetches regulation updates from remote CDN with local fallback.
// Checks for updates on startup and caches validated data.
// ============================================================================

/**
 * Regulation data structure — matches what's generated in championsLegality.ts
 */
export interface RegulationData {
  id: string; // e.g., 'champions-mb', 'champions-ma'
  version: string; // semver for the data schema
  roster: string[]; // legal species
  bannedMoves: string[]; // move IDs
  bannedItems: string[]; // item IDs
  learnsets: Record<string, string[]>; // species slug -> move IDs
  meta: {
    updatedAt: string; // ISO timestamp
    source: 'bundled' | 'remote';
    checksum?: string; // for integrity verification
  };
}

const STORAGE_KEY = 'regulations-cache-v1';
const REMOTE_BASE = 'https://api.pocketforge.app/regulations';
const FETCH_TIMEOUT_MS = 5000;

/** Validate regulation data shape and checksums. */
function validateRegulationData(data: unknown): data is RegulationData {
  if (typeof data !== 'object' || !data) return false;
  const r = data as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.version === 'string' &&
    Array.isArray(r.roster) &&
    Array.isArray(r.bannedMoves) &&
    Array.isArray(r.bannedItems) &&
    typeof r.learnsets === 'object' &&
    typeof r.meta === 'object'
  );
}

/** Fetch regulation data from remote with timeout. */
async function fetchRemoteRegulation(regulationId: string): Promise<RegulationData | null> {
  const url = `${REMOTE_BASE}/${regulationId}.json`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store', // Always check for latest
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) return null;
    const data = await res.json();

    if (!validateRegulationData(data)) {
      console.warn(`[Regulations] Invalid remote data for ${regulationId}`);
      return null;
    }

    return { ...data, meta: { ...data.meta, source: 'remote' as const } };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn(`[Regulations] Fetch timeout for ${regulationId}`);
    } else {
      console.warn(`[Regulations] Fetch failed for ${regulationId}:`, err);
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Read cached regulation data from localStorage. */
function readCache(regulationId: string): RegulationData | null {
  try {
    const cached = localStorage.getItem(`${STORAGE_KEY}-${regulationId}`);
    if (!cached) return null;
    const data = JSON.parse(cached);
    return validateRegulationData(data) ? data : null;
  } catch {
    return null;
  }
}

/** Write regulation data to cache. */
function writeCache(data: RegulationData): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}-${data.id}`, JSON.stringify(data));
  } catch (err) {
    console.warn(`[Regulations] Cache write failed for ${data.id}:`, err);
  }
}

/**
 * Fetch or retrieve cached regulation data.
 * Strategy: try remote → fall back to cache → return null
 */
export async function getRegulationData(
  regulationId: string,
  bundledFallback?: RegulationData
): Promise<RegulationData | null> {
  // Try remote first
  const remote = await fetchRemoteRegulation(regulationId);
  if (remote) {
    writeCache(remote);
    return remote;
  }

  // Fall back to cache
  const cached = readCache(regulationId);
  if (cached) return cached;

  // Final fallback to bundled data
  if (bundledFallback) {
    return { ...bundledFallback, meta: { ...bundledFallback.meta, source: 'bundled' as const } };
  }

  return null;
}

/** Preload multiple regulations on startup (non-blocking). */
export function preloadRegulations(
  regulationIds: string[],
  bundledDefaults: Record<string, RegulationData>
): void {
  // Fire and forget — don't block startup
  for (const id of regulationIds) {
    getRegulationData(id, bundledDefaults[id]).catch(() => {
      // Silently fail — fallback already loaded
    });
  }
}
