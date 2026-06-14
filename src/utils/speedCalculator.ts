// ============================================================================
// PocketForge — Speed Tier Calculator
// ============================================================================

import type { Pokemon, Team } from '../types';
import { getPokemonByName } from '../data/pokemonData';
import { calculateStat } from './statCalc';

export interface SpeedModifiers {
  isScarf?: boolean;        // Choice Scarf: 1.5x Speed
  hasStickyWeb?: boolean;   // Sticky Web: -1 Speed stage
  isTrickRoom?: boolean;    // Trick Room: speed order inverted
  tailwindActive?: boolean; // Tailwind: +1 Speed stage (multiplier 2x)
  paralyzed?: boolean;      // Paralysis: 0.5x Speed (Gen 7+)
}

export interface PokemonWithSpeed {
  pokemon: Pokemon;
  baseSpeed: number;
  finalSpeed: number;
  modifiers: SpeedModifiers;
}

/** Apply stage multiplier. +1 = 1.5x, -1 = 2/3x, +2 = 2x, etc. */
function stageMultiplier(stage: number): number {
  if (stage >= 0) return (2 + stage) / 2;
  return 2 / (2 - stage);
}

/** Detect if a held item is Choice Scarf */
function hasChoiceScarf(pokemon: Pokemon): boolean {
  return (pokemon.item || '').trim().toLowerCase() === 'choice scarf';
}

/**
 * Calculate final Speed stat given a Pokémon and battlefield modifiers.
 * Returns 0 if species cannot be resolved.
 */
export function calculateSpeed(pokemon: Pokemon, modifiers: SpeedModifiers = {}): number {
  const dex = getPokemonByName(pokemon.species);
  if (!dex) return 0;

  let speed = calculateStat(
    dex.baseStats.spe,
    pokemon.evs.spe,
    pokemon.ivs.spe,
    pokemon.level || 100,
    pokemon.nature,
    'spe',
  );

  // Per-Pokémon item modifier
  const scarf = modifiers.isScarf ?? hasChoiceScarf(pokemon);
  if (scarf) speed = Math.floor(speed * 1.5);

  // Stage changes (Sticky Web -1, Tailwind effectively +1 stage doubling — Tailwind is 2x)
  let stage = 0;
  if (modifiers.hasStickyWeb) stage -= 1;
  if (stage !== 0) speed = Math.floor(speed * stageMultiplier(stage));

  if (modifiers.tailwindActive) speed = Math.floor(speed * 2);

  if (modifiers.paralyzed) speed = Math.floor(speed * 0.5);

  return speed;
}

/** Rank Pokémon by effective speed (slowest first if Trick Room). */
export function rankTeamBySpeed(
  team: Team,
  modifiers: SpeedModifiers = {},
): PokemonWithSpeed[] {
  const ranked = team.pokemon
    .filter((p) => p.species)
    .map<PokemonWithSpeed>((p) => {
      const dex = getPokemonByName(p.species);
      const finalSpeed = calculateSpeed(p, modifiers);
      return {
        pokemon: p,
        baseSpeed: dex?.baseStats.spe ?? 0,
        finalSpeed,
        modifiers,
      };
    });

  ranked.sort((a, b) =>
    modifiers.isTrickRoom ? a.finalSpeed - b.finalSpeed : b.finalSpeed - a.finalSpeed,
  );
  return ranked;
}

/** Returns true if A moves before B given the modifiers (Trick Room aware). */
export function outspeeds(
  a: Pokemon,
  b: Pokemon,
  modifiers: SpeedModifiers = {},
): boolean {
  const sa = calculateSpeed(a, modifiers);
  const sb = calculateSpeed(b, modifiers);
  if (modifiers.isTrickRoom) return sa < sb;
  return sa > sb;
}

/** Common competitive speed benchmarks used for quick comparison. */
export interface SpeedTier {
  speed: number;
  label: string;
}

export const COMMON_SPEED_BENCHMARKS: SpeedTier[] = [
  { speed: 394, label: 'Max Speed Regieleki (base 200)' },
  { speed: 372, label: 'Max Speed +Scarf base 110 (e.g. Latios @ Scarf)' },
  { speed: 361, label: 'Choice Scarf base 100 (Jolly)' },
  { speed: 350, label: 'Max Speed base 130 (e.g. Weavile)' },
  { speed: 328, label: 'Max Speed base 115 (e.g. Gengar)' },
  { speed: 317, label: 'Max Speed base 108 (e.g. Latios)' },
  { speed: 306, label: 'Max Speed base 100 (e.g. Garchomp Jolly)' },
  { speed: 299, label: 'Max Speed base 95 (e.g. Zapdos)' },
  { speed: 295, label: 'Max Speed base 92 (e.g. Heatran-less Heatran)' },
  { speed: 284, label: 'Max Speed base 85' },
  { speed: 252, label: 'Max Speed base 70' },
  { speed: 200, label: 'Max Speed base 50' },
];

/** Format-specific benchmark presets. */
export function getSpeedTiersForFormat(format: string): SpeedTier[] {
  // VGC uses Level 50; halve the speeds roughly.
  if (format.toLowerCase().includes('vgc') || format.toLowerCase().includes('doubles')) {
    return COMMON_SPEED_BENCHMARKS.map((t) => ({
      speed: Math.floor(t.speed / 2),
      label: `${t.label} (L50)`,
    }));
  }
  return COMMON_SPEED_BENCHMARKS;
}
