<script lang="ts">
	import { page } from '$app/stores';
	import { currentUser } from '$stores/user';
	import { aiStore } from '$stores/ai';
	import { notificationStore } from '$stores/notifications.svelte';
	import { getInitials } from '$lib/utils/helpers';
	import ThemeToggle from '$components/ui/ThemeToggle.svelte';

	let {
		showAIButton = false,
		onMenuToggle
	}: {
		showAIButton?: boolean;
		onMenuToggle?: () => void;
	} = $props();

	let initials = $derived($currentUser ? getInitials($currentUser.firstName, $currentUser.lastName) : '');

	let userMenuOpen = $state(false);

	function closeMenus() {
		userMenuOpen = false;
		notificationStore.close();
	}

	function timeAgo(date: Date): string {
		const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
		if (seconds < 60) return 'Just now';
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		return `${days}d ago`;
	}

	const typeIcons: Record<string, { svg: string; color: string }> = {
		achievement: {
			svg: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3',
			color: 'text-amber-400 bg-amber-500/20'
		},
		lab: {
			svg: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
			color: 'text-emerald-400 bg-emerald-500/20'
		},
		system: {
			svg: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
			color: 'text-cyan-400 bg-cyan-500/20'
		},
		reminder: {
			svg: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
			color: 'text-purple-400 bg-purple-500/20'
		}
	};
</script>

<svelte:window on:click={closeMenus} />

