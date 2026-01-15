<script lang="ts">
	import Header from '$components/layout/Header.svelte';
	import { aiStore } from '$stores/ai';
	import ChatAssistant from '$components/ai/ChatAssistant.svelte';
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900">
	<Header showAIButton={true} />

	<main class="pt-16">
		<slot />
	</main>

	<!-- AI Chat Panel -->
	{#if $aiStore.isOpen}
		<ChatAssistant />
	{/if}
</div>
