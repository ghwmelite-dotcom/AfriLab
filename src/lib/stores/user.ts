import { writable, derived } from 'svelte/store';
import type { User, Session } from '$types';

interface UserState {
	user: User | null;
	session: Session | null;
	isLoading: boolean;
	error: string | null;
}

const initialState: UserState = {
	user: null,
	session: null,
	isLoading: true,
	error: null
};

function createUserStore() {
	const { subscribe, set, update } = writable<UserState>(initialState);

	return {
		subscribe,

		setUser: (user: User | null, session: Session | null) => {
			update((state) => ({
				...state,
				user,
				session,
				isLoading: false,
				error: null
			}));
		},

		setLoading: (isLoading: boolean) => {
			update((state) => ({ ...state, isLoading }));
		},

		setError: (error: string | null) => {
			update((state) => ({ ...state, error, isLoading: false }));
		},

		logout: () => {
			set({ ...initialState, isLoading: false });
		},

		reset: () => {
			set(initialState);
		}
	};
}

export const userStore = createUserStore();

// Derived stores for convenience
export const isAuthenticated = derived(userStore, ($store) => $store.user !== null);
export const isStudent = derived(userStore, ($store) => $store.user?.role === 'student');
export const isInstructor = derived(userStore, ($store) => $store.user?.role === 'instructor');
export const isAdmin = derived(userStore, ($store) => $store.user?.role === 'admin');
export const currentUser = derived(userStore, ($store) => $store.user);
