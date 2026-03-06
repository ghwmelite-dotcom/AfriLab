/**
 * Onboarding Store
 * Tracks user onboarding progress and preferences
 */

import { browser } from '$app/environment';

const STORAGE_KEY = 'afrilab_onboarding';

interface OnboardingState {
	tourCompleted: boolean;
	tourSkipped: boolean;
	firstLabCompleted: boolean;
	lastSeenAt: string | null;
}

function getInitialState(): OnboardingState {
	if (browser) {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				return JSON.parse(stored);
			} catch {
				// Ignore parse errors
			}
		}
	}

	return {
		tourCompleted: false,
		tourSkipped: false,
		firstLabCompleted: false,
		lastSeenAt: null
	};
}

function saveState(state: OnboardingState) {
	if (browser) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	}
}

class OnboardingStore {
	private state = $state<OnboardingState>(getInitialState());

	get tourCompleted() {
		return this.state.tourCompleted;
	}

	get shouldShowTour() {
		return !this.state.tourCompleted && !this.state.tourSkipped;
	}

	completeTour() {
		this.state = {
			...this.state,
			tourCompleted: true,
			lastSeenAt: new Date().toISOString()
		};
		saveState(this.state);
	}

	skipTour() {
		this.state = {
			...this.state,
			tourSkipped: true,
			lastSeenAt: new Date().toISOString()
		};
		saveState(this.state);
	}

	markFirstLabCompleted() {
		this.state = {
			...this.state,
			firstLabCompleted: true
		};
		saveState(this.state);
	}

	resetOnboarding() {
		this.state = {
			tourCompleted: false,
			tourSkipped: false,
			firstLabCompleted: false,
			lastSeenAt: null
		};
		saveState(this.state);
	}
}

export const onboardingStore = new OnboardingStore();
