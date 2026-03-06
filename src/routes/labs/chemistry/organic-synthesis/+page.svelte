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
		weighSalicylicAcid,
		addAceticAnhydride,
		addCatalyst,
		startMixing,
		heatReaction,
		coolAndCrystallize,
		filterProduct,
		washProduct,
		recrystallize,
		dryProduct,
		performMeltingPointTest,
		performFerricChlorideTest,
		analyzeSynthesis,
		quizQuestions,
		type OrganicSynthesisConfig,
		type OrganicSynthesisState
	} from '$lib/simulations/chemistry/organic-synthesis';
	import {
		generateCertificateId,
		calculateGrade,
		calculateXP,
		type CertificateData
	} from '$lib/utils/certificate';
	import type { Experiment, LabSession } from '$types';

	const config: OrganicSynthesisConfig = {
		salicylicAcidMass: 2.0,
		aceticAnhydrideVolume: 3.0,
		aceticAnhydrideDensity: 1.08,
		phosphoricAcidDrops: 5,
		theoreticalMeltingPoint: 135
	};

	const experiment: Experiment = {
		id: 'chem-organic-synthesis-01',
		disciplineId: 'chem',
		title: 'Organic Synthesis: Aspirin',
		description: 'Synthesize acetylsalicylic acid (aspirin) from salicylic acid and acetic anhydride.',
		difficulty: 'intermediate',
		durationMinutes: 60,
		instructions: [
			{
				id: 1,
				title: 'Safety & Introduction',
				description: 'Review safety for working with acetic anhydride (corrosive) and phosphoric acid. Understand the esterification reaction.',
				hints: ['Acetic anhydride is corrosive - handle in fume hood', 'This is an esterification reaction']
			},
			{
				id: 2,
				title: 'Weigh Reagents',
				description: 'Weigh 2.0 g of salicylic acid and measure 3.0 mL of acetic anhydride.',
				hints: ['Use an analytical balance for accuracy', '2.0 g salicylic acid is the standard amount']
			},
			{
				id: 3,
				title: 'Mix & Add Catalyst',
				description: 'Combine reagents in a flask and add 5 drops of phosphoric acid catalyst.',
				hints: ['The catalyst speeds up the reaction', 'Swirl gently to mix']
			},
			{
				id: 4,
				title: 'Heat the Reaction',
				description: 'Heat the mixture to 75-85 C in a water bath for 15 minutes.',
				hints: ['Do not exceed 90 C', 'Use a water bath, not direct heat']
			},
			{
				id: 5,
				title: 'Cool, Filter & Purify',
				description: 'Cool the mixture, filter the crystals, wash, and recrystallize from ethanol/water.',
				hints: ['Add cold water to precipitate crystals', 'Use vacuum filtration']
			},
			{
				id: 6,
				title: 'Test Purity',
				description: 'Perform melting point analysis and ferric chloride test to assess purity.',
				hints: ['Pure aspirin melts at 135 C', 'FeCl3 test detects unreacted salicylic acid']
			}
		],
		simulationConfig: { type: 'organic-synthesis', parameters: config } as any,
		safetyNotes: 'Acetic anhydride is corrosive. Work in fume hood. Wear goggles, gloves, and lab coat.',
		learningObjectives: [
			'Perform an organic esterification reaction',
			'Practice filtration and recrystallization techniques',
			'Calculate percent yield',
			'Assess product purity using melting point and chemical tests'
		]
	};

	// State
	let state: OrganicSynthesisState = $state(createInitialState(config));
	let mounted = $state(false);
	let showResults = $state(false);
	let showCertificate = $state(false);
	let labStartTime = $state(Date.now());
	let certificateData: CertificateData | null = $state(null);
	let heatingInterval: ReturnType<typeof setInterval> | null = null;
	let saWeighValue = $state(2.0);
	let aaVolumeValue = $state(3.0);
	let heatTemp = $state(80);
	let isHeating = $state(false);

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

		return () => {
			if (heatingInterval) clearInterval(heatingInterval);
		};
	});

	function handleWeigh() {
		state = weighSalicylicAcid(state, saWeighValue);
		labStore.addAction('Weighed salicylic acid', { mass: saWeighValue });
	}

	function handleAddAnhydride() {
		state = addAceticAnhydride(state, aaVolumeValue);
		labStore.addAction('Added acetic anhydride', { volume: aaVolumeValue });
	}

	function handleAddCatalyst() {
		state = addCatalyst(state);
		labStore.addAction('Added phosphoric acid catalyst', {});
	}

	function handleStartMixing() {
		state = startMixing(state);
		labStore.addAction('Started mixing reagents', {});
	}

	function handleStartHeating() {
		if (isHeating) return;
		isHeating = true;
		heatingInterval = setInterval(() => {
			state = heatReaction(state, heatTemp, 30); // 30 seconds per tick
			if (state.reactionComplete) {
				isHeating = false;
				if (heatingInterval) {
					clearInterval(heatingInterval);
					heatingInterval = null;
				}
				labStore.addAction('Reaction complete', { temp: state.reactionTemperature, time: state.heatingTime });
			}
		}, 100);
	}

	function handleStopHeating() {
		isHeating = false;
		if (heatingInterval) {
			clearInterval(heatingInterval);
			heatingInterval = null;
		}
	}

	function handleCoolAndCrystallize() {
		state = coolAndCrystallize(state);
		labStore.addAction('Cooled and crystallized', { productMass: state.productMass });
	}

	function handleFilter() {
		state = filterProduct(state);
		labStore.addAction('Filtered product', {});
	}

	function handleWash() {
		state = washProduct(state);
		labStore.addAction('Washed product', {});
	}

	function handleRecrystallize() {
		state = recrystallize(state);
		labStore.addAction('Recrystallized', { purifiedMass: state.purifiedMass });
	}

	function handleDry() {
		state = dryProduct(state);
		labStore.addAction('Dried product', { yield: state.percentYield });
		labStore.addMeasurement({ type: 'yield', value: state.percentYield, unit: '%', label: 'Percent yield' });
	}

	function handleMeltingPoint() {
		state = performMeltingPointTest(state);
		labStore.addMeasurement({ type: 'mp', value: state.meltingPointStart, unit: '\u00B0C', label: `MP: ${state.meltingPointStart}-${state.meltingPointEnd} \u00B0C` });
	}

	function handleFeCl3Test() {
		state = performFerricChlorideTest(state);
		labStore.addAction('FeCl3 test performed', { result: state.ferricChlorideTest });
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
		isHeating = false;
		labStartTime = Date.now();
		labStore.reset();
	}

	function handleShowCertificate() {
		if (certificateData) showCertificate = true;
	}

	let analysis = $derived(analyzeSynthesis(state));
	let measurements = $derived(state.measurements.map((m, i) => ({
		type: m.type,
		value: m.value,
		unit: m.unit,
		label: m.label
	})));

	// Step-specific UI helpers
	let heatingProgress = $derived(Math.min(100, (state.heatingTime / 900) * 100));
	let tempInRange = $derived(state.reactionTemperature >= 70 && state.reactionTemperature <= 90);

	// Flask visualization helpers
	function getFlaskColor(): string {
		if (state.step === 'weigh-reagents' && state.salicylicAcidMass > 0) return '#f5f5f5';
		if (state.step === 'mix-reagents' && state.aceticAnhydrideVolume > 0) return '#e8e8e0';
		if (state.step === 'heat-reaction') return state.reactionTemperature > 60 ? '#d4d4a0' : '#e0e0d0';
		if (state.crystalsFormed) return '#f0f0e0';
		if (state.dryingDone) return '#ffffff';
		return '#f8f8f0';
	}
