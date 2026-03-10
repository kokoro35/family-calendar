// Service Worker — 家族カレンダー PWA
var CACHE_NAME = 'family-cal-v1';
var STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap'
];

// インストール時に静的アセットをキャッシュ
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
          .map(function(n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

// ネットワーク優先、失敗時はキャッシュ
self.addEventListener('fetch', function(e) {
  // GAS APIリクエストは常にネットワーク（キャッシュしない）
  if (e.request.url.indexOf('script.google.com') >= 0 ||
      e.request.url.indexOf('script.googleusercontent.com') >= 0) {
    return;
  }
  e.respondWith(
    fetch(e.request).then(function(res) {
      // 成功したらキャッシュも更新
      var clone = res.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(e.request, clone);
      });
      return res;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});
