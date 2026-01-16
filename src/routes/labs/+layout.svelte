<script lang="ts">
	import Header from '$components/layout/Header.svelte';
	import { aiStore } from '$stores/ai';
	import ChatAssistant from '$components/ai/ChatAssistant.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
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
		{@render children()}
	</main>

	<!-- AI Chat Panel -->
	{#if $aiStore.isOpen}
		<ChatAssistant />
	{/if}
</div>
