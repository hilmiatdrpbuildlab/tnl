/**
 * Daily at 03:00 (Workers cron, via scripts/add-scheduled.ts): media sweep, 12-month retention of
 * contact messages, and stale publish builds. Protected by CRON_SECRET; never public.
 */
import { json, type RequestHandler } from '@sveltejs/kit';
import { lt } from 'drizzle-orm';
import { expireStaleBuilds } from '$lib/server/cms/changes';
import { sweepUnused } from '$lib/server/cms/media-service';
import { getDb, schema as t } from '$lib/server/db';
import { env, getStorage } from '$lib/server/env';

export const prerender = false;
const RETENTION_MONTHS = 12;

export const POST: RequestHandler = async ({ request }) => {
	const secret = env.CRON_SECRET;
	if (!secret || request.headers.get('x-cron-secret') !== secret) return new Response('Not found', { status: 404 });
	const db = await getDb();
	const now = new Date();
	const swept = await sweepUnused(db, await getStorage(), now);
	const cutoff = new Date(now);
	cutoff.setMonth(cutoff.getMonth() - RETENTION_MONTHS);
	const removed = await db.delete(t.submissions).where(lt(t.submissions.createdAt, cutoff)).returning({ id: t.submissions.id });
	await expireStaleBuilds(db, now);
	const result = { swept: swept.length, submissionsDeleted: removed.length, at: now.toISOString() };
	console.log('cron', result);
	return json(result);
};
