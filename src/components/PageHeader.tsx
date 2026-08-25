// ============================================================================
// PocketForge — Page header with back + home navigation
// ============================================================================

import { useNavigate } from 'react-router';
import { ArrowLeft, Home } from 'lucide-react';
import { HOME_PATH } from '../lib/routes';
import { canGoBackInApp } from '../hooks/use-navigation-depth';

interface PageHeaderProps {
  title: string;
  backTo?: string;
  backLabel?: string;
  showBack?: boolean;
  showHome?: boolean;
  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  backTo = HOME_PATH,
  backLabel,
  showBack = true,
  showHome = false,
  children,
}: PageHeaderProps) {
  const navigate = useNavigate();

  // A true "back": retrace the user's actual path when there is one (e.g.
  // Builder -> Analysis -> here), only falling back to the fixed `backTo`
  // destination when there's nothing to retrace (deep link, fresh launch).
  const handleBack = () => {
    if (canGoBackInApp()) navigate(-1);
    else navigate(backTo);
  };

  return (
    <header className="sticky top-0 z-40 h-[56px] flex items-center gap-2 px-4 bg-bg-primary/95 backdrop-blur-xl border-b border-border-subtle">
      {showBack ? (
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1 min-w-10 h-10 -ml-2 px-2 touch-target shrink-0"
          aria-label={backLabel || 'Back'}
        >
          <ArrowLeft size={20} className="text-text-primary" />
          {backLabel && (
            <span className="text-sm font-medium text-text-secondary">{backLabel}</span>
          )}
        </button>
      ) : (
        <div className="w-2 shrink-0" />
      )}

      <h1 className="font-title text-text-primary flex-1 truncate">{title}</h1>

      {children}

      {showHome && (
        <button
          type="button"
          onClick={() => navigate(HOME_PATH)}
          className="w-10 h-10 flex items-center justify-center rounded-full touch-target shrink-0"
          aria-label="Home"
        >
          <Home size={20} className="text-text-secondary" />
        </button>
      )}
    </header>
  );
}