import { getGen } from '../lib/showdown';

export const TYPE_NAMES = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
  "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy",
] as const;

export type TypeName = typeof TYPE_NAMES[number];

export const TYPES = TYPE_NAMES.map(t => t.toLowerCase());

export function getEffectiveness(attackingType: string, defendingTypes: string[], genNum: number = 9): number {
  try {
    const gen = getGen(genNum);
    return gen.types.totalEffectiveness(attackingType as any, defendingTypes as any);
  } catch (err) {
    console.error('Failed to calculate effectiveness:', err);
    return 1;
  }
}

export function getAllTypes(): string[] {
  return [...TYPE_NAMES];
}

export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    Normal: "#A8A77A", Fire: "#EE8130", Water: "#6390F0", Electric: "#F7D02C",
    Grass: "#7AC74C", Ice: "#96D9D6", Fighting: "#C22E28", Poison: "#A33EA1",
    Ground: "#E2BF65", Flying: "#A98FF3", Psychic: "#F95587", Bug: "#A6B91A",
    Rock: "#B6A136", Ghost: "#735797", Dragon: "#6F35FC", Dark: "#705746",
    Steel: "#B7B7CE", Fairy: "#D685AD",
  };
  return colors[type] || "#94A3B8";
}
