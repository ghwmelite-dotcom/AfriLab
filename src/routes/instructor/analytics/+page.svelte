<script lang="ts">
	import { onMount } from 'svelte';

	let mounted = $state(false);
	let selectedPeriod = $state('7d');

	onMount(() => {
		mounted = true;
	});

	// Mock analytics data
	const overviewStats = [
		{ label: 'Total Lab Sessions', value: '1,247', change: '+18%', positive: true },
		{ label: 'Avg Completion Rate', value: '84%', change: '+5%', positive: true },
		{ label: 'Avg Score', value: '82%', change: '+3%', positive: true },
		{ label: 'AI Interactions', value: '3,891', change: '+42%', positive: true }
	];

	// Performance by lab
	const labPerformance = [
		{ name: 'Acid-Base Titration', completions: 156, avgScore: 87, avgTime: '38 min', difficulty: 'beginner' },
		{ name: 'UV-Vis Spectroscopy', completions: 98, avgScore: 79, avgTime: '52 min', difficulty: 'intermediate' },
		{ name: 'Cell Division', completions: 124, avgScore: 85, avgTime: '45 min', difficulty: 'beginner' },
		{ name: 'Enzyme Kinetics', completions: 67, avgScore: 72, avgTime: '61 min', difficulty: 'advanced' },
		{ name: 'Ohm\'s Law', completions: 145, avgScore: 91, avgTime: '28 min', difficulty: 'beginner' }
	];

	// Score distribution (mock chart data)
	const scoreDistribution = [
		{ range: '90-100', count: 45, percentage: 28 },
		{ range: '80-89', count: 52, percentage: 32 },
		{ range: '70-79', count: 38, percentage: 24 },
		{ range: '60-69', count: 18, percentage: 11 },
		{ range: '< 60', count: 8, percentage: 5 }
	];

	// Weekly activity data
	const weeklyActivity = [
		{ day: 'Mon', sessions: 45 },
		{ day: 'Tue', sessions: 62 },
		{ day: 'Wed', sessions: 78 },
		{ day: 'Thu', sessions: 51 },
		{ day: 'Fri', sessions: 89 },
		{ day: 'Sat', sessions: 34 },
		{ day: 'Sun', sessions: 22 }
	];

	const maxSessions = Math.max(...weeklyActivity.map(d => d.sessions));

	// Common mistakes
	const commonMistakes = [
		{ mistake: 'Incorrect burette reading', frequency: 34, lab: 'Titration' },
		{ mistake: 'Overshooting endpoint', frequency: 28, lab: 'Titration' },
		{ mistake: 'Wrong wavelength selection', frequency: 22, lab: 'Spectroscopy' },
		{ mistake: 'Calculation errors', frequency: 19, lab: 'Multiple' },
		{ mistake: 'Safety protocol skip', frequency: 15, lab: 'Multiple' }
	];

	function getDifficultyColor(difficulty: string) {
		switch (difficulty) {
			case 'beginner': return 'bg-emerald-500/20 text-emerald-400';
			case 'intermediate': return 'bg-amber-500/20 text-amber-400';
			case 'advanced': return 'bg-rose-500/20 text-rose-400';
			default: return 'bg-gray-500/20 text-gray-400';
		}
	}
</script>

<svelte:head>
	<title>Analytics - AfriLab</title>
</svelte:head>

<!-- Ambient background -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-50"></div>
	<div class="absolute top-0 left-1/3 w-[600px] h-[600px] bg-gradient-to-b from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
	<div class="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-t from-cyan-500/10 to-transparent rounded-full blur-3xl"></div>
</div>

