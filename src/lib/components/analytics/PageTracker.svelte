<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { trackPageView, analytics } from '$lib/utils/analytics';
	import { onMount, onDestroy } from 'svelte';

	let lastPath = '';

	// Track page views on route changes
	$effect(() => {
		if (browser && $page.url.pathname !== lastPath) {
			lastPath = $page.url.pathname;
			const pageTitle = document.title || 'AfriLab';
			trackPageView($page.url.pathname, pageTitle);
		}
	});

	// Cleanup on unmount
	onDestroy(() => {
		if (browser) {
			analytics.destroy();
		}
	});
</script>

<!-- This component has no UI - it only tracks analytics -->
