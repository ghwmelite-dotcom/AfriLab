<script lang="ts">
	import { aiStore, visibleMessages } from '$stores/ai';
	import { labStore } from '$stores/lab';
	import { formatDateTime } from '$lib/utils/helpers';
	import { onMount } from 'svelte';

	let messageInput = $state('');
	let messagesContainer: HTMLDivElement;
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	async function sendMessage() {
		if (!messageInput.trim() || $aiStore.isLoading) return;

		const userMessage = messageInput.trim();
		messageInput = '';

		aiStore.addMessage('user', userMessage);
		aiStore.setLoading(true);

		try {
			const response = await fetch('/api/ai/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: userMessage,
					context: $aiStore.context
				})
			});

			if (!response.ok) throw new Error('Failed to get response');

			const data = await response.json();
			aiStore.addMessage('assistant', data.reply);
		} catch (error) {
			aiStore.setError('Failed to get response. Please try again.');
			aiStore.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
		} finally {
			aiStore.setLoading(false);
		}

		setTimeout(() => {
			if (messagesContainer) {
				messagesContainer.scrollTop = messagesContainer.scrollHeight;
			}
		}, 100);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	const quickQuestions = [
		{ text: 'What is the purpose of the indicator?', icon: 'question' },
		{ text: 'How do I know when to stop?', icon: 'stop' },
		{ text: 'What causes the color change?', icon: 'color' },
		{ text: 'Help me calculate the result', icon: 'calc' }
	];
</script>

<!-- Backdrop overlay -->
<div
	class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 {mounted ? 'animate-fade-in' : 'opacity-0'}"
	onclick={() => aiStore.close()}
	onkeydown={(e) => e.key === 'Escape' && aiStore.close()}
	role="button"
	tabindex="-1"
></div>

<!-- Chat Panel -->
<div class="fixed right-0 top-0 bottom-0 w-full max-w-md glass-strong border-l border-white/10 z-50 flex flex-col {mounted ? 'animate-slide-in-right' : 'translate-x-full'}">
	<!-- Ambient glow -->
	<div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
	<div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

	<!-- Header -->
	<div class="relative flex items-center justify-between p-5 border-b border-white/10">
		<div class="flex items-center gap-4">
			<div class="relative">
				<div class="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl blur-md opacity-50"></div>
				<div class="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
					<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
					</svg>
				</div>
			</div>
			<div>
				<h3 class="font-display font-semibold text-white">AI Lab Assistant</h3>
				<div class="flex items-center gap-2">
					<span class="relative flex h-2 w-2">
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
					</span>
					<p class="text-xs text-emerald-400">Online & Ready</p>
				</div>
			</div>
		</div>
		<button
			onclick={() => aiStore.close()}
			class="p-2.5 rounded-xl glass border border-white/5 text-gray-400 hover:text-white hover:border-white/10 transition-all"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>

	<!-- Messages -->
	<div
		bind:this={messagesContainer}
		class="relative flex-1 overflow-y-auto p-5 space-y-4 scrollbar-glow"
	>
		{#if $visibleMessages.length === 0}
			<!-- Welcome message -->
			<div class="text-center py-8 animate-fade-in-up">
				<div class="relative w-20 h-20 mx-auto mb-6">
					<div class="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
					<div class="relative w-full h-full glass-prismatic rounded-2xl flex items-center justify-center border border-emerald-500/20">
						<svg class="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
						</svg>
					</div>
				</div>
				<h4 class="text-xl font-display font-semibold text-white mb-2">
					Hello! I'm your lab assistant
				</h4>
				<p class="text-sm text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
					I can help you understand the experiment, answer questions, and provide hints when you're stuck.
				</p>

				<!-- Quick questions -->
				<div class="space-y-2">
					<p class="text-xs text-gray-500 mb-3">Try asking:</p>
					{#each quickQuestions as question, i}
						<button
							onclick={() => {
								messageInput = question.text;
								sendMessage();
							}}
							class="group w-full flex items-center gap-3 px-4 py-3 glass rounded-xl border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left"
							style="animation-delay: {i * 0.05}s;"
						>
							<div class="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
								<svg class="w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									{#if question.icon === 'question'}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									{:else if question.icon === 'stop'}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
									{:else if question.icon === 'color'}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
									{:else}
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
									{/if}
								</svg>
							</div>
							<span class="text-sm text-gray-300 group-hover:text-white transition-colors">{question.text}</span>
							<svg class="w-4 h-4 text-gray-600 group-hover:text-emerald-400 ml-auto transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</button>
					{/each}
				</div>
			</div>
		{:else}
			{#each $visibleMessages as message, i}
				<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up" style="animation-delay: {i * 0.02}s;">
					{#if message.role === 'assistant'}
						<div class="flex items-start gap-3 max-w-[85%]">
							<div class="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
								<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
								</svg>
							</div>
							<div class="glass rounded-2xl rounded-tl-md px-4 py-3 border border-emerald-500/20">
								<p class="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{message.content}</p>
								<p class="text-xs text-gray-500 mt-2">
									{formatDateTime(message.timestamp)}
								</p>
							</div>
						</div>
					{:else}
						<div class="max-w-[85%]">
							<div class="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl rounded-tr-md px-4 py-3">
								<p class="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{message.content}</p>
								<p class="text-xs text-gray-700/70 mt-2">
									{formatDateTime(message.timestamp)}
								</p>
							</div>
						</div>
					{/if}
				</div>
			{/each}

			{#if $aiStore.isLoading}
				<div class="flex justify-start animate-fade-in-up">
					<div class="flex items-start gap-3">
						<div class="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
							<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
							</svg>
						</div>
						<div class="glass rounded-2xl rounded-tl-md px-5 py-4 border border-emerald-500/20">
							<div class="flex items-center gap-1.5">
								<div class="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
								<div class="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style="animation-delay: 0.15s"></div>
								<div class="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style="animation-delay: 0.3s"></div>
							</div>
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</div>

	<!-- Input -->
	<div class="relative p-5 border-t border-white/10">
		<div class="flex gap-3">
			<div class="relative flex-1">
				<input
					type="text"
					placeholder="Ask me anything about the experiment..."
					class="input w-full pr-12"
					bind:value={messageInput}
					onkeydown={handleKeydown}
					disabled={$aiStore.isLoading}
				/>
			</div>
			<button
				onclick={sendMessage}
				disabled={!messageInput.trim() || $aiStore.isLoading}
				class="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if $aiStore.isLoading}
					<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
				{:else}
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
					</svg>
				{/if}
			</button>
		</div>
		<p class="text-xs text-gray-500 mt-2 text-center">
			Powered by Cloudflare AI
		</p>
	</div>
</div>

<style>
	@keyframes slide-in-right {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	:global(.animate-slide-in-right) {
		animation: slide-in-right 0.3s ease-out forwards;
	}

	:global(.animate-fade-in) {
		animation: fade-in 0.2s ease-out forwards;
	}
</style>
