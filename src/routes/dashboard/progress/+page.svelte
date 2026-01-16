<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser } from '$stores/user';

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	// Mock data - in production this would come from the server
	const weeklyActivity = [
		{ day: 'Mon', hours: 2.5, labs: 1 },
		{ day: 'Tue', hours: 1.8, labs: 1 },
		{ day: 'Wed', hours: 3.2, labs: 2 },
		{ day: 'Thu', hours: 0.5, labs: 0 },
		{ day: 'Fri', hours: 4.1, labs: 2 },
		{ day: 'Sat', hours: 2.0, labs: 1 },
		{ day: 'Sun', hours: 1.5, labs: 1 }
	];

	const maxHours = Math.max(...weeklyActivity.map(d => d.hours));

	const skills = [
		{ name: 'Titration Techniques', level: 85, color: 'from-emerald-500 to-cyan-500' },
		{ name: 'Spectroscopy Analysis', level: 72, color: 'from-blue-500 to-indigo-500' },
		{ name: 'Lab Safety Protocols', level: 95, color: 'from-green-500 to-emerald-500' },
		{ name: 'Data Recording', level: 88, color: 'from-amber-500 to-orange-500' },
		{ name: 'Equipment Handling', level: 78, color: 'from-purple-500 to-pink-500' }
	];

	const achievements = [
		{ id: 1, title: 'First Steps', description: 'Complete your first lab', icon: 'rocket', earned: true, date: '2024-01-15' },
		{ id: 2, title: 'Precision Master', description: 'Achieve 95%+ accuracy in titration', icon: 'target', earned: true, date: '2024-01-20' },
		{ id: 3, title: 'Safety First', description: 'Complete all safety modules', icon: 'shield', earned: true, date: '2024-01-18' },
		{ id: 4, title: 'Week Warrior', description: 'Complete labs 7 days in a row', icon: 'fire', earned: false, progress: 5, total: 7 },
		{ id: 5, title: 'Chemistry Whiz', description: 'Complete all chemistry labs', icon: 'beaker', earned: false, progress: 2, total: 5 },
		{ id: 6, title: 'Speed Demon', description: 'Complete a lab in under 20 minutes', icon: 'lightning', earned: false, progress: 0, total: 1 }
	];

	const recentLabs = [
		{ title: 'Acid-Base Titration', date: '2 hours ago', score: 94, duration: '42 min' },
		{ title: 'UV-Vis Spectroscopy', date: 'Yesterday', score: 87, duration: '58 min' },
		{ title: 'Acid-Base Titration', date: '3 days ago', score: 91, duration: '45 min' }
	];

	const stats = [
		{ label: 'Total Labs', value: '12', change: '+3 this week', icon: 'beaker', gradient: 'from-emerald-500 to-cyan-500' },
		{ label: 'Avg Score', value: '91%', change: '+5% improvement', icon: 'star', gradient: 'from-amber-500 to-orange-500' },
		{ label: 'Time Spent', value: '15.6h', change: '2.3h this week', icon: 'clock', gradient: 'from-blue-500 to-indigo-500' },
		{ label: 'Streak', value: '5 days', change: 'Personal best!', icon: 'fire', gradient: 'from-rose-500 to-pink-500' }
	];
</script>

<svelte:head>
	<title>Progress - AfriLab</title>
</svelte:head>

<!-- Floating orbs -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="orb w-[400px] h-[400px] -top-32 right-1/4 bg-gradient-to-br from-emerald-500/15 to-cyan-500/10"></div>
	<div class="orb w-[300px] h-[300px] bottom-1/4 -left-32 bg-gradient-to-br from-blue-500/15 to-purple-500/10" style="animation-delay: 2s;"></div>
</div>

