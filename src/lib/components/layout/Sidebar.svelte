<script lang="ts">
	import { page } from '$app/stores';
	import { currentUser, isInstructor } from '$stores/user';

	let { isOpen = false, onClose }: { isOpen?: boolean; onClose?: () => void } = $props();

	const studentNav = [
		{
			label: 'Dashboard',
			href: '/dashboard',
			icon: 'home',
			gradient: 'from-emerald-500 to-cyan-500'
		},
		{
			label: 'My Labs',
			href: '/dashboard/labs',
			icon: 'beaker',
			gradient: 'from-blue-500 to-indigo-500'
		},
		{
			label: 'Progress',
			href: '/dashboard/progress',
			icon: 'chart',
			gradient: 'from-amber-500 to-orange-500'
		},
		{
			label: 'History',
			href: '/dashboard/history',
			icon: 'clock',
			gradient: 'from-purple-500 to-pink-500'
		}
	];

	const instructorNav = [
		{
			label: 'Overview',
			href: '/instructor',
			icon: 'home',
			gradient: 'from-emerald-500 to-cyan-500'
		},
		{
			label: 'Students',
			href: '/instructor/students',
			icon: 'users',
			gradient: 'from-blue-500 to-indigo-500'
		},
		{
			label: 'Assignments',
			href: '/instructor/assignments',
			icon: 'clipboard',
			gradient: 'from-amber-500 to-orange-500'
		},
		{
			label: 'Analytics',
			href: '/instructor/analytics',
			icon: 'chart',
			gradient: 'from-purple-500 to-pink-500'
		}
	];

	const disciplines = [
		{ name: 'Chemistry', slug: 'chemistry', icon: 'beaker', color: 'bg-cyan-500', hoverBg: 'hover:bg-cyan-500/10' },
		{ name: 'Biology', slug: 'biology', icon: 'dna', color: 'bg-emerald-500', hoverBg: 'hover:bg-emerald-500/10' },
		{ name: 'Physics', slug: 'physics', icon: 'atom', color: 'bg-amber-500', hoverBg: 'hover:bg-amber-500/10' },
		{ name: 'Pharmacy', slug: 'pharmacy', icon: 'pill', color: 'bg-pink-500', hoverBg: 'hover:bg-pink-500/10' },
		{ name: 'Medical', slug: 'medical', icon: 'heart', color: 'bg-rose-500', hoverBg: 'hover:bg-rose-500/10' }
	];

	let navItems = $derived($isInstructor ? instructorNav : studentNav);
	let currentPath = $derived($page.url.pathname);

	function handleNavClick() {
		if (onClose) onClose();
	}
</script>

<!-- Mobile overlay -->
{#if isOpen}
	<div
		class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
		onclick={onClose}
		onkeydown={(e) => e.key === 'Escape' && onClose?.()}
		role="button"
		tabindex="0"
	></div>
{/if}

<!-- Sidebar -->
<aside
	class="fixed left-0 top-16 bottom-0 w-72 glass-strong border-r border-white/5 overflow-y-auto z-50
		transform transition-transform duration-300 ease-out
		{isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0"
>
	<!-- Ambient glow -->
	<div class="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none"></div>

	<div class="relative p-5">
		<!-- Main Navigation -->
		<nav class="space-y-1.5">
			{#each navItems as item}
				{@const isActive = currentPath === item.href || (item.href !== '/dashboard' && currentPath.startsWith(item.href))}
				<a
					href={item.href}
					onclick={handleNavClick}
					data-tour={item.label === 'My Labs' ? 'labs-link' : item.label === 'Progress' ? 'leaderboard-link' : undefined}
					class="group relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
						{isActive
						? 'bg-gradient-to-r from-emerald-500/15 to-cyan-500/10 text-white border border-emerald-500/20'
						: 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}"
				>
					<!-- Active indicator glow -->
					{#if isActive}
						<div class="absolute inset-0 bg-gradient-to-r {item.gradient} opacity-10 rounded-xl blur-sm"></div>
					{/if}

					<div class="relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300
						{isActive
						? 'bg-gradient-to-br ' + item.gradient + ' shadow-lg'
						: 'bg-white/5 group-hover:bg-white/10'}">
						<svg class="w-5 h-5 {isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							{#if item.icon === 'home'}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
							{:else if item.icon === 'beaker'}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
							{:else if item.icon === 'chart'}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							{:else if item.icon === 'clock'}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							{:else if item.icon === 'users'}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
							{:else if item.icon === 'clipboard'}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
							{/if}
						</svg>
					</div>
					<span class="relative">{item.label}</span>

					<!-- Arrow indicator -->
					{#if isActive}
						<svg class="w-4 h-4 ml-auto text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					{/if}
				</a>
			{/each}
		</nav>

		<!-- Disciplines Section -->
		{#if !$isInstructor}
			<div class="mt-8">
				<div class="flex items-center gap-2 px-4 mb-3">
					<div class="w-1 h-4 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full"></div>
					<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
						Disciplines
					</h3>
				</div>
				<nav class="space-y-1">
					{#each disciplines as discipline}
						{@const isActive = currentPath.includes(`/labs/${discipline.slug}`)}
						<a
							href="/labs/{discipline.slug}"
							onclick={handleNavClick}
							class="group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
								{isActive
								? 'bg-white/5 text-white'
								: 'text-gray-400 hover:text-white ' + discipline.hoverBg}"
						>
							<span class="w-2.5 h-2.5 rounded-full {discipline.color} {isActive ? 'ring-2 ring-white/20 ring-offset-2 ring-offset-transparent' : ''} transition-all"></span>
							<span>{discipline.name}</span>
							{#if isActive}
								<span class="ml-auto text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">Active</span>
							{/if}
						</a>
					{/each}
				</nav>
			</div>
		{/if}

		<!-- Help Section -->
		<div class="mt-8">
			<div class="relative glass-prismatic rounded-2xl p-5 overflow-hidden">
				<!-- Animated background -->
				<div class="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5"></div>

				<div class="relative">
					<div class="flex items-center gap-3 mb-3">
						<div class="relative">
							<div class="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur-md opacity-50"></div>
							<div class="relative w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
								<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
								</svg>
							</div>
						</div>
						<div>
							<span class="text-sm font-semibold text-white">Need Help?</span>
							<p class="text-xs text-gray-400">AI-powered assistance</p>
						</div>
					</div>
					<p class="text-xs text-gray-400 mb-4 leading-relaxed">
						Get instant help with experiments, procedures, and scientific concepts.
					</p>
					<button class="w-full btn-primary py-2.5 text-sm">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
						</svg>
						Ask AI Assistant
					</button>
				</div>
			</div>
		</div>

		<!-- User quick stats (mobile only) -->
		<div class="mt-6 lg:hidden">
			<div class="glass rounded-xl p-4 border border-white/5">
				<div class="flex items-center gap-3 mb-3">
					<div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
						{$currentUser?.firstName?.charAt(0)}{$currentUser?.lastName?.charAt(0)}
					</div>
					<div>
						<p class="text-sm font-medium text-white">{$currentUser?.firstName} {$currentUser?.lastName}</p>
						<p class="text-xs text-gray-400 capitalize">{$currentUser?.role}</p>
					</div>
				</div>
				<form action="/auth/logout" method="POST">
					<button type="submit" class="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
						Sign Out
					</button>
				</form>
			</div>
		</div>
	</div>
</aside>
