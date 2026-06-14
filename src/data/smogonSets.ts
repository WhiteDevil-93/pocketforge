// ============================================================================
// PocketForge — Curated Smogon-style Sample Sets (Gen 9 OU)
// ============================================================================
//
// A static, hand-curated catalogue of competitively plausible sets for popular
// Gen 9 OU Pokemon. No live network fetch — these are bundled with the app and
// can be applied to a Pokemon in the Builder via "Load Sample Set".
//
// Each set's species name MUST match the canonical Pokedex name used by
// getPokemonByName() in pokemonData.ts.
// ============================================================================

import type { EVs, IVs } from '../types';

export interface SmogonSet {
  name: string;          // e.g., "Choice Scarf"
  species: string;       // canonical Pokedex name
  format: string;        // e.g., "gen9ou"
  item: string;
  ability: string;
  nature: string;
  teraType?: string;
  evs: EVs;
  ivs?: Partial<IVs>;
  moves: string[];       // up to 4
  description: string;   // 1-2 sentence rationale
}

// ---- Helpers ---------------------------------------------------------------

const evs = (
  hp = 0,
  atk = 0,
  def = 0,
  spa = 0,
  spd = 0,
  spe = 0
): EVs => ({ hp, atk, def, spa, spd, spe });

// ---- Curated Sets ----------------------------------------------------------

