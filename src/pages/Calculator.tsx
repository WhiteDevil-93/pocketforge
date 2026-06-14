// ============================================================================
// PocketForge — Damage Calculator Page
// ============================================================================
// Mobile-first damage calculator inspired by calc.pokemonshowdown.com
// ============================================================================

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Zap,
  CloudRain,
  Sun,
  Snowflake,
  Wind,
  CircleDot,
} from 'lucide-react';
import {
  searchPokemon,
  searchMoves,
  searchItems,
  getPokemonByName,
  getMoveByName,
  getTypeColor,
} from '../data';
import BottomSheet from '../components/BottomSheet';
import PokemonSprite from '../components/PokemonSprite';
import TypeBadge from '../components/TypeBadge';
import {
  calculateDamage,
  formatDamagePercent,
  getDefaultCalcPokemon,
  getDefaultField,
} from '../utils/damageCalc';
import { calculateStat, calculateHP } from '../utils/statCalc';
import type {
  CalcPokemon,
  CalcMove,
  FieldConditions,
  Weather,
  Terrain,
  StatusCondition,
  DamageResult,
} from '../utils/damageCalc';

// ---- Constants --------------------------------------------------------------

const STAT_NAMES = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const;
const STAT_LABELS: Record<string, string> = {
  hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe',
};

const STATUS_OPTIONS: { value: StatusCondition; label: string; color: string }[] = [
  { value: 'healthy', label: 'Healthy', color: '#22C55E' },
  { value: 'burned', label: 'Burned', color: '#EE8130' },
  { value: 'paralyzed', label: 'Paralyzed', color: '#F7D02C' },
  { value: 'asleep', label: 'Asleep', color: '#A98FF3' },
  { value: 'frozen', label: 'Frozen', color: '#96D9D6' },
  { value: 'poisoned', label: 'Poisoned', color: '#A33EA1' },
  { value: 'badly-poisoned', label: 'Toxic', color: '#A33EA1' },
];

const WEATHER_OPTIONS: { value: Weather; label: string; icon: typeof Sun }[] = [
  { value: 'none', label: 'None', icon: CircleDot },
  { value: 'sun', label: 'Sun', icon: Sun },
  { value: 'rain', label: 'Rain', icon: CloudRain },
  { value: 'sand', label: 'Sand', icon: Wind },
  { value: 'snow', label: 'Snow', icon: Snowflake },
];

const TERRAIN_OPTIONS: { value: Terrain; label: string; color: string }[] = [
  { value: 'none', label: 'None', color: '#94A3B8' },
  { value: 'electric', label: 'Electric', color: '#F7D02C' },
  { value: 'grassy', label: 'Grassy', color: '#7AC74C' },
  { value: 'psychic', label: 'Psychic', color: '#F95587' },
  { value: 'misty', label: 'Misty', color: '#D685AD' },
];

// ---- Helper Components ------------------------------------------------------

function StatSlider({
  stat,
  baseStat,
  ev,
  iv,
  calculated,
  onEvChange,
  onIvChange,
}: {
  stat: string;
  baseStat: number;
  ev: number;
  iv: number;
  calculated: number;
  onEvChange: (val: number) => void;
  onIvChange: (val: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1 p-2 bg-bg-secondary/50 rounded-xl">
      <div className="flex items-center justify-between">
        <span className={`font-stat-label text-stat-${stat}`}>{STAT_LABELS[stat]}</span>
        <span className="font-stat-number text-text-primary">{calculated}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-micro text-text-tertiary w-6">{baseStat}</span>
        <input
          type="range"
          min={0}
          max={252}
          step={4}
          value={ev}
          onChange={(e) => onEvChange(Number(e.target.value))}
          className="flex-1 h-1.5 accent-accent-primary appearance-none bg-bg-elevated rounded-full cursor-pointer"
        />
        <span className="font-mono text-[10px] text-text-secondary w-7 text-right">{ev}</span>
        <input
          type="number"
          min={0}
          max={31}
          value={iv}
          onChange={(e) => onIvChange(Math.min(31, Math.max(0, Number(e.target.value))))}
          className="w-9 h-6 bg-bg-elevated rounded text-center font-mono text-[10px] text-text-primary outline-none border border-border-subtle"
        />
      </div>
    </div>
  );
}

function LevelStepper({ level, onChange }: { level: number; onChange: (l: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(1, level - 1))}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-bg-elevated touch-target"
      >
        <Minus size={14} className="text-text-secondary" />
      </button>
      <div className="flex items-center gap-1.5">
        <span className="font-micro text-text-tertiary">Lv.</span>
        <span className="font-stat-number text-text-primary w-8 text-center">{level}</span>
      </div>
      <button
        onClick={() => onChange(Math.min(100, level + 1))}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-bg-elevated touch-target"
      >
        <Plus size={14} className="text-text-secondary" />
      </button>
    </div>
  );
}

