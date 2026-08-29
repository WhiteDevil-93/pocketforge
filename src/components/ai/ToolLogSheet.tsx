// ============================================================================
// PocketForge — AI tool activity log
// ============================================================================
//
// Tool calls used to render as pills inside the assistant's chat bubbles. That
// mixed protocol mechanics into the conversation, which is not what a
// transcript is for. They live here instead: out of the chat, one tap away,
// and with enough detail to actually diagnose a failed team build — the
// arguments the model passed and what came back, not just a tool name.

import { useMemo } from 'react';
import { Check, ChevronDown, Wrench, X } from 'lucide-react';
import BottomSheet from '../BottomSheet';
import type { ToolLogEntry } from '../../store/useChatStore';

/** Human-readable labels. Kept in step with the tool registry by hand; an
 *  unmapped name falls back to its underscored form rather than disappearing,
 *  so a newly added tool still shows up in the log. */
const TOOL_LABELS: Record<string, string> = {
  create_team: 'Created a team',
  add_pokemon: 'Added a Pokemon',
  update_pokemon: 'Updated a Pokemon',
  remove_pokemon: 'Removed a Pokemon',
  get_active_team: 'Checked your team',
  analyze_team: 'Analyzed the team',
  validate_team: 'Validated the team',
  explain_evs: 'Explained an EV spread',
  calculate_speed: 'Calculated speed',
  calculate_damage: 'Calculated damage',
  lookup_pokemon: 'Looked up a Pokemon',
  get_legal_moves: 'Checked legal moves',
  web_search: 'Searched the web',
  web_fetch: 'Read a web page',
};

function toolLabel(name: string): string {
  return TOOL_LABELS[name] ?? name.replace(/_/g, ' ');
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/** Renders arguments as `key: value` pairs rather than raw JSON — the log is
 *  read on a phone, and `{"species":"Tsareena","level":50}` is worse there than
 *  `species: Tsareena · level: 50`. Arrays (a moveset) join with commas. */
function formatArgs(args: Record<string, unknown> | undefined): string {
  if (!args) return '';
  const parts = Object.entries(args).map(([key, value]) => {
    const rendered = Array.isArray(value)
      ? value.join(', ')
      : typeof value === 'object' && value !== null
        ? JSON.stringify(value)
        : String(value);
    return `${key}: ${rendered}`;
  });
  return parts.join(' · ');
}

function StatusIcon({ status }: { status: ToolLogEntry['status'] }) {
  if (status === 'running') return <Wrench size={12} className="text-accent-primary animate-pulse" />;
  if (status === 'error') return <X size={12} className="text-danger" />;
  return <Check size={12} className="text-success" />;
}

function LogRow({ entry }: { entry: ToolLogEntry }) {
  const args = formatArgs(entry.args);
  return (
    <li className="rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2.5">
      <div className="flex items-center gap-2">
        <StatusIcon status={entry.status} />
        <span className="text-[13px] text-text-primary font-body-medium">{toolLabel(entry.name)}</span>
        <span className="ml-auto shrink-0 font-jetbrains-mono text-[10px] text-text-tertiary">
          {formatTime(entry.startedAt)}
        </span>
      </div>
      {args && (
        <p className="mt-1.5 break-words font-jetbrains-mono text-[11px] leading-relaxed text-text-secondary">
          {args}
        </p>
      )}
      {entry.resultSummary && (
        <p
          className={`mt-1 break-words font-jetbrains-mono text-[11px] leading-relaxed ${
            entry.status === 'error' ? 'text-danger' : 'text-text-tertiary'
          }`}
        >
          {entry.resultSummary}
        </p>
      )}
    </li>
  );
}

interface ToolLogSheetProps {
  open: boolean;
  onClose: () => void;
  entries: ToolLogEntry[];
}

export default function ToolLogSheet({ open, onClose, entries }: ToolLogSheetProps) {
  // Newest turn first — the call you want is almost always the one that just
  // ran. Within a turn, calls stay in the order they executed, since that
  // sequence is the thing being diagnosed.
  const groups = useMemo(() => {
    const byTurn = new Map<number, ToolLogEntry[]>();
    for (const entry of entries) {
      const list = byTurn.get(entry.turnSeq);
      if (list) list.push(entry);
      else byTurn.set(entry.turnSeq, [entry]);
    }
    return [...byTurn.entries()].sort((a, b) => b[0] - a[0]);
  }, [entries]);

  const errorCount = useMemo(() => entries.filter((e) => e.status === 'error').length, [entries]);

  return (
    // showSearch is opt-OUT on BottomSheet (defaults true). Without this the log
    // rendered a search box wired to nothing: it accepted typing and filtered
    // nothing, which is worst precisely here, where someone is scanning a long
    // call history for the one that failed.
    <BottomSheet isOpen={open} onClose={onClose} title="Tool activity" showSearch={false}>
      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <Wrench size={24} className="text-text-tertiary" />
          <p className="text-[12px] leading-relaxed text-text-secondary">
            No tools have run yet. When the assistant builds or checks a team, every call it
            makes is recorded here.
          </p>
        </div>
      ) : (
        <div className="space-y-4 pb-2">
          <p className="text-[11px] text-text-tertiary">
            {entries.length} call{entries.length === 1 ? '' : 's'}
            {errorCount > 0 && ` · ${errorCount} failed`}
          </p>
          {groups.map(([turnSeq, turnEntries]) => (
            <section key={turnSeq} className="space-y-1.5">
              <h3 className="flex items-center gap-1 text-[11px] font-body-medium text-text-secondary">
                <ChevronDown size={11} aria-hidden="true" />
                Reply {turnSeq + 1}
              </h3>
              <ul className="space-y-1.5">
                {turnEntries.map((entry) => (
                  <LogRow key={entry.id} entry={entry} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </BottomSheet>
  );
}
