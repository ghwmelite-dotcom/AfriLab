<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let elapsedSeconds = $state(0);
	let intervalId: ReturnType<typeof setInterval> | null = null;

	function formatTime(totalSeconds: number): string {
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		if (hours > 0) {
			return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		}
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	onMount(() => {
		intervalId = setInterval(() => {
			elapsedSeconds++;
		}, 1000);
	});

	onDestroy(() => {
		if (intervalId) {
			clearInterval(intervalId);
		}
	});
</script>

<div class="glass rounded-xl p-3 border border-white/10">
	<div class="flex items-center gap-3">
		<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
			<svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		</div>
		<div>
			<div class="text-[10px] text-gray-500 uppercase tracking-wider">Lab Duration</div>
			<div class="text-lg font-mono font-semibold text-white tabular-nums">
				{formatTime(elapsedSeconds)}
			</div>
		</div>
	</div>
</div>
