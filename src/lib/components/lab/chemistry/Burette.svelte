<script lang="ts">
	import { formatNumber } from '$lib/utils/helpers';

	let { volume, maxVolume = 50, isPouring = false, onPour = () => {}, onStopPour = () => {} }: {
		volume: number;
		maxVolume?: number;
		isPouring?: boolean;
		onPour?: () => void;
		onStopPour?: () => void;
	} = $props();

	let fillPercent = $derived((volume / maxVolume) * 100);
	let reading = $derived(maxVolume - volume);
</script>

<div class="relative flex flex-col items-center group">
	<!-- Label -->
	<div class="mb-3 text-center">
		<span class="text-sm font-display font-semibold text-white">Burette</span>
		<div class="text-xs text-emerald-400/80">NaOH (0.1 M)</div>
	</div>

	<!-- Burette assembly -->
	<div class="relative">
		<!-- Glow effect when pouring -->
		{#if isPouring}
			<div class="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-transparent blur-2xl scale-150 animate-pulse"></div>
		{/if}

		<!-- Burette top cap -->
		<div class="relative w-10 h-3 bg-gradient-to-b from-gray-600 to-gray-700 rounded-t-lg mx-auto border-t border-x border-white/20"></div>

		<!-- Burette body -->
		<div class="relative w-10 h-72 bg-gradient-to-b from-gray-800/90 to-gray-900/90 border border-white/10 rounded-sm overflow-hidden backdrop-blur-sm">
			<!-- Glass reflection -->
			<div class="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-white/20 to-transparent"></div>
			<div class="absolute inset-y-0 right-0 w-0.5 bg-gradient-to-l from-white/10 to-transparent"></div>

			<!-- Graduation marks -->
			<div class="absolute inset-y-2 left-full ml-2 flex flex-col justify-between">
				{#each [0, 10, 20, 30, 40, 50] as mark}
					<div class="flex items-center gap-1.5">
						<div class="w-3 h-px bg-gradient-to-r from-emerald-500/60 to-transparent"></div>
						<span class="text-[10px] font-mono text-gray-400">{mark}</span>
					</div>
				{/each}
			</div>

			<!-- Minor graduation marks -->
			<div class="absolute inset-0 py-2">
				{#each Array(50) as _, i}
					<div
						class="absolute w-1.5 h-px bg-white/10"
						style="top: {(i / 50) * 100}%; right: 0;"
					></div>
				{/each}
			</div>

			<!-- Liquid fill with gradient -->
			<div
				class="absolute bottom-0 left-0 right-0 transition-all duration-150 ease-out"
				style="height: {fillPercent}%"
			>
				<!-- Liquid gradient -->
				<div class="absolute inset-0 bg-gradient-to-b from-cyan-400/90 via-cyan-500/80 to-cyan-600/90"></div>

				<!-- Liquid surface shimmer -->
				<div class="absolute top-0 left-0 right-0 h-2">
					<div class="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent"></div>
					<div class="absolute inset-x-1 top-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"></div>
				</div>

				<!-- Internal glow -->
				<div class="absolute inset-0 bg-gradient-to-t from-cyan-400/20 to-transparent"></div>

				<!-- Moving liquid animation when pouring -->
				{#if isPouring}
					<div class="absolute inset-0 overflow-hidden">
						<div class="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-liquid-flow"></div>
					</div>
				{/if}
			</div>

			<!-- Current reading indicator -->
			<div
				class="absolute left-0 right-0 transition-all duration-150 z-10"
				style="bottom: {fillPercent}%"
			>
				<div class="h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-rose-500 shadow-lg shadow-rose-500/50"></div>
				<div class="absolute right-full mr-3 -translate-y-1/2 top-1/2">
					<div class="glass px-2 py-0.5 rounded border border-rose-500/30">
						<span class="text-[11px] font-mono font-bold text-rose-400">{formatNumber(reading)} mL</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Stopcock assembly -->
		<div class="relative flex flex-col items-center">
			<!-- Stopcock handle -->
			<button
				class="relative w-8 h-8 rounded-full transition-all duration-200 cursor-pointer touch-none select-none
					{isPouring
						? 'bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/40 scale-105'
						: 'bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600'}
					border border-white/20 flex items-center justify-center group/btn"
				onmousedown={onPour}
				onmouseup={onStopPour}
				onmouseleave={onStopPour}
				ontouchstart={onPour}
				ontouchend={onStopPour}
			>
				<!-- Stopcock lever -->
				<div class="w-4 h-1 bg-white/80 rounded-full transition-transform duration-200 {isPouring ? 'rotate-90' : ''}"></div>

				<!-- Glow ring when active -->
				{#if isPouring}
					<div class="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping"></div>
				{/if}
			</button>

			<!-- Drip tip -->
			<div class="w-1.5 h-6 bg-gradient-to-b from-gray-600 to-gray-700 border-x border-white/10"></div>
			<div class="w-1 h-2 bg-gradient-to-b from-gray-600 to-transparent"></div>

			<!-- Dripping animation -->
			{#if isPouring}
				<div class="absolute top-full left-1/2 -translate-x-1/2 mt-2">
					<!-- Multiple drops for realistic effect -->
					<div class="drop-container">
						<div class="drop"></div>
						<div class="drop" style="animation-delay: 0.15s;"></div>
						<div class="drop" style="animation-delay: 0.3s;"></div>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Instructions -->
	<div class="mt-5 text-center">
		<div class="glass px-4 py-2 rounded-xl border border-white/10 inline-flex items-center gap-2 transition-all duration-200
			{isPouring ? 'border-emerald-500/30 bg-emerald-500/10' : 'hover:border-white/20'}">
			<div class="w-2 h-2 rounded-full {isPouring ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}"></div>
			<span class="text-xs font-medium {isPouring ? 'text-emerald-400' : 'text-gray-400'}">
				{isPouring ? 'Pouring...' : 'Hold to pour'}
			</span>
		</div>
	</div>
</div>

<style>
	@keyframes liquid-flow {
		0% { transform: translateY(-100%); }
		100% { transform: translateY(100%); }
	}

	.animate-liquid-flow {
		animation: liquid-flow 0.5s linear infinite;
	}

	.drop-container {
		position: relative;
		width: 8px;
		height: 60px;
	}

	.drop {
		position: absolute;
		top: 0;
		left: 50%;
		width: 6px;
		height: 6px;
		background: linear-gradient(135deg, #67e8f9 0%, #06b6d4 100%);
		border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
		transform: translateX(-50%);
		animation: drip 0.45s ease-in infinite;
		box-shadow: 0 0 8px rgba(6, 182, 212, 0.6);
	}

	.drop::before {
		content: '';
		position: absolute;
		top: -2px;
		left: 50%;
		width: 2px;
		height: 8px;
		background: linear-gradient(to bottom, rgba(6, 182, 212, 0.8), transparent);
		transform: translateX(-50%);
	}

	@keyframes drip {
		0% {
			top: 0;
			opacity: 1;
			transform: translateX(-50%) scale(1);
		}
		80% {
			opacity: 1;
		}
		100% {
			top: 60px;
			opacity: 0;
			transform: translateX(-50%) scale(0.5);
		}
	}
</style>
