<script lang="ts">
	import { goto } from '$app/navigation';
	import { isAuthenticated, currentUser } from '$stores/user';

	// Redirect if already authenticated
	$: if ($isAuthenticated) {
		goto($currentUser?.role === 'instructor' ? '/instructor' : '/dashboard');
	}

	const features = [
		{
			icon: 'beaker',
			title: 'Virtual Chemistry Labs',
			description: 'Perform titrations, spectroscopy, and synthesis experiments in a safe virtual environment'
		},
		{
			icon: 'dna',
			title: 'Biology & Anatomy',
			description: 'Explore microscopy, virtual dissections, and cellular studies with interactive 3D models'
		},
		{
			icon: 'pill',
			title: 'Pharmacy Simulations',
			description: 'Practice drug compounding, dosage calculations, and learn about drug interactions'
		},
		{
			icon: 'brain',
			title: 'AI Lab Assistant',
			description: 'Get instant help from our AI tutor powered by advanced language models'
		}
	];

	const disciplines = [
		{ name: 'Chemistry', color: 'bg-blue-500', icon: 'beaker' },
		{ name: 'Biology', color: 'bg-green-500', icon: 'dna' },
		{ name: 'Physics', color: 'bg-amber-500', icon: 'atom' },
		{ name: 'Pharmacy', color: 'bg-pink-500', icon: 'pill' },
		{ name: 'Medical Sciences', color: 'bg-red-500', icon: 'heart' }
	];
</script>

<svelte:head>
	<title>AfriLab - Virtual Science Laboratory for African Universities</title>
	<meta name="description" content="Africa's foremost simulated science laboratory platform. Practice chemistry, biology, physics, pharmacy, and medical experiments in a safe virtual environment." />
</svelte:head>

<!-- Navigation -->
<nav class="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200 dark:border-gray-700">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-16">
			<div class="flex items-center gap-2">
				<div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
					<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
					</svg>
				</div>
				<span class="text-xl font-bold text-gray-900 dark:text-white">AfriLab</span>
			</div>

			<div class="flex items-center gap-4">
				<a href="/auth/login" class="btn-ghost text-gray-700 dark:text-gray-300">
					Sign in
				</a>
				<a href="/auth/register" class="btn-primary">
					Get Started
				</a>
			</div>
		</div>
	</div>
</nav>

<!-- Hero Section -->
<section class="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
	<div class="max-w-7xl mx-auto">
		<div class="text-center">
			<h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
				Africa's Premier
				<span class="gradient-text">Virtual Science Lab</span>
			</h1>
			<p class="mt-6 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
				Experience hands-on laboratory experiments from anywhere. Our AI-powered platform brings
				university-level science labs to students across Africa.
			</p>
			<div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
				<a href="/auth/register" class="btn-primary py-4 px-8 text-lg">
					Start Learning Free
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
					</svg>
				</a>
				<a href="#features" class="btn-secondary py-4 px-8 text-lg">
					Explore Features
				</a>
			</div>
		</div>

		<!-- Discipline Pills -->
		<div class="mt-16 flex flex-wrap justify-center gap-3">
			{#each disciplines as discipline}
				<span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
					<span class="w-3 h-3 rounded-full {discipline.color}"></span>
					<span class="text-sm font-medium text-gray-700 dark:text-gray-300">{discipline.name}</span>
				</span>
			{/each}
		</div>
	</div>
</section>

<!-- Features Section -->
<section id="features" class="py-20 bg-white dark:bg-gray-800">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-16">
			<h2 class="text-3xl font-bold text-gray-900 dark:text-white">
				Everything you need for virtual lab work
			</h2>
			<p class="mt-4 text-lg text-gray-600 dark:text-gray-400">
				Comprehensive tools designed for African university science education
			</p>
		</div>

		<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
			{#each features as feature}
				<div class="card p-6 hover:shadow-lg transition-shadow">
					<div class="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
						<svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							{#if feature.icon === 'beaker'}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
							{:else if feature.icon === 'dna'}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
							{:else if feature.icon === 'pill'}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
							{:else}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
							{/if}
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
						{feature.title}
					</h3>
					<p class="text-gray-600 dark:text-gray-400">
						{feature.description}
					</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="py-20 bg-primary-600">
	<div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
		<h2 class="text-3xl font-bold text-white">
			Ready to transform your science education?
		</h2>
		<p class="mt-4 text-lg text-primary-100">
			Join thousands of students and instructors across Africa using AfriLab.
		</p>
		<div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
			<a href="/auth/register" class="btn bg-white text-primary-600 hover:bg-gray-100 py-3 px-8 text-lg">
				Create Free Account
			</a>
			<a href="/auth/register?role=instructor" class="btn border-2 border-white text-white hover:bg-primary-700 py-3 px-8 text-lg">
				I'm an Instructor
			</a>
		</div>
	</div>
</section>

<!-- Footer -->
<footer class="bg-gray-900 text-gray-400 py-12">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex flex-col md:flex-row justify-between items-center">
			<div class="flex items-center gap-2 mb-4 md:mb-0">
				<div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
					<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
					</svg>
				</div>
				<span class="text-white font-semibold">AfriLab</span>
			</div>
			<p class="text-sm">
				Built with Cloudflare for African universities
			</p>
		</div>
	</div>
</footer>
