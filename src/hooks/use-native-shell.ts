import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { isNativeApp } from '../lib/platform';
import { HOME_PATH } from '../lib/routes';
import { consumeBackGuard } from './use-back-guard';

/**
 * Wires up the Android shell's platform behaviour.
 *
 * No-ops in the browser, so the Pages build is unaffected. The Capacitor plugins are
 * imported dynamically to keep them out of the web bundle entirely.
 */
export function useNativeShell() {
  const navigate = useNavigate();
  const location = useLocation();

  // Status bar + splash screen. Runs once — these are app-global.
  useEffect(() => {
    if (!isNativeApp()) return;

    let cancelled = false;

    void (async () => {
      try {
        const [{ StatusBar, Style }, { SplashScreen }] = await Promise.all([
          import('@capacitor/status-bar'),
          import('@capacitor/splash-screen'),
        ]);
        if (cancelled) return;

        // Confusingly named: Style.Dark means "light content, for dark backgrounds" —
        // see the plugin's own Android implementation, setAppearanceLightStatusBars(!style.equals("DARK")).
        // The app is dark-first (#0B1120), so this is the one we want; Style.Light renders
        // dark icons and would be invisible here.
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0B1120' });
        await SplashScreen.hide();
      } catch (error) {
        console.warn('Native shell setup failed:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Hardware back button. Without this Android's back gesture closes the app from any
  // screen instead of walking the history.
  useEffect(() => {
    if (!isNativeApp()) return;

    let remove: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      const { App } = await import('@capacitor/app');
      if (cancelled) return;

      const handle = await App.addListener('backButton', ({ canGoBack }) => {
        // A non-route overlay (e.g. PokemonEditor's unsaved-changes guard) gets
        // first refusal — see use-back-guard.ts for why this can't just be a
        // second addListener call.
        if (consumeBackGuard()) return;
        // Only leave the app from the home screen. Anywhere else, go back — falling
        // back to home when there is no history to pop (e.g. a deep link cold start).
        if (location.pathname === HOME_PATH) {
          void App.exitApp();
          return;
        }
        if (canGoBack) {
          navigate(-1);
        } else {
          navigate(HOME_PATH, { replace: true });
        }
      });

      if (cancelled) {
        void handle.remove();
        return;
      }
      remove = () => void handle.remove();
    })();

    return () => {
      cancelled = true;
      remove?.();
    };
  }, [navigate, location.pathname]);
}
