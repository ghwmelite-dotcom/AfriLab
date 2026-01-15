<script lang="ts">
	import { page } from '$app/stores';
	import { currentUser } from '$stores/user';
	import { aiStore } from '$stores/ai';
	import { getInitials } from '$lib/utils/helpers';

	export let showAIButton = false;

	$: initials = $currentUser ? getInitials($currentUser.firstName, $currentUser.lastName) : '';
</script>

<header class="sticky top-0 z-40 glass border-b border-gray-200 dark:border-gray-700">
	<div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
		<!-- Left: Logo and breadcrumb -->
		<div class="flex items-center gap-4">
			<a href="/dashboard" class="flex items-center gap-2">
				<div class="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
					<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
					</svg>
				</div>
				<span class="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">AfriLab</span>
			</a>
		</div>

		<!-- Right: Actions -->
		<div class="flex items-center gap-3">
			<!-- AI Assistant Button -->
			{#if showAIButton}
				<button
					onclick={() => aiStore.toggle()}
					class="btn-ghost p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600"
					title="AI Lab Assistant"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
					</svg>
				</button>
			{/if}

			<!-- Notifications -->
			<button class="btn-ghost p-2 text-gray-600 dark:text-gray-400 relative">
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
				</svg>
				<span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
			</button>

			<!-- User Menu -->
			<div class="relative">
				<button class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
					<div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
						{initials}
					</div>
					<div class="hidden md:block text-left">
						<p class="text-sm font-medium text-gray-900 dark:text-white">
							{$currentUser?.firstName} {$currentUser?.lastName}
						</p>
						<p class="text-xs text-gray-500 dark:text-gray-400 capitalize">
							{$currentUser?.role}
						</p>
					</div>
					<svg class="w-4 h-4 text-gray-400 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				<!-- Dropdown menu would go here -->
			</div>

			<!-- Logout -->
			<form action="/auth/logout" method="POST">
				<button type="submit" class="btn-ghost p-2 text-gray-600 dark:text-gray-400" title="Sign out">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
					</svg>
				</button>
			</form>
		</div>
	</div>
</header>
