<script lang="ts">
	import { formatNumber, getPHColor } from '$lib/utils/helpers';

	let { pH = 7, showScale = true }: { pH?: number; showScale?: boolean } = $props();

	let color = $derived(getPHColor(pH));
	let position = $derived((pH / 14) * 100);

	// Determine pH category for display
	let phCategory = $derived(() => {
		if (pH < 3) return { label: 'Strongly Acidic', class: 'text-rose-400' };
		if (pH < 6) return { label: 'Weakly Acidic', class: 'text-orange-400' };
		if (pH < 8) return { label: 'Neutral', class: 'text-emerald-400' };
		if (pH < 11) return { label: 'Weakly Basic', class: 'text-cyan-400' };
		return { label: 'Strongly Basic', class: 'text-indigo-400' };
	});
</script>

<div class="glass-strong rounded-2xl p-5 border border-white/10 space-y-4">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full"></div>
			<h4 class="text-sm font-display font-semibold text-white">pH Meter</h4>
		</div>

		<!-- Digital readout -->
		<div class="flex items-center gap-3">
			<div
				class="w-4 h-4 rounded-full animate-pulse shadow-lg transition-all duration-300"
				style="background: {color}; box-shadow: 0 0 12px {color};"
			></div>
			<div class="glass px-3 py-1.5 rounded-lg border border-white/10">
				<span class="text-xl font-mono font-bold transition-all duration-300" style="color: {color}; text-shadow: 0 0 20px {color};">
					{formatNumber(pH, 2)}
				</span>
			</div>
		</div>
	</div>

	{#if showScale}
		<!-- pH Scale visualization -->
		<div class="relative pt-2">
			<!-- Scale bar with gradient segments -->
			<div class="relative h-6 rounded-full overflow-hidden shadow-inner">
				<!-- Segmented pH scale -->
				<div class="absolute inset-0 flex">
					<div class="flex-1 bg-gradient-to-r from-rose-600 to-rose-500"></div>
					<div class="flex-1 bg-gradient-to-r from-rose-500 to-orange-500"></div>
					<div class="flex-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
					<div class="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500"></div>
					<div class="flex-1 bg-gradient-to-r from-yellow-500 to-lime-500"></div>
					<div class="flex-1 bg-gradient-to-r from-lime-500 to-emerald-500"></div>
					<div class="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
					<div class="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500"></div>
					<div class="flex-1 bg-gradient-to-r from-cyan-500 to-sky-500"></div>
					<div class="flex-1 bg-gradient-to-r from-sky-500 to-blue-500"></div>
					<div class="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
					<div class="flex-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
					<div class="flex-1 bg-gradient-to-r from-violet-500 to-purple-500"></div>
					<div class="flex-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
				</div>

				<!-- Glass overlay effect -->
				<div class="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/20"></div>

				<!-- Scale tick marks -->
				<div class="absolute inset-0 flex justify-between px-0.5">
					{#each Array(15) as _, i}
						<div class="w-px h-full bg-black/20"></div>
					{/each}
				</div>
			</div>

			<!-- Current pH indicator (needle) -->
			<div
				class="absolute top-0 w-1 transition-all duration-300 ease-out z-10"
				style="left: calc({position}% - 2px);"
			>
				<!-- Needle head -->
				<div class="w-3 h-3 -ml-1 bg-white rounded-full shadow-lg border-2 border-gray-900"></div>
				<!-- Needle body -->
				<div class="w-1 h-4 bg-gradient-to-b from-white to-gray-300 mx-auto shadow-lg"></div>
				<!-- Glow effect -->
				<div
					class="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full blur-md opacity-60 transition-all duration-300"
					style="background: {color};"
				></div>
			</div>

			<!-- Scale labels -->
			<div class="flex justify-between mt-3 text-[10px] font-mono text-gray-500">
				{#each [0, 2, 4, 6, 7, 8, 10, 12, 14] as mark}
					<span class="w-4 text-center {mark === 7 ? 'text-emerald-400 font-bold' : ''}">{mark}</span>
				{/each}
			</div>
		</div>

		<!-- Legend with category indicator -->
		<div class="flex items-center justify-between pt-2 border-t border-white/5">
			<div class="flex gap-4 text-xs">
				<div class="flex items-center gap-1.5">
					<div class="w-3 h-3 rounded-full bg-gradient-to-r from-rose-500 to-orange-500"></div>
					<span class="text-gray-400">Acidic</span>
				</div>
				<div class="flex items-center gap-1.5">
					<div class="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
					<span class="text-gray-400">Neutral</span>
				</div>
				<div class="flex items-center gap-1.5">
					<div class="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
					<span class="text-gray-400">Basic</span>
				</div>
			</div>

			<!-- Current category badge -->
			<div class="glass px-2 py-1 rounded-lg border border-white/10">
				<span class="text-xs font-medium {phCategory().class}">
					{phCategory().label}
				</span>
			</div>
		</div>
	{/if}

	<!-- Mini stats row -->
	<div class="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
		<div class="text-center">
			<div class="text-lg font-mono font-bold text-white">{pH < 7 ? (7 - pH).toFixed(1) : '0.0'}</div>
			<div class="text-[10px] text-gray-500 uppercase tracking-wider">H+ Excess</div>
		</div>
		<div class="text-center border-x border-white/5">
			<div class="text-lg font-mono font-bold text-emerald-400">7.00</div>
			<div class="text-[10px] text-gray-500 uppercase tracking-wider">Target</div>
		</div>
		<div class="text-center">
			<div class="text-lg font-mono font-bold text-white">{pH > 7 ? (pH - 7).toFixed(1) : '0.0'}</div>
			<div class="text-[10px] text-gray-500 uppercase tracking-wider">OH- Excess</div>
		</div>
	</div>
</div>
