const CACHE_NAME = 'bk-mts-v49';
const urlsToCache = [
  './',
  './index.html',
  './login-guru.html',
  './style.css',
  './script.js',
  './logo.png',
  './logo-192.png',
  './logo-512.png',
  './mts.ico',
  './mts.png',
  './site.webmanifest',
  './tata-tertib.html',
  './point-pelanggaran.html',
  './point-prestasi.html',
  './dashboard-guru.html',
  './dashboard-siswa.html',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName); // Delete old caches
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Gunakan Network First untuk halaman HTML/navigasi agar pembaruan kode langsung aktif tanpa tertahan cache
  if (event.request.mode === 'navigate' || event.request.destination === 'document' || event.request.url.endsWith('.html') || event.request.url.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Aset statis lainnya (css, gambar, font): Cache First dengan fallback Network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
