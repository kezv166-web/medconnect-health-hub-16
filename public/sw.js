// Custom Service Worker for Push Notifications
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
