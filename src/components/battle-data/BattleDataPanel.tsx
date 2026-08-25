// ============================================================================
// PocketForge — Battle Data Panel
//
// Collapsible competitive-stats panel for one Pokémon in one Smogon format:
// rank/usage header, rating-cutoff + last-updated meta, a filter-tab explorer
// (All / Moves / Held Item / Ability / Stat Alignment / Stat Points /
// Teammates / Wins Against / Loses Against / Winning Moves / Losing Moves)
// and rich, PokéAPI-hydrated move cards.
//
// The Smogon snapshot is deliberately NOT statically imported here — the whole
// src/lib/data module (which includes the generated snapshot) is loaded via a
// memoized dynamic import so it lands in a lazy chunk, keeping the initial
// bundle small. Only the requested Pokémon's data is ever fetched/rendered.
//
// Every displayed number comes straight from the committed snapshot; empty
// categories render an explicit 'Not enough data' state instead of fabricated
// rows.
// ============================================================================

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronDown, RefreshCw } from 'lucide-react';
import PokemonSprite from '../PokemonSprite';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Skeleton } from '../ui/skeleton';
import MoveCard from './MoveCard';
import {
  AbilityRow,
  CompactMoveRow,
  ItemRow,
  MatchupRow,
  NotEnoughData,
  SpreadRow,
  StatPointsRow,
  TeammateRow,
} from './rows';
import {
  battleFormatForAppFormat,
  formatCount,
  formatDate,
  formatDisplayName,
  formatUsage,
} from './formatHelpers';
import { springSnappy, transitionFast, EASE_OUT } from '../../lib/motion';
import type {
  BattleData,
  BattleFormatId,
  BattleFormatInfo,
  RankedMatchup,
} from '@/lib/data';

// Memoized lazy loader — the snapshot stays out of the initial bundle.
let battleDataModulePromise: Promise<typeof import('@/lib/data')> | null = null;
function loadBattleDataModule(): Promise<typeof import('@/lib/data')> {
  if (!battleDataModulePromise) {
    battleDataModulePromise = import('@/lib/data');
  }
  return battleDataModulePromise;
}

type TabId =
  | 'all'
  | 'moves'
  | 'items'
  | 'abilities'
  | 'spreads'
  | 'stat-points'
  | 'teammates'
  | 'wins'
  | 'losses'
  | 'winning-moves'
  | 'losing-moves';

const TABS: ReadonlyArray<{ id: TabId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'moves', label: 'Moves' },
  { id: 'items', label: 'Held Item' },
  { id: 'abilities', label: 'Ability' },
  { id: 'spreads', label: 'Stat Alignment' },
  { id: 'stat-points', label: 'Stat Points' },
  { id: 'teammates', label: 'Teammates' },
  { id: 'wins', label: 'Wins Against' },
  { id: 'losses', label: 'Loses Against' },
  { id: 'winning-moves', label: 'Winning Moves' },
  { id: 'losing-moves', label: 'Losing Moves' },
];

type Status = 'loading' | 'ready' | 'nodata' | 'error';

interface BattleDataPanelProps {
  /** Species to show stats for, e.g. 'Kingambit'. */
  pokemon: string;
  /** The app's own format id (e.g. 'champions-mb') used to pre-select a snapshot format. */
  appFormatId?: string;
  defaultOpen?: boolean;
  className?: string;
}

