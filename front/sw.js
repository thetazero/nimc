const cacheName = 'nimc';
// const filesToCache = [
//   '/',
//   '/index.html',
//   '/style.css'
// ];

const filesToCache = [
  '/lib/katex.min.js', '/lib/mhchem.min.js', '/lib/vis-network.min.js', 'lib/katex.min.css']

self.addEventListener('install', e => {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(response => {
      return response || fetch(event.request);
    })
  );
});