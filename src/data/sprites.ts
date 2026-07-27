/** Return the public Pokémon Showdown sprite URL for a species name. */
export function getSpriteUrl(name: string, animated = false): string {
  const normalized = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9-]/g, '');

  const collection = animated ? 'ani' : 'gen5';
  const extension = animated ? 'gif' : 'png';
  return `https://play.pokemonshowdown.com/sprites/${collection}/${normalized}.${extension}`;
}
