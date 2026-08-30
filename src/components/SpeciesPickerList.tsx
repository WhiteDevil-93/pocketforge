// ============================================================================
// PocketForge — Species picker results (shared by Builder and PokemonEditor)
// ============================================================================

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, List } from 'lucide-react';
import type { PokedexEntry } from '../data/pokemonData';
import { useStore } from '../store/useStore';
import PokemonSprite from './PokemonSprite';
import TypeBadge from './TypeBadge';

interface SpeciesPickerListProps {
  results: PokedexEntry[];
  onSelect: (speciesName: string) => void;
}

/**
 * The results body of a "Choose Pokemon" sheet, in either layout. The two call
 * sites (Builder's add-slot sheet, PokemonEditor's species sheet) had drifted
 * apart — different sprite markup, different type indicators — so they share this
 * instead. The layout choice is a persisted setting rather than local state: a
 * picker is opened once per slot, and re-picking the layout six times per team
 * is not a preference, it's a chore.
 */
export default function SpeciesPickerList({ results, onSelect }: SpeciesPickerListProps) {
  const view = useStore((s) => s.settings.pokemonPickerView) ?? 'list';
  const updateSettings = useStore((s) => s.updateSettings);

  const setView = useCallback(
    (next: 'list' | 'grid') => updateSettings({ pokemonPickerView: next }),
    [updateSettings],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="font-caption text-text-secondary">
          {results.length === 50 ? 'Top 50 matches' : `${results.length} result${results.length === 1 ? '' : 's'}`}
        </span>
        <div
          role="radiogroup"
          aria-label="Result layout"
          className="flex items-center gap-1 p-1 rounded-xl bg-bg-secondary"
        >
          {(
            [
              { value: 'list', label: 'List view', Icon: List },
              { value: 'grid', label: 'Grid view', Icon: LayoutGrid },
            ] as const
          ).map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={view === value}
              aria-label={label}
              onClick={() => setView(value)}
              className={`w-11 h-9 flex items-center justify-center rounded-lg transition-colors ${
                view === value
                  ? 'bg-bg-elevated text-accent-primary'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-3 gap-2">
          {results.map((p) => (
            <motion.button
              key={p.name}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(p.name)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl bg-bg-secondary hover:bg-bg-tertiary transition-colors"
            >
              <PokemonSprite name={p.name} size={64} fallbackText={p.name.slice(0, 3)} />
              <span className="font-caption text-text-primary text-center leading-tight line-clamp-2 w-full">
                {p.name}
              </span>
              <div className="flex gap-1">
                {p.types.map((t) => (
                  <TypeBadge key={t} type={t} size="sm" className="px-1.5" />
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {results.map((p) => (
            <motion.button
              key={p.name}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(p.name)}
              className="w-full h-14 flex items-center gap-3 px-3 rounded-xl hover:bg-bg-secondary transition-colors text-left touch-target"
            >
              <PokemonSprite name={p.name} size={40} fallbackText={p.name.slice(0, 3)} />
              <div className="flex-1 min-w-0">
                <span className="font-body text-text-primary block truncate">{p.name}</span>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {p.types.map((t) => (
                  <TypeBadge key={t} type={t} size="sm" />
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
