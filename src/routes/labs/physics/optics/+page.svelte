<script lang="ts">
	import { onMount } from 'svelte';
	import { labStore } from '$stores/lab';
	import { aiStore } from '$stores/ai';
	import SafetyBanner from '$components/lab/SafetyBanner.svelte';
	import StepGuide from '$components/lab/StepGuide.svelte';
	import HintButton from '$components/ai/HintButton.svelte';

	import {
		createInitialState,
		setElement,
		setObjectDistance,
		setFocalLength,
		applyPreset,
		toggleRays,
		toggleGrid,
		recordMeasurement,
		clearMeasurements,
		calculateImage,
		OPTICAL_ELEMENTS,
		PRESETS,
		OPTICS_QUIZ,
		analyzeExperiment,
		type OpticsState,
		type OpticalElementType
	} from '$lib/simulations/physics/optics';
	import type { Experiment, LabSession } from '$types';

	const experiment: Experiment = {
		id: 'phy-optics-01',
		disciplineId: 'physics',
		title: 'Optics: Lenses & Mirrors',
		description: 'Investigate image formation using convex and concave lenses and mirrors, and verify the thin lens equation.',
		difficulty: 'intermediate',
		durationMinutes: 45,
		instructions: [
			{ id: 1, title: 'Introduction', description: 'Review the thin lens/mirror equation: 1/f = 1/do + 1/di.', hints: ['f is positive for converging, negative for diverging'] },
			{ id: 2, title: 'Convex Lens', description: 'Start with a convex lens and move the object.', hints: ['Try placing the object beyond 2F'] },
			{ id: 3, title: 'Special Cases', description: 'Place the object at 2F, between F and 2F, at F, and inside F.', hints: ['At F, the image is at infinity'] },
			{ id: 4, title: 'Record Data', description: 'Record do, di, and magnification for each case.', hints: ['Verify 1/f = 1/do + 1/di'] },
			{ id: 5, title: 'Concave Lens', description: 'Switch to a concave lens and observe.', hints: ['Concave lenses always produce virtual, upright, diminished images'] },
			{ id: 6, title: 'Mirrors', description: 'Explore concave and convex mirrors.', hints: ['Mirrors follow the same equation'] },
			{ id: 7, title: 'Real vs Virtual', description: 'Identify which configurations produce real vs virtual images.', hints: ['Virtual images have negative di'] },
			{ id: 8, title: 'Complete Quiz', description: 'Answer optics questions.', hints: ['Review image characteristics'] }
		],
		simulationConfig: { type: 'optics', parameters: {} },
		safetyNotes: 'This is a virtual optics simulation. In a real lab, never look directly at bright light sources or lasers.',
		learningObjectives: ['Apply the thin lens equation 1/f = 1/do + 1/di', 'Distinguish real from virtual images', 'Understand magnification and image characteristics']
	};

	let state: OpticsState = $state(createInitialState({ elementType: 'convex-lens', objectDistance: 20, focalLength: 10 }));
	let showResults = $state(false);
	let mounted = $state(false);
	let showQuiz = $state(false);
	let isLabStarted = $state(false);
	let quizAnswers: Map<string, string> = $state(new Map());

	let analysis = $derived(analyzeExperiment(state, quizAnswers));

	// SVG dimensions and scaling
	const svgWidth = 700;
	const svgHeight = 400;
	const centerX = 350;
	const centerY = 200;
	const pxPerCm = 8; // pixels per cm

	// Positions in SVG coordinates
	let objSvgX = $derived(centerX - state.objectDistance * pxPerCm);
	let objTopY = $derived(centerY - state.objectHeight * pxPerCm * 10);
	let imgSvgX = $derived(isFinite(state.imageDistance) ? centerX + state.imageDistance * pxPerCm : centerX + 40 * pxPerCm);
	let imgTopY = $derived(isFinite(state.magnification) ? centerY - (-state.magnification) * state.objectHeight * pxPerCm * 10 : centerY);
	let focalSvgX1 = $derived(centerX + Math.abs(state.focalLength) * pxPerCm);
	let focalSvgX2 = $derived(centerX - Math.abs(state.focalLength) * pxPerCm);
	let twoFSvgX1 = $derived(centerX + 2 * Math.abs(state.focalLength) * pxPerCm);
	let twoFSvgX2 = $derived(centerX - 2 * Math.abs(state.focalLength) * pxPerCm);

	let isMirror = $derived(state.opticalElement.type.includes('mirror'));
	let isConverging = $derived(state.focalLength > 0);

	// Image characteristics text
	let imageDescription = $derived.by(() => {
		if (!isFinite(state.imageDistance)) return 'Image at infinity (object at focal point)';
		const type = state.isVirtual ? 'Virtual' : 'Real';
		const orientation = state.isInverted ? 'Inverted' : 'Upright';
		const size = Math.abs(state.magnification) > 1.01 ? 'Magnified' : Math.abs(state.magnification) < 0.99 ? 'Diminished' : 'Same size';
		return `${type}, ${orientation}, ${size}`;
	});

	onMount(() => {
		mounted = true;
	});

	function startLab() {
		isLabStarted = true;
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
		aiStore.setContext({ discipline: 'physics', experimentTitle: experiment.title, currentStep: 0, studentLevel: 'intermediate', recentMeasurements: [] });
	}

	function handleQuizAnswer(questionId: string, answer: string) {
		const newAnswers = new Map(quizAnswers);
		newAnswers.set(questionId, answer);
		quizAnswers = newAnswers;
	}

	function handleComplete() {
		showResults = true;
		labStore.completeLab();
	}
