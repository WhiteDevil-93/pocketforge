// ============================================================================
// PocketForge — Home Page (Redesigned)
// ============================================================================

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Search, Settings, Plus, FolderOpen, ChevronDown,
  Users, AlertTriangle, Check, Zap, BookOpen, Shield,
  Wrench, Calculator, Crosshair, Heart, Sparkles,
  TrendingUp, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { springTap, transitionFast } from '../lib/motion';
import { useStore } from '../store/useStore';
import type { Team } from '../types';
import SearchInput from '../components/SearchInput';
import TeamCard from '../components/TeamCard';
import PokemonSprite from '../components/PokemonSprite';
import { PIKALYTICS_TOP_20 } from '../data/pikalyticsMeta';

// ---- Format filter options -------------------------------------------------

const FORMAT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'champions', label: 'Champions' },
  { id: 'gen9ou', label: 'Gen 9 OU' },
  { id: 'gen9vgc-regi', label: 'VGC' },
  { id: 'gen9nationaldex', label: 'National Dex' },
  { id: 'gen9ubers', label: 'Ubers' },
  { id: 'gen9uu', label: 'UU' },
  { id: 'gen8ou', label: 'Gen 8 OU' },
  { id: 'gen7ou', label: 'Gen 7 OU' },
];

// ---- Quick actions ---------------------------------------------------------

const QUICK_ACTIONS = [
  { label: 'Builder', icon: Wrench, path: '/builder', color: '#3B82F6', bg: '#3B82F608', border: '#3B82F620' },
  { label: 'Nuzlocke', icon: Crosshair, path: '/nuzlocke', color: '#8B5CF6', bg: '#8B5CF608', border: '#8B5CF620' },
  { label: 'Calc', icon: Calculator, path: '/damage-calc', color: '#10B981', bg: '#10B98108', border: '#10B98120' },
  { label: 'Movepool', icon: BookOpen, path: '/movepool', color: '#F59E0B', bg: '#F59E0B08', border: '#F59E0B20' },
  { label: 'Speed Tiers', icon: Zap, path: '/speed-tiers', color: '#EC4899', bg: '#EC489908', border: '#EC489920' },
  { label: 'Weakness', icon: Shield, path: '/weakness-analyzer', color: '#EF4444', bg: '#EF444408', border: '#EF444420' },
];

// ---- Folder grouping logic -------------------------------------------------

function groupTeamsByFolder(teams: Team[]): Record<string, Team[]> {
  const groups: Record<string, Team[]> = {};
  for (const team of teams) {
    const folder = team.folder || 'My Teams';
    if (!groups[folder]) groups[folder] = [];
    groups[folder].push(team);
  }
  for (const folder of Object.keys(groups)) {
    groups[folder].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
  return groups;
}

// ---- Pull-to-refresh Pokeball icon -----------------------------------------

function PokeballIcon({ rotation }: { rotation: number }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ transform: `rotate(${rotation}deg)` }} className="mx-auto">
      <path d="M16 2C8.268 2 2 8.268 2 16h12.5V12.5a3.5 3.5 0 1 1 7 0V16H30c0-7.732-6.268-14-14-14z" fill="#EF4444" />
      <path d="M16 30c7.732 0 14-6.268 14-14H17.5v3.5a3.5 3.5 0 1 1-7 0V16H2c0 7.732 6.268 14 14 14z" fill="#F1F5F9" />
      <rect x="2" y="15" width="28" height="2" fill="#1E293B" />
      <circle cx="16" cy="16" r="5" fill="#1E293B" />
      <circle cx="16" cy="16" r="3.5" fill="#F1F5F9" />
      <circle cx="16" cy="16" r="2" fill="#1E293B" />
    </svg>
  );
}

// ---- Toast notification ----------------------------------------------------

interface ToastData { id: string; message: string; type: 'success' | 'error' | 'info'; }

function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: () => void }) {
  useEffect(() => { const timer = setTimeout(onDismiss, 3000); return () => clearTimeout(timer); }, [onDismiss]);
  const borderColor = toast.type === 'success' ? 'var(--success)' : toast.type === 'error' ? 'var(--danger)' : 'var(--accent-primary)';
  return (
    <motion.div initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -10, x: '-50%' }} transition={transitionFast}
      className="fixed top-4 left-1/2 z-[60] flex items-center gap-2 px-4 py-3 rounded-card-md bg-bg-elevated shadow-card" style={{ borderLeft: `3px solid ${borderColor}` }}>
      {toast.type === 'success' && <Check size={16} className="text-success" />}
      {toast.type === 'error' && <AlertTriangle size={16} className="text-danger" />}
      {toast.type === 'info' && <AlertTriangle size={16} className="text-accent-primary" />}
      <span className="font-body text-text-primary">{toast.message}</span>
    </motion.div>
  );
}

