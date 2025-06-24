const CACHE_NAME = 'stations-of-sun-v1';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;

// Assets to cache immediately (App Shell)
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles/style.css',
  '/styles/calendar.css',
  '/app.js',
  '/components/Map.js',
  '/components/StationList.js',
  '/components/StationDetail.js',
  '/components/Calendar.js',
  '/services/api.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  '/offline.html'
];

// Install event - cache app shell assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...', event);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching App Shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...', event);
  
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old versions of our caches
            if (!currentCaches.includes(cacheName)) {
              console.log('[Service Worker] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement cache-first strategy for app shell, 
// network-first for dynamic content
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (!url.origin.startsWith(self.location.origin) && !url.hostname.includes('unpkg.com')) {
    return;
  }
  
  // For API calls, use network first, fallback to custom offline response for API
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response to store in cache
          const responseToCache = response.clone();
          
          // Cache successful API responses for offline use
          caches.open(DYNAMIC_CACHE)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          // Check cache for previous API response
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Return custom offline response for API calls
              return new Response(
                JSON.stringify({
                  success: false,
                  message: 'You are currently offline. Using cached data where available.',
                  offline: true
                }),
                {
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
    return;
  }
  
  // For app shell resources, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        // For non-cached resources, fetch from network
        return fetch(event.request)
          .then(response => {
            // Check if response is valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Store in dynamic cache
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(err => {
            // For HTML pages, show offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  let data = { title: 'Station Update', body: 'New station updates available.' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Error parsing push notification data:', e);
    }
  }
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      url: data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    // Open the app and navigate to a specific page
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then(windowClients => {
          // Check if a window client already exists
          for (let client of windowClients) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              return client.focus();
            }
          }
          
          // If no window client exists, open a new one
          if (clients.openWindow) {
            return clients.openWindow(event.notification.data.url || '/');
          }
        })
    );
  }
});
