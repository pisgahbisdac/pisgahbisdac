// ============================================================
// SERVICE WORKER - GMAHK PISGAH BISDAC (v5.0 - PWA FULL OFFLINE)
// Fitur:
// 1. Cache-First untuk data rohani (Lagu Sion 525 lagu & 66 Kitab Alkitab).
// 2. Pre-cache otomatis di latar belakang saat aktivasi.
// 3. 0ms respons instan saat kebaktian di gedung gereja tanpa sinyal.
// 4. Bypass untuk API dinamis Google Apps Script & Supabase.
// ============================================================

const STATIC_CACHE = 'pisgah-static-v5.7';
const DATA_CACHE = 'pisgah-spiritual-v2.0';

// Aset Inti Aplikasi yang langsung di-cache saat instalasi
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './lagu_sion.json',
  './passage.json',
  './icons/Pisgahpavicon.png',
  './icons/PisgahColor.png'
];

// --- 1. SIKLUS INSTALASI ---
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Langsung aktifkan Service Worker baru
  e.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // Menggunakan allSettled agar jika 1 URL gagal, aset lainnya tetap sukses di-cache
      return Promise.allSettled(
        CORE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Pre-cache skipped: ${url}`, err);
          })
        )
      );
    })
  );
});

// --- 2. SIKLUS AKTIVASI & PEMBERSIHAN CACHE LAMA ---
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== STATIC_CACHE && cache !== DATA_CACHE) {
            console.log('[SW] Menghapus cache versi lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()).then(() => {
      // Unduh dan simpan 66 kitab Alkitab ke cache secara hening di latar belakang
      precacheBibleBooks();
    })
  );
});

// Fungsi untuk menyimpan 66 kitab Alkitab ke DATA_CACHE di latar belakang
async function precacheBibleBooks() {
  try {
    const cache = await caches.open(DATA_CACHE);
    // Cache lagu_sion.json ke DATA_CACHE jika belum ada
    const laguMatch = await cache.match('./lagu_sion.json');
    if (!laguMatch) {
      try {
        const resLagu = await fetch('./lagu_sion.json');
        if (resLagu && resLagu.status === 200) {
          await cache.put('./lagu_sion.json', resLagu.clone());
        }
      } catch (err) { }
    }

    // Unduh bertahap 66 kitab Alkitab (1.json s/d 66.json)
    for (let i = 1; i <= 66; i++) {
      const bookUrl = `./alkitab/${i}.json`;
      const existing = await cache.match(bookUrl);
      if (!existing) {
        try {
          const res = await fetch(bookUrl);
          if (res && res.status === 200) {
            await cache.put(bookUrl, res.clone());
          }
        } catch (err) {
          // Abaikan jika sedang offline saat aktivasi; akan di-fetch on-demand nanti
        }
      }
    }
    console.log('[SW] 66 Kitab Alkitab & Lagu Sion siap digunakan offline!');
  } catch (err) {
    console.warn('[SW] Precache Bible error:', err);
  }
}

// --- 3. PENANGANAN REQUEST JARINGAN (FETCH) ---
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // STRATEGI 1: Bypass langsung untuk API backend dinamis (Google Apps Script & Supabase)
  // Data presensi dan keuangan selalu membutuhkan koneksi server langsung
  if (url.hostname.includes('script.google.com') || url.hostname.includes('supabase.co')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // STRATEGI 2: Cache-First untuk Konten Rohani (Lagu Sion & Alkitab)
  // Menjamin respons instan 0ms saat berada di dalam gereja tanpa sinyal!
  if (url.pathname.includes('lagu_sion.json') || url.pathname.includes('/alkitab/')) {
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(e.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(DATA_CACHE).then((cache) => {
              cache.put(e.request, clone);
            });
          }
          return networkResponse;
        }).catch(() => {
          return new Response(JSON.stringify({ error: 'offline_unavailable' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        });
      })
    );
    return;
  }

  // STRATEGI 3: Cache-First untuk Bundle Aset Vite (/assets/...)
  // File build Vite menggunakan content-hash sehingga kontennya tidak pernah berubah
  if (url.pathname.includes('/assets/')) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached;
        return fetch(e.request).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(e.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // STRATEGI 4: Network-First dengan Fallback Cache & Timeout untuk Halaman & Aset Lainnya
  const isNavigate = e.request.mode === 'navigate';
  if (isNavigate) {
    e.respondWith(
      new Promise((resolve) => {
        let didFallback = false;
        // Timeout 3 detik agar pengguna tidak terjebak loading jika jaringan lambat/mati
        const timer = setTimeout(async () => {
          didFallback = true;
          const cached = await caches.match(e.request) || await caches.match('./index.html') || await caches.match('./');
          if (cached) resolve(cached);
        }, 3000);

        fetch(e.request)
          .then((response) => {
            clearTimeout(timer);
            if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
              const responseToCache = response.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(e.request, responseToCache);
              });
            }
            resolve(response);
          })
          .catch(async () => {
            clearTimeout(timer);
            if (!didFallback) {
              const cached = await caches.match(e.request) || await caches.match('./index.html') || await caches.match('./');
              if (cached) resolve(cached);
              else resolve(new Response('Offline - GMAHK Pisgah Bisdac', { status: 503 }));
            }
          });
      })
    );
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
          const responseToCache = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(e.request);
        if (cached) return cached;
        return null;
      })
  );
});