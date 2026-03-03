import type { User, Session } from '$types';

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Hash password using Web Crypto API (PBKDF2)
 */
export async function hashPassword(password: string): Promise<string> {
	const encoder = new TextEncoder();
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const passwordData = encoder.encode(password);

	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		passwordData,
		'PBKDF2',
		false,
		['deriveBits']
	);

	const hash = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt: salt,
			iterations: 100000,
			hash: 'SHA-256'
		},
		keyMaterial,
		256
	);

	const hashArray = new Uint8Array(hash);
	const combined = new Uint8Array(salt.length + hashArray.length);
	combined.set(salt);
	combined.set(hashArray, salt.length);

	return btoa(String.fromCharCode(...combined));
}

/**
 * Verify password against stored hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	const encoder = new TextEncoder();
	const combined = Uint8Array.from(atob(storedHash), (c) => c.charCodeAt(0));
	const salt = combined.slice(0, 16);
	const storedHashBytes = combined.slice(16);

	const passwordData = encoder.encode(password);

	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		passwordData,
		'PBKDF2',
		false,
		['deriveBits']
	);

	const hash = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt: salt,
			iterations: 100000,
			hash: 'SHA-256'
		},
		keyMaterial,
		256
	);

	const hashArray = new Uint8Array(hash);

	if (hashArray.length !== storedHashBytes.length) return false;

	let match = true;
	for (let i = 0; i < hashArray.length; i++) {
		if (hashArray[i] !== storedHashBytes[i]) match = false;
	}

	return match;
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return btoa(String.fromCharCode(...bytes))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
}

/**
 * Create a new session in KV store
 */
export async function createSession(
	kv: KVNamespace,
	userId: string
): Promise<Session> {
	const sessionId = generateSessionToken();
	const expiresAt = new Date(Date.now() + SESSION_DURATION);

	const session: Session = {
		id: sessionId,
		userId,
		expiresAt
	};

	await kv.put(
		`session:${sessionId}`,
		JSON.stringify(session),
		{ expirationTtl: Math.floor(SESSION_DURATION / 1000) }
	);

	return session;
}

/**
 * Get session from KV store
 */
export async function getSession(
	kv: KVNamespace,
	sessionId: string
): Promise<Session | null> {
	try {
		const data = await kv.get(`session:${sessionId}`);
		if (!data) return null;

		const session = JSON.parse(data) as Session;
		session.expiresAt = new Date(session.expiresAt);

		if (session.expiresAt < new Date()) {
			await deleteSession(kv, sessionId);
			return null;
		}

		return session;
	} catch (error) {
		console.error('getSession error:', error);
		return null;
	}
}

/**
 * Delete session from KV store
 */
export async function deleteSession(kv: KVNamespace, sessionId: string): Promise<void> {
	await kv.delete(`session:${sessionId}`);
}

/**
 * Get user from database by ID
 */
export async function getUserById(db: D1Database, userId: string): Promise<User | null> {
	try {
		const result = await db
			.prepare('SELECT id, email, first_name, last_name, role, institution_id, avatar_url, auth_provider, created_at FROM users WHERE id = ?')
			.bind(userId)
			.first();

		if (!result) return null;

		return {
			id: result.id as string,
			email: result.email as string,
			firstName: result.first_name as string,
			lastName: result.last_name as string,
			role: result.role as 'student' | 'instructor' | 'admin',
			institutionId: result.institution_id as string | null,
			avatarUrl: (result.avatar_url as string | null) ?? undefined,
			authProvider: (result.auth_provider as 'email' | 'google') ?? 'email',
			createdAt: new Date(result.created_at as string)
		};
	} catch (error) {
		console.error('getUserById error:', error);
		return null;
	}
}

/**
 * Get user from database by email
 */
export async function getUserByEmail(db: D1Database, email: string): Promise<{ user: User; passwordHash: string } | null> {
	try {
		const result = await db
			.prepare('SELECT id, email, password_hash, first_name, last_name, role, institution_id, avatar_url, auth_provider, created_at FROM users WHERE email = ?')
			.bind(email.toLowerCase())
			.first();

		if (!result) return null;

		return {
			user: {
				id: result.id as string,
				email: result.email as string,
				firstName: result.first_name as string,
				lastName: result.last_name as string,
				role: result.role as 'student' | 'instructor' | 'admin',
				institutionId: result.institution_id as string | null,
				avatarUrl: (result.avatar_url as string | null) ?? undefined,
				authProvider: (result.auth_provider as 'email' | 'google') ?? 'email',
				createdAt: new Date(result.created_at as string)
			},
			passwordHash: result.password_hash as string
		};
	} catch (error) {
		console.error('getUserByEmail error:', error);
		return null;
	}
}

