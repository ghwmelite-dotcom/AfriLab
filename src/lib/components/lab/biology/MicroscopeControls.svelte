<script lang="ts">
	import { MAGNIFICATION_LEVELS, type MicroscopyState } from '$lib/simulations/biology/microscopy';

	let {
		state,
		onCoarseFocus,
		onFineFocus,
		onMagnification,
		onStageMove,
		onLightToggle,
		onLightIntensity,
		onApplyOil
	}: {
		state: MicroscopyState;
		onCoarseFocus: (delta: number) => void;
		onFineFocus: (delta: number) => void;
		onMagnification: (power: number) => void;
		onStageMove: (dx: number, dy: number) => void;
		onLightToggle: () => void;
		onLightIntensity: (intensity: number) => void;
		onApplyOil: () => void;
	} = $props();

	let coarseInterval: ReturnType<typeof setInterval> | null = null;
	let fineInterval: ReturnType<typeof setInterval> | null = null;

	function startCoarseFocus(delta: number) {
		onCoarseFocus(delta * 5);
		coarseInterval = setInterval(() => onCoarseFocus(delta * 2), 100);
	}

	function stopCoarseFocus() {
		if (coarseInterval) {
			clearInterval(coarseInterval);
			coarseInterval = null;
		}
	}

	function startFineFocus(delta: number) {
		onFineFocus(delta * 0.5);
		fineInterval = setInterval(() => onFineFocus(delta * 0.2), 100);
	}

	function stopFineFocus() {
		if (fineInterval) {
			clearInterval(fineInterval);
			fineInterval = null;
		}
	}
</script>

