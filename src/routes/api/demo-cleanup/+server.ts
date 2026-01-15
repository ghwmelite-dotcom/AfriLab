/**
 * Demo Data Cleanup API
 * Removes demo users and their data after 24 hours
 *
 * This endpoint should be called by Cloudflare Cron Triggers
 * Configure in wrangler.toml: [triggers] crons = ["0 * * * *"]
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, platform }) => {
	// Verify cron secret for security
	const cronSecret = request.headers.get('X-Cron-Secret');
	const envSecret = platform?.env?.CRON_SECRET;

	// In production, require the secret (allow if no secret configured for dev)
	if (envSecret && cronSecret !== envSecret) {
		throw error(403, 'Unauthorized');
	}

	const db = platform?.env?.DB;
	if (!db) {
		throw error(500, 'Database not available');
	}

	const results = {
		deletedUsers: 0,
		deletedSessions: 0,
		errors: [] as string[]
	};

	try {
		// Delete expired demo lab sessions first (foreign key constraint)
		const expiredDemoSessions = await db
			.prepare(`
				SELECT ls.id
				FROM lab_sessions ls
				JOIN users u ON ls.user_id = u.id
				WHERE u.is_demo = 1 AND u.demo_expires_at < datetime('now')
			`)
			.all();

		if (expiredDemoSessions.results && expiredDemoSessions.results.length > 0) {
			const sessionIds = expiredDemoSessions.results.map((s: any) => s.id);
			for (const sessionId of sessionIds) {
				await db.prepare('DELETE FROM lab_sessions WHERE id = ?').bind(sessionId).run();
				results.deletedSessions++;
			}
		}

		// Delete expired demo users
		const deleteResult = await db
			.prepare(`
				DELETE FROM users
				WHERE is_demo = 1 AND demo_expires_at < datetime('now')
			`)
			.run();

		results.deletedUsers = deleteResult.meta?.changes || 0;

		// Also clean up any orphaned demo sessions (safety cleanup)
		await db
			.prepare(`
				DELETE FROM lab_sessions
				WHERE is_demo = 1 AND user_id NOT IN (SELECT id FROM users)
			`)
			.run();

	} catch (err) {
		results.errors.push(err instanceof Error ? err.message : 'Unknown error');
	}

	return json({
		success: true,
		message: 'Demo cleanup completed',
		results,
		timestamp: new Date().toISOString()
	});
};

// GET endpoint to check cleanup status
export const GET: RequestHandler = async ({ platform }) => {
	const db = platform?.env?.DB;
	if (!db) {
		throw error(500, 'Database not available');
	}

	try {
		const demoUserCount = await db
			.prepare('SELECT COUNT(*) as count FROM users WHERE is_demo = 1')
			.first();

		const expiredCount = await db
			.prepare(`SELECT COUNT(*) as count FROM users WHERE is_demo = 1 AND demo_expires_at < datetime('now')`)
			.first();

		const demoSessionCount = await db
			.prepare('SELECT COUNT(*) as count FROM lab_sessions WHERE is_demo = 1')
			.first();

		return json({
			status: 'ok',
			demoUsers: demoUserCount?.count || 0,
			expiredDemoUsers: expiredCount?.count || 0,
			demoSessions: demoSessionCount?.count || 0
		});
	} catch (err) {
		return json({
			status: 'error',
			message: err instanceof Error ? err.message : 'Unknown error'
		});
	}
};
