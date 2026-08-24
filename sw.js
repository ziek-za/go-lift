/* Network first for the app's own code, cache first for fonts and icons.
   The reverse — cache first on the shell — means a reload serves whatever
   was cached and never notices a deploy, which is exactly the trap this
   file fell into. Offline still works: the network attempt fails fast and
   falls straight back to the cached copy. */
const V = 'load-v25';
const SHELL = ['./', './index.html', './styles.css', './app.js', './data.js',
               './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(V)
      /* no-store so a fresh install cannot populate itself from stale HTTP cache */
      .then(c => Promise.all(SHELL.map(u =>
        fetch(u, { cache: 'no-store' }).then(r => r.ok && c.put(u, r)).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Fonts and icons never change under you — cache first is right here.
  if (url.hostname.endsWith('gstatic.com') || url.hostname.endsWith('googleapis.com')
      || /\.(png|svg|woff2?)$/.test(url.pathname)) {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)
      .then(r => { const c = r.clone(); caches.open(V).then(k => k.put(e.request, c)); return r; })
      .catch(() => new Response('', { status: 504 }))));
    return;
  }

  // Everything else: try the network, fall back to cache when there is no signal.
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const c = r.clone(); caches.open(V).then(k => k.put(e.request, c)); }
      return r;
    }).catch(() => caches.match(e.request).then(hit => hit ||
      caches.match('./index.html')))
  );
});
