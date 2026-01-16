<script lang="ts">
	import { onMount } from 'svelte';
	import { labStore } from '$stores/lab';
	import { aiStore } from '$stores/ai';

	import LabCanvas from '$components/lab/LabCanvas.svelte';
	import ControlPanel from '$components/lab/ControlPanel.svelte';
	import SafetyBanner from '$components/lab/SafetyBanner.svelte';
	import StepGuide from '$components/lab/StepGuide.svelte';
	import HintButton from '$components/ai/HintButton.svelte';
	import CollaborationButton from '$components/collaboration/CollaborationButton.svelte';
	import CollaborationPanel from '$components/collaboration/CollaborationPanel.svelte';

	import {
		createInitialState,
		setVelocity,
		setAngle,
		selectPlanet,
		setLaunchHeight,
		launch,
		updateSimulation,
		recordMeasurement,
		reset,
		clearMeasurements,
		setAnimationSpeed,
		toggleTheoretical,
		setTarget,
		applyPreset,
		calculateTheoretical,
		generateTrajectory,
		PLANETS,
		PRESETS,
		PROJECTILE_QUIZ,
		analyzeExperiment,
		type ProjectileState
	} from '$lib/simulations/physics/projectile-motion';
	import type { Experiment, LabSession } from '$types';

	const experiment: Experiment = {
		id: 'phy-projectile-01',
		disciplineId: 'physics',
		title: 'Projectile Motion',
		description: 'Explore the physics of objects in flight by launching projectiles at different angles and velocities.',
		difficulty: 'intermediate',
		durationMinutes: 45,
		instructions: [
			{ id: 1, title: 'Introduction', description: 'Review the kinematic equations for projectile motion.', hints: ['Motion is 2D: horizontal and vertical'] },
			{ id: 2, title: 'Set Parameters', description: 'Adjust the launch angle and initial velocity.', hints: ['Try angles between 30° and 60°'] },
			{ id: 3, title: 'Launch & Observe', description: 'Launch the projectile and observe its trajectory.', hints: ['Notice the parabolic path'] },
			{ id: 4, title: 'Record Data', description: 'Record measurements for different angle/velocity combinations.', hints: ['Compare with theoretical values'] },
			{ id: 5, title: 'Find Maximum Range', description: 'Determine which angle gives the maximum horizontal range.', hints: ['Test angles around 45°'] },
			{ id: 6, title: 'Compare Planets', description: 'See how gravity affects projectile motion on different planets.', hints: ['Lower gravity = longer range'] },
			{ id: 7, title: 'Challenge Mode', description: 'Try to hit the target at a specific distance.', hints: ['Calculate the required angle'] },
			{ id: 8, title: 'Complete Quiz', description: 'Answer questions about projectile motion concepts.', hints: ['Review your observations'] }
		],
		simulationConfig: { type: 'projectile-motion', parameters: {} },
		safetyNotes: 'This is a virtual simulation. No physical hazards.',
		learningObjectives: ['Understand projectile motion equations', 'Analyze how angle affects range', 'Compare motion under different gravitational fields']
	};

	let state: ProjectileState = $state(createInitialState({ initialVelocity: 20, launchAngle: 45, gravity: 9.8, launchHeight: 0 }));
	let showResults = $state(false);
	let mounted = $state(false);
	let showQuiz = $state(false);
	let quizAnswers: Map<string, string> = $state(new Map());
	let animationFrameId: number | null = null;
	let lastTime = 0;
	let canvasWidth = $state(800);
	let canvasHeight = $state(400);

	// Calculate scale for visualization
	let theoretical = $derived(calculateTheoretical(state.initialVelocity, state.launchAngle, state.gravity, state.launchHeight));
	let theoreticalTrajectory = $derived(generateTrajectory(state.initialVelocity, state.launchAngle, state.gravity, state.launchHeight));
	let analysis = $derived(analyzeExperiment(state, quizAnswers));

	// Scale to fit canvas
	let maxRange = $derived(Math.max(theoretical.range * 1.2, 50));
	let maxHeight = $derived(Math.max(theoretical.maxHeight * 1.3, 30));
	let scaleX = $derived(canvasWidth / maxRange);
	let scaleY = $derived((canvasHeight - 80) / maxHeight);
	let groundY = $derived(canvasHeight - 40);

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
		aiStore.setContext({ discipline: 'physics', experimentTitle: experiment.title, currentStep: 0, studentLevel: 'intermediate', recentMeasurements: [] });

		return () => {
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
			}
		};
	});

	function animate(currentTime: number) {
		if (!state.isLaunched) {
			animationFrameId = null;
			return;
		}

		const deltaTime = lastTime ? (currentTime - lastTime) / 1000 : 0;
		lastTime = currentTime;

		state = updateSimulation(state, deltaTime);

		if (state.isLaunched) {
			animationFrameId = requestAnimationFrame(animate);
		} else {
			animationFrameId = null;
			lastTime = 0;
		}
	}

	function handleLaunch() {
		state = launch(state);
		lastTime = 0;
		animationFrameId = requestAnimationFrame(animate);
	}

	function handleReset() {
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
		state = reset(state);
	}

	function handleRecord() {
		state = recordMeasurement(state);
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

	function toCanvasX(x: number): number {
		return 40 + x * scaleX;
	}

	function toCanvasY(y: number): number {
		return groundY - y * scaleY;
	}
</script>

<svelte:head>
	<title>Projectile Motion - AfriLab</title>
</svelte:head>

<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-30"></div>
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-amber-500/10 to-transparent rounded-full blur-3xl"></div>
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
				<span class="text-amber-400">Projectile Motion</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-display font-bold text-white">{experiment.title}</h1>
		</div>
		<div class="flex items-center gap-3">
			<CollaborationButton labId={experiment.id} labName={experiment.title} />
			<button onclick={() => aiStore.open()} class="btn-primary">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
				Ask AI
			</button>
		</div>
	</div>

	<div class="mb-6"><SafetyBanner level="info" message="This is a virtual physics simulation. Observe how launch parameters affect the trajectory." /></div>

	<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
		<!-- Left: Steps -->
		<div class="lg:col-span-1 space-y-6">
			<StepGuide steps={experiment.instructions} currentStepIndex={$labStore.currentStepIndex} />
			<div class="glass rounded-2xl p-4 border border-white/5">
				<HintButton experimentId={experiment.id} stepId={$labStore.currentStepIndex + 1} stepTitle={experiment.instructions[$labStore.currentStepIndex]?.title} />
			</div>
			<ControlPanel onComplete={handleComplete} />
		</div>

		<!-- Center: Simulation -->
		<div class="lg:col-span-2 space-y-6">
			{#if !showQuiz}
				<LabCanvas className="min-h-[400px]">
					<svg class="w-full h-full" viewBox="0 0 {canvasWidth} {canvasHeight}" preserveAspectRatio="xMidYMid meet">
						<!-- Background gradient -->
						<defs>
							<linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
								<stop offset="0%" stop-color="#1e3a5f" />
								<stop offset="100%" stop-color="#0f172a" />
							</linearGradient>
						</defs>
						<rect width="100%" height="100%" fill="url(#skyGradient)" />

						<!-- Grid lines -->
						{#each Array(Math.ceil(maxRange / 10)) as _, i}
							<line x1={toCanvasX(i * 10)} y1={groundY} x2={toCanvasX(i * 10)} y2={groundY + 5} stroke="#4B5563" stroke-width="1" />
							<text x={toCanvasX(i * 10)} y={groundY + 18} fill="#9CA3AF" font-size="10" text-anchor="middle">{i * 10}m</text>
						{/each}
						{#each Array(Math.ceil(maxHeight / 10)) as _, i}
							{#if i > 0}
								<line x1={35} y1={toCanvasY(i * 10)} x2={40} y2={toCanvasY(i * 10)} stroke="#4B5563" stroke-width="1" />
								<text x={30} y={toCanvasY(i * 10) + 3} fill="#9CA3AF" font-size="10" text-anchor="end">{i * 10}</text>
							{/if}
						{/each}

						<!-- Ground -->
						<rect x="40" y={groundY} width={canvasWidth - 50} height="3" fill="#22C55E" />

						<!-- Target marker -->
						{#if state.targetDistance !== null}
							<g transform="translate({toCanvasX(state.targetDistance)}, {groundY})">
								<rect x="-10" y="-30" width="20" height="30" fill="#EF4444" opacity="0.3" />
								<line x1="0" y1="-30" x2="0" y2="0" stroke="#EF4444" stroke-width="2" />
								<circle cx="0" cy="-15" r="8" fill="none" stroke="#EF4444" stroke-width="2" />
								<circle cx="0" cy="-15" r="4" fill="#EF4444" />
							</g>
						{/if}

						<!-- Theoretical trajectory (dashed) -->
						{#if state.showTheoretical && theoreticalTrajectory.length > 1}
							<path
								d="M {theoreticalTrajectory.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toCanvasX(p.x)} ${toCanvasY(p.y)}`).join(' ')}"
								fill="none"
								stroke="#F59E0B"
								stroke-width="2"
								stroke-dasharray="5,5"
								opacity="0.5"
							/>
						{/if}

						<!-- Actual trajectory -->
						{#if state.trajectory.length > 1}
							<path
								d="M {state.trajectory.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toCanvasX(p.x)} ${toCanvasY(p.y)}`).join(' ')}"
								fill="none"
								stroke="#F59E0B"
								stroke-width="2"
							/>
						{/if}

						<!-- Launch platform -->
						<g transform="translate(40, {groundY - state.launchHeight * scaleY})">
							<rect x="-5" y="0" width="20" height={state.launchHeight * scaleY} fill="#6B7280" />
							<rect x="-10" y="-5" width="30" height="10" fill="#374151" rx="2" />
							<!-- Cannon/launcher -->
							<g transform="rotate({-state.launchAngle})">
								<rect x="0" y="-4" width="25" height="8" fill="#4B5563" rx="2" />
								<circle cx="0" cy="0" r="6" fill="#374151" />
							</g>
						</g>

						<!-- Projectile -->
						<circle
							cx={toCanvasX(state.projectileX)}
							cy={toCanvasY(state.projectileY)}
							r="8"
							fill="#F59E0B"
							stroke="#FCD34D"
							stroke-width="2"
						/>

						<!-- Info overlay -->
						<g transform="translate({canvasWidth - 160}, 20)">
							<rect x="0" y="0" width="150" height="100" fill="#1F2937" fill-opacity="0.9" rx="8" />
							<text x="10" y="22" fill="#F59E0B" font-size="11" font-weight="bold">Current State</text>
							<text x="10" y="40" fill="#D1D5DB" font-size="10">Time: {state.currentTime.toFixed(2)}s</text>
							<text x="10" y="55" fill="#D1D5DB" font-size="10">X: {state.projectileX.toFixed(1)}m</text>
							<text x="10" y="70" fill="#D1D5DB" font-size="10">Y: {state.projectileY.toFixed(1)}m</text>
							<text x="10" y="88" fill="#9CA3AF" font-size="9">{state.selectedPlanet.name} (g={state.gravity})</text>
						</g>
					</svg>
				</LabCanvas>

				<!-- Controls -->
				<div class="glass-strong rounded-2xl border border-white/10 p-4 space-y-4">
					<!-- Launch controls -->
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="velocity-slider" class="text-sm text-gray-400 block mb-2">Initial Velocity: {state.initialVelocity} m/s</label>
							<input
								id="velocity-slider"
								type="range"
								min="5"
								max="50"
								value={state.initialVelocity}
								oninput={(e) => state = setVelocity(state, parseInt(e.currentTarget.value))}
								disabled={state.isLaunched}
								class="w-full accent-amber-500"
							/>
						</div>
						<div>
							<label for="angle-slider" class="text-sm text-gray-400 block mb-2">Launch Angle: {state.launchAngle}°</label>
							<input
								id="angle-slider"
								type="range"
								min="0"
								max="90"
								value={state.launchAngle}
								oninput={(e) => state = setAngle(state, parseInt(e.currentTarget.value))}
								disabled={state.isLaunched}
								class="w-full accent-amber-500"
							/>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="planet-select" class="text-sm text-gray-400 block mb-2">Planet</label>
							<select
								id="planet-select"
								value={state.selectedPlanet.id}
								onchange={(e) => state = selectPlanet(state, e.currentTarget.value)}
								disabled={state.isLaunched}
								class="w-full glass rounded-lg px-3 py-2 text-white text-sm border border-white/10"
							>
								{#each PLANETS as planet}
									<option value={planet.id}>{planet.name} (g={planet.gravity})</option>
								{/each}
							</select>
						</div>
						<div>
							<label for="height-slider" class="text-sm text-gray-400 block mb-2">Launch Height: {state.launchHeight}m</label>
							<input
								id="height-slider"
								type="range"
								min="0"
								max="20"
								value={state.launchHeight}
								oninput={(e) => state = setLaunchHeight(state, parseInt(e.currentTarget.value))}
								disabled={state.isLaunched}
								class="w-full accent-amber-500"
							/>
						</div>
					</div>

					<!-- Presets -->
					<div>
						<span class="text-sm text-gray-400 block mb-2">Quick Presets</span>
						<div class="flex flex-wrap gap-2">
							{#each PRESETS as preset}
								<button
									onclick={() => state = applyPreset(state, preset)}
									disabled={state.isLaunched}
									class="px-3 py-1 text-xs rounded-lg glass border border-white/10 text-gray-300 hover:border-amber-500/50 hover:text-amber-400 disabled:opacity-50 transition-colors"
								>
									{preset.name}
								</button>
							{/each}
						</div>
					</div>

					<!-- Action buttons -->
					<div class="flex gap-3">
						<button
							onclick={handleLaunch}
							disabled={state.isLaunched}
							class="flex-1 btn-primary disabled:opacity-50"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
							Launch
						</button>
						<button
							onclick={handleReset}
							class="flex-1 btn-secondary"
						>
							Reset
						</button>
						<button
							onclick={handleRecord}
							disabled={state.trajectory.length === 0}
							class="flex-1 btn-secondary disabled:opacity-50"
						>
							Record
						</button>
					</div>

					<!-- Theoretical values -->
					<div class="glass rounded-xl p-3 border border-white/5">
						<h4 class="text-sm font-semibold text-white mb-2">Theoretical Predictions</h4>
						<div class="grid grid-cols-3 gap-4 text-sm">
							<div>
								<span class="text-gray-400">Range:</span>
								<span class="text-amber-400 ml-2">{theoretical.range.toFixed(2)}m</span>
							</div>
							<div>
								<span class="text-gray-400">Max Height:</span>
								<span class="text-amber-400 ml-2">{theoretical.maxHeight.toFixed(2)}m</span>
							</div>
							<div>
								<span class="text-gray-400">Flight Time:</span>
								<span class="text-amber-400 ml-2">{theoretical.flightTime.toFixed(2)}s</span>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<!-- Quiz Section -->
				<div class="glass-strong rounded-2xl border border-white/10 p-6">
					<h3 class="text-xl font-display font-semibold text-white mb-6">Knowledge Quiz</h3>
					<div class="space-y-6">
						{#each PROJECTILE_QUIZ as question}
							<div class="glass rounded-xl p-4 border border-white/5">
								<p class="text-white font-medium mb-3">{question.question}</p>
								<div class="grid grid-cols-2 gap-2">
									{#each question.options as option}
										<button
											onclick={() => handleQuizAnswer(question.id, option)}
											class="p-2 rounded-lg text-sm text-left transition-all {quizAnswers.get(question.id) === option ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'glass border border-white/10 text-gray-300 hover:border-amber-500/30'}"
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

			<!-- Toggle Quiz Button -->
			<button onclick={() => showQuiz = !showQuiz} class="w-full btn-secondary">
				{showQuiz ? 'Back to Simulation' : 'Take Quiz'}
			</button>

			<!-- Results -->
			{#if showResults}
				<div class="glass-strong rounded-2xl p-6 border border-white/10 animate-fade-in-up">
					<h3 class="text-xl font-display font-semibold text-white mb-4">Lab Results</h3>
					<div class="grid grid-cols-2 gap-4 mb-6">
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Overall Score</p>
							<p class="text-2xl font-bold text-white">{analysis.score}%</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Grade</p>
							<p class="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">{analysis.grade}</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Quiz Score</p>
							<p class="text-2xl font-bold text-white">{analysis.quizScore.correct}/{analysis.quizScore.total}</p>
						</div>
						<div class="glass rounded-xl p-4 border border-white/5">
							<p class="text-sm text-gray-400">Measurements</p>
							<p class="text-2xl font-bold text-white">{state.measurements.length}</p>
						</div>
					</div>
					<p class="text-gray-400 mb-6">{analysis.feedback}</p>
					<div class="flex gap-3">
						<button onclick={() => { state = createInitialState({ initialVelocity: 20, launchAngle: 45, gravity: 9.8, launchHeight: 0 }); quizAnswers = new Map(); showResults = false; showQuiz = false; labStore.reset(); }} class="btn-secondary flex-1">Try Again</button>
						<a href="/dashboard" class="btn-primary flex-1 text-center">Dashboard</a>
					</div>
				</div>
			{/if}
		</div>

		<!-- Right: Data & Info -->
		<div class="lg:col-span-1 space-y-6">
			<!-- Measurements Table -->
			<div class="glass-strong rounded-2xl p-5 border border-white/10">
				<div class="flex justify-between items-center mb-4">
					<h4 class="text-sm font-semibold text-white">Recorded Data</h4>
					{#if state.measurements.length > 0}
						<button onclick={() => state = clearMeasurements(state)} class="text-xs text-gray-400 hover:text-red-400">Clear</button>
					{/if}
				</div>
				{#if state.measurements.length === 0}
					<p class="text-sm text-gray-500">No measurements recorded yet. Launch projectiles and click Record.</p>
				{:else}
					<div class="space-y-2 max-h-48 overflow-y-auto">
						{#each state.measurements as m, i}
							<div class="glass rounded-lg p-2 text-xs border border-white/5">
								<div class="flex justify-between text-gray-400">
									<span>#{i + 1}</span>
									<span>{m.angle}° @ {m.velocity}m/s</span>
								</div>
								<div class="flex justify-between mt-1">
									<span class="text-gray-500">Range:</span>
									<span class="text-amber-400">{m.measuredRange.toFixed(1)}m</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-500">Max H:</span>
									<span class="text-amber-400">{m.measuredMaxHeight.toFixed(1)}m</span>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Challenge Mode -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<h4 class="text-sm font-semibold text-white mb-3">Challenge Mode</h4>
				<p class="text-xs text-gray-400 mb-3">Set a target distance and try to hit it!</p>
				<div class="flex gap-2 mb-3">
					<input
						type="number"
						placeholder="Distance (m)"
						min="10"
						max="200"
						class="flex-1 glass rounded-lg px-3 py-2 text-sm text-white border border-white/10"
						onchange={(e) => state = setTarget(state, e.currentTarget.value ? parseFloat(e.currentTarget.value) : null)}
					/>
				</div>
				{#if state.targetDistance !== null}
					<div class="text-sm">
						<span class="text-gray-400">Target: {state.targetDistance}m</span>
						<span class="text-amber-400 ml-4">Hits: {state.hits}/{state.attempts}</span>
					</div>
				{/if}
			</div>

			<!-- Key Equations -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<h4 class="text-sm font-semibold text-white mb-3">Key Equations</h4>
				<div class="space-y-2 text-xs text-gray-400 font-mono">
					<p>x = v₀ · cos(θ) · t</p>
					<p>y = v₀ · sin(θ) · t - ½gt²</p>
					<p>R = v₀² · sin(2θ) / g</p>
					<p>H = v₀² · sin²(θ) / 2g</p>
				</div>
			</div>

			<!-- Settings -->
			<div class="glass rounded-2xl p-5 border border-white/5">
				<h4 class="text-sm font-semibold text-white mb-3">Display Options</h4>
				<label class="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
					<input
						type="checkbox"
						checked={state.showTheoretical}
						onchange={() => state = toggleTheoretical(state)}
						class="accent-amber-500"
					/>
					Show theoretical trajectory
				</label>
				<div class="mt-3">
					<label for="speed-slider" class="text-xs text-gray-400 block mb-1">Animation Speed: {state.animationSpeed}x</label>
					<input
						id="speed-slider"
						type="range"
						min="0.25"
						max="3"
						step="0.25"
						value={state.animationSpeed}
						oninput={(e) => state = setAnimationSpeed(state, parseFloat(e.currentTarget.value))}
						class="w-full accent-amber-500"
					/>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Collaboration Panel -->
<CollaborationPanel />
