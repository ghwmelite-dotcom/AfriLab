<script lang="ts">
	import { theme, resolvedTheme, isDark, applyTheme } from '$stores/theme';
	import { onMount } from 'svelte';

	let mounted = $state(false);

	// Apply theme on mount and when it changes
	onMount(() => {
		mounted = true;

		// Subscribe to resolved theme and apply changes
		const unsubscribe = resolvedTheme.subscribe((value) => {
			applyTheme(value);
		});

		// Listen for system preference changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = () => {
			if ($theme === 'system') {
				applyTheme(mediaQuery.matches ? 'dark' : 'light');
			}
		};

		mediaQuery.addEventListener('change', handleChange);

		return () => {
			unsubscribe();
			mediaQuery.removeEventListener('change', handleChange);
		};
	});
</script>

<button
	onclick={() => theme.toggle()}
	class="group relative p-2.5 rounded-xl glass border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden"
	title={$isDark ? 'Switch to light mode' : 'Switch to dark mode'}
>
	<!-- Background glow -->
	<div class="absolute inset-0 transition-opacity duration-500
		{$isDark ? 'opacity-0' : 'opacity-100'}
		bg-gradient-to-br from-amber-400/20 to-orange-500/20">
	</div>
	<div class="absolute inset-0 transition-opacity duration-500
		{$isDark ? 'opacity-100' : 'opacity-0'}
		bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
	</div>

	<!-- Icon container -->
	<div class="relative w-5 h-5">
		<!-- Sun icon (light mode) -->
		<div class="absolute inset-0 transition-all duration-500
			{$isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}">
			<svg
				class="w-5 h-5 text-amber-500"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
				/>
			</svg>
		</div>

		<!-- Moon icon (dark mode) -->
		<div class="absolute inset-0 transition-all duration-500
			{$isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}">
			<svg
				class="w-5 h-5 text-indigo-400"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
				/>
			</svg>
		</div>
	</div>

	<!-- Stars animation for dark mode -->
	{#if $isDark}
		<div class="absolute inset-0 pointer-events-none overflow-hidden">
			<div class="absolute w-0.5 h-0.5 bg-white/60 rounded-full top-1 left-2 animate-twinkle"></div>
			<div class="absolute w-0.5 h-0.5 bg-white/40 rounded-full top-3 right-1 animate-twinkle" style="animation-delay: 0.3s;"></div>
			<div class="absolute w-0.5 h-0.5 bg-white/50 rounded-full bottom-2 left-1 animate-twinkle" style="animation-delay: 0.6s;"></div>
		</div>
	{/if}
</button>

<style>
	@keyframes twinkle {
		0%, 100% { opacity: 0.3; transform: scale(1); }
		50% { opacity: 1; transform: scale(1.2); }
	}

	.animate-twinkle {
		animation: twinkle 2s ease-in-out infinite;
	}
</style>
