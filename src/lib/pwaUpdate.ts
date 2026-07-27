export type AppUpdateResult = 'updated' | 'current' | 'offline' | 'unsupported';

const INSTALL_TIMEOUT_MS = 15_000;

function waitForInstall(worker: ServiceWorker): Promise<boolean> {
  return new Promise((resolve) => {
    const finish = (installed: boolean) => {
      window.clearTimeout(timeout);
      worker.removeEventListener('statechange', handleStateChange);
      resolve(installed);
    };

    const handleStateChange = () => {
      if (worker.state === 'installed' || worker.state === 'activated') {
        finish(true);
      } else if (worker.state === 'redundant') {
        finish(false);
      }
    };

    const timeout = window.setTimeout(() => finish(false), INSTALL_TIMEOUT_MS);
    worker.addEventListener('statechange', handleStateChange);
    handleStateChange();
  });
}

/**
 * Ask the service worker scoped to this GitHub Pages app to check for an update.
 * It intentionally leaves localStorage and unrelated origin caches untouched.
 */
export async function checkForAppUpdate(): Promise<AppUpdateResult> {
  if (!('serviceWorker' in navigator)) return 'unsupported';
  if (!navigator.onLine) return 'offline';

  const registration = await navigator.serviceWorker.getRegistration(import.meta.env.BASE_URL);
  if (!registration) return 'unsupported';

  await registration.update();

  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    return 'updated';
  }

  if (registration.installing) {
    return (await waitForInstall(registration.installing)) ? 'updated' : 'current';
  }

  return 'current';
}
