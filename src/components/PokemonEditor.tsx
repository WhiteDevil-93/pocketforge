// ============================================================================
// PocketForge — Full-Screen Pokemon Editor
// ============================================================================

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronDown,
  Save,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';
import PokemonSprite from './PokemonSprite';
import TypeBadge from './TypeBadge';
import BottomSheet from './BottomSheet';
import StepperInput from './StepperInput';
import StatBar from './StatBar';
import { getSetsForSpecies, type SmogonSet } from '../data/smogonSets';
import {
  getPokemonByName,
  getTypeColor,
  POKEDEX,
  getMovesForPokemon,
  getMoveByName,
  searchItems,
  getItemSpriteUrl,
  NATURES,
  getNatureByName,
  getNatureDescription,
  getAllTypes,
  formatSupportsTera,
  formatSupportsMega,
  formatSupportsZMoves,
  isMegaStone,
  getMegaByStone,
  isChampionsFormatId,
  isEligibleForChampionsFormat,
  isChampionsItemLegal,
  getChampionsMovesForSpecies,
} from '../data';
import {
  calculateAllStats,
  getTotalEVs,
  getRemainingEVs,
  getStatAbbreviation,
  getStatColorClass,
} from '../utils';
import type { Pokemon, EVs, IVs } from '../types';
import { springSnappy, transitionFast } from '../lib/motion';

interface PokemonEditorProps {
  pokemon: Pokemon;
  slotIndex: number;
  formatId?: string;
  onSave: (updates: Partial<Pokemon>) => void;
  onDelete: () => void;
  onBack: () => void;
}

type AccordionSection = 'basic' | 'moves' | 'stats';

// ---- Nature modifiers display ----
const STAT_NAMES = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const;

