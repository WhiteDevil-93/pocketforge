// ============================================================================
// PocketForge — Format Definitions
// ============================================================================

import type { Format } from '../types';

export const FORMATS: Format[] = [
  // Generation 9 (Scarlet/Violet)
  { id: "gen9ou", name: "Gen 9 OU", generation: 9, rules: ["species-clause", "sleep-mod", "ohko-clause", "tera-allow"] },
  { id: "gen9uu", name: "Gen 9 UU", generation: 9, rules: ["species-clause", "sleep-mod", "ohko-clause", "tera-allow"] },
  { id: "gen9ru", name: "Gen 9 RU", generation: 9, rules: ["species-clause", "sleep-mod", "ohko-clause", "tera-allow"] },
  { id: "gen9nu", name: "Gen 9 NU", generation: 9, rules: ["species-clause", "sleep-mod", "ohko-clause", "tera-allow"] },
  { id: "gen9pu", name: "Gen 9 PU", generation: 9, rules: ["species-clause", "sleep-mod", "ohko-clause", "tera-allow"] },
  { id: "gen9ubers", name: "Gen 9 Ubers", generation: 9, rules: ["sleep-mod", "ohko-clause", "tera-allow"] },
  { id: "gen9nationaldex", name: "Gen 9 National Dex", generation: 9, rules: ["species-clause", "sleep-mod", "ohko-clause", "tera-allow", "mega-allow", "z-move-ban"] },
  { id: "gen9nationaldexag", name: "Gen 9 National Dex AG", generation: 9, rules: ["tera-allow", "mega-allow"] },
  { id: "gen9vgc", name: "Gen 9 VGC Regulation H", generation: 9, rules: ["species-clause", "item-clause", "sleep-mod", "tera-allow"] },
  { id: "gen9doublesou", name: "Gen 9 Doubles OU", generation: 9, rules: ["species-clause", "sleep-mod", "ohko-clause", "tera-allow"] },
  { id: "gen9bss", name: "Gen 9 Battle Stadium Singles", generation: 9, rules: ["species-clause", "item-clause", "sleep-mod", "tera-allow"] },
  { id: "gen9monotype", name: "Gen 9 Monotype", generation: 9, rules: ["species-clause", "sleep-mod", "ohko-clause", "tera-allow"] },
  { id: "gen91v1", name: "Gen 9 1v1", generation: 9, rules: ["ohko-clause", "tera-allow"] },
  { id: "gen9balancedhackmons", name: "Gen 9 Balanced Hackmons", generation: 9, rules: ["tera-allow"] },
  { id: "gen9almostanyability", name: "Gen 9 Almost Any Ability", generation: 9, rules: ["species-clause", "ohko-clause", "tera-allow"] },
  { id: "gen9stabmons", name: "Gen 9 STABmons", generation: 9, rules: ["species-clause", "sleep-mod", "ohko-clause", "tera-allow"] },
  // Generation 8 (Sword/Shield)
  { id: "gen8ou", name: "Gen 8 OU", generation: 8, rules: ["species-clause", "sleep-clause", "ohko-clause", "dynamax-clause"] },
  { id: "gen8ubers", name: "Gen 8 Ubers", generation: 8, rules: ["sleep-clause", "ohko-clause", "dynamax-clause"] },
  { id: "gen8uu", name: "Gen 8 UU", generation: 8, rules: ["species-clause", "sleep-clause", "ohko-clause", "dynamax-clause"] },
  { id: "gen8vgc", name: "Gen 8 VGC 2022", generation: 8, rules: ["species-clause", "item-clause", "sleep-clause", "dynamax-clause"] },
  // Generation 7 (Sun/Moon)
  { id: "gen7ou", name: "Gen 7 OU", generation: 7, rules: ["species-clause", "sleep-clause", "ohko-clause", "mega-allow", "z-move-ban"] },
  { id: "gen7ubers", name: "Gen 7 Ubers", generation: 7, rules: ["sleep-clause", "ohko-clause", "mega-allow", "z-move-ban"] },
  { id: "gen7vgc", name: "Gen 7 VGC 2019", generation: 7, rules: ["species-clause", "item-clause", "sleep-clause", "mega-allow"] },
  // Generation 6 (X/Y)
  { id: "gen6ou", name: "Gen 6 OU", generation: 6, rules: ["species-clause", "sleep-clause", "ohko-clause", "mega-allow"] },
  { id: "gen6ubers", name: "Gen 6 Ubers", generation: 6, rules: ["sleep-clause", "ohko-clause", "mega-allow"] },
  // Generation 5 (Black/White)
  { id: "gen5ou", name: "Gen 5 OU", generation: 5, rules: ["species-clause", "sleep-clause", "ohko-clause", "endless-battle-clause"] },
  { id: "gen5ubers", name: "Gen 5 Ubers", generation: 5, rules: ["ohko-clause", "endless-battle-clause"] },
  // Generation 4 (Diamond/Pearl)
  { id: "gen4ou", name: "Gen 4 OU", generation: 4, rules: ["species-clause", "sleep-clause", "ohko-clause", "evo-clause"] },
  { id: "gen4ubers", name: "Gen 4 Ubers", generation: 4, rules: ["sleep-clause", "ohko-clause"] },
  // Generation 3 (Ruby/Sapphire)
  { id: "gen3ou", name: "Gen 3 OU", generation: 3, rules: ["species-clause", "sleep-clause", "ohko-clause", "evo-clause"] },
  // Generation 2 (Gold/Silver)
  { id: "gen2ou", name: "Gen 2 OU", generation: 2, rules: ["species-clause", "sleep-clause", "ohko-clause", "evo-clause"] },
  // Generation 1 (Red/Blue)
  { id: "gen1ou", name: "Gen 1 OU", generation: 1, rules: ["species-clause", "sleep-clause", "ohko-clause", "evo-clause"] },
];

/** Get format by ID */
export function getFormatById(id: string): Format | undefined {
  return FORMATS.find(f => f.id === id.toLowerCase().trim());
}

/** Get formats by generation */
export function getFormatsByGeneration(gen: number): Format[] {
  return FORMATS.filter(f => f.generation === gen);
}

/** Get all format names grouped by generation */
export function getFormatsGrouped(): Record<number, Format[]> {
  const grouped: Record<number, Format[]> = {};
  for (const format of FORMATS) {
    if (!grouped[format.generation]) grouped[format.generation] = [];
    grouped[format.generation].push(format);
  }
  return grouped;
}

/** All format IDs/names for pickers */
export function getAllFormatIds(): string[] {
  return FORMATS.map(f => f.id);
}

export function getAllFormatNames(): string[] {
  return FORMATS.map(f => f.name);
}

/** Default format */
export const DEFAULT_FORMAT = "gen9ou";
