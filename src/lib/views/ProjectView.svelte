<script lang="ts">
	import Image from '$lib/components/Image.svelte';
	import BeforeAfter from '$lib/components/BeforeAfter.svelte';
	import ContactSection from '$lib/components/ContactSection.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Icon from '$lib/components/icons/Icon.svelte';
	import { formatDate } from '$lib/format';
	import { breadcrumbs, business } from '$lib/schema-org';
	import { buildSeo } from '$lib/seo';
	import type { ViewCtx } from './context';
	import HeroHeader from './HeroHeader.svelte';

	let { ctx, slug }: { ctx: ViewCtx; slug: string } = $props();
	const c = $derived(ctx.content);
	const p = $derived(c.projects.find((x) => x.slug === slug)!);
	const related = $derived(
		c.projects.filter((x) => x.id !== p.id && (!p.serviceId || x.serviceId === p.serviceId)).slice(0, 3)
	);
	const meta = $derived([p.serviceTitle, p.subService, p.location, formatDate(p.completedOn)].filter(Boolean).join(' · '));
	const contactPhoto = $derived(c.pages.find((x) => x.slug === 'contact')?.hero ?? null);
	const url = $derived(ctx.layout.siteUrl);
	const seo = $derived(
		buildSeo(
			{ title: p.title, seoTitle: p.seoTitle, description: p.metaDescription, fallbackDescription: p.summary, path: `/projecten/${p.slug}`, image: p.cover ?? p.after },
			url,
			ctx.layout.noindexSite
		)
	);
</script>

<Seo
	meta={seo}
	jsonLd={[
		business(c.settings, url),
		breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Projecten', path: '/projecten' }, { name: p.title, path: `/projecten/${p.slug}` }], url)
	]}
/>

<Hero variant="interior" image={p.cover ?? p.after} eyebrow={meta || 'Project'} title={p.title} panelText={p.summary}>
	{#snippet header()}<HeroHeader {ctx} />{/snippet}
	{#snippet actions()}
		<a class="tnl-btn" href="/contact">Contacteer ons <span class="tnl-btn__dot"><Icon name="arrow-up-right" /></span></a>
	{/snippet}
</Hero>

<main id="main">
	{#if p.before && p.after}
		<section class="tnl-section">
			<div class="tnl-container"><BeforeAfter before={p.before} after={p.after} /></div>
		</section>
	{/if}

	{#if p.bodyHtml || p.gallery.length}
		<section class="tnl-section">
			<div class="tnl-container l-stack">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{#if p.bodyHtml}<div class="l-prose t-lead">{@html p.bodyHtml}</div>{/if}
				{#if p.gallery.length}
					<div class="l-gallery">
						{#each p.gallery as img (img.id)}<Image img={img} sizes='(max-width: 720px) 50vw, 33vw' loading="lazy" />{/each}
					</div>
				{/if}
			</div>
		</section>
	{/if}

	{#if related.length}
		<section class="tnl-section" data-theme="olive">
			<div class="tnl-container">
				<SectionHeader eyebrow="Projecten" title="Meer projecten" size="h2" />
				<div class="l-grid-3">
					{#each related as project (project.id)}<ProjectCard {project} variant="stack" />{/each}
				</div>
			</div>
		</section>
	{/if}

	<section class="tnl-section">
		<div class="tnl-container">
			<ContactSection settings={c.settings} photo={contactPhoto} turnstileSiteKey={ctx.turnstileSiteKey} preview={ctx.preview} />
		</div>
	</section>
</main>
