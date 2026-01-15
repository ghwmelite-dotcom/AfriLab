<script lang="ts">
	import { currentUser } from '$stores/user';
	import type { PageData } from './$types';

	export let data: PageData;

	const stats = [
		{ label: 'Total Students', value: data.studentCount || 0, icon: 'users', color: 'bg-blue-500' },
		{ label: 'Active Labs', value: data.activeLabsCount || 0, icon: 'beaker', color: 'bg-green-500' },
		{ label: 'Completed This Week', value: data.completedThisWeek || 0, icon: 'check', color: 'bg-amber-500' },
		{ label: 'Avg. Score', value: data.avgScore ? `${data.avgScore}%` : 'N/A', icon: 'chart', color: 'bg-purple-500' }
	];
</script>

<svelte:head>
	<title>Instructor Dashboard - AfriLab</title>
</svelte:head>

<div class="space-y-6">
	<!-- Welcome -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
				Instructor Dashboard
			</h1>
			<p class="text-gray-600 dark:text-gray-400">
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

	<!-- Stats -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
		{#each stats as stat}
			<div class="card p-5">
				<div class="flex items-center gap-4">
					<div class="w-12 h-12 {stat.color} rounded-xl flex items-center justify-center text-white">
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
					<div>
						<p class="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
						<p class="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Recent Activity -->
	<div class="card">
		<div class="p-5 border-b border-gray-200 dark:border-gray-700">
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Student Activity</h2>
		</div>
		<div class="divide-y divide-gray-200 dark:divide-gray-700">
			{#if data.recentActivity && data.recentActivity.length > 0}
				{#each data.recentActivity as activity}
					<div class="p-5 flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400">
								{activity.studentInitials}
							</div>
							<div>
								<p class="font-medium text-gray-900 dark:text-white">{activity.studentName}</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">{activity.action}</p>
							</div>
						</div>
						<span class="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
					</div>
				{/each}
			{:else}
				<div class="p-8 text-center">
					<svg class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<p class="text-gray-500 dark:text-gray-400">No recent activity</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<a href="/instructor/students" class="card p-5 hover:shadow-lg transition-shadow">
			<div class="flex items-center gap-4">
				<div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
					<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
					</svg>
				</div>
				<div>
					<h3 class="font-medium text-gray-900 dark:text-white">View Students</h3>
					<p class="text-sm text-gray-500 dark:text-gray-400">Manage your class roster</p>
				</div>
			</div>
		</a>

		<a href="/instructor/analytics" class="card p-5 hover:shadow-lg transition-shadow">
			<div class="flex items-center gap-4">
				<div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
					<svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
				</div>
				<div>
					<h3 class="font-medium text-gray-900 dark:text-white">Analytics</h3>
					<p class="text-sm text-gray-500 dark:text-gray-400">View performance data</p>
				</div>
			</div>
		</a>

		<a href="/instructor/assignments" class="card p-5 hover:shadow-lg transition-shadow">
			<div class="flex items-center gap-4">
				<div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
					<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
					</svg>
				</div>
				<div>
					<h3 class="font-medium text-gray-900 dark:text-white">Assignments</h3>
					<p class="text-sm text-gray-500 dark:text-gray-400">Create and manage tasks</p>
				</div>
			</div>
		</a>
	</div>
</div>
