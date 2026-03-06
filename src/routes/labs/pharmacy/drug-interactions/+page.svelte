<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { labStore } from '$stores/lab';
	import { aiStore } from '$stores/ai';
	import SafetyBanner from '$components/lab/SafetyBanner.svelte';
	import HintButton from '$components/ai/HintButton.svelte';
	import ChatAssistant from '$components/ai/ChatAssistant.svelte';
	import {
		createInitialState,
		addMedication,
		removeMedication,
		identifyInteraction,
		submitAssessment,
		answerQuiz,
		selectPatient,
		analyzeDrugInteractions,
		PATIENTS,
		MEDICATION_DATABASE,
		MECHANISM_LABELS,
		SEVERITY_COLORS,
		INTERACTION_QUIZ,
		type DrugInteractionState,
		type InteractionMechanism
	} from '$lib/simulations/pharmacy/drug-interactions';

	// Lab state
	let state = $state<DrugInteractionState>(createInitialState({ patientId: 'patient-1' }));
	let isLabStarted = $state(false);
	let showResults = $state(false);

	// UI state
	let showMedSelector = $state(false);
	let selectedInteractionId = $state<string | null>(null);
	let assessSeverity = $state('');
	let assessMechanism = $state('');
	let assessRecommendation = $state('');

	// Derived
	let analysis = $derived(analyzeDrugInteractions(state));
	let availableMeds = $derived(
		MEDICATION_DATABASE.filter((m) => !state.currentMedications.some((cm) => cm.id === m.id))
	);
	let selectedInteraction = $derived(
		state.detectedInteractions.find((d) => d.id === selectedInteractionId)
	);

	function startLab() {
		isLabStarted = true;
		aiStore.setContext({
			labType: 'drug-interactions',
			discipline: 'pharmacy',
			currentStep: 'medication-review',
			objectives: [
				'Identify drug-drug interactions in a polypharmacy patient',
				'Classify interactions by mechanism and severity',
				'Recommend clinical management strategies',
				'Understand CYP450 enzyme interactions'
			]
		});
	}

	function handleAddMed(medId: string) {
		state = addMedication(state, medId);
		showMedSelector = false;
		labStore.addAction('add-medication', { medId });
	}

	function handleRemoveMed(medId: string) {
		state = removeMedication(state, medId);
		labStore.addAction('remove-medication', { medId });
	}

	function handleIdentify(interactionId: string) {
		state = identifyInteraction(state, interactionId);
		selectedInteractionId = interactionId;
		assessSeverity = '';
		assessMechanism = '';
		assessRecommendation = '';
	}

	function handleSubmitAssessment() {
		if (!selectedInteractionId || !assessSeverity || !assessMechanism) return;
		state = submitAssessment(state, selectedInteractionId, assessSeverity, assessMechanism, assessRecommendation);
		labStore.addAction('assess-interaction', { interactionId: selectedInteractionId });
	}

	function handleQuizAnswer(questionId: string, answer: string) {
		state = answerQuiz(state, questionId, answer);
	}

	function handleSelectPatient(patientId: string) {
		state = selectPatient(state, patientId);
	}

	function completeLab() {
		showResults = true;
	}

	function resetLab() {
		state = createInitialState({ patientId: 'patient-1' });
		isLabStarted = false;
		showResults = false;
		selectedInteractionId = null;
	}

	onMount(() => {
		return () => {};
	});
</script>

<svelte:head>
	<title>Drug Interactions Lab | AfriLab</title>
</svelte:head>

