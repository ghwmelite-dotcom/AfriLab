<script lang="ts">
	import {
		CELL_SAMPLES,
		calculateBlur,
		calculateClarity,
		getVisibleStructures,
		needsOilImmersion,
		type MicroscopyState,
		type CellStructure
	} from '$lib/simulations/biology/microscopy';

	let {
		labState,
		onIdentifyStructure
	}: {
		labState: MicroscopyState;
		onIdentifyStructure: (structureId: string) => void;
	} = $props();

	let hoveredStructure = $state<CellStructure | null>(null);
	let selectedStructure = $state<CellStructure | null>(null);

	let sample = $derived(CELL_SAMPLES.find(s => s.id === labState.currentSampleId));
	let blur = $derived(calculateBlur(state));
	let clarity = $derived(calculateClarity(state));
	let visibleStructures = $derived(getVisibleStructures(state));
	let needsOil = $derived(needsOilImmersion(state));

	// Calculate view transform based on stage position and magnification
	let viewTransform = $derived(() => {
		const scale = labState.magnification / 100;
		const translateX = -labState.stageX * scale;
		const translateY = -labState.stageY * scale;
		return `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
	});

	function handleStructureClick(structure: CellStructure) {
		selectedStructure = structure;
		if (!labState.identifiedStructures.includes(structure.id)) {
			onIdentifyStructure(structure.id);
		}
	}

	function getStructureStyle(structure: CellStructure): string {
		const isIdentified = labState.identifiedStructures.includes(structure.id);
		const isHovered = hoveredStructure?.id === structure.id;
		const isSelected = selectedStructure?.id === structure.id;

		let style = `
			left: ${structure.x}%;
			top: ${structure.y}%;
			width: ${structure.size}%;
			height: ${structure.shape === 'rod' ? structure.size * 0.3 : structure.size}%;
			background: ${structure.color};
			transform: translate(-50%, -50%);
		`;

		if (structure.shape === 'circle') {
			style += 'border-radius: 50%;';
		} else if (structure.shape === 'oval') {
			style += 'border-radius: 50%;';
		} else if (structure.shape === 'rod') {
			style += 'border-radius: 999px;';
		} else {
			style += 'border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;';
		}

		if (isHovered || isSelected) {
			style += `box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.8), 0 0 20px rgba(34, 197, 94, 0.4);`;
		}

		if (isIdentified) {
			style += `outline: 2px dashed rgba(34, 197, 94, 0.6); outline-offset: 2px;`;
		}

		return style;
	}
</script>

<div class="relative w-full aspect-square max-w-lg mx-auto">
	<!-- Microscope eyepiece frame -->
	<div class="absolute inset-0 rounded-full border-[20px] border-gray-800 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
		<!-- Circular viewport -->
		<div class="absolute inset-0 rounded-full overflow-hidden bg-black">
			<!-- Light source -->
			{#if labState.isLightOn}
				<div
					class="absolute inset-0 rounded-full transition-opacity duration-300"
					style="background: radial-gradient(circle, rgba(255,255,240,{labState.lightIntensity/100}) 0%, rgba(200,200,180,{labState.lightIntensity/150}) 70%, rgba(0,0,0,0.3) 100%);"
				></div>
			{/if}

			<!-- Sample view -->
			{#if sample && labState.isLightOn}
				<div
					class="absolute inset-4 rounded-full overflow-hidden transition-all duration-200"
					style="filter: blur({blur}px); transform: {viewTransform()}; transform-origin: center;"
				>
					<!-- Sample background -->
					<div
						class="absolute inset-0"
						style="background: {sample.backgroundColor};"
					></div>

					<!-- Cell structures -->
					{#each visibleStructures as structure (structure.id)}
						<button
							class="absolute cursor-pointer transition-all duration-150 hover:brightness-110"
							style={getStructureStyle(structure)}
							onmouseenter={() => hoveredStructure = structure}
							onmouseleave={() => hoveredStructure = null}
							onclick={() => handleStructureClick(structure)}
							disabled={clarity < 50}
							aria-label="Identify {structure.name}"
						></button>
					{/each}

					<!-- Cell outline effect -->
					{#if sample.type !== 'bacteria'}
						<div
							class="absolute inset-[10%] rounded-[30%_70%_70%_30%/30%_30%_70%_70%] border-2 opacity-30"
							style="border-color: {sample.color};"
						></div>
					{/if}
				</div>
			{:else if !sample}
				<div class="absolute inset-0 flex items-center justify-center">
					<p class="text-gray-600 text-sm">No slide loaded</p>
				</div>
			{:else}
				<div class="absolute inset-0 flex items-center justify-center">
					<p class="text-gray-600 text-sm">Light is off</p>
				</div>
			{/if}

			<!-- Oil immersion warning -->
			{#if needsOil}
				<div class="absolute inset-0 bg-black/70 flex items-center justify-center rounded-full">
					<div class="text-center p-4">
						<svg class="w-8 h-8 text-amber-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
						<p class="text-amber-400 text-sm font-medium">Oil immersion required</p>
						<p class="text-gray-400 text-xs mt-1">Apply immersion oil for 100x</p>
					</div>
				</div>
			{/if}

			<!-- Focus indicator overlay -->
			{#if clarity < 50 && sample && labState.isLightOn && !needsOil}
				<div class="absolute bottom-4 left-1/2 -translate-x-1/2">
					<div class="glass px-3 py-1.5 rounded-lg border border-amber-500/30">
						<span class="text-amber-400 text-xs">Adjust focus for clearer image</span>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Crosshairs -->
	<div class="absolute inset-0 pointer-events-none">
		<div class="absolute top-1/2 left-[25px] right-[25px] h-px bg-emerald-500/20"></div>
		<div class="absolute left-1/2 top-[25px] bottom-[25px] w-px bg-emerald-500/20"></div>
	</div>

	<!-- Magnification indicator -->
	<div class="absolute -top-2 left-1/2 -translate-x-1/2">
		<div class="glass px-3 py-1 rounded-full border border-white/10 text-xs font-mono text-emerald-400">
			{labState.magnification}x
		</div>
	</div>

	<!-- Clarity indicator -->
	<div class="absolute -bottom-2 left-1/2 -translate-x-1/2">
		<div class="glass px-3 py-1 rounded-full border border-white/10 text-xs">
			<span class="text-gray-400">Clarity:</span>
			<span class="font-mono ml-1 {clarity > 70 ? 'text-emerald-400' : clarity > 40 ? 'text-amber-400' : 'text-rose-400'}">{clarity}%</span>
		</div>
	</div>
</div>

<!-- Structure info tooltip -->
{#if hoveredStructure || selectedStructure}
	{@const structure = selectedStructure || hoveredStructure}
	<div class="mt-4 glass rounded-xl p-4 border border-emerald-500/20 animate-fade-in-up">
		<div class="flex items-start gap-3">
			<div
				class="w-4 h-4 rounded-full flex-shrink-0 mt-0.5"
				style="background: {structure?.color};"
			></div>
			<div>
				<h4 class="font-display font-semibold text-white flex items-center gap-2">
					{structure?.name}
					{#if labState.identifiedStructures.includes(structure?.id || '')}
						<span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
							Identified
						</span>
					{/if}
				</h4>
				<p class="text-sm text-gray-400 mt-1">{structure?.description}</p>
			</div>
		</div>
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
		animation: fade-in-up 0.2s ease-out;
	}
</style>
