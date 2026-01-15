/**
 * Demo Login API
 * Creates demo users on-the-fly and logs them in directly
 * Demo data is marked for automatic cleanup after 24 hours
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hashPassword, createSession } from '$lib/server/auth';

interface DemoUser {
	id: string;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	role: 'student' | 'instructor' | 'admin';
	institutionId: string;
}

const DEMO_USERS: Record<string, DemoUser> = {
	student: {
		id: 'demo-student-001',
		email: 'demo.student@afrilab.io',
		password: 'DemoStudent2024!',
		firstName: 'Demo',
		lastName: 'Student',
		role: 'student',
		institutionId: 'inst-demo'
	},
	instructor: {
		id: 'demo-instructor-001',
		email: 'demo.instructor@afrilab.io',
		password: 'DemoInstructor2024!',
		firstName: 'Demo',
		lastName: 'Instructor',
		role: 'instructor',
		institutionId: 'inst-demo'
	},
	admin: {
		id: 'demo-admin-001',
		email: 'oh84dev@gmail.com',
		password: 'angels2G9@84?',
		firstName: 'Super',
		lastName: 'Admin',
		role: 'admin',
		institutionId: 'inst-demo'
	}
};

export const POST: RequestHandler = async ({ request, platform, cookies }) => {
	if (!platform?.env) {
		throw error(500, 'Server configuration error');
	}

	const { DB, SESSIONS } = platform.env;
	const { role } = await request.json();

	if (!role || !DEMO_USERS[role]) {
		throw error(400, 'Invalid demo role. Use: student, instructor, or admin');
	}

	const demoUser = DEMO_USERS[role];

	try {
		// Ensure demo institution exists
		const institutionExists = await DB
			.prepare('SELECT id FROM institutions WHERE id = ?')
			.bind('inst-demo')
			.first();

		if (!institutionExists) {
			await DB
				.prepare(`INSERT INTO institutions (id, name, code, country) VALUES (?, ?, ?, ?)`)
				.bind('inst-demo', 'AfriLab Demo University', 'DEMO', 'Pan-African')
				.run();
		}

		// Check if demo user exists
		let userId = demoUser.id;
		const existingUser = await DB
			.prepare('SELECT id FROM users WHERE id = ? OR email = ?')
			.bind(demoUser.id, demoUser.email.toLowerCase())
			.first();

		if (!existingUser) {
			// Create demo user
			const passwordHash = await hashPassword(demoUser.password);

			await DB
				.prepare(
					`INSERT INTO users (id, email, password_hash, first_name, last_name, role, institution_id, is_active, email_verified, is_demo, demo_expires_at)
					 VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, 1, datetime('now', '+24 hours'))`
				)
				.bind(
					demoUser.id,
					demoUser.email.toLowerCase(),
					passwordHash,
					demoUser.firstName,
					demoUser.lastName,
					demoUser.role,
					demoUser.institutionId
				)
				.run();
		} else {
			userId = existingUser.id as string;
			// Update demo expiration
			await DB
				.prepare(`UPDATE users SET demo_expires_at = datetime('now', '+24 hours') WHERE id = ?`)
				.bind(userId)
				.run();
		}

		// Create session
		const session = await createSession(SESSIONS, userId);

		// Set cookie
		cookies.set('session', session.id, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 // 24 hours for demo
		});

		// Determine redirect path
		const redirectPath = demoUser.role === 'instructor' || demoUser.role === 'admin'
			? '/instructor'
			: '/dashboard';

		return json({
			success: true,
			redirect: redirectPath,
			user: {
				firstName: demoUser.firstName,
				lastName: demoUser.lastName,
				role: demoUser.role
			}
		});
	} catch (err) {
		console.error('Demo login error:', err);
		throw error(500, `Failed to create demo session: ${err instanceof Error ? err.message : 'Unknown error'}`);
	}
};
