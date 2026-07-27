import { CHAMPIONS_USAGE_RANKINGS_SNAPSHOT } from './generated/championsUsageRankings';

export interface ChampionsUsageMetadata {
  readonly schemaVersion: number;
  readonly sourceName: string;
  readonly sourceUrl: string;
  readonly apiUrl: string;
  readonly sourceUpdatedAt: string;
  readonly dataVersion: string;
  readonly season: string;
  readonly format: string;
  readonly rankedPokemonCount: number;
  readonly detailedPokemonCount: number;
}

export interface ChampionsUsageRanking {
  readonly species: string;
  readonly showdownId: string;
  readonly rank: number;
}

export const CHAMPIONS_USAGE_META: ChampionsUsageMetadata = CHAMPIONS_USAGE_RANKINGS_SNAPSHOT.metadata;
export const CHAMPIONS_USAGE_RANKINGS: ReadonlyArray<ChampionsUsageRanking> =
  CHAMPIONS_USAGE_RANKINGS_SNAPSHOT.rankings;
export const CHAMPIONS_USAGE_TOP_20 = CHAMPIONS_USAGE_RANKINGS.slice(0, 20);

const RANK_BY_ID = new Map(
  CHAMPIONS_USAGE_RANKINGS.map((entry) => [entry.showdownId, entry.rank]),
);

export function toShowdownId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function getChampionsUsageRank(species: string): number {
  return RANK_BY_ID.get(toShowdownId(species)) ?? 0;
}
