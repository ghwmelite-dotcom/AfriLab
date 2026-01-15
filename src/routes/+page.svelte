<script lang="ts">
	import { goto } from '$app/navigation';
	import { isAuthenticated, currentUser } from '$stores/user';
	import { onMount } from 'svelte';

	// Redirect if already authenticated
	$effect(() => {
		if ($isAuthenticated) {
			goto($currentUser?.role === 'instructor' ? '/instructor' : '/dashboard');
		}
	});

	let mounted = false;
	onMount(() => {
		mounted = true;
	});

	const features = [
		{
			icon: 'beaker',
			title: 'Virtual Chemistry Labs',
			description: 'Perform titrations, spectroscopy, and synthesis experiments in a safe virtual environment',
			gradient: 'from-emerald-400 to-cyan-400'
		},
		{
			icon: 'dna',
			title: 'Biology & Anatomy',
			description: 'Explore microscopy, virtual dissections, and cellular studies with interactive 3D models',
			gradient: 'from-green-400 to-emerald-400'
		},
		{
			icon: 'pill',
			title: 'Pharmacy Simulations',
			description: 'Practice drug compounding, dosage calculations, and learn about drug interactions',
			gradient: 'from-teal-400 to-cyan-400'
		},
		{
			icon: 'brain',
			title: 'AI Lab Assistant',
			description: 'Get instant help from our AI tutor powered by advanced language models',
			gradient: 'from-cyan-400 to-blue-400'
		}
	];

	const disciplines = [
		{ name: 'Chemistry', gradient: 'from-cyan-400 to-blue-500', icon: 'beaker' },
		{ name: 'Biology', gradient: 'from-emerald-400 to-green-500', icon: 'dna' },
		{ name: 'Physics', gradient: 'from-amber-400 to-orange-500', icon: 'atom' },
		{ name: 'Pharmacy', gradient: 'from-pink-400 to-rose-500', icon: 'pill' },
		{ name: 'Medical Sciences', gradient: 'from-red-400 to-rose-500', icon: 'heart' }
	];

	const stats = [
		{ value: '50K+', label: 'Active Students' },
		{ value: '200+', label: 'Universities' },
		{ value: '500+', label: 'Lab Experiments' },
		{ value: '98%', label: 'Success Rate' }
	];
</script>

<svelte:head>
	<title>AfriLab - Virtual Science Laboratory for African Universities</title>
	<meta name="description" content="Africa's foremost simulated science laboratory platform. Practice chemistry, biology, physics, pharmacy, and medical experiments in a safe virtual environment." />
</svelte:head>