export default function PokemonEditor({
  pokemon,
  slotIndex: _slotIndex,
  formatId,
  onSave,
  onDelete,
  onBack,
}: PokemonEditorProps) {
  // ---- Local editing state ----
  const [draft, setDraft] = useState<Pokemon>({ ...pokemon });
  const [expanded, setExpanded] = useState<Record<AccordionSection, boolean>>({
    basic: true,
    moves: true,
    stats: true,
  });

  // Bottom sheet state
  const [sheet, setSheet] = useState<{
    type: 'species' | 'ability' | 'item' | 'tera' | 'move' | 'nature' | null;
    moveIndex?: number;
  }>({ type: null });
  const [searchQuery, setSearchQuery] = useState('');

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Mega Evolution active toggle (local, not persisted directly)
  const [megaActive, setMegaActive] = useState(pokemon.megaActive || false);

  // Sync draft when pokemon prop changes
  useEffect(() => {
    setDraft({ ...pokemon });
    setMegaActive(pokemon.megaActive || false);
  }, [pokemon]);

  const dexEntry = useMemo(
    () => getPokemonByName(draft.species),
    [draft.species]
  );
  const types = dexEntry?.types || [];
  const abilities = useMemo(() => {
    if (!dexEntry) return [];
    const list = [...dexEntry.abilities];
    if (dexEntry.hiddenAbility) list.push(dexEntry.hiddenAbility);
    return list;
  }, [dexEntry]);
  const allTypes = useMemo(() => getAllTypes(), []);

  // Determine if the equipped item is a Mega Stone
  const equippedMegaStone = draft.item && isMegaStone(draft.item) ? getMegaByStone(draft.item) : null;
  const megaEnabled = equippedMegaStone !== null;

  // Get effective base stats (Mega if toggled, otherwise base)
  const effectiveBaseStats = useMemo(() => {
    if (megaActive && equippedMegaStone) {
      return equippedMegaStone.baseStats;
    }
    return dexEntry?.baseStats || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  }, [megaActive, equippedMegaStone, dexEntry]);

  const stats = useMemo(() => {
    return calculateAllStats(
      effectiveBaseStats,
      draft.evs,
      draft.ivs,
      draft.level,
      draft.nature
    );
  }, [effectiveBaseStats, draft.evs, draft.ivs, draft.level, draft.nature]);

  const totalEVs = getTotalEVs(draft.evs);
  const remainingEVs = getRemainingEVs(draft.evs);
  const evValid = totalEVs <= 508;

  // ---- Update helpers ----
  const updateField = useCallback(<K extends keyof Pokemon>(
    field: K,
    value: Pokemon[K]
  ) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateEV = useCallback((stat: keyof EVs, value: number) => {
    const clamped = Math.max(0, Math.min(252, value));
    setDraft((prev) => ({
      ...prev,
      evs: { ...prev.evs, [stat]: clamped },
    }));
  }, []);

  const updateIV = useCallback((stat: keyof IVs, value: number) => {
    const clamped = Math.max(0, Math.min(31, value));
    setDraft((prev) => ({
      ...prev,
      ivs: { ...prev.ivs, [stat]: clamped },
    }));
  }, []);

  const updateMove = useCallback((index: number, moveName: string) => {
    setDraft((prev) => {
      const moves = [...prev.moves];
      moves[index] = moveName;
      return { ...prev, moves };
    });
  }, []);

  const clearMove = useCallback((index: number) => {
    setDraft((prev) => {
      const moves = prev.moves.filter((_, i) => i !== index);
      return { ...prev, moves };
    });
  }, []);

  const toggleAccordion = useCallback((section: AccordionSection) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  // ---- Sample Sets ----
  const sampleSets = useMemo(
    () => getSetsForSpecies(draft.species),
    [draft.species]
  );

  const applySampleSet = useCallback((set: SmogonSet) => {
    setDraft((prev) => ({
      ...prev,
      item: set.item,
      ability: set.ability,
      nature: set.nature,
      teraType: set.teraType ?? prev.teraType,
      evs: { ...set.evs },
      ivs: {
        hp: set.ivs?.hp ?? 31,
        atk: set.ivs?.atk ?? 31,
        def: set.ivs?.def ?? 31,
        spa: set.ivs?.spa ?? 31,
        spd: set.ivs?.spd ?? 31,
        spe: set.ivs?.spe ?? 31,
      },
      moves: set.moves.slice(0, 4),
    }));
  }, []);

  const handleSave = useCallback(() => {
    const updates: Partial<Pokemon> = { ...draft };
    if (megaActive && equippedMegaStone) {
      updates.megaActive = true;
      updates.megaStone = equippedMegaStone.stone;
    } else {
      updates.megaActive = false;
      updates.megaStone = undefined;
    }
    onSave(updates);
  }, [draft, megaActive, equippedMegaStone, onSave]);

  // Filtered lists for bottom sheets
  const isChampions = isChampionsFormatId(formatId || '');

  const filteredPokemon = useMemo(() => {
    let pool = POKEDEX;
    if (isChampions) {
      const fmt = formatId || 'champions-mb';
      pool = pool.filter(
        (p) =>
          isEligibleForChampionsFormat(p.name, fmt) || isEligibleForChampionsFormat(p.sprite, fmt)
      );
    }
    if (!searchQuery) return pool.slice(0, 50);
    return pool
      .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 50);
  }, [searchQuery, isChampions, formatId]);

  const filteredMoves = useMemo(() => {
    if (sheet.type !== 'move') return [];
    const championsMoves = isChampions && draft.species ? getChampionsMovesForSpecies(draft.species) : [];
    const allMoves =
      isChampions && championsMoves.length > 0
        ? championsMoves.map((name) => getMoveByName(name)).filter((m): m is NonNullable<typeof m> => !!m)
        : getMovesForPokemon(draft.species);
    if (!searchQuery) return allMoves.slice(0, 50);
    return allMoves
      .filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 50);
  }, [sheet.type, draft.species, searchQuery, isChampions]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return [];
    const results = searchItems(searchQuery);
    return results.filter((item) => {
      if (item.category === 'Mega Stone' && !formatSupportsMega(formatId || '')) return false;
      if (item.category === 'Z-Crystal' && !formatSupportsZMoves(formatId || '')) return false;
      if (isChampions && !isChampionsItemLegal(item.name)) return false;
      return true;
    });
  }, [searchQuery, formatId, isChampions]);

  // ---- Sheet selection handlers ----
  const handleSelectSpecies = useCallback(
    (speciesName: string) => {
      const entry = getPokemonByName(speciesName);
      if (!entry) return;
      setDraft((prev) => ({
        ...prev,
        species: speciesName,
        ability: entry.abilities[0] || '',
        teraType: entry.types[0] || '',
        moves: [],
      }));
      setSheet({ type: null });
      setSearchQuery('');
    },
    []
  );

  const handleSelectMove = useCallback(
    (moveName: string) => {
      if (sheet.moveIndex === undefined) return;
      updateMove(sheet.moveIndex, moveName);
      setSheet({ type: null });
      setSearchQuery('');
    },
    [sheet.moveIndex, updateMove]
  );

  const primaryTypeColor = getTypeColor(types[0] || 'Normal');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transitionFast}
      className="fixed inset-0 z-40 bg-bg-primary flex flex-col"
    >
      {/* Top App Bar */}
      <div className="shrink-0 flex items-center justify-between px-4 h-14 bg-bg-primary/95 backdrop-blur-sm border-b border-border-subtle z-10">
        <button
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center -ml-2 touch-target"
        >
          <ChevronLeft size={24} className="text-text-primary" />
        </button>
        <h1 className="absolute inset-x-0 text-center font-title text-text-primary pointer-events-none">
          Edit {draft.species || 'Pokemon'}
        </h1>
        <button
          onClick={handleSave}
          className="flex items-center gap-1 text-accent-primary font-body-medium touch-target px-2"
        >
          <Save size={18} />
          Save
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* Hero Sprite Area */}
        <div
          className="flex flex-col items-center justify-center py-6"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, ${primaryTypeColor}0D 0%, transparent 70%)`,
          }}
        >
          <div className="relative">
            <PokemonSprite
              name={draft.species}
              size={120}
              className="rounded-2xl"
            />
            {draft.shiny && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles size={18} className="text-amber-400" />
              </motion.div>
            )}
          </div>
          <h2 className="font-title text-text-primary mt-3">
            {megaActive && equippedMegaStone ? equippedMegaStone.megaName : draft.species}
          </h2>
          {draft.nickname && (
            <p className="font-body text-text-secondary">&quot;{draft.nickname}&quot;</p>
          )}
          <div className="flex gap-1.5 mt-2">
            {types.map((t) => (
              <TypeBadge key={t} type={t} size="md" />
            ))}
          </div>
        </div>

        <div className="px-4 pb-8 space-y-3">
          {/* ===== BASIC INFO ===== */}
          <Accordion
            title="Basic Info"
            expanded={expanded.basic}
            onToggle={() => toggleAccordion('basic')}
          >
            <div className="space-y-3 pt-2">
              {/* Species */}
              <PickerRow
                label="Species"
                value={draft.species || 'Select...'}
                onTap={() => {
                  setSearchQuery('');
                  setSheet({ type: 'species' });
                }}
              />

              {/* Nickname */}
              <div>
                <label className="font-caption text-text-secondary block mb-1.5">
                  Nickname
                </label>
                <input
                  type="text"
                  value={draft.nickname || ''}
                  onChange={(e) => updateField('nickname', e.target.value || undefined)}
                  placeholder={draft.species}
                  maxLength={20}
                  className="w-full h-12 px-4 bg-bg-tertiary rounded-xl text-text-primary placeholder-text-tertiary outline-none border border-border-subtle focus:border-accent-primary/50 transition-colors"
                  style={{ fontSize: '16px' }}
                />
              </div>

              {/* Level */}
              <div>
                <label className="font-caption text-text-secondary block mb-1.5">
                  Level
                </label>
                <StepperInput
                  value={draft.level}
                  min={1}
                  max={100}
                  onChange={(v) => updateField('level', v)}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="font-caption text-text-secondary block mb-1.5">
                  Gender
                </label>
                <div className="flex gap-3">
                  {(['M', 'F', ''] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => updateField('gender', g)}
                      className={`flex-1 h-12 rounded-xl border font-body-medium touch-target transition-colors ${
                        draft.gender === g
                          ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                          : 'border-border-subtle bg-bg-tertiary text-text-secondary'
                      }`}
                    >
                      {g === 'M' ? 'Male' : g === 'F' ? 'Female' : 'None'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shiny Toggle */}
              <div className="flex items-center justify-between py-2">
                <span className="font-body text-text-primary">Shiny</span>
                <button
                  onClick={() => updateField('shiny', !draft.shiny)}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                    draft.shiny ? 'bg-accent-secondary' : 'bg-bg-elevated'
                  }`}
                >
                  <motion.div
                    animate={{ x: draft.shiny ? 20 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
                  />
                </button>
              </div>

              {/* Ability */}
              <PickerRow
                label="Ability"
                value={draft.ability || 'Select...'}
                onTap={() => {
                  setSearchQuery('');
                  setSheet({ type: 'ability' });
                }}
              />

              {/* Item */}
              <PickerRow
                label="Item"
                value={draft.item || 'None'}
                onTap={() => {
                  setSearchQuery('');
                  setSheet({ type: 'item' });
                }}
              />

              {/* Mega Evolution Toggle */}
              {megaEnabled && (
                <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20">
                  <div className="flex items-center gap-2">
                    <span className="font-body text-accent-secondary font-medium">
                      {equippedMegaStone?.megaName}
                    </span>
                    <span className="font-caption text-text-secondary">
                      {equippedMegaStone?.ability}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-caption text-text-secondary">Mega</span>
                    <button
                      onClick={() => setMegaActive(!megaActive)}
                      className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                        megaActive ? 'bg-accent-secondary' : 'bg-bg-elevated'
                      }`}
                    >
                      <motion.div
                        animate={{ x: megaActive ? 20 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Tera Type */}
              {formatSupportsTera(formatId || '') && (
                <PickerRow
                  label="Tera Type"
                  value={draft.teraType || 'None'}
                  onTap={() => {
                    setSearchQuery('');
                    setSheet({ type: 'tera' });
                  }}
                />
              )}
            </div>
          </Accordion>

          {/* ===== SAMPLE SETS ===== */}
          {sampleSets.length > 0 && (
            <div className="rounded-2xl bg-bg-secondary border border-border-subtle overflow-hidden">
              <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                <span className="font-subtitle text-text-primary">Sample Sets</span>
                <span className="font-caption text-text-tertiary">
                  {sampleSets.length}
                </span>
              </div>
              <div className="px-4 pb-4 space-y-2">
                {sampleSets.map((s) => (
                  <motion.button
                    key={`${s.species}-${s.name}`}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => applySampleSet(s)}
                    className="w-full text-left rounded-xl bg-bg-tertiary border border-border-subtle p-3 touch-target hover:border-accent-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-body-medium text-text-primary">
                        {s.name}
                      </span>
                      <span className="font-micro uppercase text-accent-primary">
                        Load Set
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      <span className="font-micro text-text-secondary px-1.5 py-0.5 rounded bg-bg-elevated">
                        {s.item}
                      </span>
                      <span className="font-micro text-text-secondary px-1.5 py-0.5 rounded bg-bg-elevated">
                        {s.ability}
                      </span>
                      <span className="font-micro text-text-secondary px-1.5 py-0.5 rounded bg-bg-elevated">
                        {s.nature}
                      </span>
                      {s.teraType && (
                        <span
                          className="font-micro px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${getTypeColor(s.teraType)}26`,
                            color: getTypeColor(s.teraType),
                          }}
                        >
                          Tera {s.teraType}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {s.moves.map((m) => (
                        <span
                          key={m}
                          className="font-micro text-text-primary px-1.5 py-0.5 rounded bg-bg-elevated"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                    <p className="font-caption text-text-secondary">
                      {s.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* ===== MOVES ===== */}
          <Accordion
            title="Moves"
            expanded={expanded.moves}
            onToggle={() => toggleAccordion('moves')}
            rightLabel={`${draft.moves.length}/4`}
          >
            <div className="space-y-2.5 pt-2">
              {[0, 1, 2, 3].map((i) => {
                const move = draft.moves[i];
                const moveData = move ? getMoveByName(move) : null;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSheet({ type: 'move', moveIndex: i });
                      }}
                      className="flex-1 h-12 px-3 bg-bg-tertiary rounded-xl border border-border-subtle flex items-center gap-2 text-left"
                    >
                      {moveData && (
                        <div
                          className="w-4 h-4 rounded-full shrink-0"
                          style={{ backgroundColor: getTypeColor(moveData.type) }}
                        />
                      )}
                      <span
                        className={`font-body truncate ${
                          move ? 'text-text-primary' : 'text-text-tertiary'
                        }`}
                      >
                        {move || `Move ${i + 1}`}
                      </span>
                    </button>
                    {move && (
                      <button
                        onClick={() => clearMove(i)}
                        className="w-10 h-12 flex items-center justify-center rounded-xl bg-bg-tertiary touch-target"
                      >
                        <X size={16} className="text-text-tertiary" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </Accordion>

          {/* ===== STATS & EVs ===== */}
          <Accordion
            title="Stats & EVs"
            expanded={expanded.stats}
            onToggle={() => toggleAccordion('stats')}
            rightLabel={`${totalEVs}/508`}
          >
            <div className="space-y-2 pt-2">
              {STAT_NAMES.map((stat) => (
                <StatBar
                  key={stat}
                  stat={stat}
                  baseStat={effectiveBaseStats[stat]}
                  ev={draft.evs[stat]}
                  iv={draft.ivs[stat]}
                  level={draft.level}
                  nature={draft.nature}
                  isMegaActive={megaActive}
                  onEVChange={(v) => updateEV(stat, v)}
                  onIVChange={(v) => updateIV(stat, v)}
                />
              ))}

              {/* Remaining EVs */}
              <div className="flex items-center justify-between pt-3 pb-1">
                <div className="flex items-center gap-2">
                  <span className="font-caption text-text-secondary">
                    Remaining:
                  </span>
                  <span
                    className={`font-stat-number text-sm ${
                      evValid ? 'text-success' : 'text-danger'
                    }`}
                  >
                    {remainingEVs} EVs
                  </span>
                </div>
                <button
                  onClick={() => {
                    setDraft((prev) => ({
                      ...prev,
                      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
                    }));
                  }}
                  className="font-caption text-danger touch-target px-2 py-1"
                >
                  Reset EVs
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-border-subtle my-3" />

              {/* Nature Picker */}
              <PickerRow
                label="Nature"
                value={`${draft.nature} (${getNatureDescription(getNatureByName(draft.nature)!)})`}
                onTap={() => {
                  setSearchQuery('');
                  setSheet({ type: 'nature' });
                }}
              />

              {/* IVs Mini Grid */}
              <div className="pt-2">
                <label className="font-caption text-text-secondary block mb-2">
                  IVs (tap to quick-set)
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {STAT_NAMES.map((stat) => (
                    <button
                      key={stat}
                      onClick={() =>
                        updateIV(stat, draft.ivs[stat] === 31 ? 0 : 31)
                      }
                      className="flex flex-col items-center gap-1 p-2 rounded-lg bg-bg-tertiary touch-target"
                    >
                      <span className="font-stat-number text-sm text-text-primary">
                        {draft.ivs[stat]}
                      </span>
                      <span className="font-micro uppercase text-text-tertiary">
                        {getStatAbbreviation(stat)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Final Stats Grid */}
              {stats && (
                <>
                  <div className="h-px bg-border-subtle my-3" />
                  <div>
                    <label className="font-caption text-text-secondary block mb-2">
                      Final Stats
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {STAT_NAMES.map((stat) => {
                        const natureObj = getNatureByName(draft.nature);
                        const boosted = natureObj?.increased === stat;
                        const reduced = natureObj?.decreased === stat;
                        return (
                          <div
                            key={stat}
                            className="flex flex-col items-center p-2.5 rounded-xl bg-bg-tertiary"
                          >
                            <span
                              className={`font-stat-label uppercase ${getStatColorClass(stat)}`}
                            >
                              {getStatAbbreviation(stat)}
                            </span>
                            <span className="font-stat-number text-lg text-text-primary mt-1">
                              {stats[stat]}
                            </span>
                            <span
                              className={`font-micro mt-0.5 ${
                                boosted
                                  ? 'text-success'
                                  : reduced
                                  ? 'text-danger'
                                  : 'text-text-tertiary'
                              }`}
                            >
                              {boosted ? '+10%' : reduced ? '-10%' : '+0'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </Accordion>

          {/* Delete Button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger/10 font-body-medium text-danger touch-target mt-4"
          >
            <Trash2 size={18} />
            Delete Pokemon
          </motion.button>
        </div>
      </div>

      {/* ===== BOTTOM SHEETS ===== */}

      {/* Species Picker */}
      <BottomSheet
        isOpen={sheet.type === 'species'}
        onClose={() => setSheet({ type: null })}
        title="Choose Pokemon"
        searchPlaceholder="Search Pokemon..."
        onSearch={setSearchQuery}
      >
        <div className="space-y-1">
          {filteredPokemon.map((p) => (
            <button
              key={p.name}
              onClick={() => handleSelectSpecies(p.name)}
              className="w-full h-14 flex items-center gap-3 px-3 rounded-xl hover:bg-bg-secondary transition-colors text-left touch-target"
            >
              <PokemonSprite name={p.name} size={40} />
              <div className="flex-1 min-w-0">
                <span className="font-body text-text-primary block">{p.name}</span>
              </div>
              <div className="flex gap-1">
                {p.types.map((t) => (
                  <div
                    key={t}
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: getTypeColor(t) }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Ability Picker */}
      <BottomSheet
        isOpen={sheet.type === 'ability'}
        onClose={() => setSheet({ type: null })}
        title="Select Ability"
        showSearch={false}
      >
        <div className="space-y-1">
          {abilities.map((a) => (
            <button
              key={a}
              onClick={() => {
                updateField('ability', a);
                setSheet({ type: null });
              }}
              className={`w-full h-12 flex items-center justify-between px-3 rounded-xl transition-colors text-left touch-target ${
                draft.ability === a
                  ? 'bg-accent-primary/10 border border-accent-primary/30'
                  : 'hover:bg-bg-secondary'
              }`}
            >
              <span
                className={`font-body ${
                  draft.ability === a ? 'text-accent-primary' : 'text-text-primary'
                }`}
              >
                {a}
                {dexEntry?.hiddenAbility === a && (
                  <span className="ml-2 font-caption text-accent-secondary">
                    HA
                  </span>
                )}
              </span>
              {draft.ability === a && (
                <div className="w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Item Picker */}
      <BottomSheet
        isOpen={sheet.type === 'item'}
        onClose={() => setSheet({ type: null })}
        title="Select Item"
        searchPlaceholder="Search items..."
        onSearch={setSearchQuery}
      >
        <div className="space-y-1">
          {searchQuery === '' && (
            <button
              onClick={() => {
                updateField('item', '');
                setSheet({ type: null });
              }}
              className={`w-full h-12 flex items-center px-3 rounded-xl transition-colors text-left touch-primary ${
                !draft.item ? 'bg-accent-primary/10 text-accent-primary' : 'hover:bg-bg-secondary text-text-primary'
              }`}
            >
              <span className="font-body">None</span>
            </button>
          )}
          {filteredItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                updateField('item', item.name);
                setSheet({ type: null });
                setSearchQuery('');
              }}
              className={`w-full h-14 flex items-center gap-3 px-3 rounded-xl transition-colors text-left touch-target ${
                draft.item === item.name
                  ? 'bg-accent-primary/10 border border-accent-primary/30'
                  : 'hover:bg-bg-secondary'
              }`}
            >
              <img
                src={getItemSpriteUrl(item.name)}
                alt={item.name}
                className="w-8 h-8 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="flex-1 min-w-0">
                <span
                  className={`font-body block ${
                    draft.item === item.name ? 'text-accent-primary' : 'text-text-primary'
                  }`}
                >
                  {item.name}
                </span>
                <span className="font-micro text-text-tertiary">{item.category}</span>
              </div>
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Tera Type Picker */}
      <BottomSheet
        isOpen={sheet.type === 'tera'}
        onClose={() => setSheet({ type: null })}
        title="Select Tera Type"
        showSearch={false}
      >
        <div className="grid grid-cols-3 gap-2">
          {allTypes.map((t) => (
            <button
              key={t}
              onClick={() => {
                updateField('teraType', t);
                setSheet({ type: null });
              }}
              className={`h-12 rounded-xl font-body-medium text-sm transition-all touch-target ${
                draft.teraType === t
                  ? 'ring-2 ring-accent-primary scale-[1.02]'
                  : 'hover:scale-[1.02]'
              }`}
              style={{
                backgroundColor: `${getTypeColor(t)}26`,
                color: getTypeColor(t),
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Move Picker */}
      <BottomSheet
        isOpen={sheet.type === 'move'}
        onClose={() => setSheet({ type: null })}
        title={`Select Move ${sheet.moveIndex !== undefined ? sheet.moveIndex + 1 : ''}`}
        searchPlaceholder="Search moves..."
        onSearch={setSearchQuery}
      >
        <div className="space-y-1">
          {filteredMoves.map((m) => (
            <button
              key={m.name}
              onClick={() => handleSelectMove(m.name)}
              className="w-full min-h-[56px] flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-bg-secondary transition-colors text-left touch-target"
            >
              <div
                className="w-5 h-5 rounded-full shrink-0"
                style={{ backgroundColor: getTypeColor(m.type) }}
              />
              <div className="flex-1 min-w-0">
                <span className="font-body text-text-primary block">{m.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-micro text-text-tertiary">{m.category}</span>
                  {m.power > 0 && (
                    <span className="font-micro text-text-tertiary">
                      Pow: {m.power}
                    </span>
                  )}
                  {m.accuracy && (
                    <span className="font-micro text-text-tertiary">
                      Acc: {m.accuracy}%
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Nature Picker */}
      <BottomSheet
        isOpen={sheet.type === 'nature'}
        onClose={() => setSheet({ type: null })}
        title="Select Nature"
        showSearch={false}
      >
        <div className="space-y-4">
          {/* Neutral Natures */}
          <div>
            <h3 className="font-caption text-text-secondary uppercase mb-2 px-1">
              Neutral
            </h3>
            <div className="space-y-1">
              {NATURES.filter((n) => !n.increased).map((n) => (
                <NatureRow
                  key={n.name}
                  nature={n}
                  selected={draft.nature === n.name}
                  onSelect={() => {
                    updateField('nature', n.name);
                    setSheet({ type: null });
                  }}
                />
              ))}
            </div>
          </div>

          {/* Boosting Natures */}
          <div>
            <h3 className="font-caption text-text-secondary uppercase mb-2 px-1">
              Boosting
            </h3>
            <div className="space-y-1">
              {NATURES.filter((n) => n.increased).map((n) => (
                <NatureRow
                  key={n.name}
                  nature={n}
                  selected={draft.nature === n.name}
                  onSelect={() => {
                    updateField('nature', n.name);
                    setSheet({ type: null });
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* Delete Confirmation Sheet */}
      <BottomSheet
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={`Delete ${draft.species}?`}
        showSearch={false}
      >
        <div className="space-y-4 pt-2">
          <p className="font-body text-text-secondary text-center">
            This Pokemon will be removed from your team. This action cannot be undone.
          </p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setShowDeleteConfirm(false);
              onDelete();
            }}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-danger font-body-medium text-white touch-target"
          >
            <Trash2 size={18} />
            Delete {draft.species}
          </motion.button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="w-full h-12 flex items-center justify-center rounded-xl bg-bg-tertiary font-body text-text-primary touch-target"
          >
            Cancel
          </button>
        </div>
      </BottomSheet>
    </motion.div>
  );
}

// ---- Sub-components ----

/** Accordion Section */
function Accordion({
  title,
  expanded,
  onToggle,
  children,
  rightLabel,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  rightLabel?: string;
}) {
  return (
    <div className="rounded-2xl bg-bg-secondary border border-border-subtle overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full h-[52px] flex items-center justify-between px-4 touch-target"
      >
        <span className="font-subtitle text-text-primary">{title}</span>
        <div className="flex items-center gap-2">
          {rightLabel && (
            <span className="font-caption text-text-tertiary">{rightLabel}</span>
          )}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
          >
            <ChevronDown size={20} className="text-text-tertiary" />
          </motion.div>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: springSnappy,
              opacity: transitionFast,
            }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Picker Row Button */
function PickerRow({
  label,
  value,
  onTap,
}: {
  label: string;
  value: string;
  onTap: () => void;
}) {
  return (
    <div>
      <label className="font-caption text-text-secondary block mb-1.5">{label}</label>
      <button
        onClick={onTap}
        className="w-full h-12 px-4 bg-bg-tertiary rounded-xl border border-border-subtle flex items-center justify-between text-left touch-target"
      >
        <span className="font-body text-text-primary truncate">{value}</span>
        <ChevronDown size={18} className="text-text-tertiary shrink-0" />
      </button>
    </div>
  );
}

/** Nature Row for Bottom Sheet */
function NatureRow({
  nature,
  selected,
  onSelect,
}: {
  nature: { name: string; increased: string | null; decreased: string | null };
  selected: boolean;
  onSelect: () => void;
}) {
  const statShort: Record<string, string> = {
    hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe',
  };

  return (
    <button
      onClick={onSelect}
      className={`w-full h-12 flex items-center justify-between px-3 rounded-xl transition-colors text-left touch-target ${
        selected
          ? 'bg-accent-primary/10 border border-accent-primary/30'
          : 'hover:bg-bg-secondary'
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`font-body ${selected ? 'text-accent-primary' : 'text-text-primary'}`}
        >
          {nature.name}
        </span>
        {nature.increased && nature.decreased && (
          <span className="font-caption">
            <span className="text-success">+{statShort[nature.increased]}</span>
            <span className="text-text-tertiary mx-0.5">, </span>
            <span className="text-danger">-{statShort[nature.decreased]}</span>
          </span>
        )}
      </div>
      {selected && (
        <div className="w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6L5 9L10 3"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </button>
  );
}
