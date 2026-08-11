// ============================================================================
// PocketForge — Battle Data shared row components
//
// Compact ranked rows for items / abilities / spreads / teammates / matchups
// plus the shared usage bar and 'Not enough data' empty state. All data shown
// comes straight from the committed Smogon snapshot — nothing here fabricates
// numbers; percentages are only formatted for display.
// ============================================================================

import { memo } from 'react';
import PokemonSprite from '../PokemonSprite';
import { getTypeColor } from '../../data/typesData';
import { formatUsage } from './formatHelpers';
import type {
  RankedAbility,
  RankedItem,
  RankedMatchup,
  RankedMove,
  RankedSpread,
  RankedTeammate,
} from '@/lib/data';

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  atk: 'Atk',
  def: 'Def',
  spa: 'SpA',
  spd: 'SpD',
  spe: 'Spe',
};

const STAT_ORDER = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const;

/** Thin usage bar; width normalized to `max` when given, else clamped to 100. */
export function UsageBar({
  value,
  max,
  className = '',
  barClassName = 'bg-accent-primary/80',
}: {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
}) {
  const width =
    max && max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : Math.max(0, Math.min(100, value));
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated ${className}`}
      role="presentation"
    >
      <div
        className={`h-full rounded-full ${barClassName}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

/** Rank badge, e.g. '#39'. */
export function RankBadge({ rank, className = '' }: { rank: number; className?: string }) {
  return (
    <span className={`font-stat-number text-sm text-text-secondary tabular-nums ${className}`}>
      #{rank}
    </span>
  );
}

/** Explicit empty state for a category with no recorded entries. */
export function NotEnoughData({
  title = 'Not enough data',
  description = 'No entries recorded for this category in the current snapshot.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border-subtle px-4 py-6 text-center">
      <span className="font-caption text-text-secondary">{title}</span>
      {description && (
        <p className="font-micro text-text-tertiary max-w-[280px]">{description}</p>
      )}
    </div>
  );
}

/** Ranked held-item row: rank, item sprite, name, usage bar. */
export const ItemRow = memo(function ItemRow({
  item,
  max,
}: {
  item: RankedItem;
  max?: number;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <RankBadge rank={item.rank} className="mt-0.5 w-8 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {item.spriteUrl && (
            <img
              src={item.spriteUrl}
              alt=""
              className="h-6 w-6 shrink-0 object-contain [image-rendering:pixelated]"
              loading="lazy"
            />
          )}
          <span className="truncate font-body text-text-primary">{item.name}</span>
          <span className="ml-auto shrink-0 font-stat-number text-sm text-text-secondary tabular-nums">
            {formatUsage(item.usagePercent)}
          </span>
        </div>
        <UsageBar value={item.usagePercent} max={max} className="mt-1.5" />
        {item.description && (
          <p className="mt-1.5 line-clamp-2 font-caption text-text-secondary">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
});

/** Ranked ability row: rank, ability name, usage bar, short description. */
export const AbilityRow = memo(function AbilityRow({
  ability,
  max,
}: {
  ability: RankedAbility;
  max?: number;
}) {
  return (
    <div className="py-2.5">
      <div className="flex items-center gap-2">
        <RankBadge rank={ability.rank} className="w-8 shrink-0" />
        <span className="truncate font-body text-text-primary">{ability.name}</span>
        <span className="ml-auto shrink-0 font-stat-number text-sm text-text-secondary tabular-nums">
          {formatUsage(ability.usagePercent)}
        </span>
      </div>
      <div className="ml-8">
        <UsageBar value={ability.usagePercent} max={max} className="mt-1.5" />
        {ability.shortDescription && (
          <p className="mt-1.5 line-clamp-2 font-caption text-text-secondary">
            {ability.shortDescription}
          </p>
        )}
      </div>
    </div>
  );
});

/** Ranked nature + EV spread row, e.g. 'Adamant 252 HP / 252 Atk / 4 Def'. */
export const SpreadRow = memo(function SpreadRow({
  spread,
  max,
}: {
  spread: RankedSpread;
  max?: number;
}) {
  return (
    <div className="py-2.5">
      <div className="flex items-center gap-2">
        <RankBadge rank={spread.rank} className="w-8 shrink-0" />
        <span className="font-body-medium text-text-primary">{spread.nature}</span>
        <span className="truncate font-caption text-text-tertiary">{spread.evsText}</span>
        <span className="ml-auto shrink-0 font-stat-number text-sm text-text-secondary tabular-nums">
          {formatUsage(spread.usagePercent)}
        </span>
      </div>
      <div className="ml-8">
        <UsageBar value={spread.usagePercent} max={max} className="mt-1.5" />
      </div>
    </div>
  );
});

/** Same spread data presented as EV stat-point chips (Stat Points tab). */
export const StatPointsRow = memo(function StatPointsRow({
  spread,
  max,
}: {
  spread: RankedSpread;
  max?: number;
}) {
  const points = STAT_ORDER.filter((stat) => (spread.evs[stat] ?? 0) > 0);
  return (
    <div className="py-2.5">
      <div className="flex items-center gap-2">
        <RankBadge rank={spread.rank} className="w-8 shrink-0" />
        <span className="font-body-medium text-text-primary">{spread.nature}</span>
        <span className="ml-auto shrink-0 font-stat-number text-sm text-text-secondary tabular-nums">
          {formatUsage(spread.usagePercent)}
        </span>
      </div>
      <div className="ml-8 mt-2 flex flex-wrap gap-1.5">
        {points.length > 0 ? (
          points.map((stat) => (
            <span
              key={stat}
              className="rounded-md border border-border-subtle bg-bg-elevated px-2 py-1 font-micro text-text-secondary"
            >
              {STAT_LABELS[stat]} {spread.evs[stat]}
            </span>
          ))
        ) : (
          <span className="font-micro text-text-tertiary">No EV investment</span>
        )}
      </div>
      <div className="ml-8">
        <UsageBar value={spread.usagePercent} max={max} className="mt-2" />
      </div>
    </div>
  );
});

/** Ranked teammate row: sprite, name, usage % + bar. */
export const TeammateRow = memo(function TeammateRow({
  teammate,
  max,
}: {
  teammate: RankedTeammate;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <RankBadge rank={teammate.rank} className="w-8 shrink-0" />
      <PokemonSprite name={teammate.name} size={32} />
      <span className="min-w-0 flex-1 truncate font-body text-text-primary">{teammate.name}</span>
      <span className="shrink-0 font-stat-number text-sm text-text-secondary tabular-nums">
        {formatUsage(teammate.usagePercent)}
      </span>
      <div className="w-16 shrink-0">
        <UsageBar value={teammate.usagePercent} max={max} />
      </div>
    </div>
  );
});

/**
 * Ranked matchup row (Checks & Counters). `kind` picks which rate the bar
 * visualizes — the dump reports win/loss rates independently, so a row may
 * have one rate and not the other (rendered as '—').
 */
export const MatchupRow = memo(function MatchupRow({
  matchup,
  kind,
}: {
  matchup: RankedMatchup;
  kind: 'win' | 'loss';
}) {
  const rate = kind === 'win' ? matchup.winRate : matchup.lossRate;
  const barColor = kind === 'win' ? 'bg-success/80' : 'bg-danger/80';
  return (
    <div className="flex items-center gap-3 py-2.5">
      <PokemonSprite name={matchup.opponent} size={32} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate font-body text-text-primary">
            {matchup.opponent}
          </span>
          <span
            className={`shrink-0 font-stat-number text-sm tabular-nums ${
              kind === 'win' ? 'text-success' : 'text-danger'
            }`}
          >
            {rate !== null ? `${rate.toFixed(1)}%` : '—'}
          </span>
        </div>
        {rate !== null ? (
          <UsageBar value={rate} barClassName={barColor} className="mt-1.5" />
        ) : (
          <UsageBar value={matchup.usagePercent} className="mt-1.5 opacity-40" />
        )}
      </div>
    </div>
  );
});

/** Compact move row for the combined 'All' tab: type dot, name, usage bar. */
export const CompactMoveRow = memo(function CompactMoveRow({
  move,
  max,
}: {
  move: RankedMove;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <RankBadge rank={move.rank} className="w-8 shrink-0" />
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: getTypeColor(move.type) }}
        />
        <span className="truncate font-body text-text-primary">{move.name}</span>
      </div>
      <span className="shrink-0 font-stat-number text-sm text-text-secondary tabular-nums">
        {formatUsage(move.usagePercent)}
      </span>
      <div className="w-16 shrink-0">
        <UsageBar value={move.usagePercent} max={max} />
      </div>
    </div>
  );
});
