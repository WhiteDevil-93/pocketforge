// ============================================================================
// PocketForge — Damage Calculation Engine
// ============================================================================
// Simplified but accurate Pokemon damage formula implementation
// ============================================================================

import { getEffectiveness } from '../data/typesData';
import { calculateStat, calculateHP } from './statCalc';

// ---- Types ------------------------------------------------------------------

export interface CalcPokemon {
  name: string;
  level: number;
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  evs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  ivs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  nature: string;
  ability: string;
  item: string;
  types: string[];
  teraType?: string;
  status: StatusCondition;
}

export type StatusCondition =
  | 'healthy'
  | 'burned'
  | 'paralyzed'
  | 'asleep'
  | 'frozen'
  | 'poisoned'
  | 'badly-poisoned';

export interface CalcMove {
  name: string;
  type: string;
  category: 'Physical' | 'Special' | 'Status';
  power: number;
  accuracy: number | null;
}

export interface FieldConditions {
  weather: Weather;
  terrain: Terrain;
  reflect: boolean;
  lightScreen: boolean;
  auroraVeil: boolean;
  stealthRock: boolean;
  multiscale: boolean;
  friendGuard: boolean;
}

export type Weather = 'none' | 'sun' | 'rain' | 'sand' | 'snow' | 'harsh-sun' | 'heavy-rain';
export type Terrain = 'none' | 'electric' | 'grassy' | 'psychic' | 'misty';

export interface DamageResult {
  minPercent: number;
  maxPercent: number;
  minDamage: number;
  maxDamage: number;
  koChance: string;
  effectiveness: number;
  effectivenessLabel: string;
  isStab: boolean;
  stabMultiplier: number;
  isCritical: boolean;
  critMinPercent: number;
  critMaxPercent: number;
  critMinDamage: number;
  critMaxDamage: number;
  damageRolls: number[];
}

// ---- Helpers ----------------------------------------------------------------

/** Get all stats for a calc pokemon */
function getCalcStats(pokemon: CalcPokemon) {
  return {
    hp: calculateHP(pokemon.baseStats.hp, pokemon.evs.hp, pokemon.ivs.hp, pokemon.level),
    atk: calculateStat(pokemon.baseStats.atk, pokemon.evs.atk, pokemon.ivs.atk, pokemon.level, pokemon.nature, 'atk'),
    def: calculateStat(pokemon.baseStats.def, pokemon.evs.def, pokemon.ivs.def, pokemon.level, pokemon.nature, 'def'),
    spa: calculateStat(pokemon.baseStats.spa, pokemon.evs.spa, pokemon.ivs.spa, pokemon.level, pokemon.nature, 'spa'),
    spd: calculateStat(pokemon.baseStats.spd, pokemon.evs.spd, pokemon.ivs.spd, pokemon.level, pokemon.nature, 'spd'),
    spe: calculateStat(pokemon.baseStats.spe, pokemon.evs.spe, pokemon.ivs.spe, pokemon.level, pokemon.nature, 'spe'),
  };
}

/** Get attacking stat based on move category */
function getAttackingStat(atkStats: ReturnType<typeof getCalcStats>, category: string): number {
  return category === 'Physical' ? atkStats.atk : atkStats.spa;
}

/** Get defending stat based on move category */
function getDefendingStat(defStats: ReturnType<typeof getCalcStats>, category: string): number {
  return category === 'Physical' ? defStats.def : defStats.spd;
}

/** Check if STAB applies */
function isStab(attacker: CalcPokemon, moveType: string, useTera: boolean): boolean {
  if (useTera && attacker.teraType) {
    return attacker.teraType === moveType;
  }
  return attacker.types.includes(moveType);
}

/** Get STAB multiplier (1.5x default, 2x with Adaptability) */
function getStabMultiplier(attacker: CalcPokemon, moveType: string, useTera: boolean): number {
  if (!isStab(attacker, moveType, useTera)) return 1;
  if (attacker.ability === 'Adaptability') return 2;
  return 1.5;
}

/** Get weather modifier */
function getWeatherModifier(moveType: string, weather: Weather): number {
  if (weather === 'harsh-sun') {
    if (moveType === 'Fire') return 1.5;
    if (moveType === 'Water') return 0;
  }
  if (weather === 'heavy-rain') {
    if (moveType === 'Water') return 1.5;
    if (moveType === 'Fire') return 0;
  }
  if (weather === 'sun') {
    if (moveType === 'Fire') return 1.5;
    if (moveType === 'Water') return 0.5;
  }
  if (weather === 'rain') {
    if (moveType === 'Water') return 1.5;
    if (moveType === 'Fire') return 0.5;
  }
  return 1;
}

