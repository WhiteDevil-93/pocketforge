// ============================================================================
// PocketForge — Import / Export Page
// ============================================================================

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  ClipboardPaste,
  Copy,
  Check,
  Share2,
  ChevronDown,
  AlertTriangle,
  Download,
  Sword,
  Shield,
  Scale,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { springSnappy, transitionFast } from '../lib/motion';
import PageHeader from '../components/PageHeader';
import { useStore } from '../store/useStore';
import { importTeamFromPSFormat, exportTeamToPSFormat } from '../utils';
import type { Team } from '../types';
import { Teams, Team as ShowdownTeam } from '@pkmn/sets';
import { getDexForFormat } from '../lib/showdown';
import { DEFAULT_FORMAT } from '../data/formatsData';

// ---- Sample teams for one-click import -------------------------------------

const SAMPLE_TEAMS = [
  {
    id: 'sample-offensive',
    name: 'Standard Offense',
    description: 'A fast-paced offensive team with strong sweepers.',
    icon: Sword,
    psFormat: `=== Standard Offense ===
// Format: gen9ou

Dragonite @ Choice Band
Ability: Multiscale
EVs: 252 Atk / 4 SpD / 252 Spe
Adamant Nature
- Extreme Speed
- Outrage
- Earthquake
- Fire Punch

Garchomp @ Loaded Dice
Ability: Rough Skin
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Scale Shot
- Earthquake
- Stone Edge
- Swords Dance

Meowscarada @ Focus Sash
Ability: Overgrow
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Flower Trick
- Knock Off
- Sucker Punch
- U-turn`,
  },
  {
    id: 'sample-defensive',
    name: 'Stall Core',
    description: 'A defensive team built to outlast opponents.',
    icon: Shield,
    psFormat: `=== Stall Core ===
// Format: gen9ou

Toxapex @ Rocky Helmet
Ability: Regenerator
EVs: 252 HP / 252 Def / 4 SpD
Bold Nature
IVs: 0 Atk
- Scald
- Recover
- Haze
- Toxic Spikes

Corviknight @ Leftovers
Ability: Pressure
EVs: 252 HP / 168 Def / 88 SpD
Impish Nature
- Brave Bird
- U-turn
- Roost
- Defog

Clodsire @ Leftovers
Ability: Unaware
EVs: 252 HP / 4 Def / 252 SpD
Careful Nature
- Earthquake
- Toxic
- Recover
- Stealth Rock`,
  },
  {
    id: 'sample-balanced',
    name: 'Balanced Core',
    description: 'A well-rounded team with both offense and defense.',
    icon: Scale,
    psFormat: `=== Balanced Core ===
// Format: gen9ou

Landorus-Therian @ Rocky Helmet
Ability: Intimidate
EVs: 252 HP / 112 Def / 144 Spe
Impish Nature
- Earthquake
- U-turn
- Stealth Rock
- Knock Off

Heatran @ Air Balloon
Ability: Flash Fire
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
IVs: 0 Atk
- Magma Storm
- Earth Power
- Taunt
- Stealth Rock

Dragapult @ Choice Specs
Ability: Infiltrator
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Shadow Ball
- Draco Meteor
- Flamethrower
- U-turn`,
  },
];

// ---- Toast -----------------------------------------------------------------

interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const borderColor =
    toast.type === 'success'
      ? 'var(--success)'
      : toast.type === 'error'
      ? 'var(--danger)'
      : 'var(--accent-primary)';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -10, x: '-50%' }}
      transition={transitionFast}
      className="fixed top-4 left-1/2 z-[60] flex items-center gap-2 px-4 py-3 rounded-card-md bg-bg-elevated shadow-card"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      {toast.type === 'success' && <Check size={16} className="text-success" />}
      {toast.type === 'error' && <AlertTriangle size={16} className="text-danger" />}
      {toast.type === 'info' && <AlertTriangle size={16} className="text-accent-primary" />}
      <span className="font-body text-text-primary">{toast.message}</span>
    </motion.div>
  );
}

// ---- Tab type --------------------------------------------------------------

type TabId = 'import' | 'export';

// ============================================================================
// Main Import/Export Page
// ============================================================================

