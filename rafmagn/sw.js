/* Þjónustuverkamaður: geymir allar skrár vefsins svo hann virki án nettengingar eftir fyrstu heimsókn. */
const CACHE = 'rafmagn1-v1';
const FILES = [
  './', 'index.html', 'css/style.css', 'icon.svg', 'manifest.webmanifest',
  'vendor/jspdf.umd.min.js', 'vendor/pdf-fonts.js',
  'js/core/util.js', 'js/core/physics.js', 'js/core/checker.js', 'js/core/store.js', 'js/pdf.js',
  'js/data/methods.js', 'js/data/problems.js', 'js/data/concepts.js', 'js/data/lessons.js',
  'js/ui/dom.js', 'js/ui/widgets.js', 'js/ui/problem.js', 'js/ui/views.js', 'js/ui/app.js',
  'pdf/formulublad.pdf', 'pdf/profglosur.pdf', 'pdf/verkefnayfirlit.pdf',
];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
