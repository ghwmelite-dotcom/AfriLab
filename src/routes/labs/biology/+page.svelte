<script lang="ts">
	const labs = [
		{
			title: 'Microscopy Basics',
			description: 'Learn to use a compound microscope to observe and identify cellular structures in plant and animal cells.',
			href: '/labs/biology/microscopy',
			difficulty: 'Beginner',
			duration: '30 min',
			gradient: 'from-emerald-500 to-green-600'
		},
		{
			title: 'Mendelian Genetics',
			description: 'Simulate genetic crosses to understand inheritance patterns, dominant/recessive traits, and Punnett square predictions.',
			href: '/labs/biology/genetics',
			difficulty: 'Beginner',
			duration: '35 min',
			gradient: 'from-lime-500 to-emerald-600',
			comingSoon: true
		},
		{
			title: 'Cell Division (Mitosis)',
			description: 'Observe and identify the phases of mitosis in dividing cells, from interphase through cytokinesis.',
			href: '/labs/biology/cell-division',
			difficulty: 'Intermediate',
			duration: '45 min',
			gradient: 'from-green-500 to-teal-600'
		},
		{
			title: 'Enzyme Kinetics',
			description: 'Study the effects of temperature, pH, and substrate concentration on enzyme activity using catalase.',
			href: '/labs/biology/enzyme-kinetics',
			difficulty: 'Intermediate',
			duration: '45 min',
			gradient: 'from-teal-500 to-cyan-600',
			comingSoon: true
		},
		{
			title: 'Photosynthesis & Light Reactions',
			description: 'Investigate the effect of light intensity and wavelength on the rate of photosynthesis using aquatic plants.',
			href: '/labs/biology/photosynthesis',
			difficulty: 'Intermediate',
			duration: '50 min',
			gradient: 'from-yellow-500 to-green-600',
			comingSoon: true
		},
		{
			title: 'DNA Extraction & Electrophoresis',
			description: 'Extract DNA from biological samples and separate DNA fragments using gel electrophoresis.',
			href: '/labs/biology/dna-extraction',
			difficulty: 'Advanced',
			duration: '60 min',
			gradient: 'from-cyan-500 to-blue-600',
			comingSoon: true
		},
		{
			title: 'Ecosystem Simulation',
			description: 'Model population dynamics, food webs, and energy flow through a virtual ecosystem.',
			href: '/labs/biology/ecosystem',
			difficulty: 'Advanced',
			duration: '55 min',
			gradient: 'from-green-600 to-emerald-700',
			comingSoon: true
		}
	];
</script>

<svelte:head>
	<title>Biology Labs - AfriLab</title>
</svelte:head>

<div class="min-h-screen">
	<!-- Header -->
	<div class="mb-6 sm:mb-8">
		<div class="flex items-center gap-3 mb-2">
			<div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
				<svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
				</svg>
			</div>
			<div>
				<h1 class="text-2xl sm:text-3xl font-display font-bold text-white">Biology Labs</h1>
				<p class="text-gray-400 text-sm sm:text-base">Discover the wonders of living organisms</p>
			</div>
		</div>
	</div>

	<!-- Labs Grid -->
	<div class="grid sm:grid-cols-2 gap-4 sm:gap-6">
		{#each labs as lab}
			<a
				href={lab.comingSoon ? '#' : lab.href}
				class="group glass-strong rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10
					{lab.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}"
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
					{#if lab.comingSoon}
						<div class="absolute top-3 sm:top-4 left-3 sm:left-4 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium text-white">
							Coming Soon
						</div>
					{/if}
				</div>

				<!-- Card Body -->
				<div class="p-4 sm:p-6">
					<h3 class="text-lg sm:text-xl font-display font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
						{lab.title}
					</h3>
					<p class="text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">
						{lab.description}
					</p>

					<div class="mt-3 sm:mt-4 flex items-center text-emerald-400 text-sm font-medium">
						{#if lab.comingSoon}
							<span class="text-gray-500">Coming Soon</span>
						{:else}
							<span>Start Lab</span>
							<svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						{/if}
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>
