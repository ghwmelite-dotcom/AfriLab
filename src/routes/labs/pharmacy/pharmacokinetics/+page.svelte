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
		selectDrug,
		updateParameter,
		updateRegimen,
		runSingleDoseSimulation,
		runMultiDoseSimulation,
		answerQuiz,
		analyzePharmacokinetics,
		calculateKe,
		calculateHalfLife,
		DRUG_PRESETS,
		PK_QUIZ,
		type PharmacokineticsState,
		type SimulationPoint
	} from '$lib/simulations/pharmacy/pharmacokinetics';

	// Lab state
	let state = $state<PharmacokineticsState>(createInitialState({ drugId: 'amoxicillin' }));
	let isLabStarted = $state(false);
	let showResults = $state(false);
	let activeTab = $state<'single' | 'multi' | 'quiz'>('single');

	// Derived
	let analysis = $derived(analyzePharmacokinetics(state));
	let ke = $derived(calculateKe(state.parameters.clearance, state.parameters.volumeOfDistribution));
	let halfLife = $derived(calculateHalfLife(ke));

	// SVG chart helpers
	function getChartPath(data: SimulationPoint[], maxTime: number, maxConc: number): string {
		if (data.length === 0) return '';
		const chartW = 440;
		const chartH = 220;
		const padL = 50;
		const padT = 10;

		return data
			.filter((_, i) => i % 3 === 0 || i === data.length - 1) // downsample for performance
			.map((p, i) => {
				const x = padL + (p.time / maxTime) * (chartW - padL - 10);
				const y = padT + chartH - (p.concentration / maxConc) * (chartH - 20);
				return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
			})
			.join(' ');
	}

	function getMaxConc(data: SimulationPoint[]): number {
		if (data.length === 0) return 30;
		return Math.max(...data.map((p) => p.concentration)) * 1.2;
	}

	function getMaxTime(data: SimulationPoint[]): number {
		if (data.length === 0) return 24;
		return data[data.length - 1].time;
	}

	function startLab() {
		isLabStarted = true;
		aiStore.setContext({
			labType: 'pharmacokinetics',
			discipline: 'pharmacy',
			currentStep: 'parameter-exploration',
			objectives: [
				'Understand one-compartment pharmacokinetic model',
				'Explore how dose, Vd, and CL affect plasma concentration',
				'Calculate Cmax, Tmax, AUC, and half-life',
				'Design optimal dosing regimen within therapeutic window'
			]
		});
	}

	function handleSelectDrug(drugId: string) {
		state = selectDrug(state, drugId);
		labStore.addAction('select-drug', { drugId });
	}

	function handleRunSingle() {
		state = runSingleDoseSimulation(state);
		labStore.addAction('run-single-dose', {});
	}

	function handleRunMulti() {
		state = runMultiDoseSimulation(state);
		labStore.addAction('run-multi-dose', {});
	}

	function handleQuizAnswer(questionId: string, answer: string) {
		state = answerQuiz(state, questionId, answer);
	}

	function completeLab() {
		showResults = true;
	}

	function resetLab() {
		state = createInitialState({ drugId: 'amoxicillin' });
		isLabStarted = false;
		showResults = false;
		activeTab = 'single';
	}

	onMount(() => {
		return () => {};
	});
</script>

<svelte:head>
	<title>Pharmacokinetics Simulation Lab | AfriLab</title>
</svelte:head>

