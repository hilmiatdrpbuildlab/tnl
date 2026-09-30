<script lang="ts">
	import ContactSection from '$lib/components/ContactSection.svelte';
	import FAQ from '$lib/components/FAQ.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { business, faqPage } from '$lib/schema-org';
	import { buildSeo } from '$lib/seo';
	import type { ContactBlocks } from '$lib/types';
	import type { ViewCtx } from './context';
	import SiteHeader from './SiteHeader.svelte';

	let { ctx }: { ctx: ViewCtx } = $props();
	const c = $derived(ctx.content);
	const page = $derived(c.pages.find((p) => p.slug === 'contact')!);
	const b = $derived(page.blocks as unknown as ContactBlocks);
	const faqs = $derived(c.faqs.filter((f) => !f.serviceId));
	const meta = $derived(
		buildSeo(
			{ title: page.title, seoTitle: page.seoTitle, description: page.metaDescription, fallbackDescription: page.intro, path: '/contact', noindex: page.noindex },
			ctx.layout.siteUrl,
			ctx.layout.noindexSite
		)
	);
</script>

<Seo {meta} jsonLd={[business(c.settings, ctx.layout.siteUrl), faqPage(faqs)]} />
<SiteHeader {ctx} />

<main id="main">
	<section class="tnl-section">
		<div class="tnl-container">
			<ContactSection
				settings={c.settings}
				photo={page.hero}
				turnstileSiteKey={ctx.turnstileSiteKey}
				headingLevel={1}
				privacyNotice={b.privacyNotice}
				preview={ctx.preview}
			/>
		</div>
	</section>
	{#if faqs.length}
		<section class="tnl-section">
			<div class="tnl-container"><FAQ items={faqs} /></div>
		</section>
	{/if}
</main>
