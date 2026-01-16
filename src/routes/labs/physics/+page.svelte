<script lang="ts">
	const labs = [
		{
			title: "Ohm's Law",
			description: 'Explore the relationship between voltage, current, and resistance in electrical circuits through hands-on experimentation.',
			href: '/labs/physics/ohms-law',
			icon: 'lightning',
			difficulty: 'Beginner',
			duration: '40 min',
			gradient: 'from-amber-500 to-orange-600'
		}
	];
</script>

<svelte:head>
	<title>Physics Labs - AfriLab</title>
</svelte:head>

<div class="min-h-screen">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex items-center gap-3 mb-2">
			<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
				<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
			</div>
			<div>
				<h1 class="text-3xl font-display font-bold text-white">Physics Labs</h1>
				<p class="text-gray-400">Understand the fundamental laws of nature</p>
			</div>
		</div>
	</div>

	<!-- Labs Grid -->
	<div class="grid md:grid-cols-2 gap-6">
		{#each labs as lab}
			<a
				href={lab.href}
				class="group glass-strong rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10"
			>
				<!-- Card Header -->
				<div class="h-32 bg-gradient-to-br {lab.gradient} relative overflow-hidden">
					<div class="absolute inset-0 bg-black/20"></div>
					<div class="absolute bottom-4 left-4">
						<span class="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
							{lab.difficulty}
						</span>
					</div>
					<div class="absolute top-4 right-4 text-white/80 text-sm">
						{lab.duration}
					</div>
				</div>

				<!-- Card Body -->
				<div class="p-6">
					<h3 class="text-xl font-display font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors">
						{lab.title}
					</h3>
					<p class="text-gray-400 text-sm leading-relaxed">
						{lab.description}
					</p>

					<div class="mt-4 flex items-center text-amber-400 text-sm font-medium">
						<span>Start Lab</span>
						<svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</div>
				</div>
			</a>
		{/each}
	</div>

	<!-- Coming Soon -->
	<div class="mt-8 glass rounded-xl p-6 border border-white/10">
		<h3 class="text-lg font-semibold text-white mb-2">More Labs Coming Soon</h3>
		<p class="text-gray-400 text-sm">We're developing additional physics labs including mechanics, optics, and thermodynamics experiments.</p>
	</div>
</div>
