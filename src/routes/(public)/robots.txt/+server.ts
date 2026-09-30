import { getBuild } from '$lib/server/content';

export const prerender = true;

export function GET() {
	const { siteUrl, noindex } = getBuild();
	// Until the domain move the *.workers.dev build blocks all crawlers.
	const body = noindex
		? 'User-agent: *\nDisallow: /\n'
		: `User-agent: *\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
	return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
