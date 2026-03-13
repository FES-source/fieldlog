const CACHE = 'fieldlog-v1.2.0';
const ASSETS = [
  '/fieldlog/',
  '/fieldlog/index.html',
  'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow:wght@400;500;600;700;900&family=Barlow+Condensed:wght@600;700;900&display=swap',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage-compat.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      // Cache main app, ignore failures for external resources
      return cache.addAll(['/fieldlog/', '/fieldlog/index.html']).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network first for Firebase, cache first for app shell
  const url = new URL(e.request.url);
  
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) {
    // Network first for Firebase
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache first for app shell
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      });
    })
  );
});
