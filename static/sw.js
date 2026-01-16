/**
 * AfriLab Service Worker
 * Provides offline support and caching for the virtual lab platform
 */

const CACHE_VERSION = 'afrilab-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const OFFLINE_PAGE = '/offline';

// Static assets to cache on install
const STATIC_ASSETS = [
	'/',
	'/offline',
	'/manifest.json',
	'/favicon.png'
];

// Routes that should always try network first
const NETWORK_FIRST_ROUTES = [
	'/api/',
	'/auth/',
	'/dashboard'
];

// Routes that can be served from cache first
const CACHE_FIRST_ROUTES = [
	'/icons/',
	'/images/',
	'/_app/'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
	console.log('[SW] Installing service worker...');

	event.waitUntil(
		caches.open(STATIC_CACHE)
			.then((cache) => {
				console.log('[SW] Caching static assets');
				return cache.addAll(STATIC_ASSETS);
			})
			.then(() => {
				console.log('[SW] Static assets cached');
				return self.skipWaiting();
			})
			.catch((error) => {
				console.error('[SW] Failed to cache static assets:', error);
			})
	);
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
	console.log('[SW] Activating service worker...');

	event.waitUntil(
		caches.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames
						.filter((name) => name.startsWith('afrilab-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
						.map((name) => {
							console.log('[SW] Deleting old cache:', name);
							return caches.delete(name);
						})
				);
			})
			.then(() => {
				console.log('[SW] Claiming clients');
				return self.clients.claim();
			})
	);
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Skip non-GET requests
	if (request.method !== 'GET') {
		return;
	}

	// Skip cross-origin requests
	if (url.origin !== self.location.origin) {
		return;
	}

	// Determine caching strategy based on route
	if (isNetworkFirstRoute(url.pathname)) {
		event.respondWith(networkFirst(request));
	} else if (isCacheFirstRoute(url.pathname)) {
		event.respondWith(cacheFirst(request));
	} else {
		event.respondWith(staleWhileRevalidate(request));
	}
});

// Check if route should use network-first strategy
function isNetworkFirstRoute(pathname) {
	return NETWORK_FIRST_ROUTES.some((route) => pathname.startsWith(route));
}

// Check if route should use cache-first strategy
function isCacheFirstRoute(pathname) {
	return CACHE_FIRST_ROUTES.some((route) => pathname.startsWith(route));
}

// Network-first strategy - try network, fall back to cache
async function networkFirst(request) {
	try {
		const networkResponse = await fetch(request);

		// Cache successful responses
		if (networkResponse.ok) {
			const cache = await caches.open(DYNAMIC_CACHE);
			cache.put(request, networkResponse.clone());
		}

		return networkResponse;
	} catch (error) {
		console.log('[SW] Network failed, trying cache:', request.url);

		const cachedResponse = await caches.match(request);
		if (cachedResponse) {
			return cachedResponse;
		}

		// Return offline page for navigation requests
		if (request.mode === 'navigate') {
			return caches.match(OFFLINE_PAGE);
		}

		throw error;
	}
}

// Cache-first strategy - try cache, fall back to network
async function cacheFirst(request) {
	const cachedResponse = await caches.match(request);

	if (cachedResponse) {
		return cachedResponse;
	}

	try {
		const networkResponse = await fetch(request);

		if (networkResponse.ok) {
			const cache = await caches.open(STATIC_CACHE);
			cache.put(request, networkResponse.clone());
		}

		return networkResponse;
	} catch (error) {
		console.log('[SW] Failed to fetch:', request.url);
		throw error;
	}
}

// Stale-while-revalidate strategy - return cache immediately, update in background
async function staleWhileRevalidate(request) {
	const cachedResponse = await caches.match(request);

	const fetchPromise = fetch(request)
		.then((networkResponse) => {
			if (networkResponse.ok) {
				const cache = caches.open(DYNAMIC_CACHE);
				cache.then((c) => c.put(request, networkResponse.clone()));
			}
			return networkResponse;
		})
		.catch((error) => {
			console.log('[SW] Fetch failed:', request.url);
			return cachedResponse;
		});

	return cachedResponse || fetchPromise;
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
	const { type, payload } = event.data || {};

	switch (type) {
		case 'SKIP_WAITING':
			self.skipWaiting();
			break;

		case 'CLEAR_CACHE':
			clearAllCaches().then(() => {
				event.ports[0]?.postMessage({ success: true });
			});
			break;

		case 'CACHE_URLS':
			cacheUrls(payload.urls).then(() => {
				event.ports[0]?.postMessage({ success: true });
			});
			break;

		case 'GET_CACHE_SIZE':
			getCacheSize().then((size) => {
				event.ports[0]?.postMessage({ size });
			});
			break;
	}
});

