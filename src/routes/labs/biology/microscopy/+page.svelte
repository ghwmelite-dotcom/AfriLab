<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { labStore } from '$lib/stores/lab';
	import { aiStore } from '$lib/stores/ai';
	import MicroscopeView from '$lib/components/lab/biology/MicroscopeView.svelte';
	import MicroscopeControls from '$lib/components/lab/biology/MicroscopeControls.svelte';
	import SampleSelector from '$lib/components/lab/biology/SampleSelector.svelte';
	import SafetyBanner from '$lib/components/lab/SafetyBanner.svelte';
	import LabTimer from '$lib/components/lab/LabTimer.svelte';
	import HintButton from '$lib/components/ai/HintButton.svelte';
	import ChatAssistant from '$lib/components/ai/ChatAssistant.svelte';
	import {
		createInitialState,
		setSample,
		adjustCoarseFocus,
		adjustFineFocus,
		setMagnification,
		moveStage,
		toggleLight,
		setLightIntensity,
		applyOil,
		identifyStructure,
		addObservation,
		analyzeMicroscopy,
		CELL_SAMPLES,
		type MicroscopyState
	} from '$lib/simulations/biology/microscopy';

	let { data } = $props();

	// Lab state
	let state = $state<MicroscopyState>(createInitialState({ defaultSampleId: null }));
	let isLabStarted = $state(false);
	let isLabComplete = $state(false);
	let showResults = $state(false);
	let observationInput = $state('');
	let activeTab = $state<'controls' | 'samples' | 'observations'>('samples');

	// Derived state
	let currentSample = $derived(CELL_SAMPLES.find((s) => s.id === state.currentSampleId));
	let analysis = $derived(analyzeMicroscopy(state));
	let identificationProgress = $derived(() => {
		if (!currentSample) return 0;
		const identified = state.identifiedStructures.filter((id) =>
			currentSample.structures.some((s) => s.id === id)
		).length;
		return Math.round((identified / currentSample.structures.length) * 100);
	});

	// Start the lab session
	function startLab() {
		isLabStarted = true;
		labStore.startSession('microscopy', 'biology');
		aiStore.setContext({
			labType: 'microscopy',
			discipline: 'biology',
			currentStep: 'sample-selection',
			objectives: [
				'Learn proper microscope operation techniques',
				'Identify cell structures at various magnifications',
				'Document observations accurately'
			]
		});
	}

	// Event handlers
	function handleSelectSample(sampleId: string) {
		state = setSample(state, sampleId);
		activeTab = 'controls';
		aiStore.setContext({
			...aiStore.context,
			currentStep: 'focusing',
			sampleLoaded: sampleId
		});
	}

	function handleCoarseFocus(delta: number) {
		state = adjustCoarseFocus(state, delta);
	}

	function handleFineFocus(delta: number) {
		state = adjustFineFocus(state, delta);
	}

	function handleMagnification(power: number) {
		state = setMagnification(state, power);
		if (power >= 1000 && !state.oilApplied) {
			aiStore.setContext({
				...aiStore.context,
				currentStep: 'oil-immersion-required'
			});
		}
	}

	function handleStageMove(dx: number, dy: number) {
		state = moveStage(state, dx, dy);
	}

	function handleLightToggle() {
		state = toggleLight(state);
	}

	function handleLightIntensity(intensity: number) {
		state = setLightIntensity(state, intensity);
	}

	function handleApplyOil() {
		state = applyOil(state);
		aiStore.setContext({
			...aiStore.context,
			currentStep: 'observing-100x'
		});
	}

	function handleIdentifyStructure(structureId: string) {
		state = identifyStructure(state, structureId);
		labStore.addAction('identify-structure', { structureId });

		// Check if all structures identified for current sample
		if (currentSample) {
			const allIdentified = currentSample.structures.every((s) =>
				state.identifiedStructures.includes(s.id)
			);
			if (allIdentified) {
				aiStore.setContext({
					...aiStore.context,
					currentStep: 'sample-complete'
				});
			}
		}
	}

	function handleAddObservation() {
		if (observationInput.trim()) {
			state = addObservation(state, observationInput.trim(), state.magnification);
			observationInput = '';
			labStore.addAction('add-observation', { observation: observationInput });
		}
	}

	function completeLab() {
		isLabComplete = true;
		showResults = true;
		labStore.endSession({
			score: analysis.score,
			identifiedCount: state.identifiedStructures.length,
			observationCount: state.observations.length
		});
	}

	function resetLab() {
		state = createInitialState({ defaultSampleId: null });
		isLabComplete = false;
		showResults = false;
		activeTab = 'samples';
	}

	onMount(() => {
		return () => {
			if (isLabStarted && !isLabComplete) {
				labStore.endSession({ abandoned: true });
			}
		};
	});
</script>

<svelte:head>
	<title>Cell Microscopy Lab | AfriLab</title>
</svelte:head>

