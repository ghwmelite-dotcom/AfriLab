<script lang="ts">
	import { getProgressiveHint, type HintResponse } from '$lib/utils/hints';

	interface Props {
		experimentId: string;
		stepId: number;
		stepTitle?: string;
		disabled?: boolean;
	}

	let { experimentId, stepId, stepTitle = '', disabled = false }: Props = $props();

	let hintLevel = $state(0);
	let currentHint = $state<HintResponse | null>(null);
	let isExpanded = $state(false);
	let isLoading = $state(false);
	let previousHints = $state<string[]>([]);

	const maxHintLevel = 3;

	async function requestHint() {
		if (disabled || isLoading) return;

		isLoading = true;

		// Simulate AI processing delay
		await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

		const newLevel = Math.min(hintLevel + 1, maxHintLevel);
		const hint = getProgressiveHint(experimentId, stepId, newLevel, previousHints);

		hintLevel = newLevel;
		currentHint = hint;
		previousHints = [...previousHints, hint.hint];
		isExpanded = true;
		isLoading = false;
	}

	function closeHint() {
		isExpanded = false;
	}

	function resetHints() {
		hintLevel = 0;
		currentHint = null;
		previousHints = [];
		isExpanded = false;
	}

	// Reset hints when step changes
	$effect(() => {
		stepId;
		resetHints();
	});

	function getHintLevelLabel(level: number): string {
		switch (level) {
			case 1: return 'Gentle Nudge';
			case 2: return 'Helpful Hint';
			case 3: return 'Full Guidance';
			default: return 'Get a Hint';
		}
	}

	function getHintLevelColor(level: number): string {
		switch (level) {
			case 1: return 'from-emerald-500 to-cyan-500';
			case 2: return 'from-amber-500 to-orange-500';
			case 3: return 'from-purple-500 to-pink-500';
			default: return 'from-blue-500 to-indigo-500';
		}
	}
</script>

<div class="relative">
	<!-- Main Hint Button -->
	<button
		onclick={requestHint}
		{disabled}
		class="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
			{disabled
				? 'glass border border-white/5 text-gray-600 cursor-not-allowed'
				: hintLevel > 0
				? `bg-gradient-to-r ${getHintLevelColor(hintLevel)} text-white shadow-lg hover:shadow-xl`
				: 'glass border border-cyan-500/30 text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-500/10'}"
	>
		{#if isLoading}
			<!-- Loading spinner -->
			<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
		{:else}
			<!-- Lightbulb icon -->
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
			</svg>
		{/if}

		<span>{isLoading ? 'Thinking...' : getHintLevelLabel(hintLevel)}</span>

		<!-- Hint level indicator -->
		{#if hintLevel > 0 && hintLevel < maxHintLevel}
			<div class="flex gap-1 ml-1">
				{#each Array(maxHintLevel) as _, i}
					<div
						class="w-1.5 h-1.5 rounded-full transition-colors
							{i < hintLevel ? 'bg-white' : 'bg-white/30'}"
					></div>
				{/each}
			</div>
		{/if}
	</button>

	<!-- Hint Panel -->
	{#if isExpanded && currentHint}
		<div class="absolute top-full left-0 right-0 mt-3 z-50 animate-fade-in-up">
			<div class="glass-strong rounded-2xl p-5 border border-white/10 shadow-xl">
				<!-- Header -->
				<div class="flex items-start justify-between mb-4">
					<div class="flex items-center gap-2">
						<div class="w-8 h-8 rounded-lg bg-gradient-to-br {getHintLevelColor(currentHint.hintLevel)} flex items-center justify-center">
							<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
							</svg>
						</div>
						<div>
							<p class="text-sm font-medium text-white">{getHintLevelLabel(currentHint.hintLevel)}</p>
							{#if stepTitle}
								<p class="text-xs text-gray-500">{stepTitle}</p>
							{/if}
						</div>
					</div>
					<button
						onclick={closeHint}
						class="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<!-- Hint Content -->
				<div class="space-y-3">
					<p class="text-gray-300 leading-relaxed">{currentHint.hint}</p>

					{#if currentHint.encouragement}
						<p class="text-emerald-400 text-sm italic">"{currentHint.encouragement}"</p>
					{/if}

					{#if currentHint.relatedConcept}
						<div class="p-3 glass rounded-xl border border-cyan-500/20">
							<div class="flex items-center gap-2 text-xs text-cyan-400 mb-1">
								<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								Did You Know?
							</div>
							<p class="text-sm text-gray-400">{currentHint.relatedConcept}</p>
						</div>
					{/if}
				</div>

				<!-- Actions -->
				<div class="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
					{#if hintLevel < maxHintLevel}
						<button
							onclick={requestHint}
							class="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
						>
							Need more help?
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</button>
					{:else}
						<span class="text-sm text-gray-500">Maximum guidance reached</span>
					{/if}

					<button
						onclick={resetHints}
						class="text-sm text-gray-500 hover:text-gray-400 transition-colors"
					>
						Reset hints
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
