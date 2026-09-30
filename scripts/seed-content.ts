/**
 * Seeds TNL's real launch content (scripts/seed-data.ts) into the database and uploads the
 * photos to the bucket. Idempotent: rows have fixed ids, so running it twice leaves the same rows.
 * Existing rows are left alone unless you pass --reset, which overwrites them with the seed.
 *   npm run db:seed            (DATABASE_URL = tnl_app on the dev branch)
 *   npm run db:seed -- --reset
 */
import './lib/env';
import { need } from './lib/env';
import { sql } from 'drizzle-orm';
import { createNodeDb } from '../src/lib/server/db/client-node';
import * as t from '../src/lib/server/db/schema';
import { refsFor } from '../src/lib/server/media-refs';
import type { OwnerTable } from '../src/lib/media-rules';
import { scriptStorage } from './lib/storage';
import { buildSeedRows } from './lib/seed-rows';

const reset = process.argv.includes('--reset');
const { db, close } = createNodeDb(need('DATABASE_URL'));
const storage = scriptStorage('write');
const { rows, photos } = await buildSeedRows();

for (const p of photos) {
	if (reset || !(await storage.exists(p.objectKey))) await storage.put(p.objectKey, p.bytes, 'image/jpeg');
}
console.log(`${photos.length} photos in the bucket.`);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsert(table: any, values: any[], target: any = table.id) {
	if (!values.length) return;
	const q = db.insert(table).values(values);
	if (reset) {
		const set = Object.fromEntries(
			Object.keys(values[0])
				.filter((k) => k !== 'id' && k !== 'createdAt')
				.map((k) => [k, sql.raw(`excluded."${k.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())}"`)])
		);
		await q.onConflictDoUpdate({ target, set });
	} else {
		await q.onConflictDoNothing();
	}
}

const strip = <T extends Record<string, unknown>>(r: T) => {
	const { createdAt: _c, updatedAt: _u, ...rest } = r;
	return rest;
};

await upsert(t.media, rows.media.map((m) => ({ ...strip(m), unusedSince: null })));
await upsert(t.settings, rows.settings.map(strip));
await upsert(t.pages, rows.pages.map(strip));
await upsert(t.services, rows.services.map(strip));
await upsert(t.projects, rows.projects.map(strip));
await upsert(t.projectMedia, rows.projectMedia.map(strip));
await upsert(t.faqs, rows.faqs.map(strip));
await upsert(t.stats, rows.stats.map(strip));
await upsert(t.redirects, rows.redirects.map(strip), t.redirects.fromPath);

// media_usages for the seeded rows
const usages: (typeof t.mediaUsages.$inferInsert)[] = [];
const add = (table: OwnerTable, list: Record<string, unknown>[], gallery?: (id: string) => string[]) => {
	for (const r of list)
		for (const u of refsFor(table, r, gallery?.(r.id as string)))
			usages.push({ mediaId: u.mediaId, ownerTable: table, ownerId: r.id as string, field: u.field });
};
add('pages', rows.pages);
add('services', rows.services);
add('projects', rows.projects, (id) => rows.projectMedia.filter((pm) => pm.projectId === id).map((pm) => pm.mediaId));
if (usages.length) await db.insert(t.mediaUsages).values(usages).onConflictDoNothing();

const counts = await db.execute(sql`
	select (select count(*) from pages) pages, (select count(*) from services) services,
	       (select count(*) from projects) projects, (select count(*) from faqs) faqs,
	       (select count(*) from stats) stats, (select count(*) from media) media,
	       (select count(*) from media_usages) usages, (select count(*) from redirects) redirects`);
console.log('Rows:', 'rows' in counts ? counts.rows[0] : counts);
await close();