export const SMOGON_SETS: SmogonSet[] = [
  // ---- Great Tusk ----
  {
    name: 'Booster Tank',
    species: 'Great Tusk',
    format: 'gen9ou',
    item: 'Booster Energy',
    ability: 'Protosynthesis',
    nature: 'Jolly',
    teraType: 'Ground',
    evs: evs(0, 252, 4, 0, 0, 252),
    moves: ['Headlong Rush', 'Close Combat', 'Ice Spinner', 'Rapid Spin'],
    description:
      'Speed-boosting Booster Energy turns Great Tusk into a fast offensive hazard remover with strong STAB coverage.',
  },
  {
    name: 'Defensive Hazard Control',
    species: 'Great Tusk',
    format: 'gen9ou',
    item: 'Leftovers',
    ability: 'Protosynthesis',
    nature: 'Impish',
    teraType: 'Poison',
    evs: evs(252, 0, 244, 0, 0, 12),
    moves: ['Headlong Rush', 'Knock Off', 'Rapid Spin', 'Stealth Rock'],
    description:
      'Bulky pivot that sets Stealth Rock, spins away hazards, and cripples switch-ins with Knock Off.',
  },

  // ---- Kingambit ----
  {
    name: 'Swords Dance Sweeper',
    species: 'Kingambit',
    format: 'gen9ou',
    item: 'Leftovers',
    ability: 'Supreme Overlord',
    nature: 'Adamant',
    teraType: 'Flying',
    evs: evs(252, 252, 0, 0, 4, 0),
    moves: ['Swords Dance', 'Kowtow Cleave', 'Iron Head', 'Sucker Punch'],
    description:
      'Late-game cleaner that snowballs with Supreme Overlord; Tera Flying dodges Fighting-type revenge kills after a boost.',
  },
  {
    name: 'Black Glasses Wallbreaker',
    species: 'Kingambit',
    format: 'gen9ou',
    item: 'Black Glasses',
    ability: 'Supreme Overlord',
    nature: 'Adamant',
    teraType: 'Dark',
    evs: evs(252, 252, 0, 0, 4, 0),
    moves: ['Kowtow Cleave', 'Sucker Punch', 'Iron Head', 'Low Kick'],
    description:
      'Boosted Kowtow Cleave and Sucker Punch make Kingambit a frightening immediate threat without setup.',
  },

  // ---- Gholdengo ----
  {
    name: 'Nasty Plot',
    species: 'Gholdengo',
    format: 'gen9ou',
    item: 'Air Balloon',
    ability: 'Good as Gold',
    nature: 'Timid',
    teraType: 'Flying',
    evs: evs(0, 0, 0, 252, 4, 252),
    moves: ['Nasty Plot', 'Make It Rain', 'Shadow Ball', 'Recover'],
    description:
      'Boosts with Nasty Plot under the Air Balloon, then sweeps with dual STABs while Recover keeps it healthy.',
  },
  {
    name: 'Choice Specs',
    species: 'Gholdengo',
    format: 'gen9ou',
    item: 'Choice Specs',
    ability: 'Good as Gold',
    nature: 'Timid',
    teraType: 'Steel',
    evs: evs(0, 0, 0, 252, 4, 252),
    moves: ['Make It Rain', 'Shadow Ball', 'Trick', 'Focus Blast'],
    description:
      'Immediate Specs-boosted Make It Rain punches huge holes; Trick cripples defensive cores.',
  },

  // ---- Iron Valiant ----
  {
    name: 'Booster Speed',
    species: 'Iron Valiant',
    format: 'gen9ou',
    item: 'Booster Energy',
    ability: 'Quark Drive',
    nature: 'Naive',
    teraType: 'Dark',
    evs: evs(0, 4, 0, 252, 0, 252),
    moves: ['Moonblast', 'Close Combat', 'Knock Off', 'Encore'],
    description:
      'Mixed attacker that abuses Booster Energy Speed; Knock Off and Encore add huge utility.',
  },

  // ---- Dragapult ----
  {
    name: 'Choice Specs',
    species: 'Dragapult',
    format: 'gen9ou',
    item: 'Choice Specs',
    ability: 'Infiltrator',
    nature: 'Timid',
    teraType: 'Fairy',
    evs: evs(0, 0, 0, 252, 4, 252),
    moves: ['Draco Meteor', 'Shadow Ball', 'Flamethrower', 'U-turn'],
    description:
      'Fast Specs-Draco breaks balance; U-turn keeps momentum and Tera Fairy provides emergency Dark immunity.',
  },
  {
    name: 'Dragon Dance',
    species: 'Dragapult',
    format: 'gen9ou',
    item: 'Heavy-Duty Boots',
    ability: 'Clear Body',
    nature: 'Jolly',
    teraType: 'Ghost',
    evs: evs(0, 252, 4, 0, 0, 252),
    moves: ['Dragon Dance', 'Dragon Darts', 'Tera Blast', 'Hex'],
    description:
      'Sets up Dragon Dance once a check is weakened, then cleans with Tera Ghost-boosted Hex or Dragon Darts.',
  },

  // ---- Garchomp ----
  {
    name: 'Stealth Rock Lead',
    species: 'Garchomp',
    format: 'gen9ou',
    item: 'Loaded Dice',
    ability: 'Rough Skin',
    nature: 'Jolly',
    teraType: 'Steel',
    evs: evs(0, 252, 4, 0, 0, 252),
    moves: ['Stealth Rock', 'Earthquake', 'Scale Shot', 'Dragon Tail'],
    description:
      'Reliable hazard setter; Scale Shot with Loaded Dice gives a Speed boost while phazing setup with Dragon Tail.',
  },

  // ---- Heatran ----
  {
    name: 'Magma Storm Trapper',
    species: 'Heatran',
    format: 'gen9ou',
    item: 'Leftovers',
    ability: 'Flash Fire',
    nature: 'Calm',
    teraType: 'Grass',
    evs: evs(252, 0, 0, 0, 252, 4),
    moves: ['Magma Storm', 'Earth Power', 'Taunt', 'Stealth Rock'],
    description:
      'Specially defensive Heatran traps Blissey-style walls with Magma Storm and Taunt while setting rocks.',
  },

  // ---- Landorus-Therian ----
  {
    name: 'Defensive Pivot',
    species: 'Landorus',
    format: 'gen9ou',
    item: 'Leftovers',
    ability: 'Intimidate',
    nature: 'Impish',
    teraType: 'Water',
    evs: evs(252, 0, 240, 0, 0, 16),
    moves: ['Earthquake', 'U-turn', 'Stealth Rock', 'Taunt'],
    description:
      'Physically defensive Intimidate pivot that lays Stealth Rock and keeps momentum with U-turn.',
  },

  // ---- Corviknight ----
  {
    name: 'Defensive Pivot',
    species: 'Corviknight',
    format: 'gen9ou',
    item: 'Leftovers',
    ability: 'Pressure',
    nature: 'Impish',
    teraType: 'Dragon',
    evs: evs(252, 0, 252, 0, 4, 0),
    moves: ['Body Press', 'Roost', 'U-turn', 'Defog'],
    description:
      'Classic physical wall: removes hazards, pivots out with U-turn, and threatens back with Body Press.',
  },

  // ---- Toxapex ----
  {
    name: 'Toxic Stall',
    species: 'Toxapex',
    format: 'gen9ou',
    item: 'Black Sludge',
    ability: 'Regenerator',
    nature: 'Bold',
    teraType: 'Fairy',
    evs: evs(252, 0, 252, 0, 4, 0),
    moves: ['Surf', 'Toxic', 'Recover', 'Haze'],
    description:
      'Premier defensive pivot; Toxic + Recover stalls breakers while Haze stops set-up sweepers cold.',
  },

  // ---- Ting-Lu ----
  {
    name: 'Specially Defensive Rocker',
    species: 'Ting-Lu',
    format: 'gen9ou',
    item: 'Leftovers',
    ability: 'Vessel of Ruin',
    nature: 'Careful',
    teraType: 'Poison',
    evs: evs(252, 4, 0, 0, 252, 0),
    moves: ['Earthquake', 'Ruination', 'Stealth Rock', 'Whirlwind'],
    description:
      'Massive special bulk + Vessel of Ruin shut down special attackers; Whirlwind racks up hazard chip.',
  },

  // ---- Clodsire ----
  {
    name: 'Unaware Wall',
    species: 'Clodsire',
    format: 'gen9ou',
    item: 'Leftovers',
    ability: 'Unaware',
    nature: 'Careful',
    teraType: 'Dark',
    evs: evs(252, 4, 0, 0, 252, 0),
    moves: ['Earthquake', 'Recover', 'Toxic', 'Haze'],
    description:
      'Unaware ignores boosts from setup sweepers; Toxic + Recover wears down everything else.',
  },

  // ---- Hatterene ----
  {
    name: 'Calm Mind',
    species: 'Hatterene',
    format: 'gen9ou',
    item: 'Leftovers',
    ability: 'Magic Bounce',
    nature: 'Bold',
    teraType: 'Water',
    evs: evs(252, 0, 252, 0, 4, 0),
    moves: ['Calm Mind', 'Draining Kiss', 'Stored Power', 'Nuzzle'],
    description:
      'Magic Bounce blanks hazards; Calm Mind + Stored Power snowballs once Dark/Steel threats are removed.',
  },

  // ---- Iron Moth ----
  {
    name: 'Booster Energy',
    species: 'Iron Moth',
    format: 'gen9ou',
    item: 'Booster Energy',
    ability: 'Quark Drive',
    nature: 'Timid',
    teraType: 'Grass',
    evs: evs(0, 0, 4, 252, 0, 252),
    moves: ['Fiery Dance', 'Sludge Wave', 'Energy Ball', 'Substitute'],
    description:
      'Booster Energy + Fiery Dance boosts let Iron Moth snowball; Sub keeps it healthy versus status.',
  },

  // ---- Meowscarada ----
  {
    name: 'Choice Band',
    species: 'Meowscarada',
    format: 'gen9ou',
    item: 'Choice Band',
    ability: 'Protean',
    nature: 'Jolly',
    teraType: 'Grass',
    evs: evs(0, 252, 4, 0, 0, 252),
    moves: ['Flower Trick', 'Knock Off', 'U-turn', 'Triple Axel'],
    description:
      'Band Protean Flower Trick always crits; U-turn and Knock Off make it an elite offensive pivot.',
  },

  // ---- Roaring Moon ----
  {
    name: 'Dragon Dance',
    species: 'Roaring Moon',
    format: 'gen9ou',
    item: 'Booster Energy',
    ability: 'Protosynthesis',
    nature: 'Jolly',
    teraType: 'Flying',
    evs: evs(0, 252, 4, 0, 0, 252),
    moves: ['Dragon Dance', 'Knock Off', 'Acrobatics', 'Earthquake'],
    description:
      'Booster Speed + Dragon Dance makes Roaring Moon nearly unrevengeable; Tera Flying powers up Acrobatics.',
  },

  // ---- Slowking-Galar ----
  {
    name: 'Future Sight Pivot',
    species: 'Slowking',
    format: 'gen9ou',
    item: 'Assault Vest',
    ability: 'Regenerator',
    nature: 'Calm',
    teraType: 'Water',
    evs: evs(252, 0, 4, 0, 252, 0),
    moves: ['Future Sight', 'Sludge Bomb', 'Flamethrower', 'Chilly Reception'],
    description:
      'Assault Vest pivot that breaks balance with Future Sight + offensive teammate; Chilly Reception swaps momentum.',
  },

  // ---- Zamazenta ----
  {
    name: 'Defensive Pivot',
    species: 'Zamazenta',
    format: 'gen9ou',
    item: 'Leftovers',
    ability: 'Dauntless Shield',
    nature: 'Jolly',
    teraType: 'Steel',
    evs: evs(252, 0, 4, 0, 0, 252),
    moves: ['Body Press', 'Crunch', 'Stone Edge', 'Iron Defense'],
    description:
      'Iron Defense + Body Press abuses the +1 from Dauntless Shield to become an unbreakable late-game sweeper.',
  },

  // ---- Skeledirge ----
  {
    name: 'Torch Song',
    species: 'Skeledirge',
    format: 'gen9ou',
    item: 'Heavy-Duty Boots',
    ability: 'Unaware',
    nature: 'Bold',
    teraType: 'Fairy',
    evs: evs(252, 0, 252, 0, 4, 0),
    moves: ['Torch Song', 'Slack Off', 'Hex', 'Will-O-Wisp'],
    description:
      'Unaware physical wall that snowballs Special Attack with Torch Song; Will-O-Wisp + Hex finishes attackers.',
  },

  // ---- Volcarona ----
  {
    name: 'Quiver Dance',
    species: 'Volcarona',
    format: 'gen9ou',
    item: 'Heavy-Duty Boots',
    ability: 'Flame Body',
    nature: 'Timid',
    teraType: 'Ground',
    evs: evs(72, 0, 0, 184, 0, 252),
    moves: ['Quiver Dance', 'Fiery Dance', 'Bug Buzz', 'Tera Blast'],
    description:
      'Premier late-game sweeper; Tera Ground Tera Blast nukes Heatran while QD makes it nearly unstoppable.',
  },

  // ---- Tornadus-Therian ----
  {
    name: 'Defensive Defogger',
    species: 'Tornadus',
    format: 'gen9ou',
    item: 'Heavy-Duty Boots',
    ability: 'Regenerator',
    nature: 'Bold',
    teraType: 'Steel',
    evs: evs(248, 0, 224, 0, 0, 36),
    moves: ['Bleakwind Storm', 'U-turn', 'Defog', 'Knock Off'],
    description:
      'Regenerator + Heavy-Duty Boots makes Tornadus a tireless hazard remover and offensive pivot.',
  },

  // ---- Weavile ----
  {
    name: 'Swords Dance',
    species: 'Weavile',
    format: 'gen9ou',
    item: 'Heavy-Duty Boots',
    ability: 'Pickpocket',
    nature: 'Jolly',
    teraType: 'Dark',
    evs: evs(0, 252, 4, 0, 0, 252),
    moves: ['Swords Dance', 'Triple Axel', 'Knock Off', 'Ice Shard'],
    description:
      'Sword Dance Weavile cleans late game; Ice Shard picks off faster threats and Knock Off removes items early.',
  },

  // ---- Gliscor ----
  {
    name: 'Toxic Stall',
    species: 'Gliscor',
    format: 'gen9ou',
    item: 'Toxic Orb',
    ability: 'Poison Heal',
    nature: 'Impish',
    teraType: 'Normal',
    evs: evs(244, 0, 248, 0, 0, 16),
    moves: ['Earthquake', 'Protect', 'Toxic', 'Spikes'],
    description:
      'Poison Heal pivot that lays Spikes and stalls with Protect + Toxic; Tera Normal blanks Ghost-type STABs.',
  },

  // ---- Iron Treads ----
  {
    name: 'Booster Speed',
    species: 'Iron Treads',
    format: 'gen9ou',
    item: 'Booster Energy',
    ability: 'Quark Drive',
    nature: 'Jolly',
    teraType: 'Ground',
    evs: evs(0, 252, 4, 0, 0, 252),
    moves: ['Earthquake', 'Knock Off', 'Rapid Spin', 'Stealth Rock'],
    description:
      'Fast offensive hazard control with Booster Speed; Knock Off cripples switch-ins and rocks pressure the foe.',
  },

  // ---- Rillaboom ----
  {
    name: 'Choice Band',
    species: 'Rillaboom',
    format: 'gen9ou',
    item: 'Choice Band',
    ability: 'Grassy Surge',
    nature: 'Adamant',
    teraType: 'Fire',
    evs: evs(0, 252, 4, 0, 0, 252),
    moves: ['Wood Hammer', 'Grassy Glide', 'U-turn', 'Knock Off'],
    description:
      'Band Grassy Glide gives priority STAB; U-turn and Knock Off make Rillaboom a relentless offensive pivot.',
  },
];

// ---- Lookup ----------------------------------------------------------------

/**
 * Returns curated sets for a given canonical species name. Case-insensitive
 * match so callers can pass display names without worry.
 */
export function getSetsForSpecies(species: string): SmogonSet[] {
  if (!species) return [];
  const key = species.trim().toLowerCase();
  return SMOGON_SETS.filter((s) => s.species.toLowerCase() === key);
}
