/**
 * Deploy step: after `wrangler deploy`, set this build's `builds` row to live.
 * Runs in Workers Builds with DATABASE_URL_BUILD (tnl_build may update only builds).
 * The CMS still only reports Live once it sees the new id in /build-info.json.
 */
import './lib/env';
import { readFile } from 'node:fs/promises';
import { and, eq, inArray } from 'drizzle-orm';
import { createNodeDb } from '../src/lib/server/db/client-node';
import * as t from '../src/lib/server/db/schema';

const build = JSON.parse(await readFile('src/lib/generated/build.json', 'utf8')) as { publishId: string | null; buildId: string };
const url = process.env.DATABASE_URL_BUILD;
if (!build.publishId || !url) {
	console.log('mark-live: no publish request in this build (code push or local); nothing to mark.');
	process.exit(0);
}
const { db, close } = createNodeDb(url);
await db
	.update(t.builds)
	.set({ status: 'live', finishedAt: new Date(), buildUuid: process.env.WORKERS_CI_BUILD_UUID ?? build.buildId })
	.where(and(eq(t.builds.id, build.publishId), inArray(t.builds.status, ['pending', 'building', 'failed'])));
await close();
console.log(`mark-live: publish ${build.publishId} is live.`);
