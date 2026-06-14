// ============================================================================
// PocketForge — Team Analysis Dashboard
// ============================================================================

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Zap,
  Shield,
  Swords,
  ArrowLeftRight,
  Layers,
  Minus,
  Trophy,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  getTeamOffensiveCoverage,
  getTeamDefensiveCoverage,
  getTeamBalanceScore,
  getCoverageGaps,
} from '../utils/typeChart';
import { getPokemonByName } from '../data/pokemonData';
import { TYPE_NAMES, getEffectiveness } from '../data/typesData';
import { calculateStat } from '../utils/statCalc';
import TypeCoverageChart from '../components/TypeCoverageChart';
import SynergyMatrix from '../components/SynergyMatrix';
import ScoreGauge from '../components/ScoreGauge';
import TypeBadge from '../components/TypeBadge';
import PokemonSprite from '../components/PokemonSprite';
import type { Team, Pokemon } from '../types';

// ---- Animation Variants -----------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
};

const easeSmooth = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

// ---- Accordion Section Component -------------------------------------------

function AccordionSection({
  title,
  children,
  defaultOpen = true,
  badge,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string | number;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div variants={itemVariants} className="mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-3 touch-target"
      >
        <div className="flex items-center gap-2">
          <span className="font-subtitle text-text-primary">{title}</span>
          {badge !== undefined && (
            <span className="text-[10px] font-jetbrains-mono text-text-secondary bg-bg-tertiary px-1.5 py-0.5 rounded">
              {badge}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="text-text-tertiary" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: easeSmooth }}
            className="overflow-hidden"
          >
            <div className="pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---- Speed Tier Bar --------------------------------------------------------

function SpeedTierBar({
  pokemon,
  index,
  maxSpeed,
}: {
  pokemon: Pokemon;
  index: number;
  maxSpeed: number;
}) {
  const dexEntry = getPokemonByName(pokemon.species);
  const baseSpeed = dexEntry?.baseStats.spe ?? 0;
  const calculatedSpeed = dexEntry
    ? calculateStat(baseSpeed, pokemon.evs.spe, pokemon.ivs.spe, pokemon.level, pokemon.nature, 'spe')
    : 0;
  const barWidth = maxSpeed > 0 ? (calculatedSpeed / maxSpeed) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3, ease: easeSmooth }}
      className="flex items-center gap-2 py-1.5"
    >
      <div className="w-20 shrink-0 flex items-center gap-1.5">
        <PokemonSprite name={pokemon.species} size={20} />
        <span className="text-[11px] text-text-primary truncate">
          {pokemon.nickname || pokemon.species}
        </span>
      </div>
      <span className="w-8 text-right text-[11px] font-jetbrains-mono text-text-secondary shrink-0">
        {calculatedSpeed}
      </span>
      <div className="flex-1 h-2 bg-bg-elevated rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #3B82F6 0%, #06B6D4 100%)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(barWidth, 100)}%` }}
          transition={{ delay: index * 0.08 + 0.1, duration: 0.8, ease: easeSmooth }}
        />
      </div>
      <span className="w-16 text-right text-[9px] text-text-tertiary shrink-0">
        {pokemon.nature}
      </span>
    </motion.div>
  );
}

// ---- Role Card --------------------------------------------------------------

function RoleCard({
  icon: Icon,
  count,
  label,
  color,
  delay,
}: {
  icon: React.ElementType;
  count: number;
  label: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay,
        duration: 0.3,
        ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
      }}
      className="flex flex-col items-center justify-center bg-bg-secondary rounded-xl border border-border-subtle p-3 gap-1"
    >
      <Icon size={24} style={{ color }} strokeWidth={1.5} />
      <span className="font-headline text-text-primary">{count}</span>
      <span className="text-[10px] text-text-secondary">{label}</span>
    </motion.div>
  );
}

// ---- Suggestion Card --------------------------------------------------------

