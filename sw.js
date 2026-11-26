// خدمة العمل دون اتصال - معامل النور الطبية
const V = 'alnour-v2';
const SHELL = ['./', 'index.html', 'bg.css', 'slider.css', 'slider2.css', 'manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // العدّاد والموارد الخارجية تفضل على الشبكة
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(r => { const cp = r.clone(); caches.open(V).then(c => c.put('index.html', cp)); return r; })
        .catch(() => caches.match('index.html'))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit => {
      const net = fetch(e.request)
        .then(r => { if (r && r.status === 200) { const cp = r.clone(); caches.open(V).then(c => c.put(e.request, cp)); } return r; })
        .catch(() => hit);
      return hit || net;
    })
  );
});
