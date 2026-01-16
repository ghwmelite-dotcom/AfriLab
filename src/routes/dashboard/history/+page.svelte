<script lang="ts">
	import { onMount } from 'svelte';
	import { formatDuration } from '$lib/utils/helpers';

	let mounted = $state(false);
	let selectedFilter = $state('all');
	let searchQuery = $state('');

	onMount(() => {
		mounted = true;
	});

	const filters = [
		{ id: 'all', label: 'All Labs' },
		{ id: 'chemistry', label: 'Chemistry' },
		{ id: 'biology', label: 'Biology' },
		{ id: 'physics', label: 'Physics' },
		{ id: 'pharmacy', label: 'Pharmacy' }
	];

	const labHistory = [
		{
			id: 1,
			title: 'Acid-Base Titration',
			discipline: 'Chemistry',
			disciplineId: 'chemistry',
			date: '2024-01-20T14:30:00',
			duration: 42,
			score: 94,
			status: 'completed',
			gradient: 'from-emerald-500 to-cyan-500'
		},
		{
			id: 2,
			title: 'UV-Vis Spectroscopy',
			discipline: 'Chemistry',
			disciplineId: 'chemistry',
			date: '2024-01-19T10:15:00',
			duration: 58,
			score: 87,
			status: 'completed',
			gradient: 'from-purple-500 to-pink-500'
		},
		{
			id: 3,
			title: 'Acid-Base Titration',
			discipline: 'Chemistry',
			disciplineId: 'chemistry',
			date: '2024-01-17T16:45:00',
			duration: 45,
			score: 91,
			status: 'completed',
			gradient: 'from-emerald-500 to-cyan-500'
		},
		{
			id: 4,
			title: 'Acid-Base Titration',
			discipline: 'Chemistry',
			disciplineId: 'chemistry',
			date: '2024-01-15T09:00:00',
			duration: 38,
			score: 78,
			status: 'completed',
			gradient: 'from-emerald-500 to-cyan-500'
		},
		{
			id: 5,
			title: 'UV-Vis Spectroscopy',
			discipline: 'Chemistry',
			disciplineId: 'chemistry',
			date: '2024-01-14T11:30:00',
			duration: 0,
			score: null,
			status: 'abandoned',
			gradient: 'from-purple-500 to-pink-500'
		}
	];

	let filteredHistory = $derived(labHistory.filter(lab => {
		const matchesFilter = selectedFilter === 'all' || lab.disciplineId === selectedFilter;
		const matchesSearch = !searchQuery || lab.title.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesFilter && matchesSearch;
	}));

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days === 0) return 'Today';
		if (days === 1) return 'Yesterday';
		if (days < 7) return `${days} days ago`;
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function formatTime(dateString: string) {
		return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
	}

	function getScoreColor(score: number | null) {
		if (score === null) return 'text-gray-500';
		if (score >= 90) return 'text-emerald-400';
		if (score >= 80) return 'text-cyan-400';
		if (score >= 70) return 'text-amber-400';
		return 'text-rose-400';
	}

	function getStatusBadge(status: string) {
		switch (status) {
			case 'completed':
				return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
			case 'in_progress':
				return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
			case 'abandoned':
				return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
			default:
				return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
		}
	}
</script>

<svelte:head>
	<title>Lab History - AfriLab</title>
</svelte:head>

<!-- Floating orbs -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="orb w-[350px] h-[350px] top-1/4 -right-32 bg-gradient-to-br from-purple-500/15 to-pink-500/10"></div>
	<div class="orb w-[250px] h-[250px] bottom-1/3 -left-24 bg-gradient-to-br from-emerald-500/15 to-cyan-500/10" style="animation-delay: 3s;"></div>
</div>

