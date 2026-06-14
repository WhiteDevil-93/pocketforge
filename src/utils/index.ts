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
} from './psFormat';

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
