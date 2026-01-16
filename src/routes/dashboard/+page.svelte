<script lang="ts">
	import { currentUser } from '$stores/user';
	import { formatDuration, formatScore } from '$lib/utils/helpers';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let mounted = $state(false);
	let greeting = $state('');
	let currentTime = $state('');

	onMount(() => {
		mounted = true;
		updateTime();
		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	});

	function updateTime() {
		const now = new Date();
		const hours = now.getHours();
		greeting = hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening';
		currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
	}

	const quickActions = [
		{
			title: 'Continue Lab',
			description: 'Resume your last experiment where you left off',
			icon: 'play',
			href: '/labs/chemistry/titration',
			gradient: 'from-emerald-500 via-emerald-400 to-cyan-500',
			glow: 'emerald',
			bgGlow: 'rgba(34, 197, 94, 0.15)'
		},
		{
			title: 'New Experiment',
			description: 'Start a fresh lab session and explore',
			icon: 'plus',
			href: '/dashboard/labs',
			gradient: 'from-blue-500 via-indigo-400 to-violet-500',
			glow: 'blue',
			bgGlow: 'rgba(59, 130, 246, 0.15)'
		},
		{
			title: 'View Progress',
			description: 'Track your learning journey analytics',
			icon: 'chart',
			href: '/dashboard/progress',
			gradient: 'from-amber-500 via-orange-400 to-rose-500',
			glow: 'amber',
			bgGlow: 'rgba(251, 146, 60, 0.15)'
		}
	];

	const recommendedLabs = [
		{
			title: 'Acid-Base Titration',
			discipline: 'Chemistry',
			difficulty: 'beginner',
			duration: 45,
			progress: 0,
			gradient: 'from-cyan-500 to-blue-600',
			icon: 'flask',
			color: 'cyan'
		},
		{
			title: 'Microscopy Basics',
			discipline: 'Biology',
			difficulty: 'beginner',
			duration: 30,
			progress: 0,
			gradient: 'from-emerald-500 to-green-600',
			icon: 'microscope',
			color: 'emerald'
		},
		{
			title: 'Drug Interactions',
			discipline: 'Pharmacy',
			difficulty: 'intermediate',
			duration: 60,
			progress: 0,
			gradient: 'from-pink-500 to-rose-600',
			icon: 'pill',
			color: 'pink'
		}
	];

	let stats = $derived([
		{
			value: data.stats?.completedLabs ?? 0,
			label: 'Completed Labs',
			subtitle: 'experiments finished',
			icon: 'check',
			gradient: 'from-emerald-500 to-cyan-500',
			ring: 'ring-emerald-500/20',
			glow: 'rgba(34, 197, 94, 0.2)'
		},
		{
			value: data.stats?.inProgressLabs ?? 0,
			label: 'In Progress',
			subtitle: 'active experiments',
			icon: 'lightning',
			gradient: 'from-blue-500 to-indigo-500',
			ring: 'ring-blue-500/20',
			glow: 'rgba(59, 130, 246, 0.2)'
		},
		{
			value: data.stats?.averageScore ? formatScore(data.stats.averageScore) : 'N/A',
			label: 'Average Score',
			subtitle: 'overall performance',
			icon: 'star',
			gradient: 'from-amber-500 to-orange-500',
			ring: 'ring-amber-500/20',
			glow: 'rgba(251, 191, 36, 0.2)'
		},
		{
			value: formatDuration(Math.floor((data.stats?.timeSpent ?? 0) / 60)),
			label: 'Time in Labs',
			subtitle: 'total learning time',
			icon: 'clock',
			gradient: 'from-purple-500 to-pink-500',
			ring: 'ring-purple-500/20',
			glow: 'rgba(168, 85, 247, 0.2)'
		}
	]);
</script>

<svelte:head>
	<title>Dashboard - AfriLab</title>
</svelte:head>

<!-- Floating ambient orbs -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="orb w-[500px] h-[500px] -top-48 -right-48 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10" style="animation-delay: 0s;"></div>
	<div class="orb w-[400px] h-[400px] top-1/3 -left-48 bg-gradient-to-br from-blue-500/15 to-purple-500/10" style="animation-delay: 2s;"></div>
	<div class="orb w-[300px] h-[300px] bottom-20 right-1/4 bg-gradient-to-br from-pink-500/10 to-orange-500/10" style="animation-delay: 4s;"></div>
</div>

