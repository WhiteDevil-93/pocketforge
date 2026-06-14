// ============================================================================
// PocketForge — Type Coverage Chart (18-type radial visualization)
// ============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TYPE_NAMES, getTypeColor } from '../data/typesData';
import { Check, X, AlertTriangle } from 'lucide-react';

interface TypeCoverageChartProps {
  coverage: Record<string, boolean>;
  onTypeTap?: (type: string) => void;
}

/** Single type slot in the coverage grid */
function TypeSlot({
  type,
  covered,
  index,
  onTap,
}: {
  type: string;
  covered: boolean;
  index: number;
  onTap: () => void;
}) {
  const color = getTypeColor(type);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.03,
        duration: 0.3,
        ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
      }}
      whileTap={{ scale: 0.9 }}
      onClick={onTap}
      className="relative flex flex-col items-center justify-center gap-0.5 rounded-xl p-1.5 min-h-[56px] touch-target"
      style={{
        backgroundColor: covered ? `${color}30` : '#1E293B',
        border: `1.5px solid ${covered ? `${color}80` : '#334155'}`,
      }}
    >
      <span
        className="text-[9px] font-bold uppercase tracking-wide"
        style={{ color: covered ? color : '#64748B' }}
      >
        {type.slice(0, 4)}
      </span>
      {covered ? (
        <Check size={14} style={{ color }} strokeWidth={3} />
      ) : (
        <X size={14} className="text-text-tertiary" strokeWidth={2.5} />
      )}
    </motion.button>
  );
}

/** Tooltip showing which Pokemon cover a type */
function TypeTooltip({
  type,
  coverage,
  onClose,
}: {
  type: string;
  coverage: Record<string, boolean>;
  onClose: () => void;
}) {
  const color = getTypeColor(type);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className="absolute z-30 bg-bg-elevated rounded-xl p-3 shadow-xl border border-border-subtle"
      style={{ minWidth: 160 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="font-subtitle text-text-primary">{type}</span>
        {coverage[type] ? (
          <span className="text-[10px] font-medium text-success ml-auto">Covered</span>
        ) : (
          <span className="text-[10px] font-medium text-danger ml-auto">Not Covered</span>
        )}
      </div>
      <p className="text-[11px] text-text-secondary">
        {coverage[type]
          ? `Your team has STAB super-effective coverage against ${type}-types.`
          : `No super-effective coverage against ${type}-types. Consider adding a ${type} weakness.`}
      </p>
      <button
        onClick={onClose}
        className="mt-2 text-[10px] text-accent-primary font-medium"
      >
        Close
      </button>
    </motion.div>
  );
}

export default function TypeCoverageChart({
  coverage,
  onTypeTap,
}: TypeCoverageChartProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const coveredCount = Object.values(coverage).filter(Boolean).length;

  const handleTap = (type: string) => {
    setSelectedType(selectedType === type ? null : type);
    onTypeTap?.(type);
  };

  return (
    <div className="relative">
      {/* Type Grid — 6 columns x 3 rows */}
      <div className="grid grid-cols-6 gap-1.5">
        {TYPE_NAMES.map((type, i) => (
          <TypeSlot
            key={type}
            type={type}
            covered={coverage[type] || false}
            index={i}
            onTap={() => handleTap(type)}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-center gap-3 mt-3">
        <div className="flex items-center gap-1.5">
          <Check size={12} className="text-success" strokeWidth={3} />
          <span className="text-[11px] text-text-secondary">
            {coveredCount}/18 covered
          </span>
        </div>
        {coveredCount < 18 && (
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={12} className="text-warning" />
            <span className="text-[11px] text-text-secondary">
              {18 - coveredCount} gaps
            </span>
          </div>
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {selectedType && (
          <div className="fixed inset-x-0 bottom-24 flex justify-center px-4 z-40 pointer-events-none">
            <div className="pointer-events-auto">
              <TypeTooltip
                type={selectedType}
                coverage={coverage}
                onClose={() => setSelectedType(null)}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
