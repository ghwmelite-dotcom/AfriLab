<script lang="ts">
	let { level = 'safe', message, dismissable = true }: { level?: 'safe' | 'warning' | 'danger'; message: string; dismissable?: boolean } = $props();

	let dismissed = $state(false);

	const styles = {
		safe: {
			bg: 'bg-green-50 dark:bg-green-900/20',
			border: 'border-green-200 dark:border-green-800',
			text: 'text-green-800 dark:text-green-400',
			icon: 'text-green-500'
		},
		warning: {
			bg: 'bg-yellow-50 dark:bg-yellow-900/20',
			border: 'border-yellow-200 dark:border-yellow-800',
			text: 'text-yellow-800 dark:text-yellow-400',
			icon: 'text-yellow-500'
		},
		danger: {
			bg: 'bg-red-50 dark:bg-red-900/20',
			border: 'border-red-200 dark:border-red-800',
			text: 'text-red-800 dark:text-red-400',
			icon: 'text-red-500'
		}
	};

	let style = $derived(styles[level]);
</script>

{#if !dismissed}
	<div class="flex items-start gap-3 p-4 rounded-lg border {style.bg} {style.border}">
		<div class="flex-shrink-0">
			{#if level === 'safe'}
				<svg class="w-5 h-5 {style.icon}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			{:else if level === 'warning'}
				<svg class="w-5 h-5 {style.icon}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
				</svg>
			{:else}
				<svg class="w-5 h-5 {style.icon}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			{/if}
		</div>

		<div class="flex-1">
			<p class="text-sm {style.text}">
				{message}
			</p>
		</div>

		{#if dismissable}
			<button
				onclick={() => dismissed = true}
				class="flex-shrink-0 {style.text} hover:opacity-70"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		{/if}
	</div>
{/if}
