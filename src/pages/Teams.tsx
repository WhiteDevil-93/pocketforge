// ============================================================================
// PocketForge — Teams List Page (placeholder)
// ============================================================================

export default function Teams() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-bg-tertiary mb-4">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h2 className="font-display text-text-primary mb-2">No Teams Yet</h2>
        <p className="font-body text-text-secondary max-w-[280px] mb-6">
          Create your first competitive team and start building.
        </p>
        <button
          className="h-[48px] px-6 rounded-card-md font-body-medium text-white bg-accent-primary hover:bg-accent-primary/90 transition-colors"
          style={{ boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)' }}
        >
          + Create Your First Team
        </button>
      </div>
    </div>
  );
}
