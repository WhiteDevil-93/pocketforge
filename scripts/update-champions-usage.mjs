import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_BASE = (process.env.CHAMPIONS_BATTLE_DATA_API ?? 'https://championsbattledata.com/api').replace(/\/$/, '');
const DETAIL_LIMIT = Number.parseInt(process.env.CHAMPIONS_USAGE_DETAIL_LIMIT ?? '50', 10);
const MAX_SOURCE_AGE_DAYS = 14;
const FORMAT = 'Doubles';
const OUTPUT_DIR = join(__dirname, '..', 'src', 'data', 'generated');
const RANKINGS_OUTPUT = join(OUTPUT_DIR, 'championsUsageRankings.ts');
const DETAILS_OUTPUT = join(OUTPUT_DIR, 'championsUsageDetails.ts');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function toId(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 10) / 10 : null;
}

async function fetchJson(url, attempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);

    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 750));
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(`Failed to fetch ${url}: ${lastError instanceof Error ? lastError.message : lastError}`);
}

function getCurrentDoublesSummary(entry) {
  return entry?.summary?.battleSummary?.Current?.[FORMAT];
}

function validateIndex(index) {
  assert(index && typeof index === 'object', 'Champions index is not an object');
  assert(Array.isArray(index.pokemon), 'Champions index is missing pokemon[]');
  assert(index.pokemon.length >= 100, `Champions index is unexpectedly small (${index.pokemon.length})`);

  const generatedAt = new Date(index.generatedAt);
  assert(!Number.isNaN(generatedAt.getTime()), 'Champions index has an invalid generatedAt timestamp');

  const ageMs = Date.now() - generatedAt.getTime();
  assert(ageMs <= MAX_SOURCE_AGE_DAYS * 86_400_000, `Champions data is more than ${MAX_SOURCE_AGE_DAYS} days old`);
}

function buildRankings(index) {
  const rankings = index.pokemon
    .map((entry) => {
      const summary = getCurrentDoublesSummary(entry);
      return {
        species: entry.showdownName || entry.name,
        showdownId: entry.showdownId || toId(entry.showdownName || entry.name),
        rank: summary?.position,
      };
    })
    .filter((entry) => entry.species && entry.showdownId && Number.isInteger(entry.rank) && entry.rank > 0)
    .sort((a, b) => a.rank - b.rank);

  assert(rankings.length >= 100, `Only ${rankings.length} ranked Doubles Pokémon were found`);
  assert(rankings[0]?.rank === 1, 'Doubles rankings do not start at rank 1');
  assert(new Set(rankings.map((entry) => entry.rank)).size === rankings.length, 'Doubles rankings contain duplicate ranks');
  assert(new Set(rankings.map((entry) => entry.showdownId)).size === rankings.length, 'Doubles rankings contain duplicate Showdown IDs');

  return rankings;
}

function rowsForCategory(rows, category, limit = 10) {
  return rows
    .filter((row) => row.category === category && row.name)
    .sort((a, b) => Number(a.rank) - Number(b.rank))
    .slice(0, limit);
}

function toUsageRows(rows, category, limit = 10) {
  return rowsForCategory(rows, category, limit)
    .map((row) => ({
      name: row.name,
      usage: formatNumber(row.percentage_value),
    }))
    .filter((row) => row.usage !== null && row.usage >= 0 && row.usage <= 100);
}

function toTeammateRows(rows) {
  return rowsForCategory(rows, 'teammate').map((row) => ({
    species: row.name,
    rank: Number(row.rank),
  }));
}

function toSpreadRows(rows) {
  return rows
    .filter((row) => row.category === 'stat_points')
    .sort((a, b) => Number(a.rank) - Number(b.rank))
    .slice(0, 8)
    .map((row) => ({
      rank: Number(row.rank),
      usage: formatNumber(row.percentage_value),
      points: {
        hp: Number(row.hp_points) || 0,
        atk: Number(row.attack_points) || 0,
        def: Number(row.defense_points) || 0,
        spa: Number(row.sp_atk_points) || 0,
        spd: Number(row.sp_def_points) || 0,
        spe: Number(row.speed_points) || 0,
      },
    }))
    .filter((row) => row.usage !== null && row.usage >= 0 && row.usage <= 100);
}

