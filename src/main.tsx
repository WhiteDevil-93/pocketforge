import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

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
      }, 30 * 1000);
    }
  },
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && navigator.onLine) {
    navigator.serviceWorker?.getRegistration().then((r) => r?.update());
  }
});

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <App />
  </HashRouter>,
)
