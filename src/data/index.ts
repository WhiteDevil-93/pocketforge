// ============================================================================
// PocketForge — Data Layer Exports
// ============================================================================

// Pokemon data
export { POKEDEX, getPokemonByName, getPokemonById, searchPokemon, getPokemonByType, getSpriteUrl, getAllPokemonNames } from './pokemonData';

// Moves data
export { MOVES, getMoveByName, searchMoves, getMovesByType, getMovesForPokemon, getAllMoveNames } from './movesData';

// Items data
export { ITEMS, getItemByName, searchItems, getAllItemNames, getItemSpriteUrl } from './itemsData';

// Natures data
export { NATURES, getNatureByName, getNatureModifier, getNatureDescription, getAllNatureNames } from './naturesData';

// Formats data
export { FORMATS, getFormatById, getFormatsByGeneration, getFormatsGrouped, getAllFormatIds, getAllFormatNames, getCombinedFormats, DEFAULT_FORMAT, formatSupportsTera, formatSupportsMega, formatSupportsDynamax, formatSupportsZMoves } from './formatsData';

// Champions M-A roster
export { CHAMPIONS_MA_ROSTER, isEligibleForChampionsMA } from './championsRoster';

// Mega Evolution data
export { MEGA_DATA, getMegaByStone, getMegaByBase, isMegaStone, getAllMegaStones } from './megaData';

// Types data
export { TYPE_NAMES, TYPE_CHART, getEffectiveness, getAllTypes, getTypeColor } from './typesData';
