<script lang="ts">
	import type { GraphPoint, Measurement, OhmsLawState } from '$lib/simulations/physics/ohms-law';

	let {
		state,
		measurements
	}: {
		state: OhmsLawState;
		measurements: Measurement[];
	} = $props();

	// Graph dimensions
	const width = 320;
	const height = 200;
	const padding = { top: 20, right: 20, bottom: 40, left: 50 };
	const graphWidth = width - padding.left - padding.right;
	const graphHeight = height - padding.top - padding.bottom;

	// Calculate scales based on data
	let xMax = $derived(() => {
		if (state.experimentMode === 'vary-voltage') {
			return Math.max(12, ...measurements.map(m => m.voltage));
		} else {
			return Math.max(1000, ...measurements.map(m => m.resistance));
		}
	});

	let yMax = $derived(() => {
		return Math.max(100, ...measurements.map(m => m.current)) * 1.2;
	});

	// Convert data to SVG coordinates
	function toSvgX(value: number): number {
		return padding.left + (value / xMax()) * graphWidth;
	}

	function toSvgY(value: number): number {
		return padding.top + graphHeight - (value / yMax()) * graphHeight;
	}

	// Generate path for trend line
	let trendLinePath = $derived(() => {
		if (measurements.length < 2) return '';

		// Sort by x value
		const sorted = [...measurements].sort((a, b) => {
			const xA = state.experimentMode === 'vary-voltage' ? a.voltage : a.resistance;
			const xB = state.experimentMode === 'vary-voltage' ? b.voltage : b.resistance;
			return xA - xB;
		});

		return sorted
			.map((m, i) => {
				const x = state.experimentMode === 'vary-voltage' ? m.voltage : m.resistance;
				const y = m.current;
				return `${i === 0 ? 'M' : 'L'} ${toSvgX(x)} ${toSvgY(y)}`;
			})
			.join(' ');
	});

	// Generate grid lines
	let xGridLines = $derived(() => {
		const lines = [];
		const step = state.experimentMode === 'vary-voltage' ? 2 : 200;
		for (let i = 0; i <= xMax(); i += step) {
			lines.push(i);
		}
		return lines;
	});

	let yGridLines = $derived(() => {
		const lines = [];
		const step = Math.ceil(yMax() / 5 / 10) * 10;
		for (let i = 0; i <= yMax(); i += step) {
			lines.push(i);
		}
		return lines;
	});

	// Calculate R² if we have enough points
	let rSquared = $derived(() => {
		if (measurements.length < 3) return null;

		const n = measurements.length;
		const xValues = measurements.map(m => state.experimentMode === 'vary-voltage' ? m.voltage : m.resistance);
		const yValues = measurements.map(m => m.current);

		const sumX = xValues.reduce((a, b) => a + b, 0);
		const sumY = yValues.reduce((a, b) => a + b, 0);
		const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
		const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

		const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
		const intercept = (sumY - slope * sumX) / n;

		const meanY = sumY / n;
		const ssTotal = yValues.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
		const ssResidual = yValues.reduce((sum, y, i) => sum + Math.pow(y - (slope * xValues[i] + intercept), 2), 0);

		return 1 - ssResidual / ssTotal;
	});
</script>

