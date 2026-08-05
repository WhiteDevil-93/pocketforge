import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import AppErrorBoundary from './components/AppErrorBoundary.tsx'
import { isNativeApp } from './lib/platform'

const UPDATE_INTERVAL_MS = 15 * 60 * 1000;

// The Android shell ships its web assets inside the APK and has no service worker, so all
// of the PWA update machinery below is browser-only. Registering it there would reload the
// WebView for no reason.
if (!isNativeApp()) {
  // Chrome normally reloads through Workbox when an updated worker activates.
  // This browser-level fallback covers installed-window and external update cases.
  let isReloadingForUpdate = false;
  if ('serviceWorker' in navigator) {
    let hasActiveController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hasActiveController) {
        hasActiveController = true;
        return;
      }
      if (isReloadingForUpdate) return;
      isReloadingForUpdate = true;
      window.location.reload();
    });
  }

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      updateSW(true);
    },
    onRegisteredSW(_swUrl, r) {
      if (r) {
        setInterval(async () => {
          if (navigator.onLine) {
            try {
              await r.update();
            } catch (e) {
              console.warn('SW update check failed:', e);
            }
          }
        }, UPDATE_INTERVAL_MS);
      }
    },
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && navigator.onLine) {
      navigator.serviceWorker
        ?.getRegistration(import.meta.env.BASE_URL)
        .then((registration) => registration?.update())
        .catch((error) => console.warn('SW update check failed:', error));
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <HashRouter>
      <App />
    </HashRouter>
  </AppErrorBoundary>,
)