export default function BattleDataPanel({
  pokemon,
  appFormatId,
  defaultOpen = true,
  className = '',
}: BattleDataPanelProps) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const [formats, setFormats] = useState<BattleFormatInfo[] | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<BattleFormatId | null>(null);
  const [data, setData] = useState<BattleData | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const requestRef = useRef(0);
  const species = pokemon.trim();

  // Load the snapshot's available formats once (and pick the preferred one).
  useEffect(() => {
    let cancelled = false;
    loadBattleDataModule()
      .then((mod) => mod.getAvailableBattleFormats())
      .then((available) => {
        if (cancelled) return;
        setFormats(available);
        setSelectedFormat((prev) => {
          if (prev) return prev;
          const preferred = battleFormatForAppFormat(appFormatId, available);
          return preferred ? preferred.format : null;
        });
      })
      .catch(() => {
        if (cancelled) return;
        setFormats([]);
        setStatus('error');
        setErrorMessage('Could not load the Smogon battle-data snapshot.');
      });
    return () => {
      cancelled = true;
    };
  }, [appFormatId, retryToken]);

  // Fetch only the requested Pokémon's data for the selected format.
  useEffect(() => {
    if (!selectedFormat || !species) return;
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    loadBattleDataModule()
      .then((mod) => mod.getPokemonBattleData(species, selectedFormat))
      .then((result) => {
        if (requestRef.current !== requestId) return;
        if (!result) {
          setData(null);
          setStatus('nodata');
        } else {
          setData(result);
          setStatus('ready');
        }
      })
      .catch((error: unknown) => {
        if (requestRef.current !== requestId) return;
        setData(null);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load battle data.');
      });
  }, [species, selectedFormat, retryToken]);

  const handleRetry = useCallback(() => {
    setStatus('loading');
    setErrorMessage(null);
    setRetryToken((value) => value + 1);
  }, []);

  // Checks & Counters split by reported win/loss rate (sorted desc). Either
  // list may be empty — the dump reports the two rates independently.
  const winsAgainst = useMemo(() => {
    if (!data) return [];
    return data.checksAndCounters
      .filter((entry): entry is RankedMatchup & { winRate: number } => entry.winRate !== null)
      .slice()
      .sort((a, b) => b.winRate - a.winRate);
  }, [data]);

  const losesAgainst = useMemo(() => {
    if (!data) return [];
    return data.checksAndCounters
      .filter((entry): entry is RankedMatchup & { lossRate: number } => entry.lossRate !== null)
      .slice()
      .sort((a, b) => b.lossRate - a.lossRate);
  }, [data]);

  // Bar normalization per category (display-only scaling; values are untouched).
  const maxUsage = useMemo(() => {
    const maxOf = (values: number[]) => Math.max(1, ...values);
    return {
      moves: maxOf(data?.moves.map((move) => move.usagePercent) ?? []),
      items: maxOf(data?.items.map((item) => item.usagePercent) ?? []),
      abilities: maxOf(data?.abilities.map((ability) => ability.usagePercent) ?? []),
      spreads: maxOf(data?.spreads.map((spread) => spread.usagePercent) ?? []),
      teammates: maxOf(data?.teammates.map((teammate) => teammate.usagePercent) ?? []),
    };
  }, [data]);

  const ready = status === 'ready' && data !== null;
  const showEmptySpecies = species.length === 0;

  return (
    <div className={`overflow-hidden rounded-2xl border border-border-subtle bg-bg-secondary ${className}`}>
      {/* ---- Collapsible header ---- */}
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-controls="battle-data-panel-content"
        className="flex min-h-14 w-full items-center gap-3 px-4 text-left touch-target"
      >
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          className="shrink-0 text-text-tertiary"
        >
          <ChevronDown size={18} />
        </motion.div>
        <PokemonSprite name={species || 'MissingNo'} size={32} />
        <span className="min-w-0 flex-1 truncate font-subtitle text-text-primary">
          Battle Data{species ? ` · ${species}` : ''}
        </span>
        {ready && data && (
          <span className="flex shrink-0 items-center gap-2">
            <span className="font-stat-number text-sm text-accent-primary tabular-nums">
              #{data.rank}
            </span>
            <RankChange value={data.rankChange} />
            <span className="hidden font-stat-number text-sm text-text-secondary tabular-nums sm:inline">
              {formatUsage(data.usagePercent)}
            </span>
          </span>
        )}
      </button>

      {/* ---- Expandable body ---- */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id="battle-data-panel-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: springSnappy, opacity: transitionFast }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {/* Format selector + snapshot meta */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {formats && formats.length > 1 ? (
                  <div className="flex min-w-0 gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {formats.map((format) => {
                      const active = selectedFormat === format.format;
                      return (
                        <button
                          key={format.format}
                          type="button"
                          onClick={() => setSelectedFormat(format.format)}
                          aria-pressed={active}
                          className={`h-9 shrink-0 rounded-full px-3 font-caption font-medium touch-target transition-colors ${
                            active
                              ? 'bg-accent-primary/15 text-accent-primary'
                              : 'bg-bg-tertiary text-text-secondary'
                          }`}
                        >
                          {formatDisplayName(format.format)}
                        </button>
                      );
                    })}
                  </div>
                ) : formats && formats.length === 1 ? (
                  <span className="font-caption text-text-tertiary">
                    {formatDisplayName(formats[0].format)}
                  </span>
                ) : (
                  <Skeleton className="h-4 w-28" />
                )}

                {ready && data && (
                  <span className="font-micro text-text-tertiary">
                    {data.ratingCutoff > 0 ? `${data.ratingCutoff}+ rating` : 'All ratings'} ·{' '}
                    {formatCount(data.rawCount)} uses · Updated {formatDate(data.lastUpdated)}
                  </span>
                )}
              </div>

              {/* States */}
              {showEmptySpecies ? (
                <div className="pt-4">
                  <NotEnoughData
                    title="Select a Pokémon"
                    description="Choose a Pokémon to see its competitive stats."
                  />
                </div>
              ) : status === 'loading' ? (
                <LoadingState />
              ) : status === 'error' ? (
                <ErrorState message={errorMessage} onRetry={handleRetry} />
              ) : status === 'nodata' ? (
                <div className="pt-4">
                  <NotEnoughData
                    title={`No battle data for ${species}`}
                    description="This Pokémon isn't in the Smogon snapshot for the selected format yet."
                  />
                </div>
              ) : null}

              {/* Tabs */}
              {ready && data && (
                <Tabs defaultValue="all" className="pt-3">
                  <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <TabsList className="h-10 w-auto gap-0.5 bg-bg-tertiary">
                      {TABS.map((tab) => (
                        <TabsTrigger
                          key={tab.id}
                          value={tab.id}
                          className="h-9 flex-none px-3 text-xs"
                        >
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  {/* All — combined top-N across categories */}
                  <TabsContent value="all" className="pt-2">
                    <div className="space-y-4">
                      <CategorySection
                        title="Top Moves"
                        items={data.moves.slice(0, 5)}
                        max={maxUsage.moves}
                        render={(move, max) => <CompactMoveRow move={move} max={max} />}
                      />
                      <CategorySection
                        title="Held Items"
                        items={data.items.slice(0, 3)}
                        max={maxUsage.items}
                        render={(item, max) => <ItemRow item={item} max={max} />}
                      />
                      <CategorySection
                        title="Abilities"
                        items={data.abilities.slice(0, 3)}
                        max={maxUsage.abilities}
                        render={(ability, max) => <AbilityRow ability={ability} max={max} />}
                      />
                      <CategorySection
                        title="Stat Alignments"
                        items={data.spreads.slice(0, 3)}
                        max={maxUsage.spreads}
                        render={(spread, max) => <SpreadRow spread={spread} max={max} />}
                      />
                      <CategorySection
                        title="Teammates"
                        items={data.teammates.slice(0, 5)}
                        max={maxUsage.teammates}
                        render={(teammate, max) => <TeammateRow teammate={teammate} max={max} />}
                      />
                      <CategorySection
                        title="Wins Against"
                        items={winsAgainst.slice(0, 3)}
                        max={100}
                        render={(entry) => <MatchupRow matchup={entry} kind="win" />}
                      />
                      <CategorySection
                        title="Loses Against"
                        items={losesAgainst.slice(0, 3)}
                        max={100}
                        render={(entry) => <MatchupRow matchup={entry} kind="loss" />}
                      />
                    </div>
                  </TabsContent>

                  {/* Moves — rich cards */}
                  <TabsContent value="moves" className="pt-2">
                    {data.moves.length > 0 ? (
                      <div className="space-y-2">
                        {data.moves.map((move) => (
                          <MoveCard key={move.rank} move={move} max={maxUsage.moves} />
                        ))}
                      </div>
                    ) : (
                      <NotEnoughData
                        title="Not enough data"
                        description="No move usage recorded for this Pokémon in the current snapshot."
                      />
                    )}
                  </TabsContent>

                  {/* Held Item */}
                  <TabsContent value="items" className="pt-2">
                    {data.items.length > 0 ? (
                      <div className="divide-y divide-border-subtle">
                        {data.items.map((item) => (
                          <ItemRow key={item.rank} item={item} max={maxUsage.items} />
                        ))}
                      </div>
                    ) : (
                      <NotEnoughData
                        title="Not enough data"
                        description="No held-item usage recorded for this Pokémon in the current snapshot."
                      />
                    )}
                  </TabsContent>

                  {/* Ability */}
                  <TabsContent value="abilities" className="pt-2">
                    {data.abilities.length > 0 ? (
                      <div className="divide-y divide-border-subtle">
                        {data.abilities.map((ability) => (
                          <AbilityRow key={ability.rank} ability={ability} max={maxUsage.abilities} />
                        ))}
                      </div>
                    ) : (
                      <NotEnoughData
                        title="Not enough data"
                        description="No ability usage recorded for this Pokémon in the current snapshot."
                      />
                    )}
                  </TabsContent>

                  {/* Stat Alignment — nature + EV spreads */}
                  <TabsContent value="spreads" className="pt-2">
                    {data.spreads.length > 0 ? (
                      <div className="divide-y divide-border-subtle">
                        {data.spreads.map((spread) => (
                          <SpreadRow key={spread.rank} spread={spread} max={maxUsage.spreads} />
                        ))}
                      </div>
                    ) : (
                      <NotEnoughData
                        title="Not enough data"
                        description="No nature/EV spreads recorded for this Pokémon in the current snapshot."
                      />
                    )}
                  </TabsContent>

                  {/* Stat Points — same parsed EV allocation as stat-point chips */}
                  <TabsContent value="stat-points" className="pt-2">
                    {data.spreads.length > 0 ? (
                      <div className="divide-y divide-border-subtle">
                        {data.spreads.map((spread) => (
                          <StatPointsRow key={spread.rank} spread={spread} max={maxUsage.spreads} />
                        ))}
                      </div>
                    ) : (
                      <NotEnoughData
                        title="Not enough data"
                        description="No EV allocations recorded for this Pokémon in the current snapshot."
                      />
                    )}
                  </TabsContent>

                  {/* Teammates */}
                  <TabsContent value="teammates" className="pt-2">
                    {data.teammates.length > 0 ? (
                      <div className="divide-y divide-border-subtle">
                        {data.teammates.map((teammate) => (
                          <TeammateRow key={teammate.rank} teammate={teammate} max={maxUsage.teammates} />
                        ))}
                      </div>
                    ) : (
                      <NotEnoughData
                        title="Not enough data"
                        description="No teammate usage recorded for this Pokémon in the current snapshot."
                      />
                    )}
                  </TabsContent>

                  {/* Wins Against */}
                  <TabsContent value="wins" className="pt-2">
                    {winsAgainst.length > 0 ? (
                      <div className="divide-y divide-border-subtle">
                        {winsAgainst.map((entry) => (
                          <MatchupRow key={entry.rank} matchup={entry} kind="win" />
                        ))}
                      </div>
                    ) : (
                      <NotEnoughData
                        title="Not enough data"
                        description="This snapshot does not report win rates against checks."
                      />
                    )}
                  </TabsContent>

                  {/* Loses Against */}
                  <TabsContent value="losses" className="pt-2">
                    {losesAgainst.length > 0 ? (
                      <div className="divide-y divide-border-subtle">
                        {losesAgainst.map((entry) => (
                          <MatchupRow key={entry.rank} matchup={entry} kind="loss" />
                        ))}
                      </div>
                    ) : (
                      <NotEnoughData
                        title="Not enough data"
                        description="This snapshot does not report loss rates against checks."
                      />
                    )}
                  </TabsContent>

                  {/* Winning Moves / Losing Moves — explicitly flagged when unavailable */}
                  <TabsContent value="winning-moves" className="pt-2">
                    {data.matchupMoves.winningMoves.length > 0 ? (
                      <div className="space-y-2">
                        {data.matchupMoves.winningMoves.map((move) => (
                          <MoveCard key={move.rank} move={move} />
                        ))}
                      </div>
                    ) : (
                      <NotEnoughData
                        title="Not enough data"
                        description={data.matchupMoves.method}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="losing-moves" className="pt-2">
                    {data.matchupMoves.losingMoves.length > 0 ? (
                      <div className="space-y-2">
                        {data.matchupMoves.losingMoves.map((move) => (
                          <MoveCard key={move.rank} move={move} />
                        ))}
                      </div>
                    ) : (
                      <NotEnoughData
                        title="Not enough data"
                        description={data.matchupMoves.method}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Local building blocks
// ----------------------------------------------------------------------------

function RankChange({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="shrink-0 font-caption font-medium text-success">↑{value}</span>
    );
  }
  if (value < 0) {
    return (
      <span className="shrink-0 font-caption font-medium text-danger">↓{Math.abs(value)}</span>
    );
  }
  return <span className="shrink-0 font-caption text-text-tertiary">—</span>;
}

function LoadingState() {
  return (
    <div className="space-y-3 pt-4" role="status" aria-label="Loading battle data">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-16 w-full rounded-xl" />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-2 px-4 py-8 text-center">
      <AlertTriangle size={26} className="text-warning" />
      <p className="font-body-medium text-text-primary">Couldn't load battle data</p>
      {message && <p className="max-w-[280px] font-caption text-text-tertiary">{message}</p>}
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 flex h-11 items-center gap-2 rounded-xl bg-accent-primary/15 px-4 font-body-medium text-accent-primary touch-target"
      >
        <RefreshCw size={16} />
        Retry
      </button>
    </div>
  );
}

/**
 * One labeled category inside the combined 'All' tab. Renders an explicit
 * 'Not enough data' block when the category has no entries — rows are never
 * fabricated.
 */
function CategorySection<T>({
  title,
  items,
  max,
  render,
}: {
  title: string;
  items: readonly T[];
  max: number;
  render: (item: T, max: number) => ReactNode;
}) {
  if (items.length === 0) {
    return (
      <section>
        <h4 className="mb-1.5 font-caption text-text-secondary uppercase">{title}</h4>
        <NotEnoughData title="Not enough data" />
      </section>
    );
  }
  return (
    <section>
      <h4 className="mb-1.5 font-caption text-text-secondary uppercase">{title}</h4>
      <div className="divide-y divide-border-subtle">
        {items.map((item, index) => (
          <Fragment key={index}>{render(item, max)}</Fragment>
        ))}
      </div>
    </section>
  );
}
