// See https://svelte.dev/docs/kit/types#app.d.ts
import type { Auth } from '$lib/server/auth-config';

type AuthSession = NonNullable<Awaited<ReturnType<Auth['api']['getSession']>>>;

declare global {
	namespace App {
		interface Locals {
			session: AuthSession['session'] | null;
			user: AuthSession['user'] | null;
		}
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage & { default: Cache };
			cf?: IncomingRequestCfProperties;
		}
		interface Error {
			message: string;
		}
	}

	/** Worker bindings (wrangler.jsonc) and variables. Secrets are read through $env/dynamic/private. */
	interface Env {
		ASSETS: Fetcher;
		SUBMIT_LIMITER?: { limit(opts: { key: string }): Promise<{ success: boolean }> };
	}
}

export {};
