<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { labStore } from '$lib/stores/lab';
	import { aiStore } from '$lib/stores/ai';
	import CircuitDiagram from '$lib/components/lab/physics/CircuitDiagram.svelte';
	import OhmsLawControls from '$lib/components/lab/physics/OhmsLawControls.svelte';
	import DataGraph from '$lib/components/lab/physics/DataGraph.svelte';
	import SafetyBanner from '$lib/components/lab/SafetyBanner.svelte';
	import LabTimer from '$lib/components/lab/LabTimer.svelte';
	import HintButton from '$lib/components/ai/HintButton.svelte';
	import ChatAssistant from '$lib/components/ai/ChatAssistant.svelte';
	import {
		createInitialState,
		setVoltage,
		selectResistor,
		togglePower,
		toggleSwitch,
		recordMeasurement,
		clearMeasurements,
		autoConnectCircuit,
		setExperimentMode,
		analyzeExperiment,
		type OhmsLawState
	} from '$lib/simulations/physics/ohms-law';

	let { data } = $props();

	// Lab state
	let state = $state<OhmsLawState>(createInitialState({ defaultVoltage: 6, defaultResistance: 100 }));
	let isLabStarted = $state(false);
	let isLabComplete = $state(false);
	let showResults = $state(false);
	let activeTab = $state<'circuit' | 'graph'>('circuit');

	// Derived state
	let analysis = $derived(analyzeExperiment(state));
	let dataProgress = $derived(() => {
		const minPoints = 5;
		return Math.min(100, (state.measurements.length / minPoints) * 100);
	});

	// Start the lab session
	function startLab() {
		isLabStarted = true;
		labStore.startSession('ohms-law', 'physics');
		aiStore.setContext({
			labType: 'ohms-law',
			discipline: 'physics',
			currentStep: 'circuit-setup',
			objectives: [
				"Verify Ohm's Law (V = IR)",
				'Collect voltage and current measurements',
				'Analyze the V-I relationship graphically'
			]
		});
	}

	// Event handlers
	function handleSetVoltage(voltage: number) {
		state = setVoltage(state, voltage);
	}

	function handleSelectResistor(resistorId: string) {
		state = selectResistor(state, resistorId);
		labStore.addAction('select-resistor', { resistorId });
	}

	function handleTogglePower() {
		state = togglePower(state);
		if (state.isPowerOn) {
			aiStore.setContext({
				...aiStore.context,
				currentStep: 'taking-measurements'
			});
		}
	}

	function handleToggleSwitch() {
		state = toggleSwitch(state);
	}

	function handleRecordMeasurement() {
		state = recordMeasurement(state);
		labStore.addAction('record-measurement', {
			voltage: state.voltmeterReading,
			current: state.ammeterReading
		});

		if (state.measurements.length >= 5) {
			aiStore.setContext({
				...aiStore.context,
				currentStep: 'analyzing-data'
			});
		}
	}

	function handleClearMeasurements() {
		state = clearMeasurements(state);
	}

	function handleAutoConnect() {
		state = autoConnectCircuit(state);
		aiStore.setContext({
			...aiStore.context,
			currentStep: 'circuit-connected'
		});
	}

	function handleSetMode(mode: 'vary-voltage' | 'vary-resistance') {
		state = setExperimentMode(state, mode);
	}

	function completeLab() {
		isLabComplete = true;
		showResults = true;
		labStore.endSession({
			score: analysis.score,
			measurementCount: state.measurements.length,
			linearityR2: analysis.linearityR2,
			isVerified: analysis.isOhmsLawVerified
		});
	}

	function resetLab() {
		state = createInitialState({ defaultVoltage: 6, defaultResistance: 100 });
		isLabComplete = false;
		showResults = false;
		activeTab = 'circuit';
	}

	onMount(() => {
		return () => {
			if (isLabStarted && !isLabComplete) {
				labStore.endSession({ abandoned: true });
			}
		};
	});
</script>

<svelte:head>
	<title>Ohm's Law Lab | AfriLab</title>
</svelte:head>

