'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/ChipHappens/sw.js', { scope: '/ChipHappens/' })
        .catch(() => {
          /* SW registration failed — app still works */
        });
    }
  }, []);

  return null;
}
