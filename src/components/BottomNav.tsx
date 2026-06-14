// ============================================================================
// PocketForge — Bottom Navigation (4 tabs)
// ============================================================================

import { Link, useLocation } from 'react-router';
import { Users, Wrench, BarChart3, Calculator as CalculatorIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const TABS = [
  { path: '/teams', label: 'Teams', icon: Users },
  { path: '/builder', label: 'Builder', icon: Wrench },
  { path: '/calc', label: 'Calc', icon: CalculatorIcon },
  { path: '/analysis', label: 'Analysis', icon: BarChart3 },
];

export default function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-space-16 bg-bg-tertiary/95 backdrop-blur-xl border-t border-border-subtle pb-safe">
      <div className="flex items-center justify-around h-full max-w-lg mx-auto">
        {TABS.map((tab) => {
          const isActive = currentPath === tab.path || currentPath.startsWith(`${tab.path}/`);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="relative flex flex-col items-center justify-center w-20 h-full touch-target"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-glow"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-12 h-0.5 bg-accent-primary rounded-full"
                  style={{ boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <motion.div
                animate={{ scale: isActive ? 1 : 1 }}
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={isActive ? 'text-accent-primary' : 'text-text-tertiary'}
                />
              </motion.div>

              <span
                className={`font-micro mt-0.5 ${
                  isActive ? 'text-accent-primary' : 'text-text-tertiary'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
