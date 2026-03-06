<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { labStore } from '$stores/lab';
	import { aiStore } from '$stores/ai';
	import SafetyBanner from '$components/lab/SafetyBanner.svelte';
	import HintButton from '$components/ai/HintButton.svelte';
	import ChatAssistant from '$components/ai/ChatAssistant.svelte';
	import {
		createInitialState,
		selectScenario,
		submitAnswer,
		answerQuiz,
		analyzeDosageCalculations,
		getCorrectAnswers,
		calculateCrCl,
		DOSAGE_QUIZ,
		type DosageState,
		type PatientScenario
	} from '$lib/simulations/pharmacy/dosage-calculations';

	// Lab state
	let state = $state<DosageState>(createInitialState({ difficulty: 'advanced' }));
	let isLabStarted = $state(false);
	let showResults = $state(false);

	// Form inputs per scenario
	let doseInput = $state('');
	let volumeInput = $state('');
	let rateInput = $state('');
	let crClInput = $state('');
	let renalAdjusted = $state(false);

	// Derived
	let analysis = $derived(analyzeDosageCalculations(state));
	let currentScenario = $derived(state.scenarios[state.currentScenarioIndex]);
	let currentAnswer = $derived(state.answers.find((a) => a.scenarioId === currentScenario?.id));
	let progress = $derived(
		state.scenarios.length > 0
			? Math.round((state.completedScenarios.length / state.scenarios.length) * 100)
			: 0
	);

	function startLab() {
		isLabStarted = true;
		aiStore.setContext({
			labType: 'dosage-calculations',
			discipline: 'pharmacy',
			currentStep: 'scenario-review',
			objectives: [
				'Calculate weight-based and BSA-based drug doses',
				'Perform creatinine clearance calculations',
				'Determine IV drip rates',
				'Apply renal dose adjustments'
			]
		});
	}

	function handleSelectScenario(index: number) {
		state = selectScenario(state, index);
		// Load existing answer if any
		const existing = state.answers.find((a) => a.scenarioId === state.scenarios[index].id);
		if (existing) {
			doseInput = existing.calculatedDose?.toString() || '';
			volumeInput = existing.calculatedVolume?.toString() || '';
			rateInput = existing.calculatedRate?.toString() || '';
			crClInput = existing.creatinineClearance?.toString() || '';
			renalAdjusted = existing.isRenalAdjusted;
		} else {
			doseInput = '';
			volumeInput = '';
			rateInput = '';
			crClInput = '';
			renalAdjusted = false;
		}
	}

	function handleSubmitAnswer() {
		if (!currentScenario) return;
		state = submitAnswer(state, currentScenario.id, {
			calculatedDose: doseInput ? parseFloat(doseInput) : null,
			calculatedVolume: volumeInput ? parseFloat(volumeInput) : null,
			calculatedRate: rateInput ? parseFloat(rateInput) : null,
			creatinineClearance: crClInput ? parseFloat(crClInput) : null,
			isRenalAdjusted: renalAdjusted
		});
		labStore.addAction('submit-dosage', { scenarioId: currentScenario.id });
	}

	function handleQuizAnswer(questionId: string, answer: string) {
		state = answerQuiz(state, questionId, answer);
	}

	function completeLab() {
		showResults = true;
	}

	function resetLab() {
		state = createInitialState({ difficulty: 'advanced' });
		isLabStarted = false;
		showResults = false;
		doseInput = '';
		volumeInput = '';
		rateInput = '';
		crClInput = '';
		renalAdjusted = false;
	}

	onMount(() => {
		return () => {};
	});
</script>

<svelte:head>
	<title>Dosage Calculations Lab | AfriLab</title>
</svelte:head>

