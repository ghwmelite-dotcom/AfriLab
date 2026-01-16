<script lang="ts">
	import Skeleton from './Skeleton.svelte';

	let {
		variant = 'default',
		lines = 3
	}: {
		variant?: 'default' | 'stat' | 'lab' | 'list-item';
		lines?: number;
	} = $props();
</script>

{#if variant === 'stat'}
	<div class="glass-strong rounded-2xl p-6 border border-white/5">
		<div class="flex items-start justify-between mb-4">
			<Skeleton variant="rectangular" width="48px" height="48px" rounded="xl" />
			<Skeleton variant="circular" width="32px" height="32px" />
		</div>
		<Skeleton variant="text" width="60%" class="mb-2" />
		<Skeleton variant="text" width="40%" height="12px" />
	</div>

{:else if variant === 'lab'}
	<div class="glass-strong rounded-2xl overflow-hidden border border-white/5">
		<Skeleton variant="rectangular" width="100%" height="176px" rounded="none" />
		<div class="p-5 space-y-3">
			<div class="flex items-center gap-2">
				<Skeleton variant="text" width="60px" height="12px" />
				<Skeleton variant="text" width="80px" height="20px" rounded="full" />
			</div>
			<Skeleton variant="text" width="80%" height="20px" />
			<Skeleton variant="text" width="100%" />
			<Skeleton variant="text" width="70%" />
			<div class="flex items-center justify-between pt-2">
				<Skeleton variant="text" width="80px" height="16px" />
				<Skeleton variant="rectangular" width="100px" height="40px" rounded="xl" />
			</div>
		</div>
	</div>

{:else if variant === 'list-item'}
	<div class="flex items-center gap-4 p-5">
		<Skeleton variant="rectangular" width="56px" height="56px" rounded="xl" />
		<div class="flex-1 space-y-2">
			<Skeleton variant="text" width="60%" height="18px" />
			<div class="flex items-center gap-2">
				<Skeleton variant="text" width="80px" height="14px" />
				<Skeleton variant="circular" width="4px" height="4px" />
				<Skeleton variant="text" width="60px" height="14px" />
			</div>
		</div>
		<div class="text-right space-y-2">
			<Skeleton variant="text" width="48px" height="20px" />
			<Skeleton variant="text" width="40px" height="12px" />
		</div>
	</div>

{:else}
	<div class="glass-strong rounded-2xl p-6 border border-white/5 space-y-4">
		<Skeleton variant="text" width="40%" height="24px" />
		{#each Array(lines) as _}
			<Skeleton variant="text" />
		{/each}
		<Skeleton variant="text" width="60%" />
	</div>
{/if}
