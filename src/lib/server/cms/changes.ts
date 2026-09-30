/** Unpublished changes and publish status for the banner and the Overzicht screen. */
import { desc, eq, gt, sql } from 'drizzle-orm';
import type { Db } from '../db/client';
import * as t from '../db/schema';

export const PUBLISH_TIMEOUT_MS = 15 * 60 * 1000;

const COUNTED = [
	t.pages,
	t.services,
	t.projects,
	t.projectMedia,
	t.reviews,
	t.faqs,
	t.stats,
	t.posts,
	t.settings,
	t.redirects
] as const;

export async function lastLiveBuild(db: Db) {
	const [row] = await db.select().from(t.builds).where(eq(t.builds.status, 'live')).orderBy(desc(t.builds.triggeredAt)).limit(1);
	return row ?? null;
}

export async function latestBuild(db: Db) {
	const [row] = await db.select().from(t.builds).orderBy(desc(t.builds.triggeredAt)).limit(1);
	return row ?? null;
}

/** Rows changed since the content of the last live build was read, plus deletions since. */
export async function unpublishedCount(db: Db): Promise<number> {
	const live = await lastLiveBuild(db);
	const since = live?.triggeredAt ?? new Date(0);
	const counts = await Promise.all(
		COUNTED.map((table) =>
			db
				.select({ n: sql<number>`count(*)::int` })
				.from(table)
				.where(gt(table.updatedAt, since))
				.then((r) => r[0]?.n ?? 0)
		)
	);
	const [s] = await db.select({ d: t.settings.pendingDeletions }).from(t.settings).limit(1);
	const deletions = (s?.d ?? []).filter((iso) => new Date(iso) > since).length;
	return counts.reduce((a, b) => a + b, 0) + deletions;
}

/** Record a deletion for the banner count (and drop entries older than the last live build). */
export async function noteDeletion(db: Db) {
	const live = await lastLiveBuild(db);
	const since = (live?.triggeredAt ?? new Date(0)).toISOString();
	return db.execute(sql`
		update settings set pending_deletions = (
			select coalesce(jsonb_agg(x), '[]'::jsonb) from jsonb_array_elements_text(pending_deletions) x where x > ${since}
		) || jsonb_build_array(${new Date().toISOString()}::text)`);
}

export type PublishState = 'idle' | 'pending' | 'building' | 'live' | 'failed';

/** Builds still waiting after 15 minutes are marked failed (Mislukt). */
export async function expireStaleBuilds(db: Db, now = new Date()) {
	const cutoff = new Date(now.getTime() - PUBLISH_TIMEOUT_MS);
	await db.execute(sql`
		update builds set status = 'failed', finished_at = ${now}, detail = coalesce(detail, 'Geen nieuwe versie na 15 minuten')
		where status in ('pending', 'building') and triggered_at < ${cutoff}`);
}
