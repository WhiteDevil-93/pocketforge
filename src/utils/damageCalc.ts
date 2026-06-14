// ============================================================================
// PocketForge — Damage Calculation Engine using @smogon/calc
// ============================================================================

import { calculate, Pokemon as SmogonPokemon, Move as SmogonMove, Field, Generations } from '@smogon/calc';
import { getEffectiveness } from '../data/typesData';

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
  description: string;
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

// ---- Status Mapping ----
function mapStatus(status: StatusCondition): any {
  switch (status) {
    case 'burned': return 'brn';
    case 'paralyzed': return 'par';
    case 'asleep': return 'slp';
    case 'frozen': return 'frz';
    case 'poisoned': return 'psn';
    case 'badly-poisoned': return 'tox';
    default: return undefined;
  }
}

// ---- Weather Mapping ----
function mapWeather(weather: Weather): any {
  switch (weather) {
    case 'sun':
    case 'harsh-sun':
      return 'Sun';
    case 'rain':
    case 'heavy-rain':
      return 'Rain';
    case 'sand':
      return 'Sand';
    case 'snow':
      return 'Snow';
    default:
      return undefined;
  }
}

// ---- Terrain Mapping ----
function mapTerrain(terrain: Terrain): any {
  switch (terrain) {
    case 'electric': return 'Electric';
    case 'grassy': return 'Grassy';
    case 'psychic': return 'Psychic';
    case 'misty': return 'Misty';
    default: return undefined;
  }
}

// ---- Effectiveness Label ----
function getEffectivenessLabel(multiplier: number): string {
  if (multiplier === 0) return 'no effect';
  if (multiplier === 0.25) return '4x resisted';
  if (multiplier === 0.5) return 'resisted';
  if (multiplier === 1) return 'neutral';
  if (multiplier === 2) return 'super effective';
  if (multiplier === 4) return '4x super effective';
  return `${multiplier}x`;
}

// ---- Normalizing Damage Rolls ----
function normalizeDamageRolls(damage: any): number[] {
  if (typeof damage === 'number') {
    return [damage];
  }
  if (Array.isArray(damage)) {
    if (damage.length === 0) return [0];
    if (Array.isArray(damage[0])) {
      // For multi-hit/2D arrays, flatten to a 1D array of numbers
      return (damage as any[]).flat().filter((x) => typeof x === 'number');
    }
    return damage as number[];
  }
  return [0];
}

// ---- Public API -------------------------------------------------------------

/**
 * Calculate damage for a move from attacker to defender.
 */
