const DEFAULT_GEN = 9;

/** Extract a generation number from a Showdown-style format id. */
export function parseFormatGen(format?: string): number {
  if (!format) return DEFAULT_GEN;

  const id = format.toLowerCase().trim();
  if (id.startsWith('champions')) return DEFAULT_GEN;

  const match = id.match(/gen(\d+)/);
  if (match) {
    const generation = Number.parseInt(match[1], 10);
    if (generation >= 1 && generation <= 9) return generation;
  }

  return DEFAULT_GEN;
}

export function isChampionsFormat(format?: string): boolean {
  return (format ?? '').toLowerCase().trim().startsWith('champions');
}

export function isDoublesFormat(format?: string): boolean {
  const id = (format ?? '').toLowerCase();
  return id.includes('vgc') || id.includes('doubles') || isChampionsFormat(id);
}

export function getDefaultLevelForFormat(format?: string): number {
  const id = (format ?? '').toLowerCase();
  return isChampionsFormat(id) || id.includes('vgc') ? 50 : 100;
}
