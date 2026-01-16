<script lang="ts">
	interface Props {
		absorbance: number;
		transmittance: number;
		wavelength: number;
		isLampOn: boolean;
		displayMode?: 'absorbance' | 'transmittance';
	}

	let {
		absorbance,
		transmittance,
		wavelength,
		isLampOn,
		displayMode = 'absorbance'
	}: Props = $props();

	// Local toggle state - user can toggle independently after initial render
	// Using a function call to avoid state_referenced_locally warning
	let showAbsorbance = $state((() => displayMode === 'absorbance')());
</script>

<div class="glass-strong rounded-2xl border border-white/10 overflow-hidden">
	<!-- Display Header -->
	<div class="p-4 border-b border-white/5 flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="w-1.5 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
			<h3 class="font-display font-semibold text-white">Spectrophotometer</h3>
		</div>
		<div class="flex items-center gap-2">
			<span class="w-2 h-2 rounded-full {isLampOn ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}"></span>
			<span class="text-xs {isLampOn ? 'text-emerald-400' : 'text-gray-500'}">
				{isLampOn ? 'Lamp ON' : 'Lamp OFF'}
			</span>
		</div>
	</div>

	<!-- Main Display -->
	<div class="p-6">
		<!-- Digital Display -->
		<div class="relative glass rounded-xl p-6 border border-cyan-500/20 mb-4">
			<!-- Display glow -->
			<div class="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent rounded-xl pointer-events-none"></div>

			<!-- Toggle buttons -->
			<div class="flex gap-2 mb-4">
				<button
					onclick={() => showAbsorbance = true}
					class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all
						{showAbsorbance
							? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
							: 'text-gray-500 hover:text-gray-400'}"
				>
					Absorbance
				</button>
				<button
					onclick={() => showAbsorbance = false}
					class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all
						{!showAbsorbance
							? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
							: 'text-gray-500 hover:text-gray-400'}"
				>
					%Transmittance
				</button>
			</div>

			<!-- Main Reading -->
			<div class="text-center">
				<div class="font-mono text-5xl font-bold tracking-wider
					{isLampOn ? 'text-cyan-400' : 'text-gray-600'}"
				>
					{#if !isLampOn}
						----
					{:else if showAbsorbance}
						{absorbance.toFixed(3)}
					{:else}
						{transmittance.toFixed(1)}
					{/if}
				</div>
				<div class="text-sm text-gray-400 mt-2">
					{showAbsorbance ? 'A (Absorbance)' : '% T (Transmittance)'}
				</div>
			</div>

			<!-- Wavelength indicator -->
			<div class="mt-6 pt-4 border-t border-white/5">
				<div class="flex items-center justify-between text-sm">
					<span class="text-gray-400">Wavelength</span>
					<div class="flex items-center gap-2">
						<span class="font-mono font-bold text-white">{wavelength}</span>
						<span class="text-gray-400">nm</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Status Indicators -->
		<div class="grid grid-cols-3 gap-3">
			<div class="glass rounded-lg p-3 border border-white/5 text-center">
				<div class="text-xs text-gray-500 mb-1">Mode</div>
				<div class="text-sm font-medium text-white">Single λ</div>
			</div>
			<div class="glass rounded-lg p-3 border border-white/5 text-center">
				<div class="text-xs text-gray-500 mb-1">Path</div>
				<div class="text-sm font-medium text-white">1.0 cm</div>
			</div>
			<div class="glass rounded-lg p-3 border border-white/5 text-center">
				<div class="text-xs text-gray-500 mb-1">Status</div>
				<div class="text-sm font-medium {isLampOn ? 'text-emerald-400' : 'text-amber-400'}">
					{isLampOn ? 'Ready' : 'Standby'}
				</div>
			</div>
		</div>
	</div>
</div>
