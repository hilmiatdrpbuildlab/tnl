import { getBuild, getContent } from '$lib/server/content';

export const prerender = true;

export function GET() {
	const c = getContent();
	const { siteUrl } = getBuild();
	const noindex = new Set(c.pages.filter((p) => p.noindex).map((p) => p.slug));
	const paths = [
		...(noindex.has('home') ? [] : ['/']),
		...(['diensten', 'projecten', 'over-ons', 'contact'] as const).filter((s) => !noindex.has(s)).map((s) => `/${s}`),
		...(c.posts.length && !noindex.has('blog') ? ['/blog'] : []),
		...c.services.map((s) => `/diensten/${s.slug}`),
		...c.projects.map((p) => `/projecten/${p.slug}`),
		...c.posts.map((p) => `/blog/${p.slug}`)
	];
	const body =
		'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
		paths.map((p) => `  <url><loc>${siteUrl}${p}</loc></url>`).join('\n') +
		'\n</urlset>\n';
	return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
