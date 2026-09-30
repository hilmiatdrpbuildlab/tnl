<script lang="ts">
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { buildSeo } from '$lib/seo';
	import type { ViewCtx } from './context';
	import SiteHeader from './SiteHeader.svelte';

	/** Fixed pages: /bedankt, /formulier-fout and the 404. Never indexed. */
	interface Props {
		ctx: ViewCtx;
		eyebrow: string;
		title: string;
		lead: string;
		links?: { href: string; label: string }[];
	}
	let { ctx, eyebrow, title, lead, links = [] }: Props = $props();
	const meta = $derived(buildSeo({ title, description: lead, path: ctx.path, noindex: true }, ctx.layout.siteUrl, true));
</script>

<Seo {meta} />
<SiteHeader {ctx} />

<main id="main">
	<section class="tnl-section">
		<div class="tnl-container l-stack-sm">
			<SectionHeader {eyebrow} {title} {lead} level={1} />
			{#if links.length}
				<div class="l-links">
					{#each links as l, i (l.href)}
						<a class="tnl-btn" class:tnl-btn--outline={i > 0} href={l.href}>{l.label}</a>
					{/each}
				</div>
			{/if}
		</div>
	</section>
</main>
