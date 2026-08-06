// ============================================================================
// PocketForge — Settings Page
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
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
  SlidersHorizontal,
  Wrench,
  BarChart3,
  Calculator,
  Shield,
  Zap,
  Search,
  Share2,
  HeartPulse,
  TrendingUp,
  FolderOpen,
  Bot,
  Key,
  Eye,
  EyeOff,
  MessageCircle,
} from 'lucide-react';
import BottomSheet from '../components/BottomSheet';
import PageHeader from '../components/PageHeader';
import ChatSheet from '../components/ai/ChatSheet';
import type { AppSettings } from '../types';
import { useStore } from '../store/useStore';
import { useNuzlockeStore } from '../store/useNuzlockeStore';
import { FORMATS, getFormatById } from '../data/formatsData';
import { CHAMPIONS_META } from '../data/championsLegality';
import { CHAMPIONS_USAGE_META } from '../data/championsUsageRankings';
import { checkForAppUpdate } from '../lib/pwaUpdate';
import { isNativeApp } from '../lib/platform';
import {
  APP_STORAGE_KEY,
  LEGACY_NUZLOCKE_STORAGE_KEYS,
  NUZLOCKE_STORAGE_KEY,
} from '../lib/storage';

const easeSmooth = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

type SettingsTab = 'preferences' | 'features';

interface FeatureDefinition {
  title: string;
  description: string;
  category: 'Build' | 'Analyze' | 'Tools';
  icon: React.ElementType;
  color: string;
  path?: string;
  badge?: string;
}

const FEATURES: FeatureDefinition[] = [
  {
    title: 'Team Library',
    description: 'Create, search, filter, duplicate, organize, and export teams from one home screen.',
    category: 'Build',
    icon: FolderOpen,
    color: '#3B82F6',
    path: '/teams',
  },
  {
    title: 'Team Builder',
    description: 'Configure species, moves, items, abilities, natures, levels, EVs, IVs, Tera types, and Mega Evolution.',
    category: 'Build',
    icon: Wrench,
    color: '#8B5CF6',
    path: '/builder',
  },
  {
    title: 'Champions Ranked Insights',
    description: 'See current Doubles rank plus popular moves, items, teammates, abilities, and natures inside the editor.',
    category: 'Build',
    icon: TrendingUp,
    color: '#06B6D4',
    path: '/builder',
    badge: 'New',
  },
  {
    title: 'Custom Formats',
    description: 'Create reusable rulesets and restricted rosters for teams outside the built-in formats.',
    category: 'Build',
    icon: SlidersHorizontal,
    color: '#EAB308',
    path: '/custom-formats',
  },
  {
    title: 'Team Analysis',
    description: 'Review team score, offensive coverage, defensive synergy, roles, speed benchmarks, EV plans, and suggestions.',
    category: 'Analyze',
    icon: BarChart3,
    color: '#22C55E',
    path: '/analysis',
    badge: 'Updated',
  },
  {
    title: 'Weakness Analyzer',
    description: 'Find shared weaknesses and see which teammates resist or are immune to each attacking type.',
    category: 'Analyze',
    icon: Shield,
    color: '#EF4444',
    path: '/weakness-analyzer',
  },
  {
    title: 'Speed Tiers',
    description: 'Compare calculated Speed across a team and common benchmark conditions.',
    category: 'Analyze',
    icon: Zap,
    color: '#EC4899',
    path: '/speed-tiers',
  },
  {
    title: 'Damage Calculator',
    description: 'Calculate damage ranges with levels, EVs, IVs, items, abilities, weather, terrain, screens, and field effects.',
    category: 'Tools',
    icon: Calculator,
    color: '#10B981',
    path: '/calc',
  },
  {
    title: 'Movepool Explorer',
    description: 'Search legal moves and acquisition methods, including inherited pre-evolution moves.',
    category: 'Tools',
    icon: Search,
    color: '#F59E0B',
    path: '/movepool',
  },
  {
    title: 'Import, Export & Share',
    description: 'Move teams between PocketForge and Pokémon Showdown, download backups, or generate share links.',
    category: 'Tools',
    icon: Share2,
    color: '#14B8A6',
    path: '/import-export',
  },
  {
    title: 'Nuzlocke Tracker',
    description: 'Track runs, routes, encounters, party status, deaths, and game progress separately from competitive teams.',
    category: 'Tools',
    icon: HeartPulse,
    color: '#F43F5E',
    path: '/nuzlocke',
  },
  {
    title: 'Offline PWA & Updates',
    description: 'Install PocketForge, work offline, and receive new deployments without uninstalling or clearing saved data.',
    category: 'Tools',
    icon: WifiOff,
    color: '#22C55E',
    badge: 'Automatic',
  },
  {
    title: 'AI Assistant',
    description: 'Chat about your team, get coaching, and run quick damage or speed checks — grounded in the same calculators as the rest of the app, via Ollama Cloud.',
    category: 'Tools',
    icon: Bot,
    color: '#8B5CF6',
    badge: 'New',
  },
];

