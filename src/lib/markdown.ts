/**
 * Markdown for bodies (services, projects, posts, pages). Rendered at build time and in the CMS
 * preview. Raw HTML is never passed through: it is escaped. Links get rel="noopener", and only
 * http(s), mailto, tel and relative URLs survive. Images in Markdown are not supported: photos go
 * through the media fields so their usage is tracked.
 */
import { Marked, type Tokens } from 'marked';

const escapeHtml = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function safeHref(href: string): string | null {
	const h = href.trim();
	if (/^(https?:|mailto:|tel:)/i.test(h)) return h;
	if (/^[/#?]/.test(h) && !h.startsWith('//')) return h;
	return null;
}

const md = new Marked({
	gfm: true,
	breaks: false,
	renderer: {
		html({ text }: Tokens.HTML | Tokens.Tag) {
			return escapeHtml(text);
		},
		link({ href, title, tokens }: Tokens.Link) {
			const text = this.parser.parseInline(tokens);
			const safe = safeHref(href);
			if (!safe) return text;
			const external = /^https?:/i.test(safe);
			const t = title ? ` title="${escapeHtml(title)}"` : '';
			const rel = external ? ' rel="noopener"' : '';
			return `<a href="${escapeHtml(safe)}"${t}${rel}>${text}</a>`;
		},
		image({ text }: Tokens.Image) {
			return escapeHtml(text);
		}
	}
});

export function renderMarkdown(src: string | null | undefined): string {
	if (!src) return '';
	return md.parse(src, { async: false }) as string;
}
