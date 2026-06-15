// ============================================================================
// PocketForge — Speed Tier Calculator Page
// ============================================================================

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Gauge } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useStore } from '../store/useStore';
import PokemonSprite from '../components/PokemonSprite';
import {
  rankTeamBySpeed,
  getSpeedTiersForFormat,
  type SpeedModifiers,
} from '../utils/speedCalculator';
import { parseFormatGen } from '../utils/psFormat';

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

  const genNum = useMemo(
    () => (team ? parseFormatGen(team.format) : 9),
    [team],
  );

  const ranking = useMemo(
    () => (team ? rankTeamBySpeed(team, modifiers, genNum) : []),
    [team, modifiers, genNum],
  );

  const benchmarks = useMemo(
    () => (team ? getSpeedTiersForFormat(team.format) : []),
    [team],
  );

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <PageHeader title="Speed Tiers" />

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
            <div className="space-y-3">
              <h2 className="font-subtitle text-text-primary">Battlefield & Ability Modifiers</h2>
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
                <Toggle
                  label="Unburden"
                  description="2× Speed when item lost"
                  active={!!modifiers.isUnburdenActive}
                  onToggle={() => toggle('isUnburdenActive')}
                />
                <Toggle
                  label="Slow Start"
                  description="0.5× Speed active"
                  active={!!modifiers.isSlowStartActive}
                  onToggle={() => toggle('isSlowStartActive')}
                />
              </div>

              {/* Weather & Terrain Selectors */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="font-micro text-text-tertiary mb-1 block">Active Weather</label>
                  <select
                    value={modifiers.weather || 'none'}
                    onChange={(e) => setModifiers((m) => ({ ...m, weather: e.target.value === 'none' ? undefined : e.target.value }))}
                    className="w-full h-[40px] px-3 rounded-card-md bg-bg-secondary border border-border-subtle font-body-medium text-xs text-text-primary outline-none focus:border-accent-primary"
                  >
                    <option value="none">None</option>
                    <option value="sun">Sun (Chlorophyll / Proto)</option>
                    <option value="rain">Rain (Swift Swim)</option>
                    <option value="sand">Sandstorm (Sand Rush)</option>
                    <option value="snow">Snow (Slush Rush)</option>
                  </select>
                </div>
                <div>
                  <label className="font-micro text-text-tertiary mb-1 block">Active Terrain</label>
                  <select
                    value={modifiers.terrain || 'none'}
                    onChange={(e) => setModifiers((m) => ({ ...m, terrain: e.target.value === 'none' ? undefined : e.target.value }))}
                    className="w-full h-[40px] px-3 rounded-card-md bg-bg-secondary border border-border-subtle font-body-medium text-xs text-text-primary outline-none focus:border-accent-primary"
                  >
                    <option value="none">None</option>
                    <option value="electric">Electric (Surge Surfer / Quark)</option>
                    <option value="grassy">Grassy</option>
                    <option value="psychic">Psychic</option>
                    <option value="misty">Misty</option>
                  </select>
                </div>
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