<div class="space-y-5">
	<!-- Magnification selector -->
	<div class="glass-strong rounded-xl p-4 border border-white/10">
		<div class="flex items-center gap-3 mb-3">
			<div class="w-1.5 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
			<h4 class="text-sm font-display font-semibold text-white">Objective Lens</h4>
		</div>

		<div class="grid grid-cols-2 gap-2">
			{#each MAGNIFICATION_LEVELS as level}
				<button
					onclick={() => onMagnification(level.power)}
					class="p-3 rounded-xl text-sm font-medium transition-all
						{state.magnification === level.power
							? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25'
							: 'glass border border-white/10 text-gray-400 hover:text-white hover:border-white/20'}"
				>
					<div class="font-mono text-lg">{level.objective}x</div>
					<div class="text-xs opacity-70">{level.power}x total</div>
				</button>
			{/each}
		</div>

		<!-- Oil immersion button -->
		{#if state.magnification >= 1000}
			<button
				onclick={onApplyOil}
				disabled={state.oilApplied}
				class="w-full mt-3 py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2
					{state.oilApplied
						? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
						: 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'}"
			>
				{#if state.oilApplied}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
					Oil Applied
				{:else}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
					</svg>
					Apply Immersion Oil
				{/if}
			</button>
		{/if}
	</div>

	<!-- Focus controls -->
	<div class="glass-strong rounded-xl p-4 border border-white/10">
		<div class="flex items-center gap-3 mb-3">
			<div class="w-1.5 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
			<h4 class="text-sm font-display font-semibold text-white">Focus Adjustment</h4>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<!-- Coarse focus -->
			<div class="space-y-2">
				<span class="text-xs text-gray-400 block text-center">Coarse</span>
				<div class="flex flex-col items-center gap-1">
					<button
						onmousedown={() => startCoarseFocus(1)}
						onmouseup={stopCoarseFocus}
						onmouseleave={stopCoarseFocus}
						ontouchstart={() => startCoarseFocus(1)}
						ontouchend={stopCoarseFocus}
						aria-label="Coarse focus up"
						class="w-12 h-12 glass rounded-xl border border-white/10 hover:border-purple-500/30 flex items-center justify-center text-gray-400 hover:text-purple-400 transition-all active:scale-95"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
						</svg>
					</button>
					<div class="w-10 h-2 glass rounded-full overflow-hidden">
						<div
							class="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
							style="width: {state.focusLevel}%"
						></div>
					</div>
					<button
						onmousedown={() => startCoarseFocus(-1)}
						onmouseup={stopCoarseFocus}
						onmouseleave={stopCoarseFocus}
						ontouchstart={() => startCoarseFocus(-1)}
						ontouchend={stopCoarseFocus}
						aria-label="Coarse focus down"
						class="w-12 h-12 glass rounded-xl border border-white/10 hover:border-purple-500/30 flex items-center justify-center text-gray-400 hover:text-purple-400 transition-all active:scale-95"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</button>
				</div>
			</div>

			<!-- Fine focus -->
			<div class="space-y-2">
				<span class="text-xs text-gray-400 block text-center">Fine</span>
				<div class="flex flex-col items-center gap-1">
					<button
						onmousedown={() => startFineFocus(1)}
						onmouseup={stopFineFocus}
						onmouseleave={stopFineFocus}
						ontouchstart={() => startFineFocus(1)}
						ontouchend={stopFineFocus}
						aria-label="Fine focus up"
						class="w-12 h-12 glass rounded-xl border border-white/10 hover:border-cyan-500/30 flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-all active:scale-95"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
						</svg>
					</button>
					<div class="w-10 h-2 glass rounded-full overflow-hidden relative">
						<div class="absolute inset-y-0 left-1/2 w-px bg-gray-600"></div>
						<div
							class="absolute top-0 bottom-0 w-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
							style="left: calc(50% + {state.fineAdjustment * 4}% - 4px)"
						></div>
					</div>
					<button
						onmousedown={() => startFineFocus(-1)}
						onmouseup={stopFineFocus}
						onmouseleave={stopFineFocus}
						ontouchstart={() => startFineFocus(-1)}
						ontouchend={stopFineFocus}
						aria-label="Fine focus down"
						class="w-12 h-12 glass rounded-xl border border-white/10 hover:border-cyan-500/30 flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-all active:scale-95"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Stage controls -->
	<div class="glass-strong rounded-xl p-4 border border-white/10">
		<div class="flex items-center gap-3 mb-3">
			<div class="w-1.5 h-5 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
			<h4 class="text-sm font-display font-semibold text-white">Stage Position</h4>
		</div>

		<div class="flex items-center justify-center">
			<div class="grid grid-cols-3 gap-1">
				<div></div>
				<button
					onclick={() => onStageMove(0, -5)}
					aria-label="Move stage up"
					class="w-10 h-10 glass rounded-lg border border-white/10 hover:border-amber-500/30 flex items-center justify-center text-gray-400 hover:text-amber-400 transition-all active:scale-95"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
					</svg>
				</button>
				<div></div>

				<button
					onclick={() => onStageMove(-5, 0)}
					aria-label="Move stage left"
					class="w-10 h-10 glass rounded-lg border border-white/10 hover:border-amber-500/30 flex items-center justify-center text-gray-400 hover:text-amber-400 transition-all active:scale-95"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
				<div class="w-10 h-10 glass rounded-lg border border-white/10 flex items-center justify-center">
					<div class="w-2 h-2 rounded-full bg-amber-500"></div>
				</div>
				<button
					onclick={() => onStageMove(5, 0)}
					aria-label="Move stage right"
					class="w-10 h-10 glass rounded-lg border border-white/10 hover:border-amber-500/30 flex items-center justify-center text-gray-400 hover:text-amber-400 transition-all active:scale-95"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</button>

				<div></div>
				<button
					onclick={() => onStageMove(0, 5)}
					aria-label="Move stage down"
					class="w-10 h-10 glass rounded-lg border border-white/10 hover:border-amber-500/30 flex items-center justify-center text-gray-400 hover:text-amber-400 transition-all active:scale-95"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>
				<div></div>
			</div>
		</div>

		<div class="mt-3 flex justify-center gap-4 text-xs text-gray-500">
			<span>X: {state.stageX.toFixed(0)}</span>
			<span>Y: {state.stageY.toFixed(0)}</span>
		</div>
	</div>

	<!-- Light controls -->
	<div class="glass-strong rounded-xl p-4 border border-white/10">
		<div class="flex items-center justify-between mb-3">
			<div class="flex items-center gap-3">
				<div class="w-1.5 h-5 bg-gradient-to-b from-yellow-500 to-amber-500 rounded-full"></div>
				<h4 class="text-sm font-display font-semibold text-white">Illumination</h4>
			</div>

			<button
				onclick={onLightToggle}
				aria-label={state.isLightOn ? 'Turn light off' : 'Turn light on'}
				class="relative w-12 h-6 rounded-full transition-all
					{state.isLightOn ? 'bg-gradient-to-r from-yellow-500 to-amber-500' : 'bg-gray-700'}"
			>
				<div
					class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all
						{state.isLightOn ? 'left-[26px]' : 'left-0.5'}"
				></div>
			</button>
		</div>

		{#if state.isLightOn}
			<div class="space-y-2">
				<div class="flex items-center justify-between text-xs">
					<span class="text-gray-400">Intensity</span>
					<span class="font-mono text-yellow-400">{state.lightIntensity}%</span>
				</div>
				<input
					type="range"
					min="10"
					max="100"
					value={state.lightIntensity}
					oninput={(e) => onLightIntensity(parseInt(e.currentTarget.value))}
					class="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-yellow-500"
				/>
			</div>
		{/if}
	</div>
</div>

<style>
	input[type='range']::-webkit-slider-thumb {
		appearance: none;
		width: 16px;
		height: 16px;
		background: linear-gradient(135deg, #eab308, #f59e0b);
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 0 10px rgba(234, 179, 8, 0.5);
	}
</style>
