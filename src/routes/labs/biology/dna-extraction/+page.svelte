<script lang="ts">
	import { onMount } from 'svelte';
	import { labStore } from '$stores/lab';
	import { aiStore } from '$stores/ai';
	import SafetyBanner from '$components/lab/SafetyBanner.svelte';
	import StepGuide from '$components/lab/StepGuide.svelte';
	import HintButton from '$components/ai/HintButton.svelte';
	import ControlPanel from '$components/lab/ControlPanel.svelte';
	import LabCanvas from '$components/lab/LabCanvas.svelte';

	import {
		createInitialState,
		selectSample,
		advanceStep,
		addLysisBuffer,
		setLysisTime,
		addProtease,
		setProteaseTime,
		addEthanol,
		spoolDNA,
		setGelConcentration,
		loadWell,
		setVoltage,
		setRunTime,
		stainGel,
		calculateMigrationDistance,
		answerQuiz,
		checkQuizAnswers,
		analyzeExtraction,
		DNA_SAMPLES,
		MW_LADDER,
		DNA_QUIZ,
		type ExtractionState,
		type ExtractionStep
	} from '$lib/simulations/biology/dna-extraction';
	import type { Experiment, LabSession } from '$types';

	const experiment: Experiment = {
		id: 'bio-dna-extraction-01',
		disciplineId: 'biology',
		title: 'DNA Extraction & Electrophoresis',
		description: 'Extract DNA from biological samples and analyze using gel electrophoresis.',
		difficulty: 'advanced',
		durationMinutes: 60,
		instructions: [
			{ id: 1, title: 'Select Sample', description: 'Choose a biological sample for DNA extraction.', hints: ['Strawberries yield lots of DNA (octoploid)'] },
			{ id: 2, title: 'Lyse Cells', description: 'Add lysis buffer (soap + salt) to break open cells.', hints: ['Soap dissolves cell membranes'] },
			{ id: 3, title: 'Add Protease', description: 'Add meat tenderizer to digest proteins.', hints: ['Protease removes histone proteins from DNA'] },
			{ id: 4, title: 'Precipitate DNA', description: 'Layer cold ethanol to precipitate DNA.', hints: ['Cold ethanol works better than warm'] },
			{ id: 5, title: 'Spool DNA', description: 'Use a glass rod to spool the visible DNA.', hints: ['DNA appears as white stringy precipitate'] },
			{ id: 6, title: 'Prepare Gel', description: 'Set gel concentration and load samples into wells.', hints: ['1% agarose is standard for most DNA'] },
			{ id: 7, title: 'Run Electrophoresis', description: 'Set voltage and run time for gel separation.', hints: ['100V for 30 minutes is typical'] },
			{ id: 8, title: 'Stain & Analyze', description: 'Stain the gel and analyze fragment sizes.', hints: ['Compare bands to the MW ladder'] },
			{ id: 9, title: 'Complete Quiz', description: 'Answer questions about DNA extraction.', hints: ['Review the extraction protocol'] }
		],
		simulationConfig: { type: 'dna-extraction', parameters: {}, equipment: ['Mortar and pestle', 'Beakers', 'Lysis buffer', 'Protease', 'Cold ethanol', 'Gel electrophoresis apparatus', 'DNA stain'] },
		safetyNotes: 'Ethanol is flammable. DNA stains may be hazardous. Wear gloves.',
		learningObjectives: ['Understand DNA extraction steps', 'Operate gel electrophoresis', 'Analyze DNA fragment sizes', 'Interpret gel results']
	};

	let state: ExtractionState = $state(createInitialState({ defaultSample: 'strawberry', wellCount: 6 }));
	let showResults = $state(false);
	let showQuiz = $state(false);
	let mounted = $state(false);

	let analysis = $derived(analyzeExtraction(state));
	let quizResults = $derived(checkQuizAnswers(state));
	let currentSample = $derived(DNA_SAMPLES.find(s => s.id === state.selectedSampleId));

	const STEPS: { key: ExtractionStep; label: string }[] = [
		{ key: 'sample-prep', label: 'Sample Prep' },
		{ key: 'lysis', label: 'Cell Lysis' },
		{ key: 'protease', label: 'Protease' },
		{ key: 'precipitation', label: 'Precipitation' },
		{ key: 'spooling', label: 'Spool DNA' },
		{ key: 'loading', label: 'Load Gel' },
		{ key: 'running', label: 'Run Gel' },
		{ key: 'staining', label: 'Stain Gel' },
		{ key: 'analysis', label: 'Analysis' }
	];

	onMount(() => {
		mounted = true;
		const session: LabSession = {
			id: crypto.randomUUID(), userId: '', experimentId: experiment.id,
			status: 'in_progress', startedAt: new Date(), completedAt: null,
			data: { currentStep: 0, measurements: [], notes: [], actions: [] }, score: null
		};
		labStore.startLab(experiment, session);
		aiStore.setContext({ discipline: 'biology', experimentTitle: experiment.title, currentStep: 0, studentLevel: 'advanced', recentMeasurements: [] });
	});

	function goToStep(step: ExtractionStep) {
		state = advanceStep(state, step);
		labStore.addAction('advance-step', { step });
	}

	function handleQuizAnswer(qId: string, answer: string) {
		state = answerQuiz(state, qId, answer);
	}

	function handleComplete() {
		showResults = true;
		labStore.completeLab();
	}

	// Gel visualization helper
	function getBandY(fragmentSize: number): number {
		return calculateMigrationDistance(fragmentSize, state.gelConcentration, state.voltage, state.runTime) * 280 + 30;
	}