<div class="relative space-y-6 p-6 sm:p-8 max-w-7xl mx-auto">
	<!-- Header -->
	<div class="{mounted ? 'animate-fade-in-up' : 'opacity-0'}">
		<div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
			<a href="/dashboard" class="hover:text-emerald-400 transition-colors">Dashboard</a>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
			<span class="text-emerald-400">History</span>
		</div>
		<h1 class="text-3xl sm:text-4xl font-display font-bold text-white">
			Lab <span class="text-gradient-aurora">History</span>
		</h1>
		<p class="mt-2 text-gray-400">Review your past lab sessions and performance</p>
	</div>

	<!-- Filters and Search -->
	<div class="flex flex-col sm:flex-row gap-4 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.1s;">
		<!-- Search -->
		<div class="relative flex-1 max-w-md">
			<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
				<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>
			<input
				type="text"
				placeholder="Search lab history..."
				class="input pl-12 w-full"
				bind:value={searchQuery}
			/>
		</div>

		<!-- Filters -->
		<div class="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
			{#each filters as filter}
				<button
					onclick={() => selectedFilter = filter.id}
					class="px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all
						{selectedFilter === filter.id
						? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
						: 'glass border border-white/10 text-gray-400 hover:text-white hover:border-white/20'}"
				>
					{filter.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Stats Summary -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.15s;">
		<div class="glass rounded-xl p-4 border border-white/5">
			<p class="text-2xl font-display font-bold text-white">{labHistory.filter(l => l.status === 'completed').length}</p>
			<p class="text-sm text-gray-500">Completed Labs</p>
		</div>
		<div class="glass rounded-xl p-4 border border-white/5">
			<p class="text-2xl font-display font-bold text-emerald-400">
				{Math.round(labHistory.filter(l => l.score).reduce((a, b) => a + (b.score || 0), 0) / labHistory.filter(l => l.score).length)}%
			</p>
			<p class="text-sm text-gray-500">Average Score</p>
		</div>
		<div class="glass rounded-xl p-4 border border-white/5">
			<p class="text-2xl font-display font-bold text-cyan-400">
				{formatDuration(labHistory.reduce((a, b) => a + b.duration, 0))}
			</p>
			<p class="text-sm text-gray-500">Total Time</p>
		</div>
		<div class="glass rounded-xl p-4 border border-white/5">
			<p class="text-2xl font-display font-bold text-amber-400">
				{Math.max(...labHistory.filter(l => l.score).map(l => l.score || 0))}%
			</p>
			<p class="text-sm text-gray-500">Best Score</p>
		</div>
	</div>

	<!-- History List -->
	<div class="glass-strong rounded-2xl border border-white/5 overflow-hidden {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">
		{#if filteredHistory.length === 0}
			<div class="text-center py-16">
				<svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<h3 class="text-xl font-display font-semibold text-white mb-2">No history found</h3>
				<p class="text-gray-400">Try adjusting your filters or search query</p>
			</div>
		{:else}
			<div class="divide-y divide-white/5">
				{#each filteredHistory as lab, i}
					<div class="group p-5 flex items-center gap-5 hover:bg-white/[0.02] transition-colors">
						<!-- Lab Icon -->
						<div class="relative flex-shrink-0">
							<div class="absolute inset-0 bg-gradient-to-br {lab.gradient} rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
							<div class="relative w-14 h-14 glass rounded-xl flex items-center justify-center border border-white/10">
								<svg class="w-7 h-7 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
								</svg>
							</div>
						</div>

						<!-- Lab Info -->
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-3 mb-1">
								<h3 class="font-display font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
									{lab.title}
								</h3>
								<span class="text-xs px-2 py-0.5 rounded-full border {getStatusBadge(lab.status)} capitalize">
									{lab.status.replace('_', ' ')}
								</span>
							</div>
							<div class="flex items-center gap-3 text-sm text-gray-500">
								<span>{lab.discipline}</span>
								<span class="w-1 h-1 rounded-full bg-gray-600"></span>
								<span>{formatDate(lab.date)}</span>
								<span class="w-1 h-1 rounded-full bg-gray-600"></span>
								<span>{formatTime(lab.date)}</span>
							</div>
						</div>

						<!-- Duration -->
						<div class="hidden sm:block text-center px-4">
							<p class="text-lg font-semibold text-white">
								{lab.duration > 0 ? formatDuration(lab.duration) : '--'}
							</p>
							<p class="text-xs text-gray-500">Duration</p>
						</div>

						<!-- Score -->
						<div class="text-center px-4">
							<p class="text-lg font-semibold {getScoreColor(lab.score)}">
								{lab.score !== null ? `${lab.score}%` : '--'}
							</p>
							<p class="text-xs text-gray-500">Score</p>
						</div>

						<!-- Actions -->
						<div class="flex items-center gap-2">
							<button class="p-2 rounded-lg glass border border-white/5 hover:border-emerald-500/30 text-gray-400 hover:text-emerald-400 transition-all" title="View Details">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
								</svg>
							</button>
							<button class="p-2 rounded-lg glass border border-white/5 hover:border-cyan-500/30 text-gray-400 hover:text-cyan-400 transition-all" title="Retry Lab">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(60px);
		opacity: 0.5;
		animation: orb-float 10s ease-in-out infinite;
	}

	@keyframes orb-float {
		0%, 100% { transform: translate(0, 0) scale(1); }
		25% { transform: translate(10px, -20px) scale(1.05); }
		50% { transform: translate(-10px, 10px) scale(0.95); }
		75% { transform: translate(20px, 15px) scale(1.02); }
	}
</style>
