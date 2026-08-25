// ============================================================================
// PocketForge — Hardware back-button interception for non-route overlays
// ============================================================================
//
// Capacitor's App 'backButton' listener (wired once, app-wide, in
// use-native-shell.ts) is a plain event emitter: every registered listener
// fires for a single back-press, with no bubbling/priority semantics of its
// own. A full-screen overlay that isn't itself a route — PokemonEditor is the
// first case, `fixed inset-0` over the Builder page rather than a router
// entry — has no way to claim the event before the global listener's default
// navigate(-1) fires and navigates the *page underneath* the overlay instead
// of just closing it.
//
// This is a minimal LIFO stack of guards: the topmost registered guard gets
// first refusal on a hardware back-press. Returning true means "handled, do
// not fall through to default navigation"; false means "let the default
// (navigate(-1) / exit app) proceed". Registering unconditionally (not just
// on native) is fine — the stack is only ever consulted from the native
// backButton listener, so it is inert on web/PWA.
//
// Escape (web/PWA) reuses this exact stack — see useEscapeConsumesBackGuard
// below — rather than each overlay owning its own `keydown` listener: two
// listeners on the same `document` target both fire for one keypress (one
// handler's preventDefault/stopPropagation doesn't stop the other), so two
// nested sheets (e.g. a confirm sheet stacked over a list sheet) would both
// close on a single Escape press instead of just the topmost. Routing Escape
// through the same "topmost guard only" stack the hardware back button
// already uses fixes that for both.

import { useEffect } from 'react';

type BackGuardHandler = () => boolean;

const stack: BackGuardHandler[] = [];

/** Registers a handler as the topmost back-guard; call the returned function
 *  on unmount/close to pop it back off. */
export function pushBackGuard(handler: BackGuardHandler): () => void {
  stack.push(handler);
  return () => {
    const index = stack.lastIndexOf(handler);
    if (index !== -1) stack.splice(index, 1);
  };
}

/** Called by use-native-shell's backButton listener before its own default
 *  behavior. Returns true if the topmost guard consumed the press. */
export function consumeBackGuard(): boolean {
  const top = stack[stack.length - 1];
  return top ? top() : false;
}

/** Mount once, app-wide (in Layout) — a single document-level Escape listener
 *  that defers to the same topmost-guard stack the hardware back button uses,
 *  instead of every overlay installing its own Escape handler. */
export function useEscapeConsumesBackGuard() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (consumeBackGuard()) e.preventDefault();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}
