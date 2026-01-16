<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	let { className = '', children }: { className?: string; children?: Snippet } = $props();

	let canvasContainer: HTMLDivElement;
</script>

<div
	bind:this={canvasContainer}
	class="lab-canvas relative glass-strong rounded-2xl border border-white/10 overflow-hidden {className}"
>
	<!-- Lab bench texture -->
	<div class="absolute inset-0 bg-gradient-to-b from-gray-800/50 to-gray-900/80"></div>

	<!-- Grid pattern for lab feel -->
	<div class="absolute inset-0 opacity-[0.03]" style="background-image: url('data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\'%3E%3Cpath d=\'M0 0h1v40H0V0zm40 0v1H0V0h40zm0 40v-1H0v1h40zM1 0v40h-1V0h1z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>

	<!-- Ambient lighting effect -->
	<div class="absolute top-0 left-1/4 right-1/4 h-32 bg-gradient-to-b from-emerald-500/5 to-transparent"></div>
	<div class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/30 to-transparent"></div>

	<!-- Corner accents -->
	<div class="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-emerald-500/20 rounded-tl-2xl"></div>
	<div class="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-cyan-500/20 rounded-tr-2xl"></div>
	<div class="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-cyan-500/20 rounded-bl-2xl"></div>
	<div class="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-emerald-500/20 rounded-br-2xl"></div>

	<!-- Content -->
	<div class="relative z-10">
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>

<style>
	.lab-canvas {
		background: linear-gradient(
			135deg,
			rgba(15, 23, 42, 0.95) 0%,
			rgba(10, 15, 28, 0.98) 50%,
			rgba(15, 23, 42, 0.95) 100%
		);
		box-shadow:
			0 0 0 1px rgba(255, 255, 255, 0.05) inset,
			0 20px 40px rgba(0, 0, 0, 0.4),
			0 0 80px rgba(16, 185, 129, 0.05);
	}
</style>
