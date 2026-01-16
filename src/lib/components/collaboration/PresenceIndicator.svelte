<script lang="ts">
	import { collaborationStore, type Participant } from '$lib/stores/collaboration';

	let participants = $derived(collaborationStore.participants);
	let isConnected = $derived(collaborationStore.isConnected);

	function getInitials(name: string): string {
		return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
	}

	function formatLastSeen(timestamp: string): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		return `${Math.floor(diffMins / 60)}h ago`;
	}
</script>

{#if participants.length > 0 && isConnected}
	<div class="flex items-center gap-2">
		<!-- Participant avatars -->
		<div class="flex -space-x-2">
			{#each participants.slice(0, 4) as participant, i (participant.id)}
				<div
					class="relative group"
					style="z-index: {participants.length - i}"
				>
					<div
						class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white border-2 border-gray-900 transition-transform hover:scale-110 hover:z-50"
						style="background-color: {participant.color}"
						title={participant.name}
					>
						{getInitials(participant.name)}
					</div>

					<!-- Active indicator -->
					{#if participant.isActive}
						<span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-gray-900 rounded-full"></span>
					{/if}

					<!-- Tooltip -->
					<div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg glass text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
						<span class="font-medium">{participant.name}</span>
						{#if participant.role === 'owner'}
							<span class="text-amber-400 ml-1">(Host)</span>
						{/if}
						<div class="text-gray-400 text-[10px]">
							{participant.isActive ? 'Active now' : formatLastSeen(participant.lastSeen)}
						</div>
					</div>
				</div>
			{/each}

			{#if participants.length > 4}
				<div class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-300 border-2 border-gray-900">
					+{participants.length - 4}
				</div>
			{/if}
		</div>

		<!-- Connection status -->
		<div class="flex items-center gap-1.5 px-2 py-1 rounded-lg glass border border-emerald-500/30">
			<span class="relative flex h-2 w-2">
				<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
				<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
			</span>
			<span class="text-xs text-emerald-400 font-medium">Live</span>
		</div>
	</div>
{/if}
