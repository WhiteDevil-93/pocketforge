// ============================================================================
// PocketForge — AI Assistant chat sheet (Ollama Cloud)
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Loader2, Send, Square, User, Wrench } from 'lucide-react';
import BottomSheet from '../BottomSheet';
import { useStore } from '../../store/useStore';
import { sendMessage } from '../../lib/llm/ollamaCloud';
import { SYSTEM_PROMPT } from '../../lib/llm/systemPrompt';
import type { ChatMessage } from '../../lib/llm/types';

interface ChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

function friendlyToolName(name: string): string {
  return name.replace(/_/g, ' ');
}

export default function ChatSheet({ isOpen, onClose }: ChatSheetProps) {
  const settings = useStore((s) => s.settings);
  const teams = useStore((s) => s.teams);
  const currentTeamId = useStore((s) => s.currentTeamId);
  const team = useMemo(
    () => teams.find((t) => t.id === currentTeamId) ?? teams[0] ?? null,
    [teams, currentTeamId]
  );

  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [toolActivity, setToolActivity] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isConfigured =
    settings.aiEnabled &&
    settings.ollamaApiKey.trim().length > 0 &&
    settings.ollamaModel.trim().length > 0;

  const displayMessages = useMemo(
    () =>
      history.filter(
        (m): m is ChatMessage & { role: 'user' | 'assistant' } =>
          (m.role === 'user' || m.role === 'assistant') && m.content.trim().length > 0
      ),
    [history]
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [displayMessages.length, streamingText]);

  // Cancel any in-flight request if the sheet is closed mid-stream. The onEvent
  // handler in handleSend already ignores abort-triggered errors (checking
  // controller.signal.aborted), so there's no stale error state to clear here.
  useEffect(() => {
    if (!isOpen) abortRef.current?.abort();
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming || !isConfigured) return;

    setInput('');
    setError(null);
    setStreamingText('');
    setToolActivity([]);
    setIsStreaming(true);

    const userMessage: ChatMessage = { role: 'user', content: text };
    const baseHistory: ChatMessage[] =
      history.length === 0
        ? [{ role: 'system', content: SYSTEM_PROMPT }, userMessage]
        : [...history, userMessage];
    setHistory(baseHistory);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const updated = await sendMessage({
        apiKey: settings.ollamaApiKey,
        model: settings.ollamaModel,
        history: baseHistory,
        ctx: { team },
        signal: controller.signal,
        onEvent: (event) => {
          if (event.type === 'token') setStreamingText((t) => t + event.text);
          else if (event.type === 'toolCall') setToolActivity((a) => [...a, event.name]);
          // A user-initiated cancel (closing the sheet, tapping stop) surfaces here as
          // an abort "error" — that's not a failure worth showing, just report real ones.
          else if (event.type === 'error' && !controller.signal.aborted) setError(event.message);
        },
      });
      setHistory(updated);
    } catch {
      // Error already captured via onEvent above; base history (with the user's
      // message) is kept so they don't lose what they typed.
    } finally {
      setStreamingText('');
      setToolActivity([]);
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [input, isStreaming, isConfigured, history, settings.ollamaApiKey, settings.ollamaModel, team]);

  if (!isOpen) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="AI Assistant" showSearch={false}>
      <div className="flex flex-col h-[60vh]">
        {!isConfigured ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-2">
            <Bot size={32} className="text-text-tertiary mb-1" />
            <p className="text-sm text-text-primary">AI Assistant isn't set up yet</p>
            <p className="text-[12px] text-text-secondary leading-relaxed">
              Enable it and add an Ollama Cloud API key in Settings → AI Assistant.
            </p>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto space-y-3 pb-2">
              {displayMessages.length === 0 && !isStreaming && (
                <div className="flex flex-col items-center justify-center text-center px-6 py-10 gap-2">
                  <Bot size={28} className="text-text-tertiary" />
                  <p className="text-[12px] text-text-secondary leading-relaxed">
                    Ask about {team ? `"${team.name}"` : 'your team'} — weaknesses, a damage roll,
                    speed comparisons, or whether a set is legal.
                  </p>
                </div>
              )}

              {displayMessages.map((message, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-accent-primary/15 flex items-center justify-center shrink-0">
                      <Bot size={14} className="text-accent-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      message.role === 'user'
                        ? 'bg-accent-primary text-white rounded-br-md'
                        : 'bg-bg-tertiary text-text-primary rounded-bl-md'
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-bg-tertiary flex items-center justify-center shrink-0">
                      <User size={14} className="text-text-secondary" />
                    </div>
                  )}
                </div>
              ))}

              {isStreaming && (
                <div className="flex gap-2 justify-start">
                  <div className="w-7 h-7 rounded-full bg-accent-primary/15 flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-accent-primary" />
                  </div>
                  <div
                    aria-live="polite"
                    className="max-w-[80%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm bg-bg-tertiary text-text-primary space-y-1.5"
                  >
                    {toolActivity.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {toolActivity.map((name, i) => (
                          <span
                            key={`${name}-${i}`}
                            className="inline-flex items-center gap-1 rounded-full bg-accent-primary/10 px-2 py-0.5 text-[10px] text-accent-primary"
                          >
                            <Wrench size={10} />
                            {friendlyToolName(name)}
                          </span>
                        ))}
                      </div>
                    )}
                    {streamingText ? (
                      <p className="whitespace-pre-wrap">{streamingText}</p>
                    ) : (
                      <Loader2 size={14} className="animate-spin text-text-tertiary" />
                    )}
                  </div>
                </div>
              )}

              {error && (
                <p role="alert" className="text-[12px] text-danger text-center px-4 py-2">{error}</p>
              )}
            </div>

            <div className="flex items-end gap-2 pt-3 border-t border-border-subtle shrink-0">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Ask about your team..."
                rows={1}
                className="flex-1 resize-none max-h-24 h-11 py-2.5 px-4 bg-bg-tertiary rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 border border-border-subtle"
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
                  disabled={!input.trim()}
                  aria-label="Send message"
                  className="w-11 h-11 shrink-0 rounded-xl bg-accent-primary text-white flex items-center justify-center disabled:opacity-40 touch-target"
                >
                  <Send size={18} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
