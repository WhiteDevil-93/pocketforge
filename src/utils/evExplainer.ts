// ============================================================================
// PocketForge — EV Spread Explanations
// ============================================================================

import type { Pokemon } from '../types';
import { calculateStat, getNatureMultiplier } from './statCalc';
import { getPokemonByName } from '../data/pokemonData';

export type EVRole =
  | 'Physical Attacker'
  | 'Special Attacker'
  | 'Mixed Attacker'
  | 'Physical Wall'
  | 'Special Wall'
  | 'Mixed Wall'
  | 'Fast Support'
  | 'Bulky Support'
  | 'Balanced';

export interface EVExplanation {
  summary: string;
  role: EVRole;
  investments: string[];
  speedTier?: string;
  bulkNote?: string;
  offenseNote?: string;
}

const STAT_LABELS: Record<keyof Pokemon['evs'], string> = {
  hp: 'HP',
  atk: 'Atk',
  def: 'Def',
  spa: 'SpA',
  spd: 'SpD',
  spe: 'Spe',
};

const HEAVY = 200; // EVs threshold for "heavy" investment
const NOTABLE = 100; // EVs threshold for "notable" investment

function classifyRole(
  pokemon: Pokemon,
  natureBoostStat: string | null
): EVRole {
  const { evs } = pokemon;
  const atkHeavy = evs.atk >= HEAVY;
  const spaHeavy = evs.spa >= HEAVY;
  const speHeavy = evs.spe >= HEAVY;
  const hpHeavy = evs.hp >= HEAVY;
  const defHeavy = evs.def >= HEAVY;
  const spdHeavy = evs.spd >= HEAVY;

  const offensiveBoost =
    natureBoostStat === 'atk' ||
    natureBoostStat === 'spa' ||
    natureBoostStat === 'spe';

  // Mixed attacker: both offensive stats are heavily invested
  if (atkHeavy && spaHeavy) return 'Mixed Attacker';

  // Pure offensive setups
  if (atkHeavy && (speHeavy || offensiveBoost)) return 'Physical Attacker';
  if (spaHeavy && (speHeavy || offensiveBoost)) return 'Special Attacker';
  if (atkHeavy) return 'Physical Attacker';
  if (spaHeavy) return 'Special Attacker';

  // Walls — heavy HP plus defensive investment
  if (hpHeavy && defHeavy && spdHeavy) return 'Mixed Wall';
  if (hpHeavy && defHeavy) return 'Physical Wall';
  if (hpHeavy && spdHeavy) return 'Special Wall';

  // Support archetypes
  if (speHeavy && hpHeavy) return 'Fast Support';
  if (hpHeavy) return 'Bulky Support';
  if (speHeavy) return 'Fast Support';

  return 'Balanced';
}

function buildInvestments(evs: Pokemon['evs']): string[] {
  const entries = (Object.keys(STAT_LABELS) as (keyof Pokemon['evs'])[])
    .map((k) => ({ key: k, label: STAT_LABELS[k], value: evs[k] }))
    .filter((e) => e.value > 0)
    .sort((a, b) => b.value - a.value);
  return entries.map((e) => `${e.value} ${e.label}`);
}

function buildSummary(role: EVRole, investments: string[]): string {
  const topStats = investments
    .slice(0, 2)
    .map((s) => s.split(' ').slice(1).join(' '))
    .join(' and ');

  switch (role) {
    case 'Physical Attacker':
      return topStats
        ? `Physical attacker investing in ${topStats}`
        : 'Physical attacker';
    case 'Special Attacker':
      return topStats
        ? `Special attacker investing in ${topStats}`
        : 'Special attacker';
    case 'Mixed Attacker':
      return 'Mixed attacker splitting EVs between Atk and SpA';
    case 'Physical Wall':
      return 'Bulky physical wall investing in HP and Defense';
    case 'Special Wall':
      return 'Bulky special wall investing in HP and Special Defense';
    case 'Mixed Wall':
      return 'Mixed wall with investment in HP, Defense, and Special Defense';
    case 'Fast Support':
      return topStats
        ? `Fast support build leaning into ${topStats}`
        : 'Fast support build';
    case 'Bulky Support':
      return topStats
        ? `Bulky support build leaning into ${topStats}`
        : 'Bulky support build';
    case 'Balanced':
    default:
      return investments.length === 0
        ? 'No EV investment — neutral spread'
        : `Balanced spread across ${topStats || 'multiple stats'}`;
  }
}

function buildBulkNote(pokemon: Pokemon): string | undefined {
  const { evs } = pokemon;
  if (evs.hp >= NOTABLE && evs.def >= NOTABLE && evs.spd >= NOTABLE) {
    return 'Heavily invested in HP, Defense, and Special Defense for all-around bulk.';
  }
  if (evs.hp >= NOTABLE && evs.def >= NOTABLE) {
    return 'Combined HP + Def investment maximizes physical bulk.';
  }
  if (evs.hp >= NOTABLE && evs.spd >= NOTABLE) {
    return 'Combined HP + SpD investment maximizes special bulk.';
  }
  return undefined;
}

function buildOffenseNote(
  pokemon: Pokemon,
  natureBoostStat: string | null,
  natureDropStat: string | null
): string | undefined {
  const { evs, nature } = pokemon;
  const boostsAtk = natureBoostStat === 'atk' && evs.atk > 0;
  const boostsSpa = natureBoostStat === 'spa' && evs.spa > 0;
  const boostsSpe = natureBoostStat === 'spe' && evs.spe > 0;

  if (boostsAtk) {
    return `${nature} nature applies a 1.1x boost to Attack.`;
  }
  if (boostsSpa) {
    return `${nature} nature applies a 1.1x boost to Special Attack.`;
  }
  if (boostsSpe) {
    const drop = natureDropStat
      ? ` (drops ${STAT_LABELS[natureDropStat as keyof Pokemon['evs']] ?? natureDropStat})`
      : '';
    return `${nature} nature applies a 1.1x boost to Speed${drop}.`;
  }
  return undefined;
}

function detectNatureStats(
  nature: string
): { boost: string | null; drop: string | null } {
  const stats: (keyof Pokemon['evs'])[] = ['atk', 'def', 'spa', 'spd', 'spe'];
  let boost: string | null = null;
  let drop: string | null = null;
  for (const s of stats) {
    const m = getNatureMultiplier(nature, s);
    if (m > 1) boost = s;
    else if (m < 1) drop = s;
  }
  return { boost, drop };
}

export function explainEVSpread(pokemon: Pokemon): EVExplanation {
  const { boost, drop } = detectNatureStats(pokemon.nature);
  const role = classifyRole(pokemon, boost);
  const investments = buildInvestments(pokemon.evs);
  const summary = buildSummary(role, investments);
  const bulkNote = buildBulkNote(pokemon);
  const offenseNote = buildOffenseNote(pokemon, boost, drop);

  let speedTier: string | undefined;
  if (pokemon.evs.spe > 0) {
    const dex = getPokemonByName(pokemon.species);
    if (dex) {
      const finalSpeed = calculateStat(
        dex.baseStats.spe,
        pokemon.evs.spe,
        pokemon.ivs.spe,
        pokemon.level,
        pokemon.nature,
        'spe'
      );
      speedTier = `Reaches ${finalSpeed} Speed at Lv. ${pokemon.level}`;
    }
  }

  return {
    summary,
    role,
    investments,
    speedTier,
    bulkNote,
    offenseNote,
  };
}
