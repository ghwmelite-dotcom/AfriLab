<script lang="ts">
	import { onMount } from 'svelte';
	import { labStore } from '$stores/lab';
	import { aiStore } from '$stores/ai';
	import { currentUser } from '$stores/user';

	import SafetyBanner from '$components/lab/SafetyBanner.svelte';
	import StepGuide from '$components/lab/StepGuide.svelte';
	import HintButton from '$components/ai/HintButton.svelte';
	import ControlPanel from '$components/lab/ControlPanel.svelte';
	import DataRecorder from '$components/lab/DataRecorder.svelte';
	import Certificate from '$components/lab/Certificate.svelte';

	import {
		createInitialState,
		selectReaction,
		recordInitialTemperature,
		startReaction,
		advanceReactionTime,
		calculateResults,
		resetForNewReaction,
		calculateHessLaw,
		analyzeCalorimetry,
		REACTION_LIBRARY,
		quizQuestions,
		type CalorimetryConfig,
		type CalorimetryState,
		type ReactionType
	} from '$lib/simulations/chemistry/calorimetry';
	import {
		generateCertificateId,
		calculateGrade,
		calculateXP,
		type CertificateData
	} from '$lib/utils/certificate';
	import type { Experiment, LabSession } from '$types';

	const config: CalorimetryConfig = {
		calorimeterType: 'coffee-cup',
		defaultVolume: 100,
		ambientTemperature: 25.0
	};

	const experiment: Experiment = {
		id: 'chem-calorimetry-01',
		disciplineId: 'chem',
		title: 'Calorimetry & Thermochemistry',
		description: 'Measure heat of reaction using a virtual calorimeter and apply Hess\'s Law.',
		difficulty: 'advanced',
		durationMinutes: 55,
		instructions: [
			{
				id: 1,
				title: 'Review Safety & Theory',
				description: 'Understand q = mc*deltaT and Hess\'s Law. Enthalpy is a state function.',
				hints: ['q = mass * specific heat * temperature change', 'deltaH is negative for exothermic reactions']
			},
			{
				id: 2,
				title: 'Select a Reaction',
				description: 'Choose from available reactions. Start with a simple neutralization.',
				hints: ['HCl + NaOH is a classic calorimetry experiment', 'Note whether each reaction is exothermic or endothermic']
			},
			{
				id: 3,
				title: 'Record Initial Temperature',
				description: 'Measure and record the initial temperature of the solution.',
				hints: ['Standard room temperature is about 25 C', 'Be precise with your reading']
			},
			{
				id: 4,
				title: 'Run the Reaction',
				description: 'Mix the reagents and observe the temperature change over time.',
				hints: ['Watch the temperature curve', 'Exothermic reactions increase temperature']
			},
			{
				id: 5,
				title: 'Calculate deltaH',
				description: 'Use q = mc*deltaT to find the heat, then calculate deltaH per mole.',
				hints: ['deltaH = q / moles', 'Remember the sign convention']
			},
			{
				id: 6,
				title: 'Verify Hess\'s Law',
				description: 'Run Mg + HCl and MgO + HCl to verify Hess\'s Law for MgO formation.',
				hints: ['deltaH_formation = deltaH1 - deltaH2 + deltaH(H2O)', 'Literature value for MgO formation: -601.6 kJ/mol']
			}
		],
		simulationConfig: { type: 'calorimetry', parameters: config } as any,
		safetyNotes: 'Handle acids and bases with care. Some reactions produce heat or gas. Wear goggles and gloves.',
		learningObjectives: [
			'Measure enthalpy changes using calorimetry',
			'Apply the equation q = mc*deltaT',
			'Distinguish between exothermic and endothermic reactions',
			'Verify Hess\'s Law experimentally'
		]
	};

	// State
	let state: CalorimetryState = $state(createInitialState(config));
	let mounted = $state(false);
	let showResults = $state(false);
	let showCertificate = $state(false);
	let labStartTime = $state(Date.now());
	let certificateData: CertificateData | null = $state(null);
	let reactionInterval: ReturnType<typeof setInterval> | null = null;

	const availableReactions: ReactionType[] = [
		'hcl-naoh', 'nh4no3-dissolve', 'cacl2-dissolve',
		'mg-hcl', 'mgo-hcl', 'mgoh2-hcl'
	];

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
			discipline: 'chemistry',
			experimentTitle: experiment.title,
			currentStep: 0,
			studentLevel: 'advanced',
			recentMeasurements: []
		});

		return () => {
			if (reactionInterval) clearInterval(reactionInterval);
		};
	});

	function handleSelectReaction(rxnType: ReactionType) {
		state = selectReaction(state, rxnType);
		labStore.addAction(`Selected reaction: ${REACTION_LIBRARY[rxnType].name}`, {});
	}

	function handleRecordInitial() {
		state = recordInitialTemperature(state, state.currentTemperature);
		labStore.addAction('Recorded initial temperature', { temp: state.initialTemperature });
	}

	function handleStartReaction() {
		state = startReaction(state);
		if (state.isReacting) {
			reactionInterval = setInterval(() => {
				state = advanceReactionTime(state, 0.5);
				if (state.reactionComplete) {
					if (reactionInterval) {
						clearInterval(reactionInterval);
						reactionInterval = null;
					}
					labStore.addAction('Reaction complete', { finalTemp: state.finalTemperature });
				}
			}, 50);
		}
	}

	function handleCalculate() {
		state = calculateResults(state);
		labStore.addMeasurement({
			type: 'deltaH',
			value: state.deltaH,
			unit: 'kJ/mol',
			label: `deltaH = ${state.deltaH.toFixed(1)} kJ/mol`
		});
	}

	function handleNewReaction() {
		state = resetForNewReaction(state);
		labStore.addAction('Reset for new reaction', {});
	}

	function handleComplete() {
		showResults = true;
		const a = analysis;
		const duration = Math.round((Date.now() - labStartTime) / 60000);
		const grade = calculateGrade(a.score);
		const xpEarned = calculateXP(a.score, 'advanced');

		certificateData = {
			studentName: $currentUser ? `${$currentUser.firstName} ${$currentUser.lastName}` : 'Student',
			studentId: $currentUser?.id || 'N/A',
			labTitle: experiment.title,
			labDiscipline: 'Chemistry',
			completionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
			duration: duration || experiment.durationMinutes,
			score: a.score,
			grade,
			xpEarned,
			certificateId: generateCertificateId(),
			institutionName: 'AfriLab Virtual Laboratory'
		};
	}

	function handleReset() {
		state = createInitialState(config);
		showResults = false;
		certificateData = null;
		labStartTime = Date.now();
		labStore.reset();
	}

	function handleShowCertificate() {
		if (certificateData) showCertificate = true;
	}

	let analysis = $derived(analyzeCalorimetry(state));
	let hessLawResult = $derived(calculateHessLaw(state));
	let selectedRxnData = $derived(state.selectedReaction ? REACTION_LIBRARY[state.selectedReaction] : null);
	let measurements = $derived(state.measurements.map(m => ({
		type: m.type,
		value: m.value,
		unit: m.unit,
		label: m.label
	})));

	// Temperature chart helpers
	const chartW = 300;
	const chartH = 150;
	const chartPadding = 30;

	function getChartPoints(): string {
		if (state.temperatureHistory.length < 2) return '';
		const minT = Math.min(...state.temperatureHistory.map(p => p.temperature)) - 2;
		const maxT = Math.max(...state.temperatureHistory.map(p => p.temperature)) + 2;
		const maxTime = Math.max(35, state.temperatureHistory[state.temperatureHistory.length - 1].time);

		return state.temperatureHistory.map(p => {
			const x = chartPadding + ((p.time / maxTime) * (chartW - chartPadding * 2));
			const y = chartH - chartPadding - ((p.temperature - minT) / (maxT - minT)) * (chartH - chartPadding * 2);
			return `${x},${y}`;
		}).join(' ');
	}
