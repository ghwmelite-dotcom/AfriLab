import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { getUserByEmail, verifyPassword, createSession, createSessionCookie } from '$server/auth';

export const actions: Actions = {
	default: async ({ request, platform, cookies }) => {
		if (!platform?.env) {
			return fail(500, { message: 'Server configuration error' });
		}

		const { DB, SESSIONS } = platform.env;

		const formData = await request.formData();
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();

		// Validate input
		if (!email || !password) {
			return fail(400, { message: 'Email and password are required' });
		}

		try {
			// Get user by email
			const userData = await getUserByEmail(DB, email);

			if (!userData) {
				return fail(401, { message: 'Invalid email or password' });
			}

			// Check if this is an OAuth-only account
			if (userData.passwordHash === 'OAUTH_NO_PASSWORD') {
				return fail(401, {
					message: 'This account uses Google sign-in. Please use the "Sign in with Google" button.'
				});
			}

			// Verify password
			const isValid = await verifyPassword(password, userData.passwordHash);

			if (!isValid) {
				return fail(401, { message: 'Invalid email or password' });
			}

			// Create session
			const session = await createSession(SESSIONS, userData.user.id);

			// Set cookie
			cookies.set('session', session.id, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});

			// Redirect based on role
			const redirectPath = userData.user.role === 'instructor' ? '/instructor' : '/dashboard';
			throw redirect(303, redirectPath);
		} catch (error) {
			if (error instanceof Response) throw error; // Re-throw redirects
			console.error('Login error:', error);
			return fail(500, { message: 'An error occurred during login. Please try again.' });
		}
	}
};
