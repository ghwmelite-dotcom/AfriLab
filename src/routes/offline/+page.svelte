<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let isOnline = $state(false);

	onMount(() => {
		isOnline = navigator.onLine;

		const handleOnline = () => {
			isOnline = true;
			// Redirect to dashboard when back online
			setTimeout(() => {
				window.location.href = '/dashboard';
			}, 1500);
		};

		const handleOffline = () => {
			isOnline = false;
		};

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	});

	function retryConnection() {
		window.location.reload();
	}
</script>

<svelte:head>
	<title>Offline - AfriLab</title>
</svelte:head>

<div class="min-h-screen bg-void flex items-center justify-center p-4">
	<!-- Background pattern -->
	<div class="fixed inset-0 overflow-hidden pointer-events-none">
		<div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800"></div>
		<div class="absolute top-1/4 -left-32 w-96 h-96 bg-gray-800/50 rounded-full blur-3xl"></div>
		<div class="absolute bottom-1/4 -right-32 w-96 h-96 bg-gray-800/50 rounded-full blur-3xl"></div>
	</div>

	<div class="relative max-w-md w-full text-center">
		{#if isOnline}
			<!-- Connection restored -->
			<div class="animate-fade-in-up">
				<div class="w-24 h-24 mx-auto mb-8 relative">
					<div class="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
					<div class="relative w-full h-full bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl flex items-center justify-center">
						<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
					</div>
				</div>

				<h1 class="text-2xl font-display font-bold text-white mb-4">
					Connection Restored!
				</h1>
				<p class="text-gray-400 mb-8">
					Redirecting you back to your lab...
				</p>

				<div class="flex justify-center">
					<div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
				</div>
			</div>
		{:else}
			<!-- Offline state -->
			<div class="animate-fade-in-up">
				<div class="w-24 h-24 mx-auto mb-8 relative">
					<div class="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-700 rounded-3xl blur-xl opacity-30"></div>
					<div class="relative w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center border border-gray-600">
						<svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
						</svg>
					</div>
				</div>

				<h1 class="text-2xl font-display font-bold text-white mb-4">
					You're Offline
				</h1>
				<p class="text-gray-400 mb-8">
					No internet connection detected. Some features may be limited, but you can still access cached content.
				</p>

				<!-- Available offline features -->
				<div class="glass rounded-2xl p-6 border border-white/10 text-left mb-8">
					<h3 class="text-sm font-semibold text-white mb-4 flex items-center gap-2">
						<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						Available Offline
					</h3>
					<ul class="space-y-2 text-sm text-gray-400">
						<li class="flex items-center gap-2">
							<div class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
							View cached lab pages
						</li>
						<li class="flex items-center gap-2">
							<div class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
							Access previously loaded content
						</li>
						<li class="flex items-center gap-2">
							<div class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
							Your progress will sync when online
						</li>
					</ul>
				</div>

				<!-- Unavailable features -->
				<div class="glass rounded-2xl p-6 border border-rose-500/20 text-left mb-8">
					<h3 class="text-sm font-semibold text-white mb-4 flex items-center gap-2">
						<svg class="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
						Requires Internet
					</h3>
					<ul class="space-y-2 text-sm text-gray-400">
						<li class="flex items-center gap-2">
							<div class="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
							AI Lab Assistant
						</li>
						<li class="flex items-center gap-2">
							<div class="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
							Real-time collaboration
						</li>
						<li class="flex items-center gap-2">
							<div class="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
							Leaderboard updates
						</li>
					</ul>
				</div>

				<!-- Retry button -->
				<button
					onclick={retryConnection}
					class="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
				>
					<span class="flex items-center justify-center gap-2">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						Try Again
					</span>
				</button>

				<p class="text-xs text-gray-500 mt-4">
					We'll automatically reconnect when internet is available
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	@keyframes fade-in-up {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in-up {
		animation: fade-in-up 0.5s ease-out;
	}

	.bg-void {
		background: rgb(10, 10, 15);
	}
</style>
