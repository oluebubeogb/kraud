// v4: never cache media/images/_next; never serve HTML in place of a failed asset.
const C = "kraud-v5"; const SHELL = ["/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png", "/mark.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(C).then((c) => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== C && x.startsWith("kraud")).map((x) => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const r = e.request; const u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  if (u.pathname.startsWith("/api/") || u.pathname.startsWith("/media/") || u.pathname.startsWith("/_next/") || r.destination === "image") return; // straight to network
  if (r.mode === "navigate") { e.respondWith(fetch(r).catch(() => caches.match("/manifest.json").then(() => new Response("<h1>Offline</h1><p>Check your connection and retry.</p>", { headers: { "content-type": "text/html" } })))); return; }
  if (SHELL.includes(u.pathname)) e.respondWith(caches.match(r).then((m) => m || fetch(r)));
});
