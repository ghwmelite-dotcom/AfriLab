<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { userStore } from '$stores/user';
	import PageTracker from '$lib/components/analytics/PageTracker.svelte';
	import OfflineIndicator from '$lib/components/pwa/OfflineIndicator.svelte';
	import InstallPrompt from '$lib/components/pwa/InstallPrompt.svelte';
	import { initPWA } from '$lib/utils/pwa';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();

	// Update user store with data from server
	$effect(() => {
		if (data.user) {
			userStore.setUser(data.user, data.session);
		} else {
			userStore.setUser(null, null);
		}
	});

	// Initialize PWA features
	onMount(() => {
		initPWA();
	});

	// Check if current route is auth page
	let isAuthPage = $derived($page.url.pathname.startsWith('/auth'));
	let isLandingPage = $derived($page.url.pathname === '/');
</script>

<PageTracker />
<OfflineIndicator />
<InstallPrompt />

<div class="min-h-screen bg-void text-white">
	{@render children()}
</div>

<style>
	.bg-void {
		background: rgb(var(--color-void));
	}
</style>
