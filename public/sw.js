const CACHE_NAME = 'lifeos-v1'
const ASSETS = [
  '/LifeOS/',
  '/LifeOS/favicon.png',
  '/LifeOS/manifest.json',
  '/LifeOS/pwa-192x192.png',
  '/LifeOS/pwa-512x512.png'
]

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS)
    })
  )
})

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request)
    })
  )
})
