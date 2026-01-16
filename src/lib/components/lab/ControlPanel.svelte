<script lang="ts">
	import { labStore, currentStep, progress, isFirstStep, isLastStep } from '$stores/lab';

	let { onComplete = () => {} }: { onComplete?: () => void } = $props();
</script>

<div class="glass-strong rounded-2xl p-5 border border-white/10 space-y-5">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full"></div>
			<h3 class="font-display font-semibold text-white">Controls</h3>
		</div>
		<div class="glass px-3 py-1 rounded-lg border border-white/10">
			<span class="text-sm font-mono text-emerald-400">
				Step {$labStore.currentStepIndex + 1}
			</span>
		</div>
	</div>

	<!-- Progress bar -->
	<div class="space-y-2">
		<div class="flex justify-between text-xs">
			<span class="text-gray-400">Progress</span>
			<span class="font-mono text-emerald-400">{Math.round($progress)}%</span>
		</div>
		<div class="h-2.5 bg-white/5 rounded-full overflow-hidden">
			<div
				class="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500 rounded-full relative"
				style="width: {$progress}%"
			>
				<!-- Shimmer effect -->
				<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
			</div>
		</div>
	</div>

	<!-- Current step info -->
	{#if $currentStep}
		<div class="glass rounded-xl p-4 border border-emerald-500/20">
			<h4 class="font-display font-medium text-white text-sm mb-2 flex items-center gap-2">
				<div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
				{$currentStep.title}
			</h4>
			<p class="text-xs text-gray-400 leading-relaxed">
				{$currentStep.description}
			</p>
		</div>
	{/if}

	<!-- Navigation buttons -->
	<div class="flex gap-3">
		<button
			onclick={() => labStore.previousStep()}
			disabled={$isFirstStep}
			class="group flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
				{$isFirstStep
					? 'bg-white/5 text-gray-600 cursor-not-allowed'
					: 'glass border border-white/10 text-gray-300 hover:text-white hover:border-white/20 hover:bg-white/5'}"
		>
			<svg class="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
				class="group flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
					bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]"
			>
				Complete
				<svg class="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
			</button>
		{:else}
			<button
				onclick={() => labStore.nextStep()}
				class="group flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
					bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]"
			>
				Next
				<svg class="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</button>
		{/if}
	</div>

	<!-- Pause/Resume -->
	<div>
		{#if $labStore.isPaused}
			<button
				onclick={() => labStore.resume()}
				class="group w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
					glass border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
				</svg>
				Resume Lab
			</button>
		{:else}
			<button
				onclick={() => labStore.pause()}
				class="group w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
					glass border border-white/10 text-gray-400 hover:text-white hover:border-amber-500/30 hover:bg-amber-500/10"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				Pause Lab
			</button>
		{/if}
	</div>
</div>

<style>
	@keyframes shimmer {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(100%); }
	}

	.animate-shimmer {
		animation: shimmer 2s ease-in-out infinite;
	}
</style>
