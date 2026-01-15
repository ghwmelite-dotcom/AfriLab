import { writable, derived } from 'svelte/store';
import type {
	Experiment,
	LabSession,
	Measurement,
	LabAction,
	ExperimentStep
} from '$types';

interface LabState {
	currentExperiment: Experiment | null;
	currentSession: LabSession | null;
	currentStepIndex: number;
	measurements: Measurement[];
	actions: LabAction[];
	notes: string[];
	isRunning: boolean;
	isPaused: boolean;
	error: string | null;
}

const initialState: LabState = {
	currentExperiment: null,
	currentSession: null,
	currentStepIndex: 0,
	measurements: [],
	actions: [],
	notes: [],
	isRunning: false,
	isPaused: false,
	error: null
};

function createLabStore() {
	const { subscribe, set, update } = writable<LabState>(initialState);

	return {
		subscribe,

		// Initialize a new lab session
		startLab: (experiment: Experiment, session: LabSession) => {
			update((state) => ({
				...state,
				currentExperiment: experiment,
				currentSession: session,
				currentStepIndex: 0,
				measurements: [],
				actions: [],
				notes: [],
				isRunning: true,
				isPaused: false,
				error: null
			}));
		},

		// Navigation
		nextStep: () => {
			update((state) => {
				const maxSteps = state.currentExperiment?.instructions.length ?? 0;
				return {
					...state,
					currentStepIndex: Math.min(state.currentStepIndex + 1, maxSteps - 1)
				};
			});
		},

		previousStep: () => {
			update((state) => ({
				...state,
				currentStepIndex: Math.max(state.currentStepIndex - 1, 0)
			}));
		},

		goToStep: (index: number) => {
			update((state) => ({
				...state,
				currentStepIndex: Math.max(0, Math.min(index, (state.currentExperiment?.instructions.length ?? 1) - 1))
			}));
		},

		// Recording
		addMeasurement: (measurement: Omit<Measurement, 'id' | 'timestamp'>) => {
			update((state) => ({
				...state,
				measurements: [
					...state.measurements,
					{
						...measurement,
						id: crypto.randomUUID(),
						timestamp: new Date()
					}
				]
			}));
		},

		addAction: (action: string, details?: Record<string, unknown>) => {
			update((state) => ({
				...state,
				actions: [
					...state.actions,
					{
						action,
						details,
						timestamp: new Date()
					}
				]
			}));
		},

		addNote: (note: string) => {
			update((state) => ({
				...state,
				notes: [...state.notes, note]
			}));
		},

		// Controls
		pause: () => {
			update((state) => ({ ...state, isPaused: true }));
		},

		resume: () => {
			update((state) => ({ ...state, isPaused: false }));
		},

		// Completion
		completeLab: () => {
			update((state) => ({
				...state,
				isRunning: false,
				isPaused: false
			}));
		},

		// Error handling
		setError: (error: string) => {
			update((state) => ({ ...state, error }));
		},

		clearError: () => {
			update((state) => ({ ...state, error: null }));
		},

		// Reset
		reset: () => {
			set(initialState);
		}
	};
}

export const labStore = createLabStore();

// Derived stores
export const currentStep = derived(labStore, ($store): ExperimentStep | null => {
	if (!$store.currentExperiment) return null;
	return $store.currentExperiment.instructions[$store.currentStepIndex] ?? null;
});

export const progress = derived(labStore, ($store): number => {
	if (!$store.currentExperiment) return 0;
	const total = $store.currentExperiment.instructions.length;
	return total > 0 ? (($store.currentStepIndex + 1) / total) * 100 : 0;
});

export const isFirstStep = derived(labStore, ($store) => $store.currentStepIndex === 0);

export const isLastStep = derived(labStore, ($store) => {
	if (!$store.currentExperiment) return true;
	return $store.currentStepIndex === $store.currentExperiment.instructions.length - 1;
});
