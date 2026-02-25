const CACHE_NAME = "workout-app-alpha";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/exerciseBank.html",

  "/styles/style.css",
  "/styles/side-panel.css",

  "/scripts/main.js",
  "/scripts/theme.js",
  "/scripts/side-panel.js",

  "/manifest.json",

  "/assets/gymHero_480.webp",
  "/assets/gymHero_768.webp",
  "/assets/gymHero_1280.webp"
];

// Install — cache files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — cache-first for assets
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return (
        cached ||
        fetch(event.request).catch(() =>
          caches.match("/index.html")
        )
      );
    })
  );
});