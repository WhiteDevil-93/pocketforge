// ============================================================================
// PocketForge — Stepper Input (EV / Level / IV)
// ============================================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

interface StepperInputProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  step?: number;
  size?: 'sm' | 'md';
  showDirectInput?: boolean;
}

export default function StepperInput({
  value,
  min,
  max,
  onChange,
  step = 1,
  size = 'md',
  showDirectInput = true,
}: StepperInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    setEditValue(String(value));
  }

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const clamp = useCallback(
    (v: number) => Math.max(min, Math.min(max, v)),
    [min, max]
  );

  const stopRapid = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stepBy = useCallback(
    (delta: number) => {
      const next = clamp(valueRef.current + delta);
      valueRef.current = next;
      onChange(next);
    },
    [clamp, onChange]
  );

  const startRapid = useCallback(
    (delta: number, e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      stopRapid();
      stepBy(delta);
      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => stepBy(delta), 80);
      }, 400);
    },
    [stepBy, stopRapid]
  );

  useEffect(() => stopRapid, [stopRapid]);

  const handleEditSubmit = useCallback(() => {
    const parsed = parseInt(editValue, 10);
    if (!isNaN(parsed)) {
      onChange(clamp(parsed));
    } else {
      setEditValue(String(value));
    }
    setIsEditing(false);
  }, [editValue, onChange, clamp, value]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleEditSubmit();
      } else if (e.key === 'Escape') {
        setEditValue(String(value));
        setIsEditing(false);
      }
    },
    [handleEditSubmit, value]
  );

  const btnSize = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
  const iconSize = size === 'sm' ? 14 : 16;
  const inputWidth = size === 'sm' ? 'w-14' : 'w-16';

  return (
    <div className="flex items-center gap-1">
      {/* Minus button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.1 }}
        onPointerDown={(e) => startRapid(-step, e)}
        onPointerUp={stopRapid}
        onPointerLeave={stopRapid}
        onPointerCancel={stopRapid}
        disabled={value <= min}
        aria-label="Decrease value"
        title="Decrease value"
        className={`${btnSize} flex items-center justify-center rounded-lg bg-bg-tertiary border border-border-subtle touch-target disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <Minus size={iconSize} className="text-text-secondary" />
      </motion.button>

      {/* Value display / direct input */}
      {isEditing && showDirectInput ? (
        <input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleEditSubmit}
          onKeyDown={handleEditKeyDown}
          autoFocus
          className={`${inputWidth} h-10 bg-bg-tertiary rounded-lg text-center font-stat-number text-text-primary outline-none border border-accent-primary/50`}
          style={{ fontSize: '16px' }}
          min={min}
          max={max}
        />
      ) : (
        <button
          type="button"
          onClick={() => showDirectInput && setIsEditing(true)}
          aria-label={`Edit value, currently ${value}`}
          title={showDirectInput ? 'Edit value' : undefined}
          className={`${inputWidth} h-10 flex items-center justify-center bg-bg-tertiary rounded-lg font-stat-number text-text-primary ${showDirectInput ? 'cursor-pointer' : 'cursor-default'}`}
          style={{ fontSize: '14px' }}
        >
          {value}
        </button>
      )}

      {/* Plus button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.1 }}
        onPointerDown={(e) => startRapid(step, e)}
        onPointerUp={stopRapid}
        onPointerLeave={stopRapid}
        onPointerCancel={stopRapid}
        disabled={value >= max}
        aria-label="Increase value"
        title="Increase value"
        className={`${btnSize} flex items-center justify-center rounded-lg bg-bg-tertiary border border-border-subtle touch-target disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <Plus size={iconSize} className="text-text-secondary" />
      </motion.button>
    </div>
  );
}
