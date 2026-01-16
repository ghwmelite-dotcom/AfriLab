<script lang="ts">
	import { collaborationStore } from '$lib/stores/collaboration';
	import { currentUser } from '$stores/user';

	interface Props {
		labId: string;
		labName: string;
	}

	let { labId, labName }: Props = $props();

	let session = $derived(collaborationStore.session);
	let status = $derived(collaborationStore.status);
	let participants = $derived(collaborationStore.participants);

	let isLoading = $state(false);
	let showMenu = $state(false);

	async function startSession() {
		if (!$currentUser) return;

		isLoading = true;
		collaborationStore.init($currentUser.id, `${$currentUser.firstName} ${$currentUser.lastName}`);

		await collaborationStore.createSession(labId, labName);
		collaborationStore.open();

		isLoading = false;
		showMenu = false;
	}

	function openPanel() {
		collaborationStore.open();
		showMenu = false;
	}

	function leaveSession() {
		collaborationStore.leaveSession();
		showMenu = false;
	}

	// Demo: simulate a participant joining
	function simulateJoin() {
		const names = ['Sarah', 'Ahmed', 'Grace', 'Kofi', 'Amara'];
		const randomName = names[Math.floor(Math.random() * names.length)];
		collaborationStore.simulateParticipantJoin(randomName);
	}
</script>

<div class="relative">
	{#if session}
		<!-- Active session -->
		<button
			onclick={() => showMenu = !showMenu}
			class="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-violet-500/30 text-violet-400 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all"
		>
			<!-- Participant avatars -->
			<div class="flex -space-x-1.5">
				{#each participants.slice(0, 3) as participant (participant.id)}
					<div
						class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white border border-gray-900"
						style="background-color: {participant.color}"
					>
						{participant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
					</div>
				{/each}
				{#if participants.length > 3}
					<div class="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-medium text-gray-300 border border-gray-900">
						+{participants.length - 3}
					</div>
				{/if}
			</div>

			<span class="text-sm font-medium">Live</span>

			<!-- Pulse indicator -->
			<span class="relative flex h-2 w-2">
				<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
				<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
			</span>
		</button>

		<!-- Menu dropdown -->
		{#if showMenu}
			<div class="absolute top-full right-0 mt-2 w-48 glass-strong rounded-xl border border-white/10 shadow-xl overflow-hidden z-50">
				<button
					onclick={openPanel}
					class="w-full px-4 py-2.5 text-sm text-left text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
					</svg>
					Open Chat
				</button>
				<button
					onclick={simulateJoin}
					class="w-full px-4 py-2.5 text-sm text-left text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
					</svg>
					Add Demo User
				</button>
				<div class="border-t border-white/10"></div>
				<button
					onclick={leaveSession}
					class="w-full px-4 py-2.5 text-sm text-left text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
					</svg>
					Leave Session
				</button>
			</div>
		{/if}
	{:else}
		<!-- Start collaboration button -->
		<button
			onclick={startSession}
			disabled={isLoading}
			class="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 text-gray-400 hover:text-violet-400 hover:border-violet-500/30 hover:bg-violet-500/10 transition-all disabled:opacity-50"
		>
			{#if isLoading}
				<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
			{:else}
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
			{/if}
			<span class="text-sm font-medium">Collaborate</span>
		</button>
	{/if}
</div>

<!-- Click outside to close menu -->
{#if showMenu}
	<button
		class="fixed inset-0 z-40"
		onclick={() => showMenu = false}
		aria-label="Close menu"
	></button>
{/if}
