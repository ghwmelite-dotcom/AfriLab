<script lang="ts">
	import { currentUser } from '$stores/user';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});

	let stats = $derived([
		{
			label: 'Total Students',
			value: data.studentCount || 0,
			icon: 'users',
			gradient: 'from-blue-500 to-indigo-500',
			change: '+12%',
			changeType: 'positive'
		},
		{
			label: 'Active Labs',
			value: data.activeLabsCount || 0,
			icon: 'beaker',
			gradient: 'from-emerald-500 to-cyan-500',
			change: '+5%',
			changeType: 'positive'
		},
		{
			label: 'Completed This Week',
			value: data.completedThisWeek || 0,
			icon: 'check',
			gradient: 'from-amber-500 to-orange-500',
			change: '+23%',
			changeType: 'positive'
		},
		{
			label: 'Average Score',
			value: data.avgScore ? `${data.avgScore}%` : 'N/A',
			icon: 'chart',
			gradient: 'from-purple-500 to-pink-500',
			change: '+3%',
			changeType: 'positive'
		}
	]);

	// Mock recent activity data
	let recentActivity = $derived(data.recentActivity || [
		{ studentName: 'Amina Okafor', studentInitials: 'AO', action: 'Completed Acid-Base Titration', time: '5 min ago', score: 94 },
		{ studentName: 'Kwame Asante', studentInitials: 'KA', action: 'Started Spectroscopy Lab', time: '12 min ago', score: null },
		{ studentName: 'Fatima Hassan', studentInitials: 'FH', action: 'Submitted Lab Report', time: '25 min ago', score: 87 },
		{ studentName: 'David Mensah', studentInitials: 'DM', action: 'Completed Microscopy Basics', time: '1 hour ago', score: 91 },
		{ studentName: 'Grace Nkrumah', studentInitials: 'GN', action: 'Asked AI for help', time: '2 hours ago', score: null }
	]);

	// Mock upcoming assignments
	const upcomingAssignments = [
		{ title: 'Acid-Base Titration', dueDate: 'Jan 20', submissions: 18, total: 25, status: 'active' },
		{ title: 'Spectroscopy Analysis', dueDate: 'Jan 25', submissions: 5, total: 25, status: 'active' },
		{ title: 'Lab Safety Quiz', dueDate: 'Jan 15', submissions: 25, total: 25, status: 'completed' }
	];

	// Mock top performers
	const topPerformers = [
		{ name: 'Amina Okafor', initials: 'AO', score: 98, labs: 12 },
		{ name: 'David Mensah', initials: 'DM', score: 95, labs: 11 },
		{ name: 'Grace Nkrumah', initials: 'GN', score: 94, labs: 10 }
	];
</script>

<svelte:head>
	<title>Instructor Dashboard - AfriLab</title>
</svelte:head>

<!-- Ambient background -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-50"></div>
	<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
	<div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
</div>

