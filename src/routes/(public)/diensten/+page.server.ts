import { getContent } from '$lib/server/content';

export function load() {
	return { content: getContent() };
}
