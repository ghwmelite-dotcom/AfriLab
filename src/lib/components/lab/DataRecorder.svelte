<script lang="ts">
	import { labStore } from '$stores/lab';
	import { formatNumber } from '$lib/utils/helpers';

	export let measurements: { type: string; value: number; unit: string; label?: string }[] = [];

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

<div class="card p-4 space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="font-semibold text-gray-900 dark:text-white">Measurements</h3>
		{#if measurements.length > 0}
			<button
				onclick={downloadData}
				class="text-xs text-primary-600 hover:text-primary-700"
			>
				Download
			</button>
		{/if}
	</div>

	{#if measurements.length === 0}
		<div class="text-center py-6">
			<svg class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
			</svg>
			<p class="text-sm text-gray-500 dark:text-gray-400">
				No measurements recorded yet
			</p>
		</div>
	{:else}
		<div class="space-y-2 max-h-48 overflow-y-auto">
			{#each measurements as measurement, i}
				<div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
					<div class="flex items-center gap-2">
						<span class="w-5 h-5 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-xs text-primary-600">
							{i + 1}
						</span>
						<span class="text-sm text-gray-700 dark:text-gray-300">
							{measurement.label || measurement.type}
						</span>
					</div>
					<span class="text-sm font-mono font-medium text-gray-900 dark:text-white">
						{formatNumber(measurement.value)} {measurement.unit}
					</span>
				</div>
			{/each}
		</div>
	{/if}
</div>
