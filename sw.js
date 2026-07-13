const CACHE = 'photomd-plus-v1';
const ASSETS = [
  '/', '/index.html', '/style.css', '/app.js', '/manifest.json',
  '/components/uploader.js', '/components/gallery.js', '/components/compressor.js',
  '/components/background-remover.js', '/components/enhancer.js', '/components/cropper.js',
  '/components/resizer.js', '/components/editor.js', '/components/exporter.js',
  '/components/batch-processor.js', '/components/history.js', '/components/tutorial.js',
  '/workers/compress-worker.js', '/workers/enhance-worker.js',
  '/assets/icon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const clone = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
