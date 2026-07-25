// ============================================================================
// PocketForge — EV Bulk & Speed Optimizer Utilities using @smogon/calc
// ============================================================================

import { Pokemon as SmogonPokemon, Move as SmogonMove, calculate, Field, Generations } from '@smogon/calc';
import type { Pokemon } from '../types';

export interface SpeedTarget {
  targetSpeed: number;
  nature: string;
  isScarf?: boolean;
}

export interface EVOptimizationResult {
  stat: 'spe' | 'hp' | 'def' | 'spd';
  evsNeeded: number;
  description: string;
  success: boolean;
}

/**
 * Calculate minimum Speed EVs needed to outspeed a given target speed.
 */
export function calculateMinSpeedEVs(
  pokemon: Pokemon,
  targetSpeed: number,
  genNum: number = 9
): EVOptimizationResult {
  const gen = Generations.get(genNum as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9);
  const species = (pokemon.species || 'Gengar').toLowerCase().replace(/[^a-z0-9]/g, '');

  for (let spe = 0; spe <= 252; spe += 4) {
    const calcMon = new SmogonPokemon(gen, species as never, {
      level: pokemon.level || 50,
      nature: pokemon.nature || 'Serious',
      evs: { spe },
      ivs: { spe: pokemon.ivs.spe },
      item: pokemon.item || undefined,
      ability: pokemon.ability || undefined,
    });

    if (calcMon.stats.spe > targetSpeed) {
      return {
        stat: 'spe',
        evsNeeded: spe,
        description: `Requires ${spe} Spe EVs to reach ${calcMon.stats.spe} Speed (outspeeds ${targetSpeed}).`,
        success: true,
      };
    }
  }

  return {
    stat: 'spe',
    evsNeeded: 252,
    description: `Cannot outspeed target ${targetSpeed} even with 252 Spe EVs.`,
    success: false,
  };
}

/**
 * Calculate minimum HP or Defensive EVs needed to survive a hit from an attacker move.
 */
export function calculateMinBulkEVs(
  attackerName: string,
  attackerMove: string,
  defender: Pokemon,
  genNum: number = 9
): EVOptimizationResult {
  const gen = Generations.get(genNum as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9);
  const defenderSpecies = (defender.species || 'Gengar').toLowerCase().replace(/[^a-z0-9]/g, '');
  const attackerSpecies = (attackerName || 'Gengar').toLowerCase().replace(/[^a-z0-9]/g, '');

  const calcAttacker = new SmogonPokemon(gen, attackerSpecies as never, {
    level: 50,
    nature: 'Hardy',
    evs: { atk: 252, spa: 252 },
  });

  const calcMove = new SmogonMove(gen, attackerMove);
  const calcField = new Field();

  for (let ev = 0; ev <= 252; ev += 4) {
    const calcDefender = new SmogonPokemon(gen, defenderSpecies as never, {
      level: defender.level || 50,
      nature: defender.nature || 'Serious',
      evs: { hp: ev, def: ev, spd: ev },
      ivs: defender.ivs,
      ability: defender.ability || undefined,
      item: defender.item || undefined,
    });

    const result = calculate(gen, calcAttacker, calcDefender, calcMove, calcField);
    const maxDamage = Array.isArray(result.damage)
      ? typeof result.damage[0] === 'number'
        ? (result.damage as number[])[result.damage.length - 1]
        : 0
      : (result.damage as number);

    if (maxDamage < calcDefender.stats.hp) {
      return {
        stat: 'hp',
        evsNeeded: ev,
        description: `Requires ${ev} HP/Def EVs to survive ${attackerMove} from ${attackerName} (Max ${maxDamage}/${calcDefender.stats.hp} HP).`,
        success: true,
      };
    }
  }

  return {
    stat: 'hp',
    evsNeeded: 252,
    description: `Cannot guarantee survival against ${attackerMove} from ${attackerName} even with 252 EVs.`,
    success: false,
  };
}
