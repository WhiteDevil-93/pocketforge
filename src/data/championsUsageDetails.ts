import { CHAMPIONS_USAGE_DETAILS_SNAPSHOT } from './generated/championsUsageDetails';
import { toShowdownId, type ChampionsUsageMetadata } from './championsUsageRankings';

export interface UsageValue {
  readonly name: string;
  readonly usage: number;
}

export interface RankedTeammate {
  readonly species: string;
  readonly rank: number;
}

export interface ChampionsStatPointSpread {
  readonly rank: number;
  readonly usage: number;
  readonly points: {
    readonly hp: number;
    readonly atk: number;
    readonly def: number;
    readonly spa: number;
    readonly spd: number;
    readonly spe: number;
  };
}

export interface ChampionsPokemonUsage {
  readonly species: string;
  readonly showdownId: string;
  readonly rank: number;
  readonly moves: ReadonlyArray<UsageValue>;
  readonly items: ReadonlyArray<UsageValue>;
  readonly abilities: ReadonlyArray<UsageValue>;
  readonly natures: ReadonlyArray<UsageValue>;
  readonly teammates: ReadonlyArray<RankedTeammate>;
  readonly spreads: ReadonlyArray<ChampionsStatPointSpread>;
}

export const CHAMPIONS_USAGE_DETAILS_META: ChampionsUsageMetadata =
  CHAMPIONS_USAGE_DETAILS_SNAPSHOT.metadata;

const DETAILS_BY_ID: Readonly<Record<string, ChampionsPokemonUsage>> =
  CHAMPIONS_USAGE_DETAILS_SNAPSHOT.pokemon;

export function getChampionsUsageData(species: string): ChampionsPokemonUsage | undefined {
  return DETAILS_BY_ID[toShowdownId(species)];
}
