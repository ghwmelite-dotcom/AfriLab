/**
 * Test Setup
 * Configures the testing environment
 */

import { vi } from 'vitest';
import '@testing-library/svelte/vitest';

// Mock browser globals
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}))
});

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
	value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn()
};
Object.defineProperty(window, 'sessionStorage', {
	value: sessionStorageMock
});

// Mock navigator
Object.defineProperty(navigator, 'vibrate', {
	value: vi.fn()
});

Object.defineProperty(navigator, 'onLine', {
	value: true,
	writable: true
});

// Mock AudioContext
class MockAudioContext {
	sampleRate = 44100;
	state = 'running';
	createBuffer = vi.fn(() => ({
		getChannelData: () => new Float32Array(1000)
	}));
	createBufferSource = vi.fn(() => ({
		buffer: null,
		connect: vi.fn(),
		start: vi.fn()
	}));
	createGain = vi.fn(() => ({
		gain: { value: 1 },
		connect: vi.fn()
	}));
	destination = {};
	resume = vi.fn();
}

(window as any).AudioContext = MockAudioContext;
(window as any).webkitAudioContext = MockAudioContext;

// Mock ResizeObserver
class MockResizeObserver {
	observe = vi.fn();
	unobserve = vi.fn();
	disconnect = vi.fn();
}

(window as any).ResizeObserver = MockResizeObserver;

// Mock IntersectionObserver
class MockIntersectionObserver {
	observe = vi.fn();
	unobserve = vi.fn();
	disconnect = vi.fn();
}

(window as any).IntersectionObserver = MockIntersectionObserver;
