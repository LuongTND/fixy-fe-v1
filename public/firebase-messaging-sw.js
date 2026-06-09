importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyC96F73gB3WVA1MJ6-1NfWmE575E6wj8io",
  authDomain: "fixy-push-notification.firebaseapp.com",
  projectId: "fixy-push-notification",
  storageBucket: "fixy-push-notification.firebasestorage.app",
  messagingSenderId: "400475429932",
  appId: "1:400475429932:web:e52987751800239e1d0589",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Nhận tin nhắn ngầm:", payload);

  const notificationTitle = payload.data.title || "Thông báo từ FIXY";
  const notificationOptions = {
    body: payload.data.body || "",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: {
      url: payload.data.deepLink || "/",
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data.url;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.navigate(targetUrl).then((c) => c.focus());
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});