function SuggestionCard({
  type,
  title,
  description,
  delay,
}: {
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  delay: number;
}) {
  const borderColor =
    type === 'warning' ? '#EAB308' : type === 'success' ? '#22C55E' : '#3B82F6';
  const Icon = type === 'warning' ? AlertTriangle : type === 'success' ? CheckCircle : Lightbulb;
  const iconColor = borderColor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: easeSmooth }}
      className="bg-bg-secondary rounded-xl p-3.5 border-l-[3px]"
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex items-start gap-2.5">
        <Icon size={16} style={{ color: iconColor }} className="mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-text-primary leading-snug">{title}</p>
          <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ---- Defensive Weakness Row ------------------------------------------------

function WeaknessRow({
  type,
  effectiveness,
  weakCount,
  resistCount,
}: {
  type: string;
  effectiveness: number;
  weakCount: number;
  resistCount: number;
}) {
  const severity =
    effectiveness >= 4 ? 'severe' : effectiveness >= 2 ? 'moderate' : 'low';
  const severityColor =
    severity === 'severe' ? '#EF4444' : severity === 'moderate' ? '#EAB308' : '#22C55E';

  return (
    <div className="flex items-center gap-2 py-1.5">
      <TypeBadge type={type} size="sm" />
      <span
        className="text-[11px] font-jetbrains-mono font-bold"
        style={{ color: severityColor }}
      >
        x{effectiveness.toFixed(2)}
      </span>
      <span className="text-[10px] text-text-secondary">
        {weakCount} weak / {resistCount} resist
      </span>
    </div>
  );
}

// ---- Team Header ------------------------------------------------------------

function TeamHeader({ team }: { team: Team }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: easeSmooth }}
      className="bg-bg-secondary rounded-2xl p-4 mx-0 border border-border-subtle"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-subtitle text-text-primary">{team.name}</h2>
          <span className="text-[11px] text-text-secondary">{team.format}</span>
        </div>
        <span
          className={`text-[11px] font-jetbrains-mono ${team.pokemon.length === 6 ? 'text-success' : 'text-warning'}`}
        >
          {team.pokemon.length}/6
        </span>
      </div>

      {/* Sprite strip */}
      <div className="flex items-center gap-1">
        {Array.from({ length: 6 }).map((_, i) => {
          const p = team.pokemon[i];
          return (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: i * 0.04,
                type: 'spring',
                stiffness: 400,
                damping: 20,
              }}
              className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center"
            >
              {p ? (
                <PokemonSprite name={p.species} size={32} />
              ) : (
                <Minus size={16} className="text-text-tertiary" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Edit button */}
      <button
        onClick={() => navigate(`/builder/${team.id}`)}
        className="flex items-center justify-center gap-1.5 w-full mt-3 py-2 rounded-lg bg-bg-tertiary text-accent-primary text-[12px] font-medium touch-target"
      >
        <span>Edit Team</span>
        <ChevronRight size={14} />
      </button>
    </motion.div>
  );
}

// ---- Empty State ------------------------------------------------------------

function EmptyState({ icon: Icon, title, description, action }: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: easeSmooth }}
      className="flex flex-col items-center justify-center text-center px-6 py-16"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-20 h-20 flex items-center justify-center rounded-2xl bg-bg-tertiary mb-4"
      >
        <Icon size={40} className="text-text-tertiary" strokeWidth={1.5} />
      </motion.div>
      <h2 className="font-display text-text-primary mb-2">{title}</h2>
      <p className="font-body text-text-secondary max-w-[280px] mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-accent-primary text-white rounded-xl font-medium text-sm touch-target"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}

// ---- Analysis Engine --------------------------------------------------------

interface AnalysisResult {
  coverage: Record<string, boolean>;
  defensive: Record<string, { weak: number; resist: number; immune: number; neutral: number }>;
  score: number;
  speedTiers: { pokemon: Pokemon; calculatedSpeed: number; baseSpeed: number }[];
  roles: { icon: React.ElementType; count: number; label: string; color: string }[];
  suggestions: { type: 'warning' | 'info' | 'success'; title: string; description: string }[];
  weaknesses: { type: string; effectiveness: number; weakCount: number; resistCount: number }[];
  resistances: { type: string; effectiveness: number }[];
}

