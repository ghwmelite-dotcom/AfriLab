<script lang="ts">
	import {
		RECIPES,
		PPE_ITEMS,
		getIngredient,
		getRecipe,
		type CompoundingState
	} from '$lib/simulations/pharmacy/compounding';

	let {
		labState,
		onSelectRecipe,
		onToggleBalance,
		onTareBalance,
		onAddToBalance,
		onConfirmWeight,
		onAddToMortar,
		onWearPPE,
		onRemovePPE,
		onAddObservation
	}: {
		labState: CompoundingState;
		onSelectRecipe: (recipeId: string) => void;
		onToggleBalance: () => void;
		onTareBalance: () => void;
		onAddToBalance: (ingredientId: string, amount: number) => void;
		onConfirmWeight: (ingredientId: string) => void;
		onAddToMortar: (ingredientId: string) => void;
		onWearPPE: (ppeId: string) => void;
		onRemovePPE: (ppeId: string) => void;
		onAddObservation: (observation: string) => void;
	} = $props();

	let activeTab = $state<'recipe' | 'weigh' | 'ppe'>('recipe');
	let selectedIngredientId = $state<string | null>(null);
	let observationText = $state('');

	let currentRecipe = $derived(labState.currentRecipeId ? getRecipe(labState.currentRecipeId) : null);

	function getWeightIncrement(unit: string): number {
		if (unit === 'mg') return 10; // 10mg increments
		return 0.1; // 0.1g increments
	}

	function isPPEWorn(ppeId: string): boolean {
		return labState.ppeWorn.some((p) => p.id === ppeId);
	}

	function handleAddObservation() {
		if (observationText.trim()) {
			onAddObservation(observationText.trim());
			observationText = '';
		}
	}
</script>

