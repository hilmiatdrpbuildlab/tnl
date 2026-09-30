/**
 * TNL's real launch content, the single source for `seed-content.ts` (database) and
 * `export-seed.ts` (scripts/seed.json, the build's fallback when Neon is unreachable).
 *
 * Every text here comes from TNL's current site or from design-system-v2, which quotes it.
 * Project titles and sentences only describe what the photos show: replace them with TNL's own
 * project details (open item "Real content" in docs/cms-plan/12-open-items.md). No reviews are
 * seeded: reviews need the customer's permission. No blog posts: the blog link stays hidden.
 *
 * IDs are fixed so running the seed twice leaves the same rows.
 */

export interface SeedMedia {
	id: string;
	file: string; // path under seed/photos
	alt: string;
}

export const seedMedia: SeedMedia[] = [
	{
		id: '0e5a4c0e-0000-4000-8000-000000000001',
		file: 'aanleg-kasseien-oprit.jpg',
		alt: 'Oprit in kasseien tussen strak gesnoeide hagen en buxusbollen'
	},
	{
		id: '0e5a4c0e-0000-4000-8000-000000000002',
		file: 'aanleg-pad-haag.jpg',
		alt: 'Betonpad langs een gevel tussen twee hoge beukenhagen'
	},
	{
		id: '0e5a4c0e-0000-4000-8000-000000000003',
		file: 'onderhoud-snoeien.jpg',
		alt: 'Medewerker van TNL snoeit een hoge haag vanaf een ladder'
	},
	{
		id: '0e5a4c0e-0000-4000-8000-000000000004',
		file: 'onderhoud-gazon.jpg',
		alt: 'Pas gemaaid gazon met strepen voor een villa'
	},
	{
		id: '0e5a4c0e-0000-4000-8000-000000000005',
		file: 'project-voor.jpg',
		alt: 'Voor: omgewoelde grond met een minigraver'
	},
	{
		id: '0e5a4c0e-0000-4000-8000-000000000006',
		file: 'project-na.jpg',
		alt: 'Na: grindpad, nieuw gazon en hagen'
	},
	{
		id: '0e5a4c0e-0000-4000-8000-000000000007',
		file: 'stock/klus-bomen-vellen.jpg',
		alt: 'Kettingzaag naast een gevelde boomstam'
	}
];

