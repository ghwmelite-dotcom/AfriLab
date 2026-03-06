<script lang="ts">
	const labs = [
		{
			title: 'Vital Signs Assessment',
			description: 'Learn to measure and interpret patient vital signs including blood pressure, heart rate, respiratory rate, and more.',
			href: '/labs/medical/vital-signs',
			difficulty: 'Beginner',
			duration: '30 min',
			gradient: 'from-rose-500 to-red-600'
		},
		{
			title: 'Blood Typing & Analysis',
			description: 'Determine blood types using simulated antigen-antibody reactions and understand transfusion compatibility.',
			href: '/labs/medical/blood-analysis',
			difficulty: 'Beginner',
			duration: '35 min',
			gradient: 'from-red-500 to-rose-600',
			comingSoon: true
		},
		{
			title: 'ECG Reading & Interpretation',
			description: 'Learn to read and interpret electrocardiogram traces, identifying normal sinus rhythm and common arrhythmias.',
			href: '/labs/medical/ecg-reading',
			difficulty: 'Intermediate',
			duration: '45 min',
			gradient: 'from-pink-500 to-fuchsia-600',
			comingSoon: true
		},
		{
			title: 'Patient Assessment & History',
			description: 'Practice conducting a systematic patient assessment including history taking and clinical reasoning.',
			href: '/labs/medical/patient-assessment',
			difficulty: 'Intermediate',
			duration: '50 min',
			gradient: 'from-orange-500 to-amber-600',
			comingSoon: true
		},
		{
			title: 'Heart & Lung Auscultation',
			description: 'Learn proper stethoscope technique and identify normal and abnormal heart and lung sounds.',
			href: '/labs/medical/auscultation',
			difficulty: 'Advanced',
			duration: '45 min',
			gradient: 'from-violet-500 to-purple-600',
			comingSoon: true
		}
	];
</script>

<svelte:head>
	<title>Medical Labs - AfriLab</title>
</svelte:head>

<div class="min-h-screen">
	<!-- Header -->
	<div class="mb-6 sm:mb-8">
		<div class="flex items-center gap-3 mb-2">
			<div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center flex-shrink-0">
				<svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
				</svg>
			</div>
			<div>
				<h1 class="text-2xl sm:text-3xl font-display font-bold text-white">Medical Labs</h1>
				<p class="text-gray-400 text-sm sm:text-base">Practice clinical skills and diagnostic techniques</p>
			</div>
		</div>
	</div>

	<!-- Labs Grid -->
	<div class="grid sm:grid-cols-2 gap-4 sm:gap-6">
		{#each labs as lab}
			<a
				href={lab.comingSoon ? '#' : lab.href}
				class="group glass-strong rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/10
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
					<h3 class="text-lg sm:text-xl font-display font-semibold text-white mb-2 group-hover:text-rose-400 transition-colors">
						{lab.title}
					</h3>
					<p class="text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">
						{lab.description}
					</p>

					<div class="mt-3 sm:mt-4 flex items-center text-rose-400 text-sm font-medium">
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
