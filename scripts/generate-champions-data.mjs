import { createHash } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data');

const SHOWDOWN_BASE = 'https://raw.githubusercontent.com/smogon/pokemon-showdown/master';
const CHAMPIONS_MOD = `${SHOWDOWN_BASE}/data/mods/champions`;
const FORMATS_URL = `${SHOWDOWN_BASE}/config/formats.ts`;

/**
 * Live Champions regulation when Showdown config lags the game client.
 * Override with CHAMPIONS_REGULATION=M-A to roll back.
 */
const ACTIVE_CHAMPIONS_REG = process.env.CHAMPIONS_REGULATION || 'M-B';

/** Regulation M-B unlocks (Serebii / in-game, June 2026) until PS champions mod ships M-B */
const REG_MB_ADDED_SPECIES = [
  'raichumegax', 'raichumegay', 'vileplume', 'qwilfish', 'sceptile', 'sceptilemega',
  'blaziken', 'blazikenmega', 'swampert', 'swampertmega', 'mawile', 'mawilemega',
  'metagross', 'metagrossmega', 'staraptor', 'staraptormega', 'musharna',
  'scolipede', 'scolipedemega', 'scrafty', 'scraftymega', 'eelektross', 'eelektrossmega',
  'pyroar', 'pyroarmega', 'malamar', 'malamarmega', 'barbaracle', 'barbaraclemega',
  'dragalge', 'dragalgemega', 'grimmsnarl', 'falinks', 'falinksmega', 'overqwil',
  'houndstone', 'annihilape', 'gholdengo',
];

const REG_MB_LEGAL_ITEMS = [
  'widelens', 'muscleband', 'wiseglasses', 'expertbelt', 'lightclay', 'lifeorb',
  'zoomlens', 'metronome', 'ironball', 'icyrock', 'smoothrock', 'heatrock',
  'damprock', 'shedshell', 'bigroot',
];

export async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

/** @param {typeof import('./update-from-showdown.mjs').stripToJSObject} stripToJSObject */
export function parseModTable(text, stripToJSObject) {
  const cleaned = stripToJSObject(text);
  return new Function('return ' + cleaned)();
}

function slugify(name) {
  return name.toLowerCase().trim().replace(/\s+/g, '').replace(/-/g, '').replace(/[^a-z0-9]/g, '');
}

function championsFormatId(regCode) {
  const slug = regCode.toLowerCase().replace(/[\s-]+/g, '');
  if (slug === 'ma') return 'champions-ma';
  if (slug === 'mb') return 'champions-mb';
  return `champions-${slug}`;
}

function championsRegMeta(regCode, year = '2026') {
  return {
    formatId: championsFormatId(regCode),
    regulationName: `Regulation ${regCode}`,
    showdownFormat: `[Gen 9 Champions] VGC ${year} Reg ${regCode}`,
  };
}

function detectCurrentChampionsFormat(formatsText) {
  const re = /name:\s*"\[Gen 9 Champions\] VGC (\d{4}) Reg ([^"]+)"/g;
  let match;
  const candidates = [];
  while ((match = re.exec(formatsText)) !== null) {
    const reg = match[2].trim();
    if (reg.includes('Bo3')) continue;
    candidates.push({ year: match[1], reg });
  }
  const latest = candidates[candidates.length - 1];
  if (!latest) return championsRegMeta('M-A');
  return championsRegMeta(latest.reg, latest.year);
}

function resolveActiveRegulation(detected) {
  const forced = process.env.CHAMPIONS_REGULATION?.toUpperCase();
  if (forced === 'M-A' || forced === 'M-B') return championsRegMeta(forced);
  if (ACTIVE_CHAMPIONS_REG === 'M-B' && detected.regulationName === 'Regulation M-A') {
    return championsRegMeta('M-B');
  }
  return detected;
}

function buildLearnsetForSpecies(speciesId, championsLearnsets, baseLearnsets, bannedMoves) {
  const ls = championsLearnsets[speciesId] ?? baseLearnsets[speciesId];
  if (!ls?.learnset) return null;
  const moves = Object.keys(ls.learnset).filter((m) => !bannedMoves.includes(m)).sort();
  return moves.length ? moves : null;
}

function writeIfChanged(path, content) {
  const oldHash = existsSync(path)
    ? createHash('sha256').update(readFileSync(path, 'utf-8')).digest('hex')
    : '';
  const newHash = createHash('sha256').update(content).digest('hex');
  if (oldHash !== newHash) {
    writeFileSync(path, content, 'utf-8');
    console.log(`  Updated: ${path}`);
    return true;
  }
  console.log(`  Unchanged: ${path}`);
  return false;
}

/**
 * @param {object} opts
 * @param {typeof stripToJSObject} opts.stripToJSObject
 */
