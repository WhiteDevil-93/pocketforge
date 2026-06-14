// ============================================================================
// PocketForge — Team List Page (Main Home Screen)
// ============================================================================

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Search,
  Settings,
  Plus,
  FolderOpen,
  ChevronDown,
  Users,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useStore } from '../store/useStore';
import type { Team } from '../types';
import SearchInput from '../components/SearchInput';
import EmptyState from '../components/EmptyState';
import TeamCard from '../components/TeamCard';

// ---- Format filter options -------------------------------------------------

const FORMAT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'gen9ou', label: 'Gen 9 OU' },
  { id: 'gen9vgc', label: 'VGC' },
  { id: 'gen9nationaldex', label: 'National Dex' },
  { id: 'gen9ubers', label: 'Ubers' },
  { id: 'gen9uu', label: 'UU' },
  { id: 'gen8ou', label: 'Gen 8 OU' },
  { id: 'gen7ou', label: 'Gen 7 OU' },
];

// ---- Folder grouping logic -------------------------------------------------

function groupTeamsByFolder(teams: Team[]): Record<string, Team[]> {
  const groups: Record<string, Team[]> = {};

  for (const team of teams) {
    const folder = team.folder || 'My Teams';
    if (!groups[folder]) {
      groups[folder] = [];
    }
    groups[folder].push(team);
  }

  // Sort teams within each folder by updatedAt (most recent first)
  for (const folder of Object.keys(groups)) {
    groups[folder].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  return groups;
}

// ---- Pull-to-refresh Pokeball icon -----------------------------------------

function PokeballIcon({ rotation }: { rotation: number }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      style={{ transform: `rotate(${rotation}deg)` }}
      className="mx-auto"
    >
      {/* Top half */}
      <path d="M16 2C8.268 2 2 8.268 2 16h12.5V12.5a3.5 3.5 0 1 1 7 0V16H30c0-7.732-6.268-14-14-14z" fill="#EF4444" />
      {/* Bottom half */}
      <path d="M16 30c7.732 0 14-6.268 14-14H17.5v3.5a3.5 3.5 0 1 1-7 0V16H2c0 7.732 6.268 14 14 14z" fill="#F1F5F9" />
      {/* Center band */}
      <rect x="2" y="15" width="28" height="2" fill="#1E293B" />
      {/* Center button */}
      <circle cx="16" cy="16" r="5" fill="#1E293B" />
      <circle cx="16" cy="16" r="3.5" fill="#F1F5F9" />
      <circle cx="16" cy="16" r="2" fill="#1E293B" />
    </svg>
  );
}

