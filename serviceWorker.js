const CACHE_NAME = 'pisgah-bisdac-v1';
const urlsToCache = [
  './',
  './index.html',
  './icons/Pisgahpavicon.png',
  './icons/PisgahColor.png'
];

// Saat diinstal, simpan file-file penting ke cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Gunakan strategi Network First, Fallback to Cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Bersihkan cache lama jika ada pembaruan
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});