// ============================================================================
// PocketForge — Movepool Explorer Page
// ============================================================================

import { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { motion } from 'framer-motion';
import PokemonSprite from '../components/PokemonSprite';
import TypeBadge from '../components/TypeBadge';
import { searchPokemon } from '../data/pokemonData';
import {
  getMovepoolForSpecies,
  filterMovepool,
  getPokedexEntry,
  type AcquisitionMethod,
} from '../utils/movepoolQuery';
import type { Move } from '../types';

const METHODS: (AcquisitionMethod | 'All')[] = ['All', 'Level', 'TM', 'Tutor', 'Breeding', 'Coverage'];
const CATEGORIES: (Move['category'] | 'All')[] = ['All', 'Physical', 'Special', 'Status'];

export default function MovePoolExplorer() {
  const [speciesQuery, setSpeciesQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('Garchomp');

  const [method, setMethod] = useState<AcquisitionMethod | 'All'>('All');
  const [category, setCategory] = useState<Move['category'] | 'All'>('All');
  const [moveQuery, setMoveQuery] = useState('');
  const [movepool, setMovepool] = useState<any[]>([]);

  const searchResults = useMemo(
    () => (speciesQuery ? searchPokemon(speciesQuery) : []),
    [speciesQuery],
  );

  const dex = useMemo(() => getPokedexEntry(selectedSpecies), [selectedSpecies]);

  useEffect(() => {
    let active = true;
    getMovepoolForSpecies(selectedSpecies).then((res) => {
      if (active) setMovepool(res);
    });
    return () => {
      active = false;
    };
  }, [selectedSpecies]);

  const filtered = useMemo(
    () => filterMovepool(movepool, { method, category, query: moveQuery }),
    [movepool, method, category, moveQuery],
  );

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <PageHeader title="Movepool Explorer" />

      <div className="flex-1 px-4 py-4 pb-24 flex flex-col gap-4">
        {/* Species selector */}
        <div>
          <label className="font-body-medium text-text-secondary mb-2 block">
            Pokémon
          </label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            />
            <input
              type="text"
              value={speciesQuery}
              onChange={(e) => setSpeciesQuery(e.target.value)}
              placeholder="Search Pokémon..."
              className="w-full h-[44px] pl-9 pr-3 rounded-card-md bg-bg-tertiary border border-border-subtle font-body text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent-primary/50"
            />
          </div>
          {searchResults.length > 0 && speciesQuery && (
            <ul className="mt-2 max-h-48 overflow-auto rounded-card-md bg-bg-secondary border border-border-subtle divide-y divide-border-subtle">
              {searchResults.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => {
                      setSelectedSpecies(p.name);
                      setSpeciesQuery('');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-bg-tertiary"
                  >
                    <PokemonSprite name={p.name} size={28} />
                    <span className="font-body text-text-primary flex-1">{p.name}</span>
                    {p.types.map((t) => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Selected Pokémon panel */}
        {dex && (
          <div className="flex items-center gap-3 p-3 rounded-card-md bg-bg-secondary border border-border-subtle">
            <PokemonSprite name={dex.name} size={56} />
            <div className="flex-1 min-w-0">
              <p className="font-headline text-text-primary truncate">{dex.name}</p>
              <div className="flex gap-1 mt-1">
                {dex.types.map((t) => (
                  <TypeBadge key={t} type={t} />
                ))}
              </div>
            </div>
            <span className="font-jetbrains-mono text-text-tertiary">#{dex.id}</span>
          </div>
        )}

        {/* Filters */}
        <div>
          <label className="font-body-medium text-text-secondary mb-2 block">
            Acquisition
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {METHODS.map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`px-3 h-8 rounded-full text-[12px] font-body-medium border whitespace-nowrap ${
                  method === m
                    ? 'bg-accent-primary text-white border-accent-primary'
                    : 'border-border-subtle text-text-secondary bg-bg-secondary'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-body-medium text-text-secondary mb-2 block">
            Category
          </label>
          <div className="flex gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`flex-1 h-8 rounded-full text-[12px] font-body-medium border ${
                  category === c
                    ? 'bg-accent-primary text-white border-accent-primary'
                    : 'border-border-subtle text-text-secondary bg-bg-secondary'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
          />
          <input
            type="text"
            value={moveQuery}
            onChange={(e) => setMoveQuery(e.target.value)}
            placeholder="Search moves..."
            className="w-full h-[40px] pl-9 pr-3 rounded-card-md bg-bg-tertiary border border-border-subtle font-body text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent-primary/50"
          />
        </div>

        {/* Moves list */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="font-subtitle text-text-primary">Moves</h2>
            <span className="font-caption text-text-tertiary">{filtered.length}</span>
          </div>
          {filtered.length === 0 ? (
            <p className="font-body text-text-tertiary py-8 text-center">
              No moves match the current filters.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {filtered.slice(0, 200).map((m, idx) => (
                <motion.li
                  key={`${m.name}-${m.acquisition}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx, 30) * 0.01 }}
                  className="p-3 rounded-card-md bg-bg-secondary border border-border-subtle"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-body-medium text-text-primary">{m.name}</p>
                      <p className="font-caption text-text-tertiary truncate">
                        {m.description}
                      </p>
                    </div>
                    <TypeBadge type={m.type} />
                  </div>
                  <div className="flex items-center gap-3 mt-2 font-caption text-text-tertiary">
                    <span>{m.category}</span>
                    <span>Pow {m.power || '—'}</span>
                    <span>Acc {m.accuracy ?? '—'}</span>
                    <span>PP {m.pp}</span>
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-bg-tertiary text-accent-primary">
                      {m.acquisition}
                    </span>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
          {filtered.length > 200 && (
            <p className="font-caption text-text-tertiary text-center">
              Showing first 200 of {filtered.length}. Narrow the filters to see more.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
