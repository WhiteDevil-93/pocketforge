// ============================================================================
// PocketForge — Chat history store
// ============================================================================
//
// Chat history used to be plain useState in ChatPanel.tsx — closing the
// sheet (or an accidental backdrop tap, the app's cheapest gesture) silently
// discarded the whole conversation, and every chat surface shared the same
// data anyway (ChatSheet, the Assistant page, and the Analysis-page
// launcher all render the same ChatPanel). A separate persisted store
// (its own storage key, not the main app store) matches the precedent
// already set by useNuzlockeStore — no migration to wire into useStore.ts's
// versioned persist config.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CHAT_STORAGE_KEY } from '../lib/storage';
import { contentToText, type ChatMessage, type ContentPart } from '../lib/llm/types';

/** Keeps the persisted conversation bounded — a chat that ran to 40 messages
 *  has likely long since drifted past what's worth restoring anyway. */
const MAX_MESSAGES = 40;

export interface StoredChatMessage extends ChatMessage {
  /** Set on a reply that was cut short (Stop, or an aborted connection) — a
   *  cosmetic marker only; never sent back to the model. */
  stopped?: boolean;
  /** Set (only after a reload — see partialize below) on a message whose
   *  image content was stripped before persisting. */
  imageOmitted?: boolean;
  /** Ties an assistant message to the tool calls made during the same turn
   *  (see [ToolLogEntry.turnSeq]). Tool activity is no longer drawn in the
   *  transcript itself — it lives in the separate tool log — but the anchor is
   *  kept so the log can group its entries by the reply they produced. */
  turnSeq?: number;
}

/** One tool invocation, recorded for the tool log.
 *
 *  Tool activity used to render as pills inside the assistant's chat bubble.
 *  That put protocol mechanics in the middle of the conversation, which is not
 *  what the transcript is for — so the pills are gone and this is the record
 *  instead. It keeps arguments and a result summary because the log's real job
 *  is answering "what did it actually do, and why did that fail" — a bare list
 *  of tool names can't. */
export interface ToolLogEntry {
  id: string;
  /** Groups entries under the assistant reply they belong to. */
  turnSeq: number;
  name: string;
  status: 'running' | 'ok' | 'error';
  /** Epoch ms, so the log can show when each call ran. */
  startedAt: number;
  finishedAt?: number;
  /** What the model passed. Persisted as-is; these are the app's own tool
   *  arguments (species names, EV spreads), never credentials. */
  args?: Record<string, unknown>;
  /** Compact rendering of the handler's return value, truncated — the full
   *  result can be a large object and the log only needs the gist. */
  resultSummary?: string;
}

/** Keeps the persisted log bounded independently of the message cap: one team
 *  build is ~20 calls, so this holds several conversations' worth. */
const MAX_TOOL_LOG = 200;

/** Result text kept per entry. Long enough for a validator's rejection message
 *  (the thing most worth reading) without storing an entire team object. */
const MAX_RESULT_SUMMARY = 400;

interface ChatState {
  history: StoredChatMessage[];
  toolLog: ToolLogEntry[];
  setHistory: (
    updater: StoredChatMessage[] | ((prev: StoredChatMessage[]) => StoredChatMessage[])
  ) => void;
  /** Appends a 'running' entry when a tool starts. */
  startToolLogEntry: (entry: Omit<ToolLogEntry, 'status' | 'startedAt'>) => void;
  /** Resolves the matching 'running' entry once the handler returns. */
  finishToolLogEntry: (turnSeq: number, name: string, result: unknown) => void;
  /** Marks any still-'running' entry from a finished turn as failed. A call
   *  whose result never arrived (dropped connection, aborted turn) would
   *  otherwise sit in the log spinning forever in a conversation that ended. */
  failStuckToolLogEntries: (turnSeq: number) => void;
  clear: () => void;
}

/** Renders a tool result compactly for the log. An `error` field is surfaced
 *  on its own because that is the line a user is looking for when a build
 *  didn't work; anything else is JSON-stringified and truncated. */
