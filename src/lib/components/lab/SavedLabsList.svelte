<script lang="ts">
	import { onMount } from 'svelte';
	import { labProgressStore, type SavedLabProgress } from '$stores/labProgress';

	let savedLabs = $state<SavedLabProgress[]>([]);

	onMount(() => {
		labProgressStore.init();
		const unsubscribe = labProgressStore.subscribe((state) => {
			savedLabs = Array.from(state.savedLabs.values()).sort(
				(a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
			);
		});
		return unsubscribe;
	});

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	}

	function getDisciplineGradient(discipline: string): string {
		const gradients: Record<string, string> = {
			chemistry: 'from-cyan-500 to-blue-600',
			biology: 'from-emerald-500 to-green-600',
			physics: 'from-amber-500 to-orange-600',
			pharmacy: 'from-pink-500 to-rose-600',
			medical: 'from-rose-500 to-red-600'
		};
		return gradients[discipline] || 'from-gray-500 to-gray-600';
	}

	function getDisciplineHref(labId: string, discipline: string): string {
		const labSlug = labId.split('-').slice(1).join('-');
		return `/labs/${discipline}/${labSlug}`;
	}

	function handleDelete(labId: string) {
		labProgressStore.deleteProgress(labId);
	}
</script>

{#if savedLabs.length > 0}
	<div class="glass-strong rounded-2xl border border-white/10 p-4 sm:p-6">
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-3">
				<div class="w-1.5 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
				<h3 class="text-lg font-display font-semibold text-white">Continue Where You Left Off</h3>
			</div>
			<span
				class="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30"
			>
				{savedLabs.length} saved
			</span>
		</div>

		<div class="space-y-3">
			{#each savedLabs as lab}
				<div
					class="group glass rounded-xl border border-white/5 p-4 hover:border-white/10 transition-all"
				>
					<div class="flex items-start gap-4">
						<!-- Icon -->
						<div
							class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br {getDisciplineGradient(
								lab.discipline
							)} flex items-center justify-center flex-shrink-0"
						>
							<svg
								class="w-5 h-5 sm:w-6 sm:h-6 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
								/>
							</svg>
						</div>

						<!-- Content -->
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between mb-1">
								<h4 class="font-medium text-white truncate">{lab.labTitle}</h4>
								<span class="text-xs text-gray-500 flex-shrink-0 ml-2">
									{formatDate(lab.savedAt)}
								</span>
							</div>

							<div class="flex items-center gap-2 mb-2">
								<span class="text-xs text-gray-400 capitalize">{lab.discipline}</span>
								<span class="text-gray-600">·</span>
								<span class="text-xs text-gray-400">
									Step {lab.currentStep + 1}/{lab.totalSteps}
								</span>
							</div>

							<!-- Progress bar -->
							<div class="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
								<div
									class="h-full bg-gradient-to-r {getDisciplineGradient(
										lab.discipline
									)} transition-all rounded-full"
									style="width: {lab.percentComplete}%"
								></div>
							</div>

							<!-- Actions -->
							<div class="flex items-center gap-2">
								<a
									href={getDisciplineHref(lab.labId, lab.discipline)}
									class="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r {getDisciplineGradient(
										lab.discipline
									)} text-white text-sm font-medium hover:opacity-90 transition-opacity"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									Resume
								</a>

								<button
									onclick={() => handleDelete(lab.labId)}
									class="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
									aria-label="Delete saved progress"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
										/>
									</svg>
								</button>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
