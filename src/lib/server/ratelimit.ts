/**
 * Contact-form rate limit: 5 submissions per IP per 10 minutes (docs/cms-plan/06-public-site.md).
 *
 * The Cloudflare rate-limit binding only supports 10 s and 60 s periods, so it is the first line
 * (5 per 60 s, SUBMIT_LIMITER in wrangler.jsonc). The 10-minute window is kept in the Workers
 * Cache API, keyed by a hash of the IP (the IP itself is never stored). The cache is per data
 * centre, which is fine for one visitor on one connection.
 */
export const WINDOW_SECONDS = 600;
export const MAX_IN_WINDOW = 5;

async function ipKey(ip: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('tnl-submit:' + ip));
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

/** Pure window logic, unit-tested: keep timestamps inside the window, allow if under the cap. */
export function slide(timestamps: number[], now: number, windowMs = WINDOW_SECONDS * 1000, max = MAX_IN_WINDOW) {
	const kept = timestamps.filter((t) => now - t < windowMs);
	const allowed = kept.length < max;
	return { allowed, timestamps: allowed ? [...kept, now] : kept };
}

export interface LimiterDeps {
	binding?: { limit(opts: { key: string }): Promise<{ success: boolean }> };
	cache?: Cache;
	now?: number;
}

export async function allowSubmission(ip: string, deps: LimiterDeps): Promise<boolean> {
	const key = await ipKey(ip || 'unknown');
	if (deps.binding) {
		const { success } = await deps.binding.limit({ key });
		if (!success) return false;
	}
	if (!deps.cache) return true;
	const url = `https://ratelimit.internal/submit/${key}`;
	const hit = await deps.cache.match(url);
	const previous: number[] = hit ? await hit.json() : [];
	const { allowed, timestamps } = slide(previous, deps.now ?? Date.now());
	await deps.cache.put(
		url,
		new Response(JSON.stringify(timestamps), {
			headers: { 'content-type': 'application/json', 'cache-control': `max-age=${WINDOW_SECONDS}` }
		})
	);
	return allowed;
}
