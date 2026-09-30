import type { LayoutData, SiteContent } from '$lib/types';

/** What every view receives: the same shape at build time and in the CMS preview. */
export interface ViewCtx {
	content: SiteContent;
	layout: LayoutData;
	path: string;
	/** CMS preview: draft content, contact form inert, no Turnstile. */
	preview?: boolean;
	turnstileSiteKey?: string;
}
