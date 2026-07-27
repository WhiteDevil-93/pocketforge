// ============================================================================
// PocketForge — Data Layer Exports
// ============================================================================

// Pokemon data
export { POKEDEX, getPokemonByName, getPokemonById, searchPokemon, getPokemonByType, getAllPokemonNames } from './pokemonData';
export { getSpriteUrl } from './sprites';

// Moves data
export { MOVES, getMoveByName, searchMoves, getMovesByType, getMovesForPokemon, getAllMoveNames } from './movesData';

// Items data
export { ITEMS, getItemByName, searchItems, getAllItemNames, getItemSpriteUrl } from './itemsData';

// Natures data
export { NATURES, getNatureByName, getNatureModifier, getNatureDescription, getAllNatureNames } from './naturesData';

// Formats data
export { FORMATS, getFormatById, getFormatsByGeneration, getFormatsGrouped, getAllFormatIds, getAllFormatNames, getCombinedFormats, DEFAULT_FORMAT, formatSupportsTera, formatSupportsMega, formatSupportsDynamax, formatSupportsZMoves, formatRequiresLevel50 } from './formatsData';

// Champions regulation data (auto-updated from Showdown champions mod)
export { CHAMPIONS_MA_ROSTER, CHAMPIONS_MB_ROSTER, CHAMPIONS_ROSTER } from './championsRoster';
export {
  CHAMPIONS_META,
  isEligibleForChampions,
  isEligibleForChampionsMA,
  isEligibleForChampionsMB,
  isEligibleForChampionsFormat,
  isChampionsItemLegal,
  isChampionsMoveLegal,
  getChampionsMovesForSpecies,
  isMoveLegalForChampionsSpecies,
  isChampionsFormatId,
  normalizeSlug,
} from './championsLegality';

// Current Pokémon Champions ranked battle data
export {
  CHAMPIONS_USAGE_META,
  CHAMPIONS_USAGE_RANKINGS,
  CHAMPIONS_USAGE_TOP_20,
  getChampionsUsageRank,
} from './championsUsageRankings';
export {
  CHAMPIONS_USAGE_DETAILS_META,
  getChampionsUsageData,
} from './championsUsageDetails';

// Mega Evolution data
export { MEGA_DATA, getMegaByStone, getMegaByBase, isMegaStone, getAllMegaStones } from './megaData';

// Types data
export { TYPE_NAMES, getEffectiveness, getAllTypes, getTypeColor } from './typesData';