<div class="space-y-4">
	<!-- Tab navigation -->
	<div class="glass rounded-xl p-1 border border-white/10 flex">
		{#each [
			{ id: 'recipe', label: 'Recipe' },
			{ id: 'weigh', label: 'Weighing' },
			{ id: 'ppe', label: 'Safety' }
		] as tab (tab.id)}
			<button
				onclick={() => (activeTab = tab.id as typeof activeTab)}
				class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
					{activeTab === tab.id
					? 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-white'
					: 'text-gray-400 hover:text-white'}"
			>
				{tab.label}
			</button>
		{/each}
	</div>

	<!-- Tab content -->
	{#if activeTab === 'recipe'}
		<!-- Recipe Selection -->
		<div class="glass-strong rounded-xl p-4 border border-white/10">
			<div class="flex items-center gap-3 mb-3">
				<div class="w-1.5 h-5 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full"></div>
				<h4 class="text-sm font-display font-semibold text-white">Select Formula</h4>
			</div>

			<div class="space-y-2">
				{#each RECIPES as recipe (recipe.id)}
					<button
						onclick={() => onSelectRecipe(recipe.id)}
						class="w-full p-3 rounded-xl text-left transition-all
							{labState.currentRecipeId === recipe.id
							? 'bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-500/30'
							: 'glass border border-white/5 hover:border-white/20'}"
					>
						<div class="flex items-center justify-between">
							<span class="font-medium text-white text-sm">{recipe.name}</span>
							<span
								class="text-xs px-2 py-0.5 rounded-full border capitalize
								{recipe.difficulty === 'beginner'
									? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
									: recipe.difficulty === 'intermediate'
										? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
										: 'bg-rose-500/20 text-rose-400 border-rose-500/30'}"
							>
								{recipe.difficulty}
							</span>
						</div>
						<p class="text-xs text-gray-400 mt-1">{recipe.description}</p>
						<div class="flex items-center gap-2 mt-2 text-xs text-gray-500">
							<span>{recipe.dosageForm}</span>
							<span>•</span>
							<span>{recipe.finalAmount} {recipe.finalUnit}</span>
						</div>
					</button>
				{/each}
			</div>
		</div>

		<!-- Recipe details if selected -->
		{#if currentRecipe}
			<div class="glass-strong rounded-xl p-4 border border-white/10">
				<h4 class="text-sm font-display font-semibold text-white mb-3">Formula Ingredients</h4>

				<div class="space-y-2">
					{#each currentRecipe.ingredients as ri, i (ri.ingredientId)}
						{@const ing = getIngredient(ri.ingredientId)}
						{@const selected = labState.selectedIngredients.find((s) => s.ingredientId === ri.ingredientId)}
						<div class="flex items-center justify-between p-2 rounded-lg glass border border-white/5">
							<div class="flex items-center gap-2">
								<span class="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-400">
									{i + 1}
								</span>
								<span class="text-sm text-gray-300">{ing?.name.split('(')[0]}</span>
							</div>
							<div class="flex items-center gap-2">
								<span class="text-xs font-mono text-rose-400">
									{ri.amount} {ri.unit}
								</span>
								{#if selected?.isWeighed}
									<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{:else if activeTab === 'weigh'}
		<!-- Weighing Controls -->
		<div class="glass-strong rounded-xl p-4 border border-white/10">
			<div class="flex items-center gap-3 mb-3">
				<div class="w-1.5 h-5 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
				<h4 class="text-sm font-display font-semibold text-white">Analytical Balance</h4>
			</div>

			<!-- Balance controls -->
			<div class="flex gap-2 mb-4">
				<button
					onclick={onToggleBalance}
					class="flex-1 py-2 rounded-lg font-medium transition-all
						{labState.isBalanceOn
						? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
						: 'glass border border-white/10 text-gray-400'}"
				>
					{labState.isBalanceOn ? 'Power ON' : 'Power OFF'}
				</button>
				<button
					onclick={onTareBalance}
					disabled={!labState.isBalanceOn}
					class="flex-1 py-2 rounded-lg font-medium transition-all
						{labState.isBalanceOn
						? 'glass border border-white/10 text-cyan-400 hover:border-cyan-500/30'
						: 'glass border border-white/10 text-gray-500 cursor-not-allowed'}"
				>
					Tare
				</button>
			</div>

			<!-- Ingredient selector -->
			{#if currentRecipe}
				<div class="space-y-2 mb-4">
					<span class="text-xs text-gray-500">Select ingredient to weigh:</span>
					<div class="grid grid-cols-2 gap-2">
						{#each labState.selectedIngredients as si (si.ingredientId)}
							{@const ing = getIngredient(si.ingredientId)}
							<button
								onclick={() => (selectedIngredientId = si.ingredientId)}
								disabled={si.isWeighed}
								class="p-2 rounded-lg text-xs transition-all text-left
									{selectedIngredientId === si.ingredientId
									? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
									: si.isWeighed
										? 'glass border border-emerald-500/20 text-emerald-400/50 cursor-not-allowed'
										: 'glass border border-white/10 text-gray-400 hover:border-white/20'}"
							>
								<div class="truncate">{ing?.name.split('(')[0]}</div>
								<div class="font-mono text-[10px] mt-0.5">
									{si.targetAmount} {si.unit}
									{#if si.isWeighed}
										<span class="text-emerald-400 ml-1">✓</span>
									{/if}
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Weighing actions -->
			{#if selectedIngredientId && labState.isBalanceOn}
				{@const selected = labState.selectedIngredients.find((s) => s.ingredientId === selectedIngredientId)}
				{@const ing = getIngredient(selectedIngredientId)}
				{#if selected && !selected.isWeighed}
					<div class="space-y-3 p-3 rounded-xl glass border border-amber-500/20">
						<div class="flex items-center justify-between">
							<span class="text-sm text-gray-400">Adding: {ing?.name.split('(')[0]}</span>
							<span class="text-xs font-mono text-amber-400">
								Target: {selected.targetAmount} {selected.unit}
							</span>
						</div>

						<!-- Add powder buttons -->
						<div class="flex gap-2">
							<button
								onclick={() => onAddToBalance(selectedIngredientId!, getWeightIncrement(selected.unit) * 0.1)}
								class="flex-1 py-2 rounded-lg glass border border-white/10 text-gray-400 text-xs hover:border-amber-500/30 hover:text-amber-400 transition-all"
							>
								+{(getWeightIncrement(selected.unit) * 0.1).toFixed(selected.unit === 'mg' ? 0 : 2)} {selected.unit}
							</button>
							<button
								onclick={() => onAddToBalance(selectedIngredientId!, getWeightIncrement(selected.unit))}
								class="flex-1 py-2 rounded-lg glass border border-white/10 text-gray-400 text-xs hover:border-amber-500/30 hover:text-amber-400 transition-all"
							>
								+{getWeightIncrement(selected.unit)} {selected.unit}
							</button>
							<button
								onclick={() => onAddToBalance(selectedIngredientId!, getWeightIncrement(selected.unit) * 10)}
								class="flex-1 py-2 rounded-lg glass border border-white/10 text-gray-400 text-xs hover:border-amber-500/30 hover:text-amber-400 transition-all"
							>
								+{getWeightIncrement(selected.unit) * 10} {selected.unit}
							</button>
						</div>

						<!-- Current vs target -->
						<div class="text-center">
							<div class="text-2xl font-mono">
								<span class="{Math.abs(selected.actualAmount - selected.targetAmount) < selected.targetAmount * 0.05 ? 'text-emerald-400' : 'text-amber-400'}">
									{selected.actualAmount.toFixed(selected.unit === 'mg' ? 0 : 2)}
								</span>
								<span class="text-gray-600">/</span>
								<span class="text-gray-400">{selected.targetAmount}</span>
								<span class="text-xs text-gray-500 ml-1">{selected.unit}</span>
							</div>
						</div>

						<!-- Confirm weight button -->
						<button
							onclick={() => {
								onConfirmWeight(selectedIngredientId!);
								selectedIngredientId = null;
							}}
							class="w-full py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all"
						>
							Confirm Weight
						</button>
					</div>
				{/if}
			{/if}
		</div>

		<!-- Add to mortar -->
		{#if labState.selectedIngredients.some((s) => s.isWeighed && !labState.mortarContents.some((m) => m.ingredientId === s.ingredientId))}
			<div class="glass-strong rounded-xl p-4 border border-white/10">
				<h4 class="text-sm font-display font-semibold text-white mb-3">Add to Mortar</h4>
				<div class="space-y-2">
					{#each labState.selectedIngredients.filter((s) => s.isWeighed && !labState.mortarContents.some((m) => m.ingredientId === s.ingredientId)) as si (si.ingredientId)}
						{@const ing = getIngredient(si.ingredientId)}
						<button
							onclick={() => onAddToMortar(si.ingredientId)}
							class="w-full p-2 rounded-lg glass border border-white/10 hover:border-rose-500/30 text-gray-400 hover:text-rose-400 transition-all flex items-center justify-between"
						>
							<span class="text-sm">{ing?.name.split('(')[0]}</span>
							<span class="text-xs font-mono">{si.actualAmount.toFixed(2)} {si.unit}</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	{:else if activeTab === 'ppe'}
		<!-- PPE Management -->
		<div class="glass-strong rounded-xl p-4 border border-white/10">
			<div class="flex items-center gap-3 mb-3">
				<div class="w-1.5 h-5 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full"></div>
				<h4 class="text-sm font-display font-semibold text-white">Personal Protective Equipment</h4>
			</div>

			<div class="grid grid-cols-2 gap-2">
				{#each PPE_ITEMS as ppe (ppe.id)}
					{@const isWorn = isPPEWorn(ppe.id)}
					<button
						onclick={() => isWorn ? onRemovePPE(ppe.id) : onWearPPE(ppe.id)}
						class="p-3 rounded-xl transition-all flex flex-col items-center gap-2
							{isWorn
							? 'bg-emerald-500/20 border border-emerald-500/30'
							: 'glass border border-white/10 hover:border-white/20'}"
					>
						<span class="text-2xl">{ppe.icon}</span>
						<span class="text-xs {isWorn ? 'text-emerald-400' : 'text-gray-400'}">{ppe.name}</span>
						{#if isWorn}
							<span class="text-[10px] text-emerald-400">Worn</span>
						{/if}
					</button>
				{/each}
			</div>

			<!-- PPE warning if not wearing required items -->
			{#if labState.ppeWorn.length < 2}
				<div class="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
					<div class="flex items-center gap-2 text-amber-400 text-xs">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
						<span>Always wear gloves and gown before compounding</span>
					</div>
				</div>
			{/if}
		</div>

		<!-- Observations -->
		<div class="glass-strong rounded-xl p-4 border border-white/10">
			<h4 class="text-sm font-display font-semibold text-white mb-3">Lab Observations</h4>

			<div class="flex gap-2 mb-3">
				<input
					type="text"
					bind:value={observationText}
					placeholder="Record observation..."
					class="flex-1 px-3 py-2 rounded-lg glass border border-white/10 text-sm text-white
						placeholder:text-gray-500 focus:outline-none focus:border-rose-500/50"
					onkeydown={(e) => e.key === 'Enter' && handleAddObservation()}
				/>
				<button
					onclick={handleAddObservation}
					disabled={!observationText.trim()}
					class="px-3 py-2 rounded-lg bg-rose-500 text-white text-sm font-medium
						hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					Add
				</button>
			</div>

			{#if labState.observations.length > 0}
				<div class="space-y-1.5 max-h-32 overflow-y-auto">
					{#each labState.observations as obs, i}
						<div class="text-xs text-gray-400 flex items-start gap-2">
							<span class="text-rose-400 flex-shrink-0">{i + 1}.</span>
							<span>{obs}</span>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-xs text-gray-500 text-center py-2">No observations recorded</p>
			{/if}
		</div>
	{/if}

	<!-- Errors display -->
	{#if labState.errors.length > 0}
		<div class="glass-strong rounded-xl p-4 border border-rose-500/30">
			<h4 class="text-sm font-semibold text-rose-400 mb-2">Compounding Alerts</h4>
			<div class="space-y-1.5">
				{#each labState.errors.slice(-3) as error (error.id)}
					<div class="flex items-start gap-2 text-xs">
						<span class="{error.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'}">
							{error.severity === 'critical' ? '⚠️' : '⚡'}
						</span>
						<span class="text-gray-400">{error.message}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
