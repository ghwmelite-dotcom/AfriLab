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
		selectRhythm,
		identifyComponent,
		setHeartRateCalculation,
		setDiagnosisAnswer,
		answerQuiz,
		setStep,
		generateECGWaveform,
		analyzeECGLab,
		ECG_RHYTHMS,
		WAVE_COMPONENTS,
		DIAGNOSIS_SCENARIOS,
		QUIZ_QUESTIONS,
		type ECGState,
		type RhythmType
	} from '$lib/simulations/medical/ecg-reading';
	import type { Experiment, LabSession } from '$types';

	const experiment: Experiment = {
		id: 'med-ecg-reading-01',
		disciplineId: 'medical',
		title: 'ECG Reading & Interpretation',
		description: 'Learn to read and interpret ECG traces, identify wave components, and diagnose arrhythmias.',
		difficulty: 'intermediate',
		durationMinutes: 45,
		instructions: [
			{ id: 1, title: 'Learn ECG Waveforms', description: 'Study the normal PQRST complex and its components.', hints: ['P wave = atrial depolarization', 'QRS = ventricular depolarization'] },
			{ id: 2, title: 'Identify Components', description: 'Click on each wave component to learn about it.', hints: ['Normal PR interval is 120-200ms'] },
			{ id: 3, title: 'View Different Rhythms', description: 'Explore normal and abnormal ECG rhythms.', hints: ['Compare R-R intervals for regularity'] },
			{ id: 4, title: 'Calculate Heart Rate', description: 'Use the 300 method to calculate heart rate from R-R interval.', hints: ['HR = 300 / number of large boxes between R waves'] },
			{ id: 5, title: 'Rhythm Analysis', description: 'Systematically analyze each rhythm: Rate, Rhythm, P waves, PR interval, QRS.', hints: ['Always use a systematic approach'] },
			{ id: 6, title: 'Diagnosis Matching', description: 'Match ECG findings to clinical scenarios.', hints: ['Consider the clinical context'] },
			{ id: 7, title: 'Quiz', description: 'Test your ECG interpretation knowledge.', hints: ['Review key diagnostic criteria'] }
		],
		simulationConfig: { type: 'ecg-reading', parameters: {}, equipment: ['12-Lead ECG machine', 'ECG calipers', 'ECG ruler'] },
		safetyNotes: 'Ensure proper electrode placement. Clean skin before applying electrodes. Never interpret an ECG in isolation - always correlate with clinical findings.',
		learningObjectives: [
			'Identify P wave, QRS complex, T wave, and intervals',
			'Calculate heart rate from R-R interval',
			'Recognize normal sinus rhythm and common arrhythmias',
			'Match ECG findings to clinical diagnoses'
		]
	};

	let simState: ECGState = $state(createInitialState());
	let showResults = $state(false);
	let mounted = $state(false);
	let hrInput = $state('');
	let animationOffset = $state(0);
	let animInterval: ReturnType<typeof setInterval> | null = null;

	let currentRhythm = $derived(ECG_RHYTHMS.find((r) => r.id === simState.currentRhythmId));
	let waveformData = $derived(currentRhythm ? generateECGWaveform(currentRhythm, 400) : []);
	let analysis = $derived(analyzeECGLab(simState));

	// Animation for ECG trace
	onMount(() => {
		mounted = true;
		animInterval = setInterval(() => {
			animationOffset = (animationOffset + 1) % 100;
		}, 50);

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

		return () => {
			if (animInterval) clearInterval(animInterval);
		};
	});

	function handleSelectRhythm(rhythmId: RhythmType) {
		simState = selectRhythm(simState, rhythmId);
		hrInput = '';
		labStore.addAction('Viewed rhythm', { rhythmId });
	}

	function handleIdentifyComponent(componentId: string) {
		simState = identifyComponent(simState, componentId);
		labStore.addAction('Identified component', { componentId });
	}

	function handleSubmitHR() {
		if (!simState.currentRhythmId || !hrInput) return;
		const hr = parseInt(hrInput);
		if (isNaN(hr)) return;
		simState = setHeartRateCalculation(simState, simState.currentRhythmId, hr);
		labStore.addMeasurement({ type: 'heart_rate_calc', value: hr, unit: 'bpm', label: `HR for ${simState.currentRhythmId}` });
	}

	function handleDiagnosis(scenarioId: string, diagnosis: string) {
		simState = setDiagnosisAnswer(simState, scenarioId, diagnosis);
	}

	function handleAnswerQuiz(qId: string, idx: number) {
		simState = answerQuiz(simState, qId, idx);
	}

	function handleComplete() {
		showResults = true;
		labStore.completeLab();
	}

	function waveformToSvgPath(data: number[], width: number, height: number, offset: number = 0): string {
		if (data.length === 0) return '';
		const midY = height / 2;
		const scaleY = height * 0.4;
		const points = data.map((v, i) => {
			const x = ((i + offset) % data.length) / data.length * width;
			const y = midY - v * scaleY;
			return `${x},${y}`;
		});
		return `M${points.join(' L')}`;
	}