<div class="relative space-y-8 p-6 sm:p-8 max-w-7xl mx-auto">
	<!-- Welcome Section with enhanced typography -->
	<div class="relative {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
		<div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
			<div class="space-y-4">
				<!-- Time badge -->
				<div class="inline-flex items-center gap-3 px-4 py-2 glass-strong rounded-full">
					<div class="relative">
						<div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
						<div class="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
					</div>
					<span class="text-sm text-gray-300 font-medium">{greeting}</span>
					<span class="text-gray-500">|</span>
					<span class="text-sm text-emerald-400 font-mono">{currentTime}</span>
				</div>

				<div>
					<h1 class="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight">
						Welcome back,
						<span class="block mt-2 text-gradient-aurora">{$currentUser?.firstName || 'Scientist'}</span>
					</h1>
					<p class="mt-4 text-lg sm:text-xl text-gray-400 max-w-xl leading-relaxed">
						Your virtual laboratory awaits. Continue your experiments or start something new.
					</p>
				</div>
			</div>

			<!-- AI Quick Access Card -->
			<div class="glass-prismatic rounded-2xl p-5 w-full lg:w-auto lg:min-w-[320px] shine-on-hover">
				<div class="flex items-center gap-4">
					<div class="relative flex-shrink-0">
						<div class="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl blur-xl opacity-50 animate-pulse"></div>
						<div class="relative w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
							<svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
							</svg>
						</div>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-white font-semibold">AI Lab Assistant</p>
						<p class="text-sm text-gray-400 truncate">Ready to help</p>
					</div>
					<button class="btn-primary !py-2.5 !px-4 text-sm">
						<span>Ask</span>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Stats Grid with premium cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.1s;" data-tour="dashboard-stats">
		{#each stats as stat, i}
			<div
				class="group relative glass-strong rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 shine-on-hover"
				style="animation-delay: {i * 0.05}s;"
			>
				<!-- Gradient glow on hover -->
				<div
					class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
					style="background: radial-gradient(circle at center, {stat.glow}, transparent 70%); filter: blur(20px);"
				></div>

				<div class="flex items-start justify-between mb-4">
					<div class="relative">
						<div class="absolute inset-0 bg-gradient-to-br {stat.gradient} rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
						<div class="relative w-12 h-12 bg-gradient-to-br {stat.gradient} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
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
					<div class="w-8 h-8 rounded-full ring-2 {stat.ring} flex items-center justify-center">
						<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
						</svg>
					</div>
				</div>

				<div>
					<p class="text-3xl font-display font-bold text-white group-hover:text-gradient-emerald transition-all duration-300">{stat.value}</p>
					<p class="text-sm font-medium text-gray-300 mt-1">{stat.label}</p>
					<p class="text-xs text-gray-500 mt-0.5">{stat.subtitle}</p>
				</div>
			</div>
		{/each}
	</div>

	<!-- Quick Actions with vibrant cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">
		{#each quickActions as action, i}
			<a
				href={action.href}
				class="group relative glass-strong rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
			>
				<!-- Animated background gradient -->
				<div
					class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
					style="background: radial-gradient(circle at 30% 30%, {action.bgGlow}, transparent 60%);"
				></div>

				<!-- Shine effect -->
				<div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
					<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
				</div>

				<div class="relative flex items-start gap-5">
					<div class="relative flex-shrink-0">
						<div class="absolute inset-0 bg-gradient-to-br {action.gradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
						<div class="relative w-14 h-14 bg-gradient-to-br {action.gradient} rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
							<svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

					<div class="flex-1 min-w-0">
						<h3 class="text-lg font-display font-semibold text-white group-hover:text-gradient-emerald transition-colors duration-300">{action.title}</h3>
						<p class="text-sm text-gray-400 mt-2 leading-relaxed">{action.description}</p>
					</div>

					<div class="flex-shrink-0 w-10 h-10 rounded-xl glass flex items-center justify-center border border-white/5 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-all duration-300">
						<svg class="w-5 h-5 text-gray-500 group-hover:text-emerald-400 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</div>
				</div>
			</a>
		{/each}
	</div>

	<!-- Recommended Labs with enhanced list -->
	<div class="glass-strong rounded-2xl border border-white/5 overflow-hidden {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.3s;">
		<!-- Header -->
		<div class="p-6 border-b border-white/5 bg-gradient-to-r from-emerald-500/5 to-transparent">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<div class="relative">
						<div class="w-1.5 h-10 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full"></div>
						<div class="absolute inset-0 w-1.5 h-10 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full blur-sm"></div>
					</div>
					<div>
						<h2 class="text-xl font-display font-bold text-white">Recommended Labs</h2>
						<p class="text-sm text-gray-500 mt-0.5">Personalized for your learning path</p>
					</div>
				</div>
				<a href="/dashboard/labs" class="group flex items-center gap-2 px-4 py-2 glass rounded-lg border border-white/5 hover:border-emerald-500/30 transition-all">
					<span class="text-sm font-medium text-emerald-400 group-hover:text-emerald-300">View all labs</span>
					<svg class="w-4 h-4 text-emerald-400 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</a>
			</div>
		</div>

		<!-- Lab list -->
		<div class="divide-y divide-white/5">
			{#each recommendedLabs as lab, i}
				<a
					href="/labs/chemistry/titration"
					class="group block p-6 hover:bg-gradient-to-r hover:from-white/[0.02] hover:to-transparent transition-all duration-300"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-5">
							<!-- Lab icon with glow -->
							<div class="relative">
								<div class="absolute inset-0 bg-gradient-to-br {lab.gradient} rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
								<div class="relative w-16 h-16 glass rounded-xl flex items-center justify-center border border-white/10 group-hover:border-{lab.color}-500/40 transition-colors">
									<svg class="w-8 h-8 text-gray-400 group-hover:text-{lab.color}-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
									</svg>
								</div>
							</div>

							<div>
								<h3 class="text-lg font-display font-semibold text-white group-hover:text-emerald-400 transition-colors">{lab.title}</h3>
								<div class="flex items-center gap-3 mt-2 flex-wrap">
									<span class="inline-flex items-center gap-1.5 text-sm text-gray-400">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
										</svg>
										{lab.discipline}
									</span>
									<span class="w-1 h-1 rounded-full bg-gray-600"></span>
									<span class="text-xs px-3 py-1 rounded-full bg-gradient-to-r {lab.gradient} bg-opacity-10 text-white font-medium capitalize border border-white/10">
										{lab.difficulty}
									</span>
									<span class="w-1 h-1 rounded-full bg-gray-600"></span>
									<span class="inline-flex items-center gap-1.5 text-sm text-gray-400">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										{formatDuration(lab.duration)}
									</span>
								</div>
							</div>
						</div>

						<div class="flex items-center gap-4">
							{#if lab.progress > 0}
								<div class="hidden sm:flex items-center gap-3">
									<div class="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
										<div class="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500" style="width: {lab.progress}%"></div>
									</div>
									<span class="text-sm font-medium text-gray-400">{lab.progress}%</span>
								</div>
							{:else}
								<span class="hidden sm:inline-flex items-center gap-2 text-xs font-medium text-emerald-400 px-3 py-1.5 glass rounded-full border border-emerald-500/20">
									<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
									New
								</span>
							{/if}

							<div class="w-12 h-12 rounded-xl glass border border-white/5 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 flex items-center justify-center transition-all duration-300">
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

	<!-- Bottom CTA Banner -->
	<div class="glass-prismatic rounded-2xl p-8 relative overflow-hidden {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.4s;">
		<!-- Animated background particles -->
		<div class="absolute inset-0 overflow-hidden pointer-events-none">
			{#each Array(5) as _, i}
				<div
					class="particle"
					style="left: {20 + i * 15}%; bottom: 10%; animation-delay: {i * 0.5}s; --tx: {(i - 2) * 30}px; --ty: -100px;"
				></div>
			{/each}
		</div>

		<div class="relative flex flex-col lg:flex-row items-center gap-8">
			<div class="relative flex-shrink-0">
				<div class="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl blur-2xl opacity-40 animate-pulse"></div>
				<div class="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl">
					<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
					</svg>
				</div>
			</div>

			<div class="flex-1 text-center lg:text-left">
				<h3 class="text-2xl font-display font-bold text-white">Ready to level up your skills?</h3>
				<p class="text-gray-400 mt-2 text-lg max-w-2xl">
					Our AI Lab Assistant can guide you through complex procedures, answer questions, and help you understand concepts in real-time.
				</p>
			</div>

			<div class="flex items-center gap-4">
				<a href="/dashboard/labs" class="btn-secondary">
					Browse Labs
				</a>
				<a href="/labs/chemistry/titration" class="btn-primary">
					Start Learning
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
					</svg>
				</a>
			</div>
		</div>
	</div>
</div>

<style>
	/* Additional component-specific animations */
	@keyframes float-gentle {
		0%, 100% { transform: translateY(0px) rotate(0deg); }
		50% { transform: translateY(-10px) rotate(1deg); }
	}

	:global(.animate-float-gentle) {
		animation: float-gentle 6s ease-in-out infinite;
	}
</style>
