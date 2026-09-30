/**
 * The Publiceren button (docs/cms-plan/07-build-and-deploy.md). It lives under /admin (the plan
 * says /api/publish) because the session cookie is scoped to /admin and never reaches /api.
 * Checks the session, inserts a
 * `builds` row as pending and POSTs to the Workers Builds deploy hook (a secret, never sent to
 * the browser). A second click while a build is queued returns the queued build.
 */
import { json, type RequestHandler } from '@sveltejs/kit';
import { and, desc, eq, gt, inArray } from 'drizzle-orm';
import { requireUser } from '$lib/server/cms/guard';
import { expireStaleBuilds, PUBLISH_TIMEOUT_MS } from '$lib/server/cms/changes';
import { getDb, schema as t } from '$lib/server/db';
import { env } from '$lib/server/env';

export const POST: RequestHandler = async ({ locals, fetch }) => {
	requireUser(locals, { api: true });
	const db = await getDb();
	await expireStaleBuilds(db);

	// Only a build that has not started yet can absorb this click; one already building read the
	// content before these changes, so it needs a new build after it.
	const [queued] = await db
		.select()
		.from(t.builds)
		.where(and(eq(t.builds.status, 'pending'), gt(t.builds.triggeredAt, new Date(Date.now() - PUBLISH_TIMEOUT_MS))))
		.orderBy(desc(t.builds.triggeredAt))
		.limit(1);
	if (queued) return json({ id: queued.id, triggeredAt: queued.triggeredAt, queued: true });

	const hook = env.DEPLOY_HOOK_URL;
	if (!hook) return json({ error: 'Publiceren is nog niet ingesteld (DEPLOY_HOOK_URL ontbreekt).' }, { status: 503 });

	const [row] = await db.insert(t.builds).values({ status: 'pending' }).returning();
	let buildUuid: string | null = null;
	try {
		const res = await fetch(hook, { method: 'POST' });
		const text = await res.text();
		if (!res.ok) throw new Error(`Deploy hook ${res.status}: ${text.slice(0, 200)}`);
		try {
			const body = JSON.parse(text) as { result?: { build_uuid?: string; id?: string } };
			buildUuid = body.result?.build_uuid ?? body.result?.id ?? null;
		} catch {
			/* no JSON body */
		}
	} catch (e) {
		const detail = e instanceof Error ? e.message : String(e);
		await db.update(t.builds).set({ status: 'failed', finishedAt: new Date(), detail }).where(eq(t.builds.id, row!.id));
		return json({ error: 'Publiceren kon niet starten. Probeer het over een minuut opnieuw.' }, { status: 502 });
	}
	if (buildUuid) await db.update(t.builds).set({ buildUuid }).where(and(eq(t.builds.id, row!.id), inArray(t.builds.status, ['pending', 'building'])));
	return json({ id: row!.id, triggeredAt: row!.triggeredAt, queued: false });
};
