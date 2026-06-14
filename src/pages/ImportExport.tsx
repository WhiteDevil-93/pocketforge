// ============================================================================
// PocketForge — Import/Export Page (placeholder)
// ============================================================================

export default function ImportExport() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-bg-tertiary mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
        </div>
        <h2 className="font-headline text-text-primary mb-2">Import / Export</h2>
        <p className="font-body text-text-secondary">Paste PS-format teams or export your teams.</p>
      </div>
    </div>
  );
}
