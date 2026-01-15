import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createUser, validateInstitutionCode, createSession, getUserByEmail } from '$server/auth';

export const actions: Actions = {
	default: async ({ request, platform, cookies }) => {
		if (!platform?.env) {
			return fail(500, { message: 'Server configuration error' });
		}

		const { DB, SESSIONS } = platform.env;

		const formData = await request.formData();
		const firstName = formData.get('firstName')?.toString();
		const lastName = formData.get('lastName')?.toString();
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();
		const institutionCode = formData.get('institutionCode')?.toString();
		const role = formData.get('role')?.toString() as 'student' | 'instructor';

		// Validate required fields
		if (!firstName || !lastName || !email || !password) {
			return fail(400, { message: 'All fields are required' });
		}

		// Validate password length
		if (password.length < 8) {
			return fail(400, { message: 'Password must be at least 8 characters' });
		}

		// Validate email format
		if (!email.includes('@')) {
			return fail(400, { message: 'Please enter a valid email address' });
		}

		// Check if email already exists
		const existingUser = await getUserByEmail(DB, email);
		if (existingUser) {
			return fail(400, { message: 'An account with this email already exists' });
		}

		// Validate institution code if provided
		let institutionId: string | undefined;
		if (institutionCode) {
			institutionId = await validateInstitutionCode(DB, institutionCode) ?? undefined;
			if (!institutionId) {
				return fail(400, { message: 'Invalid institution code. Please check and try again.' });
			}
		}

		try {
			// Create user
			const user = await createUser(DB, {
				email,
				password,
				firstName,
				lastName,
				role: role || 'student',
				institutionId
			});

			// Create session
			const session = await createSession(SESSIONS, user.id);

			// Set cookie
			cookies.set('session', session.id, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});

			// Redirect to dashboard
			throw redirect(303, '/dashboard');
		} catch (error) {
			if (error instanceof Response) throw error; // Re-throw redirects

			console.error('Registration error:', error);
			return fail(500, { message: 'Failed to create account. Please try again.' });
		}
	}
};
