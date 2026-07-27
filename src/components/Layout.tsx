// ============================================================================
// PocketForge — App Layout with BottomNav and page transitions
// ============================================================================

import type { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
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
    <MotionConfig reducedMotion="user">
      <div className="min-h-[100dvh] flex flex-col relative">
        <a
          href="#main-content"
          className="fixed left-3 top-3 z-[100] -translate-y-20 rounded-lg bg-accent-primary px-4 py-2 font-body-medium text-white transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        {/* Main content area */}
        <main
          id="main-content"
          tabIndex={-1}
          className={`flex-1 ${showNav ? 'pb-[calc(4rem+env(safe-area-inset-bottom,0px))]' : ''}`}
        >
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
    </MotionConfig>
  );
}
