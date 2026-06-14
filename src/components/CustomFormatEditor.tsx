// ============================================================================
// PocketForge — Custom Format Editor (Full-Screen Modal)
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Plus,
  Check,
} from 'lucide-react';
import type { CustomFormat } from '../types';

// ---- Constants --------------------------------------------------------------

const AVAILABLE_RULES = [
  { id: 'species-clause', label: 'Species' },
  { id: 'item-clause', label: 'Item' },
  { id: 'ohko-clause', label: 'OHKO' },
  { id: 'evasion-clause', label: 'Evasion' },
  { id: 'sleep-clause-mod', label: 'Sleep' },
  { id: 'mega-once', label: 'Mega' },
  { id: 'tera-allow', label: 'Tera' },
  { id: 'level-5', label: 'Level 5' },
  { id: 'endless-battle-clause', label: 'Endless' },
  { id: 'dynamax-clause', label: 'Dynamax' },
  { id: 'z-move-allow', label: 'Z-Moves' },
] as const;

const GENERATIONS = [
  { value: 9, label: 'Gen 9 (Scarlet/Violet)' },
  { value: 8, label: 'Gen 8 (Sword/Shield)' },
  { value: 7, label: 'Gen 7 (Sun/Moon)' },
  { value: 6, label: 'Gen 6 (X/Y)' },
  { value: 5, label: 'Gen 5 (Black/White)' },
  { value: 4, label: 'Gen 4 (D/P/Pt)' },
  { value: 3, label: 'Gen 3 (R/S/E)' },
  { value: 2, label: 'Gen 2 (G/S/C)' },
  { value: 1, label: 'Gen 1 (R/B/Y)' },
];

interface Template {
  name: string;
  rules: string[];
  generation: number;
}

const TEMPLATES: Template[] = [
  {
    name: 'Champions M-A',
    rules: ['species-clause', 'item-clause', 'tera-allow'],
    generation: 9,
  },
  {
    name: 'Gen 9 OU',
    rules: ['species-clause', 'sleep-clause-mod', 'ohko-clause', 'tera-allow'],
    generation: 9,
  },
  {
    name: 'VGC Reg I',
    rules: ['species-clause', 'item-clause', 'tera-allow', 'mega-once'],
    generation: 9,
  },
  {
    name: 'Blank',
    rules: [],
    generation: 9,
  },
];

// ---- Props ------------------------------------------------------------------

interface CustomFormatEditorProps {
  isOpen: boolean;
  onClose: () => void;
  editingFormat?: CustomFormat | null;
  onSave: (format: Omit<CustomFormat, 'id' | 'createdAt'>) => void;
}

// ---- Component --------------------------------------------------------------

