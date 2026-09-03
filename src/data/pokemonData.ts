// Auto-generated from Pokemon Showdown — do not edit manually
// Last updated: 2026-09-03T01:23:38.764Z

export interface PokedexEntry {
  id: number;
  name: string;
  types: string[];
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  abilities: string[];
  hiddenAbility: string;
  /** Species id (lowercase alphanumerics). Used as a slug for lookups — this is
   *  NOT the sprite filename; see spriteId. */
  sprite: string;
  /** Filename Showdown serves this species' sprite under, hyphenating a forme
   *  onto its base species ("Charizard-Mega-X" -> charizard-megax) while leaving
   *  a hyphenated base species alone ("Ho-Oh" -> hooh). getSpriteUrl reads this;
   *  deriving it from the display name or from sprite 404s on 355 formes. */
  spriteId: string;
  learnset: string[];
}

export const POKEDEX: PokedexEntry[] = [
  {
    "id": 1,
    "name": "Bulbasaur",
    "types": [
      "Grass",
      "Poison"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 49,
      "def": 49,
      "spa": 65,
      "spd": 65,
      "spe": 45
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Chlorophyll",
    "sprite": "bulbasaur",
    "spriteId": "bulbasaur",
    "learnset": []
  },
  {
    "id": 2,
    "name": "Ivysaur",
    "types": [
      "Grass",
      "Poison"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 62,
      "def": 63,
      "spa": 80,
      "spd": 80,
      "spe": 60
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Chlorophyll",
    "sprite": "ivysaur",
    "spriteId": "ivysaur",
    "learnset": []
  },
  {
    "id": 3,
    "name": "Venusaur",
    "types": [
      "Grass",
      "Poison"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 82,
      "def": 83,
      "spa": 100,
      "spd": 100,
      "spe": 80
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Chlorophyll",
    "sprite": "venusaur",
    "spriteId": "venusaur",
    "learnset": []
  },
  {
    "id": 3,
    "name": "Venusaur-Mega",
    "types": [
      "Grass",
      "Poison"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 100,
      "def": 123,
      "spa": 122,
      "spd": 120,
      "spe": 80
    },
    "abilities": [
      "Thick Fat"
    ],
    "hiddenAbility": "",
    "sprite": "venusaurmega",
    "spriteId": "venusaur-mega",
    "learnset": []
  },
  {
    "id": 3,
    "name": "Venusaur-Gmax",
    "types": [
      "Grass",
      "Poison"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 82,
      "def": 83,
      "spa": 100,
      "spd": 100,
      "spe": 80
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Chlorophyll",
    "sprite": "venusaurgmax",
    "spriteId": "venusaur-gmax",
    "learnset": []
  },
  {
    "id": 4,
    "name": "Charmander",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 39,
      "atk": 52,
      "def": 43,
      "spa": 60,
      "spd": 50,
      "spe": 65
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Solar Power",
    "sprite": "charmander",
    "spriteId": "charmander",
    "learnset": []
  },
  {
    "id": 5,
    "name": "Charmeleon",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 58,
      "atk": 64,
      "def": 58,
      "spa": 80,
      "spd": 65,
      "spe": 80
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Solar Power",
    "sprite": "charmeleon",
    "spriteId": "charmeleon",
    "learnset": []
  },
  {
    "id": 6,
    "name": "Charizard",
    "types": [
      "Fire",
      "Flying"
    ],
    "baseStats": {
      "hp": 78,
      "atk": 84,
      "def": 78,
      "spa": 109,
      "spd": 85,
      "spe": 100
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Solar Power",
    "sprite": "charizard",
    "spriteId": "charizard",
    "learnset": []
  },
  {
    "id": 6,
    "name": "Charizard-Mega-X",
    "types": [
      "Fire",
      "Dragon"
    ],
    "baseStats": {
      "hp": 78,
      "atk": 130,
      "def": 111,
      "spa": 130,
      "spd": 85,
      "spe": 100
    },
    "abilities": [
      "Tough Claws"
    ],
    "hiddenAbility": "",
    "sprite": "charizardmegax",
    "spriteId": "charizard-megax",
    "learnset": []
  },
  {
    "id": 6,
    "name": "Charizard-Mega-Y",
    "types": [
      "Fire",
      "Flying"
    ],
    "baseStats": {
      "hp": 78,
      "atk": 104,
      "def": 78,
      "spa": 159,
      "spd": 115,
      "spe": 100
    },
    "abilities": [
      "Drought"
    ],
    "hiddenAbility": "",
    "sprite": "charizardmegay",
    "spriteId": "charizard-megay",
    "learnset": []
  },
  {
    "id": 6,
    "name": "Charizard-Gmax",
    "types": [
      "Fire",
      "Flying"
    ],
    "baseStats": {
      "hp": 78,
      "atk": 84,
      "def": 78,
      "spa": 109,
      "spd": 85,
      "spe": 100
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Solar Power",
    "sprite": "charizardgmax",
    "spriteId": "charizard-gmax",
    "learnset": []
  },
  {
    "id": 7,
    "name": "Squirtle",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 44,
      "atk": 48,
      "def": 65,
      "spa": 50,
      "spd": 64,
      "spe": 43
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Rain Dish",
    "sprite": "squirtle",
    "spriteId": "squirtle",
    "learnset": []
  },
  {
    "id": 8,
    "name": "Wartortle",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 59,
      "atk": 63,
      "def": 80,
      "spa": 65,
      "spd": 80,
      "spe": 58
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Rain Dish",
    "sprite": "wartortle",
    "spriteId": "wartortle",
    "learnset": []
  },
  {
    "id": 9,
    "name": "Blastoise",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 79,
      "atk": 83,
      "def": 100,
      "spa": 85,
      "spd": 105,
      "spe": 78
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Rain Dish",
    "sprite": "blastoise",
    "spriteId": "blastoise",
    "learnset": []
  },
  {
    "id": 9,
    "name": "Blastoise-Mega",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 79,
      "atk": 103,
      "def": 120,
      "spa": 135,
      "spd": 115,
      "spe": 78
    },
    "abilities": [
      "Mega Launcher"
    ],
    "hiddenAbility": "",
    "sprite": "blastoisemega",
    "spriteId": "blastoise-mega",
    "learnset": []
  },
  {
    "id": 9,
    "name": "Blastoise-Gmax",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 79,
      "atk": 83,
      "def": 100,
      "spa": 85,
      "spd": 105,
      "spe": 78
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Rain Dish",
    "sprite": "blastoisegmax",
    "spriteId": "blastoise-gmax",
    "learnset": []
  },
  {
    "id": 10,
    "name": "Caterpie",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 30,
      "def": 35,
      "spa": 20,
      "spd": 20,
      "spe": 45
    },
    "abilities": [
      "Shield Dust"
    ],
    "hiddenAbility": "Run Away",
    "sprite": "caterpie",
    "spriteId": "caterpie",
    "learnset": []
  },
  {
    "id": 11,
    "name": "Metapod",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 20,
      "def": 55,
      "spa": 25,
      "spd": 25,
      "spe": 30
    },
    "abilities": [
      "Shed Skin"
    ],
    "hiddenAbility": "",
    "sprite": "metapod",
    "spriteId": "metapod",
    "learnset": []
  },
  {
    "id": 12,
    "name": "Butterfree",
    "types": [
      "Bug",
      "Flying"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 45,
      "def": 50,
      "spa": 90,
      "spd": 80,
      "spe": 70
    },
    "abilities": [
      "Compound Eyes"
    ],
    "hiddenAbility": "Tinted Lens",
    "sprite": "butterfree",
    "spriteId": "butterfree",
    "learnset": []
  },
  {
    "id": 12,
    "name": "Butterfree-Gmax",
    "types": [
      "Bug",
      "Flying"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 45,
      "def": 50,
      "spa": 90,
      "spd": 80,
      "spe": 70
    },
    "abilities": [
      "Compound Eyes"
    ],
    "hiddenAbility": "Tinted Lens",
    "sprite": "butterfreegmax",
    "spriteId": "butterfree-gmax",
    "learnset": []
  },
  {
    "id": 13,
    "name": "Weedle",
    "types": [
      "Bug",
      "Poison"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 35,
      "def": 30,
      "spa": 20,
      "spd": 20,
      "spe": 50
    },
    "abilities": [
      "Shield Dust"
    ],
    "hiddenAbility": "Run Away",
    "sprite": "weedle",
    "spriteId": "weedle",
    "learnset": []
  },
  {
    "id": 14,
    "name": "Kakuna",
    "types": [
      "Bug",
      "Poison"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 25,
      "def": 50,
      "spa": 25,
      "spd": 25,
      "spe": 35
    },
    "abilities": [
      "Shed Skin"
    ],
    "hiddenAbility": "",
    "sprite": "kakuna",
    "spriteId": "kakuna",
    "learnset": []
  },
  {
    "id": 15,
    "name": "Beedrill",
    "types": [
      "Bug",
      "Poison"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 90,
      "def": 40,
      "spa": 45,
      "spd": 80,
      "spe": 75
    },
    "abilities": [
      "Swarm"
    ],
    "hiddenAbility": "Sniper",
    "sprite": "beedrill",
    "spriteId": "beedrill",
    "learnset": []
  },
  {
    "id": 15,
    "name": "Beedrill-Mega",
    "types": [
      "Bug",
      "Poison"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 150,
      "def": 40,
      "spa": 15,
      "spd": 80,
      "spe": 145
    },
    "abilities": [
      "Adaptability"
    ],
    "hiddenAbility": "",
    "sprite": "beedrillmega",
    "spriteId": "beedrill-mega",
    "learnset": []
  },
  {
    "id": 16,
    "name": "Pidgey",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 45,
      "def": 40,
      "spa": 35,
      "spd": 35,
      "spe": 56
    },
    "abilities": [
      "Keen Eye",
      "Tangled Feet"
    ],
    "hiddenAbility": "Big Pecks",
    "sprite": "pidgey",
    "spriteId": "pidgey",
    "learnset": []
  },
  {
    "id": 17,
    "name": "Pidgeotto",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 63,
      "atk": 60,
      "def": 55,
      "spa": 50,
      "spd": 50,
      "spe": 71
    },
    "abilities": [
      "Keen Eye",
      "Tangled Feet"
    ],
    "hiddenAbility": "Big Pecks",
    "sprite": "pidgeotto",
    "spriteId": "pidgeotto",
    "learnset": []
  },
  {
    "id": 18,
    "name": "Pidgeot",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 83,
      "atk": 80,
      "def": 75,
      "spa": 70,
      "spd": 70,
      "spe": 101
    },
    "abilities": [
      "Keen Eye",
      "Tangled Feet"
    ],
    "hiddenAbility": "Big Pecks",
    "sprite": "pidgeot",
    "spriteId": "pidgeot",
    "learnset": []
  },
  {
    "id": 18,
    "name": "Pidgeot-Mega",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 83,
      "atk": 80,
      "def": 80,
      "spa": 135,
      "spd": 80,
      "spe": 121
    },
    "abilities": [
      "No Guard"
    ],
    "hiddenAbility": "",
    "sprite": "pidgeotmega",
    "spriteId": "pidgeot-mega",
    "learnset": []
  },
  {
    "id": 19,
    "name": "Rattata",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 30,
      "atk": 56,
      "def": 35,
      "spa": 25,
      "spd": 35,
      "spe": 72
    },
    "abilities": [
      "Run Away",
      "Guts"
    ],
    "hiddenAbility": "Hustle",
    "sprite": "rattata",
    "spriteId": "rattata",
    "learnset": []
  },
  {
    "id": 19,
    "name": "Rattata-Alola",
    "types": [
      "Dark",
      "Normal"
    ],
    "baseStats": {
      "hp": 30,
      "atk": 56,
      "def": 35,
      "spa": 25,
      "spd": 35,
      "spe": 72
    },
    "abilities": [
      "Gluttony",
      "Hustle"
    ],
    "hiddenAbility": "Thick Fat",
    "sprite": "rattataalola",
    "spriteId": "rattata-alola",
    "learnset": []
  },
  {
    "id": 20,
    "name": "Raticate",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 81,
      "def": 60,
      "spa": 50,
      "spd": 70,
      "spe": 97
    },
    "abilities": [
      "Run Away",
      "Guts"
    ],
    "hiddenAbility": "Hustle",
    "sprite": "raticate",
    "spriteId": "raticate",
    "learnset": []
  },
  {
    "id": 20,
    "name": "Raticate-Alola",
    "types": [
      "Dark",
      "Normal"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 71,
      "def": 70,
      "spa": 40,
      "spd": 80,
      "spe": 77
    },
    "abilities": [
      "Gluttony",
      "Hustle"
    ],
    "hiddenAbility": "Thick Fat",
    "sprite": "raticatealola",
    "spriteId": "raticate-alola",
    "learnset": []
  },
  {
    "id": 20,
    "name": "Raticate-Alola-Totem",
    "types": [
      "Dark",
      "Normal"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 71,
      "def": 70,
      "spa": 40,
      "spd": 80,
      "spe": 77
    },
    "abilities": [
      "Thick Fat"
    ],
    "hiddenAbility": "",
    "sprite": "raticatealolatotem",
    "spriteId": "raticate-alolatotem",
    "learnset": []
  },
  {
    "id": 21,
    "name": "Spearow",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 60,
      "def": 30,
      "spa": 31,
      "spd": 31,
      "spe": 70
    },
    "abilities": [
      "Keen Eye"
    ],
    "hiddenAbility": "Sniper",
    "sprite": "spearow",
    "spriteId": "spearow",
    "learnset": []
  },
  {
    "id": 22,
    "name": "Fearow",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 90,
      "def": 65,
      "spa": 61,
      "spd": 61,
      "spe": 100
    },
    "abilities": [
      "Keen Eye"
    ],
    "hiddenAbility": "Sniper",
    "sprite": "fearow",
    "spriteId": "fearow",
    "learnset": []
  },
  {
    "id": 23,
    "name": "Ekans",
    "types": [
      "Poison"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 60,
      "def": 44,
      "spa": 40,
      "spd": 54,
      "spe": 55
    },
    "abilities": [
      "Intimidate",
      "Shed Skin"
    ],
    "hiddenAbility": "Unnerve",
    "sprite": "ekans",
    "spriteId": "ekans",
    "learnset": []
  },
  {
    "id": 24,
    "name": "Arbok",
    "types": [
      "Poison"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 95,
      "def": 69,
      "spa": 65,
      "spd": 79,
      "spe": 80
    },
    "abilities": [
      "Intimidate",
      "Shed Skin"
    ],
    "hiddenAbility": "Unnerve",
    "sprite": "arbok",
    "spriteId": "arbok",
    "learnset": []
  },
  {
    "id": 25,
    "name": "Pikachu",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 55,
      "def": 40,
      "spa": 50,
      "spd": 50,
      "spe": 90
    },
    "abilities": [
      "Static"
    ],
    "hiddenAbility": "Lightning Rod",
    "sprite": "pikachu",
    "spriteId": "pikachu",
    "learnset": []
  },
  {
    "id": 25,
    "name": "Pikachu-Cosplay",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 55,
      "def": 40,
      "spa": 50,
      "spd": 50,
      "spe": 90
    },
    "abilities": [
      "Lightning Rod"
    ],
    "hiddenAbility": "",
    "sprite": "pikachucosplay",
    "spriteId": "pikachu-cosplay",
    "learnset": []
  },
  {
    "id": 25,
    "name": "Pikachu-Rock-Star",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 55,
      "def": 40,
      "spa": 50,
      "spd": 50,
      "spe": 90
    },
    "abilities": [
      "Lightning Rod"
    ],
    "hiddenAbility": "",
    "sprite": "pikachurockstar",
    "spriteId": "pikachu-rockstar",
    "learnset": []
  },
  {
    "id": 25,
    "name": "Pikachu-Belle",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 55,
      "def": 40,
      "spa": 50,
      "spd": 50,
      "spe": 90
    },
    "abilities": [
      "Lightning Rod"
    ],
    "hiddenAbility": "",
    "sprite": "pikachubelle",
    "spriteId": "pikachu-belle",
    "learnset": []
  },
  {
    "id": 25,
    "name": "Pikachu-Pop-Star",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 55,
      "def": 40,
      "spa": 50,
      "spd": 50,
      "spe": 90
    },
    "abilities": [
      "Lightning Rod"
    ],
    "hiddenAbility": "",
    "sprite": "pikachupopstar",
    "spriteId": "pikachu-popstar",
    "learnset": []
  },
  {
    "id": 25,
    "name": "Pikachu-PhD",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 55,
      "def": 40,
      "spa": 50,
      "spd": 50,
      "spe": 90
    },
    "abilities": [
      "Lightning Rod"
    ],
    "hiddenAbility": "",
    "sprite": "pikachuphd",
    "spriteId": "pikachu-phd",
    "learnset": []
  },
  {
    "id": 25,
    "name": "Pikachu-Libre",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 55,
      "def": 40,
      "spa": 50,
      "spd": 50,
      "spe": 90
    },
    "abilities": [
      "Lightning Rod"
    ],
    "hiddenAbility": "",
    "sprite": "pikachulibre",
    "spriteId": "pikachu-libre",
    "learnset": []
  },
  {
    "id": 25,
    "name": "Pikachu-Original",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 55,
      "def": 40,
      "spa": 50,
      "spd": 50,
      "spe": 90
    },
    "abilities": [
      "Static"
    ],
    "hiddenAbility": "Lightning Rod",
    "sprite": "pikachuoriginal",
    "spriteId": "pikachu-original",
    "learnset": []
  },
  {
    "id": 25,
    "name": "Pikachu-Hoenn",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 55,
      "def": 40,
      "spa": 50,
      "spd": 50,
      "spe": 90
    },
    "abilities": [
      "Static"
    ],
    "hiddenAbility": "Lightning Rod",
    "sprite": "pikachuhoenn",
    "spriteId": "pikachu-hoenn",
    "learnset": []
  },
  {
    "id": 25,
    "name": "Pikachu-Sinnoh",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 55,
      "def": 40,
      "spa": 50,
      "spd": 50,
      "spe": 90
    },
    "abilities": [
      "Static"
    ],
    "hiddenAbility": "Lightning Rod",
    "sprite": "pikachusinnoh",
    "spriteId": "pikachu-sinnoh",
    "learnset": []
  },
  {
    "id": 25,
    "name": "Pikachu-Unova",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 55,
      "def": 40,
      "spa": 50,
      "spd": 50,
      "spe": 90
    },
    "abilities": [
      "Static"
    ],
    "hiddenAbility": "Lightning Rod",
    "sprite": "pikachuunova",
    "spriteId": "pikachu-unova",
    "learnset": []
  },
  {
    "id": 25,
    "name": "Pikachu-Kalos",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 55,
      "def": 40,
      "spa": 50,
      "spd": 50,
      "spe": 90
    },
    "abilities": [
      "Static"
    ],
    "hiddenAbility": "Lightning Rod",
    "sprite": "pikachukalos",
    "spriteId": "pikachu-kalos",
    "learnset": []
  },
  {
    "id": 25,
    "name": "Pikachu-Alola",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 55,
      "def": 40,
      "spa": 50,
      "spd": 50,
      "spe": 90
    },
    "abilities": [
      "Static"
    ],
    "hiddenAbility": "Lightning Rod",
    "sprite": "pikachualola",
    "spriteId": "pikachu-alola",
    "learnset": []
  },
  {
    "id": 25,
    "name": "Pikachu-Partner",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 55,
      "def": 40,
      "spa": 50,
      "spd": 50,
      "spe": 90
    },
    "abilities": [
      "Static"
    ],
    "hiddenAbility": "Lightning Rod",
    "sprite": "pikachupartner",
    "spriteId": "pikachu-partner",
    "learnset": []
  },
  {
    "id": 25,
    "name": "Pikachu-Starter",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 80,
      "def": 50,
      "spa": 75,
      "spd": 60,
      "spe": 120
    },
    "abilities": [
      "Static"
    ],
    "hiddenAbility": "Lightning Rod",
    "sprite": "pikachustarter",
    "spriteId": "pikachu-starter",
    "learnset": []
  },
  {
    "id": 25,
    "name": "Pikachu-Gmax",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 55,
      "def": 40,
      "spa": 50,
      "spd": 50,
      "spe": 90
    },
    "abilities": [
      "Static"
    ],
    "hiddenAbility": "Lightning Rod",
    "sprite": "pikachugmax",
    "spriteId": "pikachu-gmax",
    "learnset": []
  },
  {
    "id": 25,
    "name": "Pikachu-World",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 55,
      "def": 40,
      "spa": 50,
      "spd": 50,
      "spe": 90
    },
    "abilities": [
      "Static"
    ],
    "hiddenAbility": "Lightning Rod",
    "sprite": "pikachuworld",
    "spriteId": "pikachu-world",
    "learnset": []
  },
  {
    "id": 26,
    "name": "Raichu",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 90,
      "def": 55,
      "spa": 90,
      "spd": 80,
      "spe": 110
    },
    "abilities": [
      "Static"
    ],
    "hiddenAbility": "Lightning Rod",
    "sprite": "raichu",
    "spriteId": "raichu",
    "learnset": []
  },
  {
    "id": 26,
    "name": "Raichu-Alola",
    "types": [
      "Electric",
      "Psychic"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 85,
      "def": 50,
      "spa": 95,
      "spd": 85,
      "spe": 110
    },
    "abilities": [
      "Surge Surfer"
    ],
    "hiddenAbility": "",
    "sprite": "raichualola",
    "spriteId": "raichu-alola",
    "learnset": []
  },
  {
    "id": 26,
    "name": "Raichu-Mega-X",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 135,
      "def": 95,
      "spa": 90,
      "spd": 95,
      "spe": 110
    },
    "abilities": [
      "Electric Surge"
    ],
    "hiddenAbility": "",
    "sprite": "raichumegax",
    "spriteId": "raichu-megax",
    "learnset": []
  },
  {
    "id": 26,
    "name": "Raichu-Mega-Y",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 100,
      "def": 55,
      "spa": 160,
      "spd": 80,
      "spe": 130
    },
    "abilities": [
      "No Guard"
    ],
    "hiddenAbility": "",
    "sprite": "raichumegay",
    "spriteId": "raichu-megay",
    "learnset": []
  },
  {
    "id": 27,
    "name": "Sandshrew",
    "types": [
      "Ground"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 75,
      "def": 85,
      "spa": 20,
      "spd": 30,
      "spe": 40
    },
    "abilities": [
      "Sand Veil"
    ],
    "hiddenAbility": "Sand Rush",
    "sprite": "sandshrew",
    "spriteId": "sandshrew",
    "learnset": []
  },
  {
    "id": 27,
    "name": "Sandshrew-Alola",
    "types": [
      "Ice",
      "Steel"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 75,
      "def": 90,
      "spa": 10,
      "spd": 35,
      "spe": 40
    },
    "abilities": [
      "Snow Cloak"
    ],
    "hiddenAbility": "Slush Rush",
    "sprite": "sandshrewalola",
    "spriteId": "sandshrew-alola",
    "learnset": []
  },
  {
    "id": 28,
    "name": "Sandslash",
    "types": [
      "Ground"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 100,
      "def": 110,
      "spa": 45,
      "spd": 55,
      "spe": 65
    },
    "abilities": [
      "Sand Veil"
    ],
    "hiddenAbility": "Sand Rush",
    "sprite": "sandslash",
    "spriteId": "sandslash",
    "learnset": []
  },
  {
    "id": 28,
    "name": "Sandslash-Alola",
    "types": [
      "Ice",
      "Steel"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 100,
      "def": 120,
      "spa": 25,
      "spd": 65,
      "spe": 65
    },
    "abilities": [
      "Snow Cloak"
    ],
    "hiddenAbility": "Slush Rush",
    "sprite": "sandslashalola",
    "spriteId": "sandslash-alola",
    "learnset": []
  },
  {
    "id": 29,
    "name": "Nidoran-F",
    "types": [
      "Poison"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 47,
      "def": 52,
      "spa": 40,
      "spd": 40,
      "spe": 41
    },
    "abilities": [
      "Poison Point",
      "Rivalry"
    ],
    "hiddenAbility": "Hustle",
    "sprite": "nidoranf",
    "spriteId": "nidoranf",
    "learnset": []
  },
  {
    "id": 30,
    "name": "Nidorina",
    "types": [
      "Poison"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 62,
      "def": 67,
      "spa": 55,
      "spd": 55,
      "spe": 56
    },
    "abilities": [
      "Poison Point",
      "Rivalry"
    ],
    "hiddenAbility": "Hustle",
    "sprite": "nidorina",
    "spriteId": "nidorina",
    "learnset": []
  },
  {
    "id": 31,
    "name": "Nidoqueen",
    "types": [
      "Poison",
      "Ground"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 92,
      "def": 87,
      "spa": 75,
      "spd": 85,
      "spe": 76
    },
    "abilities": [
      "Poison Point",
      "Rivalry"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "nidoqueen",
    "spriteId": "nidoqueen",
    "learnset": []
  },
  {
    "id": 32,
    "name": "Nidoran-M",
    "types": [
      "Poison"
    ],
    "baseStats": {
      "hp": 46,
      "atk": 57,
      "def": 40,
      "spa": 40,
      "spd": 40,
      "spe": 50
    },
    "abilities": [
      "Poison Point",
      "Rivalry"
    ],
    "hiddenAbility": "Hustle",
    "sprite": "nidoranm",
    "spriteId": "nidoranm",
    "learnset": []
  },
  {
    "id": 33,
    "name": "Nidorino",
    "types": [
      "Poison"
    ],
    "baseStats": {
      "hp": 61,
      "atk": 72,
      "def": 57,
      "spa": 55,
      "spd": 55,
      "spe": 65
    },
    "abilities": [
      "Poison Point",
      "Rivalry"
    ],
    "hiddenAbility": "Hustle",
    "sprite": "nidorino",
    "spriteId": "nidorino",
    "learnset": []
  },
  {
    "id": 34,
    "name": "Nidoking",
    "types": [
      "Poison",
      "Ground"
    ],
    "baseStats": {
      "hp": 81,
      "atk": 102,
      "def": 77,
      "spa": 85,
      "spd": 75,
      "spe": 85
    },
    "abilities": [
      "Poison Point",
      "Rivalry"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "nidoking",
    "spriteId": "nidoking",
    "learnset": []
  },
  {
    "id": 35,
    "name": "Clefairy",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 45,
      "def": 48,
      "spa": 60,
      "spd": 65,
      "spe": 35
    },
    "abilities": [
      "Cute Charm",
      "Magic Guard"
    ],
    "hiddenAbility": "Friend Guard",
    "sprite": "clefairy",
    "spriteId": "clefairy",
    "learnset": []
  },
  {
    "id": 36,
    "name": "Clefable",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 70,
      "def": 73,
      "spa": 95,
      "spd": 90,
      "spe": 60
    },
    "abilities": [
      "Cute Charm",
      "Magic Guard"
    ],
    "hiddenAbility": "Unaware",
    "sprite": "clefable",
    "spriteId": "clefable",
    "learnset": []
  },
  {
    "id": 36,
    "name": "Clefable-Mega",
    "types": [
      "Fairy",
      "Flying"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 80,
      "def": 93,
      "spa": 135,
      "spd": 110,
      "spe": 70
    },
    "abilities": [
      "Magic Bounce"
    ],
    "hiddenAbility": "",
    "sprite": "clefablemega",
    "spriteId": "clefable-mega",
    "learnset": []
  },
  {
    "id": 37,
    "name": "Vulpix",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 38,
      "atk": 41,
      "def": 40,
      "spa": 50,
      "spd": 65,
      "spe": 65
    },
    "abilities": [
      "Flash Fire"
    ],
    "hiddenAbility": "Drought",
    "sprite": "vulpix",
    "spriteId": "vulpix",
    "learnset": []
  },
  {
    "id": 37,
    "name": "Vulpix-Alola",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 38,
      "atk": 41,
      "def": 40,
      "spa": 50,
      "spd": 65,
      "spe": 65
    },
    "abilities": [
      "Snow Cloak"
    ],
    "hiddenAbility": "Snow Warning",
    "sprite": "vulpixalola",
    "spriteId": "vulpix-alola",
    "learnset": []
  },
  {
    "id": 38,
    "name": "Ninetales",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 73,
      "atk": 76,
      "def": 75,
      "spa": 81,
      "spd": 100,
      "spe": 100
    },
    "abilities": [
      "Flash Fire"
    ],
    "hiddenAbility": "Drought",
    "sprite": "ninetales",
    "spriteId": "ninetales",
    "learnset": []
  },
  {
    "id": 38,
    "name": "Ninetales-Alola",
    "types": [
      "Ice",
      "Fairy"
    ],
    "baseStats": {
      "hp": 73,
      "atk": 67,
      "def": 75,
      "spa": 81,
      "spd": 100,
      "spe": 109
    },
    "abilities": [
      "Snow Cloak"
    ],
    "hiddenAbility": "Snow Warning",
    "sprite": "ninetalesalola",
    "spriteId": "ninetales-alola",
    "learnset": []
  },
  {
    "id": 39,
    "name": "Jigglypuff",
    "types": [
      "Normal",
      "Fairy"
    ],
    "baseStats": {
      "hp": 115,
      "atk": 45,
      "def": 20,
      "spa": 45,
      "spd": 25,
      "spe": 20
    },
    "abilities": [
      "Cute Charm",
      "Competitive"
    ],
    "hiddenAbility": "Friend Guard",
    "sprite": "jigglypuff",
    "spriteId": "jigglypuff",
    "learnset": []
  },
  {
    "id": 40,
    "name": "Wigglytuff",
    "types": [
      "Normal",
      "Fairy"
    ],
    "baseStats": {
      "hp": 140,
      "atk": 70,
      "def": 45,
      "spa": 85,
      "spd": 50,
      "spe": 45
    },
    "abilities": [
      "Cute Charm",
      "Competitive"
    ],
    "hiddenAbility": "Frisk",
    "sprite": "wigglytuff",
    "spriteId": "wigglytuff",
    "learnset": []
  },
  {
    "id": 41,
    "name": "Zubat",
    "types": [
      "Poison",
      "Flying"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 45,
      "def": 35,
      "spa": 30,
      "spd": 40,
      "spe": 55
    },
    "abilities": [
      "Inner Focus"
    ],
    "hiddenAbility": "Infiltrator",
    "sprite": "zubat",
    "spriteId": "zubat",
    "learnset": []
  },
  {
    "id": 42,
    "name": "Golbat",
    "types": [
      "Poison",
      "Flying"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 80,
      "def": 70,
      "spa": 65,
      "spd": 75,
      "spe": 90
    },
    "abilities": [
      "Inner Focus"
    ],
    "hiddenAbility": "Infiltrator",
    "sprite": "golbat",
    "spriteId": "golbat",
    "learnset": []
  },
  {
    "id": 43,
    "name": "Oddish",
    "types": [
      "Grass",
      "Poison"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 50,
      "def": 55,
      "spa": 75,
      "spd": 65,
      "spe": 30
    },
    "abilities": [
      "Chlorophyll"
    ],
    "hiddenAbility": "Run Away",
    "sprite": "oddish",
    "spriteId": "oddish",
    "learnset": []
  },
  {
    "id": 44,
    "name": "Gloom",
    "types": [
      "Grass",
      "Poison"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 65,
      "def": 70,
      "spa": 85,
      "spd": 75,
      "spe": 40
    },
    "abilities": [
      "Chlorophyll"
    ],
    "hiddenAbility": "Stench",
    "sprite": "gloom",
    "spriteId": "gloom",
    "learnset": []
  },
  {
    "id": 45,
    "name": "Vileplume",
    "types": [
      "Grass",
      "Poison"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 80,
      "def": 85,
      "spa": 110,
      "spd": 90,
      "spe": 50
    },
    "abilities": [
      "Chlorophyll"
    ],
    "hiddenAbility": "Effect Spore",
    "sprite": "vileplume",
    "spriteId": "vileplume",
    "learnset": []
  },
  {
    "id": 46,
    "name": "Paras",
    "types": [
      "Bug",
      "Grass"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 70,
      "def": 55,
      "spa": 45,
      "spd": 55,
      "spe": 25
    },
    "abilities": [
      "Effect Spore",
      "Dry Skin"
    ],
    "hiddenAbility": "Damp",
    "sprite": "paras",
    "spriteId": "paras",
    "learnset": []
  },
  {
    "id": 47,
    "name": "Parasect",
    "types": [
      "Bug",
      "Grass"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 95,
      "def": 80,
      "spa": 60,
      "spd": 80,
      "spe": 30
    },
    "abilities": [
      "Effect Spore",
      "Dry Skin"
    ],
    "hiddenAbility": "Damp",
    "sprite": "parasect",
    "spriteId": "parasect",
    "learnset": []
  },
  {
    "id": 48,
    "name": "Venonat",
    "types": [
      "Bug",
      "Poison"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 55,
      "def": 50,
      "spa": 40,
      "spd": 55,
      "spe": 45
    },
    "abilities": [
      "Compound Eyes",
      "Tinted Lens"
    ],
    "hiddenAbility": "Run Away",
    "sprite": "venonat",
    "spriteId": "venonat",
    "learnset": []
  },
  {
    "id": 49,
    "name": "Venomoth",
    "types": [
      "Bug",
      "Poison"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 65,
      "def": 60,
      "spa": 90,
      "spd": 75,
      "spe": 90
    },
    "abilities": [
      "Shield Dust",
      "Tinted Lens"
    ],
    "hiddenAbility": "Wonder Skin",
    "sprite": "venomoth",
    "spriteId": "venomoth",
    "learnset": []
  },
  {
    "id": 50,
    "name": "Diglett",
    "types": [
      "Ground"
    ],
    "baseStats": {
      "hp": 10,
      "atk": 55,
      "def": 25,
      "spa": 35,
      "spd": 45,
      "spe": 95
    },
    "abilities": [
      "Sand Veil",
      "Arena Trap"
    ],
    "hiddenAbility": "Sand Force",
    "sprite": "diglett",
    "spriteId": "diglett",
    "learnset": []
  },
  {
    "id": 50,
    "name": "Diglett-Alola",
    "types": [
      "Ground",
      "Steel"
    ],
    "baseStats": {
      "hp": 10,
      "atk": 55,
      "def": 30,
      "spa": 35,
      "spd": 45,
      "spe": 90
    },
    "abilities": [
      "Sand Veil",
      "Tangling Hair"
    ],
    "hiddenAbility": "Sand Force",
    "sprite": "diglettalola",
    "spriteId": "diglett-alola",
    "learnset": []
  },
  {
    "id": 51,
    "name": "Dugtrio",
    "types": [
      "Ground"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 100,
      "def": 50,
      "spa": 50,
      "spd": 70,
      "spe": 120
    },
    "abilities": [
      "Sand Veil",
      "Arena Trap"
    ],
    "hiddenAbility": "Sand Force",
    "sprite": "dugtrio",
    "spriteId": "dugtrio",
    "learnset": []
  },
  {
    "id": 51,
    "name": "Dugtrio-Alola",
    "types": [
      "Ground",
      "Steel"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 100,
      "def": 60,
      "spa": 50,
      "spd": 70,
      "spe": 110
    },
    "abilities": [
      "Sand Veil",
      "Tangling Hair"
    ],
    "hiddenAbility": "Sand Force",
    "sprite": "dugtrioalola",
    "spriteId": "dugtrio-alola",
    "learnset": []
  },
  {
    "id": 52,
    "name": "Meowth",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 45,
      "def": 35,
      "spa": 40,
      "spd": 40,
      "spe": 90
    },
    "abilities": [
      "Pickup",
      "Technician"
    ],
    "hiddenAbility": "Unnerve",
    "sprite": "meowth",
    "spriteId": "meowth",
    "learnset": []
  },
  {
    "id": 52,
    "name": "Meowth-Alola",
    "types": [
      "Dark"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 35,
      "def": 35,
      "spa": 50,
      "spd": 40,
      "spe": 90
    },
    "abilities": [
      "Pickup",
      "Technician"
    ],
    "hiddenAbility": "Rattled",
    "sprite": "meowthalola",
    "spriteId": "meowth-alola",
    "learnset": []
  },
  {
    "id": 52,
    "name": "Meowth-Galar",
    "types": [
      "Steel"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 65,
      "def": 55,
      "spa": 40,
      "spd": 40,
      "spe": 40
    },
    "abilities": [
      "Pickup",
      "Tough Claws"
    ],
    "hiddenAbility": "Unnerve",
    "sprite": "meowthgalar",
    "spriteId": "meowth-galar",
    "learnset": []
  },
  {
    "id": 52,
    "name": "Meowth-Gmax",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 45,
      "def": 35,
      "spa": 40,
      "spd": 40,
      "spe": 90
    },
    "abilities": [
      "Pickup",
      "Technician"
    ],
    "hiddenAbility": "Unnerve",
    "sprite": "meowthgmax",
    "spriteId": "meowth-gmax",
    "learnset": []
  },
  {
    "id": 53,
    "name": "Persian",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 70,
      "def": 60,
      "spa": 65,
      "spd": 65,
      "spe": 115
    },
    "abilities": [
      "Limber",
      "Technician"
    ],
    "hiddenAbility": "Unnerve",
    "sprite": "persian",
    "spriteId": "persian",
    "learnset": []
  },
  {
    "id": 53,
    "name": "Persian-Alola",
    "types": [
      "Dark"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 60,
      "def": 60,
      "spa": 75,
      "spd": 65,
      "spe": 115
    },
    "abilities": [
      "Fur Coat",
      "Technician"
    ],
    "hiddenAbility": "Rattled",
    "sprite": "persianalola",
    "spriteId": "persian-alola",
    "learnset": []
  },
  {
    "id": 54,
    "name": "Psyduck",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 52,
      "def": 48,
      "spa": 65,
      "spd": 50,
      "spe": 55
    },
    "abilities": [
      "Damp",
      "Cloud Nine"
    ],
    "hiddenAbility": "Swift Swim",
    "sprite": "psyduck",
    "spriteId": "psyduck",
    "learnset": []
  },
  {
    "id": 55,
    "name": "Golduck",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 82,
      "def": 78,
      "spa": 95,
      "spd": 80,
      "spe": 85
    },
    "abilities": [
      "Damp",
      "Cloud Nine"
    ],
    "hiddenAbility": "Swift Swim",
    "sprite": "golduck",
    "spriteId": "golduck",
    "learnset": []
  },
  {
    "id": 56,
    "name": "Mankey",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 80,
      "def": 35,
      "spa": 35,
      "spd": 45,
      "spe": 70
    },
    "abilities": [
      "Vital Spirit",
      "Anger Point"
    ],
    "hiddenAbility": "Defiant",
    "sprite": "mankey",
    "spriteId": "mankey",
    "learnset": []
  },
  {
    "id": 57,
    "name": "Primeape",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 105,
      "def": 60,
      "spa": 60,
      "spd": 70,
      "spe": 95
    },
    "abilities": [
      "Vital Spirit",
      "Anger Point"
    ],
    "hiddenAbility": "Defiant",
    "sprite": "primeape",
    "spriteId": "primeape",
    "learnset": []
  },
  {
    "id": 58,
    "name": "Growlithe",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 70,
      "def": 45,
      "spa": 70,
      "spd": 50,
      "spe": 60
    },
    "abilities": [
      "Intimidate",
      "Flash Fire"
    ],
    "hiddenAbility": "Justified",
    "sprite": "growlithe",
    "spriteId": "growlithe",
    "learnset": []
  },
  {
    "id": 58,
    "name": "Growlithe-Hisui",
    "types": [
      "Fire",
      "Rock"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 75,
      "def": 45,
      "spa": 65,
      "spd": 50,
      "spe": 55
    },
    "abilities": [
      "Intimidate",
      "Flash Fire"
    ],
    "hiddenAbility": "Rock Head",
    "sprite": "growlithehisui",
    "spriteId": "growlithe-hisui",
    "learnset": []
  },
  {
    "id": 59,
    "name": "Arcanine",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 110,
      "def": 80,
      "spa": 100,
      "spd": 80,
      "spe": 95
    },
    "abilities": [
      "Intimidate",
      "Flash Fire"
    ],
    "hiddenAbility": "Justified",
    "sprite": "arcanine",
    "spriteId": "arcanine",
    "learnset": []
  },
  {
    "id": 59,
    "name": "Arcanine-Hisui",
    "types": [
      "Fire",
      "Rock"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 115,
      "def": 80,
      "spa": 95,
      "spd": 80,
      "spe": 90
    },
    "abilities": [
      "Intimidate",
      "Flash Fire"
    ],
    "hiddenAbility": "Rock Head",
    "sprite": "arcaninehisui",
    "spriteId": "arcanine-hisui",
    "learnset": []
  },
  {
    "id": 60,
    "name": "Poliwag",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 50,
      "def": 40,
      "spa": 40,
      "spd": 40,
      "spe": 90
    },
    "abilities": [
      "Water Absorb",
      "Damp"
    ],
    "hiddenAbility": "Swift Swim",
    "sprite": "poliwag",
    "spriteId": "poliwag",
    "learnset": []
  },
  {
    "id": 61,
    "name": "Poliwhirl",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 65,
      "def": 65,
      "spa": 50,
      "spd": 50,
      "spe": 90
    },
    "abilities": [
      "Water Absorb",
      "Damp"
    ],
    "hiddenAbility": "Swift Swim",
    "sprite": "poliwhirl",
    "spriteId": "poliwhirl",
    "learnset": []
  },
  {
    "id": 62,
    "name": "Poliwrath",
    "types": [
      "Water",
      "Fighting"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 95,
      "def": 95,
      "spa": 70,
      "spd": 90,
      "spe": 70
    },
    "abilities": [
      "Water Absorb",
      "Damp"
    ],
    "hiddenAbility": "Swift Swim",
    "sprite": "poliwrath",
    "spriteId": "poliwrath",
    "learnset": []
  },
  {
    "id": 63,
    "name": "Abra",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 25,
      "atk": 20,
      "def": 15,
      "spa": 105,
      "spd": 55,
      "spe": 90
    },
    "abilities": [
      "Synchronize",
      "Inner Focus"
    ],
    "hiddenAbility": "Magic Guard",
    "sprite": "abra",
    "spriteId": "abra",
    "learnset": []
  },
  {
    "id": 64,
    "name": "Kadabra",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 35,
      "def": 30,
      "spa": 120,
      "spd": 70,
      "spe": 105
    },
    "abilities": [
      "Synchronize",
      "Inner Focus"
    ],
    "hiddenAbility": "Magic Guard",
    "sprite": "kadabra",
    "spriteId": "kadabra",
    "learnset": []
  },
  {
    "id": 65,
    "name": "Alakazam",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 50,
      "def": 45,
      "spa": 135,
      "spd": 95,
      "spe": 120
    },
    "abilities": [
      "Synchronize",
      "Inner Focus"
    ],
    "hiddenAbility": "Magic Guard",
    "sprite": "alakazam",
    "spriteId": "alakazam",
    "learnset": []
  },
  {
    "id": 65,
    "name": "Alakazam-Mega",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 50,
      "def": 65,
      "spa": 175,
      "spd": 105,
      "spe": 150
    },
    "abilities": [
      "Trace"
    ],
    "hiddenAbility": "",
    "sprite": "alakazammega",
    "spriteId": "alakazam-mega",
    "learnset": []
  },
  {
    "id": 66,
    "name": "Machop",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 80,
      "def": 50,
      "spa": 35,
      "spd": 35,
      "spe": 35
    },
    "abilities": [
      "Guts",
      "No Guard"
    ],
    "hiddenAbility": "Steadfast",
    "sprite": "machop",
    "spriteId": "machop",
    "learnset": []
  },
  {
    "id": 67,
    "name": "Machoke",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 100,
      "def": 70,
      "spa": 50,
      "spd": 60,
      "spe": 45
    },
    "abilities": [
      "Guts",
      "No Guard"
    ],
    "hiddenAbility": "Steadfast",
    "sprite": "machoke",
    "spriteId": "machoke",
    "learnset": []
  },
  {
    "id": 68,
    "name": "Machamp",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 130,
      "def": 80,
      "spa": 65,
      "spd": 85,
      "spe": 55
    },
    "abilities": [
      "Guts",
      "No Guard"
    ],
    "hiddenAbility": "Steadfast",
    "sprite": "machamp",
    "spriteId": "machamp",
    "learnset": []
  },
  {
    "id": 68,
    "name": "Machamp-Gmax",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 130,
      "def": 80,
      "spa": 65,
      "spd": 85,
      "spe": 55
    },
    "abilities": [
      "Guts",
      "No Guard"
    ],
    "hiddenAbility": "Steadfast",
    "sprite": "machampgmax",
    "spriteId": "machamp-gmax",
    "learnset": []
  },
  {
    "id": 69,
    "name": "Bellsprout",
    "types": [
      "Grass",
      "Poison"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 75,
      "def": 35,
      "spa": 70,
      "spd": 30,
      "spe": 40
    },
    "abilities": [
      "Chlorophyll"
    ],
    "hiddenAbility": "Gluttony",
    "sprite": "bellsprout",
    "spriteId": "bellsprout",
    "learnset": []
  },
  {
    "id": 70,
    "name": "Weepinbell",
    "types": [
      "Grass",
      "Poison"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 90,
      "def": 50,
      "spa": 85,
      "spd": 45,
      "spe": 55
    },
    "abilities": [
      "Chlorophyll"
    ],
    "hiddenAbility": "Gluttony",
    "sprite": "weepinbell",
    "spriteId": "weepinbell",
    "learnset": []
  },
  {
    "id": 71,
    "name": "Victreebel",
    "types": [
      "Grass",
      "Poison"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 105,
      "def": 65,
      "spa": 100,
      "spd": 70,
      "spe": 70
    },
    "abilities": [
      "Chlorophyll"
    ],
    "hiddenAbility": "Gluttony",
    "sprite": "victreebel",
    "spriteId": "victreebel",
    "learnset": []
  },
  {
    "id": 71,
    "name": "Victreebel-Mega",
    "types": [
      "Grass",
      "Poison"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 125,
      "def": 85,
      "spa": 135,
      "spd": 95,
      "spe": 70
    },
    "abilities": [
      "Innards Out"
    ],
    "hiddenAbility": "",
    "sprite": "victreebelmega",
    "spriteId": "victreebel-mega",
    "learnset": []
  },
  {
    "id": 72,
    "name": "Tentacool",
    "types": [
      "Water",
      "Poison"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 40,
      "def": 35,
      "spa": 50,
      "spd": 100,
      "spe": 70
    },
    "abilities": [
      "Clear Body",
      "Liquid Ooze"
    ],
    "hiddenAbility": "Rain Dish",
    "sprite": "tentacool",
    "spriteId": "tentacool",
    "learnset": []
  },
  {
    "id": 73,
    "name": "Tentacruel",
    "types": [
      "Water",
      "Poison"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 70,
      "def": 65,
      "spa": 80,
      "spd": 120,
      "spe": 100
    },
    "abilities": [
      "Clear Body",
      "Liquid Ooze"
    ],
    "hiddenAbility": "Rain Dish",
    "sprite": "tentacruel",
    "spriteId": "tentacruel",
    "learnset": []
  },
  {
    "id": 74,
    "name": "Geodude",
    "types": [
      "Rock",
      "Ground"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 80,
      "def": 100,
      "spa": 30,
      "spd": 30,
      "spe": 20
    },
    "abilities": [
      "Rock Head",
      "Sturdy"
    ],
    "hiddenAbility": "Sand Veil",
    "sprite": "geodude",
    "spriteId": "geodude",
    "learnset": []
  },
  {
    "id": 74,
    "name": "Geodude-Alola",
    "types": [
      "Rock",
      "Electric"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 80,
      "def": 100,
      "spa": 30,
      "spd": 30,
      "spe": 20
    },
    "abilities": [
      "Magnet Pull",
      "Sturdy"
    ],
    "hiddenAbility": "Galvanize",
    "sprite": "geodudealola",
    "spriteId": "geodude-alola",
    "learnset": []
  },
  {
    "id": 75,
    "name": "Graveler",
    "types": [
      "Rock",
      "Ground"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 95,
      "def": 115,
      "spa": 45,
      "spd": 45,
      "spe": 35
    },
    "abilities": [
      "Rock Head",
      "Sturdy"
    ],
    "hiddenAbility": "Sand Veil",
    "sprite": "graveler",
    "spriteId": "graveler",
    "learnset": []
  },
  {
    "id": 75,
    "name": "Graveler-Alola",
    "types": [
      "Rock",
      "Electric"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 95,
      "def": 115,
      "spa": 45,
      "spd": 45,
      "spe": 35
    },
    "abilities": [
      "Magnet Pull",
      "Sturdy"
    ],
    "hiddenAbility": "Galvanize",
    "sprite": "graveleralola",
    "spriteId": "graveler-alola",
    "learnset": []
  },
  {
    "id": 76,
    "name": "Golem",
    "types": [
      "Rock",
      "Ground"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 120,
      "def": 130,
      "spa": 55,
      "spd": 65,
      "spe": 45
    },
    "abilities": [
      "Rock Head",
      "Sturdy"
    ],
    "hiddenAbility": "Sand Veil",
    "sprite": "golem",
    "spriteId": "golem",
    "learnset": []
  },
  {
    "id": 76,
    "name": "Golem-Alola",
    "types": [
      "Rock",
      "Electric"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 120,
      "def": 130,
      "spa": 55,
      "spd": 65,
      "spe": 45
    },
    "abilities": [
      "Magnet Pull",
      "Sturdy"
    ],
    "hiddenAbility": "Galvanize",
    "sprite": "golemalola",
    "spriteId": "golem-alola",
    "learnset": []
  },
  {
    "id": 77,
    "name": "Ponyta",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 85,
      "def": 55,
      "spa": 65,
      "spd": 65,
      "spe": 90
    },
    "abilities": [
      "Run Away",
      "Flash Fire"
    ],
    "hiddenAbility": "Flame Body",
    "sprite": "ponyta",
    "spriteId": "ponyta",
    "learnset": []
  },
  {
    "id": 77,
    "name": "Ponyta-Galar",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 85,
      "def": 55,
      "spa": 65,
      "spd": 65,
      "spe": 90
    },
    "abilities": [
      "Run Away",
      "Pastel Veil"
    ],
    "hiddenAbility": "Anticipation",
    "sprite": "ponytagalar",
    "spriteId": "ponyta-galar",
    "learnset": []
  },
  {
    "id": 78,
    "name": "Rapidash",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 100,
      "def": 70,
      "spa": 80,
      "spd": 80,
      "spe": 105
    },
    "abilities": [
      "Run Away",
      "Flash Fire"
    ],
    "hiddenAbility": "Flame Body",
    "sprite": "rapidash",
    "spriteId": "rapidash",
    "learnset": []
  },
  {
    "id": 78,
    "name": "Rapidash-Galar",
    "types": [
      "Psychic",
      "Fairy"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 100,
      "def": 70,
      "spa": 80,
      "spd": 80,
      "spe": 105
    },
    "abilities": [
      "Run Away",
      "Pastel Veil"
    ],
    "hiddenAbility": "Anticipation",
    "sprite": "rapidashgalar",
    "spriteId": "rapidash-galar",
    "learnset": []
  },
  {
    "id": 79,
    "name": "Slowpoke",
    "types": [
      "Water",
      "Psychic"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 65,
      "def": 65,
      "spa": 40,
      "spd": 40,
      "spe": 15
    },
    "abilities": [
      "Oblivious",
      "Own Tempo"
    ],
    "hiddenAbility": "Regenerator",
    "sprite": "slowpoke",
    "spriteId": "slowpoke",
    "learnset": []
  },
  {
    "id": 79,
    "name": "Slowpoke-Galar",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 65,
      "def": 65,
      "spa": 40,
      "spd": 40,
      "spe": 15
    },
    "abilities": [
      "Gluttony",
      "Own Tempo"
    ],
    "hiddenAbility": "Regenerator",
    "sprite": "slowpokegalar",
    "spriteId": "slowpoke-galar",
    "learnset": []
  },
  {
    "id": 80,
    "name": "Slowbro",
    "types": [
      "Water",
      "Psychic"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 75,
      "def": 110,
      "spa": 100,
      "spd": 80,
      "spe": 30
    },
    "abilities": [
      "Oblivious",
      "Own Tempo"
    ],
    "hiddenAbility": "Regenerator",
    "sprite": "slowbro",
    "spriteId": "slowbro",
    "learnset": []
  },
  {
    "id": 80,
    "name": "Slowbro-Mega",
    "types": [
      "Water",
      "Psychic"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 75,
      "def": 180,
      "spa": 130,
      "spd": 80,
      "spe": 30
    },
    "abilities": [
      "Shell Armor"
    ],
    "hiddenAbility": "",
    "sprite": "slowbromega",
    "spriteId": "slowbro-mega",
    "learnset": []
  },
  {
    "id": 80,
    "name": "Slowbro-Galar",
    "types": [
      "Poison",
      "Psychic"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 100,
      "def": 95,
      "spa": 100,
      "spd": 70,
      "spe": 30
    },
    "abilities": [
      "Quick Draw",
      "Own Tempo"
    ],
    "hiddenAbility": "Regenerator",
    "sprite": "slowbrogalar",
    "spriteId": "slowbro-galar",
    "learnset": []
  },
  {
    "id": 81,
    "name": "Magnemite",
    "types": [
      "Electric",
      "Steel"
    ],
    "baseStats": {
      "hp": 25,
      "atk": 35,
      "def": 70,
      "spa": 95,
      "spd": 55,
      "spe": 45
    },
    "abilities": [
      "Magnet Pull",
      "Sturdy"
    ],
    "hiddenAbility": "Analytic",
    "sprite": "magnemite",
    "spriteId": "magnemite",
    "learnset": []
  },
  {
    "id": 82,
    "name": "Magneton",
    "types": [
      "Electric",
      "Steel"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 60,
      "def": 95,
      "spa": 120,
      "spd": 70,
      "spe": 70
    },
    "abilities": [
      "Magnet Pull",
      "Sturdy"
    ],
    "hiddenAbility": "Analytic",
    "sprite": "magneton",
    "spriteId": "magneton",
    "learnset": []
  },
  {
    "id": 83,
    "name": "Farfetch’d",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 52,
      "atk": 90,
      "def": 55,
      "spa": 58,
      "spd": 62,
      "spe": 60
    },
    "abilities": [
      "Keen Eye",
      "Inner Focus"
    ],
    "hiddenAbility": "Defiant",
    "sprite": "farfetchd",
    "spriteId": "farfetchd",
    "learnset": []
  },
  {
    "id": 83,
    "name": "Farfetch’d-Galar",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 52,
      "atk": 95,
      "def": 55,
      "spa": 58,
      "spd": 62,
      "spe": 55
    },
    "abilities": [
      "Steadfast"
    ],
    "hiddenAbility": "Scrappy",
    "sprite": "farfetchdgalar",
    "spriteId": "farfetchd-galar",
    "learnset": []
  },
  {
    "id": 84,
    "name": "Doduo",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 85,
      "def": 45,
      "spa": 35,
      "spd": 35,
      "spe": 75
    },
    "abilities": [
      "Run Away",
      "Early Bird"
    ],
    "hiddenAbility": "Tangled Feet",
    "sprite": "doduo",
    "spriteId": "doduo",
    "learnset": []
  },
  {
    "id": 85,
    "name": "Dodrio",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 110,
      "def": 70,
      "spa": 60,
      "spd": 60,
      "spe": 110
    },
    "abilities": [
      "Run Away",
      "Early Bird"
    ],
    "hiddenAbility": "Tangled Feet",
    "sprite": "dodrio",
    "spriteId": "dodrio",
    "learnset": []
  },
  {
    "id": 86,
    "name": "Seel",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 45,
      "def": 55,
      "spa": 45,
      "spd": 70,
      "spe": 45
    },
    "abilities": [
      "Thick Fat",
      "Hydration"
    ],
    "hiddenAbility": "Ice Body",
    "sprite": "seel",
    "spriteId": "seel",
    "learnset": []
  },
  {
    "id": 87,
    "name": "Dewgong",
    "types": [
      "Water",
      "Ice"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 70,
      "def": 80,
      "spa": 70,
      "spd": 95,
      "spe": 70
    },
    "abilities": [
      "Thick Fat",
      "Hydration"
    ],
    "hiddenAbility": "Ice Body",
    "sprite": "dewgong",
    "spriteId": "dewgong",
    "learnset": []
  },
  {
    "id": 88,
    "name": "Grimer",
    "types": [
      "Poison"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 80,
      "def": 50,
      "spa": 40,
      "spd": 50,
      "spe": 25
    },
    "abilities": [
      "Stench",
      "Sticky Hold"
    ],
    "hiddenAbility": "Poison Touch",
    "sprite": "grimer",
    "spriteId": "grimer",
    "learnset": []
  },
  {
    "id": 88,
    "name": "Grimer-Alola",
    "types": [
      "Poison",
      "Dark"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 80,
      "def": 50,
      "spa": 40,
      "spd": 50,
      "spe": 25
    },
    "abilities": [
      "Poison Touch",
      "Gluttony"
    ],
    "hiddenAbility": "Power of Alchemy",
    "sprite": "grimeralola",
    "spriteId": "grimer-alola",
    "learnset": []
  },
  {
    "id": 89,
    "name": "Muk",
    "types": [
      "Poison"
    ],
    "baseStats": {
      "hp": 105,
      "atk": 105,
      "def": 75,
      "spa": 65,
      "spd": 100,
      "spe": 50
    },
    "abilities": [
      "Stench",
      "Sticky Hold"
    ],
    "hiddenAbility": "Poison Touch",
    "sprite": "muk",
    "spriteId": "muk",
    "learnset": []
  },
  {
    "id": 89,
    "name": "Muk-Alola",
    "types": [
      "Poison",
      "Dark"
    ],
    "baseStats": {
      "hp": 105,
      "atk": 105,
      "def": 75,
      "spa": 65,
      "spd": 100,
      "spe": 50
    },
    "abilities": [
      "Poison Touch",
      "Gluttony"
    ],
    "hiddenAbility": "Power of Alchemy",
    "sprite": "mukalola",
    "spriteId": "muk-alola",
    "learnset": []
  },
  {
    "id": 90,
    "name": "Shellder",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 30,
      "atk": 65,
      "def": 100,
      "spa": 45,
      "spd": 25,
      "spe": 40
    },
    "abilities": [
      "Shell Armor",
      "Skill Link"
    ],
    "hiddenAbility": "Overcoat",
    "sprite": "shellder",
    "spriteId": "shellder",
    "learnset": []
  },
  {
    "id": 91,
    "name": "Cloyster",
    "types": [
      "Water",
      "Ice"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 95,
      "def": 180,
      "spa": 85,
      "spd": 45,
      "spe": 70
    },
    "abilities": [
      "Shell Armor",
      "Skill Link"
    ],
    "hiddenAbility": "Overcoat",
    "sprite": "cloyster",
    "spriteId": "cloyster",
    "learnset": []
  },
  {
    "id": 92,
    "name": "Gastly",
    "types": [
      "Ghost",
      "Poison"
    ],
    "baseStats": {
      "hp": 30,
      "atk": 35,
      "def": 30,
      "spa": 100,
      "spd": 35,
      "spe": 80
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "gastly",
    "spriteId": "gastly",
    "learnset": []
  },
  {
    "id": 93,
    "name": "Haunter",
    "types": [
      "Ghost",
      "Poison"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 50,
      "def": 45,
      "spa": 115,
      "spd": 55,
      "spe": 95
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "haunter",
    "spriteId": "haunter",
    "learnset": []
  },
  {
    "id": 94,
    "name": "Gengar",
    "types": [
      "Ghost",
      "Poison"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 65,
      "def": 60,
      "spa": 130,
      "spd": 75,
      "spe": 110
    },
    "abilities": [
      "Cursed Body"
    ],
    "hiddenAbility": "",
    "sprite": "gengar",
    "spriteId": "gengar",
    "learnset": []
  },
  {
    "id": 94,
    "name": "Gengar-Mega",
    "types": [
      "Ghost",
      "Poison"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 65,
      "def": 80,
      "spa": 170,
      "spd": 95,
      "spe": 130
    },
    "abilities": [
      "Shadow Tag"
    ],
    "hiddenAbility": "",
    "sprite": "gengarmega",
    "spriteId": "gengar-mega",
    "learnset": []
  },
  {
    "id": 94,
    "name": "Gengar-Gmax",
    "types": [
      "Ghost",
      "Poison"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 65,
      "def": 60,
      "spa": 130,
      "spd": 75,
      "spe": 110
    },
    "abilities": [
      "Cursed Body"
    ],
    "hiddenAbility": "",
    "sprite": "gengargmax",
    "spriteId": "gengar-gmax",
    "learnset": []
  },
  {
    "id": 95,
    "name": "Onix",
    "types": [
      "Rock",
      "Ground"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 45,
      "def": 160,
      "spa": 30,
      "spd": 45,
      "spe": 70
    },
    "abilities": [
      "Rock Head",
      "Sturdy"
    ],
    "hiddenAbility": "Weak Armor",
    "sprite": "onix",
    "spriteId": "onix",
    "learnset": []
  },
  {
    "id": 96,
    "name": "Drowzee",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 48,
      "def": 45,
      "spa": 43,
      "spd": 90,
      "spe": 42
    },
    "abilities": [
      "Insomnia",
      "Forewarn"
    ],
    "hiddenAbility": "Inner Focus",
    "sprite": "drowzee",
    "spriteId": "drowzee",
    "learnset": []
  },
  {
    "id": 97,
    "name": "Hypno",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 73,
      "def": 70,
      "spa": 73,
      "spd": 115,
      "spe": 67
    },
    "abilities": [
      "Insomnia",
      "Forewarn"
    ],
    "hiddenAbility": "Inner Focus",
    "sprite": "hypno",
    "spriteId": "hypno",
    "learnset": []
  },
  {
    "id": 98,
    "name": "Krabby",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 30,
      "atk": 105,
      "def": 90,
      "spa": 25,
      "spd": 25,
      "spe": 50
    },
    "abilities": [
      "Hyper Cutter",
      "Shell Armor"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "krabby",
    "spriteId": "krabby",
    "learnset": []
  },
  {
    "id": 99,
    "name": "Kingler",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 130,
      "def": 115,
      "spa": 50,
      "spd": 50,
      "spe": 75
    },
    "abilities": [
      "Hyper Cutter",
      "Shell Armor"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "kingler",
    "spriteId": "kingler",
    "learnset": []
  },
  {
    "id": 99,
    "name": "Kingler-Gmax",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 130,
      "def": 115,
      "spa": 50,
      "spd": 50,
      "spe": 75
    },
    "abilities": [
      "Hyper Cutter",
      "Shell Armor"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "kinglergmax",
    "spriteId": "kingler-gmax",
    "learnset": []
  },
  {
    "id": 100,
    "name": "Voltorb",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 30,
      "def": 50,
      "spa": 55,
      "spd": 55,
      "spe": 100
    },
    "abilities": [
      "Soundproof",
      "Static"
    ],
    "hiddenAbility": "Aftermath",
    "sprite": "voltorb",
    "spriteId": "voltorb",
    "learnset": []
  },
  {
    "id": 100,
    "name": "Voltorb-Hisui",
    "types": [
      "Electric",
      "Grass"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 30,
      "def": 50,
      "spa": 55,
      "spd": 55,
      "spe": 100
    },
    "abilities": [
      "Soundproof",
      "Static"
    ],
    "hiddenAbility": "Aftermath",
    "sprite": "voltorbhisui",
    "spriteId": "voltorb-hisui",
    "learnset": []
  },
  {
    "id": 101,
    "name": "Electrode",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 50,
      "def": 70,
      "spa": 80,
      "spd": 80,
      "spe": 150
    },
    "abilities": [
      "Soundproof",
      "Static"
    ],
    "hiddenAbility": "Aftermath",
    "sprite": "electrode",
    "spriteId": "electrode",
    "learnset": []
  },
  {
    "id": 101,
    "name": "Electrode-Hisui",
    "types": [
      "Electric",
      "Grass"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 50,
      "def": 70,
      "spa": 80,
      "spd": 80,
      "spe": 150
    },
    "abilities": [
      "Soundproof",
      "Static"
    ],
    "hiddenAbility": "Aftermath",
    "sprite": "electrodehisui",
    "spriteId": "electrode-hisui",
    "learnset": []
  },
  {
    "id": 102,
    "name": "Exeggcute",
    "types": [
      "Grass",
      "Psychic"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 40,
      "def": 80,
      "spa": 60,
      "spd": 45,
      "spe": 40
    },
    "abilities": [
      "Chlorophyll"
    ],
    "hiddenAbility": "Harvest",
    "sprite": "exeggcute",
    "spriteId": "exeggcute",
    "learnset": []
  },
  {
    "id": 103,
    "name": "Exeggutor",
    "types": [
      "Grass",
      "Psychic"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 95,
      "def": 85,
      "spa": 125,
      "spd": 75,
      "spe": 55
    },
    "abilities": [
      "Chlorophyll"
    ],
    "hiddenAbility": "Harvest",
    "sprite": "exeggutor",
    "spriteId": "exeggutor",
    "learnset": []
  },
  {
    "id": 103,
    "name": "Exeggutor-Alola",
    "types": [
      "Grass",
      "Dragon"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 105,
      "def": 85,
      "spa": 125,
      "spd": 75,
      "spe": 45
    },
    "abilities": [
      "Frisk"
    ],
    "hiddenAbility": "Harvest",
    "sprite": "exeggutoralola",
    "spriteId": "exeggutor-alola",
    "learnset": []
  },
  {
    "id": 104,
    "name": "Cubone",
    "types": [
      "Ground"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 50,
      "def": 95,
      "spa": 40,
      "spd": 50,
      "spe": 35
    },
    "abilities": [
      "Rock Head",
      "Lightning Rod"
    ],
    "hiddenAbility": "Battle Armor",
    "sprite": "cubone",
    "spriteId": "cubone",
    "learnset": []
  },
  {
    "id": 105,
    "name": "Marowak",
    "types": [
      "Ground"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 80,
      "def": 110,
      "spa": 50,
      "spd": 80,
      "spe": 45
    },
    "abilities": [
      "Rock Head",
      "Lightning Rod"
    ],
    "hiddenAbility": "Battle Armor",
    "sprite": "marowak",
    "spriteId": "marowak",
    "learnset": []
  },
  {
    "id": 105,
    "name": "Marowak-Alola",
    "types": [
      "Fire",
      "Ghost"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 80,
      "def": 110,
      "spa": 50,
      "spd": 80,
      "spe": 45
    },
    "abilities": [
      "Cursed Body",
      "Lightning Rod"
    ],
    "hiddenAbility": "Rock Head",
    "sprite": "marowakalola",
    "spriteId": "marowak-alola",
    "learnset": []
  },
  {
    "id": 105,
    "name": "Marowak-Alola-Totem",
    "types": [
      "Fire",
      "Ghost"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 80,
      "def": 110,
      "spa": 50,
      "spd": 80,
      "spe": 45
    },
    "abilities": [
      "Rock Head"
    ],
    "hiddenAbility": "",
    "sprite": "marowakalolatotem",
    "spriteId": "marowak-alolatotem",
    "learnset": []
  },
  {
    "id": 106,
    "name": "Hitmonlee",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 120,
      "def": 53,
      "spa": 35,
      "spd": 110,
      "spe": 87
    },
    "abilities": [
      "Limber",
      "Reckless"
    ],
    "hiddenAbility": "Unburden",
    "sprite": "hitmonlee",
    "spriteId": "hitmonlee",
    "learnset": []
  },
  {
    "id": 107,
    "name": "Hitmonchan",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 105,
      "def": 79,
      "spa": 35,
      "spd": 110,
      "spe": 76
    },
    "abilities": [
      "Keen Eye",
      "Iron Fist"
    ],
    "hiddenAbility": "Inner Focus",
    "sprite": "hitmonchan",
    "spriteId": "hitmonchan",
    "learnset": []
  },
  {
    "id": 108,
    "name": "Lickitung",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 55,
      "def": 75,
      "spa": 60,
      "spd": 75,
      "spe": 30
    },
    "abilities": [
      "Own Tempo",
      "Oblivious"
    ],
    "hiddenAbility": "Cloud Nine",
    "sprite": "lickitung",
    "spriteId": "lickitung",
    "learnset": []
  },
  {
    "id": 109,
    "name": "Koffing",
    "types": [
      "Poison"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 65,
      "def": 95,
      "spa": 60,
      "spd": 45,
      "spe": 35
    },
    "abilities": [
      "Levitate",
      "Neutralizing Gas"
    ],
    "hiddenAbility": "Stench",
    "sprite": "koffing",
    "spriteId": "koffing",
    "learnset": []
  },
  {
    "id": 110,
    "name": "Weezing",
    "types": [
      "Poison"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 90,
      "def": 120,
      "spa": 85,
      "spd": 70,
      "spe": 60
    },
    "abilities": [
      "Levitate",
      "Neutralizing Gas"
    ],
    "hiddenAbility": "Stench",
    "sprite": "weezing",
    "spriteId": "weezing",
    "learnset": []
  },
  {
    "id": 110,
    "name": "Weezing-Galar",
    "types": [
      "Poison",
      "Fairy"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 90,
      "def": 120,
      "spa": 85,
      "spd": 70,
      "spe": 60
    },
    "abilities": [
      "Levitate",
      "Neutralizing Gas"
    ],
    "hiddenAbility": "Misty Surge",
    "sprite": "weezinggalar",
    "spriteId": "weezing-galar",
    "learnset": []
  },
  {
    "id": 111,
    "name": "Rhyhorn",
    "types": [
      "Ground",
      "Rock"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 85,
      "def": 95,
      "spa": 30,
      "spd": 30,
      "spe": 25
    },
    "abilities": [
      "Lightning Rod",
      "Rock Head"
    ],
    "hiddenAbility": "Reckless",
    "sprite": "rhyhorn",
    "spriteId": "rhyhorn",
    "learnset": []
  },
  {
    "id": 112,
    "name": "Rhydon",
    "types": [
      "Ground",
      "Rock"
    ],
    "baseStats": {
      "hp": 105,
      "atk": 130,
      "def": 120,
      "spa": 45,
      "spd": 45,
      "spe": 40
    },
    "abilities": [
      "Lightning Rod",
      "Rock Head"
    ],
    "hiddenAbility": "Reckless",
    "sprite": "rhydon",
    "spriteId": "rhydon",
    "learnset": []
  },
  {
    "id": 113,
    "name": "Chansey",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 250,
      "atk": 5,
      "def": 5,
      "spa": 35,
      "spd": 105,
      "spe": 50
    },
    "abilities": [
      "Natural Cure",
      "Serene Grace"
    ],
    "hiddenAbility": "Healer",
    "sprite": "chansey",
    "spriteId": "chansey",
    "learnset": []
  },
  {
    "id": 114,
    "name": "Tangela",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 55,
      "def": 115,
      "spa": 100,
      "spd": 40,
      "spe": 60
    },
    "abilities": [
      "Chlorophyll",
      "Leaf Guard"
    ],
    "hiddenAbility": "Regenerator",
    "sprite": "tangela",
    "spriteId": "tangela",
    "learnset": []
  },
  {
    "id": 115,
    "name": "Kangaskhan",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 105,
      "atk": 95,
      "def": 80,
      "spa": 40,
      "spd": 80,
      "spe": 90
    },
    "abilities": [
      "Early Bird",
      "Scrappy"
    ],
    "hiddenAbility": "Inner Focus",
    "sprite": "kangaskhan",
    "spriteId": "kangaskhan",
    "learnset": []
  },
  {
    "id": 115,
    "name": "Kangaskhan-Mega",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 105,
      "atk": 125,
      "def": 100,
      "spa": 60,
      "spd": 100,
      "spe": 100
    },
    "abilities": [
      "Parental Bond"
    ],
    "hiddenAbility": "",
    "sprite": "kangaskhanmega",
    "spriteId": "kangaskhan-mega",
    "learnset": []
  },
  {
    "id": 116,
    "name": "Horsea",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 30,
      "atk": 40,
      "def": 70,
      "spa": 70,
      "spd": 25,
      "spe": 60
    },
    "abilities": [
      "Swift Swim",
      "Sniper"
    ],
    "hiddenAbility": "Damp",
    "sprite": "horsea",
    "spriteId": "horsea",
    "learnset": []
  },
  {
    "id": 117,
    "name": "Seadra",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 65,
      "def": 95,
      "spa": 95,
      "spd": 45,
      "spe": 85
    },
    "abilities": [
      "Poison Point",
      "Sniper"
    ],
    "hiddenAbility": "Damp",
    "sprite": "seadra",
    "spriteId": "seadra",
    "learnset": []
  },
  {
    "id": 118,
    "name": "Goldeen",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 67,
      "def": 60,
      "spa": 35,
      "spd": 50,
      "spe": 63
    },
    "abilities": [
      "Swift Swim",
      "Water Veil"
    ],
    "hiddenAbility": "Lightning Rod",
    "sprite": "goldeen",
    "spriteId": "goldeen",
    "learnset": []
  },
  {
    "id": 119,
    "name": "Seaking",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 92,
      "def": 65,
      "spa": 65,
      "spd": 80,
      "spe": 68
    },
    "abilities": [
      "Swift Swim",
      "Water Veil"
    ],
    "hiddenAbility": "Lightning Rod",
    "sprite": "seaking",
    "spriteId": "seaking",
    "learnset": []
  },
  {
    "id": 120,
    "name": "Staryu",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 30,
      "atk": 45,
      "def": 55,
      "spa": 70,
      "spd": 55,
      "spe": 85
    },
    "abilities": [
      "Illuminate",
      "Natural Cure"
    ],
    "hiddenAbility": "Analytic",
    "sprite": "staryu",
    "spriteId": "staryu",
    "learnset": []
  },
  {
    "id": 121,
    "name": "Starmie",
    "types": [
      "Water",
      "Psychic"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 75,
      "def": 85,
      "spa": 100,
      "spd": 85,
      "spe": 115
    },
    "abilities": [
      "Illuminate",
      "Natural Cure"
    ],
    "hiddenAbility": "Analytic",
    "sprite": "starmie",
    "spriteId": "starmie",
    "learnset": []
  },
  {
    "id": 121,
    "name": "Starmie-Mega",
    "types": [
      "Water",
      "Psychic"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 100,
      "def": 105,
      "spa": 130,
      "spd": 105,
      "spe": 120
    },
    "abilities": [
      "Huge Power"
    ],
    "hiddenAbility": "",
    "sprite": "starmiemega",
    "spriteId": "starmie-mega",
    "learnset": []
  },
  {
    "id": 122,
    "name": "Mr. Mime",
    "types": [
      "Psychic",
      "Fairy"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 45,
      "def": 65,
      "spa": 100,
      "spd": 120,
      "spe": 90
    },
    "abilities": [
      "Soundproof",
      "Filter"
    ],
    "hiddenAbility": "Technician",
    "sprite": "mrmime",
    "spriteId": "mrmime",
    "learnset": []
  },
  {
    "id": 122,
    "name": "Mr. Mime-Galar",
    "types": [
      "Ice",
      "Psychic"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 65,
      "def": 65,
      "spa": 90,
      "spd": 90,
      "spe": 100
    },
    "abilities": [
      "Vital Spirit",
      "Screen Cleaner"
    ],
    "hiddenAbility": "Ice Body",
    "sprite": "mrmimegalar",
    "spriteId": "mrmime-galar",
    "learnset": []
  },
  {
    "id": 123,
    "name": "Scyther",
    "types": [
      "Bug",
      "Flying"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 110,
      "def": 80,
      "spa": 55,
      "spd": 80,
      "spe": 105
    },
    "abilities": [
      "Swarm",
      "Technician"
    ],
    "hiddenAbility": "Steadfast",
    "sprite": "scyther",
    "spriteId": "scyther",
    "learnset": []
  },
  {
    "id": 124,
    "name": "Jynx",
    "types": [
      "Ice",
      "Psychic"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 50,
      "def": 35,
      "spa": 115,
      "spd": 95,
      "spe": 95
    },
    "abilities": [
      "Oblivious",
      "Forewarn"
    ],
    "hiddenAbility": "Dry Skin",
    "sprite": "jynx",
    "spriteId": "jynx",
    "learnset": []
  },
  {
    "id": 125,
    "name": "Electabuzz",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 83,
      "def": 57,
      "spa": 95,
      "spd": 85,
      "spe": 105
    },
    "abilities": [
      "Static"
    ],
    "hiddenAbility": "Vital Spirit",
    "sprite": "electabuzz",
    "spriteId": "electabuzz",
    "learnset": []
  },
  {
    "id": 126,
    "name": "Magmar",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 95,
      "def": 57,
      "spa": 100,
      "spd": 85,
      "spe": 93
    },
    "abilities": [
      "Flame Body"
    ],
    "hiddenAbility": "Vital Spirit",
    "sprite": "magmar",
    "spriteId": "magmar",
    "learnset": []
  },
  {
    "id": 127,
    "name": "Pinsir",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 125,
      "def": 100,
      "spa": 55,
      "spd": 70,
      "spe": 85
    },
    "abilities": [
      "Hyper Cutter",
      "Mold Breaker"
    ],
    "hiddenAbility": "Moxie",
    "sprite": "pinsir",
    "spriteId": "pinsir",
    "learnset": []
  },
  {
    "id": 127,
    "name": "Pinsir-Mega",
    "types": [
      "Bug",
      "Flying"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 155,
      "def": 120,
      "spa": 65,
      "spd": 90,
      "spe": 105
    },
    "abilities": [
      "Aerilate"
    ],
    "hiddenAbility": "",
    "sprite": "pinsirmega",
    "spriteId": "pinsir-mega",
    "learnset": []
  },
  {
    "id": 128,
    "name": "Tauros",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 100,
      "def": 95,
      "spa": 40,
      "spd": 70,
      "spe": 110
    },
    "abilities": [
      "Intimidate",
      "Anger Point"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "tauros",
    "spriteId": "tauros",
    "learnset": []
  },
  {
    "id": 128,
    "name": "Tauros-Paldea-Combat",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 110,
      "def": 105,
      "spa": 30,
      "spd": 70,
      "spe": 100
    },
    "abilities": [
      "Intimidate",
      "Anger Point"
    ],
    "hiddenAbility": "Cud Chew",
    "sprite": "taurospaldeacombat",
    "spriteId": "tauros-paldeacombat",
    "learnset": []
  },
  {
    "id": 128,
    "name": "Tauros-Paldea-Blaze",
    "types": [
      "Fighting",
      "Fire"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 110,
      "def": 105,
      "spa": 30,
      "spd": 70,
      "spe": 100
    },
    "abilities": [
      "Intimidate",
      "Anger Point"
    ],
    "hiddenAbility": "Cud Chew",
    "sprite": "taurospaldeablaze",
    "spriteId": "tauros-paldeablaze",
    "learnset": []
  },
  {
    "id": 128,
    "name": "Tauros-Paldea-Aqua",
    "types": [
      "Fighting",
      "Water"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 110,
      "def": 105,
      "spa": 30,
      "spd": 70,
      "spe": 100
    },
    "abilities": [
      "Intimidate",
      "Anger Point"
    ],
    "hiddenAbility": "Cud Chew",
    "sprite": "taurospaldeaaqua",
    "spriteId": "tauros-paldeaaqua",
    "learnset": []
  },
  {
    "id": 129,
    "name": "Magikarp",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 20,
      "atk": 10,
      "def": 55,
      "spa": 15,
      "spd": 20,
      "spe": 80
    },
    "abilities": [
      "Swift Swim"
    ],
    "hiddenAbility": "Rattled",
    "sprite": "magikarp",
    "spriteId": "magikarp",
    "learnset": []
  },
  {
    "id": 130,
    "name": "Gyarados",
    "types": [
      "Water",
      "Flying"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 125,
      "def": 79,
      "spa": 60,
      "spd": 100,
      "spe": 81
    },
    "abilities": [
      "Intimidate"
    ],
    "hiddenAbility": "Moxie",
    "sprite": "gyarados",
    "spriteId": "gyarados",
    "learnset": []
  },
  {
    "id": 130,
    "name": "Gyarados-Mega",
    "types": [
      "Water",
      "Dark"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 155,
      "def": 109,
      "spa": 70,
      "spd": 130,
      "spe": 81
    },
    "abilities": [
      "Mold Breaker"
    ],
    "hiddenAbility": "",
    "sprite": "gyaradosmega",
    "spriteId": "gyarados-mega",
    "learnset": []
  },
  {
    "id": 131,
    "name": "Lapras",
    "types": [
      "Water",
      "Ice"
    ],
    "baseStats": {
      "hp": 130,
      "atk": 85,
      "def": 80,
      "spa": 85,
      "spd": 95,
      "spe": 60
    },
    "abilities": [
      "Water Absorb",
      "Shell Armor"
    ],
    "hiddenAbility": "Hydration",
    "sprite": "lapras",
    "spriteId": "lapras",
    "learnset": []
  },
  {
    "id": 131,
    "name": "Lapras-Gmax",
    "types": [
      "Water",
      "Ice"
    ],
    "baseStats": {
      "hp": 130,
      "atk": 85,
      "def": 80,
      "spa": 85,
      "spd": 95,
      "spe": 60
    },
    "abilities": [
      "Water Absorb",
      "Shell Armor"
    ],
    "hiddenAbility": "Hydration",
    "sprite": "laprasgmax",
    "spriteId": "lapras-gmax",
    "learnset": []
  },
  {
    "id": 132,
    "name": "Ditto",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 48,
      "atk": 48,
      "def": 48,
      "spa": 48,
      "spd": 48,
      "spe": 48
    },
    "abilities": [
      "Limber"
    ],
    "hiddenAbility": "Imposter",
    "sprite": "ditto",
    "spriteId": "ditto",
    "learnset": []
  },
  {
    "id": 133,
    "name": "Eevee",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 55,
      "def": 50,
      "spa": 45,
      "spd": 65,
      "spe": 55
    },
    "abilities": [
      "Run Away",
      "Adaptability"
    ],
    "hiddenAbility": "Anticipation",
    "sprite": "eevee",
    "spriteId": "eevee",
    "learnset": []
  },
  {
    "id": 133,
    "name": "Eevee-Starter",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 75,
      "def": 70,
      "spa": 65,
      "spd": 85,
      "spe": 75
    },
    "abilities": [
      "Run Away",
      "Adaptability"
    ],
    "hiddenAbility": "Anticipation",
    "sprite": "eeveestarter",
    "spriteId": "eevee-starter",
    "learnset": []
  },
  {
    "id": 133,
    "name": "Eevee-Gmax",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 55,
      "def": 50,
      "spa": 45,
      "spd": 65,
      "spe": 55
    },
    "abilities": [
      "Run Away",
      "Adaptability"
    ],
    "hiddenAbility": "Anticipation",
    "sprite": "eeveegmax",
    "spriteId": "eevee-gmax",
    "learnset": []
  },
  {
    "id": 134,
    "name": "Vaporeon",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 130,
      "atk": 65,
      "def": 60,
      "spa": 110,
      "spd": 95,
      "spe": 65
    },
    "abilities": [
      "Water Absorb"
    ],
    "hiddenAbility": "Hydration",
    "sprite": "vaporeon",
    "spriteId": "vaporeon",
    "learnset": []
  },
  {
    "id": 135,
    "name": "Jolteon",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 65,
      "def": 60,
      "spa": 110,
      "spd": 95,
      "spe": 130
    },
    "abilities": [
      "Volt Absorb"
    ],
    "hiddenAbility": "Quick Feet",
    "sprite": "jolteon",
    "spriteId": "jolteon",
    "learnset": []
  },
  {
    "id": 136,
    "name": "Flareon",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 130,
      "def": 60,
      "spa": 95,
      "spd": 110,
      "spe": 65
    },
    "abilities": [
      "Flash Fire"
    ],
    "hiddenAbility": "Guts",
    "sprite": "flareon",
    "spriteId": "flareon",
    "learnset": []
  },
  {
    "id": 137,
    "name": "Porygon",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 60,
      "def": 70,
      "spa": 85,
      "spd": 75,
      "spe": 40
    },
    "abilities": [
      "Trace",
      "Download"
    ],
    "hiddenAbility": "Analytic",
    "sprite": "porygon",
    "spriteId": "porygon",
    "learnset": []
  },
  {
    "id": 138,
    "name": "Omanyte",
    "types": [
      "Rock",
      "Water"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 40,
      "def": 100,
      "spa": 90,
      "spd": 55,
      "spe": 35
    },
    "abilities": [
      "Swift Swim",
      "Shell Armor"
    ],
    "hiddenAbility": "Weak Armor",
    "sprite": "omanyte",
    "spriteId": "omanyte",
    "learnset": []
  },
  {
    "id": 139,
    "name": "Omastar",
    "types": [
      "Rock",
      "Water"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 60,
      "def": 125,
      "spa": 115,
      "spd": 70,
      "spe": 55
    },
    "abilities": [
      "Swift Swim",
      "Shell Armor"
    ],
    "hiddenAbility": "Weak Armor",
    "sprite": "omastar",
    "spriteId": "omastar",
    "learnset": []
  },
  {
    "id": 140,
    "name": "Kabuto",
    "types": [
      "Rock",
      "Water"
    ],
    "baseStats": {
      "hp": 30,
      "atk": 80,
      "def": 90,
      "spa": 55,
      "spd": 45,
      "spe": 55
    },
    "abilities": [
      "Swift Swim",
      "Battle Armor"
    ],
    "hiddenAbility": "Weak Armor",
    "sprite": "kabuto",
    "spriteId": "kabuto",
    "learnset": []
  },
  {
    "id": 141,
    "name": "Kabutops",
    "types": [
      "Rock",
      "Water"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 115,
      "def": 105,
      "spa": 65,
      "spd": 70,
      "spe": 80
    },
    "abilities": [
      "Swift Swim",
      "Battle Armor"
    ],
    "hiddenAbility": "Weak Armor",
    "sprite": "kabutops",
    "spriteId": "kabutops",
    "learnset": []
  },
  {
    "id": 142,
    "name": "Aerodactyl",
    "types": [
      "Rock",
      "Flying"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 105,
      "def": 65,
      "spa": 60,
      "spd": 75,
      "spe": 130
    },
    "abilities": [
      "Rock Head",
      "Pressure"
    ],
    "hiddenAbility": "Unnerve",
    "sprite": "aerodactyl",
    "spriteId": "aerodactyl",
    "learnset": []
  },
  {
    "id": 142,
    "name": "Aerodactyl-Mega",
    "types": [
      "Rock",
      "Flying"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 135,
      "def": 85,
      "spa": 70,
      "spd": 95,
      "spe": 150
    },
    "abilities": [
      "Tough Claws"
    ],
    "hiddenAbility": "",
    "sprite": "aerodactylmega",
    "spriteId": "aerodactyl-mega",
    "learnset": []
  },
  {
    "id": 143,
    "name": "Snorlax",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 160,
      "atk": 110,
      "def": 65,
      "spa": 65,
      "spd": 110,
      "spe": 30
    },
    "abilities": [
      "Immunity",
      "Thick Fat"
    ],
    "hiddenAbility": "Gluttony",
    "sprite": "snorlax",
    "spriteId": "snorlax",
    "learnset": []
  },
  {
    "id": 143,
    "name": "Snorlax-Gmax",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 160,
      "atk": 110,
      "def": 65,
      "spa": 65,
      "spd": 110,
      "spe": 30
    },
    "abilities": [
      "Immunity",
      "Thick Fat"
    ],
    "hiddenAbility": "Gluttony",
    "sprite": "snorlaxgmax",
    "spriteId": "snorlax-gmax",
    "learnset": []
  },
  {
    "id": 144,
    "name": "Articuno",
    "types": [
      "Ice",
      "Flying"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 85,
      "def": 100,
      "spa": 95,
      "spd": 125,
      "spe": 85
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "Snow Cloak",
    "sprite": "articuno",
    "spriteId": "articuno",
    "learnset": []
  },
  {
    "id": 144,
    "name": "Articuno-Galar",
    "types": [
      "Psychic",
      "Flying"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 85,
      "def": 85,
      "spa": 125,
      "spd": 100,
      "spe": 95
    },
    "abilities": [
      "Competitive"
    ],
    "hiddenAbility": "",
    "sprite": "articunogalar",
    "spriteId": "articuno-galar",
    "learnset": []
  },
  {
    "id": 145,
    "name": "Zapdos",
    "types": [
      "Electric",
      "Flying"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 90,
      "def": 85,
      "spa": 125,
      "spd": 90,
      "spe": 100
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "Static",
    "sprite": "zapdos",
    "spriteId": "zapdos",
    "learnset": []
  },
  {
    "id": 145,
    "name": "Zapdos-Galar",
    "types": [
      "Fighting",
      "Flying"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 125,
      "def": 90,
      "spa": 85,
      "spd": 90,
      "spe": 100
    },
    "abilities": [
      "Defiant"
    ],
    "hiddenAbility": "",
    "sprite": "zapdosgalar",
    "spriteId": "zapdos-galar",
    "learnset": []
  },
  {
    "id": 146,
    "name": "Moltres",
    "types": [
      "Fire",
      "Flying"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 100,
      "def": 90,
      "spa": 125,
      "spd": 85,
      "spe": 90
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "Flame Body",
    "sprite": "moltres",
    "spriteId": "moltres",
    "learnset": []
  },
  {
    "id": 146,
    "name": "Moltres-Galar",
    "types": [
      "Dark",
      "Flying"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 85,
      "def": 90,
      "spa": 100,
      "spd": 125,
      "spe": 90
    },
    "abilities": [
      "Berserk"
    ],
    "hiddenAbility": "",
    "sprite": "moltresgalar",
    "spriteId": "moltres-galar",
    "learnset": []
  },
  {
    "id": 147,
    "name": "Dratini",
    "types": [
      "Dragon"
    ],
    "baseStats": {
      "hp": 41,
      "atk": 64,
      "def": 45,
      "spa": 50,
      "spd": 50,
      "spe": 50
    },
    "abilities": [
      "Shed Skin"
    ],
    "hiddenAbility": "Marvel Scale",
    "sprite": "dratini",
    "spriteId": "dratini",
    "learnset": []
  },
  {
    "id": 148,
    "name": "Dragonair",
    "types": [
      "Dragon"
    ],
    "baseStats": {
      "hp": 61,
      "atk": 84,
      "def": 65,
      "spa": 70,
      "spd": 70,
      "spe": 70
    },
    "abilities": [
      "Shed Skin"
    ],
    "hiddenAbility": "Marvel Scale",
    "sprite": "dragonair",
    "spriteId": "dragonair",
    "learnset": []
  },
  {
    "id": 149,
    "name": "Dragonite",
    "types": [
      "Dragon",
      "Flying"
    ],
    "baseStats": {
      "hp": 91,
      "atk": 134,
      "def": 95,
      "spa": 100,
      "spd": 100,
      "spe": 80
    },
    "abilities": [
      "Inner Focus"
    ],
    "hiddenAbility": "Multiscale",
    "sprite": "dragonite",
    "spriteId": "dragonite",
    "learnset": []
  },
  {
    "id": 149,
    "name": "Dragonite-Mega",
    "types": [
      "Dragon",
      "Flying"
    ],
    "baseStats": {
      "hp": 91,
      "atk": 124,
      "def": 115,
      "spa": 145,
      "spd": 125,
      "spe": 100
    },
    "abilities": [
      "Multiscale"
    ],
    "hiddenAbility": "",
    "sprite": "dragonitemega",
    "spriteId": "dragonite-mega",
    "learnset": []
  },
  {
    "id": 150,
    "name": "Mewtwo",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 106,
      "atk": 110,
      "def": 90,
      "spa": 154,
      "spd": 90,
      "spe": 130
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "Unnerve",
    "sprite": "mewtwo",
    "spriteId": "mewtwo",
    "learnset": []
  },
  {
    "id": 150,
    "name": "Mewtwo-Mega-X",
    "types": [
      "Psychic",
      "Fighting"
    ],
    "baseStats": {
      "hp": 106,
      "atk": 190,
      "def": 100,
      "spa": 154,
      "spd": 100,
      "spe": 130
    },
    "abilities": [
      "Steadfast"
    ],
    "hiddenAbility": "",
    "sprite": "mewtwomegax",
    "spriteId": "mewtwo-megax",
    "learnset": []
  },
  {
    "id": 150,
    "name": "Mewtwo-Mega-Y",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 106,
      "atk": 150,
      "def": 70,
      "spa": 194,
      "spd": 120,
      "spe": 140
    },
    "abilities": [
      "Insomnia"
    ],
    "hiddenAbility": "",
    "sprite": "mewtwomegay",
    "spriteId": "mewtwo-megay",
    "learnset": []
  },
  {
    "id": 151,
    "name": "Mew",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 100,
      "def": 100,
      "spa": 100,
      "spd": 100,
      "spe": 100
    },
    "abilities": [
      "Synchronize"
    ],
    "hiddenAbility": "",
    "sprite": "mew",
    "spriteId": "mew",
    "learnset": []
  },
  {
    "id": 152,
    "name": "Chikorita",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 49,
      "def": 65,
      "spa": 49,
      "spd": 65,
      "spe": 45
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Leaf Guard",
    "sprite": "chikorita",
    "spriteId": "chikorita",
    "learnset": []
  },
  {
    "id": 153,
    "name": "Bayleef",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 62,
      "def": 80,
      "spa": 63,
      "spd": 80,
      "spe": 60
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Leaf Guard",
    "sprite": "bayleef",
    "spriteId": "bayleef",
    "learnset": []
  },
  {
    "id": 154,
    "name": "Meganium",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 82,
      "def": 100,
      "spa": 83,
      "spd": 100,
      "spe": 80
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Leaf Guard",
    "sprite": "meganium",
    "spriteId": "meganium",
    "learnset": []
  },
  {
    "id": 154,
    "name": "Meganium-Mega",
    "types": [
      "Grass",
      "Fairy"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 92,
      "def": 115,
      "spa": 143,
      "spd": 115,
      "spe": 80
    },
    "abilities": [
      "Mega Sol"
    ],
    "hiddenAbility": "",
    "sprite": "meganiummega",
    "spriteId": "meganium-mega",
    "learnset": []
  },
  {
    "id": 155,
    "name": "Cyndaquil",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 39,
      "atk": 52,
      "def": 43,
      "spa": 60,
      "spd": 50,
      "spe": 65
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Flash Fire",
    "sprite": "cyndaquil",
    "spriteId": "cyndaquil",
    "learnset": []
  },
  {
    "id": 156,
    "name": "Quilava",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 58,
      "atk": 64,
      "def": 58,
      "spa": 80,
      "spd": 65,
      "spe": 80
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Flash Fire",
    "sprite": "quilava",
    "spriteId": "quilava",
    "learnset": []
  },
  {
    "id": 157,
    "name": "Typhlosion",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 78,
      "atk": 84,
      "def": 78,
      "spa": 109,
      "spd": 85,
      "spe": 100
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Flash Fire",
    "sprite": "typhlosion",
    "spriteId": "typhlosion",
    "learnset": []
  },
  {
    "id": 157,
    "name": "Typhlosion-Hisui",
    "types": [
      "Fire",
      "Ghost"
    ],
    "baseStats": {
      "hp": 73,
      "atk": 84,
      "def": 78,
      "spa": 119,
      "spd": 85,
      "spe": 95
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Frisk",
    "sprite": "typhlosionhisui",
    "spriteId": "typhlosion-hisui",
    "learnset": []
  },
  {
    "id": 158,
    "name": "Totodile",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 65,
      "def": 64,
      "spa": 44,
      "spd": 48,
      "spe": 43
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "totodile",
    "spriteId": "totodile",
    "learnset": []
  },
  {
    "id": 159,
    "name": "Croconaw",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 80,
      "def": 80,
      "spa": 59,
      "spd": 63,
      "spe": 58
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "croconaw",
    "spriteId": "croconaw",
    "learnset": []
  },
  {
    "id": 160,
    "name": "Feraligatr",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 105,
      "def": 100,
      "spa": 79,
      "spd": 83,
      "spe": 78
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "feraligatr",
    "spriteId": "feraligatr",
    "learnset": []
  },
  {
    "id": 160,
    "name": "Feraligatr-Mega",
    "types": [
      "Water",
      "Dragon"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 160,
      "def": 125,
      "spa": 89,
      "spd": 93,
      "spe": 78
    },
    "abilities": [
      "Dragonize"
    ],
    "hiddenAbility": "",
    "sprite": "feraligatrmega",
    "spriteId": "feraligatr-mega",
    "learnset": []
  },
  {
    "id": 161,
    "name": "Sentret",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 46,
      "def": 34,
      "spa": 35,
      "spd": 45,
      "spe": 20
    },
    "abilities": [
      "Run Away",
      "Keen Eye"
    ],
    "hiddenAbility": "Frisk",
    "sprite": "sentret",
    "spriteId": "sentret",
    "learnset": []
  },
  {
    "id": 162,
    "name": "Furret",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 76,
      "def": 64,
      "spa": 45,
      "spd": 55,
      "spe": 90
    },
    "abilities": [
      "Run Away",
      "Keen Eye"
    ],
    "hiddenAbility": "Frisk",
    "sprite": "furret",
    "spriteId": "furret",
    "learnset": []
  },
  {
    "id": 163,
    "name": "Hoothoot",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 30,
      "def": 30,
      "spa": 36,
      "spd": 56,
      "spe": 50
    },
    "abilities": [
      "Insomnia",
      "Keen Eye"
    ],
    "hiddenAbility": "Tinted Lens",
    "sprite": "hoothoot",
    "spriteId": "hoothoot",
    "learnset": []
  },
  {
    "id": 164,
    "name": "Noctowl",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 50,
      "def": 50,
      "spa": 86,
      "spd": 96,
      "spe": 70
    },
    "abilities": [
      "Insomnia",
      "Keen Eye"
    ],
    "hiddenAbility": "Tinted Lens",
    "sprite": "noctowl",
    "spriteId": "noctowl",
    "learnset": []
  },
  {
    "id": 165,
    "name": "Ledyba",
    "types": [
      "Bug",
      "Flying"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 20,
      "def": 30,
      "spa": 40,
      "spd": 80,
      "spe": 55
    },
    "abilities": [
      "Swarm",
      "Early Bird"
    ],
    "hiddenAbility": "Rattled",
    "sprite": "ledyba",
    "spriteId": "ledyba",
    "learnset": []
  },
  {
    "id": 166,
    "name": "Ledian",
    "types": [
      "Bug",
      "Flying"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 35,
      "def": 50,
      "spa": 55,
      "spd": 110,
      "spe": 85
    },
    "abilities": [
      "Swarm",
      "Early Bird"
    ],
    "hiddenAbility": "Iron Fist",
    "sprite": "ledian",
    "spriteId": "ledian",
    "learnset": []
  },
  {
    "id": 167,
    "name": "Spinarak",
    "types": [
      "Bug",
      "Poison"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 60,
      "def": 40,
      "spa": 40,
      "spd": 40,
      "spe": 30
    },
    "abilities": [
      "Swarm",
      "Insomnia"
    ],
    "hiddenAbility": "Sniper",
    "sprite": "spinarak",
    "spriteId": "spinarak",
    "learnset": []
  },
  {
    "id": 168,
    "name": "Ariados",
    "types": [
      "Bug",
      "Poison"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 90,
      "def": 70,
      "spa": 60,
      "spd": 70,
      "spe": 40
    },
    "abilities": [
      "Swarm",
      "Insomnia"
    ],
    "hiddenAbility": "Sniper",
    "sprite": "ariados",
    "spriteId": "ariados",
    "learnset": []
  },
  {
    "id": 169,
    "name": "Crobat",
    "types": [
      "Poison",
      "Flying"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 90,
      "def": 80,
      "spa": 70,
      "spd": 80,
      "spe": 130
    },
    "abilities": [
      "Inner Focus"
    ],
    "hiddenAbility": "Infiltrator",
    "sprite": "crobat",
    "spriteId": "crobat",
    "learnset": []
  },
  {
    "id": 170,
    "name": "Chinchou",
    "types": [
      "Water",
      "Electric"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 38,
      "def": 38,
      "spa": 56,
      "spd": 56,
      "spe": 67
    },
    "abilities": [
      "Volt Absorb",
      "Illuminate"
    ],
    "hiddenAbility": "Water Absorb",
    "sprite": "chinchou",
    "spriteId": "chinchou",
    "learnset": []
  },
  {
    "id": 171,
    "name": "Lanturn",
    "types": [
      "Water",
      "Electric"
    ],
    "baseStats": {
      "hp": 125,
      "atk": 58,
      "def": 58,
      "spa": 76,
      "spd": 76,
      "spe": 67
    },
    "abilities": [
      "Volt Absorb",
      "Illuminate"
    ],
    "hiddenAbility": "Water Absorb",
    "sprite": "lanturn",
    "spriteId": "lanturn",
    "learnset": []
  },
  {
    "id": 172,
    "name": "Pichu",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 20,
      "atk": 40,
      "def": 15,
      "spa": 35,
      "spd": 35,
      "spe": 60
    },
    "abilities": [
      "Static"
    ],
    "hiddenAbility": "Lightning Rod",
    "sprite": "pichu",
    "spriteId": "pichu",
    "learnset": []
  },
  {
    "id": 172,
    "name": "Pichu-Spiky-eared",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 20,
      "atk": 40,
      "def": 15,
      "spa": 35,
      "spd": 35,
      "spe": 60
    },
    "abilities": [
      "Static"
    ],
    "hiddenAbility": "",
    "sprite": "pichuspikyeared",
    "spriteId": "pichu-spikyeared",
    "learnset": []
  },
  {
    "id": 173,
    "name": "Cleffa",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 25,
      "def": 28,
      "spa": 45,
      "spd": 55,
      "spe": 15
    },
    "abilities": [
      "Cute Charm",
      "Magic Guard"
    ],
    "hiddenAbility": "Friend Guard",
    "sprite": "cleffa",
    "spriteId": "cleffa",
    "learnset": []
  },
  {
    "id": 174,
    "name": "Igglybuff",
    "types": [
      "Normal",
      "Fairy"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 30,
      "def": 15,
      "spa": 40,
      "spd": 20,
      "spe": 15
    },
    "abilities": [
      "Cute Charm",
      "Competitive"
    ],
    "hiddenAbility": "Friend Guard",
    "sprite": "igglybuff",
    "spriteId": "igglybuff",
    "learnset": []
  },
  {
    "id": 175,
    "name": "Togepi",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 20,
      "def": 65,
      "spa": 40,
      "spd": 65,
      "spe": 20
    },
    "abilities": [
      "Hustle",
      "Serene Grace"
    ],
    "hiddenAbility": "Super Luck",
    "sprite": "togepi",
    "spriteId": "togepi",
    "learnset": []
  },
  {
    "id": 176,
    "name": "Togetic",
    "types": [
      "Fairy",
      "Flying"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 40,
      "def": 85,
      "spa": 80,
      "spd": 105,
      "spe": 40
    },
    "abilities": [
      "Hustle",
      "Serene Grace"
    ],
    "hiddenAbility": "Super Luck",
    "sprite": "togetic",
    "spriteId": "togetic",
    "learnset": []
  },
  {
    "id": 177,
    "name": "Natu",
    "types": [
      "Psychic",
      "Flying"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 50,
      "def": 45,
      "spa": 70,
      "spd": 45,
      "spe": 70
    },
    "abilities": [
      "Synchronize",
      "Early Bird"
    ],
    "hiddenAbility": "Magic Bounce",
    "sprite": "natu",
    "spriteId": "natu",
    "learnset": []
  },
  {
    "id": 178,
    "name": "Xatu",
    "types": [
      "Psychic",
      "Flying"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 75,
      "def": 70,
      "spa": 95,
      "spd": 70,
      "spe": 95
    },
    "abilities": [
      "Synchronize",
      "Early Bird"
    ],
    "hiddenAbility": "Magic Bounce",
    "sprite": "xatu",
    "spriteId": "xatu",
    "learnset": []
  },
  {
    "id": 179,
    "name": "Mareep",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 40,
      "def": 40,
      "spa": 65,
      "spd": 45,
      "spe": 35
    },
    "abilities": [
      "Static"
    ],
    "hiddenAbility": "Plus",
    "sprite": "mareep",
    "spriteId": "mareep",
    "learnset": []
  },
  {
    "id": 180,
    "name": "Flaaffy",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 55,
      "def": 55,
      "spa": 80,
      "spd": 60,
      "spe": 45
    },
    "abilities": [
      "Static"
    ],
    "hiddenAbility": "Plus",
    "sprite": "flaaffy",
    "spriteId": "flaaffy",
    "learnset": []
  },
  {
    "id": 181,
    "name": "Ampharos",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 75,
      "def": 85,
      "spa": 115,
      "spd": 90,
      "spe": 55
    },
    "abilities": [
      "Static"
    ],
    "hiddenAbility": "Plus",
    "sprite": "ampharos",
    "spriteId": "ampharos",
    "learnset": []
  },
  {
    "id": 181,
    "name": "Ampharos-Mega",
    "types": [
      "Electric",
      "Dragon"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 95,
      "def": 105,
      "spa": 165,
      "spd": 110,
      "spe": 45
    },
    "abilities": [
      "Mold Breaker"
    ],
    "hiddenAbility": "",
    "sprite": "ampharosmega",
    "spriteId": "ampharos-mega",
    "learnset": []
  },
  {
    "id": 182,
    "name": "Bellossom",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 80,
      "def": 95,
      "spa": 90,
      "spd": 100,
      "spe": 50
    },
    "abilities": [
      "Chlorophyll"
    ],
    "hiddenAbility": "Healer",
    "sprite": "bellossom",
    "spriteId": "bellossom",
    "learnset": []
  },
  {
    "id": 183,
    "name": "Marill",
    "types": [
      "Water",
      "Fairy"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 20,
      "def": 50,
      "spa": 20,
      "spd": 50,
      "spe": 40
    },
    "abilities": [
      "Thick Fat",
      "Huge Power"
    ],
    "hiddenAbility": "Sap Sipper",
    "sprite": "marill",
    "spriteId": "marill",
    "learnset": []
  },
  {
    "id": 184,
    "name": "Azumarill",
    "types": [
      "Water",
      "Fairy"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 50,
      "def": 80,
      "spa": 60,
      "spd": 80,
      "spe": 50
    },
    "abilities": [
      "Thick Fat",
      "Huge Power"
    ],
    "hiddenAbility": "Sap Sipper",
    "sprite": "azumarill",
    "spriteId": "azumarill",
    "learnset": []
  },
  {
    "id": 185,
    "name": "Sudowoodo",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 100,
      "def": 115,
      "spa": 30,
      "spd": 65,
      "spe": 30
    },
    "abilities": [
      "Sturdy",
      "Rock Head"
    ],
    "hiddenAbility": "Rattled",
    "sprite": "sudowoodo",
    "spriteId": "sudowoodo",
    "learnset": []
  },
  {
    "id": 186,
    "name": "Politoed",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 75,
      "def": 75,
      "spa": 90,
      "spd": 100,
      "spe": 70
    },
    "abilities": [
      "Water Absorb",
      "Damp"
    ],
    "hiddenAbility": "Drizzle",
    "sprite": "politoed",
    "spriteId": "politoed",
    "learnset": []
  },
  {
    "id": 187,
    "name": "Hoppip",
    "types": [
      "Grass",
      "Flying"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 35,
      "def": 40,
      "spa": 35,
      "spd": 55,
      "spe": 50
    },
    "abilities": [
      "Chlorophyll",
      "Leaf Guard"
    ],
    "hiddenAbility": "Infiltrator",
    "sprite": "hoppip",
    "spriteId": "hoppip",
    "learnset": []
  },
  {
    "id": 188,
    "name": "Skiploom",
    "types": [
      "Grass",
      "Flying"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 45,
      "def": 50,
      "spa": 45,
      "spd": 65,
      "spe": 80
    },
    "abilities": [
      "Chlorophyll",
      "Leaf Guard"
    ],
    "hiddenAbility": "Infiltrator",
    "sprite": "skiploom",
    "spriteId": "skiploom",
    "learnset": []
  },
  {
    "id": 189,
    "name": "Jumpluff",
    "types": [
      "Grass",
      "Flying"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 55,
      "def": 70,
      "spa": 55,
      "spd": 95,
      "spe": 110
    },
    "abilities": [
      "Chlorophyll",
      "Leaf Guard"
    ],
    "hiddenAbility": "Infiltrator",
    "sprite": "jumpluff",
    "spriteId": "jumpluff",
    "learnset": []
  },
  {
    "id": 190,
    "name": "Aipom",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 70,
      "def": 55,
      "spa": 40,
      "spd": 55,
      "spe": 85
    },
    "abilities": [
      "Run Away",
      "Pickup"
    ],
    "hiddenAbility": "Skill Link",
    "sprite": "aipom",
    "spriteId": "aipom",
    "learnset": []
  },
  {
    "id": 191,
    "name": "Sunkern",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 30,
      "atk": 30,
      "def": 30,
      "spa": 30,
      "spd": 30,
      "spe": 30
    },
    "abilities": [
      "Chlorophyll",
      "Solar Power"
    ],
    "hiddenAbility": "Early Bird",
    "sprite": "sunkern",
    "spriteId": "sunkern",
    "learnset": []
  },
  {
    "id": 192,
    "name": "Sunflora",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 75,
      "def": 55,
      "spa": 105,
      "spd": 85,
      "spe": 30
    },
    "abilities": [
      "Chlorophyll",
      "Solar Power"
    ],
    "hiddenAbility": "Early Bird",
    "sprite": "sunflora",
    "spriteId": "sunflora",
    "learnset": []
  },
  {
    "id": 193,
    "name": "Yanma",
    "types": [
      "Bug",
      "Flying"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 65,
      "def": 45,
      "spa": 75,
      "spd": 45,
      "spe": 95
    },
    "abilities": [
      "Speed Boost",
      "Compound Eyes"
    ],
    "hiddenAbility": "Frisk",
    "sprite": "yanma",
    "spriteId": "yanma",
    "learnset": []
  },
  {
    "id": 194,
    "name": "Wooper",
    "types": [
      "Water",
      "Ground"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 45,
      "def": 45,
      "spa": 25,
      "spd": 25,
      "spe": 15
    },
    "abilities": [
      "Damp",
      "Water Absorb"
    ],
    "hiddenAbility": "Unaware",
    "sprite": "wooper",
    "spriteId": "wooper",
    "learnset": []
  },
  {
    "id": 194,
    "name": "Wooper-Paldea",
    "types": [
      "Poison",
      "Ground"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 45,
      "def": 45,
      "spa": 25,
      "spd": 25,
      "spe": 15
    },
    "abilities": [
      "Poison Point",
      "Water Absorb"
    ],
    "hiddenAbility": "Unaware",
    "sprite": "wooperpaldea",
    "spriteId": "wooper-paldea",
    "learnset": []
  },
  {
    "id": 195,
    "name": "Quagsire",
    "types": [
      "Water",
      "Ground"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 85,
      "def": 85,
      "spa": 65,
      "spd": 65,
      "spe": 35
    },
    "abilities": [
      "Damp",
      "Water Absorb"
    ],
    "hiddenAbility": "Unaware",
    "sprite": "quagsire",
    "spriteId": "quagsire",
    "learnset": []
  },
  {
    "id": 196,
    "name": "Espeon",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 65,
      "def": 60,
      "spa": 130,
      "spd": 95,
      "spe": 110
    },
    "abilities": [
      "Synchronize"
    ],
    "hiddenAbility": "Magic Bounce",
    "sprite": "espeon",
    "spriteId": "espeon",
    "learnset": []
  },
  {
    "id": 197,
    "name": "Umbreon",
    "types": [
      "Dark"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 65,
      "def": 110,
      "spa": 60,
      "spd": 130,
      "spe": 65
    },
    "abilities": [
      "Synchronize"
    ],
    "hiddenAbility": "Inner Focus",
    "sprite": "umbreon",
    "spriteId": "umbreon",
    "learnset": []
  },
  {
    "id": 198,
    "name": "Murkrow",
    "types": [
      "Dark",
      "Flying"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 85,
      "def": 42,
      "spa": 85,
      "spd": 42,
      "spe": 91
    },
    "abilities": [
      "Insomnia",
      "Super Luck"
    ],
    "hiddenAbility": "Prankster",
    "sprite": "murkrow",
    "spriteId": "murkrow",
    "learnset": []
  },
  {
    "id": 199,
    "name": "Slowking",
    "types": [
      "Water",
      "Psychic"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 75,
      "def": 80,
      "spa": 100,
      "spd": 110,
      "spe": 30
    },
    "abilities": [
      "Oblivious",
      "Own Tempo"
    ],
    "hiddenAbility": "Regenerator",
    "sprite": "slowking",
    "spriteId": "slowking",
    "learnset": []
  },
  {
    "id": 199,
    "name": "Slowking-Galar",
    "types": [
      "Poison",
      "Psychic"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 65,
      "def": 80,
      "spa": 110,
      "spd": 110,
      "spe": 30
    },
    "abilities": [
      "Curious Medicine",
      "Own Tempo"
    ],
    "hiddenAbility": "Regenerator",
    "sprite": "slowkinggalar",
    "spriteId": "slowking-galar",
    "learnset": []
  },
  {
    "id": 200,
    "name": "Misdreavus",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 60,
      "def": 60,
      "spa": 85,
      "spd": 85,
      "spe": 85
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "misdreavus",
    "spriteId": "misdreavus",
    "learnset": []
  },
  {
    "id": 201,
    "name": "Unown",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 48,
      "atk": 72,
      "def": 48,
      "spa": 72,
      "spd": 48,
      "spe": 48
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "unown",
    "spriteId": "unown",
    "learnset": []
  },
  {
    "id": 202,
    "name": "Wobbuffet",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 190,
      "atk": 33,
      "def": 58,
      "spa": 33,
      "spd": 58,
      "spe": 33
    },
    "abilities": [
      "Shadow Tag"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "wobbuffet",
    "spriteId": "wobbuffet",
    "learnset": []
  },
  {
    "id": 203,
    "name": "Girafarig",
    "types": [
      "Normal",
      "Psychic"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 80,
      "def": 65,
      "spa": 90,
      "spd": 65,
      "spe": 85
    },
    "abilities": [
      "Inner Focus",
      "Early Bird"
    ],
    "hiddenAbility": "Sap Sipper",
    "sprite": "girafarig",
    "spriteId": "girafarig",
    "learnset": []
  },
  {
    "id": 204,
    "name": "Pineco",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 65,
      "def": 90,
      "spa": 35,
      "spd": 35,
      "spe": 15
    },
    "abilities": [
      "Sturdy"
    ],
    "hiddenAbility": "Overcoat",
    "sprite": "pineco",
    "spriteId": "pineco",
    "learnset": []
  },
  {
    "id": 205,
    "name": "Forretress",
    "types": [
      "Bug",
      "Steel"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 90,
      "def": 140,
      "spa": 60,
      "spd": 60,
      "spe": 40
    },
    "abilities": [
      "Sturdy"
    ],
    "hiddenAbility": "Overcoat",
    "sprite": "forretress",
    "spriteId": "forretress",
    "learnset": []
  },
  {
    "id": 206,
    "name": "Dunsparce",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 70,
      "def": 70,
      "spa": 65,
      "spd": 65,
      "spe": 45
    },
    "abilities": [
      "Serene Grace",
      "Run Away"
    ],
    "hiddenAbility": "Rattled",
    "sprite": "dunsparce",
    "spriteId": "dunsparce",
    "learnset": []
  },
  {
    "id": 207,
    "name": "Gligar",
    "types": [
      "Ground",
      "Flying"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 75,
      "def": 105,
      "spa": 35,
      "spd": 65,
      "spe": 85
    },
    "abilities": [
      "Hyper Cutter",
      "Sand Veil"
    ],
    "hiddenAbility": "Immunity",
    "sprite": "gligar",
    "spriteId": "gligar",
    "learnset": []
  },
  {
    "id": 208,
    "name": "Steelix",
    "types": [
      "Steel",
      "Ground"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 85,
      "def": 200,
      "spa": 55,
      "spd": 65,
      "spe": 30
    },
    "abilities": [
      "Rock Head",
      "Sturdy"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "steelix",
    "spriteId": "steelix",
    "learnset": []
  },
  {
    "id": 208,
    "name": "Steelix-Mega",
    "types": [
      "Steel",
      "Ground"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 125,
      "def": 230,
      "spa": 55,
      "spd": 95,
      "spe": 30
    },
    "abilities": [
      "Sand Force"
    ],
    "hiddenAbility": "",
    "sprite": "steelixmega",
    "spriteId": "steelix-mega",
    "learnset": []
  },
  {
    "id": 209,
    "name": "Snubbull",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 80,
      "def": 50,
      "spa": 40,
      "spd": 40,
      "spe": 30
    },
    "abilities": [
      "Intimidate",
      "Run Away"
    ],
    "hiddenAbility": "Rattled",
    "sprite": "snubbull",
    "spriteId": "snubbull",
    "learnset": []
  },
  {
    "id": 210,
    "name": "Granbull",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 120,
      "def": 75,
      "spa": 60,
      "spd": 60,
      "spe": 45
    },
    "abilities": [
      "Intimidate",
      "Quick Feet"
    ],
    "hiddenAbility": "Rattled",
    "sprite": "granbull",
    "spriteId": "granbull",
    "learnset": []
  },
  {
    "id": 211,
    "name": "Qwilfish",
    "types": [
      "Water",
      "Poison"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 95,
      "def": 85,
      "spa": 55,
      "spd": 55,
      "spe": 85
    },
    "abilities": [
      "Poison Point",
      "Swift Swim"
    ],
    "hiddenAbility": "Intimidate",
    "sprite": "qwilfish",
    "spriteId": "qwilfish",
    "learnset": []
  },
  {
    "id": 211,
    "name": "Qwilfish-Hisui",
    "types": [
      "Dark",
      "Poison"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 95,
      "def": 85,
      "spa": 55,
      "spd": 55,
      "spe": 85
    },
    "abilities": [
      "Poison Point",
      "Swift Swim"
    ],
    "hiddenAbility": "Intimidate",
    "sprite": "qwilfishhisui",
    "spriteId": "qwilfish-hisui",
    "learnset": []
  },
  {
    "id": 212,
    "name": "Scizor",
    "types": [
      "Bug",
      "Steel"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 130,
      "def": 100,
      "spa": 55,
      "spd": 80,
      "spe": 65
    },
    "abilities": [
      "Swarm",
      "Technician"
    ],
    "hiddenAbility": "Light Metal",
    "sprite": "scizor",
    "spriteId": "scizor",
    "learnset": []
  },
  {
    "id": 212,
    "name": "Scizor-Mega",
    "types": [
      "Bug",
      "Steel"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 150,
      "def": 140,
      "spa": 65,
      "spd": 100,
      "spe": 75
    },
    "abilities": [
      "Technician"
    ],
    "hiddenAbility": "",
    "sprite": "scizormega",
    "spriteId": "scizor-mega",
    "learnset": []
  },
  {
    "id": 213,
    "name": "Shuckle",
    "types": [
      "Bug",
      "Rock"
    ],
    "baseStats": {
      "hp": 20,
      "atk": 10,
      "def": 230,
      "spa": 10,
      "spd": 230,
      "spe": 5
    },
    "abilities": [
      "Sturdy",
      "Gluttony"
    ],
    "hiddenAbility": "Contrary",
    "sprite": "shuckle",
    "spriteId": "shuckle",
    "learnset": []
  },
  {
    "id": 214,
    "name": "Heracross",
    "types": [
      "Bug",
      "Fighting"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 125,
      "def": 75,
      "spa": 40,
      "spd": 95,
      "spe": 85
    },
    "abilities": [
      "Swarm",
      "Guts"
    ],
    "hiddenAbility": "Moxie",
    "sprite": "heracross",
    "spriteId": "heracross",
    "learnset": []
  },
  {
    "id": 214,
    "name": "Heracross-Mega",
    "types": [
      "Bug",
      "Fighting"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 185,
      "def": 115,
      "spa": 40,
      "spd": 105,
      "spe": 75
    },
    "abilities": [
      "Skill Link"
    ],
    "hiddenAbility": "",
    "sprite": "heracrossmega",
    "spriteId": "heracross-mega",
    "learnset": []
  },
  {
    "id": 215,
    "name": "Sneasel",
    "types": [
      "Dark",
      "Ice"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 95,
      "def": 55,
      "spa": 35,
      "spd": 75,
      "spe": 115
    },
    "abilities": [
      "Inner Focus",
      "Keen Eye"
    ],
    "hiddenAbility": "Pickpocket",
    "sprite": "sneasel",
    "spriteId": "sneasel",
    "learnset": []
  },
  {
    "id": 215,
    "name": "Sneasel-Hisui",
    "types": [
      "Fighting",
      "Poison"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 95,
      "def": 55,
      "spa": 35,
      "spd": 75,
      "spe": 115
    },
    "abilities": [
      "Inner Focus",
      "Keen Eye"
    ],
    "hiddenAbility": "Pickpocket",
    "sprite": "sneaselhisui",
    "spriteId": "sneasel-hisui",
    "learnset": []
  },
  {
    "id": 216,
    "name": "Teddiursa",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 80,
      "def": 50,
      "spa": 50,
      "spd": 50,
      "spe": 40
    },
    "abilities": [
      "Pickup",
      "Quick Feet"
    ],
    "hiddenAbility": "Honey Gather",
    "sprite": "teddiursa",
    "spriteId": "teddiursa",
    "learnset": []
  },
  {
    "id": 217,
    "name": "Ursaring",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 130,
      "def": 75,
      "spa": 75,
      "spd": 75,
      "spe": 55
    },
    "abilities": [
      "Guts",
      "Quick Feet"
    ],
    "hiddenAbility": "Unnerve",
    "sprite": "ursaring",
    "spriteId": "ursaring",
    "learnset": []
  },
  {
    "id": 218,
    "name": "Slugma",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 40,
      "def": 40,
      "spa": 70,
      "spd": 40,
      "spe": 20
    },
    "abilities": [
      "Magma Armor",
      "Flame Body"
    ],
    "hiddenAbility": "Weak Armor",
    "sprite": "slugma",
    "spriteId": "slugma",
    "learnset": []
  },
  {
    "id": 219,
    "name": "Magcargo",
    "types": [
      "Fire",
      "Rock"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 50,
      "def": 120,
      "spa": 90,
      "spd": 80,
      "spe": 30
    },
    "abilities": [
      "Magma Armor",
      "Flame Body"
    ],
    "hiddenAbility": "Weak Armor",
    "sprite": "magcargo",
    "spriteId": "magcargo",
    "learnset": []
  },
  {
    "id": 220,
    "name": "Swinub",
    "types": [
      "Ice",
      "Ground"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 50,
      "def": 40,
      "spa": 30,
      "spd": 30,
      "spe": 50
    },
    "abilities": [
      "Oblivious",
      "Snow Cloak"
    ],
    "hiddenAbility": "Thick Fat",
    "sprite": "swinub",
    "spriteId": "swinub",
    "learnset": []
  },
  {
    "id": 221,
    "name": "Piloswine",
    "types": [
      "Ice",
      "Ground"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 100,
      "def": 80,
      "spa": 60,
      "spd": 60,
      "spe": 50
    },
    "abilities": [
      "Oblivious",
      "Snow Cloak"
    ],
    "hiddenAbility": "Thick Fat",
    "sprite": "piloswine",
    "spriteId": "piloswine",
    "learnset": []
  },
  {
    "id": 222,
    "name": "Corsola",
    "types": [
      "Water",
      "Rock"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 55,
      "def": 95,
      "spa": 65,
      "spd": 95,
      "spe": 35
    },
    "abilities": [
      "Hustle",
      "Natural Cure"
    ],
    "hiddenAbility": "Regenerator",
    "sprite": "corsola",
    "spriteId": "corsola",
    "learnset": []
  },
  {
    "id": 222,
    "name": "Corsola-Galar",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 55,
      "def": 100,
      "spa": 65,
      "spd": 100,
      "spe": 30
    },
    "abilities": [
      "Weak Armor"
    ],
    "hiddenAbility": "Cursed Body",
    "sprite": "corsolagalar",
    "spriteId": "corsola-galar",
    "learnset": []
  },
  {
    "id": 223,
    "name": "Remoraid",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 65,
      "def": 35,
      "spa": 65,
      "spd": 35,
      "spe": 65
    },
    "abilities": [
      "Hustle",
      "Sniper"
    ],
    "hiddenAbility": "Moody",
    "sprite": "remoraid",
    "spriteId": "remoraid",
    "learnset": []
  },
  {
    "id": 224,
    "name": "Octillery",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 105,
      "def": 75,
      "spa": 105,
      "spd": 75,
      "spe": 45
    },
    "abilities": [
      "Suction Cups",
      "Sniper"
    ],
    "hiddenAbility": "Moody",
    "sprite": "octillery",
    "spriteId": "octillery",
    "learnset": []
  },
  {
    "id": 225,
    "name": "Delibird",
    "types": [
      "Ice",
      "Flying"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 55,
      "def": 45,
      "spa": 65,
      "spd": 45,
      "spe": 75
    },
    "abilities": [
      "Vital Spirit",
      "Hustle"
    ],
    "hiddenAbility": "Insomnia",
    "sprite": "delibird",
    "spriteId": "delibird",
    "learnset": []
  },
  {
    "id": 226,
    "name": "Mantine",
    "types": [
      "Water",
      "Flying"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 40,
      "def": 70,
      "spa": 80,
      "spd": 140,
      "spe": 70
    },
    "abilities": [
      "Swift Swim",
      "Water Absorb"
    ],
    "hiddenAbility": "Water Veil",
    "sprite": "mantine",
    "spriteId": "mantine",
    "learnset": []
  },
  {
    "id": 227,
    "name": "Skarmory",
    "types": [
      "Steel",
      "Flying"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 80,
      "def": 140,
      "spa": 40,
      "spd": 70,
      "spe": 70
    },
    "abilities": [
      "Keen Eye",
      "Sturdy"
    ],
    "hiddenAbility": "Weak Armor",
    "sprite": "skarmory",
    "spriteId": "skarmory",
    "learnset": []
  },
  {
    "id": 227,
    "name": "Skarmory-Mega",
    "types": [
      "Steel",
      "Flying"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 140,
      "def": 110,
      "spa": 40,
      "spd": 100,
      "spe": 110
    },
    "abilities": [
      "Stalwart"
    ],
    "hiddenAbility": "",
    "sprite": "skarmorymega",
    "spriteId": "skarmory-mega",
    "learnset": []
  },
  {
    "id": 228,
    "name": "Houndour",
    "types": [
      "Dark",
      "Fire"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 60,
      "def": 30,
      "spa": 80,
      "spd": 50,
      "spe": 65
    },
    "abilities": [
      "Early Bird",
      "Flash Fire"
    ],
    "hiddenAbility": "Unnerve",
    "sprite": "houndour",
    "spriteId": "houndour",
    "learnset": []
  },
  {
    "id": 229,
    "name": "Houndoom",
    "types": [
      "Dark",
      "Fire"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 90,
      "def": 50,
      "spa": 110,
      "spd": 80,
      "spe": 95
    },
    "abilities": [
      "Early Bird",
      "Flash Fire"
    ],
    "hiddenAbility": "Unnerve",
    "sprite": "houndoom",
    "spriteId": "houndoom",
    "learnset": []
  },
  {
    "id": 229,
    "name": "Houndoom-Mega",
    "types": [
      "Dark",
      "Fire"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 90,
      "def": 90,
      "spa": 140,
      "spd": 90,
      "spe": 115
    },
    "abilities": [
      "Solar Power"
    ],
    "hiddenAbility": "",
    "sprite": "houndoommega",
    "spriteId": "houndoom-mega",
    "learnset": []
  },
  {
    "id": 230,
    "name": "Kingdra",
    "types": [
      "Water",
      "Dragon"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 95,
      "def": 95,
      "spa": 95,
      "spd": 95,
      "spe": 85
    },
    "abilities": [
      "Swift Swim",
      "Sniper"
    ],
    "hiddenAbility": "Damp",
    "sprite": "kingdra",
    "spriteId": "kingdra",
    "learnset": []
  },
  {
    "id": 231,
    "name": "Phanpy",
    "types": [
      "Ground"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 60,
      "def": 60,
      "spa": 40,
      "spd": 40,
      "spe": 40
    },
    "abilities": [
      "Pickup"
    ],
    "hiddenAbility": "Sand Veil",
    "sprite": "phanpy",
    "spriteId": "phanpy",
    "learnset": []
  },
  {
    "id": 232,
    "name": "Donphan",
    "types": [
      "Ground"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 120,
      "def": 120,
      "spa": 60,
      "spd": 60,
      "spe": 50
    },
    "abilities": [
      "Sturdy"
    ],
    "hiddenAbility": "Sand Veil",
    "sprite": "donphan",
    "spriteId": "donphan",
    "learnset": []
  },
  {
    "id": 233,
    "name": "Porygon2",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 80,
      "def": 90,
      "spa": 105,
      "spd": 95,
      "spe": 60
    },
    "abilities": [
      "Trace",
      "Download"
    ],
    "hiddenAbility": "Analytic",
    "sprite": "porygon2",
    "spriteId": "porygon2",
    "learnset": []
  },
  {
    "id": 234,
    "name": "Stantler",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 73,
      "atk": 95,
      "def": 62,
      "spa": 85,
      "spd": 65,
      "spe": 85
    },
    "abilities": [
      "Intimidate",
      "Frisk"
    ],
    "hiddenAbility": "Sap Sipper",
    "sprite": "stantler",
    "spriteId": "stantler",
    "learnset": []
  },
  {
    "id": 235,
    "name": "Smeargle",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 20,
      "def": 35,
      "spa": 20,
      "spd": 45,
      "spe": 75
    },
    "abilities": [
      "Own Tempo",
      "Technician"
    ],
    "hiddenAbility": "Moody",
    "sprite": "smeargle",
    "spriteId": "smeargle",
    "learnset": []
  },
  {
    "id": 236,
    "name": "Tyrogue",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 35,
      "def": 35,
      "spa": 35,
      "spd": 35,
      "spe": 35
    },
    "abilities": [
      "Guts",
      "Steadfast"
    ],
    "hiddenAbility": "Vital Spirit",
    "sprite": "tyrogue",
    "spriteId": "tyrogue",
    "learnset": []
  },
  {
    "id": 237,
    "name": "Hitmontop",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 95,
      "def": 95,
      "spa": 35,
      "spd": 110,
      "spe": 70
    },
    "abilities": [
      "Intimidate",
      "Technician"
    ],
    "hiddenAbility": "Steadfast",
    "sprite": "hitmontop",
    "spriteId": "hitmontop",
    "learnset": []
  },
  {
    "id": 238,
    "name": "Smoochum",
    "types": [
      "Ice",
      "Psychic"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 30,
      "def": 15,
      "spa": 85,
      "spd": 65,
      "spe": 65
    },
    "abilities": [
      "Oblivious",
      "Forewarn"
    ],
    "hiddenAbility": "Hydration",
    "sprite": "smoochum",
    "spriteId": "smoochum",
    "learnset": []
  },
  {
    "id": 239,
    "name": "Elekid",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 63,
      "def": 37,
      "spa": 65,
      "spd": 55,
      "spe": 95
    },
    "abilities": [
      "Static"
    ],
    "hiddenAbility": "Vital Spirit",
    "sprite": "elekid",
    "spriteId": "elekid",
    "learnset": []
  },
  {
    "id": 240,
    "name": "Magby",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 75,
      "def": 37,
      "spa": 70,
      "spd": 55,
      "spe": 83
    },
    "abilities": [
      "Flame Body"
    ],
    "hiddenAbility": "Vital Spirit",
    "sprite": "magby",
    "spriteId": "magby",
    "learnset": []
  },
  {
    "id": 241,
    "name": "Miltank",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 80,
      "def": 105,
      "spa": 40,
      "spd": 70,
      "spe": 100
    },
    "abilities": [
      "Thick Fat",
      "Scrappy"
    ],
    "hiddenAbility": "Sap Sipper",
    "sprite": "miltank",
    "spriteId": "miltank",
    "learnset": []
  },
  {
    "id": 242,
    "name": "Blissey",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 255,
      "atk": 10,
      "def": 10,
      "spa": 75,
      "spd": 135,
      "spe": 55
    },
    "abilities": [
      "Natural Cure",
      "Serene Grace"
    ],
    "hiddenAbility": "Healer",
    "sprite": "blissey",
    "spriteId": "blissey",
    "learnset": []
  },
  {
    "id": 243,
    "name": "Raikou",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 85,
      "def": 75,
      "spa": 115,
      "spd": 100,
      "spe": 115
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "Inner Focus",
    "sprite": "raikou",
    "spriteId": "raikou",
    "learnset": []
  },
  {
    "id": 244,
    "name": "Entei",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 115,
      "atk": 115,
      "def": 85,
      "spa": 90,
      "spd": 75,
      "spe": 100
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "Inner Focus",
    "sprite": "entei",
    "spriteId": "entei",
    "learnset": []
  },
  {
    "id": 245,
    "name": "Suicune",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 75,
      "def": 115,
      "spa": 90,
      "spd": 115,
      "spe": 85
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "Inner Focus",
    "sprite": "suicune",
    "spriteId": "suicune",
    "learnset": []
  },
  {
    "id": 246,
    "name": "Larvitar",
    "types": [
      "Rock",
      "Ground"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 64,
      "def": 50,
      "spa": 45,
      "spd": 50,
      "spe": 41
    },
    "abilities": [
      "Guts"
    ],
    "hiddenAbility": "Sand Veil",
    "sprite": "larvitar",
    "spriteId": "larvitar",
    "learnset": []
  },
  {
    "id": 247,
    "name": "Pupitar",
    "types": [
      "Rock",
      "Ground"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 84,
      "def": 70,
      "spa": 65,
      "spd": 70,
      "spe": 51
    },
    "abilities": [
      "Shed Skin"
    ],
    "hiddenAbility": "",
    "sprite": "pupitar",
    "spriteId": "pupitar",
    "learnset": []
  },
  {
    "id": 248,
    "name": "Tyranitar",
    "types": [
      "Rock",
      "Dark"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 134,
      "def": 110,
      "spa": 95,
      "spd": 100,
      "spe": 61
    },
    "abilities": [
      "Sand Stream"
    ],
    "hiddenAbility": "Unnerve",
    "sprite": "tyranitar",
    "spriteId": "tyranitar",
    "learnset": []
  },
  {
    "id": 248,
    "name": "Tyranitar-Mega",
    "types": [
      "Rock",
      "Dark"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 164,
      "def": 150,
      "spa": 95,
      "spd": 120,
      "spe": 71
    },
    "abilities": [
      "Sand Stream"
    ],
    "hiddenAbility": "",
    "sprite": "tyranitarmega",
    "spriteId": "tyranitar-mega",
    "learnset": []
  },
  {
    "id": 249,
    "name": "Lugia",
    "types": [
      "Psychic",
      "Flying"
    ],
    "baseStats": {
      "hp": 106,
      "atk": 90,
      "def": 130,
      "spa": 90,
      "spd": 154,
      "spe": 110
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "Multiscale",
    "sprite": "lugia",
    "spriteId": "lugia",
    "learnset": []
  },
  {
    "id": 250,
    "name": "Ho-Oh",
    "types": [
      "Fire",
      "Flying"
    ],
    "baseStats": {
      "hp": 106,
      "atk": 130,
      "def": 90,
      "spa": 110,
      "spd": 154,
      "spe": 90
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "Regenerator",
    "sprite": "hooh",
    "spriteId": "hooh",
    "learnset": []
  },
  {
    "id": 251,
    "name": "Celebi",
    "types": [
      "Psychic",
      "Grass"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 100,
      "def": 100,
      "spa": 100,
      "spd": 100,
      "spe": 100
    },
    "abilities": [
      "Natural Cure"
    ],
    "hiddenAbility": "",
    "sprite": "celebi",
    "spriteId": "celebi",
    "learnset": []
  },
  {
    "id": 252,
    "name": "Treecko",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 45,
      "def": 35,
      "spa": 65,
      "spd": 55,
      "spe": 70
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Unburden",
    "sprite": "treecko",
    "spriteId": "treecko",
    "learnset": []
  },
  {
    "id": 253,
    "name": "Grovyle",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 65,
      "def": 45,
      "spa": 85,
      "spd": 65,
      "spe": 95
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Unburden",
    "sprite": "grovyle",
    "spriteId": "grovyle",
    "learnset": []
  },
  {
    "id": 254,
    "name": "Sceptile",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 85,
      "def": 65,
      "spa": 105,
      "spd": 85,
      "spe": 120
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Unburden",
    "sprite": "sceptile",
    "spriteId": "sceptile",
    "learnset": []
  },
  {
    "id": 254,
    "name": "Sceptile-Mega",
    "types": [
      "Grass",
      "Dragon"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 110,
      "def": 75,
      "spa": 145,
      "spd": 85,
      "spe": 145
    },
    "abilities": [
      "Lightning Rod"
    ],
    "hiddenAbility": "",
    "sprite": "sceptilemega",
    "spriteId": "sceptile-mega",
    "learnset": []
  },
  {
    "id": 255,
    "name": "Torchic",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 60,
      "def": 40,
      "spa": 70,
      "spd": 50,
      "spe": 45
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Speed Boost",
    "sprite": "torchic",
    "spriteId": "torchic",
    "learnset": []
  },
  {
    "id": 256,
    "name": "Combusken",
    "types": [
      "Fire",
      "Fighting"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 85,
      "def": 60,
      "spa": 85,
      "spd": 60,
      "spe": 55
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Speed Boost",
    "sprite": "combusken",
    "spriteId": "combusken",
    "learnset": []
  },
  {
    "id": 257,
    "name": "Blaziken",
    "types": [
      "Fire",
      "Fighting"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 120,
      "def": 70,
      "spa": 110,
      "spd": 70,
      "spe": 80
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Speed Boost",
    "sprite": "blaziken",
    "spriteId": "blaziken",
    "learnset": []
  },
  {
    "id": 257,
    "name": "Blaziken-Mega",
    "types": [
      "Fire",
      "Fighting"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 160,
      "def": 80,
      "spa": 130,
      "spd": 80,
      "spe": 100
    },
    "abilities": [
      "Speed Boost"
    ],
    "hiddenAbility": "",
    "sprite": "blazikenmega",
    "spriteId": "blaziken-mega",
    "learnset": []
  },
  {
    "id": 258,
    "name": "Mudkip",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 70,
      "def": 50,
      "spa": 50,
      "spd": 50,
      "spe": 40
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Damp",
    "sprite": "mudkip",
    "spriteId": "mudkip",
    "learnset": []
  },
  {
    "id": 259,
    "name": "Marshtomp",
    "types": [
      "Water",
      "Ground"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 85,
      "def": 70,
      "spa": 60,
      "spd": 70,
      "spe": 50
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Damp",
    "sprite": "marshtomp",
    "spriteId": "marshtomp",
    "learnset": []
  },
  {
    "id": 260,
    "name": "Swampert",
    "types": [
      "Water",
      "Ground"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 110,
      "def": 90,
      "spa": 85,
      "spd": 90,
      "spe": 60
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Damp",
    "sprite": "swampert",
    "spriteId": "swampert",
    "learnset": []
  },
  {
    "id": 260,
    "name": "Swampert-Mega",
    "types": [
      "Water",
      "Ground"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 150,
      "def": 110,
      "spa": 95,
      "spd": 110,
      "spe": 70
    },
    "abilities": [
      "Swift Swim"
    ],
    "hiddenAbility": "",
    "sprite": "swampertmega",
    "spriteId": "swampert-mega",
    "learnset": []
  },
  {
    "id": 261,
    "name": "Poochyena",
    "types": [
      "Dark"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 55,
      "def": 35,
      "spa": 30,
      "spd": 30,
      "spe": 35
    },
    "abilities": [
      "Run Away",
      "Quick Feet"
    ],
    "hiddenAbility": "Rattled",
    "sprite": "poochyena",
    "spriteId": "poochyena",
    "learnset": []
  },
  {
    "id": 262,
    "name": "Mightyena",
    "types": [
      "Dark"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 90,
      "def": 70,
      "spa": 60,
      "spd": 60,
      "spe": 70
    },
    "abilities": [
      "Intimidate",
      "Quick Feet"
    ],
    "hiddenAbility": "Moxie",
    "sprite": "mightyena",
    "spriteId": "mightyena",
    "learnset": []
  },
  {
    "id": 263,
    "name": "Zigzagoon",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 38,
      "atk": 30,
      "def": 41,
      "spa": 30,
      "spd": 41,
      "spe": 60
    },
    "abilities": [
      "Pickup",
      "Gluttony"
    ],
    "hiddenAbility": "Quick Feet",
    "sprite": "zigzagoon",
    "spriteId": "zigzagoon",
    "learnset": []
  },
  {
    "id": 263,
    "name": "Zigzagoon-Galar",
    "types": [
      "Dark",
      "Normal"
    ],
    "baseStats": {
      "hp": 38,
      "atk": 30,
      "def": 41,
      "spa": 30,
      "spd": 41,
      "spe": 60
    },
    "abilities": [
      "Pickup",
      "Gluttony"
    ],
    "hiddenAbility": "Quick Feet",
    "sprite": "zigzagoongalar",
    "spriteId": "zigzagoon-galar",
    "learnset": []
  },
  {
    "id": 264,
    "name": "Linoone",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 78,
      "atk": 70,
      "def": 61,
      "spa": 50,
      "spd": 61,
      "spe": 100
    },
    "abilities": [
      "Pickup",
      "Gluttony"
    ],
    "hiddenAbility": "Quick Feet",
    "sprite": "linoone",
    "spriteId": "linoone",
    "learnset": []
  },
  {
    "id": 264,
    "name": "Linoone-Galar",
    "types": [
      "Dark",
      "Normal"
    ],
    "baseStats": {
      "hp": 78,
      "atk": 70,
      "def": 61,
      "spa": 50,
      "spd": 61,
      "spe": 100
    },
    "abilities": [
      "Pickup",
      "Gluttony"
    ],
    "hiddenAbility": "Quick Feet",
    "sprite": "linoonegalar",
    "spriteId": "linoone-galar",
    "learnset": []
  },
  {
    "id": 265,
    "name": "Wurmple",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 45,
      "def": 35,
      "spa": 20,
      "spd": 30,
      "spe": 20
    },
    "abilities": [
      "Shield Dust"
    ],
    "hiddenAbility": "Run Away",
    "sprite": "wurmple",
    "spriteId": "wurmple",
    "learnset": []
  },
  {
    "id": 266,
    "name": "Silcoon",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 35,
      "def": 55,
      "spa": 25,
      "spd": 25,
      "spe": 15
    },
    "abilities": [
      "Shed Skin"
    ],
    "hiddenAbility": "",
    "sprite": "silcoon",
    "spriteId": "silcoon",
    "learnset": []
  },
  {
    "id": 267,
    "name": "Beautifly",
    "types": [
      "Bug",
      "Flying"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 70,
      "def": 50,
      "spa": 100,
      "spd": 50,
      "spe": 65
    },
    "abilities": [
      "Swarm"
    ],
    "hiddenAbility": "Rivalry",
    "sprite": "beautifly",
    "spriteId": "beautifly",
    "learnset": []
  },
  {
    "id": 268,
    "name": "Cascoon",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 35,
      "def": 55,
      "spa": 25,
      "spd": 25,
      "spe": 15
    },
    "abilities": [
      "Shed Skin"
    ],
    "hiddenAbility": "",
    "sprite": "cascoon",
    "spriteId": "cascoon",
    "learnset": []
  },
  {
    "id": 269,
    "name": "Dustox",
    "types": [
      "Bug",
      "Poison"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 50,
      "def": 70,
      "spa": 50,
      "spd": 90,
      "spe": 65
    },
    "abilities": [
      "Shield Dust"
    ],
    "hiddenAbility": "Compound Eyes",
    "sprite": "dustox",
    "spriteId": "dustox",
    "learnset": []
  },
  {
    "id": 270,
    "name": "Lotad",
    "types": [
      "Water",
      "Grass"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 30,
      "def": 30,
      "spa": 40,
      "spd": 50,
      "spe": 30
    },
    "abilities": [
      "Swift Swim",
      "Rain Dish"
    ],
    "hiddenAbility": "Own Tempo",
    "sprite": "lotad",
    "spriteId": "lotad",
    "learnset": []
  },
  {
    "id": 271,
    "name": "Lombre",
    "types": [
      "Water",
      "Grass"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 50,
      "def": 50,
      "spa": 60,
      "spd": 70,
      "spe": 50
    },
    "abilities": [
      "Swift Swim",
      "Rain Dish"
    ],
    "hiddenAbility": "Own Tempo",
    "sprite": "lombre",
    "spriteId": "lombre",
    "learnset": []
  },
  {
    "id": 272,
    "name": "Ludicolo",
    "types": [
      "Water",
      "Grass"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 70,
      "def": 70,
      "spa": 90,
      "spd": 100,
      "spe": 70
    },
    "abilities": [
      "Swift Swim",
      "Rain Dish"
    ],
    "hiddenAbility": "Own Tempo",
    "sprite": "ludicolo",
    "spriteId": "ludicolo",
    "learnset": []
  },
  {
    "id": 273,
    "name": "Seedot",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 40,
      "def": 50,
      "spa": 30,
      "spd": 30,
      "spe": 30
    },
    "abilities": [
      "Chlorophyll",
      "Early Bird"
    ],
    "hiddenAbility": "Pickpocket",
    "sprite": "seedot",
    "spriteId": "seedot",
    "learnset": []
  },
  {
    "id": 274,
    "name": "Nuzleaf",
    "types": [
      "Grass",
      "Dark"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 70,
      "def": 40,
      "spa": 60,
      "spd": 40,
      "spe": 60
    },
    "abilities": [
      "Chlorophyll",
      "Early Bird"
    ],
    "hiddenAbility": "Pickpocket",
    "sprite": "nuzleaf",
    "spriteId": "nuzleaf",
    "learnset": []
  },
  {
    "id": 275,
    "name": "Shiftry",
    "types": [
      "Grass",
      "Dark"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 100,
      "def": 60,
      "spa": 90,
      "spd": 60,
      "spe": 80
    },
    "abilities": [
      "Chlorophyll",
      "Wind Rider"
    ],
    "hiddenAbility": "Pickpocket",
    "sprite": "shiftry",
    "spriteId": "shiftry",
    "learnset": []
  },
  {
    "id": 276,
    "name": "Taillow",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 55,
      "def": 30,
      "spa": 30,
      "spd": 30,
      "spe": 85
    },
    "abilities": [
      "Guts"
    ],
    "hiddenAbility": "Scrappy",
    "sprite": "taillow",
    "spriteId": "taillow",
    "learnset": []
  },
  {
    "id": 277,
    "name": "Swellow",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 85,
      "def": 60,
      "spa": 75,
      "spd": 50,
      "spe": 125
    },
    "abilities": [
      "Guts"
    ],
    "hiddenAbility": "Scrappy",
    "sprite": "swellow",
    "spriteId": "swellow",
    "learnset": []
  },
  {
    "id": 278,
    "name": "Wingull",
    "types": [
      "Water",
      "Flying"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 30,
      "def": 30,
      "spa": 55,
      "spd": 30,
      "spe": 85
    },
    "abilities": [
      "Keen Eye",
      "Hydration"
    ],
    "hiddenAbility": "Rain Dish",
    "sprite": "wingull",
    "spriteId": "wingull",
    "learnset": []
  },
  {
    "id": 279,
    "name": "Pelipper",
    "types": [
      "Water",
      "Flying"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 50,
      "def": 100,
      "spa": 95,
      "spd": 70,
      "spe": 65
    },
    "abilities": [
      "Keen Eye",
      "Drizzle"
    ],
    "hiddenAbility": "Rain Dish",
    "sprite": "pelipper",
    "spriteId": "pelipper",
    "learnset": []
  },
  {
    "id": 280,
    "name": "Ralts",
    "types": [
      "Psychic",
      "Fairy"
    ],
    "baseStats": {
      "hp": 28,
      "atk": 25,
      "def": 25,
      "spa": 45,
      "spd": 35,
      "spe": 40
    },
    "abilities": [
      "Synchronize",
      "Trace"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "ralts",
    "spriteId": "ralts",
    "learnset": []
  },
  {
    "id": 281,
    "name": "Kirlia",
    "types": [
      "Psychic",
      "Fairy"
    ],
    "baseStats": {
      "hp": 38,
      "atk": 35,
      "def": 35,
      "spa": 65,
      "spd": 55,
      "spe": 50
    },
    "abilities": [
      "Synchronize",
      "Trace"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "kirlia",
    "spriteId": "kirlia",
    "learnset": []
  },
  {
    "id": 282,
    "name": "Gardevoir",
    "types": [
      "Psychic",
      "Fairy"
    ],
    "baseStats": {
      "hp": 68,
      "atk": 65,
      "def": 65,
      "spa": 125,
      "spd": 115,
      "spe": 80
    },
    "abilities": [
      "Synchronize",
      "Trace"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "gardevoir",
    "spriteId": "gardevoir",
    "learnset": []
  },
  {
    "id": 282,
    "name": "Gardevoir-Mega",
    "types": [
      "Psychic",
      "Fairy"
    ],
    "baseStats": {
      "hp": 68,
      "atk": 85,
      "def": 65,
      "spa": 165,
      "spd": 135,
      "spe": 100
    },
    "abilities": [
      "Pixilate"
    ],
    "hiddenAbility": "",
    "sprite": "gardevoirmega",
    "spriteId": "gardevoir-mega",
    "learnset": []
  },
  {
    "id": 283,
    "name": "Surskit",
    "types": [
      "Bug",
      "Water"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 30,
      "def": 32,
      "spa": 50,
      "spd": 52,
      "spe": 65
    },
    "abilities": [
      "Swift Swim"
    ],
    "hiddenAbility": "Rain Dish",
    "sprite": "surskit",
    "spriteId": "surskit",
    "learnset": []
  },
  {
    "id": 284,
    "name": "Masquerain",
    "types": [
      "Bug",
      "Flying"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 60,
      "def": 62,
      "spa": 100,
      "spd": 82,
      "spe": 80
    },
    "abilities": [
      "Intimidate"
    ],
    "hiddenAbility": "Unnerve",
    "sprite": "masquerain",
    "spriteId": "masquerain",
    "learnset": []
  },
  {
    "id": 285,
    "name": "Shroomish",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 40,
      "def": 60,
      "spa": 40,
      "spd": 60,
      "spe": 35
    },
    "abilities": [
      "Effect Spore",
      "Poison Heal"
    ],
    "hiddenAbility": "Quick Feet",
    "sprite": "shroomish",
    "spriteId": "shroomish",
    "learnset": []
  },
  {
    "id": 286,
    "name": "Breloom",
    "types": [
      "Grass",
      "Fighting"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 130,
      "def": 80,
      "spa": 60,
      "spd": 60,
      "spe": 70
    },
    "abilities": [
      "Effect Spore",
      "Poison Heal"
    ],
    "hiddenAbility": "Technician",
    "sprite": "breloom",
    "spriteId": "breloom",
    "learnset": []
  },
  {
    "id": 287,
    "name": "Slakoth",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 60,
      "def": 60,
      "spa": 35,
      "spd": 35,
      "spe": 30
    },
    "abilities": [
      "Truant"
    ],
    "hiddenAbility": "",
    "sprite": "slakoth",
    "spriteId": "slakoth",
    "learnset": []
  },
  {
    "id": 288,
    "name": "Vigoroth",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 80,
      "def": 80,
      "spa": 55,
      "spd": 55,
      "spe": 90
    },
    "abilities": [
      "Vital Spirit"
    ],
    "hiddenAbility": "",
    "sprite": "vigoroth",
    "spriteId": "vigoroth",
    "learnset": []
  },
  {
    "id": 289,
    "name": "Slaking",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 150,
      "atk": 160,
      "def": 100,
      "spa": 95,
      "spd": 65,
      "spe": 100
    },
    "abilities": [
      "Truant"
    ],
    "hiddenAbility": "",
    "sprite": "slaking",
    "spriteId": "slaking",
    "learnset": []
  },
  {
    "id": 290,
    "name": "Nincada",
    "types": [
      "Bug",
      "Ground"
    ],
    "baseStats": {
      "hp": 31,
      "atk": 45,
      "def": 90,
      "spa": 30,
      "spd": 30,
      "spe": 40
    },
    "abilities": [
      "Compound Eyes"
    ],
    "hiddenAbility": "Run Away",
    "sprite": "nincada",
    "spriteId": "nincada",
    "learnset": []
  },
  {
    "id": 291,
    "name": "Ninjask",
    "types": [
      "Bug",
      "Flying"
    ],
    "baseStats": {
      "hp": 61,
      "atk": 90,
      "def": 45,
      "spa": 50,
      "spd": 50,
      "spe": 160
    },
    "abilities": [
      "Speed Boost"
    ],
    "hiddenAbility": "Infiltrator",
    "sprite": "ninjask",
    "spriteId": "ninjask",
    "learnset": []
  },
  {
    "id": 292,
    "name": "Shedinja",
    "types": [
      "Bug",
      "Ghost"
    ],
    "baseStats": {
      "hp": 1,
      "atk": 90,
      "def": 45,
      "spa": 30,
      "spd": 30,
      "spe": 40
    },
    "abilities": [
      "Wonder Guard"
    ],
    "hiddenAbility": "",
    "sprite": "shedinja",
    "spriteId": "shedinja",
    "learnset": []
  },
  {
    "id": 293,
    "name": "Whismur",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 64,
      "atk": 51,
      "def": 23,
      "spa": 51,
      "spd": 23,
      "spe": 28
    },
    "abilities": [
      "Soundproof"
    ],
    "hiddenAbility": "Rattled",
    "sprite": "whismur",
    "spriteId": "whismur",
    "learnset": []
  },
  {
    "id": 294,
    "name": "Loudred",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 84,
      "atk": 71,
      "def": 43,
      "spa": 71,
      "spd": 43,
      "spe": 48
    },
    "abilities": [
      "Soundproof"
    ],
    "hiddenAbility": "Scrappy",
    "sprite": "loudred",
    "spriteId": "loudred",
    "learnset": []
  },
  {
    "id": 295,
    "name": "Exploud",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 104,
      "atk": 91,
      "def": 63,
      "spa": 91,
      "spd": 73,
      "spe": 68
    },
    "abilities": [
      "Soundproof"
    ],
    "hiddenAbility": "Scrappy",
    "sprite": "exploud",
    "spriteId": "exploud",
    "learnset": []
  },
  {
    "id": 296,
    "name": "Makuhita",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 72,
      "atk": 60,
      "def": 30,
      "spa": 20,
      "spd": 30,
      "spe": 25
    },
    "abilities": [
      "Thick Fat",
      "Guts"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "makuhita",
    "spriteId": "makuhita",
    "learnset": []
  },
  {
    "id": 297,
    "name": "Hariyama",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 144,
      "atk": 120,
      "def": 60,
      "spa": 40,
      "spd": 60,
      "spe": 50
    },
    "abilities": [
      "Thick Fat",
      "Guts"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "hariyama",
    "spriteId": "hariyama",
    "learnset": []
  },
  {
    "id": 298,
    "name": "Azurill",
    "types": [
      "Normal",
      "Fairy"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 20,
      "def": 40,
      "spa": 20,
      "spd": 40,
      "spe": 20
    },
    "abilities": [
      "Thick Fat",
      "Huge Power"
    ],
    "hiddenAbility": "Sap Sipper",
    "sprite": "azurill",
    "spriteId": "azurill",
    "learnset": []
  },
  {
    "id": 299,
    "name": "Nosepass",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 30,
      "atk": 45,
      "def": 135,
      "spa": 45,
      "spd": 90,
      "spe": 30
    },
    "abilities": [
      "Sturdy",
      "Magnet Pull"
    ],
    "hiddenAbility": "Sand Force",
    "sprite": "nosepass",
    "spriteId": "nosepass",
    "learnset": []
  },
  {
    "id": 300,
    "name": "Skitty",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 45,
      "def": 45,
      "spa": 35,
      "spd": 35,
      "spe": 50
    },
    "abilities": [
      "Cute Charm",
      "Normalize"
    ],
    "hiddenAbility": "Wonder Skin",
    "sprite": "skitty",
    "spriteId": "skitty",
    "learnset": []
  },
  {
    "id": 301,
    "name": "Delcatty",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 65,
      "def": 65,
      "spa": 55,
      "spd": 55,
      "spe": 90
    },
    "abilities": [
      "Cute Charm",
      "Normalize"
    ],
    "hiddenAbility": "Wonder Skin",
    "sprite": "delcatty",
    "spriteId": "delcatty",
    "learnset": []
  },
  {
    "id": 302,
    "name": "Sableye",
    "types": [
      "Dark",
      "Ghost"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 75,
      "def": 75,
      "spa": 65,
      "spd": 65,
      "spe": 50
    },
    "abilities": [
      "Keen Eye",
      "Stall"
    ],
    "hiddenAbility": "Prankster",
    "sprite": "sableye",
    "spriteId": "sableye",
    "learnset": []
  },
  {
    "id": 302,
    "name": "Sableye-Mega",
    "types": [
      "Dark",
      "Ghost"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 85,
      "def": 125,
      "spa": 85,
      "spd": 115,
      "spe": 20
    },
    "abilities": [
      "Magic Bounce"
    ],
    "hiddenAbility": "",
    "sprite": "sableyemega",
    "spriteId": "sableye-mega",
    "learnset": []
  },
  {
    "id": 303,
    "name": "Mawile",
    "types": [
      "Steel",
      "Fairy"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 85,
      "def": 85,
      "spa": 55,
      "spd": 55,
      "spe": 50
    },
    "abilities": [
      "Hyper Cutter",
      "Intimidate"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "mawile",
    "spriteId": "mawile",
    "learnset": []
  },
  {
    "id": 303,
    "name": "Mawile-Mega",
    "types": [
      "Steel",
      "Fairy"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 105,
      "def": 125,
      "spa": 55,
      "spd": 95,
      "spe": 50
    },
    "abilities": [
      "Huge Power"
    ],
    "hiddenAbility": "",
    "sprite": "mawilemega",
    "spriteId": "mawile-mega",
    "learnset": []
  },
  {
    "id": 304,
    "name": "Aron",
    "types": [
      "Steel",
      "Rock"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 70,
      "def": 100,
      "spa": 40,
      "spd": 40,
      "spe": 30
    },
    "abilities": [
      "Sturdy",
      "Rock Head"
    ],
    "hiddenAbility": "Heavy Metal",
    "sprite": "aron",
    "spriteId": "aron",
    "learnset": []
  },
  {
    "id": 305,
    "name": "Lairon",
    "types": [
      "Steel",
      "Rock"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 90,
      "def": 140,
      "spa": 50,
      "spd": 50,
      "spe": 40
    },
    "abilities": [
      "Sturdy",
      "Rock Head"
    ],
    "hiddenAbility": "Heavy Metal",
    "sprite": "lairon",
    "spriteId": "lairon",
    "learnset": []
  },
  {
    "id": 306,
    "name": "Aggron",
    "types": [
      "Steel",
      "Rock"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 110,
      "def": 180,
      "spa": 60,
      "spd": 60,
      "spe": 50
    },
    "abilities": [
      "Sturdy",
      "Rock Head"
    ],
    "hiddenAbility": "Heavy Metal",
    "sprite": "aggron",
    "spriteId": "aggron",
    "learnset": []
  },
  {
    "id": 306,
    "name": "Aggron-Mega",
    "types": [
      "Steel"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 140,
      "def": 230,
      "spa": 60,
      "spd": 80,
      "spe": 50
    },
    "abilities": [
      "Filter"
    ],
    "hiddenAbility": "",
    "sprite": "aggronmega",
    "spriteId": "aggron-mega",
    "learnset": []
  },
  {
    "id": 307,
    "name": "Meditite",
    "types": [
      "Fighting",
      "Psychic"
    ],
    "baseStats": {
      "hp": 30,
      "atk": 40,
      "def": 55,
      "spa": 40,
      "spd": 55,
      "spe": 60
    },
    "abilities": [
      "Pure Power"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "meditite",
    "spriteId": "meditite",
    "learnset": []
  },
  {
    "id": 308,
    "name": "Medicham",
    "types": [
      "Fighting",
      "Psychic"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 60,
      "def": 75,
      "spa": 60,
      "spd": 75,
      "spe": 80
    },
    "abilities": [
      "Pure Power"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "medicham",
    "spriteId": "medicham",
    "learnset": []
  },
  {
    "id": 308,
    "name": "Medicham-Mega",
    "types": [
      "Fighting",
      "Psychic"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 100,
      "def": 85,
      "spa": 80,
      "spd": 85,
      "spe": 100
    },
    "abilities": [
      "Pure Power"
    ],
    "hiddenAbility": "",
    "sprite": "medichammega",
    "spriteId": "medicham-mega",
    "learnset": []
  },
  {
    "id": 309,
    "name": "Electrike",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 45,
      "def": 40,
      "spa": 65,
      "spd": 40,
      "spe": 65
    },
    "abilities": [
      "Static",
      "Lightning Rod"
    ],
    "hiddenAbility": "Minus",
    "sprite": "electrike",
    "spriteId": "electrike",
    "learnset": []
  },
  {
    "id": 310,
    "name": "Manectric",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 75,
      "def": 60,
      "spa": 105,
      "spd": 60,
      "spe": 105
    },
    "abilities": [
      "Static",
      "Lightning Rod"
    ],
    "hiddenAbility": "Minus",
    "sprite": "manectric",
    "spriteId": "manectric",
    "learnset": []
  },
  {
    "id": 310,
    "name": "Manectric-Mega",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 75,
      "def": 80,
      "spa": 135,
      "spd": 80,
      "spe": 135
    },
    "abilities": [
      "Intimidate"
    ],
    "hiddenAbility": "",
    "sprite": "manectricmega",
    "spriteId": "manectric-mega",
    "learnset": []
  },
  {
    "id": 311,
    "name": "Plusle",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 50,
      "def": 40,
      "spa": 85,
      "spd": 75,
      "spe": 95
    },
    "abilities": [
      "Plus"
    ],
    "hiddenAbility": "Lightning Rod",
    "sprite": "plusle",
    "spriteId": "plusle",
    "learnset": []
  },
  {
    "id": 312,
    "name": "Minun",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 40,
      "def": 50,
      "spa": 75,
      "spd": 85,
      "spe": 95
    },
    "abilities": [
      "Minus"
    ],
    "hiddenAbility": "Volt Absorb",
    "sprite": "minun",
    "spriteId": "minun",
    "learnset": []
  },
  {
    "id": 313,
    "name": "Volbeat",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 73,
      "def": 75,
      "spa": 47,
      "spd": 85,
      "spe": 85
    },
    "abilities": [
      "Illuminate",
      "Swarm"
    ],
    "hiddenAbility": "Prankster",
    "sprite": "volbeat",
    "spriteId": "volbeat",
    "learnset": []
  },
  {
    "id": 314,
    "name": "Illumise",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 47,
      "def": 75,
      "spa": 73,
      "spd": 85,
      "spe": 85
    },
    "abilities": [
      "Oblivious",
      "Tinted Lens"
    ],
    "hiddenAbility": "Prankster",
    "sprite": "illumise",
    "spriteId": "illumise",
    "learnset": []
  },
  {
    "id": 315,
    "name": "Roselia",
    "types": [
      "Grass",
      "Poison"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 60,
      "def": 45,
      "spa": 100,
      "spd": 80,
      "spe": 65
    },
    "abilities": [
      "Natural Cure",
      "Poison Point"
    ],
    "hiddenAbility": "Leaf Guard",
    "sprite": "roselia",
    "spriteId": "roselia",
    "learnset": []
  },
  {
    "id": 316,
    "name": "Gulpin",
    "types": [
      "Poison"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 43,
      "def": 53,
      "spa": 43,
      "spd": 53,
      "spe": 40
    },
    "abilities": [
      "Liquid Ooze",
      "Sticky Hold"
    ],
    "hiddenAbility": "Gluttony",
    "sprite": "gulpin",
    "spriteId": "gulpin",
    "learnset": []
  },
  {
    "id": 317,
    "name": "Swalot",
    "types": [
      "Poison"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 73,
      "def": 83,
      "spa": 73,
      "spd": 83,
      "spe": 55
    },
    "abilities": [
      "Liquid Ooze",
      "Sticky Hold"
    ],
    "hiddenAbility": "Gluttony",
    "sprite": "swalot",
    "spriteId": "swalot",
    "learnset": []
  },
  {
    "id": 318,
    "name": "Carvanha",
    "types": [
      "Water",
      "Dark"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 90,
      "def": 20,
      "spa": 65,
      "spd": 20,
      "spe": 65
    },
    "abilities": [
      "Rough Skin"
    ],
    "hiddenAbility": "Speed Boost",
    "sprite": "carvanha",
    "spriteId": "carvanha",
    "learnset": []
  },
  {
    "id": 319,
    "name": "Sharpedo",
    "types": [
      "Water",
      "Dark"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 120,
      "def": 40,
      "spa": 95,
      "spd": 40,
      "spe": 95
    },
    "abilities": [
      "Rough Skin"
    ],
    "hiddenAbility": "Speed Boost",
    "sprite": "sharpedo",
    "spriteId": "sharpedo",
    "learnset": []
  },
  {
    "id": 319,
    "name": "Sharpedo-Mega",
    "types": [
      "Water",
      "Dark"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 140,
      "def": 70,
      "spa": 110,
      "spd": 65,
      "spe": 105
    },
    "abilities": [
      "Strong Jaw"
    ],
    "hiddenAbility": "",
    "sprite": "sharpedomega",
    "spriteId": "sharpedo-mega",
    "learnset": []
  },
  {
    "id": 320,
    "name": "Wailmer",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 130,
      "atk": 70,
      "def": 35,
      "spa": 70,
      "spd": 35,
      "spe": 60
    },
    "abilities": [
      "Water Veil",
      "Oblivious"
    ],
    "hiddenAbility": "Pressure",
    "sprite": "wailmer",
    "spriteId": "wailmer",
    "learnset": []
  },
  {
    "id": 321,
    "name": "Wailord",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 170,
      "atk": 90,
      "def": 45,
      "spa": 90,
      "spd": 45,
      "spe": 60
    },
    "abilities": [
      "Water Veil",
      "Oblivious"
    ],
    "hiddenAbility": "Pressure",
    "sprite": "wailord",
    "spriteId": "wailord",
    "learnset": []
  },
  {
    "id": 322,
    "name": "Numel",
    "types": [
      "Fire",
      "Ground"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 60,
      "def": 40,
      "spa": 65,
      "spd": 45,
      "spe": 35
    },
    "abilities": [
      "Oblivious",
      "Simple"
    ],
    "hiddenAbility": "Own Tempo",
    "sprite": "numel",
    "spriteId": "numel",
    "learnset": []
  },
  {
    "id": 323,
    "name": "Camerupt",
    "types": [
      "Fire",
      "Ground"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 100,
      "def": 70,
      "spa": 105,
      "spd": 75,
      "spe": 40
    },
    "abilities": [
      "Magma Armor",
      "Solid Rock"
    ],
    "hiddenAbility": "Anger Point",
    "sprite": "camerupt",
    "spriteId": "camerupt",
    "learnset": []
  },
  {
    "id": 323,
    "name": "Camerupt-Mega",
    "types": [
      "Fire",
      "Ground"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 120,
      "def": 100,
      "spa": 145,
      "spd": 105,
      "spe": 20
    },
    "abilities": [
      "Sheer Force"
    ],
    "hiddenAbility": "",
    "sprite": "cameruptmega",
    "spriteId": "camerupt-mega",
    "learnset": []
  },
  {
    "id": 324,
    "name": "Torkoal",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 85,
      "def": 140,
      "spa": 85,
      "spd": 70,
      "spe": 20
    },
    "abilities": [
      "White Smoke",
      "Drought"
    ],
    "hiddenAbility": "Shell Armor",
    "sprite": "torkoal",
    "spriteId": "torkoal",
    "learnset": []
  },
  {
    "id": 325,
    "name": "Spoink",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 25,
      "def": 35,
      "spa": 70,
      "spd": 80,
      "spe": 60
    },
    "abilities": [
      "Thick Fat",
      "Own Tempo"
    ],
    "hiddenAbility": "Gluttony",
    "sprite": "spoink",
    "spriteId": "spoink",
    "learnset": []
  },
  {
    "id": 326,
    "name": "Grumpig",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 45,
      "def": 65,
      "spa": 90,
      "spd": 110,
      "spe": 80
    },
    "abilities": [
      "Thick Fat",
      "Own Tempo"
    ],
    "hiddenAbility": "Gluttony",
    "sprite": "grumpig",
    "spriteId": "grumpig",
    "learnset": []
  },
  {
    "id": 327,
    "name": "Spinda",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 60,
      "def": 60,
      "spa": 60,
      "spd": 60,
      "spe": 60
    },
    "abilities": [
      "Own Tempo",
      "Tangled Feet"
    ],
    "hiddenAbility": "Contrary",
    "sprite": "spinda",
    "spriteId": "spinda",
    "learnset": []
  },
  {
    "id": 328,
    "name": "Trapinch",
    "types": [
      "Ground"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 100,
      "def": 45,
      "spa": 45,
      "spd": 45,
      "spe": 10
    },
    "abilities": [
      "Hyper Cutter",
      "Arena Trap"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "trapinch",
    "spriteId": "trapinch",
    "learnset": []
  },
  {
    "id": 329,
    "name": "Vibrava",
    "types": [
      "Ground",
      "Dragon"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 70,
      "def": 50,
      "spa": 50,
      "spd": 50,
      "spe": 70
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "vibrava",
    "spriteId": "vibrava",
    "learnset": []
  },
  {
    "id": 330,
    "name": "Flygon",
    "types": [
      "Ground",
      "Dragon"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 100,
      "def": 80,
      "spa": 80,
      "spd": 80,
      "spe": 100
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "flygon",
    "spriteId": "flygon",
    "learnset": []
  },
  {
    "id": 331,
    "name": "Cacnea",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 85,
      "def": 40,
      "spa": 85,
      "spd": 40,
      "spe": 35
    },
    "abilities": [
      "Sand Veil"
    ],
    "hiddenAbility": "Water Absorb",
    "sprite": "cacnea",
    "spriteId": "cacnea",
    "learnset": []
  },
  {
    "id": 332,
    "name": "Cacturne",
    "types": [
      "Grass",
      "Dark"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 115,
      "def": 60,
      "spa": 115,
      "spd": 60,
      "spe": 55
    },
    "abilities": [
      "Sand Veil"
    ],
    "hiddenAbility": "Water Absorb",
    "sprite": "cacturne",
    "spriteId": "cacturne",
    "learnset": []
  },
  {
    "id": 333,
    "name": "Swablu",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 40,
      "def": 60,
      "spa": 40,
      "spd": 75,
      "spe": 50
    },
    "abilities": [
      "Natural Cure"
    ],
    "hiddenAbility": "Cloud Nine",
    "sprite": "swablu",
    "spriteId": "swablu",
    "learnset": []
  },
  {
    "id": 334,
    "name": "Altaria",
    "types": [
      "Dragon",
      "Flying"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 70,
      "def": 90,
      "spa": 70,
      "spd": 105,
      "spe": 80
    },
    "abilities": [
      "Natural Cure"
    ],
    "hiddenAbility": "Cloud Nine",
    "sprite": "altaria",
    "spriteId": "altaria",
    "learnset": []
  },
  {
    "id": 334,
    "name": "Altaria-Mega",
    "types": [
      "Dragon",
      "Fairy"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 110,
      "def": 110,
      "spa": 110,
      "spd": 105,
      "spe": 80
    },
    "abilities": [
      "Pixilate"
    ],
    "hiddenAbility": "",
    "sprite": "altariamega",
    "spriteId": "altaria-mega",
    "learnset": []
  },
  {
    "id": 335,
    "name": "Zangoose",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 73,
      "atk": 115,
      "def": 60,
      "spa": 60,
      "spd": 60,
      "spe": 90
    },
    "abilities": [
      "Immunity"
    ],
    "hiddenAbility": "Toxic Boost",
    "sprite": "zangoose",
    "spriteId": "zangoose",
    "learnset": []
  },
  {
    "id": 336,
    "name": "Seviper",
    "types": [
      "Poison"
    ],
    "baseStats": {
      "hp": 73,
      "atk": 100,
      "def": 60,
      "spa": 100,
      "spd": 60,
      "spe": 65
    },
    "abilities": [
      "Shed Skin"
    ],
    "hiddenAbility": "Infiltrator",
    "sprite": "seviper",
    "spriteId": "seviper",
    "learnset": []
  },
  {
    "id": 337,
    "name": "Lunatone",
    "types": [
      "Rock",
      "Psychic"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 55,
      "def": 65,
      "spa": 95,
      "spd": 85,
      "spe": 70
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "lunatone",
    "spriteId": "lunatone",
    "learnset": []
  },
  {
    "id": 338,
    "name": "Solrock",
    "types": [
      "Rock",
      "Psychic"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 95,
      "def": 85,
      "spa": 55,
      "spd": 65,
      "spe": 70
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "solrock",
    "spriteId": "solrock",
    "learnset": []
  },
  {
    "id": 339,
    "name": "Barboach",
    "types": [
      "Water",
      "Ground"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 48,
      "def": 43,
      "spa": 46,
      "spd": 41,
      "spe": 60
    },
    "abilities": [
      "Oblivious",
      "Anticipation"
    ],
    "hiddenAbility": "Hydration",
    "sprite": "barboach",
    "spriteId": "barboach",
    "learnset": []
  },
  {
    "id": 340,
    "name": "Whiscash",
    "types": [
      "Water",
      "Ground"
    ],
    "baseStats": {
      "hp": 110,
      "atk": 78,
      "def": 73,
      "spa": 76,
      "spd": 71,
      "spe": 60
    },
    "abilities": [
      "Oblivious",
      "Anticipation"
    ],
    "hiddenAbility": "Hydration",
    "sprite": "whiscash",
    "spriteId": "whiscash",
    "learnset": []
  },
  {
    "id": 341,
    "name": "Corphish",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 43,
      "atk": 80,
      "def": 65,
      "spa": 50,
      "spd": 35,
      "spe": 35
    },
    "abilities": [
      "Hyper Cutter",
      "Shell Armor"
    ],
    "hiddenAbility": "Adaptability",
    "sprite": "corphish",
    "spriteId": "corphish",
    "learnset": []
  },
  {
    "id": 342,
    "name": "Crawdaunt",
    "types": [
      "Water",
      "Dark"
    ],
    "baseStats": {
      "hp": 63,
      "atk": 120,
      "def": 85,
      "spa": 90,
      "spd": 55,
      "spe": 55
    },
    "abilities": [
      "Hyper Cutter",
      "Shell Armor"
    ],
    "hiddenAbility": "Adaptability",
    "sprite": "crawdaunt",
    "spriteId": "crawdaunt",
    "learnset": []
  },
  {
    "id": 343,
    "name": "Baltoy",
    "types": [
      "Ground",
      "Psychic"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 40,
      "def": 55,
      "spa": 40,
      "spd": 70,
      "spe": 55
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "baltoy",
    "spriteId": "baltoy",
    "learnset": []
  },
  {
    "id": 344,
    "name": "Claydol",
    "types": [
      "Ground",
      "Psychic"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 70,
      "def": 105,
      "spa": 70,
      "spd": 120,
      "spe": 75
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "claydol",
    "spriteId": "claydol",
    "learnset": []
  },
  {
    "id": 345,
    "name": "Lileep",
    "types": [
      "Rock",
      "Grass"
    ],
    "baseStats": {
      "hp": 66,
      "atk": 41,
      "def": 77,
      "spa": 61,
      "spd": 87,
      "spe": 23
    },
    "abilities": [
      "Suction Cups"
    ],
    "hiddenAbility": "Storm Drain",
    "sprite": "lileep",
    "spriteId": "lileep",
    "learnset": []
  },
  {
    "id": 346,
    "name": "Cradily",
    "types": [
      "Rock",
      "Grass"
    ],
    "baseStats": {
      "hp": 86,
      "atk": 81,
      "def": 97,
      "spa": 81,
      "spd": 107,
      "spe": 43
    },
    "abilities": [
      "Suction Cups"
    ],
    "hiddenAbility": "Storm Drain",
    "sprite": "cradily",
    "spriteId": "cradily",
    "learnset": []
  },
  {
    "id": 347,
    "name": "Anorith",
    "types": [
      "Rock",
      "Bug"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 95,
      "def": 50,
      "spa": 40,
      "spd": 50,
      "spe": 75
    },
    "abilities": [
      "Battle Armor"
    ],
    "hiddenAbility": "Swift Swim",
    "sprite": "anorith",
    "spriteId": "anorith",
    "learnset": []
  },
  {
    "id": 348,
    "name": "Armaldo",
    "types": [
      "Rock",
      "Bug"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 125,
      "def": 100,
      "spa": 70,
      "spd": 80,
      "spe": 45
    },
    "abilities": [
      "Battle Armor"
    ],
    "hiddenAbility": "Swift Swim",
    "sprite": "armaldo",
    "spriteId": "armaldo",
    "learnset": []
  },
  {
    "id": 349,
    "name": "Feebas",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 20,
      "atk": 15,
      "def": 20,
      "spa": 10,
      "spd": 55,
      "spe": 80
    },
    "abilities": [
      "Swift Swim",
      "Oblivious"
    ],
    "hiddenAbility": "Adaptability",
    "sprite": "feebas",
    "spriteId": "feebas",
    "learnset": []
  },
  {
    "id": 350,
    "name": "Milotic",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 60,
      "def": 79,
      "spa": 100,
      "spd": 125,
      "spe": 81
    },
    "abilities": [
      "Marvel Scale",
      "Competitive"
    ],
    "hiddenAbility": "Cute Charm",
    "sprite": "milotic",
    "spriteId": "milotic",
    "learnset": []
  },
  {
    "id": 351,
    "name": "Castform",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 70,
      "def": 70,
      "spa": 70,
      "spd": 70,
      "spe": 70
    },
    "abilities": [
      "Forecast"
    ],
    "hiddenAbility": "",
    "sprite": "castform",
    "spriteId": "castform",
    "learnset": []
  },
  {
    "id": 351,
    "name": "Castform-Sunny",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 70,
      "def": 70,
      "spa": 70,
      "spd": 70,
      "spe": 70
    },
    "abilities": [
      "Forecast"
    ],
    "hiddenAbility": "",
    "sprite": "castformsunny",
    "spriteId": "castform-sunny",
    "learnset": []
  },
  {
    "id": 351,
    "name": "Castform-Rainy",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 70,
      "def": 70,
      "spa": 70,
      "spd": 70,
      "spe": 70
    },
    "abilities": [
      "Forecast"
    ],
    "hiddenAbility": "",
    "sprite": "castformrainy",
    "spriteId": "castform-rainy",
    "learnset": []
  },
  {
    "id": 351,
    "name": "Castform-Snowy",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 70,
      "def": 70,
      "spa": 70,
      "spd": 70,
      "spe": 70
    },
    "abilities": [
      "Forecast"
    ],
    "hiddenAbility": "",
    "sprite": "castformsnowy",
    "spriteId": "castform-snowy",
    "learnset": []
  },
  {
    "id": 352,
    "name": "Kecleon",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 90,
      "def": 70,
      "spa": 60,
      "spd": 120,
      "spe": 40
    },
    "abilities": [
      "Color Change"
    ],
    "hiddenAbility": "Protean",
    "sprite": "kecleon",
    "spriteId": "kecleon",
    "learnset": []
  },
  {
    "id": 353,
    "name": "Shuppet",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 44,
      "atk": 75,
      "def": 35,
      "spa": 63,
      "spd": 33,
      "spe": 45
    },
    "abilities": [
      "Insomnia",
      "Frisk"
    ],
    "hiddenAbility": "Cursed Body",
    "sprite": "shuppet",
    "spriteId": "shuppet",
    "learnset": []
  },
  {
    "id": 354,
    "name": "Banette",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 64,
      "atk": 115,
      "def": 65,
      "spa": 83,
      "spd": 63,
      "spe": 65
    },
    "abilities": [
      "Insomnia",
      "Frisk"
    ],
    "hiddenAbility": "Cursed Body",
    "sprite": "banette",
    "spriteId": "banette",
    "learnset": []
  },
  {
    "id": 354,
    "name": "Banette-Mega",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 64,
      "atk": 165,
      "def": 75,
      "spa": 93,
      "spd": 83,
      "spe": 75
    },
    "abilities": [
      "Prankster"
    ],
    "hiddenAbility": "",
    "sprite": "banettemega",
    "spriteId": "banette-mega",
    "learnset": []
  },
  {
    "id": 355,
    "name": "Duskull",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 20,
      "atk": 40,
      "def": 90,
      "spa": 30,
      "spd": 90,
      "spe": 25
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "Frisk",
    "sprite": "duskull",
    "spriteId": "duskull",
    "learnset": []
  },
  {
    "id": 356,
    "name": "Dusclops",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 70,
      "def": 130,
      "spa": 60,
      "spd": 130,
      "spe": 25
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "Frisk",
    "sprite": "dusclops",
    "spriteId": "dusclops",
    "learnset": []
  },
  {
    "id": 357,
    "name": "Tropius",
    "types": [
      "Grass",
      "Flying"
    ],
    "baseStats": {
      "hp": 99,
      "atk": 68,
      "def": 83,
      "spa": 72,
      "spd": 87,
      "spe": 51
    },
    "abilities": [
      "Chlorophyll",
      "Solar Power"
    ],
    "hiddenAbility": "Harvest",
    "sprite": "tropius",
    "spriteId": "tropius",
    "learnset": []
  },
  {
    "id": 358,
    "name": "Chimecho",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 50,
      "def": 80,
      "spa": 95,
      "spd": 90,
      "spe": 65
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "chimecho",
    "spriteId": "chimecho",
    "learnset": []
  },
  {
    "id": 358,
    "name": "Chimecho-Mega",
    "types": [
      "Psychic",
      "Steel"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 50,
      "def": 110,
      "spa": 135,
      "spd": 120,
      "spe": 65
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "chimechomega",
    "spriteId": "chimecho-mega",
    "learnset": []
  },
  {
    "id": 359,
    "name": "Absol",
    "types": [
      "Dark"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 130,
      "def": 60,
      "spa": 75,
      "spd": 60,
      "spe": 75
    },
    "abilities": [
      "Pressure",
      "Super Luck"
    ],
    "hiddenAbility": "Justified",
    "sprite": "absol",
    "spriteId": "absol",
    "learnset": []
  },
  {
    "id": 359,
    "name": "Absol-Mega",
    "types": [
      "Dark"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 150,
      "def": 60,
      "spa": 115,
      "spd": 60,
      "spe": 115
    },
    "abilities": [
      "Magic Bounce"
    ],
    "hiddenAbility": "",
    "sprite": "absolmega",
    "spriteId": "absol-mega",
    "learnset": []
  },
  {
    "id": 359,
    "name": "Absol-Mega-Z",
    "types": [
      "Dark",
      "Ghost"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 154,
      "def": 60,
      "spa": 75,
      "spd": 60,
      "spe": 151
    },
    "abilities": [
      "Sharpness"
    ],
    "hiddenAbility": "",
    "sprite": "absolmegaz",
    "spriteId": "absol-megaz",
    "learnset": []
  },
  {
    "id": 360,
    "name": "Wynaut",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 23,
      "def": 48,
      "spa": 23,
      "spd": 48,
      "spe": 23
    },
    "abilities": [
      "Shadow Tag"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "wynaut",
    "spriteId": "wynaut",
    "learnset": []
  },
  {
    "id": 361,
    "name": "Snorunt",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 50,
      "def": 50,
      "spa": 50,
      "spd": 50,
      "spe": 50
    },
    "abilities": [
      "Inner Focus",
      "Ice Body"
    ],
    "hiddenAbility": "Moody",
    "sprite": "snorunt",
    "spriteId": "snorunt",
    "learnset": []
  },
  {
    "id": 362,
    "name": "Glalie",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 80,
      "def": 80,
      "spa": 80,
      "spd": 80,
      "spe": 80
    },
    "abilities": [
      "Inner Focus",
      "Ice Body"
    ],
    "hiddenAbility": "Moody",
    "sprite": "glalie",
    "spriteId": "glalie",
    "learnset": []
  },
  {
    "id": 362,
    "name": "Glalie-Mega",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 120,
      "def": 80,
      "spa": 120,
      "spd": 80,
      "spe": 100
    },
    "abilities": [
      "Refrigerate"
    ],
    "hiddenAbility": "",
    "sprite": "glaliemega",
    "spriteId": "glalie-mega",
    "learnset": []
  },
  {
    "id": 363,
    "name": "Spheal",
    "types": [
      "Ice",
      "Water"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 40,
      "def": 50,
      "spa": 55,
      "spd": 50,
      "spe": 25
    },
    "abilities": [
      "Thick Fat",
      "Ice Body"
    ],
    "hiddenAbility": "Oblivious",
    "sprite": "spheal",
    "spriteId": "spheal",
    "learnset": []
  },
  {
    "id": 364,
    "name": "Sealeo",
    "types": [
      "Ice",
      "Water"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 60,
      "def": 70,
      "spa": 75,
      "spd": 70,
      "spe": 45
    },
    "abilities": [
      "Thick Fat",
      "Ice Body"
    ],
    "hiddenAbility": "Oblivious",
    "sprite": "sealeo",
    "spriteId": "sealeo",
    "learnset": []
  },
  {
    "id": 365,
    "name": "Walrein",
    "types": [
      "Ice",
      "Water"
    ],
    "baseStats": {
      "hp": 110,
      "atk": 80,
      "def": 90,
      "spa": 95,
      "spd": 90,
      "spe": 65
    },
    "abilities": [
      "Thick Fat",
      "Ice Body"
    ],
    "hiddenAbility": "Oblivious",
    "sprite": "walrein",
    "spriteId": "walrein",
    "learnset": []
  },
  {
    "id": 366,
    "name": "Clamperl",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 64,
      "def": 85,
      "spa": 74,
      "spd": 55,
      "spe": 32
    },
    "abilities": [
      "Shell Armor"
    ],
    "hiddenAbility": "Rattled",
    "sprite": "clamperl",
    "spriteId": "clamperl",
    "learnset": []
  },
  {
    "id": 367,
    "name": "Huntail",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 104,
      "def": 105,
      "spa": 94,
      "spd": 75,
      "spe": 52
    },
    "abilities": [
      "Swift Swim"
    ],
    "hiddenAbility": "Water Veil",
    "sprite": "huntail",
    "spriteId": "huntail",
    "learnset": []
  },
  {
    "id": 368,
    "name": "Gorebyss",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 84,
      "def": 105,
      "spa": 114,
      "spd": 75,
      "spe": 52
    },
    "abilities": [
      "Swift Swim"
    ],
    "hiddenAbility": "Hydration",
    "sprite": "gorebyss",
    "spriteId": "gorebyss",
    "learnset": []
  },
  {
    "id": 369,
    "name": "Relicanth",
    "types": [
      "Water",
      "Rock"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 90,
      "def": 130,
      "spa": 45,
      "spd": 65,
      "spe": 55
    },
    "abilities": [
      "Swift Swim",
      "Rock Head"
    ],
    "hiddenAbility": "Sturdy",
    "sprite": "relicanth",
    "spriteId": "relicanth",
    "learnset": []
  },
  {
    "id": 370,
    "name": "Luvdisc",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 43,
      "atk": 30,
      "def": 55,
      "spa": 40,
      "spd": 65,
      "spe": 97
    },
    "abilities": [
      "Swift Swim"
    ],
    "hiddenAbility": "Hydration",
    "sprite": "luvdisc",
    "spriteId": "luvdisc",
    "learnset": []
  },
  {
    "id": 371,
    "name": "Bagon",
    "types": [
      "Dragon"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 75,
      "def": 60,
      "spa": 40,
      "spd": 30,
      "spe": 50
    },
    "abilities": [
      "Rock Head"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "bagon",
    "spriteId": "bagon",
    "learnset": []
  },
  {
    "id": 372,
    "name": "Shelgon",
    "types": [
      "Dragon"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 95,
      "def": 100,
      "spa": 60,
      "spd": 50,
      "spe": 50
    },
    "abilities": [
      "Rock Head"
    ],
    "hiddenAbility": "Overcoat",
    "sprite": "shelgon",
    "spriteId": "shelgon",
    "learnset": []
  },
  {
    "id": 373,
    "name": "Salamence",
    "types": [
      "Dragon",
      "Flying"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 135,
      "def": 80,
      "spa": 110,
      "spd": 80,
      "spe": 100
    },
    "abilities": [
      "Intimidate"
    ],
    "hiddenAbility": "Moxie",
    "sprite": "salamence",
    "spriteId": "salamence",
    "learnset": []
  },
  {
    "id": 373,
    "name": "Salamence-Mega",
    "types": [
      "Dragon",
      "Flying"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 145,
      "def": 130,
      "spa": 120,
      "spd": 90,
      "spe": 120
    },
    "abilities": [
      "Aerilate"
    ],
    "hiddenAbility": "",
    "sprite": "salamencemega",
    "spriteId": "salamence-mega",
    "learnset": []
  },
  {
    "id": 374,
    "name": "Beldum",
    "types": [
      "Steel",
      "Psychic"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 55,
      "def": 80,
      "spa": 35,
      "spd": 60,
      "spe": 30
    },
    "abilities": [
      "Clear Body"
    ],
    "hiddenAbility": "Light Metal",
    "sprite": "beldum",
    "spriteId": "beldum",
    "learnset": []
  },
  {
    "id": 375,
    "name": "Metang",
    "types": [
      "Steel",
      "Psychic"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 75,
      "def": 100,
      "spa": 55,
      "spd": 80,
      "spe": 50
    },
    "abilities": [
      "Clear Body"
    ],
    "hiddenAbility": "Light Metal",
    "sprite": "metang",
    "spriteId": "metang",
    "learnset": []
  },
  {
    "id": 376,
    "name": "Metagross",
    "types": [
      "Steel",
      "Psychic"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 135,
      "def": 130,
      "spa": 95,
      "spd": 90,
      "spe": 70
    },
    "abilities": [
      "Clear Body"
    ],
    "hiddenAbility": "Light Metal",
    "sprite": "metagross",
    "spriteId": "metagross",
    "learnset": []
  },
  {
    "id": 376,
    "name": "Metagross-Mega",
    "types": [
      "Steel",
      "Psychic"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 145,
      "def": 150,
      "spa": 105,
      "spd": 110,
      "spe": 110
    },
    "abilities": [
      "Tough Claws"
    ],
    "hiddenAbility": "",
    "sprite": "metagrossmega",
    "spriteId": "metagross-mega",
    "learnset": []
  },
  {
    "id": 377,
    "name": "Regirock",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 100,
      "def": 200,
      "spa": 50,
      "spd": 100,
      "spe": 50
    },
    "abilities": [
      "Clear Body"
    ],
    "hiddenAbility": "Sturdy",
    "sprite": "regirock",
    "spriteId": "regirock",
    "learnset": []
  },
  {
    "id": 378,
    "name": "Regice",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 50,
      "def": 100,
      "spa": 100,
      "spd": 200,
      "spe": 50
    },
    "abilities": [
      "Clear Body"
    ],
    "hiddenAbility": "Ice Body",
    "sprite": "regice",
    "spriteId": "regice",
    "learnset": []
  },
  {
    "id": 379,
    "name": "Registeel",
    "types": [
      "Steel"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 75,
      "def": 150,
      "spa": 75,
      "spd": 150,
      "spe": 50
    },
    "abilities": [
      "Clear Body"
    ],
    "hiddenAbility": "Light Metal",
    "sprite": "registeel",
    "spriteId": "registeel",
    "learnset": []
  },
  {
    "id": 380,
    "name": "Latias",
    "types": [
      "Dragon",
      "Psychic"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 80,
      "def": 90,
      "spa": 110,
      "spd": 130,
      "spe": 110
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "latias",
    "spriteId": "latias",
    "learnset": []
  },
  {
    "id": 380,
    "name": "Latias-Mega",
    "types": [
      "Dragon",
      "Psychic"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 100,
      "def": 120,
      "spa": 140,
      "spd": 150,
      "spe": 110
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "latiasmega",
    "spriteId": "latias-mega",
    "learnset": []
  },
  {
    "id": 381,
    "name": "Latios",
    "types": [
      "Dragon",
      "Psychic"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 90,
      "def": 80,
      "spa": 130,
      "spd": 110,
      "spe": 110
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "latios",
    "spriteId": "latios",
    "learnset": []
  },
  {
    "id": 381,
    "name": "Latios-Mega",
    "types": [
      "Dragon",
      "Psychic"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 130,
      "def": 100,
      "spa": 160,
      "spd": 120,
      "spe": 110
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "latiosmega",
    "spriteId": "latios-mega",
    "learnset": []
  },
  {
    "id": 382,
    "name": "Kyogre",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 100,
      "def": 90,
      "spa": 150,
      "spd": 140,
      "spe": 90
    },
    "abilities": [
      "Drizzle"
    ],
    "hiddenAbility": "",
    "sprite": "kyogre",
    "spriteId": "kyogre",
    "learnset": []
  },
  {
    "id": 382,
    "name": "Kyogre-Primal",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 150,
      "def": 90,
      "spa": 180,
      "spd": 160,
      "spe": 90
    },
    "abilities": [
      "Primordial Sea"
    ],
    "hiddenAbility": "",
    "sprite": "kyogreprimal",
    "spriteId": "kyogre-primal",
    "learnset": []
  },
  {
    "id": 383,
    "name": "Groudon",
    "types": [
      "Ground"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 150,
      "def": 140,
      "spa": 100,
      "spd": 90,
      "spe": 90
    },
    "abilities": [
      "Drought"
    ],
    "hiddenAbility": "",
    "sprite": "groudon",
    "spriteId": "groudon",
    "learnset": []
  },
  {
    "id": 383,
    "name": "Groudon-Primal",
    "types": [
      "Ground",
      "Fire"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 180,
      "def": 160,
      "spa": 150,
      "spd": 90,
      "spe": 90
    },
    "abilities": [
      "Desolate Land"
    ],
    "hiddenAbility": "",
    "sprite": "groudonprimal",
    "spriteId": "groudon-primal",
    "learnset": []
  },
  {
    "id": 384,
    "name": "Rayquaza",
    "types": [
      "Dragon",
      "Flying"
    ],
    "baseStats": {
      "hp": 105,
      "atk": 150,
      "def": 90,
      "spa": 150,
      "spd": 90,
      "spe": 95
    },
    "abilities": [
      "Air Lock"
    ],
    "hiddenAbility": "",
    "sprite": "rayquaza",
    "spriteId": "rayquaza",
    "learnset": []
  },
  {
    "id": 384,
    "name": "Rayquaza-Mega",
    "types": [
      "Dragon",
      "Flying"
    ],
    "baseStats": {
      "hp": 105,
      "atk": 180,
      "def": 100,
      "spa": 180,
      "spd": 100,
      "spe": 115
    },
    "abilities": [
      "Delta Stream"
    ],
    "hiddenAbility": "",
    "sprite": "rayquazamega",
    "spriteId": "rayquaza-mega",
    "learnset": []
  },
  {
    "id": 385,
    "name": "Jirachi",
    "types": [
      "Steel",
      "Psychic"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 100,
      "def": 100,
      "spa": 100,
      "spd": 100,
      "spe": 100
    },
    "abilities": [
      "Serene Grace"
    ],
    "hiddenAbility": "",
    "sprite": "jirachi",
    "spriteId": "jirachi",
    "learnset": []
  },
  {
    "id": 386,
    "name": "Deoxys",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 150,
      "def": 50,
      "spa": 150,
      "spd": 50,
      "spe": 150
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "",
    "sprite": "deoxys",
    "spriteId": "deoxys",
    "learnset": []
  },
  {
    "id": 386,
    "name": "Deoxys-Attack",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 180,
      "def": 20,
      "spa": 180,
      "spd": 20,
      "spe": 150
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "",
    "sprite": "deoxysattack",
    "spriteId": "deoxys-attack",
    "learnset": []
  },
  {
    "id": 386,
    "name": "Deoxys-Defense",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 70,
      "def": 160,
      "spa": 70,
      "spd": 160,
      "spe": 90
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "",
    "sprite": "deoxysdefense",
    "spriteId": "deoxys-defense",
    "learnset": []
  },
  {
    "id": 386,
    "name": "Deoxys-Speed",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 95,
      "def": 90,
      "spa": 95,
      "spd": 90,
      "spe": 180
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "",
    "sprite": "deoxysspeed",
    "spriteId": "deoxys-speed",
    "learnset": []
  },
  {
    "id": 387,
    "name": "Turtwig",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 68,
      "def": 64,
      "spa": 45,
      "spd": 55,
      "spe": 31
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Shell Armor",
    "sprite": "turtwig",
    "spriteId": "turtwig",
    "learnset": []
  },
  {
    "id": 388,
    "name": "Grotle",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 89,
      "def": 85,
      "spa": 55,
      "spd": 65,
      "spe": 36
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Shell Armor",
    "sprite": "grotle",
    "spriteId": "grotle",
    "learnset": []
  },
  {
    "id": 389,
    "name": "Torterra",
    "types": [
      "Grass",
      "Ground"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 109,
      "def": 105,
      "spa": 75,
      "spd": 85,
      "spe": 56
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Shell Armor",
    "sprite": "torterra",
    "spriteId": "torterra",
    "learnset": []
  },
  {
    "id": 390,
    "name": "Chimchar",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 44,
      "atk": 58,
      "def": 44,
      "spa": 58,
      "spd": 44,
      "spe": 61
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Iron Fist",
    "sprite": "chimchar",
    "spriteId": "chimchar",
    "learnset": []
  },
  {
    "id": 391,
    "name": "Monferno",
    "types": [
      "Fire",
      "Fighting"
    ],
    "baseStats": {
      "hp": 64,
      "atk": 78,
      "def": 52,
      "spa": 78,
      "spd": 52,
      "spe": 81
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Iron Fist",
    "sprite": "monferno",
    "spriteId": "monferno",
    "learnset": []
  },
  {
    "id": 392,
    "name": "Infernape",
    "types": [
      "Fire",
      "Fighting"
    ],
    "baseStats": {
      "hp": 76,
      "atk": 104,
      "def": 71,
      "spa": 104,
      "spd": 71,
      "spe": 108
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Iron Fist",
    "sprite": "infernape",
    "spriteId": "infernape",
    "learnset": []
  },
  {
    "id": 393,
    "name": "Piplup",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 53,
      "atk": 51,
      "def": 53,
      "spa": 61,
      "spd": 56,
      "spe": 40
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Competitive",
    "sprite": "piplup",
    "spriteId": "piplup",
    "learnset": []
  },
  {
    "id": 394,
    "name": "Prinplup",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 64,
      "atk": 66,
      "def": 68,
      "spa": 81,
      "spd": 76,
      "spe": 50
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Competitive",
    "sprite": "prinplup",
    "spriteId": "prinplup",
    "learnset": []
  },
  {
    "id": 395,
    "name": "Empoleon",
    "types": [
      "Water",
      "Steel"
    ],
    "baseStats": {
      "hp": 84,
      "atk": 86,
      "def": 88,
      "spa": 111,
      "spd": 101,
      "spe": 60
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Competitive",
    "sprite": "empoleon",
    "spriteId": "empoleon",
    "learnset": []
  },
  {
    "id": 396,
    "name": "Starly",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 55,
      "def": 30,
      "spa": 30,
      "spd": 30,
      "spe": 60
    },
    "abilities": [
      "Keen Eye"
    ],
    "hiddenAbility": "Reckless",
    "sprite": "starly",
    "spriteId": "starly",
    "learnset": []
  },
  {
    "id": 397,
    "name": "Staravia",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 75,
      "def": 50,
      "spa": 40,
      "spd": 40,
      "spe": 80
    },
    "abilities": [
      "Intimidate"
    ],
    "hiddenAbility": "Reckless",
    "sprite": "staravia",
    "spriteId": "staravia",
    "learnset": []
  },
  {
    "id": 398,
    "name": "Staraptor",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 120,
      "def": 70,
      "spa": 50,
      "spd": 60,
      "spe": 100
    },
    "abilities": [
      "Intimidate"
    ],
    "hiddenAbility": "Reckless",
    "sprite": "staraptor",
    "spriteId": "staraptor",
    "learnset": []
  },
  {
    "id": 398,
    "name": "Staraptor-Mega",
    "types": [
      "Fighting",
      "Flying"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 140,
      "def": 100,
      "spa": 60,
      "spd": 90,
      "spe": 110
    },
    "abilities": [
      "Contrary"
    ],
    "hiddenAbility": "",
    "sprite": "staraptormega",
    "spriteId": "staraptor-mega",
    "learnset": []
  },
  {
    "id": 399,
    "name": "Bidoof",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 59,
      "atk": 45,
      "def": 40,
      "spa": 35,
      "spd": 40,
      "spe": 31
    },
    "abilities": [
      "Simple",
      "Unaware"
    ],
    "hiddenAbility": "Moody",
    "sprite": "bidoof",
    "spriteId": "bidoof",
    "learnset": []
  },
  {
    "id": 400,
    "name": "Bibarel",
    "types": [
      "Normal",
      "Water"
    ],
    "baseStats": {
      "hp": 79,
      "atk": 85,
      "def": 60,
      "spa": 55,
      "spd": 60,
      "spe": 71
    },
    "abilities": [
      "Simple",
      "Unaware"
    ],
    "hiddenAbility": "Moody",
    "sprite": "bibarel",
    "spriteId": "bibarel",
    "learnset": []
  },
  {
    "id": 401,
    "name": "Kricketot",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 37,
      "atk": 25,
      "def": 41,
      "spa": 25,
      "spd": 41,
      "spe": 25
    },
    "abilities": [
      "Shed Skin"
    ],
    "hiddenAbility": "Run Away",
    "sprite": "kricketot",
    "spriteId": "kricketot",
    "learnset": []
  },
  {
    "id": 402,
    "name": "Kricketune",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 77,
      "atk": 85,
      "def": 51,
      "spa": 55,
      "spd": 51,
      "spe": 65
    },
    "abilities": [
      "Swarm"
    ],
    "hiddenAbility": "Technician",
    "sprite": "kricketune",
    "spriteId": "kricketune",
    "learnset": []
  },
  {
    "id": 403,
    "name": "Shinx",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 65,
      "def": 34,
      "spa": 40,
      "spd": 34,
      "spe": 45
    },
    "abilities": [
      "Rivalry",
      "Intimidate"
    ],
    "hiddenAbility": "Guts",
    "sprite": "shinx",
    "spriteId": "shinx",
    "learnset": []
  },
  {
    "id": 404,
    "name": "Luxio",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 85,
      "def": 49,
      "spa": 60,
      "spd": 49,
      "spe": 60
    },
    "abilities": [
      "Rivalry",
      "Intimidate"
    ],
    "hiddenAbility": "Guts",
    "sprite": "luxio",
    "spriteId": "luxio",
    "learnset": []
  },
  {
    "id": 405,
    "name": "Luxray",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 120,
      "def": 79,
      "spa": 95,
      "spd": 79,
      "spe": 70
    },
    "abilities": [
      "Rivalry",
      "Intimidate"
    ],
    "hiddenAbility": "Guts",
    "sprite": "luxray",
    "spriteId": "luxray",
    "learnset": []
  },
  {
    "id": 406,
    "name": "Budew",
    "types": [
      "Grass",
      "Poison"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 30,
      "def": 35,
      "spa": 50,
      "spd": 70,
      "spe": 55
    },
    "abilities": [
      "Natural Cure",
      "Poison Point"
    ],
    "hiddenAbility": "Leaf Guard",
    "sprite": "budew",
    "spriteId": "budew",
    "learnset": []
  },
  {
    "id": 407,
    "name": "Roserade",
    "types": [
      "Grass",
      "Poison"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 70,
      "def": 65,
      "spa": 125,
      "spd": 105,
      "spe": 90
    },
    "abilities": [
      "Natural Cure",
      "Poison Point"
    ],
    "hiddenAbility": "Technician",
    "sprite": "roserade",
    "spriteId": "roserade",
    "learnset": []
  },
  {
    "id": 408,
    "name": "Cranidos",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 67,
      "atk": 125,
      "def": 40,
      "spa": 30,
      "spd": 30,
      "spe": 58
    },
    "abilities": [
      "Mold Breaker"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "cranidos",
    "spriteId": "cranidos",
    "learnset": []
  },
  {
    "id": 409,
    "name": "Rampardos",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 97,
      "atk": 165,
      "def": 60,
      "spa": 65,
      "spd": 50,
      "spe": 58
    },
    "abilities": [
      "Mold Breaker"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "rampardos",
    "spriteId": "rampardos",
    "learnset": []
  },
  {
    "id": 410,
    "name": "Shieldon",
    "types": [
      "Rock",
      "Steel"
    ],
    "baseStats": {
      "hp": 30,
      "atk": 42,
      "def": 118,
      "spa": 42,
      "spd": 88,
      "spe": 30
    },
    "abilities": [
      "Sturdy"
    ],
    "hiddenAbility": "Soundproof",
    "sprite": "shieldon",
    "spriteId": "shieldon",
    "learnset": []
  },
  {
    "id": 411,
    "name": "Bastiodon",
    "types": [
      "Rock",
      "Steel"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 52,
      "def": 168,
      "spa": 47,
      "spd": 138,
      "spe": 30
    },
    "abilities": [
      "Sturdy"
    ],
    "hiddenAbility": "Soundproof",
    "sprite": "bastiodon",
    "spriteId": "bastiodon",
    "learnset": []
  },
  {
    "id": 412,
    "name": "Burmy",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 29,
      "def": 45,
      "spa": 29,
      "spd": 45,
      "spe": 36
    },
    "abilities": [
      "Shed Skin"
    ],
    "hiddenAbility": "Overcoat",
    "sprite": "burmy",
    "spriteId": "burmy",
    "learnset": []
  },
  {
    "id": 413,
    "name": "Wormadam",
    "types": [
      "Bug",
      "Grass"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 59,
      "def": 85,
      "spa": 79,
      "spd": 105,
      "spe": 36
    },
    "abilities": [
      "Anticipation"
    ],
    "hiddenAbility": "Overcoat",
    "sprite": "wormadam",
    "spriteId": "wormadam",
    "learnset": []
  },
  {
    "id": 413,
    "name": "Wormadam-Sandy",
    "types": [
      "Bug",
      "Ground"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 79,
      "def": 105,
      "spa": 59,
      "spd": 85,
      "spe": 36
    },
    "abilities": [
      "Anticipation"
    ],
    "hiddenAbility": "Overcoat",
    "sprite": "wormadamsandy",
    "spriteId": "wormadam-sandy",
    "learnset": []
  },
  {
    "id": 413,
    "name": "Wormadam-Trash",
    "types": [
      "Bug",
      "Steel"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 69,
      "def": 95,
      "spa": 69,
      "spd": 95,
      "spe": 36
    },
    "abilities": [
      "Anticipation"
    ],
    "hiddenAbility": "Overcoat",
    "sprite": "wormadamtrash",
    "spriteId": "wormadam-trash",
    "learnset": []
  },
  {
    "id": 414,
    "name": "Mothim",
    "types": [
      "Bug",
      "Flying"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 94,
      "def": 50,
      "spa": 94,
      "spd": 50,
      "spe": 66
    },
    "abilities": [
      "Swarm"
    ],
    "hiddenAbility": "Tinted Lens",
    "sprite": "mothim",
    "spriteId": "mothim",
    "learnset": []
  },
  {
    "id": 415,
    "name": "Combee",
    "types": [
      "Bug",
      "Flying"
    ],
    "baseStats": {
      "hp": 30,
      "atk": 30,
      "def": 42,
      "spa": 30,
      "spd": 42,
      "spe": 70
    },
    "abilities": [
      "Honey Gather"
    ],
    "hiddenAbility": "Hustle",
    "sprite": "combee",
    "spriteId": "combee",
    "learnset": []
  },
  {
    "id": 416,
    "name": "Vespiquen",
    "types": [
      "Bug",
      "Flying"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 80,
      "def": 102,
      "spa": 80,
      "spd": 102,
      "spe": 40
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "Unnerve",
    "sprite": "vespiquen",
    "spriteId": "vespiquen",
    "learnset": []
  },
  {
    "id": 417,
    "name": "Pachirisu",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 45,
      "def": 70,
      "spa": 45,
      "spd": 90,
      "spe": 95
    },
    "abilities": [
      "Run Away",
      "Pickup"
    ],
    "hiddenAbility": "Volt Absorb",
    "sprite": "pachirisu",
    "spriteId": "pachirisu",
    "learnset": []
  },
  {
    "id": 418,
    "name": "Buizel",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 65,
      "def": 35,
      "spa": 60,
      "spd": 30,
      "spe": 85
    },
    "abilities": [
      "Swift Swim"
    ],
    "hiddenAbility": "Water Veil",
    "sprite": "buizel",
    "spriteId": "buizel",
    "learnset": []
  },
  {
    "id": 419,
    "name": "Floatzel",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 105,
      "def": 55,
      "spa": 85,
      "spd": 50,
      "spe": 115
    },
    "abilities": [
      "Swift Swim"
    ],
    "hiddenAbility": "Water Veil",
    "sprite": "floatzel",
    "spriteId": "floatzel",
    "learnset": []
  },
  {
    "id": 420,
    "name": "Cherubi",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 35,
      "def": 45,
      "spa": 62,
      "spd": 53,
      "spe": 35
    },
    "abilities": [
      "Chlorophyll"
    ],
    "hiddenAbility": "",
    "sprite": "cherubi",
    "spriteId": "cherubi",
    "learnset": []
  },
  {
    "id": 421,
    "name": "Cherrim",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 60,
      "def": 70,
      "spa": 87,
      "spd": 78,
      "spe": 85
    },
    "abilities": [
      "Flower Gift"
    ],
    "hiddenAbility": "",
    "sprite": "cherrim",
    "spriteId": "cherrim",
    "learnset": []
  },
  {
    "id": 421,
    "name": "Cherrim-Sunshine",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 60,
      "def": 70,
      "spa": 87,
      "spd": 78,
      "spe": 85
    },
    "abilities": [
      "Flower Gift"
    ],
    "hiddenAbility": "",
    "sprite": "cherrimsunshine",
    "spriteId": "cherrim-sunshine",
    "learnset": []
  },
  {
    "id": 422,
    "name": "Shellos",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 76,
      "atk": 48,
      "def": 48,
      "spa": 57,
      "spd": 62,
      "spe": 34
    },
    "abilities": [
      "Sticky Hold",
      "Storm Drain"
    ],
    "hiddenAbility": "Sand Force",
    "sprite": "shellos",
    "spriteId": "shellos",
    "learnset": []
  },
  {
    "id": 423,
    "name": "Gastrodon",
    "types": [
      "Water",
      "Ground"
    ],
    "baseStats": {
      "hp": 111,
      "atk": 83,
      "def": 68,
      "spa": 92,
      "spd": 82,
      "spe": 39
    },
    "abilities": [
      "Sticky Hold",
      "Storm Drain"
    ],
    "hiddenAbility": "Sand Force",
    "sprite": "gastrodon",
    "spriteId": "gastrodon",
    "learnset": []
  },
  {
    "id": 424,
    "name": "Ambipom",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 100,
      "def": 66,
      "spa": 60,
      "spd": 66,
      "spe": 115
    },
    "abilities": [
      "Technician",
      "Pickup"
    ],
    "hiddenAbility": "Skill Link",
    "sprite": "ambipom",
    "spriteId": "ambipom",
    "learnset": []
  },
  {
    "id": 425,
    "name": "Drifloon",
    "types": [
      "Ghost",
      "Flying"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 50,
      "def": 34,
      "spa": 60,
      "spd": 44,
      "spe": 70
    },
    "abilities": [
      "Aftermath",
      "Unburden"
    ],
    "hiddenAbility": "Flare Boost",
    "sprite": "drifloon",
    "spriteId": "drifloon",
    "learnset": []
  },
  {
    "id": 426,
    "name": "Drifblim",
    "types": [
      "Ghost",
      "Flying"
    ],
    "baseStats": {
      "hp": 150,
      "atk": 80,
      "def": 44,
      "spa": 90,
      "spd": 54,
      "spe": 80
    },
    "abilities": [
      "Aftermath",
      "Unburden"
    ],
    "hiddenAbility": "Flare Boost",
    "sprite": "drifblim",
    "spriteId": "drifblim",
    "learnset": []
  },
  {
    "id": 427,
    "name": "Buneary",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 66,
      "def": 44,
      "spa": 44,
      "spd": 56,
      "spe": 85
    },
    "abilities": [
      "Run Away",
      "Klutz"
    ],
    "hiddenAbility": "Limber",
    "sprite": "buneary",
    "spriteId": "buneary",
    "learnset": []
  },
  {
    "id": 428,
    "name": "Lopunny",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 76,
      "def": 84,
      "spa": 54,
      "spd": 96,
      "spe": 105
    },
    "abilities": [
      "Cute Charm",
      "Klutz"
    ],
    "hiddenAbility": "Limber",
    "sprite": "lopunny",
    "spriteId": "lopunny",
    "learnset": []
  },
  {
    "id": 428,
    "name": "Lopunny-Mega",
    "types": [
      "Normal",
      "Fighting"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 136,
      "def": 94,
      "spa": 54,
      "spd": 96,
      "spe": 135
    },
    "abilities": [
      "Scrappy"
    ],
    "hiddenAbility": "",
    "sprite": "lopunnymega",
    "spriteId": "lopunny-mega",
    "learnset": []
  },
  {
    "id": 429,
    "name": "Mismagius",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 60,
      "def": 60,
      "spa": 105,
      "spd": 105,
      "spe": 105
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "mismagius",
    "spriteId": "mismagius",
    "learnset": []
  },
  {
    "id": 430,
    "name": "Honchkrow",
    "types": [
      "Dark",
      "Flying"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 125,
      "def": 52,
      "spa": 105,
      "spd": 52,
      "spe": 71
    },
    "abilities": [
      "Insomnia",
      "Super Luck"
    ],
    "hiddenAbility": "Moxie",
    "sprite": "honchkrow",
    "spriteId": "honchkrow",
    "learnset": []
  },
  {
    "id": 431,
    "name": "Glameow",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 49,
      "atk": 55,
      "def": 42,
      "spa": 42,
      "spd": 37,
      "spe": 85
    },
    "abilities": [
      "Limber",
      "Own Tempo"
    ],
    "hiddenAbility": "Keen Eye",
    "sprite": "glameow",
    "spriteId": "glameow",
    "learnset": []
  },
  {
    "id": 432,
    "name": "Purugly",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 71,
      "atk": 82,
      "def": 64,
      "spa": 64,
      "spd": 59,
      "spe": 112
    },
    "abilities": [
      "Thick Fat",
      "Own Tempo"
    ],
    "hiddenAbility": "Defiant",
    "sprite": "purugly",
    "spriteId": "purugly",
    "learnset": []
  },
  {
    "id": 433,
    "name": "Chingling",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 30,
      "def": 50,
      "spa": 65,
      "spd": 50,
      "spe": 45
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "chingling",
    "spriteId": "chingling",
    "learnset": []
  },
  {
    "id": 434,
    "name": "Stunky",
    "types": [
      "Poison",
      "Dark"
    ],
    "baseStats": {
      "hp": 63,
      "atk": 63,
      "def": 47,
      "spa": 41,
      "spd": 41,
      "spe": 74
    },
    "abilities": [
      "Stench",
      "Aftermath"
    ],
    "hiddenAbility": "Keen Eye",
    "sprite": "stunky",
    "spriteId": "stunky",
    "learnset": []
  },
  {
    "id": 435,
    "name": "Skuntank",
    "types": [
      "Poison",
      "Dark"
    ],
    "baseStats": {
      "hp": 103,
      "atk": 93,
      "def": 67,
      "spa": 71,
      "spd": 61,
      "spe": 84
    },
    "abilities": [
      "Stench",
      "Aftermath"
    ],
    "hiddenAbility": "Keen Eye",
    "sprite": "skuntank",
    "spriteId": "skuntank",
    "learnset": []
  },
  {
    "id": 436,
    "name": "Bronzor",
    "types": [
      "Steel",
      "Psychic"
    ],
    "baseStats": {
      "hp": 57,
      "atk": 24,
      "def": 86,
      "spa": 24,
      "spd": 86,
      "spe": 23
    },
    "abilities": [
      "Levitate",
      "Heatproof"
    ],
    "hiddenAbility": "Heavy Metal",
    "sprite": "bronzor",
    "spriteId": "bronzor",
    "learnset": []
  },
  {
    "id": 437,
    "name": "Bronzong",
    "types": [
      "Steel",
      "Psychic"
    ],
    "baseStats": {
      "hp": 67,
      "atk": 89,
      "def": 116,
      "spa": 79,
      "spd": 116,
      "spe": 33
    },
    "abilities": [
      "Levitate",
      "Heatproof"
    ],
    "hiddenAbility": "Heavy Metal",
    "sprite": "bronzong",
    "spriteId": "bronzong",
    "learnset": []
  },
  {
    "id": 438,
    "name": "Bonsly",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 80,
      "def": 95,
      "spa": 10,
      "spd": 45,
      "spe": 10
    },
    "abilities": [
      "Sturdy",
      "Rock Head"
    ],
    "hiddenAbility": "Rattled",
    "sprite": "bonsly",
    "spriteId": "bonsly",
    "learnset": []
  },
  {
    "id": 439,
    "name": "Mime Jr.",
    "types": [
      "Psychic",
      "Fairy"
    ],
    "baseStats": {
      "hp": 20,
      "atk": 25,
      "def": 45,
      "spa": 70,
      "spd": 90,
      "spe": 60
    },
    "abilities": [
      "Soundproof",
      "Filter"
    ],
    "hiddenAbility": "Technician",
    "sprite": "mimejr",
    "spriteId": "mimejr",
    "learnset": []
  },
  {
    "id": 440,
    "name": "Happiny",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 5,
      "def": 5,
      "spa": 15,
      "spd": 65,
      "spe": 30
    },
    "abilities": [
      "Natural Cure",
      "Serene Grace"
    ],
    "hiddenAbility": "Friend Guard",
    "sprite": "happiny",
    "spriteId": "happiny",
    "learnset": []
  },
  {
    "id": 441,
    "name": "Chatot",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 76,
      "atk": 65,
      "def": 45,
      "spa": 92,
      "spd": 42,
      "spe": 91
    },
    "abilities": [
      "Keen Eye",
      "Tangled Feet"
    ],
    "hiddenAbility": "Big Pecks",
    "sprite": "chatot",
    "spriteId": "chatot",
    "learnset": []
  },
  {
    "id": 442,
    "name": "Spiritomb",
    "types": [
      "Ghost",
      "Dark"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 92,
      "def": 108,
      "spa": 92,
      "spd": 108,
      "spe": 35
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "Infiltrator",
    "sprite": "spiritomb",
    "spriteId": "spiritomb",
    "learnset": []
  },
  {
    "id": 443,
    "name": "Gible",
    "types": [
      "Dragon",
      "Ground"
    ],
    "baseStats": {
      "hp": 58,
      "atk": 70,
      "def": 45,
      "spa": 40,
      "spd": 45,
      "spe": 42
    },
    "abilities": [
      "Sand Veil"
    ],
    "hiddenAbility": "Rough Skin",
    "sprite": "gible",
    "spriteId": "gible",
    "learnset": []
  },
  {
    "id": 444,
    "name": "Gabite",
    "types": [
      "Dragon",
      "Ground"
    ],
    "baseStats": {
      "hp": 68,
      "atk": 90,
      "def": 65,
      "spa": 50,
      "spd": 55,
      "spe": 82
    },
    "abilities": [
      "Sand Veil"
    ],
    "hiddenAbility": "Rough Skin",
    "sprite": "gabite",
    "spriteId": "gabite",
    "learnset": []
  },
  {
    "id": 445,
    "name": "Garchomp",
    "types": [
      "Dragon",
      "Ground"
    ],
    "baseStats": {
      "hp": 108,
      "atk": 130,
      "def": 95,
      "spa": 80,
      "spd": 85,
      "spe": 102
    },
    "abilities": [
      "Sand Veil"
    ],
    "hiddenAbility": "Rough Skin",
    "sprite": "garchomp",
    "spriteId": "garchomp",
    "learnset": []
  },
  {
    "id": 445,
    "name": "Garchomp-Mega",
    "types": [
      "Dragon",
      "Ground"
    ],
    "baseStats": {
      "hp": 108,
      "atk": 170,
      "def": 115,
      "spa": 120,
      "spd": 95,
      "spe": 92
    },
    "abilities": [
      "Sand Force"
    ],
    "hiddenAbility": "",
    "sprite": "garchompmega",
    "spriteId": "garchomp-mega",
    "learnset": []
  },
  {
    "id": 445,
    "name": "Garchomp-Mega-Z",
    "types": [
      "Dragon"
    ],
    "baseStats": {
      "hp": 108,
      "atk": 130,
      "def": 85,
      "spa": 141,
      "spd": 85,
      "spe": 151
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "garchompmegaz",
    "spriteId": "garchomp-megaz",
    "learnset": []
  },
  {
    "id": 446,
    "name": "Munchlax",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 135,
      "atk": 85,
      "def": 40,
      "spa": 40,
      "spd": 85,
      "spe": 5
    },
    "abilities": [
      "Pickup",
      "Thick Fat"
    ],
    "hiddenAbility": "Gluttony",
    "sprite": "munchlax",
    "spriteId": "munchlax",
    "learnset": []
  },
  {
    "id": 447,
    "name": "Riolu",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 70,
      "def": 40,
      "spa": 35,
      "spd": 40,
      "spe": 60
    },
    "abilities": [
      "Steadfast",
      "Inner Focus"
    ],
    "hiddenAbility": "Prankster",
    "sprite": "riolu",
    "spriteId": "riolu",
    "learnset": []
  },
  {
    "id": 448,
    "name": "Lucario",
    "types": [
      "Fighting",
      "Steel"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 110,
      "def": 70,
      "spa": 115,
      "spd": 70,
      "spe": 90
    },
    "abilities": [
      "Steadfast",
      "Inner Focus"
    ],
    "hiddenAbility": "Justified",
    "sprite": "lucario",
    "spriteId": "lucario",
    "learnset": []
  },
  {
    "id": 448,
    "name": "Lucario-Mega",
    "types": [
      "Fighting",
      "Steel"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 145,
      "def": 88,
      "spa": 140,
      "spd": 70,
      "spe": 112
    },
    "abilities": [
      "Adaptability"
    ],
    "hiddenAbility": "",
    "sprite": "lucariomega",
    "spriteId": "lucario-mega",
    "learnset": []
  },
  {
    "id": 448,
    "name": "Lucario-Mega-Z",
    "types": [
      "Fighting",
      "Steel"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 100,
      "def": 70,
      "spa": 164,
      "spd": 70,
      "spe": 151
    },
    "abilities": [
      "Aura Guard"
    ],
    "hiddenAbility": "",
    "sprite": "lucariomegaz",
    "spriteId": "lucario-megaz",
    "learnset": []
  },
  {
    "id": 449,
    "name": "Hippopotas",
    "types": [
      "Ground"
    ],
    "baseStats": {
      "hp": 68,
      "atk": 72,
      "def": 78,
      "spa": 38,
      "spd": 42,
      "spe": 32
    },
    "abilities": [
      "Sand Stream"
    ],
    "hiddenAbility": "Sand Force",
    "sprite": "hippopotas",
    "spriteId": "hippopotas",
    "learnset": []
  },
  {
    "id": 450,
    "name": "Hippowdon",
    "types": [
      "Ground"
    ],
    "baseStats": {
      "hp": 108,
      "atk": 112,
      "def": 118,
      "spa": 68,
      "spd": 72,
      "spe": 47
    },
    "abilities": [
      "Sand Stream"
    ],
    "hiddenAbility": "Sand Force",
    "sprite": "hippowdon",
    "spriteId": "hippowdon",
    "learnset": []
  },
  {
    "id": 451,
    "name": "Skorupi",
    "types": [
      "Poison",
      "Bug"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 50,
      "def": 90,
      "spa": 30,
      "spd": 55,
      "spe": 65
    },
    "abilities": [
      "Battle Armor",
      "Sniper"
    ],
    "hiddenAbility": "Keen Eye",
    "sprite": "skorupi",
    "spriteId": "skorupi",
    "learnset": []
  },
  {
    "id": 452,
    "name": "Drapion",
    "types": [
      "Poison",
      "Dark"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 90,
      "def": 110,
      "spa": 60,
      "spd": 75,
      "spe": 95
    },
    "abilities": [
      "Battle Armor",
      "Sniper"
    ],
    "hiddenAbility": "Keen Eye",
    "sprite": "drapion",
    "spriteId": "drapion",
    "learnset": []
  },
  {
    "id": 453,
    "name": "Croagunk",
    "types": [
      "Poison",
      "Fighting"
    ],
    "baseStats": {
      "hp": 48,
      "atk": 61,
      "def": 40,
      "spa": 61,
      "spd": 40,
      "spe": 50
    },
    "abilities": [
      "Anticipation",
      "Dry Skin"
    ],
    "hiddenAbility": "Poison Touch",
    "sprite": "croagunk",
    "spriteId": "croagunk",
    "learnset": []
  },
  {
    "id": 454,
    "name": "Toxicroak",
    "types": [
      "Poison",
      "Fighting"
    ],
    "baseStats": {
      "hp": 83,
      "atk": 106,
      "def": 65,
      "spa": 86,
      "spd": 65,
      "spe": 85
    },
    "abilities": [
      "Anticipation",
      "Dry Skin"
    ],
    "hiddenAbility": "Poison Touch",
    "sprite": "toxicroak",
    "spriteId": "toxicroak",
    "learnset": []
  },
  {
    "id": 455,
    "name": "Carnivine",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 74,
      "atk": 100,
      "def": 72,
      "spa": 90,
      "spd": 72,
      "spe": 46
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "carnivine",
    "spriteId": "carnivine",
    "learnset": []
  },
  {
    "id": 456,
    "name": "Finneon",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 49,
      "atk": 49,
      "def": 56,
      "spa": 49,
      "spd": 61,
      "spe": 66
    },
    "abilities": [
      "Swift Swim",
      "Storm Drain"
    ],
    "hiddenAbility": "Water Veil",
    "sprite": "finneon",
    "spriteId": "finneon",
    "learnset": []
  },
  {
    "id": 457,
    "name": "Lumineon",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 69,
      "atk": 69,
      "def": 76,
      "spa": 69,
      "spd": 86,
      "spe": 91
    },
    "abilities": [
      "Swift Swim",
      "Storm Drain"
    ],
    "hiddenAbility": "Water Veil",
    "sprite": "lumineon",
    "spriteId": "lumineon",
    "learnset": []
  },
  {
    "id": 458,
    "name": "Mantyke",
    "types": [
      "Water",
      "Flying"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 20,
      "def": 50,
      "spa": 60,
      "spd": 120,
      "spe": 50
    },
    "abilities": [
      "Swift Swim",
      "Water Absorb"
    ],
    "hiddenAbility": "Water Veil",
    "sprite": "mantyke",
    "spriteId": "mantyke",
    "learnset": []
  },
  {
    "id": 459,
    "name": "Snover",
    "types": [
      "Grass",
      "Ice"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 62,
      "def": 50,
      "spa": 62,
      "spd": 60,
      "spe": 40
    },
    "abilities": [
      "Snow Warning"
    ],
    "hiddenAbility": "Soundproof",
    "sprite": "snover",
    "spriteId": "snover",
    "learnset": []
  },
  {
    "id": 460,
    "name": "Abomasnow",
    "types": [
      "Grass",
      "Ice"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 92,
      "def": 75,
      "spa": 92,
      "spd": 85,
      "spe": 60
    },
    "abilities": [
      "Snow Warning"
    ],
    "hiddenAbility": "Soundproof",
    "sprite": "abomasnow",
    "spriteId": "abomasnow",
    "learnset": []
  },
  {
    "id": 460,
    "name": "Abomasnow-Mega",
    "types": [
      "Grass",
      "Ice"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 132,
      "def": 105,
      "spa": 132,
      "spd": 105,
      "spe": 30
    },
    "abilities": [
      "Snow Warning"
    ],
    "hiddenAbility": "",
    "sprite": "abomasnowmega",
    "spriteId": "abomasnow-mega",
    "learnset": []
  },
  {
    "id": 461,
    "name": "Weavile",
    "types": [
      "Dark",
      "Ice"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 120,
      "def": 65,
      "spa": 45,
      "spd": 85,
      "spe": 125
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "Pickpocket",
    "sprite": "weavile",
    "spriteId": "weavile",
    "learnset": []
  },
  {
    "id": 462,
    "name": "Magnezone",
    "types": [
      "Electric",
      "Steel"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 70,
      "def": 115,
      "spa": 130,
      "spd": 90,
      "spe": 60
    },
    "abilities": [
      "Magnet Pull",
      "Sturdy"
    ],
    "hiddenAbility": "Analytic",
    "sprite": "magnezone",
    "spriteId": "magnezone",
    "learnset": []
  },
  {
    "id": 463,
    "name": "Lickilicky",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 110,
      "atk": 85,
      "def": 95,
      "spa": 80,
      "spd": 95,
      "spe": 50
    },
    "abilities": [
      "Own Tempo",
      "Oblivious"
    ],
    "hiddenAbility": "Cloud Nine",
    "sprite": "lickilicky",
    "spriteId": "lickilicky",
    "learnset": []
  },
  {
    "id": 464,
    "name": "Rhyperior",
    "types": [
      "Ground",
      "Rock"
    ],
    "baseStats": {
      "hp": 115,
      "atk": 140,
      "def": 130,
      "spa": 55,
      "spd": 55,
      "spe": 40
    },
    "abilities": [
      "Lightning Rod",
      "Solid Rock"
    ],
    "hiddenAbility": "Reckless",
    "sprite": "rhyperior",
    "spriteId": "rhyperior",
    "learnset": []
  },
  {
    "id": 465,
    "name": "Tangrowth",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 100,
      "def": 125,
      "spa": 110,
      "spd": 50,
      "spe": 50
    },
    "abilities": [
      "Chlorophyll",
      "Leaf Guard"
    ],
    "hiddenAbility": "Regenerator",
    "sprite": "tangrowth",
    "spriteId": "tangrowth",
    "learnset": []
  },
  {
    "id": 466,
    "name": "Electivire",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 123,
      "def": 67,
      "spa": 95,
      "spd": 85,
      "spe": 95
    },
    "abilities": [
      "Motor Drive"
    ],
    "hiddenAbility": "Vital Spirit",
    "sprite": "electivire",
    "spriteId": "electivire",
    "learnset": []
  },
  {
    "id": 467,
    "name": "Magmortar",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 95,
      "def": 67,
      "spa": 125,
      "spd": 95,
      "spe": 83
    },
    "abilities": [
      "Flame Body"
    ],
    "hiddenAbility": "Vital Spirit",
    "sprite": "magmortar",
    "spriteId": "magmortar",
    "learnset": []
  },
  {
    "id": 468,
    "name": "Togekiss",
    "types": [
      "Fairy",
      "Flying"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 50,
      "def": 95,
      "spa": 120,
      "spd": 115,
      "spe": 80
    },
    "abilities": [
      "Hustle",
      "Serene Grace"
    ],
    "hiddenAbility": "Super Luck",
    "sprite": "togekiss",
    "spriteId": "togekiss",
    "learnset": []
  },
  {
    "id": 469,
    "name": "Yanmega",
    "types": [
      "Bug",
      "Flying"
    ],
    "baseStats": {
      "hp": 86,
      "atk": 76,
      "def": 86,
      "spa": 116,
      "spd": 56,
      "spe": 95
    },
    "abilities": [
      "Speed Boost",
      "Tinted Lens"
    ],
    "hiddenAbility": "Frisk",
    "sprite": "yanmega",
    "spriteId": "yanmega",
    "learnset": []
  },
  {
    "id": 470,
    "name": "Leafeon",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 110,
      "def": 130,
      "spa": 60,
      "spd": 65,
      "spe": 95
    },
    "abilities": [
      "Leaf Guard"
    ],
    "hiddenAbility": "Chlorophyll",
    "sprite": "leafeon",
    "spriteId": "leafeon",
    "learnset": []
  },
  {
    "id": 471,
    "name": "Glaceon",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 60,
      "def": 110,
      "spa": 130,
      "spd": 95,
      "spe": 65
    },
    "abilities": [
      "Snow Cloak"
    ],
    "hiddenAbility": "Ice Body",
    "sprite": "glaceon",
    "spriteId": "glaceon",
    "learnset": []
  },
  {
    "id": 472,
    "name": "Gliscor",
    "types": [
      "Ground",
      "Flying"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 95,
      "def": 125,
      "spa": 45,
      "spd": 75,
      "spe": 95
    },
    "abilities": [
      "Hyper Cutter",
      "Sand Veil"
    ],
    "hiddenAbility": "Poison Heal",
    "sprite": "gliscor",
    "spriteId": "gliscor",
    "learnset": []
  },
  {
    "id": 473,
    "name": "Mamoswine",
    "types": [
      "Ice",
      "Ground"
    ],
    "baseStats": {
      "hp": 110,
      "atk": 130,
      "def": 80,
      "spa": 70,
      "spd": 60,
      "spe": 80
    },
    "abilities": [
      "Oblivious",
      "Snow Cloak"
    ],
    "hiddenAbility": "Thick Fat",
    "sprite": "mamoswine",
    "spriteId": "mamoswine",
    "learnset": []
  },
  {
    "id": 474,
    "name": "Porygon-Z",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 80,
      "def": 70,
      "spa": 135,
      "spd": 75,
      "spe": 90
    },
    "abilities": [
      "Adaptability",
      "Download"
    ],
    "hiddenAbility": "Analytic",
    "sprite": "porygonz",
    "spriteId": "porygonz",
    "learnset": []
  },
  {
    "id": 475,
    "name": "Gallade",
    "types": [
      "Psychic",
      "Fighting"
    ],
    "baseStats": {
      "hp": 68,
      "atk": 125,
      "def": 65,
      "spa": 65,
      "spd": 115,
      "spe": 80
    },
    "abilities": [
      "Steadfast",
      "Sharpness"
    ],
    "hiddenAbility": "Justified",
    "sprite": "gallade",
    "spriteId": "gallade",
    "learnset": []
  },
  {
    "id": 475,
    "name": "Gallade-Mega",
    "types": [
      "Psychic",
      "Fighting"
    ],
    "baseStats": {
      "hp": 68,
      "atk": 165,
      "def": 95,
      "spa": 65,
      "spd": 115,
      "spe": 110
    },
    "abilities": [
      "Inner Focus"
    ],
    "hiddenAbility": "",
    "sprite": "gallademega",
    "spriteId": "gallade-mega",
    "learnset": []
  },
  {
    "id": 476,
    "name": "Probopass",
    "types": [
      "Rock",
      "Steel"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 55,
      "def": 145,
      "spa": 75,
      "spd": 150,
      "spe": 40
    },
    "abilities": [
      "Sturdy",
      "Magnet Pull"
    ],
    "hiddenAbility": "Sand Force",
    "sprite": "probopass",
    "spriteId": "probopass",
    "learnset": []
  },
  {
    "id": 477,
    "name": "Dusknoir",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 100,
      "def": 135,
      "spa": 65,
      "spd": 135,
      "spe": 45
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "Frisk",
    "sprite": "dusknoir",
    "spriteId": "dusknoir",
    "learnset": []
  },
  {
    "id": 478,
    "name": "Froslass",
    "types": [
      "Ice",
      "Ghost"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 80,
      "def": 70,
      "spa": 80,
      "spd": 70,
      "spe": 110
    },
    "abilities": [
      "Snow Cloak"
    ],
    "hiddenAbility": "Cursed Body",
    "sprite": "froslass",
    "spriteId": "froslass",
    "learnset": []
  },
  {
    "id": 478,
    "name": "Froslass-Mega",
    "types": [
      "Ice",
      "Ghost"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 80,
      "def": 70,
      "spa": 140,
      "spd": 100,
      "spe": 120
    },
    "abilities": [
      "Snow Warning"
    ],
    "hiddenAbility": "",
    "sprite": "froslassmega",
    "spriteId": "froslass-mega",
    "learnset": []
  },
  {
    "id": 479,
    "name": "Rotom",
    "types": [
      "Electric",
      "Ghost"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 50,
      "def": 77,
      "spa": 95,
      "spd": 77,
      "spe": 91
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "rotom",
    "spriteId": "rotom",
    "learnset": []
  },
  {
    "id": 479,
    "name": "Rotom-Heat",
    "types": [
      "Electric",
      "Fire"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 65,
      "def": 107,
      "spa": 105,
      "spd": 107,
      "spe": 86
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "rotomheat",
    "spriteId": "rotom-heat",
    "learnset": []
  },
  {
    "id": 479,
    "name": "Rotom-Wash",
    "types": [
      "Electric",
      "Water"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 65,
      "def": 107,
      "spa": 105,
      "spd": 107,
      "spe": 86
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "rotomwash",
    "spriteId": "rotom-wash",
    "learnset": []
  },
  {
    "id": 479,
    "name": "Rotom-Frost",
    "types": [
      "Electric",
      "Ice"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 65,
      "def": 107,
      "spa": 105,
      "spd": 107,
      "spe": 86
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "rotomfrost",
    "spriteId": "rotom-frost",
    "learnset": []
  },
  {
    "id": 479,
    "name": "Rotom-Fan",
    "types": [
      "Electric",
      "Flying"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 65,
      "def": 107,
      "spa": 105,
      "spd": 107,
      "spe": 86
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "rotomfan",
    "spriteId": "rotom-fan",
    "learnset": []
  },
  {
    "id": 479,
    "name": "Rotom-Mow",
    "types": [
      "Electric",
      "Grass"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 65,
      "def": 107,
      "spa": 105,
      "spd": 107,
      "spe": 86
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "rotommow",
    "spriteId": "rotom-mow",
    "learnset": []
  },
  {
    "id": 480,
    "name": "Uxie",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 75,
      "def": 130,
      "spa": 75,
      "spd": 130,
      "spe": 95
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "uxie",
    "spriteId": "uxie",
    "learnset": []
  },
  {
    "id": 481,
    "name": "Mesprit",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 105,
      "def": 105,
      "spa": 105,
      "spd": 105,
      "spe": 80
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "mesprit",
    "spriteId": "mesprit",
    "learnset": []
  },
  {
    "id": 482,
    "name": "Azelf",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 125,
      "def": 70,
      "spa": 125,
      "spd": 70,
      "spe": 115
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "azelf",
    "spriteId": "azelf",
    "learnset": []
  },
  {
    "id": 483,
    "name": "Dialga",
    "types": [
      "Steel",
      "Dragon"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 120,
      "def": 120,
      "spa": 150,
      "spd": 100,
      "spe": 90
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "dialga",
    "spriteId": "dialga",
    "learnset": []
  },
  {
    "id": 483,
    "name": "Dialga-Origin",
    "types": [
      "Steel",
      "Dragon"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 100,
      "def": 120,
      "spa": 150,
      "spd": 120,
      "spe": 90
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "dialgaorigin",
    "spriteId": "dialga-origin",
    "learnset": []
  },
  {
    "id": 484,
    "name": "Palkia",
    "types": [
      "Water",
      "Dragon"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 120,
      "def": 100,
      "spa": 150,
      "spd": 120,
      "spe": 100
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "palkia",
    "spriteId": "palkia",
    "learnset": []
  },
  {
    "id": 484,
    "name": "Palkia-Origin",
    "types": [
      "Water",
      "Dragon"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 100,
      "def": 100,
      "spa": 150,
      "spd": 120,
      "spe": 120
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "palkiaorigin",
    "spriteId": "palkia-origin",
    "learnset": []
  },
  {
    "id": 485,
    "name": "Heatran",
    "types": [
      "Fire",
      "Steel"
    ],
    "baseStats": {
      "hp": 91,
      "atk": 90,
      "def": 106,
      "spa": 130,
      "spd": 106,
      "spe": 77
    },
    "abilities": [
      "Flash Fire"
    ],
    "hiddenAbility": "Flame Body",
    "sprite": "heatran",
    "spriteId": "heatran",
    "learnset": []
  },
  {
    "id": 485,
    "name": "Heatran-Mega",
    "types": [
      "Fire",
      "Steel"
    ],
    "baseStats": {
      "hp": 91,
      "atk": 120,
      "def": 106,
      "spa": 175,
      "spd": 141,
      "spe": 67
    },
    "abilities": [
      "Flash Fire"
    ],
    "hiddenAbility": "Flame Body",
    "sprite": "heatranmega",
    "spriteId": "heatran-mega",
    "learnset": []
  },
  {
    "id": 486,
    "name": "Regigigas",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 110,
      "atk": 160,
      "def": 110,
      "spa": 80,
      "spd": 110,
      "spe": 100
    },
    "abilities": [
      "Slow Start"
    ],
    "hiddenAbility": "",
    "sprite": "regigigas",
    "spriteId": "regigigas",
    "learnset": []
  },
  {
    "id": 487,
    "name": "Giratina",
    "types": [
      "Ghost",
      "Dragon"
    ],
    "baseStats": {
      "hp": 150,
      "atk": 100,
      "def": 120,
      "spa": 100,
      "spd": 120,
      "spe": 90
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "giratina",
    "spriteId": "giratina",
    "learnset": []
  },
  {
    "id": 487,
    "name": "Giratina-Origin",
    "types": [
      "Ghost",
      "Dragon"
    ],
    "baseStats": {
      "hp": 150,
      "atk": 120,
      "def": 100,
      "spa": 120,
      "spd": 100,
      "spe": 90
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "giratinaorigin",
    "spriteId": "giratina-origin",
    "learnset": []
  },
  {
    "id": 488,
    "name": "Cresselia",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 70,
      "def": 110,
      "spa": 75,
      "spd": 120,
      "spe": 85
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "cresselia",
    "spriteId": "cresselia",
    "learnset": []
  },
  {
    "id": 489,
    "name": "Phione",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 80,
      "def": 80,
      "spa": 80,
      "spd": 80,
      "spe": 80
    },
    "abilities": [
      "Hydration"
    ],
    "hiddenAbility": "",
    "sprite": "phione",
    "spriteId": "phione",
    "learnset": []
  },
  {
    "id": 490,
    "name": "Manaphy",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 100,
      "def": 100,
      "spa": 100,
      "spd": 100,
      "spe": 100
    },
    "abilities": [
      "Hydration"
    ],
    "hiddenAbility": "",
    "sprite": "manaphy",
    "spriteId": "manaphy",
    "learnset": []
  },
  {
    "id": 491,
    "name": "Darkrai",
    "types": [
      "Dark"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 90,
      "def": 90,
      "spa": 135,
      "spd": 90,
      "spe": 125
    },
    "abilities": [
      "Bad Dreams"
    ],
    "hiddenAbility": "",
    "sprite": "darkrai",
    "spriteId": "darkrai",
    "learnset": []
  },
  {
    "id": 491,
    "name": "Darkrai-Mega",
    "types": [
      "Dark"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 120,
      "def": 130,
      "spa": 165,
      "spd": 130,
      "spe": 85
    },
    "abilities": [
      "Bad Dreams"
    ],
    "hiddenAbility": "",
    "sprite": "darkraimega",
    "spriteId": "darkrai-mega",
    "learnset": []
  },
  {
    "id": 492,
    "name": "Shaymin",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 100,
      "def": 100,
      "spa": 100,
      "spd": 100,
      "spe": 100
    },
    "abilities": [
      "Natural Cure"
    ],
    "hiddenAbility": "",
    "sprite": "shaymin",
    "spriteId": "shaymin",
    "learnset": []
  },
  {
    "id": 492,
    "name": "Shaymin-Sky",
    "types": [
      "Grass",
      "Flying"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 103,
      "def": 75,
      "spa": 120,
      "spd": 75,
      "spe": 127
    },
    "abilities": [
      "Serene Grace"
    ],
    "hiddenAbility": "",
    "sprite": "shayminsky",
    "spriteId": "shaymin-sky",
    "learnset": []
  },
  {
    "id": 493,
    "name": "Arceus",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 120,
      "def": 120,
      "spa": 120,
      "spd": 120,
      "spe": 120
    },
    "abilities": [
      "Multitype"
    ],
    "hiddenAbility": "",
    "sprite": "arceus",
    "spriteId": "arceus",
    "learnset": []
  },
  {
    "id": 493,
    "name": "Arceus-Bug",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 120,
      "def": 120,
      "spa": 120,
      "spd": 120,
      "spe": 120
    },
    "abilities": [
      "Multitype"
    ],
    "hiddenAbility": "",
    "sprite": "arceusbug",
    "spriteId": "arceus-bug",
    "learnset": []
  },
  {
    "id": 493,
    "name": "Arceus-Dark",
    "types": [
      "Dark"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 120,
      "def": 120,
      "spa": 120,
      "spd": 120,
      "spe": 120
    },
    "abilities": [
      "Multitype"
    ],
    "hiddenAbility": "",
    "sprite": "arceusdark",
    "spriteId": "arceus-dark",
    "learnset": []
  },
  {
    "id": 493,
    "name": "Arceus-Dragon",
    "types": [
      "Dragon"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 120,
      "def": 120,
      "spa": 120,
      "spd": 120,
      "spe": 120
    },
    "abilities": [
      "Multitype"
    ],
    "hiddenAbility": "",
    "sprite": "arceusdragon",
    "spriteId": "arceus-dragon",
    "learnset": []
  },
  {
    "id": 493,
    "name": "Arceus-Electric",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 120,
      "def": 120,
      "spa": 120,
      "spd": 120,
      "spe": 120
    },
    "abilities": [
      "Multitype"
    ],
    "hiddenAbility": "",
    "sprite": "arceuselectric",
    "spriteId": "arceus-electric",
    "learnset": []
  },
  {
    "id": 493,
    "name": "Arceus-Fairy",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 120,
      "def": 120,
      "spa": 120,
      "spd": 120,
      "spe": 120
    },
    "abilities": [
      "Multitype"
    ],
    "hiddenAbility": "",
    "sprite": "arceusfairy",
    "spriteId": "arceus-fairy",
    "learnset": []
  },
  {
    "id": 493,
    "name": "Arceus-Fighting",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 120,
      "def": 120,
      "spa": 120,
      "spd": 120,
      "spe": 120
    },
    "abilities": [
      "Multitype"
    ],
    "hiddenAbility": "",
    "sprite": "arceusfighting",
    "spriteId": "arceus-fighting",
    "learnset": []
  },
  {
    "id": 493,
    "name": "Arceus-Fire",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 120,
      "def": 120,
      "spa": 120,
      "spd": 120,
      "spe": 120
    },
    "abilities": [
      "Multitype"
    ],
    "hiddenAbility": "",
    "sprite": "arceusfire",
    "spriteId": "arceus-fire",
    "learnset": []
  },
  {
    "id": 493,
    "name": "Arceus-Flying",
    "types": [
      "Flying"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 120,
      "def": 120,
      "spa": 120,
      "spd": 120,
      "spe": 120
    },
    "abilities": [
      "Multitype"
    ],
    "hiddenAbility": "",
    "sprite": "arceusflying",
    "spriteId": "arceus-flying",
    "learnset": []
  },
  {
    "id": 493,
    "name": "Arceus-Ghost",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 120,
      "def": 120,
      "spa": 120,
      "spd": 120,
      "spe": 120
    },
    "abilities": [
      "Multitype"
    ],
    "hiddenAbility": "",
    "sprite": "arceusghost",
    "spriteId": "arceus-ghost",
    "learnset": []
  },
  {
    "id": 493,
    "name": "Arceus-Grass",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 120,
      "def": 120,
      "spa": 120,
      "spd": 120,
      "spe": 120
    },
    "abilities": [
      "Multitype"
    ],
    "hiddenAbility": "",
    "sprite": "arceusgrass",
    "spriteId": "arceus-grass",
    "learnset": []
  },
  {
    "id": 493,
    "name": "Arceus-Ground",
    "types": [
      "Ground"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 120,
      "def": 120,
      "spa": 120,
      "spd": 120,
      "spe": 120
    },
    "abilities": [
      "Multitype"
    ],
    "hiddenAbility": "",
    "sprite": "arceusground",
    "spriteId": "arceus-ground",
    "learnset": []
  },
  {
    "id": 493,
    "name": "Arceus-Ice",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 120,
      "def": 120,
      "spa": 120,
      "spd": 120,
      "spe": 120
    },
    "abilities": [
      "Multitype"
    ],
    "hiddenAbility": "",
    "sprite": "arceusice",
    "spriteId": "arceus-ice",
    "learnset": []
  },
  {
    "id": 493,
    "name": "Arceus-Poison",
    "types": [
      "Poison"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 120,
      "def": 120,
      "spa": 120,
      "spd": 120,
      "spe": 120
    },
    "abilities": [
      "Multitype"
    ],
    "hiddenAbility": "",
    "sprite": "arceuspoison",
    "spriteId": "arceus-poison",
    "learnset": []
  },
  {
    "id": 493,
    "name": "Arceus-Psychic",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 120,
      "def": 120,
      "spa": 120,
      "spd": 120,
      "spe": 120
    },
    "abilities": [
      "Multitype"
    ],
    "hiddenAbility": "",
    "sprite": "arceuspsychic",
    "spriteId": "arceus-psychic",
    "learnset": []
  },
  {
    "id": 493,
    "name": "Arceus-Rock",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 120,
      "def": 120,
      "spa": 120,
      "spd": 120,
      "spe": 120
    },
    "abilities": [
      "Multitype"
    ],
    "hiddenAbility": "",
    "sprite": "arceusrock",
    "spriteId": "arceus-rock",
    "learnset": []
  },
  {
    "id": 493,
    "name": "Arceus-Steel",
    "types": [
      "Steel"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 120,
      "def": 120,
      "spa": 120,
      "spd": 120,
      "spe": 120
    },
    "abilities": [
      "Multitype"
    ],
    "hiddenAbility": "",
    "sprite": "arceussteel",
    "spriteId": "arceus-steel",
    "learnset": []
  },
  {
    "id": 493,
    "name": "Arceus-Water",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 120,
      "def": 120,
      "spa": 120,
      "spd": 120,
      "spe": 120
    },
    "abilities": [
      "Multitype"
    ],
    "hiddenAbility": "",
    "sprite": "arceuswater",
    "spriteId": "arceus-water",
    "learnset": []
  },
  {
    "id": 494,
    "name": "Victini",
    "types": [
      "Psychic",
      "Fire"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 100,
      "def": 100,
      "spa": 100,
      "spd": 100,
      "spe": 100
    },
    "abilities": [
      "Victory Star"
    ],
    "hiddenAbility": "",
    "sprite": "victini",
    "spriteId": "victini",
    "learnset": []
  },
  {
    "id": 495,
    "name": "Snivy",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 45,
      "def": 55,
      "spa": 45,
      "spd": 55,
      "spe": 63
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Contrary",
    "sprite": "snivy",
    "spriteId": "snivy",
    "learnset": []
  },
  {
    "id": 496,
    "name": "Servine",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 60,
      "def": 75,
      "spa": 60,
      "spd": 75,
      "spe": 83
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Contrary",
    "sprite": "servine",
    "spriteId": "servine",
    "learnset": []
  },
  {
    "id": 497,
    "name": "Serperior",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 75,
      "def": 95,
      "spa": 75,
      "spd": 95,
      "spe": 113
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Contrary",
    "sprite": "serperior",
    "spriteId": "serperior",
    "learnset": []
  },
  {
    "id": 498,
    "name": "Tepig",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 63,
      "def": 45,
      "spa": 45,
      "spd": 45,
      "spe": 45
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Thick Fat",
    "sprite": "tepig",
    "spriteId": "tepig",
    "learnset": []
  },
  {
    "id": 499,
    "name": "Pignite",
    "types": [
      "Fire",
      "Fighting"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 93,
      "def": 55,
      "spa": 70,
      "spd": 55,
      "spe": 55
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Thick Fat",
    "sprite": "pignite",
    "spriteId": "pignite",
    "learnset": []
  },
  {
    "id": 500,
    "name": "Emboar",
    "types": [
      "Fire",
      "Fighting"
    ],
    "baseStats": {
      "hp": 110,
      "atk": 123,
      "def": 65,
      "spa": 100,
      "spd": 65,
      "spe": 65
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Reckless",
    "sprite": "emboar",
    "spriteId": "emboar",
    "learnset": []
  },
  {
    "id": 500,
    "name": "Emboar-Mega",
    "types": [
      "Fire",
      "Fighting"
    ],
    "baseStats": {
      "hp": 110,
      "atk": 148,
      "def": 75,
      "spa": 110,
      "spd": 110,
      "spe": 75
    },
    "abilities": [
      "Mold Breaker"
    ],
    "hiddenAbility": "",
    "sprite": "emboarmega",
    "spriteId": "emboar-mega",
    "learnset": []
  },
  {
    "id": 501,
    "name": "Oshawott",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 55,
      "def": 45,
      "spa": 63,
      "spd": 45,
      "spe": 45
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Shell Armor",
    "sprite": "oshawott",
    "spriteId": "oshawott",
    "learnset": []
  },
  {
    "id": 502,
    "name": "Dewott",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 75,
      "def": 60,
      "spa": 83,
      "spd": 60,
      "spe": 60
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Shell Armor",
    "sprite": "dewott",
    "spriteId": "dewott",
    "learnset": []
  },
  {
    "id": 503,
    "name": "Samurott",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 100,
      "def": 85,
      "spa": 108,
      "spd": 70,
      "spe": 70
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Shell Armor",
    "sprite": "samurott",
    "spriteId": "samurott",
    "learnset": []
  },
  {
    "id": 503,
    "name": "Samurott-Hisui",
    "types": [
      "Water",
      "Dark"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 108,
      "def": 80,
      "spa": 100,
      "spd": 65,
      "spe": 85
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Sharpness",
    "sprite": "samurotthisui",
    "spriteId": "samurott-hisui",
    "learnset": []
  },
  {
    "id": 504,
    "name": "Patrat",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 55,
      "def": 39,
      "spa": 35,
      "spd": 39,
      "spe": 42
    },
    "abilities": [
      "Run Away",
      "Keen Eye"
    ],
    "hiddenAbility": "Analytic",
    "sprite": "patrat",
    "spriteId": "patrat",
    "learnset": []
  },
  {
    "id": 505,
    "name": "Watchog",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 85,
      "def": 69,
      "spa": 60,
      "spd": 69,
      "spe": 77
    },
    "abilities": [
      "Illuminate",
      "Keen Eye"
    ],
    "hiddenAbility": "Analytic",
    "sprite": "watchog",
    "spriteId": "watchog",
    "learnset": []
  },
  {
    "id": 506,
    "name": "Lillipup",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 60,
      "def": 45,
      "spa": 25,
      "spd": 45,
      "spe": 55
    },
    "abilities": [
      "Vital Spirit",
      "Pickup"
    ],
    "hiddenAbility": "Run Away",
    "sprite": "lillipup",
    "spriteId": "lillipup",
    "learnset": []
  },
  {
    "id": 507,
    "name": "Herdier",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 80,
      "def": 65,
      "spa": 35,
      "spd": 65,
      "spe": 60
    },
    "abilities": [
      "Intimidate",
      "Sand Rush"
    ],
    "hiddenAbility": "Scrappy",
    "sprite": "herdier",
    "spriteId": "herdier",
    "learnset": []
  },
  {
    "id": 508,
    "name": "Stoutland",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 110,
      "def": 90,
      "spa": 45,
      "spd": 90,
      "spe": 80
    },
    "abilities": [
      "Intimidate",
      "Sand Rush"
    ],
    "hiddenAbility": "Scrappy",
    "sprite": "stoutland",
    "spriteId": "stoutland",
    "learnset": []
  },
  {
    "id": 509,
    "name": "Purrloin",
    "types": [
      "Dark"
    ],
    "baseStats": {
      "hp": 41,
      "atk": 50,
      "def": 37,
      "spa": 50,
      "spd": 37,
      "spe": 66
    },
    "abilities": [
      "Limber",
      "Unburden"
    ],
    "hiddenAbility": "Prankster",
    "sprite": "purrloin",
    "spriteId": "purrloin",
    "learnset": []
  },
  {
    "id": 510,
    "name": "Liepard",
    "types": [
      "Dark"
    ],
    "baseStats": {
      "hp": 64,
      "atk": 88,
      "def": 50,
      "spa": 88,
      "spd": 50,
      "spe": 106
    },
    "abilities": [
      "Limber",
      "Unburden"
    ],
    "hiddenAbility": "Prankster",
    "sprite": "liepard",
    "spriteId": "liepard",
    "learnset": []
  },
  {
    "id": 511,
    "name": "Pansage",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 53,
      "def": 48,
      "spa": 53,
      "spd": 48,
      "spe": 64
    },
    "abilities": [
      "Gluttony"
    ],
    "hiddenAbility": "Overgrow",
    "sprite": "pansage",
    "spriteId": "pansage",
    "learnset": []
  },
  {
    "id": 512,
    "name": "Simisage",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 98,
      "def": 63,
      "spa": 98,
      "spd": 63,
      "spe": 101
    },
    "abilities": [
      "Gluttony"
    ],
    "hiddenAbility": "Overgrow",
    "sprite": "simisage",
    "spriteId": "simisage",
    "learnset": []
  },
  {
    "id": 513,
    "name": "Pansear",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 53,
      "def": 48,
      "spa": 53,
      "spd": 48,
      "spe": 64
    },
    "abilities": [
      "Gluttony"
    ],
    "hiddenAbility": "Blaze",
    "sprite": "pansear",
    "spriteId": "pansear",
    "learnset": []
  },
  {
    "id": 514,
    "name": "Simisear",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 98,
      "def": 63,
      "spa": 98,
      "spd": 63,
      "spe": 101
    },
    "abilities": [
      "Gluttony"
    ],
    "hiddenAbility": "Blaze",
    "sprite": "simisear",
    "spriteId": "simisear",
    "learnset": []
  },
  {
    "id": 515,
    "name": "Panpour",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 53,
      "def": 48,
      "spa": 53,
      "spd": 48,
      "spe": 64
    },
    "abilities": [
      "Gluttony"
    ],
    "hiddenAbility": "Torrent",
    "sprite": "panpour",
    "spriteId": "panpour",
    "learnset": []
  },
  {
    "id": 516,
    "name": "Simipour",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 98,
      "def": 63,
      "spa": 98,
      "spd": 63,
      "spe": 101
    },
    "abilities": [
      "Gluttony"
    ],
    "hiddenAbility": "Torrent",
    "sprite": "simipour",
    "spriteId": "simipour",
    "learnset": []
  },
  {
    "id": 517,
    "name": "Munna",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 76,
      "atk": 25,
      "def": 45,
      "spa": 67,
      "spd": 55,
      "spe": 24
    },
    "abilities": [
      "Forewarn",
      "Synchronize"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "munna",
    "spriteId": "munna",
    "learnset": []
  },
  {
    "id": 518,
    "name": "Musharna",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 116,
      "atk": 55,
      "def": 85,
      "spa": 107,
      "spd": 95,
      "spe": 29
    },
    "abilities": [
      "Forewarn",
      "Synchronize"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "musharna",
    "spriteId": "musharna",
    "learnset": []
  },
  {
    "id": 519,
    "name": "Pidove",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 55,
      "def": 50,
      "spa": 36,
      "spd": 30,
      "spe": 43
    },
    "abilities": [
      "Big Pecks",
      "Super Luck"
    ],
    "hiddenAbility": "Rivalry",
    "sprite": "pidove",
    "spriteId": "pidove",
    "learnset": []
  },
  {
    "id": 520,
    "name": "Tranquill",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 62,
      "atk": 77,
      "def": 62,
      "spa": 50,
      "spd": 42,
      "spe": 65
    },
    "abilities": [
      "Big Pecks",
      "Super Luck"
    ],
    "hiddenAbility": "Rivalry",
    "sprite": "tranquill",
    "spriteId": "tranquill",
    "learnset": []
  },
  {
    "id": 521,
    "name": "Unfezant",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 115,
      "def": 80,
      "spa": 65,
      "spd": 55,
      "spe": 93
    },
    "abilities": [
      "Big Pecks",
      "Super Luck"
    ],
    "hiddenAbility": "Rivalry",
    "sprite": "unfezant",
    "spriteId": "unfezant",
    "learnset": []
  },
  {
    "id": 522,
    "name": "Blitzle",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 60,
      "def": 32,
      "spa": 50,
      "spd": 32,
      "spe": 76
    },
    "abilities": [
      "Lightning Rod",
      "Motor Drive"
    ],
    "hiddenAbility": "Sap Sipper",
    "sprite": "blitzle",
    "spriteId": "blitzle",
    "learnset": []
  },
  {
    "id": 523,
    "name": "Zebstrika",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 100,
      "def": 63,
      "spa": 80,
      "spd": 63,
      "spe": 116
    },
    "abilities": [
      "Lightning Rod",
      "Motor Drive"
    ],
    "hiddenAbility": "Sap Sipper",
    "sprite": "zebstrika",
    "spriteId": "zebstrika",
    "learnset": []
  },
  {
    "id": 524,
    "name": "Roggenrola",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 75,
      "def": 85,
      "spa": 25,
      "spd": 25,
      "spe": 15
    },
    "abilities": [
      "Sturdy",
      "Weak Armor"
    ],
    "hiddenAbility": "Sand Force",
    "sprite": "roggenrola",
    "spriteId": "roggenrola",
    "learnset": []
  },
  {
    "id": 525,
    "name": "Boldore",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 105,
      "def": 105,
      "spa": 50,
      "spd": 40,
      "spe": 20
    },
    "abilities": [
      "Sturdy",
      "Weak Armor"
    ],
    "hiddenAbility": "Sand Force",
    "sprite": "boldore",
    "spriteId": "boldore",
    "learnset": []
  },
  {
    "id": 526,
    "name": "Gigalith",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 135,
      "def": 130,
      "spa": 60,
      "spd": 80,
      "spe": 25
    },
    "abilities": [
      "Sturdy",
      "Sand Stream"
    ],
    "hiddenAbility": "Sand Force",
    "sprite": "gigalith",
    "spriteId": "gigalith",
    "learnset": []
  },
  {
    "id": 527,
    "name": "Woobat",
    "types": [
      "Psychic",
      "Flying"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 45,
      "def": 43,
      "spa": 55,
      "spd": 43,
      "spe": 72
    },
    "abilities": [
      "Unaware",
      "Klutz"
    ],
    "hiddenAbility": "Simple",
    "sprite": "woobat",
    "spriteId": "woobat",
    "learnset": []
  },
  {
    "id": 528,
    "name": "Swoobat",
    "types": [
      "Psychic",
      "Flying"
    ],
    "baseStats": {
      "hp": 67,
      "atk": 57,
      "def": 55,
      "spa": 77,
      "spd": 55,
      "spe": 114
    },
    "abilities": [
      "Unaware",
      "Klutz"
    ],
    "hiddenAbility": "Simple",
    "sprite": "swoobat",
    "spriteId": "swoobat",
    "learnset": []
  },
  {
    "id": 529,
    "name": "Drilbur",
    "types": [
      "Ground"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 85,
      "def": 40,
      "spa": 30,
      "spd": 45,
      "spe": 68
    },
    "abilities": [
      "Sand Rush",
      "Sand Force"
    ],
    "hiddenAbility": "Mold Breaker",
    "sprite": "drilbur",
    "spriteId": "drilbur",
    "learnset": []
  },
  {
    "id": 530,
    "name": "Excadrill",
    "types": [
      "Ground",
      "Steel"
    ],
    "baseStats": {
      "hp": 110,
      "atk": 135,
      "def": 60,
      "spa": 50,
      "spd": 65,
      "spe": 88
    },
    "abilities": [
      "Sand Rush",
      "Sand Force"
    ],
    "hiddenAbility": "Mold Breaker",
    "sprite": "excadrill",
    "spriteId": "excadrill",
    "learnset": []
  },
  {
    "id": 530,
    "name": "Excadrill-Mega",
    "types": [
      "Ground",
      "Steel"
    ],
    "baseStats": {
      "hp": 110,
      "atk": 165,
      "def": 100,
      "spa": 65,
      "spd": 65,
      "spe": 103
    },
    "abilities": [
      "Piercing Drill"
    ],
    "hiddenAbility": "",
    "sprite": "excadrillmega",
    "spriteId": "excadrill-mega",
    "learnset": []
  },
  {
    "id": 531,
    "name": "Audino",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 103,
      "atk": 60,
      "def": 86,
      "spa": 60,
      "spd": 86,
      "spe": 50
    },
    "abilities": [
      "Healer",
      "Regenerator"
    ],
    "hiddenAbility": "Klutz",
    "sprite": "audino",
    "spriteId": "audino",
    "learnset": []
  },
  {
    "id": 531,
    "name": "Audino-Mega",
    "types": [
      "Normal",
      "Fairy"
    ],
    "baseStats": {
      "hp": 103,
      "atk": 60,
      "def": 126,
      "spa": 80,
      "spd": 126,
      "spe": 50
    },
    "abilities": [
      "Healer"
    ],
    "hiddenAbility": "",
    "sprite": "audinomega",
    "spriteId": "audino-mega",
    "learnset": []
  },
  {
    "id": 532,
    "name": "Timburr",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 80,
      "def": 55,
      "spa": 25,
      "spd": 35,
      "spe": 35
    },
    "abilities": [
      "Guts",
      "Sheer Force"
    ],
    "hiddenAbility": "Iron Fist",
    "sprite": "timburr",
    "spriteId": "timburr",
    "learnset": []
  },
  {
    "id": 533,
    "name": "Gurdurr",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 105,
      "def": 85,
      "spa": 40,
      "spd": 50,
      "spe": 40
    },
    "abilities": [
      "Guts",
      "Sheer Force"
    ],
    "hiddenAbility": "Iron Fist",
    "sprite": "gurdurr",
    "spriteId": "gurdurr",
    "learnset": []
  },
  {
    "id": 534,
    "name": "Conkeldurr",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 105,
      "atk": 140,
      "def": 95,
      "spa": 55,
      "spd": 65,
      "spe": 45
    },
    "abilities": [
      "Guts",
      "Sheer Force"
    ],
    "hiddenAbility": "Iron Fist",
    "sprite": "conkeldurr",
    "spriteId": "conkeldurr",
    "learnset": []
  },
  {
    "id": 535,
    "name": "Tympole",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 50,
      "def": 40,
      "spa": 50,
      "spd": 40,
      "spe": 64
    },
    "abilities": [
      "Swift Swim",
      "Hydration"
    ],
    "hiddenAbility": "Water Absorb",
    "sprite": "tympole",
    "spriteId": "tympole",
    "learnset": []
  },
  {
    "id": 536,
    "name": "Palpitoad",
    "types": [
      "Water",
      "Ground"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 65,
      "def": 55,
      "spa": 65,
      "spd": 55,
      "spe": 69
    },
    "abilities": [
      "Swift Swim",
      "Hydration"
    ],
    "hiddenAbility": "Water Absorb",
    "sprite": "palpitoad",
    "spriteId": "palpitoad",
    "learnset": []
  },
  {
    "id": 537,
    "name": "Seismitoad",
    "types": [
      "Water",
      "Ground"
    ],
    "baseStats": {
      "hp": 105,
      "atk": 95,
      "def": 75,
      "spa": 85,
      "spd": 75,
      "spe": 74
    },
    "abilities": [
      "Swift Swim",
      "Poison Touch"
    ],
    "hiddenAbility": "Water Absorb",
    "sprite": "seismitoad",
    "spriteId": "seismitoad",
    "learnset": []
  },
  {
    "id": 538,
    "name": "Throh",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 100,
      "def": 85,
      "spa": 30,
      "spd": 85,
      "spe": 45
    },
    "abilities": [
      "Guts",
      "Inner Focus"
    ],
    "hiddenAbility": "Mold Breaker",
    "sprite": "throh",
    "spriteId": "throh",
    "learnset": []
  },
  {
    "id": 539,
    "name": "Sawk",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 125,
      "def": 75,
      "spa": 30,
      "spd": 75,
      "spe": 85
    },
    "abilities": [
      "Sturdy",
      "Inner Focus"
    ],
    "hiddenAbility": "Mold Breaker",
    "sprite": "sawk",
    "spriteId": "sawk",
    "learnset": []
  },
  {
    "id": 540,
    "name": "Sewaddle",
    "types": [
      "Bug",
      "Grass"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 53,
      "def": 70,
      "spa": 40,
      "spd": 60,
      "spe": 42
    },
    "abilities": [
      "Swarm",
      "Chlorophyll"
    ],
    "hiddenAbility": "Overcoat",
    "sprite": "sewaddle",
    "spriteId": "sewaddle",
    "learnset": []
  },
  {
    "id": 541,
    "name": "Swadloon",
    "types": [
      "Bug",
      "Grass"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 63,
      "def": 90,
      "spa": 50,
      "spd": 80,
      "spe": 42
    },
    "abilities": [
      "Leaf Guard",
      "Chlorophyll"
    ],
    "hiddenAbility": "Overcoat",
    "sprite": "swadloon",
    "spriteId": "swadloon",
    "learnset": []
  },
  {
    "id": 542,
    "name": "Leavanny",
    "types": [
      "Bug",
      "Grass"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 103,
      "def": 80,
      "spa": 70,
      "spd": 80,
      "spe": 92
    },
    "abilities": [
      "Swarm",
      "Chlorophyll"
    ],
    "hiddenAbility": "Overcoat",
    "sprite": "leavanny",
    "spriteId": "leavanny",
    "learnset": []
  },
  {
    "id": 543,
    "name": "Venipede",
    "types": [
      "Bug",
      "Poison"
    ],
    "baseStats": {
      "hp": 30,
      "atk": 45,
      "def": 59,
      "spa": 30,
      "spd": 39,
      "spe": 57
    },
    "abilities": [
      "Poison Point",
      "Swarm"
    ],
    "hiddenAbility": "Speed Boost",
    "sprite": "venipede",
    "spriteId": "venipede",
    "learnset": []
  },
  {
    "id": 544,
    "name": "Whirlipede",
    "types": [
      "Bug",
      "Poison"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 55,
      "def": 99,
      "spa": 40,
      "spd": 79,
      "spe": 47
    },
    "abilities": [
      "Poison Point",
      "Swarm"
    ],
    "hiddenAbility": "Speed Boost",
    "sprite": "whirlipede",
    "spriteId": "whirlipede",
    "learnset": []
  },
  {
    "id": 545,
    "name": "Scolipede",
    "types": [
      "Bug",
      "Poison"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 100,
      "def": 89,
      "spa": 55,
      "spd": 69,
      "spe": 112
    },
    "abilities": [
      "Poison Point",
      "Swarm"
    ],
    "hiddenAbility": "Speed Boost",
    "sprite": "scolipede",
    "spriteId": "scolipede",
    "learnset": []
  },
  {
    "id": 545,
    "name": "Scolipede-Mega",
    "types": [
      "Bug",
      "Poison"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 140,
      "def": 149,
      "spa": 75,
      "spd": 99,
      "spe": 62
    },
    "abilities": [
      "Shell Armor"
    ],
    "hiddenAbility": "",
    "sprite": "scolipedemega",
    "spriteId": "scolipede-mega",
    "learnset": []
  },
  {
    "id": 546,
    "name": "Cottonee",
    "types": [
      "Grass",
      "Fairy"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 27,
      "def": 60,
      "spa": 37,
      "spd": 50,
      "spe": 66
    },
    "abilities": [
      "Prankster",
      "Infiltrator"
    ],
    "hiddenAbility": "Chlorophyll",
    "sprite": "cottonee",
    "spriteId": "cottonee",
    "learnset": []
  },
  {
    "id": 547,
    "name": "Whimsicott",
    "types": [
      "Grass",
      "Fairy"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 67,
      "def": 85,
      "spa": 77,
      "spd": 75,
      "spe": 116
    },
    "abilities": [
      "Prankster",
      "Infiltrator"
    ],
    "hiddenAbility": "Chlorophyll",
    "sprite": "whimsicott",
    "spriteId": "whimsicott",
    "learnset": []
  },
  {
    "id": 548,
    "name": "Petilil",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 35,
      "def": 50,
      "spa": 70,
      "spd": 50,
      "spe": 30
    },
    "abilities": [
      "Chlorophyll",
      "Own Tempo"
    ],
    "hiddenAbility": "Leaf Guard",
    "sprite": "petilil",
    "spriteId": "petilil",
    "learnset": []
  },
  {
    "id": 549,
    "name": "Lilligant",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 60,
      "def": 75,
      "spa": 110,
      "spd": 75,
      "spe": 90
    },
    "abilities": [
      "Chlorophyll",
      "Own Tempo"
    ],
    "hiddenAbility": "Leaf Guard",
    "sprite": "lilligant",
    "spriteId": "lilligant",
    "learnset": []
  },
  {
    "id": 549,
    "name": "Lilligant-Hisui",
    "types": [
      "Grass",
      "Fighting"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 105,
      "def": 75,
      "spa": 50,
      "spd": 75,
      "spe": 105
    },
    "abilities": [
      "Chlorophyll",
      "Hustle"
    ],
    "hiddenAbility": "Leaf Guard",
    "sprite": "lilliganthisui",
    "spriteId": "lilligant-hisui",
    "learnset": []
  },
  {
    "id": 550,
    "name": "Basculin",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 92,
      "def": 65,
      "spa": 80,
      "spd": 55,
      "spe": 98
    },
    "abilities": [
      "Reckless",
      "Adaptability"
    ],
    "hiddenAbility": "Mold Breaker",
    "sprite": "basculin",
    "spriteId": "basculin",
    "learnset": []
  },
  {
    "id": 550,
    "name": "Basculin-Blue-Striped",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 92,
      "def": 65,
      "spa": 80,
      "spd": 55,
      "spe": 98
    },
    "abilities": [
      "Rock Head",
      "Adaptability"
    ],
    "hiddenAbility": "Mold Breaker",
    "sprite": "basculinbluestriped",
    "spriteId": "basculin-bluestriped",
    "learnset": []
  },
  {
    "id": 550,
    "name": "Basculin-White-Striped",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 92,
      "def": 65,
      "spa": 80,
      "spd": 55,
      "spe": 98
    },
    "abilities": [
      "Rattled",
      "Adaptability"
    ],
    "hiddenAbility": "Mold Breaker",
    "sprite": "basculinwhitestriped",
    "spriteId": "basculin-whitestriped",
    "learnset": []
  },
  {
    "id": 551,
    "name": "Sandile",
    "types": [
      "Ground",
      "Dark"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 72,
      "def": 35,
      "spa": 35,
      "spd": 35,
      "spe": 65
    },
    "abilities": [
      "Intimidate",
      "Moxie"
    ],
    "hiddenAbility": "Anger Point",
    "sprite": "sandile",
    "spriteId": "sandile",
    "learnset": []
  },
  {
    "id": 552,
    "name": "Krokorok",
    "types": [
      "Ground",
      "Dark"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 82,
      "def": 45,
      "spa": 45,
      "spd": 45,
      "spe": 74
    },
    "abilities": [
      "Intimidate",
      "Moxie"
    ],
    "hiddenAbility": "Anger Point",
    "sprite": "krokorok",
    "spriteId": "krokorok",
    "learnset": []
  },
  {
    "id": 553,
    "name": "Krookodile",
    "types": [
      "Ground",
      "Dark"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 117,
      "def": 80,
      "spa": 65,
      "spd": 70,
      "spe": 92
    },
    "abilities": [
      "Intimidate",
      "Moxie"
    ],
    "hiddenAbility": "Anger Point",
    "sprite": "krookodile",
    "spriteId": "krookodile",
    "learnset": []
  },
  {
    "id": 554,
    "name": "Darumaka",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 90,
      "def": 45,
      "spa": 15,
      "spd": 45,
      "spe": 50
    },
    "abilities": [
      "Hustle"
    ],
    "hiddenAbility": "Inner Focus",
    "sprite": "darumaka",
    "spriteId": "darumaka",
    "learnset": []
  },
  {
    "id": 554,
    "name": "Darumaka-Galar",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 90,
      "def": 45,
      "spa": 15,
      "spd": 45,
      "spe": 50
    },
    "abilities": [
      "Hustle"
    ],
    "hiddenAbility": "Inner Focus",
    "sprite": "darumakagalar",
    "spriteId": "darumaka-galar",
    "learnset": []
  },
  {
    "id": 555,
    "name": "Darmanitan",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 105,
      "atk": 140,
      "def": 55,
      "spa": 30,
      "spd": 55,
      "spe": 95
    },
    "abilities": [
      "Sheer Force"
    ],
    "hiddenAbility": "Zen Mode",
    "sprite": "darmanitan",
    "spriteId": "darmanitan",
    "learnset": []
  },
  {
    "id": 555,
    "name": "Darmanitan-Zen",
    "types": [
      "Fire",
      "Psychic"
    ],
    "baseStats": {
      "hp": 105,
      "atk": 30,
      "def": 105,
      "spa": 140,
      "spd": 105,
      "spe": 55
    },
    "abilities": [
      "Zen Mode"
    ],
    "hiddenAbility": "",
    "sprite": "darmanitanzen",
    "spriteId": "darmanitan-zen",
    "learnset": []
  },
  {
    "id": 555,
    "name": "Darmanitan-Galar",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 105,
      "atk": 140,
      "def": 55,
      "spa": 30,
      "spd": 55,
      "spe": 95
    },
    "abilities": [
      "Gorilla Tactics"
    ],
    "hiddenAbility": "Zen Mode",
    "sprite": "darmanitangalar",
    "spriteId": "darmanitan-galar",
    "learnset": []
  },
  {
    "id": 555,
    "name": "Darmanitan-Galar-Zen",
    "types": [
      "Ice",
      "Fire"
    ],
    "baseStats": {
      "hp": 105,
      "atk": 160,
      "def": 55,
      "spa": 30,
      "spd": 55,
      "spe": 135
    },
    "abilities": [
      "Zen Mode"
    ],
    "hiddenAbility": "",
    "sprite": "darmanitangalarzen",
    "spriteId": "darmanitan-galarzen",
    "learnset": []
  },
  {
    "id": 556,
    "name": "Maractus",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 86,
      "def": 67,
      "spa": 106,
      "spd": 67,
      "spe": 60
    },
    "abilities": [
      "Water Absorb",
      "Chlorophyll"
    ],
    "hiddenAbility": "Storm Drain",
    "sprite": "maractus",
    "spriteId": "maractus",
    "learnset": []
  },
  {
    "id": 557,
    "name": "Dwebble",
    "types": [
      "Bug",
      "Rock"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 65,
      "def": 85,
      "spa": 35,
      "spd": 35,
      "spe": 55
    },
    "abilities": [
      "Sturdy",
      "Shell Armor"
    ],
    "hiddenAbility": "Weak Armor",
    "sprite": "dwebble",
    "spriteId": "dwebble",
    "learnset": []
  },
  {
    "id": 558,
    "name": "Crustle",
    "types": [
      "Bug",
      "Rock"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 105,
      "def": 125,
      "spa": 65,
      "spd": 75,
      "spe": 45
    },
    "abilities": [
      "Sturdy",
      "Shell Armor"
    ],
    "hiddenAbility": "Weak Armor",
    "sprite": "crustle",
    "spriteId": "crustle",
    "learnset": []
  },
  {
    "id": 559,
    "name": "Scraggy",
    "types": [
      "Dark",
      "Fighting"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 75,
      "def": 70,
      "spa": 35,
      "spd": 70,
      "spe": 48
    },
    "abilities": [
      "Shed Skin",
      "Moxie"
    ],
    "hiddenAbility": "Intimidate",
    "sprite": "scraggy",
    "spriteId": "scraggy",
    "learnset": []
  },
  {
    "id": 560,
    "name": "Scrafty",
    "types": [
      "Dark",
      "Fighting"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 90,
      "def": 115,
      "spa": 45,
      "spd": 115,
      "spe": 58
    },
    "abilities": [
      "Shed Skin",
      "Moxie"
    ],
    "hiddenAbility": "Intimidate",
    "sprite": "scrafty",
    "spriteId": "scrafty",
    "learnset": []
  },
  {
    "id": 560,
    "name": "Scrafty-Mega",
    "types": [
      "Dark",
      "Fighting"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 130,
      "def": 135,
      "spa": 55,
      "spd": 135,
      "spe": 68
    },
    "abilities": [
      "Intimidate"
    ],
    "hiddenAbility": "",
    "sprite": "scraftymega",
    "spriteId": "scrafty-mega",
    "learnset": []
  },
  {
    "id": 561,
    "name": "Sigilyph",
    "types": [
      "Psychic",
      "Flying"
    ],
    "baseStats": {
      "hp": 72,
      "atk": 58,
      "def": 80,
      "spa": 103,
      "spd": 80,
      "spe": 97
    },
    "abilities": [
      "Wonder Skin",
      "Magic Guard"
    ],
    "hiddenAbility": "Tinted Lens",
    "sprite": "sigilyph",
    "spriteId": "sigilyph",
    "learnset": []
  },
  {
    "id": 562,
    "name": "Yamask",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 38,
      "atk": 30,
      "def": 85,
      "spa": 55,
      "spd": 65,
      "spe": 30
    },
    "abilities": [
      "Mummy"
    ],
    "hiddenAbility": "",
    "sprite": "yamask",
    "spriteId": "yamask",
    "learnset": []
  },
  {
    "id": 562,
    "name": "Yamask-Galar",
    "types": [
      "Ground",
      "Ghost"
    ],
    "baseStats": {
      "hp": 38,
      "atk": 55,
      "def": 85,
      "spa": 30,
      "spd": 65,
      "spe": 30
    },
    "abilities": [
      "Wandering Spirit"
    ],
    "hiddenAbility": "",
    "sprite": "yamaskgalar",
    "spriteId": "yamask-galar",
    "learnset": []
  },
  {
    "id": 563,
    "name": "Cofagrigus",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 58,
      "atk": 50,
      "def": 145,
      "spa": 95,
      "spd": 105,
      "spe": 30
    },
    "abilities": [
      "Mummy"
    ],
    "hiddenAbility": "",
    "sprite": "cofagrigus",
    "spriteId": "cofagrigus",
    "learnset": []
  },
  {
    "id": 564,
    "name": "Tirtouga",
    "types": [
      "Water",
      "Rock"
    ],
    "baseStats": {
      "hp": 54,
      "atk": 78,
      "def": 103,
      "spa": 53,
      "spd": 45,
      "spe": 22
    },
    "abilities": [
      "Solid Rock",
      "Sturdy"
    ],
    "hiddenAbility": "Swift Swim",
    "sprite": "tirtouga",
    "spriteId": "tirtouga",
    "learnset": []
  },
  {
    "id": 565,
    "name": "Carracosta",
    "types": [
      "Water",
      "Rock"
    ],
    "baseStats": {
      "hp": 74,
      "atk": 108,
      "def": 133,
      "spa": 83,
      "spd": 65,
      "spe": 32
    },
    "abilities": [
      "Solid Rock",
      "Sturdy"
    ],
    "hiddenAbility": "Swift Swim",
    "sprite": "carracosta",
    "spriteId": "carracosta",
    "learnset": []
  },
  {
    "id": 566,
    "name": "Archen",
    "types": [
      "Rock",
      "Flying"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 112,
      "def": 45,
      "spa": 74,
      "spd": 45,
      "spe": 70
    },
    "abilities": [
      "Defeatist"
    ],
    "hiddenAbility": "",
    "sprite": "archen",
    "spriteId": "archen",
    "learnset": []
  },
  {
    "id": 567,
    "name": "Archeops",
    "types": [
      "Rock",
      "Flying"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 140,
      "def": 65,
      "spa": 112,
      "spd": 65,
      "spe": 110
    },
    "abilities": [
      "Defeatist"
    ],
    "hiddenAbility": "",
    "sprite": "archeops",
    "spriteId": "archeops",
    "learnset": []
  },
  {
    "id": 568,
    "name": "Trubbish",
    "types": [
      "Poison"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 50,
      "def": 62,
      "spa": 40,
      "spd": 62,
      "spe": 65
    },
    "abilities": [
      "Stench",
      "Sticky Hold"
    ],
    "hiddenAbility": "Aftermath",
    "sprite": "trubbish",
    "spriteId": "trubbish",
    "learnset": []
  },
  {
    "id": 569,
    "name": "Garbodor",
    "types": [
      "Poison"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 95,
      "def": 82,
      "spa": 60,
      "spd": 82,
      "spe": 75
    },
    "abilities": [
      "Stench",
      "Weak Armor"
    ],
    "hiddenAbility": "Aftermath",
    "sprite": "garbodor",
    "spriteId": "garbodor",
    "learnset": []
  },
  {
    "id": 569,
    "name": "Garbodor-Gmax",
    "types": [
      "Poison"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 95,
      "def": 82,
      "spa": 60,
      "spd": 82,
      "spe": 75
    },
    "abilities": [
      "Stench",
      "Weak Armor"
    ],
    "hiddenAbility": "Aftermath",
    "sprite": "garbodorgmax",
    "spriteId": "garbodor-gmax",
    "learnset": []
  },
  {
    "id": 570,
    "name": "Zorua",
    "types": [
      "Dark"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 65,
      "def": 40,
      "spa": 80,
      "spd": 40,
      "spe": 65
    },
    "abilities": [
      "Illusion"
    ],
    "hiddenAbility": "",
    "sprite": "zorua",
    "spriteId": "zorua",
    "learnset": []
  },
  {
    "id": 570,
    "name": "Zorua-Hisui",
    "types": [
      "Normal",
      "Ghost"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 60,
      "def": 40,
      "spa": 85,
      "spd": 40,
      "spe": 70
    },
    "abilities": [
      "Illusion"
    ],
    "hiddenAbility": "",
    "sprite": "zoruahisui",
    "spriteId": "zorua-hisui",
    "learnset": []
  },
  {
    "id": 571,
    "name": "Zoroark",
    "types": [
      "Dark"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 105,
      "def": 60,
      "spa": 120,
      "spd": 60,
      "spe": 105
    },
    "abilities": [
      "Illusion"
    ],
    "hiddenAbility": "",
    "sprite": "zoroark",
    "spriteId": "zoroark",
    "learnset": []
  },
  {
    "id": 571,
    "name": "Zoroark-Hisui",
    "types": [
      "Normal",
      "Ghost"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 100,
      "def": 60,
      "spa": 125,
      "spd": 60,
      "spe": 110
    },
    "abilities": [
      "Illusion"
    ],
    "hiddenAbility": "",
    "sprite": "zoroarkhisui",
    "spriteId": "zoroark-hisui",
    "learnset": []
  },
  {
    "id": 572,
    "name": "Minccino",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 50,
      "def": 40,
      "spa": 40,
      "spd": 40,
      "spe": 75
    },
    "abilities": [
      "Cute Charm",
      "Technician"
    ],
    "hiddenAbility": "Skill Link",
    "sprite": "minccino",
    "spriteId": "minccino",
    "learnset": []
  },
  {
    "id": 573,
    "name": "Cinccino",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 95,
      "def": 60,
      "spa": 65,
      "spd": 60,
      "spe": 115
    },
    "abilities": [
      "Cute Charm",
      "Technician"
    ],
    "hiddenAbility": "Skill Link",
    "sprite": "cinccino",
    "spriteId": "cinccino",
    "learnset": []
  },
  {
    "id": 574,
    "name": "Gothita",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 30,
      "def": 50,
      "spa": 55,
      "spd": 65,
      "spe": 45
    },
    "abilities": [
      "Frisk",
      "Competitive"
    ],
    "hiddenAbility": "Shadow Tag",
    "sprite": "gothita",
    "spriteId": "gothita",
    "learnset": []
  },
  {
    "id": 575,
    "name": "Gothorita",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 45,
      "def": 70,
      "spa": 75,
      "spd": 85,
      "spe": 55
    },
    "abilities": [
      "Frisk",
      "Competitive"
    ],
    "hiddenAbility": "Shadow Tag",
    "sprite": "gothorita",
    "spriteId": "gothorita",
    "learnset": []
  },
  {
    "id": 576,
    "name": "Gothitelle",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 55,
      "def": 95,
      "spa": 95,
      "spd": 110,
      "spe": 65
    },
    "abilities": [
      "Frisk",
      "Competitive"
    ],
    "hiddenAbility": "Shadow Tag",
    "sprite": "gothitelle",
    "spriteId": "gothitelle",
    "learnset": []
  },
  {
    "id": 577,
    "name": "Solosis",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 30,
      "def": 40,
      "spa": 105,
      "spd": 50,
      "spe": 20
    },
    "abilities": [
      "Overcoat",
      "Magic Guard"
    ],
    "hiddenAbility": "Regenerator",
    "sprite": "solosis",
    "spriteId": "solosis",
    "learnset": []
  },
  {
    "id": 578,
    "name": "Duosion",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 40,
      "def": 50,
      "spa": 125,
      "spd": 60,
      "spe": 30
    },
    "abilities": [
      "Overcoat",
      "Magic Guard"
    ],
    "hiddenAbility": "Regenerator",
    "sprite": "duosion",
    "spriteId": "duosion",
    "learnset": []
  },
  {
    "id": 579,
    "name": "Reuniclus",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 110,
      "atk": 65,
      "def": 75,
      "spa": 125,
      "spd": 85,
      "spe": 30
    },
    "abilities": [
      "Overcoat",
      "Magic Guard"
    ],
    "hiddenAbility": "Regenerator",
    "sprite": "reuniclus",
    "spriteId": "reuniclus",
    "learnset": []
  },
  {
    "id": 580,
    "name": "Ducklett",
    "types": [
      "Water",
      "Flying"
    ],
    "baseStats": {
      "hp": 62,
      "atk": 44,
      "def": 50,
      "spa": 44,
      "spd": 50,
      "spe": 55
    },
    "abilities": [
      "Keen Eye",
      "Big Pecks"
    ],
    "hiddenAbility": "Hydration",
    "sprite": "ducklett",
    "spriteId": "ducklett",
    "learnset": []
  },
  {
    "id": 581,
    "name": "Swanna",
    "types": [
      "Water",
      "Flying"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 87,
      "def": 63,
      "spa": 87,
      "spd": 63,
      "spe": 98
    },
    "abilities": [
      "Keen Eye",
      "Big Pecks"
    ],
    "hiddenAbility": "Hydration",
    "sprite": "swanna",
    "spriteId": "swanna",
    "learnset": []
  },
  {
    "id": 582,
    "name": "Vanillite",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 36,
      "atk": 50,
      "def": 50,
      "spa": 65,
      "spd": 60,
      "spe": 44
    },
    "abilities": [
      "Ice Body",
      "Snow Cloak"
    ],
    "hiddenAbility": "Weak Armor",
    "sprite": "vanillite",
    "spriteId": "vanillite",
    "learnset": []
  },
  {
    "id": 583,
    "name": "Vanillish",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 51,
      "atk": 65,
      "def": 65,
      "spa": 80,
      "spd": 75,
      "spe": 59
    },
    "abilities": [
      "Ice Body",
      "Snow Cloak"
    ],
    "hiddenAbility": "Weak Armor",
    "sprite": "vanillish",
    "spriteId": "vanillish",
    "learnset": []
  },
  {
    "id": 584,
    "name": "Vanilluxe",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 71,
      "atk": 95,
      "def": 85,
      "spa": 110,
      "spd": 95,
      "spe": 79
    },
    "abilities": [
      "Ice Body",
      "Snow Warning"
    ],
    "hiddenAbility": "Weak Armor",
    "sprite": "vanilluxe",
    "spriteId": "vanilluxe",
    "learnset": []
  },
  {
    "id": 585,
    "name": "Deerling",
    "types": [
      "Normal",
      "Grass"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 60,
      "def": 50,
      "spa": 40,
      "spd": 50,
      "spe": 75
    },
    "abilities": [
      "Chlorophyll",
      "Sap Sipper"
    ],
    "hiddenAbility": "Serene Grace",
    "sprite": "deerling",
    "spriteId": "deerling",
    "learnset": []
  },
  {
    "id": 586,
    "name": "Sawsbuck",
    "types": [
      "Normal",
      "Grass"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 100,
      "def": 70,
      "spa": 60,
      "spd": 70,
      "spe": 95
    },
    "abilities": [
      "Chlorophyll",
      "Sap Sipper"
    ],
    "hiddenAbility": "Serene Grace",
    "sprite": "sawsbuck",
    "spriteId": "sawsbuck",
    "learnset": []
  },
  {
    "id": 587,
    "name": "Emolga",
    "types": [
      "Electric",
      "Flying"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 75,
      "def": 60,
      "spa": 75,
      "spd": 60,
      "spe": 103
    },
    "abilities": [
      "Static"
    ],
    "hiddenAbility": "Motor Drive",
    "sprite": "emolga",
    "spriteId": "emolga",
    "learnset": []
  },
  {
    "id": 588,
    "name": "Karrablast",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 75,
      "def": 45,
      "spa": 40,
      "spd": 45,
      "spe": 60
    },
    "abilities": [
      "Swarm",
      "Shed Skin"
    ],
    "hiddenAbility": "No Guard",
    "sprite": "karrablast",
    "spriteId": "karrablast",
    "learnset": []
  },
  {
    "id": 589,
    "name": "Escavalier",
    "types": [
      "Bug",
      "Steel"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 135,
      "def": 105,
      "spa": 60,
      "spd": 105,
      "spe": 20
    },
    "abilities": [
      "Swarm",
      "Shell Armor"
    ],
    "hiddenAbility": "Overcoat",
    "sprite": "escavalier",
    "spriteId": "escavalier",
    "learnset": []
  },
  {
    "id": 590,
    "name": "Foongus",
    "types": [
      "Grass",
      "Poison"
    ],
    "baseStats": {
      "hp": 69,
      "atk": 55,
      "def": 45,
      "spa": 55,
      "spd": 55,
      "spe": 15
    },
    "abilities": [
      "Effect Spore"
    ],
    "hiddenAbility": "Regenerator",
    "sprite": "foongus",
    "spriteId": "foongus",
    "learnset": []
  },
  {
    "id": 591,
    "name": "Amoonguss",
    "types": [
      "Grass",
      "Poison"
    ],
    "baseStats": {
      "hp": 114,
      "atk": 85,
      "def": 70,
      "spa": 85,
      "spd": 80,
      "spe": 30
    },
    "abilities": [
      "Effect Spore"
    ],
    "hiddenAbility": "Regenerator",
    "sprite": "amoonguss",
    "spriteId": "amoonguss",
    "learnset": []
  },
  {
    "id": 592,
    "name": "Frillish",
    "types": [
      "Water",
      "Ghost"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 40,
      "def": 50,
      "spa": 65,
      "spd": 85,
      "spe": 40
    },
    "abilities": [
      "Water Absorb",
      "Cursed Body"
    ],
    "hiddenAbility": "Damp",
    "sprite": "frillish",
    "spriteId": "frillish",
    "learnset": []
  },
  {
    "id": 593,
    "name": "Jellicent",
    "types": [
      "Water",
      "Ghost"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 60,
      "def": 70,
      "spa": 85,
      "spd": 105,
      "spe": 60
    },
    "abilities": [
      "Water Absorb",
      "Cursed Body"
    ],
    "hiddenAbility": "Damp",
    "sprite": "jellicent",
    "spriteId": "jellicent",
    "learnset": []
  },
  {
    "id": 594,
    "name": "Alomomola",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 165,
      "atk": 75,
      "def": 80,
      "spa": 40,
      "spd": 45,
      "spe": 65
    },
    "abilities": [
      "Healer",
      "Hydration"
    ],
    "hiddenAbility": "Regenerator",
    "sprite": "alomomola",
    "spriteId": "alomomola",
    "learnset": []
  },
  {
    "id": 595,
    "name": "Joltik",
    "types": [
      "Bug",
      "Electric"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 47,
      "def": 50,
      "spa": 57,
      "spd": 50,
      "spe": 65
    },
    "abilities": [
      "Compound Eyes",
      "Unnerve"
    ],
    "hiddenAbility": "Swarm",
    "sprite": "joltik",
    "spriteId": "joltik",
    "learnset": []
  },
  {
    "id": 596,
    "name": "Galvantula",
    "types": [
      "Bug",
      "Electric"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 77,
      "def": 60,
      "spa": 97,
      "spd": 60,
      "spe": 108
    },
    "abilities": [
      "Compound Eyes",
      "Unnerve"
    ],
    "hiddenAbility": "Swarm",
    "sprite": "galvantula",
    "spriteId": "galvantula",
    "learnset": []
  },
  {
    "id": 597,
    "name": "Ferroseed",
    "types": [
      "Grass",
      "Steel"
    ],
    "baseStats": {
      "hp": 44,
      "atk": 50,
      "def": 91,
      "spa": 24,
      "spd": 86,
      "spe": 10
    },
    "abilities": [
      "Iron Barbs"
    ],
    "hiddenAbility": "",
    "sprite": "ferroseed",
    "spriteId": "ferroseed",
    "learnset": []
  },
  {
    "id": 598,
    "name": "Ferrothorn",
    "types": [
      "Grass",
      "Steel"
    ],
    "baseStats": {
      "hp": 74,
      "atk": 94,
      "def": 131,
      "spa": 54,
      "spd": 116,
      "spe": 20
    },
    "abilities": [
      "Iron Barbs"
    ],
    "hiddenAbility": "Anticipation",
    "sprite": "ferrothorn",
    "spriteId": "ferrothorn",
    "learnset": []
  },
  {
    "id": 599,
    "name": "Klink",
    "types": [
      "Steel"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 55,
      "def": 70,
      "spa": 45,
      "spd": 60,
      "spe": 30
    },
    "abilities": [
      "Plus",
      "Minus"
    ],
    "hiddenAbility": "Clear Body",
    "sprite": "klink",
    "spriteId": "klink",
    "learnset": []
  },
  {
    "id": 600,
    "name": "Klang",
    "types": [
      "Steel"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 80,
      "def": 95,
      "spa": 70,
      "spd": 85,
      "spe": 50
    },
    "abilities": [
      "Plus",
      "Minus"
    ],
    "hiddenAbility": "Clear Body",
    "sprite": "klang",
    "spriteId": "klang",
    "learnset": []
  },
  {
    "id": 601,
    "name": "Klinklang",
    "types": [
      "Steel"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 100,
      "def": 115,
      "spa": 70,
      "spd": 85,
      "spe": 90
    },
    "abilities": [
      "Plus",
      "Minus"
    ],
    "hiddenAbility": "Clear Body",
    "sprite": "klinklang",
    "spriteId": "klinklang",
    "learnset": []
  },
  {
    "id": 602,
    "name": "Tynamo",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 55,
      "def": 40,
      "spa": 45,
      "spd": 40,
      "spe": 60
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "tynamo",
    "spriteId": "tynamo",
    "learnset": []
  },
  {
    "id": 603,
    "name": "Eelektrik",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 85,
      "def": 70,
      "spa": 75,
      "spd": 70,
      "spe": 40
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "eelektrik",
    "spriteId": "eelektrik",
    "learnset": []
  },
  {
    "id": 604,
    "name": "Eelektross",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 115,
      "def": 80,
      "spa": 105,
      "spd": 80,
      "spe": 50
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "eelektross",
    "spriteId": "eelektross",
    "learnset": []
  },
  {
    "id": 604,
    "name": "Eelektross-Mega",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 145,
      "def": 80,
      "spa": 135,
      "spd": 90,
      "spe": 80
    },
    "abilities": [
      "Eelevate"
    ],
    "hiddenAbility": "",
    "sprite": "eelektrossmega",
    "spriteId": "eelektross-mega",
    "learnset": []
  },
  {
    "id": 605,
    "name": "Elgyem",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 55,
      "def": 55,
      "spa": 85,
      "spd": 55,
      "spe": 30
    },
    "abilities": [
      "Telepathy",
      "Synchronize"
    ],
    "hiddenAbility": "Analytic",
    "sprite": "elgyem",
    "spriteId": "elgyem",
    "learnset": []
  },
  {
    "id": 606,
    "name": "Beheeyem",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 75,
      "def": 75,
      "spa": 125,
      "spd": 95,
      "spe": 40
    },
    "abilities": [
      "Telepathy",
      "Synchronize"
    ],
    "hiddenAbility": "Analytic",
    "sprite": "beheeyem",
    "spriteId": "beheeyem",
    "learnset": []
  },
  {
    "id": 607,
    "name": "Litwick",
    "types": [
      "Ghost",
      "Fire"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 30,
      "def": 55,
      "spa": 65,
      "spd": 55,
      "spe": 20
    },
    "abilities": [
      "Flash Fire",
      "Flame Body"
    ],
    "hiddenAbility": "Infiltrator",
    "sprite": "litwick",
    "spriteId": "litwick",
    "learnset": []
  },
  {
    "id": 608,
    "name": "Lampent",
    "types": [
      "Ghost",
      "Fire"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 40,
      "def": 60,
      "spa": 95,
      "spd": 60,
      "spe": 55
    },
    "abilities": [
      "Flash Fire",
      "Flame Body"
    ],
    "hiddenAbility": "Infiltrator",
    "sprite": "lampent",
    "spriteId": "lampent",
    "learnset": []
  },
  {
    "id": 609,
    "name": "Chandelure",
    "types": [
      "Ghost",
      "Fire"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 55,
      "def": 90,
      "spa": 145,
      "spd": 90,
      "spe": 80
    },
    "abilities": [
      "Flash Fire",
      "Flame Body"
    ],
    "hiddenAbility": "Infiltrator",
    "sprite": "chandelure",
    "spriteId": "chandelure",
    "learnset": []
  },
  {
    "id": 609,
    "name": "Chandelure-Mega",
    "types": [
      "Ghost",
      "Fire"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 75,
      "def": 110,
      "spa": 175,
      "spd": 110,
      "spe": 90
    },
    "abilities": [
      "Infiltrator"
    ],
    "hiddenAbility": "",
    "sprite": "chandeluremega",
    "spriteId": "chandelure-mega",
    "learnset": []
  },
  {
    "id": 610,
    "name": "Axew",
    "types": [
      "Dragon"
    ],
    "baseStats": {
      "hp": 46,
      "atk": 87,
      "def": 60,
      "spa": 30,
      "spd": 40,
      "spe": 57
    },
    "abilities": [
      "Rivalry",
      "Mold Breaker"
    ],
    "hiddenAbility": "Unnerve",
    "sprite": "axew",
    "spriteId": "axew",
    "learnset": []
  },
  {
    "id": 611,
    "name": "Fraxure",
    "types": [
      "Dragon"
    ],
    "baseStats": {
      "hp": 66,
      "atk": 117,
      "def": 70,
      "spa": 40,
      "spd": 50,
      "spe": 67
    },
    "abilities": [
      "Rivalry",
      "Mold Breaker"
    ],
    "hiddenAbility": "Unnerve",
    "sprite": "fraxure",
    "spriteId": "fraxure",
    "learnset": []
  },
  {
    "id": 612,
    "name": "Haxorus",
    "types": [
      "Dragon"
    ],
    "baseStats": {
      "hp": 76,
      "atk": 147,
      "def": 90,
      "spa": 60,
      "spd": 70,
      "spe": 97
    },
    "abilities": [
      "Rivalry",
      "Mold Breaker"
    ],
    "hiddenAbility": "Unnerve",
    "sprite": "haxorus",
    "spriteId": "haxorus",
    "learnset": []
  },
  {
    "id": 613,
    "name": "Cubchoo",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 70,
      "def": 40,
      "spa": 60,
      "spd": 40,
      "spe": 40
    },
    "abilities": [
      "Snow Cloak",
      "Slush Rush"
    ],
    "hiddenAbility": "Rattled",
    "sprite": "cubchoo",
    "spriteId": "cubchoo",
    "learnset": []
  },
  {
    "id": 614,
    "name": "Beartic",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 130,
      "def": 80,
      "spa": 70,
      "spd": 80,
      "spe": 50
    },
    "abilities": [
      "Snow Cloak",
      "Slush Rush"
    ],
    "hiddenAbility": "Swift Swim",
    "sprite": "beartic",
    "spriteId": "beartic",
    "learnset": []
  },
  {
    "id": 615,
    "name": "Cryogonal",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 50,
      "def": 50,
      "spa": 95,
      "spd": 135,
      "spe": 105
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "cryogonal",
    "spriteId": "cryogonal",
    "learnset": []
  },
  {
    "id": 616,
    "name": "Shelmet",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 40,
      "def": 85,
      "spa": 40,
      "spd": 65,
      "spe": 25
    },
    "abilities": [
      "Hydration",
      "Shell Armor"
    ],
    "hiddenAbility": "Overcoat",
    "sprite": "shelmet",
    "spriteId": "shelmet",
    "learnset": []
  },
  {
    "id": 617,
    "name": "Accelgor",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 70,
      "def": 40,
      "spa": 100,
      "spd": 60,
      "spe": 145
    },
    "abilities": [
      "Hydration",
      "Sticky Hold"
    ],
    "hiddenAbility": "Unburden",
    "sprite": "accelgor",
    "spriteId": "accelgor",
    "learnset": []
  },
  {
    "id": 618,
    "name": "Stunfisk",
    "types": [
      "Ground",
      "Electric"
    ],
    "baseStats": {
      "hp": 109,
      "atk": 66,
      "def": 84,
      "spa": 81,
      "spd": 99,
      "spe": 32
    },
    "abilities": [
      "Static",
      "Limber"
    ],
    "hiddenAbility": "Sand Veil",
    "sprite": "stunfisk",
    "spriteId": "stunfisk",
    "learnset": []
  },
  {
    "id": 618,
    "name": "Stunfisk-Galar",
    "types": [
      "Ground",
      "Steel"
    ],
    "baseStats": {
      "hp": 109,
      "atk": 81,
      "def": 99,
      "spa": 66,
      "spd": 84,
      "spe": 32
    },
    "abilities": [
      "Mimicry"
    ],
    "hiddenAbility": "",
    "sprite": "stunfiskgalar",
    "spriteId": "stunfisk-galar",
    "learnset": []
  },
  {
    "id": 619,
    "name": "Mienfoo",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 85,
      "def": 50,
      "spa": 55,
      "spd": 50,
      "spe": 65
    },
    "abilities": [
      "Inner Focus",
      "Regenerator"
    ],
    "hiddenAbility": "Reckless",
    "sprite": "mienfoo",
    "spriteId": "mienfoo",
    "learnset": []
  },
  {
    "id": 620,
    "name": "Mienshao",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 125,
      "def": 60,
      "spa": 95,
      "spd": 60,
      "spe": 105
    },
    "abilities": [
      "Inner Focus",
      "Regenerator"
    ],
    "hiddenAbility": "Reckless",
    "sprite": "mienshao",
    "spriteId": "mienshao",
    "learnset": []
  },
  {
    "id": 621,
    "name": "Druddigon",
    "types": [
      "Dragon"
    ],
    "baseStats": {
      "hp": 77,
      "atk": 120,
      "def": 90,
      "spa": 60,
      "spd": 90,
      "spe": 48
    },
    "abilities": [
      "Rough Skin",
      "Sheer Force"
    ],
    "hiddenAbility": "Mold Breaker",
    "sprite": "druddigon",
    "spriteId": "druddigon",
    "learnset": []
  },
  {
    "id": 622,
    "name": "Golett",
    "types": [
      "Ground",
      "Ghost"
    ],
    "baseStats": {
      "hp": 59,
      "atk": 74,
      "def": 50,
      "spa": 35,
      "spd": 50,
      "spe": 35
    },
    "abilities": [
      "Iron Fist",
      "Klutz"
    ],
    "hiddenAbility": "No Guard",
    "sprite": "golett",
    "spriteId": "golett",
    "learnset": []
  },
  {
    "id": 623,
    "name": "Golurk",
    "types": [
      "Ground",
      "Ghost"
    ],
    "baseStats": {
      "hp": 89,
      "atk": 124,
      "def": 80,
      "spa": 55,
      "spd": 80,
      "spe": 55
    },
    "abilities": [
      "Iron Fist",
      "Klutz"
    ],
    "hiddenAbility": "No Guard",
    "sprite": "golurk",
    "spriteId": "golurk",
    "learnset": []
  },
  {
    "id": 623,
    "name": "Golurk-Mega",
    "types": [
      "Ground",
      "Ghost"
    ],
    "baseStats": {
      "hp": 89,
      "atk": 159,
      "def": 105,
      "spa": 70,
      "spd": 105,
      "spe": 55
    },
    "abilities": [
      "Unseen Fist"
    ],
    "hiddenAbility": "",
    "sprite": "golurkmega",
    "spriteId": "golurk-mega",
    "learnset": []
  },
  {
    "id": 624,
    "name": "Pawniard",
    "types": [
      "Dark",
      "Steel"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 85,
      "def": 70,
      "spa": 40,
      "spd": 40,
      "spe": 60
    },
    "abilities": [
      "Defiant",
      "Inner Focus"
    ],
    "hiddenAbility": "Pressure",
    "sprite": "pawniard",
    "spriteId": "pawniard",
    "learnset": []
  },
  {
    "id": 625,
    "name": "Bisharp",
    "types": [
      "Dark",
      "Steel"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 125,
      "def": 100,
      "spa": 60,
      "spd": 70,
      "spe": 70
    },
    "abilities": [
      "Defiant",
      "Inner Focus"
    ],
    "hiddenAbility": "Pressure",
    "sprite": "bisharp",
    "spriteId": "bisharp",
    "learnset": []
  },
  {
    "id": 626,
    "name": "Bouffalant",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 110,
      "def": 95,
      "spa": 40,
      "spd": 95,
      "spe": 55
    },
    "abilities": [
      "Reckless",
      "Sap Sipper"
    ],
    "hiddenAbility": "Soundproof",
    "sprite": "bouffalant",
    "spriteId": "bouffalant",
    "learnset": []
  },
  {
    "id": 627,
    "name": "Rufflet",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 83,
      "def": 50,
      "spa": 37,
      "spd": 50,
      "spe": 60
    },
    "abilities": [
      "Keen Eye",
      "Sheer Force"
    ],
    "hiddenAbility": "Hustle",
    "sprite": "rufflet",
    "spriteId": "rufflet",
    "learnset": []
  },
  {
    "id": 628,
    "name": "Braviary",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 123,
      "def": 75,
      "spa": 57,
      "spd": 75,
      "spe": 80
    },
    "abilities": [
      "Keen Eye",
      "Sheer Force"
    ],
    "hiddenAbility": "Defiant",
    "sprite": "braviary",
    "spriteId": "braviary",
    "learnset": []
  },
  {
    "id": 628,
    "name": "Braviary-Hisui",
    "types": [
      "Psychic",
      "Flying"
    ],
    "baseStats": {
      "hp": 110,
      "atk": 83,
      "def": 70,
      "spa": 112,
      "spd": 70,
      "spe": 65
    },
    "abilities": [
      "Keen Eye",
      "Sheer Force"
    ],
    "hiddenAbility": "Tinted Lens",
    "sprite": "braviaryhisui",
    "spriteId": "braviary-hisui",
    "learnset": []
  },
  {
    "id": 629,
    "name": "Vullaby",
    "types": [
      "Dark",
      "Flying"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 55,
      "def": 75,
      "spa": 45,
      "spd": 65,
      "spe": 60
    },
    "abilities": [
      "Big Pecks",
      "Overcoat"
    ],
    "hiddenAbility": "Weak Armor",
    "sprite": "vullaby",
    "spriteId": "vullaby",
    "learnset": []
  },
  {
    "id": 630,
    "name": "Mandibuzz",
    "types": [
      "Dark",
      "Flying"
    ],
    "baseStats": {
      "hp": 110,
      "atk": 65,
      "def": 105,
      "spa": 55,
      "spd": 95,
      "spe": 80
    },
    "abilities": [
      "Big Pecks",
      "Overcoat"
    ],
    "hiddenAbility": "Weak Armor",
    "sprite": "mandibuzz",
    "spriteId": "mandibuzz",
    "learnset": []
  },
  {
    "id": 631,
    "name": "Heatmor",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 97,
      "def": 66,
      "spa": 105,
      "spd": 66,
      "spe": 65
    },
    "abilities": [
      "Gluttony",
      "Flash Fire"
    ],
    "hiddenAbility": "White Smoke",
    "sprite": "heatmor",
    "spriteId": "heatmor",
    "learnset": []
  },
  {
    "id": 632,
    "name": "Durant",
    "types": [
      "Bug",
      "Steel"
    ],
    "baseStats": {
      "hp": 58,
      "atk": 109,
      "def": 112,
      "spa": 48,
      "spd": 48,
      "spe": 109
    },
    "abilities": [
      "Swarm",
      "Hustle"
    ],
    "hiddenAbility": "Truant",
    "sprite": "durant",
    "spriteId": "durant",
    "learnset": []
  },
  {
    "id": 633,
    "name": "Deino",
    "types": [
      "Dark",
      "Dragon"
    ],
    "baseStats": {
      "hp": 52,
      "atk": 65,
      "def": 50,
      "spa": 45,
      "spd": 50,
      "spe": 38
    },
    "abilities": [
      "Hustle"
    ],
    "hiddenAbility": "",
    "sprite": "deino",
    "spriteId": "deino",
    "learnset": []
  },
  {
    "id": 634,
    "name": "Zweilous",
    "types": [
      "Dark",
      "Dragon"
    ],
    "baseStats": {
      "hp": 72,
      "atk": 85,
      "def": 70,
      "spa": 65,
      "spd": 70,
      "spe": 58
    },
    "abilities": [
      "Hustle"
    ],
    "hiddenAbility": "",
    "sprite": "zweilous",
    "spriteId": "zweilous",
    "learnset": []
  },
  {
    "id": 635,
    "name": "Hydreigon",
    "types": [
      "Dark",
      "Dragon"
    ],
    "baseStats": {
      "hp": 92,
      "atk": 105,
      "def": 90,
      "spa": 125,
      "spd": 90,
      "spe": 98
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "hydreigon",
    "spriteId": "hydreigon",
    "learnset": []
  },
  {
    "id": 636,
    "name": "Larvesta",
    "types": [
      "Bug",
      "Fire"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 85,
      "def": 55,
      "spa": 50,
      "spd": 55,
      "spe": 60
    },
    "abilities": [
      "Flame Body"
    ],
    "hiddenAbility": "Swarm",
    "sprite": "larvesta",
    "spriteId": "larvesta",
    "learnset": []
  },
  {
    "id": 637,
    "name": "Volcarona",
    "types": [
      "Bug",
      "Fire"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 60,
      "def": 65,
      "spa": 135,
      "spd": 105,
      "spe": 100
    },
    "abilities": [
      "Flame Body"
    ],
    "hiddenAbility": "Swarm",
    "sprite": "volcarona",
    "spriteId": "volcarona",
    "learnset": []
  },
  {
    "id": 638,
    "name": "Cobalion",
    "types": [
      "Steel",
      "Fighting"
    ],
    "baseStats": {
      "hp": 91,
      "atk": 90,
      "def": 129,
      "spa": 90,
      "spd": 72,
      "spe": 108
    },
    "abilities": [
      "Justified"
    ],
    "hiddenAbility": "",
    "sprite": "cobalion",
    "spriteId": "cobalion",
    "learnset": []
  },
  {
    "id": 639,
    "name": "Terrakion",
    "types": [
      "Rock",
      "Fighting"
    ],
    "baseStats": {
      "hp": 91,
      "atk": 129,
      "def": 90,
      "spa": 72,
      "spd": 90,
      "spe": 108
    },
    "abilities": [
      "Justified"
    ],
    "hiddenAbility": "",
    "sprite": "terrakion",
    "spriteId": "terrakion",
    "learnset": []
  },
  {
    "id": 640,
    "name": "Virizion",
    "types": [
      "Grass",
      "Fighting"
    ],
    "baseStats": {
      "hp": 91,
      "atk": 90,
      "def": 72,
      "spa": 90,
      "spd": 129,
      "spe": 108
    },
    "abilities": [
      "Justified"
    ],
    "hiddenAbility": "",
    "sprite": "virizion",
    "spriteId": "virizion",
    "learnset": []
  },
  {
    "id": 641,
    "name": "Tornadus",
    "types": [
      "Flying"
    ],
    "baseStats": {
      "hp": 79,
      "atk": 115,
      "def": 70,
      "spa": 125,
      "spd": 80,
      "spe": 111
    },
    "abilities": [
      "Prankster"
    ],
    "hiddenAbility": "Defiant",
    "sprite": "tornadus",
    "spriteId": "tornadus",
    "learnset": []
  },
  {
    "id": 641,
    "name": "Tornadus-Therian",
    "types": [
      "Flying"
    ],
    "baseStats": {
      "hp": 79,
      "atk": 100,
      "def": 80,
      "spa": 110,
      "spd": 90,
      "spe": 121
    },
    "abilities": [
      "Regenerator"
    ],
    "hiddenAbility": "",
    "sprite": "tornadustherian",
    "spriteId": "tornadus-therian",
    "learnset": []
  },
  {
    "id": 642,
    "name": "Thundurus",
    "types": [
      "Electric",
      "Flying"
    ],
    "baseStats": {
      "hp": 79,
      "atk": 115,
      "def": 70,
      "spa": 125,
      "spd": 80,
      "spe": 111
    },
    "abilities": [
      "Prankster"
    ],
    "hiddenAbility": "Defiant",
    "sprite": "thundurus",
    "spriteId": "thundurus",
    "learnset": []
  },
  {
    "id": 642,
    "name": "Thundurus-Therian",
    "types": [
      "Electric",
      "Flying"
    ],
    "baseStats": {
      "hp": 79,
      "atk": 105,
      "def": 70,
      "spa": 145,
      "spd": 80,
      "spe": 101
    },
    "abilities": [
      "Volt Absorb"
    ],
    "hiddenAbility": "",
    "sprite": "thundurustherian",
    "spriteId": "thundurus-therian",
    "learnset": []
  },
  {
    "id": 643,
    "name": "Reshiram",
    "types": [
      "Dragon",
      "Fire"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 120,
      "def": 100,
      "spa": 150,
      "spd": 120,
      "spe": 90
    },
    "abilities": [
      "Turboblaze"
    ],
    "hiddenAbility": "",
    "sprite": "reshiram",
    "spriteId": "reshiram",
    "learnset": []
  },
  {
    "id": 644,
    "name": "Zekrom",
    "types": [
      "Dragon",
      "Electric"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 150,
      "def": 120,
      "spa": 120,
      "spd": 100,
      "spe": 90
    },
    "abilities": [
      "Teravolt"
    ],
    "hiddenAbility": "",
    "sprite": "zekrom",
    "spriteId": "zekrom",
    "learnset": []
  },
  {
    "id": 645,
    "name": "Landorus",
    "types": [
      "Ground",
      "Flying"
    ],
    "baseStats": {
      "hp": 89,
      "atk": 125,
      "def": 90,
      "spa": 115,
      "spd": 80,
      "spe": 101
    },
    "abilities": [
      "Sand Force"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "landorus",
    "spriteId": "landorus",
    "learnset": []
  },
  {
    "id": 645,
    "name": "Landorus-Therian",
    "types": [
      "Ground",
      "Flying"
    ],
    "baseStats": {
      "hp": 89,
      "atk": 145,
      "def": 90,
      "spa": 105,
      "spd": 80,
      "spe": 91
    },
    "abilities": [
      "Intimidate"
    ],
    "hiddenAbility": "",
    "sprite": "landorustherian",
    "spriteId": "landorus-therian",
    "learnset": []
  },
  {
    "id": 646,
    "name": "Kyurem",
    "types": [
      "Dragon",
      "Ice"
    ],
    "baseStats": {
      "hp": 125,
      "atk": 130,
      "def": 90,
      "spa": 130,
      "spd": 90,
      "spe": 95
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "",
    "sprite": "kyurem",
    "spriteId": "kyurem",
    "learnset": []
  },
  {
    "id": 646,
    "name": "Kyurem-Black",
    "types": [
      "Dragon",
      "Ice"
    ],
    "baseStats": {
      "hp": 125,
      "atk": 170,
      "def": 100,
      "spa": 120,
      "spd": 90,
      "spe": 95
    },
    "abilities": [
      "Teravolt"
    ],
    "hiddenAbility": "",
    "sprite": "kyuremblack",
    "spriteId": "kyurem-black",
    "learnset": []
  },
  {
    "id": 646,
    "name": "Kyurem-White",
    "types": [
      "Dragon",
      "Ice"
    ],
    "baseStats": {
      "hp": 125,
      "atk": 120,
      "def": 90,
      "spa": 170,
      "spd": 100,
      "spe": 95
    },
    "abilities": [
      "Turboblaze"
    ],
    "hiddenAbility": "",
    "sprite": "kyuremwhite",
    "spriteId": "kyurem-white",
    "learnset": []
  },
  {
    "id": 647,
    "name": "Keldeo",
    "types": [
      "Water",
      "Fighting"
    ],
    "baseStats": {
      "hp": 91,
      "atk": 72,
      "def": 90,
      "spa": 129,
      "spd": 90,
      "spe": 108
    },
    "abilities": [
      "Justified"
    ],
    "hiddenAbility": "",
    "sprite": "keldeo",
    "spriteId": "keldeo",
    "learnset": []
  },
  {
    "id": 647,
    "name": "Keldeo-Resolute",
    "types": [
      "Water",
      "Fighting"
    ],
    "baseStats": {
      "hp": 91,
      "atk": 72,
      "def": 90,
      "spa": 129,
      "spd": 90,
      "spe": 108
    },
    "abilities": [
      "Justified"
    ],
    "hiddenAbility": "",
    "sprite": "keldeoresolute",
    "spriteId": "keldeo-resolute",
    "learnset": []
  },
  {
    "id": 648,
    "name": "Meloetta",
    "types": [
      "Normal",
      "Psychic"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 77,
      "def": 77,
      "spa": 128,
      "spd": 128,
      "spe": 90
    },
    "abilities": [
      "Serene Grace"
    ],
    "hiddenAbility": "",
    "sprite": "meloetta",
    "spriteId": "meloetta",
    "learnset": []
  },
  {
    "id": 648,
    "name": "Meloetta-Pirouette",
    "types": [
      "Normal",
      "Fighting"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 128,
      "def": 90,
      "spa": 77,
      "spd": 77,
      "spe": 128
    },
    "abilities": [
      "Serene Grace"
    ],
    "hiddenAbility": "",
    "sprite": "meloettapirouette",
    "spriteId": "meloetta-pirouette",
    "learnset": []
  },
  {
    "id": 649,
    "name": "Genesect",
    "types": [
      "Bug",
      "Steel"
    ],
    "baseStats": {
      "hp": 71,
      "atk": 120,
      "def": 95,
      "spa": 120,
      "spd": 95,
      "spe": 99
    },
    "abilities": [
      "Download"
    ],
    "hiddenAbility": "",
    "sprite": "genesect",
    "spriteId": "genesect",
    "learnset": []
  },
  {
    "id": 649,
    "name": "Genesect-Douse",
    "types": [
      "Bug",
      "Steel"
    ],
    "baseStats": {
      "hp": 71,
      "atk": 120,
      "def": 95,
      "spa": 120,
      "spd": 95,
      "spe": 99
    },
    "abilities": [
      "Download"
    ],
    "hiddenAbility": "",
    "sprite": "genesectdouse",
    "spriteId": "genesect-douse",
    "learnset": []
  },
  {
    "id": 649,
    "name": "Genesect-Shock",
    "types": [
      "Bug",
      "Steel"
    ],
    "baseStats": {
      "hp": 71,
      "atk": 120,
      "def": 95,
      "spa": 120,
      "spd": 95,
      "spe": 99
    },
    "abilities": [
      "Download"
    ],
    "hiddenAbility": "",
    "sprite": "genesectshock",
    "spriteId": "genesect-shock",
    "learnset": []
  },
  {
    "id": 649,
    "name": "Genesect-Burn",
    "types": [
      "Bug",
      "Steel"
    ],
    "baseStats": {
      "hp": 71,
      "atk": 120,
      "def": 95,
      "spa": 120,
      "spd": 95,
      "spe": 99
    },
    "abilities": [
      "Download"
    ],
    "hiddenAbility": "",
    "sprite": "genesectburn",
    "spriteId": "genesect-burn",
    "learnset": []
  },
  {
    "id": 649,
    "name": "Genesect-Chill",
    "types": [
      "Bug",
      "Steel"
    ],
    "baseStats": {
      "hp": 71,
      "atk": 120,
      "def": 95,
      "spa": 120,
      "spd": 95,
      "spe": 99
    },
    "abilities": [
      "Download"
    ],
    "hiddenAbility": "",
    "sprite": "genesectchill",
    "spriteId": "genesect-chill",
    "learnset": []
  },
  {
    "id": 650,
    "name": "Chespin",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 56,
      "atk": 61,
      "def": 65,
      "spa": 48,
      "spd": 45,
      "spe": 38
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Bulletproof",
    "sprite": "chespin",
    "spriteId": "chespin",
    "learnset": []
  },
  {
    "id": 651,
    "name": "Quilladin",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 61,
      "atk": 78,
      "def": 95,
      "spa": 56,
      "spd": 58,
      "spe": 57
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Bulletproof",
    "sprite": "quilladin",
    "spriteId": "quilladin",
    "learnset": []
  },
  {
    "id": 652,
    "name": "Chesnaught",
    "types": [
      "Grass",
      "Fighting"
    ],
    "baseStats": {
      "hp": 88,
      "atk": 107,
      "def": 122,
      "spa": 74,
      "spd": 75,
      "spe": 64
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Bulletproof",
    "sprite": "chesnaught",
    "spriteId": "chesnaught",
    "learnset": []
  },
  {
    "id": 652,
    "name": "Chesnaught-Mega",
    "types": [
      "Grass",
      "Fighting"
    ],
    "baseStats": {
      "hp": 88,
      "atk": 137,
      "def": 172,
      "spa": 74,
      "spd": 115,
      "spe": 44
    },
    "abilities": [
      "Bulletproof"
    ],
    "hiddenAbility": "",
    "sprite": "chesnaughtmega",
    "spriteId": "chesnaught-mega",
    "learnset": []
  },
  {
    "id": 653,
    "name": "Fennekin",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 45,
      "def": 40,
      "spa": 62,
      "spd": 60,
      "spe": 60
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Magician",
    "sprite": "fennekin",
    "spriteId": "fennekin",
    "learnset": []
  },
  {
    "id": 654,
    "name": "Braixen",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 59,
      "atk": 59,
      "def": 58,
      "spa": 90,
      "spd": 70,
      "spe": 73
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Magician",
    "sprite": "braixen",
    "spriteId": "braixen",
    "learnset": []
  },
  {
    "id": 655,
    "name": "Delphox",
    "types": [
      "Fire",
      "Psychic"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 69,
      "def": 72,
      "spa": 114,
      "spd": 100,
      "spe": 104
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Magician",
    "sprite": "delphox",
    "spriteId": "delphox",
    "learnset": []
  },
  {
    "id": 655,
    "name": "Delphox-Mega",
    "types": [
      "Fire",
      "Psychic"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 69,
      "def": 72,
      "spa": 159,
      "spd": 125,
      "spe": 134
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "delphoxmega",
    "spriteId": "delphox-mega",
    "learnset": []
  },
  {
    "id": 656,
    "name": "Froakie",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 41,
      "atk": 56,
      "def": 40,
      "spa": 62,
      "spd": 44,
      "spe": 71
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Protean",
    "sprite": "froakie",
    "spriteId": "froakie",
    "learnset": []
  },
  {
    "id": 657,
    "name": "Frogadier",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 54,
      "atk": 63,
      "def": 52,
      "spa": 83,
      "spd": 56,
      "spe": 97
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Protean",
    "sprite": "frogadier",
    "spriteId": "frogadier",
    "learnset": []
  },
  {
    "id": 658,
    "name": "Greninja",
    "types": [
      "Water",
      "Dark"
    ],
    "baseStats": {
      "hp": 72,
      "atk": 95,
      "def": 67,
      "spa": 103,
      "spd": 71,
      "spe": 122
    },
    "abilities": [
      "Torrent",
      "Battle Bond"
    ],
    "hiddenAbility": "Protean",
    "sprite": "greninja",
    "spriteId": "greninja",
    "learnset": []
  },
  {
    "id": 658,
    "name": "Greninja-Bond",
    "types": [
      "Water",
      "Dark"
    ],
    "baseStats": {
      "hp": 72,
      "atk": 95,
      "def": 67,
      "spa": 103,
      "spd": 71,
      "spe": 122
    },
    "abilities": [
      "Battle Bond"
    ],
    "hiddenAbility": "",
    "sprite": "greninjabond",
    "spriteId": "greninja-bond",
    "learnset": []
  },
  {
    "id": 658,
    "name": "Greninja-Ash",
    "types": [
      "Water",
      "Dark"
    ],
    "baseStats": {
      "hp": 72,
      "atk": 145,
      "def": 67,
      "spa": 153,
      "spd": 71,
      "spe": 132
    },
    "abilities": [
      "Battle Bond"
    ],
    "hiddenAbility": "",
    "sprite": "greninjaash",
    "spriteId": "greninja-ash",
    "learnset": []
  },
  {
    "id": 658,
    "name": "Greninja-Mega",
    "types": [
      "Water",
      "Dark"
    ],
    "baseStats": {
      "hp": 72,
      "atk": 125,
      "def": 77,
      "spa": 133,
      "spd": 81,
      "spe": 142
    },
    "abilities": [
      "Protean"
    ],
    "hiddenAbility": "",
    "sprite": "greninjamega",
    "spriteId": "greninja-mega",
    "learnset": []
  },
  {
    "id": 659,
    "name": "Bunnelby",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 38,
      "atk": 36,
      "def": 38,
      "spa": 32,
      "spd": 36,
      "spe": 57
    },
    "abilities": [
      "Pickup",
      "Cheek Pouch"
    ],
    "hiddenAbility": "Huge Power",
    "sprite": "bunnelby",
    "spriteId": "bunnelby",
    "learnset": []
  },
  {
    "id": 660,
    "name": "Diggersby",
    "types": [
      "Normal",
      "Ground"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 56,
      "def": 77,
      "spa": 50,
      "spd": 77,
      "spe": 78
    },
    "abilities": [
      "Pickup",
      "Cheek Pouch"
    ],
    "hiddenAbility": "Huge Power",
    "sprite": "diggersby",
    "spriteId": "diggersby",
    "learnset": []
  },
  {
    "id": 661,
    "name": "Fletchling",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 50,
      "def": 43,
      "spa": 40,
      "spd": 38,
      "spe": 62
    },
    "abilities": [
      "Big Pecks"
    ],
    "hiddenAbility": "Gale Wings",
    "sprite": "fletchling",
    "spriteId": "fletchling",
    "learnset": []
  },
  {
    "id": 662,
    "name": "Fletchinder",
    "types": [
      "Fire",
      "Flying"
    ],
    "baseStats": {
      "hp": 62,
      "atk": 73,
      "def": 55,
      "spa": 56,
      "spd": 52,
      "spe": 84
    },
    "abilities": [
      "Flame Body"
    ],
    "hiddenAbility": "Gale Wings",
    "sprite": "fletchinder",
    "spriteId": "fletchinder",
    "learnset": []
  },
  {
    "id": 663,
    "name": "Talonflame",
    "types": [
      "Fire",
      "Flying"
    ],
    "baseStats": {
      "hp": 78,
      "atk": 81,
      "def": 71,
      "spa": 74,
      "spd": 69,
      "spe": 126
    },
    "abilities": [
      "Flame Body"
    ],
    "hiddenAbility": "Gale Wings",
    "sprite": "talonflame",
    "spriteId": "talonflame",
    "learnset": []
  },
  {
    "id": 664,
    "name": "Scatterbug",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 38,
      "atk": 35,
      "def": 40,
      "spa": 27,
      "spd": 25,
      "spe": 35
    },
    "abilities": [
      "Shield Dust",
      "Compound Eyes"
    ],
    "hiddenAbility": "Friend Guard",
    "sprite": "scatterbug",
    "spriteId": "scatterbug",
    "learnset": []
  },
  {
    "id": 665,
    "name": "Spewpa",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 22,
      "def": 60,
      "spa": 27,
      "spd": 30,
      "spe": 29
    },
    "abilities": [
      "Shed Skin"
    ],
    "hiddenAbility": "Friend Guard",
    "sprite": "spewpa",
    "spriteId": "spewpa",
    "learnset": []
  },
  {
    "id": 666,
    "name": "Vivillon",
    "types": [
      "Bug",
      "Flying"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 52,
      "def": 50,
      "spa": 90,
      "spd": 50,
      "spe": 89
    },
    "abilities": [
      "Shield Dust",
      "Compound Eyes"
    ],
    "hiddenAbility": "Friend Guard",
    "sprite": "vivillon",
    "spriteId": "vivillon",
    "learnset": []
  },
  {
    "id": 666,
    "name": "Vivillon-Fancy",
    "types": [
      "Bug",
      "Flying"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 52,
      "def": 50,
      "spa": 90,
      "spd": 50,
      "spe": 89
    },
    "abilities": [
      "Shield Dust",
      "Compound Eyes"
    ],
    "hiddenAbility": "Friend Guard",
    "sprite": "vivillonfancy",
    "spriteId": "vivillon-fancy",
    "learnset": []
  },
  {
    "id": 666,
    "name": "Vivillon-Pokeball",
    "types": [
      "Bug",
      "Flying"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 52,
      "def": 50,
      "spa": 90,
      "spd": 50,
      "spe": 89
    },
    "abilities": [
      "Shield Dust",
      "Compound Eyes"
    ],
    "hiddenAbility": "Friend Guard",
    "sprite": "vivillonpokeball",
    "spriteId": "vivillon-pokeball",
    "learnset": []
  },
  {
    "id": 667,
    "name": "Litleo",
    "types": [
      "Fire",
      "Normal"
    ],
    "baseStats": {
      "hp": 62,
      "atk": 50,
      "def": 58,
      "spa": 73,
      "spd": 54,
      "spe": 72
    },
    "abilities": [
      "Rivalry",
      "Unnerve"
    ],
    "hiddenAbility": "Moxie",
    "sprite": "litleo",
    "spriteId": "litleo",
    "learnset": []
  },
  {
    "id": 668,
    "name": "Pyroar",
    "types": [
      "Fire",
      "Normal"
    ],
    "baseStats": {
      "hp": 86,
      "atk": 68,
      "def": 72,
      "spa": 109,
      "spd": 66,
      "spe": 106
    },
    "abilities": [
      "Rivalry",
      "Unnerve"
    ],
    "hiddenAbility": "Moxie",
    "sprite": "pyroar",
    "spriteId": "pyroar",
    "learnset": []
  },
  {
    "id": 668,
    "name": "Pyroar-Mega",
    "types": [
      "Fire",
      "Normal"
    ],
    "baseStats": {
      "hp": 86,
      "atk": 88,
      "def": 92,
      "spa": 129,
      "spd": 86,
      "spe": 126
    },
    "abilities": [
      "Fire Mane"
    ],
    "hiddenAbility": "",
    "sprite": "pyroarmega",
    "spriteId": "pyroar-mega",
    "learnset": []
  },
  {
    "id": 669,
    "name": "Flabébé",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 44,
      "atk": 38,
      "def": 39,
      "spa": 61,
      "spd": 79,
      "spe": 42
    },
    "abilities": [
      "Flower Veil"
    ],
    "hiddenAbility": "Symbiosis",
    "sprite": "flabebe",
    "spriteId": "flabebe",
    "learnset": []
  },
  {
    "id": 670,
    "name": "Floette",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 54,
      "atk": 45,
      "def": 47,
      "spa": 75,
      "spd": 98,
      "spe": 52
    },
    "abilities": [
      "Flower Veil"
    ],
    "hiddenAbility": "Symbiosis",
    "sprite": "floette",
    "spriteId": "floette",
    "learnset": []
  },
  {
    "id": 670,
    "name": "Floette-Eternal",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 74,
      "atk": 65,
      "def": 67,
      "spa": 125,
      "spd": 128,
      "spe": 92
    },
    "abilities": [
      "Flower Veil"
    ],
    "hiddenAbility": "Symbiosis",
    "sprite": "floetteeternal",
    "spriteId": "floette-eternal",
    "learnset": []
  },
  {
    "id": 670,
    "name": "Floette-Mega",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 74,
      "atk": 85,
      "def": 87,
      "spa": 155,
      "spd": 148,
      "spe": 102
    },
    "abilities": [
      "Fairy Aura"
    ],
    "hiddenAbility": "",
    "sprite": "floettemega",
    "spriteId": "floette-mega",
    "learnset": []
  },
  {
    "id": 671,
    "name": "Florges",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 78,
      "atk": 65,
      "def": 68,
      "spa": 112,
      "spd": 154,
      "spe": 75
    },
    "abilities": [
      "Flower Veil"
    ],
    "hiddenAbility": "Symbiosis",
    "sprite": "florges",
    "spriteId": "florges",
    "learnset": []
  },
  {
    "id": 672,
    "name": "Skiddo",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 66,
      "atk": 65,
      "def": 48,
      "spa": 62,
      "spd": 57,
      "spe": 52
    },
    "abilities": [
      "Sap Sipper"
    ],
    "hiddenAbility": "Grass Pelt",
    "sprite": "skiddo",
    "spriteId": "skiddo",
    "learnset": []
  },
  {
    "id": 673,
    "name": "Gogoat",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 123,
      "atk": 100,
      "def": 62,
      "spa": 97,
      "spd": 81,
      "spe": 68
    },
    "abilities": [
      "Sap Sipper"
    ],
    "hiddenAbility": "Grass Pelt",
    "sprite": "gogoat",
    "spriteId": "gogoat",
    "learnset": []
  },
  {
    "id": 674,
    "name": "Pancham",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 67,
      "atk": 82,
      "def": 62,
      "spa": 46,
      "spd": 48,
      "spe": 43
    },
    "abilities": [
      "Iron Fist",
      "Mold Breaker"
    ],
    "hiddenAbility": "Scrappy",
    "sprite": "pancham",
    "spriteId": "pancham",
    "learnset": []
  },
  {
    "id": 675,
    "name": "Pangoro",
    "types": [
      "Fighting",
      "Dark"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 124,
      "def": 78,
      "spa": 69,
      "spd": 71,
      "spe": 58
    },
    "abilities": [
      "Iron Fist",
      "Mold Breaker"
    ],
    "hiddenAbility": "Scrappy",
    "sprite": "pangoro",
    "spriteId": "pangoro",
    "learnset": []
  },
  {
    "id": 676,
    "name": "Furfrou",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 80,
      "def": 60,
      "spa": 65,
      "spd": 90,
      "spe": 102
    },
    "abilities": [
      "Fur Coat"
    ],
    "hiddenAbility": "",
    "sprite": "furfrou",
    "spriteId": "furfrou",
    "learnset": []
  },
  {
    "id": 677,
    "name": "Espurr",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 62,
      "atk": 48,
      "def": 54,
      "spa": 63,
      "spd": 60,
      "spe": 68
    },
    "abilities": [
      "Keen Eye",
      "Infiltrator"
    ],
    "hiddenAbility": "Own Tempo",
    "sprite": "espurr",
    "spriteId": "espurr",
    "learnset": []
  },
  {
    "id": 678,
    "name": "Meowstic",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 74,
      "atk": 48,
      "def": 76,
      "spa": 83,
      "spd": 81,
      "spe": 104
    },
    "abilities": [
      "Keen Eye",
      "Infiltrator"
    ],
    "hiddenAbility": "Prankster",
    "sprite": "meowstic",
    "spriteId": "meowstic",
    "learnset": []
  },
  {
    "id": 678,
    "name": "Meowstic-F",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 74,
      "atk": 48,
      "def": 76,
      "spa": 83,
      "spd": 81,
      "spe": 104
    },
    "abilities": [
      "Keen Eye",
      "Infiltrator"
    ],
    "hiddenAbility": "Competitive",
    "sprite": "meowsticf",
    "spriteId": "meowstic-f",
    "learnset": []
  },
  {
    "id": 678,
    "name": "Meowstic-M-Mega",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 74,
      "atk": 48,
      "def": 76,
      "spa": 143,
      "spd": 101,
      "spe": 124
    },
    "abilities": [
      "Trace"
    ],
    "hiddenAbility": "",
    "sprite": "meowsticmmega",
    "spriteId": "meowstic-mmega",
    "learnset": []
  },
  {
    "id": 678,
    "name": "Meowstic-F-Mega",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 74,
      "atk": 48,
      "def": 76,
      "spa": 143,
      "spd": 101,
      "spe": 124
    },
    "abilities": [
      "Trace"
    ],
    "hiddenAbility": "",
    "sprite": "meowsticfmega",
    "spriteId": "meowstic-fmega",
    "learnset": []
  },
  {
    "id": 679,
    "name": "Honedge",
    "types": [
      "Steel",
      "Ghost"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 80,
      "def": 100,
      "spa": 35,
      "spd": 37,
      "spe": 28
    },
    "abilities": [
      "No Guard"
    ],
    "hiddenAbility": "",
    "sprite": "honedge",
    "spriteId": "honedge",
    "learnset": []
  },
  {
    "id": 680,
    "name": "Doublade",
    "types": [
      "Steel",
      "Ghost"
    ],
    "baseStats": {
      "hp": 59,
      "atk": 110,
      "def": 150,
      "spa": 45,
      "spd": 49,
      "spe": 35
    },
    "abilities": [
      "No Guard"
    ],
    "hiddenAbility": "",
    "sprite": "doublade",
    "spriteId": "doublade",
    "learnset": []
  },
  {
    "id": 681,
    "name": "Aegislash",
    "types": [
      "Steel",
      "Ghost"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 50,
      "def": 140,
      "spa": 50,
      "spd": 140,
      "spe": 60
    },
    "abilities": [
      "Stance Change"
    ],
    "hiddenAbility": "",
    "sprite": "aegislash",
    "spriteId": "aegislash",
    "learnset": []
  },
  {
    "id": 681,
    "name": "Aegislash-Blade",
    "types": [
      "Steel",
      "Ghost"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 140,
      "def": 50,
      "spa": 140,
      "spd": 50,
      "spe": 60
    },
    "abilities": [
      "Stance Change"
    ],
    "hiddenAbility": "",
    "sprite": "aegislashblade",
    "spriteId": "aegislash-blade",
    "learnset": []
  },
  {
    "id": 682,
    "name": "Spritzee",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 78,
      "atk": 52,
      "def": 60,
      "spa": 63,
      "spd": 65,
      "spe": 23
    },
    "abilities": [
      "Healer"
    ],
    "hiddenAbility": "Aroma Veil",
    "sprite": "spritzee",
    "spriteId": "spritzee",
    "learnset": []
  },
  {
    "id": 683,
    "name": "Aromatisse",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 101,
      "atk": 72,
      "def": 72,
      "spa": 99,
      "spd": 89,
      "spe": 29
    },
    "abilities": [
      "Healer"
    ],
    "hiddenAbility": "Aroma Veil",
    "sprite": "aromatisse",
    "spriteId": "aromatisse",
    "learnset": []
  },
  {
    "id": 684,
    "name": "Swirlix",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 62,
      "atk": 48,
      "def": 66,
      "spa": 59,
      "spd": 57,
      "spe": 49
    },
    "abilities": [
      "Sweet Veil"
    ],
    "hiddenAbility": "Unburden",
    "sprite": "swirlix",
    "spriteId": "swirlix",
    "learnset": []
  },
  {
    "id": 685,
    "name": "Slurpuff",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 82,
      "atk": 80,
      "def": 86,
      "spa": 85,
      "spd": 75,
      "spe": 72
    },
    "abilities": [
      "Sweet Veil"
    ],
    "hiddenAbility": "Unburden",
    "sprite": "slurpuff",
    "spriteId": "slurpuff",
    "learnset": []
  },
  {
    "id": 686,
    "name": "Inkay",
    "types": [
      "Dark",
      "Psychic"
    ],
    "baseStats": {
      "hp": 53,
      "atk": 54,
      "def": 53,
      "spa": 37,
      "spd": 46,
      "spe": 45
    },
    "abilities": [
      "Contrary",
      "Suction Cups"
    ],
    "hiddenAbility": "Infiltrator",
    "sprite": "inkay",
    "spriteId": "inkay",
    "learnset": []
  },
  {
    "id": 687,
    "name": "Malamar",
    "types": [
      "Dark",
      "Psychic"
    ],
    "baseStats": {
      "hp": 86,
      "atk": 92,
      "def": 88,
      "spa": 68,
      "spd": 75,
      "spe": 73
    },
    "abilities": [
      "Contrary",
      "Suction Cups"
    ],
    "hiddenAbility": "Infiltrator",
    "sprite": "malamar",
    "spriteId": "malamar",
    "learnset": []
  },
  {
    "id": 687,
    "name": "Malamar-Mega",
    "types": [
      "Dark",
      "Psychic"
    ],
    "baseStats": {
      "hp": 86,
      "atk": 102,
      "def": 88,
      "spa": 98,
      "spd": 120,
      "spe": 88
    },
    "abilities": [
      "Contrary"
    ],
    "hiddenAbility": "",
    "sprite": "malamarmega",
    "spriteId": "malamar-mega",
    "learnset": []
  },
  {
    "id": 688,
    "name": "Binacle",
    "types": [
      "Rock",
      "Water"
    ],
    "baseStats": {
      "hp": 42,
      "atk": 52,
      "def": 67,
      "spa": 39,
      "spd": 56,
      "spe": 50
    },
    "abilities": [
      "Tough Claws",
      "Sniper"
    ],
    "hiddenAbility": "Pickpocket",
    "sprite": "binacle",
    "spriteId": "binacle",
    "learnset": []
  },
  {
    "id": 689,
    "name": "Barbaracle",
    "types": [
      "Rock",
      "Water"
    ],
    "baseStats": {
      "hp": 72,
      "atk": 105,
      "def": 115,
      "spa": 54,
      "spd": 86,
      "spe": 68
    },
    "abilities": [
      "Tough Claws",
      "Sniper"
    ],
    "hiddenAbility": "Pickpocket",
    "sprite": "barbaracle",
    "spriteId": "barbaracle",
    "learnset": []
  },
  {
    "id": 689,
    "name": "Barbaracle-Mega",
    "types": [
      "Rock",
      "Fighting"
    ],
    "baseStats": {
      "hp": 72,
      "atk": 140,
      "def": 130,
      "spa": 64,
      "spd": 106,
      "spe": 88
    },
    "abilities": [
      "Tough Claws"
    ],
    "hiddenAbility": "",
    "sprite": "barbaraclemega",
    "spriteId": "barbaracle-mega",
    "learnset": []
  },
  {
    "id": 690,
    "name": "Skrelp",
    "types": [
      "Poison",
      "Water"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 60,
      "def": 60,
      "spa": 60,
      "spd": 60,
      "spe": 30
    },
    "abilities": [
      "Poison Point",
      "Poison Touch"
    ],
    "hiddenAbility": "Adaptability",
    "sprite": "skrelp",
    "spriteId": "skrelp",
    "learnset": []
  },
  {
    "id": 691,
    "name": "Dragalge",
    "types": [
      "Poison",
      "Dragon"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 75,
      "def": 90,
      "spa": 97,
      "spd": 123,
      "spe": 44
    },
    "abilities": [
      "Poison Point",
      "Poison Touch"
    ],
    "hiddenAbility": "Adaptability",
    "sprite": "dragalge",
    "spriteId": "dragalge",
    "learnset": []
  },
  {
    "id": 691,
    "name": "Dragalge-Mega",
    "types": [
      "Poison",
      "Dragon"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 85,
      "def": 105,
      "spa": 132,
      "spd": 163,
      "spe": 44
    },
    "abilities": [
      "Regenerator"
    ],
    "hiddenAbility": "",
    "sprite": "dragalgemega",
    "spriteId": "dragalge-mega",
    "learnset": []
  },
  {
    "id": 692,
    "name": "Clauncher",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 53,
      "def": 62,
      "spa": 58,
      "spd": 63,
      "spe": 44
    },
    "abilities": [
      "Mega Launcher"
    ],
    "hiddenAbility": "",
    "sprite": "clauncher",
    "spriteId": "clauncher",
    "learnset": []
  },
  {
    "id": 693,
    "name": "Clawitzer",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 71,
      "atk": 73,
      "def": 88,
      "spa": 120,
      "spd": 89,
      "spe": 59
    },
    "abilities": [
      "Mega Launcher"
    ],
    "hiddenAbility": "",
    "sprite": "clawitzer",
    "spriteId": "clawitzer",
    "learnset": []
  },
  {
    "id": 694,
    "name": "Helioptile",
    "types": [
      "Electric",
      "Normal"
    ],
    "baseStats": {
      "hp": 44,
      "atk": 38,
      "def": 33,
      "spa": 61,
      "spd": 43,
      "spe": 70
    },
    "abilities": [
      "Dry Skin",
      "Sand Veil"
    ],
    "hiddenAbility": "Solar Power",
    "sprite": "helioptile",
    "spriteId": "helioptile",
    "learnset": []
  },
  {
    "id": 695,
    "name": "Heliolisk",
    "types": [
      "Electric",
      "Normal"
    ],
    "baseStats": {
      "hp": 62,
      "atk": 55,
      "def": 52,
      "spa": 109,
      "spd": 94,
      "spe": 109
    },
    "abilities": [
      "Dry Skin",
      "Sand Veil"
    ],
    "hiddenAbility": "Solar Power",
    "sprite": "heliolisk",
    "spriteId": "heliolisk",
    "learnset": []
  },
  {
    "id": 696,
    "name": "Tyrunt",
    "types": [
      "Rock",
      "Dragon"
    ],
    "baseStats": {
      "hp": 58,
      "atk": 89,
      "def": 77,
      "spa": 45,
      "spd": 45,
      "spe": 48
    },
    "abilities": [
      "Strong Jaw"
    ],
    "hiddenAbility": "Sturdy",
    "sprite": "tyrunt",
    "spriteId": "tyrunt",
    "learnset": []
  },
  {
    "id": 697,
    "name": "Tyrantrum",
    "types": [
      "Rock",
      "Dragon"
    ],
    "baseStats": {
      "hp": 82,
      "atk": 121,
      "def": 119,
      "spa": 69,
      "spd": 59,
      "spe": 71
    },
    "abilities": [
      "Strong Jaw"
    ],
    "hiddenAbility": "Rock Head",
    "sprite": "tyrantrum",
    "spriteId": "tyrantrum",
    "learnset": []
  },
  {
    "id": 698,
    "name": "Amaura",
    "types": [
      "Rock",
      "Ice"
    ],
    "baseStats": {
      "hp": 77,
      "atk": 59,
      "def": 50,
      "spa": 67,
      "spd": 63,
      "spe": 46
    },
    "abilities": [
      "Refrigerate"
    ],
    "hiddenAbility": "Snow Warning",
    "sprite": "amaura",
    "spriteId": "amaura",
    "learnset": []
  },
  {
    "id": 699,
    "name": "Aurorus",
    "types": [
      "Rock",
      "Ice"
    ],
    "baseStats": {
      "hp": 123,
      "atk": 77,
      "def": 72,
      "spa": 99,
      "spd": 92,
      "spe": 58
    },
    "abilities": [
      "Refrigerate"
    ],
    "hiddenAbility": "Snow Warning",
    "sprite": "aurorus",
    "spriteId": "aurorus",
    "learnset": []
  },
  {
    "id": 700,
    "name": "Sylveon",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 65,
      "def": 65,
      "spa": 110,
      "spd": 130,
      "spe": 60
    },
    "abilities": [
      "Cute Charm"
    ],
    "hiddenAbility": "Pixilate",
    "sprite": "sylveon",
    "spriteId": "sylveon",
    "learnset": []
  },
  {
    "id": 701,
    "name": "Hawlucha",
    "types": [
      "Fighting",
      "Flying"
    ],
    "baseStats": {
      "hp": 78,
      "atk": 92,
      "def": 75,
      "spa": 74,
      "spd": 63,
      "spe": 118
    },
    "abilities": [
      "Limber",
      "Unburden"
    ],
    "hiddenAbility": "Mold Breaker",
    "sprite": "hawlucha",
    "spriteId": "hawlucha",
    "learnset": []
  },
  {
    "id": 701,
    "name": "Hawlucha-Mega",
    "types": [
      "Fighting",
      "Flying"
    ],
    "baseStats": {
      "hp": 78,
      "atk": 137,
      "def": 100,
      "spa": 74,
      "spd": 93,
      "spe": 118
    },
    "abilities": [
      "No Guard"
    ],
    "hiddenAbility": "",
    "sprite": "hawluchamega",
    "spriteId": "hawlucha-mega",
    "learnset": []
  },
  {
    "id": 702,
    "name": "Dedenne",
    "types": [
      "Electric",
      "Fairy"
    ],
    "baseStats": {
      "hp": 67,
      "atk": 58,
      "def": 57,
      "spa": 81,
      "spd": 67,
      "spe": 101
    },
    "abilities": [
      "Cheek Pouch",
      "Pickup"
    ],
    "hiddenAbility": "Plus",
    "sprite": "dedenne",
    "spriteId": "dedenne",
    "learnset": []
  },
  {
    "id": 703,
    "name": "Carbink",
    "types": [
      "Rock",
      "Fairy"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 50,
      "def": 150,
      "spa": 50,
      "spd": 150,
      "spe": 50
    },
    "abilities": [
      "Clear Body"
    ],
    "hiddenAbility": "Sturdy",
    "sprite": "carbink",
    "spriteId": "carbink",
    "learnset": []
  },
  {
    "id": 704,
    "name": "Goomy",
    "types": [
      "Dragon"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 50,
      "def": 35,
      "spa": 55,
      "spd": 75,
      "spe": 40
    },
    "abilities": [
      "Sap Sipper",
      "Hydration"
    ],
    "hiddenAbility": "Gooey",
    "sprite": "goomy",
    "spriteId": "goomy",
    "learnset": []
  },
  {
    "id": 705,
    "name": "Sliggoo",
    "types": [
      "Dragon"
    ],
    "baseStats": {
      "hp": 68,
      "atk": 75,
      "def": 53,
      "spa": 83,
      "spd": 113,
      "spe": 60
    },
    "abilities": [
      "Sap Sipper",
      "Hydration"
    ],
    "hiddenAbility": "Gooey",
    "sprite": "sliggoo",
    "spriteId": "sliggoo",
    "learnset": []
  },
  {
    "id": 705,
    "name": "Sliggoo-Hisui",
    "types": [
      "Steel",
      "Dragon"
    ],
    "baseStats": {
      "hp": 58,
      "atk": 75,
      "def": 83,
      "spa": 83,
      "spd": 113,
      "spe": 40
    },
    "abilities": [
      "Sap Sipper",
      "Shell Armor"
    ],
    "hiddenAbility": "Gooey",
    "sprite": "sliggoohisui",
    "spriteId": "sliggoo-hisui",
    "learnset": []
  },
  {
    "id": 706,
    "name": "Goodra",
    "types": [
      "Dragon"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 100,
      "def": 70,
      "spa": 110,
      "spd": 150,
      "spe": 80
    },
    "abilities": [
      "Sap Sipper",
      "Hydration"
    ],
    "hiddenAbility": "Gooey",
    "sprite": "goodra",
    "spriteId": "goodra",
    "learnset": []
  },
  {
    "id": 706,
    "name": "Goodra-Hisui",
    "types": [
      "Steel",
      "Dragon"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 100,
      "def": 100,
      "spa": 110,
      "spd": 150,
      "spe": 60
    },
    "abilities": [
      "Sap Sipper",
      "Shell Armor"
    ],
    "hiddenAbility": "Gooey",
    "sprite": "goodrahisui",
    "spriteId": "goodra-hisui",
    "learnset": []
  },
  {
    "id": 707,
    "name": "Klefki",
    "types": [
      "Steel",
      "Fairy"
    ],
    "baseStats": {
      "hp": 57,
      "atk": 80,
      "def": 91,
      "spa": 80,
      "spd": 87,
      "spe": 75
    },
    "abilities": [
      "Prankster"
    ],
    "hiddenAbility": "Magician",
    "sprite": "klefki",
    "spriteId": "klefki",
    "learnset": []
  },
  {
    "id": 708,
    "name": "Phantump",
    "types": [
      "Ghost",
      "Grass"
    ],
    "baseStats": {
      "hp": 43,
      "atk": 70,
      "def": 48,
      "spa": 50,
      "spd": 60,
      "spe": 38
    },
    "abilities": [
      "Natural Cure",
      "Frisk"
    ],
    "hiddenAbility": "Harvest",
    "sprite": "phantump",
    "spriteId": "phantump",
    "learnset": []
  },
  {
    "id": 709,
    "name": "Trevenant",
    "types": [
      "Ghost",
      "Grass"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 110,
      "def": 76,
      "spa": 65,
      "spd": 82,
      "spe": 56
    },
    "abilities": [
      "Natural Cure",
      "Frisk"
    ],
    "hiddenAbility": "Harvest",
    "sprite": "trevenant",
    "spriteId": "trevenant",
    "learnset": []
  },
  {
    "id": 710,
    "name": "Pumpkaboo",
    "types": [
      "Ghost",
      "Grass"
    ],
    "baseStats": {
      "hp": 49,
      "atk": 66,
      "def": 70,
      "spa": 44,
      "spd": 55,
      "spe": 51
    },
    "abilities": [
      "Pickup",
      "Frisk"
    ],
    "hiddenAbility": "Insomnia",
    "sprite": "pumpkaboo",
    "spriteId": "pumpkaboo",
    "learnset": []
  },
  {
    "id": 710,
    "name": "Pumpkaboo-Small",
    "types": [
      "Ghost",
      "Grass"
    ],
    "baseStats": {
      "hp": 44,
      "atk": 66,
      "def": 70,
      "spa": 44,
      "spd": 55,
      "spe": 56
    },
    "abilities": [
      "Pickup",
      "Frisk"
    ],
    "hiddenAbility": "Insomnia",
    "sprite": "pumpkaboosmall",
    "spriteId": "pumpkaboo-small",
    "learnset": []
  },
  {
    "id": 710,
    "name": "Pumpkaboo-Large",
    "types": [
      "Ghost",
      "Grass"
    ],
    "baseStats": {
      "hp": 54,
      "atk": 66,
      "def": 70,
      "spa": 44,
      "spd": 55,
      "spe": 46
    },
    "abilities": [
      "Pickup",
      "Frisk"
    ],
    "hiddenAbility": "Insomnia",
    "sprite": "pumpkaboolarge",
    "spriteId": "pumpkaboo-large",
    "learnset": []
  },
  {
    "id": 710,
    "name": "Pumpkaboo-Super",
    "types": [
      "Ghost",
      "Grass"
    ],
    "baseStats": {
      "hp": 59,
      "atk": 66,
      "def": 70,
      "spa": 44,
      "spd": 55,
      "spe": 41
    },
    "abilities": [
      "Pickup",
      "Frisk"
    ],
    "hiddenAbility": "Insomnia",
    "sprite": "pumpkaboosuper",
    "spriteId": "pumpkaboo-super",
    "learnset": []
  },
  {
    "id": 711,
    "name": "Gourgeist",
    "types": [
      "Ghost",
      "Grass"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 90,
      "def": 122,
      "spa": 58,
      "spd": 75,
      "spe": 84
    },
    "abilities": [
      "Pickup",
      "Frisk"
    ],
    "hiddenAbility": "Insomnia",
    "sprite": "gourgeist",
    "spriteId": "gourgeist",
    "learnset": []
  },
  {
    "id": 711,
    "name": "Gourgeist-Small",
    "types": [
      "Ghost",
      "Grass"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 85,
      "def": 122,
      "spa": 58,
      "spd": 75,
      "spe": 99
    },
    "abilities": [
      "Pickup",
      "Frisk"
    ],
    "hiddenAbility": "Insomnia",
    "sprite": "gourgeistsmall",
    "spriteId": "gourgeist-small",
    "learnset": []
  },
  {
    "id": 711,
    "name": "Gourgeist-Large",
    "types": [
      "Ghost",
      "Grass"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 95,
      "def": 122,
      "spa": 58,
      "spd": 75,
      "spe": 69
    },
    "abilities": [
      "Pickup",
      "Frisk"
    ],
    "hiddenAbility": "Insomnia",
    "sprite": "gourgeistlarge",
    "spriteId": "gourgeist-large",
    "learnset": []
  },
  {
    "id": 711,
    "name": "Gourgeist-Super",
    "types": [
      "Ghost",
      "Grass"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 100,
      "def": 122,
      "spa": 58,
      "spd": 75,
      "spe": 54
    },
    "abilities": [
      "Pickup",
      "Frisk"
    ],
    "hiddenAbility": "Insomnia",
    "sprite": "gourgeistsuper",
    "spriteId": "gourgeist-super",
    "learnset": []
  },
  {
    "id": 712,
    "name": "Bergmite",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 69,
      "def": 85,
      "spa": 32,
      "spd": 35,
      "spe": 28
    },
    "abilities": [
      "Own Tempo",
      "Ice Body"
    ],
    "hiddenAbility": "Sturdy",
    "sprite": "bergmite",
    "spriteId": "bergmite",
    "learnset": []
  },
  {
    "id": 713,
    "name": "Avalugg",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 117,
      "def": 184,
      "spa": 44,
      "spd": 46,
      "spe": 28
    },
    "abilities": [
      "Own Tempo",
      "Ice Body"
    ],
    "hiddenAbility": "Sturdy",
    "sprite": "avalugg",
    "spriteId": "avalugg",
    "learnset": []
  },
  {
    "id": 713,
    "name": "Avalugg-Hisui",
    "types": [
      "Ice",
      "Rock"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 127,
      "def": 184,
      "spa": 34,
      "spd": 36,
      "spe": 38
    },
    "abilities": [
      "Strong Jaw",
      "Ice Body"
    ],
    "hiddenAbility": "Sturdy",
    "sprite": "avalugghisui",
    "spriteId": "avalugg-hisui",
    "learnset": []
  },
  {
    "id": 714,
    "name": "Noibat",
    "types": [
      "Flying",
      "Dragon"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 30,
      "def": 35,
      "spa": 45,
      "spd": 40,
      "spe": 55
    },
    "abilities": [
      "Frisk",
      "Infiltrator"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "noibat",
    "spriteId": "noibat",
    "learnset": []
  },
  {
    "id": 715,
    "name": "Noivern",
    "types": [
      "Flying",
      "Dragon"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 70,
      "def": 80,
      "spa": 97,
      "spd": 80,
      "spe": 123
    },
    "abilities": [
      "Frisk",
      "Infiltrator"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "noivern",
    "spriteId": "noivern",
    "learnset": []
  },
  {
    "id": 716,
    "name": "Xerneas",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 126,
      "atk": 131,
      "def": 95,
      "spa": 131,
      "spd": 98,
      "spe": 99
    },
    "abilities": [
      "Fairy Aura"
    ],
    "hiddenAbility": "",
    "sprite": "xerneas",
    "spriteId": "xerneas",
    "learnset": []
  },
  {
    "id": 716,
    "name": "Xerneas-Neutral",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 126,
      "atk": 131,
      "def": 95,
      "spa": 131,
      "spd": 98,
      "spe": 99
    },
    "abilities": [
      "Fairy Aura"
    ],
    "hiddenAbility": "",
    "sprite": "xerneasneutral",
    "spriteId": "xerneas-neutral",
    "learnset": []
  },
  {
    "id": 717,
    "name": "Yveltal",
    "types": [
      "Dark",
      "Flying"
    ],
    "baseStats": {
      "hp": 126,
      "atk": 131,
      "def": 95,
      "spa": 131,
      "spd": 98,
      "spe": 99
    },
    "abilities": [
      "Dark Aura"
    ],
    "hiddenAbility": "",
    "sprite": "yveltal",
    "spriteId": "yveltal",
    "learnset": []
  },
  {
    "id": 718,
    "name": "Zygarde",
    "types": [
      "Dragon",
      "Ground"
    ],
    "baseStats": {
      "hp": 108,
      "atk": 100,
      "def": 121,
      "spa": 81,
      "spd": 95,
      "spe": 95
    },
    "abilities": [
      "Aura Break",
      "Power Construct"
    ],
    "hiddenAbility": "",
    "sprite": "zygarde",
    "spriteId": "zygarde",
    "learnset": []
  },
  {
    "id": 718,
    "name": "Zygarde-10%",
    "types": [
      "Dragon",
      "Ground"
    ],
    "baseStats": {
      "hp": 54,
      "atk": 100,
      "def": 71,
      "spa": 61,
      "spd": 85,
      "spe": 115
    },
    "abilities": [
      "Aura Break",
      "Power Construct"
    ],
    "hiddenAbility": "",
    "sprite": "zygarde10",
    "spriteId": "zygarde-10",
    "learnset": []
  },
  {
    "id": 718,
    "name": "Zygarde-Complete",
    "types": [
      "Dragon",
      "Ground"
    ],
    "baseStats": {
      "hp": 216,
      "atk": 100,
      "def": 121,
      "spa": 91,
      "spd": 95,
      "spe": 85
    },
    "abilities": [
      "Power Construct"
    ],
    "hiddenAbility": "",
    "sprite": "zygardecomplete",
    "spriteId": "zygarde-complete",
    "learnset": []
  },
  {
    "id": 718,
    "name": "Zygarde-Mega",
    "types": [
      "Dragon",
      "Ground"
    ],
    "baseStats": {
      "hp": 216,
      "atk": 70,
      "def": 91,
      "spa": 216,
      "spd": 85,
      "spe": 100
    },
    "abilities": [
      "Aura Break"
    ],
    "hiddenAbility": "",
    "sprite": "zygardemega",
    "spriteId": "zygarde-mega",
    "learnset": []
  },
  {
    "id": 719,
    "name": "Diancie",
    "types": [
      "Rock",
      "Fairy"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 100,
      "def": 150,
      "spa": 100,
      "spd": 150,
      "spe": 50
    },
    "abilities": [
      "Clear Body"
    ],
    "hiddenAbility": "",
    "sprite": "diancie",
    "spriteId": "diancie",
    "learnset": []
  },
  {
    "id": 719,
    "name": "Diancie-Mega",
    "types": [
      "Rock",
      "Fairy"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 160,
      "def": 110,
      "spa": 160,
      "spd": 110,
      "spe": 110
    },
    "abilities": [
      "Magic Bounce"
    ],
    "hiddenAbility": "",
    "sprite": "dianciemega",
    "spriteId": "diancie-mega",
    "learnset": []
  },
  {
    "id": 720,
    "name": "Hoopa",
    "types": [
      "Psychic",
      "Ghost"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 110,
      "def": 60,
      "spa": 150,
      "spd": 130,
      "spe": 70
    },
    "abilities": [
      "Magician"
    ],
    "hiddenAbility": "",
    "sprite": "hoopa",
    "spriteId": "hoopa",
    "learnset": []
  },
  {
    "id": 720,
    "name": "Hoopa-Unbound",
    "types": [
      "Psychic",
      "Dark"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 160,
      "def": 60,
      "spa": 170,
      "spd": 130,
      "spe": 80
    },
    "abilities": [
      "Magician"
    ],
    "hiddenAbility": "",
    "sprite": "hoopaunbound",
    "spriteId": "hoopa-unbound",
    "learnset": []
  },
  {
    "id": 721,
    "name": "Volcanion",
    "types": [
      "Fire",
      "Water"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 110,
      "def": 120,
      "spa": 130,
      "spd": 90,
      "spe": 70
    },
    "abilities": [
      "Water Absorb"
    ],
    "hiddenAbility": "",
    "sprite": "volcanion",
    "spriteId": "volcanion",
    "learnset": []
  },
  {
    "id": 722,
    "name": "Rowlet",
    "types": [
      "Grass",
      "Flying"
    ],
    "baseStats": {
      "hp": 68,
      "atk": 55,
      "def": 55,
      "spa": 50,
      "spd": 50,
      "spe": 42
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Long Reach",
    "sprite": "rowlet",
    "spriteId": "rowlet",
    "learnset": []
  },
  {
    "id": 723,
    "name": "Dartrix",
    "types": [
      "Grass",
      "Flying"
    ],
    "baseStats": {
      "hp": 78,
      "atk": 75,
      "def": 75,
      "spa": 70,
      "spd": 70,
      "spe": 52
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Long Reach",
    "sprite": "dartrix",
    "spriteId": "dartrix",
    "learnset": []
  },
  {
    "id": 724,
    "name": "Decidueye",
    "types": [
      "Grass",
      "Ghost"
    ],
    "baseStats": {
      "hp": 78,
      "atk": 107,
      "def": 75,
      "spa": 100,
      "spd": 100,
      "spe": 70
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Long Reach",
    "sprite": "decidueye",
    "spriteId": "decidueye",
    "learnset": []
  },
  {
    "id": 724,
    "name": "Decidueye-Hisui",
    "types": [
      "Grass",
      "Fighting"
    ],
    "baseStats": {
      "hp": 88,
      "atk": 112,
      "def": 80,
      "spa": 95,
      "spd": 95,
      "spe": 60
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Scrappy",
    "sprite": "decidueyehisui",
    "spriteId": "decidueye-hisui",
    "learnset": []
  },
  {
    "id": 725,
    "name": "Litten",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 65,
      "def": 40,
      "spa": 60,
      "spd": 40,
      "spe": 70
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Intimidate",
    "sprite": "litten",
    "spriteId": "litten",
    "learnset": []
  },
  {
    "id": 726,
    "name": "Torracat",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 85,
      "def": 50,
      "spa": 80,
      "spd": 50,
      "spe": 90
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Intimidate",
    "sprite": "torracat",
    "spriteId": "torracat",
    "learnset": []
  },
  {
    "id": 727,
    "name": "Incineroar",
    "types": [
      "Fire",
      "Dark"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 115,
      "def": 90,
      "spa": 80,
      "spd": 90,
      "spe": 60
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Intimidate",
    "sprite": "incineroar",
    "spriteId": "incineroar",
    "learnset": []
  },
  {
    "id": 728,
    "name": "Popplio",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 54,
      "def": 54,
      "spa": 66,
      "spd": 56,
      "spe": 40
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Liquid Voice",
    "sprite": "popplio",
    "spriteId": "popplio",
    "learnset": []
  },
  {
    "id": 729,
    "name": "Brionne",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 69,
      "def": 69,
      "spa": 91,
      "spd": 81,
      "spe": 50
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Liquid Voice",
    "sprite": "brionne",
    "spriteId": "brionne",
    "learnset": []
  },
  {
    "id": 730,
    "name": "Primarina",
    "types": [
      "Water",
      "Fairy"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 74,
      "def": 74,
      "spa": 126,
      "spd": 116,
      "spe": 60
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Liquid Voice",
    "sprite": "primarina",
    "spriteId": "primarina",
    "learnset": []
  },
  {
    "id": 731,
    "name": "Pikipek",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 75,
      "def": 30,
      "spa": 30,
      "spd": 30,
      "spe": 65
    },
    "abilities": [
      "Keen Eye",
      "Skill Link"
    ],
    "hiddenAbility": "Pickup",
    "sprite": "pikipek",
    "spriteId": "pikipek",
    "learnset": []
  },
  {
    "id": 732,
    "name": "Trumbeak",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 85,
      "def": 50,
      "spa": 40,
      "spd": 50,
      "spe": 75
    },
    "abilities": [
      "Keen Eye",
      "Skill Link"
    ],
    "hiddenAbility": "Pickup",
    "sprite": "trumbeak",
    "spriteId": "trumbeak",
    "learnset": []
  },
  {
    "id": 733,
    "name": "Toucannon",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 120,
      "def": 75,
      "spa": 75,
      "spd": 75,
      "spe": 60
    },
    "abilities": [
      "Keen Eye",
      "Skill Link"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "toucannon",
    "spriteId": "toucannon",
    "learnset": []
  },
  {
    "id": 734,
    "name": "Yungoos",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 48,
      "atk": 70,
      "def": 30,
      "spa": 30,
      "spd": 30,
      "spe": 45
    },
    "abilities": [
      "Stakeout",
      "Strong Jaw"
    ],
    "hiddenAbility": "Adaptability",
    "sprite": "yungoos",
    "spriteId": "yungoos",
    "learnset": []
  },
  {
    "id": 735,
    "name": "Gumshoos",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 88,
      "atk": 110,
      "def": 60,
      "spa": 55,
      "spd": 60,
      "spe": 45
    },
    "abilities": [
      "Stakeout",
      "Strong Jaw"
    ],
    "hiddenAbility": "Adaptability",
    "sprite": "gumshoos",
    "spriteId": "gumshoos",
    "learnset": []
  },
  {
    "id": 735,
    "name": "Gumshoos-Totem",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 88,
      "atk": 110,
      "def": 60,
      "spa": 55,
      "spd": 60,
      "spe": 45
    },
    "abilities": [
      "Adaptability"
    ],
    "hiddenAbility": "",
    "sprite": "gumshoostotem",
    "spriteId": "gumshoos-totem",
    "learnset": []
  },
  {
    "id": 736,
    "name": "Grubbin",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 47,
      "atk": 62,
      "def": 45,
      "spa": 55,
      "spd": 45,
      "spe": 46
    },
    "abilities": [
      "Swarm"
    ],
    "hiddenAbility": "",
    "sprite": "grubbin",
    "spriteId": "grubbin",
    "learnset": []
  },
  {
    "id": 737,
    "name": "Charjabug",
    "types": [
      "Bug",
      "Electric"
    ],
    "baseStats": {
      "hp": 57,
      "atk": 82,
      "def": 95,
      "spa": 55,
      "spd": 75,
      "spe": 36
    },
    "abilities": [
      "Battery"
    ],
    "hiddenAbility": "",
    "sprite": "charjabug",
    "spriteId": "charjabug",
    "learnset": []
  },
  {
    "id": 738,
    "name": "Vikavolt",
    "types": [
      "Bug",
      "Electric"
    ],
    "baseStats": {
      "hp": 77,
      "atk": 70,
      "def": 90,
      "spa": 145,
      "spd": 75,
      "spe": 43
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "vikavolt",
    "spriteId": "vikavolt",
    "learnset": []
  },
  {
    "id": 738,
    "name": "Vikavolt-Totem",
    "types": [
      "Bug",
      "Electric"
    ],
    "baseStats": {
      "hp": 77,
      "atk": 70,
      "def": 90,
      "spa": 145,
      "spd": 75,
      "spe": 43
    },
    "abilities": [
      "Levitate"
    ],
    "hiddenAbility": "",
    "sprite": "vikavolttotem",
    "spriteId": "vikavolt-totem",
    "learnset": []
  },
  {
    "id": 739,
    "name": "Crabrawler",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 47,
      "atk": 82,
      "def": 57,
      "spa": 42,
      "spd": 47,
      "spe": 63
    },
    "abilities": [
      "Hyper Cutter",
      "Iron Fist"
    ],
    "hiddenAbility": "Anger Point",
    "sprite": "crabrawler",
    "spriteId": "crabrawler",
    "learnset": []
  },
  {
    "id": 740,
    "name": "Crabominable",
    "types": [
      "Fighting",
      "Ice"
    ],
    "baseStats": {
      "hp": 97,
      "atk": 132,
      "def": 77,
      "spa": 62,
      "spd": 67,
      "spe": 43
    },
    "abilities": [
      "Hyper Cutter",
      "Iron Fist"
    ],
    "hiddenAbility": "Anger Point",
    "sprite": "crabominable",
    "spriteId": "crabominable",
    "learnset": []
  },
  {
    "id": 740,
    "name": "Crabominable-Mega",
    "types": [
      "Fighting",
      "Ice"
    ],
    "baseStats": {
      "hp": 97,
      "atk": 157,
      "def": 122,
      "spa": 62,
      "spd": 107,
      "spe": 33
    },
    "abilities": [
      "Iron Fist"
    ],
    "hiddenAbility": "",
    "sprite": "crabominablemega",
    "spriteId": "crabominable-mega",
    "learnset": []
  },
  {
    "id": 741,
    "name": "Oricorio",
    "types": [
      "Fire",
      "Flying"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 70,
      "def": 70,
      "spa": 98,
      "spd": 70,
      "spe": 93
    },
    "abilities": [
      "Dancer"
    ],
    "hiddenAbility": "",
    "sprite": "oricorio",
    "spriteId": "oricorio",
    "learnset": []
  },
  {
    "id": 741,
    "name": "Oricorio-Pom-Pom",
    "types": [
      "Electric",
      "Flying"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 70,
      "def": 70,
      "spa": 98,
      "spd": 70,
      "spe": 93
    },
    "abilities": [
      "Dancer"
    ],
    "hiddenAbility": "",
    "sprite": "oricoriopompom",
    "spriteId": "oricorio-pompom",
    "learnset": []
  },
  {
    "id": 741,
    "name": "Oricorio-Pa'u",
    "types": [
      "Psychic",
      "Flying"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 70,
      "def": 70,
      "spa": 98,
      "spd": 70,
      "spe": 93
    },
    "abilities": [
      "Dancer"
    ],
    "hiddenAbility": "",
    "sprite": "oricoriopau",
    "spriteId": "oricorio-pau",
    "learnset": []
  },
  {
    "id": 741,
    "name": "Oricorio-Sensu",
    "types": [
      "Ghost",
      "Flying"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 70,
      "def": 70,
      "spa": 98,
      "spd": 70,
      "spe": 93
    },
    "abilities": [
      "Dancer"
    ],
    "hiddenAbility": "",
    "sprite": "oricoriosensu",
    "spriteId": "oricorio-sensu",
    "learnset": []
  },
  {
    "id": 742,
    "name": "Cutiefly",
    "types": [
      "Bug",
      "Fairy"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 45,
      "def": 40,
      "spa": 55,
      "spd": 40,
      "spe": 84
    },
    "abilities": [
      "Honey Gather",
      "Shield Dust"
    ],
    "hiddenAbility": "Sweet Veil",
    "sprite": "cutiefly",
    "spriteId": "cutiefly",
    "learnset": []
  },
  {
    "id": 743,
    "name": "Ribombee",
    "types": [
      "Bug",
      "Fairy"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 55,
      "def": 60,
      "spa": 95,
      "spd": 70,
      "spe": 124
    },
    "abilities": [
      "Honey Gather",
      "Shield Dust"
    ],
    "hiddenAbility": "Sweet Veil",
    "sprite": "ribombee",
    "spriteId": "ribombee",
    "learnset": []
  },
  {
    "id": 743,
    "name": "Ribombee-Totem",
    "types": [
      "Bug",
      "Fairy"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 55,
      "def": 60,
      "spa": 95,
      "spd": 70,
      "spe": 124
    },
    "abilities": [
      "Sweet Veil"
    ],
    "hiddenAbility": "",
    "sprite": "ribombeetotem",
    "spriteId": "ribombee-totem",
    "learnset": []
  },
  {
    "id": 744,
    "name": "Rockruff",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 65,
      "def": 40,
      "spa": 30,
      "spd": 40,
      "spe": 60
    },
    "abilities": [
      "Keen Eye",
      "Vital Spirit",
      "Own Tempo"
    ],
    "hiddenAbility": "Steadfast",
    "sprite": "rockruff",
    "spriteId": "rockruff",
    "learnset": []
  },
  {
    "id": 744,
    "name": "Rockruff-Dusk",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 65,
      "def": 40,
      "spa": 30,
      "spd": 40,
      "spe": 60
    },
    "abilities": [
      "Own Tempo"
    ],
    "hiddenAbility": "",
    "sprite": "rockruffdusk",
    "spriteId": "rockruff-dusk",
    "learnset": []
  },
  {
    "id": 745,
    "name": "Lycanroc",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 115,
      "def": 65,
      "spa": 55,
      "spd": 65,
      "spe": 112
    },
    "abilities": [
      "Keen Eye",
      "Sand Rush"
    ],
    "hiddenAbility": "Steadfast",
    "sprite": "lycanroc",
    "spriteId": "lycanroc",
    "learnset": []
  },
  {
    "id": 745,
    "name": "Lycanroc-Midnight",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 115,
      "def": 75,
      "spa": 55,
      "spd": 75,
      "spe": 82
    },
    "abilities": [
      "Keen Eye",
      "Vital Spirit"
    ],
    "hiddenAbility": "No Guard",
    "sprite": "lycanrocmidnight",
    "spriteId": "lycanroc-midnight",
    "learnset": []
  },
  {
    "id": 745,
    "name": "Lycanroc-Dusk",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 117,
      "def": 65,
      "spa": 55,
      "spd": 65,
      "spe": 110
    },
    "abilities": [
      "Tough Claws"
    ],
    "hiddenAbility": "",
    "sprite": "lycanrocdusk",
    "spriteId": "lycanroc-dusk",
    "learnset": []
  },
  {
    "id": 746,
    "name": "Wishiwashi",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 20,
      "def": 20,
      "spa": 25,
      "spd": 25,
      "spe": 40
    },
    "abilities": [
      "Schooling"
    ],
    "hiddenAbility": "",
    "sprite": "wishiwashi",
    "spriteId": "wishiwashi",
    "learnset": []
  },
  {
    "id": 746,
    "name": "Wishiwashi-School",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 140,
      "def": 130,
      "spa": 140,
      "spd": 135,
      "spe": 30
    },
    "abilities": [
      "Schooling"
    ],
    "hiddenAbility": "",
    "sprite": "wishiwashischool",
    "spriteId": "wishiwashi-school",
    "learnset": []
  },
  {
    "id": 747,
    "name": "Mareanie",
    "types": [
      "Poison",
      "Water"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 53,
      "def": 62,
      "spa": 43,
      "spd": 52,
      "spe": 45
    },
    "abilities": [
      "Merciless",
      "Limber"
    ],
    "hiddenAbility": "Regenerator",
    "sprite": "mareanie",
    "spriteId": "mareanie",
    "learnset": []
  },
  {
    "id": 748,
    "name": "Toxapex",
    "types": [
      "Poison",
      "Water"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 63,
      "def": 152,
      "spa": 53,
      "spd": 142,
      "spe": 35
    },
    "abilities": [
      "Merciless",
      "Limber"
    ],
    "hiddenAbility": "Regenerator",
    "sprite": "toxapex",
    "spriteId": "toxapex",
    "learnset": []
  },
  {
    "id": 749,
    "name": "Mudbray",
    "types": [
      "Ground"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 100,
      "def": 70,
      "spa": 45,
      "spd": 55,
      "spe": 45
    },
    "abilities": [
      "Own Tempo",
      "Stamina"
    ],
    "hiddenAbility": "Inner Focus",
    "sprite": "mudbray",
    "spriteId": "mudbray",
    "learnset": []
  },
  {
    "id": 750,
    "name": "Mudsdale",
    "types": [
      "Ground"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 125,
      "def": 100,
      "spa": 55,
      "spd": 85,
      "spe": 35
    },
    "abilities": [
      "Own Tempo",
      "Stamina"
    ],
    "hiddenAbility": "Inner Focus",
    "sprite": "mudsdale",
    "spriteId": "mudsdale",
    "learnset": []
  },
  {
    "id": 751,
    "name": "Dewpider",
    "types": [
      "Water",
      "Bug"
    ],
    "baseStats": {
      "hp": 38,
      "atk": 40,
      "def": 52,
      "spa": 40,
      "spd": 72,
      "spe": 27
    },
    "abilities": [
      "Water Bubble"
    ],
    "hiddenAbility": "Water Absorb",
    "sprite": "dewpider",
    "spriteId": "dewpider",
    "learnset": []
  },
  {
    "id": 752,
    "name": "Araquanid",
    "types": [
      "Water",
      "Bug"
    ],
    "baseStats": {
      "hp": 68,
      "atk": 70,
      "def": 92,
      "spa": 50,
      "spd": 132,
      "spe": 42
    },
    "abilities": [
      "Water Bubble"
    ],
    "hiddenAbility": "Water Absorb",
    "sprite": "araquanid",
    "spriteId": "araquanid",
    "learnset": []
  },
  {
    "id": 752,
    "name": "Araquanid-Totem",
    "types": [
      "Water",
      "Bug"
    ],
    "baseStats": {
      "hp": 68,
      "atk": 70,
      "def": 92,
      "spa": 50,
      "spd": 132,
      "spe": 42
    },
    "abilities": [
      "Water Bubble"
    ],
    "hiddenAbility": "",
    "sprite": "araquanidtotem",
    "spriteId": "araquanid-totem",
    "learnset": []
  },
  {
    "id": 753,
    "name": "Fomantis",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 55,
      "def": 35,
      "spa": 50,
      "spd": 35,
      "spe": 35
    },
    "abilities": [
      "Leaf Guard"
    ],
    "hiddenAbility": "Contrary",
    "sprite": "fomantis",
    "spriteId": "fomantis",
    "learnset": []
  },
  {
    "id": 754,
    "name": "Lurantis",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 105,
      "def": 90,
      "spa": 80,
      "spd": 90,
      "spe": 45
    },
    "abilities": [
      "Leaf Guard"
    ],
    "hiddenAbility": "Contrary",
    "sprite": "lurantis",
    "spriteId": "lurantis",
    "learnset": []
  },
  {
    "id": 754,
    "name": "Lurantis-Totem",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 105,
      "def": 90,
      "spa": 80,
      "spd": 90,
      "spe": 45
    },
    "abilities": [
      "Leaf Guard"
    ],
    "hiddenAbility": "",
    "sprite": "lurantistotem",
    "spriteId": "lurantis-totem",
    "learnset": []
  },
  {
    "id": 755,
    "name": "Morelull",
    "types": [
      "Grass",
      "Fairy"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 35,
      "def": 55,
      "spa": 65,
      "spd": 75,
      "spe": 15
    },
    "abilities": [
      "Illuminate",
      "Effect Spore"
    ],
    "hiddenAbility": "Rain Dish",
    "sprite": "morelull",
    "spriteId": "morelull",
    "learnset": []
  },
  {
    "id": 756,
    "name": "Shiinotic",
    "types": [
      "Grass",
      "Fairy"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 45,
      "def": 80,
      "spa": 90,
      "spd": 100,
      "spe": 30
    },
    "abilities": [
      "Illuminate",
      "Effect Spore"
    ],
    "hiddenAbility": "Rain Dish",
    "sprite": "shiinotic",
    "spriteId": "shiinotic",
    "learnset": []
  },
  {
    "id": 757,
    "name": "Salandit",
    "types": [
      "Poison",
      "Fire"
    ],
    "baseStats": {
      "hp": 48,
      "atk": 44,
      "def": 40,
      "spa": 71,
      "spd": 40,
      "spe": 77
    },
    "abilities": [
      "Corrosion"
    ],
    "hiddenAbility": "Oblivious",
    "sprite": "salandit",
    "spriteId": "salandit",
    "learnset": []
  },
  {
    "id": 758,
    "name": "Salazzle",
    "types": [
      "Poison",
      "Fire"
    ],
    "baseStats": {
      "hp": 68,
      "atk": 64,
      "def": 60,
      "spa": 111,
      "spd": 60,
      "spe": 117
    },
    "abilities": [
      "Corrosion"
    ],
    "hiddenAbility": "Oblivious",
    "sprite": "salazzle",
    "spriteId": "salazzle",
    "learnset": []
  },
  {
    "id": 758,
    "name": "Salazzle-Totem",
    "types": [
      "Poison",
      "Fire"
    ],
    "baseStats": {
      "hp": 68,
      "atk": 64,
      "def": 60,
      "spa": 111,
      "spd": 60,
      "spe": 117
    },
    "abilities": [
      "Corrosion"
    ],
    "hiddenAbility": "",
    "sprite": "salazzletotem",
    "spriteId": "salazzle-totem",
    "learnset": []
  },
  {
    "id": 759,
    "name": "Stufful",
    "types": [
      "Normal",
      "Fighting"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 75,
      "def": 50,
      "spa": 45,
      "spd": 50,
      "spe": 50
    },
    "abilities": [
      "Fluffy",
      "Klutz"
    ],
    "hiddenAbility": "Cute Charm",
    "sprite": "stufful",
    "spriteId": "stufful",
    "learnset": []
  },
  {
    "id": 760,
    "name": "Bewear",
    "types": [
      "Normal",
      "Fighting"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 125,
      "def": 80,
      "spa": 55,
      "spd": 60,
      "spe": 60
    },
    "abilities": [
      "Fluffy",
      "Klutz"
    ],
    "hiddenAbility": "Unnerve",
    "sprite": "bewear",
    "spriteId": "bewear",
    "learnset": []
  },
  {
    "id": 761,
    "name": "Bounsweet",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 42,
      "atk": 30,
      "def": 38,
      "spa": 30,
      "spd": 38,
      "spe": 32
    },
    "abilities": [
      "Leaf Guard",
      "Oblivious"
    ],
    "hiddenAbility": "Sweet Veil",
    "sprite": "bounsweet",
    "spriteId": "bounsweet",
    "learnset": []
  },
  {
    "id": 762,
    "name": "Steenee",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 52,
      "atk": 40,
      "def": 48,
      "spa": 40,
      "spd": 48,
      "spe": 62
    },
    "abilities": [
      "Leaf Guard",
      "Oblivious"
    ],
    "hiddenAbility": "Sweet Veil",
    "sprite": "steenee",
    "spriteId": "steenee",
    "learnset": []
  },
  {
    "id": 763,
    "name": "Tsareena",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 72,
      "atk": 120,
      "def": 98,
      "spa": 50,
      "spd": 98,
      "spe": 72
    },
    "abilities": [
      "Leaf Guard",
      "Queenly Majesty"
    ],
    "hiddenAbility": "Sweet Veil",
    "sprite": "tsareena",
    "spriteId": "tsareena",
    "learnset": []
  },
  {
    "id": 764,
    "name": "Comfey",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 51,
      "atk": 52,
      "def": 90,
      "spa": 82,
      "spd": 110,
      "spe": 100
    },
    "abilities": [
      "Flower Veil",
      "Triage"
    ],
    "hiddenAbility": "Natural Cure",
    "sprite": "comfey",
    "spriteId": "comfey",
    "learnset": []
  },
  {
    "id": 765,
    "name": "Oranguru",
    "types": [
      "Normal",
      "Psychic"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 60,
      "def": 80,
      "spa": 90,
      "spd": 110,
      "spe": 60
    },
    "abilities": [
      "Inner Focus",
      "Telepathy"
    ],
    "hiddenAbility": "Symbiosis",
    "sprite": "oranguru",
    "spriteId": "oranguru",
    "learnset": []
  },
  {
    "id": 766,
    "name": "Passimian",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 120,
      "def": 90,
      "spa": 40,
      "spd": 60,
      "spe": 80
    },
    "abilities": [
      "Receiver"
    ],
    "hiddenAbility": "Defiant",
    "sprite": "passimian",
    "spriteId": "passimian",
    "learnset": []
  },
  {
    "id": 767,
    "name": "Wimpod",
    "types": [
      "Bug",
      "Water"
    ],
    "baseStats": {
      "hp": 25,
      "atk": 35,
      "def": 40,
      "spa": 20,
      "spd": 30,
      "spe": 80
    },
    "abilities": [
      "Wimp Out"
    ],
    "hiddenAbility": "",
    "sprite": "wimpod",
    "spriteId": "wimpod",
    "learnset": []
  },
  {
    "id": 768,
    "name": "Golisopod",
    "types": [
      "Bug",
      "Water"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 125,
      "def": 140,
      "spa": 60,
      "spd": 90,
      "spe": 40
    },
    "abilities": [
      "Emergency Exit"
    ],
    "hiddenAbility": "",
    "sprite": "golisopod",
    "spriteId": "golisopod",
    "learnset": []
  },
  {
    "id": 768,
    "name": "Golisopod-Mega",
    "types": [
      "Bug",
      "Steel"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 150,
      "def": 175,
      "spa": 70,
      "spd": 120,
      "spe": 40
    },
    "abilities": [
      "Emergency Exit"
    ],
    "hiddenAbility": "",
    "sprite": "golisopodmega",
    "spriteId": "golisopod-mega",
    "learnset": []
  },
  {
    "id": 769,
    "name": "Sandygast",
    "types": [
      "Ghost",
      "Ground"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 55,
      "def": 80,
      "spa": 70,
      "spd": 45,
      "spe": 15
    },
    "abilities": [
      "Water Compaction"
    ],
    "hiddenAbility": "Sand Veil",
    "sprite": "sandygast",
    "spriteId": "sandygast",
    "learnset": []
  },
  {
    "id": 770,
    "name": "Palossand",
    "types": [
      "Ghost",
      "Ground"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 75,
      "def": 110,
      "spa": 100,
      "spd": 75,
      "spe": 35
    },
    "abilities": [
      "Water Compaction"
    ],
    "hiddenAbility": "Sand Veil",
    "sprite": "palossand",
    "spriteId": "palossand",
    "learnset": []
  },
  {
    "id": 771,
    "name": "Pyukumuku",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 60,
      "def": 130,
      "spa": 30,
      "spd": 130,
      "spe": 5
    },
    "abilities": [
      "Innards Out"
    ],
    "hiddenAbility": "Unaware",
    "sprite": "pyukumuku",
    "spriteId": "pyukumuku",
    "learnset": []
  },
  {
    "id": 772,
    "name": "Type: Null",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 95,
      "def": 95,
      "spa": 95,
      "spd": 95,
      "spe": 59
    },
    "abilities": [
      "Battle Armor"
    ],
    "hiddenAbility": "",
    "sprite": "typenull",
    "spriteId": "typenull",
    "learnset": []
  },
  {
    "id": 773,
    "name": "Silvally",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 95,
      "def": 95,
      "spa": 95,
      "spd": 95,
      "spe": 95
    },
    "abilities": [
      "RKS System"
    ],
    "hiddenAbility": "",
    "sprite": "silvally",
    "spriteId": "silvally",
    "learnset": []
  },
  {
    "id": 773,
    "name": "Silvally-Bug",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 95,
      "def": 95,
      "spa": 95,
      "spd": 95,
      "spe": 95
    },
    "abilities": [
      "RKS System"
    ],
    "hiddenAbility": "",
    "sprite": "silvallybug",
    "spriteId": "silvally-bug",
    "learnset": []
  },
  {
    "id": 773,
    "name": "Silvally-Dark",
    "types": [
      "Dark"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 95,
      "def": 95,
      "spa": 95,
      "spd": 95,
      "spe": 95
    },
    "abilities": [
      "RKS System"
    ],
    "hiddenAbility": "",
    "sprite": "silvallydark",
    "spriteId": "silvally-dark",
    "learnset": []
  },
  {
    "id": 773,
    "name": "Silvally-Dragon",
    "types": [
      "Dragon"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 95,
      "def": 95,
      "spa": 95,
      "spd": 95,
      "spe": 95
    },
    "abilities": [
      "RKS System"
    ],
    "hiddenAbility": "",
    "sprite": "silvallydragon",
    "spriteId": "silvally-dragon",
    "learnset": []
  },
  {
    "id": 773,
    "name": "Silvally-Electric",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 95,
      "def": 95,
      "spa": 95,
      "spd": 95,
      "spe": 95
    },
    "abilities": [
      "RKS System"
    ],
    "hiddenAbility": "",
    "sprite": "silvallyelectric",
    "spriteId": "silvally-electric",
    "learnset": []
  },
  {
    "id": 773,
    "name": "Silvally-Fairy",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 95,
      "def": 95,
      "spa": 95,
      "spd": 95,
      "spe": 95
    },
    "abilities": [
      "RKS System"
    ],
    "hiddenAbility": "",
    "sprite": "silvallyfairy",
    "spriteId": "silvally-fairy",
    "learnset": []
  },
  {
    "id": 773,
    "name": "Silvally-Fighting",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 95,
      "def": 95,
      "spa": 95,
      "spd": 95,
      "spe": 95
    },
    "abilities": [
      "RKS System"
    ],
    "hiddenAbility": "",
    "sprite": "silvallyfighting",
    "spriteId": "silvally-fighting",
    "learnset": []
  },
  {
    "id": 773,
    "name": "Silvally-Fire",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 95,
      "def": 95,
      "spa": 95,
      "spd": 95,
      "spe": 95
    },
    "abilities": [
      "RKS System"
    ],
    "hiddenAbility": "",
    "sprite": "silvallyfire",
    "spriteId": "silvally-fire",
    "learnset": []
  },
  {
    "id": 773,
    "name": "Silvally-Flying",
    "types": [
      "Flying"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 95,
      "def": 95,
      "spa": 95,
      "spd": 95,
      "spe": 95
    },
    "abilities": [
      "RKS System"
    ],
    "hiddenAbility": "",
    "sprite": "silvallyflying",
    "spriteId": "silvally-flying",
    "learnset": []
  },
  {
    "id": 773,
    "name": "Silvally-Ghost",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 95,
      "def": 95,
      "spa": 95,
      "spd": 95,
      "spe": 95
    },
    "abilities": [
      "RKS System"
    ],
    "hiddenAbility": "",
    "sprite": "silvallyghost",
    "spriteId": "silvally-ghost",
    "learnset": []
  },
  {
    "id": 773,
    "name": "Silvally-Grass",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 95,
      "def": 95,
      "spa": 95,
      "spd": 95,
      "spe": 95
    },
    "abilities": [
      "RKS System"
    ],
    "hiddenAbility": "",
    "sprite": "silvallygrass",
    "spriteId": "silvally-grass",
    "learnset": []
  },
  {
    "id": 773,
    "name": "Silvally-Ground",
    "types": [
      "Ground"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 95,
      "def": 95,
      "spa": 95,
      "spd": 95,
      "spe": 95
    },
    "abilities": [
      "RKS System"
    ],
    "hiddenAbility": "",
    "sprite": "silvallyground",
    "spriteId": "silvally-ground",
    "learnset": []
  },
  {
    "id": 773,
    "name": "Silvally-Ice",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 95,
      "def": 95,
      "spa": 95,
      "spd": 95,
      "spe": 95
    },
    "abilities": [
      "RKS System"
    ],
    "hiddenAbility": "",
    "sprite": "silvallyice",
    "spriteId": "silvally-ice",
    "learnset": []
  },
  {
    "id": 773,
    "name": "Silvally-Poison",
    "types": [
      "Poison"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 95,
      "def": 95,
      "spa": 95,
      "spd": 95,
      "spe": 95
    },
    "abilities": [
      "RKS System"
    ],
    "hiddenAbility": "",
    "sprite": "silvallypoison",
    "spriteId": "silvally-poison",
    "learnset": []
  },
  {
    "id": 773,
    "name": "Silvally-Psychic",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 95,
      "def": 95,
      "spa": 95,
      "spd": 95,
      "spe": 95
    },
    "abilities": [
      "RKS System"
    ],
    "hiddenAbility": "",
    "sprite": "silvallypsychic",
    "spriteId": "silvally-psychic",
    "learnset": []
  },
  {
    "id": 773,
    "name": "Silvally-Rock",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 95,
      "def": 95,
      "spa": 95,
      "spd": 95,
      "spe": 95
    },
    "abilities": [
      "RKS System"
    ],
    "hiddenAbility": "",
    "sprite": "silvallyrock",
    "spriteId": "silvally-rock",
    "learnset": []
  },
  {
    "id": 773,
    "name": "Silvally-Steel",
    "types": [
      "Steel"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 95,
      "def": 95,
      "spa": 95,
      "spd": 95,
      "spe": 95
    },
    "abilities": [
      "RKS System"
    ],
    "hiddenAbility": "",
    "sprite": "silvallysteel",
    "spriteId": "silvally-steel",
    "learnset": []
  },
  {
    "id": 773,
    "name": "Silvally-Water",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 95,
      "def": 95,
      "spa": 95,
      "spd": 95,
      "spe": 95
    },
    "abilities": [
      "RKS System"
    ],
    "hiddenAbility": "",
    "sprite": "silvallywater",
    "spriteId": "silvally-water",
    "learnset": []
  },
  {
    "id": 774,
    "name": "Minior",
    "types": [
      "Rock",
      "Flying"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 100,
      "def": 60,
      "spa": 100,
      "spd": 60,
      "spe": 120
    },
    "abilities": [
      "Shields Down"
    ],
    "hiddenAbility": "",
    "sprite": "minior",
    "spriteId": "minior",
    "learnset": []
  },
  {
    "id": 774,
    "name": "Minior-Meteor",
    "types": [
      "Rock",
      "Flying"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 60,
      "def": 100,
      "spa": 60,
      "spd": 100,
      "spe": 60
    },
    "abilities": [
      "Shields Down"
    ],
    "hiddenAbility": "",
    "sprite": "miniormeteor",
    "spriteId": "minior-meteor",
    "learnset": []
  },
  {
    "id": 775,
    "name": "Komala",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 115,
      "def": 65,
      "spa": 75,
      "spd": 95,
      "spe": 65
    },
    "abilities": [
      "Comatose"
    ],
    "hiddenAbility": "",
    "sprite": "komala",
    "spriteId": "komala",
    "learnset": []
  },
  {
    "id": 776,
    "name": "Turtonator",
    "types": [
      "Fire",
      "Dragon"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 78,
      "def": 135,
      "spa": 91,
      "spd": 85,
      "spe": 36
    },
    "abilities": [
      "Shell Armor"
    ],
    "hiddenAbility": "",
    "sprite": "turtonator",
    "spriteId": "turtonator",
    "learnset": []
  },
  {
    "id": 777,
    "name": "Togedemaru",
    "types": [
      "Electric",
      "Steel"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 98,
      "def": 63,
      "spa": 40,
      "spd": 73,
      "spe": 96
    },
    "abilities": [
      "Iron Barbs",
      "Lightning Rod"
    ],
    "hiddenAbility": "Sturdy",
    "sprite": "togedemaru",
    "spriteId": "togedemaru",
    "learnset": []
  },
  {
    "id": 777,
    "name": "Togedemaru-Totem",
    "types": [
      "Electric",
      "Steel"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 98,
      "def": 63,
      "spa": 40,
      "spd": 73,
      "spe": 96
    },
    "abilities": [
      "Sturdy"
    ],
    "hiddenAbility": "",
    "sprite": "togedemarutotem",
    "spriteId": "togedemaru-totem",
    "learnset": []
  },
  {
    "id": 778,
    "name": "Mimikyu",
    "types": [
      "Ghost",
      "Fairy"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 90,
      "def": 80,
      "spa": 50,
      "spd": 105,
      "spe": 96
    },
    "abilities": [
      "Disguise"
    ],
    "hiddenAbility": "",
    "sprite": "mimikyu",
    "spriteId": "mimikyu",
    "learnset": []
  },
  {
    "id": 778,
    "name": "Mimikyu-Busted",
    "types": [
      "Ghost",
      "Fairy"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 90,
      "def": 80,
      "spa": 50,
      "spd": 105,
      "spe": 96
    },
    "abilities": [
      "Disguise"
    ],
    "hiddenAbility": "",
    "sprite": "mimikyubusted",
    "spriteId": "mimikyu-busted",
    "learnset": []
  },
  {
    "id": 778,
    "name": "Mimikyu-Totem",
    "types": [
      "Ghost",
      "Fairy"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 90,
      "def": 80,
      "spa": 50,
      "spd": 105,
      "spe": 96
    },
    "abilities": [
      "Disguise"
    ],
    "hiddenAbility": "",
    "sprite": "mimikyutotem",
    "spriteId": "mimikyu-totem",
    "learnset": []
  },
  {
    "id": 778,
    "name": "Mimikyu-Busted-Totem",
    "types": [
      "Ghost",
      "Fairy"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 90,
      "def": 80,
      "spa": 50,
      "spd": 105,
      "spe": 96
    },
    "abilities": [
      "Disguise"
    ],
    "hiddenAbility": "",
    "sprite": "mimikyubustedtotem",
    "spriteId": "mimikyu-bustedtotem",
    "learnset": []
  },
  {
    "id": 779,
    "name": "Bruxish",
    "types": [
      "Water",
      "Psychic"
    ],
    "baseStats": {
      "hp": 68,
      "atk": 105,
      "def": 70,
      "spa": 70,
      "spd": 70,
      "spe": 92
    },
    "abilities": [
      "Dazzling",
      "Strong Jaw"
    ],
    "hiddenAbility": "Wonder Skin",
    "sprite": "bruxish",
    "spriteId": "bruxish",
    "learnset": []
  },
  {
    "id": 780,
    "name": "Drampa",
    "types": [
      "Normal",
      "Dragon"
    ],
    "baseStats": {
      "hp": 78,
      "atk": 60,
      "def": 85,
      "spa": 135,
      "spd": 91,
      "spe": 36
    },
    "abilities": [
      "Berserk",
      "Sap Sipper"
    ],
    "hiddenAbility": "Cloud Nine",
    "sprite": "drampa",
    "spriteId": "drampa",
    "learnset": []
  },
  {
    "id": 780,
    "name": "Drampa-Mega",
    "types": [
      "Normal",
      "Dragon"
    ],
    "baseStats": {
      "hp": 78,
      "atk": 85,
      "def": 110,
      "spa": 160,
      "spd": 116,
      "spe": 36
    },
    "abilities": [
      "Berserk"
    ],
    "hiddenAbility": "",
    "sprite": "drampamega",
    "spriteId": "drampa-mega",
    "learnset": []
  },
  {
    "id": 781,
    "name": "Dhelmise",
    "types": [
      "Ghost",
      "Grass"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 131,
      "def": 100,
      "spa": 86,
      "spd": 90,
      "spe": 40
    },
    "abilities": [
      "Steelworker"
    ],
    "hiddenAbility": "",
    "sprite": "dhelmise",
    "spriteId": "dhelmise",
    "learnset": []
  },
  {
    "id": 782,
    "name": "Jangmo-o",
    "types": [
      "Dragon"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 55,
      "def": 65,
      "spa": 45,
      "spd": 45,
      "spe": 45
    },
    "abilities": [
      "Bulletproof",
      "Soundproof"
    ],
    "hiddenAbility": "Overcoat",
    "sprite": "jangmoo",
    "spriteId": "jangmoo",
    "learnset": []
  },
  {
    "id": 783,
    "name": "Hakamo-o",
    "types": [
      "Dragon",
      "Fighting"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 75,
      "def": 90,
      "spa": 65,
      "spd": 70,
      "spe": 65
    },
    "abilities": [
      "Bulletproof",
      "Soundproof"
    ],
    "hiddenAbility": "Overcoat",
    "sprite": "hakamoo",
    "spriteId": "hakamoo",
    "learnset": []
  },
  {
    "id": 784,
    "name": "Kommo-o",
    "types": [
      "Dragon",
      "Fighting"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 110,
      "def": 125,
      "spa": 100,
      "spd": 105,
      "spe": 85
    },
    "abilities": [
      "Bulletproof",
      "Soundproof"
    ],
    "hiddenAbility": "Overcoat",
    "sprite": "kommoo",
    "spriteId": "kommoo",
    "learnset": []
  },
  {
    "id": 784,
    "name": "Kommo-o-Totem",
    "types": [
      "Dragon",
      "Fighting"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 110,
      "def": 125,
      "spa": 100,
      "spd": 105,
      "spe": 85
    },
    "abilities": [
      "Overcoat"
    ],
    "hiddenAbility": "",
    "sprite": "kommoototem",
    "spriteId": "kommoo-totem",
    "learnset": []
  },
  {
    "id": 785,
    "name": "Tapu Koko",
    "types": [
      "Electric",
      "Fairy"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 115,
      "def": 85,
      "spa": 95,
      "spd": 75,
      "spe": 130
    },
    "abilities": [
      "Electric Surge"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "tapukoko",
    "spriteId": "tapukoko",
    "learnset": []
  },
  {
    "id": 786,
    "name": "Tapu Lele",
    "types": [
      "Psychic",
      "Fairy"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 85,
      "def": 75,
      "spa": 130,
      "spd": 115,
      "spe": 95
    },
    "abilities": [
      "Psychic Surge"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "tapulele",
    "spriteId": "tapulele",
    "learnset": []
  },
  {
    "id": 787,
    "name": "Tapu Bulu",
    "types": [
      "Grass",
      "Fairy"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 130,
      "def": 115,
      "spa": 85,
      "spd": 95,
      "spe": 75
    },
    "abilities": [
      "Grassy Surge"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "tapubulu",
    "spriteId": "tapubulu",
    "learnset": []
  },
  {
    "id": 788,
    "name": "Tapu Fini",
    "types": [
      "Water",
      "Fairy"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 75,
      "def": 115,
      "spa": 95,
      "spd": 130,
      "spe": 85
    },
    "abilities": [
      "Misty Surge"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "tapufini",
    "spriteId": "tapufini",
    "learnset": []
  },
  {
    "id": 789,
    "name": "Cosmog",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 43,
      "atk": 29,
      "def": 31,
      "spa": 29,
      "spd": 31,
      "spe": 37
    },
    "abilities": [
      "Unaware"
    ],
    "hiddenAbility": "",
    "sprite": "cosmog",
    "spriteId": "cosmog",
    "learnset": []
  },
  {
    "id": 790,
    "name": "Cosmoem",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 43,
      "atk": 29,
      "def": 131,
      "spa": 29,
      "spd": 131,
      "spe": 37
    },
    "abilities": [
      "Sturdy"
    ],
    "hiddenAbility": "",
    "sprite": "cosmoem",
    "spriteId": "cosmoem",
    "learnset": []
  },
  {
    "id": 791,
    "name": "Solgaleo",
    "types": [
      "Psychic",
      "Steel"
    ],
    "baseStats": {
      "hp": 137,
      "atk": 137,
      "def": 107,
      "spa": 113,
      "spd": 89,
      "spe": 97
    },
    "abilities": [
      "Full Metal Body"
    ],
    "hiddenAbility": "",
    "sprite": "solgaleo",
    "spriteId": "solgaleo",
    "learnset": []
  },
  {
    "id": 792,
    "name": "Lunala",
    "types": [
      "Psychic",
      "Ghost"
    ],
    "baseStats": {
      "hp": 137,
      "atk": 113,
      "def": 89,
      "spa": 137,
      "spd": 107,
      "spe": 97
    },
    "abilities": [
      "Shadow Shield"
    ],
    "hiddenAbility": "",
    "sprite": "lunala",
    "spriteId": "lunala",
    "learnset": []
  },
  {
    "id": 793,
    "name": "Nihilego",
    "types": [
      "Rock",
      "Poison"
    ],
    "baseStats": {
      "hp": 109,
      "atk": 53,
      "def": 47,
      "spa": 127,
      "spd": 131,
      "spe": 103
    },
    "abilities": [
      "Beast Boost"
    ],
    "hiddenAbility": "",
    "sprite": "nihilego",
    "spriteId": "nihilego",
    "learnset": []
  },
  {
    "id": 794,
    "name": "Buzzwole",
    "types": [
      "Bug",
      "Fighting"
    ],
    "baseStats": {
      "hp": 107,
      "atk": 139,
      "def": 139,
      "spa": 53,
      "spd": 53,
      "spe": 79
    },
    "abilities": [
      "Beast Boost"
    ],
    "hiddenAbility": "",
    "sprite": "buzzwole",
    "spriteId": "buzzwole",
    "learnset": []
  },
  {
    "id": 795,
    "name": "Pheromosa",
    "types": [
      "Bug",
      "Fighting"
    ],
    "baseStats": {
      "hp": 71,
      "atk": 137,
      "def": 37,
      "spa": 137,
      "spd": 37,
      "spe": 151
    },
    "abilities": [
      "Beast Boost"
    ],
    "hiddenAbility": "",
    "sprite": "pheromosa",
    "spriteId": "pheromosa",
    "learnset": []
  },
  {
    "id": 796,
    "name": "Xurkitree",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 83,
      "atk": 89,
      "def": 71,
      "spa": 173,
      "spd": 71,
      "spe": 83
    },
    "abilities": [
      "Beast Boost"
    ],
    "hiddenAbility": "",
    "sprite": "xurkitree",
    "spriteId": "xurkitree",
    "learnset": []
  },
  {
    "id": 797,
    "name": "Celesteela",
    "types": [
      "Steel",
      "Flying"
    ],
    "baseStats": {
      "hp": 97,
      "atk": 101,
      "def": 103,
      "spa": 107,
      "spd": 101,
      "spe": 61
    },
    "abilities": [
      "Beast Boost"
    ],
    "hiddenAbility": "",
    "sprite": "celesteela",
    "spriteId": "celesteela",
    "learnset": []
  },
  {
    "id": 798,
    "name": "Kartana",
    "types": [
      "Grass",
      "Steel"
    ],
    "baseStats": {
      "hp": 59,
      "atk": 181,
      "def": 131,
      "spa": 59,
      "spd": 31,
      "spe": 109
    },
    "abilities": [
      "Beast Boost"
    ],
    "hiddenAbility": "",
    "sprite": "kartana",
    "spriteId": "kartana",
    "learnset": []
  },
  {
    "id": 799,
    "name": "Guzzlord",
    "types": [
      "Dark",
      "Dragon"
    ],
    "baseStats": {
      "hp": 223,
      "atk": 101,
      "def": 53,
      "spa": 97,
      "spd": 53,
      "spe": 43
    },
    "abilities": [
      "Beast Boost"
    ],
    "hiddenAbility": "",
    "sprite": "guzzlord",
    "spriteId": "guzzlord",
    "learnset": []
  },
  {
    "id": 800,
    "name": "Necrozma",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 97,
      "atk": 107,
      "def": 101,
      "spa": 127,
      "spd": 89,
      "spe": 79
    },
    "abilities": [
      "Prism Armor"
    ],
    "hiddenAbility": "",
    "sprite": "necrozma",
    "spriteId": "necrozma",
    "learnset": []
  },
  {
    "id": 800,
    "name": "Necrozma-Dusk-Mane",
    "types": [
      "Psychic",
      "Steel"
    ],
    "baseStats": {
      "hp": 97,
      "atk": 157,
      "def": 127,
      "spa": 113,
      "spd": 109,
      "spe": 77
    },
    "abilities": [
      "Prism Armor"
    ],
    "hiddenAbility": "",
    "sprite": "necrozmaduskmane",
    "spriteId": "necrozma-duskmane",
    "learnset": []
  },
  {
    "id": 800,
    "name": "Necrozma-Dawn-Wings",
    "types": [
      "Psychic",
      "Ghost"
    ],
    "baseStats": {
      "hp": 97,
      "atk": 113,
      "def": 109,
      "spa": 157,
      "spd": 127,
      "spe": 77
    },
    "abilities": [
      "Prism Armor"
    ],
    "hiddenAbility": "",
    "sprite": "necrozmadawnwings",
    "spriteId": "necrozma-dawnwings",
    "learnset": []
  },
  {
    "id": 800,
    "name": "Necrozma-Ultra",
    "types": [
      "Psychic",
      "Dragon"
    ],
    "baseStats": {
      "hp": 97,
      "atk": 167,
      "def": 97,
      "spa": 167,
      "spd": 97,
      "spe": 129
    },
    "abilities": [
      "Neuroforce"
    ],
    "hiddenAbility": "",
    "sprite": "necrozmaultra",
    "spriteId": "necrozma-ultra",
    "learnset": []
  },
  {
    "id": 801,
    "name": "Magearna",
    "types": [
      "Steel",
      "Fairy"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 95,
      "def": 115,
      "spa": 130,
      "spd": 115,
      "spe": 65
    },
    "abilities": [
      "Soul-Heart"
    ],
    "hiddenAbility": "",
    "sprite": "magearna",
    "spriteId": "magearna",
    "learnset": []
  },
  {
    "id": 801,
    "name": "Magearna-Original",
    "types": [
      "Steel",
      "Fairy"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 95,
      "def": 115,
      "spa": 130,
      "spd": 115,
      "spe": 65
    },
    "abilities": [
      "Soul-Heart"
    ],
    "hiddenAbility": "",
    "sprite": "magearnaoriginal",
    "spriteId": "magearna-original",
    "learnset": []
  },
  {
    "id": 801,
    "name": "Magearna-Mega",
    "types": [
      "Steel",
      "Fairy"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 125,
      "def": 115,
      "spa": 170,
      "spd": 115,
      "spe": 95
    },
    "abilities": [
      "Soul-Heart"
    ],
    "hiddenAbility": "",
    "sprite": "magearnamega",
    "spriteId": "magearna-mega",
    "learnset": []
  },
  {
    "id": 801,
    "name": "Magearna-Original-Mega",
    "types": [
      "Steel",
      "Fairy"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 125,
      "def": 115,
      "spa": 170,
      "spd": 115,
      "spe": 95
    },
    "abilities": [
      "Soul-Heart"
    ],
    "hiddenAbility": "",
    "sprite": "magearnaoriginalmega",
    "spriteId": "magearna-originalmega",
    "learnset": []
  },
  {
    "id": 802,
    "name": "Marshadow",
    "types": [
      "Fighting",
      "Ghost"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 125,
      "def": 80,
      "spa": 90,
      "spd": 90,
      "spe": 125
    },
    "abilities": [
      "Technician"
    ],
    "hiddenAbility": "",
    "sprite": "marshadow",
    "spriteId": "marshadow",
    "learnset": []
  },
  {
    "id": 803,
    "name": "Poipole",
    "types": [
      "Poison"
    ],
    "baseStats": {
      "hp": 67,
      "atk": 73,
      "def": 67,
      "spa": 73,
      "spd": 67,
      "spe": 73
    },
    "abilities": [
      "Beast Boost"
    ],
    "hiddenAbility": "",
    "sprite": "poipole",
    "spriteId": "poipole",
    "learnset": []
  },
  {
    "id": 804,
    "name": "Naganadel",
    "types": [
      "Poison",
      "Dragon"
    ],
    "baseStats": {
      "hp": 73,
      "atk": 73,
      "def": 73,
      "spa": 127,
      "spd": 73,
      "spe": 121
    },
    "abilities": [
      "Beast Boost"
    ],
    "hiddenAbility": "",
    "sprite": "naganadel",
    "spriteId": "naganadel",
    "learnset": []
  },
  {
    "id": 805,
    "name": "Stakataka",
    "types": [
      "Rock",
      "Steel"
    ],
    "baseStats": {
      "hp": 61,
      "atk": 131,
      "def": 211,
      "spa": 53,
      "spd": 101,
      "spe": 13
    },
    "abilities": [
      "Beast Boost"
    ],
    "hiddenAbility": "",
    "sprite": "stakataka",
    "spriteId": "stakataka",
    "learnset": []
  },
  {
    "id": 806,
    "name": "Blacephalon",
    "types": [
      "Fire",
      "Ghost"
    ],
    "baseStats": {
      "hp": 53,
      "atk": 127,
      "def": 53,
      "spa": 151,
      "spd": 79,
      "spe": 107
    },
    "abilities": [
      "Beast Boost"
    ],
    "hiddenAbility": "",
    "sprite": "blacephalon",
    "spriteId": "blacephalon",
    "learnset": []
  },
  {
    "id": 807,
    "name": "Zeraora",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 88,
      "atk": 112,
      "def": 75,
      "spa": 102,
      "spd": 80,
      "spe": 143
    },
    "abilities": [
      "Volt Absorb"
    ],
    "hiddenAbility": "",
    "sprite": "zeraora",
    "spriteId": "zeraora",
    "learnset": []
  },
  {
    "id": 807,
    "name": "Zeraora-Mega",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 88,
      "atk": 157,
      "def": 75,
      "spa": 147,
      "spd": 80,
      "spe": 153
    },
    "abilities": [
      "Volt Absorb"
    ],
    "hiddenAbility": "",
    "sprite": "zeraoramega",
    "spriteId": "zeraora-mega",
    "learnset": []
  },
  {
    "id": 808,
    "name": "Meltan",
    "types": [
      "Steel"
    ],
    "baseStats": {
      "hp": 46,
      "atk": 65,
      "def": 65,
      "spa": 55,
      "spd": 35,
      "spe": 34
    },
    "abilities": [
      "Magnet Pull"
    ],
    "hiddenAbility": "",
    "sprite": "meltan",
    "spriteId": "meltan",
    "learnset": []
  },
  {
    "id": 809,
    "name": "Melmetal",
    "types": [
      "Steel"
    ],
    "baseStats": {
      "hp": 135,
      "atk": 143,
      "def": 143,
      "spa": 80,
      "spd": 65,
      "spe": 34
    },
    "abilities": [
      "Iron Fist"
    ],
    "hiddenAbility": "",
    "sprite": "melmetal",
    "spriteId": "melmetal",
    "learnset": []
  },
  {
    "id": 809,
    "name": "Melmetal-Gmax",
    "types": [
      "Steel"
    ],
    "baseStats": {
      "hp": 135,
      "atk": 143,
      "def": 143,
      "spa": 80,
      "spd": 65,
      "spe": 34
    },
    "abilities": [
      "Iron Fist"
    ],
    "hiddenAbility": "",
    "sprite": "melmetalgmax",
    "spriteId": "melmetal-gmax",
    "learnset": []
  },
  {
    "id": 810,
    "name": "Grookey",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 65,
      "def": 50,
      "spa": 40,
      "spd": 40,
      "spe": 65
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Grassy Surge",
    "sprite": "grookey",
    "spriteId": "grookey",
    "learnset": []
  },
  {
    "id": 811,
    "name": "Thwackey",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 85,
      "def": 70,
      "spa": 55,
      "spd": 60,
      "spe": 80
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Grassy Surge",
    "sprite": "thwackey",
    "spriteId": "thwackey",
    "learnset": []
  },
  {
    "id": 812,
    "name": "Rillaboom",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 125,
      "def": 90,
      "spa": 60,
      "spd": 70,
      "spe": 85
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Grassy Surge",
    "sprite": "rillaboom",
    "spriteId": "rillaboom",
    "learnset": []
  },
  {
    "id": 812,
    "name": "Rillaboom-Gmax",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 125,
      "def": 90,
      "spa": 60,
      "spd": 70,
      "spe": 85
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Grassy Surge",
    "sprite": "rillaboomgmax",
    "spriteId": "rillaboom-gmax",
    "learnset": []
  },
  {
    "id": 813,
    "name": "Scorbunny",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 71,
      "def": 40,
      "spa": 40,
      "spd": 40,
      "spe": 69
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Libero",
    "sprite": "scorbunny",
    "spriteId": "scorbunny",
    "learnset": []
  },
  {
    "id": 814,
    "name": "Raboot",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 86,
      "def": 60,
      "spa": 55,
      "spd": 60,
      "spe": 94
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Libero",
    "sprite": "raboot",
    "spriteId": "raboot",
    "learnset": []
  },
  {
    "id": 815,
    "name": "Cinderace",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 116,
      "def": 75,
      "spa": 65,
      "spd": 75,
      "spe": 119
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Libero",
    "sprite": "cinderace",
    "spriteId": "cinderace",
    "learnset": []
  },
  {
    "id": 815,
    "name": "Cinderace-Gmax",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 116,
      "def": 75,
      "spa": 65,
      "spd": 75,
      "spe": 119
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Libero",
    "sprite": "cinderacegmax",
    "spriteId": "cinderace-gmax",
    "learnset": []
  },
  {
    "id": 816,
    "name": "Sobble",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 40,
      "def": 40,
      "spa": 70,
      "spd": 40,
      "spe": 70
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Sniper",
    "sprite": "sobble",
    "spriteId": "sobble",
    "learnset": []
  },
  {
    "id": 817,
    "name": "Drizzile",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 60,
      "def": 55,
      "spa": 95,
      "spd": 55,
      "spe": 90
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Sniper",
    "sprite": "drizzile",
    "spriteId": "drizzile",
    "learnset": []
  },
  {
    "id": 818,
    "name": "Inteleon",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 85,
      "def": 65,
      "spa": 125,
      "spd": 65,
      "spe": 120
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Sniper",
    "sprite": "inteleon",
    "spriteId": "inteleon",
    "learnset": []
  },
  {
    "id": 818,
    "name": "Inteleon-Gmax",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 85,
      "def": 65,
      "spa": 125,
      "spd": 65,
      "spe": 120
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Sniper",
    "sprite": "inteleongmax",
    "spriteId": "inteleon-gmax",
    "learnset": []
  },
  {
    "id": 819,
    "name": "Skwovet",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 55,
      "def": 55,
      "spa": 35,
      "spd": 35,
      "spe": 25
    },
    "abilities": [
      "Cheek Pouch"
    ],
    "hiddenAbility": "Gluttony",
    "sprite": "skwovet",
    "spriteId": "skwovet",
    "learnset": []
  },
  {
    "id": 820,
    "name": "Greedent",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 95,
      "def": 95,
      "spa": 55,
      "spd": 75,
      "spe": 20
    },
    "abilities": [
      "Cheek Pouch"
    ],
    "hiddenAbility": "Gluttony",
    "sprite": "greedent",
    "spriteId": "greedent",
    "learnset": []
  },
  {
    "id": 821,
    "name": "Rookidee",
    "types": [
      "Flying"
    ],
    "baseStats": {
      "hp": 38,
      "atk": 47,
      "def": 35,
      "spa": 33,
      "spd": 35,
      "spe": 57
    },
    "abilities": [
      "Keen Eye",
      "Unnerve"
    ],
    "hiddenAbility": "Big Pecks",
    "sprite": "rookidee",
    "spriteId": "rookidee",
    "learnset": []
  },
  {
    "id": 822,
    "name": "Corvisquire",
    "types": [
      "Flying"
    ],
    "baseStats": {
      "hp": 68,
      "atk": 67,
      "def": 55,
      "spa": 43,
      "spd": 55,
      "spe": 77
    },
    "abilities": [
      "Keen Eye",
      "Unnerve"
    ],
    "hiddenAbility": "Big Pecks",
    "sprite": "corvisquire",
    "spriteId": "corvisquire",
    "learnset": []
  },
  {
    "id": 823,
    "name": "Corviknight",
    "types": [
      "Flying",
      "Steel"
    ],
    "baseStats": {
      "hp": 98,
      "atk": 87,
      "def": 105,
      "spa": 53,
      "spd": 85,
      "spe": 67
    },
    "abilities": [
      "Pressure",
      "Unnerve"
    ],
    "hiddenAbility": "Mirror Armor",
    "sprite": "corviknight",
    "spriteId": "corviknight",
    "learnset": []
  },
  {
    "id": 823,
    "name": "Corviknight-Gmax",
    "types": [
      "Flying",
      "Steel"
    ],
    "baseStats": {
      "hp": 98,
      "atk": 87,
      "def": 105,
      "spa": 53,
      "spd": 85,
      "spe": 67
    },
    "abilities": [
      "Pressure",
      "Unnerve"
    ],
    "hiddenAbility": "Mirror Armor",
    "sprite": "corviknightgmax",
    "spriteId": "corviknight-gmax",
    "learnset": []
  },
  {
    "id": 824,
    "name": "Blipbug",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 25,
      "atk": 20,
      "def": 20,
      "spa": 25,
      "spd": 45,
      "spe": 45
    },
    "abilities": [
      "Swarm",
      "Compound Eyes"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "blipbug",
    "spriteId": "blipbug",
    "learnset": []
  },
  {
    "id": 825,
    "name": "Dottler",
    "types": [
      "Bug",
      "Psychic"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 35,
      "def": 80,
      "spa": 50,
      "spd": 90,
      "spe": 30
    },
    "abilities": [
      "Swarm",
      "Compound Eyes"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "dottler",
    "spriteId": "dottler",
    "learnset": []
  },
  {
    "id": 826,
    "name": "Orbeetle",
    "types": [
      "Bug",
      "Psychic"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 45,
      "def": 110,
      "spa": 80,
      "spd": 120,
      "spe": 90
    },
    "abilities": [
      "Swarm",
      "Frisk"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "orbeetle",
    "spriteId": "orbeetle",
    "learnset": []
  },
  {
    "id": 826,
    "name": "Orbeetle-Gmax",
    "types": [
      "Bug",
      "Psychic"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 45,
      "def": 110,
      "spa": 80,
      "spd": 120,
      "spe": 90
    },
    "abilities": [
      "Swarm",
      "Frisk"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "orbeetlegmax",
    "spriteId": "orbeetle-gmax",
    "learnset": []
  },
  {
    "id": 827,
    "name": "Nickit",
    "types": [
      "Dark"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 28,
      "def": 28,
      "spa": 47,
      "spd": 52,
      "spe": 50
    },
    "abilities": [
      "Run Away",
      "Unburden"
    ],
    "hiddenAbility": "Stakeout",
    "sprite": "nickit",
    "spriteId": "nickit",
    "learnset": []
  },
  {
    "id": 828,
    "name": "Thievul",
    "types": [
      "Dark"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 58,
      "def": 58,
      "spa": 87,
      "spd": 92,
      "spe": 90
    },
    "abilities": [
      "Run Away",
      "Unburden"
    ],
    "hiddenAbility": "Stakeout",
    "sprite": "thievul",
    "spriteId": "thievul",
    "learnset": []
  },
  {
    "id": 829,
    "name": "Gossifleur",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 40,
      "def": 60,
      "spa": 40,
      "spd": 60,
      "spe": 10
    },
    "abilities": [
      "Cotton Down",
      "Regenerator"
    ],
    "hiddenAbility": "Effect Spore",
    "sprite": "gossifleur",
    "spriteId": "gossifleur",
    "learnset": []
  },
  {
    "id": 830,
    "name": "Eldegoss",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 50,
      "def": 90,
      "spa": 80,
      "spd": 120,
      "spe": 60
    },
    "abilities": [
      "Cotton Down",
      "Regenerator"
    ],
    "hiddenAbility": "Effect Spore",
    "sprite": "eldegoss",
    "spriteId": "eldegoss",
    "learnset": []
  },
  {
    "id": 831,
    "name": "Wooloo",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 42,
      "atk": 40,
      "def": 55,
      "spa": 40,
      "spd": 45,
      "spe": 48
    },
    "abilities": [
      "Fluffy",
      "Run Away"
    ],
    "hiddenAbility": "Bulletproof",
    "sprite": "wooloo",
    "spriteId": "wooloo",
    "learnset": []
  },
  {
    "id": 832,
    "name": "Dubwool",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 72,
      "atk": 80,
      "def": 100,
      "spa": 60,
      "spd": 90,
      "spe": 88
    },
    "abilities": [
      "Fluffy",
      "Steadfast"
    ],
    "hiddenAbility": "Bulletproof",
    "sprite": "dubwool",
    "spriteId": "dubwool",
    "learnset": []
  },
  {
    "id": 833,
    "name": "Chewtle",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 64,
      "def": 50,
      "spa": 38,
      "spd": 38,
      "spe": 44
    },
    "abilities": [
      "Strong Jaw",
      "Shell Armor"
    ],
    "hiddenAbility": "Swift Swim",
    "sprite": "chewtle",
    "spriteId": "chewtle",
    "learnset": []
  },
  {
    "id": 834,
    "name": "Drednaw",
    "types": [
      "Water",
      "Rock"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 115,
      "def": 90,
      "spa": 48,
      "spd": 68,
      "spe": 74
    },
    "abilities": [
      "Strong Jaw",
      "Shell Armor"
    ],
    "hiddenAbility": "Swift Swim",
    "sprite": "drednaw",
    "spriteId": "drednaw",
    "learnset": []
  },
  {
    "id": 834,
    "name": "Drednaw-Gmax",
    "types": [
      "Water",
      "Rock"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 115,
      "def": 90,
      "spa": 48,
      "spd": 68,
      "spe": 74
    },
    "abilities": [
      "Strong Jaw",
      "Shell Armor"
    ],
    "hiddenAbility": "Swift Swim",
    "sprite": "drednawgmax",
    "spriteId": "drednaw-gmax",
    "learnset": []
  },
  {
    "id": 835,
    "name": "Yamper",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 59,
      "atk": 45,
      "def": 50,
      "spa": 40,
      "spd": 50,
      "spe": 26
    },
    "abilities": [
      "Ball Fetch"
    ],
    "hiddenAbility": "Rattled",
    "sprite": "yamper",
    "spriteId": "yamper",
    "learnset": []
  },
  {
    "id": 836,
    "name": "Boltund",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 69,
      "atk": 90,
      "def": 60,
      "spa": 90,
      "spd": 60,
      "spe": 121
    },
    "abilities": [
      "Strong Jaw"
    ],
    "hiddenAbility": "Competitive",
    "sprite": "boltund",
    "spriteId": "boltund",
    "learnset": []
  },
  {
    "id": 837,
    "name": "Rolycoly",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 30,
      "atk": 40,
      "def": 50,
      "spa": 40,
      "spd": 50,
      "spe": 30
    },
    "abilities": [
      "Steam Engine",
      "Heatproof"
    ],
    "hiddenAbility": "Flash Fire",
    "sprite": "rolycoly",
    "spriteId": "rolycoly",
    "learnset": []
  },
  {
    "id": 838,
    "name": "Carkol",
    "types": [
      "Rock",
      "Fire"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 60,
      "def": 90,
      "spa": 60,
      "spd": 70,
      "spe": 50
    },
    "abilities": [
      "Steam Engine",
      "Flame Body"
    ],
    "hiddenAbility": "Flash Fire",
    "sprite": "carkol",
    "spriteId": "carkol",
    "learnset": []
  },
  {
    "id": 839,
    "name": "Coalossal",
    "types": [
      "Rock",
      "Fire"
    ],
    "baseStats": {
      "hp": 110,
      "atk": 80,
      "def": 120,
      "spa": 80,
      "spd": 90,
      "spe": 30
    },
    "abilities": [
      "Steam Engine",
      "Flame Body"
    ],
    "hiddenAbility": "Flash Fire",
    "sprite": "coalossal",
    "spriteId": "coalossal",
    "learnset": []
  },
  {
    "id": 839,
    "name": "Coalossal-Gmax",
    "types": [
      "Rock",
      "Fire"
    ],
    "baseStats": {
      "hp": 110,
      "atk": 80,
      "def": 120,
      "spa": 80,
      "spd": 90,
      "spe": 30
    },
    "abilities": [
      "Steam Engine",
      "Flame Body"
    ],
    "hiddenAbility": "Flash Fire",
    "sprite": "coalossalgmax",
    "spriteId": "coalossal-gmax",
    "learnset": []
  },
  {
    "id": 840,
    "name": "Applin",
    "types": [
      "Grass",
      "Dragon"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 40,
      "def": 80,
      "spa": 40,
      "spd": 40,
      "spe": 20
    },
    "abilities": [
      "Ripen",
      "Gluttony"
    ],
    "hiddenAbility": "Bulletproof",
    "sprite": "applin",
    "spriteId": "applin",
    "learnset": []
  },
  {
    "id": 841,
    "name": "Flapple",
    "types": [
      "Grass",
      "Dragon"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 110,
      "def": 80,
      "spa": 95,
      "spd": 60,
      "spe": 70
    },
    "abilities": [
      "Ripen",
      "Gluttony"
    ],
    "hiddenAbility": "Hustle",
    "sprite": "flapple",
    "spriteId": "flapple",
    "learnset": []
  },
  {
    "id": 841,
    "name": "Flapple-Gmax",
    "types": [
      "Grass",
      "Dragon"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 110,
      "def": 80,
      "spa": 95,
      "spd": 60,
      "spe": 70
    },
    "abilities": [
      "Ripen",
      "Gluttony"
    ],
    "hiddenAbility": "Hustle",
    "sprite": "flapplegmax",
    "spriteId": "flapple-gmax",
    "learnset": []
  },
  {
    "id": 842,
    "name": "Appletun",
    "types": [
      "Grass",
      "Dragon"
    ],
    "baseStats": {
      "hp": 110,
      "atk": 85,
      "def": 80,
      "spa": 100,
      "spd": 80,
      "spe": 30
    },
    "abilities": [
      "Ripen",
      "Gluttony"
    ],
    "hiddenAbility": "Thick Fat",
    "sprite": "appletun",
    "spriteId": "appletun",
    "learnset": []
  },
  {
    "id": 842,
    "name": "Appletun-Gmax",
    "types": [
      "Grass",
      "Dragon"
    ],
    "baseStats": {
      "hp": 110,
      "atk": 85,
      "def": 80,
      "spa": 100,
      "spd": 80,
      "spe": 30
    },
    "abilities": [
      "Ripen",
      "Gluttony"
    ],
    "hiddenAbility": "Thick Fat",
    "sprite": "appletungmax",
    "spriteId": "appletun-gmax",
    "learnset": []
  },
  {
    "id": 843,
    "name": "Silicobra",
    "types": [
      "Ground"
    ],
    "baseStats": {
      "hp": 52,
      "atk": 57,
      "def": 75,
      "spa": 35,
      "spd": 50,
      "spe": 46
    },
    "abilities": [
      "Sand Spit",
      "Shed Skin"
    ],
    "hiddenAbility": "Sand Veil",
    "sprite": "silicobra",
    "spriteId": "silicobra",
    "learnset": []
  },
  {
    "id": 844,
    "name": "Sandaconda",
    "types": [
      "Ground"
    ],
    "baseStats": {
      "hp": 72,
      "atk": 107,
      "def": 125,
      "spa": 65,
      "spd": 70,
      "spe": 71
    },
    "abilities": [
      "Sand Spit",
      "Shed Skin"
    ],
    "hiddenAbility": "Sand Veil",
    "sprite": "sandaconda",
    "spriteId": "sandaconda",
    "learnset": []
  },
  {
    "id": 844,
    "name": "Sandaconda-Gmax",
    "types": [
      "Ground"
    ],
    "baseStats": {
      "hp": 72,
      "atk": 107,
      "def": 125,
      "spa": 65,
      "spd": 70,
      "spe": 71
    },
    "abilities": [
      "Sand Spit",
      "Shed Skin"
    ],
    "hiddenAbility": "Sand Veil",
    "sprite": "sandacondagmax",
    "spriteId": "sandaconda-gmax",
    "learnset": []
  },
  {
    "id": 845,
    "name": "Cramorant",
    "types": [
      "Flying",
      "Water"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 85,
      "def": 55,
      "spa": 85,
      "spd": 95,
      "spe": 85
    },
    "abilities": [
      "Gulp Missile"
    ],
    "hiddenAbility": "",
    "sprite": "cramorant",
    "spriteId": "cramorant",
    "learnset": []
  },
  {
    "id": 845,
    "name": "Cramorant-Gulping",
    "types": [
      "Flying",
      "Water"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 85,
      "def": 55,
      "spa": 85,
      "spd": 95,
      "spe": 85
    },
    "abilities": [
      "Gulp Missile"
    ],
    "hiddenAbility": "",
    "sprite": "cramorantgulping",
    "spriteId": "cramorant-gulping",
    "learnset": []
  },
  {
    "id": 845,
    "name": "Cramorant-Gorging",
    "types": [
      "Flying",
      "Water"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 85,
      "def": 55,
      "spa": 85,
      "spd": 95,
      "spe": 85
    },
    "abilities": [
      "Gulp Missile"
    ],
    "hiddenAbility": "",
    "sprite": "cramorantgorging",
    "spriteId": "cramorant-gorging",
    "learnset": []
  },
  {
    "id": 846,
    "name": "Arrokuda",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 41,
      "atk": 63,
      "def": 40,
      "spa": 40,
      "spd": 30,
      "spe": 66
    },
    "abilities": [
      "Swift Swim"
    ],
    "hiddenAbility": "Propeller Tail",
    "sprite": "arrokuda",
    "spriteId": "arrokuda",
    "learnset": []
  },
  {
    "id": 847,
    "name": "Barraskewda",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 61,
      "atk": 123,
      "def": 60,
      "spa": 60,
      "spd": 50,
      "spe": 136
    },
    "abilities": [
      "Swift Swim"
    ],
    "hiddenAbility": "Propeller Tail",
    "sprite": "barraskewda",
    "spriteId": "barraskewda",
    "learnset": []
  },
  {
    "id": 848,
    "name": "Toxel",
    "types": [
      "Electric",
      "Poison"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 38,
      "def": 35,
      "spa": 54,
      "spd": 35,
      "spe": 40
    },
    "abilities": [
      "Rattled",
      "Static"
    ],
    "hiddenAbility": "Klutz",
    "sprite": "toxel",
    "spriteId": "toxel",
    "learnset": []
  },
  {
    "id": 849,
    "name": "Toxtricity",
    "types": [
      "Electric",
      "Poison"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 98,
      "def": 70,
      "spa": 114,
      "spd": 70,
      "spe": 75
    },
    "abilities": [
      "Punk Rock",
      "Plus"
    ],
    "hiddenAbility": "Technician",
    "sprite": "toxtricity",
    "spriteId": "toxtricity",
    "learnset": []
  },
  {
    "id": 849,
    "name": "Toxtricity-Low-Key",
    "types": [
      "Electric",
      "Poison"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 98,
      "def": 70,
      "spa": 114,
      "spd": 70,
      "spe": 75
    },
    "abilities": [
      "Punk Rock",
      "Minus"
    ],
    "hiddenAbility": "Technician",
    "sprite": "toxtricitylowkey",
    "spriteId": "toxtricity-lowkey",
    "learnset": []
  },
  {
    "id": 849,
    "name": "Toxtricity-Gmax",
    "types": [
      "Electric",
      "Poison"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 98,
      "def": 70,
      "spa": 114,
      "spd": 70,
      "spe": 75
    },
    "abilities": [
      "Punk Rock",
      "Plus"
    ],
    "hiddenAbility": "Technician",
    "sprite": "toxtricitygmax",
    "spriteId": "toxtricity-gmax",
    "learnset": []
  },
  {
    "id": 849,
    "name": "Toxtricity-Low-Key-Gmax",
    "types": [
      "Electric",
      "Poison"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 98,
      "def": 70,
      "spa": 114,
      "spd": 70,
      "spe": 75
    },
    "abilities": [
      "Punk Rock",
      "Minus"
    ],
    "hiddenAbility": "Technician",
    "sprite": "toxtricitylowkeygmax",
    "spriteId": "toxtricity-lowkeygmax",
    "learnset": []
  },
  {
    "id": 850,
    "name": "Sizzlipede",
    "types": [
      "Fire",
      "Bug"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 65,
      "def": 45,
      "spa": 50,
      "spd": 50,
      "spe": 45
    },
    "abilities": [
      "Flash Fire",
      "White Smoke"
    ],
    "hiddenAbility": "Flame Body",
    "sprite": "sizzlipede",
    "spriteId": "sizzlipede",
    "learnset": []
  },
  {
    "id": 851,
    "name": "Centiskorch",
    "types": [
      "Fire",
      "Bug"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 115,
      "def": 65,
      "spa": 90,
      "spd": 90,
      "spe": 65
    },
    "abilities": [
      "Flash Fire",
      "White Smoke"
    ],
    "hiddenAbility": "Flame Body",
    "sprite": "centiskorch",
    "spriteId": "centiskorch",
    "learnset": []
  },
  {
    "id": 851,
    "name": "Centiskorch-Gmax",
    "types": [
      "Fire",
      "Bug"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 115,
      "def": 65,
      "spa": 90,
      "spd": 90,
      "spe": 65
    },
    "abilities": [
      "Flash Fire",
      "White Smoke"
    ],
    "hiddenAbility": "Flame Body",
    "sprite": "centiskorchgmax",
    "spriteId": "centiskorch-gmax",
    "learnset": []
  },
  {
    "id": 852,
    "name": "Clobbopus",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 68,
      "def": 60,
      "spa": 50,
      "spd": 50,
      "spe": 32
    },
    "abilities": [
      "Limber"
    ],
    "hiddenAbility": "Technician",
    "sprite": "clobbopus",
    "spriteId": "clobbopus",
    "learnset": []
  },
  {
    "id": 853,
    "name": "Grapploct",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 118,
      "def": 90,
      "spa": 70,
      "spd": 80,
      "spe": 42
    },
    "abilities": [
      "Limber"
    ],
    "hiddenAbility": "Technician",
    "sprite": "grapploct",
    "spriteId": "grapploct",
    "learnset": []
  },
  {
    "id": 854,
    "name": "Sinistea",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 45,
      "def": 45,
      "spa": 74,
      "spd": 54,
      "spe": 50
    },
    "abilities": [
      "Weak Armor"
    ],
    "hiddenAbility": "Cursed Body",
    "sprite": "sinistea",
    "spriteId": "sinistea",
    "learnset": []
  },
  {
    "id": 854,
    "name": "Sinistea-Antique",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 45,
      "def": 45,
      "spa": 74,
      "spd": 54,
      "spe": 50
    },
    "abilities": [
      "Weak Armor"
    ],
    "hiddenAbility": "Cursed Body",
    "sprite": "sinisteaantique",
    "spriteId": "sinistea-antique",
    "learnset": []
  },
  {
    "id": 855,
    "name": "Polteageist",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 65,
      "def": 65,
      "spa": 134,
      "spd": 114,
      "spe": 70
    },
    "abilities": [
      "Weak Armor"
    ],
    "hiddenAbility": "Cursed Body",
    "sprite": "polteageist",
    "spriteId": "polteageist",
    "learnset": []
  },
  {
    "id": 855,
    "name": "Polteageist-Antique",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 65,
      "def": 65,
      "spa": 134,
      "spd": 114,
      "spe": 70
    },
    "abilities": [
      "Weak Armor"
    ],
    "hiddenAbility": "Cursed Body",
    "sprite": "polteageistantique",
    "spriteId": "polteageist-antique",
    "learnset": []
  },
  {
    "id": 856,
    "name": "Hatenna",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 42,
      "atk": 30,
      "def": 45,
      "spa": 56,
      "spd": 53,
      "spe": 39
    },
    "abilities": [
      "Healer",
      "Anticipation"
    ],
    "hiddenAbility": "Magic Bounce",
    "sprite": "hatenna",
    "spriteId": "hatenna",
    "learnset": []
  },
  {
    "id": 857,
    "name": "Hattrem",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 57,
      "atk": 40,
      "def": 65,
      "spa": 86,
      "spd": 73,
      "spe": 49
    },
    "abilities": [
      "Healer",
      "Anticipation"
    ],
    "hiddenAbility": "Magic Bounce",
    "sprite": "hattrem",
    "spriteId": "hattrem",
    "learnset": []
  },
  {
    "id": 858,
    "name": "Hatterene",
    "types": [
      "Psychic",
      "Fairy"
    ],
    "baseStats": {
      "hp": 57,
      "atk": 90,
      "def": 95,
      "spa": 136,
      "spd": 103,
      "spe": 29
    },
    "abilities": [
      "Healer",
      "Anticipation"
    ],
    "hiddenAbility": "Magic Bounce",
    "sprite": "hatterene",
    "spriteId": "hatterene",
    "learnset": []
  },
  {
    "id": 858,
    "name": "Hatterene-Gmax",
    "types": [
      "Psychic",
      "Fairy"
    ],
    "baseStats": {
      "hp": 57,
      "atk": 90,
      "def": 95,
      "spa": 136,
      "spd": 103,
      "spe": 29
    },
    "abilities": [
      "Healer",
      "Anticipation"
    ],
    "hiddenAbility": "Magic Bounce",
    "sprite": "hatterenegmax",
    "spriteId": "hatterene-gmax",
    "learnset": []
  },
  {
    "id": 859,
    "name": "Impidimp",
    "types": [
      "Dark",
      "Fairy"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 45,
      "def": 30,
      "spa": 55,
      "spd": 40,
      "spe": 50
    },
    "abilities": [
      "Prankster",
      "Frisk"
    ],
    "hiddenAbility": "Pickpocket",
    "sprite": "impidimp",
    "spriteId": "impidimp",
    "learnset": []
  },
  {
    "id": 860,
    "name": "Morgrem",
    "types": [
      "Dark",
      "Fairy"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 60,
      "def": 45,
      "spa": 75,
      "spd": 55,
      "spe": 70
    },
    "abilities": [
      "Prankster",
      "Frisk"
    ],
    "hiddenAbility": "Pickpocket",
    "sprite": "morgrem",
    "spriteId": "morgrem",
    "learnset": []
  },
  {
    "id": 861,
    "name": "Grimmsnarl",
    "types": [
      "Dark",
      "Fairy"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 120,
      "def": 65,
      "spa": 95,
      "spd": 75,
      "spe": 60
    },
    "abilities": [
      "Prankster",
      "Frisk"
    ],
    "hiddenAbility": "Pickpocket",
    "sprite": "grimmsnarl",
    "spriteId": "grimmsnarl",
    "learnset": []
  },
  {
    "id": 861,
    "name": "Grimmsnarl-Gmax",
    "types": [
      "Dark",
      "Fairy"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 120,
      "def": 65,
      "spa": 95,
      "spd": 75,
      "spe": 60
    },
    "abilities": [
      "Prankster",
      "Frisk"
    ],
    "hiddenAbility": "Pickpocket",
    "sprite": "grimmsnarlgmax",
    "spriteId": "grimmsnarl-gmax",
    "learnset": []
  },
  {
    "id": 862,
    "name": "Obstagoon",
    "types": [
      "Dark",
      "Normal"
    ],
    "baseStats": {
      "hp": 93,
      "atk": 90,
      "def": 101,
      "spa": 60,
      "spd": 81,
      "spe": 95
    },
    "abilities": [
      "Reckless",
      "Guts"
    ],
    "hiddenAbility": "Defiant",
    "sprite": "obstagoon",
    "spriteId": "obstagoon",
    "learnset": []
  },
  {
    "id": 863,
    "name": "Perrserker",
    "types": [
      "Steel"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 110,
      "def": 100,
      "spa": 50,
      "spd": 60,
      "spe": 50
    },
    "abilities": [
      "Battle Armor",
      "Tough Claws"
    ],
    "hiddenAbility": "Steely Spirit",
    "sprite": "perrserker",
    "spriteId": "perrserker",
    "learnset": []
  },
  {
    "id": 864,
    "name": "Cursola",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 95,
      "def": 50,
      "spa": 145,
      "spd": 130,
      "spe": 30
    },
    "abilities": [
      "Weak Armor"
    ],
    "hiddenAbility": "Perish Body",
    "sprite": "cursola",
    "spriteId": "cursola",
    "learnset": []
  },
  {
    "id": 865,
    "name": "Sirfetch’d",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 62,
      "atk": 135,
      "def": 95,
      "spa": 68,
      "spd": 82,
      "spe": 65
    },
    "abilities": [
      "Steadfast"
    ],
    "hiddenAbility": "Scrappy",
    "sprite": "sirfetchd",
    "spriteId": "sirfetchd",
    "learnset": []
  },
  {
    "id": 866,
    "name": "Mr. Rime",
    "types": [
      "Ice",
      "Psychic"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 85,
      "def": 75,
      "spa": 110,
      "spd": 100,
      "spe": 70
    },
    "abilities": [
      "Tangled Feet",
      "Screen Cleaner"
    ],
    "hiddenAbility": "Ice Body",
    "sprite": "mrrime",
    "spriteId": "mrrime",
    "learnset": []
  },
  {
    "id": 867,
    "name": "Runerigus",
    "types": [
      "Ground",
      "Ghost"
    ],
    "baseStats": {
      "hp": 58,
      "atk": 95,
      "def": 145,
      "spa": 50,
      "spd": 105,
      "spe": 30
    },
    "abilities": [
      "Wandering Spirit"
    ],
    "hiddenAbility": "",
    "sprite": "runerigus",
    "spriteId": "runerigus",
    "learnset": []
  },
  {
    "id": 868,
    "name": "Milcery",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 40,
      "def": 40,
      "spa": 50,
      "spd": 61,
      "spe": 34
    },
    "abilities": [
      "Sweet Veil"
    ],
    "hiddenAbility": "Aroma Veil",
    "sprite": "milcery",
    "spriteId": "milcery",
    "learnset": []
  },
  {
    "id": 869,
    "name": "Alcremie",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 60,
      "def": 75,
      "spa": 110,
      "spd": 121,
      "spe": 64
    },
    "abilities": [
      "Sweet Veil"
    ],
    "hiddenAbility": "Aroma Veil",
    "sprite": "alcremie",
    "spriteId": "alcremie",
    "learnset": []
  },
  {
    "id": 869,
    "name": "Alcremie-Gmax",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 60,
      "def": 75,
      "spa": 110,
      "spd": 121,
      "spe": 64
    },
    "abilities": [
      "Sweet Veil"
    ],
    "hiddenAbility": "Aroma Veil",
    "sprite": "alcremiegmax",
    "spriteId": "alcremie-gmax",
    "learnset": []
  },
  {
    "id": 870,
    "name": "Falinks",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 100,
      "def": 100,
      "spa": 70,
      "spd": 60,
      "spe": 75
    },
    "abilities": [
      "Battle Armor"
    ],
    "hiddenAbility": "Defiant",
    "sprite": "falinks",
    "spriteId": "falinks",
    "learnset": []
  },
  {
    "id": 870,
    "name": "Falinks-Mega",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 135,
      "def": 135,
      "spa": 70,
      "spd": 65,
      "spe": 100
    },
    "abilities": [
      "Defiant"
    ],
    "hiddenAbility": "",
    "sprite": "falinksmega",
    "spriteId": "falinks-mega",
    "learnset": []
  },
  {
    "id": 871,
    "name": "Pincurchin",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 48,
      "atk": 101,
      "def": 95,
      "spa": 91,
      "spd": 85,
      "spe": 15
    },
    "abilities": [
      "Lightning Rod"
    ],
    "hiddenAbility": "Electric Surge",
    "sprite": "pincurchin",
    "spriteId": "pincurchin",
    "learnset": []
  },
  {
    "id": 872,
    "name": "Snom",
    "types": [
      "Ice",
      "Bug"
    ],
    "baseStats": {
      "hp": 30,
      "atk": 25,
      "def": 35,
      "spa": 45,
      "spd": 30,
      "spe": 20
    },
    "abilities": [
      "Shield Dust"
    ],
    "hiddenAbility": "Ice Scales",
    "sprite": "snom",
    "spriteId": "snom",
    "learnset": []
  },
  {
    "id": 873,
    "name": "Frosmoth",
    "types": [
      "Ice",
      "Bug"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 65,
      "def": 60,
      "spa": 125,
      "spd": 90,
      "spe": 65
    },
    "abilities": [
      "Shield Dust"
    ],
    "hiddenAbility": "Ice Scales",
    "sprite": "frosmoth",
    "spriteId": "frosmoth",
    "learnset": []
  },
  {
    "id": 874,
    "name": "Stonjourner",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 125,
      "def": 135,
      "spa": 20,
      "spd": 20,
      "spe": 70
    },
    "abilities": [
      "Power Spot"
    ],
    "hiddenAbility": "",
    "sprite": "stonjourner",
    "spriteId": "stonjourner",
    "learnset": []
  },
  {
    "id": 875,
    "name": "Eiscue",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 80,
      "def": 110,
      "spa": 65,
      "spd": 90,
      "spe": 50
    },
    "abilities": [
      "Ice Face"
    ],
    "hiddenAbility": "",
    "sprite": "eiscue",
    "spriteId": "eiscue",
    "learnset": []
  },
  {
    "id": 875,
    "name": "Eiscue-Noice",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 80,
      "def": 70,
      "spa": 65,
      "spd": 50,
      "spe": 130
    },
    "abilities": [
      "Ice Face"
    ],
    "hiddenAbility": "",
    "sprite": "eiscuenoice",
    "spriteId": "eiscue-noice",
    "learnset": []
  },
  {
    "id": 876,
    "name": "Indeedee",
    "types": [
      "Psychic",
      "Normal"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 65,
      "def": 55,
      "spa": 105,
      "spd": 95,
      "spe": 95
    },
    "abilities": [
      "Inner Focus",
      "Synchronize"
    ],
    "hiddenAbility": "Psychic Surge",
    "sprite": "indeedee",
    "spriteId": "indeedee",
    "learnset": []
  },
  {
    "id": 876,
    "name": "Indeedee-F",
    "types": [
      "Psychic",
      "Normal"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 55,
      "def": 65,
      "spa": 95,
      "spd": 105,
      "spe": 85
    },
    "abilities": [
      "Own Tempo",
      "Synchronize"
    ],
    "hiddenAbility": "Psychic Surge",
    "sprite": "indeedeef",
    "spriteId": "indeedee-f",
    "learnset": []
  },
  {
    "id": 877,
    "name": "Morpeko",
    "types": [
      "Electric",
      "Dark"
    ],
    "baseStats": {
      "hp": 58,
      "atk": 95,
      "def": 58,
      "spa": 70,
      "spd": 58,
      "spe": 97
    },
    "abilities": [
      "Hunger Switch"
    ],
    "hiddenAbility": "",
    "sprite": "morpeko",
    "spriteId": "morpeko",
    "learnset": []
  },
  {
    "id": 877,
    "name": "Morpeko-Hangry",
    "types": [
      "Electric",
      "Dark"
    ],
    "baseStats": {
      "hp": 58,
      "atk": 95,
      "def": 58,
      "spa": 70,
      "spd": 58,
      "spe": 97
    },
    "abilities": [
      "Hunger Switch"
    ],
    "hiddenAbility": "",
    "sprite": "morpekohangry",
    "spriteId": "morpeko-hangry",
    "learnset": []
  },
  {
    "id": 878,
    "name": "Cufant",
    "types": [
      "Steel"
    ],
    "baseStats": {
      "hp": 72,
      "atk": 80,
      "def": 49,
      "spa": 40,
      "spd": 49,
      "spe": 40
    },
    "abilities": [
      "Sheer Force"
    ],
    "hiddenAbility": "Heavy Metal",
    "sprite": "cufant",
    "spriteId": "cufant",
    "learnset": []
  },
  {
    "id": 879,
    "name": "Copperajah",
    "types": [
      "Steel"
    ],
    "baseStats": {
      "hp": 122,
      "atk": 130,
      "def": 69,
      "spa": 80,
      "spd": 69,
      "spe": 30
    },
    "abilities": [
      "Sheer Force"
    ],
    "hiddenAbility": "Heavy Metal",
    "sprite": "copperajah",
    "spriteId": "copperajah",
    "learnset": []
  },
  {
    "id": 879,
    "name": "Copperajah-Gmax",
    "types": [
      "Steel"
    ],
    "baseStats": {
      "hp": 122,
      "atk": 130,
      "def": 69,
      "spa": 80,
      "spd": 69,
      "spe": 30
    },
    "abilities": [
      "Sheer Force"
    ],
    "hiddenAbility": "Heavy Metal",
    "sprite": "copperajahgmax",
    "spriteId": "copperajah-gmax",
    "learnset": []
  },
  {
    "id": 880,
    "name": "Dracozolt",
    "types": [
      "Electric",
      "Dragon"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 100,
      "def": 90,
      "spa": 80,
      "spd": 70,
      "spe": 75
    },
    "abilities": [
      "Volt Absorb",
      "Hustle"
    ],
    "hiddenAbility": "Sand Rush",
    "sprite": "dracozolt",
    "spriteId": "dracozolt",
    "learnset": []
  },
  {
    "id": 881,
    "name": "Arctozolt",
    "types": [
      "Electric",
      "Ice"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 100,
      "def": 90,
      "spa": 90,
      "spd": 80,
      "spe": 55
    },
    "abilities": [
      "Volt Absorb",
      "Static"
    ],
    "hiddenAbility": "Slush Rush",
    "sprite": "arctozolt",
    "spriteId": "arctozolt",
    "learnset": []
  },
  {
    "id": 882,
    "name": "Dracovish",
    "types": [
      "Water",
      "Dragon"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 90,
      "def": 100,
      "spa": 70,
      "spd": 80,
      "spe": 75
    },
    "abilities": [
      "Water Absorb",
      "Strong Jaw"
    ],
    "hiddenAbility": "Sand Rush",
    "sprite": "dracovish",
    "spriteId": "dracovish",
    "learnset": []
  },
  {
    "id": 883,
    "name": "Arctovish",
    "types": [
      "Water",
      "Ice"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 90,
      "def": 100,
      "spa": 80,
      "spd": 90,
      "spe": 55
    },
    "abilities": [
      "Water Absorb",
      "Ice Body"
    ],
    "hiddenAbility": "Slush Rush",
    "sprite": "arctovish",
    "spriteId": "arctovish",
    "learnset": []
  },
  {
    "id": 884,
    "name": "Duraludon",
    "types": [
      "Steel",
      "Dragon"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 95,
      "def": 115,
      "spa": 120,
      "spd": 50,
      "spe": 85
    },
    "abilities": [
      "Light Metal",
      "Heavy Metal"
    ],
    "hiddenAbility": "Stalwart",
    "sprite": "duraludon",
    "spriteId": "duraludon",
    "learnset": []
  },
  {
    "id": 884,
    "name": "Duraludon-Gmax",
    "types": [
      "Steel",
      "Dragon"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 95,
      "def": 115,
      "spa": 120,
      "spd": 50,
      "spe": 85
    },
    "abilities": [
      "Light Metal",
      "Heavy Metal"
    ],
    "hiddenAbility": "Stalwart",
    "sprite": "duraludongmax",
    "spriteId": "duraludon-gmax",
    "learnset": []
  },
  {
    "id": 885,
    "name": "Dreepy",
    "types": [
      "Dragon",
      "Ghost"
    ],
    "baseStats": {
      "hp": 28,
      "atk": 60,
      "def": 30,
      "spa": 40,
      "spd": 30,
      "spe": 82
    },
    "abilities": [
      "Clear Body",
      "Infiltrator"
    ],
    "hiddenAbility": "Cursed Body",
    "sprite": "dreepy",
    "spriteId": "dreepy",
    "learnset": []
  },
  {
    "id": 886,
    "name": "Drakloak",
    "types": [
      "Dragon",
      "Ghost"
    ],
    "baseStats": {
      "hp": 68,
      "atk": 80,
      "def": 50,
      "spa": 60,
      "spd": 50,
      "spe": 102
    },
    "abilities": [
      "Clear Body",
      "Infiltrator"
    ],
    "hiddenAbility": "Cursed Body",
    "sprite": "drakloak",
    "spriteId": "drakloak",
    "learnset": []
  },
  {
    "id": 887,
    "name": "Dragapult",
    "types": [
      "Dragon",
      "Ghost"
    ],
    "baseStats": {
      "hp": 88,
      "atk": 120,
      "def": 75,
      "spa": 100,
      "spd": 75,
      "spe": 142
    },
    "abilities": [
      "Clear Body",
      "Infiltrator"
    ],
    "hiddenAbility": "Cursed Body",
    "sprite": "dragapult",
    "spriteId": "dragapult",
    "learnset": []
  },
  {
    "id": 888,
    "name": "Zacian",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 92,
      "atk": 120,
      "def": 115,
      "spa": 80,
      "spd": 115,
      "spe": 138
    },
    "abilities": [
      "Intrepid Sword"
    ],
    "hiddenAbility": "",
    "sprite": "zacian",
    "spriteId": "zacian",
    "learnset": []
  },
  {
    "id": 888,
    "name": "Zacian-Crowned",
    "types": [
      "Fairy",
      "Steel"
    ],
    "baseStats": {
      "hp": 92,
      "atk": 150,
      "def": 115,
      "spa": 80,
      "spd": 115,
      "spe": 148
    },
    "abilities": [
      "Intrepid Sword"
    ],
    "hiddenAbility": "",
    "sprite": "zaciancrowned",
    "spriteId": "zacian-crowned",
    "learnset": []
  },
  {
    "id": 889,
    "name": "Zamazenta",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 92,
      "atk": 120,
      "def": 115,
      "spa": 80,
      "spd": 115,
      "spe": 138
    },
    "abilities": [
      "Dauntless Shield"
    ],
    "hiddenAbility": "",
    "sprite": "zamazenta",
    "spriteId": "zamazenta",
    "learnset": []
  },
  {
    "id": 889,
    "name": "Zamazenta-Crowned",
    "types": [
      "Fighting",
      "Steel"
    ],
    "baseStats": {
      "hp": 92,
      "atk": 120,
      "def": 140,
      "spa": 80,
      "spd": 140,
      "spe": 128
    },
    "abilities": [
      "Dauntless Shield"
    ],
    "hiddenAbility": "",
    "sprite": "zamazentacrowned",
    "spriteId": "zamazenta-crowned",
    "learnset": []
  },
  {
    "id": 890,
    "name": "Eternatus",
    "types": [
      "Poison",
      "Dragon"
    ],
    "baseStats": {
      "hp": 140,
      "atk": 85,
      "def": 95,
      "spa": 145,
      "spd": 95,
      "spe": 130
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "",
    "sprite": "eternatus",
    "spriteId": "eternatus",
    "learnset": []
  },
  {
    "id": 890,
    "name": "Eternatus-Eternamax",
    "types": [
      "Poison",
      "Dragon"
    ],
    "baseStats": {
      "hp": 255,
      "atk": 115,
      "def": 250,
      "spa": 125,
      "spd": 250,
      "spe": 130
    },
    "abilities": [
      "Pressure"
    ],
    "hiddenAbility": "",
    "sprite": "eternatuseternamax",
    "spriteId": "eternatus-eternamax",
    "learnset": []
  },
  {
    "id": 891,
    "name": "Kubfu",
    "types": [
      "Fighting"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 90,
      "def": 60,
      "spa": 53,
      "spd": 50,
      "spe": 72
    },
    "abilities": [
      "Inner Focus"
    ],
    "hiddenAbility": "",
    "sprite": "kubfu",
    "spriteId": "kubfu",
    "learnset": []
  },
  {
    "id": 892,
    "name": "Urshifu",
    "types": [
      "Fighting",
      "Dark"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 130,
      "def": 100,
      "spa": 63,
      "spd": 60,
      "spe": 97
    },
    "abilities": [
      "Unseen Fist"
    ],
    "hiddenAbility": "",
    "sprite": "urshifu",
    "spriteId": "urshifu",
    "learnset": []
  },
  {
    "id": 892,
    "name": "Urshifu-Rapid-Strike",
    "types": [
      "Fighting",
      "Water"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 130,
      "def": 100,
      "spa": 63,
      "spd": 60,
      "spe": 97
    },
    "abilities": [
      "Unseen Fist"
    ],
    "hiddenAbility": "",
    "sprite": "urshifurapidstrike",
    "spriteId": "urshifu-rapidstrike",
    "learnset": []
  },
  {
    "id": 892,
    "name": "Urshifu-Gmax",
    "types": [
      "Fighting",
      "Dark"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 130,
      "def": 100,
      "spa": 63,
      "spd": 60,
      "spe": 97
    },
    "abilities": [
      "Unseen Fist"
    ],
    "hiddenAbility": "",
    "sprite": "urshifugmax",
    "spriteId": "urshifu-gmax",
    "learnset": []
  },
  {
    "id": 892,
    "name": "Urshifu-Rapid-Strike-Gmax",
    "types": [
      "Fighting",
      "Water"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 130,
      "def": 100,
      "spa": 63,
      "spd": 60,
      "spe": 97
    },
    "abilities": [
      "Unseen Fist"
    ],
    "hiddenAbility": "",
    "sprite": "urshifurapidstrikegmax",
    "spriteId": "urshifu-rapidstrikegmax",
    "learnset": []
  },
  {
    "id": 893,
    "name": "Zarude",
    "types": [
      "Dark",
      "Grass"
    ],
    "baseStats": {
      "hp": 105,
      "atk": 120,
      "def": 105,
      "spa": 70,
      "spd": 95,
      "spe": 105
    },
    "abilities": [
      "Leaf Guard"
    ],
    "hiddenAbility": "",
    "sprite": "zarude",
    "spriteId": "zarude",
    "learnset": []
  },
  {
    "id": 893,
    "name": "Zarude-Dada",
    "types": [
      "Dark",
      "Grass"
    ],
    "baseStats": {
      "hp": 105,
      "atk": 120,
      "def": 105,
      "spa": 70,
      "spd": 95,
      "spe": 105
    },
    "abilities": [
      "Leaf Guard"
    ],
    "hiddenAbility": "",
    "sprite": "zarudedada",
    "spriteId": "zarude-dada",
    "learnset": []
  },
  {
    "id": 894,
    "name": "Regieleki",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 100,
      "def": 50,
      "spa": 100,
      "spd": 50,
      "spe": 200
    },
    "abilities": [
      "Transistor"
    ],
    "hiddenAbility": "",
    "sprite": "regieleki",
    "spriteId": "regieleki",
    "learnset": []
  },
  {
    "id": 895,
    "name": "Regidrago",
    "types": [
      "Dragon"
    ],
    "baseStats": {
      "hp": 200,
      "atk": 100,
      "def": 50,
      "spa": 100,
      "spd": 50,
      "spe": 80
    },
    "abilities": [
      "Dragon's Maw"
    ],
    "hiddenAbility": "",
    "sprite": "regidrago",
    "spriteId": "regidrago",
    "learnset": []
  },
  {
    "id": 896,
    "name": "Glastrier",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 145,
      "def": 130,
      "spa": 65,
      "spd": 110,
      "spe": 30
    },
    "abilities": [
      "Chilling Neigh"
    ],
    "hiddenAbility": "",
    "sprite": "glastrier",
    "spriteId": "glastrier",
    "learnset": []
  },
  {
    "id": 897,
    "name": "Spectrier",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 65,
      "def": 60,
      "spa": 145,
      "spd": 80,
      "spe": 130
    },
    "abilities": [
      "Grim Neigh"
    ],
    "hiddenAbility": "",
    "sprite": "spectrier",
    "spriteId": "spectrier",
    "learnset": []
  },
  {
    "id": 898,
    "name": "Calyrex",
    "types": [
      "Psychic",
      "Grass"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 80,
      "def": 80,
      "spa": 80,
      "spd": 80,
      "spe": 80
    },
    "abilities": [
      "Unnerve"
    ],
    "hiddenAbility": "",
    "sprite": "calyrex",
    "spriteId": "calyrex",
    "learnset": []
  },
  {
    "id": 898,
    "name": "Calyrex-Ice",
    "types": [
      "Psychic",
      "Ice"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 165,
      "def": 150,
      "spa": 85,
      "spd": 130,
      "spe": 50
    },
    "abilities": [
      "As One (Glastrier)"
    ],
    "hiddenAbility": "",
    "sprite": "calyrexice",
    "spriteId": "calyrex-ice",
    "learnset": []
  },
  {
    "id": 898,
    "name": "Calyrex-Shadow",
    "types": [
      "Psychic",
      "Ghost"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 85,
      "def": 80,
      "spa": 165,
      "spd": 100,
      "spe": 150
    },
    "abilities": [
      "As One (Spectrier)"
    ],
    "hiddenAbility": "",
    "sprite": "calyrexshadow",
    "spriteId": "calyrex-shadow",
    "learnset": []
  },
  {
    "id": 899,
    "name": "Wyrdeer",
    "types": [
      "Normal",
      "Psychic"
    ],
    "baseStats": {
      "hp": 103,
      "atk": 105,
      "def": 72,
      "spa": 105,
      "spd": 75,
      "spe": 65
    },
    "abilities": [
      "Intimidate",
      "Frisk"
    ],
    "hiddenAbility": "Sap Sipper",
    "sprite": "wyrdeer",
    "spriteId": "wyrdeer",
    "learnset": []
  },
  {
    "id": 900,
    "name": "Kleavor",
    "types": [
      "Bug",
      "Rock"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 135,
      "def": 95,
      "spa": 45,
      "spd": 70,
      "spe": 85
    },
    "abilities": [
      "Swarm",
      "Sheer Force"
    ],
    "hiddenAbility": "Sharpness",
    "sprite": "kleavor",
    "spriteId": "kleavor",
    "learnset": []
  },
  {
    "id": 901,
    "name": "Ursaluna",
    "types": [
      "Ground",
      "Normal"
    ],
    "baseStats": {
      "hp": 130,
      "atk": 140,
      "def": 105,
      "spa": 45,
      "spd": 80,
      "spe": 50
    },
    "abilities": [
      "Guts",
      "Bulletproof"
    ],
    "hiddenAbility": "Unnerve",
    "sprite": "ursaluna",
    "spriteId": "ursaluna",
    "learnset": []
  },
  {
    "id": 901,
    "name": "Ursaluna-Bloodmoon",
    "types": [
      "Ground",
      "Normal"
    ],
    "baseStats": {
      "hp": 113,
      "atk": 70,
      "def": 120,
      "spa": 135,
      "spd": 65,
      "spe": 52
    },
    "abilities": [
      "Mind's Eye"
    ],
    "hiddenAbility": "",
    "sprite": "ursalunabloodmoon",
    "spriteId": "ursaluna-bloodmoon",
    "learnset": []
  },
  {
    "id": 902,
    "name": "Basculegion",
    "types": [
      "Water",
      "Ghost"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 112,
      "def": 65,
      "spa": 80,
      "spd": 75,
      "spe": 78
    },
    "abilities": [
      "Swift Swim",
      "Adaptability"
    ],
    "hiddenAbility": "Mold Breaker",
    "sprite": "basculegion",
    "spriteId": "basculegion",
    "learnset": []
  },
  {
    "id": 902,
    "name": "Basculegion-F",
    "types": [
      "Water",
      "Ghost"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 92,
      "def": 65,
      "spa": 100,
      "spd": 75,
      "spe": 78
    },
    "abilities": [
      "Swift Swim",
      "Adaptability"
    ],
    "hiddenAbility": "Mold Breaker",
    "sprite": "basculegionf",
    "spriteId": "basculegion-f",
    "learnset": []
  },
  {
    "id": 903,
    "name": "Sneasler",
    "types": [
      "Fighting",
      "Poison"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 130,
      "def": 60,
      "spa": 40,
      "spd": 80,
      "spe": 120
    },
    "abilities": [
      "Pressure",
      "Unburden"
    ],
    "hiddenAbility": "Poison Touch",
    "sprite": "sneasler",
    "spriteId": "sneasler",
    "learnset": []
  },
  {
    "id": 904,
    "name": "Overqwil",
    "types": [
      "Dark",
      "Poison"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 115,
      "def": 95,
      "spa": 65,
      "spd": 65,
      "spe": 85
    },
    "abilities": [
      "Poison Point",
      "Swift Swim"
    ],
    "hiddenAbility": "Intimidate",
    "sprite": "overqwil",
    "spriteId": "overqwil",
    "learnset": []
  },
  {
    "id": 905,
    "name": "Enamorus",
    "types": [
      "Fairy",
      "Flying"
    ],
    "baseStats": {
      "hp": 74,
      "atk": 115,
      "def": 70,
      "spa": 135,
      "spd": 80,
      "spe": 106
    },
    "abilities": [
      "Cute Charm"
    ],
    "hiddenAbility": "Contrary",
    "sprite": "enamorus",
    "spriteId": "enamorus",
    "learnset": []
  },
  {
    "id": 905,
    "name": "Enamorus-Therian",
    "types": [
      "Fairy",
      "Flying"
    ],
    "baseStats": {
      "hp": 74,
      "atk": 115,
      "def": 110,
      "spa": 135,
      "spd": 100,
      "spe": 46
    },
    "abilities": [
      "Overcoat"
    ],
    "hiddenAbility": "",
    "sprite": "enamorustherian",
    "spriteId": "enamorus-therian",
    "learnset": []
  },
  {
    "id": 906,
    "name": "Sprigatito",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 61,
      "def": 54,
      "spa": 45,
      "spd": 45,
      "spe": 65
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Protean",
    "sprite": "sprigatito",
    "spriteId": "sprigatito",
    "learnset": []
  },
  {
    "id": 907,
    "name": "Floragato",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 61,
      "atk": 80,
      "def": 63,
      "spa": 60,
      "spd": 63,
      "spe": 83
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Protean",
    "sprite": "floragato",
    "spriteId": "floragato",
    "learnset": []
  },
  {
    "id": 908,
    "name": "Meowscarada",
    "types": [
      "Grass",
      "Dark"
    ],
    "baseStats": {
      "hp": 76,
      "atk": 110,
      "def": 70,
      "spa": 81,
      "spd": 70,
      "spe": 123
    },
    "abilities": [
      "Overgrow"
    ],
    "hiddenAbility": "Protean",
    "sprite": "meowscarada",
    "spriteId": "meowscarada",
    "learnset": []
  },
  {
    "id": 909,
    "name": "Fuecoco",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 67,
      "atk": 45,
      "def": 59,
      "spa": 63,
      "spd": 40,
      "spe": 36
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Unaware",
    "sprite": "fuecoco",
    "spriteId": "fuecoco",
    "learnset": []
  },
  {
    "id": 910,
    "name": "Crocalor",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 81,
      "atk": 55,
      "def": 78,
      "spa": 90,
      "spd": 58,
      "spe": 49
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Unaware",
    "sprite": "crocalor",
    "spriteId": "crocalor",
    "learnset": []
  },
  {
    "id": 911,
    "name": "Skeledirge",
    "types": [
      "Fire",
      "Ghost"
    ],
    "baseStats": {
      "hp": 104,
      "atk": 75,
      "def": 100,
      "spa": 110,
      "spd": 75,
      "spe": 66
    },
    "abilities": [
      "Blaze"
    ],
    "hiddenAbility": "Unaware",
    "sprite": "skeledirge",
    "spriteId": "skeledirge",
    "learnset": []
  },
  {
    "id": 912,
    "name": "Quaxly",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 65,
      "def": 45,
      "spa": 50,
      "spd": 45,
      "spe": 50
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Moxie",
    "sprite": "quaxly",
    "spriteId": "quaxly",
    "learnset": []
  },
  {
    "id": 913,
    "name": "Quaxwell",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 85,
      "def": 65,
      "spa": 65,
      "spd": 60,
      "spe": 65
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Moxie",
    "sprite": "quaxwell",
    "spriteId": "quaxwell",
    "learnset": []
  },
  {
    "id": 914,
    "name": "Quaquaval",
    "types": [
      "Water",
      "Fighting"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 120,
      "def": 80,
      "spa": 85,
      "spd": 75,
      "spe": 85
    },
    "abilities": [
      "Torrent"
    ],
    "hiddenAbility": "Moxie",
    "sprite": "quaquaval",
    "spriteId": "quaquaval",
    "learnset": []
  },
  {
    "id": 915,
    "name": "Lechonk",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 54,
      "atk": 45,
      "def": 40,
      "spa": 35,
      "spd": 45,
      "spe": 35
    },
    "abilities": [
      "Aroma Veil",
      "Gluttony"
    ],
    "hiddenAbility": "Thick Fat",
    "sprite": "lechonk",
    "spriteId": "lechonk",
    "learnset": []
  },
  {
    "id": 916,
    "name": "Oinkologne",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 110,
      "atk": 100,
      "def": 75,
      "spa": 59,
      "spd": 80,
      "spe": 65
    },
    "abilities": [
      "Lingering Aroma",
      "Gluttony"
    ],
    "hiddenAbility": "Thick Fat",
    "sprite": "oinkologne",
    "spriteId": "oinkologne",
    "learnset": []
  },
  {
    "id": 916,
    "name": "Oinkologne-F",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 115,
      "atk": 90,
      "def": 70,
      "spa": 59,
      "spd": 90,
      "spe": 65
    },
    "abilities": [
      "Aroma Veil",
      "Gluttony"
    ],
    "hiddenAbility": "Thick Fat",
    "sprite": "oinkolognef",
    "spriteId": "oinkologne-f",
    "learnset": []
  },
  {
    "id": 917,
    "name": "Tarountula",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 41,
      "def": 45,
      "spa": 29,
      "spd": 40,
      "spe": 20
    },
    "abilities": [
      "Insomnia"
    ],
    "hiddenAbility": "Stakeout",
    "sprite": "tarountula",
    "spriteId": "tarountula",
    "learnset": []
  },
  {
    "id": 918,
    "name": "Spidops",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 79,
      "def": 92,
      "spa": 52,
      "spd": 86,
      "spe": 35
    },
    "abilities": [
      "Insomnia"
    ],
    "hiddenAbility": "Stakeout",
    "sprite": "spidops",
    "spriteId": "spidops",
    "learnset": []
  },
  {
    "id": 919,
    "name": "Nymble",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 33,
      "atk": 46,
      "def": 40,
      "spa": 21,
      "spd": 25,
      "spe": 45
    },
    "abilities": [
      "Swarm"
    ],
    "hiddenAbility": "Tinted Lens",
    "sprite": "nymble",
    "spriteId": "nymble",
    "learnset": []
  },
  {
    "id": 920,
    "name": "Lokix",
    "types": [
      "Bug",
      "Dark"
    ],
    "baseStats": {
      "hp": 71,
      "atk": 102,
      "def": 78,
      "spa": 52,
      "spd": 55,
      "spe": 92
    },
    "abilities": [
      "Swarm"
    ],
    "hiddenAbility": "Tinted Lens",
    "sprite": "lokix",
    "spriteId": "lokix",
    "learnset": []
  },
  {
    "id": 921,
    "name": "Pawmi",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 50,
      "def": 20,
      "spa": 40,
      "spd": 25,
      "spe": 60
    },
    "abilities": [
      "Static",
      "Natural Cure"
    ],
    "hiddenAbility": "Iron Fist",
    "sprite": "pawmi",
    "spriteId": "pawmi",
    "learnset": []
  },
  {
    "id": 922,
    "name": "Pawmo",
    "types": [
      "Electric",
      "Fighting"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 75,
      "def": 40,
      "spa": 50,
      "spd": 40,
      "spe": 85
    },
    "abilities": [
      "Volt Absorb",
      "Natural Cure"
    ],
    "hiddenAbility": "Iron Fist",
    "sprite": "pawmo",
    "spriteId": "pawmo",
    "learnset": []
  },
  {
    "id": 923,
    "name": "Pawmot",
    "types": [
      "Electric",
      "Fighting"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 115,
      "def": 70,
      "spa": 70,
      "spd": 60,
      "spe": 105
    },
    "abilities": [
      "Volt Absorb",
      "Natural Cure"
    ],
    "hiddenAbility": "Iron Fist",
    "sprite": "pawmot",
    "spriteId": "pawmot",
    "learnset": []
  },
  {
    "id": 924,
    "name": "Tandemaus",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 50,
      "def": 45,
      "spa": 40,
      "spd": 45,
      "spe": 75
    },
    "abilities": [
      "Run Away",
      "Pickup"
    ],
    "hiddenAbility": "Own Tempo",
    "sprite": "tandemaus",
    "spriteId": "tandemaus",
    "learnset": []
  },
  {
    "id": 925,
    "name": "Maushold",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 74,
      "atk": 75,
      "def": 70,
      "spa": 65,
      "spd": 75,
      "spe": 111
    },
    "abilities": [
      "Friend Guard",
      "Cheek Pouch"
    ],
    "hiddenAbility": "Technician",
    "sprite": "maushold",
    "spriteId": "maushold",
    "learnset": []
  },
  {
    "id": 925,
    "name": "Maushold-Four",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 74,
      "atk": 75,
      "def": 70,
      "spa": 65,
      "spd": 75,
      "spe": 111
    },
    "abilities": [
      "Friend Guard",
      "Cheek Pouch"
    ],
    "hiddenAbility": "Technician",
    "sprite": "mausholdfour",
    "spriteId": "maushold-four",
    "learnset": []
  },
  {
    "id": 926,
    "name": "Fidough",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 37,
      "atk": 55,
      "def": 70,
      "spa": 30,
      "spd": 55,
      "spe": 65
    },
    "abilities": [
      "Own Tempo"
    ],
    "hiddenAbility": "Klutz",
    "sprite": "fidough",
    "spriteId": "fidough",
    "learnset": []
  },
  {
    "id": 927,
    "name": "Dachsbun",
    "types": [
      "Fairy"
    ],
    "baseStats": {
      "hp": 57,
      "atk": 80,
      "def": 115,
      "spa": 50,
      "spd": 80,
      "spe": 95
    },
    "abilities": [
      "Well-Baked Body"
    ],
    "hiddenAbility": "Aroma Veil",
    "sprite": "dachsbun",
    "spriteId": "dachsbun",
    "learnset": []
  },
  {
    "id": 928,
    "name": "Smoliv",
    "types": [
      "Grass",
      "Normal"
    ],
    "baseStats": {
      "hp": 41,
      "atk": 35,
      "def": 45,
      "spa": 58,
      "spd": 51,
      "spe": 30
    },
    "abilities": [
      "Early Bird"
    ],
    "hiddenAbility": "Harvest",
    "sprite": "smoliv",
    "spriteId": "smoliv",
    "learnset": []
  },
  {
    "id": 929,
    "name": "Dolliv",
    "types": [
      "Grass",
      "Normal"
    ],
    "baseStats": {
      "hp": 52,
      "atk": 53,
      "def": 60,
      "spa": 78,
      "spd": 78,
      "spe": 33
    },
    "abilities": [
      "Early Bird"
    ],
    "hiddenAbility": "Harvest",
    "sprite": "dolliv",
    "spriteId": "dolliv",
    "learnset": []
  },
  {
    "id": 930,
    "name": "Arboliva",
    "types": [
      "Grass",
      "Normal"
    ],
    "baseStats": {
      "hp": 78,
      "atk": 69,
      "def": 90,
      "spa": 125,
      "spd": 109,
      "spe": 39
    },
    "abilities": [
      "Seed Sower"
    ],
    "hiddenAbility": "Harvest",
    "sprite": "arboliva",
    "spriteId": "arboliva",
    "learnset": []
  },
  {
    "id": 931,
    "name": "Squawkabilly",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 82,
      "atk": 96,
      "def": 51,
      "spa": 45,
      "spd": 51,
      "spe": 92
    },
    "abilities": [
      "Intimidate",
      "Hustle"
    ],
    "hiddenAbility": "Guts",
    "sprite": "squawkabilly",
    "spriteId": "squawkabilly",
    "learnset": []
  },
  {
    "id": 931,
    "name": "Squawkabilly-Blue",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 82,
      "atk": 96,
      "def": 51,
      "spa": 45,
      "spd": 51,
      "spe": 92
    },
    "abilities": [
      "Intimidate",
      "Hustle"
    ],
    "hiddenAbility": "Guts",
    "sprite": "squawkabillyblue",
    "spriteId": "squawkabilly-blue",
    "learnset": []
  },
  {
    "id": 931,
    "name": "Squawkabilly-Yellow",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 82,
      "atk": 96,
      "def": 51,
      "spa": 45,
      "spd": 51,
      "spe": 92
    },
    "abilities": [
      "Intimidate",
      "Hustle"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "squawkabillyyellow",
    "spriteId": "squawkabilly-yellow",
    "learnset": []
  },
  {
    "id": 931,
    "name": "Squawkabilly-White",
    "types": [
      "Normal",
      "Flying"
    ],
    "baseStats": {
      "hp": 82,
      "atk": 96,
      "def": 51,
      "spa": 45,
      "spd": 51,
      "spe": 92
    },
    "abilities": [
      "Intimidate",
      "Hustle"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "squawkabillywhite",
    "spriteId": "squawkabilly-white",
    "learnset": []
  },
  {
    "id": 932,
    "name": "Nacli",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 55,
      "def": 75,
      "spa": 35,
      "spd": 35,
      "spe": 25
    },
    "abilities": [
      "Purifying Salt",
      "Sturdy"
    ],
    "hiddenAbility": "Clear Body",
    "sprite": "nacli",
    "spriteId": "nacli",
    "learnset": []
  },
  {
    "id": 933,
    "name": "Naclstack",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 60,
      "def": 100,
      "spa": 35,
      "spd": 65,
      "spe": 35
    },
    "abilities": [
      "Purifying Salt",
      "Sturdy"
    ],
    "hiddenAbility": "Clear Body",
    "sprite": "naclstack",
    "spriteId": "naclstack",
    "learnset": []
  },
  {
    "id": 934,
    "name": "Garganacl",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 100,
      "def": 130,
      "spa": 45,
      "spd": 90,
      "spe": 35
    },
    "abilities": [
      "Purifying Salt",
      "Sturdy"
    ],
    "hiddenAbility": "Clear Body",
    "sprite": "garganacl",
    "spriteId": "garganacl",
    "learnset": []
  },
  {
    "id": 935,
    "name": "Charcadet",
    "types": [
      "Fire"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 50,
      "def": 40,
      "spa": 50,
      "spd": 40,
      "spe": 35
    },
    "abilities": [
      "Flash Fire"
    ],
    "hiddenAbility": "Flame Body",
    "sprite": "charcadet",
    "spriteId": "charcadet",
    "learnset": []
  },
  {
    "id": 936,
    "name": "Armarouge",
    "types": [
      "Fire",
      "Psychic"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 60,
      "def": 100,
      "spa": 125,
      "spd": 80,
      "spe": 75
    },
    "abilities": [
      "Flash Fire"
    ],
    "hiddenAbility": "Weak Armor",
    "sprite": "armarouge",
    "spriteId": "armarouge",
    "learnset": []
  },
  {
    "id": 937,
    "name": "Ceruledge",
    "types": [
      "Fire",
      "Ghost"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 125,
      "def": 80,
      "spa": 60,
      "spd": 100,
      "spe": 85
    },
    "abilities": [
      "Flash Fire"
    ],
    "hiddenAbility": "Weak Armor",
    "sprite": "ceruledge",
    "spriteId": "ceruledge",
    "learnset": []
  },
  {
    "id": 938,
    "name": "Tadbulb",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 61,
      "atk": 31,
      "def": 41,
      "spa": 59,
      "spd": 35,
      "spe": 45
    },
    "abilities": [
      "Own Tempo",
      "Static"
    ],
    "hiddenAbility": "Damp",
    "sprite": "tadbulb",
    "spriteId": "tadbulb",
    "learnset": []
  },
  {
    "id": 939,
    "name": "Bellibolt",
    "types": [
      "Electric"
    ],
    "baseStats": {
      "hp": 109,
      "atk": 64,
      "def": 91,
      "spa": 103,
      "spd": 83,
      "spe": 45
    },
    "abilities": [
      "Electromorphosis",
      "Static"
    ],
    "hiddenAbility": "Damp",
    "sprite": "bellibolt",
    "spriteId": "bellibolt",
    "learnset": []
  },
  {
    "id": 940,
    "name": "Wattrel",
    "types": [
      "Electric",
      "Flying"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 40,
      "def": 35,
      "spa": 55,
      "spd": 40,
      "spe": 70
    },
    "abilities": [
      "Wind Power",
      "Volt Absorb"
    ],
    "hiddenAbility": "Competitive",
    "sprite": "wattrel",
    "spriteId": "wattrel",
    "learnset": []
  },
  {
    "id": 941,
    "name": "Kilowattrel",
    "types": [
      "Electric",
      "Flying"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 70,
      "def": 60,
      "spa": 105,
      "spd": 60,
      "spe": 125
    },
    "abilities": [
      "Wind Power",
      "Volt Absorb"
    ],
    "hiddenAbility": "Competitive",
    "sprite": "kilowattrel",
    "spriteId": "kilowattrel",
    "learnset": []
  },
  {
    "id": 942,
    "name": "Maschiff",
    "types": [
      "Dark"
    ],
    "baseStats": {
      "hp": 60,
      "atk": 78,
      "def": 60,
      "spa": 40,
      "spd": 51,
      "spe": 51
    },
    "abilities": [
      "Intimidate",
      "Run Away"
    ],
    "hiddenAbility": "Stakeout",
    "sprite": "maschiff",
    "spriteId": "maschiff",
    "learnset": []
  },
  {
    "id": 943,
    "name": "Mabosstiff",
    "types": [
      "Dark"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 120,
      "def": 90,
      "spa": 60,
      "spd": 70,
      "spe": 85
    },
    "abilities": [
      "Intimidate",
      "Guard Dog"
    ],
    "hiddenAbility": "Stakeout",
    "sprite": "mabosstiff",
    "spriteId": "mabosstiff",
    "learnset": []
  },
  {
    "id": 944,
    "name": "Shroodle",
    "types": [
      "Poison",
      "Normal"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 65,
      "def": 35,
      "spa": 40,
      "spd": 35,
      "spe": 75
    },
    "abilities": [
      "Unburden",
      "Pickpocket"
    ],
    "hiddenAbility": "Prankster",
    "sprite": "shroodle",
    "spriteId": "shroodle",
    "learnset": []
  },
  {
    "id": 945,
    "name": "Grafaiai",
    "types": [
      "Poison",
      "Normal"
    ],
    "baseStats": {
      "hp": 63,
      "atk": 95,
      "def": 65,
      "spa": 80,
      "spd": 72,
      "spe": 110
    },
    "abilities": [
      "Unburden",
      "Poison Touch"
    ],
    "hiddenAbility": "Prankster",
    "sprite": "grafaiai",
    "spriteId": "grafaiai",
    "learnset": []
  },
  {
    "id": 946,
    "name": "Bramblin",
    "types": [
      "Grass",
      "Ghost"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 65,
      "def": 30,
      "spa": 45,
      "spd": 35,
      "spe": 60
    },
    "abilities": [
      "Wind Rider"
    ],
    "hiddenAbility": "Infiltrator",
    "sprite": "bramblin",
    "spriteId": "bramblin",
    "learnset": []
  },
  {
    "id": 947,
    "name": "Brambleghast",
    "types": [
      "Grass",
      "Ghost"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 115,
      "def": 70,
      "spa": 80,
      "spd": 70,
      "spe": 90
    },
    "abilities": [
      "Wind Rider"
    ],
    "hiddenAbility": "Infiltrator",
    "sprite": "brambleghast",
    "spriteId": "brambleghast",
    "learnset": []
  },
  {
    "id": 948,
    "name": "Toedscool",
    "types": [
      "Ground",
      "Grass"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 40,
      "def": 35,
      "spa": 50,
      "spd": 100,
      "spe": 70
    },
    "abilities": [
      "Mycelium Might"
    ],
    "hiddenAbility": "",
    "sprite": "toedscool",
    "spriteId": "toedscool",
    "learnset": []
  },
  {
    "id": 949,
    "name": "Toedscruel",
    "types": [
      "Ground",
      "Grass"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 70,
      "def": 65,
      "spa": 80,
      "spd": 120,
      "spe": 100
    },
    "abilities": [
      "Mycelium Might"
    ],
    "hiddenAbility": "",
    "sprite": "toedscruel",
    "spriteId": "toedscruel",
    "learnset": []
  },
  {
    "id": 950,
    "name": "Klawf",
    "types": [
      "Rock"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 100,
      "def": 115,
      "spa": 35,
      "spd": 55,
      "spe": 75
    },
    "abilities": [
      "Anger Shell",
      "Shell Armor"
    ],
    "hiddenAbility": "Regenerator",
    "sprite": "klawf",
    "spriteId": "klawf",
    "learnset": []
  },
  {
    "id": 951,
    "name": "Capsakid",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 62,
      "def": 40,
      "spa": 62,
      "spd": 40,
      "spe": 50
    },
    "abilities": [
      "Chlorophyll",
      "Insomnia"
    ],
    "hiddenAbility": "Klutz",
    "sprite": "capsakid",
    "spriteId": "capsakid",
    "learnset": []
  },
  {
    "id": 952,
    "name": "Scovillain",
    "types": [
      "Grass",
      "Fire"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 108,
      "def": 65,
      "spa": 108,
      "spd": 65,
      "spe": 75
    },
    "abilities": [
      "Chlorophyll",
      "Insomnia"
    ],
    "hiddenAbility": "Moody",
    "sprite": "scovillain",
    "spriteId": "scovillain",
    "learnset": []
  },
  {
    "id": 952,
    "name": "Scovillain-Mega",
    "types": [
      "Grass",
      "Fire"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 138,
      "def": 85,
      "spa": 138,
      "spd": 85,
      "spe": 75
    },
    "abilities": [
      "Spicy Spray"
    ],
    "hiddenAbility": "",
    "sprite": "scovillainmega",
    "spriteId": "scovillain-mega",
    "learnset": []
  },
  {
    "id": 953,
    "name": "Rellor",
    "types": [
      "Bug"
    ],
    "baseStats": {
      "hp": 41,
      "atk": 50,
      "def": 60,
      "spa": 31,
      "spd": 58,
      "spe": 30
    },
    "abilities": [
      "Compound Eyes"
    ],
    "hiddenAbility": "Shed Skin",
    "sprite": "rellor",
    "spriteId": "rellor",
    "learnset": []
  },
  {
    "id": 954,
    "name": "Rabsca",
    "types": [
      "Bug",
      "Psychic"
    ],
    "baseStats": {
      "hp": 75,
      "atk": 50,
      "def": 85,
      "spa": 115,
      "spd": 100,
      "spe": 45
    },
    "abilities": [
      "Synchronize"
    ],
    "hiddenAbility": "Telepathy",
    "sprite": "rabsca",
    "spriteId": "rabsca",
    "learnset": []
  },
  {
    "id": 955,
    "name": "Flittle",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 30,
      "atk": 35,
      "def": 30,
      "spa": 55,
      "spd": 30,
      "spe": 75
    },
    "abilities": [
      "Anticipation",
      "Frisk"
    ],
    "hiddenAbility": "Speed Boost",
    "sprite": "flittle",
    "spriteId": "flittle",
    "learnset": []
  },
  {
    "id": 956,
    "name": "Espathra",
    "types": [
      "Psychic"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 60,
      "def": 60,
      "spa": 101,
      "spd": 60,
      "spe": 105
    },
    "abilities": [
      "Opportunist",
      "Frisk"
    ],
    "hiddenAbility": "Speed Boost",
    "sprite": "espathra",
    "spriteId": "espathra",
    "learnset": []
  },
  {
    "id": 957,
    "name": "Tinkatink",
    "types": [
      "Fairy",
      "Steel"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 45,
      "def": 45,
      "spa": 35,
      "spd": 64,
      "spe": 58
    },
    "abilities": [
      "Mold Breaker",
      "Own Tempo"
    ],
    "hiddenAbility": "Pickpocket",
    "sprite": "tinkatink",
    "spriteId": "tinkatink",
    "learnset": []
  },
  {
    "id": 958,
    "name": "Tinkatuff",
    "types": [
      "Fairy",
      "Steel"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 55,
      "def": 55,
      "spa": 45,
      "spd": 82,
      "spe": 78
    },
    "abilities": [
      "Mold Breaker",
      "Own Tempo"
    ],
    "hiddenAbility": "Pickpocket",
    "sprite": "tinkatuff",
    "spriteId": "tinkatuff",
    "learnset": []
  },
  {
    "id": 959,
    "name": "Tinkaton",
    "types": [
      "Fairy",
      "Steel"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 75,
      "def": 77,
      "spa": 70,
      "spd": 105,
      "spe": 94
    },
    "abilities": [
      "Mold Breaker",
      "Own Tempo"
    ],
    "hiddenAbility": "Pickpocket",
    "sprite": "tinkaton",
    "spriteId": "tinkaton",
    "learnset": []
  },
  {
    "id": 960,
    "name": "Wiglett",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 10,
      "atk": 55,
      "def": 25,
      "spa": 35,
      "spd": 25,
      "spe": 95
    },
    "abilities": [
      "Gooey",
      "Rattled"
    ],
    "hiddenAbility": "Sand Veil",
    "sprite": "wiglett",
    "spriteId": "wiglett",
    "learnset": []
  },
  {
    "id": 961,
    "name": "Wugtrio",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 35,
      "atk": 100,
      "def": 50,
      "spa": 50,
      "spd": 70,
      "spe": 120
    },
    "abilities": [
      "Gooey",
      "Rattled"
    ],
    "hiddenAbility": "Sand Veil",
    "sprite": "wugtrio",
    "spriteId": "wugtrio",
    "learnset": []
  },
  {
    "id": 962,
    "name": "Bombirdier",
    "types": [
      "Flying",
      "Dark"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 103,
      "def": 85,
      "spa": 60,
      "spd": 85,
      "spe": 82
    },
    "abilities": [
      "Big Pecks",
      "Keen Eye"
    ],
    "hiddenAbility": "Rocky Payload",
    "sprite": "bombirdier",
    "spriteId": "bombirdier",
    "learnset": []
  },
  {
    "id": 963,
    "name": "Finizen",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 45,
      "def": 40,
      "spa": 45,
      "spd": 40,
      "spe": 75
    },
    "abilities": [
      "Water Veil"
    ],
    "hiddenAbility": "",
    "sprite": "finizen",
    "spriteId": "finizen",
    "learnset": []
  },
  {
    "id": 964,
    "name": "Palafin",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 70,
      "def": 72,
      "spa": 53,
      "spd": 62,
      "spe": 100
    },
    "abilities": [
      "Zero to Hero"
    ],
    "hiddenAbility": "",
    "sprite": "palafin",
    "spriteId": "palafin",
    "learnset": []
  },
  {
    "id": 964,
    "name": "Palafin-Hero",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 160,
      "def": 97,
      "spa": 106,
      "spd": 87,
      "spe": 100
    },
    "abilities": [
      "Zero to Hero"
    ],
    "hiddenAbility": "",
    "sprite": "palafinhero",
    "spriteId": "palafin-hero",
    "learnset": []
  },
  {
    "id": 965,
    "name": "Varoom",
    "types": [
      "Steel",
      "Poison"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 70,
      "def": 63,
      "spa": 30,
      "spd": 45,
      "spe": 47
    },
    "abilities": [
      "Overcoat"
    ],
    "hiddenAbility": "Slow Start",
    "sprite": "varoom",
    "spriteId": "varoom",
    "learnset": []
  },
  {
    "id": 966,
    "name": "Revavroom",
    "types": [
      "Steel",
      "Poison"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 119,
      "def": 90,
      "spa": 54,
      "spd": 67,
      "spe": 90
    },
    "abilities": [
      "Overcoat"
    ],
    "hiddenAbility": "Filter",
    "sprite": "revavroom",
    "spriteId": "revavroom",
    "learnset": []
  },
  {
    "id": 967,
    "name": "Cyclizar",
    "types": [
      "Dragon",
      "Normal"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 95,
      "def": 65,
      "spa": 85,
      "spd": 65,
      "spe": 121
    },
    "abilities": [
      "Shed Skin"
    ],
    "hiddenAbility": "Regenerator",
    "sprite": "cyclizar",
    "spriteId": "cyclizar",
    "learnset": []
  },
  {
    "id": 968,
    "name": "Orthworm",
    "types": [
      "Steel"
    ],
    "baseStats": {
      "hp": 70,
      "atk": 85,
      "def": 145,
      "spa": 60,
      "spd": 55,
      "spe": 65
    },
    "abilities": [
      "Earth Eater"
    ],
    "hiddenAbility": "Sand Veil",
    "sprite": "orthworm",
    "spriteId": "orthworm",
    "learnset": []
  },
  {
    "id": 969,
    "name": "Glimmet",
    "types": [
      "Rock",
      "Poison"
    ],
    "baseStats": {
      "hp": 48,
      "atk": 35,
      "def": 42,
      "spa": 105,
      "spd": 60,
      "spe": 60
    },
    "abilities": [
      "Toxic Debris"
    ],
    "hiddenAbility": "Corrosion",
    "sprite": "glimmet",
    "spriteId": "glimmet",
    "learnset": []
  },
  {
    "id": 970,
    "name": "Glimmora",
    "types": [
      "Rock",
      "Poison"
    ],
    "baseStats": {
      "hp": 83,
      "atk": 55,
      "def": 90,
      "spa": 130,
      "spd": 81,
      "spe": 86
    },
    "abilities": [
      "Toxic Debris"
    ],
    "hiddenAbility": "Corrosion",
    "sprite": "glimmora",
    "spriteId": "glimmora",
    "learnset": []
  },
  {
    "id": 970,
    "name": "Glimmora-Mega",
    "types": [
      "Rock",
      "Poison"
    ],
    "baseStats": {
      "hp": 83,
      "atk": 90,
      "def": 105,
      "spa": 150,
      "spd": 96,
      "spe": 101
    },
    "abilities": [
      "Adaptability"
    ],
    "hiddenAbility": "",
    "sprite": "glimmoramega",
    "spriteId": "glimmora-mega",
    "learnset": []
  },
  {
    "id": 971,
    "name": "Greavard",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 50,
      "atk": 61,
      "def": 60,
      "spa": 30,
      "spd": 55,
      "spe": 34
    },
    "abilities": [
      "Pickup"
    ],
    "hiddenAbility": "Fluffy",
    "sprite": "greavard",
    "spriteId": "greavard",
    "learnset": []
  },
  {
    "id": 972,
    "name": "Houndstone",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 72,
      "atk": 101,
      "def": 100,
      "spa": 50,
      "spd": 97,
      "spe": 68
    },
    "abilities": [
      "Sand Rush"
    ],
    "hiddenAbility": "Fluffy",
    "sprite": "houndstone",
    "spriteId": "houndstone",
    "learnset": []
  },
  {
    "id": 973,
    "name": "Flamigo",
    "types": [
      "Flying",
      "Fighting"
    ],
    "baseStats": {
      "hp": 82,
      "atk": 115,
      "def": 74,
      "spa": 75,
      "spd": 64,
      "spe": 90
    },
    "abilities": [
      "Scrappy",
      "Tangled Feet"
    ],
    "hiddenAbility": "Costar",
    "sprite": "flamigo",
    "spriteId": "flamigo",
    "learnset": []
  },
  {
    "id": 974,
    "name": "Cetoddle",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 108,
      "atk": 68,
      "def": 45,
      "spa": 30,
      "spd": 40,
      "spe": 43
    },
    "abilities": [
      "Thick Fat",
      "Snow Cloak"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "cetoddle",
    "spriteId": "cetoddle",
    "learnset": []
  },
  {
    "id": 975,
    "name": "Cetitan",
    "types": [
      "Ice"
    ],
    "baseStats": {
      "hp": 170,
      "atk": 113,
      "def": 65,
      "spa": 45,
      "spd": 55,
      "spe": 73
    },
    "abilities": [
      "Thick Fat",
      "Slush Rush"
    ],
    "hiddenAbility": "Sheer Force",
    "sprite": "cetitan",
    "spriteId": "cetitan",
    "learnset": []
  },
  {
    "id": 976,
    "name": "Veluza",
    "types": [
      "Water",
      "Psychic"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 102,
      "def": 73,
      "spa": 78,
      "spd": 65,
      "spe": 70
    },
    "abilities": [
      "Mold Breaker"
    ],
    "hiddenAbility": "Sharpness",
    "sprite": "veluza",
    "spriteId": "veluza",
    "learnset": []
  },
  {
    "id": 977,
    "name": "Dondozo",
    "types": [
      "Water"
    ],
    "baseStats": {
      "hp": 150,
      "atk": 100,
      "def": 115,
      "spa": 65,
      "spd": 65,
      "spe": 35
    },
    "abilities": [
      "Unaware",
      "Oblivious"
    ],
    "hiddenAbility": "Water Veil",
    "sprite": "dondozo",
    "spriteId": "dondozo",
    "learnset": []
  },
  {
    "id": 978,
    "name": "Tatsugiri",
    "types": [
      "Dragon",
      "Water"
    ],
    "baseStats": {
      "hp": 68,
      "atk": 50,
      "def": 60,
      "spa": 120,
      "spd": 95,
      "spe": 82
    },
    "abilities": [
      "Commander"
    ],
    "hiddenAbility": "Storm Drain",
    "sprite": "tatsugiri",
    "spriteId": "tatsugiri",
    "learnset": []
  },
  {
    "id": 978,
    "name": "Tatsugiri-Droopy",
    "types": [
      "Dragon",
      "Water"
    ],
    "baseStats": {
      "hp": 68,
      "atk": 50,
      "def": 60,
      "spa": 120,
      "spd": 95,
      "spe": 82
    },
    "abilities": [
      "Commander"
    ],
    "hiddenAbility": "Storm Drain",
    "sprite": "tatsugiridroopy",
    "spriteId": "tatsugiri-droopy",
    "learnset": []
  },
  {
    "id": 978,
    "name": "Tatsugiri-Stretchy",
    "types": [
      "Dragon",
      "Water"
    ],
    "baseStats": {
      "hp": 68,
      "atk": 50,
      "def": 60,
      "spa": 120,
      "spd": 95,
      "spe": 82
    },
    "abilities": [
      "Commander"
    ],
    "hiddenAbility": "Storm Drain",
    "sprite": "tatsugiristretchy",
    "spriteId": "tatsugiri-stretchy",
    "learnset": []
  },
  {
    "id": 978,
    "name": "Tatsugiri-Curly-Mega",
    "types": [
      "Dragon",
      "Water"
    ],
    "baseStats": {
      "hp": 68,
      "atk": 65,
      "def": 90,
      "spa": 135,
      "spd": 125,
      "spe": 92
    },
    "abilities": [
      "Commander"
    ],
    "hiddenAbility": "Storm Drain",
    "sprite": "tatsugiricurlymega",
    "spriteId": "tatsugiri-curlymega",
    "learnset": []
  },
  {
    "id": 978,
    "name": "Tatsugiri-Droopy-Mega",
    "types": [
      "Dragon",
      "Water"
    ],
    "baseStats": {
      "hp": 68,
      "atk": 65,
      "def": 90,
      "spa": 135,
      "spd": 125,
      "spe": 92
    },
    "abilities": [
      "Commander"
    ],
    "hiddenAbility": "Storm Drain",
    "sprite": "tatsugiridroopymega",
    "spriteId": "tatsugiri-droopymega",
    "learnset": []
  },
  {
    "id": 978,
    "name": "Tatsugiri-Stretchy-Mega",
    "types": [
      "Dragon",
      "Water"
    ],
    "baseStats": {
      "hp": 68,
      "atk": 65,
      "def": 90,
      "spa": 135,
      "spd": 125,
      "spe": 92
    },
    "abilities": [
      "Commander"
    ],
    "hiddenAbility": "Storm Drain",
    "sprite": "tatsugiristretchymega",
    "spriteId": "tatsugiri-stretchymega",
    "learnset": []
  },
  {
    "id": 979,
    "name": "Annihilape",
    "types": [
      "Fighting",
      "Ghost"
    ],
    "baseStats": {
      "hp": 110,
      "atk": 115,
      "def": 80,
      "spa": 50,
      "spd": 90,
      "spe": 90
    },
    "abilities": [
      "Vital Spirit",
      "Inner Focus"
    ],
    "hiddenAbility": "Defiant",
    "sprite": "annihilape",
    "spriteId": "annihilape",
    "learnset": []
  },
  {
    "id": 980,
    "name": "Clodsire",
    "types": [
      "Poison",
      "Ground"
    ],
    "baseStats": {
      "hp": 130,
      "atk": 75,
      "def": 60,
      "spa": 45,
      "spd": 100,
      "spe": 20
    },
    "abilities": [
      "Poison Point",
      "Water Absorb"
    ],
    "hiddenAbility": "Unaware",
    "sprite": "clodsire",
    "spriteId": "clodsire",
    "learnset": []
  },
  {
    "id": 981,
    "name": "Farigiraf",
    "types": [
      "Normal",
      "Psychic"
    ],
    "baseStats": {
      "hp": 120,
      "atk": 90,
      "def": 70,
      "spa": 110,
      "spd": 70,
      "spe": 60
    },
    "abilities": [
      "Cud Chew",
      "Armor Tail"
    ],
    "hiddenAbility": "Sap Sipper",
    "sprite": "farigiraf",
    "spriteId": "farigiraf",
    "learnset": []
  },
  {
    "id": 982,
    "name": "Dudunsparce",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 125,
      "atk": 100,
      "def": 80,
      "spa": 85,
      "spd": 75,
      "spe": 55
    },
    "abilities": [
      "Serene Grace",
      "Run Away"
    ],
    "hiddenAbility": "Rattled",
    "sprite": "dudunsparce",
    "spriteId": "dudunsparce",
    "learnset": []
  },
  {
    "id": 982,
    "name": "Dudunsparce-Three-Segment",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 125,
      "atk": 100,
      "def": 80,
      "spa": 85,
      "spd": 75,
      "spe": 55
    },
    "abilities": [
      "Serene Grace",
      "Run Away"
    ],
    "hiddenAbility": "Rattled",
    "sprite": "dudunsparcethreesegment",
    "spriteId": "dudunsparce-threesegment",
    "learnset": []
  },
  {
    "id": 983,
    "name": "Kingambit",
    "types": [
      "Dark",
      "Steel"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 135,
      "def": 120,
      "spa": 60,
      "spd": 85,
      "spe": 50
    },
    "abilities": [
      "Defiant",
      "Supreme Overlord"
    ],
    "hiddenAbility": "Pressure",
    "sprite": "kingambit",
    "spriteId": "kingambit",
    "learnset": []
  },
  {
    "id": 984,
    "name": "Great Tusk",
    "types": [
      "Ground",
      "Fighting"
    ],
    "baseStats": {
      "hp": 115,
      "atk": 131,
      "def": 131,
      "spa": 53,
      "spd": 53,
      "spe": 87
    },
    "abilities": [
      "Protosynthesis"
    ],
    "hiddenAbility": "",
    "sprite": "greattusk",
    "spriteId": "greattusk",
    "learnset": []
  },
  {
    "id": 985,
    "name": "Scream Tail",
    "types": [
      "Fairy",
      "Psychic"
    ],
    "baseStats": {
      "hp": 115,
      "atk": 65,
      "def": 99,
      "spa": 65,
      "spd": 115,
      "spe": 111
    },
    "abilities": [
      "Protosynthesis"
    ],
    "hiddenAbility": "",
    "sprite": "screamtail",
    "spriteId": "screamtail",
    "learnset": []
  },
  {
    "id": 986,
    "name": "Brute Bonnet",
    "types": [
      "Grass",
      "Dark"
    ],
    "baseStats": {
      "hp": 111,
      "atk": 127,
      "def": 99,
      "spa": 79,
      "spd": 99,
      "spe": 55
    },
    "abilities": [
      "Protosynthesis"
    ],
    "hiddenAbility": "",
    "sprite": "brutebonnet",
    "spriteId": "brutebonnet",
    "learnset": []
  },
  {
    "id": 987,
    "name": "Flutter Mane",
    "types": [
      "Ghost",
      "Fairy"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 55,
      "def": 55,
      "spa": 135,
      "spd": 135,
      "spe": 135
    },
    "abilities": [
      "Protosynthesis"
    ],
    "hiddenAbility": "",
    "sprite": "fluttermane",
    "spriteId": "fluttermane",
    "learnset": []
  },
  {
    "id": 988,
    "name": "Slither Wing",
    "types": [
      "Bug",
      "Fighting"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 135,
      "def": 79,
      "spa": 85,
      "spd": 105,
      "spe": 81
    },
    "abilities": [
      "Protosynthesis"
    ],
    "hiddenAbility": "",
    "sprite": "slitherwing",
    "spriteId": "slitherwing",
    "learnset": []
  },
  {
    "id": 989,
    "name": "Sandy Shocks",
    "types": [
      "Electric",
      "Ground"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 81,
      "def": 97,
      "spa": 121,
      "spd": 85,
      "spe": 101
    },
    "abilities": [
      "Protosynthesis"
    ],
    "hiddenAbility": "",
    "sprite": "sandyshocks",
    "spriteId": "sandyshocks",
    "learnset": []
  },
  {
    "id": 990,
    "name": "Iron Treads",
    "types": [
      "Ground",
      "Steel"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 112,
      "def": 120,
      "spa": 72,
      "spd": 70,
      "spe": 106
    },
    "abilities": [
      "Quark Drive"
    ],
    "hiddenAbility": "",
    "sprite": "irontreads",
    "spriteId": "irontreads",
    "learnset": []
  },
  {
    "id": 991,
    "name": "Iron Bundle",
    "types": [
      "Ice",
      "Water"
    ],
    "baseStats": {
      "hp": 56,
      "atk": 80,
      "def": 114,
      "spa": 124,
      "spd": 60,
      "spe": 136
    },
    "abilities": [
      "Quark Drive"
    ],
    "hiddenAbility": "",
    "sprite": "ironbundle",
    "spriteId": "ironbundle",
    "learnset": []
  },
  {
    "id": 992,
    "name": "Iron Hands",
    "types": [
      "Fighting",
      "Electric"
    ],
    "baseStats": {
      "hp": 154,
      "atk": 140,
      "def": 108,
      "spa": 50,
      "spd": 68,
      "spe": 50
    },
    "abilities": [
      "Quark Drive"
    ],
    "hiddenAbility": "",
    "sprite": "ironhands",
    "spriteId": "ironhands",
    "learnset": []
  },
  {
    "id": 993,
    "name": "Iron Jugulis",
    "types": [
      "Dark",
      "Flying"
    ],
    "baseStats": {
      "hp": 94,
      "atk": 80,
      "def": 86,
      "spa": 122,
      "spd": 80,
      "spe": 108
    },
    "abilities": [
      "Quark Drive"
    ],
    "hiddenAbility": "",
    "sprite": "ironjugulis",
    "spriteId": "ironjugulis",
    "learnset": []
  },
  {
    "id": 994,
    "name": "Iron Moth",
    "types": [
      "Fire",
      "Poison"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 70,
      "def": 60,
      "spa": 140,
      "spd": 110,
      "spe": 110
    },
    "abilities": [
      "Quark Drive"
    ],
    "hiddenAbility": "",
    "sprite": "ironmoth",
    "spriteId": "ironmoth",
    "learnset": []
  },
  {
    "id": 995,
    "name": "Iron Thorns",
    "types": [
      "Rock",
      "Electric"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 134,
      "def": 110,
      "spa": 70,
      "spd": 84,
      "spe": 72
    },
    "abilities": [
      "Quark Drive"
    ],
    "hiddenAbility": "",
    "sprite": "ironthorns",
    "spriteId": "ironthorns",
    "learnset": []
  },
  {
    "id": 996,
    "name": "Frigibax",
    "types": [
      "Dragon",
      "Ice"
    ],
    "baseStats": {
      "hp": 65,
      "atk": 75,
      "def": 45,
      "spa": 35,
      "spd": 45,
      "spe": 55
    },
    "abilities": [
      "Thermal Exchange"
    ],
    "hiddenAbility": "Ice Body",
    "sprite": "frigibax",
    "spriteId": "frigibax",
    "learnset": []
  },
  {
    "id": 997,
    "name": "Arctibax",
    "types": [
      "Dragon",
      "Ice"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 95,
      "def": 66,
      "spa": 45,
      "spd": 65,
      "spe": 62
    },
    "abilities": [
      "Thermal Exchange"
    ],
    "hiddenAbility": "Ice Body",
    "sprite": "arctibax",
    "spriteId": "arctibax",
    "learnset": []
  },
  {
    "id": 998,
    "name": "Baxcalibur",
    "types": [
      "Dragon",
      "Ice"
    ],
    "baseStats": {
      "hp": 115,
      "atk": 145,
      "def": 92,
      "spa": 75,
      "spd": 86,
      "spe": 87
    },
    "abilities": [
      "Thermal Exchange"
    ],
    "hiddenAbility": "Ice Body",
    "sprite": "baxcalibur",
    "spriteId": "baxcalibur",
    "learnset": []
  },
  {
    "id": 998,
    "name": "Baxcalibur-Mega",
    "types": [
      "Dragon",
      "Ice"
    ],
    "baseStats": {
      "hp": 115,
      "atk": 175,
      "def": 117,
      "spa": 105,
      "spd": 101,
      "spe": 87
    },
    "abilities": [
      "Thermal Exchange"
    ],
    "hiddenAbility": "Ice Body",
    "sprite": "baxcaliburmega",
    "spriteId": "baxcalibur-mega",
    "learnset": []
  },
  {
    "id": 999,
    "name": "Gimmighoul",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 30,
      "def": 70,
      "spa": 75,
      "spd": 70,
      "spe": 10
    },
    "abilities": [
      "Rattled"
    ],
    "hiddenAbility": "",
    "sprite": "gimmighoul",
    "spriteId": "gimmighoul",
    "learnset": []
  },
  {
    "id": 999,
    "name": "Gimmighoul-Roaming",
    "types": [
      "Ghost"
    ],
    "baseStats": {
      "hp": 45,
      "atk": 30,
      "def": 25,
      "spa": 75,
      "spd": 45,
      "spe": 80
    },
    "abilities": [
      "Run Away"
    ],
    "hiddenAbility": "",
    "sprite": "gimmighoulroaming",
    "spriteId": "gimmighoul-roaming",
    "learnset": []
  },
  {
    "id": 1000,
    "name": "Gholdengo",
    "types": [
      "Steel",
      "Ghost"
    ],
    "baseStats": {
      "hp": 87,
      "atk": 60,
      "def": 95,
      "spa": 133,
      "spd": 91,
      "spe": 84
    },
    "abilities": [
      "Good as Gold"
    ],
    "hiddenAbility": "",
    "sprite": "gholdengo",
    "spriteId": "gholdengo",
    "learnset": []
  },
  {
    "id": 1001,
    "name": "Wo-Chien",
    "types": [
      "Dark",
      "Grass"
    ],
    "baseStats": {
      "hp": 85,
      "atk": 85,
      "def": 100,
      "spa": 95,
      "spd": 135,
      "spe": 70
    },
    "abilities": [
      "Tablets of Ruin"
    ],
    "hiddenAbility": "",
    "sprite": "wochien",
    "spriteId": "wochien",
    "learnset": []
  },
  {
    "id": 1002,
    "name": "Chien-Pao",
    "types": [
      "Dark",
      "Ice"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 120,
      "def": 80,
      "spa": 90,
      "spd": 65,
      "spe": 135
    },
    "abilities": [
      "Sword of Ruin"
    ],
    "hiddenAbility": "",
    "sprite": "chienpao",
    "spriteId": "chienpao",
    "learnset": []
  },
  {
    "id": 1003,
    "name": "Ting-Lu",
    "types": [
      "Dark",
      "Ground"
    ],
    "baseStats": {
      "hp": 155,
      "atk": 110,
      "def": 125,
      "spa": 55,
      "spd": 80,
      "spe": 45
    },
    "abilities": [
      "Vessel of Ruin"
    ],
    "hiddenAbility": "",
    "sprite": "tinglu",
    "spriteId": "tinglu",
    "learnset": []
  },
  {
    "id": 1004,
    "name": "Chi-Yu",
    "types": [
      "Dark",
      "Fire"
    ],
    "baseStats": {
      "hp": 55,
      "atk": 80,
      "def": 80,
      "spa": 135,
      "spd": 120,
      "spe": 100
    },
    "abilities": [
      "Beads of Ruin"
    ],
    "hiddenAbility": "",
    "sprite": "chiyu",
    "spriteId": "chiyu",
    "learnset": []
  },
  {
    "id": 1005,
    "name": "Roaring Moon",
    "types": [
      "Dragon",
      "Dark"
    ],
    "baseStats": {
      "hp": 105,
      "atk": 139,
      "def": 71,
      "spa": 55,
      "spd": 101,
      "spe": 119
    },
    "abilities": [
      "Protosynthesis"
    ],
    "hiddenAbility": "",
    "sprite": "roaringmoon",
    "spriteId": "roaringmoon",
    "learnset": []
  },
  {
    "id": 1006,
    "name": "Iron Valiant",
    "types": [
      "Fairy",
      "Fighting"
    ],
    "baseStats": {
      "hp": 74,
      "atk": 130,
      "def": 90,
      "spa": 120,
      "spd": 60,
      "spe": 116
    },
    "abilities": [
      "Quark Drive"
    ],
    "hiddenAbility": "",
    "sprite": "ironvaliant",
    "spriteId": "ironvaliant",
    "learnset": []
  },
  {
    "id": 1007,
    "name": "Koraidon",
    "types": [
      "Fighting",
      "Dragon"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 135,
      "def": 115,
      "spa": 85,
      "spd": 100,
      "spe": 135
    },
    "abilities": [
      "Orichalcum Pulse"
    ],
    "hiddenAbility": "",
    "sprite": "koraidon",
    "spriteId": "koraidon",
    "learnset": []
  },
  {
    "id": 1008,
    "name": "Miraidon",
    "types": [
      "Electric",
      "Dragon"
    ],
    "baseStats": {
      "hp": 100,
      "atk": 85,
      "def": 100,
      "spa": 135,
      "spd": 115,
      "spe": 135
    },
    "abilities": [
      "Hadron Engine"
    ],
    "hiddenAbility": "",
    "sprite": "miraidon",
    "spriteId": "miraidon",
    "learnset": []
  },
  {
    "id": 1009,
    "name": "Walking Wake",
    "types": [
      "Water",
      "Dragon"
    ],
    "baseStats": {
      "hp": 99,
      "atk": 83,
      "def": 91,
      "spa": 125,
      "spd": 83,
      "spe": 109
    },
    "abilities": [
      "Protosynthesis"
    ],
    "hiddenAbility": "",
    "sprite": "walkingwake",
    "spriteId": "walkingwake",
    "learnset": []
  },
  {
    "id": 1010,
    "name": "Iron Leaves",
    "types": [
      "Grass",
      "Psychic"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 130,
      "def": 88,
      "spa": 70,
      "spd": 108,
      "spe": 104
    },
    "abilities": [
      "Quark Drive"
    ],
    "hiddenAbility": "",
    "sprite": "ironleaves",
    "spriteId": "ironleaves",
    "learnset": []
  },
  {
    "id": 1011,
    "name": "Dipplin",
    "types": [
      "Grass",
      "Dragon"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 80,
      "def": 110,
      "spa": 95,
      "spd": 80,
      "spe": 40
    },
    "abilities": [
      "Supersweet Syrup",
      "Gluttony"
    ],
    "hiddenAbility": "Sticky Hold",
    "sprite": "dipplin",
    "spriteId": "dipplin",
    "learnset": []
  },
  {
    "id": 1012,
    "name": "Poltchageist",
    "types": [
      "Grass",
      "Ghost"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 45,
      "def": 45,
      "spa": 74,
      "spd": 54,
      "spe": 50
    },
    "abilities": [
      "Hospitality"
    ],
    "hiddenAbility": "Heatproof",
    "sprite": "poltchageist",
    "spriteId": "poltchageist",
    "learnset": []
  },
  {
    "id": 1012,
    "name": "Poltchageist-Artisan",
    "types": [
      "Grass",
      "Ghost"
    ],
    "baseStats": {
      "hp": 40,
      "atk": 45,
      "def": 45,
      "spa": 74,
      "spd": 54,
      "spe": 50
    },
    "abilities": [
      "Hospitality"
    ],
    "hiddenAbility": "Heatproof",
    "sprite": "poltchageistartisan",
    "spriteId": "poltchageist-artisan",
    "learnset": []
  },
  {
    "id": 1013,
    "name": "Sinistcha",
    "types": [
      "Grass",
      "Ghost"
    ],
    "baseStats": {
      "hp": 71,
      "atk": 60,
      "def": 106,
      "spa": 121,
      "spd": 80,
      "spe": 70
    },
    "abilities": [
      "Hospitality"
    ],
    "hiddenAbility": "Heatproof",
    "sprite": "sinistcha",
    "spriteId": "sinistcha",
    "learnset": []
  },
  {
    "id": 1013,
    "name": "Sinistcha-Masterpiece",
    "types": [
      "Grass",
      "Ghost"
    ],
    "baseStats": {
      "hp": 71,
      "atk": 60,
      "def": 106,
      "spa": 121,
      "spd": 80,
      "spe": 70
    },
    "abilities": [
      "Hospitality"
    ],
    "hiddenAbility": "Heatproof",
    "sprite": "sinistchamasterpiece",
    "spriteId": "sinistcha-masterpiece",
    "learnset": []
  },
  {
    "id": 1014,
    "name": "Okidogi",
    "types": [
      "Poison",
      "Fighting"
    ],
    "baseStats": {
      "hp": 88,
      "atk": 128,
      "def": 115,
      "spa": 58,
      "spd": 86,
      "spe": 80
    },
    "abilities": [
      "Toxic Chain"
    ],
    "hiddenAbility": "Guard Dog",
    "sprite": "okidogi",
    "spriteId": "okidogi",
    "learnset": []
  },
  {
    "id": 1015,
    "name": "Munkidori",
    "types": [
      "Poison",
      "Psychic"
    ],
    "baseStats": {
      "hp": 88,
      "atk": 75,
      "def": 66,
      "spa": 130,
      "spd": 90,
      "spe": 106
    },
    "abilities": [
      "Toxic Chain"
    ],
    "hiddenAbility": "Frisk",
    "sprite": "munkidori",
    "spriteId": "munkidori",
    "learnset": []
  },
  {
    "id": 1016,
    "name": "Fezandipiti",
    "types": [
      "Poison",
      "Fairy"
    ],
    "baseStats": {
      "hp": 88,
      "atk": 91,
      "def": 82,
      "spa": 70,
      "spd": 125,
      "spe": 99
    },
    "abilities": [
      "Toxic Chain"
    ],
    "hiddenAbility": "Technician",
    "sprite": "fezandipiti",
    "spriteId": "fezandipiti",
    "learnset": []
  },
  {
    "id": 1017,
    "name": "Ogerpon",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 120,
      "def": 84,
      "spa": 60,
      "spd": 96,
      "spe": 110
    },
    "abilities": [
      "Defiant"
    ],
    "hiddenAbility": "",
    "sprite": "ogerpon",
    "spriteId": "ogerpon",
    "learnset": []
  },
  {
    "id": 1017,
    "name": "Ogerpon-Wellspring",
    "types": [
      "Grass",
      "Water"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 120,
      "def": 84,
      "spa": 60,
      "spd": 96,
      "spe": 110
    },
    "abilities": [
      "Water Absorb"
    ],
    "hiddenAbility": "",
    "sprite": "ogerponwellspring",
    "spriteId": "ogerpon-wellspring",
    "learnset": []
  },
  {
    "id": 1017,
    "name": "Ogerpon-Hearthflame",
    "types": [
      "Grass",
      "Fire"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 120,
      "def": 84,
      "spa": 60,
      "spd": 96,
      "spe": 110
    },
    "abilities": [
      "Mold Breaker"
    ],
    "hiddenAbility": "",
    "sprite": "ogerponhearthflame",
    "spriteId": "ogerpon-hearthflame",
    "learnset": []
  },
  {
    "id": 1017,
    "name": "Ogerpon-Cornerstone",
    "types": [
      "Grass",
      "Rock"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 120,
      "def": 84,
      "spa": 60,
      "spd": 96,
      "spe": 110
    },
    "abilities": [
      "Sturdy"
    ],
    "hiddenAbility": "",
    "sprite": "ogerponcornerstone",
    "spriteId": "ogerpon-cornerstone",
    "learnset": []
  },
  {
    "id": 1017,
    "name": "Ogerpon-Teal-Tera",
    "types": [
      "Grass"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 120,
      "def": 84,
      "spa": 60,
      "spd": 96,
      "spe": 110
    },
    "abilities": [
      "Embody Aspect (Teal)"
    ],
    "hiddenAbility": "",
    "sprite": "ogerpontealtera",
    "spriteId": "ogerpon-tealtera",
    "learnset": []
  },
  {
    "id": 1017,
    "name": "Ogerpon-Wellspring-Tera",
    "types": [
      "Grass",
      "Water"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 120,
      "def": 84,
      "spa": 60,
      "spd": 96,
      "spe": 110
    },
    "abilities": [
      "Embody Aspect (Wellspring)"
    ],
    "hiddenAbility": "",
    "sprite": "ogerponwellspringtera",
    "spriteId": "ogerpon-wellspringtera",
    "learnset": []
  },
  {
    "id": 1017,
    "name": "Ogerpon-Hearthflame-Tera",
    "types": [
      "Grass",
      "Fire"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 120,
      "def": 84,
      "spa": 60,
      "spd": 96,
      "spe": 110
    },
    "abilities": [
      "Embody Aspect (Hearthflame)"
    ],
    "hiddenAbility": "",
    "sprite": "ogerponhearthflametera",
    "spriteId": "ogerpon-hearthflametera",
    "learnset": []
  },
  {
    "id": 1017,
    "name": "Ogerpon-Cornerstone-Tera",
    "types": [
      "Grass",
      "Rock"
    ],
    "baseStats": {
      "hp": 80,
      "atk": 120,
      "def": 84,
      "spa": 60,
      "spd": 96,
      "spe": 110
    },
    "abilities": [
      "Embody Aspect (Cornerstone)"
    ],
    "hiddenAbility": "",
    "sprite": "ogerponcornerstonetera",
    "spriteId": "ogerpon-cornerstonetera",
    "learnset": []
  },
  {
    "id": 1018,
    "name": "Archaludon",
    "types": [
      "Steel",
      "Dragon"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 105,
      "def": 130,
      "spa": 125,
      "spd": 65,
      "spe": 85
    },
    "abilities": [
      "Stamina",
      "Sturdy"
    ],
    "hiddenAbility": "Stalwart",
    "sprite": "archaludon",
    "spriteId": "archaludon",
    "learnset": []
  },
  {
    "id": 1019,
    "name": "Hydrapple",
    "types": [
      "Grass",
      "Dragon"
    ],
    "baseStats": {
      "hp": 106,
      "atk": 80,
      "def": 110,
      "spa": 120,
      "spd": 80,
      "spe": 44
    },
    "abilities": [
      "Supersweet Syrup",
      "Regenerator"
    ],
    "hiddenAbility": "Sticky Hold",
    "sprite": "hydrapple",
    "spriteId": "hydrapple",
    "learnset": []
  },
  {
    "id": 1020,
    "name": "Gouging Fire",
    "types": [
      "Fire",
      "Dragon"
    ],
    "baseStats": {
      "hp": 105,
      "atk": 115,
      "def": 121,
      "spa": 65,
      "spd": 93,
      "spe": 91
    },
    "abilities": [
      "Protosynthesis"
    ],
    "hiddenAbility": "",
    "sprite": "gougingfire",
    "spriteId": "gougingfire",
    "learnset": []
  },
  {
    "id": 1021,
    "name": "Raging Bolt",
    "types": [
      "Electric",
      "Dragon"
    ],
    "baseStats": {
      "hp": 125,
      "atk": 73,
      "def": 91,
      "spa": 137,
      "spd": 89,
      "spe": 75
    },
    "abilities": [
      "Protosynthesis"
    ],
    "hiddenAbility": "",
    "sprite": "ragingbolt",
    "spriteId": "ragingbolt",
    "learnset": []
  },
  {
    "id": 1022,
    "name": "Iron Boulder",
    "types": [
      "Rock",
      "Psychic"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 120,
      "def": 80,
      "spa": 68,
      "spd": 108,
      "spe": 124
    },
    "abilities": [
      "Quark Drive"
    ],
    "hiddenAbility": "",
    "sprite": "ironboulder",
    "spriteId": "ironboulder",
    "learnset": []
  },
  {
    "id": 1023,
    "name": "Iron Crown",
    "types": [
      "Steel",
      "Psychic"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 72,
      "def": 100,
      "spa": 122,
      "spd": 108,
      "spe": 98
    },
    "abilities": [
      "Quark Drive"
    ],
    "hiddenAbility": "",
    "sprite": "ironcrown",
    "spriteId": "ironcrown",
    "learnset": []
  },
  {
    "id": 1024,
    "name": "Terapagos",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 90,
      "atk": 65,
      "def": 85,
      "spa": 65,
      "spd": 85,
      "spe": 60
    },
    "abilities": [
      "Tera Shift"
    ],
    "hiddenAbility": "",
    "sprite": "terapagos",
    "spriteId": "terapagos",
    "learnset": []
  },
  {
    "id": 1024,
    "name": "Terapagos-Terastal",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 95,
      "atk": 95,
      "def": 110,
      "spa": 105,
      "spd": 110,
      "spe": 85
    },
    "abilities": [
      "Tera Shell"
    ],
    "hiddenAbility": "",
    "sprite": "terapagosterastal",
    "spriteId": "terapagos-terastal",
    "learnset": []
  },
  {
    "id": 1024,
    "name": "Terapagos-Stellar",
    "types": [
      "Normal"
    ],
    "baseStats": {
      "hp": 160,
      "atk": 105,
      "def": 110,
      "spa": 130,
      "spd": 110,
      "spe": 85
    },
    "abilities": [
      "Teraform Zero"
    ],
    "hiddenAbility": "",
    "sprite": "terapagosstellar",
    "spriteId": "terapagos-stellar",
    "learnset": []
  },
  {
    "id": 1025,
    "name": "Pecharunt",
    "types": [
      "Poison",
      "Ghost"
    ],
    "baseStats": {
      "hp": 88,
      "atk": 88,
      "def": 160,
      "spa": 88,
      "spd": 88,
      "spe": 88
    },
    "abilities": [
      "Poison Puppeteer"
    ],
    "hiddenAbility": "",
    "sprite": "pecharunt",
    "spriteId": "pecharunt",
    "learnset": []
  }
];

export const POKEMON_BY_ID = new Map(POKEDEX.map(p => [p.id, p]));
export const POKEMON_BY_NAME = new Map(POKEDEX.map(p => [p.name.toLowerCase(), p]));
export const POKEMON_BY_SLUG = new Map(POKEDEX.map(p => [p.sprite.toLowerCase(), p]));

export function getPokemonByName(name: string): PokedexEntry | undefined {
  // normalize('NFD') on both sides: stripping non-alphanumerics drops a combining
  // accent but not a precomposed letter, so "Flabébé" reduces to flabebe decomposed
  // and flabb precomposed. Names arriving from outside this file (a pasted import,
  // a custom format) use the precomposed form and would otherwise never match.
  const normalized = name.normalize('NFD').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  return POKEDEX.find(p =>
    p.name.normalize('NFD').toLowerCase().replace(/[^a-z0-9]/g, '') === normalized ||
    p.sprite === normalized
  );
}

export function getPokemonById(id: number): PokedexEntry | undefined {
  return POKEDEX.find(p => p.id === id);
}

export function searchPokemon(query: string): PokedexEntry[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];
  return POKEDEX.filter(p =>
    p.name.toLowerCase().includes(normalized)
  ).slice(0, 20);
}

export function getPokemonByType(type: string): PokedexEntry[] {
  return POKEDEX.filter(p =>
    p.types.map(t => t.toLowerCase()).includes(type.toLowerCase())
  );
}

export function getAllPokemonNames(): string[] {
  return POKEDEX.map(p => p.name);
}

export function getViablePokemon(_format?: string): PokedexEntry[] {
  void _format;
  return POKEDEX;
}
