// ============================================================================
// PocketForge — Custom Format Editor (Full-Screen Modal)
// ============================================================================

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Save, AlertTriangle } from 'lucide-react';
import type { CustomFormat } from '../types';

// ---- Rule definitions -------------------------------------------------------

const RULE_OPTIONS: { id: string; label: string }[] = [
  { id: 'species-clause', label: 'Species Clause' },
  { id: 'item-clause', label: 'Item Clause' },
  { id: 'ohko-clause', label: 'OHKO Clause' },
  { id: 'evasion-clause', label: 'Evasion Clause' },
  { id: 'sleep-clause-mod', label: 'Sleep Clause' },
  { id: 'mega-once', label: 'Mega Once' },
  { id: 'tera-allow', label: 'Terastallize' },
  { id: 'level-5', label: 'Level 5 (LC)' },
  { id: 'endless-battle-clause', label: 'Endless Battle' },
  { id: 'dynamax-clause', label: 'Dynamax' },
  { id: 'z-move-allow', label: 'Z-Moves' },
];

const TEMPLATES: { name: string; rules: string[]; gen: number; desc: string }[] = [
  {
    name: 'Champions M-A',
    rules: ['species-clause', 'item-clause', 'mega-once', 'sleep-clause-mod', 'ohko-clause', 'evasion-clause'],
    gen: 10,
    desc: 'Current regulation',
  },
  {
    name: 'Gen 9 OU',
    rules: ['species-clause', 'sleep-clause-mod', 'ohko-clause', 'evasion-clause', 'endless-battle-clause', 'tera-allow'],
    gen: 9,
    desc: 'Standard Smogon',
  },
  {
    name: 'VGC Reg I',
    rules: ['species-clause', 'item-clause', 'sleep-clause-mod', 'tera-allow', 'evasion-clause'],
    gen: 9,
    desc: 'Scarlet/Violet',
  },
  {
    name: 'Blank',
    rules: [],
    gen: 9,
    desc: 'Start from scratch',
  },
];

// ---- Component --------------------------------------------------------------

interface CustomFormatEditorProps {
  isOpen: boolean;
  onClose: () => void;
  editingFormat?: CustomFormat | null;
  onSave: (format: Omit<CustomFormat, 'id' | 'createdAt'>) => void;
}

