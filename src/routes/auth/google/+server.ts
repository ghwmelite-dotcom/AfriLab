import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateOAuthState, buildGoogleAuthUrl } from '$lib/server/oauth';

export const GET: RequestHandler = async ({ platform }) => {
	if (!platform?.env) {
		throw redirect(303, '/auth/login?error=server');
	}

	const { SESSIONS, GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } = platform.env;

	if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
		throw redirect(303, '/auth/login?error=oauth_not_configured');
	}

	// Generate CSRF state token and store in KV with 10-min TTL
	const state = generateOAuthState();
	await SESSIONS.put(`oauth_state:${state}`, '1', { expirationTtl: 600 });

	const authUrl = buildGoogleAuthUrl(GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI, state);

	throw redirect(303, authUrl);
};
