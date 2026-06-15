// ============================================================================
// PocketForge Phase 2 — AI Coach panel (hybrid backend)
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
import { Bot, Loader2, Sparkles, Swords, UserPlus, Wifi, WifiOff } from 'lucide-react';
import type { Team } from '../types';
import { teamToAIPayload } from '../lib/ai/serializeTeam';
import {
  analyzeWeakness,
  fetchCoachHealth,
  recommendTeammate,
  simulateBattle,
  CoachApiError,
  API_BASE,
} from '../lib/ai/coachApi';
import type { AIHealth, BattleSimulation, TeammateRecommendation, WeaknessAnalysis } from '../lib/ai/types';

interface AICoachPanelProps {
  team: Team;
}

type LoadState = 'idle' | 'loading' | 'error';

const AI_COACH_ENABLED = import.meta.env.VITE_AI_COACH_ENABLED !== 'false';

export default function AICoachPanel({ team }: AICoachPanelProps) {
  const [health, setHealth] = useState<AIHealth | null>(null);
  const [healthError, setHealthError] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<WeaknessAnalysis | null>(null);
  const [teammate, setTeammate] = useState<TeammateRecommendation | null>(null);
  const [simulation, setSimulation] = useState<BattleSimulation | null>(null);

  const refreshHealth = useCallback(async () => {
    try {
      const h = await fetchCoachHealth();
      setHealth(h);
      setHealthError(false);
    } catch {
      setHealth(null);
      setHealthError(true);
    }
  }, []);

  useEffect(() => {
    refreshHealth();
  }, [refreshHealth]);

  const run = async (action: () => Promise<void>) => {
    setLoadState('loading');
    setError(null);
    try {
      await action();
      setLoadState('idle');
    } catch (e) {
      setLoadState('error');
      setError(e instanceof CoachApiError ? e.message : 'AI coach request failed');
    }
  };

  const handleAnalyze = () =>
    run(async () => {
      setAnalysis(await analyzeWeakness(teamToAIPayload(team)));
    });

  const handleRecommend = () =>
    run(async () => {
      setTeammate(await recommendTeammate(teamToAIPayload(team)));
    });

  const handleSimulate = () =>
    run(async () => {
      setSimulation(await simulateBattle(teamToAIPayload(team)));
    });

  const filled = team.pokemon.filter((p) => p.species).length;
  const canRecommend = filled >= 1 && filled < 6;

  if (!AI_COACH_ENABLED) return null;

  return (
    <section className="rounded-2xl border border-accent-primary/25 bg-gradient-to-br from-accent-primary/5 to-bg-secondary p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-accent-primary/15 flex items-center justify-center">
            <Bot size={18} className="text-accent-primary" />
          </div>
          <div>
            <h3 className="font-subtitle text-text-primary">AI Coach</h3>
            <p className="font-caption text-text-tertiary">Phase 2 · Gemma edge backend</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 font-caption text-text-tertiary">
          {healthError ? (
            <>
              <WifiOff size={14} className="text-danger" />
              <span className="text-danger">Offline</span>
            </>
          ) : (
            <>
              <Wifi size={14} className="text-success" />
              <span>{health?.stub_mode ? 'Stub' : 'Live'}</span>
            </>
          )}
        </div>
      </div>

      {healthError && (
        <p className="text-sm text-text-secondary leading-relaxed">
          Start the local API:{' '}
          <code className="text-xs bg-bg-tertiary px-1.5 py-0.5 rounded">
            uvicorn app.main:app --port 8000
          </code>{' '}
          in <code className="text-xs">backend/</code>. Endpoint: {API_BASE}
        </p>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <CoachButton
          icon={Sparkles}
          label="Critique team"
          disabled={filled === 0 || loadState === 'loading'}
          onClick={handleAnalyze}
        />
        <CoachButton
          icon={UserPlus}
          label="Suggest 6th"
          disabled={!canRecommend || loadState === 'loading'}
          onClick={handleRecommend}
        />
        <CoachButton
          icon={Swords}
          label="Test vs AI"
          disabled={filled === 0 || loadState === 'loading'}
          onClick={handleSimulate}
        />
      </div>

      {loadState === 'loading' && (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 size={16} className="animate-spin text-accent-primary" />
          Gemma is thinking…
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      {analysis && (
        <CoachResult title="Team critique">
          <p className="text-sm text-text-primary leading-relaxed">{analysis.summary}</p>
          <BulletBlock heading="Structural flaws" items={analysis.structural_flaws} />
          <BulletBlock heading="EV suggestions" items={analysis.ev_suggestions} />
          <BulletBlock heading="Priority fixes" items={analysis.priority_fixes} />
        </CoachResult>
      )}

      {teammate && (
        <CoachResult title={`Recommend: ${teammate.species}`}>
          <p className="text-sm text-text-primary leading-relaxed">{teammate.reasoning}</p>
          {teammate.item && (
            <p className="font-caption text-text-secondary mt-2">@{teammate.item}</p>
          )}
          {teammate.moves.length > 0 && (
            <p className="font-caption text-text-tertiary mt-1">{teammate.moves.join(' · ')}</p>
          )}
        </CoachResult>
      )}

      {simulation && (
        <CoachResult title="Opening simulation">
          <p className="text-sm text-text-primary leading-relaxed">{simulation.opening_advice}</p>
          <BulletBlock heading="Predicted lines" items={simulation.predicted_lines} />
        </CoachResult>
      )}
    </section>
  );
}

function CoachButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-11 flex items-center justify-center gap-2 rounded-xl bg-bg-tertiary border border-border-subtle font-caption text-text-primary touch-target disabled:opacity-40"
    >
      <Icon size={16} className="text-accent-primary" />
      {label}
    </button>
  );
}

function CoachResult({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-bg-tertiary/80 border border-border-subtle p-3 space-y-2">
      <h4 className="font-body-medium text-accent-primary text-sm">{title}</h4>
      {children}
    </div>
  );
}

function BulletBlock({ heading, items }: { heading: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-2">
      <p className="font-caption text-text-tertiary uppercase tracking-wide text-[10px] mb-1">
        {heading}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="text-sm text-text-secondary leading-snug pl-3 border-l-2 border-accent-primary/30">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}