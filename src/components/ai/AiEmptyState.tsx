// ============================================================================
// PocketForge — Shared "AI Assistant isn't ready" presentation
// ============================================================================
//
// Replaces three screens that used to say slightly different things for the
// same underlying cause (ChatPanel's bare two-line block, the Assistant
// page's own version with a CTA, and ChatLauncher just rendering nothing) —
// and none of them distinguished a server that's still loading from one that
// crashed from one that was simply never set up. AiReadinessStatus (see
// use-ai-readiness.ts) already tells the difference; this only has to render it.

import { Bot, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { AiReadinessStatus } from '../../hooks/use-ai-readiness';

interface AiEmptyStateProps {
  status: AiReadinessStatus;
  /** The on-device server's own error text, shown only for 'server-error'. */
  error?: string;
  /** Called before navigating to Settings — lets a sheet-hosted panel close
   *  itself first so it isn't left open behind the new page. */
  onBeforeNavigate?: () => void;
}

const COPY: Record<Exclude<AiReadinessStatus, 'ready'>, { title: string; body: string }> = {
  disabled: {
    title: 'AI Assistant is turned off',
    body: 'Turn it on in Settings → AI Assistant.',
  },
  'not-configured': {
    title: "AI Assistant isn't set up yet",
    body: 'Add an Ollama Cloud API key in Settings → AI Assistant.',
  },
  'no-model': {
    title: "AI Assistant isn't set up yet",
    body: 'Import a model in Settings → AI Assistant to use on-device AI.',
  },
  starting: {
    title: 'Starting the on-device AI server…',
    body: 'This can take a minute or more for a large model — hang tight.',
  },
  'server-error': {
    title: 'The on-device AI server hit a problem',
    body: 'Check Settings → AI Assistant for details, or try starting it again.',
  },
  'server-stopped': {
    title: "AI Assistant isn't running",
    body: 'Start the on-device server in Settings → AI Assistant.',
  },
};

export default function AiEmptyState({ status, error, onBeforeNavigate }: AiEmptyStateProps) {
  const navigate = useNavigate();
  if (status === 'ready') return null;
  const copy = COPY[status];

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-2">
      {status === 'starting' ? (
        <Loader2 size={32} className="text-text-tertiary mb-1 animate-spin" aria-hidden="true" />
      ) : (
        <Bot size={32} className="text-text-tertiary mb-1" aria-hidden="true" />
      )}
      <p className="text-sm text-text-primary">{copy.title}</p>
      <p className="text-[12px] text-text-secondary leading-relaxed max-w-[260px]">{copy.body}</p>
      {status === 'server-error' && error && (
        <p className="text-[11px] text-danger break-words max-w-[260px]">{error}</p>
      )}
      {status !== 'starting' && (
        <button
          type="button"
          onClick={() => {
            onBeforeNavigate?.();
            navigate('/settings');
          }}
          className="mt-1 h-9 px-4 rounded-full text-[12px] font-medium bg-accent-primary text-white touch-target"
        >
          Open Settings
        </button>
      )}
    </div>
  );
}
