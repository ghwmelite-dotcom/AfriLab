<script lang="ts">
	import { onMount } from 'svelte';
	import { currentUser } from '$stores/user';
	import { getInitials } from '$lib/utils/helpers';

	let mounted = $state(false);
	let activeTab = $state('profile');
	let saving = $state(false);
	let saved = $state(false);

	onMount(() => {
		mounted = true;
	});

	const tabs = [
		{ id: 'profile', label: 'Profile', icon: 'user' },
		{ id: 'security', label: 'Security', icon: 'shield' },
		{ id: 'preferences', label: 'Preferences', icon: 'cog' },
		{ id: 'notifications', label: 'Notifications', icon: 'bell' }
	];

	// Form states
	let firstName = $state($currentUser?.firstName || '');
	let lastName = $state($currentUser?.lastName || '');
	let email = $state($currentUser?.email || '');
	let institution = $state('University of Lagos');
	let department = $state('Department of Chemistry');
	let bio = $state('');

	// Preference states
	let darkMode = $state(true);
	let soundEffects = $state(true);
	let autoSave = $state(true);
	let showHints = $state(true);

	// Notification states
	let emailNotifications = $state(true);
	let labReminders = $state(true);
	let achievementAlerts = $state(true);
	let weeklyDigest = $state(false);

	async function handleSave() {
		saving = true;
		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 1000));
		saving = false;
		saved = true;
		setTimeout(() => saved = false, 3000);
	}

	let initials = $derived($currentUser ? getInitials($currentUser.firstName, $currentUser.lastName) : 'U');
</script>

<svelte:head>
	<title>Profile Settings - AfriLab</title>
</svelte:head>

<!-- Floating orbs -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<div class="orb w-[300px] h-[300px] -top-20 right-1/3 bg-gradient-to-br from-emerald-500/15 to-cyan-500/10"></div>
	<div class="orb w-[200px] h-[200px] bottom-1/4 -left-20 bg-gradient-to-br from-purple-500/15 to-pink-500/10" style="animation-delay: 2s;"></div>
</div>

