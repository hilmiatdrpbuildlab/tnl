<script lang="ts">
	import BlogCard from '$lib/components/BlogCard.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { business } from '$lib/schema-org';
	import { buildSeo } from '$lib/seo';
	import type { ViewCtx } from './context';
	import SiteHeader from './SiteHeader.svelte';

	let { ctx }: { ctx: ViewCtx } = $props();
	const c = $derived(ctx.content);
	const page = $derived(c.pages.find((p) => p.slug === 'blog')!);
	const meta = $derived(
		buildSeo(
			{ title: page.title, seoTitle: page.seoTitle, description: page.metaDescription, fallbackDescription: page.intro, path: '/blog', noindex: page.noindex || !c.posts.length },
			ctx.layout.siteUrl,
			ctx.layout.noindexSite
		)
	);
</script>

<Seo {meta} jsonLd={[business(c.settings, ctx.layout.siteUrl)]} />
<SiteHeader {ctx} />

<main id="main">
	<section class="tnl-section">
		<div class="tnl-container">
			<SectionHeader eyebrow="Blog" title={page.title} lead={page.intro} level={1} />
			{#if c.posts.length}
				<div class="tnl-posts">
					{#each c.posts as post (post.id)}<BlogCard {post} />{/each}
				</div>
			{:else}
				<p class="t-lead">Binnenkort vindt u hier onze artikels.</p>
			{/if}
		</div>
	</section>
</main>