<div class="relative space-y-8 p-6 sm:p-8 max-w-7xl mx-auto">
	<!-- Header -->
	<div class="{mounted ? 'animate-fade-in-up' : 'opacity-0'}">
		<div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
			<a href="/dashboard" class="hover:text-emerald-400 transition-colors">Dashboard</a>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
			<span class="text-emerald-400">Progress</span>
		</div>
		<h1 class="text-3xl sm:text-4xl font-display font-bold text-white">
			Your Learning <span class="text-gradient-aurora">Journey</span>
		</h1>
		<p class="mt-2 text-gray-400">Track your progress, achievements, and skill development</p>
	</div>

	<!-- Stats Overview -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.1s;">
		{#each stats as stat}
			<div class="group glass-strong rounded-2xl p-5 border border-white/5 hover:border-emerald-500/20 transition-all duration-300 hover:-translate-y-1">
				<div class="flex items-start justify-between mb-3">
					<div class="w-10 h-10 rounded-xl bg-gradient-to-br {stat.gradient} flex items-center justify-center">
						<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							{#if stat.icon === 'beaker'}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
							{:else if stat.icon === 'star'}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
							{:else if stat.icon === 'clock'}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							{:else}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
							{/if}
						</svg>
					</div>
				</div>
				<p class="text-2xl font-display font-bold text-white">{stat.value}</p>
				<p class="text-sm text-gray-400 mt-1">{stat.label}</p>
				<p class="text-xs text-emerald-400 mt-2">{stat.change}</p>
			</div>
		{/each}
	</div>

	<div class="grid lg:grid-cols-3 gap-6">
		<!-- Weekly Activity Chart -->
		<div class="lg:col-span-2 glass-strong rounded-2xl p-6 border border-white/5 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">
			<div class="flex items-center justify-between mb-6">
				<div>
					<h2 class="text-lg font-display font-semibold text-white">Weekly Activity</h2>
					<p class="text-sm text-gray-500">Hours spent in labs this week</p>
				</div>
				<div class="flex items-center gap-4 text-sm">
					<div class="flex items-center gap-2">
						<div class="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
						<span class="text-gray-400">Hours</span>
					</div>
				</div>
			</div>

			<!-- Chart -->
			<div class="flex items-end justify-between gap-3 h-48">
				{#each weeklyActivity as day, i}
					<div class="flex-1 flex flex-col items-center gap-2">
						<div class="relative w-full flex flex-col items-center justify-end h-40">
							<!-- Bar -->
							<div
								class="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-emerald-500 to-cyan-500 transition-all duration-500 hover:from-emerald-400 hover:to-cyan-400"
								style="height: {(day.hours / maxHours) * 100}%; animation-delay: {i * 0.1}s;"
							>
								<!-- Tooltip on hover -->
								<div class="opacity-0 hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 rounded text-xs text-white whitespace-nowrap transition-opacity">
									{day.hours}h
								</div>
							</div>
						</div>
						<span class="text-xs text-gray-500">{day.day}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Skills Radar -->
		<div class="glass-strong rounded-2xl p-6 border border-white/5 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.25s;">
			<h2 class="text-lg font-display font-semibold text-white mb-6">Skill Progress</h2>
			<div class="space-y-4">
				{#each skills as skill}
					<div>
						<div class="flex items-center justify-between mb-2">
							<span class="text-sm text-gray-300">{skill.name}</span>
							<span class="text-sm font-medium text-white">{skill.level}%</span>
						</div>
						<div class="h-2 bg-white/5 rounded-full overflow-hidden">
							<div
								class="h-full bg-gradient-to-r {skill.color} rounded-full transition-all duration-1000"
								style="width: {skill.level}%;"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Achievements Section -->
	<div class="glass-strong rounded-2xl p-6 border border-white/5 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.3s;">
		<div class="flex items-center justify-between mb-6">
			<div>
				<h2 class="text-lg font-display font-semibold text-white">Achievements</h2>
				<p class="text-sm text-gray-500">{achievements.filter(a => a.earned).length} of {achievements.length} unlocked</p>
			</div>
			<a href="/dashboard/leaderboard" class="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">View all</a>
		</div>

		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
			{#each achievements as achievement}
				<div class="group relative text-center p-4 rounded-xl border transition-all duration-300
					{achievement.earned
						? 'glass border-emerald-500/30 hover:border-emerald-400/50'
						: 'bg-white/[0.02] border-white/5 opacity-60'}">

					<!-- Badge icon -->
					<div class="relative w-14 h-14 mx-auto mb-3">
						{#if achievement.earned}
							<div class="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full blur-md opacity-40"></div>
						{/if}
						<div class="relative w-full h-full rounded-full flex items-center justify-center
							{achievement.earned ? 'bg-gradient-to-br from-emerald-500 to-cyan-500' : 'bg-white/5'}">
							<svg class="w-7 h-7 {achievement.earned ? 'text-white' : 'text-gray-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								{#if achievement.icon === 'rocket'}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
								{:else if achievement.icon === 'target'}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
								{:else if achievement.icon === 'shield'}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
								{:else if achievement.icon === 'fire'}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
								{:else if achievement.icon === 'beaker'}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
								{:else}
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
								{/if}
							</svg>
						</div>
					</div>

					<h3 class="text-sm font-medium {achievement.earned ? 'text-white' : 'text-gray-500'}">{achievement.title}</h3>
					<p class="text-xs text-gray-500 mt-1 line-clamp-2">{achievement.description}</p>

					{#if !achievement.earned && achievement.progress !== undefined}
						<div class="mt-2">
							<div class="h-1 bg-white/5 rounded-full overflow-hidden">
								<div class="h-full bg-gray-600 rounded-full" style="width: {(achievement.progress / achievement.total) * 100}%"></div>
							</div>
							<p class="text-xs text-gray-600 mt-1">{achievement.progress}/{achievement.total}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- Recent Labs -->
	<div class="glass-strong rounded-2xl border border-white/5 overflow-hidden {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.35s;">
		<div class="p-6 border-b border-white/5">
			<h2 class="text-lg font-display font-semibold text-white">Recent Lab Sessions</h2>
		</div>
		<div class="divide-y divide-white/5">
			{#each recentLabs as lab}
				<div class="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
					<div class="flex items-center gap-4">
						<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
							<svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
							</svg>
						</div>
						<div>
							<h3 class="font-medium text-white">{lab.title}</h3>
							<p class="text-sm text-gray-500">{lab.date} &bull; {lab.duration}</p>
						</div>
					</div>
					<div class="text-right">
						<div class="text-lg font-semibold {lab.score >= 90 ? 'text-emerald-400' : lab.score >= 80 ? 'text-amber-400' : 'text-gray-400'}">
							{lab.score}%
						</div>
						<div class="text-xs text-gray-500">Score</div>
					</div>
				</div>
			{/each}
		</div>
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