function validateBattleResponse(data, expectedId) {
  assert(data && typeof data === 'object', `${expectedId}: battle response is not an object`);
  assert(toId(data.showdownId) === toId(expectedId), `${expectedId}: battle response ID mismatch`);
  assert(data.format === FORMAT, `${expectedId}: expected ${FORMAT}, received ${data.format}`);
  assert(Array.isArray(data.rows), `${expectedId}: battle response is missing rows[]`);
  assert(data.rows.some((row) => row.category === 'move'), `${expectedId}: no move rows found`);
}

function normalizeDetails(data, ranking) {
  return {
    species: ranking.species,
    showdownId: ranking.showdownId,
    rank: ranking.rank,
    moves: toUsageRows(data.rows, 'move'),
    items: toUsageRows(data.rows, 'held_item'),
    abilities: toUsageRows(data.rows, 'ability'),
    natures: toUsageRows(data.rows, 'stat_alignment'),
    teammates: toTeammateRows(data.rows),
    spreads: toSpreadRows(data.rows),
  };
}

async function mapWithConcurrency(values, concurrency, mapper) {
  const results = new Array(values.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(values[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, () => worker()));
  return results;
}

function serializeModule(header, exportName, value) {
  return `${header}
export const ${exportName} = ${JSON.stringify(value, null, 2)} as const;
`;
}

async function update() {
  assert(Number.isInteger(DETAIL_LIMIT) && DETAIL_LIMIT >= 1 && DETAIL_LIMIT <= 235, 'CHAMPIONS_USAGE_DETAIL_LIMIT must be between 1 and 235');

  console.log(`Fetching Champions ranked data from ${API_BASE}...`);
  const index = await fetchJson(API_BASE);
  validateIndex(index);

  const rankings = buildRankings(index);
  const detailRankings = rankings.slice(0, DETAIL_LIMIT);
  const details = await mapWithConcurrency(detailRankings, 6, async (ranking) => {
    const data = await fetchJson(`${API_BASE}/battle/${FORMAT}/${ranking.showdownId}`);
    validateBattleResponse(data, ranking.showdownId);
    return normalizeDetails(data, ranking);
  });

  const metadata = {
    schemaVersion: 1,
    sourceName: 'Pokémon Champions Battle Data',
    sourceUrl: 'https://championsbattledata.com/api_guide',
    apiUrl: API_BASE,
    sourceUpdatedAt: index.generatedAt,
    dataVersion: String(index.dataVersion ?? ''),
    season: String(index.defaultSeason ?? 'Current'),
    format: FORMAT,
    rankedPokemonCount: rankings.length,
    detailedPokemonCount: details.length,
  };

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(
    RANKINGS_OUTPUT,
    serializeModule(
      '// Auto-generated by scripts/update-champions-usage.mjs — do not edit manually.',
      'CHAMPIONS_USAGE_RANKINGS_SNAPSHOT',
      { metadata, rankings },
    ),
  );
  writeFileSync(
    DETAILS_OUTPUT,
    serializeModule(
      '// Auto-generated by scripts/update-champions-usage.mjs — do not edit manually.',
      'CHAMPIONS_USAGE_DETAILS_SNAPSHOT',
      { metadata, pokemon: Object.fromEntries(details.map((entry) => [entry.showdownId, entry])) },
    ),
  );

  console.log(`Generated ${rankings.length} rankings and ${details.length} detailed records.`);
}

try {
  await update();
} catch (error) {
  const hasLastKnownGood = existsSync(RANKINGS_OUTPUT) && existsSync(DETAILS_OUTPUT);
  console.error(`Champions usage update failed: ${error instanceof Error ? error.message : error}`);

  if (!hasLastKnownGood || process.env.CHAMPIONS_USAGE_STRICT === 'true') {
    process.exitCode = 1;
  } else {
    console.warn('Retaining the last-known-good Champions usage snapshot.');
  }
}
