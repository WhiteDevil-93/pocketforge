// ============================================================================
// PocketForge — Reusable Bottom Sheet Component
// ============================================================================

import { useState, useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useVisualViewport } from '../hooks/use-visual-viewport';
import { pushBackGuard } from '../hooks/use-back-guard';
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

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    setSearchQuery('');
    onSearch?.('');
    onClose();
  }, [onClose, onSearch]);

  // Read by the effect below without re-subscribing its keydown/back-guard
  // listeners on every render that changes handleClose's identity.
  const handleCloseRef = useRef(handleClose);
  useEffect(() => {
    handleCloseRef.current = handleClose;
  }, [handleClose]);

  // Dialog semantics: lock scroll, move focus in, trap Tab, close on Escape
  // or Android hardware back, restore focus to whatever opened the sheet.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const container = sheetRef.current;
      if (!container) return;
      const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Sheets are overlays, not routes — without this, Android's hardware
    // back would navigate the page underneath instead of closing the sheet
    // (see use-back-guard.ts).
    const popBackGuard = pushBackGuard(() => {
      handleCloseRef.current();
      return true;
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      popBackGuard();
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen]);

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
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
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
              <h2 id={titleId} className="font-headline text-lg text-text-primary">{title}</h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleClose}
                aria-label={`Close ${title}`}
                title="Close"
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
                      aria-label="Clear search"
                      title="Clear search"
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
