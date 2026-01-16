<script lang="ts">
	import { labStore } from '$stores/lab';
	import { formatNumber } from '$lib/utils/helpers';

	let { measurements = [] }: { measurements?: { type: string; value: number; unit: string; label?: string }[] } = $props();

	function downloadData() {
		const data = measurements.map(m =>
			`${m.label || m.type}: ${formatNumber(m.value)} ${m.unit}`
		).join('\n');

		const blob = new Blob([data], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'lab-measurements.txt';
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="glass-strong rounded-2xl p-5 border border-white/10 space-y-4">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="w-1.5 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
			<h3 class="font-display font-semibold text-white">Measurements</h3>
		</div>
		{#if measurements.length > 0}
			<button
				onclick={downloadData}
				class="group glass px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all flex items-center gap-2"
			>
				<svg class="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
				</svg>
				Export
			</button>
		{/if}
	</div>

	{#if measurements.length === 0}
		<div class="text-center py-8">
			<div class="w-14 h-14 mx-auto mb-3 glass rounded-xl border border-white/10 flex items-center justify-center">
				<svg class="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
				</svg>
			</div>
			<p class="text-sm text-gray-500">
				No measurements recorded yet
			</p>
			<p class="text-xs text-gray-600 mt-1">
				Start the experiment to record data
			</p>
		</div>
	{:else}
		<div class="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
			{#each measurements as measurement, i}
				<div class="group flex items-center justify-between p-3 glass rounded-xl border border-white/5 hover:border-purple-500/20 transition-all">
					<div class="flex items-center gap-3">
						<div class="w-7 h-7 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-purple-500/20">
							<span class="text-xs font-mono font-bold text-purple-400">{i + 1}</span>
						</div>
						<span class="text-sm text-gray-300 group-hover:text-white transition-colors">
							{measurement.label || measurement.type}
						</span>
					</div>
					<div class="glass px-3 py-1 rounded-lg border border-white/10">
						<span class="text-sm font-mono font-medium text-white">
							{formatNumber(measurement.value)} <span class="text-gray-500">{measurement.unit}</span>
						</span>
					</div>
				</div>
			{/each}
		</div>

		<!-- Summary stats -->
		{#if measurements.length > 1}
			<div class="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
				<span class="text-gray-500">{measurements.length} readings recorded</span>
				<div class="flex items-center gap-1 text-emerald-400">
					<div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
					Live
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.02);
		border-radius: 2px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.2);
	}
</style>
