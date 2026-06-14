// ============================================================================
// PocketForge — Movepool Query Utilities
// ============================================================================
// Note: full per-Pokémon learnset data is not bundled. We approximate the
// movepool with: (a) STAB-type moves, (b) Normal coverage staples, and
// (c) explicit learnset entries already present on a PokedexEntry.

import type { Move, PokedexEntry } from '../types';
import { MOVES } from '../data/movesData';
import { getPokemonByName } from '../data/pokemonData';

export type AcquisitionMethod = 'Level' | 'TM' | 'Tutor' | 'Breeding' | 'Coverage';

export interface AnnotatedMove extends Move {
  acquisition: AcquisitionMethod;
}

const COVERAGE_TYPES = new Set(['Normal']);

/** Get the movepool for a species using heuristic + learnset entries. */
export function getMovepoolForSpecies(species: string): AnnotatedMove[] {
  const dex = getPokemonByName(species);
  if (!dex) return [];

  const types = new Set(dex.types);
  const explicit = new Set(dex.learnset.map((m) => m.toLowerCase()));

  const result: AnnotatedMove[] = [];
  for (const move of MOVES) {
    const isExplicit = explicit.has(move.name.toLowerCase());
    const isStab = types.has(move.type);
    const isCoverage = COVERAGE_TYPES.has(move.type);

    if (isExplicit) {
      result.push({ ...move, acquisition: 'Level' });
    } else if (isStab) {
      result.push({ ...move, acquisition: 'TM' });
    } else if (isCoverage) {
      result.push({ ...move, acquisition: 'Tutor' });
    }
  }
  return result;
}

export function filterMovepool(
  moves: AnnotatedMove[],
  filters: { method?: AcquisitionMethod | 'All'; query?: string; category?: Move['category'] | 'All' },
): AnnotatedMove[] {
  const q = (filters.query || '').toLowerCase().trim();
  return moves.filter((m) => {
    if (filters.method && filters.method !== 'All' && m.acquisition !== filters.method) return false;
    if (filters.category && filters.category !== 'All' && m.category !== filters.category) return false;
    if (q && !m.name.toLowerCase().includes(q) && !m.type.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function getPokedexEntry(species: string): PokedexEntry | undefined {
  return getPokemonByName(species);
}
