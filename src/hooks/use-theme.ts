import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { isNativeApp } from '../lib/platform';

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
 *  - the theme-color meta tag (web/PWA status bar / task switcher tint).
 *  - the color-scheme meta tag (native form-control palette).
 *  - the Android StatusBar (native only) — use-native-shell.ts used to pin
 *    this once at startup to the dark palette regardless of theme, which
 *    left the native status bar dark on both a persisted light-theme launch
 *    and an in-app switch to light. Owned here instead so it reacts to every
 *    theme change the same way the web meta tags do.
 * Call once, near the app root — Layout.tsx.
 */
export function useTheme(): void {
  const theme = useStore((s) => s.settings.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
    document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', theme);

    if (!isNativeApp()) return;

    let cancelled = false;
    void (async () => {
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        if (cancelled) return;
        // Confusingly named: Style.Dark means "light content, for dark backgrounds"
        // — see the plugin's own Android implementation,
        // setAppearanceLightStatusBars(!style.equals("DARK")). Dark theme needs
        // light icons (Style.Dark); light theme needs dark icons (Style.Light).
        await StatusBar.setStyle({ style: theme === 'dark' ? Style.Dark : Style.Light });
        await StatusBar.setBackgroundColor({ color: THEME_COLOR[theme] });
      } catch (error) {
        console.warn('StatusBar theme sync failed:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [theme]);
}
