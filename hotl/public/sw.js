/* Sale alerts only. The page posts a SHOW message. A future push server can send the same JSON. */
self.addEventListener("push", (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = { body: event.data && event.data.text() }; }
  event.waitUntil(self.registration.showNotification(payload.title || "Tax sale alert", {
    body: payload.body || "A sale date on file is inside your lead time.",
    tag: payload.tag || "hotl-sale",
    data: { url: payload.url || "./#/calendar" },
  }));
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type !== "SHOW" || !data.title) return;
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body || "",
    tag: data.tag || "hotl-sale",
    data: { url: data.url || "./#/calendar" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "./#/calendar";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const client of list) {
      if (client.url && client.url.includes("#/calendar") && "focus" in client) return client.focus();
    }
    for (const client of list) {
      if ("focus" in client) {
        if (client.navigate) client.navigate(url);
        return client.focus();
      }
    }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});