</script>

<svelte:head>
	<title>Optics: Lenses & Mirrors - AfriLab</title>
</svelte:head>

<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-violet-500/10 to-transparent rounded-full blur-3xl"></div>
</div>

<div class="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
		<div>
			<div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
				<a href="/dashboard" class="hover:text-amber-400 transition-colors">Dashboard</a>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
				<a href="/labs/physics" class="hover:text-amber-400 transition-colors">Physics</a>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
				<span class="text-amber-400">Optics</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-display font-bold text-white">{experiment.title}</h1>
		</div>
		<button onclick={() => aiStore.open()} class="btn-primary">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
			Ask AI
		</button>
	</div>

	<div class="mb-6"><SafetyBanner level="info" message="Virtual optics simulation. In a real lab, never look directly at bright light sources or laser beams." /></div>

	{#if !isLabStarted}
		<div class="max-w-2xl mx-auto">
			<div class="glass-strong rounded-2xl p-8 border border-white/10 text-center">
				<div class="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-6">
					<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
					</svg>
				</div>
				<h2 class="text-2xl font-display font-bold text-white mb-3">Optics: Lenses & Mirrors Lab</h2>
				<p class="text-gray-400 mb-6">Explore image formation by lenses and mirrors. Verify the thin lens equation and understand real vs virtual images, magnification, and ray diagrams.</p>

				<div class="inline-flex items-center gap-4 px-6 py-4 rounded-xl glass border border-white/10 mb-8">
					<span class="text-gray-400">Thin Lens Equation:</span>
					<span class="font-mono text-2xl">
						<span class="text-amber-400">1/f</span>
						<span class="text-gray-500"> = </span>
						<span class="text-cyan-400">1/do</span>
						<span class="text-gray-500"> + </span>
						<span class="text-emerald-400">1/di</span>
					</span>
				</div>

				<div class="grid grid-cols-2 gap-4 mb-8 text-left">
					<div class="glass rounded-xl p-4 border border-white/10">
						<h3 class="font-semibold text-white mb-2"><span class="text-amber-400">1.</span> Ray Diagrams</h3>
						<p class="text-sm text-gray-400">Visualize principal rays through lenses and mirrors.</p>
					</div>
					<div class="glass rounded-xl p-4 border border-white/10">
						<h3 class="font-semibold text-white mb-2"><span class="text-amber-400">2.</span> Move Objects</h3>
						<p class="text-sm text-gray-400">See how object distance affects image properties.</p>
					</div>
					<div class="glass rounded-xl p-4 border border-white/10">
						<h3 class="font-semibold text-white mb-2"><span class="text-amber-400">3.</span> Real vs Virtual</h3>
						<p class="text-sm text-gray-400">Identify when images are real or virtual.</p>
					</div>
					<div class="glass rounded-xl p-4 border border-white/10">
						<h3 class="font-semibold text-white mb-2"><span class="text-amber-400">4.</span> Verify Equation</h3>
						<p class="text-sm text-gray-400">Confirm 1/f = 1/do + 1/di with measurements.</p>
					</div>
				</div>

				<button onclick={startLab} class="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all transform hover:scale-105">
					Begin Lab Session
				</button>
			</div>
		</div>

	{:else if showResults}
		<div class="max-w-2xl mx-auto">
			<div class="glass-strong rounded-2xl p-8 border border-white/10">
				<div class="text-center mb-8">
					<div class="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4
						{analysis.grade === 'A' ? 'bg-emerald-500/20 text-emerald-400' : analysis.grade === 'B' ? 'bg-cyan-500/20 text-cyan-400' : analysis.grade === 'C' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}">
						<span class="text-4xl font-display font-bold">{analysis.grade}</span>
					</div>
					<h2 class="text-2xl font-display font-bold text-white">Lab Complete!</h2>
					<p class="text-gray-400 mt-2">Score: {analysis.score}/100</p>
				</div>
				<div class="grid grid-cols-2 gap-4 mb-6">
					<div class="glass rounded-xl p-4 border border-white/5 text-center">
						<p class="text-sm text-gray-400">Quiz Score</p>
						<p class="text-2xl font-bold text-white">{analysis.quizScore.correct}/{analysis.quizScore.total}</p>
					</div>
					<div class="glass rounded-xl p-4 border border-white/5 text-center">
						<p class="text-sm text-gray-400">Measurements</p>
						<p class="text-2xl font-bold text-white">{state.measurements.length}</p>
					</div>
					<div class="glass rounded-xl p-4 border border-white/5 text-center">
						<p class="text-sm text-gray-400">Elements Tested</p>
						<p class="text-2xl font-bold text-amber-400">{analysis.elementsCovered}</p>
					</div>
					<div class="glass rounded-xl p-4 border border-white/5 text-center">
						<p class="text-sm text-gray-400">Focal Length Accuracy</p>
						<p class="text-2xl font-bold text-cyan-400">{(100 - analysis.averageFocalError).toFixed(1)}%</p>
					</div>
				</div>
				<div class="glass rounded-xl p-4 border border-white/10 mb-6">
					<p class="text-sm text-gray-400">{analysis.feedback}</p>
				</div>
				<div class="flex gap-4">
					<button onclick={() => { state = createInitialState({ elementType: 'convex-lens', objectDistance: 20, focalLength: 10 }); quizAnswers = new Map(); showResults = false; showQuiz = false; isLabStarted = false; labStore.reset(); }} class="flex-1 py-3 px-6 rounded-xl glass border border-white/10 text-white font-medium">Try Again</button>
					<a href="/labs/physics" class="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold text-center">Back to Physics</a>
				</div>
			</div>
		</div>

	{:else}
		<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
			<!-- Left: Steps -->
			<div class="lg:col-span-1 space-y-6">
				<StepGuide steps={experiment.instructions} currentStepIndex={$labStore.currentStepIndex} />
				<div class="glass rounded-2xl p-4 border border-white/5">
					<HintButton experimentId={experiment.id} stepId={$labStore.currentStepIndex + 1} stepTitle={experiment.instructions[$labStore.currentStepIndex]?.title} />
				</div>
			</div>

			<!-- Center: Visualization -->
			<div class="lg:col-span-2 space-y-6">
				{#if !showQuiz}
					<!-- Ray Diagram -->
					<div class="glass-strong rounded-2xl border border-white/10 overflow-hidden">
						<svg class="w-full" viewBox="0 0 {svgWidth} {svgHeight}" preserveAspectRatio="xMidYMid meet">
							<defs>
								<linearGradient id="opticsBg" x1="0%" y1="0%" x2="0%" y2="100%">
									<stop offset="0%" stop-color="#0f172a" />
									<stop offset="100%" stop-color="#1e293b" />
								</linearGradient>
							</defs>
							<rect width="100%" height="100%" fill="url(#opticsBg)" />

							<!-- Grid -->
							{#if state.showGrid}
								{#each Array(Math.floor(svgWidth / 40)) as _, i}
									<line x1={i * 40} y1="0" x2={i * 40} y2={svgHeight} stroke="#1e3a5f" stroke-width="0.5" />
								{/each}
								{#each Array(Math.floor(svgHeight / 40)) as _, i}
									<line x1="0" y1={i * 40} x2={svgWidth} y2={i * 40} stroke="#1e3a5f" stroke-width="0.5" />
								{/each}
							{/if}

							<!-- Principal axis -->
							<line x1="0" y1={centerY} x2={svgWidth} y2={centerY} stroke="#4B5563" stroke-width="1" />

							<!-- Optical element at center -->
							{#if !isMirror}
								<!-- Lens (double arrow shape) -->
								<line x1={centerX} y1={centerY - 80} x2={centerX} y2={centerY + 80} stroke={isConverging ? '#8B5CF6' : '#EC4899'} stroke-width="2.5" />
								{#if isConverging}
									<!-- Convex lens arrows -->
									<polygon points="{centerX},{centerY - 80} {centerX - 8},{centerY - 70} {centerX + 8},{centerY - 70}" fill="#8B5CF6" />
									<polygon points="{centerX},{centerY + 80} {centerX - 8},{centerY + 70} {centerX + 8},{centerY + 70}" fill="#8B5CF6" />
								{:else}
									<!-- Concave lens arrows -->
									<polygon points="{centerX},{centerY - 80} {centerX - 8},{centerY - 90} {centerX + 8},{centerY - 90}" fill="#EC4899" />
									<polygon points="{centerX},{centerY + 80} {centerX - 8},{centerY + 90} {centerX + 8},{centerY + 90}" fill="#EC4899" />
								{/if}
							{:else}
								<!-- Mirror (curved line) -->
								<path
									d="M {centerX} {centerY - 80} Q {centerX + (isConverging ? 15 : -15)} {centerY} {centerX} {centerY + 80}"
									fill="none"
									stroke={isConverging ? '#8B5CF6' : '#EC4899'}
									stroke-width="3"
								/>
							{/if}

							<!-- Focal points -->
							<circle cx={focalSvgX1} cy={centerY} r="4" fill="#F59E0B" />
							<text x={focalSvgX1} y={centerY + 16} fill="#F59E0B" font-size="10" text-anchor="middle">F</text>
							<circle cx={focalSvgX2} cy={centerY} r="4" fill="#F59E0B" />
							<text x={focalSvgX2} y={centerY + 16} fill="#F59E0B" font-size="10" text-anchor="middle">F</text>

							<!-- 2F points -->
							{#if twoFSvgX1 < svgWidth && twoFSvgX1 > 0}
								<circle cx={twoFSvgX1} cy={centerY} r="3" fill="#6B7280" />
								<text x={twoFSvgX1} y={centerY + 16} fill="#6B7280" font-size="9" text-anchor="middle">2F</text>
							{/if}
							{#if twoFSvgX2 > 0 && twoFSvgX2 < svgWidth}
								<circle cx={twoFSvgX2} cy={centerY} r="3" fill="#6B7280" />
								<text x={twoFSvgX2} y={centerY + 16} fill="#6B7280" font-size="9" text-anchor="middle">2F</text>
							{/if}

							<!-- Object (arrow) -->
							{#if objSvgX > 10 && objSvgX < svgWidth - 10}
								<line x1={objSvgX} y1={centerY} x2={objSvgX} y2={objTopY} stroke="#3B82F6" stroke-width="3" />
								<polygon points="{objSvgX},{objTopY} {objSvgX - 6},{objTopY + 10} {objSvgX + 6},{objTopY + 10}" fill="#3B82F6" />
								<text x={objSvgX} y={centerY + 16} fill="#3B82F6" font-size="9" text-anchor="middle">Object</text>
							{/if}

							<!-- Principal rays (if enabled and image is finite) -->
							{#if state.showRays && isFinite(state.imageDistance) && objSvgX > 10}
								<!-- Ray 1: Parallel to axis, then through focal point -->
								<line x1={objSvgX} y1={objTopY} x2={centerX} y2={objTopY} stroke="#EF4444" stroke-width="1.5" opacity="0.7" />
								{#if isConverging}
									<line x1={centerX} y1={objTopY} x2={imgSvgX} y2={imgTopY} stroke="#EF4444" stroke-width="1.5" opacity="0.7" />
								{:else}
									<line x1={centerX} y1={objTopY} x2={imgSvgX} y2={imgTopY} stroke="#EF4444" stroke-width="1.5" opacity="0.7" stroke-dasharray="6,3" />
								{/if}

								<!-- Ray 2: Through center (undeviated for lens) -->
								<line x1={objSvgX} y1={objTopY} x2={imgSvgX} y2={imgTopY} stroke="#22C55E" stroke-width="1.5" opacity="0.7" />

								<!-- Ray 3: Through focal point, then parallel -->
								{@const focalX = isConverging ? focalSvgX2 : focalSvgX1}
								{@const slope = (objTopY - centerY) / (objSvgX - focalX)}
								{@const yAtLens = centerY + slope * (centerX - focalX)}
								{#if isConverging}
									<line x1={objSvgX} y1={objTopY} x2={centerX} y2={yAtLens} stroke="#3B82F6" stroke-width="1.5" opacity="0.7" />
									<line x1={centerX} y1={yAtLens} x2={imgSvgX} y2={yAtLens} stroke="#3B82F6" stroke-width="1.5" opacity="0.7" />
								{/if}
							{/if}

							<!-- Image (arrow) -->
							{#if isFinite(state.imageDistance) && imgSvgX > 10 && imgSvgX < svgWidth - 10}
								<line x1={imgSvgX} y1={centerY} x2={imgSvgX} y2={imgTopY} stroke={state.isVirtual ? '#F59E0B' : '#EF4444'} stroke-width="3" stroke-dasharray={state.isVirtual ? '6,3' : 'none'} />
								{@const arrowDir = imgTopY < centerY ? 1 : -1}
								<polygon points="{imgSvgX},{imgTopY} {imgSvgX - 6},{imgTopY + arrowDir * 10} {imgSvgX + 6},{imgTopY + arrowDir * 10}" fill={state.isVirtual ? '#F59E0B' : '#EF4444'} />
								<text x={imgSvgX} y={centerY + 16} fill={state.isVirtual ? '#F59E0B' : '#EF4444'} font-size="9" text-anchor="middle">{state.isVirtual ? 'Virtual' : 'Real'} Image</text>
							{/if}

							<!-- Info panel -->
							<g transform="translate(10, 10)">
								<rect width="200" height="100" fill="#1F2937" fill-opacity="0.9" rx="8" />
								<text x="10" y="20" fill="#8B5CF6" font-size="10" font-weight="bold">{state.opticalElement.name}</text>
								<text x="10" y="36" fill="#D1D5DB" font-size="9">do = {state.objectDistance.toFixed(1)} cm</text>
								<text x="10" y="50" fill="#D1D5DB" font-size="9">di = {isFinite(state.imageDistance) ? state.imageDistance.toFixed(1) + ' cm' : 'infinity'}</text>
								<text x="10" y="64" fill="#D1D5DB" font-size="9">f = {state.focalLength.toFixed(1)} cm</text>
								<text x="10" y="78" fill="#D1D5DB" font-size="9">M = {isFinite(state.magnification) ? state.magnification.toFixed(2) + 'x' : 'infinity'}</text>
								<text x="10" y="92" fill="#9CA3AF" font-size="8">{imageDescription}</text>
							</g>
						</svg>
					</div>

					<!-- Controls -->
					<div class="glass-strong rounded-2xl border border-white/10 p-4 space-y-4">
						<!-- Element selection -->
						<div>
							<label class="text-sm text-gray-400 block mb-2">Optical Element</label>
							<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
								{#each OPTICAL_ELEMENTS as el}
									<button
										onclick={() => state = setElement(state, el.type)}
										class="px-3 py-2 rounded-lg text-xs font-medium transition-all
										{state.opticalElement.type === el.type ? 'bg-violet-500/20 border-violet-500/50 text-violet-400' : 'glass border border-white/10 text-gray-300 hover:border-violet-500/30'}"
									>
										{el.name}
									</button>
								{/each}
							</div>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div>
								<label class="text-sm text-gray-400 block mb-2">Object Distance: {state.objectDistance.toFixed(1)} cm</label>
								<input type="range" min="2" max="50" step="0.5" value={state.objectDistance} oninput={(e) => state = setObjectDistance(state, parseFloat(e.currentTarget.value))} class="w-full accent-amber-500" />
							</div>
							<div>
								<label class="text-sm text-gray-400 block mb-2">Focal Length: {state.focalLength.toFixed(1)} cm</label>
								<input type="range" min="-30" max="30" step="0.5" value={state.focalLength} oninput={(e) => { const v = parseFloat(e.currentTarget.value); if (Math.abs(v) >= 1) state = setFocalLength(state, v); }} class="w-full accent-amber-500" />
							</div>
						</div>

						<!-- Presets -->
						<div>
							<span class="text-sm text-gray-400 block mb-2">Quick Presets</span>
							<div class="flex flex-wrap gap-2">
								{#each PRESETS as preset}
									<button
										onclick={() => state = applyPreset(state, preset.id)}
										class="px-3 py-1 text-xs rounded-lg glass border border-white/10 text-gray-300 hover:border-violet-500/50 hover:text-violet-400 transition-colors
										{state.selectedPreset === preset.id ? 'border-violet-500/50 text-violet-400' : ''}"
									>
										{preset.name}
									</button>
								{/each}
							</div>
						</div>

						<!-- Image properties -->
						<div class="glass rounded-xl p-3 border border-white/5">
							<h4 class="text-sm font-semibold text-white mb-2">Image Properties</h4>
							<div class="grid grid-cols-2 gap-2 text-sm">
								<div><span class="text-gray-400">Type:</span> <span class="{state.isVirtual ? 'text-amber-400' : 'text-emerald-400'}">{state.isVirtual ? 'Virtual' : 'Real'}</span></div>
								<div><span class="text-gray-400">Orientation:</span> <span class="text-cyan-400">{state.isInverted ? 'Inverted' : 'Upright'}</span></div>
								<div><span class="text-gray-400">di:</span> <span class="text-amber-400">{isFinite(state.imageDistance) ? state.imageDistance.toFixed(1) + ' cm' : 'inf'}</span></div>
								<div><span class="text-gray-400">|M|:</span> <span class="text-amber-400">{isFinite(state.magnification) ? Math.abs(state.magnification).toFixed(2) + 'x' : 'inf'}</span></div>
							</div>
						</div>

						<!-- Action buttons -->
						<div class="flex gap-3">
							<button onclick={() => state = recordMeasurement(state)} disabled={!isFinite(state.imageDistance)} class="flex-1 btn-primary disabled:opacity-50">Record Measurement</button>
							<label class="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
								<input type="checkbox" checked={state.showRays} onchange={() => state = toggleRays(state)} class="accent-amber-500" />
								Rays
							</label>
							<label class="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
								<input type="checkbox" checked={state.showGrid} onchange={() => state = toggleGrid(state)} class="accent-amber-500" />
								Grid
							</label>
						</div>
					</div>
				{:else}
					<!-- Quiz -->
					<div class="glass-strong rounded-2xl border border-white/10 p-6">
						<h3 class="text-xl font-display font-semibold text-white mb-6">Knowledge Quiz</h3>
						<div class="space-y-6">
							{#each OPTICS_QUIZ as question}
								<div class="glass rounded-xl p-4 border border-white/5">
									<p class="text-white font-medium mb-3">{question.question}</p>
									<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
										{#each question.options as option}
											<button onclick={() => handleQuizAnswer(question.id, option)} class="p-2 rounded-lg text-sm text-left transition-all {quizAnswers.get(question.id) === option ? 'bg-violet-500/20 border-violet-500/50 text-violet-400' : 'glass border border-white/10 text-gray-300 hover:border-violet-500/30'}">
												{option}
											</button>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<button onclick={() => showQuiz = !showQuiz} class="w-full btn-secondary">{showQuiz ? 'Back to Simulation' : 'Take Quiz'}</button>

				{#if state.measurements.length >= 3}
					<button onclick={handleComplete} class="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition-all">
						Complete Lab & Analyze
					</button>
				{/if}
			</div>

			<!-- Right: Data -->
			<div class="lg:col-span-1 space-y-6">
				<div class="glass-strong rounded-2xl p-5 border border-white/10">
					<div class="flex justify-between items-center mb-4">
						<h4 class="text-sm font-semibold text-white">Recorded Data</h4>
						{#if state.measurements.length > 0}
							<button onclick={() => state = clearMeasurements(state)} class="text-xs text-gray-400 hover:text-red-400">Clear</button>
						{/if}
					</div>
					{#if state.measurements.length === 0}
						<p class="text-sm text-gray-500">Record measurements with different elements and distances.</p>
					{:else}
						<div class="space-y-2 max-h-64 overflow-y-auto">
							{#each state.measurements as m, i}
								<div class="glass rounded-lg p-2 text-xs border border-white/5">
									<div class="flex justify-between text-gray-400">
										<span>#{i + 1}</span>
										<span class="capitalize">{m.elementType.replace('-', ' ')}</span>
									</div>
									<div class="flex justify-between mt-1"><span class="text-gray-500">do:</span><span class="text-amber-400">{m.objectDistance.toFixed(1)} cm</span></div>
									<div class="flex justify-between"><span class="text-gray-500">di:</span><span class="text-cyan-400">{m.imageDistance.toFixed(1)} cm</span></div>
									<div class="flex justify-between"><span class="text-gray-500">f:</span><span class="text-emerald-400">{m.focalLength.toFixed(1)} cm</span></div>
									<div class="flex justify-between"><span class="text-gray-500">M:</span><span class="text-amber-400">{m.magnification.toFixed(2)}x</span></div>
									<div class="flex justify-between"><span class="text-gray-500">Type:</span><span class="{m.isVirtual ? 'text-amber-400' : 'text-emerald-400'}">{m.isVirtual ? 'Virtual' : 'Real'}</span></div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<div class="glass rounded-2xl p-5 border border-white/5">
					<h4 class="text-sm font-semibold text-white mb-3">Key Equations</h4>
					<div class="space-y-2 text-xs text-gray-400 font-mono">
						<p>1/f = 1/do + 1/di</p>
						<p>M = -di / do = hi / ho</p>
						<p>di {'>'} 0: real image</p>
						<p>di {'<'} 0: virtual image</p>
						<p>|M| {'>'} 1: magnified</p>
					</div>
				</div>

				<div class="glass rounded-2xl p-5 border border-white/5">
					<h4 class="text-sm font-semibold text-white mb-3">Sign Convention</h4>
					<div class="space-y-1 text-xs text-gray-400">
						<p>+ f: converging (convex lens, concave mirror)</p>
						<p>- f: diverging (concave lens, convex mirror)</p>
						<p>+ di: real image (opposite side of lens)</p>
						<p>- di: virtual image (same side as object)</p>
					</div>
				</div>

				<div class="glass rounded-2xl p-5 border border-white/5">
					<h4 class="text-sm font-semibold text-white mb-3">Objectives</h4>
					<ul class="space-y-2 text-xs text-gray-400">
						{#each experiment.learningObjectives as obj}
							<li class="flex items-start gap-2">
								<svg class="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" /></svg>
								{obj}
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	{/if}
</div>
