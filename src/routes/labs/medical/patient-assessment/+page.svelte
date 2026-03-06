<script lang="ts">
	import { onMount } from 'svelte';
	import { labStore } from '$stores/lab';
	import { aiStore } from '$stores/ai';

	import SafetyBanner from '$components/lab/SafetyBanner.svelte';
	import StepGuide from '$components/lab/StepGuide.svelte';
	import HintButton from '$components/ai/HintButton.svelte';
	import ControlPanel from '$components/lab/ControlPanel.svelte';
	import CollaborationButton from '$components/collaboration/CollaborationButton.svelte';
	import CollaborationPanel from '$components/collaboration/CollaborationPanel.svelte';

	import {
		createInitialState,
		selectScenario,
		revealHistory,
		examineRegion,
		orderInvestigation,
		toggleDifferential,
		setPrimaryDiagnosis,
		addNote,
		answerQuiz,
		setStep,
		analyzeAssessment,
		PATIENT_SCENARIOS,
		QUIZ_QUESTIONS,
		type PatientAssessmentState
	} from '$lib/simulations/medical/patient-assessment';
	import type { Experiment, LabSession } from '$types';

	const experiment: Experiment = {
		id: 'med-patient-assessment-01',
		disciplineId: 'medical',
		title: 'Patient Assessment & History',
		description: 'Practice structured patient history-taking, physical examination, and clinical reasoning.',
		difficulty: 'intermediate',
		durationMinutes: 50,
		instructions: [
			{ id: 1, title: 'Select Patient', description: 'Choose a clinical scenario to assess.', hints: ['Read the triage information carefully'] },
			{ id: 2, title: 'Take History', description: 'Ask questions systematically using the structured approach.', hints: ['Start with the chief complaint', 'Use OLDCARTS for pain'] },
			{ id: 3, title: 'Physical Examination', description: 'Examine the patient systematically.', hints: ['Always start with general appearance and vital signs'] },
			{ id: 4, title: 'Order Investigations', description: 'Select appropriate investigations based on findings.', hints: ['Order targeted tests, not everything'] },
			{ id: 5, title: 'Differential Diagnosis', description: 'Develop a list of possible diagnoses.', hints: ['Consider the most common and most dangerous causes'] },
			{ id: 6, title: 'Primary Diagnosis', description: 'Select the most likely diagnosis.', hints: ['Use all collected information'] },
			{ id: 7, title: 'Quiz', description: 'Test your clinical reasoning knowledge.', hints: ['Apply what you learned'] }
		],
		simulationConfig: { type: 'patient-assessment', parameters: {}, equipment: ['Stethoscope', 'Blood pressure cuff', 'Thermometer', 'Otoscope', 'Reflex hammer'] },
		safetyNotes: 'Always introduce yourself. Obtain consent before examination. Maintain patient dignity and privacy. Wash hands before and after.',
		learningObjectives: [
			'Conduct a structured patient history',
			'Perform a systematic physical examination',
			'Order appropriate investigations',
			'Develop a differential diagnosis and management plan'
		]
	};

	let simState: PatientAssessmentState = $state(createInitialState());
	let showResults = $state(false);
	let mounted = $state(false);
	let noteInput = $state('');

	let currentScenario = $derived(PATIENT_SCENARIOS.find((s) => s.id === simState.currentScenarioId));
	let analysis = $derived(analyzeAssessment(simState));

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
		aiStore.setContext({
			discipline: 'medical',
			experimentTitle: experiment.title,
			currentStep: 0,
			studentLevel: 'intermediate',
			recentMeasurements: []
		});
	});

	function handleSelectScenario(id: string) {
		simState = selectScenario(simState, id);
		labStore.nextStep();
	}

	function handleRevealHistory(index: number) {
		if (!simState.currentScenarioId) return;
		simState = revealHistory(simState, simState.currentScenarioId, index);
		labStore.addAction('Asked question', { index });
	}

	function handleExamineRegion(index: number) {
		if (!simState.currentScenarioId) return;
		simState = examineRegion(simState, simState.currentScenarioId, index);
		labStore.addAction('Examined region', { index });
	}

	function handleOrderInvestigation(index: number) {
		if (!simState.currentScenarioId) return;
		simState = orderInvestigation(simState, simState.currentScenarioId, index);
		labStore.addAction('Ordered investigation', { index });
	}

	function handleToggleDifferential(diffId: string) {
		if (!simState.currentScenarioId) return;
		simState = toggleDifferential(simState, simState.currentScenarioId, diffId);
	}

	function handleSetPrimary(diffId: string) {
		if (!simState.currentScenarioId) return;
		simState = setPrimaryDiagnosis(simState, simState.currentScenarioId, diffId);
	}

	function handleAddNote() {
		if (noteInput.trim()) {
			simState = addNote(simState, noteInput.trim());
			noteInput = '';
		}
	}

	function handleAnswerQuiz(qId: string, idx: number) {
		simState = answerQuiz(simState, qId, idx);
	}

	function handleComplete() {
		showResults = true;
		labStore.completeLab();
	}
