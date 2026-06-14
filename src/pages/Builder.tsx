// ============================================================================
// PocketForge — Team Builder Page (placeholder)
// ============================================================================

export default function Builder() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-bg-tertiary mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        <h2 className="font-headline text-text-primary mb-2">Team Builder</h2>
        <p className="font-body text-text-secondary">Select a team to start building.</p>
      </div>
    </div>
  );
}
