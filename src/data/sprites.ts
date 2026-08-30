import { POKEDEX } from './pokemonData';

/** Showdown's own id normalisation — lowercase, alphanumerics only. */
function toShowdownId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Species id -> sprite filename. Keyed by the species id rather than the display
 * name so a caller can pass either ("Charizard-Mega-X" and "charizardmegax" both
 * normalise to the same key).
 *
 * This lookup exists because the filename is NOT derivable from the name: a forme
 * hyphenates onto its base species (charizard-megax) while a base species whose
 * own name contains a hyphen or space collapses (Ho-Oh -> hooh, Tapu Koko ->
 * tapukoko). Deriving it either way 404s on the other case — 366 of 1380 species
 * before this map existed. pokemonData.ts's spriteId carries Showdown's
 * baseSpecies/forme split, which is the only thing that gets both right.
 */
const SPRITE_ID_BY_SPECIES_ID = new Map(POKEDEX.map((p) => [p.sprite, p.spriteId]));

/** Return the public Pokémon Showdown sprite URL for a species name or id. */
export function getSpriteUrl(name: string, animated = false): string {
  const speciesId = toShowdownId(name.trim());
  // Unknown species (a custom format's made-up entry, a typo from an import) fall
  // back to the id itself — the same guess as before, and PokemonSprite renders its
  // placeholder when that 404s.
  const spriteId = SPRITE_ID_BY_SPECIES_ID.get(speciesId) ?? speciesId;

  const collection = animated ? 'ani' : 'gen5';
  const extension = animated ? 'gif' : 'png';
  return `https://play.pokemonshowdown.com/sprites/${collection}/${spriteId}.${extension}`;
}
