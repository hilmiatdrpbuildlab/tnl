import { error } from '@sveltejs/kit';
import { getContent } from '$lib/server/content';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => getContent().services.map((s) => ({ slug: s.slug }));

export function load({ params }) {
	const content = getContent();
	if (!content.services.some((s) => s.slug === params.slug)) error(404, 'Niet gevonden');
	return { content, slug: params.slug };
}
