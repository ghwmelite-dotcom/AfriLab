<script lang="ts">
	import { isInstallable, isInstalled, installPWA } from '$lib/utils/pwa';
	import { browser } from '$app/environment';
	import { slide } from 'svelte/transition';

	let dismissed = $state(false);
	let installing = $state(false);

	// Check if prompt was dismissed recently
	$effect(() => {
		if (browser) {
			const dismissedAt = localStorage.getItem('afrilab_install_dismissed');
			if (dismissedAt) {
				const dismissedTime = parseInt(dismissedAt);
				const now = Date.now();
				// Show again after 7 days
				if (now - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
					dismissed = true;
				}
			}
		}
	});

	async function handleInstall() {
		installing = true;
		const installed = await installPWA();
		installing = false;

		if (!installed) {
			dismiss();
		}
	}

	function dismiss() {
		dismissed = true;
		if (browser) {
			localStorage.setItem('afrilab_install_dismissed', Date.now().toString());
		}
	}

	let shouldShow = $derived($isInstallable && !$isInstalled && !dismissed);
</script>

{#if shouldShow}
	<div
		transition:slide={{ duration: 300 }}
		class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 glass-strong rounded-2xl border border-emerald-500/30 overflow-hidden shadow-2xl"
	>
		<!-- Gradient accent -->
		<div class="h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500"></div>

		<div class="p-5">
			<div class="flex items-start gap-4">
				<!-- App icon -->
				<div class="relative flex-shrink-0">
					<div class="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl blur-lg opacity-40"></div>
					<div class="relative w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
						<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
						</svg>
					</div>
				</div>

				<!-- Content -->
				<div class="flex-1 min-w-0">
					<h3 class="text-base font-display font-bold text-white">
						Install AfriLab
					</h3>
					<p class="text-sm text-gray-400 mt-1">
						Add to your home screen for quick access and offline support
					</p>

					<!-- Benefits -->
					<div class="flex flex-wrap gap-2 mt-3">
						<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
							<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							Works Offline
						</span>
						<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
							<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
							Fast Launch
						</span>
					</div>
				</div>

				<!-- Dismiss button -->
				<button
					onclick={dismiss}
					class="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
					aria-label="Dismiss install prompt"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Actions -->
			<div class="flex items-center gap-3 mt-5">
				<button
					onclick={handleInstall}
					disabled={installing}
					class="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if installing}
						<span class="flex items-center justify-center gap-2">
							<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Installing...
						</span>
					{:else}
						<span class="flex items-center justify-center gap-2">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
							</svg>
							Install App
						</span>
					{/if}
				</button>
				<button
					onclick={dismiss}
					class="px-4 py-2.5 rounded-xl glass border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all"
				>
					Not Now
				</button>
			</div>
		</div>
	</div>
{/if}
