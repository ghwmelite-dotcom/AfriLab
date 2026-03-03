/// <reference types="@cloudflare/workers-types" />

declare global {
	namespace App {
		interface Locals {
			user: import('$types').User | null;
			session: import('$types').Session | null;
		}

		interface Platform {
			env: {
				DB: D1Database;
				STORAGE: R2Bucket;
				SESSIONS: KVNamespace;
				AI: Ai;
				GOOGLE_CLIENT_ID: string;
				GOOGLE_CLIENT_SECRET: string;
				GOOGLE_REDIRECT_URI: string;
			};
			context: ExecutionContext;
			caches: CacheStorage & { default: Cache };
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