export function summarizeToolResult(result: unknown): string {
  if (result === null || result === undefined) return '';
  if (typeof result === 'object' && 'error' in (result as Record<string, unknown>)) {
    return String((result as Record<string, unknown>).error);
  }
  let text: string;
  try {
    text = typeof result === 'string' ? result : JSON.stringify(result);
  } catch {
    return '[unserializable result]';
  }
  return text.length > MAX_RESULT_SUMMARY ? `${text.slice(0, MAX_RESULT_SUMMARY)}…` : text;
}

function stripImageForPersist(msg: StoredChatMessage): StoredChatMessage {
  if (!Array.isArray(msg.content)) return msg;
  if (!msg.content.some((p) => p.type === 'image_url')) return msg;
  const withoutImage: ContentPart[] = msg.content.filter((p) => p.type !== 'image_url');
  // Flatten to a plain string once the image is gone. Leaving it as a
  // ContentPart[] of just text parts isn't wrong per the ChatMessage type,
  // but ollamaCloud's toWireMessage treats ANY non-string content as "this
  // message carries an image" and refuses to send it — a restored
  // conversation would become permanently unsendable after switching to
  // Ollama Cloud otherwise. No image parts remain at this point, so
  // contentToText's own image placeholder never actually applies here.
  return { ...msg, content: contentToText(withoutImage), imageOmitted: true, turnSeq: undefined };
}

/** Trims to MAX_MESSAGES while keeping the leading system message (ChatPanel
 *  inserts it once, at index 0, on the first turn of a conversation — losing
 *  it mid-conversation means every later turn goes to the model without the
 *  tool rules or the team-building sequence) and dropping any leading
 *  orphaned `role: 'tool'` message the cut can leave without its preceding
 *  assistant tool_calls (toWireMessage has no pending id for it, and the
 *  OpenAI-shaped local server rejects a tool message without tool_call_id). */
function trimHistory(messages: StoredChatMessage[]): StoredChatMessage[] {
  if (messages.length <= MAX_MESSAGES) return messages;
  const head = messages[0]?.role === 'system' ? [messages[0]] : [];
  const rest = messages.slice(head.length);
  let tail = rest.slice(Math.max(0, rest.length - (MAX_MESSAGES - head.length)));
  while (tail.length > 0 && tail[0].role === 'tool') tail = tail.slice(1);
  return [...head, ...tail];
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      history: [],
      toolLog: [],
      setHistory: (updater) =>
        set((s) => {
          const next = typeof updater === 'function' ? updater(s.history) : updater;
          return { history: trimHistory(next) };
        }),
      startToolLogEntry: (entry) =>
        set((s) => ({
          toolLog: [
            ...s.toolLog,
            { ...entry, status: 'running' as const, startedAt: Date.now() },
          ].slice(-MAX_TOOL_LOG),
        })),
      failStuckToolLogEntries: (turnSeq) =>
        set((s) => ({
          toolLog: s.toolLog.map((t) =>
            t.turnSeq === turnSeq && t.status === 'running'
              ? { ...t, status: 'error' as const, finishedAt: Date.now(), resultSummary: 'No result — the turn ended first.' }
              : t
          ),
        })),
      finishToolLogEntry: (turnSeq, name, result) =>
        set((s) => {
          // Match the OLDEST still-running entry for this tool: the same tool can
          // legitimately run twice in one turn (an add_pokemon rejected, fixed,
          // and retried), and those complete in the order they started.
          const idx = s.toolLog.findIndex(
            (t) => t.turnSeq === turnSeq && t.name === name && t.status === 'running'
          );
          if (idx === -1) return s;
          const isError =
            typeof result === 'object' && result !== null && 'error' in result;
          const next = [...s.toolLog];
          next[idx] = {
            ...next[idx],
            status: isError ? 'error' : 'ok',
            finishedAt: Date.now(),
            resultSummary: summarizeToolResult(result),
          };
          return { toolLog: next };
        }),
      // "New chat" clears the log too — it belongs to the conversation it
      // describes, and leaving stale entries behind would attribute the last
      // chat's tool calls to the new one.
      clear: () => set({ history: [], toolLog: [] }),
    }),
    {
      name: CHAT_STORAGE_KEY,
      partialize: (state) => ({
        history: state.history.map(stripImageForPersist),
        // A call still 'running' when the app closed never completed and never
        // will — persisting it would restore a spinner that hangs forever.
        toolLog: state.toolLog.filter((t) => t.status !== 'running'),
      }),
    }
  )
);
