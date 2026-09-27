// Self-unregistering service worker to ensure clean native WebView & PWA execution
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.claim().then(() => {
      return self.registration.unregister();
    })
  );
});
