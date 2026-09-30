/**
 * Build-time reads for the public site. The prerender never talks to the database directly:
 * scripts/build-content.ts reads Neon with the read-only role (or falls back to seed.json)
 * and writes the published content to src/lib/generated/, which this module serves.
 */
import type { LayoutData, Page, SiteContent } from '$lib/types';

const contentMods = import.meta.glob<SiteContent>('../generated/content.json', { eager: true, import: 'default' });
const siteJsMods = import.meta.glob<{ src: string }>('../generated/site-js.json', { eager: true, import: 'default' });
const buildMods = import.meta.glob<BuildInfo>('../generated/build.json', { eager: true, import: 'default' });

export interface BuildInfo {
	buildId: string;
	publishId: string | null;
	builtAt: string;
	commit: string | null;
	branch?: string | null;
	siteUrl: string;
	noindex: boolean;
	turnstileSiteKey: string;
}

export function getContent(): SiteContent {
	const c = Object.values(contentMods)[0];
	if (!c) throw new Error('src/lib/generated/content.json is missing. Run `npm run build-content` first.');
	return c;
}

export function getBuild(): BuildInfo {
	return (
		Object.values(buildMods)[0] ?? {
			buildId: 'dev',
			publishId: null,
			builtAt: new Date(0).toISOString(),
			commit: null,
			siteUrl: 'http://localhost:5173',
			noindex: true,
			turnstileSiteKey: ''
		}
	);
}

export function getPage(content: SiteContent, slug: string): Page {
	const p = content.pages.find((x) => x.slug === slug);
	if (!p) throw new Error(`Page row "${slug}" is missing.`);
	return p;
}

export function layoutData(content: SiteContent, build: BuildInfo = getBuild()): LayoutData {
	return {
		settings: content.settings,
		services: content.services.map((s) => ({ slug: s.slug, title: s.title })),
		hasPosts: content.posts.length > 0,
		siteUrl: build.siteUrl,
		noindexSite: build.noindex,
		buildId: build.buildId
	};
}

/** The enhancement script for the public pages (scripts/build-enhance.ts). */
export function getSiteJs(): string {
	return Object.values(siteJsMods)[0]?.src ?? '/site.js';
}
