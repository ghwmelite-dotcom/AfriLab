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
		selectAnode,
		selectCathode,
		assembleCell,
		connectSaltBridge,
		connectVoltmeter,
		startCell,
		setAnodeConcentration,
		setCathodeConcentration,
		recordMeasurement,
		resetCell,
		analyzeElectrochemistry,
		ELECTRODE_DATA,
		quizQuestions,
		type ElectrochemistryConfig,
		type ElectrochemistryState,
		type MetalType
	} from '$lib/simulations/chemistry/electrochemistry';
	import {
		generateCertificateId,
		calculateGrade,
		calculateXP,
		type CertificateData
	} from '$lib/utils/certificate';
	import type { Experiment, LabSession } from '$types';

	const config: ElectrochemistryConfig = {
		temperature: 298.15,
		defaultConcentration: 1.0
	};

	const experiment: Experiment = {
		id: 'chem-electrochemistry-01',
		disciplineId: 'chem',
		title: 'Electrochemistry & Galvanic Cells',
		description: 'Build galvanic cells with different metals, measure cell potentials, and verify the electrochemical series.',
		difficulty: 'intermediate',
		durationMinutes: 50,
		instructions: [
			{
				id: 1,
				title: 'Review Safety & Theory',
				description: 'Understand galvanic cells, standard reduction potentials, and the Nernst equation.',
				hints: ['E_cell = E_cathode - E_anode', 'Anode = oxidation, Cathode = reduction']
			},
			{
				id: 2,
				title: 'Select Electrode Metals',
				description: 'Choose two different metals for the anode and cathode of your galvanic cell.',
				hints: ['The more reactive metal is the anode', 'Try Zn-Cu as a classic example']
			},
			{
				id: 3,
				title: 'Assemble the Cell',
				description: 'Place electrodes in their solutions, connect the salt bridge and voltmeter.',
				hints: ['The salt bridge maintains electrical neutrality', 'Connect voltmeter last']
			},
			{
				id: 4,
				title: 'Measure Cell Potential',
				description: 'Start the cell and read the voltage on the voltmeter.',
				hints: ['Compare with the theoretical E0 value', 'Record the measurement']
			},
			{
				id: 5,
				title: 'Vary Concentrations (Nernst)',
				description: 'Change ion concentrations and observe how cell potential changes.',
				hints: ['Use the Nernst equation: E = E0 - (0.0592/n)logQ', 'Try different concentration ratios']
			},
			{
				id: 6,
				title: 'Test Multiple Cells',
				description: 'Build at least 3 different cell combinations to verify the electrochemical series.',
				hints: ['Reset the cell and choose different metals', 'Compare measured vs. theoretical values']
			}
		],
		simulationConfig: { type: 'electrochemistry', parameters: config } as any,
		safetyNotes: 'Handle metal salt solutions carefully. Avoid skin contact. Dispose of solutions properly.',
		learningObjectives: [
			'Understand how galvanic cells produce electricity',
			'Use standard reduction potentials to predict cell voltage',
			'Apply the Nernst equation to non-standard conditions',
			'Verify the electrochemical series experimentally'
		]
	};

	// State
	let state: ElectrochemistryState = $state(createInitialState(config));
	let mounted = $state(false);
	let showResults = $state(false);
	let showCertificate = $state(false);
	let labStartTime = $state(Date.now());
	let certificateData: CertificateData | null = $state(null);

	const metals: MetalType[] = ['Zn', 'Cu', 'Fe', 'Ag', 'Pb', 'Ni', 'Sn'];

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
			studentLevel: 'intermediate',
			recentMeasurements: []
		});
	});

	function handleSelectAnode(metal: MetalType) {
		state = selectAnode(state, metal);
		labStore.addAction(`Selected anode: ${metal}`, {});
	}

	function handleSelectCathode(metal: MetalType) {
		state = selectCathode(state, metal);
		labStore.addAction(`Selected cathode: ${metal}`, {});
	}

	function handleAssemble() {
		state = assembleCell(state);
		labStore.addAction('Cell assembled', {});
	}

	function handleSaltBridge() {
		state = connectSaltBridge(state);
		labStore.addAction('Salt bridge connected', {});
	}

	function handleVoltmeter() {
		state = connectVoltmeter(state);
		labStore.addAction('Voltmeter connected', {});
	}

	function handleStart() {
		state = startCell(state);
		if (state.measuredVoltage !== null) {
			labStore.addAction('Cell started', { voltage: state.measuredVoltage });
		}
	}

	function handleRecord() {
		state = recordMeasurement(state);
		if (state.measurements.length > 0) {
			const last = state.measurements[state.measurements.length - 1];
			labStore.addMeasurement({
				type: 'voltage',
				value: last.measuredVoltage,
				unit: 'V',
				label: `${last.anodeMetal}|${last.cathodeMetal}: ${last.measuredVoltage.toFixed(3)} V`
			});
		}
	}

	function handleAnodeConc(conc: number) {
		state = setAnodeConcentration(state, conc);
	}

	function handleCathodeConc(conc: number) {
		state = setCathodeConcentration(state, conc);
	}

	function handleResetCell() {
		state = resetCell(state);
		labStore.addAction('Cell reset for new experiment', {});
	}

	function handleComplete() {
		showResults = true;
		const a = analysis;
		const duration = Math.round((Date.now() - labStartTime) / 60000);
		const grade = calculateGrade(a.score);
		const xpEarned = calculateXP(a.score, 'intermediate');

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

	let analysis = $derived(analyzeElectrochemistry(state));
	let measurements = $derived(state.measurements.map((m, i) => ({
		type: 'voltage',
		value: m.measuredVoltage,
		unit: 'V',
		label: `${m.anodeMetal}|${m.cathodeMetal}: ${m.measuredVoltage.toFixed(3)} V`
	})));

	// SVG positions for cell diagram
	const cellW = 400;
	const cellH = 300;
</script>

<svelte:head>
	<title>Electrochemistry & Galvanic Cells - AfriLab</title>
</svelte:head>

<!-- Ambient background -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-amber-500/10 to-transparent rounded-full blur-3xl"></div>
	<div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/10 to-transparent rounded-full blur-3xl"></div>
</div>

<div class="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
	<!-- Header -->
	<div class="flex items-center justify-between mb-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
		<div>
			<div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
				<a href="/dashboard" class="hover:text-cyan-400 transition-colors">Dashboard</a>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
				<a href="/labs/chemistry" class="hover:text-cyan-400 transition-colors">Chemistry</a>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
				<span class="text-amber-400">Electrochemistry</span>
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
			level="info"
			message="Handle metal salt solutions with care. Avoid skin contact. Dispose of heavy metal solutions in designated waste containers."
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
					<div class="w-1.5 h-5 bg-gradient-to-b from-amber-500 to-yellow-500 rounded-full"></div>
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
			<!-- Electrode Selection -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-1.5 h-5 bg-gradient-to-b from-amber-500 to-yellow-500 rounded-full"></div>
					<h3 class="font-display font-semibold text-white">Select Electrodes</h3>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="text-xs text-gray-400 mb-2 block">Anode (Oxidation)</label>
						<div class="flex flex-wrap gap-1.5">
							{#each metals as metal}
								<button
									onclick={() => handleSelectAnode(metal)}
									disabled={metal === state.cathode.metal || state.isRunning}
									class="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
										{state.anode.metal === metal
											? 'bg-red-500/20 text-red-400 border border-red-500/30'
											: metal === state.cathode.metal
											? 'opacity-30 cursor-not-allowed glass border border-white/5 text-gray-500'
											: 'glass border border-white/5 text-gray-400 hover:text-white'}
										disabled:opacity-30 disabled:cursor-not-allowed"
								>
									{ELECTRODE_DATA[metal].name}
								</button>
							{/each}
						</div>
					</div>
					<div>
						<label class="text-xs text-gray-400 mb-2 block">Cathode (Reduction)</label>
						<div class="flex flex-wrap gap-1.5">
							{#each metals as metal}
								<button
									onclick={() => handleSelectCathode(metal)}
									disabled={metal === state.anode.metal || state.isRunning}
									class="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
										{state.cathode.metal === metal
											? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
											: metal === state.anode.metal
											? 'opacity-30 cursor-not-allowed glass border border-white/5 text-gray-500'
											: 'glass border border-white/5 text-gray-400 hover:text-white'}
										disabled:opacity-30 disabled:cursor-not-allowed"
								>
									{ELECTRODE_DATA[metal].name}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- Cell Diagram -->
			<div class="glass-strong rounded-2xl p-6 border border-white/10">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-1.5 h-5 bg-gradient-to-b from-amber-500 to-yellow-500 rounded-full"></div>
					<h3 class="font-display font-semibold text-white">Galvanic Cell</h3>
				</div>

				<div class="flex justify-center">
					<svg viewBox="0 0 {cellW} {cellH}" class="w-full max-w-[440px] h-auto">
						<!-- Anode beaker -->
						<rect x="20" y="100" width="140" height="160" rx="5" fill="none" stroke="#9ca3af" stroke-width="2" />
						<rect x="22" y="130" width="136" height="128" rx="3" fill={state.anode.solutionColor} />

						<!-- Cathode beaker -->
						<rect x="240" y="100" width="140" height="160" rx="5" fill="none" stroke="#9ca3af" stroke-width="2" />
						<rect x="242" y="130" width="136" height="128" rx="3" fill={state.cathode.solutionColor} />

						<!-- Anode electrode -->
						<rect x="75" y="80" width="20" height="140" rx="2" fill={state.anode.color} stroke="#6b7280" stroke-width="1" />
						<text x="85" y="75" fill="#ef4444" font-size="12" font-weight="bold" text-anchor="middle">{state.anode.symbol}</text>
						<text x="85" y="62" fill="#ef4444" font-size="9" text-anchor="middle">Anode (-)</text>

						<!-- Cathode electrode -->
						<rect x="305" y="80" width="20" height="140" rx="2" fill={state.cathode.color} stroke="#6b7280" stroke-width="1" />
						<text x="315" y="75" fill="#3b82f6" font-size="12" font-weight="bold" text-anchor="middle">{state.cathode.symbol}</text>
						<text x="315" y="62" fill="#3b82f6" font-size="9" text-anchor="middle">Cathode (+)</text>

						<!-- Salt bridge -->
						{#if state.saltBridgeConnected}
							<path
								d="M 140 130 Q 140 90 200 90 Q 260 90 260 130"
								fill="none"
								stroke="#a78bfa"
								stroke-width="8"
								stroke-linecap="round"
							/>
							<path
								d="M 140 130 Q 140 90 200 90 Q 260 90 260 130"
								fill="none"
								stroke="#c4b5fd"
								stroke-width="4"
								stroke-linecap="round"
							/>
							<text x="200" y="82" fill="#a78bfa" font-size="9" text-anchor="middle">Salt Bridge (KNO&#x2083;)</text>
						{/if}

						<!-- Wire connections -->
						{#if state.voltmeterConnected}
							<line x1="85" y1="80" x2="85" y2="30" stroke="#ef4444" stroke-width="2" />
							<line x1="85" y1="30" x2="200" y2="30" stroke="#ef4444" stroke-width="2" />
							<line x1="315" y1="80" x2="315" y2="30" stroke="#3b82f6" stroke-width="2" />
							<line x1="315" y1="30" x2="200" y2="30" stroke="#3b82f6" stroke-width="2" />

							<!-- Voltmeter -->
							<circle cx="200" cy="30" r="22" fill="#1e293b" stroke="#475569" stroke-width="2" />
							<text x="200" y="26" fill="#ffffff" font-size="8" text-anchor="middle">V</text>
							{#if state.measuredVoltage !== null}
								<text x="200" y="38" fill="#10b981" font-size="9" font-weight="bold" text-anchor="middle">
									{state.measuredVoltage.toFixed(3)}
								</text>
							{/if}
						{/if}

						<!-- Electron flow arrows -->
						{#if state.isRunning}
							<text x="200" y="18" fill="#facc15" font-size="8" text-anchor="middle">e&#x207B; &#x2192;</text>
						{/if}

						<!-- Solution labels -->
						<text x="90" y="275" fill="#9ca3af" font-size="9" text-anchor="middle">{state.anode.solutionName}</text>
						<text x="310" y="275" fill="#9ca3af" font-size="9" text-anchor="middle">{state.cathode.solutionName}</text>
					</svg>
				</div>

				<!-- Cell notation -->
				<div class="mt-4 glass rounded-lg px-4 py-2 border border-white/5 text-center">
					<p class="text-xs text-gray-400 mb-1">Cell Notation</p>
					<p class="text-sm font-mono text-white">{state.cellNotation}</p>
				</div>

				<!-- Assembly Controls -->
				<div class="mt-4 flex flex-wrap gap-2 justify-center">
					{#if !state.cellAssembled}
						<button onclick={handleAssemble} class="btn-secondary text-sm">Assemble Cell</button>
					{:else if !state.saltBridgeConnected}
						<button onclick={handleSaltBridge} class="btn-secondary text-sm">Connect Salt Bridge</button>
					{:else if !state.voltmeterConnected}
						<button onclick={handleVoltmeter} class="btn-secondary text-sm">Connect Voltmeter</button>
					{:else if !state.isRunning}
						<button onclick={handleStart} class="btn-primary text-sm">Start Cell</button>
					{:else}
						<button onclick={handleRecord} class="btn-primary text-sm">Record Measurement</button>
						<button onclick={handleResetCell} class="btn-secondary text-sm">Reset for New Cell</button>
					{/if}
				</div>
			</div>

			<!-- Concentration Controls -->
			{#if state.cellAssembled}
				<div class="glass rounded-2xl p-5 border border-white/5">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-1.5 h-5 bg-gradient-to-b from-amber-500 to-yellow-500 rounded-full"></div>
						<h3 class="font-display font-semibold text-white">Ion Concentrations (Nernst Equation)</h3>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<div class="flex justify-between text-xs mb-1">
								<span class="text-gray-400">[{state.anode.ionFormula}]</span>
								<span class="text-white font-mono">{state.anodeConcentration.toFixed(3)} M</span>
							</div>
							<input
								type="range" min="0.001" max="2.0" step="0.001"
								value={state.anodeConcentration}
								oninput={(e) => handleAnodeConc(parseFloat((e.target as HTMLInputElement).value))}
								class="w-full h-2 appearance-none bg-white/5 rounded-full cursor-pointer
									[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer"
							/>
						</div>
						<div>
							<div class="flex justify-between text-xs mb-1">
								<span class="text-gray-400">[{state.cathode.ionFormula}]</span>
								<span class="text-white font-mono">{state.cathodeConcentration.toFixed(3)} M</span>
							</div>
							<input
								type="range" min="0.001" max="2.0" step="0.001"
								value={state.cathodeConcentration}
								oninput={(e) => handleCathodeConc(parseFloat((e.target as HTMLInputElement).value))}
								class="w-full h-2 appearance-none bg-white/5 rounded-full cursor-pointer
									[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer"
							/>
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
							<p class="text-sm text-gray-400 mb-1">Cells Tested</p>
							<p class="text-2xl font-display font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
								{analysis.uniqueCellsTested}
							</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400 mb-1">Avg. Error</p>
							<p class="text-2xl font-display font-bold text-white">{analysis.averageError.toFixed(4)} V</p>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4 mb-6">
						<div class="glass rounded-xl p-4 border border-white/5 flex items-center gap-3">
							<div class="w-3 h-3 rounded-full {analysis.electrochemicalSeriesVerified ? 'bg-emerald-400' : 'bg-gray-600'}"></div>
							<div>
								<p class="text-xs text-gray-400">Series Verified</p>
								<p class="text-sm font-bold {analysis.electrochemicalSeriesVerified ? 'text-emerald-400' : 'text-gray-500'}">
									{analysis.electrochemicalSeriesVerified ? 'Yes' : 'No'}
								</p>
							</div>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5 flex items-center gap-3">
							<div class="w-3 h-3 rounded-full {analysis.nernstEquationVerified ? 'bg-emerald-400' : 'bg-gray-600'}"></div>
							<div>
								<p class="text-xs text-gray-400">Nernst Verified</p>
								<p class="text-sm font-bold {analysis.nernstEquationVerified ? 'text-emerald-400' : 'text-gray-500'}">
									{analysis.nernstEquationVerified ? 'Yes' : 'No'}
								</p>
							</div>
						</div>
					</div>

					<div class="glass rounded-xl p-4 border border-emerald-500/20 mb-6">
						<div class="flex items-center justify-between mb-3">
							<span class="text-sm font-medium text-gray-300">Score</span>
							<span class="text-lg font-display font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">{analysis.score}%</span>
						</div>
						<div class="h-2 bg-white/5 rounded-full overflow-hidden">
							<div class="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all rounded-full" style="width: {analysis.score}%"></div>
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
			<!-- Voltmeter Display -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-1.5 h-5 bg-gradient-to-b from-amber-500 to-yellow-500 rounded-full"></div>
					<h4 class="text-sm font-display font-semibold text-white">Voltmeter</h4>
				</div>
				<div class="text-center">
					<p class="text-4xl font-mono font-bold {state.measuredVoltage !== null ? 'text-emerald-400' : 'text-gray-600'}">
						{state.measuredVoltage !== null ? state.measuredVoltage.toFixed(3) : '-.---'}
					</p>
					<p class="text-sm text-gray-400 mt-1">Volts (V)</p>
				</div>
				<div class="mt-4 space-y-2 text-xs">
					<div class="flex justify-between">
						<span class="text-gray-400">E\u00B0 (standard)</span>
						<span class="text-white font-mono">{state.theoreticalVoltage.toFixed(3)} V</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-400">E (Nernst)</span>
						<span class="text-white font-mono">{state.nernstVoltage.toFixed(3)} V</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-400">n (electrons)</span>
						<span class="text-white font-mono">{state.electronsTransferred}</span>
					</div>
				</div>
			</div>

			<!-- Half-Reactions -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-1.5 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
					<h4 class="text-sm font-display font-semibold text-white">Reactions</h4>
				</div>
				<div class="space-y-3 text-xs">
					<div class="glass rounded-lg p-3 border border-red-500/20">
						<p class="text-red-400 font-medium mb-1">Anode (Oxidation)</p>
						<p class="text-white font-mono text-[10px]">{state.reactions.anode}</p>
						<p class="text-gray-500 mt-1">E\u00B0 = {state.anode.standardPotential.toFixed(2)} V</p>
					</div>
					<div class="glass rounded-lg p-3 border border-blue-500/20">
						<p class="text-blue-400 font-medium mb-1">Cathode (Reduction)</p>
						<p class="text-white font-mono text-[10px]">{state.reactions.cathode}</p>
						<p class="text-gray-500 mt-1">E\u00B0 = {state.cathode.standardPotential.toFixed(2)} V</p>
					</div>
				</div>
			</div>

			<!-- Measurements History -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-1.5 h-5 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
					<h4 class="text-sm font-display font-semibold text-white">Recorded ({state.measurements.length})</h4>
				</div>
				{#if state.measurements.length === 0}
					<p class="text-xs text-gray-500">No measurements recorded yet.</p>
				{:else}
					<div class="space-y-2 max-h-48 overflow-y-auto">
						{#each state.measurements as m, i}
							<div class="glass rounded-lg px-3 py-2 border border-white/5 text-xs">
								<div class="flex justify-between">
									<span class="text-gray-400">{m.anodeMetal}|{m.cathodeMetal}</span>
									<span class="text-white font-mono font-bold">{m.measuredVoltage.toFixed(3)} V</span>
								</div>
								<div class="flex justify-between text-gray-500 mt-0.5">
									<span>[{m.anodeConcentration}M | {m.cathodeConcentration}M]</span>
									<span>E\u00B0={m.theoreticalVoltage.toFixed(2)}</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Certificate Modal -->
{#if showCertificate && certificateData}
	<Certificate {certificateData} onClose={() => showCertificate = false} />
{/if}
