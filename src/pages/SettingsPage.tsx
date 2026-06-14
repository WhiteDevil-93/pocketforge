// ============================================================================
// PocketForge — Settings Page (placeholder)
// ============================================================================

export default function SettingsPage() {
  return (
    <div className="min-h-[100dvh] px-4 py-6">
      <h1 className="font-display text-text-primary mb-6">Settings</h1>
      <div className="space-y-3">
        {['Appearance', 'Default Format', 'Data Management', 'About'].map((section) => (
          <div
            key={section}
            className="flex items-center justify-between h-14 px-4 bg-bg-secondary rounded-card border border-border-subtle"
          >
            <span className="font-body-medium text-text-primary">{section}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
