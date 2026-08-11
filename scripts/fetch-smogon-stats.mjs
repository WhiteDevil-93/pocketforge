// ============================================================================
// PocketForge — Smogon monthly-stats ETL
//
// Downloads Smogon monthly usage/chaos dumps (https://www.smogon.com/stats/),
// parses them into structured JSON and writes a committed TypeScript snapshot
// at src/data/generated/smogonStats.ts (exported as SMOGON_STATS_SNAPSHOT).
//
// Mirrors the validation + last-known-good retention pattern of
// scripts/update-champions-usage.mjs:
//   - sanity-asserts every parsed artifact (expected sections present,
//     plausible entry counts, timestamp freshness, aggregate/chaos agreement)
//   - on failure, retains the last-known-good snapshot and warns
//     (exits non-zero only with SMOGON_STRICT=true or when no LKG exists)
//
// Usage:
//   node scripts/fetch-smogon-stats.mjs                # newest complete month
//   node scripts/fetch-smogon-stats.mjs --selftest     # fixture parser tests
//
// Env:
//   SMOGON_MONTH               YYYY-MM month to snapshot (default: newest)
//   SMOGON_FORMATS             comma-separated format ids
//                              (default: gen9championsvgc2026regmb,gen9ou)
//   SMOGON_CUTOFF              preferred rating cutoff (default: 1630)
//   SMOGON_MAX_MONTH_AGE_DAYS  freshness limit for auto-discovered months
//                              (default 45)
//   SMOGON_STRICT              'true' => fail instead of retaining LKG
// ============================================================================

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const STATS_BASE = 'https://www.smogon.com/stats';
const OUTPUT_PATH = join(REPO_ROOT, 'src', 'data', 'generated', 'smogonStats.ts');
const FIXTURES_DIR = join(__dirname, 'fixtures');

const DEFAULT_FORMATS = ['gen9championsvgc2026regmb', 'gen9ou'];
const DEFAULT_CUTOFF_PREFS = [1630, 1500, 1760, 1825, 1695, 0];
const DEFAULT_MAX_MONTH_AGE_DAYS = 45;

// Per-section row caps kept in the committed snapshot (source data is always
// validated in full before trimming).
const ROW_LIMITS = { moves: 12, items: 8, abilities: 6, spreads: 6, teammates: 8, checks: 8 };

