<script lang="ts">
	interface Props {
		sampleColor: string;
		isInserted: boolean;
		isReceivingLight: boolean;
		transmittedIntensity: number;
	}

	let { sampleColor, isInserted, isReceivingLight, transmittedIntensity }: Props = $props();
</script>

<div class="relative">
	<!-- Cuvette container -->
	<div class="relative w-20 h-48">
		<!-- Light beam (incident) -->
		{#if isReceivingLight && isInserted}
			<div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-16 h-4">
				<div class="w-full h-full bg-gradient-to-r from-yellow-300/60 to-yellow-400/90 rounded-l-full animate-pulse"></div>
				<div class="absolute inset-0 bg-gradient-to-r from-yellow-300/30 to-yellow-400/60 blur-md"></div>
			</div>
		{/if}

		<!-- Cuvette outer (quartz) -->
		<div class="absolute inset-x-0 top-4 bottom-0 border-2 border-cyan-400/40 rounded-sm bg-white/5 backdrop-blur-sm">
			<!-- Quartz shimmer effect -->
			<div class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none"></div>

			<!-- Sample liquid -->
			{#if isInserted}
				<div
					class="absolute inset-x-1 bottom-1 top-8 rounded-sm transition-all duration-500"
					style="background-color: {sampleColor};"
				>
					<!-- Liquid surface reflection -->
					<div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-b from-white/30 to-transparent"></div>

					<!-- Light passing through (beam effect) -->
					{#if isReceivingLight}
						<div
							class="absolute inset-y-0 left-0 right-0 flex items-center justify-center overflow-hidden"
						>
							<div
								class="w-8 h-4 rounded-full transition-opacity duration-300"
								style="
									background: radial-gradient(ellipse, rgba(255,255,200,{transmittedIntensity / 100 * 0.8}) 0%, transparent 70%);
									opacity: {transmittedIntensity / 100};
								"
							></div>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Cuvette walls (sides) -->
			<div class="absolute left-0 inset-y-0 w-0.5 bg-gradient-to-b from-cyan-400/60 to-cyan-400/30"></div>
			<div class="absolute right-0 inset-y-0 w-0.5 bg-gradient-to-b from-cyan-400/60 to-cyan-400/30"></div>
		</div>

		<!-- Cuvette top cap -->
		<div class="absolute inset-x-0 top-0 h-6 bg-gray-800 rounded-t border-2 border-gray-700">
			<div class="absolute inset-x-2 top-1 bottom-1 bg-gray-700/50 rounded"></div>
		</div>

		<!-- Light beam (transmitted) -->
		{#if isReceivingLight && isInserted}
			<div class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-16 h-4">
				<div
					class="w-full h-full rounded-r-full transition-opacity duration-300"
					style="
						background: linear-gradient(to right, rgba(255,255,200,{transmittedIntensity / 100 * 0.9}), rgba(255,255,200,{transmittedIntensity / 100 * 0.3}));
						opacity: {transmittedIntensity / 100};
					"
				></div>
				<div
					class="absolute inset-0 blur-md transition-opacity duration-300"
					style="
						background: linear-gradient(to right, rgba(255,255,200,{transmittedIntensity / 100 * 0.6}), transparent);
						opacity: {transmittedIntensity / 100};
					"
				></div>
			</div>
		{/if}
	</div>

	<!-- Label -->
	<div class="mt-4 text-center">
		<p class="text-xs text-gray-400 uppercase tracking-wider">Cuvette</p>
		<p class="text-sm text-gray-300 mt-1">
			{#if !isInserted}
				Empty
			{:else}
				Sample Loaded
			{/if}
		</p>
	</div>
</div>
