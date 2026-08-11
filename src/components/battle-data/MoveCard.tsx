// ============================================================================
// PocketForge — Battle Data Move Card
//
// Rich card for a ranked move: rank + usage bar, type badge, category
// indicator, Power/Accuracy/PP/Priority badges, target description and
// expandable effect text. All values come from the hydrated snapshot data —
// nothing here computes or fabricates stats.
// ============================================================================

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleTrigger } from '../ui/collapsible';
import TypeBadge from '../TypeBadge';
import { UsageBar } from './rows';
import { formatUsage } from './formatHelpers';
import type { RankedMove } from '@/lib/data';

const CATEGORY_STYLES: Record<string, { label: string; className: string }> = {
  Physical: { label: 'Physical', className: 'bg-[#F08030]/15 text-[#F08030]' },
  Special: { label: 'Special', className: 'bg-[#6890F0]/15 text-[#6890F0]' },
  Status: { label: 'Status', className: 'bg-[#A8A878]/15 text-[#A8A878]' },
};

const EFFECT_TRUNCATE_LENGTH = 120;

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="rounded-md border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-micro text-text-secondary">
      {label} <span className="text-text-primary">{value}</span>
    </span>
  );
}

export default function MoveCard({ move, max }: { move: RankedMove; max?: number }) {
  const [effectOpen, setEffectOpen] = useState(false);
  const categoryStyle = move.category ? CATEGORY_STYLES[move.category] ?? null : null;
  const effect = move.effectFull || move.effectShort || '';
  const hasEffect = effect.length > 0;
  const showToggle = hasEffect && effect.length > EFFECT_TRUNCATE_LENGTH;

  const badges: Array<{ label: string; value: string | number }> = [];
  if (move.power !== null && move.power > 0) badges.push({ label: 'Power', value: move.power });
  if (move.accuracy !== null && move.accuracy > 0) badges.push({ label: 'Acc', value: `${move.accuracy}%` });
  if (move.pp !== null && move.pp > 0) badges.push({ label: 'PP', value: move.pp });
  if (move.priority !== null && move.priority !== 0) {
    badges.push({ label: 'Priority', value: move.priority > 0 ? `+${move.priority}` : `${move.priority}` });
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-tertiary p-3">
      <div className="flex items-start gap-2">
        <span className="w-7 shrink-0 pt-0.5 font-stat-number text-sm text-text-secondary tabular-nums">
          #{move.rank}
        </span>
        <div className="min-w-0 flex-1">
          {/* Name row: type badge + name + category */}
          <div className="flex flex-wrap items-center gap-2">
            {move.type && <TypeBadge type={move.type} size="sm" />}
            <span className="min-w-0 flex-1 truncate font-body-medium text-text-primary">
              {move.name}
            </span>
            {categoryStyle && (
              <span className={`shrink-0 rounded-full px-1.5 py-0.5 font-micro ${categoryStyle.className}`}>
                {categoryStyle.label}
              </span>
            )}
          </div>

          {/* Usage */}
          <div className="mt-2 flex items-center gap-2">
            <span className="shrink-0 font-stat-number text-sm text-text-secondary tabular-nums">
              {formatUsage(move.usagePercent)}
            </span>
            <div className="min-w-0 flex-1">
              <UsageBar value={move.usagePercent} max={max} />
            </div>
          </div>

          {/* Power / Accuracy / PP / Priority */}
          {badges.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {badges.map((badge) => (
                <StatChip key={badge.label} label={badge.label} value={badge.value} />
              ))}
            </div>
          )}

          {/* Target */}
          {move.target && (
            <p className="mt-1.5 font-caption text-text-tertiary">{move.target}</p>
          )}

          {/* Effect (truncated, expandable) */}
          {hasEffect && (
            <Collapsible open={effectOpen} onOpenChange={setEffectOpen} className="mt-2">
              <p
                className={`font-caption text-text-secondary ${
                  effectOpen ? '' : 'line-clamp-2'
                }`}
              >
                {effect}
              </p>
              {showToggle && (
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-0.5 py-1 pr-1 font-micro text-accent-primary touch-target"
                    aria-label={effectOpen ? 'Collapse effect text' : 'Expand effect text'}
                  >
                    {effectOpen ? 'Show less' : 'Show more'}
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-200 ${
                        effectOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </CollapsibleTrigger>
              )}
            </Collapsible>
          )}
        </div>
      </div>
    </div>
  );
}
