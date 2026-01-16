/**
 * PWA Utilities
 * Service worker registration and PWA install handling
 */

import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Stores for PWA state
export const isOnline = writable(browser ? navigator.onLine : true);
export const isInstallable = writable(false);
export const isInstalled = writable(false);
export const hasUpdate = writable(false);

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let registration: ServiceWorkerRegistration | null = null;

// Initialize PWA features
export function initPWA() {
	if (!browser) return;

	// Check if already installed
	if (window.matchMedia('(display-mode: standalone)').matches) {
		isInstalled.set(true);
	}

	// Listen for online/offline events
	window.addEventListener('online', () => isOnline.set(true));
	window.addEventListener('offline', () => isOnline.set(false));

	// Listen for install prompt
	window.addEventListener('beforeinstallprompt', (e) => {
		e.preventDefault();
		deferredPrompt = e as BeforeInstallPromptEvent;
		isInstallable.set(true);
	});

	// Listen for app installed
	window.addEventListener('appinstalled', () => {
		isInstalled.set(true);
		isInstallable.set(false);
		deferredPrompt = null;
		console.log('[PWA] App installed');
	});

	// Register service worker
	registerServiceWorker();
}

// Register service worker
async function registerServiceWorker() {
	if (!browser || !('serviceWorker' in navigator)) {
		console.log('[PWA] Service workers not supported');
		return;
	}

	try {
		registration = await navigator.serviceWorker.register('/sw.js', {
			scope: '/'
		});

		console.log('[PWA] Service worker registered');

		// Check for updates
		registration.addEventListener('updatefound', () => {
			const newWorker = registration?.installing;
			if (newWorker) {
				newWorker.addEventListener('statechange', () => {
					if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
						hasUpdate.set(true);
						console.log('[PWA] New version available');
					}
				});
			}
		});

		// Check for updates periodically
		setInterval(() => {
			registration?.update();
		}, 60 * 60 * 1000); // Every hour

	} catch (error) {
		console.error('[PWA] Service worker registration failed:', error);
	}
}

// Trigger install prompt
export async function installPWA(): Promise<boolean> {
	if (!deferredPrompt) {
		console.log('[PWA] No install prompt available');
		return false;
	}

	try {
		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;

		if (outcome === 'accepted') {
			console.log('[PWA] User accepted install');
			deferredPrompt = null;
			isInstallable.set(false);
			return true;
		} else {
			console.log('[PWA] User dismissed install');
			return false;
		}
	} catch (error) {
		console.error('[PWA] Install failed:', error);
		return false;
	}
}

// Apply pending update
export function applyUpdate() {
	if (!registration?.waiting) return;

	registration.waiting.postMessage({ type: 'SKIP_WAITING' });

	// Reload page when new service worker takes control
	let refreshing = false;
	navigator.serviceWorker.addEventListener('controllerchange', () => {
		if (!refreshing) {
			refreshing = true;
			window.location.reload();
		}
	});
}

// Clear all caches
export async function clearCaches(): Promise<void> {
	if (!browser || !registration?.active) return;

	return new Promise((resolve) => {
		const channel = new MessageChannel();
		channel.port1.onmessage = () => resolve();
		registration!.active!.postMessage({ type: 'CLEAR_CACHE' }, [channel.port2]);
	});
}

// Pre-cache specific URLs for offline use
export async function cacheUrls(urls: string[]): Promise<void> {
	if (!browser || !registration?.active) return;

	return new Promise((resolve) => {
		const channel = new MessageChannel();
		channel.port1.onmessage = () => resolve();
		registration!.active!.postMessage(
			{ type: 'CACHE_URLS', payload: { urls } },
			[channel.port2]
		);
	});
}

// Get cache size
export async function getCacheSize(): Promise<number> {
	if (!browser || !registration?.active) return 0;

	return new Promise((resolve) => {
		const channel = new MessageChannel();
		channel.port1.onmessage = (event) => resolve(event.data.size || 0);
		registration!.active!.postMessage({ type: 'GET_CACHE_SIZE' }, [channel.port2]);
	});
}

// Format bytes to human readable
export function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Check if running as installed PWA
export function isPWA(): boolean {
	if (!browser) return false;
	return window.matchMedia('(display-mode: standalone)').matches ||
		(window.navigator as any).standalone === true;
}

// Request push notification permission
export async function requestNotificationPermission(): Promise<boolean> {
	if (!browser || !('Notification' in window)) return false;

	const permission = await Notification.requestPermission();
	return permission === 'granted';
}

// Subscribe to push notifications
export async function subscribeToPush(): Promise<PushSubscription | null> {
	if (!browser || !registration) return null;

	try {
		const subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(
				// This would be your VAPID public key
				'YOUR_VAPID_PUBLIC_KEY'
			)
		});
		return subscription;
	} catch (error) {
		console.error('[PWA] Failed to subscribe to push:', error);
		return null;
	}
}

// Convert base64 to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}
