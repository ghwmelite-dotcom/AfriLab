<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let loading = $state(false);
	let error = $state('');
	let step = $state(1);
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	let formData = $state({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		confirmPassword: '',
		institutionCode: '',
		role: 'student'
	});

	// Password strength calculation
	let passwordStrength = $derived(calculatePasswordStrength(formData.password));

	function calculatePasswordStrength(password: string): { score: number; label: string; color: string } {
		let score = 0;
		if (password.length >= 8) score += 25;
		if (password.length >= 12) score += 15;
		if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 20;
		if (/\d/.test(password)) score += 20;
		if (/[^a-zA-Z0-9]/.test(password)) score += 20;

		if (score < 30) return { score, label: 'Weak', color: 'from-rose-500 to-red-500' };
		if (score < 60) return { score, label: 'Fair', color: 'from-amber-500 to-orange-500' };
		if (score < 80) return { score, label: 'Good', color: 'from-cyan-500 to-blue-500' };
		return { score, label: 'Strong', color: 'from-emerald-500 to-green-500' };
	}

	function nextStep() {
		if (step === 1) {
			if (!formData.firstName || !formData.lastName || !formData.email) {
				error = 'Please fill in all fields';
				return;
			}
			if (!formData.email.includes('@')) {
				error = 'Please enter a valid email address';
				return;
			}
		}
		error = '';
		step++;
	}

	function prevStep() {
		error = '';
		step--;
	}
</script>

<svelte:head>
	<title>Register - AfriLab</title>
</svelte:head>

<!-- Ambient background -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="absolute inset-0 bg-aurora"></div>
	<div class="absolute top-0 -right-32 w-96 h-96 bg-gradient-to-l from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl animate-blob"></div>
	<div class="absolute bottom-0 -left-32 w-96 h-96 bg-gradient-to-r from-teal-500/20 to-green-500/20 rounded-full blur-3xl animate-blob" style="animation-delay: 2s;"></div>
	<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl animate-blob" style="animation-delay: 4s;"></div>
</div>

