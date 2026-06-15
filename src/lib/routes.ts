/** Main dashboard / team list — the app home after onboarding. */
export const HOME_PATH = '/teams';

/** Hub pages launched from the home screen; Home tab stays highlighted. */
export const HOME_HUB_PATHS = [
  HOME_PATH,
  '/settings',
  '/import-export',
  '/movepool',
  '/speed-tiers',
  '/weakness-analyzer',
  '/custom-formats',
] as const;

export function isHomeHubPath(pathname: string): boolean {
  return HOME_HUB_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}