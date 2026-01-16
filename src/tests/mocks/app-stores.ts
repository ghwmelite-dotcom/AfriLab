/**
 * Mock for $app/stores
 */

import { writable, readable } from 'svelte/store';

export const page = readable({
	url: new URL('http://localhost:5174/dashboard'),
	params: {},
	route: { id: '/dashboard' },
	status: 200,
	error: null,
	data: {},
	state: {},
	form: null
});

export const navigating = writable(null);

export const updated = {
	check: async () => false,
	subscribe: writable(false).subscribe
};
