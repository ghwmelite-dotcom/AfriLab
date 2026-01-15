<script lang="ts">
	import { formatDuration, getDifficultyColor } from '$lib/utils/helpers';
	import type { PageData } from './$types';

	export let data: PageData;

	const disciplines = [
		{ id: 'all', name: 'All Labs', count: 12 },
		{ id: 'chem', name: 'Chemistry', count: 4 },
		{ id: 'bio', name: 'Biology', count: 3 },
		{ id: 'phys', name: 'Physics', count: 2 },
		{ id: 'pharm', name: 'Pharmacy', count: 2 },
		{ id: 'med', name: 'Medical', count: 1 }
	];

	let selectedDiscipline = 'all';
	let searchQuery = '';

	// Mock data for now
	const experiments = [
		{
			id: 'chem-titration-01',
			title: 'Acid-Base Titration',
			description: 'Learn volumetric analysis by performing an acid-base titration with phenolphthalein indicator.',
			discipline: 'Chemistry',
			disciplineId: 'chem',
			difficulty: 'beginner',
			duration: 45,
			thumbnail: null
		},
		{
			id: 'chem-spectro-01',
			title: 'UV-Vis Spectroscopy',
			description: 'Understand light absorption and Beer-Lambert law through spectroscopy simulation.',
			discipline: 'Chemistry',
			disciplineId: 'chem',
			difficulty: 'intermediate',
			duration: 60,
			thumbnail: null
		},
		{
			id: 'bio-micro-01',
			title: 'Microscopy Basics',
			description: 'Learn to use a compound microscope and identify cell structures.',
			discipline: 'Biology',
			disciplineId: 'bio',
			difficulty: 'beginner',
			duration: 30,
			thumbnail: null
		},
		{
			id: 'pharm-compound-01',
			title: 'Drug Compounding',
			description: 'Practice pharmaceutical compounding techniques and dosage calculations.',
			discipline: 'Pharmacy',
			disciplineId: 'pharm',
			difficulty: 'intermediate',
			duration: 60,
			thumbnail: null
		}
	];

	$: filteredExperiments = experiments.filter(exp => {
		const matchesDiscipline = selectedDiscipline === 'all' || exp.disciplineId === selectedDiscipline;
		const matchesSearch = !searchQuery ||
			exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			exp.description.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesDiscipline && matchesSearch;
	});
</script>

<svelte:head>
	<title>Labs - AfriLab</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Laboratory Experiments</h1>
			<p class="text-gray-600 dark:text-gray-400">Choose an experiment to begin your virtual lab session</p>
		</div>
	</div>

	<!-- Filters -->
	<div class="flex flex-col sm:flex-row gap-4">
		<!-- Search -->
		<div class="relative flex-1">
			<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
			<input
				type="text"
				placeholder="Search experiments..."
				class="input pl-10"
				bind:value={searchQuery}
			/>
		</div>

		<!-- Discipline filter -->
		<div class="flex gap-2 overflow-x-auto pb-2">
			{#each disciplines as discipline}
				<button
					onclick={() => selectedDiscipline = discipline.id}
					class="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
						{selectedDiscipline === discipline.id
						? 'bg-primary-600 text-white'
						: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'}"
				>
					{discipline.name}
					<span class="ml-1 text-xs opacity-70">({discipline.count})</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Experiments Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each filteredExperiments as experiment}
			<a href="/labs/chemistry/titration" class="card overflow-hidden hover:shadow-lg transition-shadow group">
				<!-- Thumbnail -->
				<div class="h-40 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
					<svg class="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
					</svg>
				</div>

				<!-- Content -->
				<div class="p-5">
					<div class="flex items-center gap-2 mb-2">
						<span class="text-xs font-medium text-primary-600 dark:text-primary-400">
							{experiment.discipline}
						</span>
						<span class="text-gray-300 dark:text-gray-600">|</span>
						<span class="text-xs px-2 py-0.5 rounded-full {getDifficultyColor(experiment.difficulty)}">
							{experiment.difficulty}
						</span>
					</div>

					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
						{experiment.title}
					</h3>

					<p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
						{experiment.description}
					</p>

					<div class="flex items-center justify-between">
						<div class="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							{formatDuration(experiment.duration)}
						</div>

						<span class="btn-primary py-1.5 px-3 text-sm">
							Start Lab
						</span>
					</div>
				</div>
			</a>
		{/each}
	</div>

	{#if filteredExperiments.length === 0}
		<div class="text-center py-12">
			<svg class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">No experiments found</h3>
			<p class="text-gray-600 dark:text-gray-400">Try adjusting your filters or search query</p>
		</div>
	{/if}
</div>
