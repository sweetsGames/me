const CACHE_NAME = 'kids-games-universal-v1';

// インストール時は待たずに即時有効化
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// どのゲーム（HTML）が開かれても自動でキャッシュし、オフライン時は端末内から即座に起動
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // すでに端末内にあればそれを返す（機内モード時）
      if (cachedResponse) {
        return cachedResponse;
      }
      // 端末になければネットから取得し、同時に端末内へ自動保存
      return fetch(e.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return networkResponse;
      });
    })
  );
});
