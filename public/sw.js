// ChipHappens — Service Worker
// Cache-first for static assets, network-first for HTML pages.

const CACHE_VERSION = 'v2';
const CACHE_NAME = `chiphappens-${CACHE_VERSION}`;

// ── Install: pre-cache shell ──────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll([
          '/ChipHappens/',
          '/ChipHappens/index.html',
          '/ChipHappens/side-pot',
          '/ChipHappens/side-pot.html',
          '/ChipHappens/icons/app_icon.png',
          '/ChipHappens/manifest.webmanifest',
        ])
      )
      .then(() => self.skipWaiting())
  );
});

// ── Activate: delete old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: network-first for navigation, cache-first for assets ───────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) return;

  const isNavigation = request.mode === 'navigate';

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(async () => {
          // Try exact match first, then .html fallback for clean URLs
          const cached = await caches.match(request);
          if (cached) return cached;

          // /ChipHappens/side-pot -> /ChipHappens/side-pot.html
          const htmlUrl = request.url.replace(/\/?$/, '.html').replace('/.html', '.html');
          const htmlCached = await caches.match(htmlUrl);
          if (htmlCached) return htmlCached;

          // Last resort: serve the index page
          return caches.match('/ChipHappens/') || caches.match('/ChipHappens/index.html');
        })
    );
  } else {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
      )
    );
  }
});