export async function generateChampionsData({ stripToJSObject }) {
  console.log('\nFetching Pokémon Showdown champions mod...');

  const [formatsDataRaw, learnsetsRaw, baseLearnsetsRaw, itemsModRaw, movesModRaw, formatsConfigRaw] =
    await Promise.all([
      fetchText(`${CHAMPIONS_MOD}/formats-data.ts`),
      fetchText(`${CHAMPIONS_MOD}/learnsets.ts`),
      fetchText(`${SHOWDOWN_BASE}/data/learnsets.ts`),
      fetchText(`${CHAMPIONS_MOD}/items.ts`),
      fetchText(`${CHAMPIONS_MOD}/moves.ts`),
      fetchText(FORMATS_URL),
    ]);

  const formatsData = parseModTable(formatsDataRaw, stripToJSObject);
  const learnsets = parseModTable(learnsetsRaw, stripToJSObject);
  const baseLearnsets = parseModTable(baseLearnsetsRaw, stripToJSObject);
  const itemsMod = parseModTable(itemsModRaw, stripToJSObject);
  const movesMod = parseModTable(movesModRaw, stripToJSObject);

  let rosterMa = Object.entries(formatsData)
    .filter(([, v]) => v && typeof v === 'object' && v.tier && v.tier !== 'Illegal')
    .map(([id]) => id)
    .sort();

  let roster = [...rosterMa];
  let bannedItems = Object.entries(itemsMod)
    .filter(([, v]) => v && v.isNonstandard === 'Past')
    .map(([id]) => id);

  const bannedMoves = Object.entries(movesMod)
    .filter(([, v]) => v && v.isNonstandard === 'Past')
    .map(([id]) => id)
    .sort();

  const detected = detectCurrentChampionsFormat(formatsConfigRaw);
  const reg = resolveActiveRegulation(detected);

  if (reg.regulationName === 'Regulation M-B') {
    const rosterSet = new Set(roster);
    for (const id of REG_MB_ADDED_SPECIES) rosterSet.add(id);
    roster = [...rosterSet].sort();
    const unban = new Set(REG_MB_LEGAL_ITEMS);
    bannedItems = bannedItems.filter((id) => !unban.has(id)).sort();
    console.log(`  Applied Regulation M-B patch (+${REG_MB_ADDED_SPECIES.length} species, −${REG_MB_LEGAL_ITEMS.length} item bans)`);
  } else {
    bannedItems.sort();
  }

  const learnsetMap = {};
  for (const speciesId of roster) {
    const moves = buildLearnsetForSpecies(speciesId, learnsets, baseLearnsets, bannedMoves);
    if (moves) learnsetMap[speciesId] = moves;
  }

  const updatedAt = new Date().toISOString();
  const patchNote = reg.regulationName === 'Regulation M-B' && detected.regulationName !== reg.regulationName
    ? '\n// Includes PocketForge M-B patch until Showdown ships Reg M-B'
    : '';

  const rosterFile = `// Auto-generated from Pokémon Showdown champions mod — do not edit manually
// Source: data/mods/champions/formats-data.ts${patchNote}
// Last updated: ${updatedAt}
// Regulation: ${reg.regulationName}
// M-A species: ${rosterMa.length} | M-B species: ${roster.length}

export const CHAMPIONS_MA_ROSTER: string[] = ${JSON.stringify(rosterMa, null, 2)};

export const CHAMPIONS_MB_ROSTER: string[] = ${JSON.stringify(roster, null, 2)};

/** Active Champions regulation roster (same as M-B while Reg M-B is live). */
export const CHAMPIONS_ROSTER = CHAMPIONS_MB_ROSTER;
`;

  const bannedItemsFile = `// Auto-generated from Pokémon Showdown champions mod — do not edit manually
// Items with isNonstandard: "Past" in data/mods/champions/items.ts${patchNote}
// Last updated: ${updatedAt}

export const CHAMPIONS_BANNED_ITEMS: string[] = ${JSON.stringify(bannedItems, null, 2)};
`;

  const bannedMovesFile = `// Auto-generated from Pokémon Showdown champions mod — do not edit manually
// Moves with isNonstandard: "Past" in data/mods/champions/moves.ts
// Last updated: ${updatedAt}

export const CHAMPIONS_BANNED_MOVES: string[] = ${JSON.stringify(bannedMoves, null, 2)};
`;

  const learnsetsFile = `// Auto-generated from Pokémon Showdown champions mod — do not edit manually
// Source: champions + base learnsets for patched species${patchNote}
// Last updated: ${updatedAt}

export const CHAMPIONS_LEARNSETS: Record<string, string[]> = ${JSON.stringify(learnsetMap, null, 2)};
`;

  const metaFile = `// Auto-generated from Pokémon Showdown config/formats.ts — do not edit manually
// Last updated: ${updatedAt}

export const CHAMPIONS_META = {
  formatId: '${reg.formatId}',
  regulationName: '${reg.regulationName}',
  showdownFormat: '${reg.showdownFormat}',
  updatedAt: '${updatedAt}',
  rosterCount: ${roster.length},
  rosterCountMa: ${rosterMa.length},
  bannedItemCount: ${bannedItems.length},
  bannedMoveCount: ${bannedMoves.length},
} as const;
`;

  console.log(`  Champions roster: ${roster.length} species`);
  console.log(`  Banned items: ${bannedItems.length}`);
  console.log(`  Banned moves: ${bannedMoves.length}`);
  console.log(`  Learnset entries: ${Object.keys(learnsetMap).length}`);
  console.log(`  Detected regulation: ${reg.showdownFormat}`);

  let changed = false;
  changed = writeIfChanged(join(DATA_DIR, 'championsRoster.ts'), rosterFile) || changed;
  changed = writeIfChanged(join(DATA_DIR, 'championsBannedItems.ts'), bannedItemsFile) || changed;
  changed = writeIfChanged(join(DATA_DIR, 'championsBannedMoves.ts'), bannedMovesFile) || changed;
  changed = writeIfChanged(join(DATA_DIR, 'championsLearnsets.ts'), learnsetsFile) || changed;
  changed = writeIfChanged(join(DATA_DIR, 'championsMeta.ts'), metaFile) || changed;

  return changed;
}