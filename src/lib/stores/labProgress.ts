import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

// Key prefix for localStorage
const STORAGE_KEY_PREFIX = 'afrilab_lab_progress_';
const SAVED_LABS_KEY = 'afrilab_saved_labs';

export interface SavedLabProgress {
	labId: string;
	labTitle: string;
	discipline: string;
	savedAt: string;
	currentStep: number;
	totalSteps: number;
	percentComplete: number;
	simulationState: unknown;
	measurements: Array<{
		type: string;
		value: number;
		unit: string;
		label: string;
	}>;
	notes: string[];
}

interface LabProgressState {
	savedLabs: Map<string, SavedLabProgress>;
	isLoading: boolean;
}

const initialState: LabProgressState = {
	savedLabs: new Map(),
	isLoading: true
};

function createLabProgressStore() {
	const { subscribe, set, update } = writable<LabProgressState>(initialState);

	// Initialize from localStorage
	function init() {
		if (!browser) return;

		try {
			const savedLabsJson = localStorage.getItem(SAVED_LABS_KEY);
			const savedLabIds: string[] = savedLabsJson ? JSON.parse(savedLabsJson) : [];
			const savedLabs = new Map<string, SavedLabProgress>();

			for (const labId of savedLabIds) {
				const progressJson = localStorage.getItem(`${STORAGE_KEY_PREFIX}${labId}`);
				if (progressJson) {
					const progress = JSON.parse(progressJson) as SavedLabProgress;
					savedLabs.set(labId, progress);
				}
			}

			update((state) => ({
				...state,
				savedLabs,
				isLoading: false
			}));
		} catch (error) {
			console.error('Failed to load lab progress:', error);
			update((state) => ({ ...state, isLoading: false }));
		}
	}

	return {
		subscribe,

		init,

		// Save progress for a specific lab
		saveProgress: (
			labId: string,
			labTitle: string,
			discipline: string,
			currentStep: number,
			totalSteps: number,
			simulationState: unknown,
			measurements: SavedLabProgress['measurements'] = [],
			notes: string[] = []
		) => {
			if (!browser) return;

			const progress: SavedLabProgress = {
				labId,
				labTitle,
				discipline,
				savedAt: new Date().toISOString(),
				currentStep,
				totalSteps,
				percentComplete: Math.round((currentStep / totalSteps) * 100),
				simulationState,
				measurements,
				notes
			};

			try {
				// Save individual progress
				localStorage.setItem(`${STORAGE_KEY_PREFIX}${labId}`, JSON.stringify(progress));

				// Update saved labs list
				const savedLabsJson = localStorage.getItem(SAVED_LABS_KEY);
				const savedLabIds: string[] = savedLabsJson ? JSON.parse(savedLabsJson) : [];
				if (!savedLabIds.includes(labId)) {
					savedLabIds.push(labId);
					localStorage.setItem(SAVED_LABS_KEY, JSON.stringify(savedLabIds));
				}

				// Update store
				update((state) => {
					const newSavedLabs = new Map(state.savedLabs);
					newSavedLabs.set(labId, progress);
					return { ...state, savedLabs: newSavedLabs };
				});
			} catch (error) {
				console.error('Failed to save lab progress:', error);
			}
		},

		// Load progress for a specific lab
		loadProgress: (labId: string): SavedLabProgress | null => {
			if (!browser) return null;

			try {
				const progressJson = localStorage.getItem(`${STORAGE_KEY_PREFIX}${labId}`);
				if (progressJson) {
					return JSON.parse(progressJson) as SavedLabProgress;
				}
			} catch (error) {
				console.error('Failed to load lab progress:', error);
			}
			return null;
		},

		// Check if a lab has saved progress
		hasSavedProgress: (labId: string): boolean => {
			const state = get({ subscribe });
			return state.savedLabs.has(labId);
		},

		// Delete saved progress for a lab
		deleteProgress: (labId: string) => {
			if (!browser) return;

			try {
				localStorage.removeItem(`${STORAGE_KEY_PREFIX}${labId}`);

				// Update saved labs list
				const savedLabsJson = localStorage.getItem(SAVED_LABS_KEY);
				const savedLabIds: string[] = savedLabsJson ? JSON.parse(savedLabsJson) : [];
				const filteredIds = savedLabIds.filter((id) => id !== labId);
				localStorage.setItem(SAVED_LABS_KEY, JSON.stringify(filteredIds));

				// Update store
				update((state) => {
					const newSavedLabs = new Map(state.savedLabs);
					newSavedLabs.delete(labId);
					return { ...state, savedLabs: newSavedLabs };
				});
			} catch (error) {
				console.error('Failed to delete lab progress:', error);
			}
		},

		// Clear all saved progress
		clearAllProgress: () => {
			if (!browser) return;

			try {
				const savedLabsJson = localStorage.getItem(SAVED_LABS_KEY);
				const savedLabIds: string[] = savedLabsJson ? JSON.parse(savedLabsJson) : [];

				for (const labId of savedLabIds) {
					localStorage.removeItem(`${STORAGE_KEY_PREFIX}${labId}`);
				}
				localStorage.removeItem(SAVED_LABS_KEY);

				update((state) => ({
					...state,
					savedLabs: new Map()
				}));
			} catch (error) {
				console.error('Failed to clear lab progress:', error);
			}
		},

		// Get all saved labs sorted by most recent
		getSavedLabs: (): SavedLabProgress[] => {
			const state = get({ subscribe });
			return Array.from(state.savedLabs.values()).sort(
				(a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
			);
		}
	};
}

export const labProgressStore = createLabProgressStore();
