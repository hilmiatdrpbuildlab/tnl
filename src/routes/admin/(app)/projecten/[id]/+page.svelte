<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Check from '$lib/components/admin/Check.svelte';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import Field from '$lib/components/admin/Field.svelte';
	import GalleryField from '$lib/components/admin/GalleryField.svelte';
	import ImageField from '$lib/components/admin/ImageField.svelte';
	import MarkdownField from '$lib/components/admin/MarkdownField.svelte';
	import SaveBar from '$lib/components/admin/SaveBar.svelte';
	import SeoPanel from '$lib/components/admin/SeoPanel.svelte';

	let { data, form } = $props();
	const p = $derived(data.project);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	const m = (id: string | null) => (id ? (data.media[id as keyof typeof data.media] ?? null) : null);
	let saving = $state(false);
</script>

<svelte:head><title>{p.title || 'Nieuw project'} | TNL Group CMS</title></svelte:head>
<header class="adm-head">
	<div><p><a href="/admin/projecten">Projecten</a></p><h1>{p.title || 'Nieuw project'}</h1></div>
	{#if !data.isNew}
		<div class="adm-actions">
			<a class="adm-btn" href="/admin/preview/projecten/{p.slug}" target="_blank" rel="noopener">Voorbeeld</a>
			<ConfirmDialog itemName={`het project "${p.title}"`} />
		</div>
	{/if}
</header>

{#key page.url.pathname}
<form method="POST" action="?/save" class="adm-form" use:enhance={() => { saving = true; return async ({ update }) => { await update({ reset: false }); saving = false; }; }}>
	<section class="adm-card">
		<div class="adm-row">
			<Field name="title" label="Titel" value={p.title} required error={e.title} />
			<Field name="slug" label="Adres (slug)" value={p.slug} error={e.slug} hint="Leeg = gemaakt uit de titel." />
		</div>
		<div class="adm-row">
			<div class="adm-field">
				<label for="serviceId">Dienst</label>
				<select id="serviceId" name="serviceId" value={p.serviceId ?? ''}>
					<option value="">Geen</option>
					{#each data.services as s (s.id)}<option value={s.id}>{s.title}</option>{/each}
				</select>
			</div>
			<Field name="subService" label="Onderdeel" value={p.subService} placeholder="Bijvoorbeeld: Verharding" />
		</div>
		<Field name="summary" label="Eén zin over het project" type="textarea" rows={2} value={p.summary} max={300} error={e.summary} />
		<div class="adm-row">
			<Field name="location" label="Gemeente (optioneel)" value={p.location} hint="Alleen invullen als de klant dat goed vindt." />
			<Field name="completedOn" label="Afgewerkt op (optioneel)" type="date" value={p.completedOn} error={e.completedOn} />
		</div>
	</section>
	<section class="adm-card">
		<h2>Foto's</h2>
		<ImageField name="coverMediaId" label="Hoofdfoto" media={m(p.coverMediaId)} hint="Leeg = de na-foto." />
		<div class="adm-row">
			<ImageField name="beforeMediaId" label="Voor-foto" media={m(p.beforeMediaId)} />
			<ImageField name="afterMediaId" label="Na-foto" media={m(p.afterMediaId)} error={e.afterMediaId} />
		</div>
		<p class="adm-hint">Voor en na horen bij elkaar: kies ze allebei of geen van beide, genomen vanop dezelfde plek en hoogte.</p>
		<GalleryField name="gallery" label="Extra foto's" items={data.gallery as { id: string; alt: string }[]} />
	</section>
	<section class="adm-card">
		<MarkdownField name="body" label="Tekst op de projectpagina" value={p.body} error={e.body} />
		<Check name="isFeatured" label="Uitlichten op de homepage" checked={p.isFeatured} />
		<Check name="isPublished" label="Zichtbaar op de website" checked={p.isPublished} />
	</section>
	<SeoPanel seoTitle={p.seoTitle} metaDescription={p.metaDescription} errors={e} fallbackTitle={p.title} />
	<SaveBar {saving} saved={!!form?.saved || page.url.searchParams.has('saved')} error={e._} />
</form>
{/key}
