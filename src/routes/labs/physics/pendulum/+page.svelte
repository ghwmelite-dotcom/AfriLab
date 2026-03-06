<script lang="ts">
	import { onMount } from 'svelte';
	import { labStore } from '$stores/lab';
	import { aiStore } from '$stores/ai';
	import SafetyBanner from '$components/lab/SafetyBanner.svelte';
	import StepGuide from '$components/lab/StepGuide.svelte';
	import HintButton from '$components/ai/HintButton.svelte';

	import {
		createInitialState,
		setLength,
		setInitialAngle,
		startSwing,
		stopSwing,
		startStopwatch,
		stopStopwatch,
		resetStopwatch,
		updateSimulation,
		recordMeasurement,
		clearMeasurements,
		toggleTrail,
		resetSimulation,
		calculateTheoreticalPeriod,
		LENGTH_PRESETS,
		PENDULUM_QUIZ,
		analyzeExperiment,
		type PendulumState
	} from '$lib/simulations/physics/pendulum';
	import type { Experiment, LabSession } from '$types';

	const experiment: Experiment = {
		id: 'phy-pendulum-01',
		disciplineId: 'physics',
		title: 'Simple Pendulum & SHM',
		description: 'Investigate simple harmonic motion using a pendulum, measuring period vs length and verifying T = 2*pi*sqrt(L/g).',
		difficulty: 'beginner',
		durationMinutes: 30,
		instructions: [
			{ id: 1, title: 'Introduction', description: 'Review the simple pendulum equation and SHM concepts.', hints: ['T = 2*pi*sqrt(L/g)'] },
			{ id: 2, title: 'Set Length', description: 'Choose a pendulum length to begin.', hints: ['Start with a short length like 0.25m'] },
			{ id: 3, title: 'Release & Time', description: 'Release the pendulum and use the stopwatch to measure the period.', hints: ['Count multiple swings for accuracy'] },
			{ id: 4, title: 'Record Data', description: 'Record the measured period for this length.', hints: ['Make sure the stopwatch has counted at least 2 half-cycles'] },
			{ id: 5, title: 'Vary Length', description: 'Repeat for at least 5 different lengths.', hints: ['Use the preset lengths for systematic data'] },
			{ id: 6, title: 'Plot T^2 vs L', description: 'Examine your T^2 vs L graph - it should be linear.', hints: ['The slope equals 4*pi^2/g'] },
			{ id: 7, title: 'Calculate g', description: 'Determine g from the slope of your T^2 vs L graph.', hints: ['g = 4*pi^2 / slope'] },
			{ id: 8, title: 'Complete Quiz', description: 'Answer questions about pendulum motion.', hints: ['Review your observations'] }
		],
		simulationConfig: { type: 'pendulum', parameters: {} },
		safetyNotes: 'This is a virtual simulation. No physical hazards.',
		learningObjectives: ['Verify T = 2*pi*sqrt(L/g)', 'Measure period by timing multiple swings', 'Determine g experimentally from T^2 vs L graph']
	};

	let state: PendulumState = $state(createInitialState({ length: 1.0, initialAngle: 15, gravity: 9.81 }));
	let showResults = $state(false);
	let mounted = $state(false);
	let showQuiz = $state(false);
	let isLabStarted = $state(false);
	let quizAnswers: Map<string, string> = $state(new Map());
	let animationFrameId: number | null = null;
	let lastTime = 0;

	// SVG dimensions
	const svgWidth = 600;
	const svgHeight = 450;
	const pivotX = 300;
	const pivotY = 60;
	const scale = 150; // pixels per meter

	let theoretical = $derived(calculateTheoreticalPeriod(state.length, state.gravity));
	let analysis = $derived(analyzeExperiment(state, quizAnswers));

	// Bob position derived from current angle
	let bobX = $derived(pivotX + Math.sin((state.currentAngle * Math.PI) / 180) * state.length * scale);
	let bobY = $derived(pivotY + Math.cos((state.currentAngle * Math.PI) / 180) * state.length * scale);

	let fullSwings = $derived(Math.floor(state.stopwatchLaps / 2));

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
		aiStore.setContext({ discipline: 'physics', experimentTitle: experiment.title, currentStep: 0, studentLevel: 'beginner', recentMeasurements: [] });
	}

	function animate(currentTime: number) {
		if (!state.isSwinging) {
			animationFrameId = null;
			return;
		}
		const deltaTime = lastTime ? (currentTime - lastTime) / 1000 : 0;
		lastTime = currentTime;
		state = updateSimulation(state, deltaTime);
		if (state.isSwinging) {
			animationFrameId = requestAnimationFrame(animate);
		} else {
			animationFrameId = null;
			lastTime = 0;
		}
	}

	function handleRelease() {
		state = startSwing(state);
		lastTime = 0;
		animationFrameId = requestAnimationFrame(animate);
	}

	function handleStop() {
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
		state = stopSwing(state);
	}

	function handleReset() {
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
		state = resetSimulation(state);
	}

	function handleRecord() {
		state = recordMeasurement(state);
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

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toFixed(2).padStart(5, '0')}`;
	}
</script>

<svelte:head>
	<title>Simple Pendulum & SHM - AfriLab</title>
</svelte:head>

<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-amber-500/10 to-transparent rounded-full blur-3xl"></div>
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
				<span class="text-amber-400">Pendulum</span>
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

	<div class="mb-6"><SafetyBanner level="info" message="Virtual pendulum simulation. Observe how length affects the period of oscillation." /></div>

	{#if !isLabStarted}
		<!-- Pre-lab Introduction -->
		<div class="max-w-2xl mx-auto">
			<div class="glass-strong rounded-2xl p-8 border border-white/10 text-center">
				<div class="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6">
					<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<circle cx="12" cy="5" r="2" stroke-width="2" />
						<line x1="12" y1="7" x2="12" y2="17" stroke-width="2" />
						<circle cx="12" cy="19" r="3" stroke-width="2" fill="currentColor" />
					</svg>
				</div>

				<h2 class="text-2xl font-display font-bold text-white mb-3">Simple Pendulum & SHM Lab</h2>
				<p class="text-gray-400 mb-6">Investigate simple harmonic motion by measuring how the period of a pendulum depends on its length. Verify the equation T = 2pi * sqrt(L/g) and calculate g experimentally.</p>

				<div class="inline-flex items-center gap-4 px-6 py-4 rounded-xl glass border border-white/10 mb-8">
					<span class="text-gray-400">Pendulum Equation:</span>
					<span class="font-mono text-2xl">
						<span class="text-amber-400">T</span>
						<span class="text-gray-500"> = 2pi</span>
						<span class="text-cyan-400">sqrt(L/g)</span>
					</span>
				</div>

				<div class="grid grid-cols-2 gap-4 mb-8 text-left">
					<div class="glass rounded-xl p-4 border border-white/10">
						<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
							<span class="text-amber-400">1.</span> Set Pendulum Length
						</h3>
						<p class="text-sm text-gray-400">Choose different lengths from 0.1m to 2.0m.</p>
					</div>
					<div class="glass rounded-xl p-4 border border-white/10">
						<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
							<span class="text-amber-400">2.</span> Measure the Period
						</h3>
						<p class="text-sm text-gray-400">Use the stopwatch to time multiple swings.</p>
					</div>
					<div class="glass rounded-xl p-4 border border-white/10">
						<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
							<span class="text-amber-400">3.</span> Plot T^2 vs L
						</h3>
						<p class="text-sm text-gray-400">Graph your data to find the linear relationship.</p>
					</div>
					<div class="glass rounded-xl p-4 border border-white/10">
						<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
							<span class="text-amber-400">4.</span> Calculate g
						</h3>
						<p class="text-sm text-gray-400">Determine gravitational acceleration from the slope.</p>
					</div>
				</div>

				<button onclick={startLab} class="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all transform hover:scale-105">
					Begin Lab Session
				</button>
			</div>
		</div>

	{:else if showResults}
		<!-- Results Screen -->
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
					<div class="glass rounded-xl p-4 border border-white/5 text-center">
						<p class="text-sm text-gray-400">Average g</p>
						<p class="text-2xl font-bold text-amber-400">{analysis.averageCalculatedG.toFixed(2)} m/s^2</p>
					</div>
					<div class="glass rounded-xl p-4 border border-white/5 text-center">
						<p class="text-sm text-gray-400">g Error</p>
						<p class="text-2xl font-bold text-cyan-400">{analysis.gError.toFixed(1)}%</p>
					</div>
				</div>

				{#if analysis.gFromSlope > 0}
					<div class="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
						<p class="text-amber-400 font-medium">g from graph slope: {analysis.gFromSlope.toFixed(2)} m/s^2</p>
					</div>
				{/if}

				<div class="glass rounded-xl p-4 border border-white/10 mb-6">
					<h3 class="font-semibold text-white mb-2">Feedback</h3>
					<p class="text-sm text-gray-400">{analysis.feedback}</p>
				</div>

				<div class="flex gap-4">
					<button onclick={() => { state = createInitialState({ length: 1.0, initialAngle: 15, gravity: 9.81 }); quizAnswers = new Map(); showResults = false; showQuiz = false; labStore.reset(); isLabStarted = false; }} class="flex-1 py-3 px-6 rounded-xl glass border border-white/10 hover:border-white/20 text-white font-medium transition-all">Try Again</button>
					<a href="/labs/physics" class="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-center hover:shadow-lg hover:shadow-amber-500/25 transition-all">Back to Physics</a>
				</div>
			</div>
		</div>

	{:else}
		<!-- Active Lab -->
		<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
			<!-- Left: Steps -->
			<div class="lg:col-span-1 space-y-6">
				<StepGuide steps={experiment.instructions} currentStepIndex={$labStore.currentStepIndex} />
				<div class="glass rounded-2xl p-4 border border-white/5">
					<HintButton experimentId={experiment.id} stepId={$labStore.currentStepIndex + 1} stepTitle={experiment.instructions[$labStore.currentStepIndex]?.title} />
				</div>
			</div>

			<!-- Center: Simulation -->
			<div class="lg:col-span-2 space-y-6">
				{#if !showQuiz}
					<!-- Pendulum Visualization -->
					<div class="glass-strong rounded-2xl border border-white/10 overflow-hidden">
						<svg class="w-full" viewBox="0 0 {svgWidth} {svgHeight}" preserveAspectRatio="xMidYMid meet">
							<defs>
								<linearGradient id="pendBg" x1="0%" y1="0%" x2="0%" y2="100%">
									<stop offset="0%" stop-color="#1e3a5f" />
									<stop offset="100%" stop-color="#0f172a" />
								</linearGradient>
								<radialGradient id="bobGrad">
									<stop offset="0%" stop-color="#FCD34D" />
									<stop offset="100%" stop-color="#F59E0B" />
								</radialGradient>
							</defs>
							<rect width="100%" height="100%" fill="url(#pendBg)" />

							<!-- Support bar -->
							<rect x={pivotX - 80} y={pivotY - 8} width="160" height="8" fill="#4B5563" rx="2" />

							<!-- Pivot point -->
							<circle cx={pivotX} cy={pivotY} r="5" fill="#6B7280" />

							<!-- Angle arc -->
							{#if !state.isSwinging}
								<path
									d="M {pivotX} {pivotY + 40} A 40 40 0 0 {state.initialAngle > 0 ? 0 : 1} {pivotX + Math.sin((state.initialAngle * Math.PI) / 180) * 40} {pivotY + Math.cos((state.initialAngle * Math.PI) / 180) * 40}"
									fill="none"
									stroke="#F59E0B"
									stroke-width="1.5"
									stroke-dasharray="3,3"
									opacity="0.6"
								/>
								<text x={pivotX + 25} y={pivotY + 55} fill="#F59E0B" font-size="11" opacity="0.8">{state.initialAngle}deg</text>
							{/if}

							<!-- Equilibrium line (dashed) -->
							<line x1={pivotX} y1={pivotY} x2={pivotX} y2={pivotY + state.length * scale + 30} stroke="#4B5563" stroke-width="1" stroke-dasharray="4,4" opacity="0.5" />

							<!-- String -->
							<line x1={pivotX} y1={pivotY} x2={bobX} y2={bobY} stroke="#D1D5DB" stroke-width="2" />

							<!-- Bob -->
							<circle cx={bobX} cy={bobY} r="18" fill="url(#bobGrad)" stroke="#FCD34D" stroke-width="2" />
							<circle cx={bobX - 4} cy={bobY - 4} r="4" fill="white" opacity="0.3" />

							<!-- Length label -->
							<text x={pivotX + 15} y={pivotY + (state.length * scale) / 2} fill="#9CA3AF" font-size="11" transform="rotate(0)">{state.length.toFixed(2)}m</text>

							<!-- Info panel -->
							<g transform="translate(15, 15)">
								<rect width="160" height="110" fill="#1F2937" fill-opacity="0.9" rx="8" />
								<text x="10" y="22" fill="#F59E0B" font-size="11" font-weight="bold">Pendulum State</text>
								<text x="10" y="40" fill="#D1D5DB" font-size="10">Angle: {state.currentAngle.toFixed(1)}deg</text>
								<text x="10" y="55" fill="#D1D5DB" font-size="10">Length: {state.length.toFixed(2)} m</text>
								<text x="10" y="70" fill="#D1D5DB" font-size="10">Time: {state.currentTime.toFixed(2)} s</text>
								<text x="10" y="85" fill="#9CA3AF" font-size="10">T(theory): {theoretical.toFixed(3)} s</text>
								<text x="10" y="100" fill="#9CA3AF" font-size="10">g = 9.81 m/s^2</text>
							</g>
						</svg>
					</div>

					<!-- Stopwatch -->
					<div class="glass-strong rounded-2xl border border-white/10 p-4">
						<div class="flex items-center justify-between mb-3">
							<h4 class="text-sm font-semibold text-white">Virtual Stopwatch</h4>
							<span class="text-xs text-gray-400">Count multiple swings for better accuracy</span>
						</div>
						<div class="text-center mb-4">
							<span class="text-4xl font-mono font-bold text-amber-400">{formatTime(state.stopwatchTime)}</span>
							<div class="flex justify-center gap-6 mt-2 text-sm text-gray-400">
								<span>Half-cycles: {state.stopwatchLaps}</span>
								<span>Full swings: {fullSwings}</span>
								{#if fullSwings > 0}
									<span class="text-amber-400">T(avg): {(state.stopwatchTime / fullSwings).toFixed(3)}s</span>
								{/if}
							</div>
						</div>
						<div class="flex gap-3">
							<button
								onclick={() => state = state.stopwatchRunning ? stopStopwatch(state) : startStopwatch(state)}
								class="flex-1 py-2 px-4 rounded-lg {state.stopwatchRunning ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'} font-medium text-sm transition-all"
							>
								{state.stopwatchRunning ? 'Stop' : 'Start'}
							</button>
							<button
								onclick={() => state = resetStopwatch(state)}
								class="flex-1 py-2 px-4 rounded-lg glass border border-white/10 text-gray-300 text-sm"
							>
								Reset
							</button>
						</div>
					</div>

					<!-- Controls -->
					<div class="glass-strong rounded-2xl border border-white/10 p-4 space-y-4">
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="length-slider" class="text-sm text-gray-400 block mb-2">Length: {state.length.toFixed(2)} m</label>
								<input
									id="length-slider"
									type="range"
									min="0.1"
									max="2.0"
									step="0.05"
									value={state.length}
									oninput={(e) => state = setLength(state, parseFloat(e.currentTarget.value))}
									disabled={state.isSwinging}
									class="w-full accent-amber-500"
								/>
							</div>
							<div>
								<label for="angle-slider" class="text-sm text-gray-400 block mb-2">Initial Angle: {state.initialAngle}deg</label>
								<input
									id="angle-slider"
									type="range"
									min="5"
									max="45"
									value={state.initialAngle}
									oninput={(e) => state = setInitialAngle(state, parseInt(e.currentTarget.value))}
									disabled={state.isSwinging}
									class="w-full accent-amber-500"
								/>
							</div>
						</div>

						<!-- Length presets -->
						<div>
							<span class="text-sm text-gray-400 block mb-2">Quick Lengths</span>
							<div class="flex flex-wrap gap-2">
								{#each LENGTH_PRESETS as preset}
									<button
										onclick={() => state = setLength(state, preset.value)}
										disabled={state.isSwinging}
										class="px-3 py-1 text-xs rounded-lg glass border border-white/10 text-gray-300 hover:border-amber-500/50 hover:text-amber-400 disabled:opacity-50 transition-colors
										{Math.abs(state.length - preset.value) < 0.01 ? 'border-amber-500/50 text-amber-400' : ''}"
									>
										{preset.label}
									</button>
								{/each}
							</div>
						</div>

						<!-- Action buttons -->
						<div class="flex gap-3">
							<button
								onclick={state.isSwinging ? handleStop : handleRelease}
								class="flex-1 {state.isSwinging ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'btn-primary'} py-2 rounded-lg font-medium"
							>
								{state.isSwinging ? 'Stop' : 'Release'}
							</button>
							<button onclick={handleReset} class="flex-1 btn-secondary">Reset</button>
							<button
								onclick={handleRecord}
								disabled={fullSwings < 1}
								class="flex-1 btn-secondary disabled:opacity-50"
							>
								Record
							</button>
						</div>

						<!-- Theoretical info -->
						<div class="glass rounded-xl p-3 border border-white/5">
							<h4 class="text-sm font-semibold text-white mb-2">Theoretical Values</h4>
							<div class="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span class="text-gray-400">Period T:</span>
									<span class="text-amber-400 ml-2">{theoretical.toFixed(4)} s</span>
								</div>
								<div>
									<span class="text-gray-400">T^2:</span>
									<span class="text-amber-400 ml-2">{(theoretical * theoretical).toFixed(4)} s^2</span>
								</div>
							</div>
						</div>
					</div>
				{:else}
					<!-- Quiz Section -->
					<div class="glass-strong rounded-2xl border border-white/10 p-6">
						<h3 class="text-xl font-display font-semibold text-white mb-6">Knowledge Quiz</h3>
						<div class="space-y-6">
							{#each PENDULUM_QUIZ as question}
								<div class="glass rounded-xl p-4 border border-white/5">
									<p class="text-white font-medium mb-3">{question.question}</p>
									<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
										{#each question.options as option}
											<button
												onclick={() => handleQuizAnswer(question.id, option)}
												class="p-2 rounded-lg text-sm text-left transition-all {quizAnswers.get(question.id) === option ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'glass border border-white/10 text-gray-300 hover:border-amber-500/30'}"
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
					{showQuiz ? 'Back to Simulation' : 'Take Quiz'}
				</button>

				{#if state.measurements.length >= 3}
					<button onclick={handleComplete} class="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all">
						Complete Lab & Analyze
					</button>
				{/if}
			</div>

			<!-- Right: Data -->
			<div class="lg:col-span-1 space-y-6">
				<!-- T^2 vs L Graph -->
				<div class="glass-strong rounded-2xl p-5 border border-white/10">
					<h4 class="text-sm font-semibold text-white mb-3">T^2 vs L Graph</h4>
					{#if state.graphData.length === 0}
						<p class="text-sm text-gray-500">Record measurements to see the graph.</p>
					{:else}
						<svg viewBox="0 0 200 160" class="w-full">
							<rect width="200" height="160" fill="#111827" rx="4" />
							<!-- Axes -->
							<line x1="35" y1="140" x2="190" y2="140" stroke="#4B5563" stroke-width="1" />
							<line x1="35" y1="10" x2="35" y2="140" stroke="#4B5563" stroke-width="1" />
							<text x="115" y="155" fill="#9CA3AF" font-size="8" text-anchor="middle">L (m)</text>
							<text x="10" y="75" fill="#9CA3AF" font-size="8" text-anchor="middle" transform="rotate(-90, 10, 75)">T^2 (s^2)</text>

							<!-- Data points -->
							{#if true}
							{@const maxL = Math.max(...state.graphData.map(d => d.length), 2)}
							{@const maxT2 = Math.max(...state.graphData.map(d => d.periodSquared), 5)}
							{#each state.graphData as point}
								{@const px = 35 + (point.length / maxL) * 150}
								{@const py = 140 - (point.periodSquared / maxT2) * 125}
								<circle cx={px} cy={py} r="4" fill="#F59E0B" stroke="#FCD34D" stroke-width="1" />
							{/each}

							<!-- Theoretical line -->
							{@const theorSlope = (4 * Math.PI * Math.PI) / 9.81}
							<line
								x1="35"
								y1="140"
								x2={35 + (maxL / maxL) * 150}
								y2={140 - ((theorSlope * maxL) / maxT2) * 125}
								stroke="#F59E0B"
								stroke-width="1"
								stroke-dasharray="4,4"
								opacity="0.4"
							/>
							{/if}
						</svg>
					{/if}
				</div>

				<!-- Measurements Table -->
				<div class="glass-strong rounded-2xl p-5 border border-white/10">
					<div class="flex justify-between items-center mb-4">
						<h4 class="text-sm font-semibold text-white">Recorded Data</h4>
						{#if state.measurements.length > 0}
							<button onclick={() => state = clearMeasurements(state)} class="text-xs text-gray-400 hover:text-red-400">Clear</button>
						{/if}
					</div>
					{#if state.measurements.length === 0}
						<p class="text-sm text-gray-500">No measurements yet. Swing the pendulum and record.</p>
					{:else}
						<div class="space-y-2 max-h-64 overflow-y-auto">
							{#each state.measurements as m, i}
								<div class="glass rounded-lg p-2 text-xs border border-white/5">
									<div class="flex justify-between text-gray-400">
										<span>#{i + 1}</span>
										<span>L = {m.length.toFixed(2)}m</span>
									</div>
									<div class="flex justify-between mt-1">
										<span class="text-gray-500">T (measured):</span>
										<span class="text-amber-400">{m.measuredPeriod.toFixed(3)}s</span>
									</div>
									<div class="flex justify-between">
										<span class="text-gray-500">T (theory):</span>
										<span class="text-cyan-400">{m.theoreticalPeriod.toFixed(3)}s</span>
									</div>
									<div class="flex justify-between">
										<span class="text-gray-500">g (calc):</span>
										<span class="text-emerald-400">{m.calculatedG.toFixed(2)} m/s^2</span>
									</div>
									<div class="flex justify-between">
										<span class="text-gray-500">Error:</span>
										<span class="{m.percentError < 5 ? 'text-emerald-400' : 'text-amber-400'}">{m.percentError.toFixed(1)}%</span>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Key Equations -->
				<div class="glass rounded-2xl p-5 border border-white/5">
					<h4 class="text-sm font-semibold text-white mb-3">Key Equations</h4>
					<div class="space-y-2 text-xs text-gray-400 font-mono">
						<p>T = 2pi * sqrt(L / g)</p>
						<p>T^2 = (4pi^2 / g) * L</p>
						<p>g = 4pi^2 * L / T^2</p>
						<p>slope(T^2 vs L) = 4pi^2 / g</p>
					</div>
				</div>

				<!-- Learning Objectives -->
				<div class="glass rounded-2xl p-5 border border-white/5">
					<h4 class="text-sm font-semibold text-white mb-3">Objectives</h4>
					<ul class="space-y-2 text-xs text-gray-400">
						{#each experiment.learningObjectives as obj}
							<li class="flex items-start gap-2">
								<svg class="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" /></svg>
								{obj}
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	{/if}
</div>
