import { fail } from '@sveltejs/kit';
import { requireUser } from '$lib/server/cms/guard';
import { fieldErrors, str } from '$lib/server/cms/form';
import { settingsSchema } from '$lib/server/cms/validators';
import { getDb, schema as t } from '$lib/server/db';

export async function load() {
	const [s] = await (await getDb()).select().from(t.settings).limit(1);
	return { settings: s ?? null };
}

export const actions = {
	default: async ({ request, locals }) => {
		requireUser(locals);
		const f = await request.formData();
		const parsed = settingsSchema.safeParse({
			company: {
				name: str(f, 'name'),
				street: str(f, 'street'),
				postcode: str(f, 'postcode'),
				city: str(f, 'city'),
				companyNumber: str(f, 'companyNumber'),
				email: str(f, 'email'),
				phone: str(f, 'phone')
			},
			socials: { facebook: str(f, 'facebook'), instagram: str(f, 'instagram') },
			notifyEmail: str(f, 'notifyEmail')
		});
		if (!parsed.success) return fail(400, { errors: fieldErrors(parsed.error.issues) });
		const socials = Object.fromEntries(Object.entries(parsed.data.socials).filter(([, v]) => v));
		await (await getDb())
			.insert(t.settings)
			.values({ id: true, company: parsed.data.company, socials, notifyEmail: parsed.data.notifyEmail })
			.onConflictDoUpdate({ target: t.settings.id, set: { company: parsed.data.company, socials, notifyEmail: parsed.data.notifyEmail } });
		return { saved: true };
	}
};
