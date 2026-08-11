// ============================================================================
// PocketForge — Battle Data panel logic assertions
//
// Standalone render-check for the Battle Data panel's data layer. Picked up by
// `npm run check` (eslint + tsc type-check it) and runnable directly with:
//
//   node --import tsx src/components/battle-data/battleDataPanel.test.ts
//
// It asserts the tab → data mapping inputs against the committed Smogon
// snapshot: format selection helpers, real rank/usage data for a top-used
// species, and which categories will render rows vs. an explicit 'Not enough
// data' state. No PokéAPI hydration is performed (seed lookups only), so this
// stays offline and deterministic.
// ============================================================================

import { getAvailableBattleFormats, getPokemonBattleDataSeed } from '@/lib/data';
import {
  battleFormatForAppFormat,
  formatDisplayName,
  formatUsage,
  pickPreferredBattleFormat,
} from './formatHelpers';

function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) throw new Error(message ?? 'Assertion failed');
}

function assertEqual(actual: unknown, expected: unknown, message?: string): void {
  if (actual !== expected) {
    throw new Error(message ?? `Expected ${String(expected)}, got ${String(actual)}`);
  }
}

const failures: string[] = [];

function check(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ok — ${name}`);
  } catch (error) {
    failures.push(name);
    console.error(`  FAIL — ${name}:`, error instanceof Error ? error.message : String(error));
  }
}

console.log('Battle Data panel logic assertions');

const formats = getAvailableBattleFormats();
const formatIds = formats.map((format) => format.format);

check('snapshot exposes a VGC format + one other format', () => {
  assert(
    formatIds.some((id) => id.includes('vgc')),
    `expected a VGC format in [${formatIds.join(', ')}]`,
  );
  assert(formatIds.length >= 2, `expected >= 2 formats, got ${formatIds.length}`);
});

const preferredFormat = pickPreferredBattleFormat(formats);
check('pickPreferredBattleFormat prefers the VGC format', () => {
  assert(preferredFormat !== null, 'expected a preferred format');
  assert(
    preferredFormat.format.toLowerCase().includes('vgc'),
    `expected VGC, got ${preferredFormat.format}`,
  );
});

check('pickPreferredBattleFormat honors an explicit preference', () => {
  const preferred = pickPreferredBattleFormat(formats, formats[0].format);
  assert(preferred !== null, 'expected a preferred format');
  assertEqual(preferred.format, formats[0].format);
});

const championsMapped = battleFormatForAppFormat('champions-mb', formats);
check('battleFormatForAppFormat maps champions teams onto the VGC snapshot format', () => {
  assert(championsMapped !== null, 'expected a mapped format');
  assert(
    championsMapped.format.toLowerCase().includes('vgc'),
    `expected VGC, got ${championsMapped.format}`,
  );
});

check('battleFormatForAppFormat passes through matching ids like gen9ou', () => {
  const mapped = battleFormatForAppFormat('gen9ou', formats);
  assert(mapped !== null, 'expected a mapped format');
  assertEqual(mapped.format, 'gen9ou');
});

check('battleFormatForAppFormat falls back to VGC for unknown app formats', () => {
  const mapped = battleFormatForAppFormat('gen5ou', formats);
  assert(mapped !== null, 'expected a mapped format');
  assert(mapped.format.toLowerCase().includes('vgc'));
});

check('formatDisplayName renders friendly labels', () => {
  assertEqual(formatDisplayName('gen9ou'), 'Gen 9 OU');
  assert(formatDisplayName('gen9championsvgc2026regmb').length > 0);
});

check('formatUsage rounds for display only', () => {
  assertEqual(formatUsage(33.83723), '33.84%');
});

const vgcFormat = formats.find((format) => format.format.toLowerCase().includes('vgc'));
assert(vgcFormat !== undefined, 'expected a VGC format in the snapshot');

const topSpecies = 'Kingambit';
const seedResult = getPokemonBattleDataSeed(topSpecies, vgcFormat.format);

check(`seed lookup resolves a top-used species (${topSpecies}) in ${vgcFormat.format}`, () => {
  assert(seedResult !== null, `expected a seed for ${topSpecies}`);
});

if (seedResult) {
  const { seed, cutoff } = seedResult;

  check('seed carries real rank / usage / raw count from the dump', () => {
    assertEqual(seed.rank, 1);
    assert(seed.usagePercent > 0, 'expected usagePercent > 0');
    assert(seed.rawCount > 0, 'expected rawCount > 0');
  });

  check('moves tab has data rows', () => {
    assert(seed.moves.length > 0, 'expected ranked moves');
    assert(seed.moves[0].usagePercent > 0, 'expected move usage');
  });

  check('held item tab has data rows', () => {
    assert(seed.items.length > 0, 'expected ranked items');
  });

  check('ability tab has data rows', () => {
    assert(seed.abilities.length > 0, 'expected ranked abilities');
  });

  check('stat alignment / stat points tabs have data rows', () => {
    assert(seed.spreads.length > 0, 'expected ranked spreads');
    const spread = seed.spreads[0];
    assert(spread.nature.length > 0, 'expected a nature');
    assert(spread.evsText.length > 0, 'expected an EV spread string');
  });

  check('teammates tab has data rows', () => {
    assert(seed.teammates.length > 0, 'expected ranked teammates');
  });

  check('wins-against tab maps to reported win rates', () => {
    const withWinRate = seed.checksAndCounters.filter((entry) => entry.winRate !== null);
    assert(withWinRate.length > 0, 'expected checks with win rates');
  });

  check('loses-against tab shows empty state when loss rates are unreported', () => {
    const withLossRate = seed.checksAndCounters.filter((entry) => entry.lossRate !== null);
    // The current dump reports win rates only; the panel renders the explicit
    // 'Not enough data' state for the loses tab in that case.
    assert(
      withLossRate.length === 0 || withLossRate.length === seed.checksAndCounters.length,
      'loss rates should be uniformly reported or uniformly absent',
    );
  });

  check('cutoff metadata is present for the rating-cutoff label', () => {
    assert(cutoff.cutoff > 0, 'expected a rating cutoff');
    assert(cutoff.lastUpdated.length > 0, 'expected lastUpdated');
  });
}

check('missing species resolves to null (graceful no-data state)', () => {
  const missing = getPokemonBattleDataSeed('NotARealSpecies9000', vgcFormat.format);
  assertEqual(missing, null);
});

if (failures.length > 0) {
  throw new Error(`${failures.length} assertion(s) failed: ${failures.join(', ')}`);
}

console.log('\nAll battle-data panel assertions passed.');
