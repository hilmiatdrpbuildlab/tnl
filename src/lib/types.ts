/** Content types shared by the public components, the views, content.ts and the CMS preview. */

export type TileTheme = 'forest' | 'olive' | 'light';
export type ReviewSource = 'google' | 'facebook' | 'direct';

/** An image resolved for rendering: either built WebP variants (public) or the original (CMS preview). */
export interface Img {
	id: string;
	src: string;
	srcset?: string;
	width: number;
	height: number;
	alt: string;
}

export interface Seo {
	seoTitle: string | null;
	metaDescription: string | null;
	noindex?: boolean;
}

export interface Company {
	name: string;
	street: string;
	postcode: string;
	city: string;
	companyNumber: string;
	email: string;
	phone: string;
}

export interface Socials {
	facebook?: string;
	instagram?: string;
}

export interface SiteSettings {
	company: Company;
	socials: Socials;
	notifyEmail: string;
}

export interface HomeBlocks {
	eyebrow: string;
	statement: string;
	panelText: string;
	primaryLabel: string;
	secondaryLabel: string;
	servicesTitle: string;
	servicesLead: string;
	projectsTitle: string;
	projectsLead: string;
	faqTitle: string;
	faqLead: string;
}

export interface Pillar {
	title: string;
	text: string;
}

export interface AboutBlocks {
	statement: string;
	pillars: Pillar[];
}

export interface ContactBlocks {
	privacyNotice: string;
}

export interface Page extends Seo {
	slug: string;
	title: string;
	intro: string;
	body: string;
	bodyHtml: string;
	blocks: Record<string, unknown>;
	hero: Img | null;
}

export interface ServiceItem {
	name: string;
	detail: string;
}

export interface Service extends Seo {
	id: string;
	slug: string;
	title: string;
	summary: string;
	body: string;
	bodyHtml: string;
	items: ServiceItem[];
	tileTheme: TileTheme;
	hero: Img | null;
	sortOrder: number;
}

export interface Project extends Seo {
	id: string;
	slug: string;
	title: string;
	serviceId: string | null;
	serviceTitle: string | null;
	serviceSlug: string | null;
	subService: string | null;
	summary: string;
	body: string;
	bodyHtml: string;
	cover: Img | null;
	before: Img | null;
	after: Img | null;
	gallery: Img[];
	location: string | null;
	completedOn: string | null;
	isFeatured: boolean;
	sortOrder: number;
}

export interface Review {
	id: string;
	quote: string;
	authorName: string;
	place: string | null;
	serviceTitle: string | null;
	rating: number | null;
	source: ReviewSource;
	photo: Img | null;
}

export interface Faq {
	id: string;
	question: string;
	answer: string;
	serviceId: string | null;
}

export interface Stat {
	id: string;
	value: string;
	label: string;
}

export interface Post extends Seo {
	id: string;
	slug: string;
	title: string;
	intro: string;
	body: string;
	bodyHtml: string;
	category: string | null;
	publishedOn: string | null;
	cover: Img | null;
}

export interface Redirect {
	fromPath: string;
	toPath: string;
	status: 301 | 302;
}

/** Everything the public site is built from. */
export interface SiteContent {
	settings: SiteSettings;
	pages: Page[];
	services: Service[];
	projects: Project[];
	reviews: Review[];
	faqs: Faq[];
	stats: Stat[];
	posts: Post[];
	redirects: Redirect[];
}

/** Data every public layout needs (header, footer, JSON-LD). */
export interface LayoutData {
	settings: SiteSettings;
	services: Pick<Service, 'slug' | 'title'>[];
	hasPosts: boolean;
	siteUrl: string;
	noindexSite: boolean;
	buildId: string;
}
