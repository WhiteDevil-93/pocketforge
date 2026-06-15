import { createHash } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data');

const SHOWDOWN_BASE = 'https://raw.githubusercontent.com/smogon/pokemon-showdown/master';
const CHAMPIONS_MOD = `${SHOWDOWN_BASE}/data/mods/champions`;
const FORMATS_URL = `${SHOWDOWN_BASE}/config/formats.ts`;

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
  if (!latest) {
    return {
      formatId: 'champions-ma',
      regulationName: 'Regulation M-A',
      showdownFormat: '[Gen 9 Champions] VGC 2026 Reg M-A',
    };
  }
  const regSlug = latest.reg.toLowerCase().replace(/\s+/g, '-');
  return {
    formatId: regSlug === 'm-a' ? 'champions-ma' : `champions-${regSlug}`,
    regulationName: `Regulation ${latest.reg}`,
    showdownFormat: `[Gen 9 Champions] VGC ${latest.year} Reg ${latest.reg}`,
  };
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

  const [formatsDataRaw, learnsetsRaw, itemsModRaw, movesModRaw, formatsConfigRaw, baseMovesRaw] =
    await Promise.all([
      fetchText(`${CHAMPIONS_MOD}/formats-data.ts`),
      fetchText(`${CHAMPIONS_MOD}/learnsets.ts`),
      fetchText(`${CHAMPIONS_MOD}/items.ts`),
      fetchText(`${CHAMPIONS_MOD}/moves.ts`),
      fetchText(FORMATS_URL),
      fetchText(`${SHOWDOWN_BASE}/data/moves.ts`),
    ]);

  const formatsData = parseModTable(formatsDataRaw, stripToJSObject);
  const learnsets = parseModTable(learnsetsRaw, stripToJSObject);
  const itemsMod = parseModTable(itemsModRaw, stripToJSObject);
  const movesMod = parseModTable(movesModRaw, stripToJSObject);
  const baseMoves = parseModTable(baseMovesRaw, stripToJSObject);

  const roster = Object.entries(formatsData)
    .filter(([, v]) => v && typeof v === 'object' && v.tier && v.tier !== 'Illegal')
    .map(([id]) => id)
    .sort();

  const bannedItems = Object.entries(itemsMod)
    .filter(([, v]) => v && v.isNonstandard === 'Past')
    .map(([id]) => id)
    .sort();

  const bannedMoves = Object.entries(movesMod)
    .filter(([, v]) => v && v.isNonstandard === 'Past')
    .map(([id]) => id)
    .sort();

  const rosterSet = new Set(roster);
  const learnsetMap = {};
  for (const speciesId of roster) {
    const ls = learnsets[speciesId];
    if (!ls?.learnset) continue;
    const moves = Object.keys(ls.learnset).filter((m) => !bannedMoves.includes(m)).sort();
    if (moves.length) learnsetMap[speciesId] = moves;
  }

  const reg = detectCurrentChampionsFormat(formatsConfigRaw);
  const updatedAt = new Date().toISOString();

  const rosterFile = `// Auto-generated from Pokémon Showdown champions mod — do not edit manually
// Source: data/mods/champions/formats-data.ts
// Last updated: ${updatedAt}
// Legal species: ${roster.length}

export const CHAMPIONS_MA_ROSTER: string[] = ${JSON.stringify(roster, null, 2)};

export function isEligibleForChampionsMA(species: string): boolean {
  if (!species) return false;
  const slug = species.toLowerCase().trim().replace(/\\s+/g, '').replace(/-/g, '').replace(/[^a-z0-9]/g, '');
  return CHAMPIONS_MA_ROSTER.includes(slug) || CHAMPIONS_MA_ROSTER.some((id) => slug.includes(id) || id.includes(slug));
}
`;

  const bannedItemsFile = `// Auto-generated from Pokémon Showdown champions mod — do not edit manually
// Items with isNonstandard: "Past" in data/mods/champions/items.ts
// Last updated: ${updatedAt}

export const CHAMPIONS_BANNED_ITEMS: string[] = ${JSON.stringify(bannedItems, null, 2)};
`;

  const bannedMovesFile = `// Auto-generated from Pokémon Showdown champions mod — do not edit manually
// Moves with isNonstandard: "Past" in data/mods/champions/moves.ts
// Last updated: ${updatedAt}

export const CHAMPIONS_BANNED_MOVES: string[] = ${JSON.stringify(bannedMoves, null, 2)};
`;

  const learnsetsFile = `// Auto-generated from Pokémon Showdown champions mod — do not edit manually
// Source: data/mods/champions/learnsets.ts (legal species only)
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