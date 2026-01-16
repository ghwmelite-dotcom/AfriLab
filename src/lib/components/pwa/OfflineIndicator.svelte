<script lang="ts">
	import { isOnline, hasUpdate, applyUpdate } from '$lib/utils/pwa';
	import { slide } from 'svelte/transition';

	let showUpdateBanner = $state(false);

	$effect(() => {
		if ($hasUpdate) {
			showUpdateBanner = true;
		}
	});
</script>

<!-- Offline Banner -->
{#if !$isOnline}
	<div
		transition:slide={{ duration: 200 }}
		class="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-sm text-white py-2 px-4"
	>
		<div class="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
			<svg class="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
			</svg>
			<span>You're offline. Some features may be limited.</span>
		</div>
	</div>
{/if}

<!-- Update Available Banner -->
{#if showUpdateBanner}
	<div
		transition:slide={{ duration: 200 }}
		class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[60] glass-strong rounded-xl border border-cyan-500/30 p-4 shadow-2xl"
	>
		<div class="flex items-start gap-3">
			<div class="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
				<svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
				</svg>
			</div>
			<div class="flex-1 min-w-0">
				<h4 class="text-sm font-medium text-white">Update Available</h4>
				<p class="text-xs text-gray-400 mt-1">A new version of AfriLab is ready. Refresh to update.</p>
				<div class="flex items-center gap-2 mt-3">
					<button
						onclick={() => applyUpdate()}
						class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-xs font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
					>
						Update Now
					</button>
					<button
						onclick={() => showUpdateBanner = false}
						class="px-3 py-1.5 rounded-lg glass border border-white/10 text-gray-400 text-xs hover:text-white hover:border-white/20 transition-all"
					>
						Later
					</button>
				</div>
			</div>
			<button
				onclick={() => showUpdateBanner = false}
				class="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
				aria-label="Dismiss update notification"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	</div>
{/if}
