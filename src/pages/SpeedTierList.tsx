// ============================================================================
// PocketForge — Speed Tier Calculator Page
// ============================================================================

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Gauge } from 'lucide-react';
import { useStore } from '../store/useStore';
import PokemonSprite from '../components/PokemonSprite';
import {
  rankTeamBySpeed,
  getSpeedTiersForFormat,
  type SpeedModifiers,
} from '../utils/speedCalculator';

interface ToggleProps {
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}

function Toggle({ label, description, active, onToggle }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex flex-col items-start gap-1 p-3 rounded-card-md border text-left transition-colors ${
        active
          ? 'border-accent-primary bg-accent-primary/10'
          : 'border-border-subtle bg-bg-secondary'
      }`}
    >
      <span
        className={`font-body-medium ${
          active ? 'text-accent-primary' : 'text-text-primary'
        }`}
      >
        {label}
      </span>
      <span className="font-caption text-text-tertiary">{description}</span>
    </button>
  );
}

export default function SpeedTierList() {
  const navigate = useNavigate();
  const teams = useStore((s) => s.teams);
  const currentTeamId = useStore((s) => s.currentTeamId);

  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    currentTeamId || teams[0]?.id || '',
  );

  const [modifiers, setModifiers] = useState<SpeedModifiers>({});

  const toggle = (key: keyof SpeedModifiers) => {
    setModifiers((m) => ({ ...m, [key]: !m[key] }));
  };

  const team = useMemo(
    () => teams.find((t) => t.id === selectedTeamId),
    [teams, selectedTeamId],
  );

  const ranking = useMemo(
    () => (team ? rankTeamBySpeed(team, modifiers) : []),
    [team, modifiers],
  );

  const benchmarks = useMemo(
    () => (team ? getSpeedTiersForFormat(team.format) : []),
    [team],
  );

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 h-[56px] flex items-center gap-2 px-4 bg-bg-primary/95 backdrop-blur-xl border-b border-border-subtle">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-bg-tertiary"
          aria-label="Back"
        >
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="font-title text-text-primary flex items-center gap-2">
          <Zap size={20} className="text-accent-primary" />
          Speed Tiers
        </h1>
      </header>

      <div className="flex-1 px-4 py-4 pb-24 flex flex-col gap-4">
        {/* Team selector */}
        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <Gauge size={64} className="text-text-tertiary mb-4" />
            <h2 className="font-headline text-text-primary mb-2">No Teams Yet</h2>
            <p className="font-body text-text-secondary max-w-[280px]">
              Build or import a team to see speed rankings.
            </p>
          </div>
        ) : (
          <>
            <div>
              <label className="font-body-medium text-text-secondary mb-2 block">
                Team
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full h-[48px] px-4 rounded-card-md bg-bg-tertiary border border-border-subtle font-body text-text-primary outline-none focus:border-accent-primary/50"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.format})
                  </option>
                ))}
              </select>
            </div>

            {/* Modifier toggles */}
            <div>
              <h2 className="font-subtitle text-text-primary mb-2">Battlefield</h2>
              <div className="grid grid-cols-2 gap-2">
                <Toggle
                  label="Choice Scarf"
                  description="Apply 1.5× to scarf'd mons"
                  active={!!modifiers.isScarf}
                  onToggle={() => toggle('isScarf')}
                />
                <Toggle
                  label="Sticky Web"
                  description="−1 Speed stage"
                  active={!!modifiers.hasStickyWeb}
                  onToggle={() => toggle('hasStickyWeb')}
                />
                <Toggle
                  label="Tailwind"
                  description="2× Speed"
                  active={!!modifiers.tailwindActive}
                  onToggle={() => toggle('tailwindActive')}
                />
                <Toggle
                  label="Trick Room"
                  description="Slowest moves first"
                  active={!!modifiers.isTrickRoom}
                  onToggle={() => toggle('isTrickRoom')}
                />
                <Toggle
                  label="Paralyzed"
                  description="0.5× Speed"
                  active={!!modifiers.paralyzed}
                  onToggle={() => toggle('paralyzed')}
                />
              </div>
            </div>

            {/* Ranking */}
            <div>
              <h2 className="font-subtitle text-text-primary mb-2">
                {modifiers.isTrickRoom ? 'Trick Room Order' : 'Speed Order'}
              </h2>
              {ranking.length === 0 ? (
                <p className="font-body text-text-tertiary py-8 text-center">
                  Add Pokémon to this team to see speed rankings.
                </p>
              ) : (
                <ol className="flex flex-col gap-2">
                  {ranking.map((entry, idx) => (
                    <motion.li
                      key={entry.pokemon.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="flex items-center gap-3 p-3 rounded-card-md bg-bg-secondary border border-border-subtle"
                    >
                      <span className="w-6 text-center font-jetbrains-mono text-text-tertiary">
                        {idx + 1}
                      </span>
                      <PokemonSprite name={entry.pokemon.species} size={40} />
                      <div className="flex-1 min-w-0">
                        <p className="font-body-medium text-text-primary truncate">
                          {entry.pokemon.nickname || entry.pokemon.species}
                        </p>
                        <p className="font-caption text-text-tertiary truncate">
                          Base {entry.baseSpeed} · {entry.pokemon.nature} · {entry.pokemon.evs.spe} Spe EVs
                          {entry.pokemon.item ? ` · ${entry.pokemon.item}` : ''}
                        </p>
                      </div>
                      <span className="font-jetbrains-mono text-accent-primary font-bold">
                        {entry.finalSpeed}
                      </span>
                    </motion.li>
                  ))}
                </ol>
              )}
            </div>

            {/* Common benchmarks */}
            {benchmarks.length > 0 && (
              <div>
                <h2 className="font-subtitle text-text-primary mb-2">Format Benchmarks</h2>
                <ul className="flex flex-col gap-1">
                  {benchmarks.map((b) => (
                    <li
                      key={b.label}
                      className="flex items-center justify-between px-3 py-2 rounded-card-sm bg-bg-tertiary"
                    >
                      <span className="font-caption text-text-secondary">{b.label}</span>
                      <span className="font-jetbrains-mono text-text-primary">{b.speed}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
