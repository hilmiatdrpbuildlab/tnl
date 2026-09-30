// Dev-only gallery of the ported design-system components (phase 1 check against styleguide.html).
import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import { getContent, layoutData } from '$lib/server/content';

export const prerender = false;

export function load() {
	if (!dev) error(404, 'Not found');
	const content = getContent();
	return { content, layout: layoutData(content) };
}
