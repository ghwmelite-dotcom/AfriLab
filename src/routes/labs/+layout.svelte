<script lang="ts">
	import Header from '$components/layout/Header.svelte';
	import { aiStore } from '$stores/ai';
	import ChatAssistant from '$components/ai/ChatAssistant.svelte';
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	// Generate breadcrumbs from current path
	let breadcrumbs = $derived(() => {
		const path = $page.url.pathname;
		const segments = path.split('/').filter(Boolean);
		const crumbs: Array<{ label: string; href: string }> = [
			{ label: 'Dashboard', href: '/dashboard' }
		];

		let currentPath = '';
		for (const segment of segments) {
			currentPath += `/${segment}`;
			const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
			crumbs.push({ label, href: currentPath });
		}

		return crumbs;
	});
</script>

<div class="min-h-screen bg-void relative overflow-hidden">
	<!-- Background mesh pattern -->
	<div class="fixed inset-0 bg-mesh pointer-events-none"></div>

	<!-- Animated aurora ribbons -->
	<div class="fixed inset-0 pointer-events-none overflow-hidden">
		<div class="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-conic from-emerald-500/10 via-transparent to-cyan-500/10 animate-slow-spin opacity-30"></div>
	</div>

	<Header showAIButton={true} />

	<main class="relative pt-16">
		<!-- Breadcrumb Navigation -->
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<nav class="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
				{#each breadcrumbs() as crumb, i}
					{#if i > 0}
						<svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					{/if}
					{#if i === breadcrumbs().length - 1}
						<span class="text-gray-400">{crumb.label}</span>
					{:else}
						<a
							href={crumb.href}
							class="text-gray-500 hover:text-white transition-colors flex items-center gap-1.5"
						>
							{#if i === 0}
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
								</svg>
							{/if}
							{crumb.label}
						</a>
					{/if}
				{/each}
			</nav>
		</div>

		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
			{@render children()}
		</div>
	</main>

	<!-- AI Chat Panel -->
	{#if $aiStore.isOpen}
		<ChatAssistant />
	{/if}
</div>
