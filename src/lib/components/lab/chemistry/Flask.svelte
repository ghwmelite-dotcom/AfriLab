<script lang="ts">
	import { formatNumber } from '$lib/utils/helpers';

	let { volume, color = 'transparent', pH = 7, isReceiving = false }: {
		volume: number;
		color?: string;
		pH?: number;
		isReceiving?: boolean;
	} = $props();

	let fillPercent = $derived(Math.min((volume / 150) * 100, 80)); // Max 80% visual fill
</script>

<div class="relative flex flex-col items-center">
	<!-- Label -->
	<div class="mb-2 text-center">
		<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Erlenmeyer Flask</span>
		<div class="text-xs text-gray-500 dark:text-gray-400">HCl solution</div>
	</div>

	<!-- Flask -->
	<div class="relative">
		<!-- Flask neck -->
		<div class="w-6 h-8 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 mx-auto rounded-t-sm"></div>

		<!-- Flask body (conical shape using clip-path) -->
		<div class="relative w-40 h-32 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-b-lg"
			 style="clip-path: polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%);"
		>
			<!-- Liquid -->
			<div
				class="absolute bottom-0 left-0 right-0 transition-all duration-300"
				style="height: {fillPercent}%; background: {color || 'rgba(200, 200, 200, 0.3)'};"
			>
				<!-- Bubbles when receiving drops -->
				{#if isReceiving}
					<div class="absolute inset-0 overflow-hidden">
						<div class="absolute bottom-0 left-1/4 w-1 h-1 bg-white/50 rounded-full animate-bubble"></div>
						<div class="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-white/50 rounded-full animate-bubble" style="animation-delay: 0.2s"></div>
						<div class="absolute bottom-0 left-3/4 w-1 h-1 bg-white/50 rounded-full animate-bubble" style="animation-delay: 0.4s"></div>
					</div>
				{/if}

				<!-- Swirl lines -->
				<div class="absolute inset-0 opacity-30">
					<div class="absolute top-1/4 left-1/4 w-1/2 h-0.5 bg-white/50 rounded-full rotate-12"></div>
					<div class="absolute top-1/2 left-1/3 w-1/3 h-0.5 bg-white/50 rounded-full -rotate-6"></div>
				</div>
			</div>
		</div>

		<!-- Flask base highlight -->
		<div class="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-gray-300 dark:from-gray-600 to-transparent rounded-b-lg"></div>
	</div>

	<!-- pH Indicator -->
	<div class="mt-4 flex items-center gap-2">
		<div class="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600"
			 style="background: {color || '#ccc'}">
		</div>
		<div class="text-sm">
			<span class="text-gray-600 dark:text-gray-400">pH:</span>
			<span class="font-mono font-medium text-gray-900 dark:text-white">{formatNumber(pH, 1)}</span>
		</div>
	</div>

	<!-- Volume display -->
	<div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
		{formatNumber(volume, 1)} mL
	</div>
</div>

<style>
	@keyframes bubble {
		0% {
			transform: translateY(0) scale(1);
			opacity: 1;
		}
		100% {
			transform: translateY(-40px) scale(0.5);
			opacity: 0;
		}
	}

	.animate-bubble {
		animation: bubble 1s ease-out infinite;
	}
</style>
