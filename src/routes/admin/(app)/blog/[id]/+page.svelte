<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Check from '$lib/components/admin/Check.svelte';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import Field from '$lib/components/admin/Field.svelte';
	import ImageField from '$lib/components/admin/ImageField.svelte';
	import MarkdownField from '$lib/components/admin/MarkdownField.svelte';
	import SaveBar from '$lib/components/admin/SaveBar.svelte';
	import SeoPanel from '$lib/components/admin/SeoPanel.svelte';

	let { data, form } = $props();
	const p = $derived(data.post);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	let saving = $state(false);
</script>

<svelte:head><title>{p.title || 'Nieuw artikel'} | TNL Group CMS</title></svelte:head>
<header class="adm-head">
	<div><p><a href="/admin/blog">Blog</a></p><h1>{p.title || 'Nieuw artikel'}</h1></div>
	{#if !data.isNew}
		<div class="adm-actions">
			<a class="adm-btn" href="/admin/preview/blog/{p.slug}" target="_blank" rel="noopener">Voorbeeld</a>
			<ConfirmDialog itemName={`het artikel "${p.title}"`} />
		</div>
	{/if}
</header>
{#key page.url.pathname}
<form method="POST" action="?/save" class="adm-form" use:enhance={() => { saving = true; return async ({ update }) => { await update({ reset: false }); saving = false; }; }}>
	<section class="adm-card">
		<div class="adm-row">
			<Field name="title" label="Titel" value={p.title} required error={e.title} hint="Een vraag of advies, onder tien woorden." />
			<Field name="slug" label="Adres (slug)" value={p.slug} error={e.slug} hint="Leeg = gemaakt uit de titel." />
		</div>
		<div class="adm-row">
			<Field name="category" label="Categorie" value={p.category} placeholder="Onderhoud" />
			<Field name="publishedOn" label="Datum" type="date" value={p.publishedOn} error={e.publishedOn} />
		</div>
		<Field name="intro" label="Inleiding" type="textarea" rows={2} value={p.intro} max={400} error={e.intro} />
		<ImageField name="coverMediaId" label="Foto" media={p.coverMediaId ? (data.media[p.coverMediaId as keyof typeof data.media] ?? null) : null} />
		<MarkdownField name="body" label="Tekst" value={p.body} error={e.body} />
		<Check name="isPublished" label="Zichtbaar op de website" checked={p.isPublished} />
	</section>
	<SeoPanel seoTitle={p.seoTitle} metaDescription={p.metaDescription} errors={e} fallbackTitle={p.title} />
	<SaveBar {saving} saved={!!form?.saved || page.url.searchParams.has('saved')} error={e._} />
</form>
{/key}
