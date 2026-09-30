<script lang="ts">
	import Eyebrow from '$lib/components/Eyebrow.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Pillars from '$lib/components/Pillars.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Stats from '$lib/components/Stats.svelte';
	import Testimonial from '$lib/components/Testimonial.svelte';
	import Icon from '$lib/components/icons/Icon.svelte';
	import { business } from '$lib/schema-org';
	import { buildSeo } from '$lib/seo';
	import type { AboutBlocks } from '$lib/types';
	import type { ViewCtx } from './context';
	import HeroHeader from './HeroHeader.svelte';

	let { ctx }: { ctx: ViewCtx } = $props();
	const c = $derived(ctx.content);
	const page = $derived(c.pages.find((p) => p.slug === 'over-ons')!);
	const b = $derived(page.blocks as unknown as AboutBlocks);
	const meta = $derived(
		buildSeo(
			{ title: page.title, seoTitle: page.seoTitle, description: page.metaDescription, fallbackDescription: page.intro, path: '/over-ons', image: page.hero, noindex: page.noindex },
			ctx.layout.siteUrl,
			ctx.layout.noindexSite
		)
	);
</script>

<Seo {meta} jsonLd={[business(c.settings, ctx.layout.siteUrl)]} />

<Hero variant="interior" image={page.hero} eyebrow="Over ons" title={page.title} panelText={page.intro}>
	{#snippet header()}<HeroHeader {ctx} />{/snippet}
	{#snippet actions()}
		<a class="tnl-btn" href="/contact">Contacteer ons <span class="tnl-btn__dot"><Icon name="arrow-up-right" /></span></a>
	{/snippet}
</Hero>

<main id="main">
	{#if b.pillars?.length}
		<section class="tnl-section" data-theme="olive">
			<div class="tnl-container l-split">
				<div class="tnl-section-head__text">
					<Eyebrow text="Over ons" />
					<h2 class="t-h2">{b.statement}</h2>
				</div>
				<Pillars items={b.pillars} />
			</div>
		</section>
	{/if}

	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{#if page.bodyHtml}<section class="tnl-section"><div class="tnl-container l-prose">{@html page.bodyHtml}</div></section>{/if}

	{#if c.stats.length}
		<section class="tnl-section">
			<div class="tnl-container"><Stats stats={c.stats} /></div>
		</section>
	{/if}

	{#if c.reviews.length}
		<section class="tnl-section">
			<div class="tnl-container l-stack-sm">
				{#each c.reviews.slice(0, 3) as review, i (review.id)}<Testimonial {review} solo={i > 0} />{/each}
			</div>
		</section>
	{/if}
</main>
