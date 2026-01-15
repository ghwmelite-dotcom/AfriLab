<script lang="ts">
	import { labStore, currentStep, progress, isFirstStep, isLastStep } from '$stores/lab';

	let { onComplete = () => {} }: { onComplete?: () => void } = $props();
</script>

<div class="card p-4 space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="font-semibold text-gray-900 dark:text-white">Controls</h3>
		<span class="text-sm text-gray-500 dark:text-gray-400">
			Step {$labStore.currentStepIndex + 1}
		</span>
	</div>

	<!-- Progress bar -->
	<div class="space-y-2">
		<div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
			<span>Progress</span>
			<span>{Math.round($progress)}%</span>
		</div>
		<div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
			<div
				class="h-full bg-primary-600 transition-all duration-300"
				style="width: {$progress}%"
			></div>
		</div>
	</div>

	<!-- Current step -->
	{#if $currentStep}
		<div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
			<h4 class="font-medium text-gray-900 dark:text-white text-sm mb-1">
				{$currentStep.title}
			</h4>
			<p class="text-xs text-gray-600 dark:text-gray-400">
				{$currentStep.description}
			</p>
		</div>
	{/if}

	<!-- Navigation buttons -->
	<div class="flex gap-2">
		<button
			onclick={() => labStore.previousStep()}
			disabled={$isFirstStep}
			class="btn-secondary flex-1 py-2 text-sm disabled:opacity-50"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			Previous
		</button>

		{#if $isLastStep}
			<button
				onclick={() => {
					labStore.completeLab();
					onComplete();
				}}
				class="btn-primary flex-1 py-2 text-sm"
			>
				Complete
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
			</button>
		{:else}
			<button
				onclick={() => labStore.nextStep()}
				class="btn-primary flex-1 py-2 text-sm"
			>
				Next
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</button>
		{/if}
	</div>

	<!-- Pause/Resume -->
	<div class="flex gap-2">
		{#if $labStore.isPaused}
			<button
				onclick={() => labStore.resume()}
				class="btn-secondary w-full py-2 text-sm"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
				</svg>
				Resume
			</button>
		{:else}
			<button
				onclick={() => labStore.pause()}
				class="btn-secondary w-full py-2 text-sm"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				Pause
			</button>
		{/if}
	</div>
</div>
