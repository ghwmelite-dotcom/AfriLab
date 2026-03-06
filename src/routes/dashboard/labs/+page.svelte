<script lang="ts">
	import { onMount } from 'svelte';
	import { formatDuration, getDifficultyColor } from '$lib/utils/helpers';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	const disciplines = [
		{ id: 'all', name: 'All Labs', count: 28, icon: '🔬' },
		{ id: 'chem', name: 'Chemistry', count: 6, icon: '🧪' },
		{ id: 'bio', name: 'Biology', count: 7, icon: '🧬' },
		{ id: 'phys', name: 'Physics', count: 6, icon: '⚡' },
		{ id: 'pharm', name: 'Pharmacy', count: 5, icon: '💊' },
		{ id: 'med', name: 'Medical', count: 5, icon: '🩺' }
	];

	let selectedDiscipline = $state('all');
	let searchQuery = $state('');

	// Lab experiments with proper routing
	const experiments = [
		// Chemistry
		{
			id: 'chem-titration-01',
			title: 'Acid-Base Titration',
			description: 'Learn volumetric analysis by performing an acid-base titration with phenolphthalein indicator.',
			discipline: 'Chemistry',
			disciplineId: 'chem',
			difficulty: 'beginner',
			duration: 45,
			href: '/labs/chemistry/titration',
			gradient: 'from-cyan-500 to-blue-500',
			icon: '🧪'
		},
		{
			id: 'chem-chromatography-01',
			title: 'Chromatography Techniques',
			description: 'Separate and identify mixture components using paper chromatography and thin-layer chromatography.',
			discipline: 'Chemistry',
			disciplineId: 'chem',
			difficulty: 'beginner',
			duration: 40,
			href: '/labs/chemistry/chromatography',
			gradient: 'from-teal-500 to-cyan-500',
			icon: '🎨',
			comingSoon: true
		},
		{
			id: 'chem-spectro-01',
			title: 'UV-Vis Spectroscopy',
			description: 'Understand light absorption and Beer-Lambert law through spectroscopy simulation.',
			discipline: 'Chemistry',
			disciplineId: 'chem',
			difficulty: 'intermediate',
			duration: 60,
			href: '/labs/chemistry/spectroscopy',
			gradient: 'from-violet-500 to-purple-500',
			icon: '🌈'
		},
		{
			id: 'chem-organic-01',
			title: 'Organic Synthesis: Aspirin',
			description: 'Synthesize acetylsalicylic acid from salicylic acid and acetic anhydride, then test purity.',
			discipline: 'Chemistry',
			disciplineId: 'chem',
			difficulty: 'intermediate',
			duration: 60,
			href: '/labs/chemistry/organic-synthesis',
			gradient: 'from-emerald-500 to-teal-500',
			icon: '💊',
			comingSoon: true
		},
		{
			id: 'chem-electro-01',
			title: 'Electrochemistry & Galvanic Cells',
			description: 'Build galvanic cells, measure cell potentials, and verify the electrochemical series.',
			discipline: 'Chemistry',
			disciplineId: 'chem',
			difficulty: 'intermediate',
			duration: 50,
			href: '/labs/chemistry/electrochemistry',
			gradient: 'from-amber-500 to-yellow-500',
			icon: '🔋',
			comingSoon: true
		},
		{
			id: 'chem-thermo-01',
			title: 'Calorimetry & Thermochemistry',
			description: 'Measure enthalpy changes for chemical reactions and apply Hess\'s Law.',
			discipline: 'Chemistry',
			disciplineId: 'chem',
			difficulty: 'advanced',
			duration: 55,
			href: '/labs/chemistry/calorimetry',
			gradient: 'from-orange-500 to-red-500',
			icon: '🔥',
			comingSoon: true
		},
		// Biology
		{
			id: 'bio-micro-01',
			title: 'Microscopy Basics',
			description: 'Learn to operate a compound microscope and identify cell structures in biological samples.',
			discipline: 'Biology',
			disciplineId: 'bio',
			difficulty: 'beginner',
			duration: 30,
			href: '/labs/biology/microscopy',
			gradient: 'from-emerald-500 to-green-500',
			icon: '🔬'
		},
		{
			id: 'bio-genetics-01',
			title: 'Mendelian Genetics',
			description: 'Simulate genetic crosses to understand inheritance patterns and Punnett squares.',
			discipline: 'Biology',
			disciplineId: 'bio',
			difficulty: 'beginner',
			duration: 35,
			href: '/labs/biology/genetics',
			gradient: 'from-lime-500 to-emerald-500',
			icon: '🧬',
			comingSoon: true
		},
		{
			id: 'bio-cell-01',
			title: 'Cell Division (Mitosis)',
			description: 'Observe and identify the phases of mitosis in dividing cells.',
			discipline: 'Biology',
			disciplineId: 'bio',
			difficulty: 'intermediate',
			duration: 45,
			href: '/labs/biology/cell-division',
			gradient: 'from-green-500 to-teal-500',
			icon: '🦠'
		},
		{
			id: 'bio-enzyme-01',
			title: 'Enzyme Kinetics',
			description: 'Study effects of temperature, pH, and substrate concentration on enzyme activity.',
			discipline: 'Biology',
			disciplineId: 'bio',
			difficulty: 'intermediate',
			duration: 45,
			href: '/labs/biology/enzyme-kinetics',
			gradient: 'from-teal-500 to-cyan-500',
			icon: '⚗️',
			comingSoon: true
		},
		{
			id: 'bio-photosynthesis-01',
			title: 'Photosynthesis & Light Reactions',
			description: 'Investigate the effect of light intensity on the rate of photosynthesis.',
			discipline: 'Biology',
			disciplineId: 'bio',
			difficulty: 'intermediate',
			duration: 50,
			href: '/labs/biology/photosynthesis',
			gradient: 'from-yellow-500 to-green-500',
			icon: '🌿',
			comingSoon: true
		},
		{
			id: 'bio-dna-01',
			title: 'DNA Extraction & Electrophoresis',
			description: 'Extract DNA from biological samples and separate fragments using gel electrophoresis.',
			discipline: 'Biology',
			disciplineId: 'bio',
			difficulty: 'advanced',
			duration: 60,
			href: '/labs/biology/dna-extraction',
			gradient: 'from-cyan-500 to-blue-500',
			icon: '🧬',
			comingSoon: true
		},
		{
			id: 'bio-ecology-01',
			title: 'Ecosystem Simulation',
			description: 'Model population dynamics, food webs, and energy flow through a virtual ecosystem.',
			discipline: 'Biology',
			disciplineId: 'bio',
			difficulty: 'advanced',
			duration: 55,
			href: '/labs/biology/ecosystem',
			gradient: 'from-green-600 to-emerald-600',
			icon: '🌍',
			comingSoon: true
		},
		// Physics
		{
			id: 'phys-ohm-01',
			title: "Ohm's Law Verification",
			description: 'Verify the linear relationship between voltage and current in resistive circuits.',
			discipline: 'Physics',
			disciplineId: 'phys',
			difficulty: 'beginner',
			duration: 35,
			href: '/labs/physics/ohms-law',
			gradient: 'from-amber-500 to-orange-500',
			icon: '⚡'
		},
		{
			id: 'phys-pendulum-01',
			title: 'Simple Pendulum & SHM',
			description: 'Investigate simple harmonic motion and verify the pendulum equation.',
			discipline: 'Physics',
			disciplineId: 'phys',
			difficulty: 'beginner',
			duration: 30,
			href: '/labs/physics/pendulum',
			gradient: 'from-yellow-500 to-amber-500',
			icon: '🕐',
			comingSoon: true
		},
		{
			id: 'phys-projectile-01',
			title: 'Projectile Motion',
			description: 'Launch projectiles at different angles to explore kinematic equations and trajectories.',
			discipline: 'Physics',
			disciplineId: 'phys',
			difficulty: 'intermediate',
			duration: 45,
			href: '/labs/physics/projectile-motion',
			gradient: 'from-orange-500 to-red-500',
			icon: '🚀'
		},
		{
			id: 'phys-waves-01',
			title: 'Wave Motion & Interference',
			description: 'Explore wave properties and observe constructive and destructive interference patterns.',
			discipline: 'Physics',
			disciplineId: 'phys',
			difficulty: 'intermediate',
			duration: 40,
			href: '/labs/physics/wave-motion',
			gradient: 'from-blue-500 to-indigo-500',
			icon: '🌊',
			comingSoon: true
		},
		{
			id: 'phys-optics-01',
			title: 'Optics: Lenses & Mirrors',
			description: 'Investigate image formation and verify the thin lens equation.',
			discipline: 'Physics',
			disciplineId: 'phys',
			difficulty: 'intermediate',
			duration: 45,
			href: '/labs/physics/optics',
			gradient: 'from-violet-500 to-purple-500',
			icon: '🔭',
			comingSoon: true
		},
		{
			id: 'phys-thermo-01',
			title: 'Thermodynamics & Heat Transfer',
			description: 'Investigate heat transfer modes and verify the laws of thermodynamics.',
			discipline: 'Physics',
			disciplineId: 'phys',
			difficulty: 'advanced',
			duration: 50,
			href: '/labs/physics/thermodynamics',
			gradient: 'from-red-500 to-rose-500',
			icon: '🌡️',
			comingSoon: true
		},
		// Pharmacy
		{
			id: 'pharm-dosage-01',
			title: 'Dosage Calculations',
			description: 'Practice pharmaceutical dosage calculations for different patient populations.',
			discipline: 'Pharmacy',
			disciplineId: 'pharm',
			difficulty: 'beginner',
			duration: 40,
			href: '/labs/pharmacy/dosage-calculations',
			gradient: 'from-fuchsia-500 to-pink-500',
			icon: '🔢',
			comingSoon: true
		},
		{
			id: 'pharm-compound-01',
			title: 'Pharmaceutical Compounding',
			description: 'Practice pharmaceutical compounding techniques and medication preparation.',
			discipline: 'Pharmacy',
			disciplineId: 'pharm',
			difficulty: 'intermediate',
			duration: 60,
			href: '/labs/pharmacy/compounding',
			gradient: 'from-pink-500 to-rose-500',
			icon: '💊'
		},
		{
			id: 'pharm-interaction-01',
			title: 'Drug Interactions',
			description: 'Analyze potential drug-drug and drug-food interactions using virtual patient reviews.',
			discipline: 'Pharmacy',
			disciplineId: 'pharm',
			difficulty: 'intermediate',
			duration: 50,
			href: '/labs/pharmacy/drug-interactions',
			gradient: 'from-rose-500 to-red-500',
			icon: '⚠️',
			comingSoon: true
		},
		{
			id: 'pharm-quality-01',
			title: 'Quality Control Testing',
			description: 'Perform quality control tests including dissolution, uniformity, and stability testing.',
			discipline: 'Pharmacy',
			disciplineId: 'pharm',
			difficulty: 'advanced',
			duration: 55,
			href: '/labs/pharmacy/quality-control',
			gradient: 'from-purple-500 to-violet-500',
			icon: '✅',
			comingSoon: true
		},
		{
			id: 'pharm-pharma-01',
			title: 'Pharmacokinetics Simulation',
			description: 'Model drug ADME using compartmental pharmacokinetic models.',
			discipline: 'Pharmacy',
			disciplineId: 'pharm',
			difficulty: 'advanced',
			duration: 60,
			href: '/labs/pharmacy/pharmacokinetics',
			gradient: 'from-indigo-500 to-blue-500',
			icon: '📈',
			comingSoon: true
		},
		// Medical Sciences
		{
			id: 'med-vital-01',
			title: 'Vital Signs Assessment',
			description: 'Measure and interpret patient vital signs including blood pressure and heart rate.',
			discipline: 'Medical',
			disciplineId: 'med',
			difficulty: 'beginner',
			duration: 30,
			href: '/labs/medical/vital-signs',
			gradient: 'from-rose-500 to-red-500',
			icon: '🩺'
		},
		{
			id: 'med-blood-01',
			title: 'Blood Typing & Analysis',
			description: 'Determine blood types using antigen-antibody reactions and understand compatibility.',
			discipline: 'Medical',
			disciplineId: 'med',
			difficulty: 'beginner',
			duration: 35,
			href: '/labs/medical/blood-analysis',
			gradient: 'from-red-500 to-rose-500',
			icon: '🩸',
			comingSoon: true
		},
		{
			id: 'med-ecg-01',
			title: 'ECG Reading & Interpretation',
			description: 'Read and interpret ECG traces, identifying normal rhythm and common arrhythmias.',
			discipline: 'Medical',
			disciplineId: 'med',
			difficulty: 'intermediate',
			duration: 45,
			href: '/labs/medical/ecg-reading',
			gradient: 'from-pink-500 to-fuchsia-500',
			icon: '❤️',
			comingSoon: true
		},
		{
			id: 'med-patient-01',
			title: 'Patient Assessment & History',
			description: 'Practice systematic patient assessment including history taking and clinical reasoning.',
			discipline: 'Medical',
			disciplineId: 'med',
			difficulty: 'intermediate',
			duration: 50,
			href: '/labs/medical/patient-assessment',
			gradient: 'from-orange-500 to-amber-500',
			icon: '📋',
			comingSoon: true
		},
		{
			id: 'med-auscultation-01',
			title: 'Heart & Lung Auscultation',
			description: 'Identify normal and abnormal heart and lung sounds using virtual patients.',
			discipline: 'Medical',
			disciplineId: 'med',
			difficulty: 'advanced',
			duration: 45,
			href: '/labs/medical/auscultation',
			gradient: 'from-violet-500 to-purple-500',
			icon: '🫀',
			comingSoon: true
		}
	];

	let filteredExperiments = $derived(experiments.filter(exp => {
		const matchesDiscipline = selectedDiscipline === 'all' || exp.disciplineId === selectedDiscipline;
		const matchesSearch = !searchQuery ||
			exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			exp.description.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesDiscipline && matchesSearch;
	}));

	function getDifficultyStyle(difficulty: string) {
		switch (difficulty) {
			case 'beginner':
				return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
			case 'intermediate':
				return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
			case 'advanced':
				return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
			default:
				return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
		}
	}
