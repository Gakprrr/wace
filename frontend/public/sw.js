// Service Worker WACE - Progressive Web App & Push Notifications
const CACHE_NAME = "wace-pwa-cache-v2";

const isDev = self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1" || self.location.hostname.startsWith("192.168.");

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      if (isDev) {
        return self.registration.unregister();
      }
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // En mode dev/localhost, ne JAMAIS intercepter les requêtes HTTP (laisser le navigateur et Next.js HMR gérer directement)
  if (isDev) return;
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/api/")) return;

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Push Notification Listener
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : { title: "WACE — Wear The Energy", message: "Nouveau contenu disponible !" };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.message,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url || "/" }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || "/")
  );
});
