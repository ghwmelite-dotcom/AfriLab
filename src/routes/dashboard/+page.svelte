<script lang="ts">
	import { currentUser } from '$stores/user';
	import { formatDuration, formatScore, getDifficultyColor } from '$lib/utils/helpers';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});

	const quickActions = [
		{
			title: 'Continue Lab',
			description: 'Resume your last experiment',
			icon: 'play',
			href: '/labs/chemistry/titration',
			gradient: 'from-emerald-500 to-cyan-500'
		},
		{
			title: 'New Experiment',
			description: 'Start a fresh lab session',
			icon: 'plus',
			href: '/dashboard/labs',
			gradient: 'from-blue-500 to-indigo-500'
		},
		{
			title: 'View Progress',
			description: 'Check your learning analytics',
			icon: 'chart',
			href: '/dashboard/progress',
			gradient: 'from-amber-500 to-orange-500'
		}
	];

	const recommendedLabs = [
		{
			title: 'Acid-Base Titration',
			discipline: 'Chemistry',
			difficulty: 'beginner',
			duration: 45,
			progress: 0,
			gradient: 'from-cyan-500 to-blue-500'
		},
		{
			title: 'Microscopy Basics',
			discipline: 'Biology',
			difficulty: 'beginner',
			duration: 30,
			progress: 0,
			gradient: 'from-emerald-500 to-green-500'
		},
		{
			title: 'Drug Interactions',
			discipline: 'Pharmacy',
			difficulty: 'intermediate',
			duration: 60,
			progress: 0,
			gradient: 'from-pink-500 to-rose-500'
		}
	];

	const stats = [
		{
			value: data.stats?.completedLabs ?? 0,
			label: 'Completed Labs',
			icon: 'check',
			gradient: 'from-emerald-500 to-cyan-500'
		},
		{
			value: data.stats?.inProgressLabs ?? 0,
			label: 'In Progress',
			icon: 'lightning',
			gradient: 'from-blue-500 to-indigo-500'
		},
		{
			value: data.stats?.averageScore ? formatScore(data.stats.averageScore) : 'N/A',
			label: 'Average Score',
			icon: 'star',
			gradient: 'from-amber-500 to-orange-500'
		},
		{
			value: formatDuration(Math.floor((data.stats?.timeSpent ?? 0) / 60)),
			label: 'Time in Labs',
			icon: 'clock',
			gradient: 'from-purple-500 to-pink-500'
		}
	];
</script>

<svelte:head>
	<title>Dashboard - AfriLab</title>
</svelte:head>

<!-- Ambient background -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-50"></div>
	<div class="absolute top-1/4 -right-32 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl animate-blob"></div>
	<div class="absolute bottom-1/4 -left-32 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-blob" style="animation-delay: 3s;"></div>
</div>

