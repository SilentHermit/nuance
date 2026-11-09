/* 뉘앙스. 서비스워커 — 앱 껍데기(HTML/아이콘)만 캐시. 번역·AI·TTS 요청은 항상 실시간 통신 */
var CACHE = 'nuance-shell-v1';
var SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; /* 외부 요청(번역 API, CDN 폰트 등)은 그대로 통과 */
  if (e.request.mode === 'navigate') { /* 페이지: 네트워크 우선, 끊기면 캐시로 즉시 실행 */
    e.respondWith(fetch(e.request).catch(function () { return caches.match('./index.html'); }));
    return;
  }
  e.respondWith(caches.match(e.request).then(function (r) { return r || fetch(e.request); }));
});
