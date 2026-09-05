import { SPRITE_ID_OVERRIDES } from './spriteIds';

/**
 * Key used to look a name up in [SPRITE_ID_OVERRIDES]: alphanumerics only, so a
 * caller passing the display name ("Charizard-Mega-X") and one passing the species
 * id ("charizardmegax") land on the same entry.
 *
 * The NFD pass is load-bearing, not decoration. Stripping non-alphanumerics removes
 * a combining accent (U+0301) but not a precomposed letter (é, U+00E9), so the two
 * Unicode spellings of one name reduce differently: "Flabébé" gives flabebe
 * decomposed and flabb precomposed. Names from outside our own data — a pasted
 * import, a custom format's entry, whatever the model wrote — arrive precomposed.
 */
function toLookupId(name: string): string {
  return name.normalize('NFD').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Filename guess for a species the override table has never heard of.
 *
 * Keeps hyphens, unlike [toLookupId]. That matters because Showdown's forme
 * filenames contain them (charizard-megax), so for a species released after this
 * app's bundled pokedex was generated — the only way to reach this path — the
 * hyphenated guess is the one with a chance of resolving. Collapsing to
 * alphanumerics would turn an externally supplied "Base-Form" into baseform.png
 * and show a placeholder for a sprite that exists.
 */
function toFallbackId(name: string): string {
  return name
    .normalize('NFD')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9-]/g, '');
}

/** Return the public Pokémon Showdown sprite URL for a species name or id. */
export function getSpriteUrl(name: string, animated = false): string {
  const trimmed = name.trim();
  // The override table holds only the 51 names normalisation alone gets wrong; for
  // everything else the hyphen-preserving fallback already produces the right
  // filename. See the generator's buildSpriteIdOverrides for why the table is not
  // simply "every forme".
  const spriteId = SPRITE_ID_OVERRIDES[toLookupId(trimmed)] ?? toFallbackId(trimmed);

  const collection = animated ? 'ani' : 'gen5';
  const extension = animated ? 'gif' : 'png';
  return `https://play.pokemonshowdown.com/sprites/${collection}/${spriteId}.${extension}`;
}
