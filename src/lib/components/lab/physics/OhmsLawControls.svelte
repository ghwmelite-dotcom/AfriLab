<script lang="ts">
	import { RESISTORS, BAND_COLORS, type OhmsLawState } from '$lib/simulations/physics/ohms-law';

	let {
		labState,
		onSetVoltage,
		onSelectResistor,
		onTogglePower,
		onToggleSwitch,
		onRecordMeasurement,
		onClearMeasurements,
		onAutoConnect,
		onSetMode
	}: {
		labState: OhmsLawState;
		onSetVoltage: (voltage: number) => void;
		onSelectResistor: (resistorId: string) => void;
		onTogglePower: () => void;
		onToggleSwitch: () => void;
		onRecordMeasurement: () => void;
		onClearMeasurements: () => void;
		onAutoConnect: () => void;
		onSetMode: (mode: 'vary-voltage' | 'vary-resistance') => void;
	} = $props();

	let voltageInput = $state(0);

	// Sync voltage input with labState
	$effect(() => {
		voltageInput = labState.voltage;
	});

	// Initialize on mount
	$effect.pre(() => {
		voltageInput = labState.voltage;
	});

	function handleVoltageChange(value: number) {
		voltageInput = value;
		onSetVoltage(value);
	}

	let canRecord = $derived(labState.isPowerOn && labState.isCircuitClosed && labState.isCircuitComplete && labState.ammeterReading > 0);
</script>