<div class="min-h-screen bg-gray-950 text-white">
	<SafetyBanner
		level="warning"
		message="Always double-check dosage calculations before administration. Verify units, decimal placement, and patient-specific factors. Errors in dosage calculations can lead to serious patient harm."
	/>

	<!-- Header -->
	<header class="border-b border-white/10 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-40">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<div class="flex items-center gap-4">
					<button
						onclick={() => goto('/labs/pharmacy')}
						class="p-2 rounded-lg glass border border-white/10 hover:border-white/20 transition-colors"
						aria-label="Back to pharmacy labs"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
					</button>
					<div>
						<h1 class="text-lg font-display font-bold text-white">Dosage Calculations Lab</h1>
						<p class="text-xs text-gray-400">Pharmacy - Clinical Dosing</p>
					</div>
				</div>
				<div class="flex items-center gap-4">
					<HintButton context="dosage-calculations" />
				</div>
			</div>
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if !isLabStarted}
			<!-- Pre-lab introduction -->
			<div class="max-w-2xl mx-auto">
				<div class="glass-strong rounded-2xl p-8 border border-white/10 text-center">
					<div class="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-6">
						<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
						</svg>
					</div>

					<h2 class="text-2xl font-display font-bold text-white mb-3">
						Welcome to the Dosage Calculations Lab
					</h2>
					<p class="text-gray-400 mb-6">
						Practice calculating drug doses for diverse patient populations including pediatric,
						adult, and geriatric patients. Apply weight-based dosing, BSA-based dosing,
						creatinine clearance estimation, and IV drip rate calculations.
					</p>

					<div class="grid grid-cols-2 gap-4 mb-8 text-left">
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-rose-400">1.</span> Review Patient
							</h3>
							<p class="text-sm text-gray-400">Assess the patient scenario and drug order details.</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-rose-400">2.</span> Calculate Dose
							</h3>
							<p class="text-sm text-gray-400">Apply mg/kg or mg/m&sup2; formulas with renal adjustments.</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-rose-400">3.</span> Convert Units
							</h3>
							<p class="text-sm text-gray-400">Calculate volume to administer and IV rates.</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-rose-400">4.</span> Verify & Submit
							</h3>
							<p class="text-sm text-gray-400">Double-check your work and submit calculations.</p>
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
			<div class="max-w-3xl mx-auto">
				<div class="glass-strong rounded-2xl p-8 border border-white/10">
					<div class="text-center mb-8">
						<div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4
							{analysis.grade === 'A' ? 'bg-emerald-500/20 text-emerald-400'
							: analysis.grade === 'B' ? 'bg-cyan-500/20 text-cyan-400'
							: analysis.grade === 'C' ? 'bg-amber-500/20 text-amber-400'
							: 'bg-rose-500/20 text-rose-400'}">
							<span class="text-4xl font-display font-bold">{analysis.grade}</span>
						</div>
						<h2 class="text-2xl font-display font-bold text-white">Lab Complete!</h2>
						<p class="text-gray-400 mt-2">Score: {analysis.score}/100</p>
					</div>

					<!-- Scenario breakdown -->
					<div class="space-y-3 mb-6">
						{#each analysis.scenarioResults as result}
							<div class="glass rounded-xl p-4 border border-white/10">
								<div class="flex items-center justify-between mb-2">
									<span class="text-sm font-medium text-white">{result.patientName} - {result.drugName}</span>
									<span class="text-sm font-mono {result.overallAccuracy >= 90 ? 'text-emerald-400' : result.overallAccuracy >= 70 ? 'text-amber-400' : 'text-rose-400'}">
										{result.overallAccuracy.toFixed(0)}%
									</span>
								</div>
								<div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
									<div
										class="h-full rounded-full transition-all {result.overallAccuracy >= 90 ? 'bg-emerald-500' : result.overallAccuracy >= 70 ? 'bg-amber-500' : 'bg-rose-500'}"
										style="width: {result.overallAccuracy}%"
									></div>
								</div>
							</div>
						{/each}
					</div>

					<!-- Quiz score -->
					<div class="glass rounded-xl p-4 border border-white/10 mb-6">
						<div class="flex items-center justify-between">
							<span class="text-sm text-gray-300">Quiz Score</span>
							<span class="text-sm font-mono text-rose-400">{analysis.quizScore.correct}/{analysis.quizScore.total}</span>
						</div>
					</div>

					<!-- Feedback -->
					<div class="glass rounded-xl p-4 border border-white/10 mb-6">
						<h3 class="font-semibold text-white mb-2">Feedback</h3>
						<p class="text-sm text-gray-400">{analysis.feedback}</p>
					</div>

					<div class="flex gap-4">
						<button onclick={resetLab}
							class="flex-1 py-3 px-6 rounded-xl glass border border-white/10 hover:border-white/20 text-white font-medium transition-all">
							Try Again
						</button>
						<button onclick={() => goto('/labs/pharmacy')}
							class="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all">
							Back to Pharmacy
						</button>
					</div>
				</div>
			</div>
		{:else}
			<!-- Active lab -->
			<div class="grid lg:grid-cols-[1fr,400px] gap-6">
				<!-- Main area -->
				<div class="space-y-6">
					<!-- Scenario selector tabs -->
					<div class="flex gap-2 overflow-x-auto pb-2">
						{#each state.scenarios as scenario, i}
							{@const isCompleted = state.completedScenarios.includes(scenario.id)}
							<button
								onclick={() => handleSelectScenario(i)}
								class="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all
									{state.currentScenarioIndex === i
									? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/25'
									: isCompleted
										? 'glass border border-emerald-500/30 text-emerald-400'
										: 'glass border border-white/10 text-gray-400 hover:border-white/20'}"
							>
								{#if isCompleted}
									<svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
								{/if}
								{scenario.name}
							</button>
						{/each}
					</div>

					{#if currentScenario}
						<!-- Patient card -->
						<div class="glass-strong rounded-2xl p-6 border border-white/10">
							<div class="flex items-start gap-4 mb-4">
								<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
									<svg class="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
								</div>
								<div>
									<h3 class="text-lg font-display font-bold text-white">{currentScenario.name}</h3>
									<span class="text-xs px-2 py-0.5 rounded-full {currentScenario.category === 'pediatric' ? 'bg-cyan-500/20 text-cyan-400' : currentScenario.category === 'geriatric' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}">
										{currentScenario.category}
									</span>
								</div>
							</div>
							<p class="text-sm text-gray-400 mb-4">{currentScenario.description}</p>

							<!-- Patient vitals -->
							<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
								<div class="glass rounded-lg p-3 border border-white/5">
									<div class="text-xs text-gray-500">Age</div>
									<div class="text-lg font-bold text-white">{currentScenario.age} <span class="text-xs text-gray-400">yrs</span></div>
								</div>
								<div class="glass rounded-lg p-3 border border-white/5">
									<div class="text-xs text-gray-500">Weight</div>
									<div class="text-lg font-bold text-white">{currentScenario.weight} <span class="text-xs text-gray-400">kg</span></div>
								</div>
								<div class="glass rounded-lg p-3 border border-white/5">
									<div class="text-xs text-gray-500">Height</div>
									<div class="text-lg font-bold text-white">{currentScenario.height} <span class="text-xs text-gray-400">cm</span></div>
								</div>
								<div class="glass rounded-lg p-3 border border-white/5">
									<div class="text-xs text-gray-500">Sex</div>
									<div class="text-lg font-bold text-white capitalize">{currentScenario.sex}</div>
								</div>
							</div>

							<div class="grid grid-cols-2 gap-3">
								<div class="glass rounded-lg p-3 border border-white/5">
									<div class="text-xs text-gray-500">BSA</div>
									<div class="text-lg font-bold text-white">{currentScenario.bsa} <span class="text-xs text-gray-400">m&sup2;</span></div>
								</div>
								<div class="glass rounded-lg p-3 border border-white/5">
									<div class="text-xs text-gray-500">Serum Creatinine</div>
									<div class="text-lg font-bold text-white">{currentScenario.serumCreatinine} <span class="text-xs text-gray-400">mg/dL</span></div>
								</div>
							</div>
						</div>

						<!-- Drug Order -->
						<div class="glass-strong rounded-2xl p-6 border border-rose-500/20">
							<h4 class="text-sm font-display font-semibold text-rose-400 mb-3 flex items-center gap-2">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								Drug Order
							</h4>
							<div class="space-y-2 text-sm">
								<div class="flex justify-between">
									<span class="text-gray-400">Drug:</span>
									<span class="text-white font-medium">{currentScenario.drugOrder.drugName}</span>
								</div>
								{#if currentScenario.drugOrder.dosePerKg !== null}
									<div class="flex justify-between">
										<span class="text-gray-400">Ordered dose:</span>
										<span class="text-white font-medium">{currentScenario.drugOrder.dosePerKg < 1 ? (currentScenario.drugOrder.dosePerKg * 1000) + ' mcg/kg/min' : currentScenario.drugOrder.dosePerKg + ' mg/kg'}</span>
									</div>
								{/if}
								{#if currentScenario.drugOrder.dosePerBSA !== null}
									<div class="flex justify-between">
										<span class="text-gray-400">Ordered dose:</span>
										<span class="text-white font-medium">{currentScenario.drugOrder.dosePerBSA} mg/m&sup2;</span>
									</div>
								{/if}
								<div class="flex justify-between">
									<span class="text-gray-400">Max single dose:</span>
									<span class="text-white font-medium">{currentScenario.drugOrder.maxSingleDose} mg</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-400">Frequency:</span>
									<span class="text-white font-medium">{currentScenario.drugOrder.frequency}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-400">Route:</span>
									<span class="text-white font-medium uppercase">{currentScenario.drugOrder.route}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-400">Available concentration:</span>
									<span class="text-white font-medium">{currentScenario.drugOrder.concentration} {currentScenario.drugOrder.concentrationUnit}</span>
								</div>
								{#if currentScenario.drugOrder.requiresRenalAdjustment}
									<div class="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
										<span class="text-xs text-amber-400">Requires renal dose adjustment if CrCl &lt; {currentScenario.drugOrder.renalThreshold} mL/min</span>
									</div>
								{/if}
								{#if currentScenario.drugOrder.infusionDuration}
									<div class="flex justify-between">
										<span class="text-gray-400">Infusion duration:</span>
										<span class="text-white font-medium">{currentScenario.drugOrder.infusionDuration} min</span>
									</div>
								{/if}
							</div>
						</div>

						<!-- Inline SVG: Formula reference -->
						<div class="glass rounded-2xl p-5 border border-white/10">
							<h4 class="text-sm font-display font-semibold text-white mb-3">Formula Reference</h4>
							<div class="space-y-3 text-xs text-gray-400">
								<div class="glass rounded-lg p-3 border border-white/5">
									<div class="text-rose-400 font-semibold mb-1">Cockcroft-Gault (CrCl)</div>
									<div class="font-mono">CrCl = [(140 - age) x weight] / (72 x SCr)</div>
									<div class="font-mono text-gray-500">Female: multiply result by 0.85</div>
								</div>
								<div class="glass rounded-lg p-3 border border-white/5">
									<div class="text-rose-400 font-semibold mb-1">Weight-based dose</div>
									<div class="font-mono">Dose (mg) = weight (kg) x dose (mg/kg)</div>
								</div>
								<div class="glass rounded-lg p-3 border border-white/5">
									<div class="text-rose-400 font-semibold mb-1">BSA-based dose</div>
									<div class="font-mono">Dose (mg) = BSA (m&sup2;) x dose (mg/m&sup2;)</div>
								</div>
								<div class="glass rounded-lg p-3 border border-white/5">
									<div class="text-rose-400 font-semibold mb-1">Volume to administer</div>
									<div class="font-mono">Volume (mL) = Dose (mg) / Concentration (mg/mL)</div>
								</div>
								<div class="glass rounded-lg p-3 border border-white/5">
									<div class="text-rose-400 font-semibold mb-1">IV rate</div>
									<div class="font-mono">Rate (mL/hr) = Volume (mL) / Time (hr)</div>
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Right panel: Calculation inputs -->
				<div class="space-y-4">
					{#if currentScenario}
						<!-- Calculation form -->
						<div class="glass-strong rounded-2xl p-5 border border-white/10 sticky top-20">
							<h4 class="text-sm font-display font-semibold text-white mb-4">Your Calculations</h4>

							<div class="space-y-4">
								{#if currentScenario.drugOrder.requiresRenalAdjustment}
									<div>
										<label class="block text-xs text-gray-400 mb-1">Creatinine Clearance (mL/min)</label>
										<input
											type="number"
											step="0.1"
											bind:value={crClInput}
											placeholder="e.g., 65.4"
											class="w-full px-3 py-2 rounded-lg bg-gray-800/50 border border-white/10 text-white text-sm focus:border-rose-500/50 focus:outline-none"
										/>
									</div>
									<div>
										<label class="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
											<input
												type="checkbox"
												bind:checked={renalAdjusted}
												class="rounded border-white/20 bg-gray-800"
											/>
											Renal dose adjustment needed
										</label>
									</div>
								{/if}

								<div>
									<label class="block text-xs text-gray-400 mb-1">Calculated Dose (mg)</label>
									<input
										type="number"
										step="0.1"
										bind:value={doseInput}
										placeholder="e.g., 450"
										class="w-full px-3 py-2 rounded-lg bg-gray-800/50 border border-white/10 text-white text-sm focus:border-rose-500/50 focus:outline-none"
									/>
								</div>

								<div>
									<label class="block text-xs text-gray-400 mb-1">Volume to Administer (mL)</label>
									<input
										type="number"
										step="0.01"
										bind:value={volumeInput}
										placeholder="e.g., 9.0"
										class="w-full px-3 py-2 rounded-lg bg-gray-800/50 border border-white/10 text-white text-sm focus:border-rose-500/50 focus:outline-none"
									/>
								</div>

								{#if currentScenario.drugOrder.route === 'IV'}
									<div>
										<label class="block text-xs text-gray-400 mb-1">IV Rate (mL/hr)</label>
										<input
											type="number"
											step="0.1"
											bind:value={rateInput}
											placeholder="e.g., 125"
											class="w-full px-3 py-2 rounded-lg bg-gray-800/50 border border-white/10 text-white text-sm focus:border-rose-500/50 focus:outline-none"
										/>
									</div>
								{/if}

								<button
									onclick={handleSubmitAnswer}
									class="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold
										hover:shadow-lg hover:shadow-rose-500/25 transition-all"
								>
									{currentAnswer ? 'Update Answer' : 'Submit Answer'}
								</button>

								{#if currentAnswer}
									<div class="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
										<span class="text-xs text-emerald-400">Answer submitted. You can update it before completing the lab.</span>
									</div>
								{/if}
							</div>
						</div>

						<!-- Progress -->
						<div class="glass rounded-xl p-4 border border-white/10">
							<div class="flex items-center justify-between mb-2">
								<span class="text-sm text-gray-400">Scenarios Completed</span>
								<span class="text-sm font-mono text-rose-400">{state.completedScenarios.length}/{state.scenarios.length}</span>
							</div>
							<div class="h-2 bg-gray-800 rounded-full overflow-hidden">
								<div
									class="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500"
									style="width: {progress}%"
								></div>
							</div>
						</div>
					{/if}

					<!-- Quiz section -->
					<div class="glass-strong rounded-2xl p-5 border border-white/10">
						<h4 class="text-sm font-display font-semibold text-white mb-4">Knowledge Quiz</h4>
						<div class="space-y-4">
							{#each DOSAGE_QUIZ as question}
								{@const selected = state.quizAnswers.get(question.id)}
								<div class="glass rounded-xl p-3 border border-white/5">
									<p class="text-xs text-gray-300 mb-2">{question.question}</p>
									<div class="space-y-1">
										{#each question.options as option}
											<button
												onclick={() => handleQuizAnswer(question.id, option)}
												class="w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all
													{selected === option
													? 'bg-rose-500/20 border border-rose-500/30 text-rose-300'
													: 'glass border border-white/5 text-gray-400 hover:border-white/10'}"
											>
												{option}
											</button>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					</div>

					<!-- Complete button -->
					{#if state.completedScenarios.length >= 1}
						<button
							onclick={completeLab}
							class="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500
								text-white font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all"
						>
							Complete Lab
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</main>

	<ChatAssistant />
</div>
