// ============================================================================
// PocketForge — Movepool Query Utilities using @pkmn/data
// ============================================================================

import { getGen } from '../lib/showdown';
import type { Move, PokedexEntry } from '../types';

export type AcquisitionMethod = 'Level' | 'TM' | 'Tutor' | 'Breeding' | 'Coverage';

export interface AnnotatedMove extends Move {
  acquisition: AcquisitionMethod;
}

/**
 * Recursively collect all move IDs and their sources for a Pokémon and its pre-evolutions.
 */
async function collectMoveSources(speciesName: string, gen: any): Promise<Map<string, string[]>> {
  const moveSources = new Map<string, string[]>();
  let current = gen.species.get(speciesName);

  while (current && current.exists) {
    try {
      const learnset = await gen.learnsets.get(current.id);
      if (learnset && learnset.learnset) {
        for (const [moveId, sources] of Object.entries(learnset.learnset)) {
          if (Array.isArray(sources)) {
            if (!moveSources.has(moveId)) {
              moveSources.set(moveId, []);
            }
            moveSources.get(moveId)!.push(...sources);
          }
        }
      }
    } catch (err) {
      console.error(`Failed to load learnset for ${current.name}:`, err);
    }
    // Walk up pre-evolution chain
    current = current.prevo ? gen.species.get(current.prevo) : null;
  }

  return moveSources;
}

/**
 * Maps Showdown source strings (e.g. "9L12", "9M", "8T") to human readable AcquisitionMethod.
 */
function getAcquisitionMethod(sources: string[], genNum: number): AcquisitionMethod {
  const genPrefix = String(genNum);
  
  // 1. Try to find a source in the current generation first
  const currentGenSource = sources.find((s) => s.startsWith(genPrefix));
  if (currentGenSource) {
    if (currentGenSource.includes('L')) return 'Level';
    if (currentGenSource.includes('M')) return 'TM';
    if (currentGenSource.includes('T')) return 'Tutor';
    if (currentGenSource.includes('E')) return 'Breeding';
  }

  // 2. Check all generations
  for (const s of sources) {
    if (s.includes('L')) return 'Level';
    if (s.includes('M')) return 'TM';
    if (s.includes('T')) return 'Tutor';
    if (s.includes('E')) return 'Breeding';
  }

  return 'Coverage';
}

/**
 * Get the movepool for a species using official Pokémon Showdown learnset data.
 */
export async function getMovepoolForSpecies(
  species: string,
  genNumber: number = 9
): Promise<AnnotatedMove[]> {
  const gen = getGen(genNumber);
  const spec = gen.species.get(species);
  if (!spec || !spec.exists) return [];

  const moveSources = await collectMoveSources(spec.name, gen);
  const result: AnnotatedMove[] = [];

  for (const [moveId, sources] of moveSources.entries()) {
    const moveData = gen.moves.get(moveId);
    if (moveData && moveData.exists) {
      const acquisition = getAcquisitionMethod(sources, genNumber);
      result.push({
        name: moveData.name,
        type: moveData.type,
        category: moveData.category as Move['category'],
        power: moveData.basePower,
        accuracy: typeof moveData.accuracy === 'number' ? moveData.accuracy : null,
        pp: moveData.pp,
        description: moveData.shortDesc || moveData.desc || '',
        acquisition,
      });
    }
  }

  return result;
}

export function filterMovepool(
  moves: AnnotatedMove[],
  filters: { method?: AcquisitionMethod | 'All'; query?: string; category?: Move['category'] | 'All' }
): AnnotatedMove[] {
  const q = (filters.query || '').toLowerCase().trim();
  return moves.filter((m) => {
    if (filters.method && filters.method !== 'All' && m.acquisition !== filters.method) return false;
    if (filters.category && filters.category !== 'All' && m.category !== filters.category) return false;
    if (q && !m.name.toLowerCase().includes(q) && !m.type.toLowerCase().includes(q)) return false;
    return true;
  });
}

/**
 * Resolve PokedexEntry using official data.
 */
export function getPokedexEntry(species: string, genNumber: number = 9): PokedexEntry | undefined {
  const gen = getGen(genNumber);
  const spec = gen.species.get(species);
  if (!spec || !spec.exists) return undefined;

  const abilities: string[] = [];
  if (spec.abilities['0']) abilities.push(spec.abilities['0']);
  if (spec.abilities['1']) abilities.push(spec.abilities['1']);
  const hiddenAbility = spec.abilities['H'] || undefined;

  return {
    name: spec.name,
    id: spec.num,
    types: spec.types,
    baseStats: spec.baseStats,
    abilities,
    hiddenAbility,
    learnset: [], // Learnset is handled dynamically in getMovepoolForSpecies
    sprite: spec.name,
  };
}
