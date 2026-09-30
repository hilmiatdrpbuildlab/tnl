<script lang="ts">
	import Image from '$lib/components/Image.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import TextLink from '$lib/components/TextLink.svelte';
	import { formatDate } from '$lib/format';
	import { blogPosting, breadcrumbs, business } from '$lib/schema-org';
	import { buildSeo } from '$lib/seo';
	import type { ViewCtx } from './context';
	import SiteHeader from './SiteHeader.svelte';

	let { ctx, slug }: { ctx: ViewCtx; slug: string } = $props();
	const c = $derived(ctx.content);
	const p = $derived(c.posts.find((x) => x.slug === slug)!);
	const url = $derived(ctx.layout.siteUrl);
	const meta = $derived(
		buildSeo(
			{ title: p.title, seoTitle: p.seoTitle, description: p.metaDescription, fallbackDescription: p.intro, path: `/blog/${p.slug}`, image: p.cover, type: 'article' },
			url,
			ctx.layout.noindexSite
		)
	);
</script>

<Seo
	{meta}
	jsonLd={[
		business(c.settings, url),
		blogPosting(p, url),
		breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: p.title, path: `/blog/${p.slug}` }], url)
	]}
/>
<SiteHeader {ctx} />

<main id="main">
	<article class="tnl-section">
		<div class="tnl-container l-stack">
			<header class="tnl-section-head__text">
				<p class="tnl-post__meta">
					{#if p.category}<span class="t-label">{p.category}</span>{/if}
					{#if p.publishedOn}<span>{formatDate(p.publishedOn)}</span>{/if}
				</p>
				<h1 class="t-h1">{p.title}</h1>
				{#if p.intro}<p class="t-lead">{p.intro}</p>{/if}
			</header>
			{#if p.cover}<Image class="tnl-project__media" img={p.cover} sizes='100vw' fetchpriority="high" />{/if}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<div class="l-prose">{@html p.bodyHtml}</div>
			<TextLink href="/blog">Alle artikels</TextLink>
		</div>
	</article>
</main>
