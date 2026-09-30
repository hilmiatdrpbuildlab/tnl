import { error, fail, redirect } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { noteDeletion } from '$lib/server/cms/changes';
import { dbErrorMessage } from '$lib/server/cms/editor';
import { bool, fieldErrors, str, uuidOrNull } from '$lib/server/cms/form';
import { requireUser } from '$lib/server/cms/guard';
import { nextSortOrder } from '$lib/server/cms/order';
import { faqSchema } from '$lib/server/cms/validators';
import { getDb, schema as t } from '$lib/server/db';

export async function load({ params }) {
	const db = await getDb();
	const services = await db.select({ id: t.services.id, title: t.services.title }).from(t.services).orderBy(asc(t.services.sortOrder));
	if (params.id === 'nieuw')
		return { faq: { id: '', question: '', answer: '', serviceId: null as string | null, isPublished: true }, services, isNew: true };
	const [faq] = await db.select().from(t.faqs).where(eq(t.faqs.id, params.id)).limit(1);
	if (!faq) error(404, 'Vraag niet gevonden');
	return { faq, services, isNew: false };
}

export const actions = {
	save: async ({ request, params, locals }) => {
		requireUser(locals);
		const db = await getDb();
		const f = await request.formData();
		const parsed = faqSchema.safeParse({
			question: str(f, 'question'),
			answer: str(f, 'answer'),
			serviceId: uuidOrNull(f, 'serviceId'),
			isPublished: bool(f, 'isPublished')
		});
		if (!parsed.success) return fail(400, { errors: fieldErrors(parsed.error.issues) });
		try {
			if (params.id === 'nieuw') {
				const id = crypto.randomUUID();
				await db.insert(t.faqs).values({ ...parsed.data, id, sortOrder: await nextSortOrder(db, t.faqs) });
				redirect(303, `/admin/faq/${id}?saved=1`);
			}
			const res = await db.update(t.faqs).set(parsed.data).where(eq(t.faqs.id, params.id)).returning({ id: t.faqs.id });
			if (!res.length) error(404, 'Vraag niet gevonden');
		} catch (e) {
			if ((e as { status?: number })?.status) throw e;
			const err = dbErrorMessage(e);
			return fail(400, { errors: { [err.field ?? '_']: err.message } });
		}
		return { saved: true };
	},
	delete: async ({ params, locals }) => {
		requireUser(locals);
		const db = await getDb();
		await db.delete(t.faqs).where(eq(t.faqs.id, params.id));
		await noteDeletion(db);
		redirect(303, '/admin/faq');
	}
};
