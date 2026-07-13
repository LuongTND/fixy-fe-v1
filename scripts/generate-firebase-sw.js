/**
 * Generates public/firebase-messaging-sw.js from environment variables.
 * Run before `next dev` or `next build` so the service worker has the
 * correct Firebase config without committing secrets to the repo.
 *
 * Usage:  node scripts/generate-firebase-sw.js
 */

const fs = require("fs");
const path = require("path");

// Load .env and .env.local manually to avoid external dependency (e.g. dotenv)
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const index = trimmed.indexOf("=");
    if (index > 0) {
      const key = trimmed.substring(0, index).trim();
      let value = trimmed.substring(index + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

loadEnvFile(path.resolve(__dirname, "../.env"));
loadEnvFile(path.resolve(__dirname, "../.env.local"));


const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

const missing = Object.entries(config)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length) {
  console.warn(
    `⚠️  Missing Firebase env vars: ${missing.join(", ")}. Service worker may not work.`
  );
}

const output = `// AUTO-GENERATED — do not edit. Run "node scripts/generate-firebase-sw.js" to regenerate.
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js",
);

const firebaseConfig = ${JSON.stringify(config, null, 2)};

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
`;

const outPath = path.resolve(__dirname, "../public/firebase-messaging-sw.js");
fs.writeFileSync(outPath, output, "utf-8");
console.log(`✅ Generated ${outPath}`);

