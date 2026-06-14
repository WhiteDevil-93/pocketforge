// ============================================================================
// PocketForge — Format Definitions
// ============================================================================
// Updated June 2026 — includes Pokemon Champions Regulation M-A
// Source: https://bulbapedia.bulbagarden.net/wiki/Regulation_Set_M-A
// ============================================================================

import type { Format, CustomFormat } from '../types';

export const FORMATS: Format[] = [
  // Pokemon Champions — Current (as of June 2026)
  {
    id: "champions-ma",
    name: "Pokemon Champions Regulation M-A",
    generation: 10,
    rules: ["species-clause", "item-clause", "mega-once", "restricted-dex", "sleep-clause-mod", "ohko-clause", "evasion-clause"]
  },

  // Generation 9 (Scarlet/Violet)
  { id: "gen9ou", name: "Gen 9 OU", generation: 9, rules: ["species-clause", "sleep-clause-mod", "ohko-clause", "evasion-clause", "endless-battle-clause", "tera-allow"] },
  { id: "gen9uu", name: "Gen 9 UU", generation: 9, rules: ["species-clause", "sleep-clause-mod", "ohko-clause", "evasion-clause", "endless-battle-clause", "tera-allow"] },
  { id: "gen9ru", name: "Gen 9 RU", generation: 9, rules: ["species-clause", "sleep-clause-mod", "ohko-clause", "evasion-clause", "endless-battle-clause", "tera-allow"] },
  { id: "gen9nu", name: "Gen 9 NU", generation: 9, rules: ["species-clause", "sleep-clause-mod", "ohko-clause", "evasion-clause", "endless-battle-clause", "tera-allow"] },
  { id: "gen9pu", name: "Gen 9 PU", generation: 9, rules: ["species-clause", "sleep-clause-mod", "ohko-clause", "evasion-clause", "endless-battle-clause", "tera-allow"] },
  { id: "gen9ubers", name: "Gen 9 Ubers", generation: 9, rules: ["sleep-clause-mod", "ohko-clause", "evasion-clause", "endless-battle-clause", "tera-allow"] },
  { id: "gen9ubersuu", name: "Gen 9 Ubers UU", generation: 9, rules: ["sleep-clause-mod", "ohko-clause", "evasion-clause", "endless-battle-clause", "tera-allow"] },
  { id: "gen9ag", name: "Gen 9 Anything Goes", generation: 9, rules: ["tera-allow"] },
  { id: "gen9nationaldex", name: "Gen 9 National Dex", generation: 9, rules: ["species-clause", "sleep-clause-mod", "ohko-clause", "evasion-clause", "endless-battle-clause", "tera-allow", "mega-allow", "z-move-ban"] },
  { id: "gen9nationaldexag", name: "Gen 9 National Dex AG", generation: 9, rules: ["tera-allow", "mega-allow"] },
  { id: "gen9vgc-regi", name: "Gen 9 VGC Regulation I", generation: 9, rules: ["species-clause", "item-clause", "sleep-clause-mod", "tera-allow", "evasion-clause"] },
  { id: "gen9vgc-regh", name: "Gen 9 VGC Regulation H", generation: 9, rules: ["species-clause", "item-clause", "sleep-clause-mod", "tera-allow", "evasion-clause"] },
  { id: "gen9bss", name: "Gen 9 Battle Stadium", generation: 9, rules: ["species-clause", "item-clause", "sleep-clause-mod", "tera-allow", "evasion-clause"] },
  { id: "gen9doublesou", name: "Gen 9 Doubles OU", generation: 9, rules: ["species-clause", "sleep-clause-mod", "ohko-clause", "evasion-clause", "endless-battle-clause", "tera-allow"] },
  { id: "gen9monotype", name: "Gen 9 Monotype", generation: 9, rules: ["species-clause", "sleep-clause-mod", "ohko-clause", "evasion-clause", "endless-battle-clause", "tera-allow"] },
  { id: "gen91v1", name: "Gen 9 1v1", generation: 9, rules: ["ohko-clause", "evasion-clause", "endless-battle-clause", "tera-allow"] },
  { id: "gen9lc", name: "Gen 9 LC (Little Cup)", generation: 9, rules: ["species-clause", "sleep-clause-mod", "ohko-clause", "evasion-clause", "endless-battle-clause", "level-5", "tera-allow"] },
  { id: "gen9camomons", name: "Gen 9 Camomons", generation: 9, rules: ["species-clause", "sleep-clause-mod", "ohko-clause", "evasion-clause", "endless-battle-clause", "tera-allow", "camo-ability"] },
  { id: "gen9sharedpower", name: "Gen 9 Shared Power", generation: 9, rules: ["species-clause", "sleep-clause-mod", "ohko-clause", "evasion-clause", "endless-battle-clause", "shared-power", "tera-allow"] },
  { id: "gen9balancedhackmons", name: "Gen 9 Balanced Hackmons", generation: 9, rules: ["tera-allow", "evasion-clause"] },
  { id: "gen9almostanyability", name: "Gen 9 Almost Any Ability", generation: 9, rules: ["species-clause", "ohko-clause", "evasion-clause", "endless-battle-clause", "tera-allow"] },
  { id: "gen9stabmons", name: "Gen 9 STABmons", generation: 9, rules: ["species-clause", "sleep-clause-mod", "ohko-clause", "evasion-clause", "endless-battle-clause", "tera-allow"] },
  { id: "gen9randombattle", name: "Gen 9 Random Battle", generation: 9, rules: ["tera-allow"] },
  { id: "gen9unratedrandombattle", name: "Gen 9 Unrated Random Battle", generation: 9, rules: ["tera-allow"] },
  // Generation 8 (Sword/Shield)
  { id: "gen8ou", name: "Gen 8 OU", generation: 8, rules: ["species-clause", "sleep-clause", "ohko-clause", "evasion-clause", "endless-battle-clause", "dynamax-clause"] },
  { id: "gen8ubers", name: "Gen 8 Ubers", generation: 8, rules: ["sleep-clause", "ohko-clause", "evasion-clause", "endless-battle-clause", "dynamax-clause"] },
  { id: "gen8uu", name: "Gen 8 UU", generation: 8, rules: ["species-clause", "sleep-clause", "ohko-clause", "evasion-clause", "endless-battle-clause", "dynamax-clause"] },
  { id: "gen8vgc", name: "Gen 8 VGC 2022", generation: 8, rules: ["species-clause", "item-clause", "sleep-clause", "evasion-clause", "dynamax-clause"] },
  // Generation 7 (Sun/Moon)
  { id: "gen7ou", name: "Gen 7 OU", generation: 7, rules: ["species-clause", "sleep-clause", "ohko-clause", "evasion-clause", "endless-battle-clause", "mega-allow", "z-move-ban"] },
  { id: "gen7ubers", name: "Gen 7 Ubers", generation: 7, rules: ["sleep-clause", "ohko-clause", "evasion-clause", "endless-battle-clause", "mega-allow", "z-move-ban"] },
  { id: "gen7vgc", name: "Gen 7 VGC 2019", generation: 7, rules: ["species-clause", "item-clause", "sleep-clause", "evasion-clause", "mega-allow"] },
  // Generation 6 (X/Y)
  { id: "gen6ou", name: "Gen 6 OU", generation: 6, rules: ["species-clause", "sleep-clause", "ohko-clause", "evasion-clause", "endless-battle-clause", "mega-allow"] },
  { id: "gen6ubers", name: "Gen 6 Ubers", generation: 6, rules: ["sleep-clause", "ohko-clause", "evasion-clause", "endless-battle-clause", "mega-allow"] },
  // Generation 5 (Black/White)
  { id: "gen5ou", name: "Gen 5 OU", generation: 5, rules: ["species-clause", "sleep-clause", "ohko-clause", "evasion-clause", "endless-battle-clause"] },
  { id: "gen5ubers", name: "Gen 5 Ubers", generation: 5, rules: ["ohko-clause", "evasion-clause", "endless-battle-clause"] },
  // Generation 4 (Diamond/Pearl)
  { id: "gen4ou", name: "Gen 4 OU", generation: 4, rules: ["species-clause", "sleep-clause", "ohko-clause", "evasion-clause", "endless-battle-clause"] },
  { id: "gen4ubers", name: "Gen 4 Ubers", generation: 4, rules: ["sleep-clause", "ohko-clause", "evasion-clause", "endless-battle-clause"] },
  // Generation 3 (Ruby/Sapphire)
  { id: "gen3ou", name: "Gen 3 OU", generation: 3, rules: ["species-clause", "sleep-clause", "ohko-clause", "evasion-clause", "endless-battle-clause"] },
  // Generation 2 (Gold/Silver)
  { id: "gen2ou", name: "Gen 2 OU", generation: 2, rules: ["species-clause", "sleep-clause", "ohko-clause", "evasion-clause", "endless-battle-clause"] },
  // Generation 1 (Red/Blue)
  { id: "gen1ou", name: "Gen 1 OU", generation: 1, rules: ["species-clause", "sleep-clause", "ohko-clause", "evasion-clause", "endless-battle-clause"] },
];

