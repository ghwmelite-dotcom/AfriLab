<script lang="ts">
	let { level = 'safe', message, dismissable = true }: { level?: 'safe' | 'warning' | 'danger'; message: string; dismissable?: boolean } = $props();

	let dismissed = $state(false);

	const styles = {
		safe: {
			bg: 'from-emerald-500/10 to-emerald-500/5',
			border: 'border-emerald-500/30',
			text: 'text-emerald-400',
			icon: 'text-emerald-500',
			glow: 'shadow-emerald-500/10'
		},
		warning: {
			bg: 'from-amber-500/10 to-amber-500/5',
			border: 'border-amber-500/30',
			text: 'text-amber-400',
			icon: 'text-amber-500',
			glow: 'shadow-amber-500/10'
		},
		danger: {
			bg: 'from-rose-500/10 to-rose-500/5',
			border: 'border-rose-500/30',
			text: 'text-rose-400',
			icon: 'text-rose-500',
			glow: 'shadow-rose-500/10'
		}
	};

	let style = $derived(styles[level]);
</script>

{#if !dismissed}
	<div class="relative overflow-hidden flex items-start gap-4 p-4 rounded-xl border bg-gradient-to-r {style.bg} {style.border} shadow-lg {style.glow} animate-fade-in-up">
		<!-- Animated background pulse for warning/danger -->
		{#if level !== 'safe'}
			<div class="absolute inset-0 bg-gradient-to-r {style.bg} animate-pulse opacity-50"></div>
		{/if}

		<!-- Icon -->
		<div class="relative flex-shrink-0">
			<div class="w-10 h-10 glass rounded-xl border {style.border} flex items-center justify-center">
				{#if level === 'safe'}
					<svg class="w-5 h-5 {style.icon}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{:else if level === 'warning'}
					<svg class="w-5 h-5 {style.icon} animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
				{:else}
					<svg class="w-5 h-5 {style.icon} animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{/if}
			</div>
		</div>

		<!-- Content -->
		<div class="relative flex-1 min-w-0">
			<div class="flex items-center gap-2 mb-1">
				<span class="text-xs font-semibold uppercase tracking-wider {style.text}">
					{level === 'safe' ? 'All Clear' : level === 'warning' ? 'Caution' : 'Danger'}
				</span>
				{#if level !== 'safe'}
					<div class="w-1.5 h-1.5 rounded-full {style.icon} bg-current animate-pulse"></div>
				{/if}
			</div>
			<p class="text-sm text-gray-300 leading-relaxed">
				{message}
			</p>
		</div>

		<!-- Dismiss button -->
		{#if dismissable}
			<button
				onclick={() => dismissed = true}
				class="relative flex-shrink-0 p-1.5 rounded-lg glass border border-white/10 hover:border-white/20 {style.text} hover:opacity-70 transition-all"
				aria-label="Dismiss safety message"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		{/if}
	</div>
{/if}

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
		animation: fade-in-up 0.3s ease-out;
	}
</style>
