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
		listenToPoint,
		identifySound,
		setDiagnosisAnswer,
		answerQuiz,
		setStep,
		generateSoundWaveform,
		analyzeAuscultation,
		HEART_AUSCULTATION_POINTS,
		LUNG_AUSCULTATION_POINTS,
		SOUNDS,
		AUSCULTATION_SCENARIOS,
		QUIZ_QUESTIONS,
		type AuscultationState
	} from '$lib/simulations/medical/auscultation';
	import type { Experiment, LabSession } from '$types';

	const experiment: Experiment = {
		id: 'med-auscultation-01',
		disciplineId: 'medical',
		title: 'Heart & Lung Auscultation',
		description: 'Learn proper stethoscope technique and identify normal and abnormal heart and lung sounds.',
		difficulty: 'advanced',
		durationMinutes: 45,
		instructions: [
			{ id: 1, title: 'Learn Sound Library', description: 'Study the characteristics of normal and abnormal sounds.', hints: ['Start with normal S1/S2 and vesicular sounds'] },
			{ id: 2, title: 'Auscultation Points', description: 'Learn the correct anatomical positions for auscultation.', hints: ['Heart: Aortic, Pulmonic, Erb, Tricuspid, Mitral'] },
			{ id: 3, title: 'Select Scenario', description: 'Choose a patient scenario to practice with.', hints: ['Read the clinical presentation carefully'] },
			{ id: 4, title: 'Listen to Heart', description: 'Click on heart auscultation points to listen.', hints: ['Use the bell for low-pitched sounds, diaphragm for high-pitched'] },
			{ id: 5, title: 'Listen to Lungs', description: 'Click on lung auscultation points to listen.', hints: ['Always compare side to side'] },
			{ id: 6, title: 'Identify Sounds', description: 'Match what you hear to the correct sound type.', hints: ['Focus on timing, pitch, and quality'] },
			{ id: 7, title: 'Diagnose', description: 'Determine the diagnosis based on auscultation findings.', hints: ['Combine heart and lung findings with clinical context'] },
			{ id: 8, title: 'Quiz', description: 'Test your auscultation knowledge.', hints: ['Review sound characteristics'] }
		],
		simulationConfig: { type: 'auscultation', parameters: {}, equipment: ['Stethoscope (bell and diaphragm)', 'Quiet examination room'] },
		safetyNotes: 'Warm the stethoscope before placing on the patient. Explain the procedure. Maintain patient privacy - expose only the area being examined.',
		learningObjectives: [
			'Identify correct auscultation point locations',
			'Distinguish normal from abnormal heart sounds',
			'Distinguish normal from abnormal lung sounds',
			'Correlate auscultation findings with pathology'
		]
	};

	let simState: AuscultationState = $state(createInitialState());
	let showResults = $state(false);
	let mounted = $state(false);
	let selectedSoundForLearn = $state<string | null>(null);

	let currentScenario = $derived(AUSCULTATION_SCENARIOS.find((s) => s.id === simState.currentScenarioId));

	// Get the sound at the currently selected point for the current scenario
	let activeSound = $derived.by(() => {
		if (!currentScenario || !simState.selectedPoint) return null;
		const allSounds = { ...currentScenario.heartSounds, ...currentScenario.lungSounds };
		const soundId = allSounds[simState.selectedPoint];
		return SOUNDS.find((s) => s.id === soundId) || null;
	});

	let activeSoundWaveform = $derived(activeSound ? generateSoundWaveform(activeSound, 200) : []);
	let learnSound = $derived(SOUNDS.find((s) => s.id === selectedSoundForLearn));
	let learnWaveform = $derived(learnSound ? generateSoundWaveform(learnSound, 200) : []);
	let analysis = $derived(analyzeAuscultation(simState));

	// Heart sounds for identification dropdown
	let heartSoundOptions = $derived(SOUNDS.filter((s) => s.area === 'heart'));
	let lungSoundOptions = $derived(SOUNDS.filter((s) => s.area === 'lung'));

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
			studentLevel: 'advanced',
			recentMeasurements: []
		});
	});

	function handleSelectScenario(id: string) {
		simState = selectScenario(simState, id);
		labStore.addAction('Selected scenario', { id });
	}

	function handleListenToPoint(pointId: string) {
		if (!simState.currentScenarioId) return;
		simState = listenToPoint(simState, simState.currentScenarioId, pointId);
		labStore.addAction('Listened to point', { pointId });
	}

	function handleIdentifySound(pointId: string, soundId: string) {
		if (!simState.currentScenarioId) return;
		simState = identifySound(simState, simState.currentScenarioId, pointId, soundId);
	}

	function handleDiagnosis(diagnosis: string) {
		if (!simState.currentScenarioId) return;
		simState = setDiagnosisAnswer(simState, simState.currentScenarioId, diagnosis);
	}

	function handleAnswerQuiz(qId: string, idx: number) {
		simState = answerQuiz(simState, qId, idx);
	}

	function handleComplete() {
		showResults = true;
		labStore.completeLab();
	}

	function waveformToPath(data: number[], width: number, height: number): string {
		if (data.length === 0) return '';
		const midY = height / 2;
		const scaleY = height * 0.4;
		return 'M' + data.map((v, i) => `${(i / data.length) * width},${midY - v * scaleY}`).join(' L');
	}
