<script lang="ts">
	import { onMount } from 'svelte';
	import { labStore } from '$stores/lab';
	import { aiStore } from '$stores/ai';
	import SafetyBanner from '$components/lab/SafetyBanner.svelte';
	import StepGuide from '$components/lab/StepGuide.svelte';
	import HintButton from '$components/ai/HintButton.svelte';

	import {
		createInitialState,
		setSubstance1,
		setSubstance2,
		setMass1,
		setMass2,
		setTemp1,
		setTemp2,
		startMixing,
		updateMixing,
		toggleConductionMode,
		startConduction,
		updateConduction,
		recordMeasurement,
		clearMeasurements,
		resetSimulation,
		calculateHeat,
		SUBSTANCES,
		CONDUCTION_MATERIALS,
		THERMO_QUIZ,
		analyzeExperiment,
		type ThermodynamicsState
	} from '$lib/simulations/physics/thermodynamics';
	import type { Experiment, LabSession } from '$types';

	const experiment: Experiment = {
		id: 'phy-thermodynamics-01',
		disciplineId: 'physics',
		title: 'Thermodynamics & Heat Transfer',
		description: 'Investigate heat transfer, calorimetry, and thermal equilibrium. Calculate specific heat capacity using Q = mcDeltaT.',
		difficulty: 'advanced',
		durationMinutes: 50,
		instructions: [
			{ id: 1, title: 'Introduction', description: 'Review Q = mcDeltaT and thermal equilibrium concepts.', hints: ['Heat flows from hot to cold'] },
			{ id: 2, title: 'Select Substances', description: 'Choose two substances at different temperatures.', hints: ['Try water and a metal'] },
			{ id: 3, title: 'Set Parameters', description: 'Adjust masses and initial temperatures.', hints: ['Large temperature difference gives clearer results'] },
			{ id: 4, title: 'Mix & Observe', description: 'Mix the substances and watch temperatures converge.', hints: ['Note the equilibrium temperature'] },
			{ id: 5, title: 'Record Data', description: 'Record the final equilibrium temperature and calculate heat transfer.', hints: ['Q_lost = Q_gained at equilibrium'] },
			{ id: 6, title: 'Calculate Specific Heat', description: 'Determine the specific heat of the unknown substance.', hints: ['c2 = m1*c1*DeltaT1 / (m2*DeltaT2)'] },
			{ id: 7, title: 'Conduction Rates', description: 'Compare heat conduction through different materials.', hints: ['Metals conduct heat faster than insulators'] },
			{ id: 8, title: 'Complete Quiz', description: 'Answer thermodynamics questions.', hints: ['Review calorimetry results'] }
		],
		simulationConfig: { type: 'thermodynamics', parameters: {} },
		safetyNotes: 'Virtual simulation. In a real lab, use caution with hot liquids and heated metals. Wear heat-resistant gloves.',
		learningObjectives: ['Apply Q = mcDeltaT to calculate heat transfer', 'Determine specific heat capacity by calorimetry', 'Compare thermal conductivity of different materials']
	};

	let state: ThermodynamicsState = $state(createInitialState({
		substance1Id: 'water',
		substance2Id: 'copper',
		mass1: 200,
		mass2: 100,
		temp1: 25,
		temp2: 80
	}));
	let showResults = $state(false);
	let mounted = $state(false);
	let showQuiz = $state(false);
	let isLabStarted = $state(false);
	let quizAnswers: Map<string, string> = $state(new Map());
	let animationFrameId: number | null = null;
	let lastTime = 0;

	let analysis = $derived(analyzeExperiment(state, quizAnswers));
	let heatQ = $derived(calculateHeat(state.mass1, state.substance1.specificHeat, state.equilibriumTemp - state.temp1));

	// SVG for temperature graph
	const graphW = 300;
	const graphH = 200;

	let tempGraphPath1 = $derived.by(() => {
		if (state.tempHistory.length < 2) return '';
		const maxTime = Math.max(state.timeToEquilibrium, ...state.tempHistory.map(p => p.time));
		return state.tempHistory.map((p, i) => {
			const x = 40 + (p.time / maxTime) * (graphW - 50);
			const y = graphH - 20 - ((p.temp1 - 0) / 100) * (graphH - 40);
			return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
		}).join(' ');
	});

	let tempGraphPath2 = $derived.by(() => {
		if (state.tempHistory.length < 2) return '';
		const maxTime = Math.max(state.timeToEquilibrium, ...state.tempHistory.map(p => p.time));
		return state.tempHistory.map((p, i) => {
			const x = 40 + (p.time / maxTime) * (graphW - 50);
			const y = graphH - 20 - ((p.temp2 - 0) / 100) * (graphH - 40);
			return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
		}).join(' ');
	});

	onMount(() => {
		mounted = true;
		return () => {
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
		};
	});

	function startLab() {
		isLabStarted = true;
		const session: LabSession = {
			id: crypto.randomUUID(),
			userId: '',
			experimentId: experiment.id,
			status: 'in_progress',
			startedAt: new Date(),
			completedAt: null,
			data: { currentStep: 0, measurements: [], notes: [], actions: [] },
			score: null
		};
		labStore.startLab(experiment, session);
		aiStore.setContext({ discipline: 'physics', experimentTitle: experiment.title, currentStep: 0, studentLevel: 'advanced', recentMeasurements: [] });
	}

	function animate(currentTime: number) {
		const deltaTime = lastTime ? (currentTime - lastTime) / 1000 : 0;
		lastTime = currentTime;

		if (state.isMixing) {
			state = updateMixing(state, deltaTime);
			if (state.isMixing) {
				animationFrameId = requestAnimationFrame(animate);
			} else {
				animationFrameId = null;
				lastTime = 0;
			}
		} else if (state.conductionRunning) {
			state = updateConduction(state, deltaTime);
			if (state.conductionTime < 60) {
				animationFrameId = requestAnimationFrame(animate);
			} else {
				animationFrameId = null;
				lastTime = 0;
			}
		}
	}

	function handleMix() {
		state = startMixing(state);
		lastTime = 0;
		animationFrameId = requestAnimationFrame(animate);
	}

	function handleStartConduction() {
		state = startConduction(state);
		lastTime = 0;
		animationFrameId = requestAnimationFrame(animate);
	}

	function handleReset() {
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
		state = resetSimulation(state);
	}

	function handleQuizAnswer(questionId: string, answer: string) {
		const newAnswers = new Map(quizAnswers);
		newAnswers.set(questionId, answer);
		quizAnswers = newAnswers;
	}

	function handleComplete() {
		showResults = true;
		labStore.completeLab();
	}

	function tempToColor(temp: number): string {
		// Blue (cold) to Red (hot) gradient
		const ratio = Math.max(0, Math.min(1, (temp - 0) / 100));
		if (ratio < 0.5) {
			const r = Math.round(ratio * 2 * 255);
			return `rgb(${r}, ${Math.round(100 - ratio * 100)}, 255)`;
		} else {
			const b = Math.round((1 - ratio) * 2 * 255);
			return `rgb(255, ${Math.round((1 - ratio) * 150)}, ${b})`;
		}
	}
