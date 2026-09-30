/** JSON-LD builders (docs/cms-plan/06-public-site.md). */
import type { Faq, Post, Service, SiteSettings } from './types';

type Json = Record<string, unknown>;

export function business(settings: SiteSettings, siteUrl: string): Json {
	const c = settings.company;
	const sameAs = [settings.socials.facebook, settings.socials.instagram].filter(Boolean);
	return {
		'@context': 'https://schema.org',
		'@type': 'HomeAndConstructionBusiness',
		'@id': `${siteUrl}/#business`,
		name: c.name,
		url: siteUrl + '/',
		email: c.email,
		telephone: c.phone.replace(/\(0\)\s*/, '').replace(/\s+/g, ' '),
		logo: `${siteUrl}/favicon.svg`,
		address: {
			'@type': 'PostalAddress',
			streetAddress: c.street,
			postalCode: c.postcode,
			addressLocality: c.city,
			addressCountry: 'BE'
		},
		areaServed: 'Antwerpen',
		...(c.companyNumber ? { vatID: c.companyNumber } : {}),
		...(sameAs.length ? { sameAs } : {})
	};
}

export function service(s: Service, siteUrl: string): Json {
	return {
		'@context': 'https://schema.org',
		'@type': 'Service',
		name: s.title,
		description: s.summary,
		serviceType: s.title,
		url: `${siteUrl}/diensten/${s.slug}`,
		provider: { '@id': `${siteUrl}/#business` },
		...(s.items.length
			? {
					hasOfferCatalog: {
						'@type': 'OfferCatalog',
						name: s.title,
						itemListElement: s.items.map((i) => ({
							'@type': 'Offer',
							itemOffered: { '@type': 'Service', name: i.name, ...(i.detail ? { description: i.detail } : {}) }
						}))
					}
				}
			: {})
	};
}

export function faqPage(items: Faq[]): Json | null {
	if (!items.length) return null;
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: items.map((f) => ({
			'@type': 'Question',
			name: f.question,
			acceptedAnswer: { '@type': 'Answer', text: f.answer }
		}))
	};
}

export function blogPosting(p: Post, siteUrl: string): Json {
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: p.title,
		description: p.intro,
		url: `${siteUrl}/blog/${p.slug}`,
		...(p.publishedOn ? { datePublished: p.publishedOn } : {}),
		...(p.cover ? { image: siteUrl + p.cover.src } : {}),
		inLanguage: 'nl-BE',
		author: { '@id': `${siteUrl}/#business` },
		publisher: { '@id': `${siteUrl}/#business` }
	};
}

export function breadcrumbs(items: { name: string; path: string }[], siteUrl: string): Json {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((it, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: it.name,
			item: siteUrl + it.path
		}))
	};
}

/** Serialise for a <script type="application/ld+json">, safe against `</script>` in content. */
export function ldJson(data: Json): string {
	return JSON.stringify(data).replace(/</g, '\\u003c');
}
