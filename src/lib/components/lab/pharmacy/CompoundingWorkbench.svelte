<script lang="ts">
	import { getIngredient, type CompoundingState } from '$lib/simulations/pharmacy/compounding';

	let {
		labState,
		onMix
	}: {
		labState: CompoundingState;
		onMix: (duration: number) => void;
	} = $props();

	let isMixing = $state(false);
	let mixInterval: ReturnType<typeof setInterval> | null = null;

	function startMixing() {
		if (labState.mortarContents.length < 2) return;
		isMixing = true;
		mixInterval = setInterval(() => {
			onMix(1);
		}, 100);
	}

	function stopMixing() {
		isMixing = false;
		if (mixInterval) {
			clearInterval(mixInterval);
			mixInterval = null;
		}
	}

	// Generate color based on mortar contents
	let mortarColor = $derived(() => {
		if (labState.mortarContents.length === 0) return 'transparent';
		if (labState.mortarContents.length === 1) {
			const ing = getIngredient(labState.mortarContents[0].ingredientId);
			return ing?.color || '#FFFFFF';
		}

		// Blend colors when mixing
		if (labState.mixingProgress > 50) {
			return '#F5F5F0'; // Blended white/cream color
		}

		// Show swirled pattern when partially mixed
		return 'linear-gradient(45deg, #FFFFFF 25%, #FFFEF0 50%, #FFFFFF 75%)';
	});
</script>