export function calculateDamage(
  attacker: CalcPokemon,
  defender: CalcPokemon,
  move: CalcMove,
  fieldConditions: FieldConditions,
  isMultiTarget: boolean = false,
  useTera: boolean = false,
  genNum: number = 9
): DamageResult {
  // If the move category is status or power is 0, it does 0 damage
  if (move.category === 'Status' || move.power === 0) {
    return {
      minPercent: 0,
      maxPercent: 0,
      minDamage: 0,
      maxDamage: 0,
      koChance: 'N/A (Status move)',
      description: 'Status move',
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

  const gen = Generations.get(genNum as any);

  // 1. Build @smogon/calc Pokemon
  const calcAttacker = new SmogonPokemon(gen, attacker.name || 'Gengar', {
    level: attacker.level || 50,
    nature: attacker.nature || 'Hardy',
    evs: attacker.evs,
    ivs: attacker.ivs,
    ability: attacker.ability || undefined,
    item: attacker.item || undefined,
    status: mapStatus(attacker.status),
    teraType: useTera ? (attacker.teraType as any) || undefined : undefined,
  });

  const calcDefender = new SmogonPokemon(gen, defender.name || 'Chansey', {
    level: defender.level || 50,
    nature: defender.nature || 'Hardy',
    evs: defender.evs,
    ivs: defender.ivs,
    ability: defender.ability || undefined,
    item: defender.item || undefined,
    status: mapStatus(defender.status),
    teraType: (defender.teraType as any) || undefined, // always check defender's base tera if set
  });

  // 2. Build @smogon/calc Move
  const calcMoveNormal = new SmogonMove(gen, move.name, {
    useMax: false,
    isCrit: false,
  });
  
  const calcMoveCrit = new SmogonMove(gen, move.name, {
    useMax: false,
    isCrit: true,
  });

  // 3. Build @smogon/calc Field
  const calcField = new Field({
    weather: mapWeather(fieldConditions.weather),
    terrain: mapTerrain(fieldConditions.terrain),
    gameType: isMultiTarget ? 'Doubles' : 'Singles',
    defenderSide: {
      isReflect: fieldConditions.reflect,
      isLightScreen: fieldConditions.lightScreen,
      isAuroraVeil: fieldConditions.auroraVeil,
      isSR: fieldConditions.stealthRock,
      isFriendGuard: fieldConditions.friendGuard,
    },
  });

  // Apply Multiscale override if manually checked
  if (fieldConditions.multiscale && calcDefender.ability !== 'Multiscale') {
    calcDefender.ability = 'Multiscale' as any;
  }

  // 4. Calculate
  let normalResult;
  let critResult;
  try {
    normalResult = calculate(gen, calcAttacker, calcDefender, calcMoveNormal, calcField);
    critResult = calculate(gen, calcAttacker, calcDefender, calcMoveCrit, calcField);
  } catch (err) {
    console.error('Damage calculation engine threw an error:', err);
    // Return empty results
    return {
      minPercent: 0,
      maxPercent: 0,
      minDamage: 0,
      maxDamage: 0,
      koChance: 'Calculation error',
      description: 'Calculation error',
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

  // 5. Map results
  const defenderHP = calcDefender.stats.hp;
  const normalRolls = normalizeDamageRolls(normalResult.damage);
  const critRolls = normalizeDamageRolls(critResult.damage);

  const minDamage = normalRolls[0] || 0;
  const maxDamage = normalRolls[normalRolls.length - 1] || 0;
  const minPercent = defenderHP > 0 ? (minDamage / defenderHP) * 100 : 0;
  const maxPercent = defenderHP > 0 ? (maxDamage / defenderHP) * 100 : 0;

  const critMinDamage = critRolls[0] || 0;
  const critMaxDamage = critRolls[critRolls.length - 1] || 0;
  const critMinPercent = defenderHP > 0 ? (critMinDamage / defenderHP) * 100 : 0;
  const critMaxPercent = defenderHP > 0 ? (critMaxDamage / defenderHP) * 100 : 0;

  // Safe description parsing
  let koChance = 'no guaranteed KO';
  let description = '';
  try {
    const descText = normalResult.desc();
    description = descText;
    const parts = descText.split('--');
    koChance = parts.length > 1 ? parts[1].trim() : 'no guaranteed KO';
  } catch (err) {
    if (maxDamage === 0) {
      koChance = 'no effect (immune)';
      description = '0 damage (immune)';
    }
  }

  // STAB details
  const attackerTypes = calcAttacker.types;
  const moveType = calcMoveNormal.type;
  const isStab = attackerTypes.includes(moveType);
  const stabMultiplier = isStab ? (calcAttacker.ability === 'Adaptability' ? 2 : 1.5) : 1;

  // Effectiveness details
  const effectiveness = getEffectiveness(moveType, calcDefender.types);

  return {
    minPercent,
    maxPercent,
    minDamage,
    maxDamage,
    koChance,
    description,
    effectiveness,
    effectivenessLabel: getEffectivenessLabel(effectiveness),
    isStab,
    stabMultiplier,
    isCritical: false,
    critMinPercent,
    critMaxPercent,
    critMinDamage,
    critMaxDamage,
    damageRolls: normalRolls,
  };
}

/**
 * Get KO chance description (kept for backward compatibility, though calculated in normalResult.desc())
 */
export function getKoChance(maxHP: number, minDamage: number, maxDamage: number): string {
  if (maxDamage <= 0) return 'no damage';
  if (minDamage >= maxHP) return 'guaranteed OHKO';
  if (maxDamage >= maxHP) return 'chance to OHKO';
  if (minDamage * 2 >= maxHP) return 'guaranteed 2HKO';
  if (maxDamage * 2 >= maxHP) return 'chance to 2HKO';
  if (minDamage * 3 >= maxHP) return 'guaranteed 3HKO';
  if (maxDamage * 3 >= maxHP) return 'chance to 3HKO';
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