</script>

<svelte:head>
	<title>Calorimetry & Thermochemistry - AfriLab</title>
</svelte:head>

<!-- Ambient background -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
	<div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-r from-red-500/10 to-transparent rounded-full blur-3xl"></div>
</div>

<div class="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
	<!-- Header -->
	<div class="flex items-center justify-between mb-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
		<div>
			<div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
				<a href="/dashboard" class="hover:text-orange-400 transition-colors">Dashboard</a>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
				<a href="/labs/chemistry" class="hover:text-orange-400 transition-colors">Chemistry</a>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
				<span class="text-orange-400">Calorimetry</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-display font-bold text-white">{experiment.title}</h1>
		</div>
		<button onclick={() => aiStore.open()} class="btn-primary">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
			</svg>
			Ask AI Assistant
		</button>
	</div>

	<!-- Safety Banner -->
	<div class="mb-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.1s;">
		<SafetyBanner
			level="warning"
			message="Some reactions produce significant heat. Handle HCl and NaOH solutions carefully. Mg + HCl produces hydrogen gas - no flames nearby."
		/>
	</div>

	<!-- Main Layout -->
	<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
		<!-- Left Sidebar -->
		<div class="lg:col-span-1 space-y-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.15s;">
			<StepGuide
				steps={experiment.instructions}
				currentStepIndex={$labStore.currentStepIndex}
			/>

			<div class="glass rounded-2xl p-4 border border-white/5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-1.5 h-5 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
					<h4 class="text-sm font-display font-semibold text-white">Need Help?</h4>
				</div>
				<p class="text-xs text-gray-400 mb-3">Get progressive hints without giving away the answer.</p>
				<HintButton
					experimentId={experiment.id}
					stepId={$labStore.currentStepIndex + 1}
					stepTitle={experiment.instructions[$labStore.currentStepIndex]?.title}
				/>
			</div>

			<ControlPanel onComplete={handleComplete} />
		</div>

		<!-- Center: Lab Simulation -->
		<div class="lg:col-span-2 space-y-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">
			<!-- Reaction Selection -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-1.5 h-5 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
					<h3 class="font-display font-semibold text-white">Select Reaction</h3>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
					{#each availableReactions as rxnType}
						{@const rxn = REACTION_LIBRARY[rxnType]}
						{@const isCompleted = state.reactions.some(r => r.reactionId === rxnType)}
						<button
							onclick={() => handleSelectReaction(rxnType)}
							disabled={state.isReacting}
							class="text-left px-3 py-2.5 rounded-lg text-xs transition-all
								{state.selectedReaction === rxnType
									? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
									: isCompleted
									? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
									: 'glass border border-white/5 text-gray-400 hover:text-white'}
								disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<div class="flex items-center gap-2">
								{#if isCompleted}
									<div class="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></div>
								{:else}
									<div class="w-2 h-2 rounded-full bg-gray-600 flex-shrink-0"></div>
								{/if}
								<span class="font-medium">{rxn.name}</span>
							</div>
							<p class="text-gray-500 mt-0.5 ml-4">{rxn.type === 'exothermic' ? 'Exothermic' : 'Endothermic'}</p>
						</button>
					{/each}
				</div>
			</div>

			<!-- Calorimeter Visualization -->
			<div class="glass-strong rounded-2xl p-6 border border-white/10">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-1.5 h-5 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
					<h3 class="font-display font-semibold text-white">Coffee-Cup Calorimeter</h3>
				</div>

				<div class="flex justify-center mb-4">
					<svg viewBox="0 0 250 280" class="w-full max-w-[280px] h-auto">
						<!-- Outer cup (insulation) -->
						<rect x="50" y="60" width="150" height="180" rx="10" fill="#7c3aed" opacity="0.15" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="4,4" />

						<!-- Inner cup -->
						<rect x="65" y="70" width="120" height="160" rx="6" fill="#1e293b" stroke="#475569" stroke-width="2" />

						<!-- Solution -->
						{#if true}
						{@const tempNormalized = Math.max(0, Math.min(1, (state.currentTemperature - 15) / 60))}
						{@const solColor = state.isReacting || state.reactionComplete
							? (selectedRxnData?.type === 'exothermic'
								? `rgba(239, 68, 68, ${0.2 + tempNormalized * 0.4})`
								: `rgba(59, 130, 246, ${0.2 + (1 - tempNormalized) * 0.3})`)
							: 'rgba(148, 163, 184, 0.2)'}
						<rect x="67" y="100" width="116" height="128" rx="4" fill={solColor} />
						{/if}

						<!-- Lid -->
						<rect x="55" y="55" width="140" height="12" rx="4" fill="#334155" stroke="#475569" stroke-width="1" />

						<!-- Thermometer -->
						<rect x="115" y="20" width="8" height="110" rx="4" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1" />
						<rect
							x="117"
							y={130 - Math.min(105, ((state.currentTemperature - 10) / 80) * 105)}
							width="4"
							height={Math.min(105, ((state.currentTemperature - 10) / 80) * 105)}
							rx="2"
							fill={state.currentTemperature > 25 ? '#ef4444' : '#3b82f6'}
						/>
						<circle cx="119" cy="130" r="6" fill={state.currentTemperature > 25 ? '#ef4444' : '#3b82f6'} />

						<!-- Temperature reading -->
						<text x="145" y="40" fill="#ffffff" font-size="14" font-weight="bold">{state.currentTemperature.toFixed(1)}\u00B0C</text>

						<!-- Stirrer -->
						<rect x="90" y="25" width="6" height="120" rx="3" fill="#9ca3af" />
						<rect x="78" y="140" width="30" height="4" rx="2" fill="#9ca3af" />

						<!-- Reaction label -->
						{#if selectedRxnData}
							<text x="125" y="260" fill="#9ca3af" font-size="9" text-anchor="middle">{selectedRxnData.equation}</text>
						{/if}

						<!-- Reaction indicator -->
						{#if state.isReacting}
							<text x="125" y="180" fill="#facc15" font-size="10" text-anchor="middle" class="animate-pulse">Reacting...</text>
						{/if}
					</svg>
				</div>

				<!-- Temperature Chart -->
				{#if state.temperatureHistory.length > 1}
					<div class="glass rounded-xl p-4 border border-white/5 mb-4">
						<p class="text-xs text-gray-400 mb-2">Temperature vs Time</p>
						<svg viewBox="0 0 {chartW} {chartH}" class="w-full h-auto">
							<!-- Axes -->
							<line x1={chartPadding} y1={chartH - chartPadding} x2={chartW - chartPadding} y2={chartH - chartPadding} stroke="#475569" stroke-width="1" />
							<line x1={chartPadding} y1={chartPadding} x2={chartPadding} y2={chartH - chartPadding} stroke="#475569" stroke-width="1" />

							<!-- Temperature curve -->
							<polyline
								points={getChartPoints()}
								fill="none"
								stroke={selectedRxnData?.type === 'exothermic' ? '#ef4444' : '#3b82f6'}
								stroke-width="2"
							/>

							<!-- Labels -->
							<text x={chartW / 2} y={chartH - 5} fill="#6b7280" font-size="9" text-anchor="middle">Time (s)</text>
							<text x="8" y={chartH / 2} fill="#6b7280" font-size="9" text-anchor="middle" transform="rotate(-90, 8, {chartH / 2})">T (\u00B0C)</text>
						</svg>
					</div>
				{/if}

				<!-- Action Controls -->
				<div class="flex flex-wrap gap-2 justify-center">
					{#if state.selectedReaction && !state.isReacting && !state.reactionComplete}
						<button onclick={handleRecordInitial} class="btn-secondary text-sm">Record Initial T</button>
						<button onclick={handleStartReaction} class="btn-primary text-sm">Start Reaction</button>
					{:else if state.reactionComplete && state.deltaH === 0}
						<button onclick={handleCalculate} class="btn-primary text-sm">Calculate deltaH</button>
					{:else if state.reactionComplete && state.deltaH !== 0}
						<button onclick={handleNewReaction} class="btn-secondary text-sm">New Reaction</button>
					{/if}
				</div>
			</div>

			<!-- Hess's Law Panel -->
			{#if hessLawResult}
				<div class="glass rounded-2xl p-5 border border-purple-500/20 animate-fade-in-up">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-1.5 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
						<h3 class="font-display font-semibold text-white">Hess's Law Verification</h3>
					</div>

					<div class="space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-gray-400">Mg + 2HCl -> MgCl&#x2082; + H&#x2082;</span>
							<span class="text-white font-mono">{hessLawResult.step1.toFixed(1)} kJ/mol</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-400">MgO + 2HCl -> MgCl&#x2082; + H&#x2082;O</span>
							<span class="text-white font-mono">{hessLawResult.step2.toFixed(1)} kJ/mol</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-400">H&#x2082; + 1/2 O&#x2082; -> H&#x2082;O</span>
							<span class="text-white font-mono">{hessLawResult.waterFormation.toFixed(1)} kJ/mol</span>
						</div>
						<hr class="border-white/10" />
						<div class="flex justify-between font-bold">
							<span class="text-purple-400">Mg + 1/2 O&#x2082; -> MgO</span>
							<span class="text-purple-400 font-mono">{hessLawResult.calculated.toFixed(1)} kJ/mol</span>
						</div>
						<div class="flex justify-between text-xs">
							<span class="text-gray-500">Literature value</span>
							<span class="text-gray-400">{hessLawResult.literature.toFixed(1)} kJ/mol</span>
						</div>
						<div class="flex justify-between text-xs">
							<span class="text-gray-500">Percent error</span>
							<span class="{hessLawResult.percentError < 10 ? 'text-emerald-400' : 'text-amber-400'}">{hessLawResult.percentError.toFixed(1)}%</span>
						</div>
					</div>
				</div>
			{/if}

			<!-- Results Panel -->
			{#if showResults}
				<div class="glass-strong rounded-2xl p-6 border border-white/10 animate-fade-in-up">
					<div class="flex items-center gap-3 mb-6">
						<div class="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full"></div>
						<h3 class="text-xl font-display font-semibold text-white">Experiment Results</h3>
					</div>

					<div class="grid grid-cols-2 gap-4 mb-6">
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400 mb-1">Reactions Completed</p>
							<p class="text-2xl font-display font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
								{analysis.reactionsCompleted}
							</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400 mb-1">Avg. Error</p>
							<p class="text-2xl font-display font-bold text-white">{analysis.averagePercentError.toFixed(1)}%</p>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4 mb-6">
						<div class="glass rounded-xl p-4 border border-white/5 flex items-center gap-3">
							<div class="w-3 h-3 rounded-full {analysis.hessLawVerified ? 'bg-emerald-400' : 'bg-gray-600'}"></div>
							<div>
								<p class="text-xs text-gray-400">Hess's Law</p>
								<p class="text-sm font-bold {analysis.hessLawVerified ? 'text-emerald-400' : 'text-gray-500'}">
									{analysis.hessLawVerified ? 'Verified' : 'Not tested'}
								</p>
							</div>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400 mb-1">Score</p>
							<p class="text-2xl font-display font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">{analysis.score}%</p>
						</div>
					</div>

					<!-- Completed reactions table -->
					{#if state.reactions.length > 0}
						<div class="glass rounded-xl p-4 border border-white/5 mb-6">
							<p class="text-sm font-medium text-gray-300 mb-3">Completed Reactions</p>
							<div class="space-y-2">
								{#each state.reactions as r}
									{@const rxn = REACTION_LIBRARY[r.reactionId]}
									<div class="flex items-center justify-between text-xs glass rounded-lg px-3 py-2 border border-white/5">
										<span class="text-gray-300">{rxn.name}</span>
										<div class="flex gap-3">
											<span class="text-white font-mono">{r.measuredDeltaH.toFixed(1)} kJ/mol</span>
											<span class="{r.percentError < 10 ? 'text-emerald-400' : 'text-amber-400'}">({r.percentError.toFixed(1)}% err)</span>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<div class="glass rounded-xl p-4 border border-emerald-500/20 mb-6">
						<div class="flex items-center justify-between mb-3">
							<span class="text-sm font-medium text-gray-300">Overall Score</span>
							<span class="text-lg font-display font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">{analysis.score}%</span>
						</div>
						<div class="h-2 bg-white/5 rounded-full overflow-hidden">
							<div class="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all rounded-full" style="width: {analysis.score}%"></div>
						</div>
					</div>

					<p class="text-gray-400 mb-6">{analysis.feedback}</p>

					<div class="flex flex-col gap-3">
						<div class="flex gap-3">
							<button onclick={handleReset} class="btn-secondary flex-1">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
								Try Again
							</button>
							{#if certificateData && certificateData.score >= 60}
								<button onclick={handleShowCertificate} class="btn-primary flex-1 flex items-center justify-center gap-2">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
									</svg>
									Get Certificate
								</button>
							{:else}
								<a href="/dashboard" class="btn-primary flex-1 text-center">Back to Dashboard</a>
							{/if}
						</div>
						{#if certificateData && certificateData.score >= 60}
							<a href="/dashboard" class="text-center text-sm text-gray-400 hover:text-white transition-colors">Return to Dashboard</a>
						{/if}
					</div>
				</div>
			{/if}
		</div>

		<!-- Right Sidebar -->
		<div class="lg:col-span-1 space-y-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.25s;">
			<!-- Current Reaction Info -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-1.5 h-5 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
					<h4 class="text-sm font-display font-semibold text-white">Reaction Details</h4>
				</div>
				{#if selectedRxnData}
					<div class="space-y-3 text-xs">
						<div class="glass rounded-lg p-3 border border-white/5">
							<p class="text-gray-400 mb-1">Equation</p>
							<p class="text-white font-mono text-[10px]">{selectedRxnData.equation}</p>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-400">Type</span>
							<span class="{selectedRxnData.type === 'exothermic' ? 'text-red-400' : 'text-blue-400'} font-medium">
								{selectedRxnData.type === 'exothermic' ? 'Exothermic' : 'Endothermic'}
							</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-400">Reagent 1</span>
							<span class="text-white">{selectedRxnData.reagent1}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-400">Reagent 2</span>
							<span class="text-white">{selectedRxnData.reagent2}</span>
						</div>
						{#if state.deltaH !== 0}
							<hr class="border-white/10" />
							<div class="flex justify-between">
								<span class="text-gray-400">Measured deltaH</span>
								<span class="text-white font-mono font-bold">{state.deltaH.toFixed(1)} kJ/mol</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-400">Literature deltaH</span>
								<span class="text-gray-300">{selectedRxnData.deltaH.toFixed(1)} kJ/mol</span>
							</div>
							<div class="flex justify-between">
								<span class="text-gray-400">Heat (q)</span>
								<span class="text-white font-mono">{state.heatReleased.toFixed(1)} J</span>
							</div>
						{/if}
					</div>
				{:else}
					<p class="text-xs text-gray-500">Select a reaction to see details.</p>
				{/if}
			</div>

			<!-- Thermometer -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-1.5 h-5 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
					<h4 class="text-sm font-display font-semibold text-white">Thermometer</h4>
				</div>
				<div class="text-center">
					<p class="text-4xl font-mono font-bold {state.currentTemperature > 30 ? 'text-red-400' : state.currentTemperature < 20 ? 'text-blue-400' : 'text-white'}">
						{state.currentTemperature.toFixed(1)}
					</p>
					<p class="text-sm text-gray-400 mt-1">\u00B0C</p>
				</div>
				<div class="mt-4 space-y-2 text-xs">
					<div class="flex justify-between">
						<span class="text-gray-400">Initial T</span>
						<span class="text-white font-mono">{state.initialTemperature.toFixed(1)} \u00B0C</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-400">Final T</span>
						<span class="text-white font-mono">{state.reactionComplete ? state.finalTemperature.toFixed(1) + ' \u00B0C' : '--'}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-400">deltaT</span>
						<span class="text-white font-mono">{state.reactionComplete ? (state.finalTemperature - state.initialTemperature).toFixed(2) + ' \u00B0C' : '--'}</span>
					</div>
				</div>
			</div>

			<DataRecorder {measurements} />
		</div>
	</div>
</div>

<!-- Certificate Modal -->
{#if showCertificate && certificateData}
	<Certificate {certificateData} onClose={() => showCertificate = false} />
{/if}