<div class="glass-strong rounded-2xl border border-white/10 p-6 overflow-hidden relative">
	<!-- Background pattern -->
	<div class="absolute inset-0 opacity-5">
		<div class="w-full h-full" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px);"></div>
	</div>

	<div class="relative z-10">
		<!-- Workbench header -->
		<div class="flex items-center justify-between mb-6">
			<div class="flex items-center gap-3">
				<div class="w-1.5 h-5 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full"></div>
				<h4 class="text-sm font-display font-semibold text-white">Compounding Station</h4>
			</div>

			<div class="flex items-center gap-2 text-xs text-gray-400">
				<span>Temp: {labState.temperature}°C</span>
				<span>|</span>
				<span>Humidity: {labState.humidity}%</span>
			</div>
		</div>

		<!-- Main workbench area -->
		<div class="flex items-end justify-center gap-8 min-h-[280px]">
			<!-- Mortar and Pestle -->
			<div class="flex flex-col items-center">
				<div class="relative">
					<!-- Pestle (animated when mixing) -->
					<div
						class="absolute -top-16 left-1/2 -translate-x-1/2 z-10 transition-transform
							{isMixing ? 'animate-pestle' : ''}"
					>
						<svg width="30" height="100" viewBox="0 0 30 100">
							<!-- Handle -->
							<rect x="10" y="0" width="10" height="50" rx="5" fill="#4B5563" />
							<!-- Head -->
							<ellipse cx="15" cy="70" rx="12" ry="25" fill="#6B7280" />
							<ellipse cx="15" cy="70" rx="8" ry="20" fill="#9CA3AF" />
						</svg>
					</div>

					<!-- Mortar -->
					<svg width="140" height="120" viewBox="0 0 140 120" class="drop-shadow-2xl">
						<!-- Mortar body -->
						<path
							d="M 10 30 Q 0 60 10 100 Q 40 120 70 120 Q 100 120 130 100 Q 140 60 130 30 Q 100 20 70 20 Q 40 20 10 30"
							fill="#374151"
							stroke="#4B5563"
							stroke-width="2"
						/>
						<!-- Inner surface -->
						<ellipse cx="70" cy="40" rx="55" ry="20" fill="#4B5563" />

						<!-- Contents -->
						{#if labState.mortarContents.length > 0}
							<ellipse
								cx="70"
								cy="50"
								rx="45"
								ry="15"
								fill={typeof mortarColor() === 'string' && !mortarColor().includes('gradient') ? mortarColor() : '#F5F5F0'}
								class="transition-all duration-500"
							>
								{#if labState.mixingProgress < 100}
									<animate
										attributeName="ry"
										values="15;17;15"
										dur="0.3s"
										repeatCount={isMixing ? 'indefinite' : '0'}
									/>
								{/if}
							</ellipse>

							<!-- Mixing swirl effect -->
							{#if labState.mixingProgress > 0 && labState.mixingProgress < 100}
								<g class="animate-spin-slow" style="transform-origin: 70px 50px;">
									<circle cx="50" cy="45" r="3" fill="rgba(255,255,255,0.6)" />
									<circle cx="90" cy="55" r="2" fill="rgba(200,200,180,0.6)" />
									<circle cx="65" cy="52" r="2" fill="rgba(255,255,240,0.6)" />
								</g>
							{/if}
						{/if}

						<!-- Rim highlight -->
						<ellipse
							cx="70"
							cy="30"
							rx="58"
							ry="18"
							fill="none"
							stroke="#6B7280"
							stroke-width="3"
						/>
					</svg>
				</div>

				<!-- Mortar info -->
				<div class="mt-4 text-center">
					<div class="text-xs text-gray-400 mb-1">Mortar Contents</div>
					{#if labState.mortarContents.length === 0}
						<div class="text-sm text-gray-500">Empty</div>
					{:else}
						<div class="flex flex-wrap justify-center gap-1 max-w-[150px]">
							{#each labState.mortarContents as content}
								{@const ing = getIngredient(content.ingredientId)}
								<span
									class="text-xs px-1.5 py-0.5 rounded"
									style="background: {ing?.color}30; color: #999;"
								>
									{ing?.name.split(' ')[0]}
								</span>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Mix button -->
				<button
					onmousedown={startMixing}
					onmouseup={stopMixing}
					onmouseleave={stopMixing}
					ontouchstart={startMixing}
					ontouchend={stopMixing}
					disabled={labState.mortarContents.length < 2 || labState.mixingProgress >= 100}
					class="mt-4 px-6 py-2 rounded-xl font-medium transition-all
						{labState.mortarContents.length >= 2 && labState.mixingProgress < 100
						? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:shadow-lg hover:shadow-rose-500/25 active:scale-95'
						: 'glass border border-white/10 text-gray-500 cursor-not-allowed'}"
				>
					{#if labState.mixingProgress >= 100}
						Mixed!
					{:else if isMixing}
						Mixing...
					{:else}
						Hold to Mix
					{/if}
				</button>
			</div>

			<!-- Balance -->
			<div class="flex flex-col items-center">
				<!-- Balance display -->
				<div class="glass rounded-xl p-4 border border-white/10 w-[160px]">
					<!-- Power indicator -->
					<div class="flex items-center justify-between mb-2">
						<span class="text-xs text-gray-500">Analytical Balance</span>
						<div class="w-2 h-2 rounded-full {labState.isBalanceOn ? 'bg-emerald-500' : 'bg-gray-600'}"></div>
					</div>

					<!-- Digital display -->
					<div class="bg-gray-900 rounded-lg p-3 mb-2">
						<div class="font-mono text-2xl text-center {labState.isBalanceOn ? 'text-emerald-400' : 'text-gray-700'}">
							{labState.isBalanceOn ? labState.balanceReading.toFixed(3) : '---'}
						</div>
						<div class="text-xs text-center text-gray-500 mt-1">
							{labState.isTared ? 'TARED' : ''} g
						</div>
					</div>

					<!-- Target weight indicator -->
					{#if labState.targetWeight > 0}
						<div class="text-xs text-center">
							<span class="text-gray-500">Target:</span>
							<span class="text-amber-400 font-mono ml-1">{labState.targetWeight.toFixed(3)} g</span>
						</div>
					{/if}
				</div>

				<!-- Balance platform (visual) -->
				<div class="w-[120px] h-[8px] bg-gradient-to-b from-gray-600 to-gray-700 rounded-full mt-2"></div>
				<div class="w-[80px] h-[40px] bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-lg"></div>
			</div>
		</div>

		<!-- Mixing progress bar -->
		{#if labState.mortarContents.length > 0}
			<div class="mt-6 pt-4 border-t border-white/10">
				<div class="flex items-center justify-between mb-2">
					<span class="text-sm text-gray-400">Mixing Progress</span>
					<span class="text-sm font-mono {labState.mixingProgress >= 100 ? 'text-emerald-400' : 'text-rose-400'}">
						{labState.mixingProgress.toFixed(0)}%
					</span>
				</div>
				<div class="h-2 bg-gray-800 rounded-full overflow-hidden">
					<div
						class="h-full transition-all duration-300 {labState.mixingProgress >= 100
							? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
							: 'bg-gradient-to-r from-rose-500 to-pink-500'}"
						style="width: {labState.mixingProgress}%"
					></div>
				</div>
				{#if labState.mixingProgress >= 100}
					<div class="text-xs text-emerald-400 mt-2 text-center">
						Compound is homogeneous and ready for packaging
					</div>
				{:else if labState.mixingProgress > 0}
					<div class="text-xs text-gray-500 mt-2 text-center">
						Continue mixing until uniform
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	@keyframes pestle {
		0%, 100% {
			transform: translateX(-50%) rotate(-5deg);
		}
		50% {
			transform: translateX(-50%) rotate(5deg);
		}
	}

	.animate-pestle {
		animation: pestle 0.2s ease-in-out infinite;
	}

	@keyframes spin-slow {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin-slow {
		animation: spin-slow 2s linear infinite;
	}
</style>
