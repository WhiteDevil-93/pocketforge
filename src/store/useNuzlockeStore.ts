// ============================================================================
// PocketForge — Nuzlocke Store
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
      addTeraRaid: (runId, raid) => set((s) => ({ runs: s.runs.map((r) => r.id === runId ? { ...r, teraRaids: [...r.teraRaids, raid] } : r) })),
      updateTeraRaid: (runId, routeId, updates) => set((s) => ({ runs: s.runs.map((r) => r.id === runId ? { ...r, teraRaids: r.teraRaids.map((t) => t.routeId === routeId ? { ...t, ...updates } : t) } : r) })),
      removeTeraRaid: (runId, routeId) => set((s) => ({ runs: s.runs.map((r) => r.id === runId ? { ...r, teraRaids: r.teraRaids.filter((t) => t.routeId !== routeId) } : r) })),
    }),
    { name: 'pocketforge-nuzlocke', partialize: (state) => ({ runs: state.runs, currentRunId: state.currentRunId }) }
  )
);
