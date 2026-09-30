import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { requireUser } from '$lib/server/cms/guard';
import { getDb, schema as t } from '$lib/server/db';

export async function load({ params }) {
	const db = await getDb();
	const [m] = await db.select().from(t.submissions).where(eq(t.submissions.id, params.id)).limit(1);
	if (!m) error(404, 'Bericht niet gevonden');
	if (!m.isRead) await db.update(t.submissions).set({ isRead: true }).where(eq(t.submissions.id, m.id));
	return { message: { ...m, createdAt: m.createdAt.toISOString(), notifiedAt: m.notifiedAt?.toISOString() ?? null } };
}

export const actions = {
	delete: async ({ params, locals }) => {
		requireUser(locals);
		await (await getDb()).delete(t.submissions).where(eq(t.submissions.id, params.id));
		redirect(303, '/admin/berichten');
	}
};
