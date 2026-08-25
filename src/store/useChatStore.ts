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
import type { ChatMessage, ContentPart } from '../lib/llm/types';

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
  /** Ties an assistant message to the tool-call trace pills that preceded it
   *  within the same turn (ChatPanel.tsx's local, unpersisted toolTrace
   *  state) — not persisted itself (see partialize), so a message survives a
   *  reload but its trace pills don't. If the 40-message cap below ever
   *  trims a message away, any toolTrace entries anchored to its turnSeq
   *  simply stop matching anything and are never rendered — no separate
   *  bookkeeping needed to keep the two in sync. */
  turnSeq?: number;
}

interface ChatState {
  history: StoredChatMessage[];
  setHistory: (
    updater: StoredChatMessage[] | ((prev: StoredChatMessage[]) => StoredChatMessage[])
  ) => void;
  clear: () => void;
}

function stripImageForPersist(msg: StoredChatMessage): StoredChatMessage {
  if (!Array.isArray(msg.content)) return msg;
  if (!msg.content.some((p) => p.type === 'image_url')) return msg;
  const withoutImage: ContentPart[] = msg.content.filter((p) => p.type !== 'image_url');
  return { ...msg, content: withoutImage, imageOmitted: true, turnSeq: undefined };
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
      setHistory: (updater) =>
        set((s) => {
          const next = typeof updater === 'function' ? updater(s.history) : updater;
          return { history: trimHistory(next) };
        }),
      clear: () => set({ history: [] }),
    }),
    {
      name: CHAT_STORAGE_KEY,
      partialize: (state) => ({ history: state.history.map(stripImageForPersist) }),
    }
  )
);
