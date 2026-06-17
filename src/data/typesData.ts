// Auto-generated from Pokemon Showdown — do not edit manually
// Last updated: 2026-06-17T13:21:30.558Z

export const TYPE_NAMES = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
  "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy",
] as const;

export type TypeName = typeof TYPE_NAMES[number];

export const TYPE_CHART: Record<string, any> = {
  "bug": {
    "damageTaken": {
      "Bug": 0,
      "Dark": 0,
      "Dragon": 0,
      "Electric": 0,
      "Fairy": 0,
      "Fighting": 2,
      "Fire": 1,
      "Flying": 1,
      "Ghost": 0,
      "Grass": 2,
      "Ground": 2,
      "Ice": 0,
      "Normal": 0,
      "Poison": 0,
      "Psychic": 0,
      "Rock": 1,
      "Steel": 0,
      "Stellar": 0,
      "Water": 0
    }
  },
  "dark": {
    "damageTaken": {
      "prankster": 3,
      "Bug": 1,
      "Dark": 2,
      "Dragon": 0,
      "Electric": 0,
      "Fairy": 1,
      "Fighting": 1,
      "Fire": 0,
      "Flying": 0,
      "Ghost": 2,
      "Grass": 0,
      "Ground": 0,
      "Ice": 0,
      "Normal": 0,
      "Poison": 0,
      "Psychic": 3,
      "Rock": 0,
      "Steel": 0,
      "Stellar": 0,
      "Water": 0
    }
  },
  "dragon": {
    "damageTaken": {
      "Bug": 0,
      "Dark": 0,
      "Dragon": 1,
      "Electric": 2,
      "Fairy": 1,
      "Fighting": 0,
      "Fire": 2,
      "Flying": 0,
      "Ghost": 0,
      "Grass": 2,
      "Ground": 0,
      "Ice": 1,
      "Normal": 0,
      "Poison": 0,
      "Psychic": 0,
      "Rock": 0,
      "Steel": 0,
      "Stellar": 0,
      "Water": 2
    }
  },
  "electric": {
    "damageTaken": {
      "par": 3,
      "Bug": 0,
      "Dark": 0,
      "Dragon": 0,
      "Electric": 2,
      "Fairy": 0,
      "Fighting": 0,
      "Fire": 0,
      "Flying": 2,
      "Ghost": 0,
      "Grass": 0,
      "Ground": 1,
      "Ice": 0,
      "Normal": 0,
      "Poison": 0,
      "Psychic": 0,
      "Rock": 0,
      "Steel": 2,
      "Stellar": 0,
      "Water": 0
    }
  },
  "fairy": {
    "damageTaken": {
      "Bug": 2,
      "Dark": 2,
      "Dragon": 3,
      "Electric": 0,
      "Fairy": 0,
      "Fighting": 2,
      "Fire": 0,
      "Flying": 0,
      "Ghost": 0,
      "Grass": 0,
      "Ground": 0,
      "Ice": 0,
      "Normal": 0,
      "Poison": 1,
      "Psychic": 0,
      "Rock": 0,
      "Steel": 1,
      "Stellar": 0,
      "Water": 0
    }
  },
  "fighting": {
    "damageTaken": {
      "Bug": 2,
      "Dark": 2,
      "Dragon": 0,
      "Electric": 0,
      "Fairy": 1,
      "Fighting": 0,
      "Fire": 0,
      "Flying": 1,
      "Ghost": 0,
      "Grass": 0,
      "Ground": 0,
      "Ice": 0,
      "Normal": 0,
      "Poison": 0,
      "Psychic": 1,
      "Rock": 2,
      "Steel": 0,
      "Stellar": 0,
      "Water": 0
    }
  },
  "fire": {
    "damageTaken": {
      "brn": 3,
      "Bug": 2,
      "Dark": 0,
      "Dragon": 0,
      "Electric": 0,
      "Fairy": 2,
      "Fighting": 0,
      "Fire": 2,
      "Flying": 0,
      "Ghost": 0,
      "Grass": 2,
      "Ground": 1,
      "Ice": 2,
      "Normal": 0,
      "Poison": 0,
      "Psychic": 0,
      "Rock": 1,
      "Steel": 2,
      "Stellar": 0,
      "Water": 1
    }
  },
  "flying": {
    "damageTaken": {
      "Bug": 2,
      "Dark": 0,
      "Dragon": 0,
      "Electric": 1,
      "Fairy": 0,
      "Fighting": 2,
      "Fire": 0,
      "Flying": 0,
      "Ghost": 0,
      "Grass": 2,
      "Ground": 3,
      "Ice": 1,
      "Normal": 0,
      "Poison": 0,
      "Psychic": 0,
      "Rock": 1,
      "Steel": 0,
      "Stellar": 0,
      "Water": 0
    }
  },
  "ghost": {
    "damageTaken": {
      "trapped": 3,
      "Bug": 2,
      "Dark": 1,
      "Dragon": 0,
      "Electric": 0,
      "Fairy": 0,
      "Fighting": 3,
      "Fire": 0,
      "Flying": 0,
      "Ghost": 1,
      "Grass": 0,
      "Ground": 0,
      "Ice": 0,
      "Normal": 3,
      "Poison": 2,
      "Psychic": 0,
      "Rock": 0,
      "Steel": 0,
      "Stellar": 0,
      "Water": 0
    }
  },
  "grass": {
    "damageTaken": {
      "powder": 3,
      "Bug": 1,
      "Dark": 0,
      "Dragon": 0,
      "Electric": 2,
      "Fairy": 0,
      "Fighting": 0,
      "Fire": 1,
      "Flying": 1,
      "Ghost": 0,
      "Grass": 2,
      "Ground": 2,
      "Ice": 1,
      "Normal": 0,
      "Poison": 1,
      "Psychic": 0,
      "Rock": 0,
      "Steel": 0,
      "Stellar": 0,
      "Water": 2
    }
  },
  "ground": {
    "damageTaken": {
      "sandstorm": 3,
      "Bug": 0,
      "Dark": 0,
      "Dragon": 0,
      "Electric": 3,
      "Fairy": 0,
      "Fighting": 0,
      "Fire": 0,
      "Flying": 0,
      "Ghost": 0,
      "Grass": 1,
      "Ground": 0,
      "Ice": 1,
      "Normal": 0,
      "Poison": 2,
      "Psychic": 0,
      "Rock": 2,
      "Steel": 0,
      "Stellar": 0,
      "Water": 1
    }
  },
  "ice": {
    "damageTaken": {
      "hail": 3,
      "frz": 3,
      "Bug": 0,
      "Dark": 0,
      "Dragon": 0,
      "Electric": 0,
      "Fairy": 0,
      "Fighting": 1,
      "Fire": 1,
      "Flying": 0,
      "Ghost": 0,
      "Grass": 0,
      "Ground": 0,
      "Ice": 2,
      "Normal": 0,
      "Poison": 0,
      "Psychic": 0,
      "Rock": 1,
      "Steel": 1,
      "Stellar": 0,
      "Water": 0
    }
  },
  "normal": {
    "damageTaken": {
      "Bug": 0,
      "Dark": 0,
      "Dragon": 0,
      "Electric": 0,
      "Fairy": 0,
      "Fighting": 1,
      "Fire": 0,
      "Flying": 0,
      "Ghost": 3,
      "Grass": 0,
      "Ground": 0,
      "Ice": 0,
      "Normal": 0,
      "Poison": 0,
      "Psychic": 0,
      "Rock": 0,
      "Steel": 0,
      "Stellar": 0,
      "Water": 0
    }
  },
  "poison": {
    "damageTaken": {
      "psn": 3,
      "tox": 3,
      "Bug": 2,
      "Dark": 0,
      "Dragon": 0,
      "Electric": 0,
      "Fairy": 2,
      "Fighting": 2,
      "Fire": 0,
      "Flying": 0,
      "Ghost": 0,
      "Grass": 2,
      "Ground": 1,
      "Ice": 0,
      "Normal": 0,
      "Poison": 2,
      "Psychic": 1,
      "Rock": 0,
      "Steel": 0,
      "Stellar": 0,
      "Water": 0
    }
  },
  "psychic": {
    "damageTaken": {
      "Bug": 1,
      "Dark": 1,
      "Dragon": 0,
      "Electric": 0,
      "Fairy": 0,
      "Fighting": 2,
      "Fire": 0,
      "Flying": 0,
      "Ghost": 1,
      "Grass": 0,
      "Ground": 0,
      "Ice": 0,
      "Normal": 0,
      "Poison": 0,
      "Psychic": 2,
      "Rock": 0,
      "Steel": 0,
      "Stellar": 0,
      "Water": 0
    }
  },
  "rock": {
    "damageTaken": {
      "sandstorm": 3,
      "Bug": 0,
      "Dark": 0,
      "Dragon": 0,
      "Electric": 0,
      "Fairy": 0,
      "Fighting": 1,
      "Fire": 2,
      "Flying": 2,
      "Ghost": 0,
      "Grass": 1,
      "Ground": 1,
      "Ice": 0,
      "Normal": 2,
      "Poison": 2,
      "Psychic": 0,
      "Rock": 0,
      "Steel": 1,
      "Stellar": 0,
      "Water": 1
    }
  },
  "steel": {
    "damageTaken": {
      "psn": 3,
      "tox": 3,
      "sandstorm": 3,
      "Bug": 2,
      "Dark": 0,
      "Dragon": 2,
      "Electric": 0,
      "Fairy": 2,
      "Fighting": 1,
      "Fire": 1,
      "Flying": 2,
      "Ghost": 0,
      "Grass": 2,
      "Ground": 1,
      "Ice": 2,
      "Normal": 2,
      "Poison": 3,
      "Psychic": 2,
      "Rock": 2,
      "Steel": 2,
      "Stellar": 0,
      "Water": 0
    }
  },
  "stellar": {
    "damageTaken": {
      "Bug": 0,
      "Dark": 0,
      "Dragon": 0,
      "Electric": 0,
      "Fairy": 0,
      "Fighting": 0,
      "Fire": 0,
      "Flying": 0,
      "Ghost": 0,
      "Grass": 0,
      "Ground": 0,
      "Ice": 0,
      "Normal": 0,
      "Poison": 0,
      "Psychic": 0,
      "Rock": 0,
      "Steel": 0,
      "Stellar": 0,
      "Water": 0
    }
  },
  "water": {
    "damageTaken": {
      "Bug": 0,
      "Dark": 0,
      "Dragon": 0,
      "Electric": 1,
      "Fairy": 0,
      "Fighting": 0,
      "Fire": 2,
      "Flying": 0,
      "Ghost": 0,
      "Grass": 1,
      "Ground": 0,
      "Ice": 2,
      "Normal": 0,
      "Poison": 0,
      "Psychic": 0,
      "Rock": 0,
      "Steel": 2,
      "Stellar": 0,
      "Water": 2
    }
  }
};

export const TYPES = Object.keys(TYPE_CHART);

export function getEffectiveness(attackingType: string, defendingTypes: string[]): number {
  let mult = 1;
  const atk = attackingType.toLowerCase();
  for (const def of defendingTypes) {
    const dmg = TYPE_CHART[atk]?.damageTaken[def.toLowerCase()] ?? 0;
    if (dmg === 1) mult *= 2;
    else if (dmg === 2) mult *= 0.5;
    else if (dmg === 3) mult = 0;
  }
  return mult;
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
