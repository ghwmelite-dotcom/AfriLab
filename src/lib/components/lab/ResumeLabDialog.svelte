<script lang="ts">
	import { labProgressStore, type SavedLabProgress } from '$stores/labProgress';

	interface Props {
		labId: string;
		onResume: (savedProgress: SavedLabProgress) => void;
		onStartFresh: () => void;
	}

	let { labId, onResume, onStartFresh }: Props = $props();

	let savedProgress = $state<SavedLabProgress | null>(null);
	let showDialog = $state(false);

	$effect(() => {
		const progress = labProgressStore.loadProgress(labId);
		if (progress) {
			savedProgress = progress;
			showDialog = true;
		}
	});

	function handleResume() {
		if (savedProgress) {
			onResume(savedProgress);
		}
		showDialog = false;
	}

	function handleStartFresh() {
		labProgressStore.deleteProgress(labId);
		onStartFresh();
		showDialog = false;
	}

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
		if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
		if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
		return date.toLocaleDateString();
	}
</script>

{#if showDialog && savedProgress}
	<!-- Backdrop -->
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<div
			class="absolute inset-0 bg-black/60 backdrop-blur-sm"
			onclick={handleStartFresh}
			onkeydown={(e) => e.key === 'Escape' && handleStartFresh()}
			role="button"
			tabindex="0"
			aria-label="Close dialog"
		></div>

		<!-- Dialog -->
		<div
			class="relative glass-strong rounded-2xl border border-white/10 p-6 max-w-md w-full animate-scale-in"
		>
			<!-- Header -->
			<div class="flex items-center gap-3 mb-4">
				<div
					class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center"
				>
					<svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<div>
					<h3 class="text-lg font-display font-semibold text-white">Continue Previous Session?</h3>
					<p class="text-sm text-gray-400">You have saved progress for this lab</p>
				</div>
			</div>

			<!-- Progress Info -->
			<div class="glass rounded-xl p-4 border border-white/5 mb-6">
				<div class="flex justify-between items-center mb-3">
					<span class="text-sm text-gray-400">Progress</span>
					<span class="text-sm font-medium text-white"
						>Step {savedProgress.currentStep + 1} of {savedProgress.totalSteps}</span
					>
				</div>

				<!-- Progress bar -->
				<div class="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
					<div
						class="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all rounded-full"
						style="width: {savedProgress.percentComplete}%"
					></div>
				</div>

				<div class="flex justify-between items-center text-xs">
					<span class="text-gray-500">
						Saved {formatDate(savedProgress.savedAt)}
					</span>
					<span class="text-amber-400 font-medium">{savedProgress.percentComplete}% complete</span>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex gap-3">
				<button onclick={handleStartFresh} class="btn-secondary flex-1"> Start Fresh </button>
				<button onclick={handleResume} class="btn-primary flex-1">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					Resume
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes scale-in {
		from {
			transform: scale(0.95);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	.animate-scale-in {
		animation: scale-in 0.2s ease-out;
	}
</style>
