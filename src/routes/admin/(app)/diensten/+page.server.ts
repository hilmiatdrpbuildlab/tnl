import { asc } from 'drizzle-orm';
import { requireUser } from '$lib/server/cms/guard';
import { int, str } from '$lib/server/cms/form';
import { moveRow } from '$lib/server/cms/order';
import { getDb, schema as t } from '$lib/server/db';

export async function load() {
	const db = await getDb();
	return { services: await db.select().from(t.services).orderBy(asc(t.services.sortOrder)) };
}

export const actions = {
	move: async ({ request, locals }) => {
		requireUser(locals);
		const f = await request.formData();
		await moveRow(await getDb(), t.services, str(f, 'id'), int(f, 'dir') < 0 ? -1 : 1);
	}
};
