// ============================================================================
// PocketForge — Home Page (Redesigned)
// ============================================================================

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Search, Settings, Plus, FolderOpen, ChevronDown,
  Users, AlertTriangle, Zap, BookOpen, Shield,
  Wrench, Calculator, Crosshair, Heart,
  TrendingUp, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { transitionFast, EASE_SMOOTH } from '../lib/motion';
import { useStore } from '../store/useStore';
import { useNuzlockeStore } from '../store/useNuzlockeStore';
import type { Team } from '../types';
import SearchInput from '../components/SearchInput';
import TeamCard from '../components/TeamCard';
import EmptyState from '../components/EmptyState';
import PokemonSprite from '../components/PokemonSprite';
import {
  CHAMPIONS_USAGE_META,
  CHAMPIONS_USAGE_TOP_20,
} from '../data/championsUsageRankings';

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
  { label: 'Calc', icon: Calculator, path: '/calc', color: '#10B981', bg: '#10B98108', border: '#10B98120' },
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


// ---- Quick Actions Grid ----------------------------------------------------

function QuickActions({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="mb-5">
      <h3 className="text-caption font-medium text-text-secondary mb-2.5 uppercase tracking-wider">Tools</h3>
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

// ---- Champions Meta Snapshot -----------------------------------------------

function MetaSnapshot() {
  const top4 = CHAMPIONS_USAGE_TOP_20.slice(0, 4);
  return (
    <details className="mb-5 rounded-xl bg-bg-secondary border border-border-subtle group">
      <summary className="h-12 px-3 flex items-center gap-2 cursor-pointer list-none">
        <TrendingUp size={16} className="text-accent-primary" />
        <span className="text-sm font-medium text-text-primary">Champions Doubles Rankings</span>
        <span className="ml-auto text-caption text-text-tertiary group-open:hidden">View</span>
        <ChevronDown size={16} className="text-text-tertiary transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-border-subtle p-3">
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
              <span className="text-[10px] text-text-tertiary">Rank #{p.rank}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-[10px] text-text-tertiary">
          Bundled snapshot · updated {new Date(CHAMPIONS_USAGE_META.sourceUpdatedAt).toLocaleDateString()}
        </p>
      </div>
    </details>
  );
}

// ---- Nuzlocke Progress Card ------------------------------------------------

function NuzlockeProgressCard({ navigate }: { navigate: (path: string) => void }) {
  const runs = useNuzlockeStore((state) => state.runs);
  const currentRunId = useNuzlockeStore((state) => state.currentRunId);
  const currentRun = runs.find((run) => run.id === currentRunId) || runs[0];
  const runData = currentRun
    ? {
        name: currentRun.name,
        alive: currentRun.encounters.filter((encounter) => encounter.status === 'caught').length,
        dead: currentRun.encounters.filter((encounter) => encounter.status === 'dead').length,
        total: currentRun.encounters.length,
      }
    : null;

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
        <span className="text-caption text-success flex items-center gap-1"><Heart size={12} /> {runData.alive}</span>
        <span className="text-caption text-danger flex items-center gap-1"><AlertTriangle size={12} /> {runData.dead}</span>
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
  const restoreTeam = useStore((s) => s.restoreTeam);
  const duplicateTeam = useStore((s) => s.duplicateTeam);
  const setCurrentTeam = useStore((s) => s.setCurrentTeam);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFormat, setActiveFormat] = useState('all');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);

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
    if (newId) toast.success('Team copied');
  }, [duplicateTeam]);

  const handleDeleteTeam = useCallback((teamId: string) => {
    // Swipe-to-delete is the cheapest gesture in the app (one swipe + one tap,
    // previously with no confirmation and no way back) — an undo toast fixes
    // that without adding a confirm-sheet tap to the common case.
    const deleted = teams.find((t) => t.id === teamId);
    deleteTeam(teamId);
    toast.success('Team deleted', {
      action: deleted
        ? { label: 'Undo', onClick: () => restoreTeam(deleted) }
        : undefined,
    });
  }, [teams, deleteTeam, restoreTeam]);

  const handleExportTeam = useCallback((teamId: string) => {
    setCurrentTeam(teamId);
    navigate('/import-export?tab=export');
  }, [setCurrentTeam, navigate]);

  const toggleFolder = useCallback((folder: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folder]: !(prev[folder] ?? true) }));
  }, []);

  const isEmpty = teams.length === 0;
  const noSearchResults = !isEmpty && filteredTeams.length === 0;

  return (
    <div className="min-h-[100dvh] flex flex-col relative">

      {/* Top App Bar */}
      <motion.header className={`sticky top-0 z-40 h-[56px] flex items-center justify-between px-4 transition-colors duration-200 ${isScrolled ? 'bg-bg-primary/95 backdrop-blur-xl border-b border-border-subtle' : 'bg-transparent'}`}>
        <h1 className="font-title text-text-primary">PocketForge</h1>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowSearch((s) => !s)} className="w-10 h-10 flex items-center justify-center rounded-full touch-target" aria-label="Search teams">
            <Search size={20} className="text-text-secondary" />
          </button>
          <button onClick={() => navigate('/settings')} className="w-10 h-10 flex items-center justify-center rounded-full touch-target" aria-label="Settings">
            <Settings size={20} className="text-text-secondary" />
          </button>
        </div>
      </motion.header>

      {/* Search Bar (collapsible) */}
      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: EASE_SMOOTH }}
            className="sticky top-[56px] z-30 bg-bg-primary/95 backdrop-blur-xl px-4 py-2 border-b border-border-subtle overflow-hidden">
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search teams..." autoFocus />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 px-4 py-3 pb-24">
        {/* ---- TEAM LIBRARY ---- */}
        <section aria-labelledby="team-library-title">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 id="team-library-title" className="font-headline text-text-primary">Your Teams</h2>
              <p className="font-caption text-text-tertiary">
                {teams.length} saved team{teams.length === 1 ? '' : 's'}
              </p>
            </div>
            <button
              onClick={handleCreateTeam}
              className="h-10 px-4 rounded-xl bg-accent-primary text-white text-sm font-medium flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <Plus size={16} /> New Team
            </button>
          </div>

          {!isEmpty && (
            <div className="mb-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {FORMAT_FILTERS.map((format) => (
                  <button key={format.id} onClick={() => setActiveFormat(format.id)}
                    className={`tap-target-y flex-shrink-0 h-[34px] px-3 rounded-full text-xs font-medium transition-colors ${activeFormat === format.id ? 'bg-accent-primary/15 text-accent-primary' : 'bg-bg-secondary text-text-secondary border border-border-subtle'}`}>
                    {format.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isEmpty && (
            <EmptyState
              icon={Users}
              iconSize={42}
              title="Build your first team"
              description="Choose a format, add Pokemon, then use analysis to check the result."
              action={{ label: 'New Team', onClick: handleCreateTeam }}
            />
          )}

        {/* ---- Search Results ---- */}
        {noSearchResults && (
          <EmptyState
            icon={Search}
            title="No teams found"
            description="Try adjusting your search or filters."
          />
        )}

        {/* ---- Folder Groupings ---- */}
        <AnimatePresence>
          {folderNames.map((folder) => (
            <div key={folder} className="mb-3">
              <button onClick={() => toggleFolder(folder)} className="flex items-center gap-2 w-full py-2.5">
                <motion.div animate={{ rotate: (expandedFolders[folder] ?? true) ? 0 : -90 }} transition={transitionFast}>
                  <ChevronDown size={18} className="text-text-secondary" />
                </motion.div>
                <FolderOpen size={16} className="text-accent-secondary" />
                <span className="font-subtitle text-text-primary text-sm">{folder}</span>
                <span className="font-caption text-text-tertiary ml-auto">({groupedTeams[folder]?.length || 0})</span>
              </button>
              <AnimatePresence>
                {(expandedFolders[folder] ?? true) && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-2 overflow-hidden">
                    {groupedTeams[folder]?.map((team, i) => (
                      <TeamCard key={team.id} team={team} onTap={handleTapTeam} onCopy={handleCopyTeam} onDelete={handleDeleteTeam} onExport={handleExportTeam} index={i} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </AnimatePresence>

        {/* All folders collapsed hint */}
        {!isEmpty && !noSearchResults && folderNames.every((f) => (expandedFolders[f] ?? true) === false) && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-caption text-text-tertiary text-center py-8">
            Tap a folder to view teams
          </motion.p>
        )}
        </section>

        {/* ---- SECONDARY HOME CONTENT ---- */}
        {!showSearch && activeFormat === 'all' && (
          <section className="mt-6 pt-5 border-t border-border-subtle" aria-label="Tools and activity">
            <NuzlockeProgressCard navigate={navigate} />
            <QuickActions navigate={navigate} />
            <MetaSnapshot />
          </section>
        )}
      </div>
    </div>
  );
}
