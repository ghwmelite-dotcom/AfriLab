<script lang="ts">
	import { onMount } from 'svelte';
	import { formatDuration, getDifficultyColor } from '$lib/utils/helpers';
	import type { PageData } from './$types';

	export let data: PageData;

	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	const disciplines = [
		{ id: 'all', name: 'All Labs', count: 12, icon: '🔬' },
		{ id: 'chem', name: 'Chemistry', count: 4, icon: '🧪' },
		{ id: 'bio', name: 'Biology', count: 3, icon: '🧬' },
		{ id: 'phys', name: 'Physics', count: 2, icon: '⚡' },
		{ id: 'pharm', name: 'Pharmacy', count: 2, icon: '💊' },
		{ id: 'med', name: 'Medical', count: 1, icon: '🩺' }
	];

	let selectedDiscipline = 'all';
	let searchQuery = '';

	// Lab experiments with proper routing
	const experiments = [
		{
			id: 'chem-titration-01',
			title: 'Acid-Base Titration',
			description: 'Learn volumetric analysis by performing an acid-base titration with phenolphthalein indicator.',
			discipline: 'Chemistry',
			disciplineId: 'chem',
			difficulty: 'beginner',
			duration: 45,
			href: '/labs/chemistry/titration',
			gradient: 'from-emerald-500 to-cyan-500',
			icon: '🧪'
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
			gradient: 'from-purple-500 to-pink-500',
			icon: '🌈'
		},
		{
			id: 'bio-micro-01',
			title: 'Microscopy Basics',
			description: 'Learn to use a compound microscope and identify cell structures.',
			discipline: 'Biology',
			disciplineId: 'bio',
			difficulty: 'beginner',
			duration: 30,
			href: '#',
			gradient: 'from-green-500 to-emerald-500',
			icon: '🔬',
			comingSoon: true
		},
		{
			id: 'bio-cell-01',
			title: 'Cell Division',
			description: 'Observe and understand mitosis and meiosis in simulated cell cultures.',
			discipline: 'Biology',
			disciplineId: 'bio',
			difficulty: 'intermediate',
			duration: 45,
			href: '#',
			gradient: 'from-teal-500 to-green-500',
			icon: '🧬',
			comingSoon: true
		},
		{
			id: 'phys-ohm-01',
			title: "Ohm's Law Verification",
			description: 'Verify the linear relationship between voltage and current in resistive circuits.',
			discipline: 'Physics',
			disciplineId: 'phys',
			difficulty: 'beginner',
			duration: 35,
			href: '#',
			gradient: 'from-amber-500 to-orange-500',
			icon: '⚡',
			comingSoon: true
		},
		{
			id: 'pharm-compound-01',
			title: 'Drug Compounding',
			description: 'Practice pharmaceutical compounding techniques and dosage calculations.',
			discipline: 'Pharmacy',
			disciplineId: 'pharm',
			difficulty: 'intermediate',
			duration: 60,
			href: '#',
			gradient: 'from-rose-500 to-pink-500',
			icon: '💊',
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
