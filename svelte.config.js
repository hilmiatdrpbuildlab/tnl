import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({ config: 'wrangler.jsonc' }),
		// Inline the (small) stylesheet so it does not block the first paint on mobile.
		inlineStyleThreshold: 40_000,
		// CSP in hash mode (see docs/cms-plan/08-security.md). SvelteKit writes a <meta> CSP into
		// prerendered pages and a header on Worker responses. frame-ancestors lives in _headers.
		csp: {
			mode: 'hash',
			directives: {
				'default-src': ['self'],
				'script-src': ['self', 'https://challenges.cloudflare.com'],
				'frame-src': ['https://challenges.cloudflare.com'],
				'img-src': ['self', 'data:', 'blob:'],
				'style-src': ['self', 'unsafe-inline'],
				'font-src': ['self'],
				'connect-src': ['self'],
				'form-action': ['self'],
				'base-uri': ['self'],
				'object-src': ['none']
			}
		},
		prerender: {
			// Pages nothing links to: the no-JS form results, the 404, and the generated files.
			entries: ['*', '/bedankt', '/formulier-fout', '/404', '/sitemap.xml', '/robots.txt'],
			// /blog/[slug] has no entries while no post is published.
			handleUnseenRoutes: ({ routes, message }) => {
				if (routes.every((r) => r === '/(public)/blog/[slug]')) return;
				throw new Error(message);
			},
			handleHttpError: ({ path, message }) => {
				// /admin is never linked from the public site; anything else missing is a real error.
				if (path.startsWith('/admin')) return;
				throw new Error(message);
			},
			handleMissingId: 'warn'
		}
	}
};

export default config;
