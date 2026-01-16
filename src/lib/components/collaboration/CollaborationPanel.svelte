<script lang="ts">
	import { collaborationStore, type ChatMessage, type Participant } from '$lib/stores/collaboration';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	let isOpen = $derived(collaborationStore.isOpen);
	let session = $derived(collaborationStore.session);
	let participants = $derived(collaborationStore.participants);
	let messages = $derived(collaborationStore.messages);
	let status = $derived(collaborationStore.status);
	let unreadMessages = $derived(collaborationStore.unreadMessages);

	let messageInput = $state('');
	let messagesContainer: HTMLDivElement;
	let activeTab = $state<'chat' | 'participants'>('chat');
	let showShareModal = $state(false);
	let shareLink = $state('');
	let linkCopied = $state(false);

	function sendMessage() {
		if (!messageInput.trim()) return;
		collaborationStore.sendMessage(messageInput);
		messageInput = '';
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function scrollToBottom() {
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	async function copyShareLink() {
		const success = await collaborationStore.copyShareLink();
		if (success) {
			linkCopied = true;
			setTimeout(() => linkCopied = false, 2000);
		}
	}

	function openShareModal() {
		shareLink = collaborationStore.getShareLink();
		showShareModal = true;
	}

	function getInitials(name: string): string {
		return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
	}

	function formatTime(timestamp: string): string {
		return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function getParticipantColor(senderId: string): string {
		const participant = participants.find(p => p.id === senderId);
		return participant?.color || '#6b7280';
	}

	// Auto-scroll on new messages
	$effect(() => {
		messages;
		setTimeout(scrollToBottom, 100);
	});
</script>

<!-- Floating toggle button -->
{#if session && !isOpen}
	<button
		onclick={() => collaborationStore.open()}
		class="fixed bottom-6 right-6 z-40 p-4 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg hover:shadow-violet-500/25 transition-all hover:scale-105"
		aria-label="Open collaboration panel"
	>
		<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
		</svg>

		{#if unreadMessages > 0}
			<span class="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-xs font-bold">
				{unreadMessages > 9 ? '9+' : unreadMessages}
			</span>
		{/if}
	</button>
{/if}

<!-- Collaboration Panel -->
{#if session && isOpen}
	<div
		transition:slide={{ duration: 200, axis: 'x' }}
		class="fixed top-0 right-0 bottom-0 w-80 z-50 glass-strong border-l border-white/10 flex flex-col"
	>
		<!-- Header -->
		<div class="p-4 border-b border-white/10">
			<div class="flex items-center justify-between mb-3">
				<div class="flex items-center gap-2">
					<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
						<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</div>
					<div>
						<h3 class="text-sm font-semibold text-white">Collaboration</h3>
						<p class="text-xs text-gray-400">{participants.length} participant{participants.length !== 1 ? 's' : ''}</p>
					</div>
				</div>

				<div class="flex items-center gap-1">
					<button
						onclick={openShareModal}
						class="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
						aria-label="Share session"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
						</svg>
					</button>
					<button
						onclick={() => collaborationStore.close()}
						class="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
						aria-label="Close collaboration panel"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			</div>

			<!-- Tabs -->
			<div class="flex gap-1 p-1 rounded-lg glass">
				<button
					onclick={() => activeTab = 'chat'}
					class="flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all
						{activeTab === 'chat' ? 'bg-violet-500 text-white' : 'text-gray-400 hover:text-white'}"
				>
					Chat
				</button>
				<button
					onclick={() => activeTab = 'participants'}
					class="flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all
						{activeTab === 'participants' ? 'bg-violet-500 text-white' : 'text-gray-400 hover:text-white'}"
				>
					People
				</button>
			</div>
		</div>

		<!-- Content -->
		<div class="flex-1 overflow-hidden">
			{#if activeTab === 'chat'}
				<!-- Chat Messages -->
				<div
					bind:this={messagesContainer}
					class="h-full overflow-y-auto p-4 space-y-3 scrollbar-glow"
				>
					{#each messages as message (message.id)}
						{#if message.type === 'system'}
							<div class="text-center">
								<span class="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
									{message.content}
								</span>
							</div>
						{:else if message.type === 'action'}
							<div class="text-center">
								<span class="text-xs text-violet-400 bg-violet-500/10 px-2 py-1 rounded">
									{message.content}
								</span>
							</div>
						{:else}
							<div class="flex items-start gap-2">
								<div
									class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
									style="background-color: {getParticipantColor(message.senderId)}"
								>
									{getInitials(message.senderName)}
								</div>
								<div class="flex-1 min-w-0">
									<div class="flex items-baseline gap-2">
										<span class="text-xs font-medium text-white">{message.senderName}</span>
										<span class="text-[10px] text-gray-500">{formatTime(message.timestamp)}</span>
									</div>
									<p class="text-sm text-gray-300 break-words">{message.content}</p>
								</div>
							</div>
						{/if}
					{/each}
				</div>

				<!-- Chat Input -->
				<div class="p-3 border-t border-white/10">
					<div class="flex items-center gap-2">
						<input
							type="text"
							bind:value={messageInput}
							onkeydown={handleKeydown}
							placeholder="Type a message..."
							class="flex-1 px-3 py-2 rounded-lg glass border border-white/10 text-sm text-white placeholder-gray-500 focus:border-violet-500/50 focus:outline-none"
						/>
						<button
							onclick={sendMessage}
							disabled={!messageInput.trim()}
							class="p-2 rounded-lg bg-violet-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-600 transition-colors"
							aria-label="Send message"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
							</svg>
						</button>
					</div>
				</div>
			{:else}
				<!-- Participants List -->
				<div class="p-4 space-y-2">
					{#each participants as participant (participant.id)}
						<div class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
							<div class="relative">
								<div
									class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
									style="background-color: {participant.color}"
								>
									{getInitials(participant.name)}
								</div>
								{#if participant.isActive}
									<span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-gray-900 rounded-full"></span>
								{/if}
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2">
									<span class="text-sm font-medium text-white truncate">{participant.name}</span>
									{#if participant.role === 'owner'}
										<span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-400">Host</span>
									{/if}
								</div>
								<span class="text-xs text-gray-500">
									{participant.isActive ? 'Active now' : 'Away'}
								</span>
							</div>
						</div>
					{/each}

					<!-- Invite button -->
					<button
						onclick={openShareModal}
						class="w-full mt-4 p-3 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-violet-500/50 transition-all flex items-center justify-center gap-2"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
						</svg>
						<span class="text-sm">Invite people</span>
					</button>
				</div>
			{/if}
		</div>

		<!-- Leave Session -->
		<div class="p-3 border-t border-white/10">
			<button
				onclick={() => collaborationStore.leaveSession()}
				class="w-full px-4 py-2 rounded-lg glass border border-rose-500/30 text-rose-400 text-sm hover:bg-rose-500/10 transition-colors"
			>
				Leave Session
			</button>
		</div>
	</div>
{/if}

<!-- Share Modal -->
{#if showShareModal}
	<div class="fixed inset-0 z-[60] flex items-center justify-center p-4">
		<!-- Backdrop -->
		<button
			class="absolute inset-0 bg-black/60 backdrop-blur-sm"
			onclick={() => showShareModal = false}
			aria-label="Close modal"
		></button>

		<!-- Modal -->
		<div class="relative w-full max-w-md glass-strong rounded-2xl border border-white/10 overflow-hidden animate-fade-in-up">
			<div class="p-6">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
						<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
						</svg>
					</div>
					<div>
						<h3 class="text-lg font-display font-semibold text-white">Share Session</h3>
						<p class="text-sm text-gray-400">Invite others to collaborate</p>
					</div>
				</div>

				<!-- Share link -->
				<div class="space-y-3">
					<label class="text-sm text-gray-400">Session link</label>
					<div class="flex items-center gap-2">
						<input
							type="text"
							readonly
							value={shareLink}
							class="flex-1 px-3 py-2 rounded-lg glass border border-white/10 text-sm text-white bg-white/5"
						/>
						<button
							onclick={copyShareLink}
							class="px-4 py-2 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-colors"
						>
							{linkCopied ? 'Copied!' : 'Copy'}
						</button>
					</div>
				</div>

				<div class="mt-6 pt-4 border-t border-white/10 flex justify-end">
					<button
						onclick={() => showShareModal = false}
						class="px-4 py-2 rounded-lg glass border border-white/10 text-gray-400 text-sm hover:text-white hover:border-white/20 transition-all"
					>
						Done
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes fade-in-up {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in-up {
		animation: fade-in-up 0.2s ease-out;
	}
</style>