</script>

<svelte:head>
	<title>Labs - AfriLab</title>
</svelte:head>

<!-- Ambient background -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-50"></div>
	<div class="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-b from-cyan-500/10 to-transparent rounded-full blur-3xl"></div>
	<div class="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-t from-emerald-500/10 to-transparent rounded-full blur-3xl"></div>
</div>

<div class="relative space-y-6 p-6 sm:p-8">
	<!-- Header -->
	<div class="{mounted ? 'animate-fade-in-up' : 'opacity-0'}">
		<div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
			<a href="/dashboard" class="hover:text-emerald-400 transition-colors">Dashboard</a>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
			<span class="text-emerald-400">Labs</span>
		</div>
		<h1 class="text-3xl font-display font-bold text-white">
			Laboratory <span class="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Experiments</span>
		</h1>
		<p class="mt-2 text-gray-400">Choose an experiment to begin your virtual lab session</p>
	</div>

	<!-- Search and Filters -->
	<div class="flex flex-col sm:flex-row gap-4 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.1s;">
		<!-- Search -->
		<div class="relative flex-1">
			<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
				<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>
			<input
				type="text"
				placeholder="Search experiments..."
				class="input pl-12 w-full"
				bind:value={searchQuery}
			/>
		</div>

		<!-- Discipline filter -->
		<div class="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
			{#each disciplines as discipline}
				<button
					onclick={() => selectedDiscipline = discipline.id}
					class="px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2
						{selectedDiscipline === discipline.id
						? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
						: 'glass border border-white/10 text-gray-400 hover:text-white hover:border-white/20'}"
				>
					<span>{discipline.icon}</span>
					<span>{discipline.name}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Experiments Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.15s;">
		{#each filteredExperiments as experiment}
			<a
				href={experiment.comingSoon ? '#' : experiment.href}
				class="group glass-strong rounded-2xl overflow-hidden border border-white/5 hover:border-emerald-500/30 transition-all
					{experiment.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}"
			>
				<!-- Thumbnail -->
				<div class="relative h-44 bg-gradient-to-br {experiment.gradient} flex items-center justify-center overflow-hidden">
					<!-- Animated background -->
					<div class="absolute inset-0 opacity-30">
						<div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform group-hover:scale-150 transition-transform duration-500"></div>
						<div class="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
					</div>

					<!-- Icon -->
					<span class="text-6xl transform group-hover:scale-110 transition-transform duration-300">{experiment.icon}</span>

					<!-- Coming soon badge -->
					{#if experiment.comingSoon}
						<div class="absolute top-3 right-3 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium text-white">
							Coming Soon
						</div>
					{/if}
				</div>

				<!-- Content -->
				<div class="p-5">
					<div class="flex items-center gap-2 mb-3">
						<span class="text-xs font-medium text-emerald-400">
							{experiment.discipline}
						</span>
						<span class="text-gray-600">•</span>
						<span class="text-xs px-2 py-0.5 rounded-full border {getDifficultyStyle(experiment.difficulty)}">
							{experiment.difficulty}
						</span>
					</div>

					<h3 class="text-lg font-display font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
						{experiment.title}
					</h3>

					<p class="text-sm text-gray-400 mb-4 line-clamp-2">
						{experiment.description}
					</p>

					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2 text-sm text-gray-500">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							{formatDuration(experiment.duration)}
						</div>

						{#if !experiment.comingSoon}
							<span class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-cyan-500 text-white group-hover:shadow-lg group-hover:shadow-emerald-500/25 transition-all">
								Start Lab
								<svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
								</svg>
							</span>
						{:else}
							<span class="px-4 py-2 rounded-xl text-sm font-medium glass border border-white/10 text-gray-500">
								Notify Me
							</span>
						{/if}
					</div>
				</div>
			</a>
		{/each}
	</div>

	{#if filteredExperiments.length === 0}
		<div class="text-center py-16 glass rounded-2xl border border-white/5">
			<svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<h3 class="text-xl font-display font-semibold text-white mb-2">No experiments found</h3>
			<p class="text-gray-400">Try adjusting your filters or search query</p>
		</div>
	{/if}
</div>
