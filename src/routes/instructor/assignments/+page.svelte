<script lang="ts">
	import { onMount } from 'svelte';

	let mounted = false;
	let searchQuery = '';
	let filterStatus = 'all';
	let showCreateModal = false;

	onMount(() => {
		mounted = true;
	});

	// Mock assignment data
	const assignments = [
		{
			id: '1',
			title: 'Acid-Base Titration Lab',
			lab: 'Chemistry',
			labIcon: '🧪',
			dueDate: '2024-02-15',
			assignedTo: 45,
			submitted: 38,
			graded: 32,
			status: 'active',
			avgScore: 87
		},
		{
			id: '2',
			title: 'UV-Vis Spectroscopy Analysis',
			lab: 'Chemistry',
			labIcon: '🧪',
			dueDate: '2024-02-20',
			assignedTo: 45,
			submitted: 12,
			graded: 5,
			status: 'active',
			avgScore: 91
		},
		{
			id: '3',
			title: 'Cell Division Observation',
			lab: 'Biology',
			labIcon: '🔬',
			dueDate: '2024-02-10',
			assignedTo: 38,
			submitted: 38,
			graded: 38,
			status: 'completed',
			avgScore: 82
		},
		{
			id: '4',
			title: 'Ohm\'s Law Verification',
			lab: 'Physics',
			labIcon: '⚡',
			dueDate: '2024-02-25',
			assignedTo: 42,
			submitted: 0,
			graded: 0,
			status: 'draft',
			avgScore: null
		},
		{
			id: '5',
			title: 'Enzyme Kinetics Study',
			lab: 'Biology',
			labIcon: '🔬',
			dueDate: '2024-02-08',
			assignedTo: 38,
			submitted: 36,
			graded: 36,
			status: 'completed',
			avgScore: 79
		}
	];

	// New assignment form data
	let newAssignment = {
		title: '',
		lab: '',
		dueDate: '',
		instructions: '',
		maxScore: 100
	};

	const labs = [
		{ id: 'chem-titration', name: 'Acid-Base Titration', discipline: 'Chemistry' },
		{ id: 'chem-spectroscopy', name: 'UV-Vis Spectroscopy', discipline: 'Chemistry' },
		{ id: 'bio-microscopy', name: 'Cell Division Observation', discipline: 'Biology' },
		{ id: 'bio-enzymes', name: 'Enzyme Kinetics', discipline: 'Biology' },
		{ id: 'phys-ohm', name: 'Ohm\'s Law', discipline: 'Physics' }
	];

	let filteredAssignments = $derived(assignments.filter(a => {
		const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			a.lab.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesFilter = filterStatus === 'all' || a.status === filterStatus;
		return matchesSearch && matchesFilter;
	}));

	function getStatusStyle(status: string) {
		switch (status) {
			case 'active':
				return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
			case 'completed':
				return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
			case 'draft':
				return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
			default:
				return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
		}
	}

	function getDaysRemaining(dueDate: string): { days: number; urgent: boolean } {
		const due = new Date(dueDate);
		const now = new Date();
		const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
		return { days: diff, urgent: diff <= 3 && diff > 0 };
	}

	function handleCreateAssignment() {
		// In production, this would call an API
		console.log('Creating assignment:', newAssignment);
		showCreateModal = false;
		newAssignment = { title: '', lab: '', dueDate: '', instructions: '', maxScore: 100 };
	}
</script>

<svelte:head>
	<title>Assignments - AfriLab</title>
</svelte:head>

