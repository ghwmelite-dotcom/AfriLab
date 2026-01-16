<script lang="ts">
	import { onMount } from 'svelte';
	import { labStore } from '$stores/lab';
	import { aiStore } from '$stores/ai';

	import LabCanvas from '$components/lab/LabCanvas.svelte';
	import ControlPanel from '$components/lab/ControlPanel.svelte';
	import SafetyBanner from '$components/lab/SafetyBanner.svelte';
	import StepGuide from '$components/lab/StepGuide.svelte';
	import HintButton from '$components/ai/HintButton.svelte';
	import CollaborationButton from '$components/collaboration/CollaborationButton.svelte';
	import CollaborationPanel from '$components/collaboration/CollaborationPanel.svelte';

	import {
		createInitialState,
		selectCell,
		identifyPhase,
		analyzeCellDivision,
		MITOSIS_PHASES,
		MITOSIS_QUIZ,
		answerQuiz,
		checkQuizAnswers,
		type CellDivisionState,
		type MitosisPhase
	} from '$lib/simulations/biology/cell-division';
	import type { Experiment, LabSession } from '$types';

	const experiment: Experiment = {
		id: 'bio-cell-division-01',
		disciplineId: 'biology',
		title: 'Cell Division (Mitosis)',
		description: 'Observe and identify the phases of mitosis in dividing cells.',
		difficulty: 'intermediate',
		durationMinutes: 45,
		instructions: [
			{ id: 1, title: 'Introduction', description: 'Review the stages of mitosis before observation.', hints: ['There are 6 main phases'] },
			{ id: 2, title: 'Observe the Slide', description: 'Examine the prepared slide of onion root tip cells.', hints: ['Look for cells at different stages'] },
			{ id: 3, title: 'Identify Interphase', description: 'Find cells with visible nuclei and no chromosomes.', hints: ['The nuclear membrane is intact'] },
			{ id: 4, title: 'Identify Prophase', description: 'Look for condensing chromosomes and dissolving nuclear membrane.', hints: ['Chromosomes become visible'] },
			{ id: 5, title: 'Identify Metaphase', description: 'Find cells with chromosomes aligned at the center.', hints: ['Look for the metaphase plate'] },
			{ id: 6, title: 'Identify Anaphase', description: 'Observe cells with separated chromatids moving to poles.', hints: ['V-shaped chromosomes moving apart'] },
			{ id: 7, title: 'Identify Telophase', description: 'Find cells with chromosomes at poles and reforming nuclei.', hints: ['Nuclear membranes reforming'] },
			{ id: 8, title: 'Complete Quiz', description: 'Answer questions to test your understanding.', hints: ['Review your observations'] }
		],
		simulationConfig: { type: 'cell-division', parameters: {} },
		safetyNotes: 'Handle microscope slides carefully.',
		learningObjectives: ['Identify mitosis phases', 'Understand the cell cycle', 'Recognize chromosome behavior']
	};

	let divisionState: CellDivisionState = $state(createInitialState({ cellCount: 12, includeQuiz: true }));
	let showResults = $state(false);
	let mounted = $state(false);
	let showQuiz = $state(false);

	let selectedCell = $derived(divisionState.cells.find((c) => c.id === divisionState.selectedCellId));
	let analysis = $derived(analyzeCellDivision(divisionState));
	let quizResults = $derived(checkQuizAnswers(divisionState));

	onMount(() => {
		mounted = true;
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
		aiStore.setContext({ discipline: 'biology', experimentTitle: experiment.title, currentStep: 0, studentLevel: 'intermediate', recentMeasurements: [] });
	});

	function handleSelectCell(cellId: string) {
		divisionState = selectCell(divisionState, cellId);
	}

	function handleIdentify(phase: MitosisPhase) {
		if (divisionState.selectedCellId) {
			divisionState = identifyPhase(divisionState, divisionState.selectedCellId, phase);
		}
	}

	function handleQuizAnswer(questionId: string, answer: string) {
		divisionState = answerQuiz(divisionState, questionId, answer);
	}

	function handleComplete() {
		showResults = true;
		labStore.completeLab();
	}

	function getPhaseColor(phase: MitosisPhase): string {
		return MITOSIS_PHASES.find((p) => p.id === phase)?.color || 'rgb(100, 100, 100)';
	}

	function isCorrectlyIdentified(cellId: string): boolean | null {
		const cell = divisionState.cells.find((c) => c.id === cellId);
		const identified = divisionState.identifications.get(cellId);
		if (!identified) return null;
		return cell?.phase === identified;
	}
