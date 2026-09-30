import { asc } from 'drizzle-orm';
import { requireUser } from '$lib/server/cms/guard';
import { int, str } from '$lib/server/cms/form';
import { moveRow } from '$lib/server/cms/order';
import { getDb, schema as t } from '$lib/server/db';

export async function load() {
	const db = await getDb();
	const [projects, services] = await Promise.all([
		db.select().from(t.projects).orderBy(asc(t.projects.sortOrder)),
		db.select({ id: t.services.id, title: t.services.title }).from(t.services)
	]);
	const names = Object.fromEntries(services.map((s) => [s.id, s.title]));
	return { projects: projects.map((p) => ({ ...p, serviceTitle: p.serviceId ? names[p.serviceId] : null })) };
}

export const actions = {
	move: async ({ request, locals }) => {
		requireUser(locals);
		const f = await request.formData();
		await moveRow(await getDb(), t.projects, str(f, 'id'), int(f, 'dir') < 0 ? -1 : 1);
	}
};
