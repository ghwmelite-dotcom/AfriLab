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
		simulateStep,
		simulateSteps,
		introduceEvent,
		selectSpecies,
		setSpeed,
		resetSimulation,
		answerQuiz,
		checkQuizAnswers,
		analyzeEcosystem,
		getTrophicEnergy,
		DEFAULT_SPECIES,
		ENVIRONMENTAL_EVENTS,
		ECOSYSTEM_QUIZ,
		type EcosystemState,
		type EnvironmentalEvent
	} from '$lib/simulations/biology/ecosystem';
	import type { Experiment, LabSession } from '$types';

	const experiment: Experiment = {
		id: 'bio-ecosystem-01',
		disciplineId: 'biology',
		title: 'Ecosystem Simulation',
		description: 'Model population dynamics and energy flow in a virtual African savanna ecosystem.',
		difficulty: 'advanced',
		durationMinutes: 55,
		instructions: [
			{ id: 1, title: 'Introduction', description: 'Explore the ecosystem species and their relationships.', hints: ['Click on species to learn about them'] },
			{ id: 2, title: 'Run Simulation', description: 'Advance the simulation and observe population changes.', hints: ['Watch how populations oscillate'] },
			{ id: 3, title: 'Observe Dynamics', description: 'Note predator-prey cycles and population trends.', hints: ['Prey populations peak before predators'] },
			{ id: 4, title: 'Introduce Drought', description: 'Add a drought event and observe cascading effects.', hints: ['Drought reduces producer populations'] },
			{ id: 5, title: 'Introduce Disease', description: 'Add a disease outbreak among consumers.', hints: ['Watch trophic cascade effects'] },
			{ id: 6, title: 'Energy Flow', description: 'Analyze energy transfer between trophic levels.', hints: ['Only ~10% transfers between levels'] },
			{ id: 7, title: 'Try Other Events', description: 'Test fire, flood, or invasive species.', hints: ['Each event has different effects'] },
			{ id: 8, title: 'Complete Quiz', description: 'Answer questions about ecosystem dynamics.', hints: ['Review carrying capacity and trophic levels'] }
		],
		simulationConfig: { type: 'ecosystem', parameters: {}, equipment: ['Computer simulation', 'Data recording sheets'] },
		safetyNotes: 'Virtual simulation. No physical materials used.',
		learningObjectives: ['Understand population dynamics', 'Observe trophic cascades', 'Analyze energy flow', 'Predict effects of environmental changes']
	};

	let state: EcosystemState = $state(createInitialState({ species: DEFAULT_SPECIES }));
	let showResults = $state(false);
	let showQuiz = $state(false);
	let mounted = $state(false);
	let autoRunInterval: ReturnType<typeof setInterval> | null = null;

	let analysis = $derived(analyzeEcosystem(state));
	let quizResults = $derived(checkQuizAnswers(state));
	let trophicEnergy = $derived(getTrophicEnergy(state));
	let selectedSpeciesInfo = $derived(state.selectedSpeciesId ? DEFAULT_SPECIES.find(s => s.id === state.selectedSpeciesId) : null);

	// Chart dimensions
	const chartW = 500;
	const chartH = 200;
	const pad = 45;

	onMount(() => {
		mounted = true;
		const session: LabSession = {
			id: crypto.randomUUID(), userId: '', experimentId: experiment.id,
			status: 'in_progress', startedAt: new Date(), completedAt: null,
			data: { currentStep: 0, measurements: [], notes: [], actions: [] }, score: null
		};
		labStore.startLab(experiment, session);
		aiStore.setContext({ discipline: 'biology', experimentTitle: experiment.title, currentStep: 0, studentLevel: 'advanced', recentMeasurements: [] });

		return () => {
			if (autoRunInterval) clearInterval(autoRunInterval);
		};
	});

	function handleStep() {
		state = simulateStep(state);
	}

	function handleMultiStep(n: number) {
		state = simulateSteps(state, n);
	}

	function handleToggleAutoRun() {
		if (autoRunInterval) {
			clearInterval(autoRunInterval);
			autoRunInterval = null;
		} else {
			autoRunInterval = setInterval(() => {
				state = simulateStep(state);
				if (state.currentStep >= 200) {
					if (autoRunInterval) clearInterval(autoRunInterval);
					autoRunInterval = null;
				}
			}, 600 / state.speed);
		}
	}

	function handleEvent(eventType: EnvironmentalEvent) {
		state = introduceEvent(state, eventType);
		labStore.addAction('introduce-event', { eventType });
	}

	function handleReset() {
		if (autoRunInterval) { clearInterval(autoRunInterval); autoRunInterval = null; }
		state = resetSimulation(state);
	}

	function handleQuizAnswer(qId: string, answer: string) {
		state = answerQuiz(state, qId, answer);
	}

	function handleComplete() {
		if (autoRunInterval) { clearInterval(autoRunInterval); autoRunInterval = null; }
		showResults = true;
		labStore.completeLab();
	}

	// Population chart path for a species
	function getPopulationPath(speciesId: string): string {
		if (state.history.length < 2) return '';
		const maxStep = Math.max(state.history[state.history.length - 1].step, 1);
		const maxPop = Math.max(
			...state.history.flatMap(h => Array.from(h.populations.values())),
			10
		);
		const xScale = (chartW - pad * 2) / maxStep;
		const yScale = (chartH - pad * 2) / maxPop;

		return state.history.map((h, i) => {
			const x = pad + h.step * xScale;
			const pop = h.populations.get(speciesId) || 0;
			const y = chartH - pad - pop * yScale;
			return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
		}).join(' ');
	}

	// Trophic level labels
	const TROPHIC_LABELS: Record<string, string> = {
		producer: 'Producers',
		primary_consumer: 'Primary Consumers',
		secondary_consumer: 'Secondary Consumers',
		tertiary_consumer: 'Tertiary Consumers'
	};

	const TROPHIC_COLORS: Record<string, string> = {
		producer: '#22c55e',
		primary_consumer: '#84cc16',
		secondary_consumer: '#f59e0b',
		tertiary_consumer: '#ef4444'
	};
