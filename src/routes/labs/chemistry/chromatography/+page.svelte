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
		applySample,
		removeSample,
		startDevelopment,
		advanceTime,
		stopDevelopment,
		measureRf,
		analyzeChromatography,
		quizQuestions,
		SAMPLE_LIBRARY,
		SOLVENT_LIBRARY,
		type ChromatographyConfig,
		type ChromatographyState
	} from '$lib/simulations/chemistry/chromatography';
	import {
		generateCertificateId,
		calculateGrade,
		calculateXP,
		type CertificateData
	} from '$lib/utils/certificate';
	import type { Experiment, LabSession } from '$types';

	const config: ChromatographyConfig = {
		method: 'paper',
		solvent: SOLVENT_LIBRARY['ethanol'],
		plateLength: 12,
		originLine: 1.5
	};

	const experiment: Experiment = {
		id: 'chem-chromatography-01',
		disciplineId: 'chem',
		title: 'Chromatography Techniques',
		description: 'Separate mixtures using paper and thin-layer chromatography, and calculate Rf values.',
		difficulty: 'beginner',
		durationMinutes: 40,
		instructions: [
			{
				id: 1,
				title: 'Review Safety & Theory',
				description: 'Learn about chromatography: separation based on differential affinity for mobile and stationary phases.',
				hints: ['Rf = distance traveled by solute / distance traveled by solvent front']
			},
			{
				id: 2,
				title: 'Select Method & Solvent',
				description: 'Choose between paper chromatography and TLC. Select an appropriate solvent.',
				hints: ['TLC is faster but paper chromatography is simpler', 'Ethanol is a good general-purpose solvent']
			},
			{
				id: 3,
				title: 'Apply Samples',
				description: 'Spot your samples on the origin line. Include an unknown sample for identification.',
				hints: ['Apply small, concentrated spots', 'Space samples evenly along the origin']
			},
			{
				id: 4,
				title: 'Develop the Chromatogram',
				description: 'Place the paper/plate in the solvent chamber and let the solvent rise by capillary action.',
				hints: ['The solvent level must be BELOW the origin line', 'Do not disturb the chamber during development']
			},
			{
				id: 5,
				title: 'Measure Rf Values',
				description: 'After development, measure the distance each component traveled and calculate Rf values.',
				hints: ['Rf = distance of spot center / distance of solvent front', 'Rf values range from 0 to 1']
			},
			{
				id: 6,
				title: 'Analyze & Identify',
				description: 'Compare Rf values to identify unknown components by matching with known standards.',
				hints: ['Components with same Rf in same solvent may be the same compound']
			}
		],
		simulationConfig: { type: 'chromatography', parameters: config } as any,
		safetyNotes: 'Handle solvents in well-ventilated area. Avoid skin contact with organic solvents.',
		learningObjectives: [
			'Understand the principles of chromatographic separation',
			'Calculate and interpret Rf values',
			'Compare paper chromatography and TLC',
			'Identify unknown components using Rf matching'
		]
	};

	// State
	let state: ChromatographyState = $state(createInitialState(config));
	let mounted = $state(false);
	let showResults = $state(false);
	let showCertificate = $state(false);
	let labStartTime = $state(Date.now());
	let certificateData: CertificateData | null = $state(null);
	let developInterval: ReturnType<typeof setInterval> | null = null;
	let selectedMethod: 'paper' | 'tlc' = $state('paper');
	let selectedSolvent = $state('ethanol');
	let selectedSampleToMeasure: { sampleId: string; componentIndex: number } | null = $state(null);
	let showQuiz = $state(false);
	let quizAnswers: Record<string, number> = $state({});

	// Available samples
	const availableSamples = [
		{ key: 'ink-black', label: 'Black Ink' },
		{ key: 'ink-green', label: 'Green Ink' },
		{ key: 'ink-purple', label: 'Purple Ink' },
		{ key: 'leaf-extract', label: 'Leaf Extract' },
		{ key: 'unknown-a', label: 'Unknown A' }
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
			studentLevel: 'beginner',
			recentMeasurements: []
		});

		return () => {
			if (developInterval) clearInterval(developInterval);
		};
	});

	function handleMethodChange(method: 'paper' | 'tlc') {
		if (state.isRunning || state.isComplete) return;
		selectedMethod = method;
		const newConfig: ChromatographyConfig = {
			...config,
			method,
			solvent: SOLVENT_LIBRARY[selectedSolvent as keyof typeof SOLVENT_LIBRARY]
		};
		state = createInitialState(newConfig);
		labStore.addAction(`Selected ${method === 'tlc' ? 'TLC' : 'Paper'} chromatography`, {});
	}

	function handleSolventChange(solventKey: string) {
		if (state.isRunning || state.isComplete) return;
		selectedSolvent = solventKey;
		labStore.addAction(`Selected solvent: ${SOLVENT_LIBRARY[solventKey as keyof typeof SOLVENT_LIBRARY].name}`, {});
	}

	function handleApplySample(sampleKey: string) {
		const posIndex = state.samples.length;
		state = applySample(state, sampleKey, posIndex);
		labStore.addAction(`Applied sample: ${sampleKey}`, {});
	}

	function handleRemoveSample(sampleId: string) {
		state = removeSample(state, sampleId);
	}

	function handleStartDevelopment() {
		state = startDevelopment(state);
		if (state.isRunning) {
			developInterval = setInterval(() => {
				state = advanceTime(state, 1);
				if (state.isComplete && developInterval) {
					clearInterval(developInterval);
					developInterval = null;
					labStore.addAction('Development complete', { solventFront: state.solventFrontDistance });
				}
			}, 50);
		}
	}

	function handleStopDevelopment() {
		state = stopDevelopment(state);
		if (developInterval) {
			clearInterval(developInterval);
			developInterval = null;
		}
		labStore.addAction('Development stopped', { solventFront: state.solventFrontDistance });
	}

	function handleMeasureRf(sampleId: string, componentIndex: number) {
		state = measureRf(state, sampleId, componentIndex);
		const lastMeasurement = state.measurements[state.measurements.length - 1];
		if (lastMeasurement) {
			labStore.addMeasurement({
				type: 'Rf',
				value: lastMeasurement.rfValue,
				unit: '',
				label: `${lastMeasurement.componentName} Rf = ${lastMeasurement.rfValue.toFixed(3)}`
			});
		}
	}

	function handleComplete() {
		const analysis = analyzeChromatography(state);
		showResults = true;

		const duration = Math.round((Date.now() - labStartTime) / 60000);
		const score = analysis.score;
		const grade = calculateGrade(score);
		const xpEarned = calculateXP(score, 'beginner');

		certificateData = {
			studentName: $currentUser ? `${$currentUser.firstName} ${$currentUser.lastName}` : 'Student',
			studentId: $currentUser?.id || 'N/A',
			labTitle: experiment.title,
			labDiscipline: 'Chemistry',
			completionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
			duration: duration || experiment.durationMinutes,
			score,
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

	let analysis = $derived(analyzeChromatography(state));
	let measurements = $derived(state.measurements.map((m, i) => ({
		type: 'Rf',
		value: m.rfValue,
		unit: '',
		label: `${m.componentName}: Rf = ${m.rfValue.toFixed(3)}`
	})));

	// SVG helpers
	const plateWidth = 280;
	const plateHeight = 400;
	const originY = plateHeight - 50;
	const solventFrontMaxTravel = originY - 30;

	function getSolventFrontY(): number {
		if (state.maxSolventDistance <= 0) return originY;
		const fraction = state.solventFrontDistance / state.maxSolventDistance;
		return originY - fraction * solventFrontMaxTravel;
	}

	function getSpotY(distance: number): number {
		if (state.maxSolventDistance <= 0) return originY;
		const fraction = distance / state.maxSolventDistance;
		return originY - fraction * solventFrontMaxTravel;
	}
</script>

<svelte:head>
	<title>Chromatography Techniques - AfriLab</title>
</svelte:head>

<!-- Ambient background -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-teal-500/10 to-transparent rounded-full blur-3xl"></div>
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
				<span class="text-cyan-400">Chromatography</span>
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
			message="Handle solvents in a well-ventilated area. Avoid direct skin contact with organic solvents. Wear gloves when handling TLC plates."
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
					<div class="w-1.5 h-5 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-full"></div>
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
			<!-- Method & Solvent Selection -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-1.5 h-5 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-full"></div>
					<h3 class="font-display font-semibold text-white">Setup</h3>
				</div>

				<div class="grid grid-cols-2 gap-4 mb-4">
					<div>
						<label class="text-xs text-gray-400 mb-2 block">Method</label>
						<div class="flex gap-2">
							<button
								onclick={() => handleMethodChange('paper')}
								class="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all
									{selectedMethod === 'paper'
										? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
										: 'glass border border-white/5 text-gray-400 hover:text-white'}"
								disabled={state.isRunning || state.isComplete}
							>Paper</button>
							<button
								onclick={() => handleMethodChange('tlc')}
								class="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all
									{selectedMethod === 'tlc'
										? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
										: 'glass border border-white/5 text-gray-400 hover:text-white'}"
								disabled={state.isRunning || state.isComplete}
							>TLC</button>
						</div>
					</div>
					<div>
						<label class="text-xs text-gray-400 mb-2 block">Solvent</label>
						<select
							class="w-full px-3 py-2 rounded-lg text-xs bg-white/5 border border-white/10 text-white"
							value={selectedSolvent}
							onchange={(e) => handleSolventChange((e.target as HTMLSelectElement).value)}
							disabled={state.isRunning || state.isComplete}
						>
							{#each Object.entries(SOLVENT_LIBRARY) as [key, sol]}
								<option value={key} class="bg-gray-900">{sol.name}</option>
							{/each}
						</select>
					</div>
				</div>

				<!-- Sample Selection -->
				<div>
					<label class="text-xs text-gray-400 mb-2 block">Apply Samples (max 5)</label>
					<div class="flex flex-wrap gap-2">
						{#each availableSamples as sample}
							{@const isApplied = state.samples.some(s => s.id === sample.key)}
							<button
								onclick={() => isApplied ? handleRemoveSample(sample.key) : handleApplySample(sample.key)}
								class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all
									{isApplied
										? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
										: 'glass border border-white/5 text-gray-400 hover:text-white'}"
								disabled={state.isRunning || state.isComplete || (!isApplied && state.samples.length >= 5)}
							>
								{isApplied ? '- ' : '+ '}{sample.label}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<!-- Chromatography Plate Visualization -->
			<div class="glass-strong rounded-2xl p-6 border border-white/10">
				<div class="flex items-center justify-between mb-4">
					<div class="flex items-center gap-3">
						<div class="w-1.5 h-5 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-full"></div>
						<h3 class="font-display font-semibold text-white">
							{selectedMethod === 'tlc' ? 'TLC Plate' : 'Chromatography Paper'}
						</h3>
					</div>
					<div class="flex gap-2">
						{#if !state.isRunning && !state.isComplete && state.samples.length > 0}
							<button onclick={handleStartDevelopment} class="btn-primary text-sm">
								Start Development
							</button>
						{/if}
						{#if state.isRunning}
							<button onclick={handleStopDevelopment} class="btn-secondary text-sm">
								Stop
							</button>
						{/if}
					</div>
				</div>

				<div class="flex justify-center">
					<svg viewBox="0 0 {plateWidth} {plateHeight}" class="w-full max-w-[320px] h-auto">
						<!-- Plate/Paper background -->
						<rect
							x="10" y="10"
							width={plateWidth - 20}
							height={plateHeight - 20}
							rx="4"
							fill={selectedMethod === 'tlc' ? '#f0f0e8' : '#fafaf5'}
							stroke="#d4d4d4"
							stroke-width="1"
						/>

						<!-- Solvent level at bottom -->
						{#if state.isRunning || state.isComplete}
							<rect
								x="10"
								y={plateHeight - 25}
								width={plateWidth - 20}
								height="15"
								fill="rgba(147, 197, 253, 0.3)"
								rx="0"
							/>
						{/if}

						<!-- Solvent front line -->
						{#if (state.isRunning || state.isComplete) && state.solventFrontDistance > 0}
							<line
								x1="20" y1={getSolventFrontY()}
								x2={plateWidth - 20} y2={getSolventFrontY()}
								stroke="#60a5fa"
								stroke-width="1.5"
								stroke-dasharray="6,3"
							/>
							<text
								x={plateWidth - 18}
								y={getSolventFrontY() - 5}
								fill="#60a5fa"
								font-size="9"
								text-anchor="end"
							>SF</text>
						{/if}

						<!-- Origin line -->
						<line
							x1="20" y1={originY}
							x2={plateWidth - 20} y2={originY}
							stroke="#9ca3af"
							stroke-width="1"
							stroke-dasharray="4,4"
						/>
						<text x="15" y={originY + 15} fill="#9ca3af" font-size="9">Origin</text>

						<!-- Sample spots -->
						{#each state.samples as sample, sIdx}
							{@const spotX = 30 + (sIdx + 0.5) * ((plateWidth - 60) / Math.max(state.samples.length, 1))}

							<!-- Origin spot -->
							<circle
								cx={spotX}
								cy={originY}
								r="5"
								fill={sample.color}
								opacity="0.6"
							/>

							<!-- Sample label -->
							<text
								x={spotX}
								y={plateHeight - 5}
								fill="#6b7280"
								font-size="8"
								text-anchor="middle"
							>{sample.name.length > 8 ? sample.name.substring(0, 8) + '..' : sample.name}</text>

							<!-- Separated components -->
							{#each sample.components as comp, cIdx}
								{#if comp.currentDistance > 0.1}
									{@const spotY = getSpotY(comp.currentDistance)}
									<!-- Component spot (elongated for realism) -->
									<ellipse
										cx={spotX}
										cy={spotY}
										rx={4 + comp.bandWidth * 3}
										ry={2 + comp.bandWidth * 5}
										fill={comp.color}
										opacity={comp.intensity * 0.8}
									/>

									<!-- Clickable measurement area -->
									{#if state.isComplete}
										<rect
											x={spotX - 10}
											y={spotY - 8}
											width="20"
											height="16"
											fill="transparent"
											class="cursor-pointer"
											onclick={() => handleMeasureRf(sample.id, cIdx)}
										/>

										<!-- Measurement indicator -->
										{#if state.measurements.some(m => m.sampleId === sample.id && m.componentName === comp.name)}
											{@const meas = state.measurements.find(m => m.sampleId === sample.id && m.componentName === comp.name)}
											<text
												x={spotX + 14}
												y={spotY + 3}
												fill="#10b981"
												font-size="8"
												font-weight="bold"
											>{meas?.rfValue.toFixed(2)}</text>
										{/if}
									{/if}
								{/if}
							{/each}
						{/each}

						<!-- Development progress indicator -->
						{#if state.isRunning}
							<text
								x={plateWidth / 2}
								y="25"
								fill="#60a5fa"
								font-size="11"
								text-anchor="middle"
								class="animate-pulse"
							>Developing... {((state.solventFrontDistance / state.maxSolventDistance) * 100).toFixed(0)}%</text>
						{/if}

						{#if state.isComplete && !state.isRunning}
							<text
								x={plateWidth / 2}
								y="25"
								fill="#10b981"
								font-size="11"
								text-anchor="middle"
							>Development complete - Click spots to measure Rf</text>
						{/if}
					</svg>
				</div>

				<!-- Solvent front distance -->
				{#if state.solventFrontDistance > 0}
					<div class="mt-4 flex justify-center gap-6 text-sm">
						<div class="glass rounded-lg px-4 py-2 border border-white/5">
							<span class="text-gray-400">Solvent front: </span>
							<span class="text-white font-mono">{state.solventFrontDistance.toFixed(2)} cm</span>
						</div>
						<div class="glass rounded-lg px-4 py-2 border border-white/5">
							<span class="text-gray-400">Time: </span>
							<span class="text-white font-mono">{Math.round(state.elapsedTime)}s</span>
						</div>
					</div>
				{/if}
			</div>

			<!-- Results Panel -->
			{#if showResults}
				<div class="glass-strong rounded-2xl p-6 border border-white/10 animate-fade-in-up">
					<div class="flex items-center gap-3 mb-6">
						<div class="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full"></div>
						<h3 class="text-xl font-display font-semibold text-white">Experiment Results</h3>
					</div>

					<div class="grid grid-cols-2 gap-4 mb-6">
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400 mb-1">Components Measured</p>
							<p class="text-2xl font-display font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
								{analysis.measuredComponents}/{analysis.totalComponents}
							</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400 mb-1">Separation Quality</p>
							<p class="text-lg font-display font-bold text-white">
								{analysis.separationQuality}
							</p>
						</div>
					</div>

					{#if analysis.identifiedUnknowns.length > 0}
						<div class="glass rounded-xl p-4 border border-teal-500/20 mb-6">
							<h4 class="text-sm font-semibold text-teal-400 mb-2">Unknown Identifications</h4>
							<ul class="text-sm text-gray-300 space-y-1">
								{#each analysis.identifiedUnknowns as match}
									<li class="flex items-center gap-2">
										<div class="w-2 h-2 rounded-full bg-teal-400"></div>
										{match}
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					<div class="glass rounded-xl p-4 border border-emerald-500/20 mb-6">
						<div class="flex items-center justify-between mb-3">
							<span class="text-sm font-medium text-gray-300">Score</span>
							<span class="text-lg font-display font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
								{analysis.score}%
							</span>
						</div>
						<div class="h-2 bg-white/5 rounded-full overflow-hidden">
							<div
								class="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all rounded-full"
								style="width: {analysis.score}%"
							></div>
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
							<a href="/dashboard" class="text-center text-sm text-gray-400 hover:text-white transition-colors">
								Return to Dashboard
							</a>
						{/if}
					</div>
				</div>
			{/if}
		</div>

		<!-- Right Sidebar -->
		<div class="lg:col-span-1 space-y-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.25s;">
			<!-- Rf Measurements -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-1.5 h-5 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-full"></div>
					<h4 class="text-sm font-display font-semibold text-white">Rf Measurements</h4>
				</div>
				{#if state.measurements.length === 0}
					<p class="text-xs text-gray-500">No measurements yet. Complete development and click on spots to measure.</p>
				{:else}
					<div class="space-y-2 max-h-64 overflow-y-auto">
						{#each state.measurements as m}
							<div class="glass rounded-lg px-3 py-2 border border-white/5 flex items-center justify-between">
								<div class="flex items-center gap-2">
									<div class="w-3 h-3 rounded-full" style="background-color: {m.componentColor};"></div>
									<span class="text-xs text-gray-300">{m.componentName}</span>
								</div>
								<span class="text-xs font-mono font-bold text-white">{m.rfValue.toFixed(3)}</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Quick Stats -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-1.5 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
					<h4 class="text-sm font-display font-semibold text-white">Quick Stats</h4>
				</div>
				<div class="space-y-3 text-sm">
					<div class="flex justify-between items-center">
						<span class="text-gray-400">Method</span>
						<span class="font-medium text-white glass px-3 py-1 rounded-lg border border-white/5">
							{selectedMethod === 'tlc' ? 'TLC' : 'Paper'}
						</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-gray-400">Samples</span>
						<span class="font-medium text-white glass px-3 py-1 rounded-lg border border-white/5">{state.samples.length}</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-gray-400">Status</span>
						{#if state.isComplete}
							<span class="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Complete</span>
						{:else if state.isRunning}
							<span class="px-3 py-1 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">Running</span>
						{:else}
							<span class="px-3 py-1 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">Setup</span>
						{/if}
					</div>
				</div>
			</div>

			<DataRecorder {measurements} />
		</div>
	</div>
</div>

<!-- Certificate Modal -->
{#if showCertificate && certificateData}
	<Certificate
		{certificateData}
		onClose={() => showCertificate = false}
	/>
{/if}
