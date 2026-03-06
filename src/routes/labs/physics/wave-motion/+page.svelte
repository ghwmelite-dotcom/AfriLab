<script lang="ts">
	import { onMount } from 'svelte';
	import { labStore } from '$stores/lab';
	import { aiStore } from '$stores/ai';
	import SafetyBanner from '$components/lab/SafetyBanner.svelte';
	import StepGuide from '$components/lab/StepGuide.svelte';
	import HintButton from '$components/ai/HintButton.svelte';

	import {
		createInitialState,
		setFrequency,
		setAmplitude,
		setWavelength,
		setWaveType,
		setViewMode,
		toggleSource2,
		setSource2Frequency,
		setSourceSpacing,
		setHarmonic,
		setStringLength,
		toggleAnimation,
		updateSimulation,
		toggleNodes,
		toggleEnvelope,
		addMeasurement,
		clearMeasurements,
		resetSimulation,
		waveDisplacement,
		interferenceDisplacement,
		standingWaveDisplacement,
		getNodePositions,
		getAntinodePositions,
		harmonicFrequency,
		WAVE_QUIZ,
		analyzeExperiment,
		type WaveState
	} from '$lib/simulations/physics/wave-motion';
	import type { Experiment, LabSession } from '$types';

	const experiment: Experiment = {
		id: 'phy-wave-motion-01',
		disciplineId: 'physics',
		title: 'Wave Motion & Interference',
		description: 'Explore wave properties including frequency, amplitude, wavelength, and observe interference and standing wave patterns.',
		difficulty: 'intermediate',
		durationMinutes: 40,
		instructions: [
			{ id: 1, title: 'Introduction', description: 'Review wave fundamentals: v = f * lambda.', hints: ['Wave speed equals frequency times wavelength'] },
			{ id: 2, title: 'Single Wave', description: 'Adjust frequency, amplitude, and wavelength.', hints: ['Notice how changing one affects the others'] },
			{ id: 3, title: 'Wave Types', description: 'Compare transverse and longitudinal waves.', hints: ['In transverse waves, displacement is perpendicular to propagation'] },
			{ id: 4, title: 'Interference', description: 'Enable two sources and observe interference.', hints: ['Same frequency = stable pattern'] },
			{ id: 5, title: 'Constructive/Destructive', description: 'Identify constructive and destructive interference.', hints: ['In phase = constructive, out of phase = destructive'] },
			{ id: 6, title: 'Standing Waves', description: 'Explore standing waves on a string.', hints: ['Nodes are points of zero displacement'] },
			{ id: 7, title: 'Harmonics', description: 'Observe different harmonic modes.', hints: ['The nth harmonic has n antinodes'] },
			{ id: 8, title: 'Complete Quiz', description: 'Answer wave physics questions.', hints: ['Review your observations'] }
		],
		simulationConfig: { type: 'wave-motion', parameters: {} },
		safetyNotes: 'This is a virtual wave simulation. No physical hazards.',
		learningObjectives: ['Understand the wave equation v = f * lambda', 'Observe constructive and destructive interference', 'Identify nodes and antinodes in standing waves']
	};

	let state: WaveState = $state(createInitialState({ frequency: 2.0, amplitude: 1.0, wavelength: 2.0 }));
	let showResults = $state(false);
	let mounted = $state(false);
	let showQuiz = $state(false);
	let isLabStarted = $state(false);
	let quizAnswers: Map<string, string> = $state(new Map());
	let animationFrameId: number | null = null;
	let lastTime = 0;

	const svgWidth = 700;
	const svgHeight = 300;
	const centerY = 150;
	const xScale = 100; // pixels per meter
	const yScale = 60; // pixels per amplitude unit

	let analysis = $derived(analyzeExperiment(state, quizAnswers));

	// Generate wave points for rendering
	let wavePoints = $derived.by(() => {
		const points: string[] = [];
		const numPoints = 350;
		const xRange = svgWidth / xScale;

		if (state.viewMode === 'single') {
			for (let i = 0; i <= numPoints; i++) {
				const x = (i / numPoints) * xRange;
				const y = waveDisplacement(x, state.currentTime, state.amplitude, state.frequency, state.wavelength);
				const px = (i / numPoints) * svgWidth;
				const py = centerY - y * yScale;
				points.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
			}
		} else if (state.viewMode === 'interference') {
			for (let i = 0; i <= numPoints; i++) {
				const x = (i / numPoints) * xRange;
				const y = state.source2Active
					? interferenceDisplacement(
						x, state.currentTime,
						state.amplitude, state.frequency, state.wavelength,
						state.source2Amplitude, state.source2Frequency, state.wavelength,
						state.sourceSpacing / xScale * 2
					)
					: waveDisplacement(x, state.currentTime, state.amplitude, state.frequency, state.wavelength);
				const px = (i / numPoints) * svgWidth;
				const py = centerY - y * yScale;
				points.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
			}
		} else if (state.viewMode === 'standing') {
			const freq = harmonicFrequency(state.harmonicNumber, state.stringLength, state.stringTension, state.linearDensity);
			for (let i = 0; i <= numPoints; i++) {
				const x = (i / numPoints) * state.stringLength;
				const y = standingWaveDisplacement(x, state.currentTime, state.amplitude, state.stringLength, state.harmonicNumber, freq);
				const px = 50 + (i / numPoints) * (svgWidth - 100);
				const py = centerY - y * yScale;
				points.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
			}
		}
		return points.join(' ');
	});

	// Second wave for interference display
	let wave2Points = $derived.by(() => {
		if (state.viewMode !== 'interference' || !state.source2Active) return '';
		const points: string[] = [];
		const numPoints = 350;
		const xRange = svgWidth / xScale;
		for (let i = 0; i <= numPoints; i++) {
			const x = (i / numPoints) * xRange;
			const y = waveDisplacement(x - state.sourceSpacing / xScale * 2, state.currentTime, state.source2Amplitude, state.source2Frequency, state.wavelength);
			const px = (i / numPoints) * svgWidth;
			const py = centerY - y * yScale;
			points.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
		}
		return points.join(' ');
	});

	// Wave 1 alone for interference display
	let wave1Points = $derived.by(() => {
		if (state.viewMode !== 'interference') return '';
		const points: string[] = [];
		const numPoints = 350;
		const xRange = svgWidth / xScale;
		for (let i = 0; i <= numPoints; i++) {
			const x = (i / numPoints) * xRange;
			const y = waveDisplacement(x, state.currentTime, state.amplitude, state.frequency, state.wavelength);
			const px = (i / numPoints) * svgWidth;
			const py = centerY - y * yScale;
			points.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
		}
		return points.join(' ');
	});

	// Node and antinode positions for standing waves
	let nodePositions = $derived(state.viewMode === 'standing' ? getNodePositions(state.stringLength, state.harmonicNumber) : []);
	let antinodePositions = $derived(state.viewMode === 'standing' ? getAntinodePositions(state.stringLength, state.harmonicNumber) : []);

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
		aiStore.setContext({ discipline: 'physics', experimentTitle: experiment.title, currentStep: 0, studentLevel: 'intermediate', recentMeasurements: [] });
	}

	function animate(currentTime: number) {
		if (!state.isAnimating) {
			animationFrameId = null;
			return;
		}
		const deltaTime = lastTime ? (currentTime - lastTime) / 1000 : 0;
		lastTime = currentTime;
		state = updateSimulation(state, deltaTime);
		animationFrameId = requestAnimationFrame(animate);
	}

	function handleToggleAnimation() {
		state = toggleAnimation(state);
		if (state.isAnimating) {
			lastTime = 0;
			animationFrameId = requestAnimationFrame(animate);
		} else if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
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
</script>

<svelte:head>
	<title>Wave Motion & Interference - AfriLab</title>
</svelte:head>

<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
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
				<span class="text-amber-400">Wave Motion</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-display font-bold text-white">{experiment.title}</h1>
		</div>
		<button onclick={() => aiStore.open()} class="btn-primary">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
			Ask AI
		</button>
	</div>

	<div class="mb-6"><SafetyBanner level="info" message="Virtual wave simulation. Explore how wave parameters affect motion and interference." /></div>

	{#if !isLabStarted}
		<div class="max-w-2xl mx-auto">
			<div class="glass-strong rounded-2xl p-8 border border-white/10 text-center">
				<div class="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-6">
					<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
					</svg>
				</div>
				<h2 class="text-2xl font-display font-bold text-white mb-3">Wave Motion & Interference Lab</h2>
				<p class="text-gray-400 mb-6">Explore transverse and longitudinal waves, observe interference patterns, and investigate standing waves with nodes and antinodes.</p>

				<div class="inline-flex items-center gap-4 px-6 py-4 rounded-xl glass border border-white/10 mb-8">
					<span class="text-gray-400">Wave Equation:</span>
					<span class="font-mono text-2xl">
						<span class="text-amber-400">v</span>
						<span class="text-gray-500"> = </span>
						<span class="text-cyan-400">f</span>
						<span class="text-gray-500"> * </span>
						<span class="text-emerald-400">lambda</span>
					</span>
				</div>

				<div class="grid grid-cols-2 gap-4 mb-8 text-left">
					<div class="glass rounded-xl p-4 border border-white/10">
						<h3 class="font-semibold text-white mb-2"><span class="text-amber-400">1.</span> Single Waves</h3>
						<p class="text-sm text-gray-400">Adjust frequency, amplitude, and wavelength to see effects.</p>
					</div>
					<div class="glass rounded-xl p-4 border border-white/10">
						<h3 class="font-semibold text-white mb-2"><span class="text-amber-400">2.</span> Interference</h3>
						<p class="text-sm text-gray-400">Observe constructive and destructive interference from two sources.</p>
					</div>
					<div class="glass rounded-xl p-4 border border-white/10">
						<h3 class="font-semibold text-white mb-2"><span class="text-amber-400">3.</span> Standing Waves</h3>
						<p class="text-sm text-gray-400">Visualize harmonics, nodes, and antinodes on a fixed string.</p>
					</div>
					<div class="glass rounded-xl p-4 border border-white/10">
						<h3 class="font-semibold text-white mb-2"><span class="text-amber-400">4.</span> Analysis</h3>
						<p class="text-sm text-gray-400">Record data and test your understanding with a quiz.</p>
					</div>
				</div>

				<button onclick={startLab} class="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all transform hover:scale-105">
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
						<p class="text-2xl font-bold text-white">{analysis.measurementCount}</p>
					</div>
				</div>
				<div class="glass rounded-xl p-4 border border-white/10 mb-6">
					<p class="text-sm text-gray-400">{analysis.feedback}</p>
				</div>
				<div class="flex gap-4">
					<button onclick={() => { state = createInitialState({ frequency: 2.0, amplitude: 1.0, wavelength: 2.0 }); quizAnswers = new Map(); showResults = false; showQuiz = false; isLabStarted = false; labStore.reset(); }} class="flex-1 py-3 px-6 rounded-xl glass border border-white/10 text-white font-medium">Try Again</button>
					<a href="/labs/physics" class="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-center">Back to Physics</a>
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
					<!-- View Mode Tabs -->
					<div class="glass rounded-xl p-1 border border-white/10 flex">
						{#each [['single', 'Single Wave'], ['interference', 'Interference'], ['standing', 'Standing Wave']] as [mode, label]}
							<button
								onclick={() => { state = setViewMode(state, mode as WaveState['viewMode']); if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; } }}
								class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
									{state.viewMode === mode ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-white' : 'text-gray-400 hover:text-white'}"
							>
								{label}
							</button>
						{/each}
					</div>

					<!-- Wave Visualization -->
					<div class="glass-strong rounded-2xl border border-white/10 overflow-hidden">
						<svg class="w-full" viewBox="0 0 {svgWidth} {svgHeight}" preserveAspectRatio="xMidYMid meet">
							<defs>
								<linearGradient id="waveBg" x1="0%" y1="0%" x2="0%" y2="100%">
									<stop offset="0%" stop-color="#0f172a" />
									<stop offset="100%" stop-color="#1e293b" />
								</linearGradient>
							</defs>
							<rect width="100%" height="100%" fill="url(#waveBg)" />

							<!-- Grid lines -->
							{#each Array(7) as _, i}
								<line x1="0" y1={i * 50} x2={svgWidth} y2={i * 50} stroke="#1e3a5f" stroke-width="0.5" />
							{/each}
							{#each Array(15) as _, i}
								<line x1={i * 50} y1="0" x2={i * 50} y2={svgHeight} stroke="#1e3a5f" stroke-width="0.5" />
							{/each}

							<!-- Center axis -->
							<line x1="0" y1={centerY} x2={svgWidth} y2={centerY} stroke="#4B5563" stroke-width="1" stroke-dasharray="4,4" />

							<!-- Standing wave fixed ends -->
							{#if state.viewMode === 'standing'}
								<rect x="45" y={centerY - 40} width="5" height="80" fill="#6B7280" rx="2" />
								<rect x={svgWidth - 50} y={centerY - 40} width="5" height="80" fill="#6B7280" rx="2" />
							{/if}

							<!-- Individual waves for interference (faded) -->
							{#if state.viewMode === 'interference' && state.source2Active}
								<path d={wave1Points} fill="none" stroke="#3B82F6" stroke-width="1.5" opacity="0.3" />
								<path d={wave2Points} fill="none" stroke="#EF4444" stroke-width="1.5" opacity="0.3" />
							{/if}

							<!-- Main wave / resultant -->
							<path
								d={wavePoints}
								fill="none"
								stroke="{state.viewMode === 'standing' ? '#F59E0B' : state.viewMode === 'interference' ? '#A855F7' : '#F59E0B'}"
								stroke-width="2.5"
							/>

							<!-- Nodes and antinodes for standing waves -->
							{#if state.viewMode === 'standing' && state.showNodes}
								{#each nodePositions as pos}
									{@const px = 50 + (pos / state.stringLength) * (svgWidth - 100)}
									<circle cx={px} cy={centerY} r="6" fill="none" stroke="#EF4444" stroke-width="2" />
									<text x={px} y={centerY + 20} fill="#EF4444" font-size="9" text-anchor="middle">N</text>
								{/each}
								{#each antinodePositions as pos}
									{@const px = 50 + (pos / state.stringLength) * (svgWidth - 100)}
									<circle cx={px} cy={centerY} r="6" fill="#22C55E" fill-opacity="0.3" stroke="#22C55E" stroke-width="2" />
									<text x={px} y={centerY + 20} fill="#22C55E" font-size="9" text-anchor="middle">A</text>
								{/each}
							{/if}

							<!-- Info panel -->
							<g transform="translate({svgWidth - 180}, 10)">
								<rect width="170" height="80" fill="#1F2937" fill-opacity="0.9" rx="8" />
								<text x="10" y="20" fill="#F59E0B" font-size="10" font-weight="bold">{state.viewMode === 'single' ? 'Single Wave' : state.viewMode === 'interference' ? 'Interference' : `Harmonic #${state.harmonicNumber}`}</text>
								<text x="10" y="36" fill="#D1D5DB" font-size="9">f = {state.frequency.toFixed(1)} Hz</text>
								<text x="10" y="50" fill="#D1D5DB" font-size="9">lambda = {state.wavelength.toFixed(1)} m</text>
								<text x="10" y="64" fill="#D1D5DB" font-size="9">v = {state.waveSpeed.toFixed(1)} m/s</text>
								{#if state.viewMode === 'standing'}
									<text x="10" y="76" fill="#9CA3AF" font-size="8">Nodes: {state.harmonicNumber + 1} | Antinodes: {state.harmonicNumber}</text>
								{/if}
							</g>
						</svg>
					</div>

					<!-- Controls -->
					<div class="glass-strong rounded-2xl border border-white/10 p-4 space-y-4">
						{#if state.viewMode === 'single' || state.viewMode === 'interference'}
							<div class="grid grid-cols-3 gap-4">
								<div>
									<label class="text-sm text-gray-400 block mb-2">Frequency: {state.frequency.toFixed(1)} Hz</label>
									<input type="range" min="0.5" max="5" step="0.1" value={state.frequency} oninput={(e) => state = setFrequency(state, parseFloat(e.currentTarget.value))} class="w-full accent-amber-500" />
								</div>
								<div>
									<label class="text-sm text-gray-400 block mb-2">Amplitude: {state.amplitude.toFixed(1)}</label>
									<input type="range" min="0.1" max="2.0" step="0.1" value={state.amplitude} oninput={(e) => state = setAmplitude(state, parseFloat(e.currentTarget.value))} class="w-full accent-amber-500" />
								</div>
								<div>
									<label class="text-sm text-gray-400 block mb-2">Wavelength: {state.wavelength.toFixed(1)} m</label>
									<input type="range" min="0.5" max="5.0" step="0.1" value={state.wavelength} oninput={(e) => state = setWavelength(state, parseFloat(e.currentTarget.value))} class="w-full accent-amber-500" />
								</div>
							</div>
						{/if}

						{#if state.viewMode === 'interference'}
							<div class="glass rounded-xl p-3 border border-white/5">
								<div class="flex items-center justify-between mb-2">
									<span class="text-sm text-gray-400">Second Source</span>
									<button onclick={() => state = toggleSource2(state)} class="px-3 py-1 rounded-lg text-xs {state.source2Active ? 'bg-emerald-500/20 text-emerald-400' : 'glass text-gray-400'} border border-white/10">
										{state.source2Active ? 'Active' : 'Inactive'}
									</button>
								</div>
								{#if state.source2Active}
									<div class="grid grid-cols-2 gap-4">
										<div>
											<label class="text-xs text-gray-400 block mb-1">Source 2 Frequency: {state.source2Frequency.toFixed(1)} Hz</label>
											<input type="range" min="0.5" max="5" step="0.1" value={state.source2Frequency} oninput={(e) => state = setSource2Frequency(state, parseFloat(e.currentTarget.value))} class="w-full accent-red-500" />
										</div>
										<div>
											<label class="text-xs text-gray-400 block mb-1">Spacing: {state.sourceSpacing.toFixed(1)} m</label>
											<input type="range" min="0.5" max="5" step="0.1" value={state.sourceSpacing} oninput={(e) => state = setSourceSpacing(state, parseFloat(e.currentTarget.value))} class="w-full accent-red-500" />
										</div>
									</div>
								{/if}
							</div>
						{/if}

						{#if state.viewMode === 'standing'}
							<div class="grid grid-cols-2 gap-4">
								<div>
									<label class="text-sm text-gray-400 block mb-2">Harmonic: n = {state.harmonicNumber}</label>
									<input type="range" min="1" max="8" step="1" value={state.harmonicNumber} oninput={(e) => state = setHarmonic(state, parseInt(e.currentTarget.value))} class="w-full accent-amber-500" />
								</div>
								<div>
									<label class="text-sm text-gray-400 block mb-2">String Length: {state.stringLength.toFixed(1)} m</label>
									<input type="range" min="1" max="5" step="0.1" value={state.stringLength} oninput={(e) => state = setStringLength(state, parseFloat(e.currentTarget.value))} class="w-full accent-amber-500" />
								</div>
							</div>
							<div class="flex items-center gap-4">
								<label class="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
									<input type="checkbox" checked={state.showNodes} onchange={() => state = toggleNodes(state)} class="accent-amber-500" />
									Show Nodes/Antinodes
								</label>
							</div>
						{/if}

						<!-- Action buttons -->
						<div class="flex gap-3">
							<button onclick={handleToggleAnimation} class="flex-1 {state.isAnimating ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'btn-primary'} py-2 rounded-lg font-medium">
								{state.isAnimating ? 'Pause' : 'Animate'}
							</button>
							<button onclick={() => { if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; } state = resetSimulation(state); }} class="flex-1 btn-secondary">Reset</button>
							<button onclick={() => state = addMeasurement(state)} class="flex-1 btn-secondary">Record</button>
						</div>

						<!-- Wave speed display -->
						<div class="glass rounded-xl p-3 border border-white/5">
							<div class="grid grid-cols-3 gap-4 text-sm">
								<div><span class="text-gray-400">Speed:</span> <span class="text-amber-400">{state.waveSpeed.toFixed(2)} m/s</span></div>
								<div><span class="text-gray-400">Type:</span> <span class="text-cyan-400 capitalize">{state.waveType}</span></div>
								<div>
									<button onclick={() => state = setWaveType(state, state.waveType === 'transverse' ? 'longitudinal' : 'transverse')} class="text-xs px-2 py-1 rounded glass border border-white/10 text-gray-300 hover:text-amber-400">
										Switch Type
									</button>
								</div>
							</div>
						</div>
					</div>
				{:else}
					<!-- Quiz -->
					<div class="glass-strong rounded-2xl border border-white/10 p-6">
						<h3 class="text-xl font-display font-semibold text-white mb-6">Knowledge Quiz</h3>
						<div class="space-y-6">
							{#each WAVE_QUIZ as question}
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

				{#if state.measurements.length >= 3}
					<button onclick={handleComplete} class="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all">
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
						<p class="text-sm text-gray-500">Record measurements in each mode.</p>
					{:else}
						<div class="space-y-2 max-h-64 overflow-y-auto">
							{#each state.measurements as m, i}
								<div class="glass rounded-lg p-2 text-xs border border-white/5">
									<div class="flex justify-between text-gray-400">
										<span>#{i + 1}</span>
										<span class="capitalize">{m.type}</span>
									</div>
									<div class="flex justify-between mt-1"><span class="text-gray-500">f:</span><span class="text-amber-400">{m.frequency.toFixed(1)} Hz</span></div>
									<div class="flex justify-between"><span class="text-gray-500">lambda:</span><span class="text-cyan-400">{m.wavelength.toFixed(1)} m</span></div>
									<div class="flex justify-between"><span class="text-gray-500">v:</span><span class="text-emerald-400">{m.waveSpeed.toFixed(1)} m/s</span></div>
									{#if m.harmonicNumber}
										<div class="flex justify-between"><span class="text-gray-500">Harmonic:</span><span class="text-amber-400">n={m.harmonicNumber}</span></div>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<div class="glass rounded-2xl p-5 border border-white/5">
					<h4 class="text-sm font-semibold text-white mb-3">Key Equations</h4>
					<div class="space-y-2 text-xs text-gray-400 font-mono">
						<p>v = f * lambda</p>
						<p>y = A * sin(kx - omega*t)</p>
						<p>f_n = n * v / (2L)</p>
						<p>Nodes: n+1 | Antinodes: n</p>
					</div>
				</div>

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
