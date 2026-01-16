<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ACHIEVEMENTS,
		getAchievement,
		getRarityColor,
		getRarityGradient,
		calculateLevel,
		getLevelTitle
	} from '$lib/utils/achievements';

	let { data } = $props();

	let mounted = $state(false);
	let activeTab = $state<'leaderboard' | 'achievements'>('leaderboard');
	let selectedCategory = $state<string>('all');

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

	let levelInfo = $derived(calculateLevel(data.userStats.points));
	let userTitle = $derived(getLevelTitle(levelInfo.level));

	let filteredAchievements = $derived(
		selectedCategory === 'all'
			? ACHIEVEMENTS
			: ACHIEVEMENTS.filter((a) => a.category === selectedCategory)
	);

	let categories = ['all', 'completion', 'mastery', 'streak', 'exploration', 'special'];
</script>

<svelte:head>
	<title>Leaderboard & Achievements - AfriLab</title>
</svelte:head>

<!-- Ambient background -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-50"></div>
	<div class="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-b from-amber-500/10 to-transparent rounded-full blur-3xl"></div>
	<div class="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-t from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
</div>

<div class="relative space-y-6 p-6 sm:p-8">
	<!-- Header -->
	<div class="{mounted ? 'animate-fade-in-up' : 'opacity-0'}">
		<div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
			<a href="/dashboard" class="hover:text-amber-400 transition-colors">Dashboard</a>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
			<span class="text-amber-400">Leaderboard</span>
		</div>
		<h1 class="text-3xl font-display font-bold text-white">
			<span class="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Leaderboard</span> & Achievements
		</h1>
		<p class="mt-2 text-gray-400">Track your progress and compete with fellow scientists</p>
	</div>

	<!-- User Stats Card -->
	<div class="glass-strong rounded-2xl p-6 border border-white/5 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.1s;">
		<div class="flex flex-col md:flex-row items-start md:items-center gap-6">
			<!-- Level Circle -->
			<div class="relative">
				<div class="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
					<div class="w-20 h-20 rounded-full bg-gray-900 flex flex-col items-center justify-center">
						<span class="text-2xl font-display font-bold text-white">{levelInfo.level}</span>
						<span class="text-[10px] text-gray-400 uppercase">Level</span>
					</div>
				</div>
				<!-- XP Progress ring -->
				<svg class="absolute inset-0 w-24 h-24 -rotate-90">
					<circle cx="48" cy="48" r="44" stroke="currentColor" stroke-width="4" fill="none" class="text-gray-800" />
					<circle
						cx="48"
						cy="48"
						r="44"
						stroke="url(#gradient)"
						stroke-width="4"
						fill="none"
						stroke-linecap="round"
						stroke-dasharray="{276.46 * levelInfo.progress / 100} 276.46"
					/>
					<defs>
						<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stop-color="#f59e0b" />
							<stop offset="100%" stop-color="#ea580c" />
						</linearGradient>
					</defs>
				</svg>
			</div>

			<!-- User Info -->
			<div class="flex-1">
				<div class="flex items-center gap-3 mb-2">
					<h2 class="text-xl font-display font-bold text-white">{data.user.name}</h2>
					<span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
						{userTitle}
					</span>
				</div>
				<div class="flex items-center gap-4 text-sm text-gray-400 mb-4">
					<span>Rank #{data.userStats.rank}</span>
					<span>•</span>
					<span>{data.userStats.points} points</span>
					<span>•</span>
					<span>{data.userStats.labsCompleted} labs</span>
				</div>

				<!-- XP Bar -->
				<div class="max-w-md">
					<div class="flex justify-between text-xs mb-1">
						<span class="text-gray-500">Level {levelInfo.level}</span>
						<span class="text-amber-400">{levelInfo.currentXP} / {levelInfo.requiredXP} XP</span>
					</div>
					<div class="h-2 bg-gray-800 rounded-full overflow-hidden">
						<div
							class="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
							style="width: {levelInfo.progress}%"
						></div>
					</div>
				</div>
			</div>

			<!-- Quick Stats -->
			<div class="flex gap-4">
				<div class="text-center px-4 py-2 rounded-xl glass border border-white/10">
					<div class="text-2xl font-bold text-amber-400">{data.userStats.streak}</div>
					<div class="text-xs text-gray-400">Day Streak</div>
				</div>
				<div class="text-center px-4 py-2 rounded-xl glass border border-white/10">
					<div class="text-2xl font-bold text-purple-400">{data.userStats.unlockedAchievements.length}</div>
					<div class="text-xs text-gray-400">Achievements</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Tab Navigation -->
	<div class="flex gap-2 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.15s;">
		<button
			onclick={() => (activeTab = 'leaderboard')}
			class="px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2
				{activeTab === 'leaderboard'
				? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
				: 'glass border border-white/10 text-gray-400 hover:text-white'}"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
			</svg>
			Leaderboard
		</button>
		<button
			onclick={() => (activeTab = 'achievements')}
			class="px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2
				{activeTab === 'achievements'
				? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
				: 'glass border border-white/10 text-gray-400 hover:text-white'}"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
			</svg>
			Achievements
		</button>
	</div>

	{#if activeTab === 'leaderboard'}
		<!-- Leaderboard Content -->
		<div class="grid lg:grid-cols-3 gap-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">
			<!-- Main Leaderboard -->
			<div class="lg:col-span-2 glass-strong rounded-2xl border border-white/5 overflow-hidden">
				<div class="p-4 border-b border-white/10">
					<h2 class="text-lg font-display font-semibold text-white">Global Rankings</h2>
				</div>

				<div class="divide-y divide-white/5">
					{#each data.leaderboard as player, i (player.rank)}
						<div class="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors
							{player.rank <= 3 ? 'bg-gradient-to-r from-amber-500/5 to-transparent' : ''}">
							<!-- Rank -->
							<div class="w-12 text-center">
								{#if player.rank === 1}
									<span class="text-2xl">🥇</span>
								{:else if player.rank === 2}
									<span class="text-2xl">🥈</span>
								{:else if player.rank === 3}
									<span class="text-2xl">🥉</span>
								{:else}
									<span class="text-lg font-bold text-gray-500">#{player.rank}</span>
								{/if}
							</div>

							<!-- Avatar & Name -->
							<div class="flex items-center gap-3 flex-1">
								<div class="w-10 h-10 rounded-full bg-gradient-to-br {player.rank === 1 ? 'from-amber-500 to-orange-500' : player.rank === 2 ? 'from-gray-400 to-gray-500' : player.rank === 3 ? 'from-orange-600 to-amber-700' : 'from-gray-600 to-gray-700'} flex items-center justify-center">
									<span class="text-sm font-bold text-white">
										{player.name.split(' ').map(n => n[0]).join('')}
									</span>
								</div>
								<div>
									<div class="font-medium text-white">{player.name}</div>
									<div class="text-xs text-gray-500">{player.institution}</div>
								</div>
							</div>

							<!-- Stats -->
							<div class="hidden md:flex items-center gap-6 text-sm">
								<div class="text-center">
									<div class="font-mono text-amber-400">{player.level}</div>
									<div class="text-[10px] text-gray-500">Level</div>
								</div>
								<div class="text-center">
									<div class="font-mono text-cyan-400">{player.labsCompleted}</div>
									<div class="text-[10px] text-gray-500">Labs</div>
								</div>
								<div class="text-center">
									<div class="font-mono text-rose-400">{player.streak}🔥</div>
									<div class="text-[10px] text-gray-500">Streak</div>
								</div>
							</div>

							<!-- Points -->
							<div class="text-right">
								<div class="font-display font-bold text-white">{player.points.toLocaleString()}</div>
								<div class="text-xs text-gray-500">points</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Recent Achievements -->
			<div class="glass-strong rounded-2xl border border-white/5 p-6">
				<h2 class="text-lg font-display font-semibold text-white mb-4">Recent Unlocks</h2>

				<div class="space-y-4">
					{#each data.recentAchievements as recent}
						{@const achievement = getAchievement(recent.achievementId)}
						{#if achievement}
							<div class="flex items-center gap-3 p-3 rounded-xl glass border {getRarityColor(achievement.rarity)}">
								<div class="text-2xl">{achievement.icon}</div>
								<div class="flex-1 min-w-0">
									<div class="text-sm font-medium text-white truncate">{achievement.name}</div>
									<div class="text-xs text-gray-400">{recent.userName}</div>
								</div>
								<div class="text-xs text-gray-500">{formatTimeAgo(recent.unlockedAt)}</div>
							</div>
						{/if}
					{/each}
				</div>

				<!-- Streak Leaders -->
				<h3 class="text-sm font-semibold text-white mt-6 mb-3 flex items-center gap-2">
					<span class="text-lg">🔥</span> Longest Streaks
				</h3>
				<div class="space-y-2">
					{#each data.leaderboard.sort((a, b) => b.streak - a.streak).slice(0, 5) as player, i}
						<div class="flex items-center justify-between text-sm">
							<span class="text-gray-400">{player.name.split(' ')[0]}</span>
							<span class="font-mono {i === 0 ? 'text-amber-400' : 'text-gray-500'}">{player.streak} days</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{:else}
		<!-- Achievements Content -->
		<div class="space-y-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">
			<!-- Category Filter -->
			<div class="flex gap-2 overflow-x-auto pb-2">
				{#each categories as cat}
					<button
						onclick={() => (selectedCategory = cat)}
						class="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all capitalize
							{selectedCategory === cat
							? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
							: 'glass border border-white/10 text-gray-400 hover:text-white'}"
					>
						{cat === 'all' ? 'All Achievements' : cat}
					</button>
				{/each}
			</div>

			<!-- Progress Summary -->
			<div class="glass-strong rounded-xl p-4 border border-white/10">
				<div class="flex items-center justify-between">
					<span class="text-sm text-gray-400">Achievement Progress</span>
					<span class="text-sm text-purple-400">
						{data.userStats.unlockedAchievements.length} / {ACHIEVEMENTS.length} unlocked
					</span>
				</div>
				<div class="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
					<div
						class="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
						style="width: {(data.userStats.unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%"
					></div>
				</div>
			</div>

			<!-- Achievements Grid -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each filteredAchievements as achievement (achievement.id)}
					{@const isUnlocked = data.userStats.unlockedAchievements.includes(achievement.id)}
					<div
						class="relative glass-strong rounded-2xl p-5 border transition-all
							{isUnlocked
							? `${getRarityColor(achievement.rarity)} hover:scale-[1.02]`
							: 'border-white/5 opacity-60'}"
					>
						<!-- Rarity indicator -->
						<div class="absolute top-3 right-3">
							<span class="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border
								{getRarityColor(achievement.rarity)}">
								{achievement.rarity}
							</span>
						</div>

						<div class="flex items-start gap-4">
							<!-- Icon -->
							<div class="w-14 h-14 rounded-xl bg-gradient-to-br {getRarityGradient(achievement.rarity)} flex items-center justify-center
								{isUnlocked ? '' : 'grayscale'}">
								<span class="text-2xl">{isUnlocked ? achievement.icon : '🔒'}</span>
							</div>

							<!-- Content -->
							<div class="flex-1">
								<h3 class="font-display font-semibold text-white">{achievement.name}</h3>
								<p class="text-xs text-gray-400 mt-1">{achievement.description}</p>
								<div class="flex items-center gap-2 mt-2">
									<span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
										+{achievement.points} pts
									</span>
									{#if isUnlocked}
										<span class="text-xs text-emerald-400 flex items-center gap-1">
											<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
											</svg>
											Unlocked
										</span>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
