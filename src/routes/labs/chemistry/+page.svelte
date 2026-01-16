<script lang="ts">
	const labs = [
		{
			title: 'Acid-Base Titration',
			description: 'Learn to determine the concentration of an unknown acid or base through careful titration with a standardized solution.',
			href: '/labs/chemistry/titration',
			icon: 'flask',
			difficulty: 'Beginner',
			duration: '45 min',
			gradient: 'from-cyan-500 to-blue-600'
		},
		{
			title: 'UV-Vis Spectroscopy',
			description: 'Analyze compounds using ultraviolet-visible spectroscopy to determine concentration and identify substances.',
			href: '/labs/chemistry/spectroscopy',
			icon: 'spectrum',
			difficulty: 'Intermediate',
			duration: '60 min',
			gradient: 'from-violet-500 to-purple-600'
		}
	];
</script>

<svelte:head>
	<title>Chemistry Labs - AfriLab</title>
</svelte:head>

<div class="min-h-screen">
	<!-- Header -->
	<div class="mb-6 sm:mb-8">
		<div class="flex items-center gap-3 mb-2">
			<div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
				<svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
				</svg>
			</div>
			<div>
				<h1 class="text-2xl sm:text-3xl font-display font-bold text-white">Chemistry Labs</h1>
				<p class="text-gray-400 text-sm sm:text-base">Explore chemical reactions and analytical techniques</p>
			</div>
		</div>
	</div>

	<!-- Labs Grid -->
	<div class="grid sm:grid-cols-2 gap-4 sm:gap-6">
		{#each labs as lab}
			<a
				href={lab.href}
				class="group glass-strong rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10"
			>
				<!-- Card Header -->
				<div class="h-24 sm:h-32 bg-gradient-to-br {lab.gradient} relative overflow-hidden">
					<div class="absolute inset-0 bg-black/20"></div>
					<div class="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
						<span class="px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
							{lab.difficulty}
						</span>
					</div>
					<div class="absolute top-3 sm:top-4 right-3 sm:right-4 text-white/80 text-xs sm:text-sm">
						{lab.duration}
					</div>
				</div>

				<!-- Card Body -->
				<div class="p-4 sm:p-6">
					<h3 class="text-lg sm:text-xl font-display font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
						{lab.title}
					</h3>
					<p class="text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">
						{lab.description}
					</p>

					<div class="mt-3 sm:mt-4 flex items-center text-cyan-400 text-sm font-medium">
						<span>Start Lab</span>
						<svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>