<!-- Ambient background -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora opacity-50"></div>
	<div class="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-b from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
	<div class="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-t from-pink-500/10 to-transparent rounded-full blur-3xl"></div>
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
					<span class="text-purple-400">Assignments</span>
				</div>
				<h1 class="text-3xl font-display font-bold text-white">
					Lab <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Assignments</span>
				</h1>
			</div>

			<button
				onclick={() => showCreateModal = true}
				class="btn-primary"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
				Create Assignment
			</button>
		</div>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-4 gap-4 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.1s;">
		<div class="glass rounded-xl p-4 border border-white/5">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
					<svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
					</svg>
				</div>
				<div>
					<p class="text-2xl font-display font-bold text-white">{assignments.length}</p>
					<p class="text-xs text-gray-400">Total Assignments</p>
				</div>
			</div>
		</div>

		<div class="glass rounded-xl p-4 border border-white/5">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
					<svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<div>
					<p class="text-2xl font-display font-bold text-white">{assignments.filter(a => a.status === 'active').length}</p>
					<p class="text-xs text-gray-400">Active</p>
				</div>
			</div>
		</div>

		<div class="glass rounded-xl p-4 border border-white/5">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
					<svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<div>
					<p class="text-2xl font-display font-bold text-white">{assignments.reduce((a, b) => a + b.submitted, 0)}</p>
					<p class="text-xs text-gray-400">Submissions</p>
				</div>
			</div>
		</div>

		<div class="glass rounded-xl p-4 border border-white/5">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
					<svg class="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
					</svg>
				</div>
				<div>
					<p class="text-2xl font-display font-bold text-white">
						{Math.round(assignments.filter(a => a.avgScore).reduce((a, b) => a + (b.avgScore || 0), 0) / assignments.filter(a => a.avgScore).length)}%
					</p>
					<p class="text-xs text-gray-400">Avg Score</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="flex flex-col sm:flex-row gap-4 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.15s;">
		<div class="flex-1 relative">
			<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
				<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>
			<input
				type="text"
				placeholder="Search assignments..."
				class="input pl-12 w-full"
				bind:value={searchQuery}
			/>
		</div>

		<div class="flex gap-2">
			{#each ['all', 'active', 'completed', 'draft'] as status}
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

	<!-- Assignments Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">
		{#each filteredAssignments as assignment}
			{@const remaining = getDaysRemaining(assignment.dueDate)}
			<div class="glass-strong rounded-2xl p-6 border border-white/5 hover:border-purple-500/30 transition-all group">
				<!-- Header -->
				<div class="flex items-start justify-between mb-4">
					<div class="flex items-center gap-3">
						<div class="text-2xl">{assignment.labIcon}</div>
						<div>
							<span class="text-xs text-gray-500 uppercase tracking-wider">{assignment.lab}</span>
							<h3 class="font-display font-semibold text-white group-hover:text-purple-300 transition-colors">
								{assignment.title}
							</h3>
						</div>
					</div>
					<span class="px-2.5 py-1 rounded-full text-xs font-medium border {getStatusStyle(assignment.status)}">
						{assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
					</span>
				</div>

				<!-- Progress -->
				<div class="space-y-3 mb-4">
					<div>
						<div class="flex justify-between text-sm mb-1.5">
							<span class="text-gray-400">Submissions</span>
							<span class="text-white font-medium">{assignment.submitted}/{assignment.assignedTo}</span>
						</div>
						<div class="h-2 bg-white/5 rounded-full overflow-hidden">
							<div
								class="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all rounded-full"
								style="width: {(assignment.submitted / assignment.assignedTo) * 100}%"
							></div>
						</div>
					</div>
					<div>
						<div class="flex justify-between text-sm mb-1.5">
							<span class="text-gray-400">Graded</span>
							<span class="text-white font-medium">{assignment.graded}/{assignment.submitted}</span>
						</div>
						<div class="h-2 bg-white/5 rounded-full overflow-hidden">
							<div
								class="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all rounded-full"
								style="width: {assignment.submitted > 0 ? (assignment.graded / assignment.submitted) * 100 : 0}%"
							></div>
						</div>
					</div>
				</div>

				<!-- Footer -->
				<div class="flex items-center justify-between pt-4 border-t border-white/5">
					<div class="flex items-center gap-2">
						<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						{#if assignment.status === 'completed'}
							<span class="text-sm text-gray-400">Completed</span>
						{:else if remaining.days < 0}
							<span class="text-sm text-rose-400">Overdue</span>
						{:else if remaining.urgent}
							<span class="text-sm text-amber-400 animate-pulse">{remaining.days} days left</span>
						{:else}
							<span class="text-sm text-gray-400">{remaining.days} days left</span>
						{/if}
					</div>

					{#if assignment.avgScore}
						<div class="flex items-center gap-2">
							<span class="text-sm text-gray-400">Avg:</span>
							<span class="font-display font-bold text-emerald-400">{assignment.avgScore}%</span>
						</div>
					{/if}
				</div>

				<!-- Actions -->
				<div class="flex gap-2 mt-4">
					<button class="flex-1 btn-secondary text-sm py-2">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
						</svg>
						View
					</button>
					<button class="flex-1 btn-secondary text-sm py-2">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
						Edit
					</button>
				</div>
			</div>
		{/each}
	</div>

	{#if filteredAssignments.length === 0}
		<div class="glass rounded-2xl p-12 text-center border border-white/5 {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
			<svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
			</svg>
			<p class="text-gray-400 mb-4">No assignments found matching your criteria</p>
			<button
				onclick={() => showCreateModal = true}
				class="btn-primary"
			>
				Create Your First Assignment
			</button>
		</div>
	{/if}
</div>

<!-- Create Assignment Modal -->
{#if showCreateModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<!-- Backdrop -->
		<div
			class="absolute inset-0 bg-black/60 backdrop-blur-sm"
			onclick={() => showCreateModal = false}
		></div>

		<!-- Modal -->
		<div class="relative glass-strong rounded-2xl p-8 max-w-lg w-full border border-white/10 animate-fade-in-up">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-2xl font-display font-bold text-white">Create Assignment</h2>
				<button
					onclick={() => showCreateModal = false}
					class="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<form onsubmit={(e) => { e.preventDefault(); handleCreateAssignment(); }} class="space-y-5">
				<div>
					<label class="block text-sm font-medium text-gray-300 mb-2">Assignment Title</label>
					<input
						type="text"
						class="input w-full"
						placeholder="e.g., Acid-Base Titration Lab"
						bind:value={newAssignment.title}
						required
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-300 mb-2">Select Lab</label>
					<select
						class="input w-full"
						bind:value={newAssignment.lab}
						required
					>
						<option value="">Choose a lab experiment...</option>
						{#each labs as lab}
							<option value={lab.id}>{lab.discipline} - {lab.name}</option>
						{/each}
					</select>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
						<input
							type="date"
							class="input w-full"
							bind:value={newAssignment.dueDate}
							required
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-300 mb-2">Max Score</label>
						<input
							type="number"
							class="input w-full"
							placeholder="100"
							bind:value={newAssignment.maxScore}
							min="1"
							max="1000"
						/>
					</div>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-300 mb-2">Instructions (Optional)</label>
					<textarea
						class="input w-full h-24 resize-none"
						placeholder="Add any specific instructions for students..."
						bind:value={newAssignment.instructions}
					></textarea>
				</div>

				<div class="flex gap-3 pt-4">
					<button
						type="button"
						onclick={() => showCreateModal = false}
						class="btn-secondary flex-1"
					>
						Cancel
					</button>
					<button type="submit" class="btn-primary flex-1">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
						</svg>
						Create Assignment
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