export default function ImportExport() {
  const navigate = useNavigate();
  const teams = useStore((s) => s.teams);
  const importTeam = useStore((s) => s.importTeam);
  const setCurrentTeam = useStore((s) => s.setCurrentTeam);

  // Tabs
  const [activeTab, setActiveTab] = useState<TabId>('import');

  // Import state
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // Export state
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [exportText, setExportText] = useState('');
  const [copied, setCopied] = useState(false);

  // Toast
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // ---- Toast helpers -------------------------------------------------------

  const addToast = useCallback((message: string, type: ToastData['type'] = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev.slice(-1), { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ---- Export text generation ----------------------------------------------

  const selectedTeam = useMemo(
    () => teams.find((t) => t.id === selectedTeamId),
    [teams, selectedTeamId]
  );

  useEffect(() => {
    if (selectedTeam) {
      const text = exportTeamToPSFormat(selectedTeam);
      setExportText(text);
    } else {
      setExportText('');
    }
  }, [selectedTeam]);

  // Set default selected team
  useEffect(() => {
    if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  // ---- Import handlers -----------------------------------------------------

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setImportText(text);
        setImportError(null);
        addToast('Pasted from clipboard', 'success');
      } else {
        addToast('Clipboard is empty', 'error');
      }
    } catch {
      addToast('Could not access clipboard', 'error');
    }
  }, [addToast]);

  const handleImport = useCallback(() => {
    if (!importText.trim()) {
      setImportError('Please paste a team first.');
      return;
    }

    try {
      const parsed = importTeamFromPSFormat(importText);

      if (!parsed.pokemon || parsed.pokemon.length === 0) {
        setImportError('No valid Pokemon found. Make sure you are using Pokemon Showdown export format.');
        return;
      }

      // Validate each pokemon has a species
      const validPokemon = parsed.pokemon.filter((p) => p.species);
      if (validPokemon.length === 0) {
        setImportError('No valid Pokemon species found.');
        return;
      }

      // Create the team
      const teamName = parsed.name || 'Imported Team';
      const teamData: Partial<Team> = {
        name: teamName,
        format: parsed.format || DEFAULT_FORMAT,
        pokemon: validPokemon as Team['pokemon'],
      };

      const teamId = importTeam(teamData);
      addToast(`Team "${teamName}" imported successfully!`, 'success');
      setImportText('');
      setImportError(null);

      // Navigate to the team builder
      setCurrentTeam(teamId);
      navigate(`/builder/${teamId}`);
    } catch (err) {
      setImportError(
        err instanceof Error
          ? err.message
          : 'Invalid format. Make sure you are using Pokemon Showdown export format.'
      );
    }
  }, [importText, importTeam, setCurrentTeam, navigate, addToast]);

  const handleImportSample = useCallback(
    (psFormat: string) => {
      try {
        const parsed = importTeamFromPSFormat(psFormat);
        const teamName = parsed.name || 'Sample Team';
        const teamData: Partial<Team> = {
          name: teamName,
          format: parsed.format || DEFAULT_FORMAT,
          pokemon: (parsed.pokemon || []) as Team['pokemon'],
        };

        const teamId = importTeam(teamData);
        addToast(`Sample team "${teamName}" imported!`, 'success');
        setCurrentTeam(teamId);
        navigate(`/builder/${teamId}`);
      } catch {
        addToast('Failed to import sample team', 'error');
      }
    },
    [importTeam, setCurrentTeam, navigate, addToast]
  );

  // ---- Export handlers -----------------------------------------------------

  const handleCopyToClipboard = useCallback(async () => {
    if (!exportText) return;
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      addToast('Copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Failed to copy', 'error');
    }
  }, [exportText, addToast]);

  const handleShare = useCallback(async () => {
    if (!exportText) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedTeam?.name || 'PocketForge Team',
          text: exportText,
        });
        addToast('Shared successfully!', 'success');
      } catch {
        // User cancelled or share failed, fallback to clipboard
        handleCopyToClipboard();
      }
    } else {
      handleCopyToClipboard();
    }
  }, [exportText, selectedTeam, addToast, handleCopyToClipboard]);

  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const handleCopyShareLink = useCallback(async () => {
    if (!selectedTeam) return;

    try {
      const sets = selectedTeam.pokemon.map((pokemon) => ({
        name: pokemon.nickname || '',
        species: pokemon.species,
        gender: pokemon.gender,
        item: pokemon.item || '',
        ability: pokemon.ability,
        evs: { ...pokemon.evs },
        ivs: { ...pokemon.ivs },
        nature: pokemon.nature || 'Serious',
        level: pokemon.level || 100,
        shiny: pokemon.shiny || false,
        teraType: pokemon.teraType || '',
        moves: pokemon.moves || [],
      }));

      const genDex = getDexForFormat(selectedTeam.format);
      const showdownTeam = new ShowdownTeam(sets, genDex);
      const packed = Teams.packTeam(showdownTeam);
      const shareUrl = `${window.location.origin}${window.location.pathname}?team=${encodeURIComponent(packed)}#/teams`;

      await navigator.clipboard.writeText(shareUrl);
      setShareLinkCopied(true);
      addToast('Shareable link copied to clipboard!', 'success');
      setTimeout(() => setShareLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to create share link:', err);
      addToast('Failed to create share link', 'error');
    }
  }, [selectedTeam, addToast]);

  const handleDownload = useCallback(() => {
    if (!exportText || !selectedTeam) return;
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTeam.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Team downloaded!', 'success');
  }, [exportText, selectedTeam, addToast]);

  // ---- Character count for import textarea ---------------------------------

  const charCount = importText.length;

  // ---- No teams state for export tab ---------------------------------------

  const hasTeams = teams.length > 0;

  // ---- Render --------------------------------------------------------------

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Toast notifications */}
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>

      <PageHeader title="Import / Export" />

      {/* Tab Switcher */}
      <div className="sticky z-30 top-[56px] bg-bg-primary/95 backdrop-blur-xl border-b border-border-subtle">
        <div className="relative grid grid-cols-2">
          <motion.div
            className="pointer-events-none absolute bottom-0 h-0.5 bg-accent-primary"
            animate={{ left: activeTab === 'import' ? '0%' : '50%' }}
            style={{ width: '50%' }}
            transition={springSnappy}
          />

          {(['import', 'export'] as TabId[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setImportError(null);
              }}
              className={`flex h-[48px] items-center justify-center font-body-medium capitalize transition-colors ${
                activeTab === tab ? 'text-accent-primary' : 'text-text-secondary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 pb-24">
        <AnimatePresence>
          {/* ====== IMPORT TAB ====== */}
          {activeTab === 'import' && (
            <motion.div
              key="import"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={transitionFast}
              className="flex flex-col gap-4"
            >
              {/* Import Text Area */}
              <div>
                <label className="font-body-medium text-text-secondary mb-2 block">
                  Paste Pokemon Showdown team format:
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    if (importError) setImportError(null);
                  }}
                  placeholder={`Paste Pokemon Showdown team format here...\n\nExample:\nCharizard @ Choice Specs\nAbility: Blaze\nEVs: 252 SpA / 4 HP / 252 Spe\nModest Nature\n- Flamethrower`}
                  className={`w-full min-h-[200px] max-h-[400px] p-3 rounded-card-md bg-bg-tertiary border font-jetbrains-mono text-[13px] text-text-primary placeholder:text-text-tertiary resize-y outline-none transition-colors ${
                    importError
                      ? 'border-danger'
                      : 'border-border-subtle focus:border-accent-primary/50'
                  }`}
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="font-caption text-text-tertiary">
                    Characters: {charCount}
                  </span>
                  {importError && (
                    <span className="font-caption text-danger">{importError}</span>
                  )}
                </div>
              </div>

              {/* Paste from Clipboard Button */}
              <button
                onClick={handlePasteFromClipboard}
                className="flex items-center justify-center gap-2 h-[48px] w-full rounded-card-md bg-bg-secondary border border-border-subtle font-body-medium text-text-primary active:scale-[0.97] transition-transform"
              >
                <ClipboardPaste size={20} className="text-accent-primary" />
                Paste from Clipboard
              </button>

              {/* Import Button */}
              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className={`flex items-center justify-center h-[48px] w-full rounded-card-md font-body-medium transition-colors ${
                  importText.trim()
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-elevated text-text-tertiary'
                }`}
              >
                Import Team
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-border-subtle" />
                <span className="font-caption text-text-tertiary">or choose a sample team</span>
                <div className="flex-1 h-px bg-border-subtle" />
              </div>

              {/* Sample Teams */}
              <div className="flex flex-col gap-3">
                <h3 className="font-subtitle text-text-primary">Sample Teams</h3>
                {SAMPLE_TEAMS.map((sample, i) => (
                  <motion.button
                    key={sample.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.08,
                      duration: 0.3,
                      ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleImportSample(sample.psFormat)}
                    className="flex items-start gap-4 w-full p-4 rounded-card bg-bg-secondary border border-border-subtle text-left"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-card-md bg-bg-tertiary flex items-center justify-center">
                      <sample.icon size={24} className="text-accent-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-subtitle text-text-primary mb-1">{sample.name}</h4>
                      <p className="font-caption text-text-secondary">{sample.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ====== EXPORT TAB ====== */}
          {activeTab === 'export' && (
            <motion.div
              key="export"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={transitionFast}
              className="flex flex-col gap-4"
            >
              {!hasTeams ? (
                <div className="flex flex-col items-center justify-center text-center py-16">
                  <Download size={64} className="text-text-tertiary mb-4" />
                  <h2 className="font-headline text-text-primary mb-2">No Teams to Export</h2>
                  <p className="font-body text-text-secondary max-w-[280px]">
                    Create or import a team first before exporting.
                  </p>
                </div>
              ) : (
                <>
                  {/* Team Selector */}
                  <div>
                    <label className="font-body-medium text-text-secondary mb-2 block">
                      Select Team
                    </label>
                    <div className="relative">
                      <select
                        value={selectedTeamId}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                        className="w-full h-[48px] px-4 pr-10 rounded-card-md bg-bg-tertiary border border-border-subtle font-body text-text-primary appearance-none outline-none focus:border-accent-primary/50"
                      >
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name} ({team.format})
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={20}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Export Preview */}
                  {selectedTeam && (
                    <div>
                      <label className="font-body-medium text-text-secondary mb-2 block">
                        Export Preview
                      </label>
                      <textarea
                        value={exportText}
                        readOnly
                        className="w-full min-h-[240px] p-3 rounded-card-md bg-bg-tertiary border border-border-subtle font-jetbrains-mono text-[13px] text-text-primary resize-y outline-none"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {/* Copy to Clipboard */}
                    <button
                      onClick={handleCopyToClipboard}
                      disabled={!exportText}
                      className="flex items-center justify-center gap-2 h-[48px] w-full rounded-card-md bg-bg-secondary border border-border-subtle font-body-medium text-text-primary active:scale-[0.97] transition-transform disabled:opacity-50"
                    >
                      {copied ? (
                        <>
                          <Check size={20} className="text-success" />
                          <span className="text-success">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={20} className="text-accent-primary" />
                          Copy human-readable paste
                        </>
                      )}
                    </button>

                    {/* Copy Share Link */}
                    <button
                      onClick={handleCopyShareLink}
                      disabled={!selectedTeam || selectedTeam.pokemon.length === 0}
                      className="flex items-center justify-center gap-2 h-[48px] w-full rounded-card-md bg-bg-secondary border border-border-subtle font-body-medium text-text-primary active:scale-[0.97] transition-transform disabled:opacity-50"
                    >
                      {shareLinkCopied ? (
                        <>
                          <Check size={20} className="text-success" />
                          <span className="text-success">Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 size={20} className="text-accent-secondary" />
                          Copy Share Link (URL)
                        </>
                      )}
                    </button>

                    {/* Share */}
                    <button
                      onClick={handleShare}
                      disabled={!exportText}
                      className="flex items-center justify-center gap-2 h-[48px] w-full rounded-card-md bg-bg-secondary border border-border-subtle font-body-medium text-text-primary active:scale-[0.97] transition-transform disabled:opacity-50"
                    >
                      <Share2 size={20} className="text-accent-secondary" />
                      Share
                    </button>

                    {/* Download */}
                    <button
                      onClick={handleDownload}
                      disabled={!exportText}
                      className="flex items-center justify-center gap-2 h-[48px] w-full rounded-card-md bg-bg-secondary border border-border-subtle font-body-medium text-text-primary active:scale-[0.97] transition-transform disabled:opacity-50"
                    >
                      <Download size={20} className="text-accent-primary" />
                      Download as .txt
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
