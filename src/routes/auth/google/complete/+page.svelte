<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data } = $props();

	let loading = $state(false);
	let error = $state('');
	let selectedRole = $state('');
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});
</script>

<svelte:head>
	<title>Complete Sign Up - AfriLab</title>
</svelte:head>

<!-- Ambient background -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora"></div>
	<div class="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl animate-blob"></div>
	<div class="absolute bottom-1/4 -right-32 w-96 h-96 bg-gradient-to-r from-teal-500/20 to-green-500/20 rounded-full blur-3xl animate-blob" style="animation-delay: 3s;"></div>
</div>

<div class="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<!-- Header -->
		<div class="text-center {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
			<a href="/" class="inline-block group" aria-label="AfriLab home">
				<div class="flex justify-center">
					<div class="relative">
						<div class="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
						<div class="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
							<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
							</svg>
						</div>
					</div>
				</div>
			</a>
			<h2 class="mt-8 text-3xl font-display font-bold text-white">
				Almost <span class="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">there!</span>
			</h2>
			<p class="mt-3 text-gray-400">
				One more step to complete your account
			</p>
		</div>

		<!-- Card -->
		<div class="glass-strong rounded-2xl p-8 border border-white/10 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.1s;">
			<!-- Google profile preview -->
			<div class="flex items-center gap-4 mb-8 p-4 glass rounded-xl border border-white/10">
				{#if data.avatarUrl}
					<img
						src={data.avatarUrl}
						alt="Profile"
						class="w-12 h-12 rounded-full ring-2 ring-emerald-500/50"
						referrerpolicy="no-referrer"
					/>
				{:else}
					<div class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
						<span class="text-white text-lg font-bold">{data.firstName?.[0] || '?'}</span>
					</div>
				{/if}
				<div class="flex-1 min-w-0">
					<p class="text-white font-medium truncate">{data.firstName} {data.lastName}</p>
					<p class="text-sm text-gray-400 truncate">{data.email}</p>
				</div>
				<div class="flex-shrink-0">
					<svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
				</div>
			</div>

			{#if error}
				<div class="mb-6 glass rounded-xl p-4 border border-rose-500/30 bg-rose-500/10">
					<div class="flex items-center gap-3">
						<svg class="w-5 h-5 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<p class="text-sm text-rose-400">{error}</p>
					</div>
				</div>
			{/if}

			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					error = '';
					return async ({ result }) => {
						loading = false;
						if (result.type === 'failure') {
							error = (result.data as { message?: string })?.message || 'Something went wrong';
						} else if (result.type === 'redirect') {
							goto(result.location);
						}
					};
				}}
			>
				<fieldset>
					<legend class="block text-sm font-medium text-gray-300 mb-4">
						How will you use AfriLab?
					</legend>
					<div class="grid grid-cols-2 gap-4">
						<label
							class="group relative glass rounded-xl p-5 cursor-pointer transition-all duration-300 border-2
								{selectedRole === 'student'
								? 'border-emerald-500/50 bg-emerald-500/10'
								: 'border-white/10 hover:border-white/20'}"
						>
							<input
								type="radio"
								name="role"
								value="student"
								class="sr-only"
								bind:group={selectedRole}
							/>
							{#if selectedRole === 'student'}
								<div class="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
									<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
								</div>
							{/if}
							<div class="text-center">
								<div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
									<svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
									</svg>
								</div>
								<span class="text-sm font-medium text-white">Student</span>
								<p class="text-xs text-gray-500 mt-1">Access lab experiments</p>
							</div>
						</label>
						<label
							class="group relative glass rounded-xl p-5 cursor-pointer transition-all duration-300 border-2
								{selectedRole === 'instructor'
								? 'border-emerald-500/50 bg-emerald-500/10'
								: 'border-white/10 hover:border-white/20'}"
						>
							<input
								type="radio"
								name="role"
								value="instructor"
								class="sr-only"
								bind:group={selectedRole}
							/>
							{#if selectedRole === 'instructor'}
								<div class="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
									<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
								</div>
							{/if}
							<div class="text-center">
								<div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
									<svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
									</svg>
								</div>
								<span class="text-sm font-medium text-white">Instructor</span>
								<p class="text-xs text-gray-500 mt-1">Manage students & labs</p>
							</div>
						</label>
					</div>
				</fieldset>

				<button
					type="submit"
					disabled={loading || !selectedRole}
					class="btn-primary w-full py-3.5 text-base mt-8"
				>
					{#if loading}
						<svg class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Creating account...
					{:else}
						Complete sign up
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
					{/if}
				</button>
			</form>
		</div>

		<p class="text-center text-sm text-gray-400 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">
			Wrong account?
			<a href="/auth/login" class="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
				Go back to sign in
			</a>
		</p>
	</div>
</div>
