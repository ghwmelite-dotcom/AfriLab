<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	let { className = '', children }: { className?: string; children?: Snippet } = $props();

	let canvasContainer: HTMLDivElement;
</script>

<div
	bind:this={canvasContainer}
	class="lab-container {className}"
>
	{#if children}
		{@render children()}
	{/if}
</div>
