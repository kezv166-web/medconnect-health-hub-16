// Service Worker for Push Notifications
console.log('[SW] Service worker script loaded');

// Install immediately and skip waiting
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
});

// Activate immediately and claim clients
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(self.clients.claim());
  console.log('[SW] Service worker activated');
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