<div class="relative space-y-8 p-6 sm:p-8">
	<!-- Welcome Section -->
	<div class="{mounted ? 'animate-fade-in-up' : 'opacity-0'}">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl sm:text-4xl font-display font-bold text-white">
					Welcome back, <span class="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{$currentUser?.firstName}</span>!
				</h1>
				<p class="mt-2 text-gray-400 text-lg">
					Ready to continue your virtual laboratory journey?
				</p>
			</div>

			<!-- Time greeting badge -->
			<div class="hidden md:flex items-center gap-2 px-4 py-2 glass rounded-full border border-white/5">
				<div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
				<span class="text-sm text-gray-400">
					{new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
				</span>
			</div>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.1s;">
		{#each stats as stat, i}
			<div class="group relative glass rounded-2xl p-6 border border-white/5 hover:border-emerald-500/20 transition-all duration-300 overflow-hidden">
				<!-- Hover glow -->
				<div class="absolute inset-0 bg-gradient-to-r {stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity"></div>

				<div class="relative flex items-center gap-4">
					<div class="relative">
						<div class="absolute inset-0 bg-gradient-to-r {stat.gradient} rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
						<div class="relative w-12 h-12 bg-gradient-to-br {stat.gradient} rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
							<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								{#if stat.icon === 'check'}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								{:else if stat.icon === 'lightning'}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
								{:else if stat.icon === 'star'}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
								{:else}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								{/if}
							</svg>
						</div>
					</div>
					<div>
						<p class="text-2xl font-display font-bold text-white">{stat.value}</p>
						<p class="text-sm text-gray-400">{stat.label}</p>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Quick Actions -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">
		{#each quickActions as action, i}
			<a
				href={action.href}
				class="group relative glass rounded-2xl p-6 border border-white/5 hover:border-emerald-500/20 transition-all duration-300 overflow-hidden"
			>
				<!-- Animated gradient border on hover -->
				<div class="absolute inset-0 bg-gradient-to-r {action.gradient} opacity-0 group-hover:opacity-10 transition-opacity"></div>

				<div class="relative flex items-start gap-4">
					<div class="relative flex-shrink-0">
						<div class="absolute inset-0 bg-gradient-to-r {action.gradient} rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
						<div class="relative w-12 h-12 bg-gradient-to-br {action.gradient} rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all">
							<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
					</div>
					<div class="flex-1">
						<h3 class="font-display font-semibold text-white group-hover:text-emerald-400 transition-colors">{action.title}</h3>
						<p class="text-sm text-gray-400 mt-1">{action.description}</p>
					</div>
					<svg class="w-5 h-5 text-gray-500 group-hover:text-emerald-400 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</div>
			</a>
		{/each}
	</div>

	<!-- Recommended Labs -->
	<div class="glass rounded-2xl border border-white/5 overflow-hidden {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.3s;">
		<div class="p-6 border-b border-white/5">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full"></div>
					<h2 class="text-xl font-display font-semibold text-white">Recommended Labs</h2>
				</div>
				<a href="/dashboard/labs" class="group flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
					View all
					<svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</a>
			</div>
		</div>

		<div class="divide-y divide-white/5">
			{#each recommendedLabs as lab, i}
				<a
					href="/labs/chemistry/titration"
					class="group block p-6 hover:bg-white/[0.02] transition-colors"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-5">
							<div class="relative">
								<div class="absolute inset-0 bg-gradient-to-r {lab.gradient} rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
								<div class="relative w-14 h-14 glass rounded-xl flex items-center justify-center border border-white/10 group-hover:border-emerald-500/30 transition-colors">
									<svg class="w-7 h-7 text-gray-400 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
									</svg>
								</div>
							</div>
							<div>
								<h3 class="font-display font-medium text-white group-hover:text-emerald-400 transition-colors">{lab.title}</h3>
								<div class="flex items-center gap-3 mt-2">
									<span class="text-sm text-gray-400">{lab.discipline}</span>
									<span class="w-1 h-1 rounded-full bg-gray-600"></span>
									<span class="text-xs px-2.5 py-1 rounded-full glass border border-white/10 text-gray-300 capitalize">
										{lab.difficulty}
									</span>
									<span class="w-1 h-1 rounded-full bg-gray-600"></span>
									<span class="text-sm text-gray-400">{formatDuration(lab.duration)}</span>
								</div>
							</div>
						</div>
						<div class="flex items-center gap-4">
							<!-- Progress indicator (if any) -->
							{#if lab.progress > 0}
								<div class="hidden sm:flex items-center gap-2">
									<div class="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
										<div class="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" style="width: {lab.progress}%"></div>
									</div>
									<span class="text-xs text-gray-400">{lab.progress}%</span>
								</div>
							{/if}
							<div class="w-10 h-10 rounded-xl glass border border-white/5 group-hover:border-emerald-500/30 flex items-center justify-center transition-all">
								<svg class="w-5 h-5 text-gray-500 group-hover:text-emerald-400 transform group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
								</svg>
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>

	<!-- AI Assistant Floating Card -->
	<div class="glass-strong rounded-2xl p-6 border border-emerald-500/20 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.4s;">
		<div class="flex items-center gap-6">
			<div class="relative flex-shrink-0">
				<div class="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
				<div class="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center">
					<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
					</svg>
				</div>
			</div>
			<div class="flex-1">
				<h3 class="font-display font-semibold text-white">Need help with your experiments?</h3>
				<p class="text-gray-400 mt-1">Our AI Lab Assistant is ready to guide you through any procedure or answer your questions.</p>
			</div>
			<a href="/labs/chemistry/titration" class="btn-primary">
				Ask AI Assistant
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
			</a>
		</div>
	</div>
</div>
