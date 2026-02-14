const CACHE_NAME = 'kickstart-v1'
const ASSET_CACHE_NAME = 'kickstart-assets-v1'
const APP_SHELL = ['/', '/dashboard', '/manifest.json', '/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![CACHE_NAME, ASSET_CACHE_NAME].includes(key))
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const requestUrl = new URL(event.request.url)
  const isSameOrigin = requestUrl.origin === self.location.origin
  const isNavigation = event.request.mode === 'navigate'
  const isStaticAsset =
    requestUrl.pathname.startsWith('/_next/static/') ||
    requestUrl.pathname.endsWith('.css') ||
    requestUrl.pathname.endsWith('.js') ||
    requestUrl.pathname.endsWith('.svg')

  if (!isSameOrigin) return

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put('/dashboard', copy))
          return response
        })
        .catch(() => caches.match('/dashboard'))
    )
    return
  }

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const networkFetch = fetch(event.request)
          .then((response) => {
            const copy = response.clone()
            caches.open(ASSET_CACHE_NAME).then((cache) => cache.put(event.request, copy))
            return response
          })
          .catch(() => cached)

        return cached || networkFetch
      })
    )
  }
})
