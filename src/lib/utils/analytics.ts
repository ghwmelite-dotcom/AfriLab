/**
 * Analytics Tracking System
 * Privacy-focused analytics for understanding lab usage and improving the platform
 */

import { browser } from '$app/environment';

export type EventCategory =
	| 'navigation'
	| 'lab'
	| 'experiment'
	| 'achievement'
	| 'ai_assistant'
	| 'collaboration'
	| 'report'
	| 'settings'
	| 'error';

export type EventAction =
	| 'page_view'
	| 'lab_start'
	| 'lab_complete'
	| 'lab_abandon'
	| 'step_complete'
	| 'experiment_success'
	| 'experiment_fail'
	| 'hint_request'
	| 'ai_query'
	| 'report_generate'
	| 'achievement_unlock'
	| 'level_up'
	| 'feature_use'
	| 'error_occur'
	| 'session_start'
	| 'session_end';

interface AnalyticsEvent {
	category: EventCategory;
	action: EventAction;
	label?: string;
	value?: number;
	metadata?: Record<string, unknown>;
	timestamp: string;
	sessionId: string;
	userId?: string;
	userRole?: string;
	pageUrl?: string;
	referrer?: string;
}

interface LabAnalytics {
	labId: string;
	labName: string;
	category: string;
	startTime: string;
	endTime?: string;
	stepsCompleted: number;
	totalSteps: number;
	hintsUsed: number;
	errorsEncountered: number;
	completed: boolean;
	score?: number;
}

interface SessionData {
	sessionId: string;
	startTime: string;
	lastActivityTime: string;
	pageViews: number;
	labsStarted: number;
	labsCompleted: number;
	totalTimeSeconds: number;
}

const STORAGE_KEY = 'afrilab_analytics';
const SESSION_KEY = 'afrilab_session';
const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 30000; // 30 seconds

class AnalyticsManager {
	private eventQueue: AnalyticsEvent[] = [];
	private sessionData: SessionData | null = null;
	private currentLabAnalytics: LabAnalytics | null = null;
	private flushTimer: ReturnType<typeof setInterval> | null = null;
	private isEnabled = true;

	constructor() {
		if (browser) {
			this.initSession();
			this.loadQueue();
			this.startFlushTimer();
			this.setupPageUnloadHandler();
		}
	}

	private initSession() {
		const stored = sessionStorage.getItem(SESSION_KEY);
		if (stored) {
			try {
				this.sessionData = JSON.parse(stored);
				if (this.sessionData) {
					this.sessionData.lastActivityTime = new Date().toISOString();
				}
			} catch {
				this.createNewSession();
			}
		} else {
			this.createNewSession();
		}
	}

	private createNewSession() {
		this.sessionData = {
			sessionId: this.generateSessionId(),
			startTime: new Date().toISOString(),
			lastActivityTime: new Date().toISOString(),
			pageViews: 0,
			labsStarted: 0,
			labsCompleted: 0,
			totalTimeSeconds: 0
		};
		this.saveSession();
		this.track('navigation', 'session_start');
	}

	private generateSessionId(): string {
		return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
	}

	private saveSession() {
		if (browser && this.sessionData) {
			sessionStorage.setItem(SESSION_KEY, JSON.stringify(this.sessionData));
		}
	}

