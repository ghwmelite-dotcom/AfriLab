<script lang="ts">
	import { onMount } from 'svelte';

	let status = $state<any>(null);
	let seedResult = $state<any>(null);
	let isLoading = $state(false);
	let error = $state('');

	onMount(async () => {
		await checkStatus();
	});

	async function checkStatus() {
		try {
			const res = await fetch('/api/seed');
			status = await res.json();
		} catch (err) {
			error = 'Failed to check status';
		}
	}

	async function runSeed() {
		isLoading = true;
		error = '';
		seedResult = null;

		try {
			const res = await fetch('/api/seed', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			seedResult = await res.json();
			await checkStatus();
		} catch (err) {
			error = 'Failed to seed database';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Seed Database - AfriLab Admin</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white p-8">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-3xl font-bold mb-8">AfriLab Database Seeder</h1>

		<!-- Current Status -->
		<div class="bg-gray-800 rounded-xl p-6 mb-8">
			<h2 class="text-xl font-semibold mb-4">Database Status</h2>
			{#if status}
				<div class="grid grid-cols-3 gap-4 mb-4">
					<div class="bg-gray-700 rounded-lg p-4">
						<p class="text-gray-400 text-sm">Users</p>
						<p class="text-2xl font-bold">{status.counts?.users || 0}</p>
					</div>
					<div class="bg-gray-700 rounded-lg p-4">
						<p class="text-gray-400 text-sm">Lab Sessions</p>
						<p class="text-2xl font-bold">{status.counts?.labSessions || 0}</p>
					</div>
					<div class="bg-gray-700 rounded-lg p-4">
						<p class="text-gray-400 text-sm">Experiments</p>
						<p class="text-2xl font-bold">{status.counts?.experiments || 0}</p>
					</div>
				</div>

				<h3 class="text-lg font-medium mb-2">Demo Accounts</h3>
				<div class="space-y-2">
					<div class="flex items-center gap-2">
						<span class="w-3 h-3 rounded-full {status.demoAccountsExist?.admin ? 'bg-green-500' : 'bg-red-500'}"></span>
						<span>Admin (oh84dev@gmail.com)</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="w-3 h-3 rounded-full {status.demoAccountsExist?.instructor ? 'bg-green-500' : 'bg-red-500'}"></span>
						<span>Instructor (instructor@afrilab.demo)</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="w-3 h-3 rounded-full {status.demoAccountsExist?.student ? 'bg-green-500' : 'bg-red-500'}"></span>
						<span>Student (student@afrilab.demo)</span>
					</div>
				</div>
			{:else}
				<p class="text-gray-400">Loading status...</p>
			{/if}
		</div>

		<!-- Seed Action -->
		<div class="bg-gray-800 rounded-xl p-6 mb-8">
			<h2 class="text-xl font-semibold mb-4">Run Database Seed</h2>
			<p class="text-gray-400 mb-4">
				This will create demo accounts and sample data. Existing accounts will be skipped.
			</p>
			<button
				onclick={runSeed}
				disabled={isLoading}
				class="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
			>
				{isLoading ? 'Seeding...' : 'Seed Database'}
			</button>

			{#if error}
				<div class="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
					{error}
				</div>
			{/if}
		</div>

		<!-- Seed Result -->
		{#if seedResult}
			<div class="bg-gray-800 rounded-xl p-6 mb-8">
				<h2 class="text-xl font-semibold mb-4 text-emerald-400">Seed Complete!</h2>

				<div class="grid grid-cols-2 gap-4 mb-6">
					<div class="bg-gray-700 rounded-lg p-4">
						<p class="text-gray-400 text-sm">Users Created</p>
						<p class="text-2xl font-bold text-emerald-400">{seedResult.results?.users?.created || 0}</p>
						<p class="text-sm text-gray-500">Skipped: {seedResult.results?.users?.skipped || 0}</p>
					</div>
					<div class="bg-gray-700 rounded-lg p-4">
						<p class="text-gray-400 text-sm">Sessions Created</p>
						<p class="text-2xl font-bold text-emerald-400">{seedResult.results?.sessions?.created || 0}</p>
						<p class="text-sm text-gray-500">Skipped: {seedResult.results?.sessions?.skipped || 0}</p>
					</div>
				</div>

				<h3 class="text-lg font-medium mb-4">Login Credentials</h3>
				<div class="space-y-4">
					<div class="bg-gray-700 rounded-lg p-4">
						<div class="flex items-center gap-2 mb-2">
							<span class="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">ADMIN</span>
							<span class="font-medium">Super Admin</span>
						</div>
						<p class="text-sm"><span class="text-gray-400">Email:</span> {seedResult.accounts?.admin?.email}</p>
						<p class="text-sm"><span class="text-gray-400">Password:</span> {seedResult.accounts?.admin?.password}</p>
					</div>

					<div class="bg-gray-700 rounded-lg p-4">
						<div class="flex items-center gap-2 mb-2">
							<span class="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">INSTRUCTOR</span>
							<span class="font-medium">Dr. Amara Okonkwo</span>
						</div>
						<p class="text-sm"><span class="text-gray-400">Email:</span> {seedResult.accounts?.instructor?.email}</p>
						<p class="text-sm"><span class="text-gray-400">Password:</span> {seedResult.accounts?.instructor?.password}</p>
					</div>

					<div class="bg-gray-700 rounded-lg p-4">
						<div class="flex items-center gap-2 mb-2">
							<span class="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded">STUDENT</span>
							<span class="font-medium">Kwame Asante</span>
						</div>
						<p class="text-sm"><span class="text-gray-400">Email:</span> {seedResult.accounts?.student?.email}</p>
						<p class="text-sm"><span class="text-gray-400">Password:</span> {seedResult.accounts?.student?.password}</p>
					</div>
				</div>
			</div>
		{/if}

		<!-- Quick Links -->
		<div class="bg-gray-800 rounded-xl p-6">
			<h2 class="text-xl font-semibold mb-4">Quick Links</h2>
			<div class="flex gap-4">
				<a href="/auth/login" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
					Login Page
				</a>
				<a href="/dashboard" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
					Student Dashboard
				</a>
				<a href="/instructor" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
					Instructor Dashboard
				</a>
			</div>
		</div>
	</div>
</div>
