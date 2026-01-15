<script lang="ts">
	import Header from '$components/layout/Header.svelte';
	import Sidebar from '$components/layout/Sidebar.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<Header />
	<Sidebar />

	<main class="pl-64 pt-16">
		<div class="p-6">
			{@render children()}
		</div>
	</main>
</div>
