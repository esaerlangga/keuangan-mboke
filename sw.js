const CACHE_NAME = "mboke-cache-v2"; // Versi cache kita naikkan agar memori lama dibuang

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "./index.html",
        "./css/style.css",
        "./js/main.js",
        "./js/transaksi.js",
        "./assets/images/logo-mboke.png.png",
      ]);
    }),
  );
  // Memaksa Service Worker baru untuk langsung aktif tanpa menunggu
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  // Membersihkan cache/memori versi lama (v1) agar tidak menumpuk
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: Menghapus cache lama", cache);
            return caches.delete(cache);
          }
        }),
      );
    }),
  );
});

self.addEventListener("fetch", (e) => {
  // STRATEGI: Network-First (Ambil dari server dulu, jika gagal/offline baru pakai Cache)
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Jika berhasil mengambil file terbaru, simpan juga salinannya ke memori
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Jika sedang offline (tidak ada internet), ambil dari memori (cache)
        return caches.match(e.request);
      }),
  );
});
