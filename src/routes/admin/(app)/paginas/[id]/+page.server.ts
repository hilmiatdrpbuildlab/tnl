import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { parseBlocks } from '$lib/blocks';
import { requireUser } from '$lib/server/cms/guard';
import { altStatements, dbErrorMessage, mediaMap } from '$lib/server/cms/editor';
import { bool, fieldErrors, jsonField, optStr, str, uuidOrNull } from '$lib/server/cms/form';
import { saveWithMedia } from '$lib/server/cms/media-service';
import { pageSchema } from '$lib/server/cms/validators';
import { getDb, schema as t } from '$lib/server/db';
import { getStorage } from '$lib/server/env';
import { refsFor } from '$lib/server/media-refs';

export async function load({ params }) {
	const db = await getDb();
	const [page] = await db.select().from(t.pages).where(eq(t.pages.id, params.id)).limit(1);
	if (!page) error(404, 'Pagina niet gevonden');
	return { page, media: await mediaMap(db, [page.heroMediaId]) };
}

function blocksFrom(slug: string, f: FormData) {
	if (slug === 'home') {
		return {
			eyebrow: str(f, 'b_eyebrow'),
			statement: str(f, 'b_statement'),
			panelText: str(f, 'b_panelText'),
			primaryLabel: str(f, 'b_primaryLabel'),
			secondaryLabel: str(f, 'b_secondaryLabel'),
			servicesTitle: str(f, 'b_servicesTitle'),
			servicesLead: str(f, 'b_servicesLead'),
			projectsTitle: str(f, 'b_projectsTitle'),
			projectsLead: str(f, 'b_projectsLead'),
			faqTitle: str(f, 'b_faqTitle'),
			faqLead: str(f, 'b_faqLead')
		};
	}
	if (slug === 'over-ons') {
		const rows = jsonField<{ name: string; detail: string }[]>(f, 'b_pillars', []);
		return { statement: str(f, 'b_statement'), pillars: rows.map((r) => ({ title: r.name.trim(), text: r.detail.trim() })) };
	}
	if (slug === 'contact') return { privacyNotice: str(f, 'b_privacyNotice') };
	return {};
}

export const actions = {
	default: async ({ request, params, locals }) => {
		requireUser(locals);
		const db = await getDb();
		const [page] = await db.select().from(t.pages).where(eq(t.pages.id, params.id)).limit(1);
		if (!page) error(404, 'Pagina niet gevonden');
		const f = await request.formData();
		const parsed = pageSchema.safeParse({
			title: str(f, 'title'),
			intro: str(f, 'intro'),
			body: str(f, 'body'),
			heroMediaId: uuidOrNull(f, 'heroMediaId'),
			seoTitle: optStr(f, 'seoTitle'),
			metaDescription: optStr(f, 'metaDescription'),
			noindex: bool(f, 'noindex')
		});
		const blocks = parseBlocks(page.slug, blocksFrom(page.slug, f));
		if (!parsed.success || !blocks.success) {
			return fail(400, {
				errors: {
					...(parsed.success ? {} : fieldErrors(parsed.error.issues)),
					...(blocks.success ? {} : Object.fromEntries(Object.entries(fieldErrors(blocks.error.issues)).map(([k, v]) => [`b_${k.split('.')[0]}`, v])))
				}
			});
		}
		try {
			await saveWithMedia(db, await getStorage(), 'pages', page.id, refsFor('pages', parsed.data), [
				db.update(t.pages).set({ ...parsed.data, blocks: blocks.data as Record<string, unknown> }).where(eq(t.pages.id, page.id)),
				...altStatements(db, f, ['heroMediaId'])
			]);
		} catch (e) {
			const err = dbErrorMessage(e);
			return fail(400, { errors: { [err.field ?? '_']: err.message } });
		}
		return { saved: true };
	}
};
