<script lang="ts">
	const labs: Array<{
		title: string;
		description: string;
		href: string;
		difficulty: string;
		duration: string;
		gradient: string;
	}> = [];
</script>

<svelte:head>
	<title>Medical Labs - AfriLab</title>
</svelte:head>

<div class="min-h-screen">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex items-center gap-3 mb-2">
			<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
				<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
				</svg>
			</div>
			<div>
				<h1 class="text-3xl font-display font-bold text-white">Medical Labs</h1>
				<p class="text-gray-400">Practice clinical skills and diagnostic techniques</p>
			</div>
		</div>
	</div>

	<!-- Coming Soon Message -->
	<div class="glass-strong rounded-2xl border border-white/10 p-12 text-center">
		<div class="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500/20 to-red-500/20 flex items-center justify-center mx-auto mb-6">
			<svg class="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
			</svg>
		</div>
		<h2 class="text-2xl font-display font-bold text-white mb-3">Coming Soon</h2>
		<p class="text-gray-400 max-w-md mx-auto mb-6">
			We're working hard to bring you immersive medical simulation labs. These will include vital signs assessment, diagnostic procedures, and clinical case studies.
		</p>
		<div class="flex flex-wrap justify-center gap-3">
			<span class="px-4 py-2 rounded-full glass border border-white/10 text-sm text-gray-300">
				Vital Signs
			</span>
			<span class="px-4 py-2 rounded-full glass border border-white/10 text-sm text-gray-300">
				ECG Reading
			</span>
			<span class="px-4 py-2 rounded-full glass border border-white/10 text-sm text-gray-300">
				Blood Analysis
			</span>
			<span class="px-4 py-2 rounded-full glass border border-white/10 text-sm text-gray-300">
				Patient Assessment
			</span>
		</div>
	</div>

	<!-- Notification Signup -->
	<div class="mt-8 glass rounded-xl p-6 border border-rose-500/20">
		<div class="flex items-start gap-4">
			<div class="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0">
				<svg class="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
				</svg>
			</div>
			<div>
				<h3 class="text-lg font-semibold text-white mb-1">Get Notified</h3>
				<p class="text-gray-400 text-sm">Check back soon for updates on our medical simulation labs. We're excited to bring these learning experiences to you!</p>
			</div>
		</div>
	</div>
</div>