<div class="min-h-screen bg-gray-950 text-white">
	<!-- Safety Banner -->
	<SafetyBanner
		labType="physics"
		rules={[
			'Never exceed the maximum voltage rating of components',
			'Always start with the power supply off when making connections',
			'Double-check circuit connections before applying power',
			'Keep the circuit switch open when changing resistors',
			'Report any unusual heating or sparks immediately'
		]}
	/>

	<!-- Header -->
	<header class="border-b border-white/10 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-40">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<div class="flex items-center gap-4">
					<button
						onclick={() => goto('/dashboard/labs')}
						class="p-2 rounded-lg glass border border-white/10 hover:border-white/20 transition-colors"
						aria-label="Back to labs"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							/>
						</svg>
					</button>

					<div>
						<h1 class="text-lg font-display font-bold text-white">Ohm's Law Verification</h1>
						<p class="text-xs text-gray-400">Physics - Electrical Circuits</p>
					</div>
				</div>

				<div class="flex items-center gap-4">
					{#if isLabStarted}
						<LabTimer />
					{/if}
					<HintButton context="ohms-law" />
				</div>
			</div>
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if !isLabStarted}
			<!-- Pre-lab introduction -->
			<div class="max-w-2xl mx-auto">
				<div class="glass-strong rounded-2xl p-8 border border-white/10 text-center">
					<div
						class="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6"
					>
						<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
					</div>

					<h2 class="text-2xl font-display font-bold text-white mb-3">
						Ohm's Law Verification Lab
					</h2>

					<p class="text-gray-400 mb-6">
						In this virtual lab, you'll verify Ohm's Law by measuring the relationship between
						voltage and current in a simple resistive circuit.
					</p>

					<!-- Ohm's Law equation -->
					<div class="inline-flex items-center gap-4 px-6 py-4 rounded-xl glass border border-white/10 mb-8">
						<span class="text-gray-400">Ohm's Law:</span>
						<span class="font-mono text-2xl">
							<span class="text-amber-400">V</span>
							<span class="text-gray-500">=</span>
							<span class="text-cyan-400">I</span>
							<span class="text-gray-500">×</span>
							<span class="text-emerald-400">R</span>
						</span>
					</div>

					<div class="grid grid-cols-2 gap-4 mb-8 text-left">
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-amber-400">1.</span> Build the Circuit
							</h3>
							<p class="text-sm text-gray-400">
								Connect the power supply, ammeter, and resistor in series. Add a voltmeter in parallel.
							</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-amber-400">2.</span> Take Measurements
							</h3>
							<p class="text-sm text-gray-400">
								Vary the voltage and record current readings at each point.
							</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-amber-400">3.</span> Plot the Graph
							</h3>
							<p class="text-sm text-gray-400">
								Create a V-I graph and verify the linear relationship.
							</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-amber-400">4.</span> Calculate Resistance
							</h3>
							<p class="text-sm text-gray-400">
								Determine resistance from the slope of your V-I graph.
							</p>
						</div>
					</div>

					<button
						onclick={startLab}
						class="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold
							hover:shadow-lg hover:shadow-amber-500/25 transition-all transform hover:scale-105"
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
						<div
							class="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4
							{analysis.grade === 'A'
								? 'bg-emerald-500/20 text-emerald-400'
								: analysis.grade === 'B'
									? 'bg-cyan-500/20 text-cyan-400'
									: analysis.grade === 'C'
										? 'bg-amber-500/20 text-amber-400'
										: 'bg-rose-500/20 text-rose-400'}"
						>
							<span class="text-4xl font-display font-bold">{analysis.grade}</span>
						</div>
						<h2 class="text-2xl font-display font-bold text-white">Lab Complete!</h2>
						<p class="text-gray-400 mt-2">Score: {analysis.score}/100</p>
					</div>

					<!-- Verification status -->
					<div class="mb-6 p-4 rounded-xl {analysis.isOhmsLawVerified ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-amber-500/10 border border-amber-500/30'}">
						<div class="flex items-center gap-3">
							{#if analysis.isOhmsLawVerified}
								<svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<span class="text-emerald-400 font-medium">Ohm's Law Verified!</span>
							{:else}
								<svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
								</svg>
								<span class="text-amber-400 font-medium">More data needed to verify</span>
							{/if}
						</div>
					</div>

					<!-- Stats -->
					<div class="grid grid-cols-3 gap-4 mb-8">
						<div class="glass rounded-xl p-4 text-center border border-white/10">
							<div class="text-2xl font-bold text-amber-400">{state.measurements.length}</div>
							<div class="text-xs text-gray-400">Data Points</div>
						</div>
						<div class="glass rounded-xl p-4 text-center border border-white/10">
							<div class="text-2xl font-bold text-cyan-400">{analysis.linearityR2.toFixed(3)}</div>
							<div class="text-xs text-gray-400">R² Value</div>
						</div>
						<div class="glass rounded-xl p-4 text-center border border-white/10">
							<div class="text-2xl font-bold text-emerald-400">{analysis.calculatedResistance.toFixed(0)}Ω</div>
							<div class="text-xs text-gray-400">Calculated R</div>
						</div>
					</div>

					<!-- Feedback -->
					<div class="glass rounded-xl p-4 border border-white/10 mb-6">
						<h3 class="font-semibold text-white mb-2">Feedback</h3>
						<p class="text-sm text-gray-400">{analysis.feedback}</p>
					</div>

					<!-- Actions -->
					<div class="flex gap-4">
						<button
							onclick={resetLab}
							class="flex-1 py-3 px-6 rounded-xl glass border border-white/10 hover:border-white/20
								text-white font-medium transition-all"
						>
							Try Again
						</button>
						<button
							onclick={() => goto('/dashboard/labs')}
							class="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500
								text-white font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all"
						>
							Back to Labs
						</button>
					</div>
				</div>
			</div>
		{:else}
			<!-- Active lab -->
			<div class="grid lg:grid-cols-[1fr,360px] gap-6">
				<!-- Main view area -->
				<div class="space-y-6">
					<!-- Tab navigation for mobile -->
					<div class="lg:hidden glass rounded-xl p-1 border border-white/10 flex">
						<button
							onclick={() => (activeTab = 'circuit')}
							class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
								{activeTab === 'circuit'
								? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-white'
								: 'text-gray-400 hover:text-white'}"
						>
							Circuit
						</button>
						<button
							onclick={() => (activeTab = 'graph')}
							class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
								{activeTab === 'graph'
								? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-white'
								: 'text-gray-400 hover:text-white'}"
						>
							Graph ({state.measurements.length})
						</button>
					</div>

					<!-- Circuit diagram -->
					<div class="{activeTab === 'circuit' ? '' : 'hidden lg:block'}">
						<CircuitDiagram
							{state}
							onToggleSwitch={handleToggleSwitch}
							onTogglePower={handleTogglePower}
						/>
					</div>

					<!-- Data graph -->
					<div class="{activeTab === 'graph' ? '' : 'hidden lg:block'}">
						<DataGraph {state} measurements={state.measurements} />
					</div>

					<!-- Progress bar -->
					<div class="glass rounded-xl p-4 border border-white/10">
						<div class="flex items-center justify-between mb-2">
							<span class="text-sm text-gray-400">Data Collection Progress</span>
							<span class="text-sm font-mono text-amber-400">{dataProgress()}%</span>
						</div>
						<div class="h-2 bg-gray-800 rounded-full overflow-hidden">
							<div
								class="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
								style="width: {dataProgress()}%"
							></div>
						</div>
						<div class="flex justify-between mt-2 text-xs text-gray-500">
							<span>{state.measurements.length} / 5 measurements (minimum)</span>
							{#if state.measurements.length >= 5}
								<span class="text-emerald-400">Ready to analyze!</span>
							{/if}
						</div>
					</div>
				</div>

				<!-- Control panel -->
				<div class="space-y-4">
					<OhmsLawControls
						labState={state}
						onSetVoltage={handleSetVoltage}
						onSelectResistor={handleSelectResistor}
						onTogglePower={handleTogglePower}
						onToggleSwitch={handleToggleSwitch}
						onRecordMeasurement={handleRecordMeasurement}
						onClearMeasurements={handleClearMeasurements}
						onAutoConnect={handleAutoConnect}
						onSetMode={handleSetMode}
					/>

					<!-- Complete lab button -->
					{#if state.measurements.length >= 3}
						<button
							onclick={completeLab}
							class="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500
								text-white font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all"
						>
							Complete Lab & Analyze
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</main>

	<!-- AI Chat Assistant -->
	<ChatAssistant />
</div>