<div class="relative space-y-6 p-6 sm:p-8">
	<!-- Header -->
	<div class="{mounted ? 'animate-fade-in-up' : 'opacity-0'}">
		<div class="flex items-center justify-between">
			<div>
				<div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
					<a href="/instructor" class="hover:text-purple-400 transition-colors">Dashboard</a>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
					<span class="text-purple-400">Analytics</span>
				</div>
				<h1 class="text-3xl font-display font-bold text-white">
					Performance <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Analytics</span>
				</h1>
			</div>

			<!-- Period Selector -->
			<div class="flex gap-2">
				{#each [
					{ id: '7d', label: '7 Days' },
					{ id: '30d', label: '30 Days' },
					{ id: '90d', label: '90 Days' }
				] as period}
					<button
						onclick={() => selectedPeriod = period.id}
						class="px-4 py-2 rounded-xl text-sm font-medium transition-all
							{selectedPeriod === period.id
								? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
								: 'glass border border-white/10 text-gray-400 hover:text-white'}"
					>
						{period.label}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Overview Stats -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.1s;">
		{#each overviewStats as stat}
			<div class="glass rounded-xl p-5 border border-white/5">
				<p class="text-sm text-gray-400 mb-2">{stat.label}</p>
				<div class="flex items-end justify-between">
					<p class="text-3xl font-display font-bold text-white">{stat.value}</p>
					<span class="flex items-center gap-1 text-sm {stat.positive ? 'text-emerald-400' : 'text-rose-400'}">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
								d="{stat.positive ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'}" />
						</svg>
						{stat.change}
					</span>
				</div>
			</div>
		{/each}
	</div>

	<!-- Main Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Weekly Activity Chart -->
		<div class="lg:col-span-2 glass rounded-2xl p-6 border border-white/5 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.15s;">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-1.5 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
				<h2 class="text-xl font-display font-semibold text-white">Weekly Activity</h2>
			</div>

			<div class="flex items-end justify-between h-48 gap-4">
				{#each weeklyActivity as day}
					<div class="flex-1 flex flex-col items-center gap-2">
						<div class="w-full flex flex-col items-center">
							<span class="text-xs text-gray-400 mb-2">{day.sessions}</span>
							<div class="w-full bg-white/5 rounded-t-lg overflow-hidden" style="height: {(day.sessions / maxSessions) * 150}px;">
								<div class="w-full h-full bg-gradient-to-t from-purple-500 to-pink-500 opacity-80 hover:opacity-100 transition-opacity"></div>
							</div>
						</div>
						<span class="text-sm text-gray-400">{day.day}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Score Distribution -->
		<div class="glass rounded-2xl p-6 border border-white/5 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-1.5 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
				<h2 class="text-lg font-display font-semibold text-white">Score Distribution</h2>
			</div>

			<div class="space-y-4">
				{#each scoreDistribution as score}
					<div>
						<div class="flex justify-between text-sm mb-1.5">
							<span class="text-gray-400">{score.range}</span>
							<span class="text-white font-medium">{score.count} students ({score.percentage}%)</span>
						</div>
						<div class="h-2 bg-white/5 rounded-full overflow-hidden">
							<div
								class="h-full rounded-full transition-all
									{score.range === '90-100' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' :
									score.range === '80-89' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
									score.range === '70-79' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
									score.range === '60-69' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
									'bg-gradient-to-r from-rose-500 to-red-500'}"
								style="width: {score.percentage}%"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Lab Performance Table -->
	<div class="glass rounded-2xl border border-white/5 overflow-hidden {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.25s;">
		<div class="p-6 border-b border-white/5">
			<div class="flex items-center gap-3">
				<div class="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full"></div>
				<h2 class="text-xl font-display font-semibold text-white">Lab Performance</h2>
			</div>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b border-white/5">
						<th class="text-left p-4 text-sm font-medium text-gray-400">Lab Name</th>
						<th class="text-left p-4 text-sm font-medium text-gray-400">Completions</th>
						<th class="text-left p-4 text-sm font-medium text-gray-400">Avg. Score</th>
						<th class="text-left p-4 text-sm font-medium text-gray-400">Avg. Time</th>
						<th class="text-left p-4 text-sm font-medium text-gray-400">Difficulty</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-white/5">
					{#each labPerformance as lab}
						<tr class="hover:bg-white/[0.02] transition-colors">
							<td class="p-4">
								<span class="font-medium text-white">{lab.name}</span>
							</td>
							<td class="p-4 text-gray-300">{lab.completions}</td>
							<td class="p-4">
								<span class="font-display font-bold
									{lab.avgScore >= 85 ? 'text-emerald-400' : lab.avgScore >= 75 ? 'text-cyan-400' : 'text-amber-400'}">
									{lab.avgScore}%
								</span>
							</td>
							<td class="p-4 text-gray-300">{lab.avgTime}</td>
							<td class="p-4">
								<span class="px-2.5 py-1 rounded-full text-xs font-medium {getDifficultyColor(lab.difficulty)}">
									{lab.difficulty.charAt(0).toUpperCase() + lab.difficulty.slice(1)}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Common Mistakes & Insights -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Common Mistakes -->
		<div class="glass rounded-2xl p-6 border border-white/5 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.3s;">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-1.5 h-6 bg-gradient-to-b from-rose-500 to-orange-500 rounded-full"></div>
				<h2 class="text-lg font-display font-semibold text-white">Common Mistakes</h2>
			</div>

			<div class="space-y-4">
				{#each commonMistakes as mistake, i}
					<div class="flex items-center gap-4 p-3 glass rounded-xl border border-white/5">
						<div class="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 text-sm font-bold">
							{i + 1}
						</div>
						<div class="flex-1">
							<p class="text-sm font-medium text-white">{mistake.mistake}</p>
							<p class="text-xs text-gray-500">{mistake.lab}</p>
						</div>
						<div class="text-right">
							<span class="text-lg font-display font-bold text-rose-400">{mistake.frequency}</span>
							<span class="text-xs text-gray-500 block">occurrences</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- AI Insights -->
		<div class="glass rounded-2xl p-6 border border-white/5 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.35s;">
			<div class="flex items-center gap-3 mb-6">
				<div class="w-1.5 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
				<h2 class="text-lg font-display font-semibold text-white">AI Insights</h2>
			</div>

			<div class="space-y-4">
				<div class="p-4 glass-strong rounded-xl border border-purple-500/20">
					<div class="flex items-start gap-3">
						<div class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
							<svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
						<div>
							<p class="text-sm font-medium text-white mb-1">Performance Trend</p>
							<p class="text-xs text-gray-400">Student scores have improved by 8% this month. Titration lab shows the highest engagement with 94% completion rate.</p>
						</div>
					</div>
				</div>

				<div class="p-4 glass-strong rounded-xl border border-cyan-500/20">
					<div class="flex items-start gap-3">
						<div class="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
							<svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
							</svg>
						</div>
						<div>
							<p class="text-sm font-medium text-white mb-1">Recommendation</p>
							<p class="text-xs text-gray-400">Consider adding more practice exercises for spectroscopy. Students frequently ask for additional examples during this lab.</p>
						</div>
					</div>
				</div>

				<div class="p-4 glass-strong rounded-xl border border-amber-500/20">
					<div class="flex items-start gap-3">
						<div class="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
							<svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						</div>
						<div>
							<p class="text-sm font-medium text-white mb-1">Attention Needed</p>
							<p class="text-xs text-gray-400">5 students have been inactive for more than a week. Consider reaching out to check on their progress.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
