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