<div class="min-h-screen bg-gray-950 text-white">
	<SafetyBanner
		level="danger"
		message="Drug interactions can cause serious adverse events. Always check for interactions when adding new medications. Consult clinical resources and pharmacists for complex regimens."
	/>

	<!-- Header -->
	<header class="border-b border-white/10 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-40">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<div class="flex items-center gap-4">
					<button
						onclick={() => goto('/labs/pharmacy')}
						class="p-2 rounded-lg glass border border-white/10 hover:border-white/20 transition-colors"
						aria-label="Back to pharmacy labs"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
					</button>
					<div>
						<h1 class="text-lg font-display font-bold text-white">Drug Interactions Lab</h1>
						<p class="text-xs text-gray-400">Pharmacy - Clinical Pharmacology</p>
					</div>
				</div>
				<div class="flex items-center gap-4">
					<HintButton context="drug-interactions" />
				</div>
			</div>
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if !isLabStarted}
			<!-- Pre-lab introduction -->
			<div class="max-w-2xl mx-auto">
				<div class="glass-strong rounded-2xl p-8 border border-white/10 text-center">
					<div class="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-6">
						<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
					</div>

					<h2 class="text-2xl font-display font-bold text-white mb-3">
						Welcome to the Drug Interactions Lab
					</h2>
					<p class="text-gray-400 mb-6">
						Review a virtual patient's medication profile, identify potential drug-drug interactions,
						classify them by mechanism and severity, and recommend management strategies.
					</p>

					<div class="grid grid-cols-2 gap-4 mb-8 text-left">
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-rose-400">1.</span> Review Medications
							</h3>
							<p class="text-sm text-gray-400">Examine the patient's current drug regimen.</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-rose-400">2.</span> Add/Check Drugs
							</h3>
							<p class="text-sm text-gray-400">Add new medications and detect interactions.</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-rose-400">3.</span> Classify & Assess
							</h3>
							<p class="text-sm text-gray-400">Identify mechanisms, severity, and clinical significance.</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-rose-400">4.</span> Recommend
							</h3>
							<p class="text-sm text-gray-400">Suggest alternatives or monitoring strategies.</p>
						</div>
					</div>

					<button
						onclick={startLab}
						class="px-8 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold
							hover:shadow-lg hover:shadow-rose-500/25 transition-all transform hover:scale-105"
					>
						Begin Lab Session
					</button>
				</div>
			</div>
		{:else if showResults}
			<!-- Results screen -->
			<div class="max-w-2xl mx-auto">
				<div class="glass-strong rounded-2xl p-8 border border-white/10">
					<div class="text-center mb-8">
						<div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4
							{analysis.grade === 'A' ? 'bg-emerald-500/20 text-emerald-400'
							: analysis.grade === 'B' ? 'bg-cyan-500/20 text-cyan-400'
							: analysis.grade === 'C' ? 'bg-amber-500/20 text-amber-400'
							: 'bg-rose-500/20 text-rose-400'}">
							<span class="text-4xl font-display font-bold">{analysis.grade}</span>
						</div>
						<h2 class="text-2xl font-display font-bold text-white">Lab Complete!</h2>
						<p class="text-gray-400 mt-2">Score: {analysis.score}/100</p>
					</div>

					<div class="grid grid-cols-3 gap-4 mb-8">
						<div class="glass rounded-xl p-4 text-center border border-white/10">
							<div class="text-2xl font-bold text-rose-400">{analysis.identifiedCount}/{analysis.totalInteractions}</div>
							<div class="text-xs text-gray-400">Identified</div>
						</div>
						<div class="glass rounded-xl p-4 text-center border border-white/10">
							<div class="text-2xl font-bold text-pink-400">{analysis.correctAssessments}</div>
							<div class="text-xs text-gray-400">Correct Assessments</div>
						</div>
						<div class="glass rounded-xl p-4 text-center border border-white/10">
							<div class="text-2xl font-bold text-emerald-400">{analysis.quizScore.correct}/{analysis.quizScore.total}</div>
							<div class="text-xs text-gray-400">Quiz Score</div>
						</div>
					</div>

					<!-- Show correct answers for interactions -->
					{#if state.detectedInteractions.length > 0}
						<div class="mb-6 space-y-3">
							<h3 class="font-semibold text-white text-sm">Interaction Details</h3>
							{#each state.detectedInteractions as detected}
								<div class="glass rounded-xl p-3 border border-white/10">
									<div class="flex items-center justify-between mb-1">
										<span class="text-sm text-white font-medium">{detected.drug1.name} + {detected.drug2.name}</span>
										<span class="text-xs px-2 py-0.5 rounded-full capitalize" style="background: {SEVERITY_COLORS[detected.interaction.severity]}20; color: {SEVERITY_COLORS[detected.interaction.severity]}">
											{detected.interaction.severity}
										</span>
									</div>
									<p class="text-xs text-gray-400">{detected.interaction.description}</p>
									<p class="text-xs text-cyan-400 mt-1">Management: {detected.interaction.management}</p>
								</div>
							{/each}
						</div>
					{/if}

					<div class="glass rounded-xl p-4 border border-white/10 mb-6">
						<h3 class="font-semibold text-white mb-2">Feedback</h3>
						<p class="text-sm text-gray-400">{analysis.feedback}</p>
					</div>

					<div class="flex gap-4">
						<button onclick={resetLab}
							class="flex-1 py-3 px-6 rounded-xl glass border border-white/10 hover:border-white/20 text-white font-medium transition-all">
							Try Again
						</button>
						<button onclick={() => goto('/labs/pharmacy')}
							class="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all">
							Back to Pharmacy
						</button>
					</div>
				</div>
			</div>
		{:else}
			<!-- Active lab -->
			<div class="grid lg:grid-cols-[1fr,380px] gap-6">
				<!-- Main area -->
				<div class="space-y-6">
					<!-- Patient selector -->
					<div class="flex gap-3">
						{#each PATIENTS as patient}
							<button
								onclick={() => handleSelectPatient(patient.id)}
								class="flex-1 px-4 py-3 rounded-xl text-left transition-all
									{state.patient.id === patient.id
									? 'glass-strong border-2 border-rose-500/50 bg-rose-500/10'
									: 'glass border border-white/10 hover:border-white/20'}"
							>
								<div class="text-sm font-medium text-white">{patient.name}</div>
								<div class="text-xs text-gray-400">{patient.age}yo {patient.sex} - {patient.conditions.join(', ')}</div>
							</button>
						{/each}
					</div>

					<!-- Patient info -->
					<div class="glass-strong rounded-2xl p-6 border border-white/10">
						<div class="flex items-start gap-4 mb-4">
							<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
								<svg class="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
							</div>
							<div class="flex-1">
								<h3 class="text-lg font-display font-bold text-white">{state.patient.name}</h3>
								<p class="text-sm text-gray-400">{state.patient.description}</p>
								<div class="flex flex-wrap gap-2 mt-2">
									{#each state.patient.conditions as condition}
										<span class="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">{condition}</span>
									{/each}
								</div>
								{#if state.patient.allergies.length > 0}
									<div class="mt-2">
										<span class="text-xs text-red-400 font-semibold">Allergies: </span>
										<span class="text-xs text-red-300">{state.patient.allergies.join(', ')}</span>
									</div>
								{/if}
							</div>
						</div>
					</div>

					<!-- Current medications -->
					<div class="glass-strong rounded-2xl p-6 border border-white/10">
						<div class="flex items-center justify-between mb-4">
							<h4 class="text-sm font-display font-semibold text-white">Current Medications</h4>
							<button
								onclick={() => showMedSelector = !showMedSelector}
								class="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:shadow-lg transition-all"
							>
								+ Add Medication
							</button>
						</div>

						<div class="space-y-2">
							{#each state.currentMedications as med}
								<div class="glass rounded-xl p-3 border border-white/5 flex items-start justify-between gap-3">
									<div class="flex-1">
										<div class="flex items-center gap-2">
											<span class="text-sm font-medium text-white">{med.name}</span>
											{#if med.narrowTherapeuticIndex}
												<span class="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">NTI</span>
											{/if}
										</div>
										<div class="text-xs text-gray-400">{med.dose} - {med.frequency} ({med.route})</div>
										<div class="text-xs text-gray-500 mt-1">
											Class: {med.drugClass} | Protein binding: {med.proteinBinding}%
										</div>
										{#if med.cyp450.substrate.length > 0}
											<div class="text-xs text-cyan-400/70 mt-0.5">Substrate: {med.cyp450.substrate.join(', ')}</div>
										{/if}
										{#if med.cyp450.inhibitor.length > 0}
											<div class="text-xs text-amber-400/70">Inhibits: {med.cyp450.inhibitor.join(', ')}</div>
										{/if}
										{#if med.cyp450.inducer.length > 0}
											<div class="text-xs text-rose-400/70">Induces: {med.cyp450.inducer.join(', ')}</div>
										{/if}
									</div>
									<button
										onclick={() => handleRemoveMed(med.id)}
										class="p-1.5 rounded-lg glass border border-white/10 hover:border-rose-500/30 text-gray-400 hover:text-rose-400 transition-colors"
										aria-label="Remove {med.name}"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
							{/each}
						</div>

						<!-- Med selector dropdown -->
						{#if showMedSelector}
							<div class="mt-3 glass rounded-xl border border-white/10 max-h-60 overflow-y-auto">
								{#each availableMeds as med}
									<button
										onclick={() => handleAddMed(med.id)}
										class="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
									>
										<div class="text-sm text-white">{med.name}</div>
										<div class="text-xs text-gray-500">{med.drugClass} - {med.indication}</div>
									</button>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Detected interactions -->
					{#if state.detectedInteractions.length > 0}
						<div class="glass-strong rounded-2xl p-6 border border-rose-500/20">
							<h4 class="text-sm font-display font-semibold text-rose-400 mb-4 flex items-center gap-2">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
								</svg>
								Detected Interactions ({state.detectedInteractions.length})
							</h4>

							<div class="space-y-2">
								{#each state.detectedInteractions as detected}
									{@const assessment = state.assessments.find((a) => a.interactionId === detected.id)}
									<button
										onclick={() => handleIdentify(detected.id)}
										class="w-full text-left glass rounded-xl p-3 border transition-all
											{selectedInteractionId === detected.id
											? 'border-rose-500/50 bg-rose-500/10'
											: assessment
												? 'border-emerald-500/30 bg-emerald-500/5'
												: detected.isIdentifiedByStudent
													? 'border-amber-500/30'
													: 'border-white/10 hover:border-white/20'}"
									>
										<div class="flex items-center justify-between">
											<span class="text-sm text-white font-medium">
												{detected.drug1.name} + {detected.drug2.name}
											</span>
											<div class="flex items-center gap-2">
												{#if assessment}
													<span class="text-xs {assessment.isCorrect ? 'text-emerald-400' : 'text-amber-400'}">
														{assessment.isCorrect ? 'Correct' : 'Incorrect'}
													</span>
												{/if}
												<span class="text-xs px-2 py-0.5 rounded-full capitalize" style="background: {SEVERITY_COLORS[detected.interaction.severity]}20; color: {SEVERITY_COLORS[detected.interaction.severity]}">
													{detected.interaction.severity}
												</span>
											</div>
										</div>
										{#if detected.isIdentifiedByStudent}
											<p class="text-xs text-gray-400 mt-1">{detected.interaction.clinicalEffect}</p>
										{/if}
									</button>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Interaction visualization SVG -->
					{#if state.currentMedications.length > 1}
						<div class="glass rounded-2xl p-6 border border-white/10">
							<h4 class="text-sm font-display font-semibold text-white mb-4">Interaction Map</h4>
							<svg viewBox="0 0 500 300" class="w-full h-auto">
								<!-- Draw medications as nodes in a circle -->
								{#each state.currentMedications as med, i}
									{@const angle = (2 * Math.PI * i) / state.currentMedications.length - Math.PI / 2}
									{@const cx = 250 + 120 * Math.cos(angle)}
									{@const cy = 150 + 100 * Math.sin(angle)}
									<circle cx={cx} cy={cy} r="30" fill="rgba(244, 63, 94, 0.15)" stroke="rgba(244, 63, 94, 0.4)" stroke-width="1.5" />
									<text x={cx} y={cy} text-anchor="middle" dominant-baseline="middle" fill="white" font-size="8" font-weight="600">
										{med.name.length > 12 ? med.name.slice(0, 11) + '...' : med.name}
									</text>
								{/each}

								<!-- Draw interaction lines -->
								{#each state.detectedInteractions as detected}
									{@const i1 = state.currentMedications.findIndex((m) => m.id === detected.drug1.id)}
									{@const i2 = state.currentMedications.findIndex((m) => m.id === detected.drug2.id)}
									{#if i1 >= 0 && i2 >= 0}
										{@const a1 = (2 * Math.PI * i1) / state.currentMedications.length - Math.PI / 2}
										{@const a2 = (2 * Math.PI * i2) / state.currentMedications.length - Math.PI / 2}
										{@const x1 = 250 + 120 * Math.cos(a1)}
										{@const y1 = 150 + 100 * Math.sin(a1)}
										{@const x2 = 250 + 120 * Math.cos(a2)}
										{@const y2 = 150 + 100 * Math.sin(a2)}
										<line
											x1={x1} y1={y1} x2={x2} y2={y2}
											stroke={SEVERITY_COLORS[detected.interaction.severity]}
											stroke-width={detected.interaction.severity === 'contraindicated' ? 3 : detected.interaction.severity === 'major' ? 2 : 1.5}
											stroke-dasharray={detected.interaction.severity === 'minor' ? '4,4' : 'none'}
											opacity="0.7"
										/>
									{/if}
								{/each}
							</svg>

							<!-- Legend -->
							<div class="flex flex-wrap gap-4 mt-3 justify-center">
								{#each ['minor', 'moderate', 'major', 'contraindicated'] as sev}
									<div class="flex items-center gap-1.5 text-xs">
										<div class="w-4 h-0.5 rounded" style="background: {SEVERITY_COLORS[sev]}"></div>
										<span class="text-gray-400 capitalize">{sev}</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<!-- Right panel -->
				<div class="space-y-4">
					<!-- Assessment form -->
					{#if selectedInteraction}
						<div class="glass-strong rounded-2xl p-5 border border-white/10 sticky top-20">
							<h4 class="text-sm font-display font-semibold text-white mb-4">
								Assess Interaction
							</h4>
							<p class="text-xs text-gray-400 mb-3">
								{selectedInteraction.drug1.name} + {selectedInteraction.drug2.name}
							</p>

							<div class="space-y-3">
								<div>
									<label class="block text-xs text-gray-400 mb-1">Severity</label>
									<select
										bind:value={assessSeverity}
										class="w-full px-3 py-2 rounded-lg bg-gray-800/50 border border-white/10 text-white text-sm focus:border-rose-500/50 focus:outline-none"
									>
										<option value="">Select severity...</option>
										<option value="minor">Minor</option>
										<option value="moderate">Moderate</option>
										<option value="major">Major</option>
										<option value="contraindicated">Contraindicated</option>
									</select>
								</div>

								<div>
									<label class="block text-xs text-gray-400 mb-1">Mechanism</label>
									<select
										bind:value={assessMechanism}
										class="w-full px-3 py-2 rounded-lg bg-gray-800/50 border border-white/10 text-white text-sm focus:border-rose-500/50 focus:outline-none"
									>
										<option value="">Select mechanism...</option>
										{#each Object.entries(MECHANISM_LABELS) as [key, label]}
											<option value={key}>{label}</option>
										{/each}
									</select>
								</div>

								<div>
									<label class="block text-xs text-gray-400 mb-1">Your Recommendation</label>
									<textarea
										bind:value={assessRecommendation}
										placeholder="Describe management strategy..."
										rows="3"
										class="w-full px-3 py-2 rounded-lg bg-gray-800/50 border border-white/10 text-white text-sm focus:border-rose-500/50 focus:outline-none resize-none"
									></textarea>
								</div>

								<button
									onclick={handleSubmitAssessment}
									disabled={!assessSeverity || !assessMechanism}
									class="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold
										hover:shadow-lg hover:shadow-rose-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Submit Assessment
								</button>
							</div>
						</div>
					{/if}

					<!-- Progress -->
					<div class="glass rounded-xl p-4 border border-white/10">
						<div class="flex items-center justify-between mb-2">
							<span class="text-sm text-gray-400">Interactions Assessed</span>
							<span class="text-sm font-mono text-rose-400">{state.assessments.length}/{state.detectedInteractions.length}</span>
						</div>
						<div class="h-2 bg-gray-800 rounded-full overflow-hidden">
							<div
								class="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500"
								style="width: {state.detectedInteractions.length > 0 ? (state.assessments.length / state.detectedInteractions.length) * 100 : 0}%"
							></div>
						</div>
					</div>

					<!-- Quiz -->
					<div class="glass-strong rounded-2xl p-5 border border-white/10">
						<h4 class="text-sm font-display font-semibold text-white mb-4">Knowledge Quiz</h4>
						<div class="space-y-4">
							{#each INTERACTION_QUIZ as question}
								{@const selected = state.quizAnswers.get(question.id)}
								<div class="glass rounded-xl p-3 border border-white/5">
									<p class="text-xs text-gray-300 mb-2">{question.question}</p>
									<div class="space-y-1">
										{#each question.options as option}
											<button
												onclick={() => handleQuizAnswer(question.id, option)}
												class="w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all
													{selected === option
													? 'bg-rose-500/20 border border-rose-500/30 text-rose-300'
													: 'glass border border-white/5 text-gray-400 hover:border-white/10'}"
											>
												{option}
											</button>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					</div>

					<!-- Complete button -->
					{#if state.assessments.length >= 1}
						<button
							onclick={completeLab}
							class="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500
								text-white font-semibold hover:shadow-lg hover:shadow-rose-500/25 transition-all"
						>
							Complete Lab
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</main>

	<ChatAssistant />
</div>
