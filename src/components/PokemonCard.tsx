// ============================================================================
// PocketForge — Pokemon Card (Compact Builder View)
// ============================================================================

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles, GripVertical, Copy, Trash2 } from 'lucide-react';
import PokemonSprite from './PokemonSprite';
import TypeBadge from './TypeBadge';
import { getPokemonByName, getTypeColor, getItemSpriteUrl } from '../data';
import { calculateAllStats } from '../utils';
import type { Pokemon } from '../types';

interface PokemonCardProps {
  pokemon?: Pokemon;
  index: number;
  onTap?: (index: number) => void;
  onTapEmpty?: (index: number) => void;
  onCopy?: (index: number) => void;
  onDelete?: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

const STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const;

export default function PokemonCard({
  pokemon,
  index,
  onTap,
  onTapEmpty,
  onCopy,
  onDelete,
}: PokemonCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleTap = useCallback(() => {
    if (pokemon?.species) {
      onTap?.(index);
    } else {
      onTapEmpty?.(index);
    }
  }, [pokemon, index, onTap, onTapEmpty]);

  const handleLongPress = useCallback(
    (e: React.PointerEvent) => {
      if (!pokemon?.species) return;
      setIsPressed(false);
      setContextMenu({ x: e.clientX, y: e.clientY });
    },
    [pokemon]
  );

  const handlePointerDown = useCallback(() => {
    if (!pokemon?.species) return;
    setIsPressed(true);
    const timer = setTimeout(() => {
      setContextMenu({ x: 0, y: 0 });
    }, 600);
    return () => clearTimeout(timer);
  }, [pokemon]);

  const handlePointerUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  // Empty slot
  if (!pokemon?.species) {
    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onTapEmpty?.(index)}
        className="w-full py-6 px-4 rounded-2xl border-2 border-dashed border-border-subtle bg-bg-secondary flex flex-col items-center justify-center gap-2 touch-target"
      >
        <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center">
          <Plus size={24} className="text-text-tertiary" />
        </div>
        <span className="font-subtitle text-text-tertiary">Add Pokemon</span>
        <span className="font-caption text-text-tertiary/70">Choose a Pokemon for this slot</span>
      </motion.button>
    );
  }

  const dexEntry = getPokemonByName(pokemon.species);
  const types = dexEntry?.types || [];
  const primaryTypeColor = getTypeColor(types[0] || 'Normal');
  const stats = dexEntry
    ? calculateAllStats(dexEntry.baseStats, pokemon.evs, pokemon.ivs, pokemon.level, pokemon.nature)
    : null;

  return (
    <>
      <motion.div
        layoutId={`pokemon-card-${index}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: isPressed ? 0.98 : 1,
        }}
        transition={{
          opacity: { duration: 0.3, delay: index * 0.05 },
          y: { duration: 0.3, delay: index * 0.05 },
          scale: { duration: 0.1 },
        }}
        onClick={handleTap}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onContextMenu={(e) => {
          e.preventDefault();
          handleLongPress(e as unknown as React.PointerEvent);
        }}
        className="w-full rounded-2xl border border-border-subtle bg-bg-secondary p-4 cursor-pointer select-none"
        style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)' }}
      >
        {/* Row 1: Identity */}
        <div className="flex items-start gap-3">
          {/* Sprite */}
          <div
            className="w-[72px] h-[72px] rounded-full flex items-center justify-center shrink-0 relative"
            style={{ backgroundColor: `${primaryTypeColor}14` }}
          >
            <PokemonSprite
              name={pokemon.shiny ? pokemon.species : pokemon.species}
              size={64}
              className="rounded-full"
            />
            {pokemon.shiny && (
              <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-bg-secondary flex items-center justify-center">
                <Sparkles size={12} className="text-amber-400" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-title text-text-primary truncate">
                {pokemon.nickname || pokemon.species}
              </h3>
              {types.map((t) => (
                <TypeBadge key={t} type={t} size="sm" />
              ))}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="font-caption text-text-secondary">
                Lv.{pokemon.level}
              </span>
              {pokemon.gender && (
                <span className="font-caption text-text-secondary">
                  {pokemon.gender === 'M' ? 'Male' : 'Female'}
                </span>
              )}
              {pokemon.item && (
                <span className="font-caption text-text-secondary flex items-center gap-1">
                  <img
                    src={getItemSpriteUrl(pokemon.item)}
                    alt={pokemon.item}
                    className="w-4 h-4 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  @ {pokemon.item}
                </span>
              )}
            </div>
          </div>

          {/* Drag handle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-bg-tertiary touch-target shrink-0"
          >
            <GripVertical size={20} className="text-text-tertiary" />
          </button>
        </div>

        {/* Row 2: Moves */}
        {pokemon.moves && pokemon.moves.length > 0 && (
          <div className="mt-3 space-y-0.5">
            <span className="font-stat-label text-text-tertiary uppercase">Moves</span>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              {[0, 1, 2, 3].map((i) => {
                const move = pokemon.moves[i];
                if (!move) return null;
                return (
                  <span key={i} className="font-body text-text-primary text-sm truncate max-w-[140px]">
                    {move}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Row 3: Mini Stats */}
        {stats && (
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {STAT_KEYS.map((key) => (
              <CompactStatBar
                key={key}
                label={key}
                value={stats[key]}
                ev={pokemon.evs[key]}
              />
            ))}
          </div>
        )}

        {/* Row 4: Quick Actions */}
        {showActions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-border-subtle flex gap-2"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy?.(index);
              }}
              className="flex-1 h-10 flex items-center justify-center gap-1.5 rounded-lg bg-bg-tertiary font-caption text-text-secondary touch-target"
            >
              <Copy size={14} />
              Copy
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(index);
              }}
              className="flex-1 h-10 flex items-center justify-center gap-1.5 rounded-lg bg-bg-tertiary font-caption text-danger touch-target"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-[80]"
          onClick={() => setContextMenu(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute bg-bg-elevated rounded-xl shadow-xl border border-border-subtle overflow-hidden"
            style={{
              left: Math.min(contextMenu.x, window.innerWidth - 180),
              top: Math.min(contextMenu.y, window.innerHeight - 150),
              width: 170,
            }}
          >
            <button
              onClick={() => {
                onCopy?.(index);
                setContextMenu(null);
              }}
              className="w-full h-12 flex items-center gap-3 px-4 font-body text-text-primary hover:bg-bg-secondary transition-colors"
            >
              <Copy size={16} />
              Copy Pokemon
            </button>
            <button
              onClick={() => {
                onDelete?.(index);
                setContextMenu(null);
              }}
              className="w-full h-12 flex items-center gap-3 px-4 font-body text-danger hover:bg-bg-secondary transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}

/** Compact stat bar for card view */
function CompactStatBar({
  label,
  value,
  ev,
}: {
  label: string;
  value: number;
  ev: number;
}) {
  const colors: Record<string, string> = {
    hp: '#FF4444',
    atk: '#F08030',
    def: '#F8D030',
    spa: '#6890F0',
    spd: '#78C850',
    spe: '#F85888',
  };
  const color = colors[label] || '#94A3B8';
  const barWidth = Math.min(100, (ev / 252) * 100);

  return (
    <div className="flex items-center gap-2">
      <span className="font-stat-label uppercase text-[10px] w-6" style={{ color }}>
        {label === 'spa' ? 'SpA' : label === 'spd' ? 'SpD' : label === 'spe' ? 'Spe' : label.toUpperCase()}
      </span>
      <div className="flex-1 h-[3px] bg-bg-elevated rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${barWidth}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-stat-number text-[11px] text-text-primary w-7 text-right">
        {value}
      </span>
    </div>
  );
}
