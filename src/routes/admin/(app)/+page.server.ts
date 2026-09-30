import { and, count, eq, isNull, or } from 'drizzle-orm';
import { lastLiveBuild } from '$lib/server/cms/changes';
import { getDb, schema as t } from '$lib/server/db';

export async function load({ parent }) {
	await parent();
	const db = await getDb();
	const n = (q: Promise<{ n: number }[]>) => q.then((r) => r[0]?.n ?? 0);
	const [live, noAlt, noConsent, noSeoServices, noSeoProjects, noSeoPosts, noCover, projects, posts, settings] = await Promise.all([
		lastLiveBuild(db),
		n(db.select({ n: count() }).from(t.media).where(eq(t.media.alt, ''))),
		n(db.select({ n: count() }).from(t.reviews).where(eq(t.reviews.consentConfirmed, false))),
		n(db.select({ n: count() }).from(t.services).where(or(isNull(t.services.metaDescription), eq(t.services.metaDescription, '')))),
		n(db.select({ n: count() }).from(t.projects).where(and(eq(t.projects.isPublished, true), or(isNull(t.projects.metaDescription), eq(t.projects.metaDescription, ''))))),
		n(db.select({ n: count() }).from(t.posts).where(and(eq(t.posts.isPublished, true), or(isNull(t.posts.metaDescription), eq(t.posts.metaDescription, ''))))),
		n(db.select({ n: count() }).from(t.projects).where(and(isNull(t.projects.coverMediaId), isNull(t.projects.afterMediaId)))),
		n(db.select({ n: count() }).from(t.projects).where(eq(t.projects.isPublished, true))),
		n(db.select({ n: count() }).from(t.posts).where(eq(t.posts.isPublished, true))),
		db.select({ company: t.settings.company }).from(t.settings).limit(1)
	]);
	const gaps = [
		noAlt && { text: `${noAlt} foto${noAlt > 1 ? "'s" : ''} zonder alt-tekst`, href: '/admin/media' },
		noConsent && { text: `${noConsent} review${noConsent > 1 ? 's' : ''} zonder toestemming van de klant (niet zichtbaar)`, href: '/admin/reviews' },
		noSeoServices + noSeoProjects + noSeoPosts > 0 && {
			text: `${noSeoServices + noSeoProjects + noSeoPosts} pagina's zonder eigen beschrijving voor Google`,
			href: '/admin/seo'
		},
		noCover && { text: `${noCover} project${noCover > 1 ? 'en' : ''} zonder foto`, href: '/admin/projecten' },
		!settings[0]?.company.companyNumber && { text: 'Ondernemingsnummer ontbreekt (wettelijk verplicht op de website)', href: '/admin/instellingen' }
	].filter(Boolean) as { text: string; href: string }[];
	return { live: live ? live.finishedAt?.toISOString() ?? live.triggeredAt.toISOString() : null, gaps, projects, posts };
}
