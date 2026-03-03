import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createOAuthUser, createSession } from '$lib/server/auth';

interface PendingGoogleUser {
	googleId: string;
	email: string;
	firstName: string;
	lastName: string;
	avatarUrl?: string;
}

export const load: PageServerLoad = async ({ cookies, platform }) => {
	if (!platform?.env) {
		throw redirect(303, '/auth/login?error=server');
	}

	const pendingId = cookies.get('google_pending');
	if (!pendingId) {
		throw redirect(303, '/auth/login?error=oauth_expired');
	}

	const pendingData = await platform.env.SESSIONS.get(`google_pending:${pendingId}`);
	if (!pendingData) {
		cookies.delete('google_pending', { path: '/' });
		throw redirect(303, '/auth/login?error=oauth_expired');
	}

	const pending: PendingGoogleUser = JSON.parse(pendingData);

	return {
		email: pending.email,
		firstName: pending.firstName,
		lastName: pending.lastName,
		avatarUrl: pending.avatarUrl
	};
};

export const actions: Actions = {
	default: async ({ request, cookies, platform }) => {
		if (!platform?.env) {
			return fail(500, { message: 'Server configuration error' });
		}

		const { DB, SESSIONS } = platform.env;

		const pendingId = cookies.get('google_pending');
		if (!pendingId) {
			throw redirect(303, '/auth/login?error=oauth_expired');
		}

		const pendingData = await SESSIONS.get(`google_pending:${pendingId}`);
		if (!pendingData) {
			cookies.delete('google_pending', { path: '/' });
			throw redirect(303, '/auth/login?error=oauth_expired');
		}

		const pending: PendingGoogleUser = JSON.parse(pendingData);

		const formData = await request.formData();
		const role = formData.get('role')?.toString() as 'student' | 'instructor';

		if (!role || !['student', 'instructor'].includes(role)) {
			return fail(400, { message: 'Please select a role' });
		}

		try {
			// Create the OAuth user
			const user = await createOAuthUser(DB, {
				email: pending.email,
				firstName: pending.firstName,
				lastName: pending.lastName,
				googleId: pending.googleId,
				avatarUrl: pending.avatarUrl,
				role
			});

			// Clean up pending data
			await SESSIONS.delete(`google_pending:${pendingId}`);
			cookies.delete('google_pending', { path: '/' });

			// Create session
			const session = await createSession(SESSIONS, user.id);
			cookies.set('session', session.id, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7
			});

			const redirectPath = role === 'instructor' ? '/instructor' : '/dashboard';
			throw redirect(303, redirectPath);
		} catch (error) {
			if (error instanceof Response) throw error;
			console.error('Google OAuth complete error:', error);
			return fail(500, { message: 'Failed to create account. Please try again.' });
		}
	}
};
