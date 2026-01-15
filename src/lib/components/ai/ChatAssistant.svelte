<script lang="ts">
	import { aiStore, visibleMessages } from '$stores/ai';
	import { labStore } from '$stores/lab';
	import { formatDateTime } from '$lib/utils/helpers';

	let messageInput = $state('');
	let messagesContainer: HTMLDivElement;

	async function sendMessage() {
		if (!messageInput.trim() || $aiStore.isLoading) return;

		const userMessage = messageInput.trim();
		messageInput = '';

		// Add user message
		aiStore.addMessage('user', userMessage);

		// Set loading
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

			if (!response.ok) {
				throw new Error('Failed to get response');
			}

			const data = await response.json();
			aiStore.addMessage('assistant', data.reply);
		} catch (error) {
			aiStore.setError('Failed to get response. Please try again.');
			aiStore.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
		} finally {
			aiStore.setLoading(false);
		}

		// Scroll to bottom
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
		'What is the purpose of the indicator?',
		'How do I know when to stop adding base?',
		'What causes the color change?',
		'How do I calculate the concentration?'
	];
</script>

<!-- Overlay -->
<div
	class="fixed inset-0 bg-black/20 z-40"
	onclick={() => aiStore.close()}
	role="button"
	tabindex="-1"
></div>

<!-- Chat Panel -->
<div class="fixed right-0 top-16 bottom-0 w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 flex flex-col">
	<!-- Header -->
	<div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
		<div class="flex items-center gap-3">
			<div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
				<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
				</svg>
			</div>
			<div>
				<h3 class="font-semibold text-gray-900 dark:text-white">AI Lab Assistant</h3>
				<p class="text-xs text-gray-500 dark:text-gray-400">Powered by Cloudflare AI</p>
			</div>
		</div>
		<button
			onclick={() => aiStore.close()}
			class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>

	<!-- Messages -->
	<div
		bind:this={messagesContainer}
		class="flex-1 overflow-y-auto p-4 space-y-4"
	>
		{#if $visibleMessages.length === 0}
			<!-- Welcome message -->
			<div class="text-center py-8">
				<div class="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
					<svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
					</svg>
				</div>
				<h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
					Hello! I'm your lab assistant.
				</h4>
				<p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
					I can help you understand the experiment, answer questions, and provide hints when you're stuck.
				</p>

				<!-- Quick questions -->
				<div class="space-y-2">
					<p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Try asking:</p>
					{#each quickQuestions as question}
						<button
							onclick={() => {
								messageInput = question;
								sendMessage();
							}}
							class="block w-full text-left px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
						>
							{question}
						</button>
					{/each}
				</div>
			</div>
		{:else}
			{#each $visibleMessages as message}
				<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
					<div class="{message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}">
						<p class="text-sm whitespace-pre-wrap">{message.content}</p>
						<p class="text-xs opacity-50 mt-1">
							{formatDateTime(message.timestamp)}
						</p>
					</div>
				</div>
			{/each}

			{#if $aiStore.isLoading}
				<div class="flex justify-start">
					<div class="chat-bubble-ai">
						<div class="flex items-center gap-1">
							<div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
							<div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
							<div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</div>

	<!-- Input -->
	<div class="p-4 border-t border-gray-200 dark:border-gray-700">
		<div class="flex gap-2">
			<input
				type="text"
				placeholder="Ask me anything about the experiment..."
				class="input flex-1"
				bind:value={messageInput}
				onkeydown={handleKeydown}
				disabled={$aiStore.isLoading}
			/>
			<button
				onclick={sendMessage}
				disabled={!messageInput.trim() || $aiStore.isLoading}
				class="btn-primary px-4"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
				</svg>
			</button>
		</div>
	</div>
</div>
