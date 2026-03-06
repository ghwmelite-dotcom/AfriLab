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
		selectBatch,
		startDissolution,
		advanceDissolutionTime,
		sampleDissolution,
		completeDissolution,
		weighTablet,
		calculateAcceptanceValue,
		testHardness,
		startFriability,
		advanceFriability,
		completeFriability,
		addObservation,
		answerQuiz,
		analyzeQualityControl,
		BATCHES,
		USP_SPECS,
		QC_QUIZ,
		type QualityControlState
	} from '$lib/simulations/pharmacy/quality-control';

	// Lab state
	let state = $state<QualityControlState>(createInitialState({ batchId: 'batch-good' }));
	let isLabStarted = $state(false);
	let showResults = $state(false);
	let activeTest = $state<'dissolution' | 'content' | 'hardness' | 'friability'>('dissolution');

	// Derived
	let analysis = $derived(analyzeQualityControl(state));
	let progress = $derived(
		state.completedTests.length > 0 ? Math.round((state.completedTests.length / 4) * 100) : 0
	);

	function startLab() {
		isLabStarted = true;
		aiStore.setContext({
			labType: 'quality-control',
			discipline: 'pharmacy',
			currentStep: 'batch-selection',
			objectives: [
				'Perform dissolution testing per USP standards',
				'Conduct content uniformity testing',
				'Measure tablet hardness and friability',
				'Interpret results against USP specifications'
			]
		});
	}

	function handleSelectBatch(batchId: string) {
		state = selectBatch(state, batchId);
		labStore.addAction('select-batch', { batchId });
	}

	// Dissolution handlers
	function handleStartDissolution() {
		state = startDissolution(state);
	}
	function handleAdvanceTime(min: number) {
		state = advanceDissolutionTime(state, min);
	}
	function handleSample() {
		state = sampleDissolution(state);
		labStore.addAction('sample-dissolution', { time: state.dissolutionTest.currentTime });
	}
	function handleCompleteDissolution() {
		state = completeDissolution(state);
	}

	// Content uniformity handlers
	function handleWeighTablet(index: number) {
		state = weighTablet(state, index);
	}
	function handleCalculateAV() {
		state = calculateAcceptanceValue(state);
	}

	// Hardness handler
	function handleTestHardness(index: number) {
		state = testHardness(state, index);
	}

	// Friability handlers
	function handleStartFriability() {
		state = startFriability(state);
	}
	function handleAdvanceFriability() {
		state = advanceFriability(state, 25);
	}
	function handleCompleteFriability() {
		state = completeFriability(state);
	}

	function handleQuizAnswer(questionId: string, answer: string) {
		state = answerQuiz(state, questionId, answer);
	}

	function completeLab() {
		showResults = true;
	}

	function resetLab() {
		state = createInitialState({ batchId: 'batch-good' });
		isLabStarted = false;
		showResults = false;
		activeTest = 'dissolution';
	}

	onMount(() => {
		return () => {};
	});
</script>

<svelte:head>
	<title>Quality Control Testing Lab | AfriLab</title>
</svelte:head>

