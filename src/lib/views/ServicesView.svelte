<script lang="ts">
	import ContactSection from '$lib/components/ContactSection.svelte';
	import Eyebrow from '$lib/components/Eyebrow.svelte';
	import Pillars from '$lib/components/Pillars.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import ServiceTabs from '$lib/components/ServiceTabs.svelte';
	import { business, service } from '$lib/schema-org';
	import { buildSeo } from '$lib/seo';
	import type { AboutBlocks } from '$lib/types';
	import type { ViewCtx } from './context';
	import SiteHeader from './SiteHeader.svelte';

	let { ctx }: { ctx: ViewCtx } = $props();
	const c = $derived(ctx.content);
	const page = $derived(c.pages.find((p) => p.slug === 'diensten')!);
	const about = $derived(c.pages.find((p) => p.slug === 'over-ons')?.blocks as unknown as AboutBlocks | undefined);
	const contactPhoto = $derived(c.pages.find((p) => p.slug === 'contact')?.hero ?? null);
	const meta = $derived(
		buildSeo(
			{ title: page.title, seoTitle: page.seoTitle, description: page.metaDescription, fallbackDescription: page.intro, path: '/diensten', noindex: page.noindex },
			ctx.layout.siteUrl,
			ctx.layout.noindexSite
		)
	);
</script>

<Seo {meta} jsonLd={[business(c.settings, ctx.layout.siteUrl), ...c.services.map((s) => service(s, ctx.layout.siteUrl))]} />
<SiteHeader {ctx} />

<main id="main">
	<section class="tnl-section">
		<div class="tnl-container">
			<SectionHeader eyebrow="Diensten" title={page.title} lead={page.intro} level={1} />
			<ServiceTabs services={c.services} />
		</div>
	</section>

	{#if about?.pillars?.length}
		<section class="tnl-section" data-theme="olive">
			<div class="tnl-container l-split">
				<div class="tnl-section-head__text">
					<Eyebrow text="Zo werken wij" />
					<h2 class="t-h2">{about.statement || 'Kwaliteit en service gaan hand in hand.'}</h2>
				</div>
				<Pillars items={about.pillars} />
			</div>
		</section>
	{/if}

	<section class="tnl-section">
		<div class="tnl-container">
			<ContactSection settings={c.settings} photo={contactPhoto} turnstileSiteKey={ctx.turnstileSiteKey} preview={ctx.preview} />
		</div>
	</section>
</main>