// ---- Hero banner with gradient ---------------------------------------------

function HeroBanner({ teamCount, onCreate }: { teamCount: number; onCreate: () => void }) {
  const tips = [
    "Tap a Pokemon sprite to search its movepool!",
    "Try the Weakness Analyzer to find team holes.",
    "Speed Tiers shows who outspeeds who in your format.",
    "Champions Regulation uses custom learnsets — check them!",
    "Long-press a team card for copy, delete, and export options.",
    "The Damage Calc supports spread moves and multiple targets.",
    "Nuzlocke mode has route encounters for 38 games!",
    "Pikalytics data shows what's popular in Champions M-B.",
  ];
  const tip = useMemo(() => tips[Math.floor(Math.random() * tips.length)], []);

  return (
    <div className="relative overflow-hidden rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #0F172A 50%, #1E1B4B 100%)' }}>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #3B82F6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8B5CF6 0%, transparent 40%)' }} />
      <div className="relative p-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-amber-400" />
          <span className="text-caption text-amber-400 font-medium">Welcome back, Trainer</span>
        </div>
        <h2 className="text-title font-bold text-white mb-1">PocketForge</h2>
        <p className="text-body text-text-tertiary mb-3">{teamCount} team{teamCount !== 1 ? 's' : ''} saved</p>
        <div className="flex items-center gap-3">
          <button onClick={onCreate} className="h-9 px-4 rounded-lg bg-accent-primary text-white text-sm font-medium flex items-center gap-1.5 active:scale-95 transition-transform">
            <Plus size={16} /> New Team
          </button>
          <span className="text-caption text-text-tertiary italic flex items-center gap-1">
            <Zap size={12} /> {tip}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---- Quick Actions Grid ----------------------------------------------------

function QuickActions({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="mb-5">
      <h3 className="text-caption font-medium text-text-secondary mb-2.5 uppercase tracking-wider">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-2">
        {QUICK_ACTIONS.map((action) => (
          <button key={action.label} onClick={() => navigate(action.path)}
            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-colors active:scale-95"
            style={{ backgroundColor: action.bg, borderColor: action.border }}>
            <action.icon size={22} style={{ color: action.color }} />
            <span className="text-xs font-medium" style={{ color: action.color }}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Recent Teams Preview --------------------------------------------------

function RecentTeams({ teams, onTap }: { teams: Team[]; onTap: (id: string) => void }) {
  const recent = useMemo(() => [...teams].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4), [teams]);
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-caption font-medium text-text-secondary uppercase tracking-wider">Recent Teams</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {recent.map((team) => (
          <button key={team.id} onClick={() => onTap(team.id)}
            className="text-left p-3 rounded-xl bg-bg-secondary border border-border-subtle active:scale-[0.98] transition-transform">
            <div className="flex items-center gap-1 mb-2">
              {team.pokemon.slice(0, 3).map((p, i) => (
                <PokemonSprite key={i} name={p.species} size={28} />
              ))}
              {team.pokemon.length > 3 && <span className="text-caption text-text-tertiary">+{team.pokemon.length - 3}</span>}
            </div>
            <p className="text-sm font-medium text-text-primary truncate">{team.name}</p>
            <p className="text-caption text-text-tertiary">{team.format?.replace(/-/g, ' ') || 'Unknown'}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Champions Meta Snapshot -----------------------------------------------

function MetaSnapshot() {
  const top4 = PIKALYTICS_TOP_20.slice(0, 4);
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-caption font-medium text-text-secondary uppercase tracking-wider flex items-center gap-1">
          <TrendingUp size={12} /> Champions M-B Meta
        </h3>
      </div>
      <div className="bg-bg-secondary rounded-xl border border-border-subtle p-3">
        <div className="flex items-center justify-around">
          {top4.map((p, i) => (
            <div key={p.species} className="flex flex-col items-center gap-1">
              <div className="relative">
                <PokemonSprite name={p.species} size={48} />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-primary text-white text-[10px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <span className="text-xs font-medium text-text-primary">{p.species}</span>
              <span className="text-[10px] text-text-tertiary">{p.winrate}% WR</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Nuzlocke Progress Card ------------------------------------------------

function NuzlockeProgressCard({ navigate }: { navigate: (path: string) => void }) {
  // We'll read from localStorage directly since the store might not be available
  const runData = useMemo(() => {
    try {
      const raw = localStorage.getItem('nuzlocke-storage');
      if (!raw) return null;
      const data = JSON.parse(raw);
      const runs = data.state?.runs || [];
      if (runs.length === 0) return null;
      const currentRun = runs.find((r: any) => r.id === data.state?.currentRunId) || runs[0];
      const alive = currentRun.encounters?.filter((e: any) => e.status === 'caught').length || 0;
      const dead = currentRun.encounters?.filter((e: any) => e.status === 'dead').length || 0;
      const total = currentRun.encounters?.length || 0;
      return { name: currentRun.name, alive, dead, total };
    } catch { return null; }
  }, []);

  if (!runData) return null;

  return (
    <button onClick={() => navigate('/nuzlocke')} className="w-full text-left mb-5 p-4 rounded-xl bg-bg-secondary border border-border-subtle active:scale-[0.98] transition-transform">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Crosshair size={16} className="text-purple-400" />
          <span className="text-sm font-medium text-text-primary">{runData.name}</span>
        </div>
        <ArrowRight size={16} className="text-text-tertiary" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-caption flex items-center gap-1" style={{ color: '#22C55E' }}><Heart size={12} /> {runData.alive}</span>
        <span className="text-caption flex items-center gap-1" style={{ color: '#EF4444' }}><AlertTriangle size={12} /> {runData.dead}</span>
        <span className="text-caption text-text-tertiary">{runData.total} encounters</span>
      </div>
    </button>
  );
}

// ============================================================================
// Main Teams Page
// ============================================================================

export default function Teams() {
  const navigate = useNavigate();
  const teams = useStore((s) => s.teams);
  const folders = useStore((s) => s.folders);
  const createTeam = useStore((s) => s.createTeam);
  const deleteTeam = useStore((s) => s.deleteTeam);
  const duplicateTeam = useStore((s) => s.duplicateTeam);
  const setCurrentTeam = useStore((s) => s.setCurrentTeam);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFormat, setActiveFormat] = useState('all');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshComplete, setRefreshComplete] = useState(false);
  const pullY = useMotionValue(0);
  const pullRotate = useTransform(pullY, [0, 80], [0, 180]);
  const pullOpacity = useTransform(pullY, [0, 30], [0, 1]);
  const isPulling = useRef(false);
  const pullStartY = useRef(0);

  useEffect(() => {
    const allExpanded: Record<string, boolean> = {};
    for (const folder of folders) allExpanded[folder] = true;
    for (const team of teams) {
      const folder = team.folder || 'My Teams';
      if (!(folder in allExpanded)) allExpanded[folder] = true;
    }
    setExpandedFolders(allExpanded);
  }, [folders]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredTeams = useMemo(() => {
    let result = [...teams];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((team) =>
        team.name.toLowerCase().includes(query) ||
        team.format.toLowerCase().includes(query) ||
        team.pokemon.some((p) => p.species.toLowerCase().includes(query))
      );
    }
    if (activeFormat !== 'all') {
      if (activeFormat === 'champions') result = result.filter((t) => t.format?.startsWith('champions'));
      else result = result.filter((t) => t.format === activeFormat);
    }
    return result;
  }, [teams, searchQuery, activeFormat]);

  const groupedTeams = useMemo(() => groupTeamsByFolder(filteredTeams), [filteredTeams]);
  const folderNames = useMemo(() => {
    const allFolders = [...folders];
    for (const team of filteredTeams) {
      const folder = team.folder || 'My Teams';
      if (!allFolders.includes(folder)) allFolders.push(folder);
    }
    return allFolders.filter((f) => (groupedTeams[f]?.length || 0) > 0);
  }, [folders, filteredTeams, groupedTeams]);

  const addToast = useCallback((message: string, type: ToastData['type'] = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev.slice(-1), { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleCreateTeam = useCallback(() => {
    const teamId = createTeam('New Team');
    setCurrentTeam(teamId);
    navigate(`/builder/${teamId}`);
  }, [createTeam, setCurrentTeam, navigate]);

  const handleTapTeam = useCallback((teamId: string) => {
    setCurrentTeam(teamId);
    navigate(`/builder/${teamId}`);
  }, [setCurrentTeam, navigate]);

  const handleCopyTeam = useCallback((teamId: string) => {
    const newId = duplicateTeam(teamId);
    if (newId) addToast('Team copied', 'success');
  }, [duplicateTeam, addToast]);

  const handleDeleteTeam = useCallback((teamId: string) => {
    deleteTeam(teamId);
    addToast('Team deleted', 'success');
  }, [deleteTeam, addToast]);

  const handleExportTeam = useCallback((teamId: string) => {
    setCurrentTeam(teamId);
    navigate('/import-export');
  }, [setCurrentTeam, navigate]);

  const handleDuplicateTeam = useCallback((teamId: string) => {
    const newId = duplicateTeam(teamId);
    if (newId) addToast('Team duplicated', 'success');
  }, [duplicateTeam, addToast]);

  const toggleFolder = useCallback((folder: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folder]: !prev[folder] }));
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      pullStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;
    const diff = e.touches[0].clientY - pullStartY.current;
    if (diff > 0 && window.scrollY <= 0) {
      pullY.set(Math.min(diff * 0.5, 100));
      if (diff > 80) setRefreshComplete(true);
    }
  }, [pullY, isRefreshing]);

  const handleTouchEnd = useCallback(() => {
    if (!isPulling.current) return;
    isPulling.current = false;
    const currentPull = pullY.get();
    if (currentPull > 80) {
      setIsRefreshing(true);
      pullY.set(60);
      setTimeout(() => {
        setIsRefreshing(false);
        setRefreshComplete(true);
        pullY.set(0);
        addToast('Teams refreshed', 'success');
        setTimeout(() => setRefreshComplete(false), 1000);
      }, 1500);
    } else {
      pullY.set(0);
      setRefreshComplete(false);
    }
  }, [pullY, addToast]);

  const isEmpty = teams.length === 0;
  const noSearchResults = !isEmpty && filteredTeams.length === 0;
  const [pullRotationVal, setPullRotationVal] = useState(0);
  useEffect(() => {
    const unsubscribe = pullRotate.on('change', (v) => setPullRotationVal(v));
    return () => unsubscribe();
  }, [pullRotate]);

  return (
    <div className="min-h-[100dvh] flex flex-col relative" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {/* Toast notifications */}
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>

      {/* Top App Bar */}
      <motion.header className={`sticky top-0 z-40 h-[56px] flex items-center justify-between px-4 transition-colors duration-200 ${isScrolled ? 'bg-bg-primary/95 backdrop-blur-xl border-b border-border-subtle' : 'bg-transparent'}`}>
        <h1 className="font-title text-text-primary">Home</h1>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowSearch((s) => !s)} className="w-10 h-10 flex items-center justify-center rounded-full touch-target" aria-label="Search teams">
            <Search size={20} className="text-text-secondary" />
          </button>
          <button onClick={() => navigate('/settings')} className="w-10 h-10 flex items-center justify-center rounded-full touch-target" aria-label="Settings">
            <Settings size={20} className="text-text-secondary" />
          </button>
        </div>
      </motion.header>

      {/* Pull-to-refresh indicator */}
      <motion.div style={{ height: pullY, opacity: pullOpacity }} className="overflow-hidden flex items-center justify-center">
        <div className="py-2">
          {isRefreshing ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.5, ease: 'linear' }}>
              <PokeballIcon rotation={0} />
            </motion.div>
          ) : refreshComplete ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={springTap}>
              <Check size={28} className="text-success" />
            </motion.div>
          ) : (
            <PokeballIcon rotation={pullRotationVal} />
          )}
        </div>
      </motion.div>

      {/* Search Bar (collapsible) */}
      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="sticky top-[56px] z-30 bg-bg-primary/95 backdrop-blur-xl px-4 py-2 border-b border-border-subtle overflow-hidden">
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search teams..." autoFocus />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 px-4 py-3 pb-24">
        {/* ---- EMPTY STATE ---- */}
        {isEmpty && (
          <>
            <HeroBanner teamCount={0} onCreate={handleCreateTeam} />
            <QuickActions navigate={navigate} />
            <MetaSnapshot />
            <div className="mt-6 flex flex-col items-center text-center">
              <Users size={48} className="text-text-tertiary mb-3" />
              <p className="text-body text-text-secondary mb-2">No teams yet</p>
              <p className="text-caption text-text-tertiary mb-4">Create your first team or explore the tools above</p>
              <button onClick={handleCreateTeam} className="h-10 px-5 rounded-lg bg-accent-primary text-white text-sm font-medium flex items-center gap-1.5">
                <Plus size={16} /> Create Team
              </button>
            </div>
          </>
        )}

        {/* ---- HOME SCREEN (with teams) ---- */}
        {!isEmpty && !showSearch && activeFormat === 'all' && (
          <>
            {/* Hero */}
            <HeroBanner teamCount={teams.length} onCreate={handleCreateTeam} />

            {/* Quick Actions */}
            <QuickActions navigate={navigate} />

            {/* Nuzlocke Progress */}
            <NuzlockeProgressCard navigate={navigate} />

            {/* Recent Teams */}
            <RecentTeams teams={teams} onTap={handleTapTeam} />

            {/* Meta Snapshot */}
            <MetaSnapshot />
          </>
        )}

        {/* ---- Search Results ---- */}
        {noSearchResults && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center text-center py-16">
            <Search size={64} className="text-text-tertiary mb-4" />
            <h2 className="font-headline text-text-primary mb-2">No teams found</h2>
            <p className="font-body text-text-secondary max-w-[280px]">Try adjusting your search or filters.</p>
          </motion.div>
        )}

        {/* ---- Format Filter Chips (only when searching or filtered) ---- */}
        {(showSearch || activeFormat !== 'all' || isEmpty) && (
          <div className="mb-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide scroll-snap-x snap-mandatory pb-1">
              {FORMAT_FILTERS.map((format) => (
                <button key={format.id} onClick={() => setActiveFormat(format.id)}
                  className={`flex-shrink-0 scroll-snap-start h-[36px] px-4 rounded-full font-body-medium text-sm transition-colors duration-200 ${activeFormat === format.id ? 'bg-accent-primary/15 text-accent-primary' : 'bg-bg-secondary text-text-secondary'}`}>
                  {format.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Show format filters when on home with teams too, but below content */}
        {!isEmpty && !showSearch && activeFormat === 'all' && (
          <div className="mb-3 mt-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-caption font-medium text-text-secondary uppercase tracking-wider">My Teams</h3>
              <button onClick={() => setShowSearch(true)} className="text-caption text-accent-primary">Search</button>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {FORMAT_FILTERS.map((format) => (
                <button key={format.id} onClick={() => setActiveFormat(format.id)}
                  className={`flex-shrink-0 h-[32px] px-3 rounded-full text-xs font-medium transition-colors ${activeFormat === format.id ? 'bg-accent-primary/15 text-accent-primary' : 'bg-bg-secondary text-text-secondary border border-border-subtle'}`}>
                  {format.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ---- Folder Groupings ---- */}
        <AnimatePresence>
          {folderNames.map((folder) => (
            <div key={folder} className="mb-3">
              <button onClick={() => toggleFolder(folder)} className="flex items-center gap-2 w-full py-2.5">
                <motion.div animate={{ rotate: expandedFolders[folder] ? 0 : -90 }} transition={transitionFast}>
                  <ChevronDown size={18} className="text-text-secondary" />
                </motion.div>
                <FolderOpen size={16} className="text-accent-secondary" />
                <span className="font-subtitle text-text-primary text-sm">{folder}</span>
                <span className="font-caption text-text-tertiary ml-auto">({groupedTeams[folder]?.length || 0})</span>
              </button>
              <AnimatePresence>
                {expandedFolders[folder] && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-2 overflow-hidden">
                    {groupedTeams[folder]?.map((team, i) => (
                      <TeamCard key={team.id} team={team} onTap={handleTapTeam} onCopy={handleCopyTeam} onDelete={handleDeleteTeam} onExport={handleExportTeam} onDuplicate={handleDuplicateTeam} index={i} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </AnimatePresence>

        {/* All folders collapsed hint */}
        {!isEmpty && !noSearchResults && folderNames.every((f) => !expandedFolders[f]) && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-caption text-text-tertiary text-center py-8">
            Tap a folder to view teams
          </motion.p>
        )}
      </div>

      {/* FAB */}
      <motion.button className="fixed z-50 w-[56px] h-[56px] rounded-full bg-accent-primary flex items-center justify-center"
        style={{ bottom: '88px', right: '16px', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.35)' }}
        whileTap={{ scale: 0.92 }} transition={springTap} onClick={handleCreateTeam} aria-label="Create new team">
        <Plus size={24} className="text-white" />
      </motion.button>
    </div>
  );
}