<div class="relative space-y-6 p-6 sm:p-8 max-w-5xl mx-auto">
	<!-- Header -->
	<div class="{mounted ? 'animate-fade-in-up' : 'opacity-0'}">
		<div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
			<a href="/dashboard" class="hover:text-emerald-400 transition-colors">Dashboard</a>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
			<span class="text-emerald-400">Profile</span>
		</div>
		<h1 class="text-3xl sm:text-4xl font-display font-bold text-white">
			Profile <span class="text-gradient-aurora">Settings</span>
		</h1>
		<p class="mt-2 text-gray-400">Manage your account settings and preferences</p>
	</div>

	<!-- Profile Header Card -->
	<div class="glass-strong rounded-2xl p-6 border border-white/5 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.1s;">
		<div class="flex flex-col sm:flex-row items-center gap-6">
			<!-- Avatar -->
			<div class="relative group">
				<div class="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
				<div class="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
					{initials}
				</div>
				<button class="absolute bottom-0 right-0 w-8 h-8 bg-white/10 backdrop-blur rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors">
					<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
				</button>
			</div>

			<!-- User Info -->
			<div class="flex-1 text-center sm:text-left">
				<h2 class="text-2xl font-display font-bold text-white">
					{$currentUser?.firstName} {$currentUser?.lastName}
				</h2>
				<p class="text-gray-400">{$currentUser?.email}</p>
				<div class="flex items-center justify-center sm:justify-start gap-3 mt-3">
					<span class="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 capitalize">
						{$currentUser?.role}
					</span>
					<span class="text-sm text-gray-500">Member since Jan 2024</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Tabs and Content -->
	<div class="flex flex-col lg:flex-row gap-6">
		<!-- Tab Navigation -->
		<div class="lg:w-56 flex lg:flex-col gap-2 overflow-x-auto {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.15s;">
			{#each tabs as tab}
				<button
					onclick={() => activeTab = tab.id}
					class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all
						{activeTab === tab.id
						? 'bg-gradient-to-r from-emerald-500/15 to-cyan-500/10 text-white border border-emerald-500/20'
						: 'text-gray-400 hover:text-white hover:bg-white/5'}"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						{#if tab.icon === 'user'}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						{:else if tab.icon === 'shield'}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
						{:else if tab.icon === 'cog'}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						{:else}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
						{/if}
					</svg>
					{tab.label}
				</button>
			{/each}
		</div>

		<!-- Tab Content -->
		<div class="flex-1 glass-strong rounded-2xl p-6 border border-white/5 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">
			{#if activeTab === 'profile'}
				<div class="space-y-6">
					<h3 class="text-lg font-display font-semibold text-white">Personal Information</h3>

					<div class="grid sm:grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-300 mb-2">First Name</label>
							<input type="text" class="input" bind:value={firstName} />
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
							<input type="text" class="input" bind:value={lastName} />
						</div>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
						<input type="email" class="input" bind:value={email} disabled />
						<p class="text-xs text-gray-500 mt-1">Contact support to change your email</p>
					</div>

					<div class="grid sm:grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-300 mb-2">Institution</label>
							<input type="text" class="input" bind:value={institution} />
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-300 mb-2">Department</label>
							<input type="text" class="input" bind:value={department} />
						</div>
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-300 mb-2">Bio</label>
						<textarea class="input min-h-[100px] resize-none" placeholder="Tell us about yourself..." bind:value={bio}></textarea>
					</div>
				</div>

			{:else if activeTab === 'security'}
				<div class="space-y-6">
					<h3 class="text-lg font-display font-semibold text-white">Security Settings</h3>

					<div class="glass rounded-xl p-5 border border-white/5">
						<div class="flex items-center justify-between">
							<div>
								<h4 class="font-medium text-white">Change Password</h4>
								<p class="text-sm text-gray-400">Update your password regularly for security</p>
							</div>
							<button class="btn-secondary py-2 px-4 text-sm">Change</button>
						</div>
					</div>

					<div class="glass rounded-xl p-5 border border-white/5">
						<div class="flex items-center justify-between">
							<div>
								<h4 class="font-medium text-white">Two-Factor Authentication</h4>
								<p class="text-sm text-gray-400">Add an extra layer of security</p>
							</div>
							<button class="btn-primary py-2 px-4 text-sm">Enable</button>
						</div>
					</div>

					<div class="glass rounded-xl p-5 border border-white/5">
						<div class="flex items-center justify-between">
							<div>
								<h4 class="font-medium text-white">Active Sessions</h4>
								<p class="text-sm text-gray-400">Manage your logged-in devices</p>
							</div>
							<button class="btn-secondary py-2 px-4 text-sm">View All</button>
						</div>
					</div>
				</div>

			{:else if activeTab === 'preferences'}
				<div class="space-y-6">
					<h3 class="text-lg font-display font-semibold text-white">Lab Preferences</h3>

					<div class="space-y-4">
						<label class="flex items-center justify-between p-4 glass rounded-xl border border-white/5 cursor-pointer group hover:border-emerald-500/20 transition-colors">
							<div>
								<h4 class="font-medium text-white">Dark Mode</h4>
								<p class="text-sm text-gray-400">Use dark theme for lab interface</p>
							</div>
							<input type="checkbox" class="sr-only" bind:checked={darkMode} />
							<div class="relative w-11 h-6 rounded-full transition-colors {darkMode ? 'bg-emerald-500' : 'bg-gray-600'}">
								<div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform {darkMode ? 'translate-x-5' : ''}"></div>
							</div>
						</label>

						<label class="flex items-center justify-between p-4 glass rounded-xl border border-white/5 cursor-pointer group hover:border-emerald-500/20 transition-colors">
							<div>
								<h4 class="font-medium text-white">Sound Effects</h4>
								<p class="text-sm text-gray-400">Play sounds for lab interactions</p>
							</div>
							<input type="checkbox" class="sr-only" bind:checked={soundEffects} />
							<div class="relative w-11 h-6 rounded-full transition-colors {soundEffects ? 'bg-emerald-500' : 'bg-gray-600'}">
								<div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform {soundEffects ? 'translate-x-5' : ''}"></div>
							</div>
						</label>

						<label class="flex items-center justify-between p-4 glass rounded-xl border border-white/5 cursor-pointer group hover:border-emerald-500/20 transition-colors">
							<div>
								<h4 class="font-medium text-white">Auto-Save Progress</h4>
								<p class="text-sm text-gray-400">Automatically save your lab progress</p>
							</div>
							<input type="checkbox" class="sr-only" bind:checked={autoSave} />
							<div class="relative w-11 h-6 rounded-full transition-colors {autoSave ? 'bg-emerald-500' : 'bg-gray-600'}">
								<div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform {autoSave ? 'translate-x-5' : ''}"></div>
							</div>
						</label>

						<label class="flex items-center justify-between p-4 glass rounded-xl border border-white/5 cursor-pointer group hover:border-emerald-500/20 transition-colors">
							<div>
								<h4 class="font-medium text-white">Show AI Hints</h4>
								<p class="text-sm text-gray-400">Get helpful tips during experiments</p>
							</div>
							<input type="checkbox" class="sr-only" bind:checked={showHints} />
							<div class="relative w-11 h-6 rounded-full transition-colors {showHints ? 'bg-emerald-500' : 'bg-gray-600'}">
								<div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform {showHints ? 'translate-x-5' : ''}"></div>
							</div>
						</label>
					</div>
				</div>

			{:else if activeTab === 'notifications'}
				<div class="space-y-6">
					<h3 class="text-lg font-display font-semibold text-white">Notification Settings</h3>

					<div class="space-y-4">
						<label class="flex items-center justify-between p-4 glass rounded-xl border border-white/5 cursor-pointer group hover:border-emerald-500/20 transition-colors">
							<div>
								<h4 class="font-medium text-white">Email Notifications</h4>
								<p class="text-sm text-gray-400">Receive updates via email</p>
							</div>
							<input type="checkbox" class="sr-only" bind:checked={emailNotifications} />
							<div class="relative w-11 h-6 rounded-full transition-colors {emailNotifications ? 'bg-emerald-500' : 'bg-gray-600'}">
								<div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform {emailNotifications ? 'translate-x-5' : ''}"></div>
							</div>
						</label>

						<label class="flex items-center justify-between p-4 glass rounded-xl border border-white/5 cursor-pointer group hover:border-emerald-500/20 transition-colors">
							<div>
								<h4 class="font-medium text-white">Lab Reminders</h4>
								<p class="text-sm text-gray-400">Get reminded about incomplete labs</p>
							</div>
							<input type="checkbox" class="sr-only" bind:checked={labReminders} />
							<div class="relative w-11 h-6 rounded-full transition-colors {labReminders ? 'bg-emerald-500' : 'bg-gray-600'}">
								<div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform {labReminders ? 'translate-x-5' : ''}"></div>
							</div>
						</label>

						<label class="flex items-center justify-between p-4 glass rounded-xl border border-white/5 cursor-pointer group hover:border-emerald-500/20 transition-colors">
							<div>
								<h4 class="font-medium text-white">Achievement Alerts</h4>
								<p class="text-sm text-gray-400">Celebrate when you earn badges</p>
							</div>
							<input type="checkbox" class="sr-only" bind:checked={achievementAlerts} />
							<div class="relative w-11 h-6 rounded-full transition-colors {achievementAlerts ? 'bg-emerald-500' : 'bg-gray-600'}">
								<div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform {achievementAlerts ? 'translate-x-5' : ''}"></div>
							</div>
						</label>

						<label class="flex items-center justify-between p-4 glass rounded-xl border border-white/5 cursor-pointer group hover:border-emerald-500/20 transition-colors">
							<div>
								<h4 class="font-medium text-white">Weekly Digest</h4>
								<p class="text-sm text-gray-400">Summary of your weekly progress</p>
							</div>
							<input type="checkbox" class="sr-only" bind:checked={weeklyDigest} />
							<div class="relative w-11 h-6 rounded-full transition-colors {weeklyDigest ? 'bg-emerald-500' : 'bg-gray-600'}">
								<div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform {weeklyDigest ? 'translate-x-5' : ''}"></div>
							</div>
						</label>
					</div>
				</div>
			{/if}

			<!-- Save Button -->
			<div class="mt-8 flex items-center justify-between pt-6 border-t border-white/5">
				{#if saved}
					<div class="flex items-center gap-2 text-emerald-400">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span class="text-sm">Changes saved!</span>
					</div>
				{:else}
					<div></div>
				{/if}
				<button
					onclick={handleSave}
					disabled={saving}
					class="btn-primary"
				>
					{#if saving}
						<svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Saving...
					{:else}
						Save Changes
					{/if}
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(60px);
		opacity: 0.5;
		animation: orb-float 10s ease-in-out infinite;
	}

	@keyframes orb-float {
		0%, 100% { transform: translate(0, 0) scale(1); }
		25% { transform: translate(10px, -20px) scale(1.05); }
		50% { transform: translate(-10px, 10px) scale(0.95); }
		75% { transform: translate(20px, 15px) scale(1.02); }
	}
</style>
