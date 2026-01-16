<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { labStore } from '$lib/stores/lab';
	import { aiStore } from '$lib/stores/ai';
	import CompoundingWorkbench from '$lib/components/lab/pharmacy/CompoundingWorkbench.svelte';
	import CompoundingControls from '$lib/components/lab/pharmacy/CompoundingControls.svelte';
	import SafetyBanner from '$lib/components/lab/SafetyBanner.svelte';
	import LabTimer from '$lib/components/lab/LabTimer.svelte';
	import HintButton from '$lib/components/ai/HintButton.svelte';
	import ChatAssistant from '$lib/components/ai/ChatAssistant.svelte';
	import {
		createInitialState,
		selectRecipe,
		toggleBalance,
		tareBalance,
		addToBalance,
		confirmWeight,
		addToMortar,
		mix,
		wearPPE,
		removePPE,
		addObservation,
		finalizeCompound,
		analyzeCompounding,
		getRecipe,
		type CompoundingState
	} from '$lib/simulations/pharmacy/compounding';

	let { data } = $props();

	// Lab state
	let state = $state<CompoundingState>(createInitialState({ defaultRecipeId: null }));
	let isLabStarted = $state(false);
	let isLabComplete = $state(false);
	let showResults = $state(false);

	// Derived state
	let analysis = $derived(analyzeCompounding(state));
	let currentRecipe = $derived(state.currentRecipeId ? getRecipe(state.currentRecipeId) : null);
	let progress = $derived(() => {
		if (!currentRecipe) return 0;
		const weighedCount = state.selectedIngredients.filter((s) => s.isWeighed).length;
		const totalIngredients = currentRecipe.ingredients.length;
		const mixingComplete = state.mixingProgress >= 100 ? 1 : 0;

		return Math.round(((weighedCount / totalIngredients) * 70 + mixingComplete * 30));
	});

	// Start the lab session
	function startLab() {
		isLabStarted = true;
		labStore.startSession('compounding', 'pharmacy');
		aiStore.setContext({
			labType: 'compounding',
			discipline: 'pharmacy',
			currentStep: 'recipe-selection',
			objectives: [
				'Select and prepare a pharmaceutical formulation',
				'Practice accurate weighing techniques',
				'Learn proper compounding procedures'
			]
		});
	}

	// Event handlers
	function handleSelectRecipe(recipeId: string) {
		state = selectRecipe(state, recipeId);
		labStore.addAction('select-recipe', { recipeId });
		aiStore.setContext({
			...aiStore.context,
			currentStep: 'weighing',
			recipe: recipeId
		});
	}

	function handleToggleBalance() {
		state = toggleBalance(state);
	}

	function handleTareBalance() {
		state = tareBalance(state);
	}

	function handleAddToBalance(ingredientId: string, amount: number) {
		state = addToBalance(state, ingredientId, amount);
	}

	function handleConfirmWeight(ingredientId: string) {
		state = confirmWeight(state, ingredientId);
		labStore.addAction('weigh-ingredient', { ingredientId });
	}

	function handleAddToMortar(ingredientId: string) {
		state = addToMortar(state, ingredientId);
		labStore.addAction('add-to-mortar', { ingredientId });

		if (state.mortarContents.length === currentRecipe?.ingredients.length) {
			aiStore.setContext({
				...aiStore.context,
				currentStep: 'mixing'
			});
		}
	}

	function handleMix(duration: number) {
		state = mix(state, duration);
		if (state.mixingProgress >= 100) {
			aiStore.setContext({
				...aiStore.context,
				currentStep: 'packaging'
			});
		}
	}

	function handleWearPPE(ppeId: string) {
		state = wearPPE(state, ppeId);
	}

	function handleRemovePPE(ppeId: string) {
		state = removePPE(state, ppeId);
	}

	function handleAddObservation(observation: string) {
		state = addObservation(state, observation);
	}

	function completeLab() {
		state = finalizeCompound(state);
		isLabComplete = true;
		showResults = true;
		labStore.endSession({
			score: analysis.score,
			recipe: state.currentRecipeId,
			quality: state.finalProduct?.quality
		});
	}

	function resetLab() {
		state = createInitialState({ defaultRecipeId: null });
		isLabComplete = false;
		showResults = false;
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
	<title>Drug Compounding Lab | AfriLab</title>
</svelte:head>

<div class="min-h-screen bg-gray-950 text-white">
	<!-- Safety Banner -->
	<SafetyBanner
		labType="pharmacy"
		rules={[
			'Always wear appropriate PPE before handling any ingredients',
			'Verify all calculations before weighing',
			'Use proper aseptic technique to prevent contamination',
			'Label all containers with drug name, strength, and date',
			'Report any spills or errors immediately'
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
						<h1 class="text-lg font-display font-bold text-white">Drug Compounding Lab</h1>
						<p class="text-xs text-gray-400">Pharmacy - Pharmaceutical Compounding</p>
					</div>
				</div>

				<div class="flex items-center gap-4">
					{#if isLabStarted}
						<LabTimer />
					{/if}
					<HintButton context="compounding" />
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
						class="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-6"
					>
						<span class="text-4xl">💊</span>
					</div>

					<h2 class="text-2xl font-display font-bold text-white mb-3">
						Welcome to the Drug Compounding Lab
					</h2>

					<p class="text-gray-400 mb-6">
						In this virtual lab, you'll learn to prepare pharmaceutical compounds using proper
						techniques, accurate measurements, and safety protocols.
					</p>

					<div class="grid grid-cols-2 gap-4 mb-8 text-left">
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-rose-400">1.</span> Select Formula
							</h3>
							<p class="text-sm text-gray-400">
								Choose a recipe and review the required ingredients and procedures.
							</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-rose-400">2.</span> Weigh Accurately
							</h3>
							<p class="text-sm text-gray-400">
								Use the analytical balance to weigh each ingredient precisely.
							</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-rose-400">3.</span> Compound
							</h3>
							<p class="text-sm text-gray-400">
								Mix ingredients using trituration and levigation techniques.
							</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-rose-400">4.</span> Package & Label
							</h3>
							<p class="text-sm text-gray-400">
								Transfer to appropriate container with proper labeling.
							</p>
						</div>
					</div>

					<button
						onclick={startLab}
						class="px-8 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold
							hover:shadow-lg hover:shadow-rose-500/25 transition-all transform hover:scale-105"
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

					<!-- Product quality -->
					{#if state.finalProduct}
						<div class="mb-6 p-4 rounded-xl {state.finalProduct.quality === 'excellent'
							? 'bg-emerald-500/10 border border-emerald-500/30'
							: state.finalProduct.quality === 'acceptable'
								? 'bg-cyan-500/10 border border-cyan-500/30'
								: 'bg-amber-500/10 border border-amber-500/30'}">
							<div class="flex items-center justify-between">
								<span class="text-sm text-gray-300">Product Quality:</span>
								<span class="text-sm font-medium capitalize {state.finalProduct.quality === 'excellent' ? 'text-emerald-400' : state.finalProduct.quality === 'acceptable' ? 'text-cyan-400' : 'text-amber-400'}">
									{state.finalProduct.quality}
								</span>
							</div>
							<div class="flex items-center justify-between mt-2">
								<span class="text-sm text-gray-300">Beyond Use Date:</span>
								<span class="text-sm font-mono text-gray-400">{state.finalProduct.beyondUseDate}</span>
							</div>
						</div>
					{/if}

					<!-- Stats -->
					<div class="grid grid-cols-3 gap-4 mb-8">
						<div class="glass rounded-xl p-4 text-center border border-white/10">
							<div class="text-2xl font-bold text-rose-400">{analysis.weighingAccuracy.toFixed(0)}%</div>
							<div class="text-xs text-gray-400">Weighing Accuracy</div>
						</div>
						<div class="glass rounded-xl p-4 text-center border border-white/10">
							<div class="text-2xl font-bold text-pink-400">{analysis.techniqueScore.toFixed(0)}%</div>
							<div class="text-xs text-gray-400">Technique</div>
						</div>
						<div class="glass rounded-xl p-4 text-center border border-white/10">
							<div class="text-2xl font-bold text-emerald-400">{analysis.safetyScore.toFixed(0)}%</div>
							<div class="text-xs text-gray-400">Safety</div>
						</div>
					</div>

					<!-- Feedback -->
					<div class="glass rounded-xl p-4 border border-white/10 mb-6">
						<h3 class="font-semibold text-white mb-2">Feedback</h3>
						<p class="text-sm text-gray-400">{analysis.feedback}</p>
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
							class="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500
								text-white font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all"
						>
							Back to Labs
						</button>
					</div>
				</div>
			</div>
		{:else}
			<!-- Active lab -->
			<div class="grid lg:grid-cols-[1fr,360px] gap-6">
				<!-- Main workbench area -->
				<div class="space-y-6">
					<CompoundingWorkbench labState={state} onMix={handleMix} />

					<!-- Progress bar -->
					{#if currentRecipe}
						<div class="glass rounded-xl p-4 border border-white/10">
							<div class="flex items-center justify-between mb-2">
								<span class="text-sm text-gray-400">Compounding Progress</span>
								<span class="text-sm font-mono text-rose-400">{progress()}%</span>
							</div>
							<div class="h-2 bg-gray-800 rounded-full overflow-hidden">
								<div
									class="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500"
									style="width: {progress()}%"
								></div>
							</div>
							<div class="flex justify-between mt-2 text-xs text-gray-500">
								<span>
									{state.selectedIngredients.filter((s) => s.isWeighed).length} / {currentRecipe.ingredients.length} weighed
								</span>
								{#if state.mixingProgress >= 100}
									<span class="text-emerald-400">Ready to package!</span>
								{:else if state.mortarContents.length === currentRecipe.ingredients.length}
									<span class="text-amber-400">Mix until homogeneous</span>
								{/if}
							</div>
						</div>
					{/if}

					<!-- Recipe steps -->
					{#if currentRecipe}
						<div class="glass rounded-xl p-4 border border-white/10">
							<h4 class="text-sm font-display font-semibold text-white mb-3">Procedure Steps</h4>
							<div class="space-y-2">
								{#each currentRecipe.steps as step, i (step.id)}
									{@const isComplete = i === 0 ? state.selectedIngredients.length > 0 :
										i === currentRecipe.steps.length - 1 ? state.mixingProgress >= 100 :
										state.mortarContents.length >= i}
									<div class="flex items-start gap-3 p-2 rounded-lg {isComplete ? 'bg-emerald-500/10' : ''}">
										<div class="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center
											{isComplete ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}">
											{#if isComplete}
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
												</svg>
											{:else}
												<span class="text-xs">{i + 1}</span>
											{/if}
										</div>
										<div>
											<p class="text-sm {isComplete ? 'text-emerald-400' : 'text-gray-300'}">{step.instruction}</p>
											<p class="text-xs text-gray-500 mt-0.5">Technique: {step.technique}</p>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<!-- Control panel -->
				<div class="space-y-4">
					<CompoundingControls
						labState={state}
						onSelectRecipe={handleSelectRecipe}
						onToggleBalance={handleToggleBalance}
						onTareBalance={handleTareBalance}
						onAddToBalance={handleAddToBalance}
						onConfirmWeight={handleConfirmWeight}
						onAddToMortar={handleAddToMortar}
						onWearPPE={handleWearPPE}
						onRemovePPE={handleRemovePPE}
						onAddObservation={handleAddObservation}
					/>

					<!-- Complete lab button -->
					{#if state.mixingProgress >= 100}
						<button
							onclick={completeLab}
							class="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500
								text-white font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all"
						>
							Finalize Compound
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</main>

	<!-- AI Chat Assistant -->
	<ChatAssistant />
</div>
