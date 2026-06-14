// ============================================================================
// PocketForge — App Layout with BottomNav and page transitions
// ============================================================================

import type { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: ReactNode;
}

/** Routes that should NOT show the bottom navigation */
const HIDE_NAV_ROUTES = ['/onboarding', '/welcome'];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const showNav = !HIDE_NAV_ROUTES.some(route => location.pathname === route);

  return (
    <div className="min-h-[100dvh] flex flex-col relative">
      {/* Main content area */}
      <main className={`flex-1 ${showNav ? 'pb-space-16' : ''}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
            }}
            className="min-h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {showNav && <BottomNav />}
    </div>
  );
}
