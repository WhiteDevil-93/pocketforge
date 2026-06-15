// ============================================================================
// PocketForge — Team Card Component with Swipe Actions
// ============================================================================

import { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Copy, Trash2, Download, AlertTriangle, Check } from 'lucide-react';
import type { Team } from '../types';
import { getFormatById } from '../data/formatsData';
import PokemonSprite from './PokemonSprite';

interface TeamCardProps {
  team: Team;
  onTap: (teamId: string) => void;
  onCopy: (teamId: string) => void;
  onDelete: (teamId: string) => void;
  onExport: (teamId: string) => void;
  onDuplicate: (teamId: string) => void;
  index?: number;
}

// ---- Format badge colors ---------------------------------------------------

function getFormatBadgeColors(format: string): { bg: string; text: string } {
  const f = format.toLowerCase();
  if (f.includes('ubers') || f.includes('ag')) return { bg: 'rgba(239, 68, 68, 0.12)', text: '#EF4444' };
  if (f.includes('uu') || f.includes('ru') || f.includes('nu') || f.includes('pu')) return { bg: 'rgba(234, 179, 8, 0.12)', text: '#EAB308' };
  if (f.startsWith('champions')) return { bg: 'rgba(245, 158, 11, 0.14)', text: '#F59E0B' };
  if (f.includes('vgc') || f.includes('doubles')) return { bg: 'rgba(6, 182, 212, 0.12)', text: '#06B6D4' };
  if (f.includes('nationaldex') || f.includes('natdex')) return { bg: 'rgba(34, 197, 94, 0.12)', text: '#22C55E' };
  if (f.includes('1v1') || f.includes('hackmons') || f.includes('almostanyability')) return { bg: 'rgba(168, 85, 247, 0.12)', text: '#A855F7' };
  return { bg: 'rgba(59, 130, 246, 0.12)', text: '#3B82F6' };
}

// ---- Relative time formatter -----------------------------------------------

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 4) return `${diffWeek}w ago`;
  return date.toLocaleDateString();
}

// ---- Format display name ---------------------------------------------------

function getFormatDisplayName(format: string): string {
  const info = getFormatById(format);
  if (info) return info.name;
  const match = format.match(/gen(\d)(.+)/i);
  if (match) {
    return `Gen ${match[1]} ${match[2].toUpperCase()}`;
  }
  if (format.startsWith('champions')) return 'Champions';
  return format;
}

// ---- Validation hint text --------------------------------------------------

function getValidationHint(team: Team): string | null {
  if (team.validationErrors && team.validationErrors.length > 0) {
    return team.validationErrors[0];
  }
  if (!team.isValid && team.pokemon.length > 0) {
    return 'Team has validation issues';
  }
  if (team.isValid && team.pokemon.length === 6) {
    return null; // Valid, no hint shown
  }
  return null;
}

