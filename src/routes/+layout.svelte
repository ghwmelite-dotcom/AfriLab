<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { userStore } from '$stores/user';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	// Update user store with data from server
	$: if (data.user) {
		userStore.setUser(data.user, data.session);
	} else {
		userStore.setUser(null, null);
	}

	// Check if current route is auth page
	$: isAuthPage = $page.url.pathname.startsWith('/auth');
	$: isLandingPage = $page.url.pathname === '/';
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<slot />
</div>
