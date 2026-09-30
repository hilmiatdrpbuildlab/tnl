<script lang="ts">
	import Chips from '$lib/components/Chips.svelte';
	import ContactSection from '$lib/components/ContactSection.svelte';
	import FAQ from '$lib/components/FAQ.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/icons/Icon.svelte';
	import { breadcrumbs, business, faqPage, service } from '$lib/schema-org';
	import { buildSeo } from '$lib/seo';
	import type { ViewCtx } from './context';
	import HeroHeader from './HeroHeader.svelte';

	let { ctx, slug }: { ctx: ViewCtx; slug: string } = $props();
	const c = $derived(ctx.content);
	const s = $derived(c.services.find((x) => x.slug === slug)!);
	const projects = $derived(c.projects.filter((p) => p.serviceId === s.id));
	const faqs = $derived(c.faqs.filter((f) => f.serviceId === s.id || !f.serviceId).slice(0, 8));
	const contactPhoto = $derived(c.pages.find((p) => p.slug === 'contact')?.hero ?? null);
	const url = $derived(ctx.layout.siteUrl);
	const meta = $derived(
		buildSeo(
			{ title: s.title, seoTitle: s.seoTitle, description: s.metaDescription, fallbackDescription: s.summary, path: `/diensten/${s.slug}`, image: s.hero },
			url,
			ctx.layout.noindexSite
		)
	);
</script>

<Seo
	{meta}
	jsonLd={[
		business(c.settings, url),
		service(s, url),
		faqPage(faqs),
		breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Diensten', path: '/diensten' }, { name: s.title, path: `/diensten/${s.slug}` }], url)
	]}
/>

<Hero variant="interior" image={s.hero} eyebrow="Diensten" title={s.title} panelText={s.summary}>
	{#snippet header()}<HeroHeader {ctx} />{/snippet}
	{#snippet actions()}
		<a class="tnl-btn" href="/contact">Contacteer ons <span class="tnl-btn__dot"><Icon name="arrow-up-right" /></span></a>
	{/snippet}
</Hero>

<main id="main">
	<section class="tnl-section">
		<div class="tnl-container l-split">
			<div class="l-stack-sm">
				{#if s.items.length}
					<ul class="tnl-plus-list">
						{#each s.items as item, i (i)}
							<li>
								<Icon name="plus" />
								<div><strong>{item.name}</strong>{#if item.detail} <span>{item.detail}</span>{/if}</div>
							</li>
						{/each}
					</ul>
				{/if}
				<Chips items={s.items.map((i) => i.name)} />
			</div>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<div class="l-prose">{@html s.bodyHtml}</div>
		</div>
	</section>

	{#if projects.length}
		<section class="tnl-section" data-theme="olive">
			<div class="tnl-container">
				<SectionHeader eyebrow="Projecten" title="Ons werk" size="h2" />
				<div class="l-grid-3">
					{#each projects as project (project.id)}<ProjectCard {project} variant="stack" />{/each}
				</div>
			</div>
		</section>
	{/if}

	{#if faqs.length}
		<section class="tnl-section">
			<div class="tnl-container"><FAQ items={faqs} /></div>
		</section>
	{/if}

	<section class="tnl-section">
		<div class="tnl-container">
			<ContactSection settings={c.settings} photo={contactPhoto} turnstileSiteKey={ctx.turnstileSiteKey} preview={ctx.preview} />
		</div>
	</section>
</main>