export default function TeamCard({
  team,
  onTap,
  onCopy,
  onDelete,
  onExport,
  onDuplicate,
  index = 0,
}: TeamCardProps) {
  const [isSwiped, setIsSwiped] = useState<'left' | 'right' | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);

  // Transform x position to opacity of swipe actions
  useTransform(x, [0, 60], [0, 1]);
  useTransform(x, [0, 80], [0.8, 1]);
  useTransform(x, [0, -60], [0, 1]);
  useTransform(x, [0, -80], [0.8, 1]);

  const formatColors = getFormatBadgeColors(team.format);
  const validationHint = getValidationHint(team);
  const timestamp = getRelativeTime(team.updatedAt);

  // Pokemon sprites (up to 6, fill empty slots)
  const sprites = team.pokemon.map((p) => p.species).filter(Boolean);
  while (sprites.length < 6) {
    sprites.push('');
  }

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const offset = info.offset.x;
      const velocity = info.velocity.x;

      if (offset > 80 || (offset > 40 && velocity > 300)) {
        // Swiped right - reveal left actions
        setIsSwiped('right');
      } else if (offset < -80 || (offset < -40 && velocity < -300)) {
        // Swiped left - reveal right actions
        setIsSwiped('left');
      } else {
        // Snap back
        setIsSwiped(null);
      }
    },
    []
  );

  const handleTap = useCallback(() => {
    if (isSwiped) {
      setIsSwiped(null);
      return;
    }
    onTap(team.id);
  }, [isSwiped, onTap, team.id]);

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsSwiped(null);
      onCopy(team.id);
    },
    [onCopy, team.id]
  );

  const handleExport = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsSwiped(null);
      onExport(team.id);
    },
    [onExport, team.id]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsSwiped(null);
      onDelete(team.id);
    },
    [onDelete, team.id]
  );

  const _handleDuplicate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsSwiped(null);
      onDuplicate(team.id);
    },
    [onDuplicate, team.id]
  );
  void _handleDuplicate;

  return (
    <motion.div
      className="relative w-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.2,
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      }}
    >
      {/* Right-side delete action (revealed on swipe left) */}
      <AnimatePresence>
        {isSwiped === 'left' && (
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-[80px] flex items-center justify-center rounded-r-card bg-danger cursor-pointer z-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={handleDelete}
          >
            <Trash2 size={22} className="text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left-side actions (revealed on swipe right) */}
      <AnimatePresence>
        {isSwiped === 'right' && (
          <motion.div
            className="absolute left-0 top-0 bottom-0 flex items-center z-0 rounded-l-card overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              onClick={handleCopy}
              className="flex flex-col items-center justify-center w-[64px] h-full bg-accent-primary text-white gap-1"
            >
              <Copy size={18} />
              <span className="font-micro">Copy</span>
            </button>
            <button
              onClick={handleExport}
              className="flex flex-col items-center justify-center w-[64px] h-full bg-accent-secondary text-white gap-1"
            >
              <Download size={18} />
              <span className="font-micro">Export</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex flex-col items-center justify-center w-[64px] h-full bg-danger text-white gap-1"
            >
              <Trash2 size={18} />
              <span className="font-micro">Delete</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main card */}
      <motion.div
        ref={cardRef}
        drag="x"
        dragConstraints={{ left: isSwiped === 'left' ? -80 : 0, right: isSwiped === 'right' ? 192 : 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        onTapStart={() => setIsPressed(true)}
        onTapCancel={() => setIsPressed(false)}
        animate={{
          scale: isPressed && !isSwiped ? 0.98 : 1,
          x: isSwiped === 'right' ? 192 : isSwiped === 'left' ? -80 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
        style={{ x }}
        className="relative z-10 bg-bg-secondary border border-border-subtle rounded-card p-3 cursor-pointer select-none"
        onPointerUp={() => setIsPressed(false)}
      >
        {/* Row 1: Format badge + Team name + Timestamp */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="flex-shrink-0 h-[28px] px-2.5 rounded-full font-micro uppercase tracking-wide flex items-center justify-center"
            style={{
              backgroundColor: formatColors.bg,
              color: formatColors.text,
            }}
          >
            {getFormatDisplayName(team.format)}
          </span>

          <h3 className="flex-1 font-subtitle text-text-primary truncate min-w-0">
            {team.name}
          </h3>

          <span className="font-caption text-text-tertiary flex-shrink-0 ml-1">
            {timestamp}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-border-subtle mb-2" />

        {/* Row 2: 6 Pokemon sprite previews */}
        <div className="flex items-center gap-1 mb-2 overflow-x-auto">
          {sprites.map((species, i) => (
            <div
              key={i}
              className={`flex-shrink-0 w-[52px] h-[52px] rounded-full flex items-center justify-center overflow-hidden ${
                species
                  ? 'bg-bg-tertiary'
                  : 'bg-bg-tertiary/50 border border-dashed border-border-subtle'
              }`}
            >
              {species ? (
                <PokemonSprite name={species} size={48} />
              ) : (
                <span className="text-text-tertiary text-xs">+</span>
              )}
            </div>
          ))}
        </div>

        {/* Row 3: Validation hint */}
        {validationHint ? (
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-warning flex-shrink-0" />
            <span className="font-caption text-warning truncate">
              {validationHint}
            </span>
          </div>
        ) : team.isValid ? (
          <div className="flex items-center gap-1.5">
            <Check size={14} className="text-success flex-shrink-0" />
            <span className="font-caption text-success">Team valid</span>
          </div>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
