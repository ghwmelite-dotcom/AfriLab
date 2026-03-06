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
		setLightIntensity,
		setLightColor,
		setDistance,
		setCO2Level,
		setExperimentType,
		runMeasurement,
		answerQuiz,
		checkQuizAnswers,
		analyzePhotosynthesis,
		calculateBubbleRate,
		LIGHT_COLORS,
		ABSORPTION_SPECTRUM,
		CHLOROPHYLL_B_SPECTRUM,
		PHOTOSYNTHESIS_QUIZ,
		type PhotosynthesisState,
		type LightColor
	} from '$lib/simulations/biology/photosynthesis';
	import type { Experiment, LabSession } from '$types';

	const experiment: Experiment = {
		id: 'bio-photosynthesis-01',
		disciplineId: 'biology',
		title: 'Photosynthesis & Light Reactions',
		description: 'Investigate O2 production by Elodea under varying light conditions.',
		difficulty: 'intermediate',
		durationMinutes: 50,
		instructions: [
			{ id: 1, title: 'Introduction', description: 'Learn about photosynthesis and the light-dependent reactions.', hints: ['Plants convert light energy to chemical energy'] },
			{ id: 2, title: 'Baseline Measurement', description: 'Count bubbles at standard conditions (white light, 50% intensity).', hints: ['Each bubble represents O2 gas released'] },
			{ id: 3, title: 'Vary Light Intensity', description: 'Test O2 production at different light intensities.', hints: ['Try 10%, 30%, 50%, 70%, 100%'] },
			{ id: 4, title: 'Test Light Colors', description: 'Compare O2 production under different wavelengths.', hints: ['Which color do plants absorb most?'] },
			{ id: 5, title: 'Absorption Spectrum', description: 'View the chlorophyll absorption spectrum.', hints: ['Compare peaks with your experimental results'] },
			{ id: 6, title: 'Distance Effect', description: 'Vary the light source distance.', hints: ['Light intensity follows the inverse square law'] },
			{ id: 7, title: 'CO2 Effect', description: 'Test different CO2 levels.', hints: ['CO2 is a reactant in photosynthesis'] },
			{ id: 8, title: 'Complete Quiz', description: 'Answer questions about photosynthesis.', hints: ['Review the absorption spectrum'] }
		],
		simulationConfig: { type: 'photosynthesis', parameters: {}, equipment: ['Elodea plant', 'Beaker', 'Light source', 'Color filters', 'Timer', 'Ruler'] },
		safetyNotes: 'Handle light source carefully to avoid burns.',
		learningObjectives: ['Measure photosynthetic rate', 'Understand light absorption', 'Analyze the action spectrum', 'Explore limiting factors']
	};

	let state: PhotosynthesisState = $state(createInitialState({ defaultIntensity: 50, defaultColor: 'white' }));
	let showResults = $state(false);
	let showQuiz = $state(false);
	let mounted = $state(false);
	let showSpectrum = $state(false);

	let analysis = $derived(analyzePhotosynthesis(state));
	let quizResults = $derived(checkQuizAnswers(state));
	let predictedRate = $derived(calculateBubbleRate(state.lightCondition, state.temperature, state.co2Level));

	// Chart constants
	const chartW = 400;
	const chartH = 180;
	const pad = 40;

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

	function handleRun() {
		state = runMeasurement(state);
		labStore.addAction('count-bubbles', { conditions: state.lightCondition });
	}

	function handleQuizAnswer(qId: string, answer: string) {
		state = answerQuiz(state, qId, answer);
	}

	function handleComplete() {
		showResults = true;
		labStore.completeLab();
	}

	// Absorption spectrum SVG path
	function spectrumPath(data: typeof ABSORPTION_SPECTRUM): string {
		const minW = 400, maxW = 700;
		const xScale = (chartW - pad * 2) / (maxW - minW);
		const yScale = (chartH - pad * 2);
		return data.map((p, i) => {
			const x = pad + (p.wavelength - minW) * xScale;
			const y = chartH - pad - p.absorbance * yScale;
			return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
		}).join(' ');
	}

	function wavelengthToColor(wl: number): string {
		if (wl < 440) return '#7c3aed';
		if (wl < 490) return '#3b82f6';
		if (wl < 510) return '#06b6d4';
		if (wl < 540) return '#22c55e';
		if (wl < 580) return '#eab308';
		if (wl < 610) return '#f97316';
		return '#ef4444';
	}
</script>

<svelte:head>
	<title>Photosynthesis - AfriLab</title>
</svelte:head>