<div class="min-h-screen bg-gray-950 text-white">
	<SafetyBanner
		level="safe"
		message="This is a computational simulation. Adjust pharmacokinetic parameters and observe how they affect plasma drug concentrations. Design regimens that keep concentrations within the therapeutic window."
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
						<h1 class="text-lg font-display font-bold text-white">Pharmacokinetics Simulation</h1>
						<p class="text-xs text-gray-400">Pharmacy - PK Modeling</p>
					</div>
				</div>
				<div class="flex items-center gap-4">
					<HintButton context="pharmacokinetics" />
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
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
						</svg>
					</div>

					<h2 class="text-2xl font-display font-bold text-white mb-3">
						Welcome to the Pharmacokinetics Simulation
					</h2>
					<p class="text-gray-400 mb-6">
						Explore one-compartment pharmacokinetic models. Adjust drug parameters and observe
						how they affect plasma concentration-time profiles. Design dosing regimens that
						maintain drug levels within the therapeutic window.
					</p>

					<div class="grid grid-cols-2 gap-4 mb-8 text-left">
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-rose-400">1.</span> Select Drug
							</h3>
							<p class="text-sm text-gray-400">Choose from drug presets with real PK parameters.</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-rose-400">2.</span> Single Dose
							</h3>
							<p class="text-sm text-gray-400">Simulate and analyze a single dose profile.</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-rose-400">3.</span> Multi-Dose
							</h3>
							<p class="text-sm text-gray-400">Design a dosing regimen targeting the therapeutic window.</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-rose-400">4.</span> Analyze
							</h3>
							<p class="text-sm text-gray-400">Calculate Cmax, Tmax, AUC, and half-life.</p>
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

					<div class="grid grid-cols-3 gap-4 mb-8">
						<div class="glass rounded-xl p-4 text-center border border-white/10">
							<div class="text-2xl font-bold text-rose-400">{analysis.tasksCompleted}/{analysis.totalTasks}</div>
							<div class="text-xs text-gray-400">Tasks Done</div>
						</div>
						<div class="glass rounded-xl p-4 text-center border border-white/10">
							<div class="text-2xl font-bold capitalize {analysis.regimenQuality === 'optimal' ? 'text-emerald-400' : analysis.regimenQuality === 'acceptable' ? 'text-cyan-400' : analysis.regimenQuality === 'dangerous' ? 'text-rose-400' : 'text-amber-400'}">
								{analysis.regimenQuality}
							</div>
							<div class="text-xs text-gray-400">Regimen Quality</div>
						</div>
						<div class="glass rounded-xl p-4 text-center border border-white/10">
							<div class="text-2xl font-bold text-pink-400">{analysis.quizScore.correct}/{analysis.quizScore.total}</div>
							<div class="text-xs text-gray-400">Quiz Score</div>
						</div>
					</div>

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
			<div class="space-y-6">
				<!-- Drug selector -->
				<div class="flex gap-2 overflow-x-auto pb-2">
					{#each DRUG_PRESETS as drug}
						<button
							onclick={() => handleSelectDrug(drug.id)}
							class="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
								{state.selectedDrug?.id === drug.id
								? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/25'
								: 'glass border border-white/10 text-gray-400 hover:border-white/20'}"
						>
							{drug.name}
						</button>
					{/each}
				</div>

				{#if state.selectedDrug}
					<div class="glass rounded-xl p-3 border border-white/10">
						<p class="text-sm text-gray-400">{state.selectedDrug.description}</p>
					</div>
				{/if}

				<!-- Tab selector -->
				<div class="flex gap-2">
					<button onclick={() => activeTab = 'single'}
						class="px-4 py-2 rounded-xl text-sm font-medium transition-all {activeTab === 'single' ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' : 'glass border border-white/10 text-gray-400'}">
						Single Dose
					</button>
					<button onclick={() => activeTab = 'multi'}
						class="px-4 py-2 rounded-xl text-sm font-medium transition-all {activeTab === 'multi' ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' : 'glass border border-white/10 text-gray-400'}">
						Multi-Dose Regimen
					</button>
					<button onclick={() => activeTab = 'quiz'}
						class="px-4 py-2 rounded-xl text-sm font-medium transition-all {activeTab === 'quiz' ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' : 'glass border border-white/10 text-gray-400'}">
						Quiz
					</button>
				</div>

				<div class="grid lg:grid-cols-[1fr,340px] gap-6">
					<!-- Main area -->
					<div class="space-y-6">
						{#if activeTab === 'single'}
							<!-- Single dose chart -->
							<div class="glass-strong rounded-2xl p-6 border border-white/10">
								<div class="flex items-center justify-between mb-4">
									<h4 class="text-sm font-display font-semibold text-white">Plasma Concentration vs Time</h4>
									<button
										onclick={handleRunSingle}
										class="px-4 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold hover:shadow-lg transition-all"
									>
										Run Simulation
									</button>
								</div>

								{#if state.simulationData.length > 0}
									{@const maxC = getMaxConc(state.simulationData)}
									{@const maxT = getMaxTime(state.simulationData)}
									{@const chartW = 440}
									{@const chartH = 220}
									{@const padL = 50}
									{@const padT = 10}
									<svg viewBox="0 0 {chartW + 20} {chartH + 40}" class="w-full h-auto">
										<!-- Grid -->
										{#each [0, 0.25, 0.5, 0.75, 1] as frac}
											{@const y = padT + chartH - frac * (chartH - 20)}
											<line x1={padL} y1={y} x2={chartW} y2={y} stroke="rgba(255,255,255,0.05)" stroke-width="1" />
											<text x={padL - 5} y={y + 3} text-anchor="end" fill="rgba(255,255,255,0.3)" font-size="8">{(frac * maxC).toFixed(1)}</text>
										{/each}

										<!-- Therapeutic window -->
t									{#if true}
										{@const mecY = padT + chartH - (state.therapeuticWindow.minEffective / maxC) * (chartH - 20)}
										{@const mtcY = padT + chartH - (state.therapeuticWindow.minToxic / maxC) * (chartH - 20)}
										<rect x={padL} y={mtcY} width={chartW - padL - 10} height={mecY - mtcY} fill="rgba(16, 185, 129, 0.08)" />
										<line x1={padL} y1={mecY} x2={chartW} y2={mecY} stroke="rgba(16, 185, 129, 0.5)" stroke-width="1" stroke-dasharray="4,3" />
										<line x1={padL} y1={mtcY} x2={chartW} y2={mtcY} stroke="rgba(244, 63, 94, 0.5)" stroke-width="1" stroke-dasharray="4,3" />
										<text x={chartW + 2} y={mecY + 3} fill="rgba(16, 185, 129, 0.7)" font-size="7">MEC</text>
										<text x={chartW + 2} y={mtcY + 3} fill="rgba(244, 63, 94, 0.7)" font-size="7">MTC</text>
t									{/if}

										<!-- Axes -->
										<line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="rgba(255,255,255,0.2)" stroke-width="1" />
										<line x1={padL} y1={padT + chartH} x2={chartW} y2={padT + chartH} stroke="rgba(255,255,255,0.2)" stroke-width="1" />

										<!-- X axis labels -->
										{#each Array(5) as _, i}
											{@const t = (maxT / 4) * i}
											{@const x = padL + (t / maxT) * (chartW - padL - 10)}
											<text x={x} y={padT + chartH + 14} text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="8">{t.toFixed(0)}</text>
										{/each}
										<text x={(padL + chartW) / 2} y={padT + chartH + 30} text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="9">Time (hours)</text>
										<text x="10" y={(padT + chartH) / 2} text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="9" transform="rotate(-90, 10, {(padT + chartH) / 2})">Conc (mg/L)</text>

										<!-- Curve -->
										<path d={getChartPath(state.simulationData, maxT, maxC)} fill="none" stroke="rgba(244, 63, 94, 0.9)" stroke-width="2" />

										<!-- Cmax marker -->
										{#if state.calculatedMetrics}
											{@const cmaxX = padL + (state.calculatedMetrics.tmax / maxT) * (chartW - padL - 10)}
											{@const cmaxY = padT + chartH - (state.calculatedMetrics.cmax / maxC) * (chartH - 20)}
											<circle cx={cmaxX} cy={cmaxY} r="4" fill="rgba(244, 63, 94, 1)" stroke="white" stroke-width="1" />
											<text x={cmaxX + 8} y={cmaxY - 4} fill="white" font-size="8" font-weight="bold">
												Cmax={state.calculatedMetrics.cmax.toFixed(1)}
											</text>
										{/if}
									</svg>
								{:else}
									<div class="flex items-center justify-center h-48 text-gray-500 text-sm">
										Adjust parameters and click "Run Simulation" to see the curve
									</div>
								{/if}
							</div>

							<!-- Metrics -->
							{#if state.calculatedMetrics}
								<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
									<div class="glass rounded-xl p-3 border border-white/10 text-center">
										<div class="text-xs text-gray-500">Cmax</div>
										<div class="text-lg font-bold text-white">{state.calculatedMetrics.cmax.toFixed(2)} <span class="text-xs text-gray-400">mg/L</span></div>
									</div>
									<div class="glass rounded-xl p-3 border border-white/10 text-center">
										<div class="text-xs text-gray-500">Tmax</div>
										<div class="text-lg font-bold text-white">{state.calculatedMetrics.tmax.toFixed(2)} <span class="text-xs text-gray-400">hr</span></div>
									</div>
									<div class="glass rounded-xl p-3 border border-white/10 text-center">
										<div class="text-xs text-gray-500">AUC</div>
										<div class="text-lg font-bold text-white">{state.calculatedMetrics.auc.toFixed(1)} <span class="text-xs text-gray-400">mg*hr/L</span></div>
									</div>
									<div class="glass rounded-xl p-3 border border-white/10 text-center">
										<div class="text-xs text-gray-500">t1/2</div>
										<div class="text-lg font-bold text-white">{state.calculatedMetrics.halfLife.toFixed(2)} <span class="text-xs text-gray-400">hr</span></div>
									</div>
								</div>
							{/if}
						{:else if activeTab === 'multi'}
							<!-- Multi-dose chart -->
							<div class="glass-strong rounded-2xl p-6 border border-white/10">
								<div class="flex items-center justify-between mb-4">
									<h4 class="text-sm font-display font-semibold text-white">Multi-Dose Concentration Profile</h4>
									<button
										onclick={handleRunMulti}
										class="px-4 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold hover:shadow-lg transition-all"
									>
										Run Multi-Dose
									</button>
								</div>

								<!-- Regimen controls -->
								<div class="grid grid-cols-3 gap-3 mb-4">
									<div>
										<label class="block text-xs text-gray-400 mb-1">Dose (mg)</label>
										<input
											type="number"
											value={state.dosingRegimen.dose}
											onchange={(e) => state = updateRegimen(state, 'dose', parseFloat(e.currentTarget.value) || 0)}
											class="w-full px-3 py-1.5 rounded-lg bg-gray-800/50 border border-white/10 text-white text-sm focus:border-rose-500/50 focus:outline-none"
										/>
									</div>
									<div>
										<label class="block text-xs text-gray-400 mb-1">Interval (hr)</label>
										<input
											type="number"
											value={state.dosingRegimen.interval}
											onchange={(e) => state = updateRegimen(state, 'interval', parseFloat(e.currentTarget.value) || 1)}
											class="w-full px-3 py-1.5 rounded-lg bg-gray-800/50 border border-white/10 text-white text-sm focus:border-rose-500/50 focus:outline-none"
										/>
									</div>
									<div>
										<label class="block text-xs text-gray-400 mb-1"># Doses</label>
										<input
											type="number"
											min="1"
											max="20"
											value={state.dosingRegimen.numberOfDoses}
											onchange={(e) => state = updateRegimen(state, 'numberOfDoses', parseInt(e.currentTarget.value) || 1)}
											class="w-full px-3 py-1.5 rounded-lg bg-gray-800/50 border border-white/10 text-white text-sm focus:border-rose-500/50 focus:outline-none"
										/>
									</div>
								</div>

								{#if state.multiDoseData.length > 0}
									{@const maxC = getMaxConc(state.multiDoseData)}
									{@const maxT = getMaxTime(state.multiDoseData)}
									{@const chartW = 440}
									{@const chartH = 220}
									{@const padL = 50}
									{@const padT = 10}
									<svg viewBox="0 0 {chartW + 20} {chartH + 40}" class="w-full h-auto">
										<!-- Grid -->
										{#each [0, 0.25, 0.5, 0.75, 1] as frac}
											{@const y = padT + chartH - frac * (chartH - 20)}
											<line x1={padL} y1={y} x2={chartW} y2={y} stroke="rgba(255,255,255,0.05)" stroke-width="1" />
											<text x={padL - 5} y={y + 3} text-anchor="end" fill="rgba(255,255,255,0.3)" font-size="8">{(frac * maxC).toFixed(1)}</text>
										{/each}

										<!-- Therapeutic window -->
t									{#if true}
										{@const mecY = padT + chartH - (state.therapeuticWindow.minEffective / maxC) * (chartH - 20)}
										{@const mtcY = padT + chartH - (state.therapeuticWindow.minToxic / maxC) * (chartH - 20)}
										<rect x={padL} y={mtcY} width={chartW - padL - 10} height={mecY - mtcY} fill="rgba(16, 185, 129, 0.08)" />
										<line x1={padL} y1={mecY} x2={chartW} y2={mecY} stroke="rgba(16, 185, 129, 0.5)" stroke-width="1" stroke-dasharray="4,3" />
										<line x1={padL} y1={mtcY} x2={chartW} y2={mtcY} stroke="rgba(244, 63, 94, 0.5)" stroke-width="1" stroke-dasharray="4,3" />
										<text x={chartW + 2} y={mecY + 3} fill="rgba(16, 185, 129, 0.7)" font-size="7">MEC</text>
										<text x={chartW + 2} y={mtcY + 3} fill="rgba(244, 63, 94, 0.7)" font-size="7">MTC</text>

t									{/if}
										<!-- Axes -->
										<line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="rgba(255,255,255,0.2)" stroke-width="1" />
										<line x1={padL} y1={padT + chartH} x2={chartW} y2={padT + chartH} stroke="rgba(255,255,255,0.2)" stroke-width="1" />

										<!-- X axis -->
										{#each Array(5) as _, i}
											{@const t = (maxT / 4) * i}
											{@const x = padL + (t / maxT) * (chartW - padL - 10)}
											<text x={x} y={padT + chartH + 14} text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="8">{t.toFixed(0)}</text>
										{/each}
										<text x={(padL + chartW) / 2} y={padT + chartH + 30} text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="9">Time (hours)</text>

										<!-- Dose markers -->
										{#each Array(state.dosingRegimen.numberOfDoses) as _, d}
											{@const doseTime = d * state.dosingRegimen.interval}
											{@const dx = padL + (doseTime / maxT) * (chartW - padL - 10)}
											<line x1={dx} y1={padT} x2={dx} y2={padT + chartH} stroke="rgba(255,255,255,0.1)" stroke-width="1" stroke-dasharray="2,4" />
										{/each}

										<!-- Curve -->
										<path d={getChartPath(state.multiDoseData, maxT, maxC)} fill="none" stroke="rgba(244, 63, 94, 0.9)" stroke-width="2" />
									</svg>

									<!-- Steady state metrics -->
									{#if state.calculatedMetrics?.steadyStateCmax !== null}
										<div class="grid grid-cols-2 gap-3 mt-4">
											<div class="glass rounded-xl p-3 border border-white/10 text-center">
												<div class="text-xs text-gray-500">Css,max</div>
												<div class="text-lg font-bold text-white">{state.calculatedMetrics?.steadyStateCmax?.toFixed(2)} <span class="text-xs text-gray-400">mg/L</span></div>
												<div class="text-[10px] {(state.calculatedMetrics?.steadyStateCmax ?? 0) <= state.therapeuticWindow.minToxic ? 'text-emerald-400' : 'text-rose-400'}">
													{(state.calculatedMetrics?.steadyStateCmax ?? 0) <= state.therapeuticWindow.minToxic ? 'Below MTC' : 'Above MTC!'}
												</div>
											</div>
											<div class="glass rounded-xl p-3 border border-white/10 text-center">
												<div class="text-xs text-gray-500">Css,min</div>
												<div class="text-lg font-bold text-white">{state.calculatedMetrics?.steadyStateCmin?.toFixed(2)} <span class="text-xs text-gray-400">mg/L</span></div>
												<div class="text-[10px] {(state.calculatedMetrics?.steadyStateCmin ?? 0) >= state.therapeuticWindow.minEffective ? 'text-emerald-400' : 'text-amber-400'}">
													{(state.calculatedMetrics?.steadyStateCmin ?? 0) >= state.therapeuticWindow.minEffective ? 'Above MEC' : 'Below MEC!'}
												</div>
											</div>
										</div>
									{/if}
								{:else}
									<div class="flex items-center justify-center h-48 text-gray-500 text-sm">
										Set dose, interval, and number of doses, then click "Run Multi-Dose"
									</div>
								{/if}
							</div>
						{:else}
							<!-- Quiz tab -->
							<div class="glass-strong rounded-2xl p-6 border border-white/10">
								<h4 class="text-sm font-display font-semibold text-white mb-4">Pharmacokinetics Quiz</h4>
								<div class="space-y-4">
									{#each PK_QUIZ as question}
										{@const selected = state.quizAnswers.get(question.id)}
										<div class="glass rounded-xl p-4 border border-white/5">
											<p class="text-sm text-gray-300 mb-3">{question.question}</p>
											<div class="space-y-1.5">
												{#each question.options as option}
													<button
														onclick={() => handleQuizAnswer(question.id, option)}
														class="w-full text-left px-4 py-2 rounded-lg text-sm transition-all
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
						{/if}
					</div>

					<!-- Right panel: Parameters -->
					<div class="space-y-4">
						<!-- PK Parameters -->
						<div class="glass-strong rounded-2xl p-5 border border-white/10 sticky top-20">
							<h4 class="text-sm font-display font-semibold text-white mb-4">PK Parameters</h4>
							<div class="space-y-3">
								<div>
									<div class="flex justify-between text-xs mb-1">
										<span class="text-gray-400">Dose</span>
										<span class="text-white font-mono">{state.parameters.dose} mg</span>
									</div>
									<input type="range" min="50" max="2000" step="50"
										value={state.parameters.dose}
										oninput={(e) => state = updateParameter(state, 'dose', parseFloat(e.currentTarget.value))}
										class="w-full accent-rose-500" />
								</div>

								{#if state.parameters.route === 'oral'}
									<div>
										<div class="flex justify-between text-xs mb-1">
											<span class="text-gray-400">Bioavailability (F)</span>
											<span class="text-white font-mono">{(state.parameters.bioavailability * 100).toFixed(0)}%</span>
										</div>
										<input type="range" min="0.1" max="1" step="0.05"
											value={state.parameters.bioavailability}
											oninput={(e) => state = updateParameter(state, 'bioavailability', parseFloat(e.currentTarget.value))}
											class="w-full accent-rose-500" />
									</div>
								{/if}

								<div>
									<div class="flex justify-between text-xs mb-1">
										<span class="text-gray-400">Volume of Distribution</span>
										<span class="text-white font-mono">{state.parameters.volumeOfDistribution} L</span>
									</div>
									<input type="range" min="5" max="100" step="1"
										value={state.parameters.volumeOfDistribution}
										oninput={(e) => state = updateParameter(state, 'volumeOfDistribution', parseFloat(e.currentTarget.value))}
										class="w-full accent-rose-500" />
								</div>

								<div>
									<div class="flex justify-between text-xs mb-1">
										<span class="text-gray-400">Clearance</span>
										<span class="text-white font-mono">{state.parameters.clearance} L/hr</span>
									</div>
									<input type="range" min="0.5" max="30" step="0.5"
										value={state.parameters.clearance}
										oninput={(e) => state = updateParameter(state, 'clearance', parseFloat(e.currentTarget.value))}
										class="w-full accent-rose-500" />
								</div>

								{#if state.parameters.route === 'oral'}
									<div>
										<div class="flex justify-between text-xs mb-1">
											<span class="text-gray-400">Absorption Rate (ka)</span>
											<span class="text-white font-mono">{state.parameters.absorptionRate.toFixed(1)} hr&supmin;&sup1;</span>
										</div>
										<input type="range" min="0.5" max="5" step="0.1"
											value={state.parameters.absorptionRate}
											oninput={(e) => state = updateParameter(state, 'absorptionRate', parseFloat(e.currentTarget.value))}
											class="w-full accent-rose-500" />
									</div>
								{/if}

								<div>
									<label class="block text-xs text-gray-400 mb-1">Route</label>
									<select
										value={state.parameters.route}
										onchange={(e) => state = updateParameter(state, 'route', e.currentTarget.value)}
										class="w-full px-3 py-1.5 rounded-lg bg-gray-800/50 border border-white/10 text-white text-sm focus:border-rose-500/50 focus:outline-none"
									>
										<option value="oral">Oral</option>
										<option value="iv-bolus">IV Bolus</option>
										<option value="iv-infusion">IV Infusion</option>
									</select>
								</div>
							</div>

							<!-- Computed values -->
							<div class="mt-4 pt-4 border-t border-white/10 space-y-2">
								<div class="flex justify-between text-xs">
									<span class="text-gray-400">Ke</span>
									<span class="text-rose-400 font-mono">{ke.toFixed(4)} hr&supmin;&sup1;</span>
								</div>
								<div class="flex justify-between text-xs">
									<span class="text-gray-400">Half-life</span>
									<span class="text-rose-400 font-mono">{halfLife.toFixed(2)} hr</span>
								</div>
								<div class="flex justify-between text-xs">
									<span class="text-gray-400">Time to SS</span>
									<span class="text-rose-400 font-mono">~{(halfLife * 5).toFixed(1)} hr</span>
								</div>
							</div>
						</div>

						<!-- Therapeutic window -->
						<div class="glass rounded-xl p-4 border border-white/10">
							<h4 class="text-xs font-display font-semibold text-white mb-2">Therapeutic Window</h4>
							<div class="space-y-1 text-xs">
								<div class="flex justify-between">
									<span class="text-gray-400">Drug:</span>
									<span class="text-white">{state.therapeuticWindow.drugName}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-emerald-400">MEC:</span>
									<span class="text-white font-mono">{state.therapeuticWindow.minEffective} mg/L</span>
								</div>
								<div class="flex justify-between">
									<span class="text-rose-400">MTC:</span>
									<span class="text-white font-mono">{state.therapeuticWindow.minToxic} mg/L</span>
								</div>
							</div>
						</div>

						<!-- Progress -->
						<div class="glass rounded-xl p-4 border border-white/10">
							<div class="flex items-center justify-between mb-2">
								<span class="text-sm text-gray-400">Tasks Completed</span>
								<span class="text-sm font-mono text-rose-400">{state.completedTasks.length}/3</span>
							</div>
							<div class="h-2 bg-gray-800 rounded-full overflow-hidden">
								<div
									class="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500"
									style="width: {(state.completedTasks.length / 3) * 100}%"
								></div>
							</div>
							<div class="mt-2 space-y-1 text-xs">
								<div class="flex items-center gap-2">
									<div class="w-3 h-3 rounded {state.completedTasks.includes('single-dose') ? 'bg-emerald-500' : 'bg-gray-700'}"></div>
									<span class="text-gray-400">Single dose simulation</span>
								</div>
								<div class="flex items-center gap-2">
									<div class="w-3 h-3 rounded {state.completedTasks.includes('multi-dose') ? 'bg-emerald-500' : 'bg-gray-700'}"></div>
									<span class="text-gray-400">Multi-dose regimen</span>
								</div>
								<div class="flex items-center gap-2">
									<div class="w-3 h-3 rounded {state.quizAnswers.size >= PK_QUIZ.length ? 'bg-emerald-500' : 'bg-gray-700'}"></div>
									<span class="text-gray-400">Complete quiz</span>
								</div>
							</div>
						</div>

						<!-- Complete button -->
						{#if state.completedTasks.length >= 1}
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
			</div>
		{/if}
	</main>

	<ChatAssistant />
</div>
