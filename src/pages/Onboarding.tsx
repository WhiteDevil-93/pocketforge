// ============================================================================
// PocketForge — Onboarding / Splash Screen
// ============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, BarChart3, ArrowLeftRight, ChevronDown, Gamepad2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getFormatsGrouped } from '../data';
import type { Format } from '../types';

const FEATURES = [
  {
    icon: Smartphone,
    iconColor: 'text-accent-primary',
    title: 'Build teams on the go',
    description: 'Create and edit competitive Pokemon teams from anywhere, even offline.',
  },
  {
    icon: BarChart3,
    iconColor: 'text-accent-secondary',
    title: 'Smart analysis',
    description: 'Check type coverage, team synergy, and get suggestions to strengthen your squad.',
  },
  {
    icon: ArrowLeftRight,
    iconColor: 'text-success',
    title: 'Import & export',
    description: 'Fully compatible with Pokemon Showdown and PokePaste formats.',
  },
];

const ANIMATION_CONFIG = {
  spring: { type: 'spring' as const, stiffness: 300, damping: 24 },
  easeSmooth: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  easeSpring: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
};

function AnimatedPokeball() {
  return (
    <motion.div
      className="relative w-[180px] h-[180px]"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ ...ANIMATION_CONFIG.spring, delay: 0 }}
    >
      {/* Floating animation wrapper */}
      <motion.div
        className="w-full h-full"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Slow rotation */}
        <motion.div
          className="w-full h-full rounded-full overflow-hidden border-4 border-white/20 shadow-lg"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          {/* Top half - red */}
          <div
            className="w-full h-1/2"
            style={{ background: 'linear-gradient(180deg, #EF4444 0%, #DC2626 100%)' }}
          />
          {/* Bottom half - white */}
          <div className="w-full h-1/2 bg-slate-100" />
          {/* Middle line */}
          <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-800 -translate-y-1/2 z-10" />
          {/* Center button */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-8 h-8 rounded-full bg-white border-3 border-slate-800 flex items-center justify-center shadow-md">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-800" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function FormatPicker({
  selectedFormat,
  onSelect,
}: {
  selectedFormat: string;
  onSelect: (formatId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const grouped = getFormatsGrouped();

  const filteredGroups = Object.entries(grouped)
    .sort(([a], [b]) => parseInt(b) - parseInt(a))
    .map(([gen, formats]) => ({
      generation: parseInt(gen),
      formats: formats.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(g => g.formats.length > 0);

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full h-12 px-4 bg-bg-secondary rounded-card-md border border-border-subtle"
      >
        <div className="flex items-center gap-3">
          <Gamepad2 size={20} className="text-text-secondary" />
          <span className="font-body-medium text-text-primary">
            {selectedFormat}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="text-text-tertiary" />
        </motion.div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-bg-tertiary rounded-t-sheet max-h-[70vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-9 h-1 rounded-full bg-text-tertiary/50" />
              </div>

              <div className="px-4 pb-2">
                <h3 className="font-headline text-text-primary mb-3">Select Format</h3>

                {/* Search */}
                <input
                  type="text"
                  placeholder="Search formats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 px-3 bg-bg-secondary rounded-lg text-text-primary placeholder:text-text-tertiary text-sm border border-border-subtle focus:border-accent-primary focus:outline-none mb-3"
                />
              </div>

              {filteredGroups.map(({ generation, formats }) => (
                <div key={generation}>
                  <div className="sticky top-0 px-4 py-2 bg-bg-tertiary/95 backdrop-blur border-b border-border-subtle">
                    <span className="font-caption text-text-secondary uppercase tracking-wider">
                      Generation {generation}
                    </span>
                  </div>
                  {formats.map((format: Format) => (
                    <button
                      key={format.id}
                      onClick={() => {
                        onSelect(format.name);
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-between w-full px-4 py-3 hover:bg-bg-elevated transition-colors"
                    >
                      <span className="font-body text-text-primary">{format.name}</span>
                      {selectedFormat === format.name && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              ))}

              <div className="pb-safe h-4" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const [selectedFormat, setSelectedFormat] = useState('Gen 9 OU');

  const handleGetStarted = () => {
    // Find the format ID from the name
    const grouped = getFormatsGrouped();
    let formatId = 'gen9ou';
    for (const [, formats] of Object.entries(grouped)) {
      const found = formats.find(f => f.name === selectedFormat);
      if (found) {
        formatId = found.id;
        break;
      }
    }
    completeOnboarding(formatId);
    navigate('/teams', { replace: true });
  };

  const handleSkip = () => {
    completeOnboarding('gen9ou');
    navigate('/teams', { replace: true });
  };

  return (
    <div className="min-h-[100dvh] bg-bg-primary flex flex-col items-center px-6 py-10 overflow-y-auto">
      {/* Logo area */}
      <div className="flex flex-col items-center mt-8 mb-6">
        <AnimatedPokeball />

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: ANIMATION_CONFIG.easeSmooth }}
        >
          <h1
            className="font-space-grotesk text-[28px] font-bold tracking-[0.15em] text-text-primary"
          >
            POCKETFORGE
          </h1>
        </motion.div>

        <motion.p
          className="font-body text-text-secondary mt-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: ANIMATION_CONFIG.easeSmooth }}
        >
          Teambuilder
        </motion.p>
      </div>

      {/* Divider */}
      <motion.div
        className="w-full h-px bg-border-subtle my-4"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      />

      {/* Feature cards */}
      <div className="w-full space-y-3 mt-2">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              className="flex items-start gap-4 w-full p-4 bg-bg-secondary rounded-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.2,
                delay: 0.5 + index * 0.05,
                ease: ANIMATION_CONFIG.easeSmooth,
              }}
            >
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                <Icon size={24} className={feature.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-subtitle text-text-primary">{feature.title}</h3>
                <p className="font-body text-text-secondary mt-0.5 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Divider */}
      <motion.div
        className="w-full h-px bg-border-subtle my-5"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      />

      {/* Format selection */}
      <motion.div
        className="w-full space-y-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8, ease: ANIMATION_CONFIG.easeSmooth }}
      >
        <p className="font-body text-text-secondary">Choose your default format</p>
        <FormatPicker selectedFormat={selectedFormat} onSelect={setSelectedFormat} />
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        className="w-full mt-6 space-y-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.85, ease: ANIMATION_CONFIG.easeSmooth }}
      >
        <motion.button
          onClick={handleGetStarted}
          className="w-full h-[52px] rounded-card-md font-body-medium text-white flex items-center justify-center"
          style={{
            background: 'linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
          }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          Get Started
        </motion.button>

        <button
          onClick={handleSkip}
          className="w-full h-10 font-body text-text-tertiary hover:text-text-secondary transition-colors"
        >
          Skip for now
        </button>
      </motion.div>

      {/* Bottom spacing */}
      <div className="h-6" />
    </div>
  );
}
