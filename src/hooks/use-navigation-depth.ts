// ============================================================================
// PocketForge — In-app navigation depth tracking (for a true "back")
// ============================================================================
//
// PageHeader's back button used to always navigate to a fixed `backTo` path,
// which is wrong whenever the user actually arrived via in-app navigation
// (e.g. Builder -> Analysis -> here): a real back button should retrace that
// path with navigate(-1), only falling back to `backTo` when there's nothing
// to retrace (a deep link or a fresh app launch straight into this route).
//
// This tracks a navigation stack + cursor rather than "have we ever visited
// more than one location" (a plain visited-set is wrong: it never shrinks, so
// after A -> B -> back-to-A, a visited-set still contains both keys and would
// claim a "back" exists from A even though nothing precedes it). PUSH grows
// the stack past the cursor (discarding any forward history, same as real
// browser history); REPLACE overwrites the current slot; POP looks the
// target key up in the stack and moves the cursor there — history POP always
// reuses the exact location object (and its key) from when it was pushed, so
// this reliably finds the right position. canGoBackInApp() is then just
// "is the cursor past the first entry".
//
// Mounted once for the app's lifetime in Layout. Module-level rather than
// React state — PageHeader only needs a point-in-time answer when the back
// button is pressed, not a reason to re-render.

import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router';

let stack: string[] = [];
let cursor = -1;

/** Mount once, app-wide (in Layout) — records every location the router visits. */
export function useNavigationDepthTracking() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const key = location.key;

    if (stack.length === 0) {
      // First entry seen this session, regardless of the reported action.
      stack = [key];
      cursor = 0;
      return;
    }

    if (navigationType === 'POP') {
      const idx = stack.indexOf(key);
      if (idx !== -1) {
        cursor = idx;
      } else {
        // A POP to a key we never recorded (shouldn't normally happen) —
        // treat it as a fresh single-entry stack rather than guessing.
        stack = [key];
        cursor = 0;
      }
    } else if (navigationType === 'REPLACE') {
      stack[cursor] = key;
    } else {
      // PUSH: drop any forward entries past the cursor, then append.
      stack = stack.slice(0, cursor + 1);
      stack.push(key);
      cursor = stack.length - 1;
    }
  }, [location.key, navigationType]);
}

/** True only when there's an earlier in-app entry before the current one. */
export function canGoBackInApp(): boolean {
  return cursor > 0;
}
