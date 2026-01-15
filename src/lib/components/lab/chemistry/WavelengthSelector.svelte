<script lang="ts">
	import { wavelengthToColor } from '$lib/simulations/chemistry/spectroscopy';

	interface Props {
		wavelength: number;
		min?: number;
		max?: number;
		lambdaMax: number;
		onWavelengthChange: (value: number) => void;
		disabled?: boolean;
	}

	let {
		wavelength,
		min = 380,
		max = 780,
		lambdaMax,
		onWavelengthChange,
		disabled = false
	}: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		onWavelengthChange(parseInt(target.value));
	}

	// Quick wavelength presets
	const presets = [
		{ nm: 400, label: 'Violet' },
		{ nm: 450, label: 'Blue' },
		{ nm: 500, label: 'Cyan' },
		{ nm: 550, label: 'Green' },
		{ nm: 580, label: 'Yellow' },
		{ nm: 620, label: 'Orange' },
		{ nm: 700, label: 'Red' }
	];
</script>

<div class="glass rounded-2xl p-5 border border-white/5">
	<div class="flex items-center gap-3 mb-4">
		<div class="w-1.5 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
		<h3 class="font-display font-semibold text-white">Wavelength Selector</h3>
	</div>

	<!-- Current wavelength display -->
	<div class="glass rounded-xl p-4 border border-white/5 mb-4">
		<div class="flex items-center justify-between">
			<div>
				<p class="text-sm text-gray-400">Current Wavelength</p>
				<div class="flex items-baseline gap-2">
					<span class="text-3xl font-display font-bold text-white">{wavelength}</span>
					<span class="text-gray-400">nm</span>
				</div>
			</div>
			<div class="flex items-center gap-3">
				<!-- Color indicator -->
				<div
					class="w-12 h-12 rounded-xl border border-white/10 shadow-lg"
					style="background-color: {wavelengthToColor(wavelength)}; box-shadow: 0 0 20px {wavelengthToColor(wavelength)}50;"
				></div>
			</div>
		</div>

		<!-- λmax indicator -->
		{#if Math.abs(wavelength - lambdaMax) < 5}
			<div class="mt-3 flex items-center gap-2 text-emerald-400 animate-pulse">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span class="text-sm font-medium">At λmax ({lambdaMax} nm)</span>
			</div>
		{/if}
	</div>

	<!-- Wavelength slider with spectrum background -->
	<div class="relative mb-6">
		<!-- Spectrum gradient background -->
		<div class="h-4 rounded-full overflow-hidden mb-2"
			style="background: linear-gradient(to right,
				{wavelengthToColor(380)},
				{wavelengthToColor(440)},
				{wavelengthToColor(490)},
				{wavelengthToColor(510)},
				{wavelengthToColor(580)},
				{wavelengthToColor(645)},
				{wavelengthToColor(780)}
			);"
		>
			<!-- Current position indicator -->
			<div
				class="absolute top-0 w-1 h-4 bg-white rounded-full shadow-lg transition-all"
				style="left: {((wavelength - min) / (max - min)) * 100}%;"
			></div>
		</div>

		<!-- λmax marker -->
		<div
			class="absolute -top-1 w-0.5 h-6 bg-emerald-400"
			style="left: {((lambdaMax - min) / (max - min)) * 100}%;"
		>
			<div class="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-emerald-400 whitespace-nowrap">
				λmax
			</div>
		</div>

		<!-- Range input -->
		<input
			type="range"
			{min}
			{max}
			value={wavelength}
			oninput={handleInput}
			{disabled}
			class="w-full h-2 appearance-none bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
				[&::-webkit-slider-thumb]:appearance-none
				[&::-webkit-slider-thumb]:w-5
				[&::-webkit-slider-thumb]:h-5
				[&::-webkit-slider-thumb]:rounded-full
				[&::-webkit-slider-thumb]:bg-white
				[&::-webkit-slider-thumb]:border-2
				[&::-webkit-slider-thumb]:border-cyan-400
				[&::-webkit-slider-thumb]:shadow-lg
				[&::-webkit-slider-thumb]:cursor-pointer
				[&::-webkit-slider-thumb]:transition-transform
				[&::-webkit-slider-thumb]:hover:scale-110
				[&::-moz-range-thumb]:appearance-none
				[&::-moz-range-thumb]:w-5
				[&::-moz-range-thumb]:h-5
				[&::-moz-range-thumb]:rounded-full
				[&::-moz-range-thumb]:bg-white
				[&::-moz-range-thumb]:border-2
				[&::-moz-range-thumb]:border-cyan-400"
		/>

		<!-- Range labels -->
		<div class="flex justify-between text-xs text-gray-500 mt-1">
			<span>{min} nm</span>
			<span>{max} nm</span>
		</div>
	</div>

	<!-- Quick preset buttons -->
	<div>
		<p class="text-xs text-gray-500 mb-2">Quick Select</p>
		<div class="flex flex-wrap gap-2">
			{#each presets as preset}
				<button
					onclick={() => onWavelengthChange(preset.nm)}
					{disabled}
					class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all
						{wavelength === preset.nm
							? 'ring-2 ring-cyan-400/50'
							: 'hover:opacity-80'}
						disabled:opacity-50 disabled:cursor-not-allowed"
					style="background-color: {wavelengthToColor(preset.nm)}40; color: {wavelengthToColor(preset.nm)};"
				>
					{preset.label}
				</button>
			{/each}

			<!-- Go to λmax button -->
			<button
				onclick={() => onWavelengthChange(lambdaMax)}
				{disabled}
				class="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all
					disabled:opacity-50 disabled:cursor-not-allowed"
			>
				λmax ({lambdaMax})
			</button>
		</div>
	</div>
</div>
