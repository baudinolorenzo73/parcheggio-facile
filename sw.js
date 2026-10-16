const PREFIX = 'parcheggio-' + self.registration.scope;
const CACHE = PREFIX + 'v9';
const ASSETS = ['./', './index.html', './parcheggio.html', './rapido.html', './manifest.webmanifest', './manifest-rapido.webmanifest', './icon-192.png', './icon-512.png', './icon-rapido-192.png', './icon-rapido-512.png'];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (!ASSETS.some(path => new URL(path, self.registration.scope).href === url.origin + url.pathname)) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) { const clone = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, clone))); }
    return response;
  }).catch(() => caches.match(event.request, {ignoreSearch: true}).then(response => response || Response.error())));
});
