/* Cache the shell so the app opens with no signal — basements, Foreshore
   parking levels, anywhere the phone drops off. Data lives in IndexedDB,
   never here. */
const V = 'load-v9';
const SHELL = ['./', './index.html', './styles.css', './app.js', './data.js',
               './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Fonts: cache on first success, fall back to whatever we have.
  if (url.hostname.endsWith('gstatic.com') || url.hostname.endsWith('googleapis.com')) {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)
      .then(r => { const c = r.clone(); caches.open(V).then(k => k.put(e.request, c)); return r; })
      .catch(() => new Response('', { status: 504 }))));
    return;
  }

  // Shell: cache first, refresh in the background.
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(r => {
      if (r.ok) { const c = r.clone(); caches.open(V).then(k => k.put(e.request, c)); }
      return r;
    }).catch(() => hit);
    return hit || net;
  }));
});
