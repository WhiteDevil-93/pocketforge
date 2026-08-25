// ============================================================================
// PocketForge — 404 Page
// ============================================================================

import { useNavigate } from 'react-router';
import { Compass } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { HOME_PATH } from '../lib/routes';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="That link doesn't lead anywhere in PocketForge. It may be out of date, or the page may have moved."
        action={{ label: 'Go to Teams', onClick: () => navigate(HOME_PATH, { replace: true }) }}
      />
    </div>
  );
}
