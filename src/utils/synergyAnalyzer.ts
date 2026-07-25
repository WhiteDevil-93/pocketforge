// ============================================================================
// PocketForge — Teambuilding Synergy & Core Analyzer
// ============================================================================

import type { Team } from '../types';
import { getPokemonByName } from '../data/pokemonData';

export interface SynergyCore {
  name: string;
  isComplete: boolean;
  presentTypes: string[];
  missingTypes: string[];
}

export interface RoleAnalysis {
  hasSpeedControl: boolean;
  hasRedirection: boolean;
  hasPivot: boolean;
  hasPriority: boolean;
  hasRecovery: boolean;
  missingRoles: string[];
}

export interface SynergyReport {
  cores: SynergyCore[];
  roleAnalysis: RoleAnalysis;
  suggestions: string[];
}

const SPEED_CONTROL_MOVES = ['tailwind', 'trick room', 'icy wind', 'electroweb', 'scary face'];
const REDIRECTION_MOVES = ['follow me', 'rage powder', 'spotlight', 'helping hand', 'fake out'];
const PIVOT_MOVES = ['u-turn', 'voltswitch', 'flip turn', 'parting shot', 'chilly reception', 'baton pass'];
const PRIORITY_MOVES = ['extreme speed', 'sucker punch', 'mach punch', 'bullet punch', 'ice shard', 'aqua jet', 'shadow sneak', 'vacuum wave', 'fake out'];

/**
 * Analyze team type synergy and core completions (FWG, DFS).
 */
export function analyzeTeamSynergy(team: Team): SynergyReport {
  const teamTypes = new Set<string>();
  const teamMoveIds = new Set<string>();

  for (const p of team.pokemon) {
    const dex = getPokemonByName(p.species);
    if (dex) {
      for (const t of dex.types) {
        teamTypes.add(t.toLowerCase());
      }
    }
    for (const m of p.moves || []) {
      if (m) teamMoveIds.add(m.toLowerCase().replace(/[^a-z0-9]/g, ''));
    }
  }

  // 1. FWG Core
  const fwgTypes = ['fire', 'water', 'grass'];
  const presentFWG = fwgTypes.filter((t) => teamTypes.has(t));
  const missingFWG = fwgTypes.filter((t) => !teamTypes.has(t));

  // 2. DFS Core
  const dfsTypes = ['dragon', 'fairy', 'steel'];
  const presentDFS = dfsTypes.filter((t) => teamTypes.has(t));
  const missingDFS = dfsTypes.filter((t) => !teamTypes.has(t));

  const cores: SynergyCore[] = [
    {
      name: 'Fire / Water / Grass',
      isComplete: missingFWG.length === 0,
      presentTypes: presentFWG.map((t) => t.toUpperCase()),
      missingTypes: missingFWG.map((t) => t.toUpperCase()),
    },
    {
      name: 'Dragon / Fairy / Steel',
      isComplete: missingDFS.length === 0,
      presentTypes: presentDFS.map((t) => t.toUpperCase()),
      missingTypes: missingDFS.map((t) => t.toUpperCase()),
    },
  ];

  // Role Analysis
  const hasSpeedControl = SPEED_CONTROL_MOVES.some((m) => teamMoveIds.has(m.replace(/[^a-z0-9]/g, '')));
  const hasRedirection = REDIRECTION_MOVES.some((m) => teamMoveIds.has(m.replace(/[^a-z0-9]/g, '')));
  const hasPivot = PIVOT_MOVES.some((m) => teamMoveIds.has(m.replace(/[^a-z0-9]/g, '')));
  const hasPriority = PRIORITY_MOVES.some((m) => teamMoveIds.has(m.replace(/[^a-z0-9]/g, '')));
  const hasRecovery = teamMoveIds.has('recover') || teamMoveIds.has('roost') || teamMoveIds.has('softboiled') || teamMoveIds.has('synthesis') || teamMoveIds.has('moonlight');

  const missingRoles: string[] = [];
  if (!hasSpeedControl) missingRoles.push('Speed Control (Tailwind / Trick Room / Icy Wind)');
  if (!hasRedirection) missingRoles.push('Support / Redirection (Follow Me / Fake Out / Helping Hand)');
  if (!hasPivot) missingRoles.push('Pivot Moves (U-turn / Volt Switch / Parting Shot)');
  if (!hasPriority) missingRoles.push('Priority Moves (Sucker Punch / Extreme Speed / Fake Out)');

  const roleAnalysis: RoleAnalysis = {
    hasSpeedControl,
    hasRedirection,
    hasPivot,
    hasPriority,
    hasRecovery,
    missingRoles,
  };

  const suggestions: string[] = [];
  if (missingFWG.length === 1) {
    suggestions.push(`Consider adding a ${missingFWG[0].toUpperCase()}-type Pokemon to complete your Fire/Water/Grass core.`);
  }
  if (missingDFS.length === 1) {
    suggestions.push(`Consider adding a ${missingDFS[0].toUpperCase()}-type Pokemon to complete your Dragon/Fairy/Steel core.`);
  }
  if (missingRoles.length > 0) {
    suggestions.push(`Your team is missing: ${missingRoles[0]}.`);
  }

  return { cores, roleAnalysis, suggestions };
}
