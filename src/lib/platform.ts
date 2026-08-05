import { Capacitor } from '@capacitor/core';

/**
 * Canonical public origin for PocketForge.
 *
 * The Android shell serves the app from its own local server, so `window.location` there
 * points at an internal host that nobody else can open. Anything shared outside the app —
 * share links, anything a user might paste to a teammate — has to use this instead.
 */
export const PUBLIC_APP_URL = 'https://whitedevil-93.github.io/pocketforge/';

/** True when running inside the Capacitor Android shell rather than a browser tab. */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Base URL to build externally shareable links from.
 *
 * In a browser this is wherever the app is actually served from, so local dev and preview
 * builds produce links that work. In the native shell it falls back to the public site.
 */
export function getShareBaseUrl(): string {
  if (isNativeApp()) return PUBLIC_APP_URL;
  return `${window.location.origin}${window.location.pathname}`;
}
