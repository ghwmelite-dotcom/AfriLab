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
		selectSample,
		applySerum,
		setTypeDetermination,
		interpretCBC,
		markCBCInterpreted,
		toggleTransfusionType,
		answerQuiz,
		setStep,
		analyzeBloodLab,
		BLOOD_SAMPLES,
		SERA_INFO,
		ALL_BLOOD_TYPES,
		TRANSFUSION_COMPATIBILITY,
		QUIZ_QUESTIONS,
		type BloodAnalysisState,
		type BloodType,
		type Serum
	} from '$lib/simulations/medical/blood-analysis';
	import type { Experiment, LabSession } from '$types';

	const experiment: Experiment = {
		id: 'med-blood-analysis-01',
		disciplineId: 'medical',
		title: 'Blood Typing & Analysis',
		description: 'Determine blood types using antigen-antibody reactions and interpret CBC results.',
		difficulty: 'beginner',
		durationMinutes: 35,
		instructions: [
			{ id: 1, title: 'Select Blood Sample', description: 'Choose a blood sample to analyze.', hints: ['Each sample comes from a different patient scenario'] },
			{ id: 2, title: 'Apply Anti-A Serum', description: 'Add anti-A serum and observe for agglutination.', hints: ['Agglutination means A antigens are present'] },
			{ id: 3, title: 'Apply Anti-B Serum', description: 'Add anti-B serum and observe for agglutination.', hints: ['Agglutination means B antigens are present'] },
			{ id: 4, title: 'Apply Anti-Rh Serum', description: 'Add anti-Rh (anti-D) serum and observe for agglutination.', hints: ['Agglutination means Rh(D) antigen is present'] },
			{ id: 5, title: 'Determine Blood Type', description: 'Based on reactions, determine the ABO and Rh type.', hints: ['Combine ABO result with Rh result'] },
			{ id: 6, title: 'Interpret CBC', description: 'Review the complete blood count and identify abnormalities.', hints: ['Compare each value to the normal range'] },
			{ id: 7, title: 'Transfusion Compatibility', description: 'Determine which blood types are compatible for transfusion.', hints: ['Recipients can only receive types they have antibodies tolerance for'] },
			{ id: 8, title: 'Quiz', description: 'Test your knowledge of blood typing and transfusion.', hints: ['Review the ABO/Rh system'] }
		],
		simulationConfig: { type: 'blood-analysis', parameters: {}, equipment: ['Blood typing tray', 'Anti-sera reagents', 'Microscope', 'CBC analyzer'] },
		safetyNotes: 'Always wear gloves when handling blood samples. Dispose of sharps in designated containers. Follow universal precautions.',
		learningObjectives: [
			'Perform ABO and Rh blood typing using antisera',
			'Interpret agglutination reactions correctly',
			'Read and interpret CBC values',
			'Determine transfusion compatibility'
		]
	};

	let simState: BloodAnalysisState = $state(createInitialState());
	let showResults = $state(false);
	let mounted = $state(false);

	let currentSample = $derived(BLOOD_SAMPLES.find((s) => s.id === simState.currentSampleId));
	let currentResults = $derived(
		simState.currentSampleId ? simState.agglutinationResults[simState.currentSampleId] || [] : []
	);
	let allSeraApplied = $derived(currentResults.every((r) => r.applied));
	let interpretedCBC = $derived(currentSample ? interpretCBC(currentSample.cbc) : []);
	let analysis = $derived(analyzeBloodLab(simState));

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

	function handleSelectSample(sampleId: string) {
		simState = selectSample(simState, sampleId);
		labStore.nextStep();
	}

	function handleApplySerum(serum: Serum) {
		simState = applySerum(simState, serum);
		labStore.addAction(`Applied ${serum}`, { sampleId: simState.currentSampleId });
		labStore.nextStep();
	}

	function handleSetType(type: BloodType) {
		if (!simState.currentSampleId) return;
		simState = setTypeDetermination(simState, simState.currentSampleId, type);
		labStore.addAction('Type determined', { type, sampleId: simState.currentSampleId });
	}

	function handleMarkCBC() {
		if (!simState.currentSampleId) return;
		simState = markCBCInterpreted(simState, simState.currentSampleId);
		labStore.addAction('CBC interpreted', { sampleId: simState.currentSampleId });
	}

	function handleToggleTransfusion(type: BloodType) {
		if (!simState.currentSampleId) return;
		simState = toggleTransfusionType(simState, simState.currentSampleId, type);
	}

	function handleAnswerQuiz(qId: string, idx: number) {
		simState = answerQuiz(simState, qId, idx);
	}

	function handleComplete() {
		showResults = true;
		labStore.completeLab();
	}

	function getInterpColor(interp: 'normal' | 'low' | 'high' | null): string {
		if (interp === 'normal') return 'text-emerald-400';
		if (interp === 'low') return 'text-blue-400';
		if (interp === 'high') return 'text-amber-400';
		return 'text-gray-400';
	}
