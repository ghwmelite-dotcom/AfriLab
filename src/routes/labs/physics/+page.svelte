<script lang="ts">
	const labs = [
		{
			title: "Ohm's Law",
			description: 'Explore the relationship between voltage, current, and resistance in electrical circuits through hands-on experimentation.',
			href: '/labs/physics/ohms-law',
			difficulty: 'Beginner',
			duration: '40 min',
			gradient: 'from-amber-500 to-orange-600'
		},
		{
			title: 'Simple Pendulum & SHM',
			description: 'Investigate simple harmonic motion using a pendulum, measuring period vs. length and verifying the pendulum equation.',
			href: '/labs/physics/pendulum',
			difficulty: 'Beginner',
			duration: '30 min',
			gradient: 'from-yellow-500 to-amber-600'
		},
		{
			title: 'Projectile Motion',
			description: 'Launch projectiles at different angles and velocities to explore kinematic equations and trajectory analysis.',
			href: '/labs/physics/projectile-motion',
			difficulty: 'Intermediate',
			duration: '45 min',
			gradient: 'from-orange-500 to-red-600'
		},
		{
			title: 'Wave Motion & Interference',
			description: 'Explore wave properties including wavelength, frequency, amplitude, and observe interference patterns.',
			href: '/labs/physics/wave-motion',
			difficulty: 'Intermediate',
			duration: '40 min',
			gradient: 'from-blue-500 to-indigo-600'
		},
		{
			title: 'Optics: Lenses & Mirrors',
			description: 'Investigate image formation using convex and concave lenses and mirrors, and verify the thin lens equation.',
			href: '/labs/physics/optics',
			difficulty: 'Intermediate',
			duration: '45 min',
			gradient: 'from-violet-500 to-purple-600'
		},
		{
			title: 'Thermodynamics & Heat Transfer',
			description: 'Investigate heat conduction, convection, and radiation, and verify the laws of thermodynamics.',
			href: '/labs/physics/thermodynamics',
			difficulty: 'Advanced',
			duration: '50 min',
			gradient: 'from-red-500 to-rose-600'
		}
	];
</script>

<svelte:head>
	<title>Physics Labs - AfriLab</title>
</svelte:head>

<div class="min-h-screen">
	<!-- Header -->
	<div class="mb-6 sm:mb-8">
		<div class="flex items-center gap-3 mb-2">
			<div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
				<svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
			</div>
			<div>
				<h1 class="text-2xl sm:text-3xl font-display font-bold text-white">Physics Labs</h1>
				<p class="text-gray-400 text-sm sm:text-base">Understand the fundamental laws of nature</p>
			</div>
		</div>
	</div>

	<!-- Labs Grid -->
	<div class="grid sm:grid-cols-2 gap-4 sm:gap-6">
		{#each labs as lab}
			<a
				href={lab.comingSoon ? '#' : lab.href}
				class="group glass-strong rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10
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
					<h3 class="text-lg sm:text-xl font-display font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors">
						{lab.title}
					</h3>
					<p class="text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">
						{lab.description}
					</p>

					<div class="mt-3 sm:mt-4 flex items-center text-amber-400 text-sm font-medium">
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
