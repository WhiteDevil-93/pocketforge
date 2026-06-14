// ============================================================================
// PocketForge — Zustand Global Store with localStorage Persistence
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Team, Pokemon, AppSettings } from '../types';

// ---- Default data -----------------------------------------------------------

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  defaultFormat: 'gen9ou',
  hasCompletedOnboarding: false,
};

const emptyPokemon = (): Pokemon => ({
  id: crypto.randomUUID(),
  species: '',
  level: 100,
  gender: '',
  shiny: false,
  ability: '',
  item: '',
  teraType: '',
  moves: [],
  evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
  nature: 'Serious',
});

// ---- Helper functions -------------------------------------------------------

function generateId(): string {
  return crypto.randomUUID();
}

// ---- Store interface --------------------------------------------------------

interface StoreState {
  // Data
  teams: Team[];
  folders: string[];
  settings: AppSettings;

  // Navigation state
  currentTeamId: string | null;
  currentPokemonIndex: number | null;

  // Actions — Teams
  createTeam: (name: string, format?: string) => string;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  deleteTeam: (teamId: string) => void;
  duplicateTeam: (teamId: string) => string;
  setCurrentTeam: (teamId: string | null) => void;

  // Actions — Pokemon
  addPokemon: (teamId: string, pokemon?: Partial<Pokemon>) => void;
  removePokemon: (teamId: string, index: number) => void;
  updatePokemon: (teamId: string, index: number, updates: Partial<Pokemon>) => void;
  reorderPokemon: (teamId: string, fromIndex: number, toIndex: number) => void;

  // Actions — Import / Export
  importTeam: (teamData: Partial<Team>) => string;
  exportTeam: (teamId: string) => string;

  // Actions — Settings
  updateSettings: (settings: Partial<AppSettings>) => void;
  completeOnboarding: (defaultFormat?: string) => void;

  // Actions — Folders
  addFolder: (name: string) => void;
  removeFolder: (name: string) => void;
}

// ---- Store implementation ---------------------------------------------------

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      teams: [],
      folders: ['My Teams', 'VGC', 'Smogon'],
      settings: { ...DEFAULT_SETTINGS },
      currentTeamId: null,
      currentPokemonIndex: null,

      // ---- Team actions ----

      createTeam: (name: string, format?: string) => {
        const teamId = generateId();
        const now = new Date().toISOString();
        const newTeam: Team = {
          id: teamId,
          name,
          format: format || get().settings.defaultFormat || 'gen9ou',
          folder: 'My Teams',
          pokemon: [],
          createdAt: now,
          updatedAt: now,
          isValid: false,
        };
        set(state => ({
          teams: [...state.teams, newTeam],
          currentTeamId: teamId,
        }));
        return teamId;
      },

      updateTeam: (teamId: string, updates: Partial<Team>) => {
        set(state => ({
          teams: state.teams.map(t =>
            t.id === teamId
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      deleteTeam: (teamId: string) => {
        set(state => ({
          teams: state.teams.filter(t => t.id !== teamId),
          currentTeamId: state.currentTeamId === teamId ? null : state.currentTeamId,
        }));
      },

      duplicateTeam: (teamId: string) => {
        const original = get().teams.find(t => t.id === teamId);
        if (!original) return '';

        const newId = generateId();
        const now = new Date().toISOString();
        const cloned: Team = {
          ...original,
          id: newId,
          name: `${original.name} (Copy)`,
          pokemon: original.pokemon.map(p => ({
            ...p,
            id: crypto.randomUUID(),
          })),
          createdAt: now,
          updatedAt: now,
        };

        set(state => ({
          teams: [...state.teams, cloned],
          currentTeamId: newId,
        }));
        return newId;
      },

      setCurrentTeam: (teamId: string | null) => {
        set({ currentTeamId: teamId, currentPokemonIndex: null });
      },

      // ---- Pokemon actions ----

      addPokemon: (teamId: string, pokemon?: Partial<Pokemon>) => {
        const team = get().teams.find(t => t.id === teamId);
        if (!team || team.pokemon.length >= 6) return;

        const newPokemon: Pokemon = {
          ...emptyPokemon(),
          ...pokemon,
          id: pokemon?.id || crypto.randomUUID(),
        };

        set(state => ({
          teams: state.teams.map(t =>
            t.id === teamId
              ? {
                  ...t,
                  pokemon: [...t.pokemon, newPokemon],
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      removePokemon: (teamId: string, index: number) => {
        set(state => ({
          teams: state.teams.map(t =>
            t.id === teamId
              ? {
                  ...t,
                  pokemon: t.pokemon.filter((_, i) => i !== index),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      updatePokemon: (teamId: string, index: number, updates: Partial<Pokemon>) => {
        set(state => ({
          teams: state.teams.map(t =>
            t.id === teamId
              ? {
                  ...t,
                  pokemon: t.pokemon.map((p, i) =>
                    i === index ? { ...p, ...updates } : p
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      reorderPokemon: (teamId: string, fromIndex: number, toIndex: number) => {
        set(state => {
          const team = state.teams.find(t => t.id === teamId);
          if (!team) return state;

          const pokemon = [...team.pokemon];
          const [moved] = pokemon.splice(fromIndex, 1);
          pokemon.splice(toIndex, 0, moved);

          return {
            teams: state.teams.map(t =>
              t.id === teamId
                ? { ...t, pokemon, updatedAt: new Date().toISOString() }
                : t
            ),
          };
        });
      },

      // ---- Import / Export ----

      importTeam: (teamData: Partial<Team>) => {
        const teamId = generateId();
        const now = new Date().toISOString();
        const newTeam: Team = {
          id: teamId,
          name: teamData.name || 'Imported Team',
          format: teamData.format || get().settings.defaultFormat || 'gen9ou',
          folder: teamData.folder || 'My Teams',
          pokemon: (teamData.pokemon || []).map(p => ({
            ...emptyPokemon(),
            ...p,
            id: p.id || crypto.randomUUID(),
          })),
          createdAt: now,
          updatedAt: now,
          isValid: false,
        };

        set(state => ({
          teams: [...state.teams, newTeam],
          currentTeamId: teamId,
        }));
        return teamId;
      },

      exportTeam: (teamId: string) => {
        const team = get().teams.find(t => t.id === teamId);
        return team ? JSON.stringify(team, null, 2) : '';
      },

      // ---- Settings ----

      updateSettings: (settings: Partial<AppSettings>) => {
        set(state => ({
          settings: { ...state.settings, ...settings },
        }));
      },

      completeOnboarding: (defaultFormat?: string) => {
        set(state => ({
          settings: {
            ...state.settings,
            hasCompletedOnboarding: true,
            defaultFormat: defaultFormat || state.settings.defaultFormat,
          },
        }));
      },

      // ---- Folders ----

      addFolder: (name: string) => {
        set(state => {
          if (state.folders.includes(name)) return state;
          return { folders: [...state.folders, name] };
        });
      },

      removeFolder: (name: string) => {
        set(state => ({
          folders: state.folders.filter(f => f !== name),
        }));
      },
    }),
    {
      name: 'pocketforge-storage',
      partialize: (state) => ({
        teams: state.teams,
        folders: state.folders,
        settings: state.settings,
      }),
    }
  )
);
