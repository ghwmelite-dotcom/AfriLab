<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let loading = false;
	let error = '';
	let step = 1;

	let formData = {
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		confirmPassword: '',
		institutionCode: '',
		role: 'student'
	};

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
				Create your account
			</h2>
			<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
				Join AfriLab and start your virtual laboratory journey
			</p>
		</div>

		<!-- Progress indicator -->
		<div class="flex items-center justify-center gap-2">
			{#each [1, 2, 3] as s}
				<div
					class="w-3 h-3 rounded-full transition-colors {s === step
						? 'bg-primary-600'
						: s < step
							? 'bg-primary-400'
							: 'bg-gray-300 dark:bg-gray-600'}"
				></div>
			{/each}
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
						error = result.data?.message || 'Registration failed';
					} else if (result.type === 'redirect') {
						goto('/dashboard');
					}
				};
			}}
		>
			{#if step === 1}
				<!-- Step 1: Personal Info -->
				<div class="space-y-4">
					<h3 class="text-lg font-medium text-gray-900 dark:text-white">Personal Information</h3>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
								First name
							</label>
							<input
								id="firstName"
								name="firstName"
								type="text"
								required
								class="input mt-1"
								bind:value={formData.firstName}
							/>
						</div>
						<div>
							<label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
								Last name
							</label>
							<input
								id="lastName"
								name="lastName"
								type="text"
								required
								class="input mt-1"
								bind:value={formData.lastName}
							/>
						</div>
					</div>

					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Email address
						</label>
						<input
							id="email"
							name="email"
							type="email"
							required
							class="input mt-1"
							placeholder="you@university.edu"
							bind:value={formData.email}
						/>
					</div>

					<button type="button" onclick={nextStep} class="btn-primary w-full py-3">
						Continue
					</button>
				</div>

			{:else if step === 2}
				<!-- Step 2: Password -->
				<div class="space-y-4">
					<h3 class="text-lg font-medium text-gray-900 dark:text-white">Create Password</h3>

					<div>
						<label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Password
						</label>
						<input
							id="password"
							name="password"
							type="password"
							required
							minlength="8"
							class="input mt-1"
							placeholder="At least 8 characters"
							bind:value={formData.password}
						/>
					</div>

					<div>
						<label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Confirm password
						</label>
						<input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							required
							class="input mt-1"
							placeholder="Confirm your password"
							bind:value={formData.confirmPassword}
						/>
					</div>

					<div class="flex gap-3">
						<button type="button" onclick={prevStep} class="btn-secondary flex-1 py-3">
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
							class="btn-primary flex-1 py-3"
						>
							Continue
						</button>
					</div>
				</div>

			{:else if step === 3}
				<!-- Step 3: Institution -->
				<div class="space-y-4">
					<h3 class="text-lg font-medium text-gray-900 dark:text-white">Institution Details</h3>

					<div>
						<label for="institutionCode" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Institution Code
						</label>
						<input
							id="institutionCode"
							name="institutionCode"
							type="text"
							class="input mt-1 uppercase"
							placeholder="e.g., UNILAG, UCT, KNUST"
							bind:value={formData.institutionCode}
						/>
						<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
							Enter the code provided by your institution. Leave blank if you don't have one.
						</p>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							I am a...
						</label>
						<div class="grid grid-cols-2 gap-3">
							<label
								class="flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors
									{formData.role === 'student'
									? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
									: 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}"
							>
								<input
									type="radio"
									name="role"
									value="student"
									class="sr-only"
									bind:group={formData.role}
								/>
								<div class="text-center">
									<svg class="w-8 h-8 mx-auto mb-1 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
									</svg>
									<span class="text-sm font-medium">Student</span>
								</div>
							</label>
							<label
								class="flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors
									{formData.role === 'instructor'
									? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
									: 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}"
							>
								<input
									type="radio"
									name="role"
									value="instructor"
									class="sr-only"
									bind:group={formData.role}
								/>
								<div class="text-center">
									<svg class="w-8 h-8 mx-auto mb-1 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
									</svg>
									<span class="text-sm font-medium">Instructor</span>
								</div>
							</label>
						</div>
					</div>

					<!-- Hidden fields to carry data -->
					<input type="hidden" name="firstName" value={formData.firstName} />
					<input type="hidden" name="lastName" value={formData.lastName} />
					<input type="hidden" name="email" value={formData.email} />
					<input type="hidden" name="password" value={formData.password} />

					<div class="flex gap-3">
						<button type="button" onclick={prevStep} class="btn-secondary flex-1 py-3">
							Back
						</button>
						<button type="submit" disabled={loading} class="btn-primary flex-1 py-3">
							{#if loading}
								<svg class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Creating account...
							{:else}
								Create account
							{/if}
						</button>
					</div>
				</div>
			{/if}

			<p class="text-center text-sm text-gray-600 dark:text-gray-400">
				Already have an account?
				<a href="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
					Sign in
				</a>
			</p>
		</form>
	</div>
</div>
