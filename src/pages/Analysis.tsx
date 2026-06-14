// ============================================================================
// PocketForge — Team Analysis Page (placeholder)
// ============================================================================

export default function Analysis() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-bg-tertiary mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
        </div>
        <h2 className="font-headline text-text-primary mb-2">Team Analysis</h2>
        <p className="font-body text-text-secondary">Select a team to view type coverage and synergy analysis.</p>
      </div>
    </div>
  );
}
