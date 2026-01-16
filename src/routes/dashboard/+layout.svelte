<script lang="ts">
	import Header from '$components/layout/Header.svelte';
	import Sidebar from '$components/layout/Sidebar.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	let sidebarOpen = $state(false);

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	function closeSidebar() {
		sidebarOpen = false;
	}
</script>

<div class="min-h-screen bg-void relative overflow-hidden">
	<!-- Deep space background with layered gradients -->
	<div class="fixed inset-0 bg-mesh pointer-events-none"></div>

	<!-- Animated aurora ribbons -->
	<div class="fixed inset-0 pointer-events-none overflow-hidden">
		<div class="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-conic from-emerald-500/10 via-transparent to-cyan-500/10 animate-slow-spin opacity-30"></div>
		<div class="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-conic from-blue-500/10 via-transparent to-purple-500/10 animate-slow-spin-reverse opacity-20"></div>
	</div>

	<!-- Subtle grid pattern overlay -->
	<div class="fixed inset-0 pointer-events-none opacity-[0.02]" style="background-image: linear-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.3) 1px, transparent 1px); background-size: 60px 60px;"></div>

	<Header showAIButton={true} onMenuToggle={toggleSidebar} />
	<Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

	<main class="relative pt-16 lg:pl-72 min-h-screen">
		<div class="relative">
			{@render children()}
		</div>
	</main>
</div>

<style>
	@keyframes slow-spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	@keyframes slow-spin-reverse {
		from { transform: rotate(360deg); }
		to { transform: rotate(0deg); }
	}

	:global(.animate-slow-spin) {
		animation: slow-spin 120s linear infinite;
	}

	:global(.animate-slow-spin-reverse) {
		animation: slow-spin-reverse 150s linear infinite;
	}

	:global(.bg-gradient-conic) {
		background: conic-gradient(var(--tw-gradient-stops));
	}
</style>