/** Get terrain modifier */
function getTerrainModifier(
  terrain: Terrain,
  moveType: string,
  category: string,
  defender: CalcPokemon
): number {
  if (category === 'Status') return 1;
  // Grounded check - Flying types and Levitate are immune
  const isGrounded = !defender.types.includes('Flying') && defender.ability !== 'Levitate';

  switch (terrain) {
    case 'electric':
      if (moveType === 'Electric' && isGrounded) return 1.3;
      break;
    case 'grassy':
      if (moveType === 'Grass' && isGrounded) return 1.3;
      break;
    case 'psychic':
      if (moveType === 'Psychic' && isGrounded) return 1.3;
      break;
    case 'misty':
      if (moveType === 'Dragon' && isGrounded) return 0.5;
      break;
  }
  return 1;
}

/** Get burn modifier */
function getBurnModifier(attacker: CalcPokemon, category: string): number {
  if (attacker.status === 'burned' && category === 'Physical' && attacker.ability !== 'Guts') {
    return 0.5;
  }
  return 1;
}

/** Get screen modifier */
function getScreenModifier(
  category: string,
  field: FieldConditions,
  isMultiTarget: boolean
): number {
  if (field.auroraVeil) return isMultiTarget ? 0.67 : 0.5;
  if (category === 'Physical' && field.reflect) return isMultiTarget ? 0.67 : 0.5;
  if (category === 'Special' && field.lightScreen) return isMultiTarget ? 0.67 : 0.5;
  return 1;
}

/** Get item modifier */
function getItemModifier(attacker: CalcPokemon, category: string): number {
  if (attacker.item === 'Choice Band' && category === 'Physical') return 1.5;
  if (attacker.item === 'Choice Specs' && category === 'Special') return 1.5;
  if (attacker.item === 'Life Orb') return 1.3;
  return 1;
}

/** Get effectiveness label */
function getEffectivenessLabel(multiplier: number): string {
  if (multiplier === 0) return 'no effect';
  if (multiplier === 0.25) return '4x resisted';
  if (multiplier === 0.5) return 'resisted';
  if (multiplier === 1) return 'neutral';
  if (multiplier === 2) return 'super effective';
  if (multiplier === 4) return '4x super effective';
  return `${multiplier}x`;
}

// ---- Core Damage Formula ----------------------------------------------------

/**
 * Core Pokemon damage formula
 * Damage = ((((2 * Level / 5 + 2) * Power * (Atk/Def)) / 50) + 2) * Modifiers
 */
function calculateBaseDamage(
  attacker: CalcPokemon,
  defender: CalcPokemon,
  move: CalcMove,
  field: FieldConditions,
  isMultiTarget: boolean = false,
  useTera: boolean = false
): { damage: number; randomRolls: number[] } {
  if (move.category === 'Status' || move.power === 0) {
    return { damage: 0, randomRolls: [0] };
  }

  const atkStats = getCalcStats(attacker);
  const defStats = getCalcStats(defender);

  const atk = getAttackingStat(atkStats, move.category);
  const def = getDefendingStat(defStats, move.category);

  // Base damage formula
  const base = Math.floor((2 * attacker.level) / 5 + 2);
  const atkDefRatio = atk / def;
  const rawDamage = Math.floor((base * move.power * atkDefRatio) / 50) + 2;

  // STAB
  const stabMult = getStabMultiplier(attacker, move.type, useTera);

  // Type effectiveness
  const effectiveness = getEffectiveness(move.type, defender.types);

  // Weather
  const weatherMult = getWeatherModifier(move.type, field.weather);

  // Terrain
  const terrainMult = getTerrainModifier(field.terrain, move.type, move.category, defender);

  // Burn
  const burnMult = getBurnModifier(attacker, move.category);

  // Screens
  const screenMult = getScreenModifier(move.category, field, isMultiTarget);

  // Item
  const itemMult = getItemModifier(attacker, move.category);

  // Combined modifiers
  const totalModifier = stabMult * effectiveness * weatherMult * terrainMult * burnMult * screenMult * itemMult;

  // Random factor: 0.85 to 1.0 in 16 steps
  const randomRolls = [
    0.85, 0.87, 0.88, 0.89, 0.90, 0.91, 0.92, 0.93,
    0.94, 0.95, 0.96, 0.97, 0.98, 0.99, 0.995, 1.0,
  ];

  const damages = randomRolls.map((roll) => {
    let d = Math.floor(rawDamage * totalModifier * roll);
    // Apply multiscale / shadow shield
    if (field.multiscale && d > 0) {
      d = Math.floor(d / 2);
    }
    // Apply friend guard
    if (field.friendGuard && d > 0) {
      d = Math.floor((d * 3) / 4);
    }
    // Minimum 1 damage unless immune
    if (effectiveness === 0 || weatherMult === 0) return 0;
    return Math.max(1, d);
  });

  return { damage: damages[damages.length - 1], randomRolls: damages };
}

