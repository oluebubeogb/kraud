const C = "kraud-v2"; const SHELL = ["/", "/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png", "/mark.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(C).then((c) => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== C).map((x) => caches.delete(x))))); self.clients.claim(); });
self.addEventListener("fetch", (e) => {
  const r = e.request; if (r.method !== "GET" || new URL(r.url).pathname.startsWith("/api/")) return;
  e.respondWith(fetch(r).then((res) => { if (res.ok && new URL(r.url).origin === location.origin) { const cp = res.clone(); caches.open(C).then((c) => c.put(r, cp)); } return res; }).catch(() => caches.match(r).then((m) => m || caches.match("/"))));
});
