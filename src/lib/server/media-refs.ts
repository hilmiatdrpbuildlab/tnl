/** The media each content row uses, as rows for `media_usages`. Relative imports only. */
import type { MediaRef, OwnerTable } from '../media-rules';

type Id = string | null | undefined;
const ref = (field: string, id: Id): MediaRef[] => (id ? [{ field, mediaId: id }] : []);

export function refsFor(table: OwnerTable, row: Record<string, unknown>, galleryIds: string[] = []): MediaRef[] {
	switch (table) {
		case 'pages':
		case 'services':
			return ref('hero', row.heroMediaId as Id);
		case 'projects':
			return [
				...ref('cover', row.coverMediaId as Id),
				...ref('before', row.beforeMediaId as Id),
				...ref('after', row.afterMediaId as Id),
				...[...new Set(galleryIds)].map((id) => ({ field: 'gallery', mediaId: id }))
			];
		case 'reviews':
			return ref('photo', row.photoMediaId as Id);
		case 'posts':
			return ref('cover', row.coverMediaId as Id);
	}
}
