// ============================================================================
// PocketForge — Stepper Input (EV / Level / IV)
// ============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setEditValue(String(value));
  }, [value]);

  const clamp = useCallback(
    (v: number) => Math.max(min, Math.min(max, v)),
    [min, max]
  );

  const handleDecrement = useCallback(() => {
    onChange(clamp(value - step));
  }, [onChange, clamp, value, step]);

  const handleIncrement = useCallback(() => {
    onChange(clamp(value + step));
  }, [onChange, clamp, value, step]);

  const startRapid = useCallback(
    (action: () => void) => {
      action();
      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(action, 80);
      }, 400);
    },
    []
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
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.1 }}
        onClick={handleDecrement}
        onPointerDown={() => startRapid(handleDecrement)}
        onPointerUp={stopRapid}
        onPointerLeave={stopRapid}
        disabled={value <= min}
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
          onClick={() => showDirectInput && setIsEditing(true)}
          className={`${inputWidth} h-10 flex items-center justify-center bg-bg-tertiary rounded-lg font-stat-number text-text-primary ${showDirectInput ? 'cursor-pointer' : 'cursor-default'}`}
          style={{ fontSize: '14px' }}
        >
          {value}
        </button>
      )}

      {/* Plus button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.1 }}
        onClick={handleIncrement}
        onPointerDown={() => startRapid(handleIncrement)}
        onPointerUp={stopRapid}
        onPointerLeave={stopRapid}
        disabled={value >= max}
        className={`${btnSize} flex items-center justify-center rounded-lg bg-bg-tertiary border border-border-subtle touch-target disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <Plus size={iconSize} className="text-text-secondary" />
      </motion.button>
    </div>
  );
}
