// AlpineRecall Service Worker – Offline-Cache + Push-Notifications
const CACHE = "alpinerecall-v1";
const OFFLINE_URLS = ["/", "/index.html", "/static/js/main.chunk.js", "/static/css/main.chunk.css"];

// ── Installation: Kern-Dateien cachen ──────────────────────────────────────
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

// ── Aktivierung: alten Cache löschen ──────────────────────────────────────
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: Cache-first, dann Netzwerk ─────────────────────────────────────
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(c => c.put(event.request, copy));
        }
        return response;
      }).catch(() => caches.match("/index.html"));
    })
  );
});

// ── Push-Notifications (vom Backend gesendet) ─────────────────────────────
self.addEventListener("push", event => {
  const data = event.data?.json() || {};
  const title = data.title || "⚠ AlpineRecall – Rückruf!";
  const body  = data.body  || "Ein Rückruf betrifft deine Ausrüstung.";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:  "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag:   data.id || "recall",
      data:  { url: data.url || "/" },
      vibrate: [200, 100, 200],
      requireInteraction: true,        // bleibt auf Sperrbildschirm sichtbar
      actions: [
        { action: "view",    title: "Jetzt ansehen" },
        { action: "dismiss", title: "Später" }
      ]
    })
  );
});

// ── Notification-Klick: App öffnen ────────────────────────────────────────
self.addEventListener("notificationclick", event => {
  event.notification.close();
  if (event.action === "dismiss") return;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(event.notification.data?.url || "/");
    })
  );
});
