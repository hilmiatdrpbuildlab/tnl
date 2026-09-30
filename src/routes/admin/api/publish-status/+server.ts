/**
 * The banner reports what it saw on the live site. The server checks /build-info.json itself
 * before marking a build live, and marks it failed after 15 minutes without the new id.
 */
import { json, type RequestHandler } from '@sveltejs/kit';
import { and, eq, inArray } from 'drizzle-orm';
import { requireUser } from '$lib/server/cms/guard';
import { expireStaleBuilds, PUBLISH_TIMEOUT_MS } from '$lib/server/cms/changes';
import { getDb, schema as t } from '$lib/server/db';

export const POST: RequestHandler = async ({ locals, request, fetch }) => {
	requireUser(locals, { api: true });
	const body = (await request.json().catch(() => ({}))) as { id?: string; live?: boolean };
	if (!body.id || !/^[0-9a-f-]{36}$/i.test(body.id)) return json({ ok: false }, { status: 400 });
	const db = await getDb();
	const [row] = await db.select().from(t.builds).where(eq(t.builds.id, body.id)).limit(1);
	if (!row) return json({ ok: false }, { status: 404 });

	const info = await fetch(`/build-info.json?t=${Date.now()}`, { cache: 'no-store' })
		.then((r) => r.json() as Promise<{ publishId?: string }>)
		.catch(() => ({}) as { publishId?: string });
	if (info.publishId === row.id) {
		await db.update(t.builds).set({ status: 'live', finishedAt: row.finishedAt ?? new Date() }).where(eq(t.builds.id, row.id));
		return json({ ok: true, status: 'live' });
	}
	if (Date.now() - row.triggeredAt.getTime() > PUBLISH_TIMEOUT_MS) {
		await db
			.update(t.builds)
			.set({ status: 'failed', finishedAt: new Date(), detail: 'Geen nieuwe versie na 15 minuten' })
			.where(and(eq(t.builds.id, row.id), inArray(t.builds.status, ['pending', 'building'])));
		return json({ ok: true, status: 'failed' });
	}
	await expireStaleBuilds(db);
	return json({ ok: true, status: row.status });
};
