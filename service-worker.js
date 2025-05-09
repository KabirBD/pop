const CACHE_NAME = 'pop-up-text-v1';
const FILES_TO_CACHE = [
  '/pop/',
  '/pop/index.html',
  '/pop/style.css',
  '/pop/script.js',
  '/pop/icon-192.png',
  '/pop/icon-512.png',
  '/pop/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
