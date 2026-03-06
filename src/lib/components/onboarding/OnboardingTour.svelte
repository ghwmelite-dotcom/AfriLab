<script lang="ts">
	import { onMount } from 'svelte';
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
		target?: string;
		icon: string;
	}

	const tourSteps: TourStep[] = [
		{
			id: 'welcome',
			title: 'Welcome to AfriLab!',
			description: "Your virtual laboratory platform for science education. Let's take a quick tour of the features.",
			icon: '👋'
		},
		{
			id: 'dashboard',
			title: 'Your Dashboard',
			description: 'This is your home base. View your progress, recent activity, and quick stats at a glance.',
			target: '[data-tour="dashboard-stats"]',
			icon: '📊'
		},
		{
			id: 'labs',
			title: 'Virtual Labs',
			description: 'Access experiments in Chemistry, Biology, Physics, and Pharmacy. Each lab simulates real equipment and procedures.',
			target: '[data-tour="labs-link"]',
			icon: '🔬'
		},
		{
			id: 'ai-assistant',
			title: 'AI Lab Assistant',
			description: 'Need help? Our AI assistant can answer questions, provide hints, and guide you through experiments.',
			target: '[data-tour="ai-button"]',
			icon: '🤖'
		},
		{
			id: 'achievements',
			title: 'Achievements & Leaderboard',
			description: 'Earn achievements as you complete labs and climb the leaderboard. Compete with students across Africa!',
			target: '[data-tour="leaderboard-link"]',
			icon: '🏆'
		},
		{
			id: 'reports',
			title: 'Lab Reports',
			description: 'After completing a lab, generate professional PDF reports to submit to your instructors.',
			icon: '📄'
		},
		{
			id: 'ready',
			title: "You're Ready!",
			description: "That's the basics! Start with an easy lab like Acid-Base Titration to get familiar with the interface.",
			icon: '🚀'
		}
	];

	let currentStep = $state(0);
	let targetRect = $state<DOMRect | null>(null);
	let isVisible = $state(true);
	let tooltipEl = $state<HTMLDivElement | null>(null);
	let tooltipStyle = $state('');

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
			if (element && isElementVisible(element as HTMLElement)) {
				targetRect = element.getBoundingClientRect();
				element.scrollIntoView({ behavior: 'smooth', block: 'center' });
				// Recalc after scroll settles
				setTimeout(() => {
					if (step.target) {
						const el = document.querySelector(step.target);
						if (el && isElementVisible(el as HTMLElement)) {
							targetRect = el.getBoundingClientRect();
						} else {
							targetRect = null;
						}
						positionTooltip();
					}
				}, 350);
			} else {
				targetRect = null;
			}
		} else {
			targetRect = null;
		}

		// Position immediately, then again after scroll
		requestAnimationFrame(() => positionTooltip());
	}

	function isElementVisible(el: HTMLElement): boolean {
		const rect = el.getBoundingClientRect();
		const style = window.getComputedStyle(el);
		return (
			rect.width > 0 &&
			rect.height > 0 &&
			style.display !== 'none' &&
			style.visibility !== 'hidden' &&
			style.opacity !== '0'
		);
	}

	function positionTooltip() {
		if (!browser) return;

		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const pad = 12;
		const tooltipW = Math.min(360, vw - pad * 2);

		// No target or mobile: center in viewport
		if (!targetRect || vw < 768) {
			const left = (vw - tooltipW) / 2;
			const top = vh * 0.3;
			tooltipStyle = `top:${top}px;left:${left}px;width:${tooltipW}px;`;
			return;
		}

		// Desktop: position relative to target
		let top: number;
		let left: number;

		// Try below target first
		const belowSpace = vh - targetRect.bottom;
		const aboveSpace = targetRect.top;
		const rightSpace = vw - targetRect.right;
		const leftSpace = targetRect.left;

		if (belowSpace > 240) {
			top = targetRect.bottom + 16;
			left = targetRect.left + targetRect.width / 2 - tooltipW / 2;
		} else if (aboveSpace > 240) {
			top = targetRect.top - 240;
			left = targetRect.left + targetRect.width / 2 - tooltipW / 2;
		} else if (rightSpace > tooltipW + 20) {
			top = targetRect.top + targetRect.height / 2 - 120;
			left = targetRect.right + 16;
		} else if (leftSpace > tooltipW + 20) {
			top = targetRect.top + targetRect.height / 2 - 120;
			left = targetRect.left - tooltipW - 16;
		} else {
			// Fallback: center
			top = vh * 0.3;
			left = (vw - tooltipW) / 2;
		}

		// Clamp to viewport
		left = Math.max(pad, Math.min(left, vw - tooltipW - pad));
		top = Math.max(pad, Math.min(top, vh - 280));

		tooltipStyle = `top:${top}px;left:${left}px;width:${tooltipW}px;`;
	}

	onMount(() => {
		updateTargetPosition();

		const handleResize = () => {
			updateTargetPosition();
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

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
	<div class="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Onboarding tour">
		<!-- Dark overlay -->
		<div class="absolute inset-0 bg-black/80" onclick={skipTour}></div>

		<!-- Spotlight cutout for target element -->
		{#if targetRect}
			<svg class="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
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

			<!-- Highlight border -->
			<div
				class="absolute border-2 border-emerald-500 rounded-xl pointer-events-none animate-pulse"
				style="top:{targetRect.top - 8}px;left:{targetRect.left - 8}px;width:{targetRect.width + 16}px;height:{targetRect.height + 16}px;"
			></div>
		{/if}

		<!-- Tooltip card -->
		<div
			bind:this={tooltipEl}
			class="absolute z-10 tour-tooltip"
			style={tooltipStyle}
		>
			<div class="tour-card rounded-2xl border border-emerald-500/30 overflow-hidden">
				<!-- Header -->
				<div class="px-4 py-4 sm:px-5 sm:py-5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-b border-white/10">
					<div class="flex items-center gap-3">
						<span class="text-2xl sm:text-3xl">{tourSteps[currentStep].icon}</span>
						<div class="min-w-0">
							<h3 class="text-base sm:text-lg font-bold text-white leading-tight">
								{tourSteps[currentStep].title}
							</h3>
							<span class="text-xs text-gray-400">
								Step {currentStep + 1} of {tourSteps.length}
							</span>
						</div>
					</div>
				</div>

				<!-- Content -->
				<div class="px-4 py-3 sm:px-5 sm:py-4">
					<p class="text-sm text-gray-300 leading-relaxed">
						{tourSteps[currentStep].description}
					</p>
				</div>

				<!-- Progress dots -->
				<div class="flex justify-center gap-1.5 pb-3">
					{#each tourSteps as _, i}
						<button
							onclick={() => { currentStep = i; updateTargetPosition(); }}
							class="h-2 rounded-full transition-all {i === currentStep ? 'bg-emerald-500 w-4' : i < currentStep ? 'bg-emerald-500/50 w-2' : 'bg-gray-600 w-2'}"
							aria-label="Go to step {i + 1}"
						></button>
					{/each}
				</div>

				<!-- Actions -->
				<div class="flex items-center justify-between px-4 py-3 sm:p-4 border-t border-white/10" style="background: rgba(8, 12, 21, 0.6);">
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
								class="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-white/10 hover:border-white/20 text-white text-sm font-medium transition-all"
								style="background: rgba(255,255,255,0.05);"
							>
								Back
							</button>
						{/if}

						<button
							onclick={nextStep}
							class="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
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
	.tour-tooltip {
		animation: tour-enter 0.3s ease-out;
	}

	.tour-card {
		background: rgba(12, 17, 29, 0.97);
		box-shadow:
			0 0 0 1px rgba(34, 197, 94, 0.15) inset,
			0 25px 50px -12px rgba(0, 0, 0, 0.6);
	}

	@keyframes tour-enter {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
