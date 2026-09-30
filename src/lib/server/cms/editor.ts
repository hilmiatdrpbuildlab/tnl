/** Shared bits for the CMS editors. */
import { eq, inArray } from 'drizzle-orm';
import type { Db } from '../db/client';
import * as t from '../db/schema';
import { str } from './form';

export async function mediaMap(db: Db, ids: (string | null | undefined)[]) {
	const list = [...new Set(ids.filter((x): x is string => !!x))];
	if (!list.length) return {} as Record<string, { id: string; alt: string }>;
	const rows = await db.select({ id: t.media.id, alt: t.media.alt }).from(t.media).where(inArray(t.media.id, list));
	return Object.fromEntries(rows.map((r) => [r.id, r]));
}

/** Statements that save the alt texts sent by ImageField (`<field>__alt`). */
export function altStatements(db: Db, form: FormData, fields: string[]) {
	const qs: unknown[] = [];
	for (const f of fields) {
		const id = str(form, f);
		if (!/^[0-9a-f-]{36}$/i.test(id) || !form.has(`${f}__alt`)) continue;
		qs.push(db.update(t.media).set({ alt: str(form, `${f}__alt`).slice(0, 300) }).where(eq(t.media.id, id)));
	}
	return qs;
}

/** Postgres constraint violations → a Dutch message for the form. */
export function dbErrorMessage(e: unknown): { field?: string; message: string } {
	const err = e as { code?: string; constraint?: string; cause?: { code?: string; constraint?: string } };
	const code = err.code ?? err.cause?.code;
	const constraint = err.constraint ?? err.cause?.constraint ?? '';
	if (code === '23505' && /slug/.test(constraint)) return { field: 'slug', message: 'Dit adres (slug) is al in gebruik.' };
	if (code === '23505' && /from_path/.test(constraint)) return { field: 'fromPath', message: 'Voor dit adres bestaat al een doorverwijzing.' };
	if (code === '23505') return { message: 'Dit bestaat al.' };
	if (code === '23514' && /consent/.test(constraint)) return { field: 'consentConfirmed', message: 'Een review kan pas online als de klant toestemming gaf.' };
	if (code === '23514' && /before_after/.test(constraint)) return { field: 'afterMediaId', message: 'Kies zowel een voor- als een na-foto, of geen van beide.' };
	if (code === '23514' && /seo_title/.test(constraint)) return { field: 'seoTitle', message: 'De SEO-titel is te lang.' };
	if (code === '23514' && /meta_description/.test(constraint)) return { field: 'metaDescription', message: 'De beschrijving is te lang.' };
	console.error('cms: save failed', e);
	return { message: 'Opslaan is mislukt. Probeer het opnieuw.' };
}