</script>

<svelte:head>
	<title>Blood Typing & Analysis - AfriLab</title>
</svelte:head>

<!-- Ambient background -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-rose-500/10 to-transparent rounded-full blur-3xl"></div>
	<div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-r from-red-500/10 to-transparent rounded-full blur-3xl"></div>
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
				<span class="text-rose-400">Blood Typing</span>
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

	<!-- Safety Banner -->
	<div class="mb-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.1s;">
		<SafetyBanner level="warning" message="Wear gloves when handling blood samples. Dispose of sharps in designated containers. Follow universal precautions." />
	</div>

	<!-- Main Layout -->
	<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
		<!-- Left Sidebar -->
		<div class="lg:col-span-1 space-y-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.15s;">
			<StepGuide steps={experiment.instructions} currentStepIndex={$labStore.currentStepIndex} />
			<div class="glass rounded-2xl p-4 border border-white/5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-1.5 h-5 bg-gradient-to-b from-rose-500 to-red-500 rounded-full"></div>
					<h4 class="text-sm font-display font-semibold text-white">Need Help?</h4>
				</div>
				<p class="text-xs text-gray-400 mb-3">Get hints for blood typing.</p>
				<HintButton experimentId={experiment.id} stepId={$labStore.currentStepIndex + 1} stepTitle={experiment.instructions[$labStore.currentStepIndex]?.title} />
			</div>
			<ControlPanel onComplete={handleComplete} />

			<!-- Step Navigation -->
			<div class="glass rounded-2xl p-4 border border-white/5">
				<h4 class="text-sm font-display font-semibold text-white mb-3">Lab Section</h4>
				<div class="space-y-2">
					{#each [{ key: 'typing', label: 'Blood Typing' }, { key: 'cbc', label: 'CBC Analysis' }, { key: 'transfusion', label: 'Transfusion' }, { key: 'quiz', label: 'Quiz' }] as tab}
						<button
							onclick={() => { simState = setStep(simState, tab.key as BloodAnalysisState['step']); }}
							class="w-full px-3 py-2 rounded-lg text-sm text-left transition-all {simState.step === tab.key ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'glass border border-white/10 text-gray-300 hover:border-rose-500/30'}"
						>{tab.label}</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Center Content -->
		<div class="lg:col-span-3 space-y-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">

			<!-- Sample Selection -->
			{#if !currentSample}
				<div class="glass-strong rounded-2xl border border-white/10 p-6">
					<h3 class="text-xl font-display font-semibold text-white mb-4">Select a Blood Sample</h3>
					<div class="grid sm:grid-cols-2 gap-4">
						{#each BLOOD_SAMPLES as sample}
							<button
								onclick={() => handleSelectSample(sample.id)}
								class="glass rounded-xl border border-white/10 p-4 text-left hover:border-rose-500/30 hover:bg-rose-500/5 transition-all group"
							>
								<div class="flex items-center gap-3 mb-2">
									<div class="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
										<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
									</div>
									<div>
										<h4 class="font-medium text-white group-hover:text-rose-400 transition-colors">{sample.label}</h4>
										<p class="text-xs text-gray-400">{sample.description}</p>
									</div>
								</div>
							</button>
						{/each}
					</div>
				</div>
			{:else}

				<!-- BLOOD TYPING SECTION -->
				{#if simState.step === 'typing'}
					<div class="glass-strong rounded-2xl border border-white/10 p-6">
						<div class="flex items-center gap-3 mb-4">
							<div class="w-1.5 h-6 bg-gradient-to-b from-red-500 to-rose-500 rounded-full"></div>
							<h3 class="text-xl font-display font-semibold text-white">Blood Typing - {currentSample.label}</h3>
						</div>
						<p class="text-sm text-gray-400 mb-6">{currentSample.description}</p>

						<!-- Sera Application -->
						<div class="grid sm:grid-cols-3 gap-4 mb-6">
							{#each (['anti-A', 'anti-B', 'anti-Rh'] as Serum[]) as serum}
								{@const info = SERA_INFO[serum]}
								{@const result = currentResults.find((r) => r.serum === serum)}
								<div class="glass rounded-xl border border-white/10 p-4">
									<div class="flex items-center gap-2 mb-3">
										<div class="w-4 h-4 rounded-full" style="background-color: {info.color}"></div>
										<span class="text-sm font-medium text-white">{serum}</span>
									</div>
									<p class="text-xs text-gray-400 mb-3">{info.description}</p>

									{#if result?.applied}
										<!-- Show result with SVG visualization -->
										<div class="flex items-center justify-center py-4">
											<svg viewBox="0 0 80 80" class="w-20 h-20">
												{#if result.agglutinated}
													<!-- Agglutination: clumped cells -->
													<circle cx="30" cy="30" r="8" fill="#ef4444" opacity="0.9"/>
													<circle cx="38" cy="25" r="7" fill="#dc2626" opacity="0.85"/>
													<circle cx="25" cy="38" r="6" fill="#ef4444" opacity="0.8"/>
													<circle cx="35" cy="35" r="7" fill="#b91c1c" opacity="0.9"/>
													<circle cx="45" cy="45" r="8" fill="#ef4444" opacity="0.85"/>
													<circle cx="50" cy="38" r="6" fill="#dc2626" opacity="0.8"/>
													<circle cx="42" cy="50" r="7" fill="#b91c1c" opacity="0.9"/>
													<circle cx="55" cy="50" r="6" fill="#ef4444" opacity="0.85"/>
													<text x="40" y="72" text-anchor="middle" fill="#f87171" font-size="8" font-weight="bold">AGGLUTINATED</text>
												{:else}
													<!-- No agglutination: dispersed cells -->
													<circle cx="15" cy="20" r="5" fill="#ef4444" opacity="0.7"/>
													<circle cx="40" cy="15" r="5" fill="#ef4444" opacity="0.7"/>
													<circle cx="65" cy="22" r="5" fill="#ef4444" opacity="0.7"/>
													<circle cx="25" cy="45" r="5" fill="#ef4444" opacity="0.7"/>
													<circle cx="55" cy="40" r="5" fill="#ef4444" opacity="0.7"/>
													<circle cx="35" cy="60" r="5" fill="#ef4444" opacity="0.7"/>
													<circle cx="60" cy="58" r="5" fill="#ef4444" opacity="0.7"/>
													<circle cx="18" cy="62" r="5" fill="#ef4444" opacity="0.7"/>
													<text x="40" y="77" text-anchor="middle" fill="#6b7280" font-size="8">NO REACTION</text>
												{/if}
											</svg>
										</div>
										<p class="text-center text-sm font-medium {result.agglutinated ? 'text-rose-400' : 'text-gray-400'}">
											{result.agglutinated ? 'Positive (Agglutination)' : 'Negative (No reaction)'}
										</p>
									{:else}
										<button
											onclick={() => handleApplySerum(serum)}
											class="w-full py-2 px-4 rounded-lg text-sm font-medium bg-gradient-to-r from-rose-500 to-red-500 text-white hover:shadow-lg hover:shadow-rose-500/25 transition-all"
										>
											Add {serum}
										</button>
									{/if}
								</div>
							{/each}
						</div>

						<!-- Blood Type Determination -->
						{#if allSeraApplied}
							<div class="glass rounded-xl border border-rose-500/20 p-4">
								<h4 class="text-sm font-medium text-white mb-3">Determine Blood Type</h4>
								<p class="text-xs text-gray-400 mb-3">Based on the agglutination results, select the blood type:</p>
								<div class="flex flex-wrap gap-2">
									{#each ALL_BLOOD_TYPES as type}
										{@const isSelected = simState.studentTypeDetermination[currentSample.id] === type}
										<button
											onclick={() => handleSetType(type)}
											class="px-4 py-2 rounded-lg text-sm font-medium transition-all {isSelected ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'glass border border-white/10 text-gray-300 hover:border-rose-500/30'}"
										>{type}</button>
									{/each}
								</div>
								{#if simState.studentTypeDetermination[currentSample.id]}
									{@const isCorrect = simState.studentTypeDetermination[currentSample.id] === currentSample.trueType}
									<div class="mt-3 p-3 rounded-lg {isCorrect ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}">
										<p class="text-sm {isCorrect ? 'text-emerald-400' : 'text-amber-400'}">
											{isCorrect ? 'Correct!' : `Incorrect. The correct type is ${currentSample.trueType}. Review the agglutination pattern.`}
										</p>
									</div>
								{/if}
							</div>
						{/if}

						<!-- Switch sample -->
						<div class="mt-4 flex gap-2 flex-wrap">
							{#each BLOOD_SAMPLES as sample}
								<button
									onclick={() => handleSelectSample(sample.id)}
									class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all {simState.currentSampleId === sample.id ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'glass border border-white/10 text-gray-400 hover:border-rose-500/30'}"
								>{sample.label}</button>
							{/each}
						</div>
					</div>

				<!-- CBC SECTION -->
				{:else if simState.step === 'cbc'}
					<div class="glass-strong rounded-2xl border border-white/10 p-6">
						<div class="flex items-center gap-3 mb-4">
							<div class="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
							<h3 class="text-xl font-display font-semibold text-white">CBC Analysis - {currentSample.label}</h3>
						</div>
						<p class="text-sm text-gray-400 mb-6">{currentSample.description}</p>

						<div class="overflow-x-auto">
							<table class="w-full text-sm">
								<thead>
									<tr class="border-b border-white/10">
										<th class="text-left py-2 px-3 text-gray-400 font-medium">Parameter</th>
										<th class="text-center py-2 px-3 text-gray-400 font-medium">Value</th>
										<th class="text-center py-2 px-3 text-gray-400 font-medium">Unit</th>
										<th class="text-center py-2 px-3 text-gray-400 font-medium">Normal Range</th>
										<th class="text-center py-2 px-3 text-gray-400 font-medium">Status</th>
									</tr>
								</thead>
								<tbody>
									{#each interpretedCBC as val}
										<tr class="border-b border-white/5">
											<td class="py-2 px-3 text-white font-medium">{val.name}</td>
											<td class="py-2 px-3 text-center {getInterpColor(val.interpretation)} font-mono">{val.value}</td>
											<td class="py-2 px-3 text-center text-gray-400">{val.unit}</td>
											<td class="py-2 px-3 text-center text-gray-400">{val.normalMin} - {val.normalMax}</td>
											<td class="py-2 px-3 text-center">
												{#if val.interpretation === 'normal'}
													<span class="text-emerald-400 text-xs font-medium">Normal</span>
												{:else if val.interpretation === 'low'}
													<span class="text-blue-400 text-xs font-medium">Low</span>
												{:else if val.interpretation === 'high'}
													<span class="text-amber-400 text-xs font-medium">High</span>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>

						{#if !simState.cbcInterpreted[currentSample.id]}
							<button
								onclick={handleMarkCBC}
								class="mt-4 px-6 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg transition-all"
							>Mark CBC as Reviewed</button>
						{:else}
							<p class="mt-4 text-sm text-emerald-400">CBC reviewed and interpreted.</p>
						{/if}

						<!-- Sample switcher -->
						<div class="mt-4 flex gap-2 flex-wrap">
							{#each BLOOD_SAMPLES as sample}
								<button
									onclick={() => handleSelectSample(sample.id)}
									class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all {simState.currentSampleId === sample.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'glass border border-white/10 text-gray-400 hover:border-blue-500/30'}"
								>{sample.label}</button>
							{/each}
						</div>
					</div>

				<!-- TRANSFUSION SECTION -->
				{:else if simState.step === 'transfusion'}
					<div class="glass-strong rounded-2xl border border-white/10 p-6">
						<div class="flex items-center gap-3 mb-4">
							<div class="w-1.5 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
							<h3 class="text-xl font-display font-semibold text-white">Transfusion Compatibility - {currentSample.label}</h3>
						</div>
						<p class="text-sm text-gray-400 mb-2">
							This sample is type <span class="font-bold text-rose-400">{currentSample.trueType}</span>.
							Select all blood types that can be safely transfused to this patient:
						</p>

						<div class="grid grid-cols-4 gap-3 mt-4">
							{#each ALL_BLOOD_TYPES as type}
								{@const isSelected = (simState.transfusionAnswers[currentSample.id] || []).includes(type)}
								<button
									onclick={() => handleToggleTransfusion(type)}
									class="py-3 px-4 rounded-xl text-sm font-bold transition-all {isSelected ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10' : 'glass border border-white/10 text-gray-300 hover:border-amber-500/30'}"
								>{type}</button>
							{/each}
						</div>

						<!-- Show correct answers -->
						{#if true}
						{@const studentAnswers = simState.transfusionAnswers[currentSample.id] || []}
						{#if studentAnswers.length > 0}
							{@const correctAnswers = TRANSFUSION_COMPATIBILITY[currentSample.trueType]}
							<div class="mt-4 glass rounded-xl border border-white/5 p-4">
								<h4 class="text-sm font-medium text-gray-300 mb-2">Your selections vs Correct answers:</h4>
								<div class="flex flex-wrap gap-2">
									{#each ALL_BLOOD_TYPES as type}
										{@const isCorrect = correctAnswers.includes(type)}
										{@const isChosen = studentAnswers.includes(type)}
										{#if isChosen || isCorrect}
											<span class="px-3 py-1 rounded-full text-xs font-medium
												{isChosen && isCorrect ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
												 isChosen && !isCorrect ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
												 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}">
												{type} {isChosen && isCorrect ? ' ✓' : isChosen && !isCorrect ? ' ✗' : ' (missed)'}
											</span>
										{/if}
									{/each}
								</div>
							</div>
						{/if}
						{/if}

						<div class="mt-4 flex gap-2 flex-wrap">
							{#each BLOOD_SAMPLES as sample}
								<button
									onclick={() => handleSelectSample(sample.id)}
									class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all {simState.currentSampleId === sample.id ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'glass border border-white/10 text-gray-400 hover:border-amber-500/30'}"
								>{sample.label}</button>
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
													 isSelected ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
													 'glass border border-white/10 text-gray-300 hover:border-rose-500/30'}"
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

				<!-- Results Panel -->
				{#if showResults}
					<div class="glass-strong rounded-2xl p-6 border border-white/10 animate-fade-in-up">
						<div class="flex items-center gap-3 mb-6">
							<div class="w-1.5 h-6 bg-gradient-to-b from-rose-500 to-red-500 rounded-full"></div>
							<h3 class="text-xl font-display font-semibold text-white">Lab Results</h3>
						</div>

						<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
							<div class="glass rounded-xl p-4 border border-white/5">
								<p class="text-xs text-gray-400 mb-1">Types Correct</p>
								<p class="text-2xl font-display font-bold text-white">{analysis.correctTypes}/{analysis.totalSamples}</p>
							</div>
							<div class="glass rounded-xl p-4 border border-white/5">
								<p class="text-xs text-gray-400 mb-1">Sera Applied</p>
								<p class="text-2xl font-display font-bold text-white">{analysis.seraApplied}/{analysis.totalSera}</p>
							</div>
							<div class="glass rounded-xl p-4 border border-white/5">
								<p class="text-xs text-gray-400 mb-1">CBC Reviewed</p>
								<p class="text-2xl font-display font-bold text-white">{analysis.cbcInterpreted}/{analysis.totalSamples}</p>
							</div>
							<div class="glass rounded-xl p-4 border border-white/5">
								<p class="text-xs text-gray-400 mb-1">Quiz Score</p>
								<p class="text-2xl font-display font-bold text-white">{analysis.quizScore}/{analysis.quizTotal}</p>
							</div>
						</div>

						<div class="glass rounded-xl p-4 border border-rose-500/20 mb-6">
							<div class="flex items-center justify-between mb-3">
								<span class="text-sm font-medium text-gray-300">Overall Score</span>
								<span class="text-lg font-display font-bold bg-gradient-to-r from-rose-400 to-red-400 bg-clip-text text-transparent">{analysis.overallScore}% (Grade: {analysis.grade})</span>
							</div>
							<div class="h-2 bg-white/5 rounded-full overflow-hidden">
								<div class="h-full bg-gradient-to-r from-rose-500 to-red-500 rounded-full transition-all" style="width: {analysis.overallScore}%"></div>
							</div>
						</div>

						<p class="text-gray-400 mb-6">{analysis.feedback}</p>

						<div class="flex gap-3">
							<button
								onclick={() => { simState = createInitialState(); showResults = false; labStore.reset(); }}
								class="btn-secondary flex-1"
							>Try Again</button>
							<a href="/labs/medical" class="btn-primary flex-1 text-center">Back to Medical Labs</a>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>

<CollaborationPanel />
