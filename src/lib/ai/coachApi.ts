import type {
  AIHealth,
  AITeamPayload,
  BattleSimulation,
  TeammateRecommendation,
  WeaknessAnalysis,
} from './types';

const API_BASE = import.meta.env.VITE_AI_API_URL ?? 'http://localhost:8000';

class CoachApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'CoachApiError';
    this.status = status;
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new CoachApiError(text || res.statusText, res.status);
  }

  return res.json() as Promise<T>;
}

export async function fetchCoachHealth(): Promise<AIHealth> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new CoachApiError('AI coach offline', res.status);
  return res.json() as Promise<AIHealth>;
}

export function analyzeWeakness(team: AITeamPayload): Promise<WeaknessAnalysis> {
  return post('/api/analyze-weakness', { team });
}

export function recommendTeammate(team: AITeamPayload): Promise<TeammateRecommendation> {
  return post('/api/recommend-teammate', { team });
}

export function simulateBattle(
  team: AITeamPayload,
  turns = 5
): Promise<BattleSimulation> {
  return post('/api/simulate-battle', { team, turns });
}

export { API_BASE, CoachApiError };