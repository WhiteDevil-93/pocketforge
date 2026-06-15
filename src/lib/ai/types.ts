export interface AITeamPokemon {
  species: string;
  nickname?: string;
  level: number;
  ability: string;
  item?: string;
  teraType?: string;
  moves: string[];
  evs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  ivs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  nature: string;
}

export interface AITeamPayload {
  name: string;
  format: string;
  pokemon: AITeamPokemon[];
}

export interface AIHealth {
  status: string;
  model_loaded: boolean;
  stub_mode: boolean;
  version: string;
}

export interface TeammateRecommendation {
  species: string;
  item?: string;
  ability?: string;
  moves: string[];
  reasoning: string;
  model: string;
}

export interface WeaknessAnalysis {
  summary: string;
  structural_flaws: string[];
  ev_suggestions: string[];
  priority_fixes: string[];
  model: string;
}

export interface BattleSimulation {
  match_id: string;
  status: string;
  opening_advice: string;
  predicted_lines: string[];
  model: string;
}