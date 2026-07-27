import { Dex } from '@pkmn/dex';
import { Generations, Generation } from '@pkmn/data';
import { parseFormatGen } from './format';

export {
  getDefaultLevelForFormat,
  isChampionsFormat,
  isDoublesFormat,
  parseFormatGen,
} from './format';

// Initialize the Generations data layer with the Dex
export const gens = new Generations(Dex);

export { Dex };

const DEFAULT_GEN = 9;

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
