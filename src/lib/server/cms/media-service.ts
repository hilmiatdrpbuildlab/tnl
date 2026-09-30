/**
 * Media usage bookkeeping and the client's cost rule (docs/cms-plan/04-media.md):
 * a file no row uses any more is deleted from the bucket, then its media row.
 */
import { and, eq, inArray, lt, sql } from 'drizzle-orm';
import type { Db } from '../db/client';
import * as t from '../db/schema';
import type { Storage } from '../storage';
import { orphanCandidates, SWEEP_AFTER_MS, type MediaRef, type OwnerTable } from '../../media-rules';

export async function currentRefs(db: Db, ownerTable: OwnerTable, ownerId: string): Promise<MediaRef[]> {
	const rows = await db
		.select({ field: t.mediaUsages.field, mediaId: t.mediaUsages.mediaId })
		.from(t.mediaUsages)
		.where(and(eq(t.mediaUsages.ownerTable, ownerTable), eq(t.mediaUsages.ownerId, ownerId)));
	return rows;
}

/** Statements that rewrite an owner's usages; run them in the same batch as the save. */
export function usageStatements(db: Db, ownerTable: OwnerTable, ownerId: string, refs: MediaRef[]) {
	const qs: unknown[] = [
		db.delete(t.mediaUsages).where(and(eq(t.mediaUsages.ownerTable, ownerTable), eq(t.mediaUsages.ownerId, ownerId)))
	];
	if (refs.length) {
		qs.push(
			db
				.insert(t.mediaUsages)
				.values(refs.map((r) => ({ mediaId: r.mediaId, ownerTable, ownerId, field: r.field })))
				.onConflictDoNothing()
		);
		qs.push(
			db
				.update(t.media)
				.set({ unusedSince: null })
				.where(inArray(t.media.id, [...new Set(refs.map((r) => r.mediaId))]))
		);
	}
	return qs;
}

/**
 * After a save or delete: each candidate no row uses any more is deleted from the bucket
 * (DeleteObject), then its media row. Returns the ids that were deleted.
 */
export async function deleteIfUnused(db: Db, storage: Storage, mediaIds: string[]): Promise<string[]> {
	if (!mediaIds.length) return [];
	const used = await db
		.selectDistinct({ id: t.mediaUsages.mediaId })
		.from(t.mediaUsages)
		.where(inArray(t.mediaUsages.mediaId, mediaIds));
	const stillUsed = new Set(used.map((u) => u.id));
	const orphans = mediaIds.filter((id) => !stillUsed.has(id));
	if (!orphans.length) return [];
	const rows = await db.select().from(t.media).where(inArray(t.media.id, orphans));
	const deleted: string[] = [];
	for (const m of rows) {
		try {
			await storage.delete(m.objectKey);
			await db.delete(t.media).where(eq(t.media.id, m.id));
			deleted.push(m.id);
		} catch (e) {
			// Leave the row: the daily sweep retries.
			console.error(`media: could not delete ${m.objectKey}`, e);
			await db.update(t.media).set({ unusedSince: new Date(0) }).where(eq(t.media.id, m.id));
		}
	}
	return deleted;
}

/** The whole save cycle for a row that owns media. `save` statements go in the same batch. */
export async function saveWithMedia(
	db: Db,
	storage: Storage,
	ownerTable: OwnerTable,
	ownerId: string,
	refs: MediaRef[],
	save: unknown[]
) {
	const before = await currentRefs(db, ownerTable, ownerId);
	const { runBatch } = await import('./batch');
	await runBatch(db, [...save, ...usageStatements(db, ownerTable, ownerId, refs)]);
	return deleteIfUnused(db, storage, orphanCandidates(before, refs));
}

/** Deleting a project, post or review: remove its usages, then apply the same rule. */
export async function deleteWithMedia(db: Db, storage: Storage, ownerTable: OwnerTable, ownerId: string, del: unknown[]) {
	const before = await currentRefs(db, ownerTable, ownerId);
	const { runBatch } = await import('./batch');
	await runBatch(db, [
		...del,
		db.delete(t.mediaUsages).where(and(eq(t.mediaUsages.ownerTable, ownerTable), eq(t.mediaUsages.ownerId, ownerId)))
	]);
	return deleteIfUnused(db, storage, orphanCandidates(before, []));
}

/** Daily sweep: files unused for more than 24 hours (uploads abandoned before a save). */
export async function sweepUnused(db: Db, storage: Storage, now = new Date()) {
	// Mark files that have no usage and no unused_since yet.
	await db.execute(sql`
		update media set unused_since = ${now}
		where unused_since is null and not exists (select 1 from media_usages u where u.media_id = media.id)`);
	const cutoff = new Date(now.getTime() - SWEEP_AFTER_MS);
	const due = await db
		.select({ id: t.media.id })
		.from(t.media)
		.where(and(lt(t.media.unusedSince, cutoff), sql`not exists (select 1 from media_usages u where u.media_id = ${t.media.id})`));
	return deleteIfUnused(db, storage, due.map((d) => d.id));
}

/** Where a file is used, with a Dutch label per owner, for the media library. */
export async function usagesOf(db: Db, mediaIds: string[]) {
	if (!mediaIds.length) return new Map<string, { ownerTable: string; ownerId: string; field: string; label: string; href: string }[]>();
	const rows = await db.select().from(t.mediaUsages).where(inArray(t.mediaUsages.mediaId, mediaIds));
	const ids = (table: string) => [...new Set(rows.filter((r) => r.ownerTable === table).map((r) => r.ownerId))];
	const [pages, services, projects, reviews, posts] = await Promise.all([
		ids('pages').length ? db.select({ id: t.pages.id, name: t.pages.title }).from(t.pages).where(inArray(t.pages.id, ids('pages'))) : [],
		ids('services').length ? db.select({ id: t.services.id, name: t.services.title }).from(t.services).where(inArray(t.services.id, ids('services'))) : [],
		ids('projects').length ? db.select({ id: t.projects.id, name: t.projects.title }).from(t.projects).where(inArray(t.projects.id, ids('projects'))) : [],
		ids('reviews').length ? db.select({ id: t.reviews.id, name: t.reviews.authorName }).from(t.reviews).where(inArray(t.reviews.id, ids('reviews'))) : [],
		ids('posts').length ? db.select({ id: t.posts.id, name: t.posts.title }).from(t.posts).where(inArray(t.posts.id, ids('posts'))) : []
	]);
	const names = new Map<string, string>();
	for (const r of [...pages, ...services, ...projects, ...reviews, ...posts]) names.set(r.id, r.name);
	const kind: Record<string, [string, string]> = {
		pages: ["Pagina", '/admin/paginas/'],
		services: ['Dienst', '/admin/diensten/'],
		projects: ['Project', '/admin/projecten/'],
		reviews: ['Review', '/admin/reviews/'],
		posts: ['Blog', '/admin/blog/']
	};
	const out = new Map<string, { ownerTable: string; ownerId: string; field: string; label: string; href: string }[]>();
	for (const r of rows) {
		const [k, base] = kind[r.ownerTable] ?? ['Item', '/admin/'];
		const list = out.get(r.mediaId) ?? [];
		list.push({ ...r, label: `${k}: ${names.get(r.ownerId) ?? '(onbekend)'}`, href: base + r.ownerId });
		out.set(r.mediaId, list);
	}
	return out;
}

