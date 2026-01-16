/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

declare const self: ServiceWorkerGlobalScope;

// Create unique cache names
const CACHE_NAME = `afrilab-cache-${version}`;
const STATIC_CACHE = `afrilab-static-${version}`;
const DYNAMIC_CACHE = `afrilab-dynamic-${version}`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
	...build,
	...files
];

// Routes that can work offline (lab simulations)
const OFFLINE_LABS = [
	'/labs/chemistry/titration',
	'/labs/chemistry/spectroscopy',
	'/labs/biology/microscopy',
	'/labs/biology/cell-division',
	'/labs/physics/ohms-law',
	'/labs/physics/projectile-motion',
	'/labs/pharmacy/compounding',
	'/labs/medical/vital-signs'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(STATIC_CACHE);
			await cache.addAll(STATIC_ASSETS);

			// Skip waiting to activate immediately
			await self.skipWaiting();
		})()
	);
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			// Get all cache names
			const cacheNames = await caches.keys();

			// Delete old caches
			await Promise.all(
				cacheNames
					.filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== CACHE_NAME)
					.map((name) => caches.delete(name))
			);

			// Take control of all clients
			await self.clients.claim();
		})()
	);
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Skip non-GET requests
	if (request.method !== 'GET') return;

	// Skip external requests
	if (url.origin !== self.location.origin) return;

	// Skip API requests for demo-login (needs fresh data)
	if (url.pathname.startsWith('/api/')) {
		event.respondWith(networkFirst(request));
		return;
	}

	// Static assets - cache first
	if (STATIC_ASSETS.includes(url.pathname)) {
		event.respondWith(cacheFirst(request));
		return;
	}

	// Lab pages - cache first for offline support
	if (isLabPage(url.pathname)) {
		event.respondWith(cacheFirst(request));
		return;
	}

	// HTML pages - network first with cache fallback
	if (request.headers.get('accept')?.includes('text/html')) {
		event.respondWith(networkFirst(request));
		return;
	}

	// Everything else - network first
	event.respondWith(networkFirst(request));
});

// Check if the pathname is a lab page
function isLabPage(pathname: string): boolean {
	return OFFLINE_LABS.some((lab) => pathname.startsWith(lab));
}

// Cache first strategy - try cache, fallback to network
async function cacheFirst(request: Request): Promise<Response> {
	const cachedResponse = await caches.match(request);

	if (cachedResponse) {
		return cachedResponse;
	}

	try {
		const networkResponse = await fetch(request);

		if (networkResponse.ok) {
			const cache = await caches.open(DYNAMIC_CACHE);
			cache.put(request, networkResponse.clone());
		}

		return networkResponse;
	} catch {
		return offlineFallback(request);
	}
}

// Network first strategy - try network, fallback to cache
async function networkFirst(request: Request): Promise<Response> {
	try {
		const networkResponse = await fetch(request);

		if (networkResponse.ok) {
			const cache = await caches.open(DYNAMIC_CACHE);
			cache.put(request, networkResponse.clone());
		}

		return networkResponse;
	} catch {
		const cachedResponse = await caches.match(request);

		if (cachedResponse) {
			return cachedResponse;
		}

		return offlineFallback(request);
	}
}

// Generate offline fallback response
function offlineFallback(request: Request): Response {
	const url = new URL(request.url);

	// HTML offline fallback
	if (request.headers.get('accept')?.includes('text/html')) {
		return new Response(generateOfflineHTML(url.pathname), {
			headers: { 'Content-Type': 'text/html; charset=utf-8' }
		});
	}

	// JSON offline fallback
	if (request.headers.get('accept')?.includes('application/json')) {
		return new Response(
			JSON.stringify({
				error: 'offline',
				message: 'You are currently offline. Please check your connection.'
			}),
			{
				status: 503,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}

	return new Response('Offline', { status: 503 });
}

// Generate offline HTML page
function generateOfflineHTML(pathname: string): string {
	const isLab = isLabPage(pathname);

	return `
<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Offline - AfriLab</title>
	<meta name="theme-color" content="#10b981">
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}
		body {
			font-family: system-ui, -apple-system, sans-serif;
			background: linear-gradient(135deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%);
			min-height: 100vh;
			display: flex;
			align-items: center;
			justify-content: center;
			color: white;
			padding: 20px;
		}
		.container {
			max-width: 500px;
			text-align: center;
		}
		.icon {
			width: 80px;
			height: 80px;
			margin: 0 auto 24px;
			background: linear-gradient(135deg, #10b981, #06b6d4);
			border-radius: 20px;
			display: flex;
			align-items: center;
			justify-content: center;
			opacity: 0.8;
		}
		.icon svg {
			width: 40px;
			height: 40px;
			color: white;
		}
		h1 {
			font-size: 28px;
			font-weight: 700;
			margin-bottom: 12px;
		}
		p {
			color: #94a3b8;
			margin-bottom: 24px;
			line-height: 1.6;
		}
		.retry-btn {
			display: inline-flex;
			align-items: center;
			gap: 8px;
			padding: 12px 24px;
			background: linear-gradient(135deg, #10b981, #06b6d4);
			color: white;
			border: none;
			border-radius: 12px;
			font-size: 16px;
			font-weight: 600;
			cursor: pointer;
			transition: all 0.2s;
		}
		.retry-btn:hover {
			transform: translateY(-2px);
			box-shadow: 0 10px 30px -10px rgba(16, 185, 129, 0.5);
		}
		.tip {
			margin-top: 32px;
			padding: 16px;
			background: rgba(255, 255, 255, 0.05);
			border-radius: 12px;
			font-size: 14px;
			color: #64748b;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="icon">
			<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
			</svg>
		</div>
		<h1>You're Offline</h1>
		<p>
			${isLab
				? 'This lab simulation requires a network connection to load. Please connect to the internet and try again.'
				: 'It looks like you\'ve lost your internet connection. Please check your network and try again.'}
		</p>
		<button class="retry-btn" onclick="window.location.reload()">
			<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
			</svg>
			Try Again
		</button>
		<div class="tip">
			<strong>Tip:</strong> Once connected, AfriLab will cache lab resources for faster loading and limited offline access.
		</div>
	</div>
</body>
</html>
`;
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
	if (event.data?.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}

	// Precache specific lab pages on demand
	if (event.data?.type === 'CACHE_LAB') {
		const labPath = event.data.path;
		if (labPath && isLabPage(labPath)) {
			event.waitUntil(precacheLab(labPath));
		}
	}
});

// Precache a specific lab page and its assets
async function precacheLab(labPath: string): Promise<void> {
	const cache = await caches.open(DYNAMIC_CACHE);
	await cache.add(labPath);
}
