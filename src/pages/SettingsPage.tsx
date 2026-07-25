// ============================================================================
// PocketForge — Settings Page
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import BottomSheet from '../components/BottomSheet';
import PageHeader from '../components/PageHeader';
import { useStore } from '../store/useStore';
import { FORMATS, getFormatById } from '../data/formatsData';
import { CHAMPIONS_META } from '../data/championsLegality';

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

  if (!isOpen) return null;

  const filteredFormats = search
    ? FORMATS.filter(
        (f) =>
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          f.id.toLowerCase().includes(search.toLowerCase())
      )
    : FORMATS;

  const grouped = filteredFormats.reduce<Record<string, typeof FORMATS>>((acc, f) => {
    const key = f.generation === 10 ? 'Champions' : `Gen ${f.generation}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {});

  const groupOrder = (key: string) => {
    if (key === 'Champions') return 1000;
    const n = parseInt(key.replace('Gen ', ''), 10);
    return Number.isNaN(n) ? 0 : n;
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Select Format"
      searchPlaceholder="Search formats..."
      onSearch={setSearch}
    >
      {/* Format list grouped by generation */}
      <div className="space-y-4">
        {Object.entries(grouped)
          .sort(([a], [b]) => groupOrder(b) - groupOrder(a))
          .map(([group, formats]) => (
            <div key={group}>
              <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
                {group}
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

  if (!isOpen) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Clear All Data?" showSearch={false}>
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
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Data Attribution" showSearch={false}>
      <div className="space-y-3 text-sm text-text-primary">
        <p>Pokemon data powered by:</p>
        <ul className="space-y-1.5 list-disc list-inside text-text-secondary">
          <li>Smogon University</li>
          <li>Pokemon Showdown</li>
          <li>Showdown Champions mod ({CHAMPIONS_META.showdownFormat})</li>
        </ul>
        <p className="text-text-secondary">
          Champions regulation data last synced {new Date(CHAMPIONS_META.updatedAt).toLocaleDateString()}.
        </p>
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
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Credits" showSearch={false}>
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
  const [usage] = useState(() => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        total += localStorage.getItem(key)?.length || 0;
      }
    }
    const bytes = total * 2;
    const limit = 5 * 1024 * 1024;
    return (bytes / limit) * 100;
  });

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

  // Export Full Backup
  const handleExportAllData = useCallback(() => {
    const pfStorage = localStorage.getItem('pocketforge-storage');
    const nuzlockeStorage = localStorage.getItem('pocketforge-nuzlocke-storage');
    const fullBackup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      store: pfStorage ? JSON.parse(pfStorage) : null,
      nuzlocke: nuzlockeStorage ? JSON.parse(nuzlockeStorage) : null,
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pocketforge-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMessage('Full App Backup downloaded successfully!');
    setTimeout(() => setExportMessage(''), 3000);
  }, []);

  // Import Full Backup
  const handleImportAllData = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.store) {
          localStorage.setItem('pocketforge-storage', typeof json.store === 'string' ? json.store : JSON.stringify(json.store));
        }
        if (json.nuzlocke) {
          localStorage.setItem('pocketforge-nuzlocke-storage', typeof json.nuzlocke === 'string' ? json.nuzlocke : JSON.stringify(json.nuzlocke));
        }
        setExportMessage('Backup restored! Reloading app...');
        setTimeout(() => window.location.reload(), 1200);
      } catch {
        setExportMessage('Invalid backup JSON file.');
        setTimeout(() => setExportMessage(''), 3000);
      }
    };
    reader.readAsText(file);
  }, []);

  // Clear all data
  const handleClearAll = useCallback(() => {
    localStorage.removeItem('pocketforge-storage');
    localStorage.removeItem('pocketforge-nuzlocke-storage');
    window.location.reload();
  }, []);

  // Force update Service Worker & clear precache storage
  const handleForceUpdateCache = useCallback(async () => {
    setExportMessage('Clearing app caches and checking for updates...');
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
    } catch (e) {
      console.warn('Cache clearing error:', e);
    }
    window.location.reload();
  }, []);

  return (
    <div className="min-h-[100dvh] px-4 pb-8">
      <div className="-mx-4 mb-2">
        <PageHeader title="Settings" />
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
            subtitle="Download teams as JSON file"
            rightElement={<ChevronRight size={16} className="text-text-tertiary" />}
            onClick={handleExport}
            disabled={teams.length === 0}
          />
          <div className="h-px bg-border-subtle mx-4" />
          <SettingsRow
            icon={Download}
            iconColor="#8B5CF6"
            label="Full App Backup"
            subtitle="Export teams, custom formats & Nuzlocke runs"
            rightElement={<ChevronRight size={16} className="text-text-tertiary" />}
            onClick={handleExportAllData}
          />
          <div className="h-px bg-border-subtle mx-4" />
          <SettingsRow
            icon={Upload}
            iconColor="#06B6D4"
            label="Import Teams from File"
            subtitle="JSON team file"
            rightElement={<ChevronRight size={16} className="text-text-tertiary" />}
            onClick={handleImport}
          />
          <div className="h-px bg-border-subtle mx-4" />
          <SettingsRow
            icon={Upload}
            iconColor="#10B981"
            label="Restore Full Backup"
            subtitle="Restore teams & Nuzlocke runs (.json)"
            rightElement={
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportAllData}
                />
                <ChevronRight size={16} className="text-text-tertiary" />
              </label>
            }
          />
          <div className="h-px bg-border-subtle mx-4" />
          <SettingsRow
            icon={Sparkles}
            iconColor="#EAB308"
            label="Check for Updates & Clear Cache"
            subtitle="Force refresh Service Worker and app cache"
            rightElement={<ChevronRight size={16} className="text-text-tertiary" />}
            onClick={handleForceUpdateCache}
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
            icon={WifiOff}
            iconColor="#22C55E"
            label="Offline ready"
            subtitle="Install from browser menu for full PWA"
          />
          <div className="h-px bg-border-subtle mx-4" />
          <SettingsRow
            icon={Gamepad2}
            iconColor="#F59E0B"
            label="Champions regulation"
            rightElement={
              <span className="text-sm text-text-secondary">{CHAMPIONS_META.regulationName}</span>
            }
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
