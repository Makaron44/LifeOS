const CACHE_NAME = 'lifeos-v2'
const ASSETS = [
  '/LifeOS/',
  '/LifeOS/favicon.png',
  '/LifeOS/manifest.json',
  '/LifeOS/pwa-192x192.png',
  '/LifeOS/pwa-512x512.png'
]

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS)
    })
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
})

self.addEventListener('fetch', (e) => {
  // Network First strategy
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
})
