import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { deleteSession, parseSessionCookie } from '$server/auth';

export const POST: RequestHandler = async ({ request, platform, cookies }) => {
	if (!platform?.env) {
		throw redirect(303, '/auth/login');
	}

	const { SESSIONS } = platform.env;

	// Get session ID from cookie
	const sessionId = parseSessionCookie(request.headers.get('cookie'));

	if (sessionId) {
		try {
			// Delete session from KV
			await deleteSession(SESSIONS, sessionId);
		} catch (error) {
			console.error('Logout error:', error);
			// Continue with logout even if session deletion fails
		}
	}

	// Clear cookie
	cookies.delete('session', { path: '/' });

	throw redirect(303, '/auth/login');
};

export const GET: RequestHandler = async ({ request, platform, cookies }) => {
	// Also handle GET for convenience
	if (!platform?.env) {
		throw redirect(303, '/auth/login');
	}

	const { SESSIONS } = platform.env;
	const sessionId = parseSessionCookie(request.headers.get('cookie'));

	if (sessionId) {
		try {
			await deleteSession(SESSIONS, sessionId);
		} catch (error) {
			console.error('Logout error:', error);
			// Continue with logout even if session deletion fails
		}
	}

	cookies.delete('session', { path: '/' });

	throw redirect(303, '/auth/login');
};
