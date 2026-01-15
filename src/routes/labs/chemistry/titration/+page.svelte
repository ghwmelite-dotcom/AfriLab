<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { labStore } from '$stores/lab';
	import { aiStore } from '$stores/ai';

	import LabCanvas from '$components/lab/LabCanvas.svelte';
	import ControlPanel from '$components/lab/ControlPanel.svelte';
	import DataRecorder from '$components/lab/DataRecorder.svelte';
	import SafetyBanner from '$components/lab/SafetyBanner.svelte';
	import StepGuide from '$components/lab/StepGuide.svelte';
	import Burette from '$components/lab/chemistry/Burette.svelte';
	import Flask from '$components/lab/chemistry/Flask.svelte';
	import PHMeter from '$components/lab/chemistry/PHMeter.svelte';

	import {
		createInitialState,
		addDrop,
		analyzeTitration,
		type TitrationConfig
	} from '$lib/simulations/chemistry/titration';
	import type { TitrationState, Experiment, LabSession } from '$types';

	// Experiment configuration
	const config: TitrationConfig = {
		acid: {
			name: 'Hydrochloric Acid',
			formula: 'HCl',
			concentration: 0.1,
			volume: 25
		},
		base: {
			name: 'Sodium Hydroxide',
			formula: 'NaOH',
			concentration: 0.1,
			volume: 50
		},
		indicator: 'phenolphthalein'
	};

	const experiment: Experiment = {
		id: 'chem-titration-01',
		disciplineId: 'chem',
		title: 'Acid-Base Titration',
		description: 'Learn volumetric analysis by performing an acid-base titration.',
		difficulty: 'beginner',
		durationMinutes: 45,
		instructions: [
			{
				id: 1,
				title: 'Read Safety Guidelines',
				description: 'Review the safety precautions before starting the experiment.',
				hints: ['Always wear safety goggles', 'Handle chemicals with care']
			},
			{
				id: 2,
				title: 'Observe the Setup',
				description: 'The burette contains NaOH solution. The flask contains HCl with phenolphthalein indicator.',
				hints: ['The solution is currently colorless because it is acidic']
			},
			{
				id: 3,
				title: 'Record Initial Reading',
				description: 'Note the initial burette reading (should be 0.00 mL at the top).',
				hints: ['Read at the bottom of the meniscus']
			},
			{
				id: 4,
				title: 'Begin Titration',
				description: 'Slowly add NaOH by holding the stopcock. Watch for color changes.',
				hints: ['Add drops slowly near the endpoint', 'Swirl the flask gently']
			},
			{
				id: 5,
				title: 'Identify Endpoint',
				description: 'Stop when you see a persistent faint pink color. This is the endpoint.',
				hints: ['The pink color should persist for at least 30 seconds']
			},
			{
				id: 6,
				title: 'Record Final Volume',
				description: 'Note the final burette reading and calculate the volume used.',
				hints: ['Volume used = Final reading - Initial reading']
			}
		],
		simulationConfig: { type: 'titration', parameters: config },
		safetyNotes: 'Always add acid to base. Wear safety goggles and lab coat.',
		learningObjectives: [
			'Understand acid-base neutralization',
			'Learn proper titration technique',
			'Calculate unknown concentrations'
		]
	};

	// Simulation state
	let titrationState: TitrationState = createInitialState(config);
	let isPouring = false;
	let pourInterval: ReturnType<typeof setInterval> | null = null;
	let showResults = false;

	// Initialize lab session
	onMount(() => {
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

		// Set AI context
		aiStore.setContext({
			discipline: 'chemistry',
			experimentTitle: experiment.title,
			currentStep: 0,
			studentLevel: 'beginner',
			recentMeasurements: []
		});

		return () => {
			if (pourInterval) clearInterval(pourInterval);
		};
	});

	function startPour() {
		if (isPouring || titrationState.buretteVolume <= 0) return;

		isPouring = true;
		titrationState.isPouring = true;

		pourInterval = setInterval(() => {
			titrationState = addDrop(titrationState, 0.05, config.indicator);

			// Record measurement
			labStore.addMeasurement({
				type: 'pH',
				value: titrationState.pH,
				unit: '',
				label: `pH at ${(titrationState.buretteInitialVolume - titrationState.buretteVolume).toFixed(2)} mL`
			});

			// Check if endpoint reached
			if (titrationState.endpointReached && !showResults) {
				labStore.addAction('Endpoint reached', {
					volumeUsed: titrationState.buretteInitialVolume - titrationState.buretteVolume,
					pH: titrationState.pH
				});
			}

			if (titrationState.buretteVolume <= 0) {
				stopPour();
			}
		}, 100);
	}

	function stopPour() {
		isPouring = false;
		titrationState.isPouring = false;

		if (pourInterval) {
			clearInterval(pourInterval);
			pourInterval = null;
		}
	}

	function handleComplete() {
		const analysis = analyzeTitration(titrationState);
		showResults = true;

		// Update session with score
		labStore.addMeasurement({
			type: 'final_volume',
			value: analysis.volumeUsed,
			unit: 'mL',
			label: 'Final Volume Used'
		});
	}

	$: volumeUsed = titrationState.buretteInitialVolume - titrationState.buretteVolume;
	$: flaskVolume = config.acid.volume + volumeUsed;
	$: analysis = analyzeTitration(titrationState);
	$: measurements = titrationState.measurements.map((m, i) => ({
		type: 'pH',
		value: m.pH,
		unit: '',
		label: `Reading ${i + 1} (${m.volumeAdded.toFixed(2)} mL)`
	}));
