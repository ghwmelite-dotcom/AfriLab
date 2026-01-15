<script lang="ts">
	import { formatNumber, getPHColor } from '$lib/utils/helpers';

	export let pH: number = 7;
	export let showScale: boolean = true;

	let color = $derived(getPHColor(pH));
	let position = $derived((pH / 14) * 100);
</script>

<div class="card p-4 space-y-3">
	<div class="flex items-center justify-between">
		<h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">pH Meter</h4>
		<div class="flex items-center gap-2">
			<div class="w-3 h-3 rounded-full animate-pulse" style="background: {color}"></div>
			<span class="text-lg font-mono font-bold" style="color: {color}">
				{formatNumber(pH, 2)}
			</span>
		</div>
	</div>

	{#if showScale}
		<!-- pH Scale -->
		<div class="relative">
			<!-- Scale bar -->
			<div class="h-4 rounded-full overflow-hidden flex">
				<div class="flex-1 bg-red-500"></div>
				<div class="flex-1 bg-orange-500"></div>
				<div class="flex-1 bg-yellow-500"></div>
				<div class="flex-1 bg-green-500"></div>
				<div class="flex-1 bg-teal-500"></div>
				<div class="flex-1 bg-blue-500"></div>
				<div class="flex-1 bg-indigo-500"></div>
			</div>

			<!-- Current pH indicator -->
			<div
				class="absolute top-0 w-1 h-4 bg-white border border-gray-800 shadow-lg transition-all duration-300"
				style="left: {position}%"
			></div>

			<!-- Scale labels -->
			<div class="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
				<span>0</span>
				<span>7</span>
				<span>14</span>
			</div>
		</div>

		<!-- Legend -->
		<div class="flex justify-between text-xs">
			<span class="text-red-500">Acidic</span>
			<span class="text-green-500">Neutral</span>
			<span class="text-blue-500">Basic</span>
		</div>
	{/if}
</div>
