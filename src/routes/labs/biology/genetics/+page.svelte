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
		setCrossType,
		selectTrait,
		setParentGenotype,
		performCross,
		performChiSquare,
		setSampleSize,
		answerQuiz,
		checkQuizAnswers,
		analyzeGenetics,
		getGenotypeOptions,
		getPhenotype,
		genotypeString,
		TRAITS,
		GENETICS_QUIZ,
		type GeneticsState,
		type Genotype
	} from '$lib/simulations/biology/genetics';
	import type { Experiment, LabSession } from '$types';

	const experiment: Experiment = {
		id: 'bio-genetics-01',
		disciplineId: 'biology',
		title: 'Mendelian Genetics',
		description: 'Simulate monohybrid and dihybrid crosses to understand inheritance patterns.',
		difficulty: 'beginner',
		durationMinutes: 35,
		instructions: [
			{ id: 1, title: 'Introduction', description: 'Review dominant and recessive alleles.', hints: ['Dominant alleles are uppercase'] },
			{ id: 2, title: 'Select Traits', description: 'Choose traits to study (flower color, seed shape, etc.).', hints: ['Start with one trait for a monohybrid cross'] },
			{ id: 3, title: 'Set Parent Genotypes', description: 'Select genotypes for both parents.', hints: ['Try heterozygous x heterozygous first'] },
			{ id: 4, title: 'Perform Cross', description: 'Run the cross and examine the Punnett square.', hints: ['Look at the offspring ratios'] },
			{ id: 5, title: 'Analyze Ratios', description: 'Compare expected and observed ratios.', hints: ['Expected monohybrid ratio for Aa x Aa is 3:1'] },
			{ id: 6, title: 'Chi-Square Test', description: 'Perform a chi-square test on your results.', hints: ['p > 0.05 means results match expected ratios'] },
			{ id: 7, title: 'Dihybrid Cross', description: 'Try a dihybrid cross with two traits.', hints: ['Expected ratio for AaBb x AaBb is 9:3:3:1'] },
			{ id: 8, title: 'Complete Quiz', description: 'Answer questions to test your understanding.', hints: ['Review Mendel\'s laws'] }
		],
		simulationConfig: { type: 'genetics', parameters: {}, equipment: ['Punnett square board', 'Pea plant models'] },
		safetyNotes: 'This is a virtual simulation. No physical materials are used.',
		learningObjectives: ['Understand dominant/recessive inheritance', 'Build Punnett squares', 'Calculate expected ratios', 'Perform chi-square analysis']
	};

	let state: GeneticsState = $state(createInitialState({ defaultTraitIds: ['flower-color', 'seed-shape'], defaultCrossType: 'monohybrid' }));
	let showResults = $state(false);
	let showQuiz = $state(false);
	let mounted = $state(false);

	let analysis = $derived(analyzeGenetics(state));
	let quizResults = $derived(checkQuizAnswers(state));
	let selectedTraits = $derived(state.selectedTraitIds.map(id => TRAITS.find(t => t.id === id)!).filter(Boolean));

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
		aiStore.setContext({ discipline: 'biology', experimentTitle: experiment.title, currentStep: 0, studentLevel: 'beginner', recentMeasurements: [] });
	});

	function handleCrossType(type: 'monohybrid' | 'dihybrid') {
		state = setCrossType(state, type);
	}

	function handleSelectTrait(traitId: string, index: number) {
		state = selectTrait(state, traitId, index);
	}

	function handleSetGenotype(parent: 1 | 2, traitId: string, genotype: Genotype) {
		state = setParentGenotype(state, parent, traitId, genotype);
	}

	function handlePerformCross() {
		state = performCross(state);
		labStore.addAction('perform-cross', { type: state.crossType });
	}

	function handleChiSquare() {
		state = performChiSquare(state);
		labStore.addAction('chi-square-test', {});
	}

	function handleQuizAnswer(questionId: string, answer: string) {
		state = answerQuiz(state, questionId, answer);
	}

	function handleComplete() {
		showResults = true;
		labStore.completeLab();
	}

	function getTraitColor(traitId: string, genotype: Genotype): string {
		const trait = TRAITS.find(t => t.id === traitId);
		if (!trait) return '#888';
		const phenotype = getPhenotype(traitId, genotype);
		return phenotype === trait.dominantPhenotype ? trait.dominantColor : trait.recessiveColor;
	}
</script>

<svelte:head>
	<title>Mendelian Genetics - AfriLab</title>
