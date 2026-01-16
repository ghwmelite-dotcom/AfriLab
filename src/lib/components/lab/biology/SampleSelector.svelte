<script lang="ts">
	import { CELL_SAMPLES, type CellSample } from '$lib/simulations/biology/microscopy';

	let {
		currentSampleId,
		onSelectSample
	}: {
		currentSampleId: string | null;
		onSelectSample: (sampleId: string) => void;
	} = $props();

	let isExpanded = $state(false);

	let currentSample = $derived(CELL_SAMPLES.find((s) => s.id === currentSampleId));

	function getSampleIcon(sample: CellSample): string {
		switch (sample.type) {
			case 'plant':
				return '🌿';
			case 'animal':
				return '🔬';
			case 'bacteria':
				return '🦠';
			default:
				return '🧫';
		}
	}

	function getDifficultyColor(difficulty: string): string {
		switch (difficulty) {
			case 'beginner':
				return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
			case 'intermediate':
				return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
			case 'advanced':
				return 'text-rose-400 bg-rose-500/20 border-rose-500/30';
			default:
				return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
		}
	}
</script>

<div class="glass-strong rounded-xl border border-white/10 overflow-hidden">
	<!-- Header -->
	<button
		onclick={() => (isExpanded = !isExpanded)}
		class="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
	>
		<div class="flex items-center gap-3">
			<div class="w-1.5 h-5 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
			<h4 class="text-sm font-display font-semibold text-white">Slide Samples</h4>
		</div>

		<div class="flex items-center gap-3">
			{#if currentSample}
				<span class="text-xs text-gray-400">{currentSample.name}</span>
			{:else}
				<span class="text-xs text-gray-500">No slide loaded</span>
			{/if}
			<svg
				class="w-4 h-4 text-gray-400 transition-transform {isExpanded ? 'rotate-180' : ''}"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</div>
	</button>

	<!-- Sample list -->
	{#if isExpanded}
		<div class="border-t border-white/10 p-3 space-y-2 animate-fade-in">
			{#each CELL_SAMPLES as sample (sample.id)}
				<button
					onclick={() => {
						onSelectSample(sample.id);
						isExpanded = false;
					}}
					class="w-full p-3 rounded-xl text-left transition-all flex items-start gap-3
						{currentSampleId === sample.id
						? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30'
						: 'glass border border-white/5 hover:border-white/20'}"
				>
					<!-- Sample icon -->
					<div
						class="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
						style="background: {sample.color}20;"
					>
						{getSampleIcon(sample)}
					</div>

					<!-- Sample info -->
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-2">
							<span class="font-medium text-white text-sm">{sample.name}</span>
							{#if currentSampleId === sample.id}
								<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
							{/if}
						</div>
						<p class="text-xs text-gray-400 mt-0.5 line-clamp-2">{sample.description}</p>

						<div class="flex items-center gap-2 mt-2">
							<!-- Difficulty badge -->
							<span
								class="text-xs px-2 py-0.5 rounded-full border capitalize {getDifficultyColor(
									sample.difficulty
								)}"
							>
								{sample.difficulty}
							</span>

							<!-- Structure count -->
							<span class="text-xs text-gray-500">
								{sample.structures.length} structures
							</span>

							<!-- Required magnification -->
							<span class="text-xs text-gray-500">
								{sample.requiredMagnification}x min
							</span>
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<!-- Currently loaded slide indicator -->
{#if currentSample}
	<div class="mt-4 glass rounded-xl p-4 border border-white/10">
		<div class="flex items-center gap-3 mb-3">
			<div
				class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
				style="background: linear-gradient(135deg, {currentSample.color}40, {currentSample.color}20);"
			>
				{getSampleIcon(currentSample)}
			</div>
			<div>
				<h5 class="font-display font-semibold text-white">{currentSample.name}</h5>
				<p class="text-xs text-gray-400 capitalize">{currentSample.type} cell</p>
			</div>
		</div>

		<p class="text-sm text-gray-400 mb-3">{currentSample.description}</p>

		<!-- Learning objectives -->
		<div class="space-y-2">
			<span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Objectives</span>
			<ul class="space-y-1">
				{#each currentSample.learningObjectives as objective}
					<li class="flex items-start gap-2 text-xs text-gray-400">
						<svg
							class="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>{objective}</span>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Structures to identify -->
		<div class="mt-4 pt-3 border-t border-white/10">
			<span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Structures to Identify</span>
			<div class="flex flex-wrap gap-1.5 mt-2">
				{#each currentSample.structures as structure}
					<span
						class="text-xs px-2 py-1 rounded-lg border border-white/10"
						style="background: {structure.color}20; color: {structure.color};"
					>
						{structure.name}
					</span>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.2s ease-out;
	}
</style>
