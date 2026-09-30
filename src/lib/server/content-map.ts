/**
 * Maps database rows (or the seed.json fallback, same shape) to the content types the public
 * components render. Shared by the build (content.ts) and the CMS preview.
 */
import { parseBlocks } from '../blocks';
import { renderMarkdown } from '../markdown';
import type { Img, SiteContent } from '../types';
import type * as S from './db/schema';
import { defaultVariant, srcsetOf, variantsFor } from '../media-rules';

export interface Rows {
	pages: (typeof S.pages.$inferSelect)[];
	services: (typeof S.services.$inferSelect)[];
	projects: (typeof S.projects.$inferSelect)[];
	projectMedia: (typeof S.projectMedia.$inferSelect)[];
	reviews: (typeof S.reviews.$inferSelect)[];
	faqs: (typeof S.faqs.$inferSelect)[];
	stats: (typeof S.stats.$inferSelect)[];
	posts: (typeof S.posts.$inferSelect)[];
	media: (typeof S.media.$inferSelect)[];
	settings: (typeof S.settings.$inferSelect)[];
	redirects: (typeof S.redirects.$inferSelect)[];
}

export type ImageMode = 'build' | 'preview';

export interface MapOptions {
	/** `build`: WebP variants in /media. `preview`: the original, through the CMS. */
	images: ImageMode;
	/** Include unpublished rows (CMS preview only). */
	drafts: boolean;
}

const bySort = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;

export function mapContent(rows: Rows, opts: MapOptions): SiteContent {
	const mediaById = new Map(rows.media.map((m) => [m.id, m]));
	const visible = <T extends { isPublished: boolean }>(r: T) => opts.drafts || r.isPublished;

	const img = (id: string | null | undefined): Img | null => {
		if (!id) return null;
		const m = mediaById.get(id);
		if (!m) return null;
		if (opts.images === 'preview') {
			return { id: m.id, src: `/admin/api/media/${m.id}`, width: m.width, height: m.height, alt: m.alt };
		}
		const variants = m.variants?.length ? m.variants : variantsFor(m.id, m.width);
		const fallback = defaultVariant(variants);
		const w = fallback?.w ?? m.width;
		return {
			id: m.id,
			src: fallback?.src ?? `/media/${m.id}-${m.width}.webp`,
			srcset: srcsetOf(variants),
			width: w,
			height: Math.round((m.height / m.width) * w),
			alt: m.alt
		};
	};

	const services = rows.services
		.filter(visible)
		.sort(bySort)
		.map((s) => ({
			id: s.id,
			slug: s.slug,
			title: s.title,
			summary: s.summary,
			body: s.body,
			bodyHtml: renderMarkdown(s.body),
			items: s.items ?? [],
			tileTheme: s.tileTheme,
			hero: img(s.heroMediaId),
			sortOrder: s.sortOrder,
			seoTitle: s.seoTitle,
			metaDescription: s.metaDescription
		}));
	const serviceById = new Map(services.map((s) => [s.id, s]));

	const gallery = new Map<string, Img[]>();
	for (const pm of [...rows.projectMedia].sort(bySort)) {
		const i = img(pm.mediaId);
		if (!i) continue;
		gallery.set(pm.projectId, [...(gallery.get(pm.projectId) ?? []), i]);
	}

	const projects = rows.projects
		.filter(visible)
		.sort(bySort)
		.map((p) => {
			const svc = p.serviceId ? serviceById.get(p.serviceId) : undefined;
			const before = img(p.beforeMediaId);
			const after = img(p.afterMediaId);
			const pair = before && after;
			return {
				id: p.id,
				slug: p.slug,
				title: p.title,
				serviceId: svc?.id ?? null,
				serviceTitle: svc?.title ?? null,
				serviceSlug: svc?.slug ?? null,
				subService: p.subService,
				summary: p.summary,
				body: p.body,
				bodyHtml: renderMarkdown(p.body),
				cover: img(p.coverMediaId),
				before: pair ? before : null,
				after: pair ? after : null,
				gallery: gallery.get(p.id) ?? [],
				location: p.location?.trim() || null,
				completedOn: p.completedOn ? String(p.completedOn) : null,
				isFeatured: p.isFeatured,
				sortOrder: p.sortOrder,
				seoTitle: p.seoTitle,
				metaDescription: p.metaDescription
			};
		});

	const pages = rows.pages.map((p) => {
		const parsed = parseBlocks(p.slug, p.blocks);
		return {
			slug: p.slug,
			title: p.title,
			intro: p.intro,
			body: p.body,
			bodyHtml: renderMarkdown(p.body),
			blocks: (parsed.success ? parsed.data : p.blocks) as Record<string, unknown>,
			hero: img(p.heroMediaId),
			seoTitle: p.seoTitle,
			metaDescription: p.metaDescription,
			noindex: p.noindex
		};
	});

	// A review is never shown without the customer's consent, drafts included.
	const reviews = rows.reviews
		.filter((r) => visible(r) && r.consentConfirmed)
		.sort(bySort)
		.map((r) => ({
			id: r.id,
			quote: r.quote,
			authorName: r.authorName,
			place: r.place,
			serviceTitle: r.serviceId ? (serviceById.get(r.serviceId)?.title ?? null) : null,
			rating: r.rating,
			source: r.source,
			photo: img(r.photoMediaId)
		}));

	const faqs = rows.faqs
		.filter(visible)
		.sort(bySort)
		.map((f) => ({ id: f.id, question: f.question, answer: f.answer, serviceId: f.serviceId }));

	const stats = rows.stats
		.filter(visible)
		.sort(bySort)
		.slice(0, 3)
		.map((s) => ({ id: s.id, value: s.value, label: s.label }));

	const posts = rows.posts
		.filter(visible)
		.sort((a, b) => String(b.publishedOn ?? '').localeCompare(String(a.publishedOn ?? '')))
		.map((p) => ({
			id: p.id,
			slug: p.slug,
			title: p.title,
			intro: p.intro,
			body: p.body,
			bodyHtml: renderMarkdown(p.body),
			category: p.category,
			publishedOn: p.publishedOn ? String(p.publishedOn) : null,
			cover: img(p.coverMediaId),
			seoTitle: p.seoTitle,
			metaDescription: p.metaDescription
		}));

	const s = rows.settings[0];
	if (!s) throw new Error('The settings row is missing. Run npm run db:seed.');

	return {
		settings: {
			company: s.company,
			socials: s.socials ?? {},
			notifyEmail: s.notifyEmail
		},
		pages,
		services,
		projects,
		reviews,
		faqs,
		stats,
		posts,
		redirects: rows.redirects.map((r) => ({
			fromPath: r.fromPath,
			toPath: r.toPath,
			status: (r.status === 302 ? 302 : 301) as 301 | 302
		}))
	};
}