</script>

<svelte:head>
	<title>Heart & Lung Auscultation - AfriLab</title>
</svelte:head>

<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-violet-500/10 to-transparent rounded-full blur-3xl"></div>
	<div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
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
				<span class="text-violet-400">Auscultation</span>
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
		<SafetyBanner level="info" message="Warm the stethoscope before placing on the patient. Explain each step and maintain patient privacy." />
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
		<!-- Left Sidebar -->
		<div class="lg:col-span-1 space-y-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.15s;">
			<StepGuide steps={experiment.instructions} currentStepIndex={$labStore.currentStepIndex} />
			<div class="glass rounded-2xl p-4 border border-white/5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-1.5 h-5 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full"></div>
					<h4 class="text-sm font-display font-semibold text-white">Need Help?</h4>
				</div>
				<HintButton experimentId={experiment.id} stepId={$labStore.currentStepIndex + 1} stepTitle={experiment.instructions[$labStore.currentStepIndex]?.title} />
			</div>
			<ControlPanel onComplete={handleComplete} />

			<!-- Section tabs -->
			<div class="glass rounded-2xl p-4 border border-white/5">
				<h4 class="text-sm font-display font-semibold text-white mb-3">Lab Section</h4>
				<div class="space-y-2">
					{#each [{ key: 'learn', label: 'Sound Library' }, { key: 'practice', label: 'Practice' }, { key: 'diagnose', label: 'Diagnose' }, { key: 'quiz', label: 'Quiz' }] as tab}
						<button
							onclick={() => { simState = setStep(simState, tab.key as AuscultationState['step']); }}
							class="w-full px-3 py-2 rounded-lg text-sm text-left transition-all {simState.step === tab.key ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'glass border border-white/10 text-gray-300 hover:border-violet-500/30'}"
						>{tab.label}</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Main Content -->
		<div class="lg:col-span-3 space-y-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">

			<!-- SOUND LIBRARY -->
			{#if simState.step === 'learn'}
				<div class="glass-strong rounded-2xl border border-white/10 p-6">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-1.5 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full"></div>
						<h3 class="text-xl font-display font-semibold text-white">Sound Library</h3>
					</div>
					<p class="text-sm text-gray-400 mb-6">Click a sound to view its waveform and characteristics.</p>

					<!-- Heart Sounds -->
					<h4 class="text-sm font-display font-semibold text-rose-400 mb-3">Heart Sounds</h4>
					<div class="grid sm:grid-cols-2 gap-3 mb-6">
						{#each SOUNDS.filter(s => s.area === 'heart') as sound}
							<button
								onclick={() => { selectedSoundForLearn = sound.id; }}
								class="glass rounded-xl border p-3 text-left transition-all {selectedSoundForLearn === sound.id ? 'border-violet-500/30 bg-violet-500/5' : 'border-white/10 hover:border-violet-500/30'}"
							>
								<h5 class="text-sm font-medium text-white">{sound.name}</h5>
								<p class="text-xs text-gray-400 mt-1">{sound.timing}</p>
							</button>
						{/each}
					</div>

					<!-- Lung Sounds -->
					<h4 class="text-sm font-display font-semibold text-cyan-400 mb-3">Lung Sounds</h4>
					<div class="grid sm:grid-cols-2 gap-3 mb-6">
						{#each SOUNDS.filter(s => s.area === 'lung') as sound}
							<button
								onclick={() => { selectedSoundForLearn = sound.id; }}
								class="glass rounded-xl border p-3 text-left transition-all {selectedSoundForLearn === sound.id ? 'border-violet-500/30 bg-violet-500/5' : 'border-white/10 hover:border-violet-500/30'}"
							>
								<h5 class="text-sm font-medium text-white">{sound.name}</h5>
								<p class="text-xs text-gray-400 mt-1">{sound.timing}</p>
							</button>
						{/each}
					</div>

					<!-- Selected sound details -->
					{#if learnSound}
						<div class="glass rounded-xl border border-violet-500/20 p-4">
							<h4 class="text-lg font-display font-semibold text-white mb-2">{learnSound.name}</h4>

							<!-- Waveform -->
							<div class="glass rounded-lg border border-white/5 p-3 mb-4" style="background: rgba(0,0,0,0.3);">
								<svg viewBox="0 0 400 100" class="w-full h-20">
									<path d={waveformToPath(learnWaveform, 400, 100)} fill="none" stroke={learnSound.area === 'heart' ? '#f43f5e' : '#06b6d4'} stroke-width="1.5"/>
								</svg>
							</div>

							<p class="text-sm text-gray-300 mb-3">{learnSound.description}</p>

							<div class="grid sm:grid-cols-2 gap-4">
								<div>
									<h5 class="text-xs font-medium text-gray-400 mb-2">Characteristics</h5>
									<ul class="space-y-1">
										{#each learnSound.characteristics as char}
											<li class="text-xs text-gray-300 flex gap-2"><span class="text-violet-400">&#8226;</span>{char}</li>
										{/each}
									</ul>
								</div>
								<div>
									<h5 class="text-xs font-medium text-gray-400 mb-2">Associated Conditions</h5>
									<ul class="space-y-1">
										{#each learnSound.associatedConditions as cond}
											<li class="text-xs text-gray-300 flex gap-2"><span class="text-amber-400">&#8226;</span>{cond}</li>
										{/each}
									</ul>
								</div>
							</div>
						</div>
					{/if}
				</div>

			<!-- PRACTICE SECTION -->
			{:else if simState.step === 'practice'}
				<!-- Scenario selector -->
				{#if !currentScenario}
					<div class="glass-strong rounded-2xl border border-white/10 p-6">
						<h3 class="text-xl font-display font-semibold text-white mb-4">Select a Patient Scenario</h3>
						<div class="grid sm:grid-cols-2 gap-4">
							{#each AUSCULTATION_SCENARIOS as scenario}
								<button
									onclick={() => handleSelectScenario(scenario.id)}
									class="glass rounded-xl border border-white/10 p-4 text-left hover:border-violet-500/30 hover:bg-violet-500/5 transition-all group"
								>
									<div class="flex items-center gap-3 mb-2">
										<div class="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
											{scenario.patientName.charAt(0)}
										</div>
										<div>
											<h4 class="font-medium text-white group-hover:text-violet-400 transition-colors">{scenario.patientName}</h4>
											<p class="text-xs text-gray-400">{scenario.age} years, {scenario.gender}</p>
										</div>
									</div>
									<p class="text-sm text-gray-300">{scenario.presentation}</p>
								</button>
							{/each}
						</div>
					</div>
				{:else}
					<!-- Patient info -->
					<div class="glass-strong rounded-2xl border border-white/10 p-4 mb-0">
						<div class="flex items-center gap-4">
							<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">{currentScenario.patientName.charAt(0)}</div>
							<div class="flex-1">
								<h3 class="text-lg font-display font-semibold text-white">{currentScenario.patientName}</h3>
								<p class="text-sm text-gray-400">{currentScenario.age}y {currentScenario.gender} - {currentScenario.presentation}</p>
							</div>
							<button onclick={() => { simState = { ...simState, currentScenarioId: null, selectedPoint: null }; }} class="text-xs text-gray-400 hover:text-violet-400">Change</button>
						</div>
					</div>

					<div class="grid sm:grid-cols-2 gap-6">
						<!-- Heart Auscultation Diagram -->
						<div class="glass-strong rounded-2xl border border-white/10 p-4">
							<h4 class="text-sm font-display font-semibold text-rose-400 mb-3">Heart Auscultation</h4>
							<div class="flex justify-center">
								<svg viewBox="0 0 200 200" class="w-full max-w-[250px] h-auto">
									<!-- Chest outline -->
									<ellipse cx="100" cy="100" rx="85" ry="90" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
									<!-- Sternum -->
									<line x1="100" y1="20" x2="100" y2="170" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
									<!-- Ribs (simplified) -->
									{#each [40, 60, 80, 100, 120] as y}
										<path d="M 50,{y} Q 100,{y + 8} 150,{y}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
									{/each}

									<!-- Auscultation points -->
									{#each HEART_AUSCULTATION_POINTS as point}
										{@const listened = (simState.listenedPoints[currentScenario.id] || []).includes(point.id)}
										{@const isActive = simState.selectedPoint === point.id}
										<g>
											<circle
												cx={point.x * 2} cy={point.y * 2}
												r={isActive ? 12 : 10}
												fill={isActive ? 'rgba(244,63,94,0.4)' : listened ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}
												stroke={isActive ? '#f43f5e' : listened ? '#10b981' : 'rgba(255,255,255,0.3)'}
												stroke-width={isActive ? 2 : 1.5}
												class="cursor-pointer transition-all"
												role="button"
												tabindex="0"
												aria-label="Listen to {point.name}"
												onclick={() => handleListenToPoint(point.id)}
												onkeydown={(e) => e.key === 'Enter' && handleListenToPoint(point.id)}
											/>
											<!-- Pulse animation for active point -->
											{#if isActive}
												<circle cx={point.x * 2} cy={point.y * 2} r="14" fill="none" stroke="#f43f5e" stroke-width="1" opacity="0.5">
													<animate attributeName="r" values="14;20;14" dur="1.5s" repeatCount="indefinite"/>
													<animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite"/>
												</circle>
											{/if}
											<text x={point.x * 2} y={point.y * 2 - 14} text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="7" font-weight="500">{point.name.split(' ')[0]}</text>
										</g>
									{/each}
								</svg>
							</div>
						</div>

						<!-- Lung Auscultation Diagram -->
						<div class="glass-strong rounded-2xl border border-white/10 p-4">
							<h4 class="text-sm font-display font-semibold text-cyan-400 mb-3">Lung Auscultation</h4>
							<div class="flex justify-center">
								<svg viewBox="0 0 200 200" class="w-full max-w-[250px] h-auto">
									<!-- Chest outline (posterior) -->
									<ellipse cx="100" cy="100" rx="85" ry="90" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
									<!-- Spine -->
									<line x1="100" y1="20" x2="100" y2="170" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
									<!-- Lung fields -->
									<path d="M 30,35 Q 50,30 80,40 L 80,150 Q 50,160 30,140 Z" fill="rgba(6,182,212,0.05)" stroke="rgba(6,182,212,0.15)" stroke-width="1"/>
									<path d="M 170,35 Q 150,30 120,40 L 120,150 Q 150,160 170,140 Z" fill="rgba(6,182,212,0.05)" stroke="rgba(6,182,212,0.15)" stroke-width="1"/>

									<!-- Auscultation points -->
									{#each LUNG_AUSCULTATION_POINTS as point}
										{@const listened = (simState.listenedPoints[currentScenario.id] || []).includes(point.id)}
										{@const isActive = simState.selectedPoint === point.id}
										{@const cx = point.id.includes('right') ? point.x * 1.4 : point.x * 2.2}
										{@const cy = point.y * 2.2}
										<g>
											<circle
												{cx} {cy}
												r={isActive ? 12 : 10}
												fill={isActive ? 'rgba(6,182,212,0.4)' : listened ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}
												stroke={isActive ? '#06b6d4' : listened ? '#10b981' : 'rgba(255,255,255,0.3)'}
												stroke-width={isActive ? 2 : 1.5}
												class="cursor-pointer transition-all"
												role="button"
												tabindex="0"
												aria-label="Listen to {point.name}"
												onclick={() => handleListenToPoint(point.id)}
												onkeydown={(e) => e.key === 'Enter' && handleListenToPoint(point.id)}
											/>
											{#if isActive}
												<circle {cx} {cy} r="14" fill="none" stroke="#06b6d4" stroke-width="1" opacity="0.5">
													<animate attributeName="r" values="14;20;14" dur="1.5s" repeatCount="indefinite"/>
													<animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite"/>
												</circle>
											{/if}
											<text x={cx} y={cy - 14} text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="6">{point.name.replace('Right ', 'R ').replace('Left ', 'L ')}</text>
										</g>
									{/each}
								</svg>
							</div>
						</div>
					</div>

					<!-- Sound display for selected point -->
					{#if activeSound}
						<div class="glass-strong rounded-2xl border border-violet-500/20 p-4">
							<div class="flex items-center gap-3 mb-3">
								<div class="w-8 h-8 rounded-full bg-gradient-to-br {activeSound.area === 'heart' ? 'from-rose-500 to-red-500' : 'from-cyan-500 to-blue-500'} flex items-center justify-center">
									<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
								</div>
								<div>
									<h4 class="text-sm font-medium text-white">{activeSound.name}</h4>
									<p class="text-xs text-gray-400">{activeSound.timing}</p>
								</div>
							</div>

							<!-- Waveform -->
							<div class="glass rounded-lg border border-white/5 p-2 mb-3" style="background: rgba(0,0,0,0.3);">
								<svg viewBox="0 0 400 80" class="w-full h-16">
									<path d={waveformToPath(activeSoundWaveform, 400, 80)} fill="none" stroke={activeSound.area === 'heart' ? '#f43f5e' : '#06b6d4'} stroke-width="1.5"/>
								</svg>
							</div>

							<p class="text-xs text-gray-300 mb-3">{activeSound.description}</p>

							<!-- Sound identification -->
							{#if true}
							{@const allPoints = [...HEART_AUSCULTATION_POINTS, ...LUNG_AUSCULTATION_POINTS]}
							{@const currentPoint = allPoints.find(p => p.id === simState.selectedPoint)}
							{#if currentPoint}
								<div class="glass rounded-lg border border-white/5 p-3">
									<p class="text-xs text-gray-400 mb-2">Identify this sound:</p>
									<div class="flex flex-wrap gap-2">
										{#each (currentPoint.area === 'heart' ? heartSoundOptions : lungSoundOptions) as opt}
											{@const currentIdentification = simState.soundIdentifications[currentScenario.id]?.[simState.selectedPoint!]}
											{@const isChosen = currentIdentification === opt.id}
											<button
												onclick={() => handleIdentifySound(simState.selectedPoint!, opt.id)}
												class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all
													{isChosen ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'glass border border-white/10 text-gray-300 hover:border-violet-500/30'}"
											>{opt.name}</button>
										{/each}
									</div>
								</div>
							{/if}
							{/if}
						</div>
					{:else if currentScenario}
						<div class="glass rounded-2xl border border-white/5 p-8 text-center">
							<svg class="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
							<p class="text-gray-500">Click an auscultation point on the diagrams above to listen.</p>
						</div>
					{/if}
				{/if}

			<!-- DIAGNOSE SECTION -->
			{:else if simState.step === 'diagnose'}
				<div class="glass-strong rounded-2xl border border-white/10 p-6">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-green-500 rounded-full"></div>
						<h3 class="text-xl font-display font-semibold text-white">Diagnosis from Auscultation</h3>
					</div>
					<p class="text-sm text-gray-400 mb-6">Based on your auscultation findings, select the most likely diagnosis for each scenario.</p>

					<div class="space-y-6">
						{#each AUSCULTATION_SCENARIOS as scenario}
							<div class="glass rounded-xl border border-white/5 p-4">
								<div class="flex items-center gap-3 mb-2">
									<div class="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">{scenario.patientName.charAt(0)}</div>
									<div>
										<h4 class="text-sm font-medium text-white">{scenario.patientName}, {scenario.age}y {scenario.gender}</h4>
										<p class="text-xs text-gray-400">{scenario.presentation}</p>
									</div>
								</div>

								<div class="grid grid-cols-2 gap-2 mt-3">
									{#each scenario.diagnosisOptions as option}
										{@const isSelected = simState.diagnosisAnswers[scenario.id] === option}
										{@const isAnswered = simState.diagnosisAnswers[scenario.id] !== null}
										{@const isCorrect = option === scenario.correctDiagnosis}
										<button
											onclick={() => handleDiagnosis(option)}
											disabled={isAnswered}
											class="px-3 py-2 rounded-lg text-xs font-medium text-left transition-all
												{isAnswered && isCorrect ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
												 isAnswered && isSelected && !isCorrect ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
												 isSelected ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' :
												 'glass border border-white/10 text-gray-300 hover:border-violet-500/30'}"
										>{option}</button>
									{/each}
								</div>

								{#if simState.diagnosisAnswers[scenario.id]}
									<p class="mt-2 text-xs text-gray-400">Correct answer: <span class="text-emerald-400">{scenario.correctDiagnosis}</span></p>
								{/if}
							</div>
						{/each}
					</div>
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
												 isSelected ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' :
												 'glass border border-white/10 text-gray-300 hover:border-violet-500/30'}"
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
						<div class="w-1.5 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full"></div>
						<h3 class="text-xl font-display font-semibold text-white">Lab Results</h3>
					</div>

					<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-xs text-gray-400 mb-1">Points Listened</p>
							<p class="text-2xl font-display font-bold text-white">{analysis.pointsListened}</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-xs text-gray-400 mb-1">Sounds ID'd</p>
							<p class="text-2xl font-display font-bold text-white">{analysis.soundsCorrectlyIdentified}/{analysis.totalSoundsAttempted}</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-xs text-gray-400 mb-1">Diagnoses</p>
							<p class="text-2xl font-display font-bold text-white">{analysis.diagnosesCorrect}/{analysis.totalDiagnoses}</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-xs text-gray-400 mb-1">Quiz</p>
							<p class="text-2xl font-display font-bold text-white">{analysis.quizScore}/{analysis.quizTotal}</p>
						</div>
					</div>

					<div class="glass rounded-xl p-4 border border-violet-500/20 mb-6">
						<div class="flex items-center justify-between mb-3">
							<span class="text-sm font-medium text-gray-300">Overall Score</span>
							<span class="text-lg font-display font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">{analysis.overallScore}% (Grade: {analysis.grade})</span>
						</div>
						<div class="h-2 bg-white/5 rounded-full overflow-hidden">
							<div class="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all" style="width: {analysis.overallScore}%"></div>
						</div>
					</div>

					<p class="text-gray-400 mb-6">{analysis.feedback}</p>

					<div class="flex gap-3">
						<button onclick={() => { simState = createInitialState(); showResults = false; labStore.reset(); }} class="btn-secondary flex-1">Try Again</button>
						<a href="/labs/medical" class="btn-primary flex-1 text-center">Back to Medical Labs</a>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<CollaborationPanel />
