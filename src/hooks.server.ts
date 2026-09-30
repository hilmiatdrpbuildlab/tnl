/**
 * 1. HTTP Basic gate for /admin, before anything else (plain 401, no branding).
 * 2. Better Auth endpoints under /admin/api/auth.
 * 3. Session lookup for every other /admin request; the admin layout and every action and
 *    endpoint check it again (docs/cms-plan/08-security.md).
 */
import { building } from '$app/environment';
import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { AUTH_BASE_PATH } from '$lib/server/auth-config';
import { env } from '$lib/server/env';
import { checkBasicAuth, gateEnabled, unauthorized } from '$lib/server/gate';

const isAdmin = (path: string) => path === '/admin' || path.startsWith('/admin/');

/** The static-file headers from _headers, for responses the Worker renders itself. */
const SECURITY_HEADERS: Record<string, string> = {
	'strict-transport-security': 'max-age=31536000; includeSubDomains',
	'x-content-type-options': 'nosniff',
	'referrer-policy': 'strict-origin-when-cross-origin',
	'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()',
	'x-frame-options': 'DENY'
};

function secure(response: Response): Response {
	for (const [k, v] of Object.entries(SECURITY_HEADERS)) if (!response.headers.has(k)) response.headers.set(k, v);
	const csp = response.headers.get('content-security-policy');
	if (csp && !csp.includes('frame-ancestors')) response.headers.set('content-security-policy', `${csp}; frame-ancestors 'none'`);
	return response;
}

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;
	event.locals.session = null;
	event.locals.user = null;

	if (building) return resolve(event);
	if (!isAdmin(path)) return secure(await resolve(event));

	const user = env.ADMIN_GATE_USER;
	const password = env.ADMIN_GATE_PASSWORD;
	if (gateEnabled(user, password)) {
		if (!checkBasicAuth(event.request.headers.get('authorization'), user!, password!)) return secure(unauthorized());
	}

	const { getAuth } = await import('$lib/server/auth');
	const auth = await getAuth();

	if (path.startsWith(AUTH_BASE_PATH)) {
		return secure(await svelteKitHandler({ auth, event, resolve, building }));
	}

	const session = await auth.api.getSession({ headers: event.request.headers });
	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	const response = await resolve(event);
	response.headers.set('x-robots-tag', 'noindex, nofollow');
	response.headers.set('cache-control', 'no-store');
	return secure(response);
};