</script>

<svelte:head>
	<title>ECG Reading & Interpretation - AfriLab</title>
</svelte:head>

<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-pink-500/10 to-transparent rounded-full blur-3xl"></div>
	<div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-r from-fuchsia-500/10 to-transparent rounded-full blur-3xl"></div>
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
				<span class="text-pink-400">ECG Reading</span>
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
		<SafetyBanner level="info" message="Always correlate ECG findings with clinical presentation. Never interpret an ECG in isolation." />
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
		<!-- Left Sidebar -->
		<div class="lg:col-span-1 space-y-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.15s;">
			<StepGuide steps={experiment.instructions} currentStepIndex={$labStore.currentStepIndex} />
			<div class="glass rounded-2xl p-4 border border-white/5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-1.5 h-5 bg-gradient-to-b from-pink-500 to-fuchsia-500 rounded-full"></div>
					<h4 class="text-sm font-display font-semibold text-white">Need Help?</h4>
				</div>
				<HintButton experimentId={experiment.id} stepId={$labStore.currentStepIndex + 1} stepTitle={experiment.instructions[$labStore.currentStepIndex]?.title} />
			</div>
			<ControlPanel onComplete={handleComplete} />

			<!-- Section tabs -->
			<div class="glass rounded-2xl p-4 border border-white/5">
				<h4 class="text-sm font-display font-semibold text-white mb-3">Lab Section</h4>
				<div class="space-y-2">
					{#each [{ key: 'waveforms', label: 'ECG Waveforms' }, { key: 'components', label: 'Wave Components' }, { key: 'rhythms', label: 'Rhythm Analysis' }, { key: 'diagnosis', label: 'Diagnosis Matching' }, { key: 'quiz', label: 'Quiz' }] as tab}
						<button
							onclick={() => { simState = setStep(simState, tab.key as ECGState['step']); }}
							class="w-full px-3 py-2 rounded-lg text-sm text-left transition-all {simState.step === tab.key ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'glass border border-white/10 text-gray-300 hover:border-pink-500/30'}"
						>{tab.label}</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Main Content -->
		<div class="lg:col-span-3 space-y-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">

			<!-- WAVEFORMS SECTION -->
			{#if simState.step === 'waveforms' || simState.step === 'rhythms'}
				<div class="glass-strong rounded-2xl border border-white/10 p-6">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-1.5 h-6 bg-gradient-to-b from-pink-500 to-fuchsia-500 rounded-full"></div>
						<h3 class="text-xl font-display font-semibold text-white">
							{simState.step === 'waveforms' ? 'ECG Waveforms' : 'Rhythm Analysis'}
						</h3>
					</div>

					<!-- Rhythm selector -->
					<div class="flex flex-wrap gap-2 mb-6">
						{#each ECG_RHYTHMS as rhythm}
							{@const isSelected = simState.currentRhythmId === rhythm.id}
							{@const isViewed = simState.viewedRhythms.includes(rhythm.id)}
							<button
								onclick={() => handleSelectRhythm(rhythm.id)}
								class="px-3 py-2 rounded-lg text-sm font-medium transition-all
									{isSelected ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' :
									 isViewed ? 'glass border border-emerald-500/30 text-emerald-400' :
									 'glass border border-white/10 text-gray-300 hover:border-pink-500/30'}"
							>
								{rhythm.name}
								{#if isViewed && !isSelected}
									<span class="ml-1 text-xs">&#10003;</span>
								{/if}
							</button>
						{/each}
					</div>

					{#if currentRhythm}
						<!-- ECG Trace Display -->
						<div class="glass rounded-xl border border-pink-500/20 p-4 mb-4" style="background: linear-gradient(135deg, rgba(10,10,10,0.9), rgba(20,10,15,0.9));">
							<div class="flex items-center justify-between mb-2">
								<span class="text-sm font-medium text-pink-400">{currentRhythm.name}</span>
								<span class="text-xs text-gray-400">25mm/s | 10mm/mV</span>
							</div>
							<!-- ECG grid background + trace -->
							<svg viewBox="0 0 800 200" class="w-full h-48 sm:h-56">
								<!-- Grid lines -->
								{#each Array(41) as _, i}
									<line x1={i * 20} y1="0" x2={i * 20} y2="200" stroke="rgba(255,100,100,0.08)" stroke-width="0.5" />
								{/each}
								{#each Array(11) as _, i}
									<line x1="0" y1={i * 20} x2="800" y2={i * 20} stroke="rgba(255,100,100,0.08)" stroke-width="0.5" />
								{/each}
								<!-- Major grid -->
								{#each Array(9) as _, i}
									<line x1={i * 100} y1="0" x2={i * 100} y2="200" stroke="rgba(255,100,100,0.15)" stroke-width="1" />
								{/each}
								{#each Array(5) as _, i}
									<line x1="0" y1={i * 50} x2="800" y2={i * 50} stroke="rgba(255,100,100,0.15)" stroke-width="1" />
								{/each}

								<!-- ECG trace -->
								<path
									d={waveformToSvgPath(waveformData, 800, 200, animationOffset)}
									fill="none"
									stroke="#22c55e"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</div>

						<!-- Rhythm details -->
						<div class="grid sm:grid-cols-2 gap-4 mb-4">
							<div class="glass rounded-xl border border-white/5 p-4">
								<h4 class="text-sm font-medium text-white mb-2">Characteristics</h4>
								<ul class="space-y-1">
									{#each currentRhythm.characteristics as char}
										<li class="text-xs text-gray-400 flex items-start gap-2">
											<span class="text-pink-400 mt-0.5">&#8226;</span>
											{char}
										</li>
									{/each}
								</ul>
							</div>
							<div class="glass rounded-xl border border-white/5 p-4">
								<h4 class="text-sm font-medium text-white mb-2">Parameters</h4>
								<div class="space-y-2 text-xs">
									<div class="flex justify-between"><span class="text-gray-400">Heart Rate:</span><span class="text-white font-mono">{currentRhythm.heartRate} bpm</span></div>
									<div class="flex justify-between"><span class="text-gray-400">R-R Interval:</span><span class="text-white font-mono">{currentRhythm.rrInterval} ms</span></div>
									<div class="flex justify-between"><span class="text-gray-400">Rhythm:</span><span class="text-white">{currentRhythm.regular ? 'Regular' : 'Irregular'}</span></div>
									<div class="flex justify-between"><span class="text-gray-400">P Waves:</span><span class="text-white">{currentRhythm.pWavePresent ? 'Present' : 'Absent'}</span></div>
									<div class="flex justify-between"><span class="text-gray-400">QRS Width:</span><span class="text-white">{currentRhythm.qrsDurationMs} ms ({currentRhythm.qrsWidth})</span></div>
									<div class="flex justify-between"><span class="text-gray-400">PR Interval:</span><span class="text-white font-mono">{currentRhythm.prIntervalMs || 'N/A'} ms</span></div>
								</div>
							</div>
						</div>

						<div class="glass rounded-xl border border-white/5 p-4 mb-4">
							<h4 class="text-sm font-medium text-white mb-1">Clinical Significance</h4>
							<p class="text-xs text-gray-400">{currentRhythm.clinicalSignificance}</p>
						</div>

						<!-- Heart Rate Calculator -->
						{#if simState.step === 'rhythms'}
							<div class="glass rounded-xl border border-pink-500/20 p-4">
								<h4 class="text-sm font-medium text-white mb-2">Calculate Heart Rate</h4>
								<p class="text-xs text-gray-400 mb-3">Use the 300 method: HR = 300 / (number of large boxes between R-R). Enter your calculated HR:</p>
								<div class="flex gap-2">
									<input
										type="number"
										bind:value={hrInput}
										placeholder="Enter HR (bpm)"
										class="flex-1 px-3 py-2 rounded-lg glass border border-white/10 text-sm text-white placeholder-gray-500 focus:border-pink-500/30 focus:outline-none"
									/>
									<button onclick={handleSubmitHR} class="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white hover:shadow-lg transition-all">Submit</button>
								</div>
								{#if simState.heartRateCalculations[currentRhythm.id] !== null && simState.heartRateCalculations[currentRhythm.id] !== undefined}
									{@const studentHR = simState.heartRateCalculations[currentRhythm.id]!}
									{@const diff = Math.abs(studentHR - currentRhythm.heartRate)}
									<div class="mt-2 p-2 rounded-lg {diff <= 10 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}">
										<p class="text-xs {diff <= 10 ? 'text-emerald-400' : 'text-amber-400'}">
											Your answer: {studentHR} bpm. Actual: {currentRhythm.heartRate} bpm.
											{diff <= 10 ? ' Correct!' : ' Try using 300 / large boxes between R waves.'}
										</p>
									</div>
								{/if}
							</div>
						{/if}
					{:else}
						<div class="text-center py-12 text-gray-400">
							<p>Select a rhythm above to view the ECG trace.</p>
						</div>
					{/if}
				</div>

			<!-- COMPONENTS SECTION -->
			{:else if simState.step === 'components'}
				<div class="glass-strong rounded-2xl border border-white/10 p-6">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-1.5 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
						<h3 class="text-xl font-display font-semibold text-white">ECG Wave Components</h3>
					</div>
					<p class="text-sm text-gray-400 mb-6">Click each component to learn about it and mark it as identified.</p>

					<!-- Visual PQRST diagram -->
					<div class="glass rounded-xl border border-cyan-500/20 p-4 mb-6">
						<svg viewBox="0 0 500 200" class="w-full h-40">
							<!-- Baseline -->
							<line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.1)" stroke-width="1" stroke-dasharray="4"/>

							<!-- P wave -->
							<path d="M 60,120 Q 80,80 100,120" fill="none" stroke="#06b6d4" stroke-width="2.5"/>
							<text x="80" y="70" text-anchor="middle" fill="#06b6d4" font-size="12" font-weight="bold">P</text>

							<!-- PR segment -->
							<line x1="100" y1="120" x2="140" y2="120" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="3"/>

							<!-- QRS complex -->
							<path d="M 140,120 L 155,130 L 170,30 L 185,145 L 200,120" fill="none" stroke="#f43f5e" stroke-width="3"/>
							<text x="145" y="145" text-anchor="middle" fill="#f43f5e" font-size="10">Q</text>
							<text x="170" y="20" text-anchor="middle" fill="#f43f5e" font-size="12" font-weight="bold">R</text>
							<text x="195" y="160" text-anchor="middle" fill="#f43f5e" font-size="10">S</text>

							<!-- ST segment -->
							<line x1="200" y1="120" x2="250" y2="118" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="3"/>
							<text x="225" y="108" text-anchor="middle" fill="#a855f7" font-size="10">ST</text>

							<!-- T wave -->
							<path d="M 250,118 Q 290,60 330,120" fill="none" stroke="#22c55e" stroke-width="2.5"/>
							<text x="290" y="50" text-anchor="middle" fill="#22c55e" font-size="12" font-weight="bold">T</text>

							<!-- Interval annotations -->
							<line x1="60" y1="175" x2="140" y2="175" stroke="#f59e0b" stroke-width="1.5"/>
							<text x="100" y="192" text-anchor="middle" fill="#f59e0b" font-size="9">PR Interval</text>

							<line x1="140" y1="185" x2="200" y2="185" stroke="#ef4444" stroke-width="1.5"/>
							<text x="170" y="198" text-anchor="middle" fill="#ef4444" font-size="9">QRS</text>

							<line x1="140" y1="165" x2="330" y2="165" stroke="#8b5cf6" stroke-width="1.5"/>
							<text x="235" y="163" text-anchor="middle" fill="#8b5cf6" font-size="9">QT Interval</text>
						</svg>
					</div>

					<!-- Component cards -->
					<div class="grid sm:grid-cols-2 gap-4">
						{#each WAVE_COMPONENTS as comp}
							{@const identified = simState.componentIdentifications[comp.id]}
							<button
								onclick={() => handleIdentifyComponent(comp.id)}
								class="glass rounded-xl border p-4 text-left transition-all
									{identified ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 hover:border-cyan-500/30'}"
							>
								<div class="flex items-center gap-2 mb-2">
									<div class="w-2 h-2 rounded-full {identified ? 'bg-emerald-500' : 'bg-gray-500'}"></div>
									<h4 class="text-sm font-medium text-white">{comp.name}</h4>
									{#if identified}
										<span class="text-xs text-emerald-400 ml-auto">Identified</span>
									{/if}
								</div>
								<p class="text-xs text-gray-400 mb-2">{comp.description}</p>
								<p class="text-xs text-cyan-400">Normal: {comp.normalDuration}</p>
								{#if identified}
									<p class="text-xs text-amber-400 mt-1">Clinical: {comp.significance}</p>
								{/if}
							</button>
						{/each}
					</div>
				</div>

			<!-- DIAGNOSIS SECTION -->
			{:else if simState.step === 'diagnosis'}
				<div class="glass-strong rounded-2xl border border-white/10 p-6">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-1.5 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
						<h3 class="text-xl font-display font-semibold text-white">Diagnosis Matching</h3>
					</div>
					<p class="text-sm text-gray-400 mb-6">Review the clinical scenario and ECG, then select the most likely diagnosis.</p>

					<div class="space-y-6">
						{#each DIAGNOSIS_SCENARIOS as scenario}
							{@const rhythm = ECG_RHYTHMS.find((r) => r.id === scenario.rhythmId)}
							{@const waveData = rhythm ? generateECGWaveform(rhythm, 200) : []}
							<div class="glass rounded-xl border border-white/5 p-4">
								<p class="text-sm text-white mb-2 font-medium">{scenario.clinicalContext}</p>

								<!-- Mini ECG trace -->
								{#if waveData.length > 0}
									<svg viewBox="0 0 400 80" class="w-full h-16 mb-3">
										<rect x="0" y="0" width="400" height="80" fill="rgba(0,0,0,0.3)" rx="4"/>
										<path
											d={waveformToSvgPath(waveData, 400, 80, 0)}
											fill="none" stroke="#22c55e" stroke-width="1.5"
										/>
									</svg>
								{/if}

								<div class="grid grid-cols-2 gap-2">
									{#each scenario.differentials as diff}
										{@const isSelected = simState.diagnosisAnswers[scenario.id] === diff}
										{@const isAnswered = simState.diagnosisAnswers[scenario.id] !== null}
										{@const isCorrect = diff === scenario.differentials[0]}
										<button
											onclick={() => handleDiagnosis(scenario.id, diff)}
											disabled={isAnswered}
											class="px-3 py-2 rounded-lg text-xs font-medium text-left transition-all
												{isAnswered && isCorrect ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
												 isAnswered && isSelected && !isCorrect ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
												 isSelected ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
												 'glass border border-white/10 text-gray-300 hover:border-amber-500/30'}"
										>{diff}</button>
									{/each}
								</div>
								{#if simState.diagnosisAnswers[scenario.id]}
									<p class="mt-2 text-xs text-gray-400 italic">Correct: {scenario.correctDiagnosis}</p>
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
												 isSelected ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' :
												 'glass border border-white/10 text-gray-300 hover:border-pink-500/30'}"
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
						<div class="w-1.5 h-6 bg-gradient-to-b from-pink-500 to-fuchsia-500 rounded-full"></div>
						<h3 class="text-xl font-display font-semibold text-white">Lab Results</h3>
					</div>

					<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-xs text-gray-400 mb-1">Rhythms Viewed</p>
							<p class="text-2xl font-display font-bold text-white">{analysis.rhythmsViewed}/{analysis.totalRhythms}</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-xs text-gray-400 mb-1">Components</p>
							<p class="text-2xl font-display font-bold text-white">{analysis.componentsIdentified}/{analysis.totalComponents}</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-xs text-gray-400 mb-1">Diagnoses</p>
							<p class="text-2xl font-display font-bold text-white">{analysis.diagnosisCorrect}/{analysis.totalDiagnoses}</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-xs text-gray-400 mb-1">Quiz</p>
							<p class="text-2xl font-display font-bold text-white">{analysis.quizScore}/{analysis.quizTotal}</p>
						</div>
					</div>

					<div class="glass rounded-xl p-4 border border-pink-500/20 mb-6">
						<div class="flex items-center justify-between mb-3">
							<span class="text-sm font-medium text-gray-300">Overall Score</span>
							<span class="text-lg font-display font-bold bg-gradient-to-r from-pink-400 to-fuchsia-400 bg-clip-text text-transparent">{analysis.overallScore}% (Grade: {analysis.grade})</span>
						</div>
						<div class="h-2 bg-white/5 rounded-full overflow-hidden">
							<div class="h-full bg-gradient-to-r from-pink-500 to-fuchsia-500 rounded-full transition-all" style="width: {analysis.overallScore}%"></div>
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
