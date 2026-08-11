// ============================================================================
// PocketForge — Battle Data UI formatting + format-selection helpers
//
// Pure, UI-facing helpers for the Battle Data panel. Type-only imports keep
// this module free of any runtime dependency on the Smogon snapshot, so it can
// be statically imported by components without pulling the snapshot into the
// initial bundle.
// ============================================================================

import type { BattleFormatId, BattleFormatInfo } from '@/lib/data';

const FORMAT_LABELS: Record<string, string> = {
  'gen9championsvgc2026regmb': 'Champions VGC 2026 Reg M-B',
  'gen9vgc2025': 'VGC 2025',
  'gen9vgc2024': 'VGC 2024',
  'gen9vgc2023': 'VGC 2023',
  'gen9ou': 'Gen 9 OU',
  'gen9uu': 'Gen 9 UU',
  'gen9ru': 'Gen 9 RU',
  'gen9nu': 'Gen 9 NU',
  'gen9pu': 'Gen 9 PU',
  'gen9zu': 'Gen 9 ZU',
  'gen9ubers': 'Gen 9 Ubers',
  'gen9anythinggoes': 'Gen 9 Anything Goes',
  'gen8ou': 'Gen 8 OU',
  'gen8vgc2021': 'VGC 2021',
  'gen7ou': 'Gen 7 OU',
  'gen6ou': 'Gen 6 OU',
  'gen5ou': 'Gen 5 OU',
  'gen4ou': 'Gen 4 OU',
  'gen3ou': 'Gen 3 OU',
  'gen2ou': 'Gen 2 OU',
  'gen1ou': 'Gen 1 OU',
};

/** Human-readable label for a Smogon format id, e.g. 'gen9ou' -> 'Gen 9 OU'. */
export function formatDisplayName(format: string): string {
  return FORMAT_LABELS[format] ?? format.replace(/^gen(\d+)/, 'Gen $1');
}

/**
 * Pick the format to show for a Battle Data panel.
 *
 * Order of preference: an explicitly requested format, then the VGC (doubles)
 * format present in the snapshot (the default the panel is designed around),
 * then the first available format. Returns null only when no formats exist.
 */
export function pickPreferredBattleFormat(
  formats: BattleFormatInfo[],
  preferred?: BattleFormatId | string | null,
): BattleFormatInfo | null {
  if (!formats || formats.length === 0) return null;
  if (preferred) {
    const exact = formats.find((f) => f.format === preferred);
    if (exact) return exact;
  }
  const vgc = formats.find((f) => f.format.toLowerCase().includes('vgc'));
  return vgc ?? formats[0];
}

/**
 * Map the app's own format id (e.g. 'champions-mb', 'gen9ou') onto a Smogon
 * format present in the committed snapshot. Champions/Gen-10 doubles teams map
 * onto the snapshot's VGC format; direct ids ('gen9ou') pass through.
 */
export function battleFormatForAppFormat(
  appFormatId: string | undefined,
  formats: BattleFormatInfo[],
): BattleFormatInfo | null {
  if (!formats || formats.length === 0) return null;
  if (appFormatId) {
    const exact = formats.find((f) => f.format === appFormatId);
    if (exact) return exact;
    if (appFormatId.startsWith('champions')) {
      return pickPreferredBattleFormat(formats);
    }
  }
  return pickPreferredBattleFormat(formats);
}

/** Usage % for display — rounding happens only in the UI layer. */
export function formatUsage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/** Raw count for display, e.g. 825864 -> '825,864'. */
export function formatCount(value: number): string {
  return value.toLocaleString();
}

/** ISO date -> short display date, falling back to the raw string. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
