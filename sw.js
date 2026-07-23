// Service worker: caches the app shell so the form itself
// (not the data - that's handled by Firestore offline persistence)
// loads instantly even with zero signal.

const CACHE_NAME = 'cashew-app-v1';
const FILES_TO_CACHE = [
  './data_collector_pwa.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // App shell files: cache-first (works offline instantly)
  // Everything else (Firebase calls etc.): network, falling back to cache
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => cached);
    })
  );
});
