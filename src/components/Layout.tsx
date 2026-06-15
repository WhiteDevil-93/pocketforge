// ============================================================================
// PocketForge — App Layout with BottomNav and page transitions
// ============================================================================

import type { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from './BottomNav';
import { transitionFast } from '../lib/motion';

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
      <main className={`flex-1 ${showNav ? 'pb-[calc(4rem+env(safe-area-inset-bottom,0px))]' : ''}`}>
        <AnimatePresence initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitionFast}
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
