<script lang="ts">
	import { onMount } from 'svelte';
	import { labStore } from '$stores/lab';
	import { aiStore } from '$stores/ai';
	import SafetyBanner from '$components/lab/SafetyBanner.svelte';
	import StepGuide from '$components/lab/StepGuide.svelte';
	import HintButton from '$components/ai/HintButton.svelte';
	import ControlPanel from '$components/lab/ControlPanel.svelte';
	import LabCanvas from '$components/lab/LabCanvas.svelte';

	import {
		createInitialState,
		setTemperature,
		setPH,
		setSubstrateConcentration,
		setSelectedVariable,
		runExperiment,
		calculateKineticParameters,
		calculateReactionRate,
		answerQuiz,
		checkQuizAnswers,
		analyzeKinetics,
		KINETICS_QUIZ,
		type KineticsState
	} from '$lib/simulations/biology/enzyme-kinetics';
	import type { Experiment, LabSession } from '$types';

	const experiment: Experiment = {
		id: 'bio-enzyme-kinetics-01',
		disciplineId: 'biology',
		title: 'Enzyme Kinetics',
		description: 'Study catalase enzyme activity under varying conditions.',
		difficulty: 'intermediate',
		durationMinutes: 45,
		instructions: [
			{ id: 1, title: 'Introduction', description: 'Learn about catalase and enzyme kinetics.', hints: ['Catalase breaks down H2O2 into H2O + O2'] },
			{ id: 2, title: 'Set Baseline', description: 'Run an experiment at optimal conditions (37C, pH 7).', hints: ['Optimal temperature for catalase is body temperature'] },
			{ id: 3, title: 'Vary Temperature', description: 'Test reaction rates at different temperatures.', hints: ['Try temperatures from 10C to 70C'] },
			{ id: 4, title: 'Vary pH', description: 'Test reaction rates at different pH values.', hints: ['Test pH from 3 to 11'] },
			{ id: 5, title: 'Vary Substrate', description: 'Test rates at different H2O2 concentrations.', hints: ['Try concentrations from 5 to 100 mM'] },
			{ id: 6, title: 'Michaelis-Menten', description: 'Plot substrate concentration vs rate to find Vmax and Km.', hints: ['You need at least 3 substrate concentrations'] },
			{ id: 7, title: 'Calculate Parameters', description: 'Determine Vmax and Km from your data.', hints: ['Km is [S] where rate = Vmax/2'] },
			{ id: 8, title: 'Complete Quiz', description: 'Answer questions about enzyme kinetics.', hints: ['Review Michaelis-Menten equation'] }
		],
		simulationConfig: { type: 'enzyme-kinetics', parameters: {}, equipment: ['Test tubes', 'Catalase solution', 'H2O2 solution', 'Water bath', 'pH buffers', 'Gas collection apparatus'] },
		safetyNotes: 'H2O2 is corrosive. Wear gloves and safety goggles.',
		learningObjectives: ['Understand enzyme-substrate interactions', 'Measure reaction rates', 'Plot Michaelis-Menten curves', 'Determine Vmax and Km']
	};

	let state: KineticsState = $state(createInitialState({ defaultTemperature: 37, defaultPH: 7.0, defaultSubstrate: 25 }));
	let showResults = $state(false);
	let showQuiz = $state(false);
	let mounted = $state(false);

	let analysis = $derived(analyzeKinetics(state));
	let quizResults = $derived(checkQuizAnswers(state));
	let currentRate = $derived(calculateReactionRate(state.currentConditions));

	// SVG chart dimensions
	const chartW = 400;
	const chartH = 200;
	const padding = 40;

	onMount(() => {
		mounted = true;
		const session: LabSession = {
			id: crypto.randomUUID(), userId: '', experimentId: experiment.id,
			status: 'in_progress', startedAt: new Date(), completedAt: null,
			data: { currentStep: 0, measurements: [], notes: [], actions: [] }, score: null
		};
		labStore.startLab(experiment, session);
		aiStore.setContext({ discipline: 'biology', experimentTitle: experiment.title, currentStep: 0, studentLevel: 'intermediate', recentMeasurements: [] });
	});

	function handleRunExperiment() {
		state = runExperiment(state);
		labStore.addAction('run-experiment', { conditions: state.currentConditions });
	}

	function handleCalculateParams() {
		state = calculateKineticParameters(state);
		labStore.addAction('calculate-parameters', {});
	}

	function handleQuizAnswer(questionId: string, answer: string) {
		state = answerQuiz(state, questionId, answer);
	}

	function handleComplete() {
		showResults = true;
		labStore.completeLab();
	}

	// Generate SVG path for reaction curve
	function getReactionCurvePath(run: typeof state.experimentRuns[0]): string {
		if (!run || run.dataPoints.length === 0) return '';
		const maxTime = 120;
		const maxO2 = Math.max(...run.dataPoints.map(p => p.o2Produced), 1);
		const xScale = (chartW - padding * 2) / maxTime;
		const yScale = (chartH - padding * 2) / maxO2;
		return run.dataPoints.map((p, i) => {
			const x = padding + p.time * xScale;
			const y = chartH - padding - p.o2Produced * yScale;
			return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
		}).join(' ');
	}

	// Generate MM curve SVG path
	function getMMCurvePath(): string {
		if (state.mmPoints.length < 2) return '';
		const sorted = [...state.mmPoints].sort((a, b) => a.substrateConcentration - b.substrateConcentration);
		const maxS = Math.max(...sorted.map(p => p.substrateConcentration), 1);
		const maxV = Math.max(...sorted.map(p => p.initialRate), 0.01);
		const xScale = (chartW - padding * 2) / maxS;
		const yScale = (chartH - padding * 2) / maxV;
		return sorted.map((p, i) => {
			const x = padding + p.substrateConcentration * xScale;
			const y = chartH - padding - p.initialRate * yScale;
			return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
		}).join(' ');
	}
