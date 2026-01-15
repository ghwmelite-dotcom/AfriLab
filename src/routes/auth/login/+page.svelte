<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let loading = $state(false);
	let demoLoading = $state<string | null>(null);
	let error = $state('');
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	const redirectTo = $page.url.searchParams.get('redirect') || '/dashboard';

	async function demoLogin(role: 'student' | 'instructor' | 'admin') {
		demoLoading = role;
		error = '';

		try {
			const response = await fetch('/api/demo-login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ role })
			});

			const data = await response.json();

			if (data.success) {
				goto(data.redirect);
			} else {
				error = data.message || 'Demo login failed';
			}
		} catch (err) {
			error = 'Failed to connect to demo service';
		} finally {
			demoLoading = null;
		}
	}
</script>

<svelte:head>
	<title>Login - AfriLab</title>
</svelte:head>

<!-- Ambient background -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora"></div>
	<div class="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl animate-blob"></div>
	<div class="absolute bottom-1/4 -right-32 w-96 h-96 bg-gradient-to-r from-teal-500/20 to-green-500/20 rounded-full blur-3xl animate-blob" style="animation-delay: 3s;"></div>
</div>

<div class="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<!-- Logo and header -->
		<div class="text-center {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
			<a href="/" class="inline-block group">
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
				Welcome to <span class="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">AfriLab</span>
			</h2>
			<p class="mt-3 text-gray-400">
				Sign in to access your virtual laboratory
			</p>
		</div>

		<!-- Login form -->
		<div class="glass-strong rounded-2xl p-8 border border-white/10 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.1s;">
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
				action="?/default"
				class="space-y-6"
				use:enhance={() => {
					loading = true;
					error = '';
					return async ({ result, update }) => {
						loading = false;
						if (result.type === 'failure') {
							error = (result.data as { message?: string })?.message || 'Login failed';
						} else if (result.type === 'redirect') {
							await update();
						} else {
							await update();
						}
					};
				}}
			>
				<div class="space-y-5">
					<div>
						<label for="email" class="block text-sm font-medium text-gray-300 mb-2">
							Email address
						</label>
						<div class="relative">
							<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
								<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
								</svg>
							</div>
							<input
								id="email"
								name="email"
								type="email"
								autocomplete="email"
								required
								class="input pl-12"
								placeholder="you@university.edu"
							/>
						</div>
					</div>

					<div>
						<label for="password" class="block text-sm font-medium text-gray-300 mb-2">
							Password
						</label>
						<div class="relative">
							<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
								<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
								</svg>
							</div>
							<input
								id="password"
								name="password"
								type="password"
								autocomplete="current-password"
								required
								class="input pl-12"
								placeholder="Enter your password"
							/>
						</div>
					</div>
				</div>

				<div class="flex items-center justify-between">
					<div class="flex items-center">
						<input
							id="remember"
							name="remember"
							type="checkbox"
							class="h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
						/>
						<label for="remember" class="ml-2 block text-sm text-gray-400">
							Remember me
						</label>
					</div>

					<a href="/auth/forgot-password" class="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
						Forgot password?
					</a>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="btn-primary w-full py-3.5 text-base"
				>
					{#if loading}
						<svg class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Signing in...
					{:else}
						Sign in
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					{/if}
				</button>
			</form>

			<div class="mt-6 relative">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-white/10"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="px-4 bg-[rgba(8,12,21,0.8)] text-gray-500">Or try demo access</span>
				</div>
			</div>

			<!-- Demo Access Buttons -->
			<div class="mt-6 space-y-3">
				<p class="text-xs text-center text-gray-500 mb-4">
					Click any role below for instant demo access (no account needed)
				</p>

				<button
					type="button"
					onclick={() => demoLogin('student')}
					disabled={demoLoading !== null}
					class="w-full group relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300"
				>
					<div class="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-cyan-500/0 group-hover:from-emerald-500/10 group-hover:to-cyan-500/10 transition-all duration-300"></div>
					<div class="relative flex items-center gap-4">
						<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
							<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
						</div>
						<div class="flex-1 text-left">
							<div class="text-white font-medium">Student Demo</div>
							<div class="text-sm text-gray-400">Access labs, run experiments, track progress</div>
						</div>
						{#if demoLoading === 'student'}
							<svg class="animate-spin h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
						{:else}
							<svg class="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>
						{/if}
					</div>
				</button>

				<button
					type="button"
					onclick={() => demoLogin('instructor')}
					disabled={demoLoading !== null}
					class="w-full group relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300"
				>
					<div class="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
					<div class="relative flex items-center gap-4">
						<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
							<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
							</svg>
						</div>
						<div class="flex-1 text-left">
							<div class="text-white font-medium">Instructor Demo</div>
							<div class="text-sm text-gray-400">Manage classes, view analytics, grade work</div>
						</div>
						{#if demoLoading === 'instructor'}
							<svg class="animate-spin h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
						{:else}
							<svg class="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>
						{/if}
					</div>
				</button>

				<button
					type="button"
					onclick={() => demoLogin('admin')}
					disabled={demoLoading !== null}
					class="w-full group relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/30 hover:border-amber-400/50 transition-all duration-300"
				>
					<div class="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-rose-500/0 group-hover:from-amber-500/10 group-hover:to-rose-500/10 transition-all duration-300"></div>
					<div class="relative flex items-center gap-4">
						<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center">
							<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
							</svg>
						</div>
						<div class="flex-1 text-left">
							<div class="text-white font-medium">Admin Demo</div>
							<div class="text-sm text-gray-400">Full platform access, user management</div>
						</div>
						{#if demoLoading === 'admin'}
							<svg class="animate-spin h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
						{:else}
							<svg class="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>
						{/if}
					</div>
				</button>

				<p class="text-xs text-center text-gray-600 mt-4">
					Demo data is automatically cleared every 24 hours
				</p>
			</div>
		</div>

		<p class="text-center text-sm text-gray-400 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">
			Don't have an account?
			<a href="/auth/register" class="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
				Register now
			</a>
		</p>
	</div>
</div>
