/**
 * Analytics API Endpoint
 * Receives and stores analytics events from the client
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface AnalyticsEvent {
	category: string;
	action: string;
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

interface AnalyticsPayload {
	events: AnalyticsEvent[];
}

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	try {
		const payload: AnalyticsPayload = await request.json();
		const { events } = payload;

		if (!events || !Array.isArray(events) || events.length === 0) {
			return json({ success: false, error: 'No events provided' }, { status: 400 });
		}

		// Add user context from session if available
		const userId = locals.user?.id;
		const userRole = locals.user?.role;

		const enrichedEvents = events.map(event => ({
			...event,
			userId: event.userId || userId,
			userRole: event.userRole || userRole,
			receivedAt: new Date().toISOString()
		}));

		// Store in D1 database if available
		const db = platform?.env?.DB;
		if (db) {
			try {
				// Create analytics table if not exists
				await db.exec(`
					CREATE TABLE IF NOT EXISTS analytics_events (
						id INTEGER PRIMARY KEY AUTOINCREMENT,
						category TEXT NOT NULL,
						action TEXT NOT NULL,
						label TEXT,
						value REAL,
						metadata TEXT,
						timestamp TEXT NOT NULL,
						received_at TEXT NOT NULL,
						session_id TEXT NOT NULL,
						user_id TEXT,
						user_role TEXT,
						page_url TEXT,
						referrer TEXT
					)
				`);

				// Insert events in batch
				const stmt = db.prepare(`
					INSERT INTO analytics_events
					(category, action, label, value, metadata, timestamp, received_at, session_id, user_id, user_role, page_url, referrer)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				`);

				const batch = enrichedEvents.map(event =>
					stmt.bind(
						event.category,
						event.action,
						event.label || null,
						event.value || null,
						event.metadata ? JSON.stringify(event.metadata) : null,
						event.timestamp,
						event.receivedAt,
						event.sessionId,
						event.userId || null,
						event.userRole || null,
						event.pageUrl || null,
						event.referrer || null
					)
				);

				await db.batch(batch);
			} catch (dbError) {
				console.error('Failed to store analytics in D1:', dbError);
				// Continue even if DB storage fails - events are still logged
			}
		}

		// Log events for development/debugging
		if (process.env.NODE_ENV === 'development') {
			console.log('[Analytics]', `Received ${enrichedEvents.length} events`);
			enrichedEvents.forEach(event => {
				console.log(`  - ${event.category}/${event.action}: ${event.label || '(no label)'}`);
			});
		}

		return json({
			success: true,
			received: enrichedEvents.length
		});
	} catch (error) {
		console.error('Analytics endpoint error:', error);
		return json({ success: false, error: 'Failed to process events' }, { status: 500 });
	}
};

// GET endpoint for retrieving analytics summary (admin only)
export const GET: RequestHandler = async ({ url, platform, locals }) => {
	// Check if user is admin or instructor
	if (!locals.user || !['admin', 'instructor'].includes(locals.user.role)) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const db = platform?.env?.DB;
	if (!db) {
		return json({ success: false, error: 'Database not available' }, { status: 503 });
	}

	try {
		const period = url.searchParams.get('period') || '7d';
		let dateFilter = '';

		switch (period) {
			case '24h':
				dateFilter = "datetime(timestamp) > datetime('now', '-1 day')";
				break;
			case '7d':
				dateFilter = "datetime(timestamp) > datetime('now', '-7 days')";
				break;
			case '30d':
				dateFilter = "datetime(timestamp) > datetime('now', '-30 days')";
				break;
			default:
				dateFilter = "datetime(timestamp) > datetime('now', '-7 days')";
		}

		// Get summary statistics
		const summaryQuery = `
			SELECT
				COUNT(*) as total_events,
				COUNT(DISTINCT session_id) as unique_sessions,
				COUNT(DISTINCT user_id) as unique_users,
				COUNT(CASE WHEN category = 'lab' AND action = 'lab_start' THEN 1 END) as labs_started,
				COUNT(CASE WHEN category = 'lab' AND action = 'lab_complete' THEN 1 END) as labs_completed,
				COUNT(CASE WHEN category = 'navigation' AND action = 'page_view' THEN 1 END) as page_views,
				COUNT(CASE WHEN category = 'ai_assistant' THEN 1 END) as ai_interactions,
				COUNT(CASE WHEN category = 'achievement' THEN 1 END) as achievements_unlocked
			FROM analytics_events
			WHERE ${dateFilter}
		`;

		const summary = await db.prepare(summaryQuery).first();

		// Get top pages
		const topPagesQuery = `
			SELECT page_url, COUNT(*) as views
			FROM analytics_events
			WHERE ${dateFilter} AND category = 'navigation' AND action = 'page_view'
			GROUP BY page_url
			ORDER BY views DESC
			LIMIT 10
		`;
		const topPages = await db.prepare(topPagesQuery).all();

		// Get lab completion rates
		const labStatsQuery = `
			SELECT
				label as lab_name,
				COUNT(CASE WHEN action = 'lab_start' THEN 1 END) as starts,
				COUNT(CASE WHEN action = 'lab_complete' THEN 1 END) as completions
			FROM analytics_events
			WHERE ${dateFilter} AND category = 'lab'
			GROUP BY label
			HAVING starts > 0
		`;
		const labStats = await db.prepare(labStatsQuery).all();

		// Get events by category
		const categoryStatsQuery = `
			SELECT category, COUNT(*) as count
			FROM analytics_events
			WHERE ${dateFilter}
			GROUP BY category
			ORDER BY count DESC
		`;
		const categoryStats = await db.prepare(categoryStatsQuery).all();

		return json({
			success: true,
			period,
			summary: summary || {},
			topPages: topPages?.results || [],
			labStats: labStats?.results || [],
			categoryStats: categoryStats?.results || []
		});
	} catch (error) {
		console.error('Analytics GET error:', error);
		return json({ success: false, error: 'Failed to retrieve analytics' }, { status: 500 });
	}
};
