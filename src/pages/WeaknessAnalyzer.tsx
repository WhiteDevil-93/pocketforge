// ============================================================================
// PocketForge — Weakness Analyzer Page
// ============================================================================

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, Target } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useStore } from '../store/useStore';
import TypeBadge from '../components/TypeBadge';
import {
  analyzeTeamWeaknesses,
  suggestCoverageMoves,
} from '../utils/weaknessAnalyzer';

export default function WeaknessAnalyzer() {
  const teams = useStore((s) => s.teams);
  const currentTeamId = useStore((s) => s.currentTeamId);

  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    currentTeamId || teams[0]?.id || '',
  );

  const team = useMemo(
    () => teams.find((t) => t.id === selectedTeamId),
    [teams, selectedTeamId],
  );

  const analysis = useMemo(
    () => (team ? analyzeTeamWeaknesses(team) : null),
    [team],
  );

  const uncoveredOffensive = useMemo(
    () => (team ? suggestCoverageMoves(team) : []),
    [team],
  );

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <PageHeader title="Weakness Analyzer" />

      <div className="flex-1 px-4 py-4 pb-24 flex flex-col gap-4">
        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <Shield size={64} className="text-text-tertiary mb-4" />
            <h2 className="font-headline text-text-primary mb-2">No Teams Yet</h2>
            <p className="font-body text-text-secondary max-w-[280px]">
              Build or import a team to analyze its type weaknesses.
            </p>
          </div>
        ) : (
          <>
            {/* Team selector */}
            <div>
              <label className="font-body-medium text-text-secondary mb-2 block">
                Team
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full h-[48px] px-4 rounded-card-md bg-bg-tertiary border border-border-subtle font-body text-text-primary outline-none focus:border-accent-primary/50"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.format})
                  </option>
                ))}
              </select>
            </div>

            {!team || team.pokemon.length === 0 ? (
              <p className="font-body text-text-tertiary py-8 text-center">
                Add Pokémon to this team to see weakness analysis.
              </p>
            ) : (
              <>
                {/* Type Weaknesses */}
                <div>
                  <h2 className="font-subtitle text-text-primary mb-2 flex items-center gap-2">
                    <ShieldAlert size={18} className="text-danger" />
                    Type Weaknesses
                  </h2>
                  {analysis && analysis.weaknesses.length === 0 ? (
                    <p className="font-body text-text-tertiary py-4 text-center bg-bg-secondary rounded-card-md border border-border-subtle">
                      No team-wide type weaknesses. Solid defensive synergy!
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {analysis?.weaknesses.map((row, idx) => (
                        <motion.li
                          key={row.type}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="p-3 rounded-card-md bg-bg-secondary border border-border-subtle flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <TypeBadge type={row.type} size="md" />
                            <div className="flex items-center gap-3 font-jetbrains-mono text-xs">
                              <span className="text-danger">
                                {row.weakCount} weak
                              </span>
                              <span className="text-success">
                                {row.resistCount + row.immuneCount} resist
                              </span>
                            </div>
                          </div>

                          {row.weakMembers.length > 0 && (
                            <div>
                              <p className="font-caption text-text-tertiary mb-1">
                                Weak:
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {row.weakMembers.map((name) => (
                                  <span
                                    key={name}
                                    className="px-2 py-1 rounded-full bg-danger/15 text-danger font-caption"
                                  >
                                    {name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <p className="font-caption text-text-tertiary mb-1">
                              Covered by:
                            </p>
                            {row.coveredBy.length === 0 ? (
                              <p className="font-caption text-danger">
                                No team member resists this type.
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {row.coveredBy.map((name) => (
                                  <span
                                    key={name}
                                    className="px-2 py-1 rounded-full bg-success/15 text-success font-caption"
                                  >
                                    {name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Coverage Gaps */}
                <div>
                  <h2 className="font-subtitle text-text-primary mb-2 flex items-center gap-2">
                    <Target size={18} className="text-accent-secondary" />
                    Coverage Gaps
                  </h2>
                  {uncoveredOffensive.length === 0 ? (
                    <p className="font-body text-text-tertiary py-4 text-center bg-bg-secondary rounded-card-md border border-border-subtle">
                      Your team's STAB hits every type super-effectively.
                    </p>
                  ) : (
                    <div className="p-3 rounded-card-md bg-bg-secondary border border-border-subtle flex flex-col gap-2">
                      <p className="font-caption text-text-secondary">
                        Your team's STAB can't hit these types super-effectively.
                        Consider adding coverage moves:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {uncoveredOffensive.map((type) => (
                          <TypeBadge key={type} type={type} size="md" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