const SECTION_NAMES = ['Moves', 'Items', 'Abilities', 'Spreads', 'Teammates', 'Checks and Counters'];
const SECTION_KEY_ALIASES = {
  'checksandcounters': 'Checks and Counters',
  'checks&counters': 'Checks and Counters',
  'checksandcounter': 'Checks and Counters',
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function env(name, fallback) {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

function config() {
  const month = env('SMOGON_MONTH', null);
  if (month !== null) assert(/^\d{4}-\d{2}$/.test(month), `SMOGON_MONTH must be YYYY-MM, got "${month}"`);
  const formats = env('SMOGON_FORMATS', DEFAULT_FORMATS.join(','))
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0);
  const cutoffPref = Number.parseInt(env('SMOGON_CUTOFF', '1630'), 10);
  assert(Number.isInteger(cutoffPref) && cutoffPref >= 0, 'SMOGON_CUTOFF must be a non-negative integer');
  const maxMonthAgeDays = Number.parseInt(env('SMOGON_MAX_MONTH_AGE_DAYS', String(DEFAULT_MAX_MONTH_AGE_DAYS)), 10);
  assert(Number.isInteger(maxMonthAgeDays) && maxMonthAgeDays > 0, 'SMOGON_MAX_MONTH_AGE_DAYS must be a positive integer');
  return { month, formats, cutoffPref, maxMonthAgeDays, strict: env('SMOGON_STRICT', 'false') === 'true' };
}

// ----------------------------------------------------------------------------
// Fetch plumbing (retries + timeout, mirroring update-champions-usage.mjs)
// ----------------------------------------------------------------------------

async function fetchText(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return await response.text();
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

async function tryFetchText(url) {
  try {
    return await fetchText(url, 1);
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------------------
// Month discovery
// ----------------------------------------------------------------------------

function parseIndexMonths(html) {
  const months = [];
  const pattern = /<a href="(\d{4}-\d{2})\/">/g;
  let match;
  while ((match = pattern.exec(html)) !== null) months.push(match[1]);
  return months;
}

function parseListingFileTimes(html) {
  const times = {};
  const pattern = /<a href="([a-z0-9-]+\.txt)">.*?([0-3]\d-[A-Za-z]{3}-\d{4} \d{2}:\d{2})/g;
  let match;
  while ((match = pattern.exec(html)) !== null) times[match[1]] = match[2];
  return times;
}

function parseApacheDate(raw) {
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function addMonths(month, delta) {
  const [year, monthIndex] = month.split('-').map(Number);
  const total = year * 12 + (monthIndex - 1) + delta;
  const newYear = Math.floor(total / 12);
  const newMonth = (total % 12) + 1;
  return `${newYear}-${String(newMonth).padStart(2, '0')}`;
}

function monthStartIso(month) {
  return `${month}-01T00:00:00.000Z`;
}

async function resolveMonth(cfg) {
  if (cfg.month) return cfg.month;
  const html = await fetchText(`${STATS_BASE}/`);
  const months = parseIndexMonths(html);
  assert(months.length > 0, 'Could not find any monthly folders on smogon.com/stats');
  return months[months.length - 1];
}

async function fetchMonthListing(month) {
  const html = await fetchText(`${STATS_BASE}/${month}/`);
  return { html, fileTimes: parseListingFileTimes(html) };
}

function availableCutoffs(listingHtml, format) {
  const pattern = new RegExp(`href="${format}-(\\d+)\\.txt"`, 'g');
  const cutoffs = new Set();
  let match;
  while ((match = pattern.exec(listingHtml)) !== null) cutoffs.add(Number.parseInt(match[1], 10));
  return [...cutoffs];
}

function resolveCutoff(cfg, listingHtml, format) {
  const available = availableCutoffs(listingHtml, format);
  assert(available.length > 0, `No usage dumps found for format "${format}" in the month listing`);
  const prefs = [cfg.cutoffPref, ...DEFAULT_CUTOFF_PREFS.filter((entry) => entry !== cfg.cutoffPref)];
  const chosen = prefs.find((entry) => available.includes(entry)) ?? null;
  assert(chosen !== null, `None of the preferred cutoffs [${prefs.join(', ')}] exist for "${format}" (have ${available.join(', ')})`);
  return chosen;
}

// ----------------------------------------------------------------------------
// Pipe-table parsing (aggregated usage dumps)
// ----------------------------------------------------------------------------

function splitPipeCells(line) {
  if (line.indexOf('|') === -1) return null;
  return line
    .split('|')
    .map((cell) => cell.trim())
    .filter((cell) => cell.length > 0);
}

function compact(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function parsePercent(value) {
  const cleaned = String(value ?? '').replace(/%/g, '').replace(/,/g, '').trim();
  const number = Number.parseFloat(cleaned);
  return Number.isFinite(number) ? number : null;
}

function parseInteger(value) {
  const cleaned = String(value ?? '').replace(/,/g, '').trim();
  const number = Number.parseInt(cleaned, 10);
  return Number.isFinite(number) ? number : null;
}

function isSeparatorLine(line) {
  const trimmed = line.trim();
  return trimmed.startsWith('+') || (trimmed.length > 0 && /^[-= ]+$/.test(trimmed));
}

/**
 * Parse an aggregated usage dump ('| Rank | Pokemon | Usage % | Raw |' pipe
 * table). Returns { battles, rows: [{ rank, name, usagePercent, rawCount }] }.
 */
export function parseUsageTable(text, options = {}) {
  const minRows = options.minRows ?? 20;
  const lines = String(text ?? '').split(/\r?\n/);
  const battlesMatch = lines[0]?.match(/Total battles:\s*(\d+)/);
  const battles = battlesMatch ? Number.parseInt(battlesMatch[1], 10) : null;

  let headerIndex = -1;
  let headers = [];
  for (let i = 0; i < lines.length; i += 1) {
    const cells = splitPipeCells(lines[i]);
    if (!cells) continue;
    const keys = cells.map((cell) => compact(cell));
    if (keys.includes('rank') && keys.some((key) => key.startsWith('pokemon')) && keys.some((key) => key.startsWith('usage'))) {
      headerIndex = i;
      headers = cells.map((cell) => compact(cell));
      break;
    }
  }
  assert(headerIndex !== -1, 'Usage dump has no recognizable "| Rank | Pokemon | Usage % |" header row');

  const rankIdx = headers.findIndex((key) => key === 'rank');
  const pokemonIdx = headers.findIndex((key) => key.startsWith('pokemon'));
  const usageIdx = headers.findIndex((key) => key.startsWith('usage'));
  const rawIdx = headers.findIndex((key) => key === 'raw');
  assert(rankIdx !== -1 && pokemonIdx !== -1 && usageIdx !== -1, 'Usage dump header is missing Rank/Pokemon/Usage % columns');

  const rows = [];
  for (let i = headerIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (isSeparatorLine(line) || line.trim().length === 0) continue;
    const cells = splitPipeCells(line);
    if (!cells) continue;
    const rank = parseInteger(cells[rankIdx]);
    if (rank === null) continue;
    const name = cells[pokemonIdx] ?? '';
    if (!name) continue;
    const usagePercent = parsePercent(cells[usageIdx]);
    const rawCount = rawIdx !== -1 ? parseInteger(cells[rawIdx]) : null;
    assert(usagePercent !== null, `Row ${i}: unparsable usage % for ${name}`);
    rows.push({ rank, name, usagePercent, rawCount: rawCount ?? 0 });
  }

  assert(rows.length >= minRows, `Usage dump yielded only ${rows.length} rows (expected at least ${minRows})`);
  assert(rows[0].rank === 1, 'Usage dump does not start at rank 1');
  for (let i = 1; i < rows.length; i += 1) {
    assert(rows[i].rank === rows[i - 1].rank + 1, `Usage dump ranks are not sequential at row ${i}`);
  }
  return { battles, rows };
}

// ----------------------------------------------------------------------------
// Display-name resolution from the repo's own generated data files
// ----------------------------------------------------------------------------

function extractTsArray(text, exportName) {
  const pattern = new RegExp(`export const ${exportName}:.*?=\\s*(\\[)`);
  const match = pattern.exec(text);
  if (!match) throw new Error(`Could not locate "export const ${exportName}: ... = [" in generated data file`);
  let index = match.index + match[0].length - 1;
  let depth = 0;
  let inString = false;
  for (; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (char === '\\') index += 1;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === '[') depth += 1;
    else if (char === ']') {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  return JSON.parse(text.slice(match.index + match[0].length - 1, index + 1));
}

function buildNameIndex(entries, keyOf) {
  const index = new Map();
  for (const entry of entries) {
    const key = compact(keyOf(entry));
    if (key && !index.has(key)) index.set(key, entry.name);
  }
  return index;
}

function loadNameIndexes() {
  const indexes = { moveIndex: new Map(), itemIndex: new Map(), speciesIndex: new Map(), abilityIndex: new Map() };
  try {
    const pokedex = extractTsArray(readFileSync(join(REPO_ROOT, 'src', 'data', 'pokemonData.ts'), 'utf8'), 'POKEDEX');
    indexes.speciesIndex = buildNameIndex(pokedex, (entry) => entry.sprite);
    for (const entry of pokedex) {
      for (const ability of [...(entry.abilities ?? []), entry.hiddenAbility ?? '']) {
        const key = compact(ability);
        if (key && !indexes.abilityIndex.has(key)) indexes.abilityIndex.set(key, ability);
      }
    }
  } catch {
    // Local dex unavailable — species/ability names fall back to dump text.
  }
  try {
    indexes.moveIndex = buildNameIndex(
      extractTsArray(readFileSync(join(REPO_ROOT, 'src', 'data', 'movesData.ts'), 'utf8'), 'MOVES'),
      (entry) => entry.id,
    );
  } catch {
    // Local moves unavailable — move names fall back to title-cased slugs.
  }
  try {
    indexes.itemIndex = buildNameIndex(
      extractTsArray(readFileSync(join(REPO_ROOT, 'src', 'data', 'itemsData.ts'), 'utf8'), 'ITEMS'),
      (entry) => entry.id,
    );
  } catch {
    // Local items unavailable — item names fall back to title-cased slugs.
  }
  return indexes;
}

function titleCase(slug) {
  return String(slug ?? '')
    .split('-')
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ');
}

function displayName(slug, indexes, kind) {
  const key = compact(slug);
  if (kind === 'move' && indexes.moveIndex.has(key)) return indexes.moveIndex.get(key);
  if (kind === 'item' && indexes.itemIndex.has(key)) return indexes.itemIndex.get(key);
  if (kind === 'species' && indexes.speciesIndex.has(key)) return indexes.speciesIndex.get(key);
  if (kind === 'ability' && indexes.abilityIndex.has(key)) return indexes.abilityIndex.get(key);
  return titleCase(slug);
}

// ----------------------------------------------------------------------------
// Chaos dump parsing (per-Pokémon: Moves/Items/Abilities/Spreads/Teammates/
// Checks and Counters)
// ----------------------------------------------------------------------------

function rankWeightedRows(map, count, limit, indexes, kind) {
  return Object.entries(map ?? {})
    .map(([slug, weight]) => ({
      slug,
      weight: Number(weight) || 0,
      usagePercent: count > 0 ? ((Number(weight) || 0) / count) * 100 : 0,
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit)
    .map((row, index) => ({
      rank: index + 1,
      name: displayName(row.slug, indexes, kind),
      usagePercent: row.usagePercent,
    }));
}

function parseSpreadKey(key) {
  const colon = String(key).indexOf(':');
  if (colon === -1) return null;
  const nature = String(key).slice(0, colon).trim();
  const parts = String(key).slice(colon + 1).split('/').map((entry) => Number.parseInt(entry.trim(), 10) || 0);
  const [hp = 0, atk = 0, def = 0, spa = 0, spd = 0, spe = 0] = parts;
  const evs = { hp, atk, def, spa, spd, spe };
  const labels = [
    [hp, 'HP'],
    [atk, 'Atk'],
    [def, 'Def'],
    [spa, 'SpA'],
    [spd, 'SpD'],
    [spe, 'Spe'],
  ];
  const evsText = labels.filter(([value]) => value > 0).map(([value, label]) => `${value} ${label}`).join(' / ') || 'No EVs';
  return { nature, evs, evsText };
}

function rankSpreadRows(map, count, limit) {
  return Object.entries(map ?? {})
    .map(([key, weight]) => ({
      key,
      weight: Number(weight) || 0,
      usagePercent: count > 0 ? ((Number(weight) || 0) / count) * 100 : 0,
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit)
    .map((row, index) => {
      const parsed = parseSpreadKey(row.key);
      return {
        rank: index + 1,
        nature: parsed?.nature ?? row.key,
        evs: parsed?.evs ?? {},
        evsText: parsed?.evsText ?? '',
        usagePercent: row.usagePercent,
      };
    });
}

function rankCheckRows(map, limit) {
  return Object.entries(map ?? {})
    .map(([opponent, stats]) => {
      const p = Number(stats?.p) || 0;
      return { opponent, p, winRate: p * 100 };
    })
    .sort((a, b) => b.p - a.p)
    .slice(0, limit)
    .map((row, index) => ({
      rank: index + 1,
      opponent: row.opponent,
      usagePercent: row.winRate,
      winRate: row.winRate,
      lossRate: null,
      koChance: null,
      koChanceText: null,
      switchInChance: null,
    }));
}

/**
 * Parse a modern chaos JSON dump:
 * { info: { metagame, cutoff, ... }, data: { '<Species>': { 'Raw count', usage,
 *   Moves, Items, Abilities, Spreads, Teammates, 'Checks and Counters' } } }.
 * Section weights are per-appearance counts; a row's usage % is weight/rawCount.
 * Checks & Counters entries are { n, p, d } where p is the probability the
 * subject is KOed or switched out vs the opponent (the opponent's matchup win
 * rate); no move-granularity win/loss data exists in the dump.
 */
export function parseChaosJson(json, indexes) {
  const data = json?.data ?? {};
  const out = {};
  for (const [species, section] of Object.entries(data)) {
    const rawCount = Number(section?.['Raw count']) || 0;
    out[species] = {
      usagePercent: (Number(section?.usage) || 0) * 100,
      moves: rankWeightedRows(section?.Moves, rawCount, ROW_LIMITS.moves, indexes, 'move'),
      items: rankWeightedRows(section?.Items, rawCount, ROW_LIMITS.items, indexes, 'item'),
      abilities: rankWeightedRows(section?.Abilities, rawCount, ROW_LIMITS.abilities, indexes, 'ability'),
      spreads: rankSpreadRows(section?.Spreads, rawCount, ROW_LIMITS.spreads),
      teammates: rankWeightedRows(section?.Teammates, rawCount, ROW_LIMITS.teammates, indexes, 'species'),
      checksAndCounters: rankCheckRows(section?.['Checks and Counters'], ROW_LIMITS.checks),
    };
  }
  return out;
}

/**
 * Parse a legacy pipe-table per-Pokémon chaos dump (pre-JSON monthly format).
 * Sections are delimited by '+---+' / '----' separators with a bare section
 * title line. Rows are '| Name | 33.079% |' (or 'Name 33.079%'), spreads are
 * 'Nature:ev/ev/...', and Checks & Counters rows may carry a follow-up line
 * '(XX% KOed / YY% switched out)'.
 */
export function parseChaosText(text, indexes) {
  const lines = String(text ?? '').split(/\r?\n/);
  const out = {
    usagePercent: null,
    rawCount: null,
    moves: [],
    items: [],
    abilities: [],
    spreads: [],
    teammates: [],
    checksAndCounters: [],
  };
  let section = null;
  let pendingCheck = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (isSeparatorLine(line)) continue;

    const cells = splitPipeCells(line);
    const first = cells ? cells[0] : line;
    const compactFirst = compact(first);

    const alias = SECTION_KEY_ALIASES[compactFirst];
    if (alias || SECTION_NAMES.some((name) => compact(name) === compactFirst)) {
      section = alias ?? SECTION_NAMES.find((name) => compact(name) === compactFirst);
      pendingCheck = null;
      continue;
    }

    if (compactFirst.startsWith('rawcount')) {
      out.rawCount = parseInteger(cells?.[1] ?? line.replace(/^[^:]*:/, ''));
      continue;
    }
    if (compactFirst.startsWith('viability') || compactFirst.startsWith('totalbattles') || compactFirst.startsWith('avgweight')) {
      continue;
    }

    if (!section) continue;

    if (section === 'Checks and Counters') {
      const numbers = (cells ?? [line]).slice(1).map((cell) => parsePercent(cell)).filter((value) => value !== null);
      if (numbers.length > 0) {
        pendingCheck = {
          opponent: first,
          usagePercent: numbers[0],
          winRate: numbers[0],
          lossRate: null,
          koChance: null,
          koChanceText: null,
          switchInChance: null,
        };
        out.checksAndCounters.push(pendingCheck);
      } else if (pendingCheck) {
        const koMatch = line.match(/([\d.]+)%\s*KOed/);
        const switchMatch = line.match(/([\d.]+)%\s*switched\s*out/);
        if (koMatch) pendingCheck.koChance = Number.parseFloat(koMatch[1]);
        if (switchMatch) pendingCheck.switchInChance = Number.parseFloat(switchMatch[1]);
        if (koMatch) pendingCheck.koChanceText = `${koMatch[1]}% KOed`;
        pendingCheck = null;
      }
      continue;
    }

    if (section === 'Spreads') {
      const name = cells ? cells[0] : line.split(/\s{2,}/)[0];
      const percent = parsePercent(cells?.[1] ?? line.match(/([\d.]+)%/)?.[1]);
      const parsed = parseSpreadKey(name);
      out.spreads.push({
        rank: out.spreads.length + 1,
        nature: parsed?.nature ?? name,
        evs: parsed?.evs ?? {},
        evsText: parsed?.evsText ?? '',
        usagePercent: percent ?? 0,
      });
      continue;
    }

    const name = cells ? cells[0] : line.split(/\s{2,}/)[0];
    const percent = parsePercent(cells?.[1] ?? line.match(/([\d.]+)%/)?.[1]);
    if (!name || percent === null) continue;
    const kind = section === 'Moves' ? 'move' : section === 'Items' ? 'item' : section === 'Abilities' ? 'ability' : 'species';
    const target = section === 'Moves' ? out.moves : section === 'Items' ? out.items : section === 'Abilities' ? out.abilities : out.teammates;
    target.push({ rank: target.length + 1, name: displayName(name, indexes, kind), usagePercent: percent });
  }

  out.moves = out.moves.slice(0, ROW_LIMITS.moves);
  out.items = out.items.slice(0, ROW_LIMITS.items);
  out.abilities = out.abilities.slice(0, ROW_LIMITS.abilities);
  out.spreads = out.spreads.slice(0, ROW_LIMITS.spreads);
  out.teammates = out.teammates.slice(0, ROW_LIMITS.teammates);
  out.checksAndCounters = out.checksAndCounters.slice(0, ROW_LIMITS.checks);
  return out;
}

// ----------------------------------------------------------------------------
// Snapshot assembly + validation
// ----------------------------------------------------------------------------

function rankChangeFor(prevRanks, name, rank) {
  if (!prevRanks) return null;
  const prevRank = prevRanks.get(name);
  if (prevRank === undefined || prevRank === null) return null;
  return prevRank - rank;
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

/**
 * Fetch the per-Pokémon chaos dump for one format+cutoff. Prefers the modern
 * single-file JSON ('chaos/{format}-{cutoff}.json'); falls back to the legacy
 * per-Pokémon text layout ('chaos/{format}/{species}.txt'), parsed with
 * parseChaosText, for the species present in the aggregated usage table.
 */
async function fetchChaos(month, format, cutoff, indexes, usageRows) {
  const jsonText = await tryFetchText(`${STATS_BASE}/${month}/chaos/${format}-${cutoff}.json`);
  if (jsonText !== null && jsonText.trim().startsWith('{')) {
    let parsed = null;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      parsed = null;
    }
    if (parsed?.data) return parseChaosJson(parsed, indexes);
  }

  const singleText = await tryFetchText(`${STATS_BASE}/${month}/chaos/${format}-${cutoff}.txt`);
  if (singleText !== null) {
    const species = usageRows[0]?.name;
    assert(species, `No species to attribute the legacy chaos dump ${format}-${cutoff}.txt to`);
    return { [species]: parseChaosText(singleText, indexes) };
  }

  const legacyBase = `${STATS_BASE}/${month}/chaos/${format}`;
  const probe = await tryFetchText(`${legacyBase}/`);
  assert(probe !== null, `No chaos dump available for ${format} @ ${cutoff} (JSON, single-file TXT, or legacy folder)`);
  const parsed = await mapWithConcurrency(usageRows, 8, async (row) => {
    const text = await tryFetchText(`${legacyBase}/${compact(row.name)}.txt`);
    return { name: row.name, entry: text !== null ? parseChaosText(text, indexes) : null };
  });
  const out = {};
  for (const { name, entry } of parsed) {
    if (entry !== null) out[name] = entry;
  }
  assert(Object.keys(out).length >= 20, `Legacy chaos folder yielded only ${Object.keys(out).length} species`);
  return out;
}

function buildPokemonMap(usageRows, chaos, prevRanks) {
  const pokemon = {};
  for (const row of usageRows) {
    const chaosEntry = chaos?.[row.name] ?? null;
    pokemon[row.name] = {
      rank: row.rank,
      rankChange: rankChangeFor(prevRanks, row.name, row.rank),
      usagePercent: row.usagePercent,
      rawCount: row.rawCount,
      moves: chaosEntry?.moves ?? [],
      items: chaosEntry?.items ?? [],
      abilities: chaosEntry?.abilities ?? [],
      spreads: chaosEntry?.spreads ?? [],
      teammates: chaosEntry?.teammates ?? [],
      checksAndCounters: chaosEntry?.checksAndCounters ?? [],
    };
  }
  return pokemon;
}

function validateFormat(format, cutoff, usage, chaos, pokemonMap) {
  assert(usage.battles !== null && usage.battles > 0, `${format} @ ${cutoff}: missing or zero battle count`);
  assert(usage.rows.length >= 20, `${format} @ ${cutoff}: only ${usage.rows.length} usage rows`);
  assert(Object.keys(chaos ?? {}).length >= 20, `${format} @ ${cutoff}: only ${Object.keys(chaos ?? {}).length} chaos species`);

  for (const row of usage.rows) {
    assert(row.usagePercent >= 0 && row.usagePercent <= 100, `${format}: ${row.name} usage % out of range (${row.usagePercent})`);
    assert(Number.isInteger(row.rawCount) && row.rawCount > 0, `${format}: ${row.name} has invalid raw count (${row.rawCount})`);
  }

  const topSpecies = usage.rows.slice(0, 3).map((row) => row.name);
  for (const species of topSpecies) {
    const entry = chaos?.[species];
    assert(entry, `${format}: expected chaos section missing for top species ${species}`);
    assert(Array.isArray(entry.moves) && entry.moves.length > 0, `${format}: ${species} has no Moves section`);
    assert(Array.isArray(entry.items) && entry.items.length > 0, `${format}: ${species} has no Items section`);
    assert(Array.isArray(entry.abilities) && entry.abilities.length > 0, `${format}: ${species} has no Abilities section`);
  }

  for (const species of topSpecies.slice(0, 5)) {
    const chaosUsage = chaos?.[species]?.usagePercent ?? null;
    const tableUsage = pokemonMap[species]?.usagePercent ?? null;
    if (chaosUsage !== null && tableUsage !== null) {
      assert(
        Math.abs(chaosUsage - tableUsage) <= 0.5,
        `${format}: chaos usage (${chaosUsage.toFixed(3)}%) disagrees with usage table (${tableUsage.toFixed(3)}%) for ${species}`,
      );
    }
  }
}

function validateFreshness(cfg, month) {
  if (cfg.month) return;
  const ageMs = Date.now() - Date.parse(monthStartIso(month));
  const maxMs = cfg.maxMonthAgeDays * 86_400_000;
  assert(ageMs <= maxMs, `Month ${month} is more than ${cfg.maxMonthAgeDays} days old — refusing to write a stale snapshot`);
}

function serializeSnapshot(snapshot) {
  const header = [
    '// Auto-generated by scripts/fetch-smogon-stats.mjs — do not edit manually.',
    `// Source: ${snapshot.metadata.sourceUrl} (${snapshot.metadata.month}) — Smogon monthly usage/chaos stats.`,
  ].join('\n');
  return `${header}
export const SMOGON_STATS_SNAPSHOT = ${JSON.stringify(snapshot, null, 2)};
`;
}

// ----------------------------------------------------------------------------
// Self-test (fixture-based parser coverage)
// ----------------------------------------------------------------------------

export function runSelfTest(indexes) {
  const readFixture = (name) => readFileSync(join(FIXTURES_DIR, name), 'utf8');

  const usage = parseUsageTable(readFixture('usage-table-sample.txt'), { minRows: 5 });
  assert(usage.battles === 654262, `selftest: expected 654262 battles, got ${usage.battles}`);
  assert(usage.rows.length === 5, `selftest: expected 5 usage rows, got ${usage.rows.length}`);
  assert(usage.rows[0].rank === 1 && usage.rows[0].name === 'Great Tusk', 'selftest: first usage row mismatch');
  assert(Math.abs(usage.rows[0].usagePercent - 28.1829) < 0.0001, `selftest: usage % mismatch (${usage.rows[0].usagePercent})`);
  assert(usage.rows[0].rawCount === 368780, `selftest: raw count mismatch (${usage.rows[0].rawCount})`);
  assert(usage.rows[4].name === 'Corviknight', 'selftest: fifth usage row mismatch');

  const json = parseChaosJson(JSON.parse(readFixture('chaos-sample.json')), indexes);
  const kingambit = json['Kingambit'];
  assert(kingambit, 'selftest: JSON chaos missing Kingambit');
  assert(kingambit.moves.length > 0, 'selftest: JSON chaos Kingambit has no moves');
  assert(Math.abs(kingambit.moves[0].usagePercent - 9.536) < 0.01, `selftest: JSON move % mismatch (${kingambit.moves[0].usagePercent})`);
  assert(kingambit.moves[0].name === 'Sucker Punch', `selftest: JSON move name mapping failed (${kingambit.moves[0].name})`);
  assert(kingambit.abilities[0].name === 'Defiant', `selftest: JSON ability name mapping failed (${kingambit.abilities[0].name})`);
  assert(kingambit.items[0].name === 'Black Glasses', `selftest: JSON item name mapping failed (${kingambit.items[0].name})`);
  assert(Math.abs(kingambit.usagePercent - 33.83723) < 0.0001, `selftest: JSON usage % mismatch (${kingambit.usagePercent})`);
  const spread = kingambit.spreads[0];
  assert(spread.nature === 'Adamant' && spread.evs.hp === 32 && spread.evs.atk === 32, 'selftest: JSON spread parsing failed');
  const check = kingambit.checksAndCounters[0];
  assert(Math.abs(check.winRate - 69.56) < 0.01, `selftest: JSON check winRate mismatch (${check.winRate})`);
  assert(check.koChance === null, 'selftest: JSON checks should not fabricate KO chance');

  const legacy = parseChaosText(readFixture('chaos-sample.txt'), indexes);
  assert(legacy.rawCount === 389490, `selftest: legacy raw count mismatch (${legacy.rawCount})`);
  assert(legacy.moves.length === 2, `selftest: legacy moves count mismatch (${legacy.moves.length})`);
  assert(Math.abs(legacy.moves[0].usagePercent - 33.079) < 0.001, `selftest: legacy move % mismatch (${legacy.moves[0].usagePercent})`);
  assert(legacy.abilities[0].name === 'Protosynthesis', `selftest: legacy ability name mismatch (${legacy.abilities[0].name})`);
  assert(legacy.spreads[0].nature === 'Jolly' && legacy.spreads[0].evs.atk === 252, 'selftest: legacy spread parsing failed');
  const legacyCheck = legacy.checksAndCounters[0];
  assert(legacyCheck.opponent === 'Garchomp', 'selftest: legacy check opponent mismatch');
  assert(legacyCheck.koChance === 30.2, `selftest: legacy KO chance mismatch (${legacyCheck.koChance})`);
  assert(legacyCheck.switchInChance === 10.6, `selftest: legacy switch-in chance mismatch (${legacyCheck.switchInChance})`);

  console.log('✅ Smogon parser self-test passed (usage table, JSON chaos, legacy TXT chaos).');
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

async function update() {
  const cfg = config();
  const indexes = loadNameIndexes();

  const month = await resolveMonth(cfg);
  const listing = await fetchMonthListing(month);
  const prevMonth = addMonths(month, -1);
  const prevListing = await tryFetchText(`${STATS_BASE}/${prevMonth}/`);

  const notes = [];
  const formats = {};
  let anyRankChange = false;

  for (const format of cfg.formats) {
    const cutoff = resolveCutoff(cfg, listing.html, format);
    const usageFile = `${format}-${cutoff}.txt`;
    const usageText = await fetchText(`${STATS_BASE}/${month}/${usageFile}`);
    const usage = parseUsageTable(usageText);

    console.log(`Fetching ${format} @ ${cutoff} (${month}, ${usage.battles} battles)...`);
    const chaos = await fetchChaos(month, format, cutoff, indexes, usage.rows);

    let prevRanks = null;
    if (prevListing !== null) {
      const prevUsageText = await tryFetchText(`${STATS_BASE}/${prevMonth}/${usageFile}`);
      if (prevUsageText !== null) {
        const prevUsage = parseUsageTable(prevUsageText);
        prevRanks = new Map(prevUsage.rows.map((row) => [row.name, row.rank]));
      }
    }
    if (prevRanks === null) {
      notes.push(`${format}: previous-month (${prevMonth}) usage unavailable — rankChange set to 0`);
    } else {
      anyRankChange = true;
    }

    const pokemon = buildPokemonMap(usage.rows, chaos, prevRanks);
    validateFormat(format, cutoff, usage, chaos, pokemon);

    const rawDate = listing.fileTimes[usageFile];
    const lastUpdated = parseApacheDate(rawDate) ?? monthStartIso(month);
    formats[format] = {
      format,
      defaultCutoff: cutoff,
      cutoffs: {
        [String(cutoff)]: {
          cutoff,
          battles: usage.battles,
          lastUpdated,
          rankChangeAvailable: prevRanks !== null,
          rankChangeSourceMonth: prevRanks !== null ? prevMonth : null,
          pokemon,
        },
      },
    };
  }

  validateFreshness(cfg, month);

  const snapshot = {
    metadata: {
      schemaVersion: 1,
      sourceName: 'Smogon Monthly Stats',
      sourceUrl: STATS_BASE,
      month,
      fetchedAt: new Date().toISOString(),
      formats: cfg.formats,
      rankChangeAvailable: anyRankChange,
      rankChangeSourceMonth: anyRankChange ? prevMonth : null,
      notes,
    },
    formats,
  };

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, serializeSnapshot(snapshot), 'utf8');

  const speciesCount = Object.values(formats).reduce((total, format) => {
    const cutoff = format.cutoffs[String(format.defaultCutoff)];
    return total + Object.keys(cutoff.pokemon).length;
  }, 0);
  console.log(`Generated ${Object.keys(formats).length} format(s), ${speciesCount} species → ${OUTPUT_PATH}`);
}

const isSelfTest = process.argv.includes('--selftest');
const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const indexes = loadNameIndexes();
  if (isSelfTest) {
    try {
      runSelfTest(indexes);
      process.exitCode = 0;
    } catch (error) {
      console.error(`Smogon parser self-test failed: ${error instanceof Error ? error.message : error}`);
      process.exitCode = 1;
    }
  } else {
    update().catch((error) => {
      const hasLastKnownGood = existsSync(OUTPUT_PATH);
      console.error(`Smogon stats update failed: ${error instanceof Error ? error.message : error}`);

      if (!hasLastKnownGood || config().strict) {
        process.exitCode = 1;
      } else {
        console.warn('Retaining the last-known-good Smogon stats snapshot.');
      }
    });
  }
}

export { loadNameIndexes };
