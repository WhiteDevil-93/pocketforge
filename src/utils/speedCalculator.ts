// ============================================================================
// PocketForge — Speed Tier Calculator using @smogon/calc
// ============================================================================

import { Pokemon as CalcMon, Generations } from '@smogon/calc';
import type { Pokemon, Team } from '../types';

export interface SpeedModifiers {
  isScarf?: boolean;        // Choice Scarf: 1.5x Speed
  hasStickyWeb?: boolean;   // Sticky Web: -1 Speed stage (0.67x)
  isTrickRoom?: boolean;    // Trick Room: speed order inverted
  tailwindActive?: boolean; // Tailwind: 2x Speed
  paralyzed?: boolean;      // Paralysis: 0.5x Speed (Gen 7+)
  // Weather / Ability Modifiers
  weather?: string;         // 'sun' | 'rain' | 'sand' | 'snow' | 'none'
  terrain?: string;         // 'electric' | 'grassy' | 'psychic' | 'misty' | 'none'
  isUnburdenActive?: boolean; // Unburden active: 2x Speed
  isSlowStartActive?: boolean; // Slow Start active: 0.5x Speed
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

/** Detect if a held item is Iron Ball */
function hasIronBall(pokemon: Pokemon): boolean {
  return (pokemon.item || '').trim().toLowerCase() === 'iron ball';
}

/**
 * Calculate final Speed stat given a Pokémon and battlefield modifiers.
 * Returns 0 if species cannot be resolved.
 */
export function calculateSpeed(pokemon: Pokemon, modifiers: SpeedModifiers = {}, genNum: number = 9): number {
  const calcGen = Generations.get(genNum as any);
  const speciesId = (pokemon.species || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const species = calcGen.species.get(speciesId as any);
  if (!species || !species.name) return 0;

  // Compute raw stats via @smogon/calc
  const calcMon = new CalcMon(calcGen, species.name, {
    level: pokemon.level || 100,
    nature: pokemon.nature || 'Serious',
    evs: { spe: pokemon.evs.spe },
    ivs: { spe: pokemon.ivs.spe },
  });

  let speed = calcMon.rawStats.spe;

  // 1. Item modifiers
  const scarf = modifiers.isScarf ?? hasChoiceScarf(pokemon);
  if (scarf) {
    speed = Math.floor(speed * 1.5);
  } else if (hasIronBall(pokemon)) {
    speed = Math.floor(speed * 0.5);
  }

  // 2. Stage changes (e.g. Sticky Web -1 speed stage)
  let stage = 0;
  if (modifiers.hasStickyWeb) stage -= 1;
  if (stage !== 0) {
    speed = Math.floor(speed * stageMultiplier(stage));
  }

  // 3. Tailwind (doubles speed)
  if (modifiers.tailwindActive) {
    speed = Math.floor(speed * 2);
  }

  // 4. Paralysis (halves speed)
  if (modifiers.paralyzed) {
    // Standard paralysis reduces speed to 50% (since Gen 7)
    speed = Math.floor(speed * 0.5);
  }

  // 5. Ability speed modifiers
  const abilityName = (pokemon.ability || '').trim().toLowerCase();
  const weather = (modifiers.weather || '').trim().toLowerCase();
  const terrain = (modifiers.terrain || '').trim().toLowerCase();

  // Swift Swim: 2x in Rain
  if (abilityName === 'swift swim' && (weather === 'rain' || weather === 'heavy-rain')) {
    speed = Math.floor(speed * 2);
  }
  // Chlorophyll: 2x in Sun
  if (abilityName === 'chlorophyll' && (weather === 'sun' || weather === 'harsh-sun')) {
    speed = Math.floor(speed * 2);
  }
  // Sand Rush: 2x in Sand
  if (abilityName === 'sand rush' && weather === 'sand') {
    speed = Math.floor(speed * 2);
  }
  // Slush Rush: 2x in Snow
  if (abilityName === 'slush rush' && weather === 'snow') {
    speed = Math.floor(speed * 2);
  }
  // Surge Surfer: 2x in Electric Terrain
  if (abilityName === 'surge surfer' && terrain === 'electric') {
    speed = Math.floor(speed * 2);
  }
  // Unburden: 2x
  if (abilityName === 'unburden' && modifiers.isUnburdenActive) {
    speed = Math.floor(speed * 2);
  }
  // Slow Start: 0.5x
  if (abilityName === 'slow start' && modifiers.isSlowStartActive) {
    speed = Math.floor(speed * 0.5);
  }
  // Protosynthesis: 1.5x Speed if Speed is the boosted stat under Sun
  if (abilityName === 'protosynthesis' && (weather === 'sun' || weather === 'harsh-sun')) {
    speed = Math.floor(speed * 1.5);
  }
  // Quark Drive: 1.5x Speed if Speed is the boosted stat under Electric Terrain
  if (abilityName === 'quark drive' && terrain === 'electric') {
    speed = Math.floor(speed * 1.5);
  }

  return speed;
}

/** Rank Pokémon by effective speed (slowest first if Trick Room). */
export function rankTeamBySpeed(
  team: Team,
  modifiers: SpeedModifiers = {},
  genNum: number = 9
): PokemonWithSpeed[] {
  const calcGen = Generations.get(genNum as any);
  const ranked = team.pokemon
    .filter((p) => p.species)
    .map<PokemonWithSpeed>((p) => {
      const speciesId = (p.species || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const species = calcGen.species.get(speciesId as any);
      const finalSpeed = calculateSpeed(p, modifiers, genNum);
      return {
        pokemon: p,
        baseSpeed: species?.baseStats.spe ?? 0,
        finalSpeed,
        modifiers,
      };
    });

  ranked.sort((a, b) =>
    modifiers.isTrickRoom ? a.finalSpeed - b.finalSpeed : b.finalSpeed - a.finalSpeed
  );
  return ranked;
}

/** Returns true if A moves before B given the modifiers (Trick Room aware). */
export function outspeeds(
  a: Pokemon,
  b: Pokemon,
  modifiers: SpeedModifiers = {},
  genNum: number = 9
): boolean {
  const sa = calculateSpeed(a, modifiers, genNum);
  const sb = calculateSpeed(b, modifiers, genNum);
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
  const f = format.toLowerCase();
  // VGC / Champions doubles use Level 50; halve benchmark speeds.
  if (f.includes('vgc') || f.includes('doubles') || f.startsWith('champions')) {
    return COMMON_SPEED_BENCHMARKS.map((t) => ({
      speed: Math.floor(t.speed / 2),
      label: `${t.label} (L50)`,
    }));
  }
  return COMMON_SPEED_BENCHMARKS;
}