<header class="sticky top-0 z-40 glass-strong border-b border-white/5">
	<div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
		<!-- Left: Menu button and Logo -->
		<div class="flex items-center gap-3">
			<!-- Mobile menu button -->
			<button
				onclick={onMenuToggle}
				class="lg:hidden p-2.5 rounded-xl glass border border-white/5 text-gray-400 hover:text-white hover:border-white/10 transition-all"
				aria-label="Toggle menu"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>

			<a href="/dashboard" class="flex items-center gap-3 group">
				<div class="relative">
					<div class="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
					<div class="relative w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
						<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
						</svg>
					</div>
				</div>
				<span class="text-lg font-display font-bold text-white hidden sm:block">AfriLab</span>
			</a>
		</div>

		<!-- Right: Actions -->
		<div class="flex items-center gap-2">
			<!-- AI Assistant Button -->
			{#if showAIButton}
				<button
					onclick={() => aiStore.toggle()}
					class="relative p-2.5 rounded-xl glass border border-white/5 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all group"
					aria-label="AI Lab Assistant"
					data-tour="ai-button"
				>
					<div class="absolute inset-0 rounded-xl bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity blur-sm"></div>
					<svg class="relative w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
					</svg>
					<!-- Pulse indicator -->
					<span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5">
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
					</span>
				</button>
			{/if}

			<!-- Theme Toggle -->
			<ThemeToggle />

			<!-- Notifications -->
			<div class="relative">
				<button
					onclick={(e) => { e.stopPropagation(); notificationStore.toggle(); userMenuOpen = false; }}
					class="relative p-2.5 rounded-xl glass border transition-all {notificationStore.isOpen ? 'border-emerald-500/30 text-emerald-400' : 'border-white/5 text-gray-400 hover:text-white hover:border-white/10'}"
					aria-label="Notifications"
					aria-expanded={notificationStore.isOpen}
					aria-haspopup="true"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
					</svg>
					{#if notificationStore.unreadCount > 0}
						<span class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
							{notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount}
						</span>
					{/if}
				</button>

				<!-- Notification dropdown -->
				{#if notificationStore.isOpen}
					<div
						class="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-fade-in-up"
						style="background: rgba(12, 17, 29, 0.97);"
						role="menu"
						onclick={(e) => e.stopPropagation()}
					>
						<!-- Header -->
						<div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
							<div class="flex items-center gap-2">
								<h3 class="text-sm font-semibold text-white">Notifications</h3>
								{#if notificationStore.unreadCount > 0}
									<span class="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full">
										{notificationStore.unreadCount} new
									</span>
								{/if}
							</div>
							{#if notificationStore.notifications.length > 0}
								<button
									onclick={() => notificationStore.markAllRead()}
									class="text-xs text-gray-400 hover:text-emerald-400 transition-colors"
								>
									Mark all read
								</button>
							{/if}
						</div>

						<!-- Notification list -->
						<div class="max-h-80 overflow-y-auto overscroll-contain">
							{#if notificationStore.notifications.length === 0}
								<div class="px-4 py-10 text-center">
									<svg class="w-10 h-10 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
									</svg>
									<p class="text-sm text-gray-500">No notifications yet</p>
								</div>
							{:else}
								{#each notificationStore.notifications as notification (notification.id)}
									{@const iconData = typeIcons[notification.type] || typeIcons.system}
									<div class="relative group">
										{#if notification.href}
											<a
												href={notification.href}
												onclick={() => { notificationStore.markRead(notification.id); notificationStore.close(); }}
												class="flex gap-3 px-4 py-3 transition-colors {notification.read ? 'opacity-60 hover:opacity-80' : 'hover:bg-white/5'}"
											>
												<div class="flex-shrink-0 w-9 h-9 rounded-lg {iconData.color} flex items-center justify-center">
													<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
														<path d={iconData.svg} />
													</svg>
												</div>
												<div class="flex-1 min-w-0">
													<div class="flex items-start justify-between gap-2">
														<p class="text-sm font-medium text-white truncate">{notification.title}</p>
														{#if !notification.read}
															<span class="flex-shrink-0 w-2 h-2 mt-1.5 bg-emerald-500 rounded-full"></span>
														{/if}
													</div>
													<p class="text-xs text-gray-400 mt-0.5 line-clamp-2">{notification.message}</p>
													<p class="text-[10px] text-gray-500 mt-1">{timeAgo(notification.timestamp)}</p>
												</div>
											</a>
										{:else}
											<div
												class="flex gap-3 px-4 py-3 transition-colors {notification.read ? 'opacity-60' : ''}"
											>
												<div class="flex-shrink-0 w-9 h-9 rounded-lg {iconData.color} flex items-center justify-center">
													<svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
														<path d={iconData.svg} />
													</svg>
												</div>
												<div class="flex-1 min-w-0">
													<div class="flex items-start justify-between gap-2">
														<p class="text-sm font-medium text-white truncate">{notification.title}</p>
														{#if !notification.read}
															<span class="flex-shrink-0 w-2 h-2 mt-1.5 bg-emerald-500 rounded-full"></span>
														{/if}
													</div>
													<p class="text-xs text-gray-400 mt-0.5 line-clamp-2">{notification.message}</p>
													<p class="text-[10px] text-gray-500 mt-1">{timeAgo(notification.timestamp)}</p>
												</div>
											</div>
										{/if}

										<!-- Dismiss button -->
										<button
											onclick={(e) => { e.preventDefault(); e.stopPropagation(); notificationStore.remove(notification.id); }}
											class="absolute top-2 right-2 p-1 rounded-md text-gray-600 hover:text-gray-300 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
											aria-label="Dismiss notification"
										>
											<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</div>
								{/each}
							{/if}
						</div>

						<!-- Footer -->
						{#if notificationStore.notifications.length > 0}
							<div class="border-t border-white/10 px-4 py-2.5 flex items-center justify-between">
								<a
									href="/dashboard/profile"
									onclick={() => notificationStore.close()}
									class="text-xs text-gray-400 hover:text-emerald-400 transition-colors"
								>
									Notification settings
								</a>
								<button
									onclick={() => notificationStore.clearAll()}
									class="text-xs text-gray-500 hover:text-rose-400 transition-colors"
								>
									Clear all
								</button>
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- User Menu -->
			<div class="relative ml-2">
				<button
					onclick={(e) => { e.stopPropagation(); userMenuOpen = !userMenuOpen; notificationStore.close(); }}
					class="flex items-center gap-3 p-1.5 pr-3 rounded-xl glass border border-white/5 hover:border-white/10 transition-all"
					aria-label="User menu"
					aria-expanded={userMenuOpen}
					aria-haspopup="true"
				>
					<div class="relative">
						<div class="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg blur-sm opacity-50"></div>
						<div class="relative w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
							{initials}
						</div>
					</div>
					<div class="hidden md:block text-left">
						<p class="text-sm font-medium text-white">
							{$currentUser?.firstName} {$currentUser?.lastName}
						</p>
						<p class="text-xs text-gray-400 capitalize">
							{$currentUser?.role}
						</p>
					</div>
					<svg class="w-4 h-4 text-gray-400 hidden md:block transition-transform {userMenuOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				<!-- Dropdown menu -->
				{#if userMenuOpen}
					<div
						class="absolute right-0 mt-2 w-56 glass-strong rounded-2xl border border-white/10 shadow-2xl py-2 animate-fade-in-up"
						role="menu"
						aria-orientation="vertical"
						tabindex="-1"
						onkeydown={(e) => { if (e.key === 'Escape') { userMenuOpen = false; } }}
					>
						<div class="px-4 py-3 border-b border-white/5">
							<p class="text-sm font-medium text-white">{$currentUser?.firstName} {$currentUser?.lastName}</p>
							<p class="text-xs text-gray-400 truncate">{$currentUser?.email}</p>
						</div>

						<div class="py-2">
							<a href="/dashboard/profile" role="menuitem" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
								Profile Settings
							</a>
							<a href="/dashboard/progress" role="menuitem" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
								My Progress
							</a>
						</div>

						<div class="border-t border-white/5 pt-2" role="none">
							<form action="/auth/logout" method="POST" role="none" onclick={(e) => e.stopPropagation()}>
								<button type="submit" role="menuitem" class="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
									</svg>
									Sign Out
								</button>
							</form>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</header>