export default function CustomFormatEditor({
  isOpen,
  onClose,
  editingFormat,
  onSave,
}: CustomFormatEditorProps) {
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [generation, setGeneration] = useState(9);
  const [rules, setRules] = useState<string[]>([]);
  const [restrictedDexEnabled, setRestrictedDexEnabled] = useState(false);
  const [restrictedDexInput, setRestrictedDexInput] = useState('');
  const [showGenDropdown, setShowGenDropdown] = useState(false);
  const [showRestricted, setShowRestricted] = useState(false);
  const [nameError, setNameError] = useState('');

  // Parse restricted dex
  const restrictedDex = useMemo(() => {
    if (!restrictedDexInput.trim()) return [];
    return restrictedDexInput
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [restrictedDexInput]);

  // Load editing format
  useEffect(() => {
    if (editingFormat) {
      setName(editingFormat.name);
      setDescription(editingFormat.description || '');
      setGeneration(editingFormat.generation || 9);
      setRules(editingFormat.rules || []);
      if (editingFormat.restrictedDex && editingFormat.restrictedDex.length > 0) {
        setRestrictedDexEnabled(true);
        setRestrictedDexInput(editingFormat.restrictedDex.join(', '));
        setShowRestricted(true);
      } else {
        setRestrictedDexEnabled(false);
        setRestrictedDexInput('');
        setShowRestricted(false);
      }
      setNameError('');
    } else {
      // Reset for new format
      setName('');
      setDescription('');
      setGeneration(9);
      setRules([]);
      setRestrictedDexEnabled(false);
      setRestrictedDexInput('');
      setShowRestricted(false);
      setShowGenDropdown(false);
      setNameError('');
    }
  }, [editingFormat, isOpen]);

  // Toggle rule
  const toggleRule = useCallback((ruleId: string) => {
    setRules((prev) =>
      prev.includes(ruleId) ? prev.filter((r) => r !== ruleId) : [...prev, ruleId]
    );
  }, []);

  // Apply template
  const applyTemplate = useCallback((template: Template) => {
    setRules(template.rules);
    setGeneration(template.generation);
  }, []);

  // Save
  const handleSave = useCallback(() => {
    if (!name.trim()) {
      setNameError('Format name is required');
      return;
    }
    setNameError('');
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      generation,
      rules,
      restrictedDex: restrictedDexEnabled ? restrictedDex : undefined,
    });
    onClose();
  }, [name, description, generation, rules, restrictedDexEnabled, restrictedDex, onSave, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-50 bg-bg-primary flex flex-col"
          style={{ background: '#0A0E1A' }}
        >
          {/* ---- Top Bar ---- */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-border-subtle shrink-0">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors touch-target"
            >
              <ArrowLeft size={22} />
              <span className="font-body-medium">
                {editingFormat ? 'Edit Format' : 'New Custom Format'}
              </span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-accent-primary text-white font-body-medium text-sm touch-target"
            >
              <Save size={16} />
              Save
            </button>
          </div>

          {/* ---- Scrollable Content ---- */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
            {/* Name */}
            <div>
              <label className="font-caption text-text-secondary block mb-2">
                Format Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim()) setNameError('');
                }}
                placeholder="e.g., My Custom VGC Format"
                className={`w-full h-12 px-4 rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 bg-bg-tertiary ${
                  nameError
                    ? 'border border-danger focus:ring-danger/50'
                    : 'focus:ring-accent-primary/50'
                }`}
              />
              {nameError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-danger mt-1.5"
                >
                  {nameError}
                </motion.p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="font-caption text-text-secondary block mb-2">
                Description <span className="text-text-tertiary">(optional)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of your format..."
                className="w-full h-12 px-4 rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 bg-bg-tertiary"
              />
            </div>

            {/* Generation */}
            <div className="relative">
              <label className="font-caption text-text-secondary block mb-2">
                Generation
              </label>
              <button
                onClick={() => setShowGenDropdown(!showGenDropdown)}
                className="w-full h-12 px-4 rounded-xl bg-bg-tertiary text-sm text-text-primary flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
              >
                <span>{GENERATIONS.find((g) => g.value === generation)?.label}</span>
                <ChevronDown
                  size={18}
                  className={`text-text-tertiary transition-transform ${showGenDropdown ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {showGenDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-bg-elevated rounded-xl border border-border-subtle overflow-hidden z-20 shadow-card"
                  >
                    {GENERATIONS.map((gen) => (
                      <button
                        key={gen.value}
                        onClick={() => {
                          setGeneration(gen.value);
                          setShowGenDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                          generation === gen.value
                            ? 'bg-accent-primary/15 text-accent-primary font-medium'
                            : 'text-text-primary hover:bg-bg-tertiary'
                        }`}
                      >
                        {gen.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Rules Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-accent-primary" />
                <span className="font-caption text-text-secondary uppercase tracking-wider">
                  Rules
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_RULES.map((rule) => {
                  const isActive = rules.includes(rule.id);
                  return (
                    <button
                      key={rule.id}
                      onClick={() => toggleRule(rule.id)}
                      className={`relative h-12 min-h-[48px] px-4 rounded-xl font-body-medium text-sm transition-all duration-150 active:scale-95 ${
                        isActive
                          ? 'bg-accent-primary text-white shadow-fab'
                          : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isActive && <Check size={14} />}
                        {rule.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {rules.length > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-text-tertiary mt-2"
                >
                  {rules.length} rule{rules.length !== 1 ? 's' : ''} active
                </motion.p>
              )}
            </div>

            {/* Restricted Dex — Collapsible */}
            <div className="border border-border-subtle rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowRestricted(!showRestricted)}
                className="flex items-center justify-between w-full px-4 py-3.5 text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      restrictedDexEnabled ? 'bg-accent-primary/15' : 'bg-bg-tertiary'
                    }`}
                  >
                    {restrictedDexEnabled ? (
                      <Check size={18} className="text-accent-primary" />
                    ) : (
                      <Plus size={18} className="text-text-tertiary" />
                    )}
                  </div>
                  <div>
                    <span className="font-body-medium text-text-primary block">
                      Restricted Pokédex
                    </span>
                    <span className="text-xs text-text-tertiary">
                      Limit to specific Pokémon
                    </span>
                  </div>
                </div>
                {showRestricted ? (
                  <ChevronUp size={18} className="text-text-tertiary" />
                ) : (
                  <ChevronDown size={18} className="text-text-tertiary" />
                )}
              </button>

              <AnimatePresence>
                {showRestricted && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-border-subtle pt-3">
                      {/* Enable toggle */}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <button
                          onClick={() => setRestrictedDexEnabled(!restrictedDexEnabled)}
                          className={`relative w-[52px] h-[28px] rounded-full transition-colors duration-200 shrink-0 ${
                            restrictedDexEnabled ? 'bg-accent-primary' : 'bg-bg-tertiary'
                          }`}
                        >
                          <motion.div
                            className="absolute top-[2px] w-6 h-6 rounded-full bg-white shadow-md"
                            animate={{ left: restrictedDexEnabled ? 26 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                        <span className="text-sm text-text-secondary">
                          Enable restricted Pokédex
                        </span>
                      </label>

                      {/* Input area */}
                      <AnimatePresence>
                        {restrictedDexEnabled && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <textarea
                              value={restrictedDexInput}
                              onChange={(e) => setRestrictedDexInput(e.target.value)}
                              placeholder="Paste Pokémon names, comma-separated...&#10;e.g. Miraidon, Koraidon, Iron Hands"
                              rows={4}
                              className="w-full px-4 py-3 rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 bg-bg-tertiary resize-none"
                            />
                            <p className="text-xs text-text-tertiary mt-1.5">
                              <span className="font-jetbrains-mono text-accent-secondary">
                                {restrictedDex.length}
                              </span>{' '}
                              Pokémon in roster
                            </p>
                            {restrictedDex.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {restrictedDex.slice(0, 20).map((name) => (
                                  <span
                                    key={name}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-accent-primary/10 text-accent-primary text-xs font-medium"
                                  >
                                    {name}
                                  </span>
                                ))}
                                {restrictedDex.length > 20 && (
                                  <span className="px-2 py-1 text-xs text-text-tertiary">
                                    +{restrictedDex.length - 20} more
                                  </span>
                                )}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Templates Section */}
            <div>
              <span className="font-caption text-text-secondary uppercase tracking-wider block mb-3">
                Templates
              </span>
              <div className="grid grid-cols-2 gap-3">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => applyTemplate(template)}
                    className="flex flex-col items-start p-4 rounded-2xl bg-bg-tertiary hover:bg-bg-elevated transition-colors text-left active:scale-[0.97]"
                  >
                    <span className="font-body-medium text-text-primary text-sm">
                      {template.name}
                    </span>
                    <span className="text-xs text-text-tertiary mt-1">
                      {template.rules.length > 0
                        ? `${template.rules.length} rules`
                        : 'No rules'}
                    </span>
                    <span className="text-[10px] text-text-tertiary mt-0.5">
                      Gen {template.generation}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom spacer */}
            <div className="h-8" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
