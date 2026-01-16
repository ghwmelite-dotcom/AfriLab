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
		selectPatient,
		measureVital,
		recordEcg,
		addNote,
		assignPriority,
		completeAssessment,
		analyzeVitalSigns,
		generateEcgData,
		getMeasurementCount,
		getAbnormalCount,
		PATIENT_SCENARIOS,
		VITAL_RANGES,
		type VitalSignsState
	} from '$lib/simulations/medical/vital-signs';
	import type { Experiment, LabSession } from '$types';

	const experiment: Experiment = {
		id: 'med-vital-signs-01',
		disciplineId: 'medical',
		title: 'Vital Signs Assessment',
		description: 'Learn to assess and interpret patient vital signs.',
		difficulty: 'beginner',
		durationMinutes: 30,
		instructions: [
			{
				id: 1,
				title: 'Review Patient Information',
				description: 'Read the patient presentation and history before beginning assessment.',
				hints: ['Note the chief complaint', 'Consider the patient demographics']
			},
			{
				id: 2,
				title: 'Measure Blood Pressure',
				description: 'Use the sphygmomanometer to measure systolic and diastolic blood pressure.',
				hints: ['Normal range: 90-120/60-80 mmHg', 'Elevated BP may indicate hypertension']
			},
			{
				id: 3,
				title: 'Check Heart Rate',
				description: 'Measure the pulse rate at the radial artery.',
				hints: ['Count beats for 30 seconds and multiply by 2', 'Normal range: 60-100 bpm']
			},
			{
				id: 4,
				title: 'Measure Respiratory Rate',
				description: 'Count respirations while appearing to check the pulse.',
				hints: ['Count for 30 seconds', 'Normal range: 12-20 breaths/min']
			},
			{
				id: 5,
				title: 'Check Oxygen Saturation',
				description: 'Apply pulse oximeter to measure SpO2.',
				hints: ['Normal range: 95-100%', 'Below 94% may indicate hypoxemia']
			},
			{
				id: 6,
				title: 'Measure Temperature',
				description: 'Take oral temperature using a thermometer.',
				hints: ['Normal range: 36.1-37.2°C', 'Fever is typically above 38°C']
			},
			{
				id: 7,
				title: 'Record ECG (if indicated)',
				description: 'Perform a brief ECG to assess cardiac rhythm.',
				hints: ['Look for regular rhythm', 'Note any abnormalities']
			},
			{
				id: 8,
				title: 'Document and Assess',
				description: 'Record findings and assign treatment priority based on vital signs.',
				hints: ['Consider all abnormal values together', 'Prioritize urgent conditions']
			}
		],
		simulationConfig: { type: 'vital-signs', parameters: {} },
		safetyNotes: 'Always wash hands before and after patient contact. Explain each procedure to the patient.',
		learningObjectives: [
			'Accurately measure vital signs',
			'Interpret vital sign values',
			'Identify abnormal findings',
			'Assign appropriate treatment priority'
		]
	};

	// Simulation state
	let vitalState: VitalSignsState = $state(createInitialState({ patientId: '', includeEcg: true }));
	let showResults = $state(false);
	let mounted = $state(false);
	let selectedPatientId = $state<string | null>(null);
	let ecgData = $state<number[]>([]);
	let isRecordingEcg = $state(false);
	let ecgProgress = $state(0);
	let noteInput = $state('');

	// Current patient
	let currentPatient = $derived(
		PATIENT_SCENARIOS.find((p) => p.id === vitalState.currentPatientId)
	);

	// Initialize lab session
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
			studentLevel: 'beginner',
			recentMeasurements: []
		});
	});

	function handleSelectPatient(patientId: string) {
		selectedPatientId = patientId;
		vitalState = selectPatient(vitalState, patientId);
		labStore.nextStep();
	}

	function handleMeasureVital(vital: keyof VitalSignsState['measurements']) {
		vitalState = measureVital(vitalState, vital);
		labStore.addMeasurement({
			type: vital,
			value: vitalState.measurements[vital].value!,
			unit: VITAL_RANGES[vital as keyof typeof VITAL_RANGES]?.unit || '',
			label: vitalState.measurements[vital].vital
		});
	}

	function startEcgRecording() {
		if (!currentPatient) return;
		isRecordingEcg = true;
		ecgProgress = 0;

		const interval = setInterval(() => {
			ecgProgress += 10;
			ecgData = generateEcgData(currentPatient!.ecgPattern, 100);

			if (ecgProgress >= 100) {
				clearInterval(interval);
				isRecordingEcg = false;
				vitalState = recordEcg(vitalState, 10);
				labStore.addAction('ECG Recorded', { pattern: currentPatient!.ecgPattern });
			}
		}, 500);
	}

	function handleAddNote() {
		if (noteInput.trim()) {
			vitalState = addNote(vitalState, noteInput.trim());
			noteInput = '';
		}
	}

	function handleAssignPriority(priority: 'routine' | 'urgent' | 'emergent') {
		vitalState = assignPriority(vitalState, priority);
	}

	function handleComplete() {
		vitalState = completeAssessment(vitalState);
		showResults = true;
		labStore.completeLab();
	}

	let analysis = $derived(analyzeVitalSigns(vitalState));
	let measurementCount = $derived(getMeasurementCount(vitalState));
	let abnormalCount = $derived(getAbnormalCount(vitalState));

	function getInterpretationColor(interpretation: 'normal' | 'low' | 'high' | null): string {
		if (interpretation === 'normal') return 'text-emerald-400';
		if (interpretation === 'low' || interpretation === 'high') return 'text-amber-400';
		return 'text-gray-400';
	}

	function getInterpretationBg(interpretation: 'normal' | 'low' | 'high' | null): string {
		if (interpretation === 'normal') return 'bg-emerald-500/20 border-emerald-500/30';
		if (interpretation === 'low' || interpretation === 'high') return 'bg-amber-500/20 border-amber-500/30';
		return 'bg-white/5 border-white/10';
	}
