// ============================================================================
// PocketForge — Reusable Bottom Sheet Component
// ============================================================================

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useVisualViewport } from '../hooks/use-visual-viewport';
import { transitionBackdrop, transitionSheet } from '../lib/motion';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  children: React.ReactNode;
  showSearch?: boolean;
}

function blurActiveElement() {
  const active = document.activeElement;
  if (active instanceof HTMLElement) {
    active.blur();
  }
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  searchPlaceholder = 'Search...',
  onSearch,
  children,
  showSearch = true,
}: BottomSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const viewport = useVisualViewport(isOpen);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      blurActiveElement();
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    blurActiveElement();
    onClose();
  }, [onClose]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      onSearch?.(value);
    },
    [onSearch]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    onSearch?.('');
  }, [onSearch]);

  const sheetMaxHeight = Math.min(viewport.height * 0.85, viewport.height - 16);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitionBackdrop}
            className="fixed inset-0 z-[90] sheet-backdrop"
            style={{ top: viewport.offsetTop }}
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={transitionSheet}
            className="fixed left-0 right-0 z-[100] bg-bg-tertiary rounded-t-3xl flex flex-col shadow-2xl"
            style={{
              bottom: viewport.offsetTop,
              maxHeight: sheetMaxHeight,
              willChange: 'transform',
            }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2 px-4 shrink-0">
              <div className="w-9 h-1 rounded-full bg-text-tertiary/50" />
            </div>

            {/* Header */}
            <div className="px-4 pb-3 flex items-center justify-between shrink-0">
              <h2 className="font-headline text-lg text-text-primary">{title}</h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-elevated touch-target"
              >
                <X size={16} className="text-text-secondary" />
              </button>
            </div>

            {/* Search */}
            {showSearch && (
              <div className="px-4 pb-3 shrink-0">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                  />
                  <input
                    type="search"
                    inputMode="search"
                    enterKeyHint="search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={searchPlaceholder}
                    className="w-full h-12 pl-10 pr-10 bg-bg-secondary rounded-xl text-text-primary placeholder-text-tertiary outline-none border border-border-subtle focus:border-accent-primary/50 transition-colors"
                    style={{ fontSize: '16px' }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 touch-target"
                    >
                      <X size={16} className="text-text-tertiary" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-safe overscroll-contain">
              <div className="pb-4">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}