</script>

<svelte:head>
	<title>DNA Extraction & Electrophoresis - AfriLab</title>
</svelte:head>

<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-cyan-500/10 to-transparent rounded-full blur-3xl"></div>
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
				<span class="text-emerald-400">DNA Extraction</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-display font-bold text-white">{experiment.title}</h1>
		</div>
		<div class="flex items-center gap-3">
			<button onclick={() => aiStore.open()} class="btn-primary">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
				Ask AI
			</button>
		</div>
	</div>

	<div class="mb-6"><SafetyBanner level="warning" message="Ethanol is flammable. DNA stains may be carcinogenic. In a real lab, always wear gloves and work in a well-ventilated area." /></div>

	<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
		<!-- Left: Steps -->
		<div class="lg:col-span-1 space-y-6">
			<StepGuide steps={experiment.instructions} currentStepIndex={$labStore.currentStepIndex} />
			<div class="glass rounded-2xl p-4 border border-white/5">
				<HintButton experimentId={experiment.id} stepId={$labStore.currentStepIndex + 1} stepTitle={experiment.instructions[$labStore.currentStepIndex]?.title} />
			</div>
			<ControlPanel onComplete={handleComplete} />
		</div>

		<!-- Center: Lab Area -->
		<div class="lg:col-span-2 space-y-6">
			{#if !showQuiz}
				<!-- Protocol Steps Tabs -->
				<div class="glass-strong rounded-2xl p-3 border border-white/10">
					<div class="flex gap-1 flex-wrap">
						{#each STEPS as step}
							<button
								onclick={() => goToStep(step.key)}
								class="px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all {state.currentStep === step.key ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-white' : state.stepsCompleted.includes(step.key) ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'glass border border-white/10 text-gray-500'}"
							>
								{step.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Step Content -->
				{#if state.currentStep === 'sample-prep'}
					<div class="glass-strong rounded-2xl p-5 border border-white/10">
						<h3 class="text-sm font-semibold text-white mb-3">1. Select Sample</h3>
						<div class="grid grid-cols-3 gap-3">
							{#each DNA_SAMPLES as sample}
								<button
									onclick={() => { state = selectSample(state, sample.id); }}
									class="p-4 rounded-xl text-center transition-all {state.selectedSampleId === sample.id ? 'ring-2 ring-cyan-500 bg-cyan-500/10' : 'glass border border-white/10 hover:border-white/20'}"
								>
									<div class="w-12 h-12 mx-auto rounded-full mb-2" style="background: {sample.color}40; border: 2px solid {sample.color}"></div>
									<p class="text-sm font-medium text-white">{sample.name}</p>
									<p class="text-[10px] text-gray-500">{sample.source}</p>
								</button>
							{/each}
						</div>
						<button onclick={() => goToStep('lysis')} class="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm">
							Next: Lyse Cells
						</button>
					</div>

				{:else if state.currentStep === 'lysis'}
					<div class="glass-strong rounded-2xl p-5 border border-white/10 space-y-4">
						<h3 class="text-sm font-semibold text-white">2. Cell Lysis</h3>
						<p class="text-xs text-gray-400">Add lysis buffer (dish soap + salt solution) to mashed {currentSample?.name || 'sample'} to break open cell membranes.</p>
						<button onclick={() => { state = addLysisBuffer(state); }}
							disabled={state.lysisBufferAdded}
							class="w-full py-2.5 rounded-xl text-sm font-medium transition-all {state.lysisBufferAdded ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'} disabled:opacity-70">
							{state.lysisBufferAdded ? 'Lysis Buffer Added' : 'Add Lysis Buffer'}
						</button>
						{#if state.lysisBufferAdded}
							<div>
								<div class="flex justify-between text-xs mb-1">
									<span class="text-gray-400">Incubation Time</span>
									<span class="font-mono text-white">{state.lysisTime} min</span>
								</div>
								<input type="range" min="0" max="30" step="1" value={state.lysisTime}
									oninput={(e) => { state = setLysisTime(state, parseInt((e.target as HTMLInputElement).value)); }}
									class="w-full accent-cyan-500" />
								<p class="text-[10px] text-gray-500 mt-1">Optimal: 10-15 minutes at 60C</p>
							</div>
							<button onclick={() => goToStep('protease')} class="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm">
								Next: Add Protease
							</button>
						{/if}
					</div>

				{:else if state.currentStep === 'protease'}
					<div class="glass-strong rounded-2xl p-5 border border-white/10 space-y-4">
						<h3 class="text-sm font-semibold text-white">3. Protease Treatment</h3>
						<p class="text-xs text-gray-400">Add protease (meat tenderizer) to digest proteins and histones bound to DNA.</p>
						<button onclick={() => { state = addProtease(state); }}
							disabled={state.proteaseAdded}
							class="w-full py-2.5 rounded-xl text-sm font-medium transition-all {state.proteaseAdded ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'} disabled:opacity-70">
							{state.proteaseAdded ? 'Protease Added' : 'Add Protease'}
						</button>
						{#if state.proteaseAdded}
							<div>
								<div class="flex justify-between text-xs mb-1">
									<span class="text-gray-400">Incubation Time</span>
									<span class="font-mono text-white">{state.proteaseTime} min</span>
								</div>
								<input type="range" min="0" max="20" step="1" value={state.proteaseTime}
									oninput={(e) => { state = setProteaseTime(state, parseInt((e.target as HTMLInputElement).value)); }}
									class="w-full accent-cyan-500" />
								<p class="text-[10px] text-gray-500 mt-1">Optimal: 5-10 minutes</p>
							</div>
							<button onclick={() => goToStep('precipitation')} class="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm">
								Next: Precipitate DNA
							</button>
						{/if}
					</div>

				{:else if state.currentStep === 'precipitation'}
					<div class="glass-strong rounded-2xl p-5 border border-white/10 space-y-4">
						<h3 class="text-sm font-semibold text-white">4. DNA Precipitation</h3>
						<p class="text-xs text-gray-400">Gently layer ethanol on top of the lysate. DNA will precipitate at the interface.</p>
						<div class="grid grid-cols-2 gap-3">
							<button onclick={() => { state = addEthanol(state, true); }}
								disabled={state.ethanolAdded}
								class="py-3 rounded-xl text-sm font-medium transition-all {state.ethanolAdded && state.ethanolCold ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'} disabled:opacity-70">
								Add Cold Ethanol
							</button>
							<button onclick={() => { state = addEthanol(state, false); }}
								disabled={state.ethanolAdded}
								class="py-3 rounded-xl text-sm font-medium transition-all {state.ethanolAdded && !state.ethanolCold ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'glass border border-white/10 text-gray-400 hover:border-white/20'} disabled:opacity-70">
								Add Warm Ethanol
							</button>
						</div>
						{#if state.ethanolAdded}
							<div class="glass rounded-xl p-3 border border-white/5 text-center">
								<p class="text-xs text-gray-400">DNA Yield Quality</p>
								<div class="flex items-center justify-center gap-2 mt-1">
									<div class="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
										<div class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all" style="width: {state.dnaYield}%"></div>
									</div>
									<span class="text-sm font-mono text-white">{state.dnaYield}%</span>
								</div>
								<p class="text-[10px] text-gray-500 mt-1">{state.dnaVisible ? 'White stringy DNA visible!' : 'DNA not visible - try different conditions'}</p>
							</div>
							<button onclick={() => goToStep('spooling')} disabled={!state.dnaVisible}
								class="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm disabled:opacity-50">
								Next: Spool DNA
							</button>
						{/if}
					</div>

				{:else if state.currentStep === 'spooling'}
					<div class="glass-strong rounded-2xl p-5 border border-white/10 space-y-4">
						<h3 class="text-sm font-semibold text-white">5. Spool DNA</h3>
						<p class="text-xs text-gray-400">Use a glass rod to gently wind up the precipitated DNA fibers.</p>
						<!-- DNA Spooling Visualization -->
						<LabCanvas className="min-h-[200px]">
							<div class="flex items-center justify-center h-[200px]">
								<svg viewBox="0 0 200 160" class="w-48 h-40">
									<!-- Glass rod -->
									<line x1="100" y1="10" x2="100" y2="140" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-linecap="round" />
									{#if state.dnaSpooled}
										<!-- DNA fibers wrapped around rod -->
										{#each Array(8) as _, i}
											<path d="M {85 + Math.sin(i * 0.8) * 15} {40 + i * 12} Q {100} {46 + i * 12} {115 - Math.sin(i * 0.8) * 15} {40 + i * 12}"
												fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" />
										{/each}
									{/if}
									<!-- Interface layer -->
									<rect x="40" y="120" width="120" height="30" rx="3" fill="rgba(100,200,255,0.15)" stroke="rgba(255,255,255,0.1)" />
									{#if state.dnaVisible && !state.dnaSpooled}
										<!-- Visible DNA at interface -->
										{#each Array(5) as _, i}
											<path d="M {60 + i * 20} 118 Q {65 + i * 20} {110 - i * 3} {70 + i * 20} {115 - i * 2}"
												fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1" />
										{/each}
									{/if}
								</svg>
							</div>
						</LabCanvas>
						<button onclick={() => { state = spoolDNA(state); }}
							disabled={state.dnaSpooled || !state.dnaVisible}
							class="w-full py-2.5 rounded-xl text-sm font-medium transition-all {state.dnaSpooled ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'} disabled:opacity-50">
							{state.dnaSpooled ? 'DNA Spooled Successfully!' : 'Spool DNA'}
						</button>
						{#if state.dnaSpooled}
							<button onclick={() => goToStep('loading')} class="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm">
								Next: Load Gel
							</button>
						{/if}
					</div>

				{:else if state.currentStep === 'loading'}
					<div class="glass-strong rounded-2xl p-5 border border-white/10 space-y-4">
						<h3 class="text-sm font-semibold text-white">6. Prepare & Load Gel</h3>
						<div>
							<label class="text-xs text-gray-400 mb-1 block">Gel Concentration</label>
							<div class="flex gap-2">
								{#each [0.8, 1.0, 1.5, 2.0] as conc}
									<button
										onclick={() => { state = setGelConcentration(state, conc); }}
										class="flex-1 py-2 rounded-lg text-xs font-medium {state.gelConcentration === conc ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'glass border border-white/10 text-gray-400'}"
									>
										{conc}%
									</button>
								{/each}
							</div>
						</div>
						<div>
							<label class="text-xs text-gray-400 mb-2 block">Load Wells</label>
							<div class="flex gap-2">
								{#each state.wells as well, i}
									<div class="flex-1 text-center">
										<div class="w-full h-8 rounded-t border border-white/20 flex items-center justify-center text-[10px] {well.loaded ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-600'}">
											{well.sampleId === 'ladder' ? 'L' : well.loaded ? 'S' : i + 1}
										</div>
										{#if i > 0}
											<button
												onclick={() => { state = loadWell(state, i, well.loaded ? null : state.selectedSampleId); }}
												class="w-full mt-1 py-1 rounded text-[10px] {well.loaded ? 'text-emerald-400' : 'text-gray-500 hover:text-white'}"
											>
												{well.loaded ? 'Loaded' : 'Load'}
											</button>
										{/if}
									</div>
								{/each}
							</div>
						</div>
						<button onclick={() => { state = loadWell(state, 0, 'ladder'); goToStep('running'); }}
							class="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm">
							Load Ladder & Run Gel
						</button>
					</div>

				{:else if state.currentStep === 'running'}
					<div class="glass-strong rounded-2xl p-5 border border-white/10 space-y-4">
						<h3 class="text-sm font-semibold text-white">7. Run Electrophoresis</h3>
						<div>
							<div class="flex justify-between text-xs mb-1">
								<span class="text-gray-400">Voltage</span>
								<span class="font-mono text-white">{state.voltage}V</span>
							</div>
							<input type="range" min="50" max="200" step="10" value={state.voltage}
								oninput={(e) => { state = setVoltage(state, parseInt((e.target as HTMLInputElement).value)); }}
								class="w-full accent-cyan-500" />
						</div>
						<div>
							<div class="flex justify-between text-xs mb-1">
								<span class="text-gray-400">Run Time</span>
								<span class="font-mono text-white">{state.runTime} min</span>
							</div>
							<input type="range" min="0" max="60" step="5" value={state.runTime}
								oninput={(e) => { state = setRunTime(state, parseInt((e.target as HTMLInputElement).value)); }}
								class="w-full accent-cyan-500" />
						</div>
						<button onclick={() => goToStep('staining')} disabled={state.runTime < 10}
							class="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm disabled:opacity-50">
							Stop & Stain Gel
						</button>
					</div>

				{:else if state.currentStep === 'staining' || state.currentStep === 'analysis'}
					<div class="glass-strong rounded-2xl p-5 border border-white/10 space-y-4">
						<div class="flex justify-between items-center">
							<h3 class="text-sm font-semibold text-white">8. Gel Analysis</h3>
							{#if !state.gelStained}
								<button onclick={() => { state = stainGel(state); goToStep('analysis'); }}
									class="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium">
									Stain with Ethidium Bromide
								</button>
							{/if}
						</div>

						<!-- Gel Visualization -->
						<LabCanvas className="min-h-[340px]">
							<div class="p-4">
								<svg viewBox="0 0 360 320" class="w-full h-auto">
									<!-- Gel background -->
									<rect x="10" y="10" width="340" height="300" rx="8" fill="rgba(20,50,80,0.6)" stroke="rgba(255,255,255,0.1)" />
									<!-- Wells -->
									{#each state.wells as well, i}
										{@const x = 30 + i * (300 / state.wells.length)}
										{@const wellWidth = 300 / state.wells.length - 10}
										<!-- Well -->
										<rect x={x} y="20" width={wellWidth} height="8" rx="1" fill="rgba(255,255,255,0.15)" />
										<!-- Well label -->
										<text x={x + wellWidth / 2} y="16" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="8">
											{well.sampleId === 'ladder' ? 'Ladder' : well.loaded ? DNA_SAMPLES.find(s => s.id === well.sampleId)?.name || '' : ''}
										</text>

										{#if state.gelStained && well.loaded && state.runTime >= 10}
											{@const fragments = well.sampleId === 'ladder' ? MW_LADDER : DNA_SAMPLES.find(s => s.id === well.sampleId)?.fragments || []}
											{#each fragments as fragment}
												{@const bandY = getBandY(fragment.size)}
												<rect
													x={x + 2}
													y={bandY}
													width={wellWidth - 4}
													height={3}
													rx="1"
													fill="rgba(0, 255, 200, {fragment.intensity * 0.8})"
												/>
												{#if well.sampleId === 'ladder'}
													<text x={x + wellWidth + 3} y={bandY + 3} fill="rgba(255,255,255,0.3)" font-size="6">{fragment.size}bp</text>
												{/if}
											{/each}
										{/if}
									{/each}

									<!-- Direction arrow -->
									<text x="355" y="170" fill="rgba(255,255,255,0.2)" font-size="8" text-anchor="end" transform="rotate(90, 355, 170)">(-) to (+)</text>
								</svg>
							</div>
						</LabCanvas>

						{#if state.gelStained && currentSample}
							<div class="glass rounded-xl p-3 border border-white/5">
								<h4 class="text-xs font-semibold text-white mb-2">Expected Fragment Sizes ({currentSample.name})</h4>
								<div class="flex flex-wrap gap-2">
									{#each currentSample.fragments as frag}
										<span class="px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 text-xs font-mono">{frag.size} bp</span>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			{:else}
				<!-- Quiz -->
				<div class="glass-strong rounded-2xl border border-white/10 p-6">
					<h3 class="text-xl font-display font-semibold text-white mb-6">Knowledge Quiz</h3>
					<div class="space-y-6">
						{#each DNA_QUIZ as question}
							<div class="glass rounded-xl p-4 border border-white/5">
								<p class="text-white font-medium mb-3">{question.question}</p>
								<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
									{#each question.options as option}
										<button
											onclick={() => handleQuizAnswer(question.id, option)}
											class="p-2 rounded-lg text-sm text-left transition-all {state.quizAnswers.get(question.id) === option ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'glass border border-white/10 text-gray-300 hover:border-emerald-500/30'}"
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

			<button onclick={() => showQuiz = !showQuiz} class="w-full btn-secondary">
				{showQuiz ? 'Back to Lab' : 'Take Quiz'}
			</button>

			{#if showResults}
				<div class="glass-strong rounded-2xl p-6 border border-white/10 animate-fade-in-up">
					<h3 class="text-xl font-display font-semibold text-white mb-4">Lab Results</h3>
					<div class="grid grid-cols-2 gap-4 mb-6">
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">DNA Yield</p>
							<p class="text-2xl font-bold text-white">{analysis.extractionQuality}%</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Steps Done</p>
							<p class="text-2xl font-bold text-white">{analysis.stepsCompleted}/{analysis.totalSteps}</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Quiz Score</p>
							<p class="text-2xl font-bold text-white">{quizResults.correct}/{quizResults.total}</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Grade</p>
							<p class="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{analysis.grade}</p>
						</div>
					</div>
					<p class="text-gray-400 mb-6">{analysis.feedback}</p>
					<div class="flex gap-3">
						<button onclick={() => { state = createInitialState({ defaultSample: 'strawberry', wellCount: 6 }); showResults = false; showQuiz = false; labStore.reset(); }} class="btn-secondary flex-1">Try Again</button>
						<a href="/labs/biology" class="btn-primary flex-1 text-center">Back to Labs</a>
					</div>
				</div>
			{/if}
		</div>

		<!-- Right: Info -->
		<div class="lg:col-span-1 space-y-6">
			<!-- Progress -->
			<div class="glass-strong rounded-2xl p-5 border border-white/10">
				<h4 class="text-sm font-semibold text-white mb-3">Extraction Progress</h4>
				<div class="space-y-2">
					{#each STEPS as step}
						<div class="flex items-center gap-2">
							<div class="w-4 h-4 rounded-full flex items-center justify-center {state.stepsCompleted.includes(step.key) ? 'bg-emerald-500' : state.currentStep === step.key ? 'bg-cyan-500 animate-pulse' : 'bg-white/10'}">
								{#if state.stepsCompleted.includes(step.key)}
									<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
								{/if}
							</div>
							<span class="text-xs {state.currentStep === step.key ? 'text-white' : state.stepsCompleted.includes(step.key) ? 'text-emerald-400' : 'text-gray-500'}">{step.label}</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Sample Info -->
			{#if currentSample}
				<div class="glass rounded-2xl p-5 border border-white/5">
					<h4 class="text-sm font-semibold text-white mb-3">Current Sample</h4>
					<div class="flex items-center gap-3 mb-3">
						<div class="w-10 h-10 rounded-full" style="background: {currentSample.color}40; border: 2px solid {currentSample.color}"></div>
						<div>
							<p class="text-sm font-medium text-white">{currentSample.name}</p>
							<p class="text-[10px] text-gray-500">{currentSample.source}</p>
						</div>
					</div>
					<p class="text-xs text-gray-400">{currentSample.fragments.length} expected fragments</p>
				</div>
			{/if}
		</div>
	</div>
</div>