// Clear all caches
async function clearAllCaches() {
	const cacheNames = await caches.keys();
	await Promise.all(cacheNames.map((name) => caches.delete(name)));
	console.log('[SW] All caches cleared');
}

// Cache specific URLs
async function cacheUrls(urls) {
	const cache = await caches.open(DYNAMIC_CACHE);
	await cache.addAll(urls);
	console.log('[SW] Cached URLs:', urls.length);
}

// Get total cache size
async function getCacheSize() {
	let totalSize = 0;
	const cacheNames = await caches.keys();

	for (const name of cacheNames) {
		const cache = await caches.open(name);
		const keys = await cache.keys();

		for (const request of keys) {
			const response = await cache.match(request);
			if (response) {
				const blob = await response.clone().blob();
				totalSize += blob.size;
			}
		}
	}

	return totalSize;
}

// Background sync for offline lab data
self.addEventListener('sync', (event) => {
	console.log('[SW] Background sync:', event.tag);

	if (event.tag === 'sync-lab-progress') {
		event.waitUntil(syncLabProgress());
	}

	if (event.tag === 'sync-analytics') {
		event.waitUntil(syncAnalytics());
	}
});

// Sync lab progress when back online
async function syncLabProgress() {
	try {
		// Get pending lab data from IndexedDB
		const pendingData = await getPendingLabData();

		if (pendingData.length > 0) {
			const response = await fetch('/api/sync/lab-progress', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ data: pendingData })
			});

			if (response.ok) {
				await clearPendingLabData();
				console.log('[SW] Lab progress synced');
			}
		}
	} catch (error) {
		console.error('[SW] Failed to sync lab progress:', error);
		throw error;
	}
}

// Sync analytics when back online
async function syncAnalytics() {
	try {
		const pendingEvents = await getPendingAnalytics();

		if (pendingEvents.length > 0) {
			const response = await fetch('/api/analytics', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ events: pendingEvents })
			});

			if (response.ok) {
				await clearPendingAnalytics();
				console.log('[SW] Analytics synced');
			}
		}
	} catch (error) {
		console.error('[SW] Failed to sync analytics:', error);
		throw error;
	}
}

// Placeholder functions for IndexedDB operations
async function getPendingLabData() {
	return [];
}

async function clearPendingLabData() {
	return;
}

async function getPendingAnalytics() {
	return [];
}

async function clearPendingAnalytics() {
	return;
}

// Push notification handling
self.addEventListener('push', (event) => {
	const data = event.data?.json() || {};

	const options = {
		body: data.body || 'New notification from AfriLab',
		icon: '/icons/icon-192x192.png',
		badge: '/icons/badge-72x72.png',
		vibrate: [100, 50, 100],
		data: {
			url: data.url || '/dashboard'
		},
		actions: data.actions || [
			{ action: 'open', title: 'Open' },
			{ action: 'dismiss', title: 'Dismiss' }
		]
	};

	event.waitUntil(
		self.registration.showNotification(data.title || 'AfriLab', options)
	);
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
	event.notification.close();

	if (event.action === 'dismiss') {
		return;
	}

	const url = event.notification.data?.url || '/dashboard';

	event.waitUntil(
		clients.matchAll({ type: 'window', includeUncontrolled: true })
			.then((windowClients) => {
				// Focus existing window if available
				for (const client of windowClients) {
					if (client.url.includes(self.location.origin) && 'focus' in client) {
						client.navigate(url);
						return client.focus();
					}
				}
				// Open new window
				if (clients.openWindow) {
					return clients.openWindow(url);
				}
			})
	);
});