export default function CustomFormatEditor({
  isOpen,
  onClose,
  editingFormat,
  onSave,
}: CustomFormatEditorProps) {
  const [name, setName] = useState(editingFormat?.name || '');
  const [description, setDescription] = useState(editingFormat?.description || '');
  const [generation, setGeneration] = useState(editingFormat?.generation || 9);
  const [activeRules, setActiveRules] = useState<Set<string>>(
    new Set(editingFormat?.rules || [])
  );
  const [useRestrictedDex, setUseRestrictedDex] = useState(
    (editingFormat?.restrictedDex?.length || 0) > 0
  );
  const [restrictedDexText, setRestrictedDexText] = useState(
    editingFormat?.restrictedDex?.join(', ') || ''
  );
  const [showError, setShowError] = useState(false);

  const toggleRule = useCallback((ruleId: string) => {
    setActiveRules((prev) => {
      const next = new Set(prev);
      if (next.has(ruleId)) next.delete(ruleId);
      else next.add(ruleId);
      return next;
    });
  }, []);

  const loadTemplate = useCallback(
    (template: (typeof TEMPLATES)[0]) => {
      setActiveRules(new Set(template.rules));
      setGeneration(template.gen);
    },
    []
  );

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }
    const restrictedDex = useRestrictedDex
      ? restrictedDexText
          .split(',')
          .map((s) => s.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''))
          .filter(Boolean)
      : undefined;
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      generation,
      rules: Array.from(activeRules),
      restrictedDex,
    });
    onClose();
  }, [name, description, generation, activeRules, useRestrictedDex, restrictedDexText, onSave, onClose]);

  const restrictedCount = useRestrictedDex
    ? restrictedDexText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean).length
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col bg-bg-primary"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
            <button
              onClick={onClose}
              className="flex items-center gap-1 text-text-secondary active:text-text-primary transition-colors"
            >
              <ChevronLeft size={20} />
              <span className="text-sm font-medium">Back</span>
            </button>
            <h1 className="absolute inset-x-0 text-center pointer-events-none text-title text-text-primary font-semibold">
              {editingFormat ? 'Edit Format' : 'New Format'}
            </h1>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-primary text-white text-sm font-medium active:scale-95 transition-transform"
            >
              <Save size={16} />
              Save
            </button>
          </div>

          {/* Error toast */}
          <AnimatePresence>
            {showError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-danger/10 border border-danger/30"
              >
                <AlertTriangle size={16} className="text-danger shrink-0" />
                <span className="text-sm text-danger">Format name is required</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-caption font-medium text-text-secondary uppercase tracking-wider">
                Format Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., My Custom Regulation"
                className="w-full h-12 px-4 rounded-xl bg-bg-secondary border border-border-subtle text-text-primary placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-caption font-medium text-text-secondary uppercase tracking-wider">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="w-full h-12 px-4 rounded-xl bg-bg-secondary border border-border-subtle text-text-primary placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Generation */}
            <div className="space-y-1.5">
              <label className="text-caption font-medium text-text-secondary uppercase tracking-wider">
                Generation
              </label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((gen) => (
                  <button
                    key={gen}
                    onClick={() => setGeneration(gen)}
                    className={`h-10 px-4 rounded-lg text-sm font-medium transition-colors ${
                      generation === gen
                        ? 'bg-accent-primary text-white'
                        : 'bg-bg-secondary text-text-secondary border border-border-subtle'
                    }`}
                  >
                    Gen {gen}
                  </button>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="space-y-2">
              <label className="text-caption font-medium text-text-secondary uppercase tracking-wider">
                Rules ({activeRules.size} active)
              </label>
              <div className="flex flex-wrap gap-2">
                {RULE_OPTIONS.map((rule) => {
                  const isActive = activeRules.has(rule.id);
                  return (
                    <motion.button
                      key={rule.id}
                      onClick={() => toggleRule(rule.id)}
                      whileTap={{ scale: 0.95 }}
                      className={`h-10 px-3 rounded-full text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-accent-primary text-white'
                          : 'bg-bg-secondary text-text-secondary border border-border-subtle'
                      }`}
                    >
                      {rule.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Restricted Dex */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-caption font-medium text-text-secondary uppercase tracking-wider">
                  Restricted Pokédex
                </label>
                <button
                  onClick={() => setUseRestrictedDex(!useRestrictedDex)}
                  className={`w-12 h-7 rounded-full transition-colors relative ${
                    useRestrictedDex ? 'bg-accent-primary' : 'bg-bg-elevated'
                  }`}
                >
                  <motion.div
                    className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow"
                    animate={{ x: useRestrictedDex ? 18 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              <AnimatePresence>
                {useRestrictedDex && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <textarea
                      value={restrictedDexText}
                      onChange={(e) => setRestrictedDexText(e.target.value)}
                      placeholder="Paste Pokémon names separated by commas..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-bg-secondary border border-border-subtle text-text-primary placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none transition-colors resize-none text-sm"
                    />
                    <p className="text-caption text-text-tertiary mt-1">
                      {restrictedCount} Pokémon in roster
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Templates */}
            <div className="space-y-2">
              <label className="text-caption font-medium text-text-secondary uppercase tracking-wider">
                Load from Template
              </label>
              <div className="grid grid-cols-2 gap-3">
                {TEMPLATES.map((template) => (
                  <motion.button
                    key={template.name}
                    onClick={() => loadTemplate(template)}
                    whileTap={{ scale: 0.96 }}
                    className="p-3 rounded-xl bg-bg-secondary border border-border-subtle text-left active:border-accent-primary/50 transition-colors"
                  >
                    <p className="text-sm font-semibold text-text-primary">{template.name}</p>
                    <p className="text-xs text-text-tertiary mt-0.5">{template.desc}</p>
                    <p className="text-xs text-accent-secondary mt-1">{template.rules.length} rules</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Bottom padding */}
            <div className="h-8" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