	private loadQueue() {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				this.eventQueue = JSON.parse(stored);
			} catch {
				this.eventQueue = [];
			}
		}
	}

	private saveQueue() {
		if (browser) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.eventQueue));
		}
	}

	private startFlushTimer() {
		this.flushTimer = setInterval(() => {
			this.flush();
		}, FLUSH_INTERVAL);
	}

	private setupPageUnloadHandler() {
		window.addEventListener('beforeunload', () => {
			this.flush(true);
		});

		window.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'hidden') {
				this.flush(true);
			}
		});
	}

	// Enable or disable analytics
	setEnabled(enabled: boolean) {
		this.isEnabled = enabled;
		if (!enabled) {
			this.eventQueue = [];
			this.saveQueue();
		}
	}

	// Main tracking method
	track(
		category: EventCategory,
		action: EventAction,
		label?: string,
		value?: number,
		metadata?: Record<string, unknown>
	) {
		if (!browser || !this.isEnabled) return;

		const event: AnalyticsEvent = {
			category,
			action,
			label,
			value,
			metadata,
			timestamp: new Date().toISOString(),
			sessionId: this.sessionData?.sessionId || 'unknown',
			pageUrl: window.location.pathname,
			referrer: document.referrer || undefined
		};

		this.eventQueue.push(event);
		this.updateSessionActivity();
		this.saveQueue();

		// Flush if queue is large enough
		if (this.eventQueue.length >= BATCH_SIZE) {
			this.flush();
		}
	}

	private updateSessionActivity() {
		if (this.sessionData) {
			const now = new Date();
			const lastActivity = new Date(this.sessionData.lastActivityTime);
			this.sessionData.totalTimeSeconds += Math.floor((now.getTime() - lastActivity.getTime()) / 1000);
			this.sessionData.lastActivityTime = now.toISOString();
			this.saveSession();
		}
	}

	// Page view tracking
	trackPageView(pageName: string, pageTitle?: string) {
		if (this.sessionData) {
			this.sessionData.pageViews++;
			this.saveSession();
		}
		this.track('navigation', 'page_view', pageName, undefined, { pageTitle });
	}

	// Lab tracking methods
	startLabSession(labId: string, labName: string, category: string, totalSteps: number) {
		this.currentLabAnalytics = {
			labId,
			labName,
			category,
			startTime: new Date().toISOString(),
			stepsCompleted: 0,
			totalSteps,
			hintsUsed: 0,
			errorsEncountered: 0,
			completed: false
		};

		if (this.sessionData) {
			this.sessionData.labsStarted++;
			this.saveSession();
		}

		this.track('lab', 'lab_start', labName, undefined, {
			labId,
			category,
			totalSteps
		});
	}

	completeLabStep(stepNumber: number, stepName?: string) {
		if (this.currentLabAnalytics) {
			this.currentLabAnalytics.stepsCompleted = stepNumber;
		}
		this.track('experiment', 'step_complete', stepName, stepNumber);
	}

	recordHintUsage(hintLevel: number) {
		if (this.currentLabAnalytics) {
			this.currentLabAnalytics.hintsUsed++;
		}
		this.track('ai_assistant', 'hint_request', `Level ${hintLevel}`, hintLevel);
	}

	recordExperimentResult(success: boolean, details?: string) {
		if (this.currentLabAnalytics) {
			if (!success) {
				this.currentLabAnalytics.errorsEncountered++;
			}
		}
		this.track(
			'experiment',
			success ? 'experiment_success' : 'experiment_fail',
			details
		);
	}

	completeLabSession(score?: number) {
		if (this.currentLabAnalytics) {
			this.currentLabAnalytics.endTime = new Date().toISOString();
			this.currentLabAnalytics.completed = true;
			this.currentLabAnalytics.score = score;

			if (this.sessionData) {
				this.sessionData.labsCompleted++;
				this.saveSession();
			}

			const duration = this.calculateDuration(
				this.currentLabAnalytics.startTime,
				this.currentLabAnalytics.endTime
			);

			this.track('lab', 'lab_complete', this.currentLabAnalytics.labName, score, {
				...this.currentLabAnalytics,
				durationSeconds: duration
			});

			this.currentLabAnalytics = null;
		}
	}

	abandonLabSession(reason?: string) {
		if (this.currentLabAnalytics) {
			this.currentLabAnalytics.endTime = new Date().toISOString();

			const duration = this.calculateDuration(
				this.currentLabAnalytics.startTime,
				this.currentLabAnalytics.endTime
			);

			this.track('lab', 'lab_abandon', reason, undefined, {
				...this.currentLabAnalytics,
				durationSeconds: duration
			});

			this.currentLabAnalytics = null;
		}
	}

	// Achievement tracking
	trackAchievement(achievementId: string, achievementName: string, points: number) {
		this.track('achievement', 'achievement_unlock', achievementName, points, {
			achievementId
		});
	}

	trackLevelUp(newLevel: number, levelTitle: string) {
		this.track('achievement', 'level_up', levelTitle, newLevel);
	}

	// AI Assistant tracking
	trackAIQuery(query: string, responseTime?: number) {
		this.track('ai_assistant', 'ai_query', undefined, responseTime, {
			queryLength: query.length
		});
	}

	// Report tracking
	trackReportGeneration(labId: string, labName: string) {
		this.track('report', 'report_generate', labName, undefined, { labId });
	}

	// Feature usage tracking
	trackFeatureUse(featureName: string, details?: Record<string, unknown>) {
		this.track('settings', 'feature_use', featureName, undefined, details);
	}

	// Error tracking
	trackError(errorType: string, errorMessage: string, componentName?: string) {
		this.track('error', 'error_occur', errorType, undefined, {
			message: errorMessage,
			component: componentName,
			url: browser ? window.location.href : undefined
		});
	}

	private calculateDuration(start: string, end: string): number {
		return Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1000);
	}

	// Flush events to the server
	async flush(immediate = false) {
		if (!browser || this.eventQueue.length === 0) return;

		const eventsToSend = [...this.eventQueue];
		this.eventQueue = [];
		this.saveQueue();

		try {
			// Use sendBeacon for immediate/unload scenarios
			if (immediate && navigator.sendBeacon) {
				navigator.sendBeacon('/api/analytics', JSON.stringify({ events: eventsToSend }));
			} else {
				await fetch('/api/analytics', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ events: eventsToSend })
				});
			}
		} catch (error) {
			// Re-queue events on failure
			this.eventQueue = [...eventsToSend, ...this.eventQueue];
			this.saveQueue();
			console.warn('Failed to send analytics:', error);
		}
	}

	// Get session stats (for display purposes)
	getSessionStats(): SessionData | null {
		return this.sessionData;
	}

	// Clean up
	destroy() {
		if (this.flushTimer) {
			clearInterval(this.flushTimer);
		}
		this.flush(true);
	}
}

