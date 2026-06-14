// ============================================================================
// PocketForge — Reusable Search Input Component
// ============================================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search teams...',
  autoFocus = false,
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleClear = useCallback(() => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [onChange]);

  return (
    <div
      className={`flex items-center gap-3 h-[48px] px-4 rounded-card-md bg-bg-tertiary border transition-colors duration-100 ${
        isFocused
          ? 'border-accent-primary/50'
          : 'border-border-subtle'
      }`}
    >
      <Search size={20} className="text-text-tertiary flex-shrink-0" />

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-text-primary font-input outline-none placeholder:text-text-tertiary"
      />

      <AnimatePresence>
        {value.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.1 }}
            onClick={handleClear}
            className="flex items-center justify-center w-8 h-8 rounded-full touch-target"
            aria-label="Clear search"
          >
            <X size={20} className="text-text-secondary" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
