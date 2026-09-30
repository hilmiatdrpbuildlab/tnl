import { getBuild, getContent, getSiteJs, layoutData } from '$lib/server/content';

// Every public route is prerendered from published rows only (docs/cms-plan/06-public-site.md).
export const prerender = true;
export const trailingSlash = 'never';
// No framework JavaScript on the public site: prerendered HTML plus static/site.<hash>.js,
// which applies the same actions (src/lib/enhance/site.ts). Keeps mobile LCP low.
export const csr = false;

export function load() {
	const build = getBuild();
	return { layout: layoutData(getContent(), build), turnstileSiteKey: build.turnstileSiteKey, siteJs: getSiteJs() };
}