// Singleton instance
export const analytics = new AnalyticsManager();

// Convenience functions
export function trackPageView(pageName: string, pageTitle?: string) {
	analytics.trackPageView(pageName, pageTitle);
}

export function trackLabStart(labId: string, labName: string, category: string, totalSteps: number) {
	analytics.startLabSession(labId, labName, category, totalSteps);
}

export function trackLabComplete(score?: number) {
	analytics.completeLabSession(score);
}

export function trackLabAbandon(reason?: string) {
	analytics.abandonLabSession(reason);
}

export function trackStepComplete(stepNumber: number, stepName?: string) {
	analytics.completeLabStep(stepNumber, stepName);
}

export function trackHint(level: number) {
	analytics.recordHintUsage(level);
}

export function trackExperiment(success: boolean, details?: string) {
	analytics.recordExperimentResult(success, details);
}

export function trackAchievement(id: string, name: string, points: number) {
	analytics.trackAchievement(id, name, points);
}

export function trackLevelUp(level: number, title: string) {
	analytics.trackLevelUp(level, title);
}

export function trackAI(query: string, responseTime?: number) {
	analytics.trackAIQuery(query, responseTime);
}

export function trackReport(labId: string, labName: string) {
	analytics.trackReportGeneration(labId, labName);
}

export function trackFeature(name: string, details?: Record<string, unknown>) {
	analytics.trackFeatureUse(name, details);
}

export function trackError(type: string, message: string, component?: string) {
	analytics.trackError(type, message, component);
}
