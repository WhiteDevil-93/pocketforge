// ============================================================================
// PocketForge — Reusable Bottom Sheet Component
// ============================================================================

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  children: React.ReactNode;
  showSearch?: boolean;
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

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="fixed inset-0 z-[60] sheet-backdrop"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-bg-tertiary rounded-t-3xl max-h-[85vh] flex flex-col"
            style={{ willChange: 'transform' }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2 px-4">
              <div className="w-9 h-1 rounded-full bg-text-tertiary/50" />
            </div>

            {/* Header */}
            <div className="px-4 pb-3 flex items-center justify-between">
              <h2 className="font-headline text-lg text-text-primary">{title}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-elevated touch-target"
              >
                <X size={16} className="text-text-secondary" />
              </button>
            </div>

            {/* Search */}
            {showSearch && (
              <div className="px-4 pb-3">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={searchPlaceholder}
                    className="w-full h-12 pl-10 pr-10 bg-bg-secondary rounded-xl text-text-primary placeholder-text-tertiary outline-none border border-border-subtle focus:border-accent-primary/50 transition-colors"
                    style={{ fontSize: '16px' }}
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X size={16} className="text-text-tertiary" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-6 overscroll-contain">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