<div class="space-y-4">
	<!-- Experiment Mode -->
	<div class="glass-strong rounded-xl p-4 border border-white/10">
		<div class="flex items-center gap-3 mb-3">
			<div class="w-1.5 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
			<h4 class="text-sm font-display font-semibold text-white">Experiment Mode</h4>
		</div>

		<div class="grid grid-cols-2 gap-2">
			<button
				onclick={() => onSetMode('vary-voltage')}
				class="p-3 rounded-xl text-sm font-medium transition-all
					{labState.experimentMode === 'vary-voltage'
					? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border border-purple-500/30'
					: 'glass border border-white/10 text-gray-400 hover:text-white'}"
			>
				<div class="font-semibold">Vary Voltage</div>
				<div class="text-xs opacity-70 mt-1">Fixed R, change V</div>
			</button>
			<button
				onclick={() => onSetMode('vary-resistance')}
				class="p-3 rounded-xl text-sm font-medium transition-all
					{labState.experimentMode === 'vary-resistance'
					? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border border-purple-500/30'
					: 'glass border border-white/10 text-gray-400 hover:text-white'}"
			>
				<div class="font-semibold">Vary Resistance</div>
				<div class="text-xs opacity-70 mt-1">Fixed V, change R</div>
			</button>
		</div>
	</div>

	<!-- Power Supply Controls -->
	<div class="glass-strong rounded-xl p-4 border border-white/10">
		<div class="flex items-center gap-3 mb-3">
			<div class="w-1.5 h-5 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
			<h4 class="text-sm font-display font-semibold text-white">Power Supply</h4>
		</div>

		<!-- Voltage slider -->
		<div class="space-y-2 mb-4">
			<div class="flex items-center justify-between text-xs">
				<span class="text-gray-400">Voltage</span>
				<span class="font-mono text-amber-400">{labState.voltage.toFixed(1)} V</span>
			</div>
			<input
				type="range"
				min="0"
				max="12"
				step="0.5"
				value={voltageInput}
				oninput={(e) => handleVoltageChange(parseFloat(e.currentTarget.value))}
				class="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-amber-500"
			/>
			<div class="flex justify-between text-xs text-gray-600">
				<span>0V</span>
				<span>6V</span>
				<span>12V</span>
			</div>
		</div>

		<!-- Quick voltage buttons -->
		<div class="flex gap-2 mb-4">
			{#each [3, 6, 9, 12] as v}
				<button
					onclick={() => handleVoltageChange(v)}
					class="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
						{Math.abs(state.voltage - v) < 0.1
						? 'bg-amber-500/30 text-amber-400 border border-amber-500/30'
						: 'glass border border-white/10 text-gray-400 hover:text-white'}"
				>
					{v}V
				</button>
			{/each}
		</div>

		<!-- Power and Switch -->
		<div class="grid grid-cols-2 gap-3">
			<button
				onclick={onTogglePower}
				class="py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2
					{labState.isPowerOn
					? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
					: 'glass border border-white/10 text-gray-400 hover:text-white'}"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
				{labState.isPowerOn ? 'Power ON' : 'Power OFF'}
			</button>

			<button
				onclick={onToggleSwitch}
				class="py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2
					{labState.isCircuitClosed
					? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
					: 'glass border border-white/10 text-gray-400 hover:text-white'}"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					{#if state.isCircuitClosed}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					{:else}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
					{/if}
				</svg>
				{labState.isCircuitClosed ? 'Switch Closed' : 'Switch Open'}
			</button>
		</div>
	</div>

	<!-- Resistor Selection -->
	<div class="glass-strong rounded-xl p-4 border border-white/10">
		<div class="flex items-center gap-3 mb-3">
			<div class="w-1.5 h-5 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full"></div>
			<h4 class="text-sm font-display font-semibold text-white">Resistor</h4>
		</div>

		<div class="grid grid-cols-3 gap-2">
			{#each RESISTORS as resistor (resistor.id)}
				<button
					onclick={() => onSelectResistor(resistor.id)}
					class="p-2 rounded-xl transition-all
						{labState.selectedResistor.id === resistor.id
						? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30'
						: 'glass border border-white/10 hover:border-white/20'}"
				>
					<!-- Color bands preview -->
					<div class="flex justify-center gap-0.5 mb-1">
						{#each resistor.colorBands as band}
							<div
								class="w-2 h-4 rounded-sm"
								style="background-color: {BAND_COLORS[band]};"
							></div>
						{/each}
					</div>
					<div class="text-xs font-mono {labState.selectedResistor.id === resistor.id ? 'text-emerald-400' : 'text-gray-400'}">
						{resistor.label}
					</div>
				</button>
			{/each}
		</div>
	</div>

	<!-- Circuit Connection -->
	{#if !state.isCircuitComplete}
		<button
			onclick={onAutoConnect}
			class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium
				hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
			</svg>
			Auto-Connect Circuit
		</button>
	{/if}

	<!-- Measurement Controls -->
	<div class="glass-strong rounded-xl p-4 border border-white/10">
		<div class="flex items-center gap-3 mb-3">
			<div class="w-1.5 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
			<h4 class="text-sm font-display font-semibold text-white">Data Collection</h4>
		</div>

		<div class="flex gap-2">
			<button
				onclick={onRecordMeasurement}
				disabled={!canRecord}
				class="flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2
					{canRecord
					? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25'
					: 'glass border border-white/10 text-gray-500 cursor-not-allowed'}"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Record ({labState.measurements.length})
			</button>

			<button
				onclick={onClearMeasurements}
				disabled={labState.measurements.length === 0}
				class="px-4 py-3 rounded-xl font-medium transition-all glass border border-white/10
					{labState.measurements.length > 0 ? 'text-rose-400 hover:border-rose-500/30' : 'text-gray-500 cursor-not-allowed'}"
				aria-label="Clear all measurements"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
				</svg>
			</button>
		</div>

		{#if !canRecord && state.isCircuitComplete}
			<p class="mt-2 text-xs text-amber-400">
				Turn on power and close switch to record measurements
			</p>
		{/if}
	</div>

	<!-- Current Readings Display -->
	<div class="glass-strong rounded-xl p-4 border border-white/10">
		<div class="grid grid-cols-2 gap-4">
			<div class="text-center">
				<div class="text-xs text-gray-500 mb-1">Voltage</div>
				<div class="text-2xl font-mono font-bold text-amber-400">
					{labState.voltmeterReading.toFixed(2)}
					<span class="text-sm font-normal">V</span>
				</div>
			</div>
			<div class="text-center">
				<div class="text-xs text-gray-500 mb-1">Current</div>
				<div class="text-2xl font-mono font-bold text-cyan-400">
					{labState.ammeterReading.toFixed(2)}
					<span class="text-sm font-normal">mA</span>
				</div>
			</div>
		</div>

		{#if state.isPowerOn && state.isCircuitClosed && state.isCircuitComplete}
			<div class="mt-3 pt-3 border-t border-white/10 text-center">
				<div class="text-xs text-gray-500 mb-1">Calculated Resistance</div>
				<div class="text-lg font-mono text-emerald-400">
					{labState.ammeterReading > 0 ? ((state.voltmeterReading / (state.ammeterReading / 1000))).toFixed(1) : '---'}
					<span class="text-sm font-normal">Ω</span>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	input[type='range']::-webkit-slider-thumb {
		appearance: none;
		width: 18px;
		height: 18px;
		background: linear-gradient(135deg, #f59e0b, #d97706);
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
	}
</style>
