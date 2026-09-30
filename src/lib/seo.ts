/** Meta tags: title, description, canonical, Open Graph (docs/cms-plan/06-public-site.md). */
import type { Img } from './types';

export const SEO_TITLE_MAX = 62;
export const META_DESCRIPTION_MAX = 158;
export const SITE_NAME = 'TNL Group';

export interface SeoInput {
	title: string;
	seoTitle?: string | null;
	description?: string | null;
	fallbackDescription?: string;
	path: string;
	image?: Img | null;
	noindex?: boolean;
	type?: 'website' | 'article';
}

export interface SeoMeta {
	title: string;
	description: string;
	canonical: string;
	ogImage: string | null;
	noindex: boolean;
	type: 'website' | 'article';
}

/** Cut at a word boundary, never above `max` characters. */
export function clip(text: string, max: number): string {
	const t = text.replace(/\s+/g, ' ').trim();
	if (t.length <= max) return t;
	const cut = t.slice(0, max - 1);
	const at = cut.lastIndexOf(' ');
	return (at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,.;:–-]+$/, '') + '…';
}

export function pageTitle(title: string, seoTitle?: string | null): string {
	if (seoTitle?.trim()) return clip(seoTitle, SEO_TITLE_MAX);
	const full = `${title} | ${SITE_NAME}`;
	return full.length <= SEO_TITLE_MAX ? full : clip(title, SEO_TITLE_MAX);
}

export function buildSeo(input: SeoInput, siteUrl: string, noindexSite: boolean): SeoMeta {
	const description = clip(input.description?.trim() || input.fallbackDescription || '', META_DESCRIPTION_MAX);
	const path = input.path === '/' ? '/' : input.path.replace(/\/$/, '');
	return {
		title: pageTitle(input.title, input.seoTitle),
		description,
		canonical: siteUrl + path,
		ogImage: input.image ? siteUrl + (input.image.src ?? '') : null,
		noindex: noindexSite || !!input.noindex,
		type: input.type ?? 'website'
	};
}

export interface LengthIssue {
	field: 'seo_title' | 'meta_description';
	length: number;
	max: number;
}

/** The CMS and verify-build use the same rule. */
export function seoLengthIssues(seoTitle: string | null | undefined, metaDescription: string | null | undefined) {
	const issues: LengthIssue[] = [];
	if (seoTitle && seoTitle.length > SEO_TITLE_MAX)
		issues.push({ field: 'seo_title', length: seoTitle.length, max: SEO_TITLE_MAX });
	if (metaDescription && metaDescription.length > META_DESCRIPTION_MAX)
		issues.push({ field: 'meta_description', length: metaDescription.length, max: META_DESCRIPTION_MAX });
	return issues;
}
