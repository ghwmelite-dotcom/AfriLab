<script lang="ts">
	import { onMount } from 'svelte';

	let mounted = $state(false);
	let searchQuery = $state('');
	let filterStatus = $state('all');

	onMount(() => {
		mounted = true;
	});

	// Mock student data
	const students = [
		{ id: '1', name: 'Amina Okafor', initials: 'AO', email: 'amina.okafor@unilag.edu.ng', labsCompleted: 12, avgScore: 94, lastActive: '2 hours ago', status: 'active' },
		{ id: '2', name: 'Kwame Asante', initials: 'KA', email: 'kwame.asante@knust.edu.gh', labsCompleted: 8, avgScore: 82, lastActive: '1 day ago', status: 'active' },
		{ id: '3', name: 'Fatima Hassan', initials: 'FH', email: 'fatima.hassan@uct.ac.za', labsCompleted: 10, avgScore: 88, lastActive: '3 hours ago', status: 'active' },
		{ id: '4', name: 'David Mensah', initials: 'DM', email: 'david.mensah@ug.edu.gh', labsCompleted: 11, avgScore: 91, lastActive: '5 hours ago', status: 'active' },
		{ id: '5', name: 'Grace Nkrumah', initials: 'GN', email: 'grace.nkrumah@unilag.edu.ng', labsCompleted: 9, avgScore: 86, lastActive: '1 week ago', status: 'inactive' },
		{ id: '6', name: 'Emmanuel Adeyemi', initials: 'EA', email: 'emmanuel.adeyemi@ui.edu.ng', labsCompleted: 7, avgScore: 79, lastActive: '2 days ago', status: 'active' },
		{ id: '7', name: 'Chidinma Eze', initials: 'CE', email: 'chidinma.eze@unn.edu.ng', labsCompleted: 6, avgScore: 85, lastActive: '4 hours ago', status: 'active' },
		{ id: '8', name: 'Kofi Owusu', initials: 'KO', email: 'kofi.owusu@ashesi.edu.gh', labsCompleted: 5, avgScore: 77, lastActive: '2 weeks ago', status: 'inactive' }
	];

	let filteredStudents = $derived(students.filter(s => {
		const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			s.email.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesFilter = filterStatus === 'all' || s.status === filterStatus;
		return matchesSearch && matchesFilter;
	}));

	function getScoreColor(score: number): string {
		if (score >= 90) return 'text-emerald-400';
		if (score >= 80) return 'text-cyan-400';
		if (score >= 70) return 'text-amber-400';
		return 'text-rose-400';
	}
</script>

<svelte:head>
	<title>Students - AfriLab</title>
</svelte:head>

<!-- Ambient background -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-50"></div>
	<div class="absolute top-0 left-1/2 w-[600px] h-[600px] bg-gradient-to-b from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
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
					<span class="text-purple-400">Students</span>
				</div>
				<h1 class="text-3xl font-display font-bold text-white">
					Student <span class="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Management</span>
				</h1>
			</div>

			<button class="btn-primary">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
				Invite Students
			</button>
		</div>
	</div>

	<!-- Filters -->
	<div class="flex flex-col sm:flex-row gap-4 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.1s;">
		<div class="flex-1 relative">
			<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
				<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>
			<input
				type="text"
				placeholder="Search students by name or email..."
				class="input pl-12 w-full"
				bind:value={searchQuery}
			/>
		</div>

		<div class="flex gap-2">
			{#each ['all', 'active', 'inactive'] as status}
				<button
					onclick={() => filterStatus = status}
					class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all
						{filterStatus === status
							? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
							: 'glass border border-white/10 text-gray-400 hover:text-white hover:border-white/20'}"
				>
					{status.charAt(0).toUpperCase() + status.slice(1)}
				</button>
			{/each}
		</div>
	</div>

	<!-- Stats Summary -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.15s;">
		<div class="glass rounded-xl p-4 border border-white/5">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
					<svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
					</svg>
				</div>
				<div>
					<p class="text-2xl font-display font-bold text-white">{students.length}</p>
					<p class="text-xs text-gray-400">Total Students</p>
				</div>
			</div>
		</div>

		<div class="glass rounded-xl p-4 border border-white/5">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
					<svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<div>
					<p class="text-2xl font-display font-bold text-white">{students.filter(s => s.status === 'active').length}</p>
					<p class="text-xs text-gray-400">Active This Week</p>
				</div>
			</div>
		</div>

		<div class="glass rounded-xl p-4 border border-white/5">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
					<svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
				</div>
				<div>
					<p class="text-2xl font-display font-bold text-white">{Math.round(students.reduce((a, b) => a + b.avgScore, 0) / students.length)}%</p>
					<p class="text-xs text-gray-400">Class Average</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Students Table -->
	<div class="glass rounded-2xl border border-white/5 overflow-hidden {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b border-white/5">
						<th class="text-left p-4 text-sm font-medium text-gray-400">Student</th>
						<th class="text-left p-4 text-sm font-medium text-gray-400">Labs Completed</th>
						<th class="text-left p-4 text-sm font-medium text-gray-400">Avg. Score</th>
						<th class="text-left p-4 text-sm font-medium text-gray-400">Last Active</th>
						<th class="text-left p-4 text-sm font-medium text-gray-400">Status</th>
						<th class="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-white/5">
					{#each filteredStudents as student}
						<tr class="hover:bg-white/[0.02] transition-colors">
							<td class="p-4">
								<div class="flex items-center gap-3">
									<div class="relative">
										<div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-sm opacity-30"></div>
										<div class="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
											{student.initials}
										</div>
									</div>
									<div>
										<p class="font-medium text-white">{student.name}</p>
										<p class="text-sm text-gray-500">{student.email}</p>
									</div>
								</div>
							</td>
							<td class="p-4">
								<span class="text-white font-medium">{student.labsCompleted}</span>
								<span class="text-gray-500 text-sm"> labs</span>
							</td>
							<td class="p-4">
								<span class="font-display font-bold {getScoreColor(student.avgScore)}">{student.avgScore}%</span>
							</td>
							<td class="p-4 text-gray-400 text-sm">{student.lastActive}</td>
							<td class="p-4">
								<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
									{student.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}">
									<span class="w-1.5 h-1.5 rounded-full {student.status === 'active' ? 'bg-emerald-400' : 'bg-gray-400'}"></span>
									{student.status === 'active' ? 'Active' : 'Inactive'}
								</span>
							</td>
							<td class="p-4 text-right">
								<div class="flex items-center justify-end gap-2">
									<button class="p-2 rounded-lg glass border border-white/5 hover:border-purple-500/30 text-gray-400 hover:text-purple-400 transition-all" title="View Progress">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
										</svg>
									</button>
									<button class="p-2 rounded-lg glass border border-white/5 hover:border-cyan-500/30 text-gray-400 hover:text-cyan-400 transition-all" title="Send Message">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
										</svg>
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if filteredStudents.length === 0}
			<div class="p-12 text-center">
				<svg class="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
				</svg>
				<p class="text-gray-400">No students found matching your criteria</p>
			</div>
		{/if}
	</div>
</div>
