<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { beforeNavigate } from '$app/navigation';
	import { labStore } from '$stores/lab';
	import { aiStore } from '$stores/ai';
	import { labProgressStore, type SavedLabProgress } from '$stores/labProgress';

	import LabCanvas from '$components/lab/LabCanvas.svelte';
	import ControlPanel from '$components/lab/ControlPanel.svelte';
	import DataRecorder from '$components/lab/DataRecorder.svelte';
	import SafetyBanner from '$components/lab/SafetyBanner.svelte';
	import StepGuide from '$components/lab/StepGuide.svelte';
	import HintButton from '$components/ai/HintButton.svelte';
	import Burette from '$components/lab/chemistry/Burette.svelte';
	import Flask from '$components/lab/chemistry/Flask.svelte';
	import PHMeter from '$components/lab/chemistry/PHMeter.svelte';
	import SaveProgressButton from '$components/lab/SaveProgressButton.svelte';
	import ResumeLabDialog from '$components/lab/ResumeLabDialog.svelte';

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
	let titrationState: TitrationState = $state(createInitialState(config));
	let isPouring = $state(false);
	let pourInterval: ReturnType<typeof setInterval> | null = null;
	let showResults = $state(false);
	let mounted = $state(false);
	let hasRestoredProgress = $state(false);

	// Auto-save on navigation away
	beforeNavigate(() => {
		if (!showResults && mounted && titrationState.dropCount > 0) {
			autoSaveProgress();
		}
	});

	function autoSaveProgress() {
		labProgressStore.saveProgress(
			experiment.id,
			experiment.title,
			'chemistry',
			$labStore.currentStepIndex,
			experiment.instructions.length,
			titrationState,
			measurements,
			$labStore.notes
		);
	}

	function handleResume(savedProgress: SavedLabProgress) {
		hasRestoredProgress = true;
		const restoredState = savedProgress.simulationState as TitrationState;
		titrationState = restoredState;
		labStore.goToStep(savedProgress.currentStep);
	}

	function handleStartFresh() {
		hasRestoredProgress = true;
		titrationState = createInitialState(config);
	}

	// Initialize lab session
	onMount(() => {
		mounted = true;
		labProgressStore.init();

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

		// Auto-save every 30 seconds
		const autoSaveInterval = setInterval(() => {
			if (!showResults && titrationState.dropCount > 0) {
				autoSaveProgress();
			}
		}, 30000);

		return () => {
			if (pourInterval) clearInterval(pourInterval);
			clearInterval(autoSaveInterval);
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

		// Clear saved progress on completion
		labProgressStore.deleteProgress(experiment.id);

		// Update session with score
		labStore.addMeasurement({
			type: 'final_volume',
			value: analysis.volumeUsed,
			unit: 'mL',
			label: 'Final Volume Used'
		});
	}

	let volumeUsed = $derived(titrationState.buretteInitialVolume - titrationState.buretteVolume);
	let flaskVolume = $derived(config.acid.volume + volumeUsed);
	let analysis = $derived(analyzeTitration(titrationState));
	let measurements = $derived(titrationState.measurements.map((m, i) => ({
		type: 'pH',
		value: m.pH,
		unit: '',
		label: `Reading ${i + 1} (${m.volumeAdded.toFixed(2)} mL)`
	})));
</script>

<svelte:head>
	<title>Acid-Base Titration - AfriLab</title>
</svelte:head>

<!-- Ambient background -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-cyan-500/10 to-transparent rounded-full blur-3xl"></div>
	<div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/10 to-transparent rounded-full blur-3xl"></div>
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
				<a href="/dashboard/labs" class="hover:text-emerald-400 transition-colors">Labs</a>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
				<span class="text-emerald-400">Chemistry</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-display font-bold text-white">{experiment.title}</h1>
		</div>

		<div class="flex items-center gap-3">
			{#if !showResults}
				<SaveProgressButton
					labId={experiment.id}
					labTitle={experiment.title}
					discipline="chemistry"
					currentStep={$labStore.currentStepIndex}
					totalSteps={experiment.instructions.length}
					simulationState={titrationState}
					{measurements}
					notes={$labStore.notes}
				/>
			{/if}

			<button
				onclick={() => aiStore.open()}
				class="btn-primary"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
				</svg>
				Ask AI Assistant
			</button>
		</div>
	</div>

	<!-- Safety Banner -->
	<div class="mb-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.1s;">
		<SafetyBanner
			level="warning"
			message="Safety: Always add acid to water, never the reverse. Wear safety goggles and handle glassware carefully."
		/>
	</div>

	<!-- Main Layout -->
	<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
		<!-- Left Sidebar: Steps & Controls -->
		<div class="lg:col-span-1 space-y-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.15s;">
			<StepGuide
				steps={experiment.instructions}
				currentStepIndex={$labStore.currentStepIndex}
			/>

			<!-- AI Hint System -->
			<div class="glass rounded-2xl p-4 border border-white/5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-1.5 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
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
		<div class="lg:col-span-2 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">
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
					<div class="absolute bottom-4 left-1/2 -translate-x-1/2">
						<div class="glass-strong rounded-xl px-6 py-3 border border-emerald-500/30 flex items-center gap-3 animate-bounce">
							<div class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
							<span class="text-emerald-400 font-medium">Endpoint reached! The solution turned pink.</span>
						</div>
					</div>
				{/if}
			</LabCanvas>

			<!-- Results Panel -->
			{#if showResults}
				<div class="glass-strong rounded-2xl p-6 mt-6 border border-white/10 animate-fade-in-up">
					<div class="flex items-center gap-3 mb-6">
						<div class="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full"></div>
						<h3 class="text-xl font-display font-semibold text-white">
							Experiment Results
						</h3>
					</div>

					<div class="grid grid-cols-2 gap-4 mb-6">
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400 mb-1">Volume Used</p>
							<p class="text-2xl font-display font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
								{analysis.volumeUsed.toFixed(2)} mL
							</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400 mb-1">Expected Volume</p>
							<p class="text-2xl font-display font-bold text-white">
								{analysis.equivalenceVolume.toFixed(2)} mL
							</p>
						</div>
					</div>

					<div class="glass rounded-xl p-4 border border-emerald-500/20 mb-6">
						<div class="flex items-center justify-between mb-3">
							<span class="text-sm font-medium text-gray-300">Accuracy</span>
							<span class="text-lg font-display font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
								{analysis.accuracy.toFixed(0)}%
							</span>
						</div>
						<div class="h-2 bg-white/5 rounded-full overflow-hidden">
							<div
								class="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all rounded-full"
								style="width: {analysis.accuracy}%"
							></div>
						</div>
					</div>

					<p class="text-gray-400 mb-6">{analysis.feedback}</p>

					<div class="flex gap-3">
						<button
							onclick={() => {
								titrationState = createInitialState(config);
								showResults = false;
								labStore.reset();
							}}
							class="btn-secondary flex-1"
						>
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

		<!-- Right Sidebar: Data & pH -->
		<div class="lg:col-span-1 space-y-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.25s;">
			<PHMeter pH={titrationState.pH} />
			<DataRecorder {measurements} />

			<!-- Quick Stats -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-1.5 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
					<h4 class="text-sm font-display font-semibold text-white">Quick Stats</h4>
				</div>
				<div class="space-y-3 text-sm">
					<div class="flex justify-between items-center">
						<span class="text-gray-400">Drops added</span>
						<span class="font-medium text-white glass px-3 py-1 rounded-lg border border-white/5">{titrationState.dropCount}</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-gray-400">Volume added</span>
						<span class="font-medium text-white glass px-3 py-1 rounded-lg border border-white/5">{volumeUsed.toFixed(2)} mL</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-gray-400">Status</span>
						{#if titrationState.endpointReached}
							<span class="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
								Endpoint reached
							</span>
						{:else}
							<span class="px-3 py-1 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
								In progress
							</span>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Resume Lab Dialog -->
{#if !hasRestoredProgress}
	<ResumeLabDialog
		labId={experiment.id}
		onResume={handleResume}
		onStartFresh={handleStartFresh}
	/>
{/if}