</script>

<svelte:head>
	<title>Thermodynamics & Heat Transfer - AfriLab</title>
</svelte:head>

<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-red-500/10 to-transparent rounded-full blur-3xl"></div>
</div>

<div class="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
		<div>
			<div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
				<a href="/dashboard" class="hover:text-amber-400 transition-colors">Dashboard</a>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
				<a href="/labs/physics" class="hover:text-amber-400 transition-colors">Physics</a>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
				<span class="text-amber-400">Thermodynamics</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-display font-bold text-white">{experiment.title}</h1>
		</div>
		<button onclick={() => aiStore.open()} class="btn-primary">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
			Ask AI
		</button>
	</div>

	<div class="mb-6"><SafetyBanner level="warning" message="Virtual simulation. In a real lab, use heat-resistant gloves and caution when handling hot materials." /></div>

	{#if !isLabStarted}
		<div class="max-w-2xl mx-auto">
			<div class="glass-strong rounded-2xl p-8 border border-white/10 text-center">
				<div class="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center mb-6">
					<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
					</svg>
				</div>
				<h2 class="text-2xl font-display font-bold text-white mb-3">Thermodynamics & Heat Transfer Lab</h2>
				<p class="text-gray-400 mb-6">Mix hot and cold substances in a virtual calorimeter, measure temperature changes, calculate specific heat capacity, and compare thermal conductivity of materials.</p>

				<div class="inline-flex items-center gap-4 px-6 py-4 rounded-xl glass border border-white/10 mb-8">
					<span class="text-gray-400">Calorimetry:</span>
					<span class="font-mono text-2xl">
						<span class="text-amber-400">Q</span>
						<span class="text-gray-500"> = </span>
						<span class="text-cyan-400">m</span>
						<span class="text-emerald-400">c</span>
						<span class="text-rose-400">DT</span>
					</span>
				</div>

				<div class="grid grid-cols-2 gap-4 mb-8 text-left">
					<div class="glass rounded-xl p-4 border border-white/10">
						<h3 class="font-semibold text-white mb-2"><span class="text-amber-400">1.</span> Calorimetry</h3>
						<p class="text-sm text-gray-400">Mix hot and cold substances and observe thermal equilibrium.</p>
					</div>
					<div class="glass rounded-xl p-4 border border-white/10">
						<h3 class="font-semibold text-white mb-2"><span class="text-amber-400">2.</span> Measure Temperature</h3>
						<p class="text-sm text-gray-400">Track temperature changes over time as substances reach equilibrium.</p>
					</div>
					<div class="glass rounded-xl p-4 border border-white/10">
						<h3 class="font-semibold text-white mb-2"><span class="text-amber-400">3.</span> Specific Heat</h3>
						<p class="text-sm text-gray-400">Calculate the specific heat capacity from your data.</p>
					</div>
					<div class="glass rounded-xl p-4 border border-white/10">
						<h3 class="font-semibold text-white mb-2"><span class="text-amber-400">4.</span> Conduction</h3>
						<p class="text-sm text-gray-400">Compare how quickly different materials conduct heat.</p>
					</div>
				</div>

				<button onclick={startLab} class="px-8 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all transform hover:scale-105">
					Begin Lab Session
				</button>
			</div>
		</div>

	{:else if showResults}
		<div class="max-w-2xl mx-auto">
			<div class="glass-strong rounded-2xl p-8 border border-white/10">
				<div class="text-center mb-8">
					<div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4
						{analysis.grade === 'A' ? 'bg-emerald-500/20 text-emerald-400' : analysis.grade === 'B' ? 'bg-cyan-500/20 text-cyan-400' : analysis.grade === 'C' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}">
						<span class="text-4xl font-display font-bold">{analysis.grade}</span>
					</div>
					<h2 class="text-2xl font-display font-bold text-white">Lab Complete!</h2>
					<p class="text-gray-400 mt-2">Score: {analysis.score}/100</p>
				</div>
				<div class="grid grid-cols-2 gap-4 mb-6">
					<div class="glass rounded-xl p-4 border border-white/5 text-center">
						<p class="text-sm text-gray-400">Quiz Score</p>
						<p class="text-2xl font-bold text-white">{analysis.quizScore.correct}/{analysis.quizScore.total}</p>
					</div>
					<div class="glass rounded-xl p-4 border border-white/5 text-center">
						<p class="text-sm text-gray-400">Measurements</p>
						<p class="text-2xl font-bold text-white">{state.measurements.length}</p>
					</div>
				</div>
				<div class="glass rounded-xl p-4 border border-white/10 mb-6">
					<p class="text-sm text-gray-400">{analysis.feedback}</p>
				</div>
				<div class="flex gap-4">
					<button onclick={() => { state = createInitialState({ substance1Id: 'water', substance2Id: 'copper', mass1: 200, mass2: 100, temp1: 25, temp2: 80 }); quizAnswers = new Map(); showResults = false; showQuiz = false; isLabStarted = false; labStore.reset(); }} class="flex-1 py-3 px-6 rounded-xl glass border border-white/10 text-white font-medium">Try Again</button>
					<a href="/labs/physics" class="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold text-center">Back to Physics</a>
				</div>
			</div>
		</div>

	{:else}
		<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
			<!-- Left: Steps -->
			<div class="lg:col-span-1 space-y-6">
				<StepGuide steps={experiment.instructions} currentStepIndex={$labStore.currentStepIndex} />
				<div class="glass rounded-2xl p-4 border border-white/5">
					<HintButton experimentId={experiment.id} stepId={$labStore.currentStepIndex + 1} stepTitle={experiment.instructions[$labStore.currentStepIndex]?.title} />
				</div>
			</div>

			<!-- Center: Visualization -->
			<div class="lg:col-span-2 space-y-6">
				{#if !showQuiz}
					<!-- Mode Toggle -->
					<div class="glass rounded-xl p-1 border border-white/10 flex">
						<button
							onclick={() => { if (state.conductionMode) state = toggleConductionMode(state); }}
							class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
								{!state.conductionMode ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-white' : 'text-gray-400 hover:text-white'}"
						>
							Calorimetry
						</button>
						<button
							onclick={() => { if (!state.conductionMode) state = toggleConductionMode(state); }}
							class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
								{state.conductionMode ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-white' : 'text-gray-400 hover:text-white'}"
						>
							Heat Conduction
						</button>
					</div>

					{#if !state.conductionMode}
						<!-- Calorimeter Visualization -->
						<div class="glass-strong rounded-2xl border border-white/10 overflow-hidden">
							<svg class="w-full" viewBox="0 0 600 350" preserveAspectRatio="xMidYMid meet">
								<defs>
									<linearGradient id="thermoBg" x1="0%" y1="0%" x2="0%" y2="100%">
										<stop offset="0%" stop-color="#0f172a" />
										<stop offset="100%" stop-color="#1e293b" />
									</linearGradient>
								</defs>
								<rect width="100%" height="100%" fill="url(#thermoBg)" />

								<!-- Calorimeter (beaker) -->
								<g transform="translate(150, 60)">
									<!-- Beaker outline -->
									<rect x="0" y="0" width="140" height="200" fill="none" stroke="#6B7280" stroke-width="2" rx="4" />
									<rect x="0" y="10" width="140" height="2" fill="#6B7280" opacity="0.5" />

									<!-- Substance 1 (bottom half) -->
									{#if true}
									{@const fill1Height = Math.min(180, (state.mass1 / 500) * 180)}
									<rect x="2" y={200 - fill1Height} width="136" height={fill1Height} fill={state.substance1.color} opacity="0.5" rx="2" />
									{/if}

									<!-- Substance 2 (before mixing, separate; after mixing, blended) -->
									{#if !state.isMixed && !state.isMixing}
										<!-- Show substance 2 as separate container on the right -->
										<g transform="translate(180, 50)">
											<rect x="0" y="0" width="100" height="150" fill="none" stroke="#6B7280" stroke-width="2" rx="4" />
											{#if true}
											{@const fill2Height = Math.min(130, (state.mass2 / 500) * 130)}
											<rect x="2" y={150 - fill2Height} width="96" height={fill2Height} fill={state.substance2.color} opacity="0.5" rx="2" />
											<text x="50" y="-10" fill="#D1D5DB" font-size="10" text-anchor="middle">{state.substance2.name}</text>
											<text x="50" y={150 - fill2Height - 5} fill="white" font-size="12" text-anchor="middle">{state.currentTemp2.toFixed(1)}C</text>
											{/if}
										</g>
									{:else}
										<!-- Mixed: show blended in main beaker -->
										{@const totalFill = Math.min(190, ((state.mass1 + state.mass2) / 700) * 190)}
										<rect x="2" y={200 - totalFill} width="136" height={totalFill} fill={state.substance1.color} opacity="0.3" rx="2" />
										<rect x="2" y={200 - totalFill} width="136" height={totalFill} fill={state.substance2.color} opacity="0.3" rx="2" />
									{/if}

									<!-- Temperature reading for substance 1 / mixed -->
									<text x="70" y={200 - fill1Height - 5} fill="white" font-size="14" text-anchor="middle" font-weight="bold">
										{state.currentTemp1.toFixed(1)}C
									</text>
									<text x="70" y="-10" fill="#D1D5DB" font-size="10" text-anchor="middle">{state.substance1.name}</text>

									<!-- Thermometer -->
									<g transform="translate(-30, 20)">
										<rect x="8" y="0" width="8" height="160" fill="#374151" rx="4" />
										{#if true}
										{@const tempHeight = ((state.currentTemp1 - 0) / 100) * 150}
										<rect x="9" y={160 - tempHeight} width="6" height={tempHeight} fill={tempToColor(state.currentTemp1)} rx="3" />
										<circle cx="12" cy="165" r="10" fill={tempToColor(state.currentTemp1)} />
										{/if}
										<!-- Scale marks -->
										{#each [0, 25, 50, 75, 100] as t}
											{@const ty = 160 - (t / 100) * 150}
											<line x1="18" y1={ty} x2="24" y2={ty} stroke="#6B7280" stroke-width="1" />
											<text x="28" y={ty + 3} fill="#9CA3AF" font-size="7">{t}</text>
										{/each}
									</g>
								</g>

								<!-- Mixing progress -->
								{#if state.isMixing}
									<g transform="translate(150, 280)">
										<rect x="0" y="0" width="300" height="8" fill="#374151" rx="4" />
										<rect x="0" y="0" width={300 * state.mixingProgress} height="8" fill="#F59E0B" rx="4" />
										<text x="150" y="22" fill="#D1D5DB" font-size="10" text-anchor="middle">Mixing... {(state.mixingProgress * 100).toFixed(0)}%</text>
									</g>
								{/if}

								<!-- Equilibrium indicator -->
								{#if state.isMixed}
									<g transform="translate(200, 290)">
										<text fill="#22C55E" font-size="12" font-weight="bold">Thermal Equilibrium Reached!</text>
										<text y="18" fill="#D1D5DB" font-size="10">T_eq = {state.equilibriumTemp.toFixed(1)}C</text>
									</g>
								{/if}

								<!-- Predicted equilibrium line -->
								<g transform="translate(10, 310)">
									<text fill="#9CA3AF" font-size="9">Predicted T_eq: {state.equilibriumTemp.toFixed(2)}C | Q = {heatQ.toFixed(1)} J</text>
								</g>
							</svg>
						</div>

						<!-- Temperature Graph -->
						<div class="glass-strong rounded-2xl border border-white/10 p-4">
							<h4 class="text-sm font-semibold text-white mb-2">Temperature vs Time</h4>
							<svg viewBox="0 0 {graphW} {graphH}" class="w-full">
								<rect width={graphW} height={graphH} fill="#111827" rx="4" />
								<!-- Axes -->
								<line x1="40" y1={graphH - 20} x2={graphW - 10} y2={graphH - 20} stroke="#4B5563" stroke-width="1" />
								<line x1="40" y1="10" x2="40" y2={graphH - 20} stroke="#4B5563" stroke-width="1" />
								<text x={graphW / 2} y={graphH - 3} fill="#9CA3AF" font-size="8" text-anchor="middle">Time (s)</text>
								<text x="8" y={graphH / 2} fill="#9CA3AF" font-size="8" text-anchor="middle" transform="rotate(-90, 8, {graphH / 2})">T (C)</text>

								<!-- Y-axis labels -->
								{#each [0, 25, 50, 75, 100] as t}
									{@const y = graphH - 20 - (t / 100) * (graphH - 40)}
									<text x="35" y={y + 3} fill="#6B7280" font-size="7" text-anchor="end">{t}</text>
									<line x1="37" y1={y} x2="40" y2={y} stroke="#4B5563" stroke-width="0.5" />
								{/each}

								<!-- Equilibrium line (dashed) -->
								{#if true}
								{@const eqY = graphH - 20 - (state.equilibriumTemp / 100) * (graphH - 40)}
								<line x1="40" y1={eqY} x2={graphW - 10} y2={eqY} stroke="#F59E0B" stroke-width="1" stroke-dasharray="4,4" opacity="0.5" />
								{/if}

								<!-- Temperature curves -->
								{#if tempGraphPath1}
									<path d={tempGraphPath1} fill="none" stroke={state.substance1.color} stroke-width="2" />
								{/if}
								{#if tempGraphPath2}
									<path d={tempGraphPath2} fill="none" stroke={state.substance2.color} stroke-width="2" />
								{/if}

								<!-- Legend -->
								<g transform="translate({graphW - 100}, 15)">
									<rect x="-5" y="-5" width="95" height="35" fill="#1F2937" fill-opacity="0.8" rx="4" />
									<line x1="0" y1="5" x2="15" y2="5" stroke={state.substance1.color} stroke-width="2" />
									<text x="20" y="8" fill="#D1D5DB" font-size="8">{state.substance1.name}</text>
									<line x1="0" y1="20" x2="15" y2="20" stroke={state.substance2.color} stroke-width="2" />
									<text x="20" y="23" fill="#D1D5DB" font-size="8">{state.substance2.name}</text>
								</g>
							</svg>
						</div>

						<!-- Calorimetry Controls -->
						<div class="glass-strong rounded-2xl border border-white/10 p-4 space-y-4">
							<div class="grid grid-cols-2 gap-4">
								<div>
									<label class="text-sm text-gray-400 block mb-1">Substance 1</label>
									<select value={state.substance1.id} onchange={(e) => state = setSubstance1(state, e.currentTarget.value)} disabled={state.isMixing || state.isMixed} class="w-full glass rounded-lg px-3 py-2 text-white text-sm border border-white/10">
										{#each SUBSTANCES as s}
											<option value={s.id}>{s.name} (c={s.specificHeat})</option>
										{/each}
									</select>
								</div>
								<div>
									<label class="text-sm text-gray-400 block mb-1">Substance 2</label>
									<select value={state.substance2.id} onchange={(e) => state = setSubstance2(state, e.currentTarget.value)} disabled={state.isMixing || state.isMixed} class="w-full glass rounded-lg px-3 py-2 text-white text-sm border border-white/10">
										{#each SUBSTANCES as s}
											<option value={s.id}>{s.name} (c={s.specificHeat})</option>
										{/each}
									</select>
								</div>
							</div>

							<div class="grid grid-cols-2 gap-4">
								<div>
									<label class="text-sm text-gray-400 block mb-1">Mass 1: {state.mass1}g</label>
									<input type="range" min="10" max="500" step="10" value={state.mass1} oninput={(e) => state = setMass1(state, parseFloat(e.currentTarget.value))} disabled={state.isMixing || state.isMixed} class="w-full accent-amber-500" />
								</div>
								<div>
									<label class="text-sm text-gray-400 block mb-1">Mass 2: {state.mass2}g</label>
									<input type="range" min="10" max="500" step="10" value={state.mass2} oninput={(e) => state = setMass2(state, parseFloat(e.currentTarget.value))} disabled={state.isMixing || state.isMixed} class="w-full accent-amber-500" />
								</div>
							</div>

							<div class="grid grid-cols-2 gap-4">
								<div>
									<label class="text-sm text-gray-400 block mb-1">Temp 1: {state.temp1.toFixed(0)}C</label>
									<input type="range" min="0" max="100" value={state.temp1} oninput={(e) => state = setTemp1(state, parseFloat(e.currentTarget.value))} disabled={state.isMixing || state.isMixed} class="w-full accent-blue-500" />
								</div>
								<div>
									<label class="text-sm text-gray-400 block mb-1">Temp 2: {state.temp2.toFixed(0)}C</label>
									<input type="range" min="0" max="100" value={state.temp2} oninput={(e) => state = setTemp2(state, parseFloat(e.currentTarget.value))} disabled={state.isMixing || state.isMixed} class="w-full accent-red-500" />
								</div>
							</div>

							<div class="flex gap-3">
								<button onclick={handleMix} disabled={state.isMixing || state.isMixed} class="flex-1 btn-primary disabled:opacity-50">Mix Substances</button>
								<button onclick={handleReset} class="flex-1 btn-secondary">Reset</button>
								<button onclick={() => state = recordMeasurement(state)} disabled={!state.isMixed} class="flex-1 btn-secondary disabled:opacity-50">Record</button>
							</div>

							<!-- Predicted values -->
							<div class="glass rounded-xl p-3 border border-white/5">
								<h4 class="text-sm font-semibold text-white mb-2">Calculated Values</h4>
								<div class="grid grid-cols-2 gap-2 text-sm">
									<div><span class="text-gray-400">T_eq:</span> <span class="text-amber-400">{state.equilibriumTemp.toFixed(2)}C</span></div>
									<div><span class="text-gray-400">Q:</span> <span class="text-cyan-400">{heatQ.toFixed(1)} J</span></div>
								</div>
							</div>
						</div>

					{:else}
						<!-- Conduction Mode -->
						<div class="glass-strong rounded-2xl border border-white/10 overflow-hidden">
							<svg class="w-full" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet">
								<rect width="100%" height="100%" fill="#0f172a" />

								<text x="300" y="25" fill="#D1D5DB" font-size="12" text-anchor="middle" font-weight="bold">Heat Conduction Comparison (100C hot end)</text>

								<!-- Material rods -->
								{#each state.conductionMaterials as mat, i}
									{@const y = 50 + i * 48}
									{@const barWidth = Math.max(5, ((mat.currentTemp - 25) / 75) * 400)}

									<!-- Label -->
									<text x="5" y={y + 20} fill="#D1D5DB" font-size="10">{mat.name}</text>

									<!-- Rod background -->
									<rect x="80" y={y + 5} width="400" height="25" fill="#1F2937" rx="4" />

									<!-- Heat progress -->
									<rect x="80" y={y + 5} width={barWidth} height="25" fill={mat.color} opacity="0.6" rx="4" />

									<!-- Temperature -->
									<text x="490" y={y + 22} fill="#D1D5DB" font-size="10">{mat.currentTemp.toFixed(1)}C</text>

									<!-- Hot end marker -->
									<rect x="75" y={y + 2} width="5" height="31" fill="#EF4444" rx="2" />
								{/each}

								<!-- Time display -->
								<text x="300" y="290" fill="#9CA3AF" font-size="10" text-anchor="middle">Time: {state.conductionTime.toFixed(1)}s</text>
							</svg>
						</div>

						<!-- Conduction Controls -->
						<div class="glass-strong rounded-2xl border border-white/10 p-4 space-y-4">
							<p class="text-sm text-gray-400">Compare how quickly different materials conduct heat from a 100C source. Metals with higher thermal conductivity heat up faster.</p>
							<div class="flex gap-3">
								<button onclick={handleStartConduction} disabled={state.conductionRunning} class="flex-1 btn-primary disabled:opacity-50">Start Conduction</button>
								<button onclick={handleReset} class="flex-1 btn-secondary">Reset</button>
								<button onclick={() => state = recordMeasurement(state)} disabled={state.conductionTime < 5} class="flex-1 btn-secondary disabled:opacity-50">Record</button>
							</div>

							<!-- Material conductivity table -->
							<div class="glass rounded-xl p-3 border border-white/5">
								<h4 class="text-sm font-semibold text-white mb-2">Thermal Conductivity (W/m*K)</h4>
								<div class="grid grid-cols-5 gap-2 text-xs text-center">
									{#each CONDUCTION_MATERIALS as mat}
										<div>
											<div class="w-4 h-4 rounded-full mx-auto mb-1" style="background-color: {mat.color}"></div>
											<span class="text-gray-400">{mat.name}</span>
											<span class="block text-amber-400">{mat.thermalConductivity}</span>
										</div>
									{/each}
								</div>
							</div>
						</div>
					{/if}
				{:else}
					<!-- Quiz -->
					<div class="glass-strong rounded-2xl border border-white/10 p-6">
						<h3 class="text-xl font-display font-semibold text-white mb-6">Knowledge Quiz</h3>
						<div class="space-y-6">
							{#each THERMO_QUIZ as question}
								<div class="glass rounded-xl p-4 border border-white/5">
									<p class="text-white font-medium mb-3">{question.question}</p>
									<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
										{#each question.options as option}
											<button onclick={() => handleQuizAnswer(question.id, option)} class="p-2 rounded-lg text-sm text-left transition-all {quizAnswers.get(question.id) === option ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'glass border border-white/10 text-gray-300 hover:border-amber-500/30'}">
												{option}
											</button>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<button onclick={() => showQuiz = !showQuiz} class="w-full btn-secondary">{showQuiz ? 'Back to Simulation' : 'Take Quiz'}</button>

				{#if state.measurements.length >= 2}
					<button onclick={handleComplete} class="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all">
						Complete Lab & Analyze
					</button>
				{/if}
			</div>

			<!-- Right: Data -->
			<div class="lg:col-span-1 space-y-6">
				<div class="glass-strong rounded-2xl p-5 border border-white/10">
					<div class="flex justify-between items-center mb-4">
						<h4 class="text-sm font-semibold text-white">Recorded Data</h4>
						{#if state.measurements.length > 0}
							<button onclick={() => state = clearMeasurements(state)} class="text-xs text-gray-400 hover:text-red-400">Clear</button>
						{/if}
					</div>
					{#if state.measurements.length === 0}
						<p class="text-sm text-gray-500">Mix substances or run conduction, then record.</p>
					{:else}
						<div class="space-y-2 max-h-64 overflow-y-auto">
							{#each state.measurements as m, i}
								<div class="glass rounded-lg p-2 text-xs border border-white/5">
									<div class="flex justify-between text-gray-400">
										<span>#{i + 1}</span>
										<span class="capitalize">{m.type}</span>
									</div>
									{#if m.type === 'calorimetry'}
										<div class="flex justify-between mt-1"><span class="text-gray-500">T1 init:</span><span class="text-blue-400">{m.initialTemp1?.toFixed(1)}C</span></div>
										<div class="flex justify-between"><span class="text-gray-500">T2 init:</span><span class="text-red-400">{m.initialTemp2?.toFixed(1)}C</span></div>
										<div class="flex justify-between"><span class="text-gray-500">T_eq:</span><span class="text-amber-400">{m.finalTemp?.toFixed(1)}C</span></div>
										<div class="flex justify-between"><span class="text-gray-500">Q:</span><span class="text-cyan-400">{m.heatTransferred?.toFixed(1)} J</span></div>
										{#if m.calculatedSpecificHeat && m.calculatedSpecificHeat > 0}
											<div class="flex justify-between"><span class="text-gray-500">c2 (calc):</span><span class="text-emerald-400">{m.calculatedSpecificHeat.toFixed(3)}</span></div>
										{/if}
									{:else}
										<div class="flex justify-between mt-1"><span class="text-gray-500">Material:</span><span class="text-amber-400">{m.materialName}</span></div>
										<div class="flex justify-between"><span class="text-gray-500">Rate:</span><span class="text-cyan-400">{m.conductionRate?.toFixed(2)} C/s</span></div>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<div class="glass rounded-2xl p-5 border border-white/5">
					<h4 class="text-sm font-semibold text-white mb-3">Key Equations</h4>
					<div class="space-y-2 text-xs text-gray-400 font-mono">
						<p>Q = m * c * DeltaT</p>
						<p>Q_lost + Q_gained = 0</p>
						<p>T_eq = (m1c1T1 + m2c2T2) / (m1c1 + m2c2)</p>
						<p>dQ/dt = k * A * DeltaT / L</p>
					</div>
				</div>

				<div class="glass rounded-2xl p-5 border border-white/5">
					<h4 class="text-sm font-semibold text-white mb-3">Substance Properties</h4>
					<div class="space-y-1 text-xs text-gray-400">
						{#each SUBSTANCES as s}
							<div class="flex justify-between">
								<span>{s.name}</span>
								<span class="text-amber-400">c = {s.specificHeat} J/(g*C)</span>
							</div>
						{/each}
					</div>
				</div>

				<div class="glass rounded-2xl p-5 border border-white/5">
					<h4 class="text-sm font-semibold text-white mb-3">Objectives</h4>
					<ul class="space-y-2 text-xs text-gray-400">
						{#each experiment.learningObjectives as obj}
							<li class="flex items-start gap-2">
								<svg class="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" /></svg>
								{obj}
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	{/if}
</div>