// ---- Toast notification ----------------------------------------------------

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
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
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

  // Search & filter state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFormat, setActiveFormat] = useState('all');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);

  // Toast
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Pull-to-refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshComplete, setRefreshComplete] = useState(false);
  const pullY = useMotionValue(0);
  const pullRotate = useTransform(pullY, [0, 80], [0, 180]);
  const pullOpacity = useTransform(pullY, [0, 30], [0, 1]);
  const isPulling = useRef(false);
  const pullStartY = useRef(0);

  // ---- Initialize expanded folders ----------------------------------------

  useEffect(() => {
    const allExpanded: Record<string, boolean> = {};
    for (const folder of folders) {
      allExpanded[folder] = true;
    }
    // Also include any team folders not in the folders list
    for (const team of teams) {
      const folder = team.folder || 'My Teams';
      if (!(folder in allExpanded)) {
        allExpanded[folder] = true;
      }
    }
    setExpandedFolders(allExpanded);
  }, [folders]);

  // ---- Scroll listener for top bar ----------------------------------------

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ---- Filtered teams ------------------------------------------------------

  const filteredTeams = useMemo(() => {
    let result = [...teams];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (team) =>
          team.name.toLowerCase().includes(query) ||
          team.format.toLowerCase().includes(query) ||
          team.pokemon.some((p) =>
            p.species.toLowerCase().includes(query)
          )
      );
    }

    // Format filter
    if (activeFormat !== 'all') {
      result = result.filter((team) => team.format === activeFormat);
    }

    return result;
  }, [teams, searchQuery, activeFormat]);

  const groupedTeams = useMemo(
    () => groupTeamsByFolder(filteredTeams),
    [filteredTeams]
  );

  const folderNames = useMemo(() => {
    // Preserve folder order: folders from store first, then any new ones
    const allFolders = [...folders];
    for (const team of filteredTeams) {
      const folder = team.folder || 'My Teams';
      if (!allFolders.includes(folder)) {
        allFolders.push(folder);
      }
    }
    // Only include folders that have teams
    return allFolders.filter((f) => (groupedTeams[f]?.length || 0) > 0);
  }, [folders, filteredTeams, groupedTeams]);

  // ---- Actions -------------------------------------------------------------

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

  const handleTapTeam = useCallback(
    (teamId: string) => {
      setCurrentTeam(teamId);
      navigate(`/builder/${teamId}`);
    },
    [setCurrentTeam, navigate]
  );

  const handleCopyTeam = useCallback(
    (teamId: string) => {
      const newId = duplicateTeam(teamId);
      if (newId) {
        addToast('Team copied', 'success');
      }
    },
    [duplicateTeam, addToast]
  );

  const handleDeleteTeam = useCallback(
    (teamId: string) => {
      deleteTeam(teamId);
      addToast('Team deleted', 'success');
    },
    [deleteTeam, addToast]
  );

  const handleExportTeam = useCallback(
    (teamId: string) => {
      setCurrentTeam(teamId);
      navigate('/import-export');
    },
    [setCurrentTeam, navigate]
  );

  const handleDuplicateTeam = useCallback(
    (teamId: string) => {
      const newId = duplicateTeam(teamId);
      if (newId) {
        addToast('Team duplicated', 'success');
      }
    },
    [duplicateTeam, addToast]
  );

  const toggleFolder = useCallback((folder: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folder]: !prev[folder] }));
  }, []);

  // ---- Pull-to-refresh handlers -------------------------------------------

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
      if (diff > 80) {
        setRefreshComplete(true);
      }
    }
  }, [pullY, isRefreshing]);

  const handleTouchEnd = useCallback(() => {
    if (!isPulling.current) return;
    isPulling.current = false;
    const currentPull = pullY.get();

    if (currentPull > 80) {
      // Trigger refresh
      setIsRefreshing(true);
      pullY.set(60);

      // Simulate refresh
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

  // ---- Empty states --------------------------------------------------------

  const isEmpty = teams.length === 0;
  const noSearchResults = !isEmpty && filteredTeams.length === 0;

  // ---- Pull indicator rotation (reactive) ----------------------------------

  const [pullRotationVal, setPullRotationVal] = useState(0);
  useEffect(() => {
    const unsubscribe = pullRotate.on('change', (v) => setPullRotationVal(v));
    return () => unsubscribe();
  }, [pullRotate]);

  // ---- Render --------------------------------------------------------------

  return (
    <div
      className="min-h-[100dvh] flex flex-col relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Toast notifications */}
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>

      {/* Top App Bar */}
      <motion.header
        className={`sticky top-0 z-40 h-[56px] flex items-center justify-between px-4 transition-colors duration-200 ${
          isScrolled
            ? 'bg-bg-primary/95 backdrop-blur-xl border-b border-border-subtle'
            : 'bg-transparent'
        }`}
      >
        <h1 className="font-title text-text-primary">My Teams</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch((s) => !s)}
            className="w-10 h-10 flex items-center justify-center rounded-full touch-target"
            aria-label="Search teams"
          >
            <Search size={20} className="text-text-secondary" />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-10 h-10 flex items-center justify-center rounded-full touch-target"
            aria-label="Settings"
          >
            <Settings size={20} className="text-text-secondary" />
          </button>
        </div>
      </motion.header>

      {/* Pull-to-refresh indicator */}
      <motion.div
        style={{ height: pullY, opacity: pullOpacity }}
        className="overflow-hidden flex items-center justify-center"
      >
        <div className="py-2">
          {isRefreshing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.5, ease: 'linear' }}
            >
              <PokeballIcon rotation={0} />
            </motion.div>
          ) : refreshComplete ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
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
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="sticky top-[56px] z-30 bg-bg-primary/95 backdrop-blur-xl px-4 py-2 border-b border-border-subtle overflow-hidden"
          >
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search teams..."
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Format Filter Chips */}
      {!isEmpty && (
        <div
          className="sticky z-20 bg-bg-primary/95 backdrop-blur-xl px-4 py-2 border-b border-border-subtle"
          style={{ top: showSearch ? '108px' : '56px' }}
        >
          <div className="flex gap-2 overflow-x-auto scrollbar-hide scroll-snap-x snap-mandatory pb-1">
            {FORMAT_FILTERS.map((format) => (
              <button
                key={format.id}
                onClick={() => setActiveFormat(format.id)}
                className={`flex-shrink-0 scroll-snap-start h-[36px] px-4 rounded-full font-body-medium text-sm transition-colors duration-200 ${
                  activeFormat === format.id
                    ? 'bg-accent-primary/15 text-accent-primary'
                    : 'bg-bg-secondary text-text-secondary'
                }`}
              >
                {format.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 px-4 py-3 pb-24">
        {/* Empty state: no teams at all */}
        {isEmpty && (
          <EmptyState
            icon={Users}
            title="No Teams Yet"
            description="Create your first competitive team to get started."
            action={{
              label: '+ Create Team',
              onClick: handleCreateTeam,
            }}
          />
        )}

        {/* Empty state: no search results */}
        {noSearchResults && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center py-16"
          >
            <Search size={64} className="text-text-tertiary mb-4" />
            <h2 className="font-headline text-text-primary mb-2">No teams found</h2>
            <p className="font-body text-text-secondary max-w-[280px]">
              Try adjusting your search or filters.
            </p>
          </motion.div>
        )}

        {/* Folder Groupings */}
        <AnimatePresence mode="wait">
          {folderNames.map((folder) => (
            <div key={folder} className="mb-4">
              {/* Folder Header */}
              <button
                onClick={() => toggleFolder(folder)}
                className="sticky z-10 flex items-center gap-2 w-full py-3 px-0 bg-bg-primary/95 backdrop-blur-sm"
                style={{ top: showSearch ? '164px' : '112px' }}
              >
                <motion.div
                  animate={{ rotate: expandedFolders[folder] ? 0 : -90 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                >
                  <ChevronDown size={20} className="text-text-secondary" />
                </motion.div>

                <FolderOpen size={18} className="text-accent-secondary" />

                <span className="font-subtitle text-text-primary">{folder}</span>

                <span className="font-caption text-text-tertiary ml-auto">
                  ({groupedTeams[folder]?.length || 0})
                </span>
              </button>

              {/* Team Cards */}
              <AnimatePresence>
                {expandedFolders[folder] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-2 overflow-hidden"
                  >
                    {groupedTeams[folder]?.map((team, i) => (
                      <TeamCard
                        key={team.id}
                        team={team}
                        onTap={handleTapTeam}
                        onCopy={handleCopyTeam}
                        onDelete={handleDeleteTeam}
                        onExport={handleExportTeam}
                        onDuplicate={handleDuplicateTeam}
                        index={i}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </AnimatePresence>

        {/* All folders collapsed hint */}
        {!isEmpty &&
          !noSearchResults &&
          folderNames.every((f) => !expandedFolders[f]) && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-caption text-text-tertiary text-center py-8"
            >
              Tap a folder to view teams
            </motion.p>
          )}
      </div>

      {/* FAB */}
      <motion.button
        className="fixed z-50 w-[56px] h-[56px] rounded-full bg-accent-primary flex items-center justify-center"
        style={{
          bottom: '88px',
          right: '16px',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.35)',
        }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        onClick={handleCreateTeam}
        aria-label="Create new team"
      >
        <Plus size={24} className="text-white" />
      </motion.button>
    </div>
  );
}
