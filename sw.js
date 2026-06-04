const CACHE_NAME = 'Pisgah-Bisdac-v2';
const urlsToCache = [
  './',
  './carousel',
  './document',
  './icons',
  './index.html',
  './manifest.json',
  './icons/Pisgahpavicon.png',
  './icons/PisgahColor.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Memaksa service worker baru untuk langsung aktif
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (e) => {
  // Membersihkan cache lama
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Memaksa service worker mengambil kendali page
  );
});

self.addEventListener('fetch', (e) => {
  // Bypass cache untuk API ke Google Apps Script
  if (e.request.url.includes('script.google.com')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Network-First Strategy: Selalu ambil dari internet dulu agar update langsung muncul
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Jika sukses dari internet, simpan juga ke cache
        if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Jika offline atau error, fallback ambil dari cache lama
        return caches.match(e.request);
      })
  );
});