</script>

<svelte:head>
	<title>Patient Assessment & History - AfriLab</title>
</svelte:head>

<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
	<div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/10 to-transparent rounded-full blur-3xl"></div>
</div>

<div class="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
		<div>
			<div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
				<a href="/dashboard" class="hover:text-rose-400 transition-colors">Dashboard</a>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
				<a href="/labs/medical" class="hover:text-rose-400 transition-colors">Medical</a>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
				<span class="text-orange-400">Patient Assessment</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-display font-bold text-white">{experiment.title}</h1>
		</div>
		<div class="flex items-center gap-3">
			<CollaborationButton labId={experiment.id} labName={experiment.title} />
			<button onclick={() => aiStore.open()} class="btn-primary">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
				Ask AI Assistant
			</button>
		</div>
	</div>

	<div class="mb-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.1s;">
		<SafetyBanner level="info" message="Always introduce yourself, obtain consent, and maintain patient dignity throughout the assessment." />
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
		<!-- Left Sidebar -->
		<div class="lg:col-span-1 space-y-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.15s;">
			<StepGuide steps={experiment.instructions} currentStepIndex={$labStore.currentStepIndex} />
			<div class="glass rounded-2xl p-4 border border-white/5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-1.5 h-5 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
					<h4 class="text-sm font-display font-semibold text-white">Need Help?</h4>
				</div>
				<HintButton experimentId={experiment.id} stepId={$labStore.currentStepIndex + 1} stepTitle={experiment.instructions[$labStore.currentStepIndex]?.title} />
			</div>
			<ControlPanel onComplete={handleComplete} />

			<!-- Section Tabs -->
			<div class="glass rounded-2xl p-4 border border-white/5">
				<h4 class="text-sm font-display font-semibold text-white mb-3">Assessment Phase</h4>
				<div class="space-y-2">
					{#each [{ key: 'history', label: 'History Taking' }, { key: 'exam', label: 'Physical Exam' }, { key: 'investigations', label: 'Investigations' }, { key: 'diagnosis', label: 'Diagnosis' }, { key: 'quiz', label: 'Quiz' }] as tab}
						<button
							onclick={() => { simState = setStep(simState, tab.key as PatientAssessmentState['step']); }}
							class="w-full px-3 py-2 rounded-lg text-sm text-left transition-all {simState.step === tab.key ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'glass border border-white/10 text-gray-300 hover:border-orange-500/30'}"
						>{tab.label}</button>
					{/each}
				</div>
			</div>

			<!-- Notes -->
			{#if currentScenario}
				<div class="glass rounded-2xl p-4 border border-white/5">
					<h4 class="text-sm font-display font-semibold text-white mb-3">Clinical Notes</h4>
					<div class="flex gap-2 mb-3">
						<input
							type="text"
							bind:value={noteInput}
							placeholder="Add note..."
							class="flex-1 px-3 py-2 rounded-lg glass border border-white/10 text-xs text-white placeholder-gray-500 focus:border-orange-500/30 focus:outline-none"
							onkeydown={(e) => e.key === 'Enter' && handleAddNote()}
						/>
						<button onclick={handleAddNote} class="px-2 py-2 rounded-lg glass border border-white/10 hover:border-orange-500/30 transition-colors" aria-label="Add note">
							<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
						</button>
					</div>
					{#if simState.notes.length > 0}
						<div class="space-y-1.5 max-h-32 overflow-y-auto">
							{#each simState.notes as note}
								<p class="text-xs text-gray-400 glass rounded-lg px-2 py-1.5 border border-white/5">{note}</p>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Main Content -->
		<div class="lg:col-span-3 space-y-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">

			<!-- Scenario Selection -->
			{#if !currentScenario}
				<div class="glass-strong rounded-2xl border border-white/10 p-6">
					<h3 class="text-xl font-display font-semibold text-white mb-4">Select a Patient Scenario</h3>
					<div class="grid sm:grid-cols-2 gap-4">
						{#each PATIENT_SCENARIOS as scenario}
							<button
								onclick={() => handleSelectScenario(scenario.id)}
								class="glass rounded-xl border border-white/10 p-4 text-left hover:border-orange-500/30 hover:bg-orange-500/5 transition-all group"
							>
								<div class="flex items-center gap-3 mb-2">
									<div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold">
										{scenario.avatar}
									</div>
									<div>
										<h4 class="font-medium text-white group-hover:text-orange-400 transition-colors">{scenario.name}</h4>
										<p class="text-xs text-gray-400">{scenario.age} years, {scenario.gender}</p>
									</div>
								</div>
								<p class="text-sm text-orange-400">{scenario.triage}</p>
							</button>
						{/each}
					</div>
				</div>
			{:else}

				<!-- Patient Header -->
				<div class="glass-strong rounded-2xl border border-white/10 p-4">
					<div class="flex items-center gap-4">
						<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-xl font-bold text-white">{currentScenario.avatar}</div>
						<div class="flex-1">
							<h3 class="text-lg font-display font-semibold text-white">{currentScenario.name}</h3>
							<p class="text-sm text-gray-400">{currentScenario.age} years old, {currentScenario.gender}</p>
						</div>
						<div class="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">{currentScenario.triage}</div>
					</div>
				</div>

				<!-- HISTORY SECTION -->
				{#if simState.step === 'history'}
					<div class="glass-strong rounded-2xl border border-white/10 p-6">
						<div class="flex items-center gap-3 mb-4">
							<div class="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
							<h3 class="text-xl font-display font-semibold text-white">History Taking</h3>
						</div>
						<p class="text-sm text-gray-400 mb-6">Click each question to ask the patient and reveal their response.</p>

						<div class="space-y-3">
							{#each currentScenario.history as item, i}
								{@const isRevealed = (simState.revealedHistory[currentScenario.id] || [])[i]}
								<div class="glass rounded-xl border {isRevealed ? 'border-orange-500/20' : 'border-white/10'} overflow-hidden">
									<button
										onclick={() => handleRevealHistory(i)}
										disabled={isRevealed}
										class="w-full p-4 text-left flex items-start gap-3 {isRevealed ? '' : 'hover:bg-orange-500/5'} transition-all"
									>
										<div class="flex-shrink-0 mt-0.5">
											<span class="px-2 py-0.5 rounded-full text-xs font-medium {
												item.section === 'chief_complaint' ? 'bg-red-500/20 text-red-400' :
												item.section === 'hpi' ? 'bg-orange-500/20 text-orange-400' :
												item.section === 'pmh' ? 'bg-blue-500/20 text-blue-400' :
												item.section === 'medications' ? 'bg-green-500/20 text-green-400' :
												item.section === 'allergies' ? 'bg-pink-500/20 text-pink-400' :
												item.section === 'social' ? 'bg-purple-500/20 text-purple-400' :
												item.section === 'family' ? 'bg-cyan-500/20 text-cyan-400' :
												'bg-amber-500/20 text-amber-400'
											}">{item.sectionLabel}</span>
										</div>
										<div class="flex-1">
											<p class="text-sm font-medium text-white">{item.question}</p>
											{#if isRevealed}
												<p class="text-sm text-gray-300 mt-2 pl-3 border-l-2 border-orange-500/30 italic">"{item.answer}"</p>
											{:else}
												<p class="text-xs text-gray-500 mt-1">Click to ask this question</p>
											{/if}
										</div>
									</button>
								</div>
							{/each}
						</div>
					</div>

				<!-- PHYSICAL EXAM SECTION -->
				{:else if simState.step === 'exam'}
					<div class="glass-strong rounded-2xl border border-white/10 p-6">
						<div class="flex items-center gap-3 mb-4">
							<div class="w-1.5 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
							<h3 class="text-xl font-display font-semibold text-white">Physical Examination</h3>
						</div>
						<p class="text-sm text-gray-400 mb-6">Click on body regions to examine the patient.</p>

						<div class="grid sm:grid-cols-2 gap-6">
							<!-- Body diagram -->
							<div class="glass rounded-xl border border-white/5 p-4 flex items-center justify-center">
								<svg viewBox="0 0 200 400" class="w-48 h-80">
									<!-- Simple body outline -->
									<!-- Head -->
									<ellipse cx="100" cy="40" rx="28" ry="32" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
									<!-- Neck -->
									<rect x="90" y="70" width="20" height="15" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
									<!-- Torso -->
									<path d="M 60,85 L 60,230 Q 60,240 70,240 L 130,240 Q 140,240 140,230 L 140,85 Q 140,80 130,80 L 70,80 Q 60,80 60,85 Z" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
									<!-- Arms -->
									<path d="M 60,95 L 25,170 L 20,200" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-linecap="round"/>
									<path d="M 140,95 L 175,170 L 180,200" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-linecap="round"/>
									<!-- Legs -->
									<path d="M 75,240 L 70,330 L 65,380" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-linecap="round"/>
									<path d="M 125,240 L 130,330 L 135,380" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-linecap="round"/>

									<!-- Clickable exam regions -->
									{#each currentScenario.physicalExam as region, i}
										{@const examined = (simState.examinedRegions[currentScenario.id] || [])[i]}
										{@const cx = region.x * 2}
										{@const cy = region.y * 4}
										<circle
											cx={cx} cy={cy} r="14"
											fill={examined ? (region.normal ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)') : 'rgba(255,255,255,0.08)'}
											stroke={examined ? (region.normal ? 'rgba(16,185,129,0.6)' : 'rgba(245,158,11,0.6)') : 'rgba(255,255,255,0.2)'}
											stroke-width="1.5"
											class="cursor-pointer hover:fill-opacity-50 transition-all"
											role="button"
											tabindex="0"
											aria-label="Examine {region.name}"
											onclick={() => handleExamineRegion(i)}
											onkeydown={(e) => e.key === 'Enter' && handleExamineRegion(i)}
										/>
										<text x={cx} y={cy + 4} text-anchor="middle" fill="white" font-size="7" class="pointer-events-none">
											{examined ? (region.normal ? 'N' : '!') : '?'}
										</text>
									{/each}
								</svg>
							</div>

							<!-- Findings panel -->
							<div class="space-y-3">
								{#each currentScenario.physicalExam as region, i}
									{@const examined = (simState.examinedRegions[currentScenario.id] || [])[i]}
									<div class="glass rounded-xl border {examined ? (region.normal ? 'border-emerald-500/20' : 'border-amber-500/20') : 'border-white/5'} p-3">
										<div class="flex items-center gap-2 mb-1">
											<div class="w-2 h-2 rounded-full {examined ? (region.normal ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-gray-600'}"></div>
											<h4 class="text-sm font-medium text-white">{region.name}</h4>
											{#if !examined}
												<button onclick={() => handleExamineRegion(i)} class="ml-auto text-xs text-orange-400 hover:text-orange-300">Examine</button>
											{/if}
										</div>
										{#if examined}
											<p class="text-xs {region.normal ? 'text-gray-400' : 'text-amber-300'}">{region.findings}</p>
										{:else}
											<p class="text-xs text-gray-600 italic">Not yet examined</p>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					</div>

				<!-- INVESTIGATIONS SECTION -->
				{:else if simState.step === 'investigations'}
					<div class="glass-strong rounded-2xl border border-white/10 p-6">
						<div class="flex items-center gap-3 mb-4">
							<div class="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
							<h3 class="text-xl font-display font-semibold text-white">Investigations</h3>
						</div>
						<p class="text-sm text-gray-400 mb-6">Order appropriate investigations. Avoid unnecessary tests.</p>

						<div class="grid sm:grid-cols-2 gap-4">
							{#each currentScenario.investigations as inv, i}
								{@const ordered = (simState.orderedInvestigations[currentScenario.id] || [])[i]}
								<div class="glass rounded-xl border {ordered ? (inv.appropriate ? 'border-emerald-500/20' : 'border-red-500/20') : 'border-white/10'} p-4">
									<div class="flex items-center gap-2 mb-2">
										<span class="px-2 py-0.5 rounded-full text-xs {
											inv.category === 'blood' ? 'bg-red-500/20 text-red-400' :
											inv.category === 'imaging' ? 'bg-blue-500/20 text-blue-400' :
											'bg-purple-500/20 text-purple-400'
										}">{inv.category}</span>
										<h4 class="text-sm font-medium text-white">{inv.name}</h4>
									</div>

									{#if ordered}
										<div class="glass rounded-lg p-3 border border-white/5 mb-2">
											<p class="text-xs text-gray-300">{inv.result}</p>
										</div>
										{#if !inv.appropriate}
											<p class="text-xs text-red-400 italic">This investigation was not indicated for this presentation.</p>
										{/if}
									{:else}
										<button
											onclick={() => handleOrderInvestigation(i)}
											class="px-4 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg transition-all"
										>Order</button>
									{/if}
								</div>
							{/each}
						</div>
					</div>

				<!-- DIAGNOSIS SECTION -->
				{:else if simState.step === 'diagnosis'}
					<div class="glass-strong rounded-2xl border border-white/10 p-6">
						<div class="flex items-center gap-3 mb-4">
							<div class="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-green-500 rounded-full"></div>
							<h3 class="text-xl font-display font-semibold text-white">Differential Diagnosis</h3>
						</div>
						<p class="text-sm text-gray-400 mb-6">Select all plausible diagnoses, then choose the most likely primary diagnosis.</p>

						<div class="space-y-3 mb-6">
							{#each currentScenario.differentials as diff}
								{@const isSelected = (simState.selectedDifferentials[currentScenario.id] || []).includes(diff.id)}
								{@const isPrimary = simState.primaryDiagnosisGuess[currentScenario.id] === diff.id}
								<div class="flex items-center gap-3">
									<button
										onclick={() => handleToggleDifferential(diff.id)}
										class="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all
											{isPrimary ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 ring-2 ring-emerald-500/20' :
											 isSelected ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
											 'glass border border-white/10 text-gray-300 hover:border-orange-500/30'}"
									>
										<div class="flex items-center gap-2">
											<div class="w-4 h-4 rounded border {isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-500'} flex items-center justify-center">
												{#if isSelected}
													<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
												{/if}
											</div>
											{diff.name}
											{#if isPrimary}
												<span class="ml-auto text-xs bg-emerald-500/20 px-2 py-0.5 rounded-full">Primary</span>
											{/if}
										</div>
									</button>
									{#if isSelected}
										<button
											onclick={() => handleSetPrimary(diff.id)}
											class="px-3 py-2 rounded-lg text-xs font-medium transition-all
												{isPrimary ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'glass border border-white/10 text-gray-400 hover:border-emerald-500/30'}"
											title="Set as primary diagnosis"
										>Primary</button>
									{/if}
								</div>
							{/each}
						</div>

						<!-- Show correct answer after primary is selected -->
						{#if simState.primaryDiagnosisGuess[currentScenario.id]}
							{@const correctPrimary = currentScenario.differentials.find((d) => d.isPrimary)}
							{@const isCorrect = simState.primaryDiagnosisGuess[currentScenario.id] === correctPrimary?.id}
							<div class="glass rounded-xl border {isCorrect ? 'border-emerald-500/20' : 'border-amber-500/20'} p-4 mb-4">
								<p class="text-sm {isCorrect ? 'text-emerald-400' : 'text-amber-400'} mb-2">
									{isCorrect ? 'Correct primary diagnosis!' : 'Not quite.'}
								</p>
								<p class="text-sm text-white font-medium">Primary diagnosis: {currentScenario.primaryDiagnosis}</p>
								<div class="mt-3">
									<p class="text-xs text-gray-400 mb-1">Management plan:</p>
									<ul class="space-y-1">
										{#each currentScenario.managementPlan as step}
											<li class="text-xs text-gray-300 flex gap-2"><span class="text-emerald-400">&#8226;</span>{step}</li>
										{/each}
									</ul>
								</div>
							</div>
						{/if}
					</div>

				<!-- QUIZ SECTION -->
				{:else if simState.step === 'quiz'}
					<div class="glass-strong rounded-2xl border border-white/10 p-6">
						<div class="flex items-center gap-3 mb-6">
							<div class="w-1.5 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full"></div>
							<h3 class="text-xl font-display font-semibold text-white">Knowledge Quiz</h3>
						</div>
						<div class="space-y-6">
							{#each QUIZ_QUESTIONS as q, qi}
								<div class="glass rounded-xl border border-white/5 p-4">
									<p class="text-sm font-medium text-white mb-3">{qi + 1}. {q.question}</p>
									<div class="space-y-2">
										{#each q.options as option, oi}
											{@const isSelected = simState.quizAnswers[q.id] === oi}
											{@const isAnswered = simState.quizAnswers[q.id] !== null}
											{@const isCorrectOption = oi === q.correctIndex}
											<button
												onclick={() => handleAnswerQuiz(q.id, oi)}
												disabled={isAnswered}
												class="w-full text-left px-4 py-2 rounded-lg text-sm transition-all
													{isAnswered && isCorrectOption ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
													 isAnswered && isSelected && !isCorrectOption ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
													 isSelected ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
													 'glass border border-white/10 text-gray-300 hover:border-orange-500/30'}"
											>{option}</button>
										{/each}
									</div>
									{#if simState.quizAnswers[q.id] !== null}
										<p class="mt-2 text-xs text-gray-400 italic">{q.explanation}</p>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Results -->
				{#if showResults}
					<div class="glass-strong rounded-2xl p-6 border border-white/10 animate-fade-in-up">
						<div class="flex items-center gap-3 mb-6">
							<div class="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
							<h3 class="text-xl font-display font-semibold text-white">Assessment Results</h3>
						</div>

						<div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
							<div class="glass rounded-xl p-4 border border-white/5">
								<p class="text-xs text-gray-400 mb-1">History</p>
								<p class="text-2xl font-display font-bold text-white">{analysis.historyScore}%</p>
							</div>
							<div class="glass rounded-xl p-4 border border-white/5">
								<p class="text-xs text-gray-400 mb-1">Examination</p>
								<p class="text-2xl font-display font-bold text-white">{analysis.examScore}%</p>
							</div>
							<div class="glass rounded-xl p-4 border border-white/5">
								<p class="text-xs text-gray-400 mb-1">Investigations</p>
								<p class="text-2xl font-display font-bold text-white">{analysis.investigationScore}%</p>
							</div>
							<div class="glass rounded-xl p-4 border border-white/5">
								<p class="text-xs text-gray-400 mb-1">Differentials</p>
								<p class="text-2xl font-display font-bold text-white">{analysis.differentialScore}%</p>
							</div>
							<div class="glass rounded-xl p-4 border border-white/5">
								<p class="text-xs text-gray-400 mb-1">Primary Dx</p>
								<p class="text-2xl font-display font-bold {analysis.primaryDiagnosisCorrect ? 'text-emerald-400' : 'text-amber-400'}">{analysis.primaryDiagnosisCorrect ? 'Correct' : 'Incorrect'}</p>
							</div>
							<div class="glass rounded-xl p-4 border border-white/5">
								<p class="text-xs text-gray-400 mb-1">Quiz</p>
								<p class="text-2xl font-display font-bold text-white">{analysis.quizScore}/{analysis.quizTotal}</p>
							</div>
						</div>

						<div class="glass rounded-xl p-4 border border-orange-500/20 mb-6">
							<div class="flex items-center justify-between mb-3">
								<span class="text-sm font-medium text-gray-300">Overall Score</span>
								<span class="text-lg font-display font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">{analysis.overallScore}% (Grade: {analysis.grade})</span>
							</div>
							<div class="h-2 bg-white/5 rounded-full overflow-hidden">
								<div class="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all" style="width: {analysis.overallScore}%"></div>
							</div>
						</div>

						<p class="text-gray-400 mb-6">{analysis.feedback}</p>

						<div class="flex gap-3">
							<button onclick={() => { simState = createInitialState(); showResults = false; labStore.reset(); }} class="btn-secondary flex-1">Try Another Patient</button>
							<a href="/labs/medical" class="btn-primary flex-1 text-center">Back to Medical Labs</a>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>

<CollaborationPanel />
