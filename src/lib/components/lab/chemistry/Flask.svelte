<script lang="ts">
	import { formatNumber } from '$lib/utils/helpers';

	let { volume, color = 'transparent', pH = 7, isReceiving = false }: {
		volume: number;
		color?: string;
		pH?: number;
		isReceiving?: boolean;
	} = $props();

	let fillPercent = $derived(Math.min((volume / 150) * 100, 80));

	// Calculate color intensity based on pH change from neutral
	let colorIntensity = $derived(Math.abs(pH - 7) / 7);
</script>

<div class="relative flex flex-col items-center group">
	<!-- Label -->
	<div class="mb-3 text-center">
		<span class="text-sm font-display font-semibold text-white">Erlenmeyer Flask</span>
		<div class="text-xs text-rose-400/80">HCl solution</div>
	</div>

	<!-- Flask assembly -->
	<div class="relative">
		<!-- Ambient glow based on pH -->
		<div
			class="absolute inset-0 blur-3xl scale-125 opacity-30 transition-all duration-500"
			style="background: {color || 'transparent'};"
		></div>

		<!-- Glow effect when receiving -->
		{#if isReceiving}
			<div class="absolute inset-0 bg-gradient-radial from-cyan-500/20 to-transparent blur-2xl scale-150 animate-pulse"></div>
		{/if}

		<!-- Flask neck -->
		<div class="relative mx-auto">
			<!-- Glass rim -->
			<div class="w-8 h-1 bg-gradient-to-b from-white/30 to-white/10 rounded-t-full mx-auto"></div>

			<!-- Neck tube -->
			<div class="relative w-7 h-10 mx-auto overflow-hidden">
				<!-- Glass material -->
				<div class="absolute inset-0 bg-gradient-to-r from-white/5 via-white/15 to-white/5 border-x border-white/20"></div>

				<!-- Neck reflection -->
				<div class="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-white/30 to-transparent"></div>

				<!-- Liquid in neck if full -->
				{#if fillPercent > 70}
					<div
						class="absolute bottom-0 left-0 right-0 transition-all duration-300"
						style="height: {Math.min((fillPercent - 70) * 3, 100)}%; background: {color || 'rgba(200, 200, 200, 0.3)'};"
					></div>
				{/if}
			</div>
		</div>

		<!-- Flask body (conical) -->
		<div class="relative w-44 h-36 mx-auto">
			<!-- Main flask shape -->
			<svg viewBox="0 0 180 150" class="w-full h-full">
				<defs>
					<!-- Glass gradient -->
					<linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" style="stop-color:rgba(255,255,255,0.1)" />
						<stop offset="20%" style="stop-color:rgba(255,255,255,0.2)" />
						<stop offset="50%" style="stop-color:rgba(255,255,255,0.05)" />
						<stop offset="80%" style="stop-color:rgba(255,255,255,0.15)" />
						<stop offset="100%" style="stop-color:rgba(255,255,255,0.08)" />
					</linearGradient>

					<!-- Liquid clip path -->
					<clipPath id="flaskClip">
						<path d="M 60 0 L 120 0 L 170 140 Q 175 150 165 150 L 15 150 Q 5 150 10 140 L 60 0 Z" />
					</clipPath>

					<!-- Liquid gradient -->
					<linearGradient id="liquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" style="stop-color:rgba(255,255,255,0.3)" />
						<stop offset="100%" style="stop-color:rgba(0,0,0,0.1)" />
					</linearGradient>
				</defs>

				<!-- Flask outline -->
				<path
					d="M 60 0 L 120 0 L 170 140 Q 175 150 165 150 L 15 150 Q 5 150 10 140 L 60 0 Z"
					fill="url(#glassGrad)"
					stroke="rgba(255,255,255,0.25)"
					stroke-width="1.5"
				/>

				<!-- Liquid fill -->
				<g clip-path="url(#flaskClip)">
					<rect
						x="0"
						y={150 - (fillPercent * 1.5)}
						width="180"
						height={fillPercent * 1.5}
						fill={color || 'rgba(200, 200, 200, 0.3)'}
						class="transition-all duration-300"
					/>

					<!-- Liquid surface highlight -->
					<rect
						x="10"
						y={150 - (fillPercent * 1.5)}
						width="160"
						height="4"
						fill="url(#liquidGrad)"
						class="transition-all duration-300"
					/>

					<!-- Swirl effects -->
					{#if isReceiving}
						<g class="animate-swirl">
							<ellipse cx="90" cy={150 - (fillPercent * 0.75)} rx="40" ry="8" fill="rgba(255,255,255,0.1)" />
							<ellipse cx="70" cy={150 - (fillPercent * 0.5)} rx="30" ry="6" fill="rgba(255,255,255,0.08)" />
						</g>
					{/if}
				</g>

				<!-- Glass reflections -->
				<path
					d="M 62 5 L 68 5 L 25 145 L 18 145 Z"
					fill="rgba(255,255,255,0.15)"
				/>
				<path
					d="M 115 5 L 118 5 L 160 145 L 155 145 Z"
					fill="rgba(255,255,255,0.08)"
				/>
			</svg>

			<!-- Bubbles when receiving drops -->
			{#if isReceiving}
				<div class="absolute inset-0 overflow-hidden pointer-events-none">
					<div class="bubble bubble-1"></div>
					<div class="bubble bubble-2"></div>
					<div class="bubble bubble-3"></div>
					<div class="bubble bubble-4"></div>
					<div class="bubble bubble-5"></div>
				</div>
			{/if}

			<!-- Impact ripple when receiving -->
			{#if isReceiving}
				<div class="absolute top-4 left-1/2 -translate-x-1/2">
					<div class="w-4 h-4 rounded-full border-2 border-cyan-400/50 animate-ripple"></div>
				</div>
			{/if}
		</div>

		<!-- Flask base shadow -->
		<div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-gradient-radial from-black/30 to-transparent rounded-full blur-sm"></div>
	</div>

	<!-- pH Indicator display -->
	<div class="mt-5 glass rounded-xl p-3 border border-white/10 min-w-[140px]">
		<div class="flex items-center justify-between gap-4">
			<div class="flex items-center gap-2">
				<div
					class="w-5 h-5 rounded-full border-2 border-white/20 transition-all duration-300 shadow-lg"
					style="background: {color || '#666'}; box-shadow: 0 0 12px {color || 'transparent'};"
				></div>
				<div>
					<div class="text-[10px] text-gray-500 uppercase tracking-wider">pH Level</div>
					<div class="font-mono font-bold text-white text-lg leading-none">{formatNumber(pH, 2)}</div>
				</div>
			</div>

			<!-- pH status indicator -->
			<div class="text-right">
				<div class="text-[10px] text-gray-500 uppercase tracking-wider">Status</div>
				{#if pH < 6.5}
					<span class="text-rose-400 text-xs font-medium">Acidic</span>
				{:else if pH > 7.5}
					<span class="text-cyan-400 text-xs font-medium">Basic</span>
				{:else}
					<span class="text-emerald-400 text-xs font-medium">Neutral</span>
				{/if}
			</div>
		</div>
	</div>

	<!-- Volume display -->
	<div class="mt-2 text-xs text-gray-400 font-mono">
		Volume: {formatNumber(volume, 1)} mL
	</div>
</div>

<style>
	.bubble {
		position: absolute;
		background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.2));
		border-radius: 50%;
		animation: bubble-rise 1.5s ease-out infinite;
	}

	.bubble-1 { width: 6px; height: 6px; left: 30%; bottom: 20%; animation-delay: 0s; }
	.bubble-2 { width: 4px; height: 4px; left: 45%; bottom: 25%; animation-delay: 0.2s; }
	.bubble-3 { width: 5px; height: 5px; left: 55%; bottom: 15%; animation-delay: 0.4s; }
	.bubble-4 { width: 3px; height: 3px; left: 65%; bottom: 30%; animation-delay: 0.6s; }
	.bubble-5 { width: 4px; height: 4px; left: 40%; bottom: 10%; animation-delay: 0.8s; }

	@keyframes bubble-rise {
		0% {
			transform: translateY(0) scale(1);
			opacity: 0.8;
		}
		50% {
			opacity: 1;
		}
		100% {
			transform: translateY(-60px) scale(0.5);
			opacity: 0;
		}
	}

	@keyframes ripple {
		0% {
			transform: scale(0.5);
			opacity: 1;
		}
		100% {
			transform: scale(3);
			opacity: 0;
		}
	}

	.animate-ripple {
		animation: ripple 0.8s ease-out infinite;
	}

	@keyframes swirl {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.animate-swirl {
		animation: swirl 2s linear infinite;
		transform-origin: center;
	}

	.bg-gradient-radial {
		background: radial-gradient(circle, var(--tw-gradient-stops));
	}
</style>