<div class="glass-strong rounded-xl p-4 border border-white/10">
	<div class="flex items-center justify-between mb-3">
		<div class="flex items-center gap-3">
			<div class="w-1.5 h-5 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full"></div>
			<h4 class="text-sm font-display font-semibold text-white">
				{state.experimentMode === 'vary-voltage' ? 'V-I Characteristic' : 'R-I Relationship'}
			</h4>
		</div>

		{#if rSquared !== null}
			<div class="text-xs px-2 py-1 rounded-lg {rSquared() > 0.95 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}">
				R² = {rSquared()?.toFixed(4)}
			</div>
		{/if}
	</div>

	<svg {width} {height} class="w-full" viewBox="0 0 {width} {height}">
		<!-- Background -->
		<rect x={padding.left} y={padding.top} width={graphWidth} height={graphHeight} class="fill-gray-900/50" />

		<!-- Grid lines -->
		<g class="stroke-gray-700" stroke-width="0.5">
			{#each xGridLines() as x}
				<line
					x1={toSvgX(x)}
					y1={padding.top}
					x2={toSvgX(x)}
					y2={padding.top + graphHeight}
				/>
			{/each}
			{#each yGridLines() as y}
				<line
					x1={padding.left}
					y1={toSvgY(y)}
					x2={padding.left + graphWidth}
					y2={toSvgY(y)}
				/>
			{/each}
		</g>

		<!-- Axes -->
		<g class="stroke-gray-500" stroke-width="2">
			<line x1={padding.left} y1={padding.top + graphHeight} x2={padding.left + graphWidth} y2={padding.top + graphHeight} />
			<line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + graphHeight} />
		</g>

		<!-- Axis labels -->
		<text
			x={padding.left + graphWidth / 2}
			y={height - 5}
			text-anchor="middle"
			class="fill-gray-400 text-[10px]"
		>
			{state.experimentMode === 'vary-voltage' ? 'Voltage (V)' : 'Resistance (Ω)'}
		</text>
		<text
			x={15}
			y={padding.top + graphHeight / 2}
			text-anchor="middle"
			transform="rotate(-90, 15, {padding.top + graphHeight / 2})"
			class="fill-gray-400 text-[10px]"
		>
			Current (mA)
		</text>

		<!-- X-axis ticks -->
		{#each xGridLines() as x}
			<text
				x={toSvgX(x)}
				y={padding.top + graphHeight + 15}
				text-anchor="middle"
				class="fill-gray-500 text-[8px]"
			>
				{x}
			</text>
		{/each}

		<!-- Y-axis ticks -->
		{#each yGridLines() as y}
			<text
				x={padding.left - 8}
				y={toSvgY(y) + 3}
				text-anchor="end"
				class="fill-gray-500 text-[8px]"
			>
				{y}
			</text>
		{/each}

		<!-- Trend line -->
		{#if trendLinePath()}
			<path
				d={trendLinePath()}
				fill="none"
				class="stroke-cyan-500"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		{/if}

		<!-- Data points -->
		{#each measurements as m, i (m.id)}
			{@const x = state.experimentMode === 'vary-voltage' ? m.voltage : m.resistance}
			{@const y = m.current}
			<g transform="translate({toSvgX(x)}, {toSvgY(y)})">
				<circle
					r="6"
					class="fill-emerald-500 stroke-emerald-400"
					stroke-width="2"
				/>
				<text
					y="-10"
					text-anchor="middle"
					class="fill-gray-400 text-[8px]"
				>
					{i + 1}
				</text>
			</g>
		{/each}

		<!-- No data message -->
		{#if measurements.length === 0}
			<text
				x={padding.left + graphWidth / 2}
				y={padding.top + graphHeight / 2}
				text-anchor="middle"
				class="fill-gray-500 text-[12px]"
			>
				No data points recorded
			</text>
		{/if}
	</svg>

	<!-- Data table -->
	{#if measurements.length > 0}
		<div class="mt-4 pt-4 border-t border-white/10">
			<div class="text-xs text-gray-500 mb-2">Recorded Measurements</div>
			<div class="max-h-32 overflow-y-auto">
				<table class="w-full text-xs">
					<thead>
						<tr class="text-gray-500">
							<th class="text-left py-1">#</th>
							<th class="text-right py-1">V (V)</th>
							<th class="text-right py-1">I (mA)</th>
							<th class="text-right py-1">R (Ω)</th>
						</tr>
					</thead>
					<tbody>
						{#each measurements as m, i (m.id)}
							<tr class="text-gray-300 border-t border-white/5">
								<td class="py-1">{i + 1}</td>
								<td class="text-right font-mono text-amber-400">{m.voltage.toFixed(2)}</td>
								<td class="text-right font-mono text-cyan-400">{m.current.toFixed(2)}</td>
								<td class="text-right font-mono text-emerald-400">{m.resistance}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}

	<!-- Ohm's Law equation reminder -->
	<div class="mt-4 pt-4 border-t border-white/10 text-center">
		<div class="inline-flex items-center gap-3 px-4 py-2 rounded-xl glass border border-white/10">
			<span class="text-gray-400">Ohm's Law:</span>
			<span class="font-mono text-lg">
				<span class="text-amber-400">V</span>
				<span class="text-gray-500">=</span>
				<span class="text-cyan-400">I</span>
				<span class="text-gray-500">×</span>
				<span class="text-emerald-400">R</span>
			</span>
		</div>
	</div>
</div>
