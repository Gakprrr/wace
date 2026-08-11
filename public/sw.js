self.addEventListener("push", (event) => {
  const data = event.data?.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.message,
      icon: "/icons/wace-icon-192.png",
      badge: "/icons/wace-badge-72.png",
      data: { url: data.url || "/" },
      actions: [
        { action: "view", title: "Voir l'article" },
        { action: "close", title: "Fermer" }
      ]
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "view" && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
