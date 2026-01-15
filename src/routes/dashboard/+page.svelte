<script lang="ts">
	import { currentUser } from '$stores/user';
	import { formatDuration, formatScore, getDifficultyColor } from '$lib/utils/helpers';
	import type { PageData } from './$types';

	export let data: PageData;

	const quickActions = [
		{
			title: 'Continue Lab',
			description: 'Resume your last experiment',
			icon: 'play',
			href: '/labs/chemistry/titration',
			color: 'bg-primary-600'
		},
		{
			title: 'New Experiment',
			description: 'Start a fresh lab session',
			icon: 'plus',
			href: '/dashboard/labs',
			color: 'bg-blue-600'
		},
		{
			title: 'View Progress',
			description: 'Check your learning analytics',
			icon: 'chart',
			href: '/dashboard/progress',
			color: 'bg-amber-600'
		}
	];

	const recommendedLabs = [
		{
			title: 'Acid-Base Titration',
			discipline: 'Chemistry',
			difficulty: 'beginner',
			duration: 45,
			progress: 0
		},
		{
			title: 'Microscopy Basics',
			discipline: 'Biology',
			difficulty: 'beginner',
			duration: 30,
			progress: 0
		},
		{
			title: 'Drug Interactions',
			discipline: 'Pharmacy',
			difficulty: 'intermediate',
			duration: 60,
			progress: 0
		}
	];
</script>

<svelte:head>
	<title>Dashboard - AfriLab</title>
</svelte:head>

<div class="space-y-6">
	<!-- Welcome Section -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
				Welcome back, {$currentUser?.firstName}!
			</h1>
			<p class="text-gray-600 dark:text-gray-400">
				Ready to continue your virtual laboratory journey?
			</p>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
		<div class="card p-5">
			<div class="flex items-center gap-4">
				<div class="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
					<svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<div>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">{data.stats?.completedLabs ?? 0}</p>
					<p class="text-sm text-gray-500 dark:text-gray-400">Completed Labs</p>
				</div>
			</div>
		</div>

		<div class="card p-5">
			<div class="flex items-center gap-4">
				<div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
					<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
				<div>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">{data.stats?.inProgressLabs ?? 0}</p>
					<p class="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
				</div>
			</div>
		</div>

		<div class="card p-5">
			<div class="flex items-center gap-4">
				<div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
					<svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
					</svg>
				</div>
				<div>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">
						{data.stats?.averageScore ? formatScore(data.stats.averageScore) : 'N/A'}
					</p>
					<p class="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
				</div>
			</div>
		</div>

		<div class="card p-5">
			<div class="flex items-center gap-4">
				<div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
					<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<div>
					<p class="text-2xl font-bold text-gray-900 dark:text-white">
						{formatDuration(Math.floor((data.stats?.timeSpent ?? 0) / 60))}
					</p>
					<p class="text-sm text-gray-500 dark:text-gray-400">Time in Labs</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		{#each quickActions as action}
			<a
				href={action.href}
				class="card p-5 hover:shadow-lg transition-shadow group"
			>
				<div class="flex items-start gap-4">
					<div class="w-10 h-10 {action.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							{#if action.icon === 'play'}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							{:else if action.icon === 'plus'}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							{:else}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							{/if}
						</svg>
					</div>
					<div>
						<h3 class="font-semibold text-gray-900 dark:text-white">{action.title}</h3>
						<p class="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
					</div>
				</div>
			</a>
		{/each}
	</div>

	<!-- Recommended Labs -->
	<div class="card">
		<div class="p-5 border-b border-gray-200 dark:border-gray-700">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Recommended Labs</h2>
				<a href="/dashboard/labs" class="text-sm text-primary-600 hover:text-primary-700">
					View all
				</a>
			</div>
		</div>
		<div class="divide-y divide-gray-200 dark:divide-gray-700">
			{#each recommendedLabs as lab}
				<a href="/labs/chemistry/titration" class="block p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-4">
							<div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
								<svg class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
								</svg>
							</div>
							<div>
								<h3 class="font-medium text-gray-900 dark:text-white">{lab.title}</h3>
								<div class="flex items-center gap-3 mt-1">
									<span class="text-sm text-gray-500 dark:text-gray-400">{lab.discipline}</span>
									<span class="text-gray-300 dark:text-gray-600">|</span>
									<span class="text-sm px-2 py-0.5 rounded-full {getDifficultyColor(lab.difficulty)}">
										{lab.difficulty}
									</span>
									<span class="text-gray-300 dark:text-gray-600">|</span>
									<span class="text-sm text-gray-500 dark:text-gray-400">{formatDuration(lab.duration)}</span>
								</div>
							</div>
						</div>
						<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</div>
				</a>
			{/each}
		</div>
	</div>
</div>
