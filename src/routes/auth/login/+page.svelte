<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let loading = false;
	let error = '';

	const redirectTo = $page.url.searchParams.get('redirect') || '/dashboard';
</script>

<svelte:head>
	<title>Login - AfriLab</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div class="text-center">
			<div class="flex justify-center">
				<div class="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center">
					<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
					</svg>
				</div>
			</div>
			<h2 class="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
				Welcome to AfriLab
			</h2>
			<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
				Sign in to access your virtual laboratory
			</p>
		</div>

		{#if error}
			<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
				<p class="text-sm text-red-600 dark:text-red-400">{error}</p>
			</div>
		{/if}

		<form
			method="POST"
			class="mt-8 space-y-6"
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
			<div class="space-y-4">
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Email address
					</label>
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						required
						class="input mt-1"
						placeholder="you@university.edu"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Password
					</label>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="current-password"
						required
						class="input mt-1"
						placeholder="Enter your password"
					/>
				</div>
			</div>

			<div class="flex items-center justify-between">
				<div class="flex items-center">
					<input
						id="remember"
						name="remember"
						type="checkbox"
						class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
					/>
					<label for="remember" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
						Remember me
					</label>
				</div>

				<a href="/auth/forgot-password" class="text-sm font-medium text-primary-600 hover:text-primary-500">
					Forgot password?
				</a>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="btn-primary w-full py-3 text-base"
			>
				{#if loading}
					<svg class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Signing in...
				{:else}
					Sign in
				{/if}
			</button>

			<p class="text-center text-sm text-gray-600 dark:text-gray-400">
				Don't have an account?
				<a href="/auth/register" class="font-medium text-primary-600 hover:text-primary-500">
					Register now
				</a>
			</p>
		</form>
	</div>
</div>
