import { Dex } from '@pkmn/dex';
import { Generations, Generation } from '@pkmn/data';

// Initialize the Generations data layer with the Dex
export const gens = new Generations(Dex);

export { Dex };

const DEFAULT_GEN = 9;

/** Extract generation number from a format id (e.g. "gen9ou" → 9). */
export function parseFormatGen(format?: string): number {
  if (!format) return DEFAULT_GEN;
  const id = format.toLowerCase().trim();
  if (id.startsWith('champions')) return DEFAULT_GEN;
  const match = id.match(/gen(\d+)/);
  if (match) {
    const n = parseInt(match[1], 10);
    if (n >= 1 && n <= 9) return n;
  }
  return DEFAULT_GEN;
}

/** True for Pokémon Champions regulation formats (e.g. champions-mb). */
export function isChampionsFormat(format?: string): boolean {
  return (format || '').toLowerCase().trim().startsWith('champions');
}

/** True for doubles / VGC-style formats that use level 50. */
export function isDoublesFormat(format?: string): boolean {
  const f = (format || '').toLowerCase();
  return f.includes('vgc') || f.includes('doubles') || isChampionsFormat(f);
}

/** Default level for new Pokémon in a format. */
export function getDefaultLevelForFormat(format?: string): number {
  return isChampionsFormat(format) || (format || '').toLowerCase().includes('vgc') ? 50 : 100;
}

/** Get a Dex scoped to the format's generation (Champions uses Gen 9 base until @pkmn champions mod ships). */
export function getDexForFormat(format?: string) {
  return Dex.forGen(parseFormatGen(format));
}

/**
 * Helper to get a Generation data object by number.
 * Defaults to Generation 9.
 */
export function getGen(genNumber: number = DEFAULT_GEN): Generation {
  return gens.get(genNumber);
}

/** Map format id to @smogon/calc generation number. */
export function getCalcGenForFormat(format?: string): number {
  return parseFormatGen(format);
}