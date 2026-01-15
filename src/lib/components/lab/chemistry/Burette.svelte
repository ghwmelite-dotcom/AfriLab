<script lang="ts">
	import { formatNumber } from '$lib/utils/helpers';

	export let volume: number; // Current volume in mL
	export let maxVolume: number = 50; // Max capacity
	export let isPouring: boolean = false;
	export let onPour: () => void = () => {};
	export let onStopPour: () => void = () => {};

	let fillPercent = $derived((volume / maxVolume) * 100);
	let reading = $derived(maxVolume - volume); // Burette readings go from 0 at top
</script>

<div class="relative flex flex-col items-center">
	<!-- Label -->
	<div class="mb-2 text-center">
		<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Burette</span>
		<div class="text-xs text-gray-500 dark:text-gray-400">NaOH (0.1 M)</div>
	</div>

	<!-- Burette body -->
	<div class="relative w-8 h-64 bg-gray-200 dark:bg-gray-700 rounded-t-full border-2 border-gray-400 dark:border-gray-500">
		<!-- Graduation marks -->
		<div class="absolute left-full ml-1 h-full flex flex-col justify-between py-2">
			{#each [0, 10, 20, 30, 40, 50] as mark}
				<div class="flex items-center gap-1">
					<div class="w-2 h-px bg-gray-400"></div>
					<span class="text-xs text-gray-500">{mark}</span>
				</div>
			{/each}
		</div>

		<!-- Liquid fill -->
		<div
			class="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-blue-400 to-blue-600 transition-all duration-300 rounded-b"
			style="height: {fillPercent}%"
		>
			<!-- Surface meniscus -->
			<div class="absolute top-0 left-0 right-0 h-1 bg-blue-300 rounded-full transform -translate-y-1/2"></div>
		</div>

		<!-- Current reading indicator -->
		<div
			class="absolute left-0 right-0 border-t-2 border-red-500 transition-all duration-300"
			style="bottom: {fillPercent}%"
		>
			<div class="absolute right-full mr-2 -translate-y-1/2 text-xs font-mono text-red-500 whitespace-nowrap">
				{formatNumber(reading)} mL
			</div>
		</div>
	</div>

	<!-- Stopcock -->
	<div class="relative">
		<div class="w-6 h-6 bg-gray-600 dark:bg-gray-500 rounded-full border-2 border-gray-700 dark:border-gray-400 flex items-center justify-center cursor-pointer hover:bg-gray-500 transition-colors"
			 role="button"
			 tabindex="0"
			 onmousedown={onPour}
			 onmouseup={onStopPour}
			 onmouseleave={onStopPour}
			 ontouchstart={onPour}
			 ontouchend={onStopPour}
		>
			<div class="w-3 h-1 bg-gray-800 dark:bg-gray-300 rounded {isPouring ? 'rotate-90' : ''} transition-transform"></div>
		</div>

		<!-- Drip tip -->
		<div class="w-1 h-4 bg-gray-400 mx-auto"></div>

		<!-- Dripping animation -->
		{#if isPouring}
			<div class="absolute top-full left-1/2 -translate-x-1/2">
				<div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
			</div>
		{/if}
	</div>

	<!-- Instructions -->
	<div class="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
		Hold to pour
	</div>
</div>