</script>

<svelte:head>
	<title>Cell Division (Mitosis) - AfriLab</title>
</svelte:head>

<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-emerald-500/10 to-transparent rounded-full blur-3xl"></div>
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
				<span class="text-emerald-400">Cell Division</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-display font-bold text-white">{experiment.title}</h1>
		</div>
		<div class="flex items-center gap-3">
			<CollaborationButton labId={experiment.id} labName={experiment.title} />
			<button onclick={() => aiStore.open()} class="btn-primary">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
				Ask AI
			</button>
		</div>
	</div>

	<div class="mb-6"><SafetyBanner level="info" message="Handle microscope slides carefully. Avoid touching the lens with your fingers." /></div>

	<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
		<!-- Left: Steps -->
		<div class="lg:col-span-1 space-y-6">
			<StepGuide steps={experiment.instructions} currentStepIndex={$labStore.currentStepIndex} />
			<div class="glass rounded-2xl p-4 border border-white/5">
				<HintButton experimentId={experiment.id} stepId={$labStore.currentStepIndex + 1} stepTitle={experiment.instructions[$labStore.currentStepIndex]?.title} />
			</div>
			<ControlPanel onComplete={handleComplete} />
		</div>

		<!-- Center: Cell Field -->
		<div class="lg:col-span-2 space-y-6">
			{#if !showQuiz}
				<LabCanvas className="min-h-[400px]">
					<div class="relative w-full h-full min-h-[400px] bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl overflow-hidden">
						<!-- Cell Grid -->
						{#each divisionState.cells as cell}
							{@const identified = divisionState.identifications.get(cell.id)}
							{@const isCorrect = isCorrectlyIdentified(cell.id)}
							<button
								onclick={() => handleSelectCell(cell.id)}
								class="absolute w-16 h-16 rounded-full border-2 transition-all transform hover:scale-110 {divisionState.selectedCellId === cell.id ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''}"
								style="left: {cell.x}%; top: {cell.y}%; background: {getPhaseColor(cell.phase)}40; border-color: {identified ? (isCorrect ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)') : getPhaseColor(cell.phase)}; transform: translate(-50%, -50%) scale({cell.scale}) rotate({cell.rotation}deg)"
								aria-label="Cell {cell.id}"
							>
								<div class="absolute inset-2 rounded-full" style="background: {getPhaseColor(cell.phase)}60"></div>
								{#if cell.phase === 'metaphase'}
									<div class="absolute inset-0 flex items-center justify-center"><div class="w-full h-0.5 bg-current opacity-50"></div></div>
								{:else if cell.phase === 'anaphase'}
									<div class="absolute inset-0 flex items-center justify-between px-1"><div class="w-2 h-2 rounded-full bg-current opacity-70"></div><div class="w-2 h-2 rounded-full bg-current opacity-70"></div></div>
								{:else if cell.phase === 'interphase' || cell.phase === 'telophase'}
									<div class="absolute inset-4 rounded-full border border-current opacity-50"></div>
								{/if}
							</button>
						{/each}
					</div>
				</LabCanvas>

				<!-- Phase Reference -->
				<div class="glass-strong rounded-2xl border border-white/10 p-4">
					<h4 class="text-sm font-semibold text-white mb-3">Mitosis Phases</h4>
					<div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
						{#each MITOSIS_PHASES as phase}
							<button
								onclick={() => handleIdentify(phase.id)}
								disabled={!divisionState.selectedCellId}
								class="p-2 rounded-lg text-xs text-center transition-all disabled:opacity-50 hover:scale-105"
								style="background: {phase.color}30; border: 1px solid {phase.color}"
							>
								{phase.name}
							</button>
						{/each}
					</div>
				</div>
			{:else}
				<!-- Quiz Section -->
				<div class="glass-strong rounded-2xl border border-white/10 p-6">
					<h3 class="text-xl font-display font-semibold text-white mb-6">Knowledge Quiz</h3>
					<div class="space-y-6">
						{#each MITOSIS_QUIZ as question}
							<div class="glass rounded-xl p-4 border border-white/5">
								<p class="text-white font-medium mb-3">{question.question}</p>
								<div class="grid grid-cols-2 gap-2">
									{#each question.options as option}
										<button
											onclick={() => handleQuizAnswer(question.id, option)}
											class="p-2 rounded-lg text-sm text-left transition-all {divisionState.quizAnswers.get(question.id) === option ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'glass border border-white/10 text-gray-300 hover:border-emerald-500/30'}"
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

			<!-- Toggle Quiz Button -->
			<button onclick={() => showQuiz = !showQuiz} class="w-full btn-secondary">
				{showQuiz ? 'Back to Cells' : 'Take Quiz'}
			</button>

			<!-- Results -->
			{#if showResults}
				<div class="glass-strong rounded-2xl p-6 border border-white/10 animate-fade-in-up">
					<h3 class="text-xl font-display font-semibold text-white mb-4">Lab Results</h3>
					<div class="grid grid-cols-2 gap-4 mb-6">
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Cells Identified</p>
							<p class="text-2xl font-bold text-white">{analysis.identifiedCount}/{analysis.totalCells}</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Accuracy</p>
							<p class="text-2xl font-bold {analysis.accuracy >= 70 ? 'text-emerald-400' : 'text-amber-400'}">{analysis.accuracy}%</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Quiz Score</p>
							<p class="text-2xl font-bold text-white">{quizResults.correct}/{quizResults.total}</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Grade</p>
							<p class="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{analysis.grade}</p>
						</div>
					</div>
					<p class="text-gray-400 mb-6">{analysis.feedback}</p>
					<div class="flex gap-3">
						<button onclick={() => { divisionState = createInitialState({ cellCount: 12, includeQuiz: true }); showResults = false; showQuiz = false; labStore.reset(); }} class="btn-secondary flex-1">Try Again</button>
						<a href="/dashboard" class="btn-primary flex-1 text-center">Dashboard</a>
					</div>
				</div>
			{/if}
		</div>

		<!-- Right: Info -->
		<div class="lg:col-span-1 space-y-6">
			<!-- Selected Cell Info -->
			{#if selectedCell}
				{@const phase = MITOSIS_PHASES.find(p => p.id === selectedCell?.phase)}
				{@const identified = divisionState.identifications.get(selectedCell?.id || '')}
				{@const isCorrect = isCorrectlyIdentified(selectedCell?.id || '')}
				<div class="glass-strong rounded-2xl p-5 border border-white/10">
					<h4 class="text-sm font-semibold text-white mb-3">Selected Cell</h4>
					{#if identified}
						<div class="mb-3">
							<span class="text-xs text-gray-400">Your answer:</span>
							<p class="font-medium {isCorrect ? 'text-emerald-400' : 'text-red-400'}">{MITOSIS_PHASES.find(p => p.id === identified)?.name}</p>
							{#if !isCorrect}
								<p class="text-xs text-gray-500">Correct: {phase?.name}</p>
							{/if}
						</div>
					{/if}
					<p class="text-xs text-gray-400 mb-2">Select a phase below to identify this cell.</p>
				</div>
			{/if}

			<!-- Stats -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<h4 class="text-sm font-semibold text-white mb-4">Progress</h4>
				<div class="space-y-3 text-sm">
					<div class="flex justify-between"><span class="text-gray-400">Identified</span><span class="text-white">{analysis.identifiedCount}/{analysis.totalCells}</span></div>
					<div class="flex justify-between"><span class="text-gray-400">Correct</span><span class="text-emerald-400">{analysis.correctCount}</span></div>
					<div class="flex justify-between"><span class="text-gray-400">Incorrect</span><span class="text-red-400">{analysis.incorrectCount}</span></div>
				</div>
			</div>

			<!-- Phase Legend -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<h4 class="text-sm font-semibold text-white mb-3">Phase Key</h4>
				<div class="space-y-2">
					{#each MITOSIS_PHASES as phase}
						<div class="flex items-center gap-2">
							<div class="w-3 h-3 rounded-full" style="background: {phase.color}"></div>
							<span class="text-xs text-gray-400">{phase.name}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Collaboration Panel -->
<CollaborationPanel />
