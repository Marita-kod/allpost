// Postillien Service Worker
const CACHE = 'postillien-v1';
const OFFLINE_ASSETS = [
  '/app.html',
  '/index.html',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Installation — cacha filer
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(OFFLINE_ASSETS))
      .catch(() => {}) // Ignorera fel vid cache
  );
  self.skipWaiting();
});

// Aktivering — rensa gamla cachar
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback till cache
self.addEventListener('fetch', event => {
  // Skippa Supabase API-anrop (ska alltid gå mot nätverket)
  if (event.request.url.includes('supabase.co')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cacha lyckade svar för HTML/CSS/JS
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
