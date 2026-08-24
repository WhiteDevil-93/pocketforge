// ============================================================================
// PocketForge — Nuzlocke Store
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NUZLOCKE_STORAGE_KEY } from '../lib/storage';
import type { NuzlockeRoute } from '../data/nuzlockeRoutes';

export interface NuzlockeEncounter {
  routeId: string;
  species: string;
  nickname: string;
  status: 'caught' | 'dead' | 'boxed' | 'missed';
  nature?: string;
  evolvedSpecies?: string;
}

export interface TeraRaidDen {
  routeId: string;
  species: string;
  status: 'caught' | 'fled' | 'failed';
  rolledAt: string;
}

export interface NuzlockeRun {
  id: string;
  name: string;
  gameId: string;
  startedAt: string;
  encounters: NuzlockeEncounter[];
  teraRaids: TeraRaidDen[];
  /** Locations the user added by hand (Nuzlocke.tsx's "Add Custom Location"),
   *  scoped to this run and persisted here — previously this was pushed onto
   *  the shared, in-memory NuzlockeGame.routes array from data/nuzlockeRoutes.ts,
   *  which is not persisted and is shared across every run, so it vanished on
   *  reload and would have leaked into every other run using the same game. */
  customLocations: NuzlockeRoute[];
  rules: {
    dupesClause: boolean;
    shinyClause: boolean;
    levelCap: boolean;
  };
}

interface NuzlockeState {
  runs: NuzlockeRun[];
  currentRunId: string | null;
  createRun: (name: string, gameId: string) => string;
  deleteRun: (id: string) => void;
  setCurrentRun: (id: string | null) => void;
  addEncounter: (runId: string, encounter: NuzlockeEncounter) => void;
  updateEncounter: (runId: string, routeId: string, updates: Partial<NuzlockeEncounter>) => void;
  removeEncounter: (runId: string, routeId: string) => void;
  updateRules: (runId: string, rules: Partial<NuzlockeRun['rules']>) => void;
  addCustomLocation: (runId: string, route: NuzlockeRoute) => void;
  addTeraRaid: (runId: string, raid: TeraRaidDen) => void;
  updateTeraRaid: (runId: string, routeId: string, updates: Partial<TeraRaidDen>) => void;
  removeTeraRaid: (runId: string, routeId: string) => void;
}

function generateId(): string {
  try { return crypto.randomUUID(); } catch { return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`; }
}

export const useNuzlockeStore = create<NuzlockeState>()(
  persist(
    (set) => ({
      runs: [],
      currentRunId: null,
      createRun: (name, gameId) => {
        const id = generateId();
        const newRun: NuzlockeRun = {
          id, name, gameId,
          startedAt: new Date().toISOString(),
          encounters: [],
          teraRaids: [],
          customLocations: [],
          rules: { dupesClause: true, shinyClause: true, levelCap: true },
        };
        set((s) => ({ runs: [...s.runs, newRun], currentRunId: id }));
        return id;
      },
      deleteRun: (id) => set((s) => ({ runs: s.runs.filter((r) => r.id !== id), currentRunId: s.currentRunId === id ? null : s.currentRunId })),
      setCurrentRun: (id) => set({ currentRunId: id }),
      addEncounter: (runId, enc) => set((s) => ({ runs: s.runs.map((r) => r.id === runId ? { ...r, encounters: [...r.encounters, enc] } : r) })),
      updateEncounter: (runId, routeId, updates) => set((s) => ({ runs: s.runs.map((r) => r.id === runId ? { ...r, encounters: r.encounters.map((e) => e.routeId === routeId ? { ...e, ...updates } : e) } : r) })),
      removeEncounter: (runId, routeId) => set((s) => ({ runs: s.runs.map((r) => r.id === runId ? { ...r, encounters: r.encounters.filter((e) => e.routeId !== routeId) } : r) })),
      updateRules: (runId, rules) => set((s) => ({ runs: s.runs.map((r) => r.id === runId ? { ...r, rules: { ...r.rules, ...rules } } : r) })),
      // `r.customLocations ?? []` guards a run persisted before this field existed.
      addCustomLocation: (runId, route) => set((s) => ({ runs: s.runs.map((r) => r.id === runId ? { ...r, customLocations: [...(r.customLocations ?? []), route] } : r) })),
      addTeraRaid: (runId, raid) => set((s) => ({ runs: s.runs.map((r) => r.id === runId ? { ...r, teraRaids: [...r.teraRaids, raid] } : r) })),
      updateTeraRaid: (runId, routeId, updates) => set((s) => ({ runs: s.runs.map((r) => r.id === runId ? { ...r, teraRaids: r.teraRaids.map((t) => t.routeId === routeId ? { ...t, ...updates } : t) } : r) })),
      removeTeraRaid: (runId, routeId) => set((s) => ({ runs: s.runs.map((r) => r.id === runId ? { ...r, teraRaids: r.teraRaids.filter((t) => t.routeId !== routeId) } : r) })),
    }),
    { name: NUZLOCKE_STORAGE_KEY, partialize: (state) => ({ runs: state.runs, currentRunId: state.currentRunId }) }
  )
);
