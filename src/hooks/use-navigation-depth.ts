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
// react-router's own history object doesn't expose "how many entries deep
// are we" in a version-stable way, so this tracks it directly: every
// location the router visits gets recorded by key (unique per navigation,
// `'default'` for the initial entry) in useNavigationDepthTracking, mounted
// once for the app's lifetime in Layout. Module-level rather than React
// state — PageHeader only needs a point-in-time answer when the back button
// is pressed, not a reason to re-render.

import { useEffect } from 'react';
import { useLocation } from 'react-router';

const seenLocationKeys = new Set<string>();

/** Mount once, app-wide (in Layout) — records every location the router visits. */
export function useNavigationDepthTracking() {
  const location = useLocation();
  useEffect(() => {
    seenLocationKeys.add(location.key);
  }, [location.key]);
}

/** True once the user has navigated in-app at least once since launch. */
export function canGoBackInApp(): boolean {
  return seenLocationKeys.size > 1;
}