</script>

<svelte:head>
	<title>Ecosystem Simulation - AfriLab</title>
</svelte:head>

<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-green-600/10 to-transparent rounded-full blur-3xl"></div>
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
				<span class="text-emerald-400">Ecosystem</span>
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

	<div class="mb-6"><SafetyBanner level="safe" message="Virtual African savanna ecosystem simulation. Observe how species interact and respond to environmental changes." /></div>

	<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
		<!-- Left: Steps -->
		<div class="lg:col-span-1 space-y-6">
			<StepGuide steps={experiment.instructions} currentStepIndex={$labStore.currentStepIndex} />
			<div class="glass rounded-2xl p-4 border border-white/5">
				<HintButton experimentId={experiment.id} stepId={$labStore.currentStepIndex + 1} stepTitle={experiment.instructions[$labStore.currentStepIndex]?.title} />
			</div>
			<ControlPanel onComplete={handleComplete} />
		</div>

		<!-- Center: Simulation -->
		<div class="lg:col-span-2 space-y-6">
			{#if !showQuiz}
				<!-- Population Chart -->
				<LabCanvas className="min-h-[280px]">
					<div class="p-4">
						<div class="flex items-center justify-between mb-3">
							<h3 class="text-sm font-display font-semibold text-white">Population Dynamics</h3>
							<span class="text-xs font-mono text-gray-400">Step: {state.currentStep}</span>
						</div>
						<svg viewBox="0 0 {chartW} {chartH}" class="w-full h-auto">
							<!-- Grid -->
							{#each [0, 0.25, 0.5, 0.75, 1] as frac}
								<line x1={pad} y1={pad + frac * (chartH - pad * 2)} x2={chartW - pad} y2={pad + frac * (chartH - pad * 2)} stroke="rgba(255,255,255,0.05)" />
							{/each}
							<!-- Axes -->
							<line x1={pad} y1={chartH - pad} x2={chartW - pad} y2={chartH - pad} stroke="rgba(255,255,255,0.2)" />
							<line x1={pad} y1={pad} x2={pad} y2={chartH - pad} stroke="rgba(255,255,255,0.2)" />
							<text x={chartW / 2} y={chartH - 5} text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="9">Time Steps</text>
							<text x={8} y={chartH / 2} text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="9" transform="rotate(-90, 8, {chartH / 2})">Population</text>

							<!-- Event markers -->
							{#each state.history as point}
								{#if point.event !== 'none'}
									{@const maxStep = Math.max(state.history[state.history.length - 1].step, 1)}
									{@const x = pad + (point.step / maxStep) * (chartW - pad * 2)}
									{@const evtConfig = ENVIRONMENTAL_EVENTS.find(e => e.type === point.event)}
									<line x1={x} y1={pad} x2={x} y2={chartH - pad} stroke={evtConfig?.color || '#888'} stroke-width="1" stroke-dasharray="3 3" opacity="0.3" />
								{/if}
							{/each}

							<!-- Species lines -->
							{#each state.species as species}
								<path d={getPopulationPath(species.id)} fill="none" stroke={species.color} stroke-width="1.5" opacity={state.selectedSpeciesId === species.id || !state.selectedSpeciesId ? 1 : 0.2} />
							{/each}
						</svg>
					</div>
				</LabCanvas>

				<!-- Simulation Controls -->
				<div class="glass-strong rounded-2xl p-5 border border-white/10">
					<div class="flex gap-2 mb-4">
						<button onclick={handleStep}
							class="flex-1 py-2.5 rounded-xl glass border border-white/10 text-white text-sm font-medium hover:border-white/20">
							+1 Step
						</button>
						<button onclick={() => handleMultiStep(10)}
							class="flex-1 py-2.5 rounded-xl glass border border-white/10 text-white text-sm font-medium hover:border-white/20">
							+10 Steps
						</button>
						<button onclick={handleToggleAutoRun}
							class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all {autoRunInterval ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'}">
							{autoRunInterval ? 'Stop' : 'Auto Run'}
						</button>
						<button onclick={handleReset}
							class="py-2.5 px-4 rounded-xl glass border border-white/10 text-gray-400 text-sm hover:text-white hover:border-white/20">
							Reset
						</button>
					</div>

					<!-- Speed -->
					<div class="flex items-center gap-3">
						<span class="text-xs text-gray-400">Speed:</span>
						<div class="flex gap-1">
							{#each [1, 2, 3, 4, 5] as spd}
								<button
									onclick={() => { state = setSpeed(state, spd); }}
									class="w-8 h-8 rounded-lg text-xs font-medium {state.speed === spd ? 'bg-emerald-500/20 text-emerald-400' : 'glass border border-white/10 text-gray-500'}"
								>
									{spd}x
								</button>
							{/each}
						</div>
					</div>
				</div>

				<!-- Environmental Events -->
				<div class="glass-strong rounded-2xl p-5 border border-white/10">
					<h3 class="text-sm font-semibold text-white mb-3">Environmental Events</h3>
					<div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
						{#each ENVIRONMENTAL_EVENTS as event}
							<button
								onclick={() => handleEvent(event.type)}
								class="p-3 rounded-xl text-left transition-all glass border border-white/10 hover:border-white/20"
							>
								<div class="flex items-center gap-2 mb-1">
									<div class="w-2 h-2 rounded-full" style="background: {event.color}"></div>
									<span class="text-xs font-medium text-white">{event.name}</span>
								</div>
								<p class="text-[10px] text-gray-500 line-clamp-2">{event.description}</p>
							</button>
						{/each}
					</div>
					{#if state.activeEvents.length > 0}
						<div class="mt-3 flex flex-wrap gap-2">
							{#each state.activeEvents as active}
								<span class="px-2 py-1 rounded-lg text-[10px] font-medium" style="background: {active.event.color}20; color: {active.event.color}">
									{active.event.name} ({active.remainingSteps} steps left)
								</span>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Energy Flow Pyramid -->
				<div class="glass-strong rounded-2xl p-5 border border-white/10">
					<h3 class="text-sm font-semibold text-white mb-3">Energy Pyramid (kJ)</h3>
					<div class="flex flex-col items-center gap-1">
						{#each ['tertiary_consumer', 'secondary_consumer', 'primary_consumer', 'producer'] as level, i}
							{@const energy = trophicEnergy.get(level) || 0}
							{@const maxEnergy = trophicEnergy.get('producer') || 1}
							{@const widthPercent = Math.max(15, (energy / maxEnergy) * 100)}
							<div class="flex items-center gap-3 w-full">
								<span class="text-[10px] text-gray-500 w-28 text-right">{TROPHIC_LABELS[level]}</span>
								<div class="flex-1 h-8 rounded-lg flex items-center px-3 transition-all" style="width: {widthPercent}%; background: {TROPHIC_COLORS[level]}30; border: 1px solid {TROPHIC_COLORS[level]}50">
									<span class="text-xs font-mono" style="color: {TROPHIC_COLORS[level]}">{energy.toLocaleString()}</span>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Species Population Bars -->
				<div class="glass-strong rounded-2xl p-5 border border-white/10">
					<h3 class="text-sm font-semibold text-white mb-3">Current Populations</h3>
					<div class="space-y-2">
						{#each state.species as species}
							{@const pop = state.currentPopulations.get(species.id) || 0}
							{@const maxPop = species.carryingCapacity}
							<button
								onclick={() => { state = selectSpecies(state, state.selectedSpeciesId === species.id ? null : species.id); }}
								class="w-full flex items-center gap-3 p-2 rounded-lg transition-all {state.selectedSpeciesId === species.id ? 'glass border border-white/10' : 'hover:bg-white/5'}"
							>
								<div class="w-3 h-3 rounded-full flex-shrink-0" style="background: {species.color}"></div>
								<span class="text-xs text-gray-300 w-24 text-left">{species.name}</span>
								<div class="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
									<div class="h-full rounded-full transition-all" style="width: {Math.min(100, (pop / maxPop) * 100)}%; background: {species.color}"></div>
								</div>
								<span class="text-xs font-mono text-gray-400 w-12 text-right">{pop}</span>
							</button>
						{/each}
					</div>
				</div>
			{:else}
				<!-- Quiz -->
				<div class="glass-strong rounded-2xl border border-white/10 p-6">
					<h3 class="text-xl font-display font-semibold text-white mb-6">Knowledge Quiz</h3>
					<div class="space-y-6">
						{#each ECOSYSTEM_QUIZ as question}
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
				{showQuiz ? 'Back to Simulation' : 'Take Quiz'}
			</button>

			{#if showResults}
				<div class="glass-strong rounded-2xl p-6 border border-white/10 animate-fade-in-up">
					<h3 class="text-xl font-display font-semibold text-white mb-4">Lab Results</h3>
					<div class="grid grid-cols-2 gap-4 mb-6">
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Steps Simulated</p>
							<p class="text-2xl font-bold text-white">{analysis.totalSteps}</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Events Tested</p>
							<p class="text-2xl font-bold text-white">{analysis.eventsIntroduced}</p>
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
					{#if analysis.extinctions.length > 0}
						<div class="glass rounded-xl p-3 border border-red-500/20 mb-4">
							<p class="text-xs text-red-400 font-medium">Extinctions: {analysis.extinctions.join(', ')}</p>
						</div>
					{/if}
					<p class="text-gray-400 mb-6">{analysis.feedback}</p>
					<div class="flex gap-3">
						<button onclick={() => { handleReset(); showResults = false; showQuiz = false; labStore.reset(); }} class="btn-secondary flex-1">Try Again</button>
						<a href="/labs/biology" class="btn-primary flex-1 text-center">Back to Labs</a>
					</div>
				</div>
			{/if}
		</div>

		<!-- Right: Info -->
		<div class="lg:col-span-1 space-y-6">
			<!-- Selected Species Info -->
			{#if selectedSpeciesInfo}
				<div class="glass-strong rounded-2xl p-5 border border-white/10">
					<div class="flex items-center gap-3 mb-3">
						<div class="w-8 h-8 rounded-full" style="background: {selectedSpeciesInfo.color}40; border: 2px solid {selectedSpeciesInfo.color}"></div>
						<div>
							<h4 class="text-sm font-semibold text-white">{selectedSpeciesInfo.name}</h4>
							<p class="text-[10px] text-gray-500 capitalize">{selectedSpeciesInfo.trophicLevel.replace('_', ' ')}</p>
						</div>
					</div>
					<div class="space-y-2 text-xs">
						<div class="flex justify-between"><span class="text-gray-400">Population</span><span class="text-white font-mono">{state.currentPopulations.get(selectedSpeciesInfo.id) || 0}</span></div>
						<div class="flex justify-between"><span class="text-gray-400">Carrying Capacity</span><span class="text-white">{selectedSpeciesInfo.carryingCapacity}</span></div>
						<div class="flex justify-between"><span class="text-gray-400">Growth Rate</span><span class="text-white">{selectedSpeciesInfo.growthRate}</span></div>
						<div class="flex justify-between"><span class="text-gray-400">Energy Content</span><span class="text-white">{selectedSpeciesInfo.energyContent} kJ</span></div>
						{#if selectedSpeciesInfo.preyIds.length > 0}
							<div>
								<span class="text-gray-400">Eats:</span>
								<span class="text-white ml-1">{selectedSpeciesInfo.preyIds.map(id => DEFAULT_SPECIES.find(s => s.id === id)?.name).filter(Boolean).join(', ')}</span>
							</div>
						{/if}
					</div>
				</div>
			{:else}
				<div class="glass rounded-2xl p-5 border border-white/5 text-center">
					<p class="text-xs text-gray-500">Click a species in the population chart to see details.</p>
				</div>
			{/if}

			<!-- Food Web -->
			<div class="glass-strong rounded-2xl p-5 border border-white/10">
				<h4 class="text-sm font-semibold text-white mb-3">Food Web</h4>
				<svg viewBox="0 0 200 220" class="w-full h-auto">
					<!-- Trophic level labels -->
					{#each [
						{ y: 15, label: 'Tertiary' },
						{ y: 65, label: 'Secondary' },
						{ y: 120, label: 'Primary' },
						{ y: 185, label: 'Producers' }
					] as lvl}
						<text x="3" y={lvl.y} fill="rgba(255,255,255,0.2)" font-size="7">{lvl.label}</text>
					{/each}

					<!-- Species nodes -->
					{#each [
						{ id: 'eagle', x: 100, y: 20 },
						{ id: 'lion', x: 55, y: 70 },
						{ id: 'bird', x: 145, y: 70 },
						{ id: 'zebra', x: 55, y: 125 },
						{ id: 'grasshopper', x: 145, y: 125 },
						{ id: 'grass', x: 80, y: 190 },
						{ id: 'acacia', x: 140, y: 190 }
					] as node}
						{@const sp = DEFAULT_SPECIES.find(s => s.id === node.id)}
						{#if sp}
							<!-- Prey connections -->
							{#each sp.preyIds as preyId}
								{@const preyNode = [
									{ id: 'eagle', x: 100, y: 20 },
									{ id: 'lion', x: 55, y: 70 },
									{ id: 'bird', x: 145, y: 70 },
									{ id: 'zebra', x: 55, y: 125 },
									{ id: 'grasshopper', x: 145, y: 125 },
									{ id: 'grass', x: 80, y: 190 },
									{ id: 'acacia', x: 140, y: 190 }
								].find(n => n.id === preyId)}
								{#if preyNode}
									<line x1={node.x} y1={node.y} x2={preyNode.x} y2={preyNode.y}
										stroke="rgba(255,255,255,0.1)" stroke-width="1" />
								{/if}
							{/each}
							<circle cx={node.x} cy={node.y} r="12" fill="{sp.color}40" stroke={sp.color} stroke-width="1.5" />
							<text x={node.x} y={node.y + 3} text-anchor="middle" fill="white" font-size="6" font-weight="bold">
								{sp.name.split(' ')[0].substring(0, 3)}
							</text>
						{/if}
					{/each}
				</svg>
			</div>

			<!-- Legend -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<h4 class="text-sm font-semibold text-white mb-3">Species Legend</h4>
				<div class="space-y-1.5">
					{#each state.species as species}
						<div class="flex items-center gap-2">
							<div class="w-3 h-3 rounded-full" style="background: {species.color}"></div>
							<span class="text-xs text-gray-400">{species.name}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
