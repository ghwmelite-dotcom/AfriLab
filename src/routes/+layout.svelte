<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { userStore } from '$stores/user';
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

	// Check if current route is auth page
	let isAuthPage = $derived($page.url.pathname.startsWith('/auth'));
	let isLandingPage = $derived($page.url.pathname === '/');
</script>

<div class="min-h-screen bg-void text-white">
	{@render children()}
</div>

<style>
	.bg-void {
		background: rgb(var(--color-void));
	}
</style>
