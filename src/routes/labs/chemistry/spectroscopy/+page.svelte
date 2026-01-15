<script lang="ts">
	import { onMount } from 'svelte';
	import { labStore } from '$stores/lab';
	import { aiStore } from '$stores/ai';

	import LabCanvas from '$components/lab/LabCanvas.svelte';
	import ControlPanel from '$components/lab/ControlPanel.svelte';
	import DataRecorder from '$components/lab/DataRecorder.svelte';
	import SafetyBanner from '$components/lab/SafetyBanner.svelte';
	import StepGuide from '$components/lab/StepGuide.svelte';
	import HintButton from '$components/ai/HintButton.svelte';

	import Cuvette from '$components/lab/chemistry/Cuvette.svelte';
	import SpectrophotometerDisplay from '$components/lab/chemistry/SpectrophotometerDisplay.svelte';
	import WavelengthSelector from '$components/lab/chemistry/WavelengthSelector.svelte';
	import CalibrationGraph from '$components/lab/chemistry/CalibrationGraph.svelte';

	import {
		createInitialState,
		setWavelength,
		setConcentration,
		toggleLamp,
		toggleSample,
		setBlank,
		recordMeasurement,
		addCalibrationPoint,
		analyzeResults,
		wavelengthToColor,
		SAMPLE_LIBRARY,
		type SpectroscopyConfig
	} from '$lib/simulations/chemistry/spectroscopy';
	import type { Experiment, LabSession } from '$types';

	// Experiment configuration
	const config: SpectroscopyConfig = {
		sample: SAMPLE_LIBRARY['potassium-permanganate'],
		pathLength: 1, // 1 cm standard cuvette
		concentrationRange: {
			min: 0.00001, // 0.01 mM
			max: 0.0005, // 0.5 mM
			step: 0.00005
		},
		wavelengthRange: {
			min: 380,
			max: 780
		}
	};

	const experiment: Experiment = {
		id: 'chem-spectroscopy-01',
		disciplineId: 'chem',
		title: 'UV-Vis Spectroscopy',
		description: 'Learn to use a spectrophotometer and create a calibration curve using Beer-Lambert law.',
		difficulty: 'intermediate',
		durationMinutes: 60,
		instructions: [
			{
				id: 1,
				title: 'Review Safety & Theory',
				description: 'Understand the Beer-Lambert law: A = εlc. Absorbance is proportional to concentration.',
				hints: ['A = Absorbance, ε = molar absorptivity, l = path length, c = concentration']
			},
			{
				id: 2,
				title: 'Turn On the Lamp',
				description: 'Power on the spectrophotometer lamp and let it warm up.',
				hints: ['The lamp needs to be on to generate the light beam']
			},
			{
				id: 3,
				title: 'Set the Wavelength',
				description: 'Adjust to the λmax (525 nm) for potassium permanganate.',
				hints: ['λmax is where the compound absorbs most strongly']
			},
			{
				id: 4,
				title: 'Zero with Blank',
				description: 'Insert a cuvette with distilled water and set the blank (zero).',
				hints: ['This sets the reference for 100% transmittance']
			},
			{
				id: 5,
				title: 'Measure Standards',
				description: 'Prepare different concentrations and measure their absorbance.',
				hints: ['Start with lowest concentration', 'Record each measurement']
			},
			{
				id: 6,
				title: 'Build Calibration Curve',
				description: 'Plot absorbance vs concentration. Calculate the slope (ε × l).',
				hints: ['A good R² should be > 0.99', 'Slope equals ε when path length is 1 cm']
			}
		],
		simulationConfig: { type: 'spectroscopy', parameters: config },
		safetyNotes: 'Handle cuvettes carefully. Do not touch optical surfaces.',
		learningObjectives: [
			'Understand Beer-Lambert law',
			'Learn spectrophotometer operation',
			'Create and interpret calibration curves',
			'Determine molar absorptivity'
		]
	};

	// Simulation state
	let state = $state(createInitialState(config));
	let showResults = $state(false);
	let mounted = $state(false);

	// Concentration presets for calibration
	const concentrationPresets = [
		{ value: 0.00005, label: '0.05 mM' },
		{ value: 0.0001, label: '0.10 mM' },
		{ value: 0.00015, label: '0.15 mM' },
		{ value: 0.0002, label: '0.20 mM' },
		{ value: 0.00025, label: '0.25 mM' },
		{ value: 0.0003, label: '0.30 mM' },
		{ value: 0.0004, label: '0.40 mM' },
		{ value: 0.0005, label: '0.50 mM' }
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
			data: {
				currentStep: 0,
				measurements: [],
				notes: [],
				actions: []
			},
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

	function handleToggleLamp() {
		state = toggleLamp(state);
		labStore.addAction(state.isLampOn ? 'Lamp turned on' : 'Lamp turned off', {});
	}

	function handleToggleSample() {
		state = toggleSample(state, config);
		labStore.addAction(state.isSampleInserted ? 'Sample inserted' : 'Sample removed', {
			concentration: state.concentration
		});
	}

	function handleSetBlank() {
		state = setBlank(state);
		labStore.addAction('Blank set', { wavelength: state.wavelength });
	}

	function handleWavelengthChange(wavelength: number) {
		state = setWavelength(state, wavelength, config);
	}

	function handleConcentrationChange(concentration: number) {
		state = setConcentration(state, concentration, config);
	}

	function handleRecordMeasurement() {
		state = recordMeasurement(state);
		if (state.measurements.length > 0) {
			const latest = state.measurements[state.measurements.length - 1];
			labStore.addMeasurement({
				type: 'absorbance',
				value: latest.absorbance,
				unit: '',
				label: `A at ${latest.wavelength}nm (${(latest.concentration * 1000).toFixed(2)}mM)`
			});
		}
	}

	function handleAddCalibrationPoint() {
		state = addCalibrationPoint(state);
		labStore.addAction('Calibration point added', {
			concentration: state.concentration,
			absorbance: state.absorbance
		});
	}

	function handleComplete() {
		showResults = true;
	}

	function handleReset() {
		state = createInitialState(config);
		showResults = false;
		labStore.reset();
	}

	let analysis = $derived(analyzeResults(state, config));
	let measurements = $derived(state.measurements.map((m, i) => ({
		type: 'absorbance',
		value: m.absorbance,
		unit: '',
		label: `Reading ${i + 1}: ${(m.concentration * 1000).toFixed(2)} mM`
	})));
</script>

<svelte:head>
	<title>UV-Vis Spectroscopy - AfriLab</title>
</svelte:head>

<!-- Ambient background -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div class="absolute top-0 left-1/3 w-[600px] h-[600px] bg-gradient-to-l from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
	<div class="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/10 to-transparent rounded-full blur-3xl"></div>
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
				<a href="/dashboard/labs" class="hover:text-cyan-400 transition-colors">Labs</a>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
				<span class="text-cyan-400">Spectroscopy</span>
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
			message="Handle cuvettes by the frosted sides only. Never touch the clear optical faces."
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

			<!-- AI Hint System -->
			<div class="glass rounded-2xl p-4 border border-white/5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-1.5 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
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
			<!-- Spectrophotometer Visual -->
			<LabCanvas className="min-h-[400px]">
				<div class="absolute inset-0 flex flex-col items-center justify-center p-8">
					<!-- Spectrophotometer body -->
					<div class="relative glass-strong rounded-2xl p-8 border border-white/10 w-full max-w-md">
						<!-- Light path visualization -->
						<div class="relative h-32 mb-6 flex items-center justify-center">
							<!-- Light source -->
							<div class="absolute left-0 flex flex-col items-center">
								<div
									class="w-12 h-12 rounded-full transition-all duration-300 {state.isLampOn
										? 'bg-yellow-400 shadow-lg shadow-yellow-400/50'
										: 'bg-gray-700'}"
									style={state.isLampOn ? `box-shadow: 0 0 30px ${wavelengthToColor(state.wavelength)}80;` : ''}
								>
									<div class="w-full h-full rounded-full {state.isLampOn ? 'animate-pulse' : ''}"></div>
								</div>
								<span class="text-xs text-gray-500 mt-2">Lamp</span>
							</div>

							<!-- Monochromator -->
							<div class="absolute left-20 flex flex-col items-center">
								<div
									class="w-8 h-16 rounded border-2 transition-colors duration-300"
									style="border-color: {state.isLampOn ? wavelengthToColor(state.wavelength) : 'rgb(75, 85, 99)'}; background: {state.isLampOn ? `${wavelengthToColor(state.wavelength)}20` : 'transparent'};"
								>
									<div class="w-full h-full flex items-center justify-center">
										<span class="text-xs font-mono text-gray-400 rotate-90">{state.wavelength}</span>
									</div>
								</div>
								<span class="text-xs text-gray-500 mt-2">λ</span>
							</div>

							<!-- Cuvette holder -->
							<div class="absolute left-1/2 -translate-x-1/2">
								<Cuvette
									sampleColor={state.sampleColor}
									isInserted={state.isSampleInserted}
									isReceivingLight={state.isLampOn && state.isBlankSet}
									transmittedIntensity={state.intensity}
								/>
							</div>

							<!-- Detector -->
							<div class="absolute right-0 flex flex-col items-center">
								<div
									class="w-10 h-10 rounded-lg border-2 transition-all duration-300"
									style="border-color: {state.isLampOn ? 'rgb(16, 185, 129)' : 'rgb(75, 85, 99)'};
										background: {state.isLampOn && state.isSampleInserted
											? `rgba(16, 185, 129, ${state.intensity / 100 * 0.5})`
											: state.isLampOn
											? 'rgba(16, 185, 129, 0.5)'
											: 'transparent'};"
								>
									{#if state.isLampOn}
										<div class="w-full h-full flex items-center justify-center">
											<span class="text-xs font-mono text-emerald-400">{state.transmittance.toFixed(0)}%</span>
										</div>
									{/if}
								</div>
								<span class="text-xs text-gray-500 mt-2">Detector</span>
							</div>
						</div>

						<!-- Control buttons -->
						<div class="grid grid-cols-3 gap-3">
							<button
								onclick={handleToggleLamp}
								class="p-3 rounded-xl text-sm font-medium transition-all
									{state.isLampOn
										? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
										: 'glass border border-white/10 text-gray-400 hover:text-white'}"
							>
								{state.isLampOn ? 'Lamp ON' : 'Lamp OFF'}
							</button>
							<button
								onclick={handleToggleSample}
								disabled={!state.isLampOn}
								class="p-3 rounded-xl text-sm font-medium transition-all
									{state.isSampleInserted
										? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
										: 'glass border border-white/10 text-gray-400 hover:text-white'}
									disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{state.isSampleInserted ? 'Remove' : 'Insert'}
							</button>
							<button
								onclick={handleSetBlank}
								disabled={!state.isLampOn || state.isSampleInserted}
								class="p-3 rounded-xl text-sm font-medium transition-all
									{state.isBlankSet
										? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
										: 'glass border border-white/10 text-gray-400 hover:text-white'}
									disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{state.isBlankSet ? 'Blank Set' : 'Set Blank'}
							</button>
						</div>
					</div>

					<!-- Sample info -->
					<div class="mt-6 text-center">
						<div class="inline-flex items-center gap-3 glass rounded-xl px-4 py-2 border border-white/5">
							<div
								class="w-4 h-4 rounded-full"
								style="background-color: {config.sample.color};"
							></div>
							<span class="text-sm text-gray-300">
								{config.sample.name} ({config.sample.formula})
							</span>
						</div>
					</div>
				</div>
			</LabCanvas>

			<!-- Concentration selector -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-1.5 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
					<h3 class="font-display font-semibold text-white">Sample Concentration</h3>
				</div>

				<div class="mb-4">
					<div class="flex justify-between text-sm mb-2">
						<span class="text-gray-400">Current</span>
						<span class="font-mono font-bold text-white">{(state.concentration * 1000).toFixed(2)} mM</span>
					</div>
					<input
						type="range"
						min={config.concentrationRange.min}
						max={config.concentrationRange.max}
						step={config.concentrationRange.step}
						value={state.concentration}
						oninput={(e) => handleConcentrationChange(parseFloat((e.target as HTMLInputElement).value))}
						class="w-full h-2 appearance-none bg-white/5 rounded-full cursor-pointer
							[&::-webkit-slider-thumb]:appearance-none
							[&::-webkit-slider-thumb]:w-5
							[&::-webkit-slider-thumb]:h-5
							[&::-webkit-slider-thumb]:rounded-full
							[&::-webkit-slider-thumb]:bg-purple-500
							[&::-webkit-slider-thumb]:border-2
							[&::-webkit-slider-thumb]:border-white
							[&::-webkit-slider-thumb]:shadow-lg
							[&::-webkit-slider-thumb]:cursor-pointer"
					/>
				</div>

				<!-- Quick presets -->
				<div class="flex flex-wrap gap-2">
					{#each concentrationPresets as preset}
						<button
							onclick={() => handleConcentrationChange(preset.value)}
							class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all
								{Math.abs(state.concentration - preset.value) < 0.00001
									? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
									: 'glass border border-white/5 text-gray-400 hover:text-white'}"
						>
							{preset.label}
						</button>
					{/each}
				</div>
			</div>

			<!-- Action buttons -->
			<div class="flex gap-3">
				<button
					onclick={handleRecordMeasurement}
					disabled={!state.isLampOn || !state.isSampleInserted || !state.isBlankSet}
					class="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					Record Reading
				</button>
				<button
					onclick={handleAddCalibrationPoint}
					disabled={!state.isLampOn || !state.isSampleInserted || !state.isBlankSet}
					class="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
					</svg>
					Add to Calibration
				</button>
			</div>

			<!-- Results Panel -->
			{#if showResults}
				<div class="glass-strong rounded-2xl p-6 border border-white/10 animate-fade-in-up">
					<div class="flex items-center gap-3 mb-6">
						<div class="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full"></div>
						<h3 class="text-xl font-display font-semibold text-white">Experiment Results</h3>
					</div>

					{#if state.calibrationCurve.length >= 2}
						<div class="grid grid-cols-2 gap-4 mb-6">
							<div class="glass rounded-xl p-4 border border-white/5">
								<p class="text-sm text-gray-400 mb-1">Experimental ε</p>
								<p class="text-2xl font-display font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
									{analysis.experimentalMolarAbsorptivity.toFixed(0)}
								</p>
								<p class="text-xs text-gray-500 mt-1">L/mol·cm</p>
							</div>
							<div class="glass rounded-xl p-4 border border-white/5">
								<p class="text-sm text-gray-400 mb-1">Literature ε</p>
								<p class="text-2xl font-display font-bold text-white">
									{analysis.theoreticalMolarAbsorptivity.toFixed(0)}
								</p>
								<p class="text-xs text-gray-500 mt-1">L/mol·cm</p>
							</div>
						</div>

						<div class="glass rounded-xl p-4 border border-amber-500/20 mb-6">
							<div class="flex items-center justify-between mb-3">
								<span class="text-sm font-medium text-gray-300">Percent Error</span>
								<span class="text-lg font-display font-bold {analysis.percentError <= 5 ? 'text-emerald-400' : analysis.percentError <= 10 ? 'text-amber-400' : 'text-rose-400'}">
									{analysis.percentError.toFixed(1)}%
								</span>
							</div>
						</div>
					{/if}

					<p class="text-gray-400 mb-6">{analysis.feedback}</p>

					<div class="flex gap-3">
						<button onclick={handleReset} class="btn-secondary flex-1">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							Try Again
						</button>
						<a href="/dashboard" class="btn-primary flex-1 text-center">
							Back to Dashboard
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>
						</a>
					</div>
				</div>
			{/if}
		</div>

		<!-- Right Sidebar -->
		<div class="lg:col-span-1 space-y-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.25s;">
			<SpectrophotometerDisplay
				absorbance={state.absorbance}
				transmittance={state.transmittance}
				wavelength={state.wavelength}
				isLampOn={state.isLampOn}
			/>

			<WavelengthSelector
				wavelength={state.wavelength}
				min={config.wavelengthRange.min}
				max={config.wavelengthRange.max}
				lambdaMax={config.sample.lambdaMax}
				onWavelengthChange={handleWavelengthChange}
				disabled={!state.isLampOn}
			/>

			<CalibrationGraph
				points={state.calibrationCurve}
				maxConcentration={config.concentrationRange.max}
			/>

			<DataRecorder {measurements} />
		</div>
	</div>
</div>
