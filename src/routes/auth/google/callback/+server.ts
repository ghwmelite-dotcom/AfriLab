import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exchangeCodeForTokens, getGoogleUserInfo } from '$lib/server/oauth';
import {
	getUserByGoogleId,
	getUserByEmail,
	linkGoogleAccount,
	createSession
} from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, platform, cookies }) => {
	if (!platform?.env) {
		throw redirect(303, '/auth/login?error=server');
	}

	const { DB, SESSIONS, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } =
		platform.env;

	// Check for errors from Google
	const errorParam = url.searchParams.get('error');
	if (errorParam) {
		throw redirect(303, `/auth/login?error=google_${errorParam}`);
	}

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	if (!code || !state) {
		throw redirect(303, '/auth/login?error=oauth_invalid');
	}

	// Validate CSRF state token
	const storedState = await SESSIONS.get(`oauth_state:${state}`);
	if (!storedState) {
		throw redirect(303, '/auth/login?error=oauth_expired');
	}
	// Delete used state token
	await SESSIONS.delete(`oauth_state:${state}`);

	try {
		// Exchange code for tokens
		const tokens = await exchangeCodeForTokens(
			code,
			GOOGLE_CLIENT_ID,
			GOOGLE_CLIENT_SECRET,
			GOOGLE_REDIRECT_URI
		);

		// Get Google user profile
		const googleUser = await getGoogleUserInfo(tokens.access_token);

		// Case 1: Existing user with this Google ID — instant login
		const existingGoogleUser = await getUserByGoogleId(DB, googleUser.id);
		if (existingGoogleUser) {
			const session = await createSession(SESSIONS, existingGoogleUser.id);
			cookies.set('session', session.id, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7
			});
			const redirectPath =
				existingGoogleUser.role === 'instructor' ? '/instructor' : '/dashboard';
			throw redirect(303, redirectPath);
		}

		// Case 2: Existing user with same email — link Google account
		const existingEmailUser = await getUserByEmail(DB, googleUser.email);
		if (existingEmailUser) {
			await linkGoogleAccount(DB, existingEmailUser.user.id, googleUser.id, googleUser.picture);
			const session = await createSession(SESSIONS, existingEmailUser.user.id);
			cookies.set('session', session.id, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7
			});
			const redirectPath =
				existingEmailUser.user.role === 'instructor' ? '/instructor' : '/dashboard';
			throw redirect(303, redirectPath);
		}

		// Case 3: New user — store pending signup in KV, redirect to role selection
		const pendingId = crypto.randomUUID();
		await SESSIONS.put(
			`google_pending:${pendingId}`,
			JSON.stringify({
				googleId: googleUser.id,
				email: googleUser.email,
				firstName: googleUser.given_name || googleUser.name?.split(' ')[0] || '',
				lastName: googleUser.family_name || googleUser.name?.split(' ').slice(1).join(' ') || '',
				avatarUrl: googleUser.picture
			}),
			{ expirationTtl: 900 } // 15 minutes
		);

		cookies.set('google_pending', pendingId, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 900
		});

		throw redirect(303, '/auth/google/complete');
	} catch (error) {
		if (error instanceof Response) throw error; // Re-throw redirects
		console.error('Google OAuth callback error:', error);
		throw redirect(303, '/auth/login?error=oauth_failed');
	}
};
