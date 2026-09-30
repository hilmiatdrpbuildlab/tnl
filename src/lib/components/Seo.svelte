<script lang="ts">
	import { ldJson } from '$lib/schema-org';
	import type { SeoMeta } from '$lib/seo';

	let { meta, jsonLd = [] }: { meta: SeoMeta; jsonLd?: (Record<string, unknown> | null)[] } = $props();
	const blocks = $derived(jsonLd.filter((b): b is Record<string, unknown> => !!b).map(ldJson));
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	<link rel="canonical" href={meta.canonical} />
	{#if meta.noindex}<meta name="robots" content="noindex, nofollow" />{/if}
	<meta property="og:type" content={meta.type} />
	<meta property="og:site_name" content="TNL Group" />
	<meta property="og:locale" content="nl_BE" />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:url" content={meta.canonical} />
	{#if meta.ogImage}<meta property="og:image" content={meta.ogImage} />{/if}
	<meta name="twitter:card" content={meta.ogImage ? 'summary_large_image' : 'summary'} />
	{#each blocks as json, i (i)}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html '<script type="application/ld+json">' + json + '</' + 'script>'}
	{/each}
</svelte:head>
