import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'dark' | 'light' | 'system';

// Get initial theme from localStorage or default to 'dark'
function getInitialTheme(): Theme {
	if (!browser) return 'dark';

	const stored = localStorage.getItem('afrilab-theme') as Theme | null;
	if (stored && ['dark', 'light', 'system'].includes(stored)) {
		return stored;
	}

	return 'dark'; // Default to dark theme for our app
}

// Get system preference
function getSystemPreference(): 'dark' | 'light' {
	if (!browser) return 'dark';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Create the theme store
function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>(getInitialTheme());

	return {
		subscribe,
		set: (theme: Theme) => {
			if (browser) {
				localStorage.setItem('afrilab-theme', theme);
			}
			set(theme);
		},
		toggle: () => {
			update((current) => {
				const resolvedCurrent = current === 'system' ? getSystemPreference() : current;
				const newTheme = resolvedCurrent === 'dark' ? 'light' : 'dark';
				if (browser) {
					localStorage.setItem('afrilab-theme', newTheme);
				}
				return newTheme;
			});
		},
		setDark: () => {
			if (browser) localStorage.setItem('afrilab-theme', 'dark');
			set('dark');
		},
		setLight: () => {
			if (browser) localStorage.setItem('afrilab-theme', 'light');
			set('light');
		},
		setSystem: () => {
			if (browser) localStorage.setItem('afrilab-theme', 'system');
			set('system');
		}
	};
}

export const theme = createThemeStore();

// Derived store that resolves 'system' to actual theme
export const resolvedTheme = derived(theme, ($theme) => {
	if ($theme === 'system') {
		return getSystemPreference();
	}
	return $theme;
});

// Derived store for checking if dark mode
export const isDark = derived(resolvedTheme, ($resolved) => $resolved === 'dark');

// Apply theme to document
export function applyTheme(theme: 'dark' | 'light') {
	if (!browser) return;

	const root = document.documentElement;

	if (theme === 'dark') {
		root.classList.add('dark');
		root.classList.remove('light');
		root.style.colorScheme = 'dark';
	} else {
		root.classList.remove('dark');
		root.classList.add('light');
		root.style.colorScheme = 'light';
	}
}
