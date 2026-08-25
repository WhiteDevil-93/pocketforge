// ============================================================================
// PocketForge — AI Assistant (full-screen)
//
// The assistant's own surface, reachable from the bottom nav rather than buried
// in Settings. It can build teams directly: the write tools in
// src/lib/llm/writeTools.ts mutate the real store, so anything it does here is
// immediately visible in Builder.
// ============================================================================

import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Settings as SettingsIcon } from 'lucide-react';
import ChatPanel from '../components/ai/ChatPanel';
import { useStore } from '../store/useStore';

export default function Assistant() {
  const navigate = useNavigate();
  const teams = useStore((s) => s.teams);
  const currentTeamId = useStore((s) => s.currentTeamId);

  const team = useMemo(
    () => teams.find((t) => t.id === currentTeamId) ?? teams[0] ?? null,
    [teams, currentTeamId]
  );

  return (
    // Fixed to the viewport minus the bottom nav + safe-area inset (for notched iPhones):
    // the composer has to stay put while the transcript scrolls, which a normally-flowing
    // page can't do. On iPhones with a notch, safe-area-inset-bottom adds ~34px of space.
    <div className="flex flex-col h-[calc(100dvh-var(--bottom-nav-height,64px)-env(safe-area-inset-bottom,0px))] px-4">
      <div className="pt-4 pb-2 flex items-center justify-between shrink-0">
        <div className="min-w-0">
          <h1 className="font-display text-text-primary">AI Assistant</h1>
          <p className="text-[11px] text-text-secondary truncate">
            {team ? `Working on "${team.name}"` : 'No team open — ask it to build one'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/settings')}
          aria-label="AI settings"
          className="w-9 h-9 shrink-0 rounded-full bg-bg-tertiary border border-border-subtle flex items-center justify-center touch-target"
        >
          <SettingsIcon size={16} className="text-text-secondary" />
        </button>
      </div>

      {/* ChatPanel renders AiEmptyState itself when not configured — the same
          status-aware presentation ChatSheet and ChatLauncher use, so a
          first-time visitor landing here with nothing set up sees exactly
          the same guidance (and the same "Open Settings" CTA) as everywhere
          else in the app. */}
      <ChatPanel className="flex-1" />
    </div>
  );
}
