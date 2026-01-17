import type { Handle } from '@sveltejs/kit';
import { parseSessionCookie, getSession, getUserById } from '$server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	// Initialize locals
	event.locals.user = null;
	event.locals.session = null;

	// Get platform env (Cloudflare bindings)
	const platform = event.platform;
	if (!platform?.env) {
		return resolve(event);
	}

	const { DB, SESSIONS } = platform.env;

	// Parse session cookie
	const sessionId = parseSessionCookie(event.request.headers.get('cookie'));

	if (sessionId) {
		try {
			// Get session from KV
			const session = await getSession(SESSIONS, sessionId);

			if (session) {
				// Get user from database
				const user = await getUserById(DB, session.userId);

				if (user) {
					event.locals.user = user;
					event.locals.session = session;
				}
			}
		} catch (error) {
			console.error('Session validation error:', error);
			// Continue without auth on error - let the page handle it
		}
	}

	// Protected routes
	const protectedRoutes = ['/dashboard', '/instructor', '/labs', '/api/ai', '/api/session'];
	const isProtectedRoute = protectedRoutes.some((route) =>
		event.url.pathname.startsWith(route)
	);

	if (isProtectedRoute && !event.locals.user) {
		// Redirect to login for page requests
		if (!event.url.pathname.startsWith('/api/')) {
			return new Response(null, {
				status: 302,
				headers: {
					location: `/auth/login?redirect=${encodeURIComponent(event.url.pathname)}`
				}
			});
		}

		// Return 401 for API requests
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Instructor-only routes
	const instructorRoutes = ['/instructor'];
	const isInstructorRoute = instructorRoutes.some((route) =>
		event.url.pathname.startsWith(route)
	);

	if (isInstructorRoute && event.locals.user?.role === 'student') {
		return new Response(null, {
			status: 302,
			headers: { location: '/dashboard' }
		});
	}

	return resolve(event);
};