function analyzeTeam(team: Team): AnalysisResult {
  const coverage = getTeamOffensiveCoverage(team);
  const defensive = getTeamDefensiveCoverage(team);
  const balanceScore = getTeamBalanceScore(team);
  const gaps = getCoverageGaps(team);

  // Speed tiers
  const speedTiers = team.pokemon
    .map((p) => {
      const dexEntry = getPokemonByName(p.species);
      const baseSpeed = dexEntry?.baseStats.spe ?? 0;
      const calculatedSpeed = dexEntry
        ? calculateStat(baseSpeed, p.evs.spe, p.ivs.spe, p.level, p.nature, 'spe')
        : 0;
      return { pokemon: p, calculatedSpeed, baseSpeed };
    })
    .sort((a, b) => b.calculatedSpeed - a.calculatedSpeed);

  // Roles
  const roles: AnalysisResult['roles'] = [];
  let offensiveCount = 0;
  let defensiveCount = 0;
  let speedControlCount = 0;
  let hazardCount = 0;
  let pivotCount = 0;

  for (const p of team.pokemon) {
    const dexEntry = getPokemonByName(p.species);
    if (!dexEntry) continue;

    // Offensive: high Atk or SpA investment
    if (p.evs.atk >= 200 || p.evs.spa >= 200) offensiveCount++;

    // Defensive: high bulk
    if (p.evs.hp >= 200 || (p.evs.def >= 200 && p.evs.spd >= 100)) defensiveCount++;

    // Speed control
    const speedMoves = ['Tailwind', 'Trick Room', 'Sticky Web', 'Thunder Wave', 'Icy Wind'];
    if (p.moves.some((m) => speedMoves.includes(m))) speedControlCount++;

    // Hazards
    const hazardMoves = ['Stealth Rock', 'Spikes', 'Toxic Spikes', 'Sticky Web'];
    if (p.moves.some((m) => hazardMoves.includes(m))) hazardCount++;

    // Pivot
    const pivotMoves = ['U-turn', 'Volt Switch', 'Parting Shot', 'Flip Turn'];
    if (p.moves.some((m) => pivotMoves.includes(m))) pivotCount++;
  }

  if (offensiveCount > 0) roles.push({ icon: Swords, count: offensiveCount, label: 'Offensive', color: '#EF4444' });
  if (defensiveCount > 0) roles.push({ icon: Shield, count: defensiveCount, label: 'Defensive', color: '#22C55E' });
  if (speedControlCount > 0) roles.push({ icon: Zap, count: speedControlCount, label: 'Speed Ctrl', color: '#EAB308' });
  if (hazardCount > 0) roles.push({ icon: Layers, count: hazardCount, label: 'Hazards', color: '#06B6D4' });
  if (pivotCount > 0) roles.push({ icon: ArrowLeftRight, count: pivotCount, label: 'Pivot', color: '#94A3B8' });

  // Ensure at least one role shows
  if (roles.length === 0 && team.pokemon.length > 0) {
    roles.push({ icon: Swords, count: team.pokemon.length, label: 'Mixed', color: '#3B82F6' });
  }

  // Weaknesses
  const weaknesses: AnalysisResult['weaknesses'] = [];
  const resistances: AnalysisResult['resistances'] = [];

  for (const type of TYPE_NAMES) {
    const stats = defensive[type];
    if (!stats) continue;
    const teamSize = team.pokemon.length;
    if (teamSize === 0) continue;

    // Calculate average effectiveness
    let totalMult = 0;
    for (const p of team.pokemon) {
      const dexEntry = getPokemonByName(p.species);
      if (!dexEntry) continue;
      totalMult += getEffectiveness(type, dexEntry.types);
    }
    const avgMult = totalMult / teamSize;

    if (avgMult > 1) {
      weaknesses.push({
        type,
        effectiveness: avgMult,
        weakCount: stats.weak,
        resistCount: stats.resist + stats.immune,
      });
    } else if (avgMult < 1) {
      resistances.push({ type, effectiveness: avgMult });
    }
  }

  weaknesses.sort((a, b) => b.effectiveness - a.effectiveness);
  resistances.sort((a, b) => a.effectiveness - b.effectiveness);

  // Suggestions
  const suggestions: AnalysisResult['suggestions'] = [];

  // Coverage gap suggestions
  if (gaps.uncoveredTypes.length > 0) {
    const importantTypes = ['Ice', 'Fighting', 'Ground', 'Fire', 'Water', 'Grass'].filter(
      (t) => gaps.uncoveredTypes.includes(t)
    );
    if (importantTypes.length > 0) {
      suggestions.push({
        type: 'warning',
        title: `Add ${importantTypes[0]} coverage`,
        description: `Your team can't hit ${importantTypes.join(', ')} types super-effectively. Consider adding a Pokemon with ${importantTypes[0]}-type STAB moves.`,
      });
    }
  }

  // Weakness suggestions
  if (gaps.weakTypes.length > 0) {
    const topWeak = gaps.weakTypes.slice(0, 2);
    suggestions.push({
      type: 'warning',
      title: `Weak to ${topWeak.join(' and ')}`,
      description: `Multiple team members are vulnerable to ${topWeak[0]}-type attacks. Consider adding a resist.`,
    });
  }

  // Hazard suggestion
  if (hazardCount === 0 && team.pokemon.length >= 4) {
    suggestions.push({
      type: 'info',
      title: 'No hazard setter detected',
      description: 'Consider adding Stealth Rock or Spikes for passive chip damage.',
    });
  }

  // Speed control suggestion
  if (speedControlCount === 0 && team.pokemon.length >= 4) {
    suggestions.push({
      type: 'info',
      title: 'No speed control',
      description: 'Consider adding Tailwind, Trick Room, or paralysis support.',
    });
  }

  // Coverage success
  const coveredCount = Object.values(coverage).filter(Boolean).length;
  if (coveredCount >= 14) {
    suggestions.push({
      type: 'success',
      title: 'Great type coverage!',
      description: `Your team covers ${coveredCount}/18 types super-effectively.`,
    });
  }

  return {
    coverage,
    defensive,
    score: balanceScore,
    speedTiers,
    roles,
    suggestions,
    weaknesses: weaknesses.slice(0, 6),
    resistances: resistances.slice(0, 6),
  };
}

