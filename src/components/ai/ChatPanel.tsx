// ============================================================================
// PocketForge — AI Assistant chat panel (Ollama Cloud / on-device llama.cpp)
//
// The chat itself, with no chrome of its own. ChatSheet wraps it in a
// BottomSheet; the Assistant page renders it full-screen. Keeping one
// implementation means the two surfaces can't drift in behaviour.
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  Check,
  ImagePlus,
  Loader2,
  Plus,
  ScanLine,
  Send,
  Square,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useChatStore, type StoredChatMessage } from '../../store/useChatStore';
import { sendMessage } from '../../lib/llm/ollamaCloud';
import { sendMessage as localSendMessage } from '../../lib/llm/localLlamaCpp';
import { buildSystemPrompt } from '../../lib/llm/systemPrompt';
import { useAiReadiness } from '../../hooks/use-ai-readiness';
import { isNativeApp } from '../../lib/platform';
import { contentToText, type ChatMessage, type ContentPart, type LlmStreamEvent } from '../../lib/llm/types';
import ChatMarkdown from './ChatMarkdown';
import ConfirmSheet from '../ConfirmSheet';
import AiEmptyState from './AiEmptyState';

interface ChatPanelProps {
  /**
   * Whether the panel is being shown. The sheet passes its open state so an
   * in-flight request is cancelled on close; the full-screen page passes
   * nothing, since unmounting is what ends its turn.
   */
  isActive?: boolean;
  /** Sizing for the flex column — e.g. "h-[60vh]" in a sheet, "flex-1" on a page. */
  className?: string;
  /** Closes the surface this panel is hosted in (a sheet) before navigating
   *  away from AiEmptyState's "Open Settings" — omitted on a full page,
   *  where there's nothing to close first. */
  onRequestClose?: () => void;
}