// ---- Public API -------------------------------------------------------------

/**
 * Calculate damage for a move from attacker to defender
 */
export function calculateDamage(
  attacker: CalcPokemon,
  defender: CalcPokemon,
  move: CalcMove,
  field: FieldConditions,
  isMultiTarget: boolean = false,
  useTera: boolean = false
): DamageResult {
  if (move.category === 'Status' || move.power === 0) {
    return {
      minPercent: 0,
      maxPercent: 0,
      minDamage: 0,
      maxDamage: 0,
      koChance: 'N/A (Status move)',
      effectiveness: 1,
      effectivenessLabel: 'neutral',
      isStab: false,
      stabMultiplier: 1,
      isCritical: false,
      critMinPercent: 0,
      critMaxPercent: 0,
      critMinDamage: 0,
      critMaxDamage: 0,
      damageRolls: [0],
    };
  }

  const defStats = getCalcStats(defender);
  const maxHP = defStats.hp;

  // Normal damage
  const { randomRolls } = calculateBaseDamage(attacker, defender, move, field, isMultiTarget, useTera);

  const minDamage = randomRolls[0];
  const maxDamage = randomRolls[randomRolls.length - 1];

  const minPercent = (minDamage / maxHP) * 100;
  const maxPercent = (maxDamage / maxHP) * 100;

  // STAB info
  const stabMult = getStabMultiplier(attacker, move.type, useTera);
  const stabFlag = isStab(attacker, move.type, useTera);

  // Effectiveness
  const effectiveness = getEffectiveness(move.type, defender.types);

  // Critical hit (1.5x damage, ignores stat drops for defender / boosts for attacker)
  const critRolls = randomRolls.map((d) => {
    const critD = Math.floor(d * 1.5);
    return Math.max(1, critD);
  });
  const critMin = critRolls[0];
  const critMax = critRolls[critRolls.length - 1];

  const koChance = getKoChance(maxHP, minDamage, maxDamage);

  return {
    minPercent,
    maxPercent,
    minDamage,
    maxDamage,
    koChance,
    effectiveness,
    effectivenessLabel: getEffectivenessLabel(effectiveness),
    isStab: stabFlag,
    stabMultiplier: stabMult,
    isCritical: false,
    critMinPercent: (critMin / maxHP) * 100,
    critMaxPercent: (critMax / maxHP) * 100,
    critMinDamage: critMin,
    critMaxDamage: critMax,
    damageRolls: randomRolls,
  };
}

/**
 * Get KO chance description
 */
export function getKoChance(maxHP: number, minDamage: number, maxDamage: number): string {
  if (maxDamage <= 0) return 'no damage';

  // OHKO check
  if (minDamage >= maxHP) return 'guaranteed OHKO';
  if (maxDamage >= maxHP) {
    // Count rolls that OHKO
    const ohkoRolls = Math.floor((maxHP / maxDamage) * 16);
    const chance = (ohkoRolls / 16) * 100;
    return `${chance.toFixed(1)}% chance to OHKO`;
  }

  // 2HKO check
  const min2HKO = minDamage * 2;
  const max2HKO = maxDamage * 2;
  if (min2HKO >= maxHP) return 'guaranteed 2HKO';
  if (max2HKO >= maxHP) return 'chance to 2HKO';

  // 3HKO check
  const min3HKO = minDamage * 3;
  const max3HKO = maxDamage * 3;
  if (min3HKO >= maxHP) return 'guaranteed 3HKO';
  if (max3HKO >= maxHP) return 'chance to 3HKO';

  // 4HKO+
  return '4HKO or more';
}

/**
 * Format damage percentage for display
 */
export function formatDamagePercent(percent: number): string {
  return percent.toFixed(1) + '%';
}

/**
 * Get a default CalcPokemon for initialization
 */
export function getDefaultCalcPokemon(): CalcPokemon {
  return {
    name: '',
    level: 50,
    baseStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    nature: 'Hardy',
    ability: '',
    item: '',
    types: ['Normal'],
    status: 'healthy',
  };
}

/**
 * Get default field conditions
 */
export function getDefaultField(): FieldConditions {
  return {
    weather: 'none',
    terrain: 'none',
    reflect: false,
    lightScreen: false,
    auroraVeil: false,
    stealthRock: false,
    multiscale: false,
    friendGuard: false,
  };
}
