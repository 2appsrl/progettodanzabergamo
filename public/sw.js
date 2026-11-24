// Service worker: riceve le notifiche push e le mostra sul telefono.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (evento) => {
  let dati = {};
  try { dati = evento.data ? evento.data.json() : {}; } catch { dati = {}; }
  evento.waitUntil(
    self.registration.showNotification(dati.titolo || "Progetto Danza Bergamo", {
      body: dati.testo || "",
      icon: "/icona-192.png",
      badge: "/icona-192.png",
      data: { url: dati.url || "/genitori" },
    }),
  );
});

self.addEventListener("notificationclick", (evento) => {
  evento.notification.close();
  const url = new URL(evento.notification.data?.url || "/genitori", self.location.origin).href;
  evento.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((finestre) => {
      const aperta = finestre.find((f) => f.url === url);
      return aperta ? aperta.focus() : self.clients.openWindow(url);
    }),
  );
});
