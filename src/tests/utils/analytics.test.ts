/**
 * Tests for Analytics Utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	trackPageView,
	trackLabStart,
	trackLabComplete,
	trackLabAbandon,
	trackStepComplete,
	trackHint,
	trackExperiment,
	trackAchievement,
	trackLevelUp,
	trackAI,
	trackReport,
	trackFeature,
	trackError
} from '$lib/utils/analytics';

describe('Analytics Utility', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Clear localStorage
		localStorage.clear();
		sessionStorage.clear();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('trackPageView', () => {
		it('should not throw when called', () => {
			expect(() => trackPageView('/dashboard', 'Dashboard')).not.toThrow();
		});

		it('should accept page name and title', () => {
			expect(() => trackPageView('/labs', 'Labs Page')).not.toThrow();
		});
	});

	describe('trackLabStart', () => {
		it('should not throw when called with valid parameters', () => {
			expect(() => trackLabStart('titration', 'Acid-Base Titration', 'chemistry', 5)).not.toThrow();
		});
	});

	describe('trackLabComplete', () => {
		it('should not throw when called', () => {
			expect(() => trackLabComplete(95)).not.toThrow();
		});

		it('should accept optional score', () => {
			expect(() => trackLabComplete()).not.toThrow();
		});
	});

	describe('trackLabAbandon', () => {
		it('should not throw when called', () => {
			expect(() => trackLabAbandon('user navigated away')).not.toThrow();
		});

		it('should accept optional reason', () => {
			expect(() => trackLabAbandon()).not.toThrow();
		});
	});

	describe('trackStepComplete', () => {
		it('should not throw when called', () => {
			expect(() => trackStepComplete(1, 'Setup Equipment')).not.toThrow();
		});

		it('should accept step number only', () => {
			expect(() => trackStepComplete(2)).not.toThrow();
		});
	});

	describe('trackHint', () => {
		it('should not throw when called with hint level', () => {
			expect(() => trackHint(1)).not.toThrow();
			expect(() => trackHint(2)).not.toThrow();
			expect(() => trackHint(3)).not.toThrow();
		});
	});

	describe('trackExperiment', () => {
		it('should track successful experiment', () => {
			expect(() => trackExperiment(true, 'Reaction completed')).not.toThrow();
		});

		it('should track failed experiment', () => {
			expect(() => trackExperiment(false, 'Incorrect measurements')).not.toThrow();
		});
	});

	describe('trackAchievement', () => {
		it('should not throw when called with achievement data', () => {
			expect(() => trackAchievement('first_lab', 'First Lab', 50)).not.toThrow();
		});
	});

	describe('trackLevelUp', () => {
		it('should not throw when called with level data', () => {
			expect(() => trackLevelUp(5, 'Lab Apprentice')).not.toThrow();
		});
	});

	describe('trackAI', () => {
		it('should not throw when called with query', () => {
			expect(() => trackAI('What is titration?')).not.toThrow();
		});

		it('should accept optional response time', () => {
			expect(() => trackAI('Help me with this step', 250)).not.toThrow();
		});
	});

	describe('trackReport', () => {
		it('should not throw when called with report data', () => {
			expect(() => trackReport('titration', 'Acid-Base Titration')).not.toThrow();
		});
	});

	describe('trackFeature', () => {
		it('should not throw when called with feature name', () => {
			expect(() => trackFeature('dark_mode')).not.toThrow();
		});

		it('should accept optional details', () => {
			expect(() => trackFeature('sound_toggle', { enabled: true })).not.toThrow();
		});
	});

	describe('trackError', () => {
		it('should not throw when called with error data', () => {
			expect(() => trackError('api_error', 'Failed to fetch data')).not.toThrow();
		});

		it('should accept optional component name', () => {
			expect(() => trackError('render_error', 'Component failed', 'LabView')).not.toThrow();
		});
	});
});
