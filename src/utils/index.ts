// ============================================================================
// PocketForge — Utility Functions Exports
// ============================================================================

export {
  calculateStat,
  calculateHP,
  getNatureMultiplier,
  getTotalEVs,
  getRemainingEVs,
  isValidEVSpread,
  calculateAllStats,
  getStatColorClass,
  getStatAbbreviation,
} from './statCalc';

export {
  exportTeamToPSFormat,
  importTeamFromPSFormat,
  exportPokemonToPSFormat,
  importPokemonFromPSFormat,
  validateShowdownFormat,
} from './psFormat';

export {
  calculateSpeed,
  rankTeamBySpeed,
  outspeeds,
  getSpeedTiersForFormat,
  COMMON_SPEED_BENCHMARKS,
} from './speedCalculator';
export type { SpeedModifiers, PokemonWithSpeed, SpeedTier } from './speedCalculator';

export {
  getMovepoolForSpecies,
  filterMovepool,
  getPokedexEntry,
} from './movepoolQuery';
export type { AcquisitionMethod, AnnotatedMove } from './movepoolQuery';

export {
  validateTeam,
  isTeamValid,
} from './validation';

export {
  getMoveCoverage,
  getTeamDefensiveCoverage,
  getTeamOffensiveCoverage,
  getCoverageGaps,
  getTeamBalanceScore,
} from './typeChart';

export {
  calculateDamage,
  getKoChance,
  formatDamagePercent,
  getDefaultCalcPokemon,
  getDefaultField,
} from './damageCalc';
