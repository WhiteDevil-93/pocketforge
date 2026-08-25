// ============================================================================
// PocketForge — AI chat launcher (opens the assistant from outside Settings)
// ============================================================================

import { lazy, Suspense, useState } from 'react';
import { Loader2, MessageCircle } from 'lucide-react';
import { useAiReadiness } from '../../hooks/use-ai-readiness';
import ChatSheetLoadingFallback from './ChatSheetLoadingFallback';

// Lazy for the same reason SettingsPage does it: ChatSheet statically reaches
// ollamaCloud.ts and the full tool registry (calculators, movepool queries,
// mega/champions data). Any page that merely offers the button would otherwise
// pull all of that into its chunk.
const ChatSheet = lazy(() => import('./ChatSheet'));

interface ChatLauncherProps {
  /** Extra classes for the trigger button, for per-page placement. */
  className?: string;
}

/**
 * Renders nothing unless the assistant is at least on its way to usable, so
 * pages can drop it in unconditionally. A dead button that opens a sheet
 * saying "not configured" is worse than no button — Settings is where you go
 * to fix that, and Settings already explains what is missing. 'starting' is
 * the one exception: a server mid-load isn't a fixable problem the way "no
 * model imported" is, so instead of vanishing (and reappearing once ready,
 * with no visible reason why) the pill stays up, disabled, saying so.
 */
export default function ChatLauncher({ className = '' }: ChatLauncherProps) {
  const { status } = useAiReadiness();
  const [isOpen, setIsOpen] = useState(false);
  // Once true, stays true for the rest of the session — gates whether the lazy
  // chunk is fetched at all, independent of isOpen's open/close toggling (which
  // drives the sheet's slide in/out animation).
  const [hasOpened, setHasOpened] = useState(false);

  if (status !== 'ready' && status !== 'starting') return null;

  if (status === 'starting') {
    return (
      <button
        type="button"
        disabled
        aria-label="AI assistant is starting"
        className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-medium border border-border-subtle text-text-tertiary bg-bg-tertiary opacity-70 touch-target shrink-0 ${className}`}
      >
        <Loader2 size={14} className="animate-spin" />
        AI loading…
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setHasOpened(true);
          setIsOpen(true);
        }}
        aria-label="Ask the AI assistant about this team"
        className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-medium border border-accent-primary/50 text-accent-primary bg-accent-primary/10 active:bg-accent-primary/20 transition-colors touch-target shrink-0 ${className}`}
      >
        <MessageCircle size={14} />
        Ask AI
      </button>
      {hasOpened && (
        <Suspense fallback={<ChatSheetLoadingFallback />}>
          <ChatSheet isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
