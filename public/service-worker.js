// Brickfi PWA Service Worker - Basic offline support

const CACHE_NAME = 'brickfi-cache-v1';
const OFFLINE_URL = '/offline';

const HOSTNAME_WHITELIST = [
  self.location.hostname,
  'fonts.gstatic.com',
  'fonts.googleapis.com',
  'cdn.jsdelivr.net',
];

/**
 * Install event - cache offline page
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add(OFFLINE_URL);
    })
  );
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

/**
 * Fetch event - network first with offline fallback
 */
self.addEventListener('fetch', (event) => {
  // Only handle requests from whitelisted hosts
  const requestUrl = new URL(event.request.url);
  if (HOSTNAME_WHITELIST.indexOf(requestUrl.hostname) === -1) {
    return;
  }

  // Network-first strategy for same-origin requests
  if (requestUrl.hostname === self.location.hostname) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Try to return cached version
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // For navigation requests, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            // Return a basic error response for other requests
            return new Response('Network error', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' },
            });
          });
        })
    );
  } else {
    // For third-party resources (fonts, CDN), cache-first strategy
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
  }
});
