<script lang="ts">
	import type { ExperimentStep } from '$types';
	import { labStore } from '$stores/lab';

	let { steps = [], currentStepIndex = 0 }: { steps?: ExperimentStep[]; currentStepIndex?: number } = $props();
</script>

<div class="card p-4 space-y-4">
	<h3 class="font-semibold text-gray-900 dark:text-white">Procedure Steps</h3>

	<div class="space-y-3">
		{#each steps as step, i}
			<button
				onclick={() => labStore.goToStep(i)}
				class="w-full text-left p-3 rounded-lg transition-colors
					{i === currentStepIndex
					? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500'
					: i < currentStepIndex
						? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
						: 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700'}"
			>
				<div class="flex items-start gap-3">
					<!-- Step number/check -->
					<div class="flex-shrink-0">
						{#if i < currentStepIndex}
							<div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
								<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
							</div>
						{:else if i === currentStepIndex}
							<div class="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
								<span class="text-xs font-medium text-white">{i + 1}</span>
							</div>
						{:else}
							<div class="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
								<span class="text-xs font-medium text-gray-600 dark:text-gray-400">{i + 1}</span>
							</div>
						{/if}
					</div>

					<!-- Step content -->
					<div class="flex-1 min-w-0">
						<h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
							{step.title}
						</h4>
						{#if i === currentStepIndex}
							<p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
								{step.description}
							</p>

							{#if step.hints && step.hints.length > 0}
								<div class="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-400">
									<span class="font-medium">Hint:</span> {step.hints[0]}
								</div>
							{/if}
						{/if}
					</div>
				</div>
			</button>
		{/each}
	</div>
</div>
