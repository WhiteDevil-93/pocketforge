// ============================================================================
// PocketForge — Pikalytics Usage Data for Champions Regulation M-B
// Source: https://pikalytics.com/pokedex/battledataregmbs3
// ============================================================================

export interface PikalyticsPokemon {
  species: string;
  rank: number;
  winrate: number;
  moves: { name: string; usage: number }[];
  items: { name: string; usage: number }[];
  abilities: { name: string; usage: number }[];
  natures: { name: string; usage: number }[];
  teammates: { species: string; usage: number }[];
}

export const PIKALYTICS_TOP_20: { species: string; rank: number; winrate: number }[] = [
  { species: 'Garchomp', rank: 1, winrate: 52.366 },
  { species: 'Sinistcha', rank: 2, winrate: 50.202 },
  { species: 'Basculegion', rank: 3, winrate: 54.220 },
  { species: 'Whimsicott', rank: 4, winrate: 52.238 },
  { species: 'Kingambit', rank: 5, winrate: 55.431 },
  { species: 'Staraptor', rank: 6, winrate: 43.845 },
  { species: 'Incineroar', rank: 7, winrate: 51.881 },
  { species: 'Charizard', rank: 8, winrate: 53.825 },
  { species: 'Raichu', rank: 9, winrate: 44.648 },
  { species: 'Pelipper', rank: 10, winrate: 50.345 },
  { species: 'Sneasler', rank: 11, winrate: 51.970 },
  { species: 'Archaludon', rank: 12, winrate: 51.427 },
  { species: 'Grimmsnarl', rank: 13, winrate: 45.964 },
  { species: 'Sylveon', rank: 14, winrate: 50.531 },
  { species: 'Swampert', rank: 15, winrate: 0 },
  { species: 'Metagross', rank: 16, winrate: 0 },
  { species: 'Farigiraf', rank: 17, winrate: 49.835 },
  { species: 'Floette-Eternal', rank: 18, winrate: 0 },
  { species: 'Gholdengo', rank: 19, winrate: 0 },
  { species: 'Aerodactyl', rank: 20, winrate: 0 },
];

export const PIKALYTICS_TEAM_CORES = {
  duo: [
    { members: ['Garchomp', 'Whimsicott'], teams: 809, pct: 18.2 },
    { members: ['Charizard-Mega-Y', 'Garchomp'], teams: 740, pct: 16.7 },
    { members: ['Basculegion', 'Garchomp'], teams: 716, pct: 16.1 },
    { members: ['Archaludon', 'Pelipper'], teams: 688, pct: 15.5 },
    { members: ['Basculegion', 'Whimsicott'], teams: 685, pct: 15.4 },
  ],
  trio: [
    { members: ['Archaludon', 'Pelipper', 'Swampert-Mega'], teams: 550, pct: 12.4 },
    { members: ['Basculegion', 'Garchomp', 'Whimsicott'], teams: 476, pct: 10.7 },
    { members: ['Charizard-Mega-Y', 'Garchomp', 'Whimsicott'], teams: 433, pct: 9.8 },
    { members: ['Pelipper', 'Sinistcha', 'Swampert-Mega'], teams: 412, pct: 9.3 },
    { members: ['Basculegion', 'Charizard-Mega-Y', 'Garchomp'], teams: 397, pct: 9.0 },
  ],
  quad: [
    { members: ['Archaludon', 'Pelipper', 'Sinistcha', 'Swampert-Mega'], teams: 353, pct: 8.0 },
    { members: ['Basculegion', 'Charizard-Mega-Y', 'Garchomp', 'Whimsicott'], teams: 320, pct: 7.2 },
    { members: ['Basculegion', 'Charizard-Mega-Y', 'Garchomp', 'Kingambit'], teams: 255, pct: 5.8 },
    { members: ['Charizard-Mega-Y', 'Garchomp', 'Kingambit', 'Whimsicott'], teams: 225, pct: 5.1 },
    { members: ['Basculegion', 'Garchomp', 'Kingambit', 'Whimsicott'], teams: 221, pct: 5.0 },
  ],
};