<div class="min-h-screen bg-gray-950 text-white">
	<SafetyBanner
		level="warning"
		message="Quality control testing must follow validated procedures. Record all observations accurately. Out-of-specification results require investigation before batch disposition."
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
						<h1 class="text-lg font-display font-bold text-white">Quality Control Testing Lab</h1>
						<p class="text-xs text-gray-400">Pharmacy - Pharmaceutical QC</p>
					</div>
				</div>
				<div class="flex items-center gap-4">
					<HintButton context="quality-control" />
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
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
						</svg>
					</div>

					<h2 class="text-2xl font-display font-bold text-white mb-3">
						Welcome to the Quality Control Testing Lab
					</h2>
					<p class="text-gray-400 mb-6">
						Perform pharmaceutical quality control tests on tablet batches. Test dissolution rates,
						content uniformity, hardness, and friability against USP specifications.
					</p>

					<div class="grid grid-cols-2 gap-4 mb-8 text-left">
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-rose-400">1.</span> Dissolution
							</h3>
							<p class="text-sm text-gray-400">Measure drug release over time in dissolution media.</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-rose-400">2.</span> Content Uniformity
							</h3>
							<p class="text-sm text-gray-400">Weigh tablets and assay individual unit content.</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-rose-400">3.</span> Hardness
							</h3>
							<p class="text-sm text-gray-400">Measure crushing strength of tablets.</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/10">
							<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
								<span class="text-rose-400">4.</span> Friability
							</h3>
							<p class="text-sm text-gray-400">Test resistance to abrasion and chipping.</p>
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

					<!-- Batch disposition -->
					<div class="mb-6 p-4 rounded-xl {analysis.batchDisposition === 'release'
						? 'bg-emerald-500/10 border border-emerald-500/30'
						: analysis.batchDisposition === 'reject'
							? 'bg-rose-500/10 border border-rose-500/30'
							: 'bg-amber-500/10 border border-amber-500/30'}">
						<div class="flex items-center justify-between">
							<span class="text-sm text-gray-300">Batch Disposition:</span>
							<span class="text-sm font-semibold capitalize {analysis.batchDisposition === 'release'
								? 'text-emerald-400'
								: analysis.batchDisposition === 'reject'
									? 'text-rose-400'
									: 'text-amber-400'}">
								{analysis.batchDisposition}
							</span>
						</div>
					</div>

					<!-- Test results -->
					<div class="grid grid-cols-2 gap-3 mb-6">
						{#each [
							{ key: 'dissolution', label: 'Dissolution' },
							{ key: 'contentUniformity', label: 'Content Uniformity' },
							{ key: 'hardness', label: 'Hardness' },
							{ key: 'friability', label: 'Friability' }
						] as test}
							{@const result = state.passFailResults[test.key]}
							<div class="glass rounded-xl p-3 border border-white/10 text-center">
								<div class="text-xs text-gray-400 mb-1">{test.label}</div>
								{#if result === null}
									<span class="text-sm text-gray-500">Not tested</span>
								{:else if result}
									<span class="text-sm font-semibold text-emerald-400">PASS</span>
								{:else}
									<span class="text-sm font-semibold text-rose-400">FAIL</span>
								{/if}
							</div>
						{/each}
					</div>

					<div class="glass rounded-xl p-4 border border-white/10 mb-6">
						<div class="flex items-center justify-between mb-2">
							<span class="text-sm text-gray-300">Quiz Score</span>
							<span class="text-sm font-mono text-rose-400">{analysis.quizScore.correct}/{analysis.quizScore.total}</span>
						</div>
					</div>

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
			<div class="space-y-6">
				<!-- Batch selector -->
				<div class="flex gap-3 overflow-x-auto pb-2">
					{#each BATCHES as batch}
						<button
							onclick={() => handleSelectBatch(batch.id)}
							class="flex-shrink-0 px-4 py-3 rounded-xl text-left transition-all min-w-[200px]
								{state.selectedBatch?.id === batch.id
								? 'glass-strong border-2 border-rose-500/50 bg-rose-500/10'
								: 'glass border border-white/10 hover:border-white/20'}"
						>
							<div class="text-sm font-medium text-white">{batch.batchNumber}</div>
							<div class="text-xs text-gray-400">{batch.description.slice(0, 50)}...</div>
						</button>
					{/each}
				</div>

				<!-- Test tabs -->
				<div class="flex gap-2">
					{#each [
						{ key: 'dissolution', label: 'Dissolution' },
						{ key: 'content', label: 'Content Uniformity' },
						{ key: 'hardness', label: 'Hardness' },
						{ key: 'friability', label: 'Friability' }
					] as tab}
						{@const testKey = tab.key === 'content' ? 'contentUniformity' : tab.key}
						{@const isComplete = state.completedTests.includes(testKey)}
						<button
							onclick={() => activeTest = tab.key}
							class="px-4 py-2 rounded-xl text-sm font-medium transition-all
								{activeTest === tab.key
								? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/25'
								: isComplete
									? 'glass border border-emerald-500/30 text-emerald-400'
									: 'glass border border-white/10 text-gray-400 hover:border-white/20'}"
						>
							{#if isComplete}
								<svg class="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
							{/if}
							{tab.label}
						</button>
					{/each}
				</div>

				<div class="grid lg:grid-cols-[1fr,360px] gap-6">
					<!-- Main test area -->
					<div class="space-y-6">
						{#if activeTest === 'dissolution'}
							<!-- Dissolution Test -->
							<div class="glass-strong rounded-2xl p-6 border border-white/10">
								<h4 class="text-sm font-display font-semibold text-white mb-4">Dissolution Testing (USP Apparatus 2 - Paddle)</h4>
								<div class="text-xs text-gray-400 mb-4">
									Medium: {state.dissolutionTest.medium} | Temp: {state.dissolutionTest.temperature}&deg;C | Speed: {state.dissolutionTest.rpm} RPM
								</div>

								{#if !state.dissolutionTest.isRunning && state.dissolutionTest.sampledPoints.length === 0}
									<button
										onclick={handleStartDissolution}
										class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold"
									>
										Start Dissolution Test
									</button>
								{:else}
									<!-- Time and controls -->
									<div class="flex items-center gap-4 mb-4">
										<span class="text-sm text-gray-300">Time: <span class="font-mono text-rose-400">{state.dissolutionTest.currentTime} min</span></span>
										{#if state.dissolutionTest.isRunning}
											<button onclick={() => handleAdvanceTime(5)} class="px-3 py-1 rounded-lg glass border border-white/10 text-xs text-gray-300 hover:border-white/20">+5 min</button>
											<button onclick={() => handleAdvanceTime(10)} class="px-3 py-1 rounded-lg glass border border-white/10 text-xs text-gray-300 hover:border-white/20">+10 min</button>
											<button onclick={() => handleAdvanceTime(15)} class="px-3 py-1 rounded-lg glass border border-white/10 text-xs text-gray-300 hover:border-white/20">+15 min</button>
											<button onclick={handleSample} class="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-xs text-rose-400 hover:bg-rose-500/30">Sample Now</button>
										{/if}
									</div>

									<!-- Vessel readings -->
									<div class="grid grid-cols-6 gap-2 mb-4">
										{#each state.dissolutionTest.vessels as vessel}
											<div class="glass rounded-lg p-2 border border-white/5 text-center">
												<div class="text-[10px] text-gray-500">V{vessel.id}</div>
												<div class="text-sm font-mono text-white">{vessel.percentDissolved.toFixed(1)}%</div>
											</div>
										{/each}
									</div>

									<!-- Dissolution curve SVG -->
									{#if state.dissolutionTest.sampledPoints.length > 0}
										<div class="glass rounded-xl p-4 border border-white/5">
											<svg viewBox="0 0 400 200" class="w-full h-auto">
												<!-- Axes -->
												<line x1="50" y1="10" x2="50" y2="170" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
												<line x1="50" y1="170" x2="380" y2="170" stroke="rgba(255,255,255,0.2)" stroke-width="1" />

												<!-- Q line -->
												{#if true}
												{@const qY = 170 - (USP_SPECS.dissolution.Q / 100) * 160}
												<line x1="50" y1={qY} x2="380" y2={qY} stroke="rgba(244, 63, 94, 0.5)" stroke-width="1" stroke-dasharray="4,4" />
												<text x="385" y={qY + 4} fill="rgba(244, 63, 94, 0.7)" font-size="8">Q={USP_SPECS.dissolution.Q}%</text>
												{/if}

												<!-- Y axis labels -->
												{#each [0, 25, 50, 75, 100] as val}
													{@const y = 170 - (val / 100) * 160}
													<text x="40" y={y + 3} text-anchor="end" fill="rgba(255,255,255,0.3)" font-size="8">{val}</text>
												{/each}

												<!-- X axis labels -->
												{#each [0, 15, 30, 45, 60] as val}
													{@const x = 50 + (val / 60) * 330}
													<text x={x} y="185" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="8">{val}</text>
												{/each}

												<!-- Axis titles -->
												<text x="215" y="198" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="8">Time (min)</text>
												<text x="12" y="95" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="8" transform="rotate(-90, 12, 95)">% Dissolved</text>

												<!-- Data line -->
												{#if state.dissolutionTest.sampledPoints.length > 1}
													<polyline
														fill="none"
														stroke="rgba(244, 63, 94, 0.8)"
														stroke-width="2"
														points={state.dissolutionTest.sampledPoints.map((p) => {
															const x = 50 + (p.time / 60) * 330;
															const y = 170 - (p.mean / 100) * 160;
															return `${x},${y}`;
														}).join(' ')}
													/>
												{/if}

												<!-- Data points -->
												{#each state.dissolutionTest.sampledPoints as point}
													{@const x = 50 + (point.time / 60) * 330}
													{@const y = 170 - (point.mean / 100) * 160}
													<circle cx={x} cy={y} r="3" fill="rgba(244, 63, 94, 1)" />
													<text x={x} y={y - 8} text-anchor="middle" fill="white" font-size="7">{point.mean.toFixed(0)}%</text>
												{/each}
											</svg>
										</div>
									{/if}

									{#if state.dissolutionTest.isRunning && state.dissolutionTest.currentTime >= 30}
										<button
											onclick={handleCompleteDissolution}
											class="mt-3 px-6 py-2 rounded-xl glass border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/10"
										>
											Complete Dissolution Test
										</button>
									{/if}
								{/if}
							</div>
						{:else if activeTest === 'content'}
							<!-- Content Uniformity -->
							<div class="glass-strong rounded-2xl p-6 border border-white/10">
								<h4 class="text-sm font-display font-semibold text-white mb-4">Content Uniformity Testing (USP &lt;905&gt;)</h4>
								<p class="text-xs text-gray-400 mb-4">Weigh each tablet and review the assay results. The acceptance value (AV) must not exceed {USP_SPECS.contentUniformity.acceptanceValueLimit}.</p>

								<!-- Tablet weights -->
								<div class="grid grid-cols-5 gap-2 mb-4">
									{#each state.contentUniformity.tablets as tablet, i}
										<button
											onclick={() => handleWeighTablet(i)}
											disabled={tablet.isWeighed}
											class="glass rounded-lg p-3 border text-center transition-all
												{tablet.isWeighed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 hover:border-white/20 cursor-pointer'}"
										>
											<div class="text-[10px] text-gray-500">Tablet {tablet.id}</div>
											{#if tablet.isWeighed}
												<div class="text-sm font-mono text-white">{tablet.weight.toFixed(1)}</div>
												<div class="text-[10px] text-gray-500">mg</div>
											{:else}
												<div class="text-sm text-gray-600">Weigh</div>
											{/if}
										</button>
									{/each}
								</div>

								<!-- Assay results -->
								{#if state.contentUniformity.tablets.every((t) => t.isWeighed)}
									<div class="glass rounded-xl p-4 border border-white/5 mb-4">
										<h5 class="text-xs font-semibold text-gray-300 mb-2">Assay Results (% of Label Claim)</h5>
										<div class="grid grid-cols-5 gap-2">
											{#each state.contentUniformity.assayResults as result, i}
												{@const isOutOfRange = result < USP_SPECS.contentUniformity.individualRange.min || result > USP_SPECS.contentUniformity.individualRange.max}
												<div class="text-center text-sm font-mono {isOutOfRange ? 'text-rose-400' : 'text-white'}">
													{result.toFixed(1)}%
												</div>
											{/each}
										</div>
									</div>

									{#if state.contentUniformity.acceptanceValue === null}
										<button
											onclick={handleCalculateAV}
											class="px-6 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold"
										>
											Calculate Acceptance Value
										</button>
									{:else}
										<div class="p-3 rounded-lg {state.contentUniformity.acceptanceValue <= USP_SPECS.contentUniformity.acceptanceValueLimit ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-rose-500/10 border border-rose-500/30'}">
											<span class="text-sm font-mono">AV = {state.contentUniformity.acceptanceValue}</span>
											<span class="text-xs ml-2 {state.contentUniformity.acceptanceValue <= USP_SPECS.contentUniformity.acceptanceValueLimit ? 'text-emerald-400' : 'text-rose-400'}">
												(Limit: {USP_SPECS.contentUniformity.acceptanceValueLimit})
												{state.contentUniformity.acceptanceValue <= USP_SPECS.contentUniformity.acceptanceValueLimit ? '- PASS' : '- FAIL'}
											</span>
										</div>
									{/if}
								{/if}
							</div>
						{:else if activeTest === 'hardness'}
							<!-- Hardness Testing -->
							<div class="glass-strong rounded-2xl p-6 border border-white/10">
								<h4 class="text-sm font-display font-semibold text-white mb-4">Tablet Hardness Testing</h4>
								<p class="text-xs text-gray-400 mb-4">
									Place each tablet in the hardness tester and record the crushing force. Typical range: {USP_SPECS.hardness.typicalRange.min}-{USP_SPECS.hardness.typicalRange.max} kP. Minimum: {USP_SPECS.hardness.minHardness} kP.
								</p>

								<div class="grid grid-cols-5 gap-2 mb-4">
									{#each state.hardnessTest.readings as reading, i}
										<button
											onclick={() => handleTestHardness(i)}
											disabled={reading.isTested}
											class="glass rounded-lg p-3 border text-center transition-all
												{reading.isTested
												? reading.hardness >= USP_SPECS.hardness.minHardness
													? 'border-emerald-500/30 bg-emerald-500/5'
													: 'border-rose-500/30 bg-rose-500/5'
												: 'border-white/10 hover:border-white/20 cursor-pointer'}"
										>
											<div class="text-[10px] text-gray-500">Tablet {reading.tabletId}</div>
											{#if reading.isTested}
												<div class="text-sm font-mono {reading.hardness >= USP_SPECS.hardness.minHardness ? 'text-white' : 'text-rose-400'}">{reading.hardness.toFixed(1)}</div>
												<div class="text-[10px] text-gray-500">kP</div>
											{:else}
												<div class="text-sm text-gray-600">Test</div>
											{/if}
										</button>
									{/each}
								</div>

								{#if state.hardnessTest.readings.every((r) => r.isTested)}
									{@const avgHardness = state.hardnessTest.readings.reduce((s, r) => s + r.hardness, 0) / state.hardnessTest.readings.length}
									<div class="p-3 rounded-lg {avgHardness >= USP_SPECS.hardness.minHardness ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-rose-500/10 border border-rose-500/30'}">
										<span class="text-sm font-mono">Mean Hardness: {avgHardness.toFixed(1)} kP</span>
										<span class="text-xs ml-2 {avgHardness >= USP_SPECS.hardness.minHardness ? 'text-emerald-400' : 'text-rose-400'}">
											{avgHardness >= USP_SPECS.hardness.minHardness ? 'PASS' : 'FAIL'}
										</span>
									</div>

									<!-- Hardness bar chart SVG -->
									<div class="mt-4">
										<svg viewBox="0 0 400 150" class="w-full h-auto">
											{#each state.hardnessTest.readings as reading, i}
												{@const barWidth = 30}
												{@const gap = (400 - 10 * barWidth) / 11}
												{@const x = gap + i * (barWidth + gap)}
												{@const maxH = 120}
												{@const barH = (reading.hardness / 20) * maxH}
												{@const y = 130 - barH}
												<rect
													{x} {y} width={barWidth} height={barH}
													fill={reading.hardness >= USP_SPECS.hardness.minHardness ? 'rgba(16, 185, 129, 0.5)' : 'rgba(244, 63, 94, 0.5)'}
													rx="3"
												/>
												<text x={x + barWidth / 2} y={y - 4} text-anchor="middle" fill="white" font-size="7">{reading.hardness.toFixed(1)}</text>
												<text x={x + barWidth / 2} y="145" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="7">T{reading.tabletId}</text>
											{/each}
											<!-- Min line -->
											{#if true}
											{@const minY = 130 - (USP_SPECS.hardness.minHardness / 20) * 120}
											<line x1="0" y1={minY} x2="400" y2={minY} stroke="rgba(244, 63, 94, 0.5)" stroke-width="1" stroke-dasharray="4,4" />
											<text x="395" y={minY - 4} text-anchor="end" fill="rgba(244, 63, 94, 0.7)" font-size="7">Min {USP_SPECS.hardness.minHardness} kP</text>
											{/if}
										</svg>
									</div>
								{/if}
							</div>
						{:else if activeTest === 'friability'}
							<!-- Friability Testing -->
							<div class="glass-strong rounded-2xl p-6 border border-white/10">
								<h4 class="text-sm font-display font-semibold text-white mb-4">Friability Testing (USP &lt;1216&gt;)</h4>
								<p class="text-xs text-gray-400 mb-4">
									20 tablets are weighed, tumbled for {USP_SPECS.friability.rotations} rotations in a friabilator, then re-weighed.
									Maximum allowable weight loss: {USP_SPECS.friability.maxPercentLoss}%.
								</p>

								{#if !state.friabilityTest.isRunning && !state.friabilityTest.isComplete}
									<button
										onclick={handleStartFriability}
										class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold"
									>
										Start Friability Test
									</button>
								{:else if state.friabilityTest.isRunning}
									<div class="space-y-4">
										<div class="glass rounded-lg p-3 border border-white/5">
											<div class="text-xs text-gray-400">Initial Weight</div>
											<div class="text-lg font-mono text-white">{state.friabilityTest.initialWeight.toFixed(3)} g</div>
										</div>

										<div class="flex items-center gap-4">
											<div class="flex-1">
												<div class="flex items-center justify-between mb-1">
													<span class="text-xs text-gray-400">Rotations</span>
													<span class="text-xs font-mono text-rose-400">{state.friabilityTest.rotations}/100</span>
												</div>
												<div class="h-3 bg-gray-800 rounded-full overflow-hidden">
													<div
														class="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-300"
														style="width: {state.friabilityTest.rotations}%"
													></div>
												</div>
											</div>
											{#if state.friabilityTest.rotations < 100}
												<button
													onclick={handleAdvanceFriability}
													class="px-4 py-2 rounded-lg glass border border-white/10 text-xs text-gray-300 hover:border-white/20"
												>
													+25 rotations
												</button>
											{/if}
										</div>

										<!-- Friabilator animation SVG -->
										<div class="flex justify-center">
											<svg viewBox="0 0 200 200" class="w-48 h-48">
												<circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2" />
												<circle cx="100" cy="100" r="75" fill="rgba(244, 63, 94, 0.05)" />
												{#each Array(8) as _, i}
													{@const angle = (2 * Math.PI * i) / 8 + (state.friabilityTest.rotations * 0.1)}
													{@const tx = 100 + 50 * Math.cos(angle)}
													{@const ty = 100 + 50 * Math.sin(angle)}
													<circle cx={tx} cy={ty} r="5" fill="rgba(244, 63, 94, 0.3)" stroke="rgba(244, 63, 94, 0.5)" stroke-width="1" />
												{/each}
												<text x="100" y="105" text-anchor="middle" fill="white" font-size="14" font-weight="bold">{state.friabilityTest.rotations}</text>
												<text x="100" y="118" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="8">rotations</text>
											</svg>
										</div>

										{#if state.friabilityTest.rotations >= 100}
											<button
												onclick={handleCompleteFriability}
												class="w-full px-6 py-2 rounded-xl glass border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/10"
											>
												Weigh Tablets & Complete
											</button>
										{/if}
									</div>
								{:else if state.friabilityTest.isComplete}
									<div class="space-y-3">
										<div class="grid grid-cols-3 gap-3">
											<div class="glass rounded-lg p-3 border border-white/5 text-center">
												<div class="text-xs text-gray-500">Initial</div>
												<div class="text-sm font-mono text-white">{state.friabilityTest.initialWeight.toFixed(3)} g</div>
											</div>
											<div class="glass rounded-lg p-3 border border-white/5 text-center">
												<div class="text-xs text-gray-500">Final</div>
												<div class="text-sm font-mono text-white">{state.friabilityTest.finalWeight?.toFixed(3)} g</div>
											</div>
											<div class="glass rounded-lg p-3 border border-white/5 text-center">
												<div class="text-xs text-gray-500">% Loss</div>
												<div class="text-sm font-mono {(state.friabilityTest.percentLoss ?? 0) <= USP_SPECS.friability.maxPercentLoss ? 'text-emerald-400' : 'text-rose-400'}">
													{state.friabilityTest.percentLoss?.toFixed(2)}%
												</div>
											</div>
										</div>
										<div class="p-3 rounded-lg {(state.friabilityTest.percentLoss ?? 0) <= USP_SPECS.friability.maxPercentLoss ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-rose-500/10 border border-rose-500/30'}">
											<span class="text-sm font-semibold {(state.friabilityTest.percentLoss ?? 0) <= USP_SPECS.friability.maxPercentLoss ? 'text-emerald-400' : 'text-rose-400'}">
												{(state.friabilityTest.percentLoss ?? 0) <= USP_SPECS.friability.maxPercentLoss ? 'PASS' : 'FAIL'}
											</span>
											<span class="text-xs text-gray-400 ml-2">(Max: {USP_SPECS.friability.maxPercentLoss}%)</span>
										</div>
									</div>
								{/if}
							</div>
						{/if}
					</div>

					<!-- Right panel -->
					<div class="space-y-4">
						<!-- Progress -->
						<div class="glass rounded-xl p-4 border border-white/10">
							<div class="flex items-center justify-between mb-2">
								<span class="text-sm text-gray-400">Tests Completed</span>
								<span class="text-sm font-mono text-rose-400">{state.completedTests.length}/4</span>
							</div>
							<div class="h-2 bg-gray-800 rounded-full overflow-hidden">
								<div
									class="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500"
									style="width: {progress}%"
								></div>
							</div>
						</div>

						<!-- Batch info -->
						{#if state.selectedBatch}
							<div class="glass rounded-xl p-4 border border-white/10">
								<h4 class="text-xs font-display font-semibold text-white mb-2">Batch Info</h4>
								<div class="space-y-1 text-xs">
									<div class="flex justify-between"><span class="text-gray-400">Drug:</span><span class="text-white">{state.selectedBatch.drugName}</span></div>
									<div class="flex justify-between"><span class="text-gray-400">Batch #:</span><span class="text-white font-mono">{state.selectedBatch.batchNumber}</span></div>
									<div class="flex justify-between"><span class="text-gray-400">Label claim:</span><span class="text-white">{state.selectedBatch.labelClaim} mg</span></div>
									<div class="flex justify-between"><span class="text-gray-400">Mfg date:</span><span class="text-white">{state.selectedBatch.manufactureDate}</span></div>
								</div>
							</div>
						{/if}

						<!-- USP specs reference -->
						<div class="glass rounded-xl p-4 border border-white/10">
							<h4 class="text-xs font-display font-semibold text-white mb-2">USP Specifications</h4>
							<div class="space-y-2 text-xs">
								<div class="glass rounded-lg p-2 border border-white/5">
									<div class="text-rose-400 font-semibold">Dissolution</div>
									<div class="text-gray-400">Q = {USP_SPECS.dissolution.Q}% at {USP_SPECS.dissolution.timePoint} min</div>
								</div>
								<div class="glass rounded-lg p-2 border border-white/5">
									<div class="text-rose-400 font-semibold">Content Uniformity</div>
									<div class="text-gray-400">AV limit: {USP_SPECS.contentUniformity.acceptanceValueLimit} (n=10)</div>
								</div>
								<div class="glass rounded-lg p-2 border border-white/5">
									<div class="text-rose-400 font-semibold">Hardness</div>
									<div class="text-gray-400">Min: {USP_SPECS.hardness.minHardness} kP</div>
								</div>
								<div class="glass rounded-lg p-2 border border-white/5">
									<div class="text-rose-400 font-semibold">Friability</div>
									<div class="text-gray-400">Max loss: {USP_SPECS.friability.maxPercentLoss}%</div>
								</div>
							</div>
						</div>

						<!-- Quiz -->
						<div class="glass-strong rounded-2xl p-5 border border-white/10">
							<h4 class="text-sm font-display font-semibold text-white mb-4">Knowledge Quiz</h4>
							<div class="space-y-4">
								{#each QC_QUIZ as question}
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
						{#if state.completedTests.length >= 2}
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
			</div>
		{/if}
	</main>

	<ChatAssistant />
</div>
