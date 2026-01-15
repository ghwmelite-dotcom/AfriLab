/**
 * Database Seed API
 * Creates demo accounts and sample data for testing
 *
 * POST /api/seed - Seeds the database with demo data
 * Requires SEED_SECRET header in production
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hashPassword } from '$lib/server/auth';

interface SeedUser {
	id: string;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	role: 'student' | 'instructor' | 'admin';
	institutionId: string | null;
}

const DEMO_USERS: SeedUser[] = [
	// Super Admin
	{
		id: 'user-admin-001',
		email: 'oh84dev@gmail.com',
		password: 'angels2G9@84?',
		firstName: 'Super',
		lastName: 'Admin',
		role: 'admin',
		institutionId: 'inst-demo'
	},
	// Demo Instructor
	{
		id: 'user-instructor-demo',
		email: 'instructor@afrilab.demo',
		password: 'Demo@Instructor2024',
		firstName: 'Dr. Amara',
		lastName: 'Okonkwo',
		role: 'instructor',
		institutionId: 'inst-demo'
	},
	// Demo Students
	{
		id: 'user-student-demo-1',
		email: 'student@afrilab.demo',
		password: 'Demo@Student2024',
		firstName: 'Kwame',
		lastName: 'Asante',
		role: 'student',
		institutionId: 'inst-demo'
	},
	{
		id: 'user-student-demo-2',
		email: 'amina@afrilab.demo',
		password: 'Demo@Student2024',
		firstName: 'Amina',
		lastName: 'Okafor',
		role: 'student',
		institutionId: 'inst-demo'
	},
	{
		id: 'user-student-demo-3',
		email: 'fatima@afrilab.demo',
		password: 'Demo@Student2024',
		firstName: 'Fatima',
		lastName: 'Hassan',
		role: 'student',
		institutionId: 'inst-demo'
	}
];

// Sample lab sessions for demo
const DEMO_LAB_SESSIONS = [
	{
		id: 'session-demo-1',
		userId: 'user-student-demo-1',
		experimentId: 'chem-titration-01',
		status: 'completed',
		score: 92,
		currentStep: 5,
		timeSpentSeconds: 2340
	},
	{
		id: 'session-demo-2',
		userId: 'user-student-demo-1',
		experimentId: 'chem-spectroscopy-01',
		status: 'completed',
		score: 88,
		currentStep: 6,
		timeSpentSeconds: 3120
	},
	{
		id: 'session-demo-3',
		userId: 'user-student-demo-2',
		experimentId: 'chem-titration-01',
		status: 'completed',
		score: 95,
		currentStep: 5,
		timeSpentSeconds: 2100
	},
	{
		id: 'session-demo-4',
		userId: 'user-student-demo-2',
		experimentId: 'chem-spectroscopy-01',
		status: 'in_progress',
		score: null,
		currentStep: 3,
		timeSpentSeconds: 1500
	},
	{
		id: 'session-demo-5',
		userId: 'user-student-demo-3',
		experimentId: 'chem-titration-01',
		status: 'completed',
		score: 78,
		currentStep: 5,
		timeSpentSeconds: 2800
	}
];

export const POST: RequestHandler = async ({ platform, request }) => {
	// Security check - require secret in production
	const seedSecret = request.headers.get('X-Seed-Secret');
	const envSecret = platform?.env?.SEED_SECRET;

	// In production, require the secret
	if (envSecret && seedSecret !== envSecret) {
		throw error(403, 'Invalid seed secret');
	}

	const db = platform?.env?.DB;
	if (!db) {
		throw error(500, 'Database not available');
	}

	const results = {
		users: { created: 0, skipped: 0, errors: [] as string[] },
		sessions: { created: 0, skipped: 0, errors: [] as string[] }
	};

	// Create users
	for (const user of DEMO_USERS) {
		try {
			// Check if user already exists
			const existing = await db
				.prepare('SELECT id FROM users WHERE email = ?')
				.bind(user.email.toLowerCase())
				.first();

			if (existing) {
				results.users.skipped++;
				continue;
			}

			// Hash password
			const passwordHash = await hashPassword(user.password);

			// Insert user
			await db
				.prepare(
					`INSERT INTO users (id, email, password_hash, first_name, last_name, role, institution_id, is_active, email_verified)
					 VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)`
				)
				.bind(
					user.id,
					user.email.toLowerCase(),
					passwordHash,
					user.firstName,
					user.lastName,
					user.role,
					user.institutionId
				)
				.run();

			results.users.created++;
		} catch (err) {
			results.users.errors.push(`${user.email}: ${err instanceof Error ? err.message : 'Unknown error'}`);
		}
	}

	// Create demo lab sessions
	for (const session of DEMO_LAB_SESSIONS) {
		try {
			// Check if session already exists
			const existing = await db
				.prepare('SELECT id FROM lab_sessions WHERE id = ?')
				.bind(session.id)
				.first();

			if (existing) {
				results.sessions.skipped++;
				continue;
			}

			// Insert session
			await db
				.prepare(
					`INSERT INTO lab_sessions (id, user_id, experiment_id, status, score, current_step, time_spent_seconds, completed_at)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
				)
				.bind(
					session.id,
					session.userId,
					session.experimentId,
					session.status,
					session.score,
					session.currentStep,
					session.timeSpentSeconds,
					session.status === 'completed' ? new Date().toISOString() : null
				)
				.run();

			results.sessions.created++;
		} catch (err) {
			results.sessions.errors.push(`${session.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
		}
	}

	return json({
		success: true,
		message: 'Database seeded successfully',
		results,
		accounts: {
			admin: {
				email: 'oh84dev@gmail.com',
				password: 'angels2G9@84?',
				role: 'admin'
			},
			instructor: {
				email: 'instructor@afrilab.demo',
				password: 'Demo@Instructor2024',
				role: 'instructor'
			},
			student: {
				email: 'student@afrilab.demo',
				password: 'Demo@Student2024',
				role: 'student'
			}
		}
	});
};

// GET endpoint to check seed status
export const GET: RequestHandler = async ({ platform }) => {
	const db = platform?.env?.DB;
	if (!db) {
		throw error(500, 'Database not available');
	}

	try {
		const userCount = await db.prepare('SELECT COUNT(*) as count FROM users').first();
		const sessionCount = await db.prepare('SELECT COUNT(*) as count FROM lab_sessions').first();
		const experimentCount = await db.prepare('SELECT COUNT(*) as count FROM experiments').first();

		return json({
			status: 'ok',
			counts: {
				users: userCount?.count || 0,
				labSessions: sessionCount?.count || 0,
				experiments: experimentCount?.count || 0
			},
			demoAccountsExist: {
				admin: await db.prepare('SELECT id FROM users WHERE email = ?').bind('oh84dev@gmail.com').first() !== null,
				instructor: await db.prepare('SELECT id FROM users WHERE email = ?').bind('instructor@afrilab.demo').first() !== null,
				student: await db.prepare('SELECT id FROM users WHERE email = ?').bind('student@afrilab.demo').first() !== null
			}
		});
	} catch (err) {
		return json({
			status: 'error',
			message: err instanceof Error ? err.message : 'Unknown error'
		});
	}
};
