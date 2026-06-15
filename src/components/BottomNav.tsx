// ============================================================================
// PocketForge — Bottom Navigation (4 tabs)
// ============================================================================

import { Link, useLocation } from 'react-router';
import { Users, Wrench, BarChart3, Calculator as CalculatorIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { springSnappy, springTap } from '../lib/motion';

const TABS = [
  { path: '/teams', label: 'Teams', icon: Users },
  { path: '/builder', label: 'Builder', icon: Wrench },
  { path: '/calc', label: 'Calc', icon: CalculatorIcon },
  { path: '/analysis', label: 'Analysis', icon: BarChart3 },
] as const;

const INDICATOR_WIDTH = 48; // px — matches w-12

export default function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;
  const activeIndex = TABS.findIndex(
    (tab) => currentPath === tab.path || currentPath.startsWith(`${tab.path}/`)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-tertiary/95 backdrop-blur-xl border-t border-border-subtle pb-safe">
      <div className="relative h-space-16 max-w-lg mx-auto grid grid-cols-4">
        {activeIndex >= 0 && (
          <motion.div
            className="pointer-events-none absolute top-0 h-0.5 rounded-full bg-accent-primary"
            style={{
              width: INDICATOR_WIDTH,
              boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)',
            }}
            animate={{
              left: `calc(${(activeIndex + 0.5) / TABS.length * 100}% - ${INDICATOR_WIDTH / 2}px)`,
            }}
            transition={springSnappy}
          />
        )}

        {TABS.map((tab) => {
          const isActive = currentPath === tab.path || currentPath.startsWith(`${tab.path}/`);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex min-w-0 flex-col items-center justify-center gap-0.5 px-1"
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                transition={springTap}
                className="flex items-center justify-center"
              >
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={isActive ? 'text-accent-primary' : 'text-text-tertiary'}
                />
              </motion.div>

              <span
                className={`font-micro leading-none whitespace-nowrap ${
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