// Detailed data for commonly-used Pokemon
export const PIKALYTICS_DETAILS: Record<string, PikalyticsPokemon> = {
  'Farigiraf': {
    species: 'Farigiraf',
    rank: 17,
    winrate: 49.835,
    moves: [
      { name: 'Trick Room', usage: 95.7 },
      { name: 'Psychic', usage: 60.7 },
      { name: 'Helping Hand', usage: 48.9 },
      { name: 'Protect', usage: 39.1 },
      { name: 'Thunderbolt', usage: 30.3 },
      { name: 'Hyper Voice', usage: 30.2 },
      { name: 'Twin Beam', usage: 24.7 },
      { name: 'Imprison', usage: 13.9 },
      { name: 'Roar', usage: 11.6 },
      { name: 'Foul Play', usage: 6.4 },
    ],
    items: [
      { name: 'Sitrus Berry', usage: 62.0 },
      { name: 'Colbur Berry', usage: 24.9 },
      { name: 'Mental Herb', usage: 4.4 },
      { name: 'Focus Sash', usage: 2.9 },
      { name: 'Leftovers', usage: 2.2 },
    ],
    abilities: [
      { name: 'Armor Tail', usage: 99.9 },
      { name: 'Cud Chew', usage: 0.0 },
      { name: 'Sap Sipper', usage: 0.0 },
    ],
    natures: [
      { name: 'Bold', usage: 33.8 },
      { name: 'Modest', usage: 18.3 },
      { name: 'Quiet', usage: 16.9 },
      { name: 'Relaxed', usage: 15.2 },
      { name: 'Sassy', usage: 10.0 },
      { name: 'Calm', usage: 5.5 },
    ],
    teammates: [
      { species: 'Sylveon', usage: 0 },
      { species: 'Kingambit', usage: 0 },
      { species: 'Torkoal', usage: 0 },
      { species: 'Garchomp', usage: 0 },
      { species: 'Basculegion', usage: 0 },
    ],
  },
  'Garchomp': {
    species: 'Garchomp',
    rank: 1,
    winrate: 52.366,
    moves: [
      { name: 'Earthquake', usage: 88.5 },
      { name: 'Protect', usage: 78.2 },
      { name: 'Rock Slide', usage: 52.3 },
      { name: 'Dragon Claw', usage: 45.1 },
      { name: 'Stomping Tantrum', usage: 35.6 },
      { name: 'Swords Dance', usage: 28.4 },
      { name: 'Scale Shot', usage: 15.2 },
    ],
    items: [
      { name: 'Life Orb', usage: 35.2 },
      { name: 'Sitrus Berry', usage: 28.5 },
      { name: 'Choice Scarf', usage: 18.3 },
      { name: 'Roseli Berry', usage: 8.1 },
    ],
    abilities: [
      { name: 'Rough Skin', usage: 97.5 },
      { name: 'Sand Veil', usage: 2.5 },
    ],
    natures: [
      { name: 'Jolly', usage: 62.3 },
      { name: 'Adamant', usage: 28.5 },
      { name: 'Naive', usage: 5.2 },
    ],
    teammates: [
      { species: 'Whimsicott', usage: 0 },
      { species: 'Charizard-Mega-Y', usage: 0 },
      { species: 'Basculegion', usage: 0 },
      { species: 'Kingambit', usage: 0 },
      { species: 'Incineroar', usage: 0 },
    ],
  },
  'Kingambit': {
    species: 'Kingambit',
    rank: 5,
    winrate: 55.431,
    moves: [
      { name: 'Sucker Punch', usage: 98.2 },
      { name: 'Kowtow Cleave', usage: 92.5 },
      { name: 'Iron Head', usage: 68.3 },
      { name: 'Protect', usage: 55.1 },
      { name: 'Swords Dance', usage: 32.8 },
      { name: 'Low Kick', usage: 18.5 },
    ],
    items: [
      { name: 'Chople Berry', usage: 35.5 },
      { name: 'Black Glasses', usage: 22.3 },
      { name: 'Focus Sash', usage: 18.2 },
      { name: 'Life Orb', usage: 12.8 },
    ],
    abilities: [
      { name: 'Supreme Overlord', usage: 98.5 },
      { name: 'Defiant', usage: 1.5 },
    ],
    natures: [
      { name: 'Adamant', usage: 72.5 },
      { name: 'Jolly', usage: 18.3 },
      { name: 'Impish', usage: 5.2 },
    ],
    teammates: [
      { species: 'Garchomp', usage: 0 },
      { species: 'Whimsicott', usage: 0 },
      { species: 'Basculegion', usage: 0 },
      { species: 'Charizard-Mega-Y', usage: 0 },
      { species: 'Incineroar', usage: 0 },
    ],
  },
};

export function getPikalyticsData(species: string): PikalyticsPokemon | undefined {
  return PIKALYTICS_DETAILS[species];
}

export function getPikalyticsRank(species: string): number {
  const entry = PIKALYTICS_TOP_20.find((p) =>
    p.species.toLowerCase() === species.toLowerCase()
  );
  return entry?.rank || 0;
}

export function getPikalyticsWinrate(species: string): number {
  const entry = PIKALYTICS_TOP_20.find((p) =>
    p.species.toLowerCase() === species.toLowerCase()
  );
  return entry?.winrate || 0;
}
