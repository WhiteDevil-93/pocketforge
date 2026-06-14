// ============================================================================
// PocketForge — Mega Evolution Data
// ============================================================================
// Maps Mega Stones to the Mega form's base stats

export interface MegaFormData {
  stone: string;
  baseName: string;
  megaName: string;
  types: [string, string?];
  ability: string;
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
}

export const MEGA_DATA: Record<string, MegaFormData> = {
  // Kanto starters
  venusaur: {
    stone: "Venusaurite",
    baseName: "Venusaur",
    megaName: "Venusaur-Mega",
    types: ["Grass", "Poison"],
    ability: "Thick Fat",
    baseStats: { hp: 80, atk: 100, def: 123, spa: 122, spd: 120, spe: 80 },
  },
  charizard: {
    stone: "Charizardite X",
    baseName: "Charizard",
    megaName: "Charizard-Mega-X",
    types: ["Fire", "Dragon"],
    ability: "Tough Claws",
    baseStats: { hp: 78, atk: 130, def: 111, spa: 130, spd: 85, spe: 100 },
  },
  charizard_y: {
    stone: "Charizardite Y",
    baseName: "Charizard",
    megaName: "Charizard-Mega-Y",
    types: ["Fire", "Flying"],
    ability: "Drought",
    baseStats: { hp: 78, atk: 104, def: 78, spa: 159, spd: 115, spe: 100 },
  },
  blastoise: {
    stone: "Blastoisinite",
    baseName: "Blastoise",
    megaName: "Blastoise-Mega",
    types: ["Water"],
    ability: "Mega Launcher",
    baseStats: { hp: 79, atk: 103, def: 120, spa: 135, spd: 115, spe: 78 },
  },
  // Other popular Megas
  gengar: {
    stone: "Gengarite",
    baseName: "Gengar",
    megaName: "Gengar-Mega",
    types: ["Ghost", "Poison"],
    ability: "Shadow Tag",
    baseStats: { hp: 60, atk: 65, def: 80, spa: 130, spd: 75, spe: 130 },
  },
  gardevoir: {
    stone: "Gardevoirite",
    baseName: "Gardevoir",
    megaName: "Gardevoir-Mega",
    types: ["Psychic", "Fairy"],
    ability: "Pixilate",
    baseStats: { hp: 68, atk: 85, def: 65, spa: 165, spd: 135, spe: 100 },
  },
  mawile: {
    stone: "Mawilite",
    baseName: "Mawile",
    megaName: "Mawile-Mega",
    types: ["Steel", "Fairy"],
    ability: "Huge Power",
    baseStats: { hp: 50, atk: 105, def: 125, spa: 55, spd: 95, spe: 50 },
  },
  aggron: {
    stone: "Aggronite",
    baseName: "Aggron",
    megaName: "Aggron-Mega",
    types: ["Steel"],
    ability: "Filter",
    baseStats: { hp: 70, atk: 140, def: 230, spa: 60, spd: 80, spe: 50 },
  },
  medicham: {
    stone: "Medichamite",
    baseName: "Medicham",
    megaName: "Medicham-Mega",
    types: ["Fighting", "Psychic"],
    ability: "Huge Power",
    baseStats: { hp: 60, atk: 100, def: 85, spa: 80, spd: 85, spe: 100 },
  },
  altaria: {
    stone: "Altarianite",
    baseName: "Altaria",
    megaName: "Altaria-Mega",
    types: ["Dragon", "Fairy"],
    ability: "Pixilate",
    baseStats: { hp: 75, atk: 110, def: 110, spa: 110, spd: 105, spe: 80 },
  },
  salamence: {
    stone: "Salamencite",
    baseName: "Salamence",
    megaName: "Salamence-Mega",
    types: ["Dragon", "Flying"],
    ability: "Aerilate",
    baseStats: { hp: 95, atk: 145, def: 130, spa: 120, spd: 90, spe: 120 },
  },
  metagross: {
    stone: "Metagrossite",
    baseName: "Metagross",
    megaName: "Metagross-Mega",
    types: ["Steel", "Psychic"],
    ability: "Tough Claws",
    baseStats: { hp: 80, atk: 145, def: 150, spa: 105, spd: 110, spe: 110 },
  },
  lucario: {
    stone: "Lucarionite",
    baseName: "Lucario",
    megaName: "Lucario-Mega",
    types: ["Fighting", "Steel"],
    ability: "Adaptability",
    baseStats: { hp: 70, atk: 145, def: 88, spa: 140, spd: 70, spe: 112 },
  },
  gyarados: {
    stone: "Gyaradosite",
    baseName: "Gyarados",
    megaName: "Gyarados-Mega",
    types: ["Water", "Dark"],
    ability: "Mold Breaker",
    baseStats: { hp: 95, atk: 155, def: 109, spa: 70, spd: 130, spe: 81 },
  },
  tyranitar: {
    stone: "Tyranitarite",
    baseName: "Tyranitar",
    megaName: "Tyranitar-Mega",
    types: ["Rock", "Dark"],
    ability: "Sand Stream",
    baseStats: { hp: 100, atk: 164, def: 150, spa: 95, spd: 120, spe: 71 },
  },
  scizor: {
    stone: "Scizorite",
    baseName: "Scizor",
    megaName: "Scizor-Mega",
    types: ["Bug", "Steel"],
    ability: "Technician",
    baseStats: { hp: 70, atk: 150, def: 140, spa: 65, spd: 100, spe: 75 },
  },
  pinsir: {
    stone: "Pinsirite",
    baseName: "Pinsir",
    megaName: "Pinsir-Mega",
    types: ["Bug", "Flying"],
    ability: "Aerilate",
    baseStats: { hp: 65, atk: 155, def: 120, spa: 65, spd: 90, spe: 105 },
  },
  aerodactyl: {
    stone: "Aerodactylite",
    baseName: "Aerodactyl",
    megaName: "Aerodactyl-Mega",
    types: ["Rock", "Flying"],
    ability: "Tough Claws",
    baseStats: { hp: 80, atk: 135, def: 85, spa: 70, spd: 95, spe: 150 },
  },
  slowbro: {
    stone: "Slowbronite",
    baseName: "Slowbro",
    megaName: "Slowbro-Mega",
    types: ["Water", "Psychic"],
    ability: "Shell Armor",
    baseStats: { hp: 95, atk: 75, def: 180, spa: 130, spd: 80, spe: 30 },
  },
  alakazam: {
    stone: "Alakazite",
    baseName: "Alakazam",
    megaName: "Alakazam-Mega",
    types: ["Psychic"],
    ability: "Trace",
    baseStats: { hp: 55, atk: 50, def: 65, spa: 175, spd: 105, spe: 150 },
  },
  kangaskhan: {
    stone: "Kangaskhanite",
    baseName: "Kangaskhan",
    megaName: "Kangaskhan-Mega",
    types: ["Normal"],
    ability: "Parental Bond",
    baseStats: { hp: 105, atk: 125, def: 100, spa: 60, spd: 100, spe: 100 },
  },
  diancie: {
    stone: "Diancite",
    baseName: "Diancie",
    megaName: "Diancie-Mega",
    types: ["Rock", "Fairy"],
    ability: "Magic Bounce",
    baseStats: { hp: 50, atk: 160, def: 110, spa: 160, spd: 110, spe: 110 },
  },
};

/** Get Mega data by stone name */
export function getMegaByStone(stoneName: string): MegaFormData | undefined {
  return Object.values(MEGA_DATA).find(m => m.stone.toLowerCase() === stoneName.toLowerCase());
}

/** Get Mega data by base Pokemon name */
export function getMegaByBase(baseName: string): MegaFormData | undefined {
  const normalized = baseName.toLowerCase().replace(/[^a-z]/g, '');
  return MEGA_DATA[normalized];
}

/** Check if an item is a Mega Stone */
export function isMegaStone(itemName: string): boolean {
  if (!itemName) return false;
  return Object.values(MEGA_DATA).some(m => m.stone.toLowerCase() === itemName.toLowerCase());
}

/** Get all Mega Stone item names */
export function getAllMegaStones(): string[] {
  return Object.values(MEGA_DATA).map(m => m.stone);
}