</script>

<svelte:head>
	<title>Acid-Base Titration - AfriLab</title>
</svelte:head>

<div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<div>
			<div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
				<a href="/dashboard" class="hover:text-primary-600">Dashboard</a>
				<span>/</span>
				<a href="/dashboard/labs" class="hover:text-primary-600">Labs</a>
				<span>/</span>
				<span>Chemistry</span>
			</div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{experiment.title}</h1>
		</div>

		<button
			onclick={() => aiStore.open()}
			class="btn-secondary"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
			</svg>
			Ask AI Assistant
		</button>
	</div>

	<!-- Safety Banner -->
	<div class="mb-6">
		<SafetyBanner
			level="warning"
			message="Safety: Always add acid to water, never the reverse. Wear safety goggles and handle glassware carefully."
		/>
	</div>

	<!-- Main Layout -->
	<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
		<!-- Left Sidebar: Steps & Controls -->
		<div class="lg:col-span-1 space-y-6">
			<StepGuide
				steps={experiment.instructions}
				currentStepIndex={$labStore.currentStepIndex}
			/>
			<ControlPanel onComplete={handleComplete} />
		</div>

		<!-- Center: Lab Simulation -->
		<div class="lg:col-span-2">
			<LabCanvas className="min-h-[500px]">
				<div class="absolute inset-0 flex items-center justify-center gap-16 p-8">
					<!-- Burette -->
					<Burette
						volume={titrationState.buretteVolume}
						maxVolume={config.base.volume}
						isPouring={isPouring}
						onPour={startPour}
						onStopPour={stopPour}
					/>

					<!-- Flask -->
					<Flask
						volume={flaskVolume}
						color={titrationState.indicatorColor}
						pH={titrationState.pH}
						isReceiving={isPouring}
					/>
				</div>

				<!-- Endpoint notification -->
				{#if titrationState.endpointReached && !showResults}
					<div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
						Endpoint reached! The solution turned pink.
					</div>
				{/if}
			</LabCanvas>

			<!-- Results Panel -->
			{#if showResults}
				<div class="card p-6 mt-6">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
						Experiment Results
					</h3>

					<div class="grid grid-cols-2 gap-4 mb-4">
						<div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
							<p class="text-sm text-gray-500 dark:text-gray-400">Volume Used</p>
							<p class="text-2xl font-bold text-gray-900 dark:text-white">
								{analysis.volumeUsed.toFixed(2)} mL
							</p>
						</div>
						<div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
							<p class="text-sm text-gray-500 dark:text-gray-400">Expected Volume</p>
							<p class="text-2xl font-bold text-gray-900 dark:text-white">
								{analysis.equivalenceVolume.toFixed(2)} mL
							</p>
						</div>
					</div>

					<div class="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg mb-4">
						<div class="flex items-center justify-between mb-2">
							<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Accuracy</span>
							<span class="text-lg font-bold text-primary-600">{analysis.accuracy.toFixed(0)}%</span>
						</div>
						<div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
							<div
								class="h-full bg-primary-600 transition-all"
								style="width: {analysis.accuracy}%"
							></div>
						</div>
					</div>

					<p class="text-gray-600 dark:text-gray-400 mb-4">{analysis.feedback}</p>

					<div class="flex gap-3">
						<button
							onclick={() => {
								titrationState = createInitialState(config);
								showResults = false;
								labStore.reset();
							}}
							class="btn-secondary flex-1"
						>
							Try Again
						</button>
						<a href="/dashboard" class="btn-primary flex-1 text-center">
							Back to Dashboard
						</a>
					</div>
				</div>
			{/if}
		</div>

		<!-- Right Sidebar: Data & pH -->
		<div class="lg:col-span-1 space-y-6">
			<PHMeter pH={titrationState.pH} />
			<DataRecorder {measurements} />

			<!-- Quick Stats -->
			<div class="card p-4 space-y-3">
				<h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Stats</h4>
				<div class="space-y-2 text-sm">
					<div class="flex justify-between">
						<span class="text-gray-500 dark:text-gray-400">Drops added</span>
						<span class="font-medium text-gray-900 dark:text-white">{titrationState.dropCount}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-500 dark:text-gray-400">Volume added</span>
						<span class="font-medium text-gray-900 dark:text-white">{volumeUsed.toFixed(2)} mL</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-500 dark:text-gray-400">Status</span>
						<span class="font-medium {titrationState.endpointReached ? 'text-green-600' : 'text-amber-600'}">
							{titrationState.endpointReached ? 'Endpoint reached' : 'In progress'}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