<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-green-500/10 to-transparent rounded-full blur-3xl"></div>
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
				<span class="text-emerald-400">Photosynthesis</span>
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

	<div class="mb-6"><SafetyBanner level="safe" message="Virtual experiment using Elodea aquatic plant. Count oxygen bubbles to measure photosynthetic rate." /></div>

	<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
		<!-- Left: Steps -->
		<div class="lg:col-span-1 space-y-6">
			<StepGuide steps={experiment.instructions} currentStepIndex={$labStore.currentStepIndex} />
			<div class="glass rounded-2xl p-4 border border-white/5">
				<HintButton experimentId={experiment.id} stepId={$labStore.currentStepIndex + 1} stepTitle={experiment.instructions[$labStore.currentStepIndex]?.title} />
			</div>
			<ControlPanel onComplete={handleComplete} />
		</div>

		<!-- Center: Lab -->
		<div class="lg:col-span-2 space-y-6">
			{#if !showQuiz}
				<!-- Plant Visualization -->
				<LabCanvas className="min-h-[300px]">
					<div class="p-6 flex flex-col items-center">
						<!-- Beaker with Elodea -->
						<div class="relative w-48 h-56">
							<!-- Light glow -->
							<div class="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-20 rounded-full blur-2xl" style="background: {LIGHT_COLORS[state.lightCondition.color].hex}; opacity: {state.lightCondition.intensity / 200}"></div>

							<!-- Beaker -->
							<svg viewBox="0 0 200 240" class="w-full h-full">
								<!-- Beaker outline -->
								<rect x="30" y="40" width="140" height="180" rx="5" fill="rgba(100,200,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" />
								<!-- Water -->
								<rect x="32" y="60" width="136" height="158" rx="3" fill="rgba(100,200,255,0.15)" />
								<!-- Elodea plant -->
								<g transform="translate(100, 200)">
									<line x1="0" y1="0" x2="0" y2="-100" stroke="#22c55e" stroke-width="3" />
									{#each [-30, -50, -70, -90] as yOff, i}
										<ellipse cx={i % 2 === 0 ? 12 : -12} cy={yOff} rx="15" ry="6" fill="#22c55e" opacity="0.8" />
									{/each}
								</g>
								<!-- Bubbles (based on current rate) -->
								{#each Array(Math.min(Math.round(predictedRate / 3), 10)) as _, i}
									<circle
										cx={90 + Math.sin(i * 1.5) * 15}
										cy={180 - i * 14 - Math.random() * 5}
										r={2 + Math.random()}
										fill="rgba(255,255,255,0.6)"
									/>
								{/each}
							</svg>
						</div>

						<div class="mt-4 text-center">
							<p class="text-2xl font-bold font-mono text-emerald-400">{state.currentBubbles} <span class="text-sm text-gray-400">bubbles/min</span></p>
							<p class="text-xs text-gray-500 mt-1">Predicted: ~{predictedRate.toFixed(1)} bubbles/min</p>
						</div>
					</div>
				</LabCanvas>

				<!-- Controls -->
				<div class="glass-strong rounded-2xl p-5 border border-white/10 space-y-4">
					<!-- Light Color -->
					<div>
						<label class="text-xs text-gray-400 mb-2 block">Light Color / Wavelength</label>
						<div class="flex gap-2 flex-wrap">
							{#each Object.entries(LIGHT_COLORS) as [color, info]}
								<button
									onclick={() => { state = setLightColor(state, color as LightColor); }}
									class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all {state.lightCondition.color === color ? 'ring-2 ring-white/50' : ''}"
									style="background: {info.hex}20; border: 1px solid {info.hex}60; color: {color === 'white' ? '#fff' : info.hex}"
								>
									<div class="w-3 h-3 rounded-full" style="background: {info.hex}"></div>
									{info.label}
								</button>
							{/each}
						</div>
					</div>

					<!-- Light Intensity -->
					<div>
						<div class="flex justify-between text-xs mb-1">
							<span class="text-gray-400">Light Intensity</span>
							<span class="font-mono text-white">{state.lightCondition.intensity}%</span>
						</div>
						<input type="range" min="0" max="100" step="5"
							value={state.lightCondition.intensity}
							oninput={(e) => { state = setLightIntensity(state, parseInt((e.target as HTMLInputElement).value)); }}
							class="w-full accent-yellow-500"
						/>
					</div>

					<!-- Distance -->
					<div>
						<div class="flex justify-between text-xs mb-1">
							<span class="text-gray-400">Light Distance</span>
							<span class="font-mono text-white">{state.lightCondition.distance} cm</span>
						</div>
						<input type="range" min="5" max="50" step="5"
							value={state.lightCondition.distance}
							oninput={(e) => { state = setDistance(state, parseInt((e.target as HTMLInputElement).value)); }}
							class="w-full accent-orange-500"
						/>
					</div>

					<!-- CO2 Level -->
					<div>
						<label class="text-xs text-gray-400 mb-2 block">CO2 Level</label>
						<div class="flex gap-2">
							{#each [{ key: 'low', label: 'Low' }, { key: 'normal', label: 'Normal' }, { key: 'high', label: 'High (NaHCO3)' }] as opt}
								<button
									onclick={() => { state = setCO2Level(state, opt.key as 'low' | 'normal' | 'high'); }}
									class="flex-1 py-2 rounded-lg text-xs font-medium transition-all {state.co2Level === opt.key ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'glass border border-white/10 text-gray-400'}"
								>
									{opt.label}
								</button>
							{/each}
						</div>
					</div>

					<button onclick={handleRun}
						class="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all">
						Count Bubbles (60 seconds)
					</button>
				</div>

				<!-- Absorption Spectrum Toggle -->
				<button onclick={() => showSpectrum = !showSpectrum}
					class="w-full py-2.5 rounded-xl glass border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all text-sm font-medium">
					{showSpectrum ? 'Hide' : 'View'} Absorption Spectrum
				</button>

				{#if showSpectrum}
					<div class="glass-strong rounded-2xl p-5 border border-white/10">
						<h3 class="text-sm font-semibold text-white mb-3">Chlorophyll Absorption Spectrum</h3>
						<svg viewBox="0 0 {chartW} {chartH}" class="w-full h-auto">
							<!-- Rainbow background -->
							<defs>
								<linearGradient id="rainbow" x1="0" y1="0" x2="1" y2="0">
									<stop offset="0%" stop-color="#7c3aed" stop-opacity="0.1" />
									<stop offset="15%" stop-color="#3b82f6" stop-opacity="0.1" />
									<stop offset="30%" stop-color="#06b6d4" stop-opacity="0.1" />
									<stop offset="45%" stop-color="#22c55e" stop-opacity="0.1" />
									<stop offset="60%" stop-color="#eab308" stop-opacity="0.1" />
									<stop offset="80%" stop-color="#f97316" stop-opacity="0.1" />
									<stop offset="100%" stop-color="#ef4444" stop-opacity="0.1" />
								</linearGradient>
							</defs>
							<rect x={pad} y={pad} width={chartW - pad * 2} height={chartH - pad * 2} fill="url(#rainbow)" />
							<!-- Axes -->
							<line x1={pad} y1={chartH - pad} x2={chartW - pad} y2={chartH - pad} stroke="rgba(255,255,255,0.2)" stroke-width="1" />
							<line x1={pad} y1={pad} x2={pad} y2={chartH - pad} stroke="rgba(255,255,255,0.2)" stroke-width="1" />
							<text x={chartW / 2} y={chartH - 5} text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="9">Wavelength (nm)</text>
							<text x={8} y={chartH / 2} text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="9" transform="rotate(-90, 8, {chartH / 2})">Absorbance</text>
							<!-- Wavelength labels -->
							{#each [400, 450, 500, 550, 600, 650, 700] as wl}
								<text x={pad + ((wl - 400) / 300) * (chartW - pad * 2)} y={chartH - pad + 12} text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="8">{wl}</text>
							{/each}
							<!-- Chlorophyll a -->
							<path d={spectrumPath(ABSORPTION_SPECTRUM)} fill="none" stroke="#22c55e" stroke-width="2" />
							<!-- Chlorophyll b -->
							<path d={spectrumPath(CHLOROPHYLL_B_SPECTRUM)} fill="none" stroke="#86efac" stroke-width="1.5" stroke-dasharray="4 2" />
							<!-- Legend -->
							<line x1={chartW - 120} y1={pad + 10} x2={chartW - 100} y2={pad + 10} stroke="#22c55e" stroke-width="2" />
							<text x={chartW - 95} y={pad + 13} fill="#22c55e" font-size="8">Chl a</text>
							<line x1={chartW - 120} y1={pad + 24} x2={chartW - 100} y2={pad + 24} stroke="#86efac" stroke-width="1.5" stroke-dasharray="4 2" />
							<text x={chartW - 95} y={pad + 27} fill="#86efac" font-size="8">Chl b</text>
						</svg>
						<p class="text-xs text-gray-500 mt-2">Chlorophyll absorbs most strongly in blue (~430nm) and red (~660nm) regions, reflecting green light.</p>
					</div>
				{/if}

				<!-- Measurement History -->
				{#if state.measurements.length > 0}
					<div class="glass-strong rounded-2xl p-5 border border-white/10">
						<h3 class="text-sm font-semibold text-white mb-3">Measurements ({state.measurements.length})</h3>
						<div class="overflow-x-auto">
							<table class="w-full text-xs">
								<thead>
									<tr class="border-b border-white/10">
										<th class="text-left text-gray-400 py-2 px-2">#</th>
										<th class="text-left text-gray-400 py-2 px-2">Color</th>
										<th class="text-right text-gray-400 py-2 px-2">Intensity</th>
										<th class="text-right text-gray-400 py-2 px-2">Distance</th>
										<th class="text-right text-gray-400 py-2 px-2">Bubbles/min</th>
									</tr>
								</thead>
								<tbody>
									{#each state.measurements as m, i}
										<tr class="border-b border-white/5">
											<td class="py-1.5 px-2 text-gray-500">{i + 1}</td>
											<td class="py-1.5 px-2">
												<span class="flex items-center gap-1">
													<div class="w-2 h-2 rounded-full" style="background: {LIGHT_COLORS[m.conditions.color].hex}"></div>
													<span class="text-gray-300">{m.conditions.color}</span>
												</span>
											</td>
											<td class="py-1.5 px-2 text-right text-gray-300">{m.conditions.intensity}%</td>
											<td class="py-1.5 px-2 text-right text-gray-300">{m.conditions.distance}cm</td>
											<td class="py-1.5 px-2 text-right font-mono text-emerald-400">{m.rate}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/if}
			{:else}
				<!-- Quiz -->
				<div class="glass-strong rounded-2xl border border-white/10 p-6">
					<h3 class="text-xl font-display font-semibold text-white mb-6">Knowledge Quiz</h3>
					<div class="space-y-6">
						{#each PHOTOSYNTHESIS_QUIZ as question}
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
							<p class="text-sm text-gray-400">Measurements</p>
							<p class="text-2xl font-bold text-white">{analysis.totalMeasurements}</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Colors Tested</p>
							<p class="text-2xl font-bold text-white">{analysis.colorsExplored.length}</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Quiz Score</p>
							<p class="text-2xl font-bold text-white">{quizResults.correct}/{quizResults.total}</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Grade</p>
							<p class="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{analysis.grade}</p>
						</div>
					</div>
					<p class="text-gray-400 mb-6">{analysis.feedback}</p>
					<div class="flex gap-3">
						<button onclick={() => { state = createInitialState({ defaultIntensity: 50, defaultColor: 'white' }); showResults = false; showQuiz = false; showSpectrum = false; labStore.reset(); }} class="btn-secondary flex-1">Try Again</button>
						<a href="/labs/biology" class="btn-primary flex-1 text-center">Back to Labs</a>
					</div>
				</div>
			{/if}
		</div>

		<!-- Right: Info -->
		<div class="lg:col-span-1 space-y-6">
			<div class="glass-strong rounded-2xl p-5 border border-white/10">
				<h4 class="text-sm font-semibold text-white mb-3">Current Setup</h4>
				<div class="space-y-3 text-sm">
					<div class="flex justify-between">
						<span class="text-gray-400">Light</span>
						<span class="flex items-center gap-1">
							<div class="w-3 h-3 rounded-full" style="background: {LIGHT_COLORS[state.lightCondition.color].hex}"></div>
							<span class="text-white">{state.lightCondition.color}</span>
						</span>
					</div>
					<div class="flex justify-between"><span class="text-gray-400">Intensity</span><span class="text-white">{state.lightCondition.intensity}%</span></div>
					<div class="flex justify-between"><span class="text-gray-400">Distance</span><span class="text-white">{state.lightCondition.distance} cm</span></div>
					<div class="flex justify-between"><span class="text-gray-400">CO2</span><span class="text-white capitalize">{state.co2Level}</span></div>
					<div class="flex justify-between"><span class="text-gray-400">Temp</span><span class="text-white">{state.temperature}C</span></div>
				</div>
			</div>

			<div class="glass rounded-2xl p-5 border border-white/5">
				<h4 class="text-sm font-semibold text-white mb-3">Photosynthesis Equation</h4>
				<p class="text-xs text-gray-400 font-mono leading-relaxed">
					6CO2 + 6H2O + light energy<br/>
					--> C6H12O6 + 6O2
				</p>
				<p class="text-xs text-gray-500 mt-2">We measure O2 production as an indicator of photosynthetic rate.</p>
			</div>

			<div class="glass rounded-2xl p-5 border border-white/5">
				<h4 class="text-sm font-semibold text-white mb-3">Learning Objectives</h4>
				<ul class="space-y-2">
					{#each experiment.learningObjectives as obj}
						<li class="text-xs text-gray-400 flex items-start gap-2">
							<svg class="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
							{obj}
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</div>
