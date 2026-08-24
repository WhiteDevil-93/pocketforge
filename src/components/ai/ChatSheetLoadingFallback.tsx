// ============================================================================
// PocketForge — Placeholder shown while the lazy ChatSheet chunk downloads
// ============================================================================
//
// ChatSheet is lazy-loaded (see ChatLauncher.tsx's comment on why) and both of
// its mount points previously used <Suspense fallback={null}>, so the very
// first tap on "Ask AI" / "Chat" could show nothing at all for however long
// the chunk takes to fetch. This mirrors BottomSheet's own backdrop + sheet
// layering (same z-indexes) so it reads as "the sheet is opening", not as a
// frozen tap.

import { Loader2 } from 'lucide-react';

export default function ChatSheetLoadingFallback() {
  return (
    <>
      <div className="fixed inset-0 z-[90] sheet-backdrop" />
      <div
        className="fixed left-0 right-0 bottom-0 z-[100] bg-bg-tertiary rounded-t-3xl shadow-2xl flex items-center justify-center gap-2 py-10"
        role="status"
        aria-label="Loading AI Assistant"
      >
        <Loader2 size={18} className="animate-spin text-accent-primary" />
        <span className="text-sm text-text-secondary">Loading…</span>
      </div>
    </>
  );
}