<div class="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<!-- Logo and header -->
		<div class="text-center {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
			<a href="/" class="inline-block group" aria-label="Go to AfriLab homepage">
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
				Create your <span class="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">account</span>
			</h2>
			<p class="mt-3 text-gray-400">
				Join AfriLab and start your virtual laboratory journey
			</p>
		</div>

		<!-- Progress indicator -->
		<div class="flex items-center justify-center gap-3 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.05s;">
			{#each [1, 2, 3] as s}
				<div class="flex items-center">
					<div
						class="relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
							{s === step
								? 'glass-strong border border-emerald-500/50'
								: s < step
									? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
									: 'glass border border-white/10'}"
					>
						{#if s < step}
							<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
						{:else}
							<span class="text-sm font-medium {s === step ? 'text-emerald-400' : 'text-gray-500'}">{s}</span>
						{/if}
						{#if s === step}
							<div class="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
						{/if}
					</div>
					{#if s < 3}
						<div class="w-12 h-0.5 mx-1 rounded-full transition-all duration-300 {s < step ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-white/10'}"></div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Step labels -->
		<div class="flex justify-between px-2 text-xs text-gray-500 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.05s;">
			<span class="{step >= 1 ? 'text-emerald-400' : ''}">Personal Info</span>
			<span class="{step >= 2 ? 'text-emerald-400' : ''}">Security</span>
			<span class="{step >= 3 ? 'text-emerald-400' : ''}">Institution</span>
		</div>

		<!-- Google sign-up option -->
		<div class="glass-strong rounded-2xl p-6 border border-white/10 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.08s;">
			<a
				href="/auth/google"
				class="w-full group relative overflow-hidden rounded-xl p-3.5 glass border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-3"
			>
				<svg class="w-5 h-5" viewBox="0 0 24 24">
					<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
					<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
					<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
					<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
				</svg>
				<span class="text-white font-medium">Sign up with Google</span>
			</a>
			<div class="mt-4 relative">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-white/10"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="px-4 bg-[rgba(8,12,21,0.8)] text-gray-500">Or register with email</span>
				</div>
			</div>
		</div>

		<!-- Form card -->
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
							error = result.data?.message || 'Registration failed';
						} else if (result.type === 'redirect') {
							goto('/dashboard');
						}
					};
				}}
			>
				{#if step === 1}
					<!-- Step 1: Personal Info -->
					<div class="space-y-5">
						<div class="flex items-center gap-3 mb-6">
							<div class="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full"></div>
							<h3 class="text-lg font-display font-semibold text-white">Personal Information</h3>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="firstName" class="block text-sm font-medium text-gray-300 mb-2">
									First name
								</label>
								<div class="relative">
									<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
										<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
										</svg>
									</div>
									<input
										id="firstName"
										name="firstName"
										type="text"
										required
										class="input pl-12"
										placeholder="John"
										bind:value={formData.firstName}
									/>
								</div>
							</div>
							<div>
								<label for="lastName" class="block text-sm font-medium text-gray-300 mb-2">
									Last name
								</label>
								<input
									id="lastName"
									name="lastName"
									type="text"
									required
									class="input"
									placeholder="Doe"
									bind:value={formData.lastName}
								/>
							</div>
						</div>

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
									required
									class="input pl-12"
									placeholder="you@university.edu"
									bind:value={formData.email}
								/>
							</div>
						</div>

						<button type="button" onclick={nextStep} class="btn-primary w-full py-3.5">
							Continue
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>
						</button>
					</div>

				{:else if step === 2}
					<!-- Step 2: Password -->
					<div class="space-y-5">
						<div class="flex items-center gap-3 mb-6">
							<div class="w-1.5 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
							<h3 class="text-lg font-display font-semibold text-white">Create Password</h3>
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
									required
									minlength="8"
									class="input pl-12"
									placeholder="At least 8 characters"
									bind:value={formData.password}
								/>
							</div>

							<!-- Password strength indicator -->
							{#if formData.password.length > 0}
								<div class="mt-3 space-y-2">
									<div class="flex items-center justify-between text-xs">
										<span class="text-gray-400">Password strength</span>
										<span class="font-medium bg-gradient-to-r {passwordStrength.color} bg-clip-text text-transparent">
											{passwordStrength.label}
										</span>
									</div>
									<div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
										<div
											class="h-full bg-gradient-to-r {passwordStrength.color} rounded-full transition-all duration-300"
											style="width: {passwordStrength.score}%"
										></div>
									</div>
								</div>
							{/if}
						</div>

						<div>
							<label for="confirmPassword" class="block text-sm font-medium text-gray-300 mb-2">
								Confirm password
							</label>
							<div class="relative">
								<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
									<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
									</svg>
								</div>
								<input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									required
									class="input pl-12"
									placeholder="Confirm your password"
									bind:value={formData.confirmPassword}
								/>
							</div>
							{#if formData.confirmPassword && formData.password !== formData.confirmPassword}
								<p class="mt-2 text-xs text-rose-400 flex items-center gap-1">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									Passwords do not match
								</p>
							{:else if formData.confirmPassword && formData.password === formData.confirmPassword}
								<p class="mt-2 text-xs text-emerald-400 flex items-center gap-1">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
									Passwords match
								</p>
							{/if}
						</div>

						<div class="flex gap-3">
							<button type="button" onclick={prevStep} class="btn-secondary flex-1 py-3.5">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
								</svg>
								Back
							</button>
							<button
								type="button"
								onclick={() => {
									if (formData.password.length < 8) {
										error = 'Password must be at least 8 characters';
										return;
									}
									if (formData.password !== formData.confirmPassword) {
										error = 'Passwords do not match';
										return;
									}
									nextStep();
								}}
								class="btn-primary flex-1 py-3.5"
							>
								Continue
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
								</svg>
							</button>
						</div>
					</div>

				{:else if step === 3}
					<!-- Step 3: Institution -->
					<div class="space-y-5">
						<div class="flex items-center gap-3 mb-6">
							<div class="w-1.5 h-6 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full"></div>
							<h3 class="text-lg font-display font-semibold text-white">Institution Details</h3>
						</div>

						<div>
							<label for="institutionCode" class="block text-sm font-medium text-gray-300 mb-2">
								Institution Code
							</label>
							<div class="relative">
								<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
									<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
									</svg>
								</div>
								<input
									id="institutionCode"
									name="institutionCode"
									type="text"
									class="input pl-12 uppercase"
									placeholder="e.g., UNILAG, UCT, KNUST"
									bind:value={formData.institutionCode}
								/>
							</div>
							<p class="mt-2 text-xs text-gray-500">
								Enter the code provided by your institution. Leave blank if you don't have one.
							</p>
						</div>

						<fieldset>
							<legend class="block text-sm font-medium text-gray-300 mb-3">
								I am a...
							</legend>
							<div class="grid grid-cols-2 gap-4">
								<label
									class="group relative glass rounded-xl p-5 cursor-pointer transition-all duration-300 border-2
										{formData.role === 'student'
										? 'border-emerald-500/50 bg-emerald-500/10'
										: 'border-white/10 hover:border-white/20'}"
								>
									<input
										type="radio"
										name="role"
										value="student"
										class="sr-only"
										bind:group={formData.role}
									/>
									{#if formData.role === 'student'}
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
										{formData.role === 'instructor'
										? 'border-emerald-500/50 bg-emerald-500/10'
										: 'border-white/10 hover:border-white/20'}"
								>
									<input
										type="radio"
										name="role"
										value="instructor"
										class="sr-only"
										bind:group={formData.role}
									/>
									{#if formData.role === 'instructor'}
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

						<!-- Hidden fields to carry data -->
						<input type="hidden" name="firstName" value={formData.firstName} />
						<input type="hidden" name="lastName" value={formData.lastName} />
						<input type="hidden" name="email" value={formData.email} />
						<input type="hidden" name="password" value={formData.password} />

						<div class="flex gap-3">
							<button type="button" onclick={prevStep} class="btn-secondary flex-1 py-3.5">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
								</svg>
								Back
							</button>
							<button type="submit" disabled={loading} class="btn-primary flex-1 py-3.5">
								{#if loading}
									<svg class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Creating...
								{:else}
									Create account
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
								{/if}
							</button>
						</div>
					</div>
				{/if}
			</form>
		</div>

		<p class="text-center text-sm text-gray-400 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">
			Already have an account?
			<a href="/auth/login" class="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
				Sign in
			</a>
		</p>
	</div>
</div>
