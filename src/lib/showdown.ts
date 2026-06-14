import { Dex } from '@pkmn/dex';
import { Generations, Generation } from '@pkmn/data';

// Initialize the Generations data layer with the Dex
export const gens = new Generations(Dex);

// Expose the global Dex instance
export { Dex };

/**
 * Helper to get a Generation data object by number.
 * Defaults to Generation 9.
 */
export function getGen(genNumber: number = 9): Generation {
  return gens.get(genNumber);
}
