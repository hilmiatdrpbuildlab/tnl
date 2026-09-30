/**
 * Preview: renders a public page with the saved draft content (unpublished rows included),
 * using the same view components as the build. Originals come through /admin/api/media.
 */
import { error } from '@sveltejs/kit';
import { mapContent } from '$lib/server/content-map';
import { loadRows } from '$lib/server/content-rows';
import { getBuild, layoutData } from '$lib/server/content';
import { requireUser } from '$lib/server/cms/guard';
import { getDb } from '$lib/server/db';

export async function load({ params, locals }) {
	requireUser(locals);
	const content = mapContent(await loadRows(await getDb(), false), { images: 'preview', drafts: true });
	const build = getBuild();
	const layout = { ...layoutData(content, build), noindexSite: true };
	const parts = (params.path ?? '').split('/').filter(Boolean);
	const [a, b] = parts;
	let view: string;
	if (!a) view = 'home';
	else if (a === 'diensten' && !b) view = 'services';
	else if (a === 'diensten' && content.services.some((s) => s.slug === b)) view = 'service';
	else if (a === 'projecten' && !b) view = 'projects';
	else if (a === 'projecten' && content.projects.some((p) => p.slug === b)) view = 'project';
	else if (a === 'over-ons' && !b) view = 'about';
	else if (a === 'contact' && !b) view = 'contact';
	else if (a === 'blog' && !b) view = 'blog';
	else if (a === 'blog' && content.posts.some((p) => p.slug === b)) view = 'post';
	else error(404, 'Deze pagina bestaat (nog) niet');
	return { content, layout, view, slug: b ?? '', path: '/' + parts.join('/') };
}
