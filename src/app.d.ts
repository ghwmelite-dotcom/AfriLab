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
