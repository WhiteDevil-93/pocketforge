// ============================================================================
// PocketForge — Team Builder / Editor Page
// ============================================================================

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  CheckCircle,
  AlertTriangle,
  MoreVertical,
  Pencil,
  ChevronDown,
  Download,
  Upload,
  Plus,
} from 'lucide-react';
import PokemonCard from '../components/PokemonCard';
import PokemonEditor from '../components/PokemonEditor';
import BottomSheet from '../components/BottomSheet';
import { useStore } from '../store/useStore';
import {
  getFormatById,
  getFormatsGrouped,
  getPokemonByName,
  POKEDEX,
  getTypeColor,
  isEligibleForChampionsMA,
  isChampionsFormatId,
} from '../data';
import type { Pokemon } from '../types';
import { validateTeam } from '../utils';
import { getDefaultLevelForFormat } from '../lib/showdown';
import { HOME_PATH } from '../lib/routes';

const EMPTY_SLOTS = 6;

export default function Builder() {
  const { teamId } = useParams<{ teamId?: string }>();
  const navigate = useNavigate();

  // Store
  const teams = useStore((s) => s.teams);
  const updateTeam = useStore((s) => s.updateTeam);
  const updatePokemon = useStore((s) => s.updatePokemon);
  const addPokemon = useStore((s) => s.addPokemon);
  const removePokemon = useStore((s) => s.removePokemon);
  const customFormats = useStore((s) => s.customFormats);

  // Find team
  const team = teams.find((t) => t.id === teamId);

  // Local state
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [showFormatSheet, setShowFormatSheet] = useState(false);
  const [showPokemonSheet, setShowPokemonSheet] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [pokemonSearch, setPokemonSearch] = useState('');
  const [addingSlotIndex, setAddingSlotIndex] = useState<number | null>(null);

  // Validation state
  const [validationPulse, setValidationPulse] = useState(false);

  // Run validation on team changes
  useEffect(() => {
    if (!team) return;
    let active = true;

    const runValidation = async () => {
      const result = await validateTeam(team);
      if (!active) return;

      const errorsChanged = JSON.stringify(result.errors) !== JSON.stringify(team.validationErrors || []);
      const statusChanged = result.isValid !== team.isValid;

      if (errorsChanged || statusChanged) {
        updateTeam(team.id, {
          isValid: result.isValid,
          validationErrors: result.errors,
        });
      }
    };

    runValidation();

    return () => {
      active = false;
    };
  }, [team?.pokemon, team?.format, team?.name, updateTeam]);

  // Memo
  const teamName = team?.name || 'Untitled Team';
  const formatInfo = team?.format ? getFormatById(team.format, customFormats) : null;
  const formatsGrouped = useMemo(() => getFormatsGrouped(customFormats), [customFormats]);
  const generations = useMemo(() => {
    const order = (key: string) => {
      if (key === 'Champions') return 1000;
      if (key === 'Custom') return 999;
      const n = parseInt(key.replace('Gen ', ''), 10);
      return Number.isNaN(n) ? 0 : n;
    };
    return Object.keys(formatsGrouped).sort((a, b) => order(b) - order(a));
  }, [formatsGrouped]);

  const filledSlots = team?.pokemon?.length || 0;

  const isChampions = team ? isChampionsFormatId(team.format) : false;

  const filteredPokemon = useMemo(() => {
    let pool = POKEDEX;
    if (isChampions) {
      pool = pool.filter(
        (p) => isEligibleForChampionsMA(p.name) || isEligibleForChampionsMA(p.sprite)
      );
    }
    if (!pokemonSearch) return pool.slice(0, 50);
    return pool
      .filter((p) => p.name.toLowerCase().includes(pokemonSearch.toLowerCase()))
      .slice(0, 50);
  }, [pokemonSearch, isChampions]);

  // ---- Actions ----

  const handleSaveName = useCallback(() => {
    if (team && nameInput.trim()) {
      updateTeam(team.id, { name: nameInput.trim() });
    }
    setEditingName(false);
  }, [team, nameInput, updateTeam]);

  const startEditName = useCallback(() => {
    setNameInput(teamName);
    setEditingName(true);
  }, [teamName]);

  const handleSetFormat = useCallback(
    (formatId: string) => {
      if (team) {
        updateTeam(team.id, { format: formatId });
      }
      setShowFormatSheet(false);
    },
    [team, updateTeam]
  );

  const handleTapPokemon = useCallback((index: number) => {
    setEditingSlot(index);
    setEditorOpen(true);
  }, []);

  const handleTapEmpty = useCallback((index: number) => {
    setAddingSlotIndex(index);
    setPokemonSearch('');
    setShowPokemonSheet(true);
  }, []);

  const handleSelectPokemon = useCallback(
    (speciesName: string) => {
      if (!team || addingSlotIndex === null) return;

      const entry = getPokemonByName(speciesName);
      if (!entry) return;

      const newPokemon: Partial<Pokemon> = {
        species: speciesName,
        ability: entry.abilities[0] || '',
        teraType: entry.types[0] || '',
        level: getDefaultLevelForFormat(team.format),
        moves: [],
        evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
        nature: 'Serious',
      };

      // If slot is within existing array, we may need to insert at specific position
      const currentLength = team.pokemon.length;
      if (addingSlotIndex < currentLength) {
        // Replace: remove existing then add new at this position
        // For simplicity, we add to end and the user can reorder
        addPokemon(team.id, newPokemon);
      } else {
        addPokemon(team.id, newPokemon);
      }

      setShowPokemonSheet(false);
      setAddingSlotIndex(null);
    },
    [team, addingSlotIndex, addPokemon]
  );

  const handleSavePokemon = useCallback(
    (updates: Partial<Pokemon>) => {
      if (!team || editingSlot === null) return;
      updatePokemon(team.id, editingSlot, updates);
      setEditorOpen(false);
      setEditingSlot(null);
    },
    [team, editingSlot, updatePokemon]
  );

  const handleDeletePokemon = useCallback(() => {
    if (!team || editingSlot === null) return;
    removePokemon(team.id, editingSlot);
    setEditorOpen(false);
    setEditingSlot(null);
  }, [team, editingSlot, removePokemon]);

  const handleCopyPokemon = useCallback(
    (index: number) => {
      if (!team) return;
      const pokemon = team.pokemon[index];
      if (!pokemon) return;
      if (team.pokemon.length >= 6) return;
      addPokemon(team.id, { ...pokemon, id: crypto.randomUUID() });
    },
    [team, addPokemon]
  );

  const handleValidate = useCallback(() => {
    setValidationPulse(true);
    setTimeout(() => setValidationPulse(false), 600);
  }, []);

  // ---- No team selected ----
  if (!team) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-bg-tertiary mb-4">
            <Plus size={32} className="text-accent-primary" />
          </div>
          <h2 className="font-headline text-text-primary mb-2">No Team Selected</h2>
          <p className="font-body text-text-secondary mb-6">
            Create or select a team to start building.
          </p>
          <button
            onClick={() => navigate(HOME_PATH)}
            className="h-12 px-6 rounded-xl bg-accent-primary font-body-medium text-white touch-target"
          >
            Go to Teams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-30 bg-bg-primary/95 backdrop-blur-sm border-b border-border-subtle">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => navigate(HOME_PATH)}
            className="w-12 h-12 flex items-center justify-center -ml-2 touch-target"
          >
            <ChevronLeft size={24} className="text-text-primary" />
          </button>

          <h1 className="absolute inset-x-0 text-center font-title text-text-primary pointer-events-none">
            Edit Team
          </h1>

          <div className="flex items-center gap-1">
            {/* Validate button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              animate={validationPulse ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.3 }}
              onClick={handleValidate}
              className={`w-10 h-10 flex items-center justify-center rounded-full touch-target ${
                team.isValid
                  ? 'bg-success/15 text-success'
                  : 'bg-warning/15 text-warning'
              }`}
            >
              {team.isValid ? (
                <CheckCircle size={20} />
              ) : (
                <AlertTriangle size={20} />
              )}
            </motion.button>

            {/* Overflow */}
            <button
              onClick={() => setShowContextMenu(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full touch-target"
            >
              <MoreVertical size={20} className="text-text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-4 space-y-4">
        {/* Team Name */}
        <div>
          {editingName ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') setEditingName(false);
                }}
                autoFocus
                maxLength={50}
                className="flex-1 h-12 px-4 bg-bg-tertiary rounded-xl font-headline text-text-primary outline-none border border-accent-primary/50"
                style={{ fontSize: '24px' }}
              />
            </motion.div>
          ) : (
            <motion.button
              onClick={startEditName}
              className="w-full flex items-center justify-between py-2 text-left touch-target"
            >
              <h2 className="font-headline text-text-primary">{teamName}</h2>
              <Pencil size={18} className="text-text-tertiary" />
            </motion.button>
          )}
        </div>

        {/* Format Row */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFormatSheet(true)}
            className="flex-1 h-11 px-3 bg-bg-secondary rounded-xl border border-border-subtle flex items-center justify-between text-left touch-target"
          >
            <div className="flex items-center gap-2">
              {formatInfo && (
                <span
                  className="h-6 px-2 rounded-full font-micro font-bold uppercase flex items-center"
                  style={{
                    backgroundColor: `${getTypeColor('Dragon')}26`,
                    color: getTypeColor('Dragon'),
                  }}
                >
                  {formatInfo.name}
                </span>
              )}
              {!formatInfo && (
                <span className="font-body text-text-tertiary">Select Format</span>
              )}
            </div>
            <ChevronDown size={18} className="text-text-tertiary" />
          </button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleValidate}
            className={`h-9 px-3 rounded-full font-caption font-medium flex items-center gap-1.5 touch-target transition-colors ${
              team.isValid
                ? 'bg-success/15 text-success'
                : 'bg-surface-invalid text-danger'
            }`}
          >
            {team.isValid ? (
              <CheckCircle size={14} />
            ) : (
              <AlertTriangle size={14} />
            )}
            {team.isValid ? 'Valid' : 'Check'}
          </motion.button>
        </div>

        {/* Validation errors */}
        {team.validationErrors && team.validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-surface-invalid border border-danger/20"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-danger shrink-0 mt-0.5" />
              <div className="space-y-1">
                {team.validationErrors.map((err, i) => (
                  <p key={i} className="font-caption text-danger">
                    {err}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Pokemon Slots */}
        <div className="space-y-2.5">
          {Array.from({ length: EMPTY_SLOTS }).map((_, i) => {
            const pokemon = team.pokemon[i];
            return (
              <motion.div
                key={pokemon?.id || `empty-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <PokemonCard
                  pokemon={pokemon}
                  index={i}
                  onTap={handleTapPokemon}
                  onTapEmpty={handleTapEmpty}
                  onCopy={handleCopyPokemon}
                  onDelete={(idx) => removePokemon(team.id, idx)}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Import / Export */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => navigate('/import-export')}
            className="h-12 flex items-center justify-center gap-2 rounded-xl bg-bg-secondary border border-border-subtle font-body-medium text-text-primary touch-target"
          >
            <Download size={18} className="text-accent-primary" />
            Import
          </button>
          <button
            onClick={() => navigate('/import-export')}
            className="h-12 flex items-center justify-center gap-2 rounded-xl bg-bg-secondary border border-border-subtle font-body-medium text-text-primary touch-target"
          >
            <Upload size={18} className="text-accent-secondary" />
            Export
          </button>
        </div>

        {/* Bottom padding */}
        <div className="h-4" />
      </div>

      {/* FAB for adding Pokemon */}
      {filledSlots < 6 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setAddingSlotIndex(filledSlots);
            setPokemonSearch('');
            setShowPokemonSheet(true);
          }}
          className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-accent-primary flex items-center justify-center shadow-lg touch-target"
          style={{ boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)' }}
        >
          <Plus size={24} className="text-white" />
        </motion.button>
      )}

      {/* ===== FULL-SCREEN POKEMON EDITOR ===== */}
      <AnimatePresence>
        {editorOpen && editingSlot !== null && team.pokemon[editingSlot] && (
          <PokemonEditor
            pokemon={team.pokemon[editingSlot]}
            slotIndex={editingSlot}
            formatId={team.format}
            onSave={handleSavePokemon}
            onDelete={handleDeletePokemon}
            onBack={() => {
              setEditorOpen(false);
              setEditingSlot(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* ===== BOTTOM SHEETS ===== */}

      {/* Format Picker */}
      <BottomSheet
        isOpen={showFormatSheet}
        onClose={() => setShowFormatSheet(false)}
        title="Select Format"
        showSearch={false}
      >
        <div className="space-y-4">
          {generations.map((gen) => (
            <div key={gen}>
              <h3 className="font-caption text-text-secondary uppercase mb-2 px-1">
                {gen === 'Custom' ? 'Custom Formats' : `Generation ${gen}`}
              </h3>
              <div className="space-y-1">
                {formatsGrouped[gen]?.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => handleSetFormat(format.id)}
                    className={`w-full h-12 flex items-center justify-between px-3 rounded-xl transition-colors text-left touch-target ${
                      team.format === format.id
                        ? 'bg-accent-primary/10 border border-accent-primary/30'
                        : 'hover:bg-bg-secondary'
                    }`}
                  >
                    <span
                      className={`font-body ${
                        team.format === format.id
                          ? 'text-accent-primary'
                          : 'text-text-primary'
                      }`}
                    >
                      {format.name}
                    </span>
                    {team.format === format.id && (
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
            </div>
          ))}
        </div>
      </BottomSheet>

      {/* Pokemon Selection Sheet */}
      <BottomSheet
        isOpen={showPokemonSheet}
        onClose={() => {
          setShowPokemonSheet(false);
          setAddingSlotIndex(null);
        }}
        title="Choose Pokemon"
        searchPlaceholder="Search Pokemon..."
        onSearch={setPokemonSearch}
      >
        <div className="space-y-1">
          {filteredPokemon.map((p) => (
            <motion.button
              key={p.name}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectPokemon(p.name)}
              className="w-full h-14 flex items-center gap-3 px-3 rounded-xl hover:bg-bg-secondary transition-colors text-left touch-target"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${getTypeColor(p.types[0] || 'Normal')}14` }}
              >
                <img
                  src={`https://play.pokemonshowdown.com/sprites/gen5/${p.sprite}.png`}
                  alt={p.name}
                  className="w-9 h-9 object-contain"
                  style={{ imageRendering: 'pixelated' }}
                  loading="lazy"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-body text-text-primary block">{p.name}</span>
              </div>
              <div className="flex gap-1.5">
                {p.types.map((t) => (
                  <span
                    key={t}
                    className="h-5 px-1.5 rounded-full font-micro font-bold uppercase text-[9px] flex items-center"
                    style={{
                      backgroundColor: `${getTypeColor(t)}26`,
                      color: getTypeColor(t),
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      </BottomSheet>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="fixed inset-0 z-[80]"
          onClick={() => setShowContextMenu(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute top-14 right-4 bg-bg-elevated rounded-xl shadow-xl border border-border-subtle overflow-hidden w-52"
          >
            <button
              onClick={() => {
                navigate('/import-export');
                setShowContextMenu(false);
              }}
              className="w-full h-12 flex items-center gap-3 px-4 font-body text-text-primary hover:bg-bg-secondary transition-colors text-left"
            >
              <Download size={16} />
              Export Team
            </button>
            <button
              onClick={() => {
                if (team) {
                  const { duplicateTeam } = useStore.getState();
                  const newId = duplicateTeam(team.id);
                  if (newId) navigate(`/builder/${newId}`);
                }
                setShowContextMenu(false);
              }}
              className="w-full h-12 flex items-center gap-3 px-4 font-body text-text-primary hover:bg-bg-secondary transition-colors text-left"
            >
              <Upload size={16} />
              Duplicate Team
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
