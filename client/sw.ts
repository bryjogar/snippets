/// <reference lib="WebWorker" />

const sw = globalThis as unknown as ServiceWorkerGlobalScope;

const CACHE = 'snippets-v1';
const APP_FILES = ['/', '/index.html', '/app.js', '/manifest.json'];

sw.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_FILES))
  );
  sw.skipWaiting();
});

sw.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => sw.clients.claim())
  );
});

sw.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
    })
  );
});


