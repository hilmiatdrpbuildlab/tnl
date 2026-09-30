/**
 * Database tests for the CMS rules, against a real Postgres with the migrations applied.
 * Skipped unless TEST_DATABASE_URL is set (CI runs a Postgres service; see ci.yml).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { eq, like } from 'drizzle-orm';
import { createNodeDb } from '../../src/lib/server/db/client-node';
import * as t from '../../src/lib/server/db/schema';
import { createMemoryStorage } from '../../src/lib/server/storage';
import { deleteWithMedia, saveWithMedia, sweepUnused } from '../../src/lib/server/cms/media-service';
import { noteDeletion, unpublishedCount } from '../../src/lib/server/cms/changes';
import { redirectOnRename } from '../../src/lib/server/cms/slugs';
import { runBatch } from '../../src/lib/server/cms/batch';
import { refsFor } from '../../src/lib/server/media-refs';

const url = process.env.TEST_DATABASE_URL;
const d = url ? describe : describe.skip;

d('CMS rules on Postgres', () => {
	const { db, close } = createNodeDb(url ?? 'postgres://x@localhost/x');
	const storage = createMemoryStorage();
	const tag = `it-${Date.now().toString(36)}`;
	const mk = async (n: number) => {
		const id = crypto.randomUUID();
		const key = `originals/${id}.jpg`;
		await storage.put(key, new Uint8Array([n]), 'image/jpeg');
		await db.insert(t.media).values({ id, objectKey: key, fileName: `${tag}-${n}.jpg`, mime: 'image/jpeg', bytes: 1, width: 10, height: 10 });
		return { id, key };
	};

	beforeAll(async () => {
		await db.insert(t.settings).values({ id: true, company: { name: 'T', street: 's', postcode: '2040', city: 'c', companyNumber: '', email: 'a@b.be', phone: '1' }, notifyEmail: 'a@b.be' }).onConflictDoNothing();
	});
	afterAll(async () => {
		await db.delete(t.projects).where(like(t.projects.slug, `${tag}%`));
		await db.delete(t.redirects).where(like(t.redirects.fromPath, `%${tag}%`));
		await db.delete(t.media).where(like(t.media.fileName, `${tag}%`));
		await close();
	});

	it('replacing a photo deletes the old object and row; the new one stays', async () => {
		const a = await mk(1);
		const b = await mk(2);
		const id = crypto.randomUUID();
		const row = { id, slug: `${tag}-p`, title: 'P', coverMediaId: a.id };
		await saveWithMedia(db, storage, 'projects', id, refsFor('projects', row), [db.insert(t.projects).values(row)]);
		expect(await storage.exists(a.key)).toBe(true);
		const deleted = await saveWithMedia(db, storage, 'projects', id, refsFor('projects', { ...row, coverMediaId: b.id }), [
			db.update(t.projects).set({ coverMediaId: b.id }).where(eq(t.projects.id, id))
		]);
		expect(deleted).toEqual([a.id]);
		expect(await storage.exists(a.key)).toBe(false);
		expect((await db.select().from(t.media).where(eq(t.media.id, a.id))).length).toBe(0);
		expect(await storage.exists(b.key)).toBe(true);
	});

	it('a file used by another row survives when one owner drops it', async () => {
		const shared = await mk(3);
		const p1 = crypto.randomUUID();
		const p2 = crypto.randomUUID();
		for (const [pid, slug] of [[p1, `${tag}-s1`], [p2, `${tag}-s2`]] as const) {
			const row = { id: pid, slug, title: slug, coverMediaId: shared.id };
			await saveWithMedia(db, storage, 'projects', pid, refsFor('projects', row), [db.insert(t.projects).values(row)]);
		}
		await deleteWithMedia(db, storage, 'projects', p1, [db.delete(t.projects).where(eq(t.projects.id, p1))]);
		expect(await storage.exists(shared.key)).toBe(true);
		await deleteWithMedia(db, storage, 'projects', p2, [db.delete(t.projects).where(eq(t.projects.id, p2))]);
		expect(await storage.exists(shared.key)).toBe(false);
	});

	it('the sweep removes files unused for more than 24 hours only', async () => {
		const old = await mk(4);
		const fresh = await mk(5);
		await db.update(t.media).set({ unusedSince: new Date(Date.now() - 25 * 3600e3) }).where(eq(t.media.id, old.id));
		await db.update(t.media).set({ unusedSince: new Date() }).where(eq(t.media.id, fresh.id));
		const swept = await sweepUnused(db, storage);
		expect(swept).toContain(old.id);
		expect(swept).not.toContain(fresh.id);
	});

	it('the database refuses a lone before photo and a review published without consent', async () => {
		const m = await mk(6);
		await expect(db.insert(t.projects).values({ slug: `${tag}-bad`, title: 'x', beforeMediaId: m.id })).rejects.toThrow();
		await expect(db.insert(t.reviews).values({ quote: 'q', authorName: 'a', isPublished: true, consentConfirmed: false })).rejects.toThrow();
		await expect(db.insert(t.projects).values({ slug: `${tag}-seo`, title: 'x', seoTitle: 'x'.repeat(63) })).rejects.toThrow();
	});

	it('renaming a slug writes a 301 and re-points older redirects', async () => {
		await db.insert(t.redirects).values({ fromPath: `/oud-${tag}`, toPath: `/projecten/${tag}-a`, status: 301 });
		await runBatch(db, redirectOnRename(db, 'projects', `${tag}-a`, `${tag}-b`));
		const rows = await db.select().from(t.redirects).where(like(t.redirects.toPath, `%${tag}-b`));
		expect(rows.map((r) => r.fromPath).sort()).toEqual([`/oud-${tag}`, `/projecten/${tag}-a`].sort());
	});

	it('counts saves and deletions as unpublished changes', async () => {
		const before = await unpublishedCount(db);
		await noteDeletion(db);
		expect(await unpublishedCount(db)).toBe(before + 1);
	});
});
