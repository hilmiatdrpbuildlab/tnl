import { fail } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { seoLengthIssues } from '$lib/seo';
import { noteDeletion } from '$lib/server/cms/changes';
import { dbErrorMessage } from '$lib/server/cms/editor';
import { fieldErrors, int, optStr, str } from '$lib/server/cms/form';
import { requireUser } from '$lib/server/cms/guard';
import { redirectSchema } from '$lib/server/cms/validators';
import { getDb, schema as t } from '$lib/server/db';

export async function load() {
	const db = await getDb();
	const [pages, services, projects, posts, redirects] = await Promise.all([
		db.select().from(t.pages),
		db.select().from(t.services).orderBy(asc(t.services.sortOrder)),
		db.select().from(t.projects).orderBy(asc(t.projects.sortOrder)),
		db.select().from(t.posts),
		db.select().from(t.redirects).orderBy(asc(t.redirects.fromPath))
	]);
	const row = (kind: string, name: string, path: string, href: string, r: { seoTitle: string | null; metaDescription: string | null }, visible = true) => ({
		kind,
		name,
		path,
		href,
		visible,
		seoTitle: r.seoTitle,
		metaDescription: r.metaDescription,
		issues: seoLengthIssues(r.seoTitle, r.metaDescription).map((i) => i.field)
	});
	const items = [
		...pages.map((p) => row("Pagina", p.slug === 'home' ? 'Home' : p.title, p.slug === 'home' ? '/' : `/${p.slug}`, `/admin/paginas/${p.id}`, p)),
		...services.map((s) => row('Dienst', s.title, `/diensten/${s.slug}`, `/admin/diensten/${s.id}`, s, s.isPublished)),
		...projects.map((p) => row('Project', p.title, `/projecten/${p.slug}`, `/admin/projecten/${p.id}`, p, p.isPublished)),
		...posts.map((p) => row('Blog', p.title, `/blog/${p.slug}`, `/admin/blog/${p.id}`, p, p.isPublished))
	];
	return { items, redirects };
}

export const actions = {
	saveRedirect: async ({ request, locals }) => {
		requireUser(locals);
		const db = await getDb();
		const f = await request.formData();
		const id = str(f, 'id');
		const parsed = redirectSchema.safeParse({
			fromPath: str(f, 'fromPath').replace(/\/+$/, '') || '/',
			toPath: str(f, 'toPath'),
			status: int(f, 'status', 301) === 302 ? 302 : 301,
			note: optStr(f, 'note')
		});
		if (!parsed.success) return fail(400, { id, errors: fieldErrors(parsed.error.issues) });
		try {
			if (id) await db.update(t.redirects).set(parsed.data).where(eq(t.redirects.id, id));
			else await db.insert(t.redirects).values(parsed.data);
		} catch (e) {
			const err = dbErrorMessage(e);
			return fail(400, { id, errors: { [err.field ?? '_']: err.message } });
		}
		return { id, saved: true };
	},
	delete: async ({ request, locals }) => {
		requireUser(locals);
		const db = await getDb();
		await db.delete(t.redirects).where(eq(t.redirects.id, str(await request.formData(), 'id')));
		await noteDeletion(db);
		return { deleted: true };
	}
};
