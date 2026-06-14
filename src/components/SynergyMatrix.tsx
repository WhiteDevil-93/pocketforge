// ============================================================================
// PocketForge — Defensive Synergy Matrix
// ============================================================================

import { motion } from 'framer-motion';
import { TYPE_NAMES, getTypeColor, getEffectiveness } from '../data/typesData';
import { getPokemonByName } from '../data/pokemonData';
import type { Team } from '../types';
import { Shield } from 'lucide-react';

interface SynergyMatrixProps {
  team: Team;
}

/** Get color for effectiveness multiplier cell */
function getEffectivenessColor(mult: number): { bg: string; text: string; label: string } {
  if (mult === 0) return { bg: '#0A0E1A', text: '#06B6D4', label: '0x' };
  if (mult <= 0.25) return { bg: 'rgba(34,197,94,0.4)', text: '#fff', label: '0.25x' };
  if (mult <= 0.5) return { bg: 'rgba(34,197,94,0.2)', text: '#22C55E', label: '0.5x' };
  if (mult >= 4) return { bg: 'rgba(239,68,68,0.6)', text: '#fff', label: '4x' };
  if (mult >= 2) return { bg: 'rgba(239,68,68,0.3)', text: '#EF4444', label: '2x' };
  return { bg: '#1E293B', text: '#64748B', label: '1x' };
}

export default function SynergyMatrix({ team }: SynergyMatrixProps) {
  const pokemon = team.pokemon;

  if (pokemon.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-text-tertiary text-sm">
        No Pokemon to analyze
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Matrix table */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="min-w-full">
          {/* Header row */}
          <div className="flex items-end gap-0.5 mb-1">
            <div className="w-[52px] shrink-0" />
            {pokemon.map((p) => {
              const dexEntry = getPokemonByName(p.species);
              const name = dexEntry
                ? p.species.length > 5
                  ? p.species.slice(0, 5)
                  : p.species
                : '???';
              return (
                <div
                  key={p.id}
                  className="flex-1 min-w-[44px] text-center pb-1"
                >
                  <span className="text-[9px] font-medium text-text-secondary uppercase">
                    {name}
                  </span>
                </div>
              );
            })}
            <div className="w-[52px] shrink-0 text-center pb-1">
              <span className="text-[9px] font-medium text-accent-primary uppercase">
                Avg
              </span>
            </div>
          </div>

          {/* Data rows — one per attacking type */}
          {TYPE_NAMES.map((atkType, rowIndex) => {
            const typeColor = getTypeColor(atkType);
            let totalMult = 0;
            let activeCount = 0;

            return (
              <motion.div
                key={atkType}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: rowIndex * 0.02,
                  duration: 0.2,
                  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
                }}
                className="flex items-center gap-0.5"
              >
                {/* Type label */}
                <div className="w-[52px] shrink-0 flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: typeColor }}
                  />
                  <span
                    className="text-[9px] font-bold uppercase"
                    style={{ color: typeColor }}
                  >
                    {atkType.slice(0, 4)}
                  </span>
                </div>

                {/* Per-Pokemon cells */}
                {pokemon.map((p) => {
                  const dexEntry = getPokemonByName(p.species);
                  if (!dexEntry) {
                    return (
                      <div
                        key={p.id}
                        className="flex-1 min-w-[44px] h-7 rounded-md bg-bg-elevated flex items-center justify-center"
                      >
                        <span className="text-[8px] text-text-tertiary">-</span>
                      </div>
                    );
                  }

                  const mult = getEffectiveness(atkType, dexEntry.types);
                  totalMult += mult;
                  activeCount++;
                  const colors = getEffectivenessColor(mult);

                  return (
                    <div
                      key={p.id}
                      className="flex-1 min-w-[44px] h-7 rounded-md flex items-center justify-center relative"
                      style={{ backgroundColor: colors.bg }}
                    >
                      {mult === 0 ? (
                        <Shield size={12} style={{ color: colors.text }} />
                      ) : (
                        <span
                          className="text-[9px] font-bold font-jetbrains-mono"
                          style={{ color: colors.text }}
                        >
                          {colors.label}
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Average column */}
                <div className="w-[52px] shrink-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold font-jetbrains-mono text-text-primary">
                    {activeCount > 0 ? (totalMult / activeCount).toFixed(2) : '-'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-subtle">
        {[
          { label: 'Immune', color: '#06B6D4', bg: '#0A0E1A' },
          { label: 'Resist', color: '#22C55E', bg: 'rgba(34,197,94,0.2)' },
          { label: 'Neutral', color: '#64748B', bg: '#1E293B' },
          { label: 'Weak', color: '#EF4444', bg: 'rgba(239,68,68,0.3)' },
          { label: '4x', color: '#fff', bg: 'rgba(239,68,68,0.6)' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.bg, border: `1px solid ${item.color}40` }}
            />
            <span className="text-[9px] text-text-tertiary">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
