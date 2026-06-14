// ============================================================================
// PocketForge — Core Type Definitions
// ============================================================================

// ---- EVs / IVs --------------------------------------------------------------

export interface EVs {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export interface IVs {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

// ---- Pokemon ----------------------------------------------------------------

export interface Pokemon {
  id: string;
  species: string;
  nickname?: string;
  level: number;          // 1-100, default 100
  gender: 'M' | 'F' | '';
  shiny: boolean;
  ability: string;
  item?: string;
  teraType?: string;      // Gen 9
  moves: string[];        // max 4
  evs: EVs;
  ivs: IVs;
  nature: string;
  megaActive?: boolean;   // Mega Evolution active
  megaStone?: string;     // Equipped Mega Stone
}

// ---- Team -------------------------------------------------------------------

export interface Team {
  id: string;
  name: string;
  format: string;         // e.g., "gen9ou"
  folder?: string;
  pokemon: Pokemon[];     // max 6
  createdAt: string;      // ISO date
  updatedAt: string;      // ISO date
  isValid: boolean;
  validationErrors?: string[];
}

// ---- Move -------------------------------------------------------------------

export type MoveCategory = 'Physical' | 'Special' | 'Status';

export interface Move {
  name: string;
  type: string;
  category: MoveCategory;
  power: number;
  accuracy: number | null;
  pp: number;
  description: string;
}

// ---- Item -------------------------------------------------------------------

export type ItemCategory =
  | 'Held Item'
  | 'Berry'
  | 'Mega Stone'
  | 'Z-Crystal'
  | 'Choice'
  | 'Recovery'
  | 'Offensive'
  | 'Defensive'
  | 'Utility'
  | 'Other';

export interface Item {
  name: string;
  category: ItemCategory;
  description: string;
}

// ---- Ability ----------------------------------------------------------------

export interface Ability {
  name: string;
  description: string;
}

// ---- Nature -----------------------------------------------------------------

export interface Nature {
  name: string;
  increased: string | null;
  decreased: string | null;
}

// ---- Format -----------------------------------------------------------------

export interface Format {
  id: string;
  name: string;
  generation: number;
  rules: FormatRule[];
  restrictedPokemon?: string[];
}

export type FormatRule =
  | 'species-clause'
  | 'item-clause'
  | 'evo-clause'
  | 'sleep-clause'
  | 'sleep-clause-mod'
  | 'ohko-clause'
  | 'evasion-clause'
  | 'endless-battle-clause'
  | 'dynamax-clause'
  | 'tera-allow'
  | 'z-move-ban'
  | 'mega-allow'
  | 'mega-once'
  | 'restricted-dex'
  | 'level-5'
  | 'camo-ability'
  | 'shared-power'
  | 'sleep-mod'
  | string;

// ---- Custom Format (user-created) -------------------------------------------

export interface CustomFormat {
  id: string;
  name: string;
  description?: string;
  rules: FormatRule[];
  restrictedDex?: string[];
  generation?: number;
  createdAt: string;
}

// ---- Pokedex Entry ----------------------------------------------------------

export interface PokedexEntry {
  name: string;
  id: number;             // National dex number
  types: string[];
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  abilities: string[];
  hiddenAbility?: string;
  learnset: string[];     // Move names this Pokemon can learn
  sprite: string;         // URL pattern or identifier
}

// ---- Validation -------------------------------------------------------------

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ---- Store ------------------------------------------------------------------

export interface AppSettings {
  theme: 'dark' | 'light';
  defaultFormat: string;
  hasCompletedOnboarding: boolean;
}

export interface AppState {
  // Data
  teams: Team[];
  folders: string[];
  settings: AppSettings;

  // Navigation state
  currentTeamId: string | null;
  currentPokemonIndex: number | null;

  // Actions — Teams
  createTeam: (name: string, format: string) => string;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  deleteTeam: (teamId: string) => void;
  duplicateTeam: (teamId: string) => string;
  setCurrentTeam: (teamId: string | null) => void;

  // Actions — Pokemon
  addPokemon: (teamId: string, pokemon: Partial<Pokemon>) => void;
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

  // Actions — Custom Formats
  customFormats: CustomFormat[];
  addCustomFormat: (format: Omit<CustomFormat, "id" | "createdAt">) => void;
  updateCustomFormat: (id: string, updates: Partial<CustomFormat>) => void;
  deleteCustomFormat: (id: string) => void;
}

// ---- Utility Types ----------------------------------------------------------

export type TypeEffectiveness = Record<string, Record<string, number>>;

export interface CoverageSummary {
  superEffective: string[];
  neutral: string[];
  notVeryEffective: string[];
  noEffect: string[];
}

export interface DefensiveCoverage {
  type: string;
  effectiveness: number;   // max multiplier against this team
  weakTo: number;          // how many team members are weak
  resist: number;          // how many team members are resist
  immune: number;          // how many team members are immune
}