</script>

<svelte:head>
	<title>Organic Synthesis: Aspirin - AfriLab</title>
</svelte:head>

<!-- Ambient background -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-emerald-500/10 to-transparent rounded-full blur-3xl"></div>
	<div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-r from-teal-500/10 to-transparent rounded-full blur-3xl"></div>
</div>

<div class="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
	<!-- Header -->
	<div class="flex items-center justify-between mb-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
		<div>
			<div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
				<a href="/dashboard" class="hover:text-emerald-400 transition-colors">Dashboard</a>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
				<a href="/labs/chemistry" class="hover:text-emerald-400 transition-colors">Chemistry</a>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
				<span class="text-emerald-400">Aspirin Synthesis</span>
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
			message="Acetic anhydride is corrosive and a lachrymator. Work in a fume hood. Wear safety goggles, gloves, and lab coat at all times."
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
					<div class="w-1.5 h-5 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
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

			<!-- Flask Visualization -->
			<div class="glass-strong rounded-2xl p-6 border border-white/10">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-1.5 h-5 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
					<h3 class="font-display font-semibold text-white">Reaction Flask</h3>
					<span class="ml-auto text-xs px-3 py-1 rounded-lg font-medium
						{state.step === 'complete' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
						: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'}">
						{state.step.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
					</span>
				</div>

				<div class="flex justify-center mb-6">
					<svg viewBox="0 0 300 280" class="w-full max-w-[340px] h-auto">
						<!-- Flask body (Erlenmeyer) -->
						<path
							d="M110 60 L90 200 Q90 240 150 240 Q210 240 210 200 L190 60"
							fill={getFlaskColor()}
							stroke="#9ca3af"
							stroke-width="2"
						/>
						<!-- Flask neck -->
						<rect x="110" y="30" width="80" height="35" rx="2" fill="#f8f8f8" stroke="#9ca3af" stroke-width="1.5" />

						<!-- Liquid fill -->
						{#if state.salicylicAcidMass > 0 || state.aceticAnhydrideVolume > 0}
							<path
								d="M95 180 Q90 220 150 220 Q210 220 205 180 Z"
								fill={state.reactionTemperature > 60 ? 'rgba(234, 179, 8, 0.4)' : state.crystalsFormed ? 'rgba(200, 200, 180, 0.6)' : 'rgba(220, 220, 200, 0.5)'}
							/>
						{/if}

						<!-- Crystals -->
						{#if state.crystalsFormed}
							{#each Array(12) as _, i}
								<rect
									x={120 + Math.random() * 60}
									y={195 + Math.random() * 20}
									width={3 + Math.random() * 4}
									height={2 + Math.random() * 3}
									fill="white"
									stroke="#d4d4d4"
									stroke-width="0.5"
									transform="rotate({Math.random() * 45}, {140 + i * 3}, {200})"
								/>
							{/each}
						{/if}

						<!-- Heating indicator -->
						{#if isHeating}
							<ellipse cx="150" cy="255" rx="60" ry="8" fill="rgba(239, 68, 68, 0.3)" />
							{#each [0, 1, 2] as flame}
								<path
									d="M{130 + flame * 20} 248 Q{130 + flame * 20} 235 {135 + flame * 20} 230 Q{140 + flame * 20} 240 {140 + flame * 20} 248"
									fill="rgba(251, 146, 60, 0.7)"
									class="animate-pulse"
								/>
							{/each}
						{/if}

						<!-- Thermometer -->
						{#if state.step === 'heat-reaction'}
							<rect x="155" y="40" width="6" height="150" rx="3" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1" />
							<rect
								x="156" y={190 - Math.min(140, (state.reactionTemperature / 100) * 140)}
								width="4"
								height={Math.min(140, (state.reactionTemperature / 100) * 140)}
								rx="2"
								fill={tempInRange ? '#ef4444' : '#f97316'}
							/>
							<text x="170" y="55" fill="#ffffff" font-size="11" font-weight="bold">{state.reactionTemperature.toFixed(0)}\u00B0C</text>
						{/if}

						<!-- Reaction equation -->
						<text x="150" y="275" fill="#9ca3af" font-size="9" text-anchor="middle">
							C&#x2087;H&#x2086;O&#x2083; + C&#x2084;H&#x2086;O&#x2083; &#x2192; C&#x2089;H&#x2088;O&#x2084; + CH&#x2083;COOH
						</text>
					</svg>
				</div>

				<!-- Heating progress bar -->
				{#if state.step === 'heat-reaction'}
					<div class="mb-4">
						<div class="flex justify-between text-xs mb-1">
							<span class="text-gray-400">Reaction progress</span>
							<span class="text-white font-mono">{heatingProgress.toFixed(0)}%</span>
						</div>
						<div class="h-2 bg-white/5 rounded-full overflow-hidden">
							<div
								class="h-full rounded-full transition-all {tempInRange ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-amber-500'}"
								style="width: {heatingProgress}%"
							></div>
						</div>
						{#if !tempInRange && isHeating}
							<p class="text-xs text-amber-400 mt-1">Temperature not in optimal range (75-85 C)</p>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Step-Specific Controls -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-1.5 h-5 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
					<h3 class="font-display font-semibold text-white">Actions</h3>
				</div>

				{#if state.step === 'weigh-reagents'}
					<div class="space-y-4">
						<div>
							<label class="text-xs text-gray-400 mb-1 block">Salicylic Acid Mass (g)</label>
							<div class="flex gap-2">
								<input
									type="range" min="0.5" max="5.0" step="0.1"
									bind:value={saWeighValue}
									class="flex-1 h-2 appearance-none bg-white/5 rounded-full cursor-pointer
										[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer"
								/>
								<span class="text-white font-mono text-sm w-12 text-right">{saWeighValue.toFixed(1)}g</span>
							</div>
							<button onclick={handleWeigh} class="mt-2 btn-secondary text-sm w-full" disabled={state.salicylicAcidMass > 0}>
								{state.salicylicAcidMass > 0 ? `Weighed: ${state.salicylicAcidMass.toFixed(2)} g` : 'Weigh Salicylic Acid'}
							</button>
						</div>
						<div>
							<label class="text-xs text-gray-400 mb-1 block">Acetic Anhydride Volume (mL)</label>
							<div class="flex gap-2">
								<input
									type="range" min="1.0" max="10.0" step="0.5"
									bind:value={aaVolumeValue}
									class="flex-1 h-2 appearance-none bg-white/5 rounded-full cursor-pointer
										[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer"
								/>
								<span class="text-white font-mono text-sm w-14 text-right">{aaVolumeValue.toFixed(1)}mL</span>
							</div>
							<button onclick={handleAddAnhydride} class="mt-2 btn-secondary text-sm w-full" disabled={state.aceticAnhydrideVolume > 0}>
								{state.aceticAnhydrideVolume > 0 ? `Added: ${state.aceticAnhydrideVolume.toFixed(1)} mL` : 'Add Acetic Anhydride'}
							</button>
						</div>
					</div>

				{:else if state.step === 'mix-reagents'}
					<div class="space-y-3">
						<button onclick={handleAddCatalyst} class="btn-secondary text-sm w-full" disabled={state.catalystAdded}>
							{state.catalystAdded ? 'Catalyst Added' : 'Add Phosphoric Acid (5 drops)'}
						</button>
						<button onclick={handleStartMixing} class="btn-primary text-sm w-full" disabled={state.salicylicAcidMass <= 0 || state.aceticAnhydrideVolume <= 0}>
							Mix Reagents & Proceed to Heating
						</button>
					</div>

				{:else if state.step === 'heat-reaction'}
					<div class="space-y-4">
						<div>
							<label class="text-xs text-gray-400 mb-1 block">Water Bath Temperature (\u00B0C)</label>
							<div class="flex gap-2">
								<input
									type="range" min="40" max="100" step="1"
									bind:value={heatTemp}
									class="flex-1 h-2 appearance-none bg-white/5 rounded-full cursor-pointer
										[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer"
								/>
								<span class="text-white font-mono text-sm w-14 text-right">{heatTemp}\u00B0C</span>
							</div>
						</div>
						<div class="flex gap-2">
							<button onclick={handleStartHeating} class="btn-primary text-sm flex-1" disabled={isHeating || state.reactionComplete}>
								{isHeating ? 'Heating...' : state.reactionComplete ? 'Reaction Complete' : 'Start Heating'}
							</button>
							{#if isHeating}
								<button onclick={handleStopHeating} class="btn-secondary text-sm">Stop</button>
							{/if}
						</div>
						{#if state.reactionComplete}
							<button onclick={handleCoolAndCrystallize} class="btn-primary text-sm w-full">
								Cool & Add Water to Crystallize
							</button>
						{/if}
					</div>

				{:else if state.step === 'cool-and-crystallize'}
					<div class="space-y-3">
						<p class="text-sm text-gray-300">Crystals have formed! Crude product: <span class="text-white font-mono">{state.productMass.toFixed(3)} g</span></p>
						<button onclick={handleFilter} class="btn-primary text-sm w-full">Vacuum Filter</button>
					</div>

				{:else if state.step === 'filter'}
					<button onclick={handleWash} class="btn-primary text-sm w-full">Wash with Cold Water</button>

				{:else if state.step === 'wash'}
					<button onclick={handleRecrystallize} class="btn-primary text-sm w-full">Recrystallize from Ethanol/Water</button>

				{:else if state.step === 'recrystallize'}
					<div class="space-y-3">
						<p class="text-sm text-gray-300">Purified product: <span class="text-white font-mono">{state.purifiedMass.toFixed(3)} g</span></p>
						<button onclick={handleDry} class="btn-primary text-sm w-full">Dry Product</button>
					</div>

				{:else if state.step === 'dry'}
					<div class="space-y-3">
						<p class="text-sm text-emerald-400">Percent yield: <span class="font-mono font-bold">{state.percentYield.toFixed(1)}%</span></p>
						<button onclick={handleMeltingPoint} class="btn-primary text-sm w-full">Perform Melting Point Test</button>
					</div>

				{:else if state.step === 'melting-point'}
					<div class="space-y-3">
						<p class="text-sm text-gray-300">
							Melting point: <span class="text-white font-mono">{state.meltingPointStart.toFixed(1)}-{state.meltingPointEnd.toFixed(1)} \u00B0C</span>
							<span class="text-gray-500 text-xs">(Literature: 135 \u00B0C)</span>
						</p>
						<button onclick={handleFeCl3Test} class="btn-primary text-sm w-full">Perform FeCl&#x2083; Test</button>
					</div>

				{:else if state.step === 'purity-test'}
					<div class="space-y-3">
						<div class="flex items-center gap-3">
							<div class="w-6 h-6 rounded-full {state.ferricChlorideTest === 'negative' ? 'bg-amber-100' : 'bg-purple-600'}"></div>
							<p class="text-sm text-gray-300">
								FeCl&#x2083; test: <span class="font-bold {state.ferricChlorideTest === 'negative' ? 'text-emerald-400' : 'text-amber-400'}">
									{state.ferricChlorideTest === 'negative' ? 'Negative (Pure)' : 'Positive (Impure)'}
								</span>
							</p>
						</div>
						<p class="text-xs text-gray-400">{state.purityAssessment}</p>
					</div>
				{/if}
			</div>

			<!-- Results Panel -->
			{#if showResults}
				<div class="glass-strong rounded-2xl p-6 border border-white/10 animate-fade-in-up">
					<div class="flex items-center gap-3 mb-6">
						<div class="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full"></div>
						<h3 class="text-xl font-display font-semibold text-white">Synthesis Results</h3>
					</div>

					<div class="grid grid-cols-2 gap-4 mb-6">
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400 mb-1">Theoretical Yield</p>
							<p class="text-2xl font-display font-bold text-white">{analysis.theoreticalYield.toFixed(3)} g</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400 mb-1">Actual Yield</p>
							<p class="text-2xl font-display font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{analysis.actualYield.toFixed(3)} g</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400 mb-1">Percent Yield</p>
							<p class="text-2xl font-display font-bold text-white">{analysis.percentYield.toFixed(1)}%</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400 mb-1">Purity</p>
							<p class="text-lg font-display font-bold text-white">{analysis.purity}</p>
						</div>
					</div>

					<div class="glass rounded-xl p-4 border border-white/5 mb-4">
						<p class="text-sm text-gray-400 mb-1">Limiting Reagent</p>
						<p class="text-white">{analysis.limitingReagent}</p>
					</div>

					<div class="glass rounded-xl p-4 border border-emerald-500/20 mb-6">
						<div class="flex items-center justify-between mb-3">
							<span class="text-sm font-medium text-gray-300">Score</span>
							<span class="text-lg font-display font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{analysis.score}%</span>
						</div>
						<div class="h-2 bg-white/5 rounded-full overflow-hidden">
							<div class="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all rounded-full" style="width: {analysis.score}%"></div>
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
			<!-- Reaction Info -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-1.5 h-5 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
					<h4 class="text-sm font-display font-semibold text-white">Reaction Info</h4>
				</div>
				<div class="space-y-3 text-xs">
					<div class="glass rounded-lg p-3 border border-white/5">
						<p class="text-gray-400 mb-1">Reactants</p>
						<p class="text-white">Salicylic acid (C&#x2087;H&#x2086;O&#x2083;)</p>
						<p class="text-white">+ Acetic anhydride (C&#x2084;H&#x2086;O&#x2083;)</p>
					</div>
					<div class="glass rounded-lg p-3 border border-white/5">
						<p class="text-gray-400 mb-1">Products</p>
						<p class="text-white">Aspirin (C&#x2089;H&#x2088;O&#x2084;)</p>
						<p class="text-white">+ Acetic acid (CH&#x2083;COOH)</p>
					</div>
					<div class="glass rounded-lg p-3 border border-white/5">
						<p class="text-gray-400 mb-1">Catalyst</p>
						<p class="text-white">Phosphoric acid (H&#x2083;PO&#x2084;)</p>
					</div>
				</div>
			</div>

			<!-- Quick Stats -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-1.5 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
					<h4 class="text-sm font-display font-semibold text-white">Progress</h4>
				</div>
				<div class="space-y-3 text-sm">
					<div class="flex justify-between items-center">
						<span class="text-gray-400">SA mass</span>
						<span class="font-medium text-white glass px-3 py-1 rounded-lg border border-white/5">{state.salicylicAcidMass > 0 ? state.salicylicAcidMass.toFixed(2) + ' g' : '--'}</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-gray-400">AA vol</span>
						<span class="font-medium text-white glass px-3 py-1 rounded-lg border border-white/5">{state.aceticAnhydrideVolume > 0 ? state.aceticAnhydrideVolume.toFixed(1) + ' mL' : '--'}</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-gray-400">Product</span>
						<span class="font-medium text-white glass px-3 py-1 rounded-lg border border-white/5">{state.purifiedMass > 0 ? state.purifiedMass.toFixed(3) + ' g' : state.productMass > 0 ? state.productMass.toFixed(3) + ' g' : '--'}</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-gray-400">Step</span>
						{#if state.dryingDone}
							<span class="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Purification done</span>
						{:else}
							<span class="px-3 py-1 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">In progress</span>
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
	<Certificate {certificateData} onClose={() => showCertificate = false} />
{/if}
