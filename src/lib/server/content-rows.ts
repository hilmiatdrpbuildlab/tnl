/**
 * Reads every table the public site is built from. `publishedOnly` filters in SQL, so the build
 * never even loads a draft; the CMS preview reads drafts too. Relative imports only: the build
 * scripts load this file with tsx.
 */
import { asc, eq } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import type { Db } from './db/client';
import * as t from './db/schema';
import type { Rows } from './content-map';

export async function loadRows(db: Db, publishedOnly: boolean): Promise<Rows> {
	const pub = (table: { isPublished: AnyPgColumn }) => (publishedOnly ? eq(table.isPublished, true) : undefined);

	const [pages, services, projects, projectMedia, reviews, faqs, stats, posts, media, settings, redirects] =
		await Promise.all([
			db.select().from(t.pages),
			db.select().from(t.services).where(pub(t.services)).orderBy(asc(t.services.sortOrder)),
			db.select().from(t.projects).where(pub(t.projects)).orderBy(asc(t.projects.sortOrder)),
			db.select().from(t.projectMedia).orderBy(asc(t.projectMedia.sortOrder)),
			db.select().from(t.reviews).where(pub(t.reviews)).orderBy(asc(t.reviews.sortOrder)),
			db.select().from(t.faqs).where(pub(t.faqs)).orderBy(asc(t.faqs.sortOrder)),
			db.select().from(t.stats).where(pub(t.stats)).orderBy(asc(t.stats.sortOrder)),
			db.select().from(t.posts).where(pub(t.posts)),
			db.select().from(t.media),
			db.select().from(t.settings),
			db.select().from(t.redirects)
		]);
	return { pages, services, projects, projectMedia, reviews, faqs, stats, posts, media, settings, redirects };
}