// ---- Main Analysis Page ----------------------------------------------------

export default function Analysis() {
  const navigate = useNavigate();
  const teams = useStore((s) => s.teams);
  const currentTeamId = useStore((s) => s.currentTeamId);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(currentTeamId || '');

  const selectedTeam = useMemo(
    () => teams.find((t) => t.id === selectedTeamId) || teams[0] || null,
    [teams, selectedTeamId]
  );

  const analysis = useMemo(
    () => (selectedTeam ? analyzeTeam(selectedTeam) : null),
    [selectedTeam]
  );

  // No teams at all
  if (teams.length === 0) {
    return (
      <div className="min-h-[100dvh] px-4">
        <div className="pt-4 pb-2">
          <h1 className="font-display text-text-primary">Team Analysis</h1>
        </div>
        <EmptyState
          icon={BarChart3}
          title="No Teams to Analyze"
          description="Create a team to see detailed analysis of type coverage, defensive synergy, and improvement suggestions."
          action={{ label: 'Go to Builder', onClick: () => navigate('/builder') }}
        />
      </div>
    );
  }

  // No Pokemon in selected team
  if (!selectedTeam || selectedTeam.pokemon.length === 0) {
    return (
      <div className="min-h-[100dvh] px-4">
        <div className="pt-4 pb-2">
          <h1 className="font-display text-text-primary">Team Analysis</h1>
        </div>
        <TeamSelector teams={teams} selectedId={selectedTeamId} onSelect={setSelectedTeamId} />
        <EmptyState
          icon={BarChart3}
          title="No Pokemon in Team"
          description="Add Pokemon to this team to see type coverage, defensive synergy, and improvement suggestions."
          action={{ label: 'Edit Team', onClick: () => selectedTeam && navigate(`/builder/${selectedTeam.id}`) }}
        />
      </div>
    );
  }

  const coveredCount = analysis ? Object.values(analysis.coverage).filter(Boolean).length : 0;

  return (
    <div className="min-h-[100dvh] px-4 pb-6">
      {/* Header */}
      <div className="pt-4 pb-2 flex items-center justify-between">
        <h1 className="font-display text-text-primary">Team Analysis</h1>
      </div>

      {/* Team Selector */}
      <TeamSelector teams={teams} selectedId={selectedTeam?.id || ''} onSelect={setSelectedTeamId} />

      {/* Team Header */}
      <div className="mb-4">
        <TeamHeader team={selectedTeam} />
      </div>

      {analysis && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Overall Score */}
          <motion.div variants={itemVariants} className="mb-4">
            <div className="bg-bg-secondary rounded-2xl border border-border-subtle p-4">
              <div className="flex items-center gap-4">
                <ScoreGauge score={analysis.score} size={120} strokeWidth={9} label="Score" />
                <div className="flex-1">
                  <h3 className="font-subtitle text-text-primary mb-2">Team Rating</h3>
                  <div className="space-y-1.5">
                    <ScoreBreakdown label="Coverage" score={(coveredCount / 18) * 100} color="#3B82F6" />
                    <ScoreBreakdown label="Defense" score={Math.max(0, 100 - analysis.weaknesses.length * 15)} color="#22C55E" />
                    <ScoreBreakdown label="Balance" score={analysis.roles.length >= 3 ? 80 : 50} color="#EAB308" />
                    <ScoreBreakdown label="Speed" score={analysis.speedTiers.length >= 2 ? 75 : 50} color="#F85888" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Type Coverage */}
          <motion.div variants={itemVariants}>
            <div className="bg-bg-secondary rounded-2xl border border-border-subtle px-4 mb-3">
              <AccordionSection title="Type Coverage" badge={`${coveredCount}/18`}>
                <TypeCoverageChart coverage={analysis.coverage} />

                {/* Covered types row */}
                <div className="mt-3">
                  <span className="text-[10px] text-text-secondary uppercase tracking-wide">Covered</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(analysis.coverage)
                      .filter(([, v]) => v)
                      .map(([type]) => (
                        <TypeBadge key={type} type={type} size="sm" />
                      ))}
                  </div>
                </div>

                {/* Missing types row */}
                {coveredCount < 18 && (
                  <div className="mt-2">
                    <span className="text-[10px] text-text-secondary uppercase tracking-wide">Missing</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(analysis.coverage)
                        .filter(([, v]) => !v)
                        .map(([type]) => (
                          <span
                            key={type}
                            className="inline-flex items-center h-6 px-2.5 rounded-full text-[10px] font-bold uppercase tracking-wide border border-dashed border-border-active text-text-tertiary bg-bg-elevated"
                          >
                            {type}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </AccordionSection>
            </div>
          </motion.div>

          {/* Defensive Synergy */}
          <motion.div variants={itemVariants}>
            <div className="bg-bg-secondary rounded-2xl border border-border-subtle px-4 mb-3">
              <AccordionSection title="Defensive Synergy">
                <SynergyMatrix team={selectedTeam} />

                {/* Weaknesses summary */}
                {analysis.weaknesses.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border-subtle">
                    <span className="text-[10px] text-danger uppercase tracking-wide font-medium">
                      Team Weaknesses
                    </span>
                    <div className="mt-1">
                      {analysis.weaknesses.map((w) => (
                        <WeaknessRow
                          key={w.type}
                          type={w.type}
                          effectiveness={w.effectiveness}
                          weakCount={w.weakCount}
                          resistCount={w.resistCount}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Resistances summary */}
                {analysis.resistances.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border-subtle">
                    <span className="text-[10px] text-success uppercase tracking-wide font-medium">
                      Team Resistances
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {analysis.resistances.map((r) => (
                        <div key={r.type} className="flex items-center gap-1">
                          <TypeBadge type={r.type} size="sm" />
                          <span className="text-[10px] font-jetbrains-mono text-success">
                            x{r.effectiveness.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </AccordionSection>
            </div>
          </motion.div>

          {/* Team Roles */}
          {analysis.roles.length > 0 && (
            <motion.div variants={itemVariants}>
              <div className="bg-bg-secondary rounded-2xl border border-border-subtle px-4 mb-3">
                <AccordionSection title="Role Distribution">
                  <div className="grid grid-cols-3 gap-2">
                    {analysis.roles.map((role, i) => (
                      <RoleCard
                        key={role.label}
                        icon={role.icon}
                        count={role.count}
                        label={role.label}
                        color={role.color}
                        delay={i * 0.06}
                      />
                    ))}
                  </div>
                </AccordionSection>
              </div>
            </motion.div>
          )}

          {/* Speed Tiers */}
          {analysis.speedTiers.length > 0 && (
            <motion.div variants={itemVariants}>
              <div className="bg-bg-secondary rounded-2xl border border-border-subtle px-4 mb-3">
                <AccordionSection title="Speed Benchmarks">
                  <div className="space-y-0.5">
                    {analysis.speedTiers.map((st, i) => (
                      <SpeedTierBar
                        key={st.pokemon.id}
                        pokemon={st.pokemon}
                        index={i}
                        maxSpeed={analysis.speedTiers[0]?.calculatedSpeed ?? 130}
                      />
                    ))}
                  </div>

                  {/* Benchmark note */}
                  <div className="mt-3 pt-2 border-t border-border-subtle flex items-center gap-1.5">
                    <Zap size={12} className="text-accent-primary" />
                    <span className="text-[10px] text-text-secondary">
                      Fastest: {analysis.speedTiers[0]?.pokemon.species} ({analysis.speedTiers[0]?.calculatedSpeed})
                    </span>
                  </div>
                </AccordionSection>
              </div>
            </motion.div>
          )}

          {/* Suggestions */}
          {analysis.suggestions.length > 0 && (
            <motion.div variants={itemVariants}>
              <div className="bg-bg-secondary rounded-2xl border border-border-subtle px-4 mb-3">
                <AccordionSection title="Improvement Suggestions" badge={analysis.suggestions.length}>
                  <div className="space-y-2 pb-2">
                    {analysis.suggestions.map((s, i) => (
                      <SuggestionCard
                        key={i}
                        type={s.type}
                        title={s.title}
                        description={s.description}
                        delay={i * 0.06}
                      />
                    ))}
                  </div>
                </AccordionSection>
              </div>
            </motion.div>
          )}

          {/* All good message */}
          {analysis.suggestions.filter((s) => s.type === 'warning').length === 0 &&
            analysis.suggestions.length > 0 && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 py-4"
            >
              <Trophy size={18} className="text-success" />
              <span className="text-sm font-medium text-success">
                Your team looks solid!
              </span>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Incomplete team note */}
      {selectedTeam && selectedTeam.pokemon.length < 6 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-[11px] text-text-tertiary mt-4"
        >
          Analysis based on {selectedTeam.pokemon.length}/6 Pokemon. Add more for complete analysis.
        </motion.p>
      )}
    </div>
  );
}

// ---- Team Selector Dropdown ------------------------------------------------

function TeamSelector({
  teams,
  selectedId,
  onSelect,
}: {
  teams: Team[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = teams.find((t) => t.id === selectedId);

  return (
    <div className="relative mb-4 z-20">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full h-12 px-4 bg-bg-secondary rounded-xl border border-border-subtle touch-target"
      >
        <span className="font-body text-text-primary truncate">
          {selected?.name || 'Select a team'}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className="text-text-tertiary" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: easeSmooth }}
              className="absolute top-full left-0 right-0 mt-1 bg-bg-elevated rounded-xl border border-border-subtle shadow-xl z-20 overflow-hidden max-h-64 overflow-y-auto"
            >
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => {
                    onSelect(team.id);
                    setOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-4 py-3 text-left touch-target ${
                    team.id === selectedId ? 'bg-accent-primary/10' : 'hover:bg-bg-tertiary'
                  }`}
                >
                  <div>
                    <span
                      className={`text-sm block ${
                        team.id === selectedId ? 'text-accent-primary font-medium' : 'text-text-primary'
                      }`}
                    >
                      {team.name}
                    </span>
                    <span className="text-[10px] text-text-secondary">
                      {team.format} / {team.pokemon.length} Pokemon
                    </span>
                  </div>
                  {team.id === selectedId && (
                    <CheckCircle size={16} className="text-accent-primary" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- Score Breakdown Bar ----------------------------------------------------

function ScoreBreakdown({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-text-secondary w-14 text-right">{label}</span>
      <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(score, 100)}%` }}
          transition={{ duration: 0.8, ease: easeSmooth }}
        />
      </div>
      <span className="text-[10px] font-jetbrains-mono text-text-secondary w-8 text-right">
        {Math.round(score)}
      </span>
    </div>
  );
}
