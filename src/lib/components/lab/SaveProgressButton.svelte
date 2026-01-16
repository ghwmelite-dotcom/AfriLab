<script lang="ts">
	import { labProgressStore } from '$stores/labProgress';

	interface Props {
		labId: string;
		labTitle: string;
		discipline: string;
		currentStep: number;
		totalSteps: number;
		simulationState: unknown;
		measurements?: Array<{ type: string; value: number; unit: string; label: string }>;
		notes?: string[];
	}

	let {
		labId,
		labTitle,
		discipline,
		currentStep,
		totalSteps,
		simulationState,
		measurements = [],
		notes = []
	}: Props = $props();

	let isSaving = $state(false);
	let showSaved = $state(false);

	async function handleSave() {
		isSaving = true;
		labProgressStore.saveProgress(
			labId,
			labTitle,
			discipline,
			currentStep,
			totalSteps,
			simulationState,
			measurements,
			notes
		);
		isSaving = false;
		showSaved = true;
		setTimeout(() => (showSaved = false), 2000);
	}
</script>

<button
	onclick={handleSave}
	disabled={isSaving}
	class="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 hover:border-emerald-500/30 transition-all text-sm font-medium {showSaved
		? 'text-emerald-400 border-emerald-500/30'
		: 'text-gray-300 hover:text-white'}"
	aria-label="Save progress"
>
	{#if isSaving}
		<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
			></circle>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
		<span>Saving...</span>
	{:else if showSaved}
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
		</svg>
		<span>Saved!</span>
	{:else}
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
			/>
		</svg>
		<span>Save Progress</span>
	{/if}
</button>
