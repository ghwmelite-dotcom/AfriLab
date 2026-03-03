const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

export interface GoogleUserInfo {
	id: string;
	email: string;
	verified_email: boolean;
	name: string;
	given_name: string;
	family_name: string;
	picture: string;
}

export interface GoogleTokens {
	access_token: string;
	id_token: string;
	token_type: string;
	expires_in: number;
}

/**
 * Generate a cryptographically random state token for CSRF protection
 */
export function generateOAuthState(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return btoa(String.fromCharCode(...bytes))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
}

/**
 * Build the Google OAuth consent screen URL
 */
export function buildGoogleAuthUrl(
	clientId: string,
	redirectUri: string,
	state: string
): string {
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: 'code',
		scope: 'openid email profile',
		state,
		access_type: 'online',
		prompt: 'select_account'
	});

	return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access tokens
 */
export async function exchangeCodeForTokens(
	code: string,
	clientId: string,
	clientSecret: string,
	redirectUri: string
): Promise<GoogleTokens> {
	const response = await fetch(GOOGLE_TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			code,
			client_id: clientId,
			client_secret: clientSecret,
			redirect_uri: redirectUri,
			grant_type: 'authorization_code'
		})
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Token exchange failed: ${error}`);
	}

	return response.json() as Promise<GoogleTokens>;
}

/**
 * Fetch user profile information from Google
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
	const response = await fetch(GOOGLE_USERINFO_URL, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch Google user info: ${response.statusText}`);
	}

	return response.json() as Promise<GoogleUserInfo>;
}
