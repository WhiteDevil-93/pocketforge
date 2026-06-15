// ============================================================================
// PocketForge — Stat Bar with static EV buttons + slider
// ============================================================================

import { Slider } from '@/components/ui/slider';
import { calculateStat, calculateHP, getStatAbbreviation } from '../utils';

interface StatBarProps {
  stat: string;
  baseStat: number;
  ev: number;
  iv: number;
  level: number;
  nature: string;
  isMegaActive?: boolean;
  onEVChange?: (value: number) => void;
  onIVChange?: (value: number) => void;
  showStepper?: boolean;
  compact?: boolean;
}

const STAT_COLORS: Record<string, { main: string; light: string }> = {
  hp: { main: '#FF4444', light: '#FF6B6B' },
  atk: { main: '#F08030', light: '#F0A060' },
  def: { main: '#F8D030', light: '#F8E060' },
  spa: { main: '#6890F0', light: '#88B0F0' },
  spd: { main: '#78C850', light: '#98E870' },
  spe: { main: '#F85888', light: '#F878A8' },
};

const EV_STEP = 4;

export default function StatBar({
  stat,
  baseStat,
  ev,
  iv,
  level,
  nature,
  isMegaActive,
  onEVChange,
  onIVChange,
  showStepper = true,
  compact = false,
}: StatBarProps) {
  const statKey = stat.toLowerCase();
  const colors = STAT_COLORS[statKey] || STAT_COLORS.hp;
  const isHP = statKey === 'hp';

  const finalStat = isHP
    ? calculateHP(baseStat, ev, iv, level)
    : calculateStat(baseStat, ev, iv, level, nature, statKey);

  const barWidthPercent = Math.min(100, (ev / 252) * 100);
  const clampEV = (value: number) => Math.max(0, Math.min(252, value));

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-stat-label uppercase w-7 shrink-0" style={{ color: colors.main }}>
          {getStatAbbreviation(statKey)}
        </span>
        <div className="flex-1 h-[3px] bg-bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${barWidthPercent}%`,
              background: `linear-gradient(90deg, ${colors.main} 0%, ${colors.light} 100%)`,
            }}
          />
        </div>
        <span
          className={`font-stat-number text-xs w-8 text-right ${isMegaActive ? 'text-accent-secondary' : 'text-text-primary'}`}
        >
          {finalStat}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-secondary/60 px-3 py-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-stat-label uppercase w-8 shrink-0" style={{ color: colors.main }}>
          {getStatAbbreviation(statKey)}
        </span>

        {showStepper && onEVChange ? (
          <div className="flex items-center gap-1 shrink-0">
            <EVButton label="-4" disabled={ev <= 0} onClick={() => onEVChange(clampEV(ev - EV_STEP))} />
            <EVButton label="-1" disabled={ev <= 0} onClick={() => onEVChange(clampEV(ev - 1))} />
            <div className="w-11 h-8 flex items-center justify-center rounded bg-bg-tertiary font-stat-number text-text-primary text-xs">
              {ev}
            </div>
            <EVButton label="+1" disabled={ev >= 252} onClick={() => onEVChange(clampEV(ev + 1))} />
            <EVButton label="+4" disabled={ev >= 252} onClick={() => onEVChange(clampEV(ev + EV_STEP))} />
          </div>
        ) : (
          <div className="w-11 h-8 flex items-center justify-center rounded bg-bg-tertiary font-stat-number text-text-primary text-xs">
            {ev}
          </div>
        )}

        <span
          className={`ml-auto font-stat-number text-sm w-10 text-right shrink-0 ${isMegaActive ? 'text-accent-secondary' : 'text-text-primary'}`}
        >
          {finalStat}
        </span>

        <button
          type="button"
          onClick={() => onIVChange?.(iv === 31 ? 0 : 31)}
          className="w-8 h-8 flex items-center justify-center rounded bg-bg-elevated text-text-tertiary font-caption shrink-0 touch-target"
        >
          {iv}
        </button>
      </div>

      {showStepper && onEVChange && (
        <Slider
          value={[ev]}
          min={0}
          max={252}
          step={1}
          onValueChange={([value]) => onEVChange(clampEV(value))}
          className="w-full [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-track]]:bg-bg-elevated [&_[data-slot=slider-range]]:bg-accent-primary [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:border-accent-primary [&_[data-slot=slider-thumb]]:bg-white"
          aria-label={`${getStatAbbreviation(statKey)} EV`}
        />
      )}

      <div className="h-1 bg-bg-elevated rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${barWidthPercent}%`,
            background: `linear-gradient(90deg, ${colors.main} 0%, ${colors.light} 100%)`,
          }}
        />
      </div>
    </div>
  );
}

function EVButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="min-w-8 h-8 px-1 flex items-center justify-center rounded bg-bg-tertiary border border-border-subtle font-caption text-text-secondary touch-target disabled:opacity-30"
    >
      {label}
    </button>
  );
}