<script lang="ts">
	import BeforeAfter from '$lib/components/BeforeAfter.svelte';
	import ContactSection from '$lib/components/ContactSection.svelte';
	import FAQ from '$lib/components/FAQ.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import ServiceTiles from '$lib/components/ServiceTiles.svelte';
	import Stats from '$lib/components/Stats.svelte';
	import Testimonial from '$lib/components/Testimonial.svelte';
	import TextLink from '$lib/components/TextLink.svelte';
	import Icon from '$lib/components/icons/Icon.svelte';
	import { business, faqPage } from '$lib/schema-org';
	import { buildSeo } from '$lib/seo';
	import type { HomeBlocks } from '$lib/types';
	import type { ViewCtx } from './context';
	import HeroHeader from './HeroHeader.svelte';

	let { ctx }: { ctx: ViewCtx } = $props();
	const c = $derived(ctx.content);
	const page = $derived(c.pages.find((p) => p.slug === 'home')!);
	const b = $derived(page.blocks as unknown as HomeBlocks);
	const featured = $derived(c.projects.filter((p) => p.isFeatured));
	const pair = $derived(featured.find((p) => p.before && p.after) ?? c.projects.find((p) => p.before && p.after));
	const cards = $derived((featured.length ? featured : c.projects).filter((p) => p.id !== pair?.id).slice(0, 3));
	const generalFaqs = $derived(c.faqs.filter((f) => !f.serviceId));
	const contactPhoto = $derived(c.pages.find((p) => p.slug === 'contact')?.hero ?? null);
	const meta = $derived(
		buildSeo(
			{ title: page.title, seoTitle: page.seoTitle, description: page.metaDescription, fallbackDescription: page.intro, path: '/', image: page.hero, noindex: page.noindex },
			ctx.layout.siteUrl,
			ctx.layout.noindexSite
		)
	);
</script>

<Seo {meta} jsonLd={[business(c.settings, ctx.layout.siteUrl), faqPage(generalFaqs)]} />

<Hero image={page.hero} eyebrow={b.eyebrow} title={b.statement} panelText={b.panelText || page.intro}>
	{#snippet header()}<HeroHeader {ctx} />{/snippet}
	{#snippet actions()}
		<a class="tnl-btn" href="/contact"
			>{b.primaryLabel || 'Contacteer ons'} <span class="tnl-btn__dot"><Icon name="arrow-up-right" /></span></a
		>
		<TextLink href="/diensten">{b.secondaryLabel || 'Onze diensten'}</TextLink>
	{/snippet}
</Hero>

<main id="main">
	<section class="tnl-section">
		<div class="tnl-container">
			<SectionHeader eyebrow="Diensten" title={b.servicesTitle || 'Onze diensten'} lead={b.servicesLead}>
				{#snippet action()}
					<a class="tnl-btn" href="/diensten">Alle diensten <span class="tnl-btn__dot"><Icon name="arrow-up-right" /></span></a>
				{/snippet}
			</SectionHeader>
			<ServiceTiles services={c.services} />
		</div>
	</section>

	{#if pair?.before && pair.after}
		<section class="tnl-section" data-theme="forest">
			<div class="tnl-container">
				<SectionHeader eyebrow="Voor en na" title={pair.title} lead={pair.summary} size="h2">
					{#snippet action()}
						<a class="tnl-btn" href="/projecten/{pair.slug}"
							>Bekijk project <span class="tnl-btn__dot"><Icon name="arrow-up-right" /></span></a
						>
					{/snippet}
				</SectionHeader>
				<BeforeAfter before={pair.before} after={pair.after} />
			</div>
		</section>
	{/if}

	{#if c.stats.length}
		<section class="tnl-section">
			<div class="tnl-container"><Stats stats={c.stats} /></div>
		</section>
	{/if}

	{#if cards.length}
		<section class="tnl-section" data-theme="olive">
			<div class="tnl-container">
				<SectionHeader eyebrow="Projecten" title={b.projectsTitle || 'Ons werk'} lead={b.projectsLead}>
					{#snippet action()}
						<a class="tnl-btn" href="/projecten"
							>Bekijk projecten <span class="tnl-btn__dot"><Icon name="arrow-up-right" /></span></a
						>
					{/snippet}
				</SectionHeader>
				<div class="tnl-projects">
					{#each cards as project (project.id)}<ProjectCard {project} />{/each}
				</div>
			</div>
		</section>
	{/if}

	{#if c.reviews.length}
		<section class="tnl-section">
			<div class="tnl-container l-stack-sm">
				{#each c.reviews.slice(0, 2) as review, i (review.id)}<Testimonial {review} solo={i > 0} />{/each}
			</div>
		</section>
	{/if}

	{#if generalFaqs.length}
		<section class="tnl-section">
			<div class="tnl-container">
				<FAQ items={generalFaqs} title={b.faqTitle || 'Vragen?'} lead={b.faqLead || undefined} />
			</div>
		</section>
	{/if}

	<section class="tnl-section">
		<div class="tnl-container">
			<ContactSection settings={c.settings} photo={contactPhoto} turnstileSiteKey={ctx.turnstileSiteKey} preview={ctx.preview} />
		</div>
	</section>
</main>
