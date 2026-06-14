// ============================================================================
// PocketForge — Type Effectiveness Chart (18x18 Matrix)
// ============================================================================

export const TYPE_NAMES = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
  "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy",
] as const;

export type TypeName = typeof TYPE_NAMES[number];

/** 
 * Type effectiveness multiplier matrix.
 * Matrix[attackingType][defendingType] = multiplier
 * 0 = no effect, 0.5 = not very effective, 1 = neutral, 2 = super effective
 */
export const TYPE_CHART: Record<string, Record<string, number>> = {
  Normal: {
    Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1,
    Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 1,
    Rock: 0.5, Ghost: 0, Dragon: 1, Dark: 1, Steel: 0.5, Fairy: 1,
  },
  Fire: {
    Normal: 1, Fire: 0.5, Water: 0.5, Electric: 1, Grass: 2, Ice: 2,
    Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 2,
    Rock: 0.5, Ghost: 1, Dragon: 0.5, Dark: 1, Steel: 2, Fairy: 1,
  },
  Water: {
    Normal: 1, Fire: 2, Water: 0.5, Electric: 1, Grass: 0.5, Ice: 1,
    Fighting: 1, Poison: 1, Ground: 2, Flying: 1, Psychic: 1, Bug: 1,
    Rock: 2, Ghost: 1, Dragon: 0.5, Dark: 1, Steel: 1, Fairy: 1,
  },
  Electric: {
    Normal: 1, Fire: 1, Water: 2, Electric: 0.5, Grass: 0.5, Ice: 1,
    Fighting: 1, Poison: 1, Ground: 0, Flying: 2, Psychic: 1, Bug: 1,
    Rock: 1, Ghost: 1, Dragon: 0.5, Dark: 1, Steel: 1, Fairy: 1,
  },
  Grass: {
    Normal: 1, Fire: 0.5, Water: 2, Electric: 1, Grass: 0.5, Ice: 1,
    Fighting: 1, Poison: 0.5, Ground: 2, Flying: 0.5, Psychic: 1, Bug: 0.5,
    Rock: 2, Ghost: 1, Dragon: 0.5, Dark: 1, Steel: 0.5, Fairy: 1,
  },
  Ice: {
    Normal: 1, Fire: 0.5, Water: 0.5, Electric: 1, Grass: 2, Ice: 0.5,
    Fighting: 1, Poison: 1, Ground: 2, Flying: 2, Psychic: 1, Bug: 1,
    Rock: 1, Ghost: 1, Dragon: 2, Dark: 1, Steel: 0.5, Fairy: 1,
  },
  Fighting: {
    Normal: 2, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 2,
    Fighting: 1, Poison: 0.5, Ground: 1, Flying: 0.5, Psychic: 0.5, Bug: 0.5,
    Rock: 2, Ghost: 0, Dragon: 1, Dark: 2, Steel: 2, Fairy: 0.5,
  },
  Poison: {
    Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 2, Ice: 1,
    Fighting: 1, Poison: 0.5, Ground: 0.5, Flying: 1, Psychic: 1, Bug: 1,
    Rock: 0.5, Ghost: 0.5, Dragon: 1, Dark: 1, Steel: 0, Fairy: 2,
  },
  Ground: {
    Normal: 1, Fire: 2, Water: 1, Electric: 2, Grass: 0.5, Ice: 1,
    Fighting: 1, Poison: 2, Ground: 1, Flying: 0, Psychic: 1, Bug: 0.5,
    Rock: 2, Ghost: 1, Dragon: 1, Dark: 1, Steel: 2, Fairy: 1,
  },
  Flying: {
    Normal: 1, Fire: 1, Water: 1, Electric: 0.5, Grass: 2, Ice: 1,
    Fighting: 2, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 2,
    Rock: 0.5, Ghost: 1, Dragon: 1, Dark: 1, Steel: 0.5, Fairy: 1,
  },
  Psychic: {
    Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1,
    Fighting: 2, Poison: 2, Ground: 1, Flying: 1, Psychic: 0.5, Bug: 1,
    Rock: 1, Ghost: 1, Dragon: 1, Dark: 0, Steel: 0.5, Fairy: 1,
  },
  Bug: {
    Normal: 1, Fire: 0.5, Water: 1, Electric: 1, Grass: 2, Ice: 1,
    Fighting: 0.5, Poison: 0.5, Ground: 1, Flying: 0.5, Psychic: 2, Bug: 1,
    Rock: 1, Ghost: 0.5, Dragon: 1, Dark: 2, Steel: 0.5, Fairy: 0.5,
  },
  Rock: {
    Normal: 1, Fire: 2, Water: 1, Electric: 1, Grass: 1, Ice: 2,
    Fighting: 0.5, Poison: 1, Ground: 0.5, Flying: 2, Psychic: 1, Bug: 2,
    Rock: 1, Ghost: 1, Dragon: 1, Dark: 1, Steel: 0.5, Fairy: 1,
  },
  Ghost: {
    Normal: 0, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1,
    Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 2, Bug: 1,
    Rock: 1, Ghost: 2, Dragon: 1, Dark: 0.5, Steel: 1, Fairy: 1,
  },
  Dragon: {
    Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1,
    Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 1,
    Rock: 1, Ghost: 1, Dragon: 2, Dark: 1, Steel: 0.5, Fairy: 0,
  },
  Dark: {
    Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1,
    Fighting: 0.5, Poison: 1, Ground: 1, Flying: 1, Psychic: 2, Bug: 1,
    Rock: 1, Ghost: 2, Dragon: 1, Dark: 0.5, Steel: 1, Fairy: 0.5,
  },
  Steel: {
    Normal: 1, Fire: 0.5, Water: 0.5, Electric: 0.5, Grass: 1, Ice: 2,
    Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 1,
    Rock: 2, Ghost: 1, Dragon: 1, Dark: 1, Steel: 0.5, Fairy: 2,
  },
  Fairy: {
    Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1,
    Fighting: 2, Poison: 0.5, Ground: 1, Flying: 1, Psychic: 1, Bug: 1,
    Rock: 1, Ghost: 1, Dragon: 2, Dark: 2, Steel: 0.5, Fairy: 1,
  },
};

/** Get effectiveness multiplier for an attacking type against defending type(s) */
export function getEffectiveness(attackType: string, defenderTypes: string[]): number {
  const attacker = TYPE_CHART[attackType];
  if (!attacker) return 1;

  let total = 1;
  for (const defType of defenderTypes) {
    const multiplier = attacker[defType];
    if (multiplier !== undefined) {
      total *= multiplier;
    }
  }
  return total;
}

/** Get all type names */
export function getAllTypes(): string[] {
  return [...TYPE_NAMES];
}

/** Get type color */
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
