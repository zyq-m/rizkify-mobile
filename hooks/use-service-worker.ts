import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface UseServiceWorkerResult {
  updateAvailable: boolean;
  update: () => void;
}

export function useServiceWorker(): UseServiceWorkerResult {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      if (registration.waiting) {
        setUpdateAvailable(true);
        setWaitingWorker(registration.waiting);
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
            setWaitingWorker(newWorker);
          }
        });
      });
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }, []);

  const update = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [waitingWorker]);

  return { updateAvailable, update };
}