</svelte:head>

<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-emerald-500/10 to-transparent rounded-full blur-3xl"></div>
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
				<span class="text-emerald-400">Genetics</span>
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

	<div class="mb-6"><SafetyBanner level="safe" message="Virtual simulation - no physical materials required. Explore freely!" /></div>

	<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
		<!-- Left: Steps -->
		<div class="lg:col-span-1 space-y-6">
			<StepGuide steps={experiment.instructions} currentStepIndex={$labStore.currentStepIndex} />
			<div class="glass rounded-2xl p-4 border border-white/5">
				<HintButton experimentId={experiment.id} stepId={$labStore.currentStepIndex + 1} stepTitle={experiment.instructions[$labStore.currentStepIndex]?.title} />
			</div>
			<ControlPanel onComplete={handleComplete} />
		</div>

		<!-- Center: Main Lab Area -->
		<div class="lg:col-span-2 space-y-6">
			{#if !showQuiz}
				<!-- Cross Type Selector -->
				<div class="glass-strong rounded-2xl p-5 border border-white/10">
					<h3 class="text-sm font-semibold text-white mb-3">Cross Type</h3>
					<div class="flex gap-3">
						{#each [{ type: 'monohybrid', label: 'Monohybrid (1 trait)' }, { type: 'dihybrid', label: 'Dihybrid (2 traits)' }] as opt}
							<button
								onclick={() => handleCrossType(opt.type as 'monohybrid' | 'dihybrid')}
								class="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all {state.crossType === opt.type ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-500/50 text-white' : 'glass border border-white/10 text-gray-400 hover:border-white/20'}"
							>
								{opt.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Trait Selectors -->
				<div class="glass-strong rounded-2xl p-5 border border-white/10">
					<h3 class="text-sm font-semibold text-white mb-3">Select Traits</h3>
					<div class="space-y-3">
						{#each state.selectedTraitIds as traitId, i}
							<div>
								<label class="text-xs text-gray-400 mb-1 block">Trait {i + 1}</label>
								<div class="flex gap-2 flex-wrap">
									{#each TRAITS as trait}
										<button
											onclick={() => handleSelectTrait(trait.id, i)}
											class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all {traitId === trait.id ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'glass border border-white/10 text-gray-400 hover:border-white/20'}"
										>
											{trait.name}
										</button>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Parent Genotype Setup -->
				<div class="grid grid-cols-2 gap-4">
					{#each [1, 2] as parent}
						<div class="glass-strong rounded-2xl p-4 border border-white/10">
							<h4 class="text-sm font-semibold text-white mb-3">Parent {parent}</h4>
							{#each state.selectedTraitIds as traitId}
								{@const trait = TRAITS.find(t => t.id === traitId)}
								{@const options = getGenotypeOptions(traitId)}
								{@const currentGeno = (parent === 1 ? state.parent1Genotypes : state.parent2Genotypes).get(traitId)}
								{#if trait && currentGeno}
									<div class="mb-3">
										<label class="text-xs text-gray-500 mb-1 block">{trait.name}</label>
										<select
											onchange={(e) => {
												const idx = parseInt((e.target as HTMLSelectElement).value);
												handleSetGenotype(parent as 1 | 2, traitId, options[idx].genotype);
											}}
											class="w-full px-3 py-2 rounded-lg glass border border-white/10 text-white text-sm bg-transparent focus:outline-none focus:border-emerald-500/50"
										>
											{#each options as opt, idx}
												<option value={idx} selected={genotypeString(currentGeno) === genotypeString(opt.genotype)} class="bg-gray-900">{opt.label}</option>
											{/each}
										</select>
										<div class="mt-1 flex items-center gap-2">
											<div class="w-4 h-4 rounded-full" style="background: {getTraitColor(traitId, currentGeno)}"></div>
											<span class="text-xs text-gray-400">{getPhenotype(traitId, currentGeno)}</span>
										</div>
									</div>
								{/if}
							{/each}
						</div>
					{/each}
				</div>

				<!-- Perform Cross Button -->
				<button
					onclick={handlePerformCross}
					class="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
				>
					Perform Cross
				</button>

				<!-- Punnett Square & Results -->
				{#if state.crossResult}
					<LabCanvas className="min-h-[300px]">
						<div class="p-6">
							<h3 class="text-lg font-display font-semibold text-white mb-4">Punnett Square</h3>
							<div class="overflow-x-auto">
								<table class="w-full border-collapse">
									<thead>
										<tr>
											<th class="p-2 border border-white/10 text-gray-500 text-xs">P1 \ P2</th>
											{#each state.crossResult.punnettSquare[0] || [] as _, colIdx}
												<th class="p-2 border border-white/10 text-cyan-400 text-xs font-mono">
													Gamete {colIdx + 1}
												</th>
											{/each}
										</tr>
									</thead>
									<tbody>
										{#each state.crossResult.punnettSquare as row, rowIdx}
											<tr>
												<td class="p-2 border border-white/10 text-emerald-400 text-xs font-mono">
													Gamete {rowIdx + 1}
												</td>
												{#each row as cell}
													<td class="p-3 border border-white/10 text-center">
														<span class="text-white font-mono text-sm font-bold">{cell.alleles}</span>
														<div class="flex items-center justify-center gap-1 mt-1">
															{#each state.crossResult.traitIds as traitId, tIdx}
																{@const alleles = cell.alleles.split(' ')[tIdx]}
																{@const geno = [alleles[0], alleles[1]] as Genotype}
																<div class="w-3 h-3 rounded-full" style="background: {getTraitColor(traitId, geno)}"></div>
															{/each}
														</div>
													</td>
												{/each}
											</tr>
										{/each}
									</tbody>
								</table>
							</div>

							<!-- Offspring Ratios -->
							<div class="mt-6 grid grid-cols-2 gap-4">
								<div>
									<h4 class="text-sm font-semibold text-white mb-2">Phenotypic Ratios</h4>
									<div class="space-y-1">
										{#each Array.from(state.crossResult.offspringPhenotypes.entries()) as [pheno, count]}
											<div class="flex items-center justify-between text-xs">
												<span class="text-gray-300">{pheno}</span>
												<span class="font-mono text-emerald-400">{count}/{state.crossResult.totalOffspring}</span>
											</div>
										{/each}
									</div>
								</div>
								<div>
									<h4 class="text-sm font-semibold text-white mb-2">Genotypic Ratios</h4>
									<div class="space-y-1">
										{#each Array.from(state.crossResult.offspringGenotypes.entries()) as [geno, count]}
											<div class="flex items-center justify-between text-xs">
												<span class="text-gray-300 font-mono">{geno}</span>
												<span class="font-mono text-cyan-400">{count}/{state.crossResult.totalOffspring}</span>
											</div>
										{/each}
									</div>
								</div>
							</div>
						</div>
					</LabCanvas>

					<!-- Chi-Square Analysis -->
					<div class="glass-strong rounded-2xl p-5 border border-white/10">
						<h3 class="text-sm font-semibold text-white mb-3">Chi-Square Analysis</h3>
						<div class="flex items-center gap-4 mb-4">
							<label class="text-xs text-gray-400">Sample Size:</label>
							<input
								type="range" min="10" max="500" step="10"
								value={state.sampleSize}
								oninput={(e) => { state = setSampleSize(state, parseInt((e.target as HTMLInputElement).value)); }}
								class="flex-1 accent-emerald-500"
							/>
							<span class="text-sm font-mono text-white w-12 text-right">{state.sampleSize}</span>
						</div>

						{#if state.observedCounts.size > 0}
							<div class="mb-4 space-y-1">
								<div class="flex items-center justify-between text-xs font-semibold text-gray-400">
									<span>Phenotype</span>
									<span>Observed</span>
								</div>
								{#each Array.from(state.observedCounts.entries()) as [pheno, count]}
									<div class="flex items-center justify-between text-sm">
										<span class="text-gray-300">{pheno}</span>
										<span class="font-mono text-white">{count}</span>
									</div>
								{/each}
							</div>
						{/if}

						<button
							onclick={handleChiSquare}
							disabled={!state.crossResult}
							class="w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 hover:border-purple-500/50 disabled:opacity-50"
						>
							Run Chi-Square Test
						</button>

						{#if state.chiSquareResult}
							<div class="mt-4 glass rounded-xl p-4 border border-white/5">
								<div class="grid grid-cols-3 gap-4 text-center">
									<div>
										<p class="text-xs text-gray-400">Chi-Square</p>
										<p class="text-lg font-bold font-mono text-white">{state.chiSquareResult.chiSquareValue}</p>
									</div>
									<div>
										<p class="text-xs text-gray-400">df</p>
										<p class="text-lg font-bold font-mono text-white">{state.chiSquareResult.degreesOfFreedom}</p>
									</div>
									<div>
										<p class="text-xs text-gray-400">p-value</p>
										<p class="text-lg font-bold font-mono {state.chiSquareResult.isSignificant ? 'text-red-400' : 'text-emerald-400'}">{state.chiSquareResult.pValue}</p>
									</div>
								</div>
								<p class="text-xs text-gray-400 mt-3 text-center">
									{state.chiSquareResult.isSignificant
										? 'Significant deviation from expected ratios (p < 0.05). Results may not fit the model.'
										: 'No significant deviation (p > 0.05). Observed results are consistent with expected Mendelian ratios.'}
								</p>
							</div>
						{/if}
					</div>
				{/if}
			{:else}
				<!-- Quiz -->
				<div class="glass-strong rounded-2xl border border-white/10 p-6">
					<h3 class="text-xl font-display font-semibold text-white mb-6">Knowledge Quiz</h3>
					<div class="space-y-6">
						{#each GENETICS_QUIZ as question}
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

			<!-- Results -->
			{#if showResults}
				<div class="glass-strong rounded-2xl p-6 border border-white/10 animate-fade-in-up">
					<h3 class="text-xl font-display font-semibold text-white mb-4">Lab Results</h3>
					<div class="grid grid-cols-2 gap-4 mb-6">
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Crosses Performed</p>
							<p class="text-2xl font-bold text-white">{analysis.crossesPerformed}</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Quiz Score</p>
							<p class="text-2xl font-bold text-white">{quizResults.correct}/{quizResults.total}</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Chi-Square</p>
							<p class="text-2xl font-bold text-white">{analysis.chiSquareCompleted ? 'Done' : 'Pending'}</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Grade</p>
							<p class="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{analysis.grade}</p>
						</div>
					</div>
					<p class="text-gray-400 mb-6">{analysis.feedback}</p>
					<div class="flex gap-3">
						<button onclick={() => { state = createInitialState({ defaultTraitIds: ['flower-color', 'seed-shape'], defaultCrossType: 'monohybrid' }); showResults = false; showQuiz = false; labStore.reset(); }} class="btn-secondary flex-1">Try Again</button>
						<a href="/labs/biology" class="btn-primary flex-1 text-center">Back to Labs</a>
					</div>
				</div>
			{/if}
		</div>

		<!-- Right: Info Panel -->
		<div class="lg:col-span-1 space-y-6">
			<!-- Trait Reference -->
			<div class="glass-strong rounded-2xl p-5 border border-white/10">
				<h4 class="text-sm font-semibold text-white mb-3">Trait Reference</h4>
				<div class="space-y-3">
					{#each selectedTraits as trait}
						<div class="glass rounded-xl p-3 border border-white/5">
							<p class="text-xs font-semibold text-white mb-2">{trait.name} ({trait.gene})</p>
							<div class="flex items-center gap-2 text-xs">
								<div class="w-3 h-3 rounded-full" style="background: {trait.dominantColor}"></div>
								<span class="text-gray-400">{trait.dominantAllele}{trait.dominantAllele} or {trait.dominantAllele}{trait.recessiveAllele} = {trait.dominantPhenotype}</span>
							</div>
							<div class="flex items-center gap-2 text-xs mt-1">
								<div class="w-3 h-3 rounded-full" style="background: {trait.recessiveColor}"></div>
								<span class="text-gray-400">{trait.recessiveAllele}{trait.recessiveAllele} = {trait.recessivePhenotype}</span>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Cross History -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<h4 class="text-sm font-semibold text-white mb-3">Cross History</h4>
				{#if state.crossHistory.length === 0}
					<p class="text-xs text-gray-500 text-center py-4">No crosses performed yet.</p>
				{:else}
					<div class="space-y-2 max-h-[200px] overflow-y-auto">
						{#each state.crossHistory as cross, i}
							<div class="glass rounded-lg p-2 border border-white/5">
								<div class="flex justify-between items-center">
									<span class="text-xs text-gray-400">Cross #{i + 1}</span>
									<span class="text-xs text-emerald-400 font-mono">{cross.traitIds.length} trait{cross.traitIds.length > 1 ? 's' : ''}</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Learning Objectives -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<h4 class="text-sm font-semibold text-white mb-3">Learning Objectives</h4>
				<ul class="space-y-2">
					{#each experiment.learningObjectives as obj}
						<li class="text-xs text-gray-400 flex items-start gap-2">
							<svg class="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
							{obj}
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</div>
