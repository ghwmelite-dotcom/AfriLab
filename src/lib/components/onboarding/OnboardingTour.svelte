<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let {
		onComplete,
		onSkip
	}: {
		onComplete: () => void;
		onSkip: () => void;
	} = $props();

	interface TourStep {
		id: string;
		title: string;
		description: string;
		target?: string; // CSS selector for element to highlight
		position: 'center' | 'top' | 'bottom' | 'left' | 'right';
		icon: string;
	}

	const tourSteps: TourStep[] = [
		{
			id: 'welcome',
			title: 'Welcome to AfriLab!',
			description: "Your virtual laboratory platform for science education. Let's take a quick tour of the features.",
			position: 'center',
			icon: '👋'
		},
		{
			id: 'dashboard',
			title: 'Your Dashboard',
			description: 'This is your home base. View your progress, recent activity, and quick stats at a glance.',
			target: '[data-tour="dashboard-stats"]',
			position: 'bottom',
			icon: '📊'
		},
		{
			id: 'labs',
			title: 'Virtual Labs',
			description: 'Access experiments in Chemistry, Biology, Physics, and Pharmacy. Each lab simulates real equipment and procedures.',
			target: '[data-tour="labs-link"]',
			position: 'right',
			icon: '🔬'
		},
		{
			id: 'ai-assistant',
			title: 'AI Lab Assistant',
			description: 'Need help? Our AI assistant can answer questions, provide hints, and guide you through experiments.',
			target: '[data-tour="ai-button"]',
			position: 'left',
			icon: '🤖'
		},
		{
			id: 'achievements',
			title: 'Achievements & Leaderboard',
			description: 'Earn achievements as you complete labs and climb the leaderboard. Compete with students across Africa!',
			target: '[data-tour="leaderboard-link"]',
			position: 'right',
			icon: '🏆'
		},
		{
			id: 'reports',
			title: 'Lab Reports',
			description: 'After completing a lab, generate professional PDF reports to submit to your instructors.',
			position: 'center',
			icon: '📄'
		},
		{
			id: 'ready',
			title: "You're Ready!",
			description: "That's the basics! Start with an easy lab like Acid-Base Titration to get familiar with the interface.",
			position: 'center',
			icon: '🚀'
		}
	];

	let currentStep = $state(0);
	let targetRect = $state<DOMRect | null>(null);
	let isVisible = $state(true);

	function nextStep() {
		if (currentStep < tourSteps.length - 1) {
			currentStep++;
			updateTargetPosition();
		} else {
			completeTour();
		}
	}

	function prevStep() {
		if (currentStep > 0) {
			currentStep--;
			updateTargetPosition();
		}
	}

	function completeTour() {
		isVisible = false;
		if (browser) {
			localStorage.setItem('afrilab_tour_completed', 'true');
		}
		onComplete();
	}

	function skipTour() {
		isVisible = false;
		if (browser) {
			localStorage.setItem('afrilab_tour_completed', 'true');
		}
		onSkip();
	}

	function updateTargetPosition() {
		if (!browser) return;

		const step = tourSteps[currentStep];
		if (step.target) {
			const element = document.querySelector(step.target);
			if (element) {
				targetRect = element.getBoundingClientRect();
				// Scroll element into view if needed
				element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			} else {
				targetRect = null;
			}
		} else {
			targetRect = null;
		}
	}

	function getTooltipPosition(): string {
		const step = tourSteps[currentStep];

		if (step.position === 'center' || !targetRect) {
			return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
		}

		const padding = 20;
		const tooltipWidth = 360;
		const tooltipHeight = 200;

		switch (step.position) {
			case 'top':
				return `top-[${targetRect.top - tooltipHeight - padding}px] left-[${targetRect.left + targetRect.width / 2 - tooltipWidth / 2}px]`;
			case 'bottom':
				return `top-[${targetRect.bottom + padding}px] left-[${targetRect.left + targetRect.width / 2 - tooltipWidth / 2}px]`;
			case 'left':
				return `top-[${targetRect.top + targetRect.height / 2 - tooltipHeight / 2}px] left-[${targetRect.left - tooltipWidth - padding}px]`;
			case 'right':
				return `top-[${targetRect.top + targetRect.height / 2 - tooltipHeight / 2}px] left-[${targetRect.right + padding}px]`;
			default:
				return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
		}
	}

	onMount(() => {
		updateTargetPosition();
	});

	// Handle keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			skipTour();
		} else if (event.key === 'ArrowRight' || event.key === 'Enter') {
			nextStep();
		} else if (event.key === 'ArrowLeft') {
			prevStep();
		}
	}

	$effect(() => {
		if (browser) {
			window.addEventListener('keydown', handleKeydown);
			return () => window.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

{#if isVisible}
	<!-- Backdrop -->
	<div class="fixed inset-0 z-[100]">
		<!-- Dark overlay with cutout for highlighted element -->
		<div class="absolute inset-0 bg-black/80 backdrop-blur-sm">
			{#if targetRect}
				<!-- SVG mask for spotlight effect -->
				<svg class="absolute inset-0 w-full h-full">
					<defs>
						<mask id="spotlight">
							<rect width="100%" height="100%" fill="white" />
							<rect
								x={targetRect.left - 8}
								y={targetRect.top - 8}
								width={targetRect.width + 16}
								height={targetRect.height + 16}
								rx="12"
								fill="black"
							/>
						</mask>
					</defs>
					<rect width="100%" height="100%" fill="rgba(0,0,0,0.8)" mask="url(#spotlight)" />
				</svg>

				<!-- Animated border around highlighted element -->
				<div
					class="absolute border-2 border-emerald-500 rounded-xl pointer-events-none animate-pulse"
					style="
						top: {targetRect.top - 8}px;
						left: {targetRect.left - 8}px;
						width: {targetRect.width + 16}px;
						height: {targetRect.height + 16}px;
					"
				></div>
			{/if}
		</div>

		<!-- Tooltip -->
		<div
			class="absolute z-10 w-[360px] max-w-[90vw] {tourSteps[currentStep].position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}"
			style={tourSteps[currentStep].position !== 'center' && targetRect ? `
				top: ${tourSteps[currentStep].position === 'bottom' ? targetRect.bottom + 20 : tourSteps[currentStep].position === 'top' ? targetRect.top - 220 : targetRect.top + targetRect.height / 2 - 100}px;
				left: ${tourSteps[currentStep].position === 'right' ? targetRect.right + 20 : tourSteps[currentStep].position === 'left' ? targetRect.left - 380 : targetRect.left + targetRect.width / 2 - 180}px;
			` : ''}
		>
			<div class="glass-strong rounded-2xl border border-emerald-500/30 overflow-hidden animate-fade-in-up">
				<!-- Header -->
				<div class="p-5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-b border-white/10">
					<div class="flex items-center gap-3">
						<span class="text-3xl">{tourSteps[currentStep].icon}</span>
						<div>
							<h3 class="text-lg font-display font-bold text-white">
								{tourSteps[currentStep].title}
							</h3>
							<span class="text-xs text-gray-400">
								Step {currentStep + 1} of {tourSteps.length}
							</span>
						</div>
					</div>
				</div>

				<!-- Content -->
				<div class="p-5">
					<p class="text-sm text-gray-300 leading-relaxed">
						{tourSteps[currentStep].description}
					</p>
				</div>

				<!-- Progress dots -->
				<div class="flex justify-center gap-1.5 pb-4">
					{#each tourSteps as _, i}
						<button
							onclick={() => { currentStep = i; updateTargetPosition(); }}
							class="w-2 h-2 rounded-full transition-all
								{i === currentStep ? 'bg-emerald-500 w-4' : i < currentStep ? 'bg-emerald-500/50' : 'bg-gray-600'}"
							aria-label="Go to step {i + 1}"
						></button>
					{/each}
				</div>

				<!-- Actions -->
				<div class="flex items-center justify-between p-4 border-t border-white/10 bg-gray-900/50">
					<button
						onclick={skipTour}
						class="text-sm text-gray-400 hover:text-white transition-colors"
					>
						Skip tour
					</button>

					<div class="flex items-center gap-2">
						{#if currentStep > 0}
							<button
								onclick={prevStep}
								class="px-4 py-2 rounded-lg glass border border-white/10 hover:border-white/20 text-white text-sm font-medium transition-all"
							>
								Back
							</button>
						{/if}

						<button
							onclick={nextStep}
							class="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
						>
							{currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes fade-in-up {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in-up {
		animation: fade-in-up 0.3s ease-out;
	}
</style>
