<script lang="ts">
	import { BAND_COLORS, type OhmsLawState } from '$lib/simulations/physics/ohms-law';

	let {
		state,
		onToggleSwitch,
		onTogglePower
	}: {
		state: OhmsLawState;
		onToggleSwitch: () => void;
		onTogglePower: () => void;
	} = $props();

	// Calculate LED brightness based on current
	let ledBrightness = $derived(() => {
		if (!state.isPowerOn || !state.isCircuitClosed || !state.isCircuitComplete) return 0;
		return Math.min(1, state.ammeterReading / 50);
	});

	// Wire animation class
	let wireAnimating = $derived(state.isPowerOn && state.isCircuitClosed && state.isCircuitComplete);
</script>

<div class="relative w-full aspect-[4/3] glass-strong rounded-2xl border border-white/10 p-6 overflow-hidden">
	<!-- Background grid -->
	<div class="absolute inset-0 opacity-10">
		<svg class="w-full h-full">
			<defs>
				<pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
					<path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" stroke-width="0.5" class="text-emerald-500" />
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill="url(#grid)" />
		</svg>
	</div>

	<svg viewBox="0 0 400 300" class="w-full h-full relative z-10">
		<!-- Power Supply -->
		<g transform="translate(30, 100)">
			<rect x="0" y="0" width="60" height="100" rx="8" class="fill-gray-800 stroke-gray-600" stroke-width="2" />
			<text x="30" y="20" text-anchor="middle" class="fill-white text-[10px] font-medium">DC POWER</text>

			<!-- Voltage display -->
			<rect x="10" y="30" width="40" height="20" rx="2" class="fill-gray-900" />
			<text x="30" y="45" text-anchor="middle" class="fill-emerald-400 text-[12px] font-mono">
				{state.voltage.toFixed(1)}V
			</text>

			<!-- Power indicator LED -->
			<circle cx="30" cy="65" r="5" class="{state.isPowerOn ? 'fill-emerald-400' : 'fill-gray-700'}" />

			<!-- Power button -->
			<g transform="translate(15, 75)" class="cursor-pointer" onclick={onTogglePower} onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onTogglePower()} role="button" tabindex="0" aria-label="Toggle power">
				<rect x="0" y="0" width="30" height="15" rx="3" class="{state.isPowerOn ? 'fill-emerald-500' : 'fill-gray-600'}" />
				<text x="15" y="11" text-anchor="middle" class="fill-white text-[8px]">
					{state.isPowerOn ? 'ON' : 'OFF'}
				</text>
			</g>

			<!-- Terminals -->
			<circle cx="15" cy="-5" r="6" class="fill-red-500 stroke-red-700" stroke-width="2" />
			<text x="15" y="-15" text-anchor="middle" class="fill-red-400 text-[8px]">+</text>
			<circle cx="45" cy="-5" r="6" class="fill-gray-700 stroke-gray-500" stroke-width="2" />
			<text x="45" y="-15" text-anchor="middle" class="fill-gray-400 text-[8px]">−</text>
		</g>

		<!-- Ammeter -->
		<g transform="translate(150, 50)">
			<circle cx="30" cy="30" r="30" class="fill-gray-800 stroke-amber-500" stroke-width="2" />
			<text x="30" y="15" text-anchor="middle" class="fill-amber-400 text-[8px]">AMMETER</text>
			<text x="30" y="35" text-anchor="middle" class="fill-white text-[14px] font-mono">
				{state.ammeterReading.toFixed(2)}
			</text>
			<text x="30" y="48" text-anchor="middle" class="fill-gray-400 text-[8px]">mA</text>

			<!-- Terminals -->
			<circle cx="5" cy="30" r="5" class="fill-red-500" />
			<circle cx="55" cy="30" r="5" class="fill-gray-700" />
		</g>

		<!-- Resistor -->
		<g transform="translate(270, 80)">
			<rect x="-5" y="0" width="60" height="20" rx="4" class="fill-amber-900" />

			<!-- Color bands -->
			{#each state.selectedResistor.colorBands as band, i}
				<rect
					x="{5 + i * 12}"
					y="2"
					width="8"
					height="16"
					fill="{BAND_COLORS[band]}"
					rx="1"
				/>
			{/each}

			<!-- Label -->
			<text x="25" y="35" text-anchor="middle" class="fill-white text-[10px]">
				{state.selectedResistor.label}
			</text>

			<!-- Leads -->
			<rect x="-15" y="7" width="15" height="6" class="fill-gray-400" />
			<rect x="50" y="7" width="15" height="6" class="fill-gray-400" />
		</g>

		<!-- Voltmeter -->
		<g transform="translate(270, 180)">
			<circle cx="30" cy="30" r="30" class="fill-gray-800 stroke-cyan-500" stroke-width="2" />
			<text x="30" y="15" text-anchor="middle" class="fill-cyan-400 text-[8px]">VOLTMETER</text>
			<text x="30" y="35" text-anchor="middle" class="fill-white text-[14px] font-mono">
				{state.voltmeterReading.toFixed(2)}
			</text>
			<text x="30" y="48" text-anchor="middle" class="fill-gray-400 text-[8px]">V</text>

			<!-- Terminals -->
			<circle cx="5" cy="30" r="5" class="fill-red-500" />
			<circle cx="55" cy="30" r="5" class="fill-gray-700" />
		</g>

		<!-- Switch -->
		<g transform="translate(120, 200)" class="cursor-pointer" onclick={onToggleSwitch} onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggleSwitch()} role="button" tabindex="0" aria-label="Toggle circuit switch">
			<circle cx="0" cy="0" r="6" class="fill-gray-600" />
			<circle cx="40" cy="0" r="6" class="fill-gray-600" />
			<line
				x1="6" y1="0"
				x2="34" y2="{state.isCircuitClosed ? 0 : -15}"
				class="stroke-amber-500"
				stroke-width="4"
				stroke-linecap="round"
			/>
			<text x="20" y="20" text-anchor="middle" class="fill-gray-400 text-[8px]">
				{state.isCircuitClosed ? 'CLOSED' : 'OPEN'}
			</text>
		</g>

		<!-- Wires -->
		{#if state.isCircuitComplete}
			<!-- Power + to Ammeter + -->
			<path
				d="M 45 95 L 45 50 L 155 50 L 155 80"
				class="stroke-red-500 {wireAnimating ? 'animate-wire-flow' : ''}"
				fill="none"
				stroke-width="3"
				stroke-linecap="round"
			/>

			<!-- Ammeter - to Resistor A -->
			<path
				d="M 205 80 L 205 50 L 255 50 L 255 90"
				class="stroke-blue-500 {wireAnimating ? 'animate-wire-flow' : ''}"
				fill="none"
				stroke-width="3"
				stroke-linecap="round"
			/>

			<!-- Resistor B to Switch -->
			<path
				d="M 335 90 L 350 90 L 350 200 L 160 200"
				class="stroke-emerald-500 {wireAnimating ? 'animate-wire-flow' : ''}"
				fill="none"
				stroke-width="3"
				stroke-linecap="round"
			/>

			<!-- Switch to Power - -->
			<path
				d="M 120 200 L 75 200 L 75 95"
				class="stroke-gray-500 {wireAnimating ? 'animate-wire-flow' : ''}"
				fill="none"
				stroke-width="3"
				stroke-linecap="round"
			/>

			<!-- Voltmeter parallel connections -->
			<path
				d="M 255 90 L 240 90 L 240 210 L 275 210"
				class="stroke-purple-500"
				fill="none"
				stroke-width="2"
				stroke-dasharray="4,4"
			/>
			<path
				d="M 335 90 L 360 90 L 360 210 L 325 210"
				class="stroke-purple-500"
				fill="none"
				stroke-width="2"
				stroke-dasharray="4,4"
			/>
		{:else}
			<!-- Show disconnected state -->
			<text x="200" y="270" text-anchor="middle" class="fill-amber-400 text-[10px]">
				Circuit not connected - Use auto-connect or connect wires manually
			</text>
		{/if}

		<!-- Current flow indicator (when circuit is active) -->
		{#if wireAnimating}
			<g class="animate-pulse">
				<circle cx="100" cy="50" r="4" class="fill-yellow-400" />
				<circle cx="230" cy="50" r="4" class="fill-yellow-400" />
				<circle cx="350" cy="150" r="4" class="fill-yellow-400" />
				<circle cx="100" cy="200" r="4" class="fill-yellow-400" />
			</g>
		{/if}
	</svg>

	<!-- Circuit status indicator -->
	<div class="absolute bottom-4 left-4 right-4 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<div class="w-3 h-3 rounded-full {state.isCircuitComplete ? 'bg-emerald-500' : 'bg-amber-500'}"></div>
			<span class="text-xs text-gray-400">
				{state.isCircuitComplete ? 'Circuit Complete' : 'Circuit Incomplete'}
			</span>
		</div>

		{#if state.isPowerOn && state.isCircuitClosed && state.isCircuitComplete}
			<div class="flex items-center gap-2">
				<div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
				<span class="text-xs text-emerald-400">Current Flowing</span>
			</div>
		{/if}
	</div>
</div>

<style>
	@keyframes wire-flow {
		0%, 100% { stroke-opacity: 1; }
		50% { stroke-opacity: 0.6; }
	}

	.animate-wire-flow {
		animation: wire-flow 1s ease-in-out infinite;
	}
</style>
