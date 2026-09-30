import { count, eq } from 'drizzle-orm';
import { requireUser } from '$lib/server/cms/guard';
import { expireStaleBuilds, latestBuild, unpublishedCount } from '$lib/server/cms/changes';
import { getDb, schema as t } from '$lib/server/db';
import { env } from '$lib/server/env';

export async function load({ locals }) {
	const user = requireUser(locals);
	const db = await getDb();
	await expireStaleBuilds(db);
	const [unpublished, build, [unread]] = await Promise.all([
		unpublishedCount(db),
		latestBuild(db),
		db.select({ n: count() }).from(t.submissions).where(eq(t.submissions.isRead, false))
	]);
	return {
		user: { name: user.name, email: user.email },
		unpublished,
		build: build ? { id: build.id, status: build.status, triggeredAt: build.triggeredAt.toISOString() } : null,
		unread: unread?.n ?? 0,
		buildLogUrl: env.BUILD_LOG_URL ?? ''
	};
}