const M = Object.fromEntries(seedMedia.map((m) => [m.file.replace(/^stock\//, '').replace('.jpg', ''), m.id]));

export const seedSettings = {
	company: {
		name: 'TNL Group',
		street: 'Dorpstraat 64',
		postcode: '2040',
		city: 'Berendrecht',
		// Open item: look up in the KBO register and have TNL confirm. Empty = hidden in the footer,
		// and verify-build prints a warning, because Belgian law requires it on the site.
		companyNumber: '',
		email: 'grouptnl@outlook.com',
		phone: '+32 (0) 495 75 54 37'
	},
	socials: {
		// Open item: TNL's page address. The share link is what the current site uses.
		facebook: 'https://www.facebook.com/share/19JzXtyX3a/',
		instagram: 'https://www.instagram.com/grouptnl'
	},
	notifyEmail: 'grouptnl@outlook.com'
};

export const seedPages = [
	{
		id: '5a9e0000-0000-4000-8000-000000000001',
		slug: 'home',
		title: 'Home',
		intro:
			'TNL Group is een bedrijf waar kwaliteit en service hand in hand gaan. We zoeken samen met u de beste oplossing om uw project tot een mooi einde te brengen.',
		body: '',
		heroMediaId: M['aanleg-kasseien-oprit'],
		blocks: {
			eyebrow: 'Aanleg · Onderhoud · Klusjesdienst',
			statement: 'Van A tot Z.',
			panelText:
				'TNL Group is een bedrijf waar kwaliteit en service hand in hand gaan. We zoeken samen met u de beste oplossing om uw project tot een mooi einde te brengen.',
			primaryLabel: 'Contacteer ons',
			secondaryLabel: 'Onze diensten',
			servicesTitle: 'Onze diensten',
			servicesLead:
				'Tuinaanleg, onderhoud en een uitgebreide klusjesdienst, voor particuliere tuinen, bedrijfsterreinen, parkings en openbaar groen.',
			projectsTitle: 'Ons werk',
			projectsLead: 'Een greep uit de tuinen en terreinen die wij aanlegden en onderhouden.',
			faqTitle: 'Vragen?',
			faqLead: 'Staat uw vraag er niet tussen? Neem zeker vrijblijvend contact op.'
		},
		seoTitle: 'TNL Group | Tuinaanleg, onderhoud en klusjesdienst',
		metaDescription:
			'TNL Group uit Berendrecht: tuinaanleg, tuinonderhoud en klusjesdienst voor particulieren, bedrijven, parkings en openbaar groen. Van A tot Z.'
	},
	{
		id: '5a9e0000-0000-4000-8000-000000000002',
		slug: 'diensten',
		title: 'Onze diensten',
		intro:
			'Tuinaanleg, onderhoud en een uitgebreide klusjesdienst, voor particuliere tuinen, bedrijfsterreinen, parkings en openbaar groen.',
		body: '',
		heroMediaId: null,
		blocks: {},
		seoTitle: 'Diensten | TNL Group',
		metaDescription:
			'Aanleg, onderhoud en klusjesdienst: van gazon en verharding tot snoeien, maaien, bomen vellen en puin afvoeren. Bekijk wat TNL Group voor u doet.'
	},
	{
		id: '5a9e0000-0000-4000-8000-000000000003',
		slug: 'projecten',
		title: 'Projecten',
		intro: 'Tuinen en terreinen die wij aanlegden en onderhouden, van oprit tot volledige tuinrenovatie.',
		body: '',
		heroMediaId: null,
		blocks: {},
		seoTitle: 'Projecten | TNL Group',
		metaDescription:
			'Bekijk projecten van TNL Group: opritten, tuinpaden, tuinrenovaties en onderhoud in en rond Berendrecht.'
	},
	{
		id: '5a9e0000-0000-4000-8000-000000000004',
		slug: 'over-ons',
		title: 'Over ons',
		intro:
			'Wat begon als een bedrijf gericht op particuliere tuinen, is uitgegroeid tot een betrouwbare partner voor het onderhoud van bedrijfsterreinen, parkings en openbaar groen.',
		body: '',
		heroMediaId: M['onderhoud-gazon'],
		blocks: {
			statement: 'Kwaliteit en service gaan hand in hand.',
			pillars: [
				{
					title: 'Samen de beste oplossing',
					text: 'We zoeken samen met u de beste oplossing om uw project tot een mooi einde te brengen.'
				},
				{
					title: 'Goede voorbereiding',
					text: 'Door onze focus op goeie voorbereiding en duidelijke communicatie staan wij garant voor 100% klanttevredenheid.'
				},
				{
					title: 'Kwaliteit en innovatie',
					text: 'Elke dag streven wij naar kwaliteit en innovatie, zodat wij u met de beste en efficiëntste methodes kunnen helpen.'
				}
			]
		},
		seoTitle: 'Over ons | TNL Group',
		metaDescription:
			'TNL Group: kwaliteit en service gaan hand in hand. Tuinaanleg en onderhoud voor particulieren, bedrijfsterreinen, parkings en openbaar groen.'
	},
	{
		id: '5a9e0000-0000-4000-8000-000000000005',
		slug: 'contact',
		title: 'Contacteer ons',
		intro: 'Vul uw gegevens in en wij nemen zo snel mogelijk contact met u op.',
		body: '',
		heroMediaId: M['onderhoud-snoeien'],
		blocks: {
			// Draft by the team, to be approved by TNL (open item "Privacy notice").
			privacyNotice:
				'Wij gebruiken uw gegevens alleen om uw vraag te beantwoorden. Berichten bewaren wij maximaal 12 maanden. Vragen over uw gegevens? Mail naar grouptnl@outlook.com.'
		},
		seoTitle: 'Contact | TNL Group',
		metaDescription:
			'Contacteer TNL Group, Dorpstraat 64, 2040 Berendrecht. Mail grouptnl@outlook.com of bel +32 (0) 495 75 54 37. Wij nemen zo snel mogelijk contact op.'
	},
	{
		id: '5a9e0000-0000-4000-8000-000000000006',
		slug: 'blog',
		title: 'Blog',
		intro: 'Advies en nieuws over tuinaanleg en tuinonderhoud.',
		body: '',
		heroMediaId: null,
		blocks: {},
		seoTitle: 'Blog | TNL Group',
		metaDescription: 'Advies en nieuws van TNL Group over tuinaanleg, tuinonderhoud en klusjes rond het huis.'
	}
];

export const seedServices = [
	{
		id: '5e7c0000-0000-4000-8000-000000000001',
		slug: 'aanleg',
		title: 'Aanleg',
		summary: 'Van gazon tot volledige tuinprojecten.',
		body:
			'Wij leggen uw tuin aan van A tot Z: van een nieuw gazon tot een volledig tuinproject.\n\nVerharding hoort bij onze tuinaanleg: terrassen, opritten en tuinpaden. Daarnaast plaatsen wij schuttingen en omheiningen, en voeren wij grond- en afbraakwerken uit.',
		items: [
			{ name: 'Tuinaanleg', detail: 'gazon en volledige tuinprojecten' },
			{ name: 'Verharding', detail: 'terrassen, opritten en tuinpaden' },
			{ name: 'Schuttingen & omheiningen', detail: '' },
			{ name: 'Grond- en afbraakwerken', detail: '' }
		],
		tileTheme: 'forest' as const,
		heroMediaId: M['aanleg-pad-haag'],
		sortOrder: 1,
		seoTitle: 'Tuinaanleg en verharding | TNL Group',
		metaDescription:
			'Tuinaanleg van A tot Z: gazon, volledige tuinprojecten, terrassen, opritten, tuinpaden, schuttingen en grondwerken door TNL Group.'
	},
	{
		id: '5e7c0000-0000-4000-8000-000000000002',
		slug: 'onderhoud',
		title: 'Onderhoud',
		summary: 'Voor particuliere tuinen, bedrijfsterreinen, parkings en openbaar groen.',
		body:
			'Snoeien, maaien en verticuteren, voor tuinen van particulieren en voor bedrijfsterreinen en openbare ruimtes.\n\nWat begon als een bedrijf gericht op particuliere tuinen, is uitgegroeid tot een betrouwbare partner voor het onderhoud van bedrijfsterreinen, parkings en openbaar groen.',
		items: [
			{ name: 'Tuinen', detail: 'snoeien, maaien en verticuteren' },
			{
				name: 'Industrie, parkings & openbaar groen',
				detail: 'onderhoud van bedrijfsterreinen en openbare ruimtes'
			}
		],
		tileTheme: 'olive' as const,
		heroMediaId: M['onderhoud-snoeien'],
		sortOrder: 2,
		seoTitle: 'Tuinonderhoud | TNL Group',
		metaDescription:
			'Snoeien, maaien en verticuteren voor particuliere tuinen, bedrijfsterreinen, parkings en openbaar groen. Tuinonderhoud door TNL Group.'
	},
	{
		id: '5e7c0000-0000-4000-8000-000000000003',
		slug: 'klusjesdienst',
		title: 'Klusjesdienst',
		summary: 'Zwaar werk? Daar hoeft u zich geen zorgen over te maken.',
		body:
			'Kleine karweien en zwaar werk, zodat u zich nergens zorgen over hoeft te maken.\n\nWij voeren stort en puin af, vellen bomen en verwijderen stronken, en reinigen verharding en dakgoten.',
		items: [
			{ name: 'Kleine karweien', detail: '' },
			{ name: 'Stort en puin afvoeren', detail: '' },
			{ name: 'Bomen vellen & stronken verwijderen', detail: '' },
			{ name: 'Reinigen', detail: 'verharding en dakgoten' }
		],
		tileTheme: 'light' as const,
		heroMediaId: M['klus-bomen-vellen'],
		sortOrder: 3,
		seoTitle: 'Klusjesdienst | TNL Group',
		metaDescription:
			'Kleine karweien, stort en puin afvoeren, bomen vellen, stronken verwijderen en verharding en dakgoten reinigen: de klusjesdienst van TNL Group.'
	}
];

const S = Object.fromEntries(seedServices.map((s) => [s.slug, s.id]));

export const seedProjects = [
	{
		id: '9a0f0000-0000-4000-8000-000000000001',
		slug: 'tuinrenovatie-grind-en-gazon',
		title: 'Tuinrenovatie met grind en gazon',
		serviceId: S.aanleg,
		subService: 'Grondwerken',
		summary: 'Van kale grond naar een grindpad, nieuw gazon en hagen.',
		body: 'Van omgewoelde grond naar een afgewerkte tuin met een grindpad, een nieuw gazon en hagen.',
		coverMediaId: M['project-na'],
		beforeMediaId: M['project-voor'],
		afterMediaId: M['project-na'],
		isFeatured: true,
		sortOrder: 1
	},
	{
		id: '9a0f0000-0000-4000-8000-000000000002',
		slug: 'oprit-in-kasseien',
		title: 'Oprit in kasseien',
		serviceId: S.aanleg,
		subService: 'Verharding',
		summary: 'Nieuwe oprit in kasseien, geflankeerd door strak gesnoeide hagen en bolvormige buxus.',
		body: 'Een nieuwe oprit in kasseien, geflankeerd door strak gesnoeide hagen en bolvormige buxus.',
		coverMediaId: M['aanleg-kasseien-oprit'],
		beforeMediaId: null,
		afterMediaId: null,
		isFeatured: true,
		sortOrder: 2
	},
	{
		id: '9a0f0000-0000-4000-8000-000000000003',
		slug: 'tuinpad-tussen-beukenhagen',
		title: 'Tuinpad tussen beukenhagen',
		serviceId: S.aanleg,
		subService: 'Verharding',
		summary: 'Betonpad langs de gevel, tussen twee hoge beukenhagen.',
		body: 'Een betonpad langs de gevel, tussen twee hoge beukenhagen.',
		coverMediaId: M['aanleg-pad-haag'],
		beforeMediaId: null,
		afterMediaId: null,
		isFeatured: true,
		sortOrder: 3
	},
	{
		id: '9a0f0000-0000-4000-8000-000000000004',
		slug: 'gazon-en-hagen-onderhoud',
		title: 'Gazon en hagen in onderhoud',
		serviceId: S.onderhoud,
		subService: 'Tuinen',
		summary: 'Een gazon in streepjes gemaaid en hagen strak gesnoeid.',
		body: 'Een gazon in streepjes gemaaid en hoge hagen strak gesnoeid, vanaf de ladder.',
		coverMediaId: M['onderhoud-gazon'],
		beforeMediaId: null,
		afterMediaId: null,
		isFeatured: false,
		sortOrder: 4
	}
];

export const seedProjectMedia = [
	{ id: 'a11e0000-0000-4000-8000-000000000001', projectId: seedProjects[3]!.id, mediaId: M['onderhoud-snoeien'], sortOrder: 1 }
];

export const seedFaqs = [
	{
		id: 'fa900000-0000-4000-8000-000000000001',
		question: 'Werken jullie ook voor bedrijven?',
		answer:
			'Ja. Wat begon als een bedrijf gericht op particuliere tuinen, is uitgegroeid tot een betrouwbare partner voor het onderhoud van bedrijfsterreinen, parkings en openbaar groen.',
		serviceId: null,
		sortOrder: 1
	},
	{
		id: 'fa900000-0000-4000-8000-000000000002',
		question: 'Wat valt onder de klusjesdienst?',
		answer:
			'Kleine karweien, stort en puin afvoeren, bomen vellen en stronken verwijderen, en het reinigen van verharding en dakgoten.',
		serviceId: null,
		sortOrder: 2
	},
	{
		id: 'fa900000-0000-4000-8000-000000000003',
		question: 'Welk tuinonderhoud doen jullie?',
		answer:
			'Snoeien, maaien en verticuteren, voor tuinen van particulieren en voor bedrijfsterreinen en openbare ruimtes.',
		serviceId: null,
		sortOrder: 3
	},
	{
		id: 'fa900000-0000-4000-8000-000000000004',
		question: 'Leggen jullie ook terrassen en opritten aan?',
		answer: 'Ja. Verharding hoort bij onze tuinaanleg: terrassen, opritten en tuinpaden.',
		serviceId: null,
		sortOrder: 4
	},
	{
		id: 'fa900000-0000-4000-8000-000000000005',
		question: 'Hoe vraag ik een prijs aan?',
		answer:
			'Vul het contactformulier in, mail naar grouptnl@outlook.com of bel +32 (0) 495 75 54 37. Wij nemen zo snel mogelijk contact met u op.',
		serviceId: null,
		sortOrder: 5
	}
];

export const seedStats = [
	{
		id: '57a70000-0000-4000-8000-000000000001',
		value: '100%',
		label: 'klanttevredenheid, dankzij goede voorbereiding en duidelijke communicatie.',
		sortOrder: 1
	},
	{
		id: '57a70000-0000-4000-8000-000000000002',
		value: '3',
		label: 'diensten onder één dak: aanleg, onderhoud en klusjesdienst.',
		sortOrder: 2
	},
	{
		id: '57a70000-0000-4000-8000-000000000003',
		value: 'A–Z',
		label: 'Wij voorzien alles voor uw projecten van A tot Z.',
		sortOrder: 3
	}
];

export const seedRedirects = [
	{ id: '4ed10000-0000-4000-8000-000000000001', fromPath: '/services-4', toPath: '/diensten', status: 301, note: 'Oude Wix-pagina' },
	{ id: '4ed10000-0000-4000-8000-000000000002', fromPath: '/projects-8', toPath: '/projecten', status: 301, note: 'Oude Wix-pagina' }
];
