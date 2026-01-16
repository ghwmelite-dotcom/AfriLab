<script lang="ts">
	import { onMount } from 'svelte';
	import AnalyticsDashboard from '$lib/components/analytics/AnalyticsDashboard.svelte';

	let { data } = $props();

	let mounted = $state(false);
	let selectedTimeRange = $state<'week' | 'month' | 'semester'>('week');

	onMount(() => {
		mounted = true;
	});

	function formatTimeAgo(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);

		if (diffMins < 60) return `${diffMins}m ago`;
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours}h ago`;
		const diffDays = Math.floor(diffHours / 24);
		return `${diffDays}d ago`;
	}

	function getScoreColor(score: number): string {
		if (score >= 90) return 'text-emerald-400';
		if (score >= 80) return 'text-cyan-400';
		if (score >= 70) return 'text-amber-400';
		return 'text-rose-400';
	}

	function getScoreBg(score: number): string {
		if (score >= 90) return 'bg-emerald-500/20 border-emerald-500/30';
		if (score >= 80) return 'bg-cyan-500/20 border-cyan-500/30';
		if (score >= 70) return 'bg-amber-500/20 border-amber-500/30';
		return 'bg-rose-500/20 border-rose-500/30';
	}

	// Calculate max sessions for chart scaling
	let maxSessions = $derived(Math.max(...data.weeklyProgress.map(d => d.sessions)));
</script>

<svelte:head>
	<title>Instructor Dashboard - AfriLab</title>
</svelte:head>

<!-- Ambient background -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-50"></div>
	<div class="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-b from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
	<div class="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-t from-cyan-500/10 to-transparent rounded-full blur-3xl"></div>
</div>

<div class="relative space-y-6 p-6 sm:p-8">
	<!-- Header -->
	<div class="{mounted ? 'animate-fade-in-up' : 'opacity-0'}">
		<div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
			<a href="/dashboard" class="hover:text-purple-400 transition-colors">Dashboard</a>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
			<span class="text-purple-400">Instructor</span>
		</div>
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-display font-bold text-white">
					Instructor <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Dashboard</span>
				</h1>
				<p class="mt-2 text-gray-400">Monitor student progress and class performance</p>
			</div>

			<!-- Time range selector -->
			<div class="flex gap-2">
				{#each [
					{ id: 'week', label: 'This Week' },
					{ id: 'month', label: 'This Month' },
					{ id: 'semester', label: 'Semester' }
				] as range (range.id)}
					<button
						onclick={() => selectedTimeRange = range.id as typeof selectedTimeRange}
						class="px-4 py-2 rounded-xl text-sm font-medium transition-all
							{selectedTimeRange === range.id
							? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
							: 'glass border border-white/10 text-gray-400 hover:text-white'}"
					>
						{range.label}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Key Metrics Cards -->
	<div class="grid grid-cols-2 md:grid-cols-5 gap-4 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.1s;">
		<div class="glass-strong rounded-2xl p-5 border border-white/5 hover:border-purple-500/30 transition-all">
			<div class="flex items-center justify-between mb-3">
				<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
					<svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
					</svg>
				</div>
				<span class="text-xs text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10">+5</span>
			</div>
			<div class="text-2xl font-display font-bold text-white">{data.classData.totalStudents}</div>
			<div class="text-sm text-gray-400">Total Students</div>
		</div>

		<div class="glass-strong rounded-2xl p-5 border border-white/5 hover:border-emerald-500/30 transition-all">
			<div class="flex items-center justify-between mb-3">
				<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center">
					<svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
			</div>
			<div class="text-2xl font-display font-bold text-white">{data.classData.activeStudents}</div>
			<div class="text-sm text-gray-400">Active This Week</div>
		</div>

		<div class="glass-strong rounded-2xl p-5 border border-white/5 hover:border-cyan-500/30 transition-all">
			<div class="flex items-center justify-between mb-3">
				<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center">
					<svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
					</svg>
				</div>
				<span class="text-xs text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10">+12%</span>
			</div>
			<div class="text-2xl font-display font-bold text-white">{data.classData.totalLabSessions}</div>
			<div class="text-sm text-gray-400">Lab Sessions</div>
		</div>

		<div class="glass-strong rounded-2xl p-5 border border-white/5 hover:border-amber-500/30 transition-all">
			<div class="flex items-center justify-between mb-3">
				<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center">
					<svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
				</div>
			</div>
			<div class="text-2xl font-display font-bold text-white">{data.classData.avgCompletionRate}%</div>
			<div class="text-sm text-gray-400">Completion Rate</div>
		</div>

		<div class="glass-strong rounded-2xl p-5 border border-white/5 hover:border-rose-500/30 transition-all">
			<div class="flex items-center justify-between mb-3">
				<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/30 to-pink-500/30 flex items-center justify-center">
					<svg class="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
					</svg>
				</div>
				<span class="text-xs text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10">+3pts</span>
			</div>
			<div class="text-2xl font-display font-bold text-white">{data.classData.avgScore}</div>
			<div class="text-sm text-gray-400">Avg Score</div>
		</div>
	</div>

	<!-- Main Content Grid -->
	<div class="grid lg:grid-cols-3 gap-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.15s;">
		<!-- Weekly Activity Chart -->
		<div class="lg:col-span-2 glass-strong rounded-2xl p-6 border border-white/5">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-lg font-display font-semibold text-white">Weekly Activity</h2>
				<div class="flex items-center gap-4 text-xs">
					<div class="flex items-center gap-2">
						<div class="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
						<span class="text-gray-400">Sessions</span>
					</div>
					<div class="flex items-center gap-2">
						<div class="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
						<span class="text-gray-400">Avg Score</span>
					</div>
				</div>
			</div>

			<!-- Bar Chart -->
			<div class="flex items-end justify-between gap-4 h-48">
				{#each data.weeklyProgress as day (day.day)}
					<div class="flex-1 flex flex-col items-center gap-2">
						<div class="w-full flex flex-col items-center gap-1">
							<!-- Score indicator -->
							<div class="text-xs text-emerald-400 font-mono">{day.avgScore}</div>
							<!-- Bar -->
							<div class="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-purple-500/50 to-pink-500/50 transition-all relative"
								style="height: {(day.sessions / maxSessions) * 150}px;">
								<div class="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-gray-400">{day.sessions}</div>
							</div>
						</div>
						<span class="text-xs text-gray-500">{day.day}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Recent Activity Feed -->
		<div class="glass-strong rounded-2xl p-6 border border-white/5">
			<h2 class="text-lg font-display font-semibold text-white mb-4">Recent Activity</h2>
			<div class="space-y-4">
				{#each data.recentActivity as activity (activity.id)}
					<div class="flex items-start gap-3">
						<div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center flex-shrink-0">
							<span class="text-xs text-purple-400 font-semibold">
								{activity.studentName.split(' ').map(n => n[0]).join('')}
							</span>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm text-white truncate">{activity.studentName}</p>
							<p class="text-xs text-gray-400 truncate">{activity.lab}</p>
						</div>
						<div class="text-right flex-shrink-0">
							<div class="text-sm font-mono {getScoreColor(activity.score)}">{activity.score}</div>
							<div class="text-xs text-gray-500">{formatTimeAgo(activity.completedAt)}</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Lab Performance & Students -->
	<div class="grid lg:grid-cols-2 gap-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">
		<!-- Lab Performance -->
		<div class="glass-strong rounded-2xl p-6 border border-white/5">
			<h2 class="text-lg font-display font-semibold text-white mb-4">Lab Performance</h2>
			<div class="space-y-4">
				{#each data.labPerformance as lab}
					<div class="p-3 rounded-xl glass border border-white/5">
						<div class="flex items-center justify-between mb-2">
							<div>
								<span class="text-sm text-white">{lab.labName}</span>
								<span class="text-xs text-gray-500 ml-2">{lab.discipline}</span>
							</div>
							<span class="text-sm font-mono {getScoreColor(lab.avgScore)}">{lab.avgScore}%</span>
						</div>
						<div class="flex items-center gap-3">
							<div class="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
								<div
									class="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
									style="width: {lab.avgScore}%"
								></div>
							</div>
							<span class="text-xs text-gray-400">{lab.completions} completions</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Student Highlights -->
		<div class="space-y-6">
			<!-- Top Performers -->
			<div class="glass-strong rounded-2xl p-6 border border-white/5">
				<div class="flex items-center gap-2 mb-4">
					<svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
					</svg>
					<h2 class="text-lg font-display font-semibold text-white">Top Performers</h2>
				</div>
				<div class="space-y-2">
					{#each data.topStudents as student, i}
						<div class="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
							<div class="flex items-center gap-3">
								<div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
									{i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-700 text-gray-400'}">
									{i + 1}
								</div>
								<span class="text-sm text-white">{student.name}</span>
							</div>
							<div class="flex items-center gap-4 text-xs">
								<span class="text-gray-400">{student.labsCompleted} labs</span>
								<span class="font-mono text-emerald-400">{student.avgScore}%</span>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Needs Attention -->
			<div class="glass-strong rounded-2xl p-6 border border-rose-500/20">
				<div class="flex items-center gap-2 mb-4">
					<svg class="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
					<h2 class="text-lg font-display font-semibold text-white">Needs Attention</h2>
				</div>
				<div class="space-y-2">
					{#each data.needsAttention as student}
						<div class="flex items-center justify-between p-2 rounded-lg bg-rose-500/5 border border-rose-500/10">
							<div>
								<span class="text-sm text-white">{student.name}</span>
								<div class="text-xs text-rose-400">{student.issue}</div>
							</div>
							<div class="text-right">
								<div class="text-sm font-mono text-rose-400">{student.avgScore}%</div>
								<div class="text-xs text-gray-500">{student.labsCompleted} labs</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.25s;">
		<button class="glass-strong rounded-xl p-4 border border-white/5 hover:border-purple-500/30 transition-all text-left group">
			<div class="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
				<svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
			</div>
			<h3 class="font-semibold text-white">Generate Report</h3>
			<p class="text-xs text-gray-400 mt-1">Export class analytics</p>
		</button>

		<button class="glass-strong rounded-xl p-4 border border-white/5 hover:border-emerald-500/30 transition-all text-left group">
			<div class="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
				<svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
			</div>
			<h3 class="font-semibold text-white">Assign Lab</h3>
			<p class="text-xs text-gray-400 mt-1">Create new assignment</p>
		</button>

		<button class="glass-strong rounded-xl p-4 border border-white/5 hover:border-cyan-500/30 transition-all text-left group">
			<div class="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
				<svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
				</svg>
			</div>
			<h3 class="font-semibold text-white">Send Message</h3>
			<p class="text-xs text-gray-400 mt-1">Contact students</p>
		</button>

		<button class="glass-strong rounded-xl p-4 border border-white/5 hover:border-amber-500/30 transition-all text-left group">
			<div class="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
				<svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
			</div>
			<h3 class="font-semibold text-white">Settings</h3>
			<p class="text-xs text-gray-400 mt-1">Manage class settings</p>
		</button>
	</div>

	<!-- Platform Analytics -->
	<div class="glass-strong rounded-2xl p-6 border border-white/5 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.3s;">
		<AnalyticsDashboard />
	</div>
</div>
