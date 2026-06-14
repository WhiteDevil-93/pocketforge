// ============================================================================
// PocketForge — Nature Definitions (All 25 Natures)
// ============================================================================

import type { Nature } from '../types';

export const NATURES: Nature[] = [
  { name: "Adamant", increased: "atk", decreased: "spa" },
  { name: "Bashful", increased: null, decreased: null },
  { name: "Bold", increased: "def", decreased: "atk" },
  { name: "Brave", increased: "atk", decreased: "spe" },
  { name: "Calm", increased: "spd", decreased: "atk" },
  { name: "Careful", increased: "spd", decreased: "spa" },
  { name: "Docile", increased: null, decreased: null },
  { name: "Gentle", increased: "spd", decreased: "def" },
  { name: "Hardy", increased: null, decreased: null },
  { name: "Hasty", increased: "spe", decreased: "def" },
  { name: "Impish", increased: "def", decreased: "spa" },
  { name: "Jolly", increased: "spe", decreased: "spa" },
  { name: "Lax", increased: "def", decreased: "spd" },
  { name: "Lonely", increased: "atk", decreased: "def" },
  { name: "Mild", increased: "spa", decreased: "def" },
  { name: "Modest", increased: "spa", decreased: "atk" },
  { name: "Naive", increased: "spe", decreased: "spd" },
  { name: "Naughty", increased: "atk", decreased: "spd" },
  { name: "Quiet", increased: "spa", decreased: "spe" },
  { name: "Quirky", increased: null, decreased: null },
  { name: "Rash", increased: "spa", decreased: "spd" },
  { name: "Relaxed", increased: "def", decreased: "spe" },
  { name: "Sassy", increased: "spd", decreased: "spe" },
  { name: "Serious", increased: null, decreased: null },
  { name: "Timid", increased: "spe", decreased: "atk" },
];

/** Get nature by name */
export function getNatureByName(name: string): Nature | undefined {
  return NATURES.find(n => n.name.toLowerCase() === name.toLowerCase().trim());
}

/** Get nature modifier for a stat */
export function getNatureModifier(nature: Nature, stat: string): number {
  const s = stat.toLowerCase();
  if (nature.increased === s) return 1.1;
  if (nature.decreased === s) return 0.9;
  return 1.0;
}

/** Get a nature description like "+Atk, -SpA" */
export function getNatureDescription(nature: Nature): string {
  if (!nature.increased || !nature.decreased) return "Neutral";
  const statShort: Record<string, string> = {
    hp: "HP", atk: "Atk", def: "Def", spa: "SpA", spd: "SpD", spe: "Spe"
  };
  return `+${statShort[nature.increased] || nature.increased}, -${statShort[nature.decreased] || nature.decreased}`;
}

/** All nature names for pickers */
export function getAllNatureNames(): string[] {
  return NATURES.map(n => n.name);
}