/** Convert CustomFormat to Format */
function customToFormat(cf: CustomFormat): Format {
  return {
    id: cf.id,
    name: cf.name,
    generation: cf.generation || 9,
    rules: cf.rules,
    restrictedPokemon: cf.restrictedDex,
  };
}

/** Combine built-in + custom formats */
export function getCombinedFormats(customFormats: CustomFormat[] = []): Format[] {
  return [...FORMATS, ...customFormats.map(customToFormat)];
}

/** Get format by ID (includes custom formats) */
export function getFormatById(id: string, customFormats?: CustomFormat[]): Format | undefined {
  return getCombinedFormats(customFormats).find(f => f.id === id.toLowerCase().trim());
}

/** Get formats by generation (includes custom formats) */
export function getFormatsByGeneration(gen: number, customFormats?: CustomFormat[]): Format[] {
  return getCombinedFormats(customFormats).filter(f => f.generation === gen);
}

/** Get all format names grouped by generation (includes custom formats) */
export function getFormatsGrouped(customFormats?: CustomFormat[]): Record<string, Format[]> {
  const all = getCombinedFormats(customFormats);
  const grouped: Record<string, Format[]> = {};
  // Custom section first
  const custom = all.filter(f => f.id.startsWith('custom-'));
  if (custom.length > 0) grouped['Custom'] = custom;
  // Built-in by generation
  for (const format of all.filter(f => !f.id.startsWith('custom-'))) {
    const key = `Gen ${format.generation}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(format);
  }
  return grouped;
}

/** All format IDs (includes custom) */
export function getAllFormatIds(customFormats?: CustomFormat[]): string[] {
  return getCombinedFormats(customFormats).map(f => f.id);
}

/** All format names (includes custom) */
export function getAllFormatNames(customFormats?: CustomFormat[]): string[] {
  return getCombinedFormats(customFormats).map(f => f.name);
}

/** Default format — Pokemon Champions Regulation M-A (current as of June 2026) */
export const DEFAULT_FORMAT = "champions-ma";

/** Check if a format supports Tera */
export function formatSupportsTera(formatId: string, customFormats?: CustomFormat[]): boolean {
  const fmt = getFormatById(formatId, customFormats);
  return fmt ? fmt.rules.includes('tera-allow') : false;
}

/** Check if a format supports Mega Evolution */
export function formatSupportsMega(formatId: string, customFormats?: CustomFormat[]): boolean {
  const fmt = getFormatById(formatId, customFormats);
  if (!fmt) return false;
  return fmt.rules.includes('mega-allow') || fmt.rules.includes('mega-once');
}

/** Check if a format supports Dynamax */
export function formatSupportsDynamax(formatId: string, customFormats?: CustomFormat[]): boolean {
  const fmt = getFormatById(formatId, customFormats);
  return fmt ? fmt.rules.includes('dynamax-clause') : false;
}

/** Check if a format supports Z-Moves */
export function formatSupportsZMoves(formatId: string, customFormats?: CustomFormat[]): boolean {
  const fmt = getFormatById(formatId, customFormats);
  if (!fmt) return false;
  return !fmt.rules.includes('z-move-ban');
}
