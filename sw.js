// Bump VERSION whenever any app file changes so iPads pick up the update.
// The cache name is prefixed: the Seneca app (pa34-checklists) shares this origin's cache storage.
const PREFIX = 'da40-checklists-';
const VERSION = PREFIX + 'v3';
const CHARTS = ['5-13', '5-15', '5-21'].map(c => './charts/' + c + '.png');   // AFM Section 5 chart scans: keep in step with AIRCRAFT.chartFlow
const FILES = ['./', './index.html', './manifest.webmanifest', './aircraft.js', './defaults.js', './perf.js', './charts.js', './icon-180.png', './icon-512.png'].concat(CHARTS);

self.addEventListener('install', e => {
  // cache: 'reload' skips the browser's HTTP cache, so an update never stores stale copies of old files.
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  // Delete only this app's older caches; never another app's on the same origin.
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache first, so the app always opens instantly with no connection. Lookups stay inside this app's own cache.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(VERSION)
      .then(c => c.match(e.request, { ignoreSearch: true }))
      .then(hit => hit || fetch(e.request))
  );
});