/**
 * Create a new user
 */
export async function createUser(
	db: D1Database,
	data: {
		email: string;
		password: string;
		firstName: string;
		lastName: string;
		role?: 'student' | 'instructor' | 'admin';
		institutionId?: string;
	}
): Promise<User> {
	const id = crypto.randomUUID();
	const passwordHash = await hashPassword(data.password);

	await db
		.prepare(
			`INSERT INTO users (id, email, password_hash, first_name, last_name, role, institution_id)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`
		)
		.bind(
			id,
			data.email.toLowerCase(),
			passwordHash,
			data.firstName,
			data.lastName,
			data.role || 'student',
			data.institutionId || null
		)
		.run();

	return {
		id,
		email: data.email.toLowerCase(),
		firstName: data.firstName,
		lastName: data.lastName,
		role: data.role || 'student',
		institutionId: data.institutionId || null,
		createdAt: new Date()
	};
}

/**
 * Get user from database by Google ID
 */
export async function getUserByGoogleId(db: D1Database, googleId: string): Promise<User | null> {
	try {
		const result = await db
			.prepare('SELECT id, email, first_name, last_name, role, institution_id, avatar_url, auth_provider, created_at FROM users WHERE google_id = ?')
			.bind(googleId)
			.first();

		if (!result) return null;

		return {
			id: result.id as string,
			email: result.email as string,
			firstName: result.first_name as string,
			lastName: result.last_name as string,
			role: result.role as 'student' | 'instructor' | 'admin',
			institutionId: result.institution_id as string | null,
			avatarUrl: (result.avatar_url as string | null) ?? undefined,
			authProvider: result.auth_provider as 'email' | 'google',
			createdAt: new Date(result.created_at as string)
		};
	} catch (error) {
		console.error('getUserByGoogleId error:', error);
		return null;
	}
}

/**
 * Create a new user via OAuth (no password required)
 */
export async function createOAuthUser(
	db: D1Database,
	data: {
		email: string;
		firstName: string;
		lastName: string;
		googleId: string;
		avatarUrl?: string;
		role?: 'student' | 'instructor' | 'admin';
	}
): Promise<User> {
	const id = crypto.randomUUID();

	await db
		.prepare(
			`INSERT INTO users (id, email, password_hash, first_name, last_name, role, google_id, avatar_url, auth_provider, email_verified)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'google', 1)`
		)
		.bind(
			id,
			data.email.toLowerCase(),
			'OAUTH_NO_PASSWORD',
			data.firstName,
			data.lastName,
			data.role || 'student',
			data.googleId,
			data.avatarUrl || null
		)
		.run();

	return {
		id,
		email: data.email.toLowerCase(),
		firstName: data.firstName,
		lastName: data.lastName,
		role: data.role || 'student',
		institutionId: null,
		avatarUrl: data.avatarUrl,
		authProvider: 'google',
		createdAt: new Date()
	};
}

/**
 * Link a Google account to an existing email/password user
 */
export async function linkGoogleAccount(
	db: D1Database,
	userId: string,
	googleId: string,
	avatarUrl?: string
): Promise<void> {
	await db
		.prepare(
			`UPDATE users SET google_id = ?, avatar_url = COALESCE(avatar_url, ?), updated_at = datetime('now') WHERE id = ?`
		)
		.bind(googleId, avatarUrl || null, userId)
		.run();
}

/**
 * Validate institution code and return institution ID
 */
export async function validateInstitutionCode(db: D1Database, code: string): Promise<string | null> {
	try {
		const result = await db
			.prepare('SELECT id FROM institutions WHERE code = ?')
			.bind(code.toUpperCase())
			.first();

		return result ? (result.id as string) : null;
	} catch (error) {
		console.error('validateInstitutionCode error:', error);
		return null;
	}
}

/**
 * Parse session cookie
 */
export function parseSessionCookie(cookieHeader: string | null): string | null {
	if (!cookieHeader) return null;

	const cookies = cookieHeader.split(';').map((c) => c.trim());
	const sessionCookie = cookies.find((c) => c.startsWith('session='));

	if (!sessionCookie) return null;

	return sessionCookie.split('=')[1];
}

/**
 * Create session cookie header
 */
export function createSessionCookie(sessionId: string, maxAge: number = SESSION_DURATION / 1000): string {
	return `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

/**
 * Create expired session cookie (for logout)
 */
export function createExpiredSessionCookie(): string {
	return 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
}
