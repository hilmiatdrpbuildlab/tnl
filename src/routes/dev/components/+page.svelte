<script lang="ts">
	import '$lib/styles/layout.css';
	import Badge from '$lib/components/Badge.svelte';
	import BeforeAfter from '$lib/components/BeforeAfter.svelte';
	import BlogCard from '$lib/components/BlogCard.svelte';
	import Button from '$lib/components/Button.svelte';
	import Chips from '$lib/components/Chips.svelte';
	import ContactSection from '$lib/components/ContactSection.svelte';
	import FAQ from '$lib/components/FAQ.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import Header from '$lib/components/Header.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Pillars from '$lib/components/Pillars.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import ServiceTabs from '$lib/components/ServiceTabs.svelte';
	import ServiceTiles from '$lib/components/ServiceTiles.svelte';
	import Stats from '$lib/components/Stats.svelte';
	import Testimonial from '$lib/components/Testimonial.svelte';
	import TextLink from '$lib/components/TextLink.svelte';
	import type { AboutBlocks } from '$lib/types';

	let { data } = $props();
	const c = $derived(data.content);
	const phone = $derived(c.settings.company.phone);
	const pair = $derived(c.projects.find((p) => p.before && p.after));
	const about = $derived(c.pages.find((p) => p.slug === 'over-ons')!.blocks as unknown as AboutBlocks);
	const home = $derived(c.pages.find((p) => p.slug === 'home')!);
	const sampleReview = $derived({ id: 'r', quote: 'Plaats hier een echte review van een klant.', authorName: 'Naam klant', place: 'Gemeente', serviceTitle: 'Onderhoud', rating: 5, source: 'direct' as const, photo: home.hero });
	const samplePost = $derived({ id: 'p', slug: 'voorbeeld', title: 'Verticuteren: wanneer en waarom?', intro: '', body: '', bodyHtml: '', category: 'Onderhoud', publishedOn: '2026-03-12', cover: c.projects[0]?.cover ?? null, seoTitle: null, metaDescription: null });
</script>

<svelte:head><title>Components (dev)</title><meta name="robots" content="noindex" /></svelte:head>

<div class="tnl-container l-stack" style="padding-block:32px">
	<h1 class="t-h2">Design system v2, in Svelte</h1>
	<section class="l-stack-sm"><h2 class="t-h4">Button · TextLink · Badge · Chip</h2>
		{#each ['light', 'olive', 'forest'] as theme (theme)}
			<div data-theme={theme} style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;padding:24px">
				<Button href="#">Contacteer ons</Button><Button href="#" variant="outline">Bekijk projecten</Button><Button type="submit">Verzenden</Button>
				<Button href="#" size="sm">Meer info</Button><TextLink href="#">Alle diensten</TextLink><Button disabled>Verzenden</Button>
				<Badge>Voor</Badge><Badge variant="accent">Na</Badge><Badge variant="outline">Aanleg</Badge>
				<Chips items={['Snoeien', 'Maaien', 'Verticuteren']} />
			</div>
		{/each}
	</section>
	<section><h2 class="t-h4">Header</h2><div data-theme="light"><Header path="/diensten" {phone} /></div><div data-theme="forest"><Header path="/projecten" {phone} onDark /></div></section>
	<section><h2 class="t-h4">Hero</h2>
		<Hero image={home.hero} eyebrow="Aanleg · Onderhoud · Klusjesdienst" title="Van A tot Z." panelText={home.intro}>
			{#snippet header()}<Header path="/" {phone} onDark />{/snippet}
			{#snippet actions()}<Button href="#">Contacteer ons</Button><TextLink href="#">Onze diensten</TextLink>{/snippet}
		</Hero>
	</section>
	<section><SectionHeader eyebrow="Diensten" title="Onze diensten" lead="Tuinaanleg, onderhoud en een uitgebreide klusjesdienst." /></section>
	<section><h2 class="t-h4">ServiceTiles</h2><ServiceTiles services={c.services} /></section>
	<section><h2 class="t-h4">ServiceTabs</h2><ServiceTabs services={c.services} /></section>
	{#if pair?.before && pair.after}<section><h2 class="t-h4">BeforeAfter</h2><BeforeAfter before={pair.before} after={pair.after} /></section>{/if}
	<section class="l-stack-sm"><h2 class="t-h4">Stats</h2><div data-theme="light" style="padding:24px"><Stats stats={c.stats} /></div><div data-theme="forest" style="padding:24px"><Stats stats={c.stats} /></div></section>
	<section><h2 class="t-h4">ProjectCard</h2><div class="tnl-projects">{#if c.projects[0]}<ProjectCard project={c.projects[0]} />{/if}<div class="l-grid-2">{#each c.projects.slice(1, 3) as p (p.id)}<ProjectCard project={p} variant="stack" />{/each}</div></div></section>
	<section data-theme="olive" style="padding:24px"><div class="l-split"><div class="tnl-section-head__text"><h2 class="t-h2">{about.statement}</h2></div><Pillars items={about.pillars} /></div></section>
	<section class="l-stack-sm"><h2 class="t-h4">Testimonial (placeholder text)</h2><Testimonial review={sampleReview} /><div data-theme="forest" style="padding:24px"><Testimonial review={sampleReview} solo /></div></section>
	<section><h2 class="t-h4">BlogCard (example)</h2><div class="tnl-posts"><BlogCard post={samplePost} /><BlogCard post={samplePost} /><BlogCard post={samplePost} /></div></section>
	<section><h2 class="t-h4">FAQ</h2><FAQ items={c.faqs} /></section>
	<section><h2 class="t-h4">FormField</h2><div class="tnl-contact__card"><div class="tnl-form">
		<FormField id="d1" name="a" label="Voornaam" placeholder="Jan" />
		<FormField id="d2" name="b" label="Email" type="email" value="jan.peeters@" invalid error="Vul een geldig e-mailadres in, bijvoorbeeld naam@voorbeeld.be." />
		<FormField id="d3" name="c" label="Dienst" type="select" options={['Kies een dienst', 'Aanleg', 'Onderhoud', 'Klusjesdienst']} />
		<FormField id="d4" name="d" label="Uw bericht" type="textarea" full hint="Vermeld gerust de gemeente en de oppervlakte van uw tuin." />
	</div></div></section>
	<section><h2 class="t-h4">ContactSection</h2><ContactSection settings={c.settings} photo={c.pages.find((p) => p.slug === 'contact')?.hero ?? null} preview /></section>
</div>
<Footer settings={c.settings} services={data.layout.services} />
