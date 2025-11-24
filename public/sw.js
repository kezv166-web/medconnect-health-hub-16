// Custom Service Worker for Push Notifications with Workbox

// This will be replaced by the list of assets to precache
const manifest = self.__WB_MANIFEST;

// Precache all assets from the manifest
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('medconnect-v1').then((cache) => {
      return cache.addAll(manifest.map(entry => entry.url));
    })
  );
  self.skipWaiting();
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('medconnect-') && cacheName !== 'medconnect-v1')
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Handle fetch requests with cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Listen for push events
self.addEventListener('push', function(event) {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/favicon.ico',
    tag: data.tag || 'medicine-reminder',
    requireInteraction: true,
    data: {
      url: data.url || '/patient-dashboard'
    },
    actions: [
      {
        action: 'mark-taken',
        title: 'Mark as Taken'
      },
      {
        action: 'view',
        title: 'View Details'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'mark-taken') {
    // Could call an API to mark medicine as taken
    event.waitUntil(
      clients.openWindow('/patient-dashboard?action=mark-taken&id=' + event.notification.tag)
    );
  } else {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
