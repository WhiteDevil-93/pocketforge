import { Dex } from '@pkmn/dex';

export interface ItemEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  fling: number;
  onPlate: any;
  onDrive: any;
  onMemory: any;
  megaStone: any;
  megaEvolves: any;
  zMove: any;
  zMoveType: any;
  zMoveFrom: any;
  naturalGift: any;
  isBerry: boolean;
  isGem: boolean;
  isPokeball: boolean;
}

const mapDexItemToItemEntry = (i: any): ItemEntry => {
  return {
    id: i.id,
    name: i.name,
    description: i.shortDesc || i.desc || '',
    category: i.category || 'item',
    fling: i.fling?.basePower || 0,
    onPlate: i.onPlate || false,
    onDrive: i.onDrive || false,
    onMemory: i.onMemory || false,
    megaStone: i.megaStone || null,
    megaEvolves: i.megaEvolves || null,
    zMove: i.zMove || null,
    zMoveType: i.zMoveType || null,
    zMoveFrom: i.zMoveFrom || null,
    naturalGift: i.naturalGift || null,
    isBerry: !!i.isBerry,
    isGem: !!i.isGem,
    isPokeball: !!i.isPokeball,
  };
};

export const ITEMS: ItemEntry[] = Dex.items.all()
  .filter(i => i.exists && i.isNonstandard !== 'Custom')
  .map(mapDexItemToItemEntry);

export const ITEMS_BY_ID = new Map(ITEMS.map(i => [i.id, i]));

export function getItemByName(name: string): ItemEntry | undefined {
  if (!name) return undefined;
  const lowerName = name.toLowerCase().trim();
  return ITEMS.find(i => i.name.toLowerCase() === lowerName || i.id === lowerName);
}

export function searchItems(query: string): ItemEntry[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];
  return ITEMS.filter(i => i.name.toLowerCase().includes(normalized)).slice(0, 15);
}

export function getAllItemNames(): string[] {
  return ITEMS.map(i => i.name);
}

export function getItemSpriteUrl(itemName: string): string {
  const normalized = itemName.toLowerCase().replace(/\s+/g, '').replace(/'/g, '').replace(/-/g, '');
  return `https://play.pokemonshowdown.com/sprites/itemicons/${normalized}.png`;
}
