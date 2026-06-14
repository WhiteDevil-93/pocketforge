// ============================================================================
// PocketForge — Animated Stat Bar Component
// ============================================================================

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { calculateStat, calculateHP, getStatAbbreviation } from '../utils';

interface StatBarProps {
  stat: string;
  baseStat: number;
  ev: number;
  iv: number;
  level: number;
  nature: string;
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

export default function StatBar({
  stat,
  baseStat,
  ev,
  iv,
  level,
  nature,
  onEVChange,
  onIVChange,
  showStepper = true,
  compact = false,
}: StatBarProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const statKey = stat.toLowerCase();
  const colors = STAT_COLORS[statKey] || STAT_COLORS.hp;
  const isHP = statKey === 'hp';

  const finalStat = isHP
    ? calculateHP(baseStat, ev, iv, level)
    : calculateStat(baseStat, ev, iv, level, nature, statKey);

  const barWidthPercent = Math.min(100, (ev / 252) * 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(barWidthPercent);
    }, 60 * getStatIndex(statKey) + 100);
    return () => clearTimeout(timer);
  }, [barWidthPercent, statKey]);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span
          className="font-stat-label uppercase w-7 shrink-0"
          style={{ color: colors.main }}
        >
          {getStatAbbreviation(statKey)}
        </span>
        <div className="flex-1 h-[3px] bg-bg-elevated rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${animatedWidth}%` }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${colors.main} 0%, ${colors.light} 100%)` }}
          />
        </div>
        <span className="font-stat-number text-xs text-text-primary w-8 text-right">
          {finalStat}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-1.5">
      {/* Stat label */}
      <span
        className="font-stat-label uppercase w-8 shrink-0"
        style={{ color: colors.main }}
      >
        {getStatAbbreviation(statKey)}
      </span>

      {/* EV Stepper */}
      {showStepper && onEVChange && (
        <div className="shrink-0">
          <StepperMini value={ev} min={0} max={252} onChange={onEVChange} />
        </div>
      )}

      {/* Bar */}
      <div className="flex-1 h-1 bg-bg-elevated rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${animatedWidth}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${colors.main} 0%, ${colors.light} 100%)` }}
        />
      </div>

      {/* Final stat value */}
      <span className="font-stat-number text-sm text-text-primary w-10 text-right shrink-0">
        {finalStat}
      </span>

      {/* IV badge */}
      <button
        onClick={() => onIVChange?.(iv === 31 ? 0 : 31)}
        className="w-8 h-6 flex items-center justify-center rounded bg-bg-elevated text-text-tertiary font-caption shrink-0"
      >
        {iv}
      </button>
    </div>
  );
}

/** Mini stepper for StatBar EV controls */
function StepperMini({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = useRef(value);

  // Keep ref in sync
  valueRef.current = value;

  const clamp = (v: number) => Math.max(min, Math.min(max, v));

  const stopRapid = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const startDec = () => {
    const next = clamp(valueRef.current - 4);
    onChange(next);
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        const newVal = clamp(valueRef.current - 4);
        if (newVal !== valueRef.current) {
          onChange(newVal);
        }
      }, 80);
    }, 400);
  };

  const startInc = () => {
    const next = clamp(valueRef.current + 4);
    onChange(next);
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        const newVal = clamp(valueRef.current + 4);
        if (newVal !== valueRef.current) {
          onChange(newVal);
        }
      }, 80);
    }, 400);
  };

  useEffect(() => () => stopRapid(), []);

  return (
    <div className="flex items-center gap-0.5">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(clamp(value - 4))}
        onPointerDown={startDec}
        onPointerUp={stopRapid}
        onPointerLeave={stopRapid}
        disabled={value <= min}
        className="w-7 h-7 flex items-center justify-center rounded bg-bg-tertiary border border-border-subtle touch-target disabled:opacity-30"
      >
        <span className="text-text-secondary text-xs">-</span>
      </motion.button>
      <div className="w-10 h-7 flex items-center justify-center bg-bg-tertiary rounded font-stat-number text-text-primary text-xs">
        {value}
      </div>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(clamp(value + 4))}
        onPointerDown={startInc}
        onPointerUp={stopRapid}
        onPointerLeave={stopRapid}
        disabled={value >= max}
        className="w-7 h-7 flex items-center justify-center rounded bg-bg-tertiary border border-border-subtle touch-target disabled:opacity-30"
      >
        <span className="text-text-secondary text-xs">+</span>
      </motion.button>
    </div>
  );
}

function getStatIndex(stat: string): number {
  const order = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
  return order.indexOf(stat.toLowerCase());
}