// ---- Toggle Switch Component -----------------------------------------------

function ToggleSwitch({
  value,
  onChange,
  label = 'Toggle dark mode',
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
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
  const content = (
    <>
      <Icon size={22} style={{ color: iconColor }} className="shrink-0 mr-3" />
      <div className="flex-1 min-w-0">
        <span className={`text-sm block ${danger ? 'text-danger' : 'text-text-primary'}`}>
          {label}
        </span>
        {subtitle && <span className="text-[11px] text-text-secondary">{subtitle}</span>}
      </div>
      {rightElement && <div className="shrink-0 ml-2">{rightElement}</div>}
    </>
  );
  const className = `flex items-center w-full h-14 px-4 text-left transition-colors ${
    disabled ? 'opacity-50 cursor-not-allowed' : onClick ? 'active:bg-bg-tertiary' : ''
  } ${danger ? 'border-l-[3px] border-l-danger/50' : ''}`;

  if (!onClick) {
    return <div className={className}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {content}
    </button>
  );
}

// ---- Section Header --------------------------------------------------------

function SectionHeader({ title, id }: { title: string; id?: string }) {
  return (
    <h3
      id={id}
      className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider px-4 pt-6 pb-2"
    >
      {title}
    </h3>
  );
}

function FeaturesPanel({ onOpen }: { onOpen: (path: string) => void }) {
  const categories: FeatureDefinition['category'][] = ['Build', 'Analyze', 'Tools'];

  return (
    <motion.div
      key="features"
      id="settings-features-panel"
      role="tabpanel"
      aria-labelledby="settings-features-tab"
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.2, ease: easeSmooth }}
    >
      <div className="mt-4 rounded-2xl border border-accent-primary/20 bg-accent-primary/5 p-4">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-primary/15">
            <Sparkles size={20} className="text-accent-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-subtitle text-text-primary">Everything in PocketForge</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
              Choose a feature below to open it. Competitive snapshots and the app shell are bundled
              for GitHub Pages, so the core tools remain available offline.
            </p>
          </div>
        </div>
      </div>

      {categories.map((category) => (
        <section key={category} aria-labelledby={`features-${category.toLowerCase()}`}>
          <SectionHeader title={category} id={`features-${category.toLowerCase()}`} />
          <div className="grid gap-2 sm:grid-cols-2">
            {FEATURES.filter((feature) => feature.category === category).map((feature) => {
              const Icon = feature.icon;
              const content = (
                <>
                  <div
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                    style={{ backgroundColor: `${feature.color}18` }}
                  >
                    <Icon size={20} style={{ color: feature.color }} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-text-primary">{feature.title}</h3>
                      {feature.badge && (
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                          style={{ color: feature.color, backgroundColor: `${feature.color}18` }}
                        >
                          {feature.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
                      {feature.description}
                    </p>
                  </div>
                  {feature.path && (
                    <ChevronRight size={17} className="shrink-0 text-text-tertiary" aria-hidden="true" />
                  )}
                </>
              );

              return feature.path ? (
                <button
                  key={feature.title}
                  type="button"
                  onClick={() => onOpen(feature.path!)}
                  className="flex min-h-24 items-start gap-3 rounded-2xl border border-border-subtle bg-bg-secondary p-3 text-left transition-colors active:bg-bg-tertiary"
                  aria-label={`Open ${feature.title}`}
                >
                  {content}
                </button>
              ) : (
                <div
                  key={feature.title}
                  className="flex min-h-24 items-start gap-3 rounded-2xl border border-border-subtle bg-bg-secondary p-3"
                >
                  {content}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <p className="mt-6 px-4 text-center text-[10px] leading-relaxed text-text-tertiary">
        Ranked data is a community snapshot, not a live win-rate feed. Team recommendations are
        decision support and should be reviewed for your format and strategy.
      </p>
    </motion.div>
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
  nuzlockeRunCount,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  teamCount: number;
  nuzlockeRunCount: number;
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
            This will permanently delete all teams, custom formats, settings, and Nuzlocke runs.
            This action cannot be undone.
          </p>
        </div>

        <div className="bg-bg-tertiary rounded-xl p-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Teams</span>
            <span className="text-text-primary font-jetbrains-mono">{teamCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Nuzlocke runs</span>
            <span className="text-text-primary font-jetbrains-mono">{nuzlockeRunCount}</span>
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

// ---- AI Assistant Settings Sheet -------------------------------------------

const QUICK_OLLAMA_MODELS = ['gemma4:cloud', 'gpt-oss:20b-cloud', 'qwen3.5:cloud'];

function AiAssistantSheet({
  isOpen,
  onClose,
  settings,
  updateSettings,
}: {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
}) {
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="AI Assistant" showSearch={false}>
      <div className="space-y-5">
        <p className="text-sm text-text-secondary leading-relaxed">
          Runs on <span className="text-text-primary">Ollama Cloud</span> — the model calls
          PocketForge's own calculators for damage, speed, and team analysis, so the numbers it
          gives you stay accurate. Requires an internet connection.
        </p>

        <div>
          <label className="text-[11px] text-text-secondary block mb-1.5">Ollama API key</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={settings.ollamaApiKey}
              onChange={(e) => updateSettings({ ollamaApiKey: e.target.value })}
              placeholder="Paste your key"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="w-full h-12 pl-4 pr-11 bg-bg-tertiary rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 border border-border-subtle font-jetbrains-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              aria-label={showKey ? 'Hide API key' : 'Show API key'}
              title={showKey ? 'Hide API key' : 'Show API key'}
              className="absolute right-3 top-1/2 -translate-y-1/2 touch-target text-text-tertiary"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-[11px] text-text-tertiary mt-1.5">
            Create one at ollama.com/settings/keys. It's stored only on this device and sent
            only to ollama.com.
          </p>
        </div>

        <div>
          <label className="text-[11px] text-text-secondary block mb-1.5">Cloud model</label>
          <input
            type="text"
            value={settings.ollamaModel}
            onChange={(e) => updateSettings({ ollamaModel: e.target.value })}
            placeholder="gemma4:cloud"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full h-12 px-4 bg-bg-tertiary rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 border border-border-subtle font-jetbrains-mono"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {QUICK_OLLAMA_MODELS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => updateSettings({ ollamaModel: tag })}
                className={`h-8 px-3 rounded-full text-[11px] font-jetbrains-mono border transition-colors touch-target ${
                  settings.ollamaModel === tag
                    ? 'bg-accent-primary/15 border-accent-primary/50 text-accent-primary'
                    : 'bg-bg-tertiary border-border-subtle text-text-secondary'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-12 rounded-xl text-sm font-medium bg-accent-primary text-white touch-target"
        >
          Done
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
          <li>
            {CHAMPIONS_USAGE_META.sourceName} ({CHAMPIONS_USAGE_META.format})
          </li>
        </ul>
        <p className="text-text-secondary">
          Champions regulation data last synced {new Date(CHAMPIONS_META.updatedAt).toLocaleDateString()}.
        </p>
        <p className="text-text-secondary">
          Ranked battle snapshot updated {new Date(CHAMPIONS_USAGE_META.sourceUpdatedAt).toLocaleDateString()}.
        </p>
        <p className="text-text-secondary">
          Competitive snapshots are bundled into PocketForge; using them does not open another site.
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
  const nuzlockeRunCount = useNuzlockeStore((s) => s.runs.length);
  const customFormats = useStore((s) => s.customFormats);
  const currentTeamId = useStore((s) => s.currentTeamId);
  const setCurrentTeam = useStore((s) => s.setCurrentTeam);
  const updateSettings = useStore((s) => s.updateSettings);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeTab, setActiveTab] = useState<SettingsTab>('preferences');

  // Sheet/modal states
  const [formatSheetOpen, setFormatSheetOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [attributionOpen, setAttributionOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [aiSheetOpen, setAiSheetOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  // Export state
  const [exportMessage, setExportMessage] = useState('');
  const restoreInputRef = useRef<HTMLInputElement>(null);

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
    const pfStorage = localStorage.getItem(APP_STORAGE_KEY);
    const nuzlockeStorage = localStorage.getItem(NUZLOCKE_STORAGE_KEY);
    const fullBackup = {
      version: 2,
      exportedAt: new Date().toISOString(),
      store: pfStorage,
      nuzlocke: nuzlockeStorage,
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
    const input = e.currentTarget;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const store = typeof json.store === 'string' ? JSON.parse(json.store) : json.store;
        const nuzlocke = typeof json.nuzlocke === 'string'
          ? JSON.parse(json.nuzlocke)
          : json.nuzlocke;

        if (!store || typeof store !== 'object' || !store.state) {
          throw new Error('Backup is missing PocketForge data');
        }

        localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(store));
        if (nuzlocke) {
          if (typeof nuzlocke !== 'object' || !nuzlocke.state) {
            throw new Error('Backup contains invalid Nuzlocke data');
          }
          localStorage.setItem(NUZLOCKE_STORAGE_KEY, JSON.stringify(nuzlocke));
        } else {
          localStorage.removeItem(NUZLOCKE_STORAGE_KEY);
        }
        for (const key of LEGACY_NUZLOCKE_STORAGE_KEYS) localStorage.removeItem(key);
        setExportMessage('Backup restored! Reloading app...');
        setTimeout(() => window.location.reload(), 1200);
      } catch {
        setExportMessage('Invalid backup JSON file.');
        setTimeout(() => setExportMessage(''), 3000);
      }
    };
    reader.onloadend = () => {
      input.value = '';
    };
    reader.readAsText(file);
  }, []);

  // Clear all data
  const handleClearAll = useCallback(() => {
    localStorage.removeItem(APP_STORAGE_KEY);
    localStorage.removeItem(NUZLOCKE_STORAGE_KEY);
    for (const key of LEGACY_NUZLOCKE_STORAGE_KEYS) localStorage.removeItem(key);
    window.location.reload();
  }, []);

  // Check the app-scoped Service Worker without deleting user data or origin caches.
  const handleForceUpdateCache = useCallback(async () => {
    setExportMessage('Checking for the latest app version...');
    try {
      const result = await checkForAppUpdate();
      if (result === 'updated') {
        setExportMessage('Update installed. Reloading...');
      } else if (result === 'current') {
        setExportMessage('PocketForge is already up to date.');
      } else if (result === 'offline') {
        setExportMessage('Connect to the internet to check for updates.');
      } else {
        setExportMessage('Updates are unavailable in this browser.');
      }
    } catch (e) {
      console.warn('App update check failed:', e);
      setExportMessage('Could not check for updates. Please try again.');
    }
    setTimeout(() => setExportMessage(''), 3000);
  }, []);

  const handleFeatureOpen = useCallback((path: string) => {
    const teamId = currentTeamId && teams.some((team) => team.id === currentTeamId)
      ? currentTeamId
      : teams[0]?.id;

    if (path === '/builder') {
      if (!teamId) {
        navigate('/teams');
        return;
      }
      setCurrentTeam(teamId);
      navigate(`/builder/${teamId}`);
      return;
    }

    if (path === '/analysis' && teamId) {
      setCurrentTeam(teamId);
      navigate(`/analysis/${teamId}`);
      return;
    }

    navigate(path);
  }, [currentTeamId, navigate, setCurrentTeam, teams]);

  return (
    <div className="min-h-[100dvh] px-4 pb-8">
      <div className="-mx-4 mb-2">
        <PageHeader title="Settings" />
      </div>

      <div
        className="mb-3 grid grid-cols-2 rounded-xl border border-border-subtle bg-bg-secondary p-1"
        role="tablist"
        aria-label="Settings sections"
      >
        {([
          { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
          { id: 'features', label: 'Features', icon: Sparkles },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`settings-${tab.id}-tab`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`settings-${tab.id}-panel`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex min-h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-secondary active:bg-bg-tertiary'
              }`}
            >
              <Icon size={16} aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
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

      <AnimatePresence mode="wait" initial={false}>
      {activeTab === 'features' ? (
        <FeaturesPanel onOpen={handleFeatureOpen} />
      ) : (
      <motion.div
        key="preferences"
        id="settings-preferences-panel"
        role="tabpanel"
        aria-labelledby="settings-preferences-tab"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 8 }}
        transition={{ duration: 0.2, ease: easeSmooth }}
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

        {/* AI Assistant Section */}
        <SectionHeader title="AI Assistant" />
        <div className="bg-bg-secondary rounded-2xl border border-border-subtle overflow-hidden">
          <SettingsRow
            icon={Bot}
            iconColor="#8B5CF6"
            label="Enable AI Assistant"
            subtitle="Chat and coaching via Ollama Cloud"
            rightElement={
              <ToggleSwitch
                value={settings.aiEnabled}
                onChange={(v) => updateSettings({ aiEnabled: v })}
                label="Toggle AI Assistant"
              />
            }
          />
          <div className="h-px bg-border-subtle mx-4" />
          <SettingsRow
            icon={Key}
            iconColor="#8B5CF6"
            label="API Key & Model"
            subtitle={settings.ollamaApiKey ? `Configured · ${settings.ollamaModel}` : 'Not configured'}
            rightElement={<ChevronRight size={16} className="text-text-tertiary" />}
            onClick={() => setAiSheetOpen(true)}
          />
          <div className="h-px bg-border-subtle mx-4" />
          <SettingsRow
            icon={MessageCircle}
            iconColor="#8B5CF6"
            label="Chat"
            subtitle={
              settings.aiEnabled && settings.ollamaApiKey
                ? 'Ask about your team'
                : 'Enable and add an API key first'
            }
            rightElement={<ChevronRight size={16} className="text-text-tertiary" />}
            onClick={() => setChatOpen(true)}
            disabled={!settings.aiEnabled || !settings.ollamaApiKey}
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
            rightElement={<ChevronRight size={16} className="text-text-tertiary" />}
            onClick={() => restoreInputRef.current?.click()}
          />
          <input
            ref={restoreInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportAllData}
          />
          {/* Service-worker updates only exist in the browser build; the Android app
              updates by installing a new APK. */}
          {!isNativeApp() && (
            <>
              <div className="h-px bg-border-subtle mx-4" />
              <SettingsRow
                icon={Sparkles}
                iconColor="#EAB308"
                label="Check for App Update"
                subtitle="Install the latest version without clearing data"
                rightElement={<ChevronRight size={16} className="text-text-tertiary" />}
                onClick={handleForceUpdateCache}
              />
            </>
          )}
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
            subtitle={`Build ${__APP_COMMIT__.slice(0, 7)}`}
            rightElement={<span className="text-sm text-text-secondary">{__APP_VERSION__}</span>}
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
      )}
      </AnimatePresence>

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
        nuzlockeRunCount={nuzlockeRunCount}
      />

      <AttributionModal
        isOpen={attributionOpen}
        onClose={() => setAttributionOpen(false)}
      />

      <AiAssistantSheet
        isOpen={aiSheetOpen}
        onClose={() => setAiSheetOpen(false)}
        settings={settings}
        updateSettings={updateSettings}
      />

      <ChatSheet isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      <CreditsModal
        isOpen={creditsOpen}
        onClose={() => setCreditsOpen(false)}
      />
    </div>
  );
}