// ---- Main Component ---------------------------------------------------------

export default function Calculator() {
  // --- Attacker / Defender State ---
  const [attacker, setAttacker] = useState<CalcPokemon>({
    ...getDefaultCalcPokemon(),
    level: 50,
  });
  const [defender, setDefender] = useState<CalcPokemon>({
    ...getDefaultCalcPokemon(),
    level: 50,
  });

  // --- Selected Moves ---
  const [selectedMoves, setSelectedMoves] = useState<(CalcMove | null)[]>([null, null, null, null]);
  const [activeMoveIndex, setActiveMoveIndex] = useState<number | null>(null);

  // --- Field ---
  const [field, setField] = useState<FieldConditions>(getDefaultField());
  const [showField, setShowField] = useState(false);

  // --- Tera toggles ---
  const [attackerTera, setAttackerTera] = useState(false);
  const [defenderTera, setDefenderTera] = useState(false);

  // --- Bottom Sheet State ---
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTitle, setSheetTitle] = useState('');
  const [sheetMode, setSheetMode] = useState<'pokemon' | 'move' | 'ability' | 'item' | ''>('');
  const [sheetTarget, setSheetTarget] = useState<'attacker' | 'defender' | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Damage Results ---
  const damageResults = useMemo(() => {
    return selectedMoves.map((move) => {
      if (!move || move.category === 'Status' || move.power === 0) return null;
      return calculateDamage(attacker, defender, move, field, false, attackerTera);
    });
  }, [attacker, defender, selectedMoves, field, attackerTera]);

  // --- Handlers ---

  const openPokemonSheet = useCallback((target: 'attacker' | 'defender') => {
    setSheetMode('pokemon');
    setSheetTarget(target);
    setSheetTitle(target === 'attacker' ? 'Select Attacker' : 'Select Defender');
    setSearchQuery('');
    setSheetOpen(true);
  }, []);

  const openMoveSheet = useCallback((index: number) => {
    if (!attacker.name) return;
    setSheetMode('move');
    setActiveMoveIndex(index);
    setSheetTitle('Select Move');
    setSearchQuery('');
    setSheetOpen(true);
  }, [attacker.name]);

  const openAbilitySheet = useCallback((target: 'attacker' | 'defender') => {
    setSheetMode('ability');
    setSheetTarget(target);
    setSheetTitle('Select Ability');
    setSearchQuery('');
    setSheetOpen(true);
  }, []);

  const openItemSheet = useCallback((target: 'attacker' | 'defender') => {
    setSheetMode('item');
    setSheetTarget(target);
    setSheetTitle('Select Item');
    setSearchQuery('');
    setSheetOpen(true);
  }, []);

  const selectPokemon = useCallback((pokemonName: string) => {
    const dexEntry = getPokemonByName(pokemonName);
    if (!dexEntry) return;

    const update: CalcPokemon = {
      name: dexEntry.name,
      level: 50,
      baseStats: dexEntry.baseStats,
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      nature: 'Hardy',
      ability: dexEntry.abilities[0] || '',
      item: '',
      types: dexEntry.types,
      status: 'healthy',
    };

    if (sheetTarget === 'attacker') {
      setAttacker(update);
      setSelectedMoves([null, null, null, null]);
    } else {
      setDefender(update);
    }
    setSheetOpen(false);
  }, [sheetTarget]);

  const selectMove = useCallback((moveName: string) => {
    const move = getMoveByName(moveName);
    if (!move) return;
    const calcMove: CalcMove = {
      name: move.name,
      type: move.type,
      category: move.category as 'Physical' | 'Special' | 'Status',
      power: move.power,
      accuracy: move.accuracy,
    };
    setSelectedMoves((prev) => {
      const next = [...prev];
      next[activeMoveIndex ?? 0] = calcMove;
      return next;
    });
    setSheetOpen(false);
  }, [activeMoveIndex]);

  const selectAbility = useCallback((ability: string) => {
    if (sheetTarget === 'attacker') {
      setAttacker((p) => ({ ...p, ability }));
    } else {
      setDefender((p) => ({ ...p, ability }));
    }
    setSheetOpen(false);
  }, [sheetTarget]);

  const selectItem = useCallback((itemName: string) => {
    if (sheetTarget === 'attacker') {
      setAttacker((p) => ({ ...p, item: itemName }));
    } else {
      setDefender((p) => ({ ...p, item: itemName }));
    }
    setSheetOpen(false);
  }, [sheetTarget]);

  const updateAttackerEv = useCallback((stat: string, val: number) => {
    setAttacker((p) => ({ ...p, evs: { ...p.evs, [stat]: val } }));
  }, []);

  const updateAttackerIv = useCallback((stat: string, val: number) => {
    setAttacker((p) => ({ ...p, ivs: { ...p.ivs, [stat]: val } }));
  }, []);

  const updateDefenderEv = useCallback((stat: string, val: number) => {
    setDefender((p) => ({ ...p, evs: { ...p.evs, [stat]: val } }));
  }, []);

  const updateDefenderIv = useCallback((stat: string, val: number) => {
    setDefender((p) => ({ ...p, ivs: { ...p.ivs, [stat]: val } }));
  }, []);

  const updateAttackerLevel = useCallback((l: number) => {
    setAttacker((p) => ({ ...p, level: l }));
  }, []);

  const updateDefenderLevel = useCallback((l: number) => {
    setDefender((p) => ({ ...p, level: l }));
  }, []);

  // --- Computed Stats ---

  const getComputedStats = useCallback((p: CalcPokemon) => {
    const hp = calculateHP(p.baseStats.hp, p.evs.hp, p.ivs.hp, p.level);
    const atk = calculateStat(p.baseStats.atk, p.evs.atk, p.ivs.atk, p.level, p.nature, 'atk');
    const def = calculateStat(p.baseStats.def, p.evs.def, p.ivs.def, p.level, p.nature, 'def');
    const spa = calculateStat(p.baseStats.spa, p.evs.spa, p.ivs.spa, p.level, p.nature, 'spa');
    const spd = calculateStat(p.baseStats.spd, p.evs.spd, p.ivs.spd, p.level, p.nature, 'spd');
    const spe = calculateStat(p.baseStats.spe, p.evs.spe, p.ivs.spe, p.level, p.nature, 'spe');
    return { hp, atk, def, spa, spd, spe };
  }, []);

  const attackerStats = useMemo(() => getComputedStats(attacker), [attacker, getComputedStats]);
  const defenderStats = useMemo(() => getComputedStats(defender), [defender, getComputedStats]);

  // --- Sheet Content ---

  const filteredPokemon = useMemo(() => {
    if (sheetMode !== 'pokemon') return [];
    return searchPokemon(searchQuery).slice(0, 50);
  }, [sheetMode, searchQuery]);

  const filteredMoves = useMemo(() => {
    if (sheetMode !== 'move' || !attacker.name) return [];
    // Get moves the pokemon can learn (from learnset) or all moves if empty learnset
    const dexEntry = getPokemonByName(attacker.name);
    const allMoves = searchMoves(searchQuery);
    if (dexEntry?.learnset && dexEntry.learnset.length > 0) {
      return allMoves.filter((m) => dexEntry.learnset.includes(m.name)).slice(0, 50);
    }
    return allMoves.slice(0, 50);
  }, [sheetMode, searchQuery, attacker.name]);

  const getAbilities = useCallback((pokemonName: string): string[] => {
    const dex = getPokemonByName(pokemonName);
    if (!dex) return [];
    const abilities = [...dex.abilities];
    if (dex.hiddenAbility) abilities.push(dex.hiddenAbility);
    return abilities;
  }, []);

  const filteredItems = useMemo(() => {
    if (sheetMode !== 'item') return [];
    return searchItems(searchQuery).slice(0, 50);
  }, [sheetMode, searchQuery]);

  // ---- Render Pokemon Panel ------------------------------------------------

  function renderPokemonPanel(
    pokemon: CalcPokemon,
    computed: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number },
    onOpenSheet: () => void,
    onOpenAbility: () => void,
    onOpenItem: () => void,
    onUpdateLevel: (l: number) => void,
    onUpdateEv: (stat: string, val: number) => void,
    onUpdateIv: (stat: string, val: number) => void,
    onUpdateStatus: (s: StatusCondition) => void,
    headerBg: string,
    teraActive: boolean,
    onToggleTera: () => void,
    label: string,
  ) {
    return (
      <div className="rounded-2xl bg-bg-secondary border border-border-subtle overflow-hidden">
        {/* Header */}
        <div className={`px-4 py-3 ${headerBg} flex items-center justify-between`}>
          <span className="font-headline text-lg text-text-primary">{label}</span>
          {pokemon.name && (
            <LevelStepper level={pokemon.level} onChange={onUpdateLevel} />
          )}
        </div>

        <div className="p-4 space-y-4">
          {/* Pokemon Selector */}
          <button
            onClick={onOpenSheet}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-bg-tertiary touch-target transition-colors active:bg-bg-elevated"
          >
            {pokemon.name ? (
              <>
                <PokemonSprite name={pokemon.name} size={48} />
                <div className="flex-1 text-left">
                  <div className="font-title text-text-primary">{pokemon.name}</div>
                  <div className="flex gap-1.5 mt-0.5">
                    {pokemon.types.map((t) => (
                      <TypeBadge key={t} type={t} size="sm" />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center">
                  <Search size={20} className="text-text-tertiary" />
                </div>
                <span className="flex-1 text-left font-body text-text-tertiary">
                  Tap to select Pokemon...
                </span>
              </>
            )}
            <ChevronDown size={18} className="text-text-tertiary" />
          </button>

          {pokemon.name && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2">
                {STAT_NAMES.map((stat) => (
                  <StatSlider
                    key={stat}
                    stat={stat}
                    baseStat={pokemon.baseStats[stat as keyof typeof pokemon.baseStats]}
                    ev={pokemon.evs[stat as keyof typeof pokemon.evs]}
                    iv={pokemon.ivs[stat as keyof typeof pokemon.ivs]}
                    calculated={computed[stat as keyof typeof computed]}
                    onEvChange={(val) => onUpdateEv(stat, val)}
                    onIvChange={(val) => onUpdateIv(stat, val)}
                  />
                ))}
              </div>

              {/* Ability & Item */}
              <div className="flex gap-2">
                <button
                  onClick={onOpenAbility}
                  className="flex-1 flex items-center justify-between p-2.5 rounded-xl bg-bg-tertiary touch-target"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-micro text-text-tertiary">Ability</span>
                    <span className="font-body-medium text-text-primary">
                      {pokemon.ability || 'Select...'}
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-text-tertiary" />
                </button>
                <button
                  onClick={onOpenItem}
                  className="flex-1 flex items-center justify-between p-2.5 rounded-xl bg-bg-tertiary touch-target"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-micro text-text-tertiary">Item</span>
                    <span className="font-body-medium text-text-primary truncate max-w-[100px]">
                      {pokemon.item || 'None'}
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-text-tertiary" />
                </button>
              </div>

              {/* Status */}
              <div>
                <span className="font-micro text-text-tertiary block mb-2">Status</span>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onUpdateStatus(opt.value)}
                      className={`px-2.5 py-1 rounded-full font-micro transition-all ${
                        pokemon.status === opt.value
                          ? 'text-white'
                          : 'bg-bg-tertiary text-text-tertiary'
                      }`}
                      style={
                        pokemon.status === opt.value
                          ? { backgroundColor: opt.color }
                          : undefined
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tera Toggle */}
              <button
                onClick={onToggleTera}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                  teraActive ? 'bg-accent-primary/20 border border-accent-primary/50' : 'bg-bg-tertiary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap size={14} className={teraActive ? 'text-accent-primary' : 'text-text-tertiary'} />
                  <span className={`font-body-medium ${teraActive ? 'text-accent-primary' : 'text-text-secondary'}`}>
                    Tera {pokemon.teraType || pokemon.types[0] || 'Stellar'}
                  </span>
                </div>
                <div
                  className={`w-10 h-5 rounded-full transition-colors ${
                    teraActive ? 'bg-accent-primary' : 'bg-bg-elevated'
                  }`}
                >
                  <motion.div
                    animate={{ x: teraActive ? 20 : 2 }}
                    className="w-4 h-4 rounded-full bg-white mt-0.5"
                  />
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ---- Main Render ----------------------------------------------------------

  return (
    <div className="min-h-full pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-xl border-b border-border-subtle px-4 py-3">
        <h1 className="font-headline text-xl text-text-primary">Damage Calculator</h1>
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* Attacker Panel */}
        {renderPokemonPanel(
          attacker,
          attackerStats,
          () => openPokemonSheet('attacker'),
          () => openAbilitySheet('attacker'),
          () => openItemSheet('attacker'),
          updateAttackerLevel,
          updateAttackerEv,
          updateAttackerIv,
          (s) => setAttacker((p) => ({ ...p, status: s })),
          'bg-success/10',
          attackerTera,
          () => setAttackerTera((v) => !v),
          'Attacker',
        )}

        {/* Defender Panel */}
        {renderPokemonPanel(
          defender,
          defenderStats,
          () => openPokemonSheet('defender'),
          () => openAbilitySheet('defender'),
          () => openItemSheet('defender'),
          updateDefenderLevel,
          updateDefenderEv,
          updateDefenderIv,
          (s) => setDefender((p) => ({ ...p, status: s })),
          'bg-danger/10',
          defenderTera,
          () => setDefenderTera((v) => !v),
          'Defender',
        )}

        {/* Move Selection */}
        <div className="rounded-2xl bg-bg-secondary border border-border-subtle overflow-hidden">
          <div className="px-4 py-3 bg-accent-primary/10">
            <span className="font-headline text-lg text-text-primary">Moves</span>
          </div>
          <div className="p-4 space-y-2">
            {selectedMoves.map((move, i) => (
              <div key={i}>
                <button
                  onClick={() => openMoveSheet(i)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-bg-tertiary touch-target transition-colors active:bg-bg-elevated"
                >
                  {move ? (
                    <>
                      <div
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: getTypeColor(move.type) }}
                      />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-body-medium text-text-primary">{move.name}</span>
                          <TypeBadge type={move.type} size="sm" />
                          <span className="font-micro text-text-tertiary">
                            {move.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="font-micro text-text-tertiary">
                            PWR: <span className="text-text-secondary">{move.power}</span>
                          </span>
                          <span className="font-micro text-text-tertiary">
                            ACC: <span className="text-text-secondary">{move.accuracy ?? '--'}%</span>
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <span className="flex-1 text-left font-body text-text-tertiary">
                      Move {i + 1} — Tap to select...
                    </span>
                  )}
                  <ChevronDown size={16} className="text-text-tertiary" />
                </button>

                {/* Damage Result for this move */}
                {damageResults[i] && (
                  <DamageResultCard result={damageResults[i]!} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Field Conditions (Collapsible) */}
        <div className="rounded-2xl bg-bg-secondary border border-border-subtle overflow-hidden">
          <button
            onClick={() => setShowField((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-bg-tertiary/50"
          >
            <span className="font-headline text-lg text-text-primary">Field Conditions</span>
            {showField ? (
              <ChevronUp size={20} className="text-text-tertiary" />
            ) : (
              <ChevronDown size={20} className="text-text-tertiary" />
            )}
          </button>

          <AnimatePresence>
            {showField && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-4">
                  {/* Weather */}
                  <div>
                    <span className="font-micro text-text-tertiary block mb-2">Weather</span>
                    <div className="flex flex-wrap gap-1.5">
                      {WEATHER_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setField((f) => ({ ...f, weather: opt.value }))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-micro transition-all ${
                            field.weather === opt.value
                              ? 'bg-accent-primary text-white'
                              : 'bg-bg-tertiary text-text-tertiary'
                          }`}
                        >
                          <opt.icon size={12} />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Terrain */}
                  <div>
                    <span className="font-micro text-text-tertiary block mb-2">Terrain</span>
                    <div className="flex flex-wrap gap-1.5">
                      {TERRAIN_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setField((f) => ({ ...f, terrain: opt.value }))}
                          className={`px-3 py-1.5 rounded-full font-micro transition-all ${
                            field.terrain === opt.value
                              ? 'text-white'
                              : 'bg-bg-tertiary text-text-tertiary'
                          }`}
                          style={
                            field.terrain === opt.value
                              ? { backgroundColor: opt.color }
                              : undefined
                          }
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Screens & Toggle */}
                  <div>
                    <span className="font-micro text-text-tertiary block mb-2">Screens & Effects</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'reflect' as const, label: 'Reflect' },
                        { key: 'lightScreen' as const, label: 'Light Screen' },
                        { key: 'auroraVeil' as const, label: 'Aurora Veil' },
                        { key: 'stealthRock' as const, label: 'Stealth Rock' },
                        { key: 'multiscale' as const, label: 'Multiscale' },
                        { key: 'friendGuard' as const, label: 'Friend Guard' },
                      ].map((toggle) => (
                        <button
                          key={toggle.key}
                          onClick={() =>
                            setField((f) => ({ ...f, [toggle.key]: !f[toggle.key] }))
                          }
                          className={`px-3 py-1.5 rounded-full font-micro transition-all ${
                            field[toggle.key]
                              ? 'bg-success/20 text-success border border-success/30'
                              : 'bg-bg-tertiary text-text-tertiary'
                          }`}
                        >
                          {toggle.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={sheetTitle}
        searchPlaceholder={
          sheetMode === 'pokemon' ? 'Search Pokemon...' :
          sheetMode === 'move' ? 'Search Moves...' :
          sheetMode === 'ability' ? 'Search Abilities...' :
          sheetMode === 'item' ? 'Search Items...' : 'Search...'
        }
        onSearch={setSearchQuery}
      >
        {sheetMode === 'pokemon' && (
          <div className="space-y-1">
            {filteredPokemon.map((p) => (
              <button
                key={p.name}
                onClick={() => selectPokemon(p.name)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-bg-secondary touch-target transition-colors hover:bg-bg-elevated"
              >
                <PokemonSprite name={p.name} size={40} />
                <div className="flex-1 text-left">
                  <span className="font-body-medium text-text-primary">{p.name}</span>
                  <div className="flex gap-1 mt-0.5">
                    {p.types.map((t) => (
                      <TypeBadge key={t} type={t} size="sm" />
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {sheetMode === 'move' && (
          <div className="space-y-1">
            {filteredMoves.map((m) => (
              <button
                key={m.name}
                onClick={() => selectMove(m.name)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-bg-secondary touch-target transition-colors hover:bg-bg-elevated"
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: getTypeColor(m.type) }}
                />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-body-medium text-text-primary">{m.name}</span>
                    <TypeBadge type={m.type} size="sm" />
                  </div>
                  <span className="font-micro text-text-tertiary">
                    {m.category} | PWR {m.power} | ACC {m.accuracy ?? '--'}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {sheetMode === 'ability' && sheetTarget && (
          <div className="space-y-1">
            {(sheetTarget === 'attacker' ? getAbilities(attacker.name) : getAbilities(defender.name)).map(
              (ability) => (
                <button
                  key={ability}
                  onClick={() => selectAbility(ability)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-bg-secondary touch-target transition-colors hover:bg-bg-elevated"
                >
                  <span className="font-body-medium text-text-primary">{ability}</span>
                </button>
              )
            )}
          </div>
        )}

        {sheetMode === 'item' && (
          <div className="space-y-1">
            {filteredItems.map((item) => (
              <button
                key={item.name}
                onClick={() => selectItem(item.name)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-bg-secondary touch-target transition-colors hover:bg-bg-elevated text-left"
              >
                <div className="flex-1">
                  <span className="font-body-medium text-text-primary block">{item.name}</span>
                  <span className="font-micro text-text-tertiary">{item.description}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

// ---- Damage Result Card -----------------------------------------------------

function DamageResultCard({ result }: { result: DamageResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-1 p-3 rounded-xl bg-accent-primary/5 border border-accent-primary/20"
    >
      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-display text-2xl text-accent-primary">
          {formatDamagePercent(result.minPercent)} - {formatDamagePercent(result.maxPercent)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
        <span className="font-caption text-text-secondary">
          {result.minDamage}-{result.maxDamage} HP
        </span>
        {result.isStab && (
          <span className="font-micro px-1.5 py-0.5 rounded bg-accent-secondary/20 text-accent-secondary">
            STAB x{result.stabMultiplier}
          </span>
        )}
        <span
          className={`font-micro px-1.5 py-0.5 rounded ${
            result.effectiveness > 1
              ? 'bg-success/20 text-success'
              : result.effectiveness < 1 && result.effectiveness > 0
              ? 'bg-warning/20 text-warning'
              : result.effectiveness === 0
              ? 'bg-danger/20 text-danger'
              : 'bg-bg-elevated text-text-tertiary'
          }`}
        >
          {result.effectivenessLabel}
        </span>
      </div>

      <div className="font-body-medium text-text-secondary mb-1">
        {result.koChance}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-text-tertiary">
        <span className="font-micro">
          Crit: {formatDamagePercent(result.critMinPercent)} - {formatDamagePercent(result.critMaxPercent)}
        </span>
      </div>
    </motion.div>
  );
}
