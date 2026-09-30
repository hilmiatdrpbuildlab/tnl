import { desc, eq, inArray } from 'drizzle-orm';
import { requireUser } from '$lib/server/cms/guard';
import { str } from '$lib/server/cms/form';
import { getDb, schema as t } from '$lib/server/db';

export async function load() {
	const db = await getDb();
	const rows = await db.select().from(t.submissions).orderBy(desc(t.submissions.createdAt)).limit(500);
	return { messages: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), notifiedAt: r.notifiedAt?.toISOString() ?? null })) };
}

export const actions = {
	markRead: async ({ request, locals }) => {
		requireUser(locals);
		const f = await request.formData();
		const ids = f.getAll('id').map(String).filter((x) => /^[0-9a-f-]{36}$/i.test(x));
		if (ids.length) await (await getDb()).update(t.submissions).set({ isRead: str(f, 'read') !== '0' }).where(inArray(t.submissions.id, ids));
	},
	delete: async ({ request, locals }) => {
		requireUser(locals);
		const f = await request.formData();
		await (await getDb()).delete(t.submissions).where(eq(t.submissions.id, str(f, 'id')));
		return { deleted: true };
	}
};
