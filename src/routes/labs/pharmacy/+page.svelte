<script lang="ts">
	const labs = [
		{
			title: 'Pharmaceutical Compounding',
			description: 'Learn the art and science of preparing customized medications by combining and mixing pharmaceutical ingredients.',
			href: '/labs/pharmacy/compounding',
			icon: 'pill',
			difficulty: 'Intermediate',
			duration: '60 min',
			gradient: 'from-pink-500 to-rose-600'
		}
	];
</script>

<svelte:head>
	<title>Pharmacy Labs - AfriLab</title>
</svelte:head>

<div class="min-h-screen">
	<!-- Header -->
	<div class="mb-6 sm:mb-8">
		<div class="flex items-center gap-3 mb-2">
			<div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0">
				<svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
				</svg>
			</div>
			<div>
				<h1 class="text-2xl sm:text-3xl font-display font-bold text-white">Pharmacy Labs</h1>
				<p class="text-gray-400 text-sm sm:text-base">Master pharmaceutical techniques and drug preparation</p>
			</div>
		</div>
	</div>

	<!-- Labs Grid -->
	<div class="grid sm:grid-cols-2 gap-4 sm:gap-6">
		{#each labs as lab}
			<a
				href={lab.href}
				class="group glass-strong rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10"
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
					<h3 class="text-lg sm:text-xl font-display font-semibold text-white mb-2 group-hover:text-pink-400 transition-colors">
						{lab.title}
					</h3>
					<p class="text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">
						{lab.description}
					</p>

					<div class="mt-3 sm:mt-4 flex items-center text-pink-400 text-sm font-medium">
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
	<div class="mt-6 sm:mt-8 glass rounded-xl p-4 sm:p-6 border border-white/10">
		<h3 class="text-lg font-semibold text-white mb-2">More Labs Coming Soon</h3>
		<p class="text-gray-400 text-sm">We're developing additional pharmacy labs including drug interactions, dosage calculations, and quality control.</p>
	</div>
</div>
