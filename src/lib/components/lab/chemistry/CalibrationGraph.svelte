<script lang="ts">
	import {
		type CalibrationPoint,
		calculateCalibrationRegression
	} from '$lib/simulations/chemistry/spectroscopy';

	interface Props {
		points: CalibrationPoint[];
		maxConcentration: number;
		maxAbsorbance?: number;
	}

	let { points, maxConcentration, maxAbsorbance = 2 }: Props = $props();

	// Graph dimensions
	const width = 300;
	const height = 200;
	const padding = { top: 20, right: 20, bottom: 40, left: 50 };
	const graphWidth = width - padding.left - padding.right;
	const graphHeight = height - padding.top - padding.bottom;

	// Scale functions
	function scaleX(concentration: number): number {
		return padding.left + (concentration / maxConcentration) * graphWidth;
	}

	function scaleY(absorbance: number): number {
		return height - padding.bottom - (absorbance / maxAbsorbance) * graphHeight;
	}

	// Calculate regression line
	$: regression = calculateCalibrationRegression(points);
	$: lineStart = { x: 0, y: regression.intercept };
	$: lineEnd = {
		x: maxConcentration,
		y: regression.slope * maxConcentration + regression.intercept
	};

	// Generate axis ticks
	const xTicks = [0, maxConcentration / 4, maxConcentration / 2, (3 * maxConcentration) / 4, maxConcentration];
	const yTicks = [0, maxAbsorbance / 4, maxAbsorbance / 2, (3 * maxAbsorbance) / 4, maxAbsorbance];
</script>

<div class="glass rounded-2xl p-5 border border-white/5">
	<div class="flex items-center justify-between mb-4">
		<div class="flex items-center gap-3">
			<div class="w-1.5 h-5 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full"></div>
			<h3 class="font-display font-semibold text-white">Calibration Curve</h3>
		</div>
		{#if points.length >= 2}
			<div class="text-right">
				<span class="text-xs text-gray-400">R² = </span>
				<span class="font-mono font-bold {regression.rSquared >= 0.99 ? 'text-emerald-400' : regression.rSquared >= 0.95 ? 'text-cyan-400' : 'text-amber-400'}">
					{regression.rSquared.toFixed(4)}
				</span>
			</div>
		{/if}
	</div>

	<!-- SVG Graph -->
	<svg {width} {height} class="w-full" viewBox="0 0 {width} {height}">
		<!-- Grid lines -->
		<g class="text-gray-700">
			{#each yTicks as tick}
				<line
					x1={padding.left}
					y1={scaleY(tick)}
					x2={width - padding.right}
					y2={scaleY(tick)}
					stroke="currentColor"
					stroke-dasharray="4 4"
					opacity="0.3"
				/>
			{/each}
			{#each xTicks as tick}
				<line
					x1={scaleX(tick)}
					y1={padding.top}
					x2={scaleX(tick)}
					y2={height - padding.bottom}
					stroke="currentColor"
					stroke-dasharray="4 4"
					opacity="0.3"
				/>
			{/each}
		</g>

		<!-- Axes -->
		<g class="text-gray-400">
			<!-- X axis -->
			<line
				x1={padding.left}
				y1={height - padding.bottom}
				x2={width - padding.right}
				y2={height - padding.bottom}
				stroke="currentColor"
				stroke-width="1"
			/>
			<!-- Y axis -->
			<line
				x1={padding.left}
				y1={padding.top}
				x2={padding.left}
				y2={height - padding.bottom}
				stroke="currentColor"
				stroke-width="1"
			/>
		</g>

		<!-- Axis labels -->
		<g class="text-gray-500 text-xs">
			<!-- X axis ticks and labels -->
			{#each xTicks as tick}
				<text
					x={scaleX(tick)}
					y={height - padding.bottom + 15}
					text-anchor="middle"
					fill="currentColor"
					font-size="10"
				>
					{(tick * 1000).toFixed(0)}
				</text>
			{/each}
			<!-- Y axis ticks and labels -->
			{#each yTicks as tick}
				<text
					x={padding.left - 10}
					y={scaleY(tick) + 4}
					text-anchor="end"
					fill="currentColor"
					font-size="10"
				>
					{tick.toFixed(1)}
				</text>
			{/each}

			<!-- Axis titles -->
			<text
				x={width / 2}
				y={height - 5}
				text-anchor="middle"
				fill="currentColor"
				font-size="11"
			>
				Concentration (mM)
			</text>
			<text
				x={15}
				y={height / 2}
				text-anchor="middle"
				fill="currentColor"
				font-size="11"
				transform="rotate(-90, 15, {height / 2})"
			>
				Absorbance
			</text>
		</g>

		<!-- Regression line (if we have enough points) -->
		{#if points.length >= 2}
			<line
				x1={scaleX(lineStart.x)}
				y1={scaleY(Math.max(0, lineStart.y))}
				x2={scaleX(lineEnd.x)}
				y2={scaleY(Math.min(maxAbsorbance, lineEnd.y))}
				stroke="url(#lineGradient)"
				stroke-width="2"
				stroke-dasharray="6 3"
			/>

			<!-- Gradient definition -->
			<defs>
				<linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
					<stop offset="0%" style="stop-color: rgb(16, 185, 129); stop-opacity: 0.8" />
					<stop offset="100%" style="stop-color: rgb(6, 182, 212); stop-opacity: 0.8" />
				</linearGradient>
			</defs>
		{/if}

		<!-- Data points -->
		{#each points as point, i}
			<g>
				<!-- Point glow -->
				<circle
					cx={scaleX(point.concentration)}
					cy={scaleY(point.absorbance)}
					r="8"
					fill="rgb(16, 185, 129)"
					opacity="0.2"
				/>
				<!-- Point -->
				<circle
					cx={scaleX(point.concentration)}
					cy={scaleY(point.absorbance)}
					r="5"
					fill="rgb(16, 185, 129)"
					stroke="white"
					stroke-width="2"
					class="transition-all hover:r-6"
				/>
			</g>
		{/each}
	</svg>

	<!-- Stats below graph -->
	{#if points.length >= 2}
		<div class="mt-4 grid grid-cols-2 gap-3">
			<div class="glass rounded-lg p-3 border border-white/5">
				<p class="text-xs text-gray-500 mb-1">Slope (ε × l)</p>
				<p class="font-mono font-bold text-white">{regression.slope.toFixed(4)}</p>
			</div>
			<div class="glass rounded-lg p-3 border border-white/5">
				<p class="text-xs text-gray-500 mb-1">Intercept</p>
				<p class="font-mono font-bold text-white">{regression.intercept.toFixed(4)}</p>
			</div>
		</div>
	{:else}
		<div class="mt-4 text-center text-gray-500 text-sm">
			<p>Add at least 2 data points to see the calibration curve</p>
		</div>
	{/if}

	<!-- Points list -->
	{#if points.length > 0}
		<div class="mt-4">
			<p class="text-xs text-gray-500 mb-2">Data Points ({points.length})</p>
			<div class="max-h-24 overflow-y-auto space-y-1">
				{#each points as point, i}
					<div class="flex items-center justify-between text-xs glass rounded px-2 py-1 border border-white/5">
						<span class="text-gray-400">#{i + 1}</span>
						<span class="text-white">{(point.concentration * 1000).toFixed(2)} mM</span>
						<span class="text-emerald-400">A = {point.absorbance.toFixed(3)}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
