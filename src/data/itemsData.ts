// ============================================================================
// PocketForge — Competitive Items Database
// ============================================================================

import type { Item } from '../types';

export const ITEMS: Item[] = [
  // Choice Items
  { name: "Choice Band", category: "Choice", description: "Boosts Attack by 1.5x, but locks the user into one move." },
  { name: "Choice Specs", category: "Choice", description: "Boosts Sp. Atk by 1.5x, but locks the user into one move." },
  { name: "Choice Scarf", category: "Choice", description: "Boosts Speed by 1.5x, but locks the user into one move." },
  // Life Orb
  { name: "Life Orb", category: "Offensive", description: "Boosts move power by 1.3x, but user takes 10% recoil." },
  // Leftovers
  { name: "Leftovers", category: "Recovery", description: "Restores 1/16 of max HP at the end of each turn." },
  // Berries
  { name: "Sitrus Berry", category: "Berry", description: "Restores 25% HP when HP falls below 50%." },
  { name: "Lum Berry", category: "Berry", description: "Cures any status condition once." },
  { name: "Occa Berry", category: "Berry", description: "Halves damage from one super effective Fire move." },
  { name: "Passho Berry", category: "Berry", description: "Halves damage from one super effective Water move." },
  { name: "Wacan Berry", category: "Berry", description: "Halves damage from one super effective Electric move." },
  { name: "Rindo Berry", category: "Berry", description: "Halves damage from one super effective Grass move." },
  { name: "Yache Berry", category: "Berry", description: "Halves damage from one super effective Ice move." },
  { name: "Chople Berry", category: "Berry", description: "Halves damage from one super effective Fighting move." },
  { name: "Kebia Berry", category: "Berry", description: "Halves damage from one super effective Poison move." },
  { name: "Shuca Berry", category: "Berry", description: "Halves damage from one super effective Ground move." },
  { name: "Coba Berry", category: "Berry", description: "Halves damage from one super effective Flying move." },
  { name: "Payapa Berry", category: "Berry", description: "Halves damage from one super effective Psychic move." },
  { name: "Tanga Berry", category: "Berry", description: "Halves damage from one super effective Bug move." },
  { name: "Charti Berry", category: "Berry", description: "Halves damage from one super effective Rock move." },
  { name: "Kasib Berry", category: "Berry", description: "Halves damage from one super effective Ghost move." },
  { name: "Haban Berry", category: "Berry", description: "Halves damage from one super effective Dragon move." },
  { name: "Colbur Berry", category: "Berry", description: "Halves damage from one super effective Dark move." },
  { name: "Babiri Berry", category: "Berry", description: "Halves damage from one super effective Steel move." },
  { name: "Chilan Berry", category: "Berry", description: "Halves damage from one Normal-type move." },
  { name: "Roseli Berry", category: "Berry", description: "Halves damage from one super effective Fairy move." },
  { name: "Leichi Berry", category: "Berry", description: "Raises Attack when HP falls below 25%." },
  { name: "Ganlon Berry", category: "Berry", description: "Raises Defense when HP falls below 25%." },
  { name: "Salac Berry", category: "Berry", description: "Raises Speed when HP falls below 25%." },
  { name: "Petaya Berry", category: "Berry", description: "Raises Sp. Atk when HP falls below 25%." },
  { name: "Apicot Berry", category: "Berry", description: "Raises Sp. Def when HP falls below 25%." },
  { name: "Liechi Berry", category: "Berry", description: "Raises Attack when HP falls below 25%." },
  // Mega Stones
  { name: "Venusaurite", category: "Mega Stone", description: "Enables Venusaur to Mega Evolve in battle." },
  { name: "Charizardite X", category: "Mega Stone", description: "Enables Charizard to Mega Evolve into Mega Charizard X." },
  { name: "Charizardite Y", category: "Mega Stone", description: "Enables Charizard to Mega Evolve into Mega Charizard Y." },
  { name: "Blastoisinite", category: "Mega Stone", description: "Enables Blastoise to Mega Evolve in battle." },
  { name: "Gengarite", category: "Mega Stone", description: "Enables Gengar to Mega Evolve in battle." },
  { name: "Gardevoirite", category: "Mega Stone", description: "Enables Gardevoir to Mega Evolve in battle." },
  { name: "Mawilite", category: "Mega Stone", description: "Enables Mawile to Mega Evolve in battle." },
  { name: "Aggronite", category: "Mega Stone", description: "Enables Aggron to Mega Evolve in battle." },
  { name: "Medichamite", category: "Mega Stone", description: "Enables Medicham to Mega Evolve in battle." },
  { name: "Altarianite", category: "Mega Stone", description: "Enables Altaria to Mega Evolve in battle." },
  { name: "Salamencite", category: "Mega Stone", description: "Enables Salamence to Mega Evolve in battle." },
  { name: "Metagrossite", category: "Mega Stone", description: "Enables Metagross to Mega Evolve in battle." },
  { name: "Lucarionite", category: "Mega Stone", description: "Enables Lucario to Mega Evolve in battle." },
  { name: "Gyaradosite", category: "Mega Stone", description: "Enables Gyarados to Mega Evolve in battle." },
  { name: "Tyranitarite", category: "Mega Stone", description: "Enables Tyranitar to Mega Evolve in battle." },
  { name: "Scizorite", category: "Mega Stone", description: "Enables Scizor to Mega Evolve in battle." },
  { name: "Pinsirite", category: "Mega Stone", description: "Enables Pinsir to Mega Evolve in battle." },
  { name: "Aerodactylite", category: "Mega Stone", description: "Enables Aerodactyl to Mega Evolve in battle." },
  { name: "Slowbronite", category: "Mega Stone", description: "Enables Slowbro to Mega Evolve in battle." },
  { name: "Alakazite", category: "Mega Stone", description: "Enables Alakazam to Mega Evolve in battle." },
  { name: "Kangaskhanite", category: "Mega Stone", description: "Enables Kangaskhan to Mega Evolve in battle." },
  { name: "Diancite", category: "Mega Stone", description: "Enables Diancie to Mega Evolve in battle." },
  // Z-Crystals
  { name: "Normalium Z", category: "Z-Crystal", description: "Upgrades Normal-type moves to Z-Moves." },
  { name: "Fightinium Z", category: "Z-Crystal", description: "Upgrades Fighting-type moves to Z-Moves." },
  { name: "Flyinium Z", category: "Z-Crystal", description: "Upgrades Flying-type moves to Z-Moves." },
  { name: "Poisonium Z", category: "Z-Crystal", description: "Upgrades Poison-type moves to Z-Moves." },
  { name: "Groundium Z", category: "Z-Crystal", description: "Upgrades Ground-type moves to Z-Moves." },
  { name: "Rockium Z", category: "Z-Crystal", description: "Upgrades Rock-type moves to Z-Moves." },
  { name: "Bugium Z", category: "Z-Crystal", description: "Upgrades Bug-type moves to Z-Moves." },
  { name: "Ghostium Z", category: "Z-Crystal", description: "Upgrades Ghost-type moves to Z-Moves." },
  { name: "Steelium Z", category: "Z-Crystal", description: "Upgrades Steel-type moves to Z-Moves." },
  { name: "Firium Z", category: "Z-Crystal", description: "Upgrades Fire-type moves to Z-Moves." },
  { name: "Waterium Z", category: "Z-Crystal", description: "Upgrades Water-type moves to Z-Moves." },
  { name: "Grassium Z", category: "Z-Crystal", description: "Upgrades Grass-type moves to Z-Moves." },
  { name: "Electrium Z", category: "Z-Crystal", description: "Upgrades Electric-type moves to Z-Moves." },
  { name: "Psychium Z", category: "Z-Crystal", description: "Upgrades Psychic-type moves to Z-Moves." },
  { name: "Icium Z", category: "Z-Crystal", description: "Upgrades Ice-type moves to Z-Moves." },
  { name: "Dragonium Z", category: "Z-Crystal", description: "Upgrades Dragon-type moves to Z-Moves." },
  { name: "Darkinium Z", category: "Z-Crystal", description: "Upgrades Dark-type moves to Z-Moves." },
  { name: "Fairium Z", category: "Z-Crystal", description: "Upgrades Fairy-type moves to Z-Moves." },
  // Offensive Items
  { name: "Muscle Band", category: "Offensive", description: "Boosts physical moves by 1.1x." },
  { name: "Wise Glasses", category: "Offensive", description: "Boosts special moves by 1.1x." },
  { name: "Expert Belt", category: "Offensive", description: "Boosts super effective moves by 1.2x." },
  { name: "Metronome", category: "Offensive", description: "Boosts move power when used consecutively." },
  { name: "Loaded Dice", category: "Offensive", description: "Multi-hit moves hit more times." },
  { name: "Punching Glove", category: "Offensive", description: "Boosts punching moves by 1.1x. Protects from contact effects." },
  { name: "Razor Claw", category: "Offensive", description: "Raises critical hit ratio." },
  { name: "Scope Lens", category: "Offensive", description: "Raises critical hit ratio." },
  { name: "Wide Lens", category: "Offensive", description: "Boosts accuracy by 1.1x." },
  { name: "Zoom Lens", category: "Offensive", description: "Boosts accuracy by 1.2x if user moves after target." },
  { name: "Throat Spray", category: "Offensive", description: "Raises Sp. Atk after using a sound move." },
  { name: "Blunder Policy", category: "Offensive", description: "Raises Speed sharply if move misses." },
  { name: "Weakness Policy", category: "Offensive", description: "Sharply raises Atk and Sp.Atk when hit by a super effective move." },
  // Defensive Items
  { name: "Rocky Helmet", category: "Defensive", description: "Damages attackers on contact." },
  { name: "Eviolite", category: "Defensive", description: "Boosts Defense and Sp. Def by 1.5x if Pokemon can evolve." },
  { name: "Assault Vest", category: "Defensive", description: "Boosts Sp. Def by 1.5x, but prevents status moves." },
  { name: "Heavy-Duty Boots", category: "Defensive", description: "Protects from entry hazards." },
  { name: "Focus Sash", category: "Defensive", description: "Prevents OHKO if user is at full HP. Consumed after use." },
  { name: "Air Balloon", category: "Defensive", description: "Grants immunity to Ground-type moves. Pops on contact." },
  { name: "Binding Band", category: "Defensive", description: "Increases damage from binding moves." },
  { name: "Heat Rock", category: "Defensive", description: "Extends sun duration." },
  { name: "Damp Rock", category: "Defensive", description: "Extends rain duration." },
  { name: "Smooth Rock", category: "Defensive", description: "Extends sandstorm duration." },
  { name: "Icy Rock", category: "Defensive", description: "Extends hail/snow duration." },
  { name: "Terrain Extender", category: "Defensive", description: "Extends terrain duration." },
  { name: "Light Clay", category: "Defensive", description: "Extends Aurora Veil, Light Screen, and Reflect duration." },
  // Utility Items
  { name: "Black Sludge", category: "Utility", description: "Restores 1/16 HP for Poison types. Damages others." },
  { name: "Sticky Barb", category: "Utility", description: "Damages holder. Transfers on contact." },
  { name: "Toxic Orb", category: "Utility", description: "Badly poisons the holder at the end of each turn." },
  { name: "Flame Orb", category: "Utility", description: "Burns the holder at the end of each turn." },
  { name: "White Herb", category: "Utility", description: "Restores lowered stats once." },
  { name: "Mental Herb", category: "Utility", description: "Cures infatuation, Taunt, Encore, Torment, Disable, Heal Block." },
  { name: "Power Herb", category: "Utility", description: "Eliminates charge turn for moves like Solar Beam." },
  { name: "Red Card", category: "Utility", description: "Forces attacker out when hit." },
  { name: "Eject Button", category: "Utility", description: "Switches user out when hit." },
  { name: "Eject Pack", category: "Utility", description: "Switches user out when stats are lowered." },
  { name: "Room Service", category: "Utility", description: "Lowers Speed when Trick Room is active." },
  { name: "Adrenaline Orb", category: "Utility", description: "Raises Speed when Intimidated. Consumes item." },
  { name: "Lagging Tail", category: "Utility", description: "Holder always moves last." },
  { name: "Full Incense", category: "Utility", description: "Holder always moves last." },
  { name: "Quick Claw", category: "Utility", description: "Occasionally allows moving first." },
  { name: "King's Rock", category: "Utility", description: "Adds a flinch chance to moves." },
  { name: "Razor Fang", category: "Utility", description: "Adds a flinch chance to moves." },
  { name: "Shell Bell", category: "Utility", description: "Restores 1/8 of damage dealt as HP." },
  { name: "Big Root", category: "Utility", description: "Boosts HP recovery from draining moves." },
  { name: "Grip Claw", category: "Utility", description: "Extends duration of binding moves." },
  { name: "Bright Powder", category: "Utility", description: "Lowers opponent's accuracy slightly." },
  { name: "Snowball", category: "Utility", description: "Raises Attack when hit by an Ice-type move." },
  { name: "Absorb Bulb", category: "Utility", description: "Raises Sp. Atk when hit by a Water-type move." },
  { name: "Cell Battery", category: "Utility", description: "Raises Attack when hit by an Electric-type move." },
  { name: "Luminous Moss", category: "Utility", description: "Raises Sp. Def when hit by a Water-type move." },
  { name: "Snowball", category: "Utility", description: "Raises Attack when hit by an Ice-type move." },
  { name: "Utility Umbrella", category: "Utility", description: "Negates weather effects on the holder." },
  { name: "Clear Amulet", category: "Utility", description: "Prevents stat reduction from opposing moves." },
  { name: "Mirror Herb", category: "Utility", description: "Copies an opponent's stat boosts once." },
  { name: "Covert Cloak", category: "Utility", description: "Prevents additional effects of moves." },
  { name: "Booster Energy", category: "Utility", description: "Boosts highest stat for Paradox Pokemon." },
  // Type-Enhancing Items
  { name: "Silk Scarf", category: "Held Item", description: "Boosts Normal-type moves by 1.2x." },
  { name: "Charcoal", category: "Held Item", description: "Boosts Fire-type moves by 1.2x." },
  { name: "Mystic Water", category: "Held Item", description: "Boosts Water-type moves by 1.2x." },
  { name: "Magnet", category: "Held Item", description: "Boosts Electric-type moves by 1.2x." },
  { name: "Miracle Seed", category: "Held Item", description: "Boosts Grass-type moves by 1.2x." },
  { name: "Never-Melt Ice", category: "Held Item", description: "Boosts Ice-type moves by 1.2x." },
  { name: "Black Belt", category: "Held Item", description: "Boosts Fighting-type moves by 1.2x." },
  { name: "Poison Barb", category: "Held Item", description: "Boosts Poison-type moves by 1.2x." },
  { name: "Soft Sand", category: "Held Item", description: "Boosts Ground-type moves by 1.2x." },
  { name: "Sharp Beak", category: "Held Item", description: "Boosts Flying-type moves by 1.2x." },
  { name: "Twisted Spoon", category: "Held Item", description: "Boosts Psychic-type moves by 1.2x." },
  { name: "Silver Powder", category: "Held Item", description: "Boosts Bug-type moves by 1.2x." },
  { name: "Hard Stone", category: "Held Item", description: "Boosts Rock-type moves by 1.2x." },
  { name: "Spell Tag", category: "Held Item", description: "Boosts Ghost-type moves by 1.2x." },
  { name: "Dragon Fang", category: "Held Item", description: "Boosts Dragon-type moves by 1.2x." },
  { name: "Black Glasses", category: "Held Item", description: "Boosts Dark-type moves by 1.2x." },
  { name: "Metal Coat", category: "Held Item", description: "Boosts Steel-type moves by 1.2x." },
  { name: "Fairy Feather", category: "Held Item", description: "Boosts Fairy-type moves by 1.2x." },
  // Gems (Gen 5)
  { name: "Normal Gem", category: "Held Item", description: "Boosts first Normal move by 1.3x. Consumed." },
  { name: "Flying Gem", category: "Held Item", description: "Boosts first Flying move by 1.3x. Consumed." },
  { name: "Electric Gem", category: "Held Item", description: "Boosts first Electric move by 1.3x. Consumed." },
  { name: "Psychic Gem", category: "Held Item", description: "Boosts first Psychic move by 1.3x. Consumed." },
  { name: "Steel Gem", category: "Held Item", description: "Boosts first Steel move by 1.3x. Consumed." },
  { name: "Ghost Gem", category: "Held Item", description: "Boosts first Ghost move by 1.3x. Consumed." },
  { name: "Dark Gem", category: "Held Item", description: "Boosts first Dark move by 1.3x. Consumed." },
  { name: "Rock Gem", category: "Held Item", description: "Boosts first Rock move by 1.3x. Consumed." },
  { name: "Fire Gem", category: "Held Item", description: "Boosts first Fire move by 1.3x. Consumed." },
  { name: "Water Gem", category: "Held Item", description: "Boosts first Water move by 1.3x. Consumed." },
  { name: "Grass Gem", category: "Held Item", description: "Boosts first Grass move by 1.3x. Consumed." },
  { name: "Ice Gem", category: "Held Item", description: "Boosts first Ice move by 1.3x. Consumed." },
  { name: "Fighting Gem", category: "Held Item", description: "Boosts first Fighting move by 1.3x. Consumed." },
  { name: "Poison Gem", category: "Held Item", description: "Boosts first Poison move by 1.3x. Consumed." },
  { name: "Ground Gem", category: "Held Item", description: "Boosts first Ground move by 1.3x. Consumed." },
  { name: "Bug Gem", category: "Held Item", description: "Boosts first Bug move by 1.3x. Consumed." },
  { name: "Dragon Gem", category: "Held Item", description: "Boosts first Dragon move by 1.3x. Consumed." },
  { name: "Fairy Gem", category: "Held Item", description: "Boosts first Fairy move by 1.3x. Consumed." },
  // Other Notable Items
  { name: "Light Ball", category: "Held Item", description: "Doubles Pikachu's Attack and Sp. Atk." },
  { name: "Thick Club", category: "Held Item", description: "Doubles Cubone and Marowak's Attack." },
  { name: "Leek", category: "Held Item", description: "Raises critical hit ratio for Farfetch'd and Sirfetch'd." },
  { name: "Quick Powder", category: "Held Item", description: "Doubles Ditto's Speed." },
  { name: "Metal Powder", category: "Held Item", description: "Raises Ditto's Defense." },
  { name: "Soul Dew", category: "Held Item", description: "Boosts Latios and Latias's Dragon and Psychic moves." },
  { name: "Adamant Orb", category: "Held Item", description: "Boosts Dialga's Dragon and Steel moves." },
  { name: "Lustrous Orb", category: "Held Item", description: "Boosts Palkia's Dragon and Water moves." },
  { name: "Griseous Orb", category: "Held Item", description: "Boosts Giratina's Dragon and Ghost moves." },
  { name: "Rusty Sword", category: "Held Item", description: "Allows Zacian to become Crowned Sword form." },
  { name: "Rusty Shield", category: "Held Item", description: "Allows Zamazenta to become Crowned Shield form." },
];

/** Lookup item by name */
export function getItemByName(name: string): Item | undefined {
  return ITEMS.find(i => i.name.toLowerCase() === name.toLowerCase().trim());
}

/** Search items */
export function searchItems(query: string): Item[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];
  return ITEMS.filter(i => i.name.toLowerCase().includes(normalized)).slice(0, 15);
}

/** Get all item names */
export function getAllItemNames(): string[] {
  return ITEMS.map(i => i.name);
}

/** Get sprite URL for an item */
export function getItemSpriteUrl(itemName: string): string {
  const normalized = itemName.toLowerCase().replace(/\\s+/g, '').replace(/'/g, '').replace(/-/g, '');
  return `https://play.pokemonshowdown.com/sprites/itemicons/${normalized}.png`;
}
