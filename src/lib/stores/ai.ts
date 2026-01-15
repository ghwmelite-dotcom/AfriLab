import { writable, derived } from 'svelte/store';
import type { AIMessage, AIContext } from '$types';

interface AIState {
	messages: AIMessage[];
	isLoading: boolean;
	isOpen: boolean;
	context: AIContext | null;
	error: string | null;
}

const initialState: AIState = {
	messages: [],
	isLoading: false,
	isOpen: false,
	context: null,
	error: null
};

function createAIStore() {
	const { subscribe, set, update } = writable<AIState>(initialState);

	return {
		subscribe,

		// Chat management
		addMessage: (role: 'user' | 'assistant', content: string) => {
			update((state) => ({
				...state,
				messages: [
					...state.messages,
					{
						id: crypto.randomUUID(),
						role,
						content,
						timestamp: new Date()
					}
				]
			}));
		},

		addSystemMessage: (content: string) => {
			update((state) => ({
				...state,
				messages: [
					...state.messages,
					{
						id: crypto.randomUUID(),
						role: 'system',
						content,
						timestamp: new Date()
					}
				]
			}));
		},

		// Loading state
		setLoading: (isLoading: boolean) => {
			update((state) => ({ ...state, isLoading }));
		},

		// Panel visibility
		open: () => {
			update((state) => ({ ...state, isOpen: true }));
		},

		close: () => {
			update((state) => ({ ...state, isOpen: false }));
		},

		toggle: () => {
			update((state) => ({ ...state, isOpen: !state.isOpen }));
		},

		// Context
		setContext: (context: AIContext) => {
			update((state) => ({ ...state, context }));
		},

		updateContext: (partial: Partial<AIContext>) => {
			update((state) => ({
				...state,
				context: state.context ? { ...state.context, ...partial } : null
			}));
		},

		// Error handling
		setError: (error: string | null) => {
			update((state) => ({ ...state, error, isLoading: false }));
		},

		// Clear
		clearMessages: () => {
			update((state) => ({ ...state, messages: [] }));
		},

		reset: () => {
			set(initialState);
		}
	};
}

export const aiStore = createAIStore();

// Derived stores
export const visibleMessages = derived(aiStore, ($store) =>
	$store.messages.filter((m) => m.role !== 'system')
);

export const lastAssistantMessage = derived(aiStore, ($store) => {
	const assistantMessages = $store.messages.filter((m) => m.role === 'assistant');
	return assistantMessages[assistantMessages.length - 1] ?? null;
});

export const messageCount = derived(aiStore, ($store) => $store.messages.length);