</script>

<svelte:head>
	<title>Enzyme Kinetics - AfriLab</title>
</svelte:head>

<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-teal-500/10 to-transparent rounded-full blur-3xl"></div>
</div>

<div class="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
		<div>
			<div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
				<a href="/dashboard" class="hover:text-emerald-400 transition-colors">Dashboard</a>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
				<a href="/labs/biology" class="hover:text-emerald-400 transition-colors">Biology</a>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
				<span class="text-emerald-400">Enzyme Kinetics</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-display font-bold text-white">{experiment.title}</h1>
		</div>
		<div class="flex items-center gap-3">
			<button onclick={() => aiStore.open()} class="btn-primary">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
				Ask AI
			</button>
		</div>
	</div>

	<div class="mb-6"><SafetyBanner level="warning" message="H2O2 is corrosive. In a real lab, always wear gloves and safety goggles when handling hydrogen peroxide." /></div>

	<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
		<!-- Left: Steps -->
		<div class="lg:col-span-1 space-y-6">
			<StepGuide steps={experiment.instructions} currentStepIndex={$labStore.currentStepIndex} />
			<div class="glass rounded-2xl p-4 border border-white/5">
				<HintButton experimentId={experiment.id} stepId={$labStore.currentStepIndex + 1} stepTitle={experiment.instructions[$labStore.currentStepIndex]?.title} />
			</div>
			<ControlPanel onComplete={handleComplete} />
		</div>

		<!-- Center: Lab Area -->
		<div class="lg:col-span-2 space-y-6">
			{#if !showQuiz}
				<!-- Variable Selector -->
				<div class="glass-strong rounded-2xl p-5 border border-white/10">
					<h3 class="text-sm font-semibold text-white mb-3">Variable to Investigate</h3>
					<div class="flex gap-2">
						{#each [{ key: 'temperature', label: 'Temperature' }, { key: 'pH', label: 'pH' }, { key: 'substrate', label: 'Substrate [S]' }] as opt}
							<button
								onclick={() => { state = setSelectedVariable(state, opt.key as 'temperature' | 'pH' | 'substrate'); }}
								class="flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all {state.selectedVariable === opt.key ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border-teal-500/50 text-white' : 'glass border border-white/10 text-gray-400 hover:border-white/20'}"
							>
								{opt.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Condition Controls -->
				<div class="glass-strong rounded-2xl p-5 border border-white/10 space-y-4">
					<h3 class="text-sm font-semibold text-white mb-1">Reaction Conditions</h3>

					<!-- Temperature -->
					<div>
						<div class="flex justify-between text-xs mb-1">
							<span class="text-gray-400">Temperature</span>
							<span class="font-mono text-white">{state.currentConditions.temperature}C</span>
						</div>
						<input type="range" min="0" max="80" step="1"
							value={state.currentConditions.temperature}
							oninput={(e) => { state = setTemperature(state, parseInt((e.target as HTMLInputElement).value)); }}
							class="w-full accent-teal-500"
						/>
						<div class="flex justify-between text-[10px] text-gray-600"><span>0C</span><span>37C</span><span>80C</span></div>
					</div>

					<!-- pH -->
					<div>
						<div class="flex justify-between text-xs mb-1">
							<span class="text-gray-400">pH</span>
							<span class="font-mono text-white">{state.currentConditions.pH}</span>
						</div>
						<input type="range" min="2" max="12" step="0.5"
							value={state.currentConditions.pH}
							oninput={(e) => { state = setPH(state, parseFloat((e.target as HTMLInputElement).value)); }}
							class="w-full accent-cyan-500"
						/>
						<div class="flex justify-between text-[10px] text-gray-600"><span>2 (Acid)</span><span>7 (Neutral)</span><span>12 (Base)</span></div>
					</div>

					<!-- Substrate -->
					<div>
						<div class="flex justify-between text-xs mb-1">
							<span class="text-gray-400">[H2O2] Substrate</span>
							<span class="font-mono text-white">{state.currentConditions.substrateConcentration} mM</span>
						</div>
						<input type="range" min="0" max="100" step="5"
							value={state.currentConditions.substrateConcentration}
							oninput={(e) => { state = setSubstrateConcentration(state, parseInt((e.target as HTMLInputElement).value)); }}
							class="w-full accent-emerald-500"
						/>
					</div>

					<!-- Current Rate Preview -->
					<div class="glass rounded-xl p-3 border border-white/5 text-center">
						<p class="text-xs text-gray-400">Predicted Initial Rate</p>
						<p class="text-xl font-bold font-mono text-emerald-400">{(currentRate).toFixed(3)} <span class="text-xs text-gray-500">mL O2/s</span></p>
					</div>

					<button onclick={handleRunExperiment}
						class="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-teal-500/25 transition-all">
						Run Experiment
					</button>
				</div>

				<!-- Reaction Curve Chart -->
				{#if state.currentRun}
					<LabCanvas className="min-h-[280px]">
						<div class="p-4">
							<h3 class="text-sm font-display font-semibold text-white mb-3">Reaction Time Course</h3>
							<svg viewBox="0 0 {chartW} {chartH}" class="w-full h-auto">
								<!-- Axes -->
								<line x1={padding} y1={chartH - padding} x2={chartW - padding} y2={chartH - padding} stroke="rgba(255,255,255,0.2)" stroke-width="1" />
								<line x1={padding} y1={padding} x2={padding} y2={chartH - padding} stroke="rgba(255,255,255,0.2)" stroke-width="1" />
								<!-- Labels -->
								<text x={chartW / 2} y={chartH - 5} text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="10">Time (s)</text>
								<text x={10} y={chartH / 2} text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="10" transform="rotate(-90, 10, {chartH / 2})">O2 (mL)</text>
								<!-- Curve -->
								<path d={getReactionCurvePath(state.currentRun)} fill="none" stroke="#14b8a6" stroke-width="2" />
							</svg>
							<div class="flex justify-between text-xs text-gray-400 mt-2">
								<span>Initial Rate: {state.currentRun.initialRate} mL/s</span>
								<span>Total O2: {state.currentRun.maxO2} mL</span>
							</div>
						</div>
					</LabCanvas>
				{/if}

				<!-- Michaelis-Menten Analysis -->
				{#if state.mmPoints.length >= 2}
					<div class="glass-strong rounded-2xl p-5 border border-white/10">
						<h3 class="text-sm font-semibold text-white mb-3">Michaelis-Menten Curve</h3>
						<svg viewBox="0 0 {chartW} {chartH}" class="w-full h-auto mb-4">
							<!-- Axes -->
							<line x1={padding} y1={chartH - padding} x2={chartW - padding} y2={chartH - padding} stroke="rgba(255,255,255,0.2)" stroke-width="1" />
							<line x1={padding} y1={padding} x2={padding} y2={chartH - padding} stroke="rgba(255,255,255,0.2)" stroke-width="1" />
							<text x={chartW / 2} y={chartH - 5} text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="10">[S] (mM)</text>
							<text x={10} y={chartH / 2} text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="10" transform="rotate(-90, 10, {chartH / 2})">V0 (mL/s)</text>
							<!-- Data points -->
							{#each state.mmPoints as point}
								{@const maxS = Math.max(...state.mmPoints.map(p => p.substrateConcentration), 1)}
								{@const maxV = Math.max(...state.mmPoints.map(p => p.initialRate), 0.01)}
								<circle
									cx={padding + (point.substrateConcentration / maxS) * (chartW - padding * 2)}
									cy={chartH - padding - (point.initialRate / maxV) * (chartH - padding * 2)}
									r="4" fill="#06b6d4"
								/>
							{/each}
							<!-- Curve -->
							<path d={getMMCurvePath()} fill="none" stroke="#06b6d4" stroke-width="2" stroke-dasharray="4 2" />
						</svg>

						<button onclick={handleCalculateParams}
							disabled={state.mmPoints.length < 3}
							class="w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 hover:border-cyan-500/50 disabled:opacity-50">
							Calculate Vmax & Km ({state.mmPoints.length}/3+ points)
						</button>

						{#if state.calculatedVmax !== null && state.calculatedKm !== null}
							<div class="mt-4 grid grid-cols-2 gap-4">
								<div class="glass rounded-xl p-3 border border-white/5 text-center">
									<p class="text-xs text-gray-400">Vmax</p>
									<p class="text-lg font-bold font-mono text-cyan-400">{state.calculatedVmax} <span class="text-xs text-gray-500">mL/s</span></p>
									<p class="text-[10px] text-gray-600">True: 0.850 mL/s</p>
								</div>
								<div class="glass rounded-xl p-3 border border-white/5 text-center">
									<p class="text-xs text-gray-400">Km</p>
									<p class="text-lg font-bold font-mono text-cyan-400">{state.calculatedKm} <span class="text-xs text-gray-500">mM</span></p>
									<p class="text-[10px] text-gray-600">True: 25.00 mM</p>
								</div>
							</div>
						{/if}
					</div>
				{/if}
			{:else}
				<!-- Quiz -->
				<div class="glass-strong rounded-2xl border border-white/10 p-6">
					<h3 class="text-xl font-display font-semibold text-white mb-6">Knowledge Quiz</h3>
					<div class="space-y-6">
						{#each KINETICS_QUIZ as question}
							<div class="glass rounded-xl p-4 border border-white/5">
								<p class="text-white font-medium mb-3">{question.question}</p>
								<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
									{#each question.options as option}
										<button
											onclick={() => handleQuizAnswer(question.id, option)}
											class="p-2 rounded-lg text-sm text-left transition-all {state.quizAnswers.get(question.id) === option ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'glass border border-white/10 text-gray-300 hover:border-emerald-500/30'}"
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

			<button onclick={() => showQuiz = !showQuiz} class="w-full btn-secondary">
				{showQuiz ? 'Back to Lab' : 'Take Quiz'}
			</button>

			{#if showResults}
				<div class="glass-strong rounded-2xl p-6 border border-white/10 animate-fade-in-up">
					<h3 class="text-xl font-display font-semibold text-white mb-4">Lab Results</h3>
					<div class="grid grid-cols-2 gap-4 mb-6">
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Experiments</p>
							<p class="text-2xl font-bold text-white">{analysis.totalExperiments}</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Variables Explored</p>
							<p class="text-2xl font-bold text-white">{analysis.variablesExplored.length}/3</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Quiz Score</p>
							<p class="text-2xl font-bold text-white">{quizResults.correct}/{quizResults.total}</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Grade</p>
							<p class="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">{analysis.grade}</p>
						</div>
					</div>
					<p class="text-gray-400 mb-6">{analysis.feedback}</p>
					<div class="flex gap-3">
						<button onclick={() => { state = createInitialState({ defaultTemperature: 37, defaultPH: 7.0, defaultSubstrate: 25 }); showResults = false; showQuiz = false; labStore.reset(); }} class="btn-secondary flex-1">Try Again</button>
						<a href="/labs/biology" class="btn-primary flex-1 text-center">Back to Labs</a>
					</div>
				</div>
			{/if}
		</div>

		<!-- Right: Experiment Log -->
		<div class="lg:col-span-1 space-y-6">
			<div class="glass-strong rounded-2xl p-5 border border-white/10">
				<h4 class="text-sm font-semibold text-white mb-3">Experiment Log</h4>
				{#if state.experimentRuns.length === 0}
					<p class="text-xs text-gray-500 text-center py-4">No experiments run yet.</p>
				{:else}
					<div class="space-y-2 max-h-[300px] overflow-y-auto">
						{#each state.experimentRuns as run, i}
							<div class="glass rounded-lg p-2 border border-white/5">
								<div class="flex justify-between text-xs">
									<span class="text-gray-400">#{i + 1}</span>
									<span class="text-emerald-400 font-mono">{run.initialRate} mL/s</span>
								</div>
								<div class="text-[10px] text-gray-500 mt-1">
									{run.conditions.temperature}C | pH {run.conditions.pH} | {run.conditions.substrateConcentration}mM
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Quick Reference -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<h4 class="text-sm font-semibold text-white mb-3">Key Concepts</h4>
				<div class="space-y-3 text-xs text-gray-400">
					<div>
						<p class="text-white font-medium">Michaelis-Menten Equation</p>
						<p class="font-mono mt-1">V = Vmax[S] / (Km + [S])</p>
					</div>
					<div>
						<p class="text-white font-medium">Vmax</p>
						<p>Maximum rate at enzyme saturation</p>
					</div>
					<div>
						<p class="text-white font-medium">Km</p>
						<p>[S] at which rate = Vmax/2. Lower Km = higher affinity.</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
