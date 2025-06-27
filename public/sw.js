const CACHE_NAME = 'nightvibe-v1';
const urlsToCache = [
  '/',
  '/djs',
  '/clubs',
  '/chat',
  '/moments',
  '/leaderboard',
  '/dashboard',
  '/manifest.json',
  // Add more static assets as needed
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip requests to API routes and socket.io
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/socket.io/') ||
      event.request.url.includes('/_next/webpack-hmr')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Don't cache if not successful
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from NightVibe!',
    icon: 'https://images.placeholders.dev/?width=192&height=192&text=NV&bgColor=%23ff006e&textColor=%23ffffff',
    badge: 'https://images.placeholders.dev/?width=72&height=72&text=NV&bgColor=%23ff006e&textColor=%23ffffff',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: 'https://images.placeholders.dev/?width=128&height=128&text=Open&bgColor=%23ff006e&textColor=%23ffffff'
      },
      {
        action: 'close',
        title: 'Close',
        icon: 'https://images.placeholders.dev/?width=128&height=128&text=X&bgColor=%23666666&textColor=%23ffffff'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('NightVibe', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  return new Promise((resolve) => {
    // Implement background sync logic here
    // For example, sync offline messages when connection is restored
    console.log('Background sync triggered');
    resolve();
  });
} 