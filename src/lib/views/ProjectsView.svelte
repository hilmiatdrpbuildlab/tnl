<script lang="ts">
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { business } from '$lib/schema-org';
	import { buildSeo } from '$lib/seo';
	import type { Project } from '$lib/types';
	import type { ViewCtx } from './context';
	import SiteHeader from './SiteHeader.svelte';

	let { ctx }: { ctx: ViewCtx } = $props();
	const c = $derived(ctx.content);
	const page = $derived(c.pages.find((p) => p.slug === 'projecten')!);
	const groups = $derived(
		[
			...c.services.map((s) => ({ key: s.id, title: s.title, items: c.projects.filter((p) => p.serviceId === s.id) })),
			{ key: 'other', title: 'Andere projecten', items: c.projects.filter((p) => !p.serviceId) }
		].filter((g) => g.items.length) as { key: string; title: string; items: Project[] }[]
	);
	const meta = $derived(
		buildSeo(
			{ title: page.title, seoTitle: page.seoTitle, description: page.metaDescription, fallbackDescription: page.intro, path: '/projecten', noindex: page.noindex },
			ctx.layout.siteUrl,
			ctx.layout.noindexSite
		)
	);
</script>

<Seo {meta} jsonLd={[business(c.settings, ctx.layout.siteUrl)]} />
<SiteHeader {ctx} />

<main id="main">
	<section class="tnl-section">
		<div class="tnl-container l-stack">
			<SectionHeader eyebrow="Projecten" title={page.title} lead={page.intro} level={1} />
			{#each groups as g (g.key)}
				<div class="l-stack-sm">
					<h2 class="t-h3">{g.title}</h2>
					<div class="l-grid-3">
						{#each g.items as project (project.id)}<ProjectCard {project} variant="stack" />{/each}
					</div>
				</div>
			{:else}
				<p class="t-lead">Binnenkort vindt u hier onze projecten.</p>
			{/each}
		</div>
	</section>
</main>
