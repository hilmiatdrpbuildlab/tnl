<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Check from '$lib/components/admin/Check.svelte';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import Field from '$lib/components/admin/Field.svelte';
	import ImageField from '$lib/components/admin/ImageField.svelte';
	import MarkdownField from '$lib/components/admin/MarkdownField.svelte';
	import RepeatRows from '$lib/components/admin/RepeatRows.svelte';
	import SaveBar from '$lib/components/admin/SaveBar.svelte';
	import SeoPanel from '$lib/components/admin/SeoPanel.svelte';

	let { data, form } = $props();
	const s = $derived(data.service);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	let saving = $state(false);
</script>

<svelte:head><title>{s.title || 'Nieuwe dienst'} | TNL Group CMS</title></svelte:head>
<header class="adm-head">
	<div><p><a href="/admin/diensten">Diensten</a></p><h1>{s.title || 'Nieuwe dienst'}</h1></div>
	{#if !data.isNew}
		<div class="adm-actions">
			<a class="adm-btn" href="/admin/preview/diensten/{s.slug}" target="_blank" rel="noopener">Voorbeeld</a>
			<ConfirmDialog itemName={`de dienst "${s.title}"`} />
		</div>
	{/if}
</header>

{#key page.url.pathname}
<form method="POST" action="?/save" class="adm-form" use:enhance={() => { saving = true; return async ({ update }) => { await update({ reset: false }); saving = false; }; }}>
	<section class="adm-card">
		<div class="adm-row">
			<Field name="title" label="Naam" value={s.title} required error={e.title} />
			<Field name="slug" label="Adres (slug)" value={s.slug} error={e.slug} hint="Leeg = gemaakt uit de naam. Wijzigen maakt automatisch een doorverwijzing." />
		</div>
		<Field name="summary" label="Korte omschrijving" type="textarea" rows={2} value={s.summary} max={300} error={e.summary} />
		<RepeatRows name="items" label="Onderdelen (plus-lijst en labels)" rows={s.items} error={e.items} />
		<div class="adm-field">
			<label for="tileTheme">Kleur van de tegel op de homepage</label>
			<select id="tileTheme" name="tileTheme" value={s.tileTheme}>
				<option value="forest">Foto (donkergroen)</option>
				<option value="olive">Olijfgroen</option>
				<option value="light">Licht</option>
			</select>
			<p class="adm-hint">Geef elke dienst een andere kleur, zodat de rij als drie aparte aanbiedingen leest.</p>
		</div>
		<ImageField name="heroMediaId" label="Foto" media={s.heroMediaId ? (data.media[s.heroMediaId] ?? null) : null} hint="Bovenaan de dienstpagina, in de tabbladen en (bij kleur Foto) in de tegel." />
		<MarkdownField name="body" label="Tekst op de dienstpagina" value={s.body} error={e.body} />
		<Check name="isPublished" label="Zichtbaar op de website" checked={s.isPublished} />
	</section>
	<SeoPanel seoTitle={s.seoTitle} metaDescription={s.metaDescription} errors={e} fallbackTitle={s.title} />
	<SaveBar {saving} saved={!!form?.saved || page.url.searchParams.has('saved')} error={e._} />
</form>
{/key}
