<script lang="ts">
	import { onMount } from 'svelte';

	export let className = '';

	let canvasContainer: HTMLDivElement;
</script>

<div
	bind:this={canvasContainer}
	class="lab-container {className}"
>
	<slot />
</div>
