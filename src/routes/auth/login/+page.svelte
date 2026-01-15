<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let loading = $state(false);
	let error = $state('');
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	const redirectTo = $page.url.searchParams.get('redirect') || '/dashboard';
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
				class="space-y-6"
				use:enhance={() => {
					loading = true;
					error = '';
					return async ({ result }) => {
						loading = false;
						if (result.type === 'failure') {
							error = result.data?.message || 'Login failed';
						} else if (result.type === 'redirect') {
							goto(redirectTo);
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
					<span class="px-4 bg-[rgba(8,12,21,0.8)] text-gray-500">Or continue with</span>
				</div>
			</div>

			<div class="mt-6 grid grid-cols-2 gap-4">
				<button type="button" class="btn-secondary">
					<svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
					</svg>
					Google
				</button>
				<button type="button" class="btn-secondary">
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
					</svg>
					GitHub
				</button>
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