<div class="min-h-screen bg-gray-950 text-white">
	<!-- Safety Banner -->
	<SafetyBanner
		labType="biology"
		rules={[
			'Handle microscope slides carefully - they are fragile',
			'Always start with the lowest magnification objective',
			'Never force the focus knobs',
			'Clean lenses only with proper lens paper',
			'Apply immersion oil only when using 100x objective'
		]}
	/>

	<!-- Header -->
	<header class="border-b border-white/10 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-40">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<div class="flex items-center gap-4">
					<button
						onclick={() => goto('/dashboard/labs')}
						class="p-2 rounded-lg glass border border-white/10 hover:border-white/20 transition-colors"
						aria-label="Back to labs"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							/>
						</svg>
					</button>

					<div>
						<h1 class="text-lg font-display font-bold text-white">Cell Microscopy Lab</h1>
						<p class="text-xs text-gray-400">Biology - Microscope Operation</p>
					</div>
				</div>

				<div class="flex items-center gap-4">
					{#if isLabStarted}
						<LabTimer />
					{/if}
					<HintButton context="microscopy" />
				</div>
			</div>
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if !isLabStarted}
			<!-- Pre-lab introduction -->
			<div class="max-w-2xl mx-auto">
				<div class="glass-strong rounded-2xl p-8 border border-white/10 text-center">
					<div
						class="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mb-6"
					>
						<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
							/>
						</svg>
					</div>

					<h2 class="text-2xl font-display font-bold text-white mb-3">
						Welcome to the Cell Microscopy Lab
					</h2>

					<p class="text-gray-400 mb-6">
						In this virtual lab, you'll learn to operate a compound light microscope and identify
						cellular structures in various biological samples.
					</p>

					<div class="grid grid-cols-2 gap-4 mb-8 text-left">
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-emerald-400">1.</span> Select a Sample
							</h3>
							<p class="text-sm text-gray-400">
								Choose from various cell samples including plant, animal, and bacterial cells.
							</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-emerald-400">2.</span> Adjust Focus
							</h3>
							<p class="text-sm text-gray-400">
								Use coarse and fine focus knobs to bring the specimen into sharp focus.
							</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-emerald-400">3.</span> Identify Structures
							</h3>
							<p class="text-sm text-gray-400">
								Click on visible structures to identify and learn about cell organelles.
							</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-emerald-400">4.</span> Document Findings
							</h3>
							<p class="text-sm text-gray-400">
								Record your observations at different magnification levels.
							</p>
						</div>
					</div>

					<button
						onclick={startLab}
						class="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold
							hover:shadow-lg hover:shadow-emerald-500/25 transition-all transform hover:scale-105"
					>
						Begin Lab Session
					</button>
				</div>
			</div>
		{:else if showResults}
			<!-- Results screen -->
			<div class="max-w-2xl mx-auto">
				<div class="glass-strong rounded-2xl p-8 border border-white/10">
					<div class="text-center mb-8">
						<div
							class="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4
							{analysis.grade === 'A'
								? 'bg-emerald-500/20 text-emerald-400'
								: analysis.grade === 'B'
									? 'bg-cyan-500/20 text-cyan-400'
									: analysis.grade === 'C'
										? 'bg-amber-500/20 text-amber-400'
										: 'bg-rose-500/20 text-rose-400'}"
						>
							<span class="text-4xl font-display font-bold">{analysis.grade}</span>
						</div>
						<h2 class="text-2xl font-display font-bold text-white">Lab Complete!</h2>
						<p class="text-gray-400 mt-2">Score: {analysis.score}/100</p>
					</div>

					<!-- Stats -->
					<div class="grid grid-cols-3 gap-4 mb-8">
						<div class="glass rounded-xl p-4 text-center border border-white/10">
							<div class="text-2xl font-bold text-emerald-400">
								{state.identifiedStructures.length}
							</div>
							<div class="text-xs text-gray-400">Structures Identified</div>
						</div>
						<div class="glass rounded-xl p-4 text-center border border-white/10">
							<div class="text-2xl font-bold text-cyan-400">{state.observations.length}</div>
							<div class="text-xs text-gray-400">Observations Made</div>
						</div>
						<div class="glass rounded-xl p-4 text-center border border-white/10">
							<div class="text-2xl font-bold text-purple-400">
								{analysis.techniqueFeedback.length > 50 ? 'Good' : 'Excellent'}
							</div>
							<div class="text-xs text-gray-400">Technique</div>
						</div>
					</div>

					<!-- Feedback -->
					<div class="glass rounded-xl p-4 border border-white/10 mb-6">
						<h3 class="font-semibold text-white mb-2">Feedback</h3>
						<p class="text-sm text-gray-400">{analysis.techniqueFeedback}</p>
					</div>

					<!-- Actions -->
					<div class="flex gap-4">
						<button
							onclick={resetLab}
							class="flex-1 py-3 px-6 rounded-xl glass border border-white/10 hover:border-white/20
								text-white font-medium transition-all"
						>
							Try Again
						</button>
						<button
							onclick={() => goto('/dashboard/labs')}
							class="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500
								text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
						>
							Back to Labs
						</button>
					</div>
				</div>
			</div>
		{:else}
			<!-- Active lab -->
			<div class="grid lg:grid-cols-[1fr,360px] gap-6">
				<!-- Main microscope view -->
				<div class="space-y-6">
					<MicroscopeView labState={state} onIdentifyStructure={handleIdentifyStructure} />

					<!-- Progress bar -->
					{#if currentSample}
						<div class="glass rounded-xl p-4 border border-white/10">
							<div class="flex items-center justify-between mb-2">
								<span class="text-sm text-gray-400">Identification Progress</span>
								<span class="text-sm font-mono text-emerald-400">{identificationProgress()}%</span>
							</div>
							<div class="h-2 bg-gray-800 rounded-full overflow-hidden">
								<div
									class="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
									style="width: {identificationProgress()}%"
								></div>
							</div>
							<div class="flex justify-between mt-2 text-xs text-gray-500">
								<span>
									{state.identifiedStructures.filter((id) =>
										currentSample.structures.some((s) => s.id === id)
									).length} / {currentSample.structures.length} structures
								</span>
								{#if identificationProgress() === 100}
									<span class="text-emerald-400">All structures identified!</span>
								{/if}
							</div>
						</div>
					{/if}

					<!-- Observation input -->
					<div class="glass rounded-xl p-4 border border-white/10">
						<label for="observation-input" class="block text-sm font-medium text-gray-300 mb-2"> Record Observation </label>
						<div class="flex gap-2">
							<input
								id="observation-input"
								type="text"
								bind:value={observationInput}
								placeholder="Describe what you see at {state.magnification}x magnification..."
								class="flex-1 px-4 py-2 rounded-lg glass border border-white/10 text-white
									placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50"
								onkeydown={(e) => e.key === 'Enter' && handleAddObservation()}
							/>
							<button
								onclick={handleAddObservation}
								disabled={!observationInput.trim()}
								class="px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium
									hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								Add
							</button>
						</div>

						{#if state.observations.length > 0}
							<div class="mt-4 space-y-2 max-h-40 overflow-y-auto">
								{#each state.observations as obs}
									<div class="flex items-start gap-2 text-sm">
										<span class="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">
											{obs.magnification}x
										</span>
										<span class="text-gray-300">{obs.text}</span>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>

				<!-- Control panel -->
				<div class="space-y-4">
					<!-- Tab navigation -->
					<div class="glass rounded-xl p-1 border border-white/10 flex">
						{#each [
							{ id: 'samples', label: 'Samples' },
							{ id: 'controls', label: 'Controls' },
							{ id: 'observations', label: 'Notes' }
						] as tab (tab.id)}
							<button
								onclick={() => (activeTab = tab.id as typeof activeTab)}
								class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
									{activeTab === tab.id
									? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white'
									: 'text-gray-400 hover:text-white'}"
							>
								{tab.label}
							</button>
						{/each}
					</div>

					<!-- Tab content -->
					{#if activeTab === 'samples'}
						<SampleSelector
							currentSampleId={state.currentSampleId}
							onSelectSample={handleSelectSample}
						/>
					{:else if activeTab === 'controls'}
						<MicroscopeControls
							{state}
							onCoarseFocus={handleCoarseFocus}
							onFineFocus={handleFineFocus}
							onMagnification={handleMagnification}
							onStageMove={handleStageMove}
							onLightToggle={handleLightToggle}
							onLightIntensity={handleLightIntensity}
							onApplyOil={handleApplyOil}
						/>
					{:else if activeTab === 'observations'}
						<div class="glass-strong rounded-xl p-4 border border-white/10 space-y-4">
							<h4 class="text-sm font-display font-semibold text-white">Lab Notebook</h4>

							{#if state.observations.length === 0}
								<p class="text-sm text-gray-500 text-center py-8">
									No observations recorded yet. Use the input below the microscope to add notes.
								</p>
							{:else}
								<div class="space-y-3 max-h-[400px] overflow-y-auto">
									{#each state.observations as obs, i}
										<div class="glass rounded-lg p-3 border border-white/5">
											<div class="flex items-center justify-between mb-1">
												<span class="text-xs text-gray-500">Observation #{i + 1}</span>
												<span
													class="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono"
												>
													{obs.magnification}x
												</span>
											</div>
											<p class="text-sm text-gray-300">{obs.text}</p>
										</div>
									{/each}
								</div>
							{/if}

							<!-- Identified structures -->
							{#if state.identifiedStructures.length > 0}
								<div class="pt-4 border-t border-white/10">
									<h5 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
										Identified Structures
									</h5>
									<div class="flex flex-wrap gap-1.5">
										{#each state.identifiedStructures as structureId}
											{@const structure = CELL_SAMPLES.flatMap((s) => s.structures).find(
												(s) => s.id === structureId
											)}
											{#if structure}
												<span
													class="text-xs px-2 py-1 rounded-lg border"
													style="background: {structure.color}20; border-color: {structure.color}40; color: {structure.color};"
												>
													{structure.name}
												</span>
											{/if}
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/if}

					<!-- Complete lab button -->
					{#if state.identifiedStructures.length > 0}
						<button
							onclick={completeLab}
							class="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500
								text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
						>
							Complete Lab
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</main>

	<!-- AI Chat Assistant -->
	<ChatAssistant />
</div>