</script>

<svelte:head>
	<title>Vital Signs Assessment - AfriLab</title>
</svelte:head>

<!-- Ambient background -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div
		class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-rose-500/10 to-transparent rounded-full blur-3xl"
	></div>
	<div
		class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-r from-red-500/10 to-transparent rounded-full blur-3xl"
	></div>
</div>

<div class="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
	<!-- Header -->
	<div
		class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 {mounted
			? 'animate-fade-in-up'
			: 'opacity-0'}"
	>
		<div>
			<div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
				<a href="/dashboard" class="hover:text-rose-400 transition-colors">Dashboard</a>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
				<a href="/labs/medical" class="hover:text-rose-400 transition-colors">Medical</a>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
				<span class="text-rose-400">Vital Signs</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-display font-bold text-white">{experiment.title}</h1>
		</div>

		<div class="flex items-center gap-3">
			<CollaborationButton labId={experiment.id} labName={experiment.title} />
			<button onclick={() => aiStore.open()} class="btn-primary">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
					/>
				</svg>
				Ask AI Assistant
			</button>
		</div>
	</div>

	<!-- Safety Banner -->
	<div class="mb-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.1s;">
		<SafetyBanner
			level="info"
			message="Remember to wash hands before and after patient contact. Explain each procedure to the patient."
		/>
	</div>

	<!-- Patient Selection -->
	{#if !currentPatient}
		<div
			class="glass-strong rounded-2xl border border-white/10 p-6 mb-6 {mounted
				? 'animate-fade-in-up'
				: 'opacity-0'}"
			style="animation-delay: 0.15s;"
		>
			<h3 class="text-xl font-display font-semibold text-white mb-4">Select a Patient</h3>
			<div class="grid sm:grid-cols-2 gap-4">
				{#each PATIENT_SCENARIOS as patient}
					<button
						onclick={() => handleSelectPatient(patient.id)}
						class="glass rounded-xl border border-white/10 p-4 text-left hover:border-rose-500/30 hover:bg-rose-500/5 transition-all group"
					>
						<div class="flex items-center gap-3 mb-2">
							<div
								class="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white font-bold"
							>
								{patient.name.charAt(0)}
							</div>
							<div>
								<h4 class="font-medium text-white group-hover:text-rose-400 transition-colors">
									{patient.name}
								</h4>
								<p class="text-xs text-gray-400">{patient.age} years, {patient.gender}</p>
							</div>
						</div>
						<p class="text-sm text-gray-300">{patient.description}</p>
					</button>
				{/each}
			</div>
		</div>
	{:else}
		<!-- Main Layout -->
		<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
			<!-- Left Sidebar: Steps & Controls -->
			<div
				class="lg:col-span-1 space-y-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}"
				style="animation-delay: 0.15s;"
			>
				<StepGuide steps={experiment.instructions} currentStepIndex={$labStore.currentStepIndex} />

				<div class="glass rounded-2xl p-4 border border-white/5">
					<div class="flex items-center gap-3 mb-3">
						<div class="w-1.5 h-5 bg-gradient-to-b from-rose-500 to-red-500 rounded-full"></div>
						<h4 class="text-sm font-display font-semibold text-white">Need Help?</h4>
					</div>
					<p class="text-xs text-gray-400 mb-3">Get hints for clinical assessment.</p>
					<HintButton
						experimentId={experiment.id}
						stepId={$labStore.currentStepIndex + 1}
						stepTitle={experiment.instructions[$labStore.currentStepIndex]?.title}
					/>
				</div>

				<ControlPanel onComplete={handleComplete} />
			</div>

			<!-- Center: Patient Info & Vitals -->
			<div
				class="lg:col-span-2 space-y-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}"
				style="animation-delay: 0.2s;"
			>
				<!-- Patient Card -->
				<div class="glass-strong rounded-2xl border border-white/10 p-6">
					<div class="flex items-start gap-4 mb-4">
						<div
							class="w-16 h-16 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-2xl font-bold text-white"
						>
							{currentPatient.name.charAt(0)}
						</div>
						<div class="flex-1">
							<h3 class="text-xl font-display font-semibold text-white">{currentPatient.name}</h3>
							<p class="text-sm text-gray-400">
								{currentPatient.age} years old, {currentPatient.gender}
							</p>
							<p class="text-sm text-rose-400 mt-1">{currentPatient.description}</p>
						</div>
					</div>
					<div class="glass rounded-xl p-4 border border-white/5">
						<h4 class="text-sm font-medium text-gray-300 mb-2">Presentation</h4>
						<p class="text-sm text-gray-400">{currentPatient.presentation}</p>
					</div>
				</div>

				<!-- Vital Signs Grid -->
				<LabCanvas className="min-h-[400px]">
					<div class="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
						<!-- Blood Pressure -->
						<button
							onclick={() => {
								handleMeasureVital('systolicBP');
								handleMeasureVital('diastolicBP');
							}}
							disabled={vitalState.measurements.systolicBP.measured}
							class="glass rounded-xl p-4 border {vitalState.measurements.systolicBP.measured
								? getInterpretationBg(vitalState.measurements.systolicBP.interpretation)
								: 'border-white/10 hover:border-rose-500/30'} transition-all text-left"
						>
							<div class="flex items-center gap-2 mb-2">
								<svg class="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
									/>
								</svg>
								<span class="text-sm font-medium text-white">Blood Pressure</span>
							</div>
							{#if vitalState.measurements.systolicBP.measured}
								<p class="text-2xl font-bold {getInterpretationColor(vitalState.measurements.systolicBP.interpretation)}">
									{vitalState.measurements.systolicBP.value}/{vitalState.measurements.diastolicBP.value}
									<span class="text-sm font-normal text-gray-400">mmHg</span>
								</p>
							{:else}
								<p class="text-sm text-gray-400">Click to measure</p>
							{/if}
						</button>

						<!-- Heart Rate -->
						<button
							onclick={() => handleMeasureVital('heartRate')}
							disabled={vitalState.measurements.heartRate.measured}
							class="glass rounded-xl p-4 border {vitalState.measurements.heartRate.measured
								? getInterpretationBg(vitalState.measurements.heartRate.interpretation)
								: 'border-white/10 hover:border-rose-500/30'} transition-all text-left"
						>
							<div class="flex items-center gap-2 mb-2">
								<svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
								<span class="text-sm font-medium text-white">Heart Rate</span>
							</div>
							{#if vitalState.measurements.heartRate.measured}
								<p class="text-2xl font-bold {getInterpretationColor(vitalState.measurements.heartRate.interpretation)}">
									{vitalState.measurements.heartRate.value}
									<span class="text-sm font-normal text-gray-400">bpm</span>
								</p>
							{:else}
								<p class="text-sm text-gray-400">Click to measure</p>
							{/if}
						</button>

						<!-- Respiratory Rate -->
						<button
							onclick={() => handleMeasureVital('respiratoryRate')}
							disabled={vitalState.measurements.respiratoryRate.measured}
							class="glass rounded-xl p-4 border {vitalState.measurements.respiratoryRate.measured
								? getInterpretationBg(vitalState.measurements.respiratoryRate.interpretation)
								: 'border-white/10 hover:border-rose-500/30'} transition-all text-left"
						>
							<div class="flex items-center gap-2 mb-2">
								<svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/>
								</svg>
								<span class="text-sm font-medium text-white">Resp. Rate</span>
							</div>
							{#if vitalState.measurements.respiratoryRate.measured}
								<p class="text-2xl font-bold {getInterpretationColor(vitalState.measurements.respiratoryRate.interpretation)}">
									{vitalState.measurements.respiratoryRate.value}
									<span class="text-sm font-normal text-gray-400">/min</span>
								</p>
							{:else}
								<p class="text-sm text-gray-400">Click to measure</p>
							{/if}
						</button>

						<!-- SpO2 -->
						<button
							onclick={() => handleMeasureVital('oxygenSaturation')}
							disabled={vitalState.measurements.oxygenSaturation.measured}
							class="glass rounded-xl p-4 border {vitalState.measurements.oxygenSaturation.measured
								? getInterpretationBg(vitalState.measurements.oxygenSaturation.interpretation)
								: 'border-white/10 hover:border-rose-500/30'} transition-all text-left"
						>
							<div class="flex items-center gap-2 mb-2">
								<svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
									/>
								</svg>
								<span class="text-sm font-medium text-white">SpO2</span>
							</div>
							{#if vitalState.measurements.oxygenSaturation.measured}
								<p class="text-2xl font-bold {getInterpretationColor(vitalState.measurements.oxygenSaturation.interpretation)}">
									{vitalState.measurements.oxygenSaturation.value}
									<span class="text-sm font-normal text-gray-400">%</span>
								</p>
							{:else}
								<p class="text-sm text-gray-400">Click to measure</p>
							{/if}
						</button>

						<!-- Temperature -->
						<button
							onclick={() => handleMeasureVital('temperature')}
							disabled={vitalState.measurements.temperature.measured}
							class="glass rounded-xl p-4 border {vitalState.measurements.temperature.measured
								? getInterpretationBg(vitalState.measurements.temperature.interpretation)
								: 'border-white/10 hover:border-rose-500/30'} transition-all text-left"
						>
							<div class="flex items-center gap-2 mb-2">
								<svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
									/>
								</svg>
								<span class="text-sm font-medium text-white">Temperature</span>
							</div>
							{#if vitalState.measurements.temperature.measured}
								<p class="text-2xl font-bold {getInterpretationColor(vitalState.measurements.temperature.interpretation)}">
									{vitalState.measurements.temperature.value}
									<span class="text-sm font-normal text-gray-400">°C</span>
								</p>
							{:else}
								<p class="text-sm text-gray-400">Click to measure</p>
							{/if}
						</button>

						<!-- ECG -->
						<button
							onclick={startEcgRecording}
							disabled={vitalState.ecgRecorded || isRecordingEcg}
							class="glass rounded-xl p-4 border {vitalState.ecgRecorded
								? 'bg-emerald-500/20 border-emerald-500/30'
								: 'border-white/10 hover:border-rose-500/30'} transition-all text-left"
						>
							<div class="flex items-center gap-2 mb-2">
								<svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/>
								</svg>
								<span class="text-sm font-medium text-white">ECG</span>
							</div>
							{#if isRecordingEcg}
								<div class="h-2 bg-white/10 rounded-full overflow-hidden">
									<div
										class="h-full bg-gradient-to-r from-rose-500 to-red-500 transition-all"
										style="width: {ecgProgress}%"
									></div>
								</div>
							{:else if vitalState.ecgRecorded}
								<p class="text-sm text-emerald-400">Recorded</p>
							{:else}
								<p class="text-sm text-gray-400">Click to record</p>
							{/if}
						</button>
					</div>

					<!-- ECG Display -->
					{#if vitalState.ecgRecorded && ecgData.length > 0}
						<div class="mx-6 mb-6 glass rounded-xl p-4 border border-emerald-500/20">
							<h4 class="text-sm font-medium text-white mb-3">ECG Recording</h4>
							<svg viewBox="0 0 200 50" class="w-full h-16">
								<polyline
									points={ecgData.map((v, i) => `${(i / ecgData.length) * 200},${25 - v * 20}`).join(' ')}
									fill="none"
									stroke="rgb(52, 211, 153)"
									stroke-width="1"
								/>
							</svg>
						</div>
					{/if}
				</LabCanvas>

				<!-- Results Panel -->
				{#if showResults}
					<div class="glass-strong rounded-2xl p-6 border border-white/10 animate-fade-in-up">
						<div class="flex items-center gap-3 mb-6">
							<div class="w-1.5 h-6 bg-gradient-to-b from-rose-500 to-red-500 rounded-full"></div>
							<h3 class="text-xl font-display font-semibold text-white">Assessment Results</h3>
						</div>

						<div class="grid grid-cols-2 gap-4 mb-6">
							<div class="glass rounded-xl p-4 border border-white/5">
								<p class="text-sm text-gray-400 mb-1">Vitals Measured</p>
								<p class="text-2xl font-display font-bold text-white">
									{analysis.measuredCount}/{analysis.totalVitals}
								</p>
							</div>
							<div class="glass rounded-xl p-4 border border-white/5">
								<p class="text-sm text-gray-400 mb-1">Abnormal Findings</p>
								<p class="text-2xl font-display font-bold {analysis.abnormalCount > 0 ? 'text-amber-400' : 'text-emerald-400'}">
									{analysis.abnormalCount}
								</p>
							</div>
						</div>

						<div class="glass rounded-xl p-4 border {analysis.priorityCorrect ? 'border-emerald-500/30' : 'border-amber-500/30'} mb-6">
							<div class="flex items-center justify-between mb-3">
								<span class="text-sm font-medium text-gray-300">Priority Assessment</span>
								{#if analysis.priorityCorrect}
									<span class="text-emerald-400">Correct</span>
								{:else}
									<span class="text-amber-400">Incorrect</span>
								{/if}
							</div>
							<p class="text-sm text-gray-400">Correct priority: <span class="capitalize text-white">{analysis.correctPriority}</span></p>
						</div>

						<div class="glass rounded-xl p-4 border border-rose-500/20 mb-6">
							<div class="flex items-center justify-between mb-3">
								<span class="text-sm font-medium text-gray-300">Score</span>
								<span class="text-lg font-display font-bold bg-gradient-to-r from-rose-400 to-red-400 bg-clip-text text-transparent">
									{analysis.accuracy.toFixed(0)}%
								</span>
							</div>
							<div class="h-2 bg-white/5 rounded-full overflow-hidden">
								<div
									class="h-full bg-gradient-to-r from-rose-500 to-red-500 transition-all rounded-full"
									style="width: {analysis.accuracy}%"
								></div>
							</div>
						</div>

						<p class="text-gray-400 mb-6">{analysis.feedback}</p>

						<div class="flex gap-3">
							<button
								onclick={() => {
									vitalState = createInitialState({ patientId: '', includeEcg: true });
									showResults = false;
									selectedPatientId = null;
									ecgData = [];
									labStore.reset();
								}}
								class="btn-secondary flex-1"
							>
								Try Another Patient
							</button>
							<a href="/dashboard" class="btn-primary flex-1 text-center"> Back to Dashboard </a>
						</div>
					</div>
				{/if}
			</div>

			<!-- Right Sidebar -->
			<div
				class="lg:col-span-1 space-y-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}"
				style="animation-delay: 0.25s;"
			>
				<!-- Quick Stats -->
				<div class="glass rounded-2xl p-5 border border-white/5">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-1.5 h-5 bg-gradient-to-b from-rose-500 to-red-500 rounded-full"></div>
						<h4 class="text-sm font-display font-semibold text-white">Assessment Status</h4>
					</div>
					<div class="space-y-3 text-sm">
						<div class="flex justify-between items-center">
							<span class="text-gray-400">Vitals measured</span>
							<span class="font-medium text-white">{measurementCount}/6</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-gray-400">Abnormal values</span>
							<span class="font-medium {abnormalCount > 0 ? 'text-amber-400' : 'text-emerald-400'}">{abnormalCount}</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-gray-400">ECG recorded</span>
							<span class="font-medium {vitalState.ecgRecorded ? 'text-emerald-400' : 'text-gray-400'}">
								{vitalState.ecgRecorded ? 'Yes' : 'No'}
							</span>
						</div>
					</div>
				</div>

				<!-- Priority Assignment -->
				<div class="glass rounded-2xl p-5 border border-white/5">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-1.5 h-5 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
						<h4 class="text-sm font-display font-semibold text-white">Assign Priority</h4>
					</div>
					<div class="space-y-2">
						<button
							onclick={() => handleAssignPriority('routine')}
							class="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all {vitalState.priorityAssigned === 'routine'
								? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
								: 'glass border border-white/10 text-gray-300 hover:border-emerald-500/30'}"
						>
							Routine
						</button>
						<button
							onclick={() => handleAssignPriority('urgent')}
							class="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all {vitalState.priorityAssigned === 'urgent'
								? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
								: 'glass border border-white/10 text-gray-300 hover:border-amber-500/30'}"
						>
							Urgent
						</button>
						<button
							onclick={() => handleAssignPriority('emergent')}
							class="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all {vitalState.priorityAssigned === 'emergent'
								? 'bg-red-500/20 text-red-400 border border-red-500/30'
								: 'glass border border-white/10 text-gray-300 hover:border-red-500/30'}"
						>
							Emergent
						</button>
					</div>
				</div>

				<!-- Notes -->
				<div class="glass rounded-2xl p-5 border border-white/5">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-1.5 h-5 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
						<h4 class="text-sm font-display font-semibold text-white">Clinical Notes</h4>
					</div>
					<div class="flex gap-2 mb-3">
						<input
							type="text"
							bind:value={noteInput}
							placeholder="Add observation..."
							class="flex-1 px-3 py-2 rounded-lg glass border border-white/10 text-sm text-white placeholder-gray-500 focus:border-rose-500/30 focus:outline-none"
							onkeydown={(e) => e.key === 'Enter' && handleAddNote()}
						/>
						<button onclick={handleAddNote} class="px-3 py-2 rounded-lg glass border border-white/10 hover:border-rose-500/30 transition-colors" aria-label="Add note">
							<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
							</svg>
						</button>
					</div>
					{#if vitalState.studentNotes.length > 0}
						<div class="space-y-2 max-h-32 overflow-y-auto">
							{#each vitalState.studentNotes as note}
								<p class="text-xs text-gray-400 glass rounded-lg px-3 py-2 border border-white/5">{note}</p>
							{/each}
						</div>
					{:else}
						<p class="text-xs text-gray-500">No notes added yet.</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Collaboration Panel -->
<CollaborationPanel />
