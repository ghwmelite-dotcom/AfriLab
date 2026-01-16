<script lang="ts">
	import type { ExperimentStep } from '$types';
	import { labStore } from '$stores/lab';

	let { steps = [], currentStepIndex = 0 }: { steps?: ExperimentStep[]; currentStepIndex?: number } = $props();
</script>

<div class="glass-strong rounded-2xl p-5 border border-white/10 space-y-4">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div class="w-1.5 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
		<h3 class="font-display font-semibold text-white">Procedure Steps</h3>
	</div>

	<!-- Steps list -->
	<div class="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
		{#each steps as step, i}
			<button
				onclick={() => labStore.goToStep(i)}
				class="group w-full text-left p-3 rounded-xl transition-all duration-200
					{i === currentStepIndex
					? 'glass border-2 border-emerald-500/50 bg-emerald-500/10'
					: i < currentStepIndex
						? 'glass border border-emerald-500/20 bg-emerald-500/5'
						: 'glass border border-white/5 hover:border-white/10 hover:bg-white/[0.02]'}"
			>
				<div class="flex items-start gap-3">
					<!-- Step indicator -->
					<div class="flex-shrink-0 mt-0.5">
						{#if i < currentStepIndex}
							<!-- Completed -->
							<div class="w-7 h-7 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
								<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
								</svg>
							</div>
						{:else if i === currentStepIndex}
							<!-- Current -->
							<div class="relative">
								<div class="w-7 h-7 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
									<span class="text-xs font-bold text-white">{i + 1}</span>
								</div>
								<!-- Pulse ring -->
								<div class="absolute inset-0 rounded-lg bg-emerald-500/30 animate-ping"></div>
							</div>
						{:else}
							<!-- Upcoming -->
							<div class="w-7 h-7 glass border border-white/10 rounded-lg flex items-center justify-center group-hover:border-white/20 transition-colors">
								<span class="text-xs font-medium text-gray-500 group-hover:text-gray-400">{i + 1}</span>
							</div>
						{/if}
					</div>

					<!-- Step content -->
					<div class="flex-1 min-w-0">
						<h4 class="text-sm font-medium truncate transition-colors
							{i === currentStepIndex
								? 'text-white'
								: i < currentStepIndex
									? 'text-emerald-400'
									: 'text-gray-400 group-hover:text-gray-300'}">
							{step.title}
						</h4>

						<!-- Show description and hints only for current step -->
						{#if i === currentStepIndex}
							<p class="text-xs text-gray-400 mt-1.5 leading-relaxed">
								{step.description}
							</p>

							{#if step.hints && step.hints.length > 0}
								<div class="mt-3 p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
									<div class="flex items-start gap-2">
										<svg class="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
										</svg>
										<div>
											<span class="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">Hint</span>
											<p class="text-xs text-cyan-300/80 mt-0.5">{step.hints[0]}</p>
										</div>
									</div>
								</div>
							{/if}
						{/if}
					</div>

					<!-- Completion indicator for completed steps -->
					{#if i < currentStepIndex}
						<div class="flex-shrink-0">
							<span class="text-[10px] font-medium text-emerald-400/60 uppercase tracking-wider">Done</span>
						</div>
					{/if}
				</div>
			</button>
		{/each}
	</div>

	<!-- Progress indicator -->
	<div class="pt-3 border-t border-white/5">
		<div class="flex items-center justify-between text-xs mb-2">
			<span class="text-gray-500">Step Progress</span>
			<span class="font-mono text-emerald-400">{currentStepIndex + 1} / {steps.length}</span>
		</div>
		<div class="flex gap-1">
			{#each steps as _, i}
				<div class="flex-1 h-1 rounded-full transition-all duration-300
					{i < currentStepIndex
						? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
						: i === currentStepIndex
							? 'bg-emerald-500/50'
							: 'bg-white/5'}">
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.02);
		border-radius: 2px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.2);
	}
</style>
