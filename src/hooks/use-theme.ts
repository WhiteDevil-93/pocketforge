import { useEffect } from 'react';
import { useStore } from '../store/useStore';

/** Status-bar/task-switcher tint per theme — index.html hard-codes the dark
 *  value for the very first paint, before this hook ever runs. */
const THEME_COLOR: Record<'dark' | 'light', string> = {
  dark: '#0B1120',
  light: '#F8FAFC',
};

/**
 * Syncs settings.theme — the app's own persisted choice; there is no "system"
 * option on AppSettings.theme, so this only ever reacts to the user's
 * explicit pick, never a prefers-color-scheme media query — onto:
 *  - <html data-theme>, which src/index.css's `:root[data-theme="light"]`
 *    block reads to override the dark-by-default CSS custom properties.
 *  - the theme-color meta tag (Android status bar / task switcher tint).
 *  - the color-scheme meta tag (native form-control palette).
 * Call once, near the app root — Layout.tsx.
 */
export function useTheme(): void {
  const theme = useStore((s) => s.settings.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
    document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', theme);
  }, [theme]);
}