<!-- Ambient Background Effects -->
<div class="fixed inset-0 overflow-hidden pointer-events-none">
	<!-- Aurora gradient background -->
	<div class="absolute inset-0 bg-aurora"></div>

	<!-- Animated gradient orbs -->
	<div class="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl animate-blob"></div>
	<div class="absolute top-1/2 -right-32 w-96 h-96 bg-gradient-to-r from-teal-500/20 to-green-500/20 rounded-full blur-3xl animate-blob" style="animation-delay: 2s;"></div>
	<div class="absolute -bottom-32 left-1/3 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-full blur-3xl animate-blob" style="animation-delay: 4s;"></div>

	<!-- Floating particles -->
	<div class="particles">
		{#each Array(20) as _, i}
			<div
				class="particle"
				style="
					left: {Math.random() * 100}%;
					top: {Math.random() * 100}%;
					animation-delay: {Math.random() * 8}s;
					animation-duration: {8 + Math.random() * 8}s;
				"
			></div>
		{/each}
	</div>

	<!-- Grid overlay -->
	<div class="absolute inset-0 bg-grid opacity-[0.02]"></div>
</div>

<!-- Navigation -->
<nav class="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/5">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-20">
			<div class="flex items-center gap-3 group">
				<div class="relative">
					<div class="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
					<div class="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
						<svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
						</svg>
					</div>
				</div>
				<span class="text-2xl font-display font-bold text-white">AfriLab</span>
			</div>

			<div class="flex items-center gap-4">
				<a href="/auth/login" class="px-5 py-2.5 text-gray-300 hover:text-white font-medium transition-colors">
					Sign in
				</a>
				<a href="/auth/register" class="btn-primary">
					Get Started
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
					</svg>
				</a>
			</div>
		</div>
	</div>
</nav>

<!-- Hero Section -->
<section class="relative min-h-screen flex items-center pt-20 pb-32 px-4 sm:px-6 lg:px-8">
	<div class="max-w-7xl mx-auto w-full">
		<div class="text-center">
			<!-- Badge -->
			<div class="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-emerald-500/20 mb-8 {mounted ? 'animate-fade-in-up' : 'opacity-0'}">
				<span class="relative flex h-2 w-2">
					<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
					<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
				</span>
				<span class="text-sm text-emerald-400 font-medium">Now serving 200+ African universities</span>
			</div>

			<!-- Main Headline -->
			<h1 class="text-5xl sm:text-6xl lg:text-8xl font-display font-bold leading-tight {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.1s;">
				<span class="text-white">Africa's Premier</span>
				<br />
				<span class="relative">
					<span class="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
						Virtual Science Lab
					</span>
				</span>
			</h1>

			<!-- Subtitle -->
			<p class="mt-8 text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.2s;">
				Experience hands-on laboratory experiments from anywhere. Our
				<span class="text-emerald-400 font-medium">AI-powered platform</span> brings
				university-level science labs to students across the continent.
			</p>

			<!-- CTA Buttons -->
			<div class="mt-12 flex flex-col sm:flex-row gap-4 justify-center {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.3s;">
				<a href="/auth/register" class="btn-primary py-4 px-8 text-lg group">
					Start Learning Free
					<svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
					</svg>
				</a>
				<a href="#features" class="btn-secondary py-4 px-8 text-lg">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					Watch Demo
				</a>
			</div>

			<!-- Discipline Pills -->
			<div class="mt-16 flex flex-wrap justify-center gap-3 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.4s;">
				{#each disciplines as discipline, i}
					<span
						class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-white/10 hover:border-white/20 transition-all hover:scale-105 cursor-default"
						style="animation-delay: {0.4 + i * 0.05}s;"
					>
						<span class="w-2.5 h-2.5 rounded-full bg-gradient-to-r {discipline.gradient}"></span>
						<span class="text-sm font-medium text-gray-300">{discipline.name}</span>
					</span>
				{/each}
			</div>
		</div>

		<!-- Stats Section -->
		<div class="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 {mounted ? 'animate-fade-in-up' : 'opacity-0'}" style="animation-delay: 0.5s;">
			{#each stats as stat, i}
				<div class="glass rounded-2xl p-6 text-center border border-white/5 hover:border-emerald-500/20 transition-all group">
					<div class="text-3xl sm:text-4xl font-display font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block">
						{stat.value}
					</div>
					<div class="mt-2 text-sm text-gray-400">{stat.label}</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Scroll indicator -->
	<div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
		<svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
		</svg>
	</div>
</section>

<!-- Features Section -->
<section id="features" class="relative py-32">
	<!-- Section background accent -->
	<div class="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent"></div>

	<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-20">
			<span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
				Features
			</span>
			<h2 class="text-4xl sm:text-5xl font-display font-bold text-white">
				Everything you need for
				<span class="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> virtual lab work</span>
			</h2>
			<p class="mt-6 text-xl text-gray-400 max-w-2xl mx-auto">
				Comprehensive tools designed specifically for African university science education
			</p>
		</div>

		<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each features as feature, i}
				<div
					class="group relative glass rounded-3xl p-8 border border-white/5 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-2"
					style="animation-delay: {i * 0.1}s;"
				>
					<!-- Hover glow effect -->
					<div class="absolute inset-0 rounded-3xl bg-gradient-to-r {feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity blur-xl"></div>

					<div class="relative">
						<!-- Icon -->
						<div class="relative w-14 h-14 mb-6">
							<div class="absolute inset-0 bg-gradient-to-r {feature.gradient} rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
							<div class="absolute inset-0 bg-gradient-to-r {feature.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity"></div>
							<div class="relative w-full h-full rounded-2xl flex items-center justify-center border border-white/10">
								<svg class="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									{#if feature.icon === 'beaker'}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
									{:else if feature.icon === 'dna'}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
									{:else if feature.icon === 'pill'}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
									{:else}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
									{/if}
								</svg>
							</div>
						</div>

						<h3 class="text-xl font-display font-semibold text-white mb-3 group-hover:text-emerald-400 transition-colors">
							{feature.title}
						</h3>
						<p class="text-gray-400 leading-relaxed">
							{feature.description}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- How It Works Section -->
<section class="relative py-32 overflow-hidden">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-20">
			<span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
				How It Works
			</span>
			<h2 class="text-4xl sm:text-5xl font-display font-bold text-white">
				Three steps to
				<span class="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent"> lab mastery</span>
			</h2>
		</div>

		<div class="grid md:grid-cols-3 gap-8 relative">
			<!-- Connecting line -->
			<div class="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-emerald-500/50 via-cyan-500/50 to-teal-500/50"></div>

			{#each [
				{ step: '01', title: 'Choose Your Lab', desc: 'Select from Chemistry, Biology, Physics, Pharmacy, or Medical Science experiments', icon: 'flask' },
				{ step: '02', title: 'Perform Experiments', desc: 'Use interactive equipment, record measurements, and observe realistic reactions', icon: 'experiment' },
				{ step: '03', title: 'Get AI Feedback', desc: 'Receive instant guidance and personalized feedback from our AI lab assistant', icon: 'ai' }
			] as item, i}
				<div class="relative text-center group">
					<!-- Step number circle -->
					<div class="relative w-20 h-20 mx-auto mb-8">
						<div class="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity"></div>
						<div class="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity"></div>
						<div class="relative w-full h-full glass rounded-full flex items-center justify-center border border-emerald-500/30">
							<span class="text-2xl font-display font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{item.step}</span>
						</div>
					</div>

					<h3 class="text-xl font-display font-semibold text-white mb-4">{item.title}</h3>
					<p class="text-gray-400 max-w-sm mx-auto">{item.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="relative py-32 overflow-hidden">
	<!-- Gradient mesh background -->
	<div class="absolute inset-0">
		<div class="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-cyan-600/20 to-teal-600/20"></div>
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 rounded-full blur-3xl"></div>
	</div>

	<div class="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
		<div class="glass-strong rounded-3xl p-12 md:p-16 border border-white/10">
			<h2 class="text-4xl sm:text-5xl font-display font-bold text-white">
				Ready to transform your
				<span class="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> science education</span>?
			</h2>
			<p class="mt-6 text-xl text-gray-300">
				Join thousands of students and instructors across Africa using AfriLab to revolutionize laboratory learning.
			</p>
			<div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
				<a href="/auth/register" class="btn-primary py-4 px-8 text-lg">
					Create Free Account
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
					</svg>
				</a>
				<a href="/auth/register?role=instructor" class="btn-secondary py-4 px-8 text-lg">
					I'm an Instructor
				</a>
			</div>
		</div>
	</div>
</section>

<!-- Footer -->
<footer class="relative border-t border-white/5 py-16">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex flex-col md:flex-row justify-between items-center gap-8">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
					<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
					</svg>
				</div>
				<span class="text-xl font-display font-bold text-white">AfriLab</span>
			</div>

			<div class="flex items-center gap-6 text-sm text-gray-400">
				<a href="#" class="hover:text-emerald-400 transition-colors">Privacy</a>
				<a href="#" class="hover:text-emerald-400 transition-colors">Terms</a>
				<a href="#" class="hover:text-emerald-400 transition-colors">Contact</a>
			</div>

			<p class="text-sm text-gray-500">
				Built with <span class="text-emerald-400">Cloudflare</span> for African universities
			</p>
		</div>
	</div>
</footer>

<style>
	.particles {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}

	.particle {
		position: absolute;
		width: 4px;
		height: 4px;
		background: radial-gradient(circle, rgba(34, 197, 94, 0.8) 0%, transparent 70%);
		border-radius: 50%;
		animation: float-particle 10s ease-in-out infinite;
	}

	@keyframes float-particle {
		0%, 100% {
			transform: translateY(0) translateX(0) scale(1);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		90% {
			opacity: 1;
		}
		100% {
			transform: translateY(-100vh) translateX(20px) scale(0.5);
			opacity: 0;
		}
	}

	.bg-grid {
		background-image:
			linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
		background-size: 50px 50px;
	}
</style>