// Explicit phrasing for the write/read tools the assistant actually calls —
// falls back to the old underscore-swap for anything unmapped (a future tool
// this list hasn't caught up with yet).
const TOOL_NAMES: Record<string, string> = {
  create_team: 'Created a team',
  add_pokemon: 'Added a Pokemon',
  update_pokemon: 'Edited a Pokemon',
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

function friendlyToolName(name: string): string {
  return TOOL_NAMES[name] ?? name.replace(/_/g, ' ');
}

function friendlyErrorHeadline(message: string): string {
  if (/\b401\b|unauthorized/i.test(message)) return 'API key was rejected — check it in Settings.';
  if (/timed out|timeout/i.test(message)) return 'The request timed out.';
  if (/fetch|network|NetworkError/i.test(message)) return "Couldn't reach the server.";
  return 'Something went wrong.';
}

// Gemma opens a turn as "<start_of_turn>model\n". The role word belongs to the
// scaffolding, not the reply, so it goes with the marker — stripping the marker
// alone is what leaves a stray "model" line at the top of a bubble.
const TURN_HEADER_PATTERN = /<\/?start_of_turn>[ \t]*(?:model|user|system|assistant)?[ \t]*\n?/g;

const SPECIAL_TOKEN_PATTERN =
  /<end_of_turn>|<\/?s>|<pad>|<\|(?:im_start|im_end|eot_id|eom_id|begin_of_text|end_of_text|start_header_id|end_header_id)\|>/g;

/**
 * Remove special tokens without trimming — preserves spacing between tokens during streaming.
 * Always applied to the whole accumulated buffer, so a marker split across two
 * streamed chunks still matches once both halves have arrived.
 */
function removeSpecialTokens(text: string): string {
  return text.replace(TURN_HEADER_PATTERN, '').replace(SPECIAL_TOKEN_PATTERN, '');
}

/**
 * Final form for stored messages: tokens removed and edges trimmed.
 */
function stripSpecialTokens(text: string): string {
  return removeSpecialTokens(text).trim();
}

function getImagePart(content: string | ContentPart[]): string | null {
  if (typeof content === 'string') return null;
  const part = content.find((p) => p.type === 'image_url');
  return part && part.type === 'image_url' ? part.image_url.url : null;
}

function getTextPart(content: string | ContentPart[]): string {
  if (typeof content === 'string') return content;
  return content
    .filter((p): p is Extract<ContentPart, { type: 'text' }> => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

interface ToolTraceEntry {
  id: string;
  turnSeq: number;
  name: string;
  status: 'running' | 'ok' | 'error';
}

function ToolPill({ entry }: { entry: ToolTraceEntry }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${
        entry.status === 'error' ? 'bg-danger/10 text-danger' : 'bg-accent-primary/10 text-accent-primary'
      }`}
    >
      {entry.status === 'running' ? (
        <Wrench size={10} />
      ) : entry.status === 'error' ? (
        <X size={10} />
      ) : (
        <Check size={10} />
      )}
      {friendlyToolName(entry.name)}
    </span>
  );
}

export default function ChatPanel({ isActive = true, className = 'flex-1', onRequestClose }: ChatPanelProps) {
  const settings = useStore((s) => s.settings);
  const teams = useStore((s) => s.teams);
  const currentTeamId = useStore((s) => s.currentTeamId);
  const team = useMemo(
    () => teams.find((t) => t.id === currentTeamId) ?? teams[0] ?? null,
    [teams, currentTeamId]
  );

  // Persisted (own storage key, see useChatStore.ts) — closing the sheet or an
  // accidental backdrop tap no longer discards the conversation.
  const history = useChatStore((s) => s.history);
  const setHistory = useChatStore((s) => s.setHistory);
  const clearChat = useChatStore((s) => s.clear);

  const [input, setInput] = useState('');
  // The full "data:image/<format>;base64,<data>" URL — not { base64, format } — so
  // the thumbnail's <img src> and the eventual ContentPart.image_url.url both use it
  // directly, and this file never needs a static import of imagePicker.ts's
  // toDataUrl (that module is native-only and must stay behind a dynamic import;
  // see its own header comment).
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [pendingScreenshotImport, setPendingScreenshotImport] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  // Tool-call trace for the whole session, keyed by turnSeq (see runTurn) —
  // unlike the old toolActivity list, this is never cleared at turn end, so a
  // finished reply keeps a permanent record of which tools ran instead of the
  // pills vanishing into nothing. Session-only (not persisted): a message
  // survives a reload, its trace pills don't (see StoredChatMessage.turnSeq).
  const [toolTrace, setToolTrace] = useState<ToolTraceEntry[]>([]);
  const [currentTurnSeq, setCurrentTurnSeq] = useState<number | null>(null);
  const turnSeqRef = useRef(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [srAnnouncement, setSrAnnouncement] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Mirrors streamingText synchronously — state read inside the catch block below
  // would be stale (captured when handleSend started, not updated by onEvent since).
  const streamingTextRef = useRef('');
  // The exact baseHistory a turn was started with, so Retry can resend it
  // verbatim — runTurn always overwrites history with baseHistory first, so
  // replaying it is a clean restart, not a duplicate-message risk. Mirrored
  // into canRetry (state, not a ref read) since the Retry button's presence
  // is a render decision, and refs may not be read during render.
  const lastBaseHistoryRef = useRef<ChatMessage[] | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  // Only auto-scroll to the bottom when the user is already there — otherwise
  // reading back through the transcript during a reply gets yanked away on
  // every token.
  const isAtBottomRef = useRef(true);

  // Shared with ChatLauncher (and any future chat surface) so a launcher can
  // never appear while this sheet would report "not configured".
  const { isConfigured, status, isLocalBackend, serverStatus } = useAiReadiness();

  // docs/litertlm-vl-integration.md §12: images are LiteRT-LM-only. llama.cpp/GGUF
  // never sets visionAvailable, and Ollama Cloud has no server status at all — both
  // fall through to false without needing their own checks here. Gating on
  // `visionAvailable` alone (rather than also requiring settings.aiBackend ===
  // 'localLiteRt') is deliberate: the engine format is sniffed from the imported
  // file itself (docs/litertlm-android-adapter.md step 2), not from a user
  // preference, so a persisted 'localLlamaCpp' setting left over from before a VL
  // bundle was imported must not hide the control — visionAvailable already fully
  // captures "is a vision-capable engine actually loaded right now".
  const canAttachImage =
    isNativeApp() && isLocalBackend && serverStatus?.visionAvailable === true;

  const handleAttachImage = useCallback(async () => {
    if (isStreaming) return;
    setIsPickingImage(true);
    try {
      const { pickOrCaptureImage, toDataUrl } = await import('../../lib/native/imagePicker');
      const image = await pickOrCaptureImage();
      setAttachedImage(toDataUrl(image));
    } catch (err) {
      // ImagePickCancelledError (user declined the permission prompt or cancelled
      // the picker) is a normal outcome, not a failure — checked by name rather
      // than importing the class statically, which the dynamic-import boundary
      // above exists specifically to avoid.
      if (err instanceof Error && err.name === 'ImagePickCancelledError') return;
      setError(err instanceof Error ? err.message : 'Failed to attach image');
    } finally {
      setIsPickingImage(false);
    }
  }, [isStreaming]);

  const displayMessages = useMemo(
    () =>
      history.filter(
        (m): m is StoredChatMessage & { role: 'user' | 'assistant' } =>
          (m.role === 'user' || m.role === 'assistant') &&
          // A message whose image was stripped before persisting (see
          // useChatStore's partialize) can have empty text content and no
          // image part left — still worth showing (as the "Image (not
          // saved)" chip in the render below), not silently dropped.
          (m.imageOmitted === true || contentToText(m.content).trim().length > 0)
      ),
    [history]
  );

  const handleTranscriptScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  }, []);

  useEffect(() => {
    if (!isAtBottomRef.current) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: isStreaming ? 'auto' : 'smooth',
    });
  }, [displayMessages.length, streamingText, isStreaming]);

  // Auto-grow the composer up to max-h-24 (96px) instead of a fixed height —
  // a multi-line message no longer scrolls inside a tiny 44px box.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }, [input]);

  // Cancel any in-flight request if the panel is hidden mid-stream. The onEvent
  // handler in handleSend already ignores abort-triggered errors (checking
  // controller.signal.aborted), so there's no stale error state to clear here.
  useEffect(() => {
    if (!isActive) abortRef.current?.abort();
  }, [isActive]);

  // Same on unmount — navigating away from the page must not leave a stream
  // running against state nothing is reading any more.
  useEffect(() => () => abortRef.current?.abort(), []);

  // Everything from "send this fully-built history" onward — shared by handleSend
  // (appends to the current conversation), handleRetry, and doImportScreenshot
  // (starts a fresh one). Takes baseHistory as a parameter rather than reading
  // `history` from the closure so callers can pass a freshly-built array
  // without a stale-state race against the setHistory(baseHistory) below.
  const runTurn = useCallback(
    async (baseHistory: ChatMessage[]) => {
      lastBaseHistoryRef.current = baseHistory;
      setCanRetry(true);
      const turnSeq = ++turnSeqRef.current;
      setCurrentTurnSeq(turnSeq);
      setSrAnnouncement('Assistant is replying');
      setHistory(baseHistory);

      const controller = new AbortController();
      abortRef.current = controller;

      // The local backend's native request can't actually be cancelled mid-flight
      // (see localLlamaCpp.ts's own comment on this) — aborting only stops this
      // turn's JS side from caring, so the old request keeps running and its
      // eventual result still reaches every callback below. Without this guard,
      // "New chat" during an active local turn would let that stale completion
      // land on whatever's current by then — appending the old reply into a
      // fresh conversation, or clobbering a genuinely new turn's isStreaming/
      // toolTrace/history mid-stream. abortRef.current is this turn's own
      // identity: it only still points at `controller` if nothing newer (another
      // runTurn call, or handleNewChat's abort+reset) has superseded it.
      const isCurrentTurn = () => abortRef.current === controller;

      const handleEvent = (event: LlmStreamEvent) => {
        if (!isCurrentTurn()) return;
        if (event.type === 'token') {
          streamingTextRef.current += event.text;
          // Accumulate raw (don't trim during streaming, which would collapse spaces between tokens)
          // Strip tokens only when displaying or saving to history
          const cleaned = stripSpecialTokens(streamingTextRef.current);
          setStreamingText(cleaned);
        } else if (event.type === 'toolCall') {
          setToolTrace((prev) => [
            ...prev,
            { id: `${turnSeq}-${prev.length}`, turnSeq, name: event.name, status: 'running' },
          ]);
        } else if (event.type === 'toolResult') {
          const isErr =
            typeof event.result === 'object' && event.result !== null && 'error' in event.result;
          setToolTrace((prev) => {
            const idx = prev.findIndex(
              (t) => t.turnSeq === turnSeq && t.name === event.name && t.status === 'running'
            );
            if (idx === -1) return prev;
            const next = [...prev];
            next[idx] = { ...next[idx], status: isErr ? 'error' : 'ok' };
            return next;
          });
        }
        // A user-initiated cancel (closing the sheet, tapping stop) surfaces here as
        // an abort "error" — that's not a failure worth showing, just report real ones.
        else if (event.type === 'error' && !controller.signal.aborted) setError(event.message);
      };

      try {
        const updated = isLocalBackend
          ? await localSendMessage({
              history: baseHistory,
              ctx: { team },
              signal: controller.signal,
              onEvent: handleEvent,
            })
          : await sendMessage({
              apiKey: settings.ollamaApiKey,
              model: settings.ollamaModel,
              history: baseHistory,
              ctx: { team },
              signal: controller.signal,
              onEvent: handleEvent,
            });
        if (!isCurrentTurn()) return;
        // Strip special tokens from final message(s) before storing, and tag
        // every message this turn actually added with turnSeq so its tool
        // trace pills can be found again once it's a plain history entry.
        const cleanedHistory: StoredChatMessage[] = updated.map((msg, i) => {
          if (msg.role !== 'assistant') return msg;
          const stripped = { ...msg, content: stripSpecialTokens(contentToText(msg.content)) };
          return i >= baseHistory.length ? { ...stripped, turnSeq } : stripped;
        });
        setHistory(cleanedHistory);
        const lastAssistant = [...cleanedHistory].reverse().find((m) => m.role === 'assistant');
        setSrAnnouncement(lastAssistant ? contentToText(lastAssistant.content) : 'Reply complete');
      } catch (err) {
        if (!isCurrentTurn()) return;
        // Preserve tool call history even when a later round fails, so the user sees what succeeded.
        const partialMessages =
          typeof err === 'object' &&
          err !== null &&
          'partialMessages' in err &&
          Array.isArray((err as Record<string, unknown>).partialMessages)
            ? ((err as Record<string, unknown>).partialMessages as ChatMessage[])
            : undefined;
        if (partialMessages && partialMessages.length > baseHistory.length) {
          const cleanedHistory: StoredChatMessage[] = partialMessages.map((msg, i) => {
            if (msg.role !== 'assistant') return msg;
            const stripped = { ...msg, content: stripSpecialTokens(contentToText(msg.content)) };
            return i >= baseHistory.length ? { ...stripped, turnSeq } : stripped;
          });
          setHistory(cleanedHistory);
        }
        // Also keep the partial reply when the user actually tapped stop.
        else if (controller.signal.aborted && streamingTextRef.current) {
          const cleanedContent = stripSpecialTokens(streamingTextRef.current);
          if (cleanedContent.trim()) {
            setHistory((h) => [
              ...h,
              { role: 'assistant', content: cleanedContent, stopped: true, turnSeq },
            ]);
          }
        }
        setSrAnnouncement('');
      } finally {
        if (isCurrentTurn()) {
          setStreamingText('');
          streamingTextRef.current = '';
          // A tool call that never got a matching toolResult (a hung/dropped
          // connection) would otherwise show a permanently-spinning pill in a
          // conversation that has already ended.
          setToolTrace((prev) =>
            prev.map((t) => (t.turnSeq === turnSeq && t.status === 'running' ? { ...t, status: 'error' } : t))
          );
          setIsStreaming(false);
          setCurrentTurnSeq(null);
          abortRef.current = null;
        }
      }
    },
    [isLocalBackend, settings.ollamaApiKey, settings.ollamaModel, team, setHistory]
  );

  const handleSend = useCallback(async () => {
    const text = input.trim();
    const image = attachedImage; // capture before clearing, same reason as `text`
    if ((!text && !image) || isStreaming || !isConfigured) return;

    setInput('');
    setAttachedImage(null);
    setError(null);
    setStreamingText('');
    streamingTextRef.current = '';
    isAtBottomRef.current = true;
    setIsStreaming(true);

    const content: string | ContentPart[] = image
      ? [
          ...(text ? [{ type: 'text', text } as const] : []),
          { type: 'image_url', image_url: { url: image } } as const,
        ]
      : text;
    const userMessage: ChatMessage = { role: 'user', content };
    const baseHistory: ChatMessage[] =
      history.length === 0
        ? [
            // The local backend has no web tools — don't tell its model to use them.
            { role: 'system', content: buildSystemPrompt({ includeWebTools: !isLocalBackend }) },
            userMessage,
          ]
        : [...history, userMessage];
    await runTurn(baseHistory);
  }, [
    input,
    attachedImage,
    isStreaming,
    isConfigured,
    history,
    isLocalBackend,
    runTurn,
  ]);

  const handleRetry = useCallback(() => {
    if (isStreaming || !lastBaseHistoryRef.current) return;
    setError(null);
    setStreamingText('');
    streamingTextRef.current = '';
    isAtBottomRef.current = true;
    setIsStreaming(true);
    void runTurn(lastBaseHistoryRef.current);
  }, [isStreaming, runTurn]);

  const handleNewChat = useCallback(() => {
    abortRef.current?.abort();
    clearChat();
    setToolTrace([]);
    setError(null);
    setStreamingText('');
    streamingTextRef.current = '';
    setIsStreaming(false);
    setCurrentTurnSeq(null);
  }, [clearChat]);

  // "Import team from screenshot" (docs/litertlm-vl-integration.md step 13): a
  // dedicated entry point, not a mode toggle on the normal composer. It always
  // starts a fresh conversation — the system prompt is only set once per
  // conversation (baked in on the first message), so an existing chat's prompt
  // can't be swapped mid-conversation to add the image-reading instruction.
  const doImportScreenshot = useCallback(async () => {
    setIsPickingImage(true);
    let dataUrl: string;
    try {
      const { pickOrCaptureImage, toDataUrl } = await import('../../lib/native/imagePicker');
      const image = await pickOrCaptureImage();
      dataUrl = toDataUrl(image);
    } catch (err) {
      setIsPickingImage(false);
      if (err instanceof Error && err.name === 'ImagePickCancelledError') return;
      setError(err instanceof Error ? err.message : 'Failed to import screenshot');
      return;
    }
    setIsPickingImage(false);

    clearChat();
    setInput('');
    setAttachedImage(null);
    setError(null);
    setStreamingText('');
    streamingTextRef.current = '';
    isAtBottomRef.current = true;
    setIsStreaming(true);

    const baseHistory: ChatMessage[] = [
      {
        role: 'system',
        content: buildSystemPrompt({ includeWebTools: false, includeImageImport: true }),
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Build my team from this screenshot.' },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ];
    await runTurn(baseHistory);
  }, [clearChat, runTurn]);

  // Chat history now survives a sheet close (see useChatStore), so importing a
  // screenshot into a non-empty conversation is a real, reachable case — not
  // just a defensive check — and needs its own confirmation before wiping it.
  const handleImportScreenshot = useCallback(() => {
    if (isStreaming) return;
    if (displayMessages.length > 0) {
      setPendingScreenshotImport(true);
      return;
    }
    void doImportScreenshot();
  }, [isStreaming, displayMessages.length, doImportScreenshot]);

  const liveTrace = useMemo(
    () => (currentTurnSeq != null ? toolTrace.filter((t) => t.turnSeq === currentTurnSeq) : []),
    [toolTrace, currentTurnSeq]
  );

  return (
    <div className={`flex flex-col min-h-0 ${className}`}>
        {!isConfigured ? (
          <AiEmptyState status={status} error={serverStatus?.error} onBeforeNavigate={onRequestClose} />
        ) : (
          <>
            {/* Announces turn-start and the final reply once, instead of the
                old aria-live="polite" on the streaming bubble re-announcing
                the whole growing buffer on every token. runTurn sets the
                final-reply text and flips isStreaming false in the same
                batch, so gating this on isStreaming raced the region back to
                empty before screen readers ever got the completed announcement
                — render it unconditionally instead. */}
            <div aria-live="polite" className="sr-only">
              {srAnnouncement}
            </div>

            {displayMessages.length > 0 && (
              <div className="flex justify-end shrink-0 pb-2">
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] text-text-secondary active:bg-bg-tertiary touch-target"
                >
                  <Plus size={12} />
                  New chat
                </button>
              </div>
            )}

            <div
              ref={scrollRef}
              onScroll={handleTranscriptScroll}
              role="log"
              aria-label="Conversation with the AI assistant"
              className="flex-1 min-h-0 overflow-y-auto space-y-3 pb-2"
            >
              {displayMessages.length === 0 && !isStreaming && (
                <div className="flex flex-col items-center justify-center text-center px-6 py-10 gap-2">
                  <Bot size={28} className="text-text-tertiary" />
                  <p className="text-[12px] text-text-secondary leading-relaxed">
                    {isLocalBackend
                      ? `Ask about ${team ? `"${team.name}"` : 'your team'} — weaknesses, a damage roll,
                        speed comparisons, or whether a set is legal.`
                      : `Ask about ${team ? `"${team.name}"` : 'your team'} — weaknesses, a damage roll,
                        speed comparisons, whether a set is legal, or search the web for current rulings.`}
                  </p>
                  {/* Web/cloud never has this capability at all, so nothing renders
                      there; native+local always renders the CTA, disabled with a
                      visible reason (not just a title tooltip — invisible on touch)
                      when the loaded model isn't vision-capable, instead of the
                      button silently not existing. */}
                  {isNativeApp() && isLocalBackend && (
                    <>
                      <button
                        type="button"
                        onClick={handleImportScreenshot}
                        disabled={!canAttachImage || isPickingImage}
                        title={canAttachImage ? undefined : 'Import a vision (.litertlm) model to scan screenshots'}
                        className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-accent-primary/10 text-accent-primary text-[12px] px-3 py-1.5 touch-target disabled:opacity-40"
                      >
                        {isPickingImage ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <ScanLine size={14} />
                        )}
                        Import team from screenshot
                      </button>
                      {!canAttachImage && (
                        <p className="text-[10px] text-text-tertiary max-w-[220px]">
                          Import a vision (.litertlm) model to scan screenshots
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {displayMessages.map((message, i) => {
                const imageUrl = message.role === 'user' ? getImagePart(message.content) : null;
                const text =
                  message.role === 'user' && Array.isArray(message.content)
                    ? getTextPart(message.content)
                    : contentToText(message.content);
                const pills =
                  message.role === 'assistant' && message.turnSeq != null
                    ? toolTrace.filter((t) => t.turnSeq === message.turnSeq)
                    : [];
                return (
                  <div
                    key={i}
                    className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div
                        aria-hidden="true"
                        className="w-7 h-7 rounded-full bg-accent-primary/15 flex items-center justify-center shrink-0"
                      >
                        <Bot size={14} className="text-accent-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed space-y-1.5 ${
                        message.role === 'user'
                          ? 'bg-accent-primary text-white rounded-br-md'
                          : 'bg-bg-tertiary text-text-primary rounded-bl-md'
                      }`}
                    >
                      <span className="sr-only">{message.role === 'user' ? 'You: ' : 'Assistant: '}</span>
                      {pills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {pills.map((p) => (
                            <ToolPill key={p.id} entry={p} />
                          ))}
                        </div>
                      )}
                      {imageUrl && (
                        <img src={imageUrl} alt="Attached" className="max-w-full rounded-lg" />
                      )}
                      {message.imageOmitted && (
                        <span className="inline-flex items-center rounded-full bg-black/20 px-2 py-0.5 text-[10px]">
                          Image (not saved)
                        </span>
                      )}
                      {text.trim() &&
                        (message.role === 'assistant' ? (
                          <ChatMarkdown>{text}</ChatMarkdown>
                        ) : (
                          <p className="whitespace-pre-wrap">{text}</p>
                        ))}
                      {message.stopped && (
                        <p
                          className={`text-[10px] ${
                            message.role === 'user' ? 'text-white/60' : 'text-text-tertiary'
                          }`}
                        >
                          ◼ Stopped
                        </p>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div
                        aria-hidden="true"
                        className="w-7 h-7 rounded-full bg-bg-tertiary flex items-center justify-center shrink-0"
                      >
                        <User size={14} className="text-text-secondary" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isStreaming && (
                <div className="flex gap-2 justify-start">
                  <div
                    aria-hidden="true"
                    className="w-7 h-7 rounded-full bg-accent-primary/15 flex items-center justify-center shrink-0"
                  >
                    <Bot size={14} className="text-accent-primary" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm bg-bg-tertiary text-text-primary space-y-1.5">
                    {liveTrace.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {liveTrace.map((p) => (
                          <ToolPill key={p.id} entry={p} />
                        ))}
                      </div>
                    )}
                    {streamingText ? (
                      <ChatMarkdown>{streamingText}</ChatMarkdown>
                    ) : (
                      <Loader2 size={14} className="animate-spin text-text-tertiary" aria-label="Waiting for reply" />
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="mx-1 my-1 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-[12px]"
                >
                  <p className="font-body-medium text-danger">{friendlyErrorHeadline(error)}</p>
                  <details className="mt-1">
                    <summary className="cursor-pointer text-text-tertiary">Details</summary>
                    <p className="mt-1 break-words text-text-tertiary">{error}</p>
                  </details>
                  <div className="mt-2 flex gap-2">
                    {canRetry && (
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="rounded-full bg-danger/15 px-3 py-1 text-[11px] font-medium text-danger touch-target"
                      >
                        Retry
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="rounded-full bg-bg-tertiary px-3 py-1 text-[11px] font-medium text-text-secondary touch-target"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>

            {attachedImage && (
              <div className="flex items-center gap-2 pt-3 border-t border-border-subtle shrink-0">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-border-subtle shrink-0">
                  <img src={attachedImage} alt="Attached" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setAttachedImage(null)}
                    aria-label="Remove attached image"
                    className="absolute -top-2 -right-2 w-11 h-11 flex items-center justify-center touch-target"
                  >
                    <span className="w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center">
                      <X size={12} />
                    </span>
                  </button>
                </div>
              </div>
            )}

            <div className={`flex items-end gap-2 shrink-0 ${attachedImage ? 'pt-2' : 'pt-3 border-t border-border-subtle'}`}>
              {canAttachImage && (
                <button
                  type="button"
                  onClick={() => void handleAttachImage()}
                  disabled={isStreaming || isPickingImage}
                  aria-label="Attach image"
                  title="Attach image"
                  className="w-11 h-11 shrink-0 rounded-xl bg-bg-tertiary border border-border-subtle text-text-primary flex items-center justify-center disabled:opacity-40 touch-target"
                >
                  {isPickingImage ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <ImagePlus size={18} />
                  )}
                </button>
              )}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                aria-label="Message the AI assistant"
                enterKeyHint="send"
                placeholder={isStreaming ? 'Waiting for the reply to finish…' : 'Ask about your team...'}
                rows={1}
                className="flex-1 resize-none max-h-24 min-h-11 py-2.5 px-4 bg-bg-tertiary rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 border border-border-subtle"
                style={{ fontSize: '16px' }}
              />
              {isStreaming ? (
                <button
                  type="button"
                  onClick={() => abortRef.current?.abort()}
                  aria-label="Stop generating"
                  title="Stop generating"
                  className="w-11 h-11 shrink-0 rounded-xl bg-bg-tertiary border border-border-subtle text-text-primary flex items-center justify-center touch-target"
                >
                  <Square size={16} fill="currentColor" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={!input.trim() && !attachedImage}
                  aria-label="Send message"
                  className="w-11 h-11 shrink-0 rounded-xl bg-accent-primary text-white flex items-center justify-center disabled:opacity-40 touch-target"
                >
                  <Send size={18} />
                </button>
              )}
            </div>

            <ConfirmSheet
              isOpen={pendingScreenshotImport}
              onClose={() => setPendingScreenshotImport(false)}
              title="Start a new chat?"
              message="Importing a screenshot starts a fresh conversation — your current chat will be cleared."
              confirmLabel="Start new chat"
              danger={false}
              onConfirm={() => void doImportScreenshot()}
            />
          </>
        )}
    </div>
  );
}
