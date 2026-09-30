/**
 * HTTP Basic gate in front of /admin (docs/cms-plan/05-cms.md). An anonymous request gets a
 * plain-text 401 with no branding, so a *.workers.dev URL never shows a login form to crawlers
 * (the Safe Browsing lesson from One Man Agency). Empty credentials = gate off (local dev only).
 */
export function gateEnabled(user: string | undefined, password: string | undefined): boolean {
	return !!user && !!password;
}

function timingSafeEqual(a: string, b: string): boolean {
	const ea = new TextEncoder().encode(a);
	const eb = new TextEncoder().encode(b);
	let diff = ea.length ^ eb.length;
	for (let i = 0; i < Math.max(ea.length, eb.length); i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
	return diff === 0;
}

export function checkBasicAuth(header: string | null, user: string, password: string): boolean {
	if (!header?.startsWith('Basic ')) return false;
	let decoded: string;
	try {
		decoded = atob(header.slice(6).trim());
	} catch {
		return false;
	}
	const i = decoded.indexOf(':');
	if (i < 0) return false;
	// Compare both parts, always, so timing does not reveal which one was wrong.
	const okUser = timingSafeEqual(decoded.slice(0, i), user);
	const okPass = timingSafeEqual(decoded.slice(i + 1), password);
	return okUser && okPass;
}

export function unauthorized(): Response {
	return new Response('Unauthorized', {
		status: 401,
		headers: {
			'www-authenticate': 'Basic realm="Restricted", charset="UTF-8"',
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'no-store',
			'x-robots-tag': 'noindex, nofollow'
		}
	});
}