<div class="relative space-y-8 p-6 sm:p-8">
	<!-- Welcome Header -->
	<div class="{mounted ? 'animate-fade-in-up' : 'opacity-0'}">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl sm:text-4xl font-display font-bold text-white">
					Instructor <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Dashboard</span>
				</h1>
				<p class="mt-2 text-gray-400 text-lg">
					Welcome back, {$currentUser?.firstName}! Here's an overview of your students.
				</p>
			</div>

			<a href="/instructor/assignments" class="btn-primary">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
				Create Assignment
			</a>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.1s;">
		{#each stats as stat, i}
			<div class="group relative glass rounded-2xl p-6 border border-white/5 hover:border-purple-500/20 transition-all duration-300 overflow-hidden">
				<!-- Hover glow -->
				<div class="absolute inset-0 bg-gradient-to-r {stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity"></div>

				<div class="relative flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-400 mb-1">{stat.label}</p>
						<p class="text-3xl font-display font-bold text-white">{stat.value}</p>
						<div class="flex items-center gap-1 mt-2">
							<svg class="w-4 h-4 {stat.changeType === 'positive' ? 'text-emerald-400' : 'text-rose-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{stat.changeType === 'positive' ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'}" />
							</svg>
							<span class="text-xs {stat.changeType === 'positive' ? 'text-emerald-400' : 'text-rose-400'}">{stat.change} this week</span>
						</div>
					</div>
					<div class="relative">
						<div class="absolute inset-0 bg-gradient-to-r {stat.gradient} rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
						<div class="relative w-14 h-14 bg-gradient-to-br {stat.gradient} rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
							<svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								{#if stat.icon === 'users'}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
								{:else if stat.icon === 'beaker'}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
								{:else if stat.icon === 'check'}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								{:else}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								{/if}
							</svg>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Main Content Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Recent Activity -->
		<div class="lg:col-span-2 glass rounded-2xl border border-white/5 overflow-hidden {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">
			<div class="p-6 border-b border-white/5">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="w-1.5 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
						<h2 class="text-xl font-display font-semibold text-white">Recent Student Activity</h2>
					</div>
					<a href="/instructor/activity" class="group flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors">
						View all
						<svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</a>
				</div>
			</div>

			<div class="divide-y divide-white/5">
				{#each recentActivity as activity, i}
					<div class="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
						<div class="flex items-center gap-4">
							<div class="relative">
								<div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-sm opacity-30"></div>
								<div class="relative w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
									{activity.studentInitials}
								</div>
							</div>
							<div>
								<p class="font-medium text-white">{activity.studentName}</p>
								<p class="text-sm text-gray-400">{activity.action}</p>
							</div>
						</div>
						<div class="text-right">
							{#if activity.score}
								<div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									{activity.score}%
								</div>
							{/if}
							<p class="text-xs text-gray-500 mt-1">{activity.time}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Right Sidebar -->
		<div class="space-y-6">
			<!-- Top Performers -->
			<div class="glass rounded-2xl border border-white/5 overflow-hidden {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.25s;">
				<div class="p-5 border-b border-white/5">
					<div class="flex items-center gap-3">
						<div class="w-1.5 h-5 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
						<h3 class="font-display font-semibold text-white">Top Performers</h3>
					</div>
				</div>

				<div class="p-4 space-y-3">
					{#each topPerformers as performer, i}
						<div class="flex items-center gap-3 p-3 glass rounded-xl border border-white/5">
							<div class="flex items-center justify-center w-8 h-8 rounded-full {i === 0 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : i === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 'bg-gradient-to-r from-amber-700 to-amber-800'} text-white text-sm font-bold">
								{i + 1}
							</div>
							<div class="flex-1">
								<p class="text-sm font-medium text-white">{performer.name}</p>
								<p class="text-xs text-gray-500">{performer.labs} labs completed</p>
							</div>
							<div class="text-right">
								<p class="text-lg font-display font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{performer.score}%</p>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Upcoming Assignments -->
			<div class="glass rounded-2xl border border-white/5 overflow-hidden {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.3s;">
				<div class="p-5 border-b border-white/5">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div class="w-1.5 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
							<h3 class="font-display font-semibold text-white">Assignments</h3>
						</div>
						<a href="/instructor/assignments" class="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">View all</a>
					</div>
				</div>

				<div class="p-4 space-y-3">
					{#each upcomingAssignments as assignment}
						<div class="p-3 glass rounded-xl border border-white/5">
							<div class="flex items-center justify-between mb-2">
								<p class="text-sm font-medium text-white">{assignment.title}</p>
								<span class="text-xs px-2 py-0.5 rounded-full {assignment.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}">
									{assignment.status === 'completed' ? 'Completed' : `Due ${assignment.dueDate}`}
								</span>
							</div>
							<div class="flex items-center gap-2">
								<div class="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
									<div
										class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
										style="width: {(assignment.submissions / assignment.total) * 100}%"
									></div>
								</div>
								<span class="text-xs text-gray-400">{assignment.submissions}/{assignment.total}</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.35s;">
		{#each [
			{ title: 'View Students', desc: 'Manage class roster', href: '/instructor/students', icon: 'users', gradient: 'from-blue-500 to-indigo-500' },
			{ title: 'Analytics', desc: 'Performance insights', href: '/instructor/analytics', icon: 'chart', gradient: 'from-purple-500 to-pink-500' },
			{ title: 'Assignments', desc: 'Create and manage', href: '/instructor/assignments', icon: 'clipboard', gradient: 'from-emerald-500 to-cyan-500' },
			{ title: 'Lab Settings', desc: 'Configure experiments', href: '/instructor/labs', icon: 'cog', gradient: 'from-amber-500 to-orange-500' }
		] as action}
			<a
				href={action.href}
				class="group relative glass rounded-2xl p-5 border border-white/5 hover:border-purple-500/20 transition-all duration-300 overflow-hidden"
			>
				<div class="absolute inset-0 bg-gradient-to-r {action.gradient} opacity-0 group-hover:opacity-10 transition-opacity"></div>

				<div class="relative flex items-center gap-4">
					<div class="relative flex-shrink-0">
						<div class="absolute inset-0 bg-gradient-to-r {action.gradient} rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
						<div class="relative w-12 h-12 bg-gradient-to-br {action.gradient} rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
							<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								{#if action.icon === 'users'}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
								{:else if action.icon === 'chart'}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								{:else if action.icon === 'clipboard'}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
								{:else}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								{/if}
							</svg>
						</div>
					</div>
					<div class="flex-1">
						<h3 class="font-display font-semibold text-white group-hover:text-purple-400 transition-colors">{action.title}</h3>
						<p class="text-sm text-gray-400">{action.desc}</p>
					</div>
					<svg class="w-5 h-5 text-gray-500 group-hover:text-purple-400 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</div>
			</a>
		{/each}
	</div>
</div>
