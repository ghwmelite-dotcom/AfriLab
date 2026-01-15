<script lang="ts">
	import { page } from '$app/stores';
	import { currentUser, isInstructor } from '$stores/user';

	const studentNav = [
		{
			label: 'Dashboard',
			href: '/dashboard',
			icon: 'home'
		},
		{
			label: 'My Labs',
			href: '/dashboard/labs',
			icon: 'beaker'
		},
		{
			label: 'Progress',
			href: '/dashboard/progress',
			icon: 'chart'
		},
		{
			label: 'History',
			href: '/dashboard/history',
			icon: 'clock'
		}
	];

	const instructorNav = [
		{
			label: 'Overview',
			href: '/instructor',
			icon: 'home'
		},
		{
			label: 'Students',
			href: '/instructor/students',
			icon: 'users'
		},
		{
			label: 'Assignments',
			href: '/instructor/assignments',
			icon: 'clipboard'
		},
		{
			label: 'Analytics',
			href: '/instructor/analytics',
			icon: 'chart'
		}
	];

	const disciplines = [
		{ name: 'Chemistry', slug: 'chemistry', icon: 'beaker', color: 'text-blue-500' },
		{ name: 'Biology', slug: 'biology', icon: 'dna', color: 'text-green-500' },
		{ name: 'Physics', slug: 'physics', icon: 'atom', color: 'text-amber-500' },
		{ name: 'Pharmacy', slug: 'pharmacy', icon: 'pill', color: 'text-pink-500' },
		{ name: 'Medical', slug: 'medical', icon: 'heart', color: 'text-red-500' }
	];

	let navItems = $derived($isInstructor ? instructorNav : studentNav);
	let currentPath = $derived($page.url.pathname);
</script>

<aside class="fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
	<div class="p-4">
		<!-- Main Navigation -->
		<nav class="space-y-1">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
						{currentPath === item.href
						? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
						: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
					{item.label}
				</a>
			{/each}
		</nav>

		<!-- Disciplines Section -->
		{#if !$isInstructor}
			<div class="mt-8">
				<h3 class="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
					Disciplines
				</h3>
				<nav class="mt-2 space-y-1">
					{#each disciplines as discipline}
						<a
							href="/labs/{discipline.slug}"
							class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
								{currentPath.includes(`/labs/${discipline.slug}`)
								? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
								: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
						>
							<span class="w-2 h-2 rounded-full {discipline.color.replace('text-', 'bg-')}"></span>
							{discipline.name}
						</a>
					{/each}
				</nav>
			</div>
		{/if}

		<!-- Help Section -->
		<div class="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
			<div class="flex items-center gap-3 mb-2">
				<div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
					<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
					</svg>
				</div>
				<span class="text-sm font-medium text-gray-900 dark:text-white">Need Help?</span>
			</div>
			<p class="text-xs text-gray-600 dark:text-gray-400 mb-3">
				Our AI assistant is here to help with your experiments.
			</p>
			<button class="w-full btn-primary py-2 text-sm">
				Ask AI Assistant
			</button>
		</div>
	</div>
</aside>
