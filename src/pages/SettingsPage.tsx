// ============================================================================
// PocketForge — Settings Page
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Moon,
  Sun,
  Gamepad2,
  Download,
  Upload,
  Trash2,
  Info,
  Globe,
  Heart,
  WifiOff,
  ChevronRight,
  X,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { FORMATS, getFormatById } from '../data/formatsData';

const easeSmooth = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

// ---- Toggle Switch Component -----------------------------------------------

function ToggleSwitch({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-[52px] h-[28px] rounded-full transition-colors duration-200 shrink-0"
      style={{ backgroundColor: value ? '#3B82F6' : '#1E293B' }}
    >
      <motion.div
        className="absolute top-[2px] w-6 h-6 rounded-full bg-white shadow-md"
        animate={{ left: value ? 26 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

// ---- Settings Row Component ------------------------------------------------

function SettingsRow({
  icon: Icon,
  iconColor,
  label,
  subtitle,
  rightElement,
  onClick,
  danger,
  disabled,
}: {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center w-full h-14 px-4 text-left transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'active:bg-bg-tertiary'
      } ${danger ? 'border-l-[3px] border-l-danger/50' : ''}`}
    >
      <Icon size={22} style={{ color: iconColor }} className="shrink-0 mr-3" />
      <div className="flex-1 min-w-0">
        <span className={`text-sm block ${danger ? 'text-danger' : 'text-text-primary'}`}>
          {label}
        </span>
        {subtitle && <span className="text-[11px] text-text-secondary">{subtitle}</span>}
      </div>
      {rightElement && <div className="shrink-0 ml-2">{rightElement}</div>}
    </button>
  );
}

// ---- Section Header --------------------------------------------------------

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider px-4 pt-6 pb-2">
      {title}
    </h3>
  );
}

// ---- Bottom Sheet Component ------------------------------------------------

function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary rounded-t-3xl max-h-[80vh] overflow-y-auto"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-9 h-1 rounded-full bg-text-tertiary" />
            </div>
            <div className="px-4 pb-4">
              <h2 className="font-headline text-text-primary mb-4">{title}</h2>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ---- Format Picker Sheet ---------------------------------------------------

function FormatPickerSheet({
  isOpen,
  onClose,
  selectedFormat,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedFormat: string;
  onSelect: (formatId: string) => void;
}) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) setSearch('');
  }, [isOpen]);

  const filteredFormats = search
    ? FORMATS.filter(
        (f) =>
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          f.id.toLowerCase().includes(search.toLowerCase())
      )
    : FORMATS;

  const grouped = filteredFormats.reduce<Record<number, typeof FORMATS>>((acc, f) => {
    if (!acc[f.generation]) acc[f.generation] = [];
    acc[f.generation].push(f);
    return acc;
  }, {});

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Select Format">
      {/* Search */}
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Search formats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 px-4 pr-10 bg-bg-tertiary rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X size={16} className="text-text-tertiary" />
          </button>
        )}
      </div>

      {/* Format list grouped by generation */}
      <div className="space-y-4">
        {Object.entries(grouped)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([gen, formats]) => (
            <div key={gen}>
              <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
                Gen {gen}
              </span>
              <div className="mt-1 space-y-0.5">
                {formats.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      onSelect(f.id);
                      onClose();
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-left ${
                      selectedFormat === f.id
                        ? 'bg-accent-primary/10'
                        : 'hover:bg-bg-tertiary'
                    }`}
                  >
                    <span
                      className={`text-sm ${
                        selectedFormat === f.id
                          ? 'text-accent-primary font-medium'
                          : 'text-text-primary'
                      }`}
                    >
                      {f.name}
                    </span>
                    {selectedFormat === f.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
      </div>

      <button
        onClick={onClose}
        className="w-full h-12 mt-4 bg-bg-tertiary rounded-xl text-sm text-text-secondary font-medium touch-target"
      >
        Cancel
      </button>
    </BottomSheet>
  );
}

// ---- Clear Data Confirmation Dialog ----------------------------------------

function ClearDataDialog({
  isOpen,
  onClose,
  onConfirm,
  teamCount,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  teamCount: number;
}) {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmed = confirmText === 'DELETE';

  useEffect(() => {
    if (isOpen) setConfirmText('');
  }, [isOpen]);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Clear All Data?">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={22} className="text-warning shrink-0 mt-0.5" />
          <p className="text-sm text-text-primary leading-relaxed">
            This will permanently delete all your teams and settings. This action cannot be undone.
          </p>
        </div>

        <div className="bg-bg-tertiary rounded-xl p-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Teams</span>
            <span className="text-text-primary font-jetbrains-mono">{teamCount}</span>
          </div>
        </div>

        {/* Type-to-confirm */}
        <div>
          <label className="text-[11px] text-text-secondary block mb-1.5">
            Type "DELETE" to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full h-12 px-4 bg-bg-tertiary rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-danger/50 border border-border-subtle"
          />
        </div>

        {/* Delete button */}
        <button
          onClick={onConfirm}
          disabled={!isConfirmed}
          className={`w-full h-12 rounded-xl text-sm font-medium touch-target transition-colors ${
            isConfirmed
              ? 'bg-danger text-white'
              : 'bg-danger/20 text-danger/50 cursor-not-allowed'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Trash2 size={16} />
            Permanently Delete Everything
          </span>
        </button>

        <button
          onClick={onClose}
          className="w-full h-12 bg-bg-tertiary rounded-xl text-sm text-text-secondary font-medium touch-target"
        >
          Cancel
        </button>
      </div>
    </BottomSheet>
  );
}

// ---- Data Attribution Modal ------------------------------------------------

function AttributionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Data Attribution">
      <div className="space-y-3 text-sm text-text-primary">
        <p>Pokemon data powered by:</p>
        <ul className="space-y-1.5 list-disc list-inside text-text-secondary">
          <li>Smogon University</li>
          <li>Pokemon Showdown</li>
          <li>PokeAPI</li>
        </ul>
        <p className="text-text-secondary">Sprites from Pokemon Showdown CDN</p>
        <p className="text-text-secondary">Type icons from Smogon</p>
        <p className="text-[11px] text-text-tertiary pt-2 border-t border-border-subtle">
          Pokemon is a trademark of Nintendo/Creatures Inc./GAME FREAK inc.
          This is an unofficial fan project.
        </p>
      </div>
      <button
        onClick={onClose}
        className="w-full h-12 mt-4 bg-bg-tertiary rounded-xl text-sm text-text-secondary font-medium touch-target"
      >
        Close
      </button>
    </BottomSheet>
  );
}

// ---- Credits Modal ---------------------------------------------------------

function CreditsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Credits">
      <div className="space-y-3 text-sm text-text-primary">
        <p className="font-medium">PocketForge Teambuilder</p>
        <p className="text-text-secondary">
          A personal project for competitive Pokemon team building.
        </p>
        <p className="text-text-primary pt-1">Made with:</p>
        <ul className="space-y-1 list-disc list-inside text-text-secondary">
          <li>React + TypeScript</li>
          <li>Tailwind CSS</li>
          <li>Framer Motion</li>
          <li>Love for Pokemon</li>
        </ul>
      </div>
      <button
        onClick={onClose}
        className="w-full h-12 mt-4 bg-bg-tertiary rounded-xl text-sm text-text-secondary font-medium touch-target"
      >
        Close
      </button>
    </BottomSheet>
  );
}

// ---- Storage Bar Component -------------------------------------------------

function StorageBar() {
  const [usage, setUsage] = useState(0);

  useEffect(() => {
    // Calculate localStorage usage
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage.getItem(key)?.length || 0;
      }
    }
    // Approximate bytes (2 bytes per char)
    const bytes = total * 2;
    // localStorage limit is typically ~5MB
    const limit = 5 * 1024 * 1024;
    setUsage((bytes / limit) * 100);
  }, []);

  const mbUsed = ((usage / 100) * 5).toFixed(1);

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-text-primary">Storage Used</span>
        <span className="text-sm text-text-secondary font-jetbrains-mono">{mbUsed} MB</span>
      </div>
      <div className="w-full h-1 bg-bg-elevated rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-accent-primary"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(usage, 100)}%` }}
          transition={{ duration: 0.8, ease: easeSmooth }}
        />
      </div>
    </div>
  );
}

// ---- Main Settings Page ----------------------------------------------------

export default function SettingsPage() {
  const navigate = useNavigate();
  const settings = useStore((s) => s.settings);
  const teams = useStore((s) => s.teams);
  const customFormats = useStore((s) => s.customFormats);
  const updateSettings = useStore((s) => s.updateSettings);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Sheet/modal states
  const [formatSheetOpen, setFormatSheetOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [attributionOpen, setAttributionOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  // Export state
  const [exportMessage, setExportMessage] = useState('');

  // Theme
  const isDark = settings.theme === 'dark';

  // Default format display name
  const currentFormat = getFormatById(settings.defaultFormat);
  const formatDisplayName = currentFormat?.name || settings.defaultFormat;

  // Online status listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Hide offline toast after 3s
  useEffect(() => {
    if (showOfflineToast) {
      const t = setTimeout(() => setShowOfflineToast(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showOfflineToast]);

  // Export all teams
  const handleExport = useCallback(() => {
    if (teams.length === 0) {
      setExportMessage('No teams to export!');
      setTimeout(() => setExportMessage(''), 2000);
      return;
    }
    const data = JSON.stringify(teams, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pocketforge-teams.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportMessage('Teams exported!');
    setTimeout(() => setExportMessage(''), 2000);
  }, [teams]);

  // Import teams
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (Array.isArray(data)) {
            // Import array of teams
            for (const team of data) {
              useStore.getState().importTeam(team);
            }
            setExportMessage(`${data.length} teams imported!`);
          } else if (data && typeof data === 'object') {
            // Single team
            useStore.getState().importTeam(data);
            setExportMessage('Team imported!');
          }
        } catch {
          setExportMessage('Invalid file format');
        }
        setTimeout(() => setExportMessage(''), 2000);
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  // Clear all data
  const handleClearAll = useCallback(() => {
    localStorage.removeItem('pocketforge-storage');
    window.location.reload();
  }, []);

  return (
    <div className="min-h-[100dvh] px-4 pb-8">
      {/* Top App Bar */}
      <div className="flex items-center h-14 -mx-4 px-4 border-b border-border-subtle mb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 -ml-2 touch-target"
        >
          <ChevronLeft size={24} className="text-text-primary" />
        </button>
        <h1 className="font-title text-text-primary ml-1">Settings</h1>
      </div>

      {/* Offline Indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 bg-warning/10 border border-warning/30 rounded-xl px-3 py-2.5 mb-3"
          >
            <WifiOff size={16} className="text-warning shrink-0" />
            <span className="text-[12px] text-warning">
              Working offline — teams saved locally
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast messages */}
      <AnimatePresence>
        {exportMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/30 rounded-xl px-3 py-2.5 mb-3"
          >
            <Info size={16} className="text-accent-primary shrink-0" />
            <span className="text-[12px] text-accent-primary">{exportMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: easeSmooth }}
      >
        {/* Appearance Section */}
        <SectionHeader title="Appearance" />
        <div className="bg-bg-secondary rounded-2xl border border-border-subtle overflow-hidden">
          <SettingsRow
            icon={isDark ? Moon : Sun}
            iconColor="#94A3B8"
            label="Theme"
            subtitle={isDark ? 'Dark mode' : 'Light mode'}
            rightElement={
              <div className="flex items-center gap-2">
                <Sun size={14} className={!isDark ? 'text-accent-primary' : 'text-text-tertiary'} />
                <ToggleSwitch
                  value={isDark}
                  onChange={(v) => updateSettings({ theme: v ? 'dark' : 'light' })}
                />
                <Moon size={14} className={isDark ? 'text-accent-secondary' : 'text-text-tertiary'} />
              </div>
            }
          />
        </div>

        {/* Team Defaults Section */}
        <SectionHeader title="Team Defaults" />
        <div className="bg-bg-secondary rounded-2xl border border-border-subtle overflow-hidden">
          <SettingsRow
            icon={Gamepad2}
            iconColor="#3B82F6"
            label="Default Format"
            subtitle="Format for new teams"
            rightElement={
              <div className="flex items-center gap-1">
                <span className="text-sm text-text-secondary">{formatDisplayName}</span>
                <ChevronRight size={16} className="text-text-tertiary" />
              </div>
            }
            onClick={() => setFormatSheetOpen(true)}
          />
        </div>

        {/* Custom Formats Section */}
        <SectionHeader title="Custom Formats" />
        <div className="bg-bg-secondary rounded-2xl border border-border-subtle overflow-hidden">
          <SettingsRow
            icon={Sparkles}
            iconColor="#EAB308"
            label="Manage Custom Formats"
            subtitle={`${customFormats.length} format${customFormats.length !== 1 ? 's' : ''} created`}
            rightElement={<ChevronRight size={16} className="text-text-tertiary" />}
            onClick={() => navigate('/custom-formats')}
          />
        </div>

        {/* Data Management Section */}
        <SectionHeader title="Data Management" />
        <div className="bg-bg-secondary rounded-2xl border border-border-subtle overflow-hidden">
          <SettingsRow
            icon={Download}
            iconColor="#3B82F6"
            label="Export All Teams"
            subtitle="Download as JSON file"
            rightElement={<ChevronRight size={16} className="text-text-tertiary" />}
            onClick={handleExport}
            disabled={teams.length === 0}
          />
          <div className="h-px bg-border-subtle mx-4" />
          <SettingsRow
            icon={Upload}
            iconColor="#06B6D4"
            label="Import Teams from File"
            subtitle="JSON or backup file"
            rightElement={<ChevronRight size={16} className="text-text-tertiary" />}
            onClick={handleImport}
          />
          <div className="h-px bg-border-subtle mx-4" />
          <SettingsRow
            icon={Trash2}
            iconColor="#EF4444"
            label="Clear All Data"
            subtitle="Delete all teams and settings"
            danger
            onClick={() => setClearDialogOpen(true)}
          />
          <div className="h-px bg-border-subtle mx-4" />
          <StorageBar />
        </div>

        {/* About Section */}
        <SectionHeader title="About" />
        <div className="bg-bg-secondary rounded-2xl border border-border-subtle overflow-hidden">
          <SettingsRow
            icon={Info}
            iconColor="#94A3B8"
            label="Version"
            rightElement={<span className="text-sm text-text-secondary">1.0.0</span>}
          />
          <div className="h-px bg-border-subtle mx-4" />
          <SettingsRow
            icon={Globe}
            iconColor="#06B6D4"
            label="Pokemon data from"
            rightElement={
              <div className="flex items-center gap-1">
                <span className="text-sm text-text-secondary">Smogon</span>
                <ChevronRight size={16} className="text-text-tertiary" />
              </div>
            }
            onClick={() => setAttributionOpen(true)}
          />
          <div className="h-px bg-border-subtle mx-4" />
          <SettingsRow
            icon={Heart}
            iconColor="#EF4444"
            label="Built with love"
            rightElement={
              <div className="flex items-center gap-1">
                <span className="text-sm text-text-secondary">by Team</span>
                <ChevronRight size={16} className="text-text-tertiary" />                                                                                                                                                                                         
              </div>
            }
            onClick={() => setCreditsOpen(true)}
          />
        </div>

        {/* Legal Notice */}
        <p className="text-[10px] text-text-tertiary text-center mt-6 leading-relaxed px-4">
          Pokemon and all related data are trademarks of Nintendo/Creatures Inc./GAME FREAK inc.
          PocketForge is an unofficial fan project for personal use.
        </p>
      </motion.div>

      {/* Sheets & Modals */}
      <FormatPickerSheet
        isOpen={formatSheetOpen}
        onClose={() => setFormatSheetOpen(false)}
        selectedFormat={settings.defaultFormat}
        onSelect={(id) => updateSettings({ defaultFormat: id })}
      />

      <ClearDataDialog
        isOpen={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        onConfirm={handleClearAll}
        teamCount={teams.length}
      />

      <AttributionModal
        isOpen={attributionOpen}
        onClose={() => setAttributionOpen(false)}
      />

      <CreditsModal
        isOpen={creditsOpen}
        onClose={() => setCreditsOpen(false)}
      />
    </div>
  );
}
