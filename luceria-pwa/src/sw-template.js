/*
 * Luceria PWA: offline shell.
 *
 * Source of truth for the service worker. `npm run build` renders this file to
 * `dist/sw.js` through `scripts/stamp-sw.mjs`, which replaces the build
 * placeholder below with the package version plus the build timestamp. Every build therefore gets a
 * fresh cache name, so an installed home-screen app picks up new code instead
 * of serving the shell it cached on the first visit.
 */
const BUILD = '__BUILD__'
const CACHE = `luceria-shell-${BUILD}`
const SHELL = ['/', '/index.html', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin || url.pathname === '/sw.js') return

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => {
          if (request.mode === 'navigate') return caches.match('/index.html')
          return Response.error()
        })
    }),
  )
})
