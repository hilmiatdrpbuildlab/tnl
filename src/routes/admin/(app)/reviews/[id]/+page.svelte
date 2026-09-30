<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Check from '$lib/components/admin/Check.svelte';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import Field from '$lib/components/admin/Field.svelte';
	import ImageField from '$lib/components/admin/ImageField.svelte';
	import SaveBar from '$lib/components/admin/SaveBar.svelte';

	let { data, form } = $props();
	const r = $derived(data.review);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	let saving = $state(false);
	let consent = $state(false);
	let published = $state(false);
	$effect.pre(() => {
		consent = r.consentConfirmed;
		published = r.isPublished;
	});
</script>

<svelte:head><title>{r.authorName || 'Nieuwe review'} | TNL Group CMS</title></svelte:head>
<header class="adm-head">
	<div><p><a href="/admin/reviews">Reviews</a></p><h1>{r.authorName || 'Nieuwe review'}</h1></div>
	{#if !data.isNew}<ConfirmDialog itemName={`de review van ${r.authorName}`} />{/if}
</header>

{#key page.url.pathname}
<form method="POST" action="?/save" class="adm-form" use:enhance={() => { saving = true; return async ({ update }) => { await update({ reset: false }); saving = false; }; }}>
	<section class="adm-card">
		<Field name="quote" label="Review" type="textarea" rows={4} value={r.quote} required max={600} error={e.quote} hint="Twee of drie zinnen. Kort langere reviews in met …" />
		<div class="adm-row">
			<Field name="authorName" label="Naam van de klant" value={r.authorName} required error={e.authorName} />
			<Field name="place" label="Gemeente" value={r.place} />
		</div>
		<div class="adm-row">
			<div class="adm-field">
				<label for="serviceId">Dienst</label>
				<select id="serviceId" name="serviceId" value={r.serviceId ?? ''}>
					<option value="">Geen</option>
					{#each data.services as s (s.id)}<option value={s.id}>{s.title}</option>{/each}
				</select>
			</div>
			<div class="adm-field">
				<label for="rating">Sterren</label>
				<select id="rating" name="rating" value={String(r.rating ?? '')}>
					<option value="">Geen score</option>
					{#each [5, 4, 3, 2, 1] as n (n)}<option value={String(n)}>{n} van 5</option>{/each}
				</select>
				<p class="adm-hint">Alleen als de review zelf een score heeft.</p>
			</div>
		</div>
		<div class="adm-field">
			<label for="source">Bron</label>
			<select id="source" name="source" value={r.source}>
				<option value="google">Google</option>
				<option value="facebook">Facebook</option>
				<option value="direct">Rechtstreeks van de klant</option>
			</select>
		</div>
		<ImageField name="photoMediaId" label="Foto van de tuin (optioneel)" media={r.photoMediaId ? (data.media[r.photoMediaId as keyof typeof data.media] ?? null) : null} hint="Geen portretfoto's: een foto van het werk." />
	</section>
	<section class="adm-card">
		<Check name="consentConfirmed" label="Klant gaf toestemming" bind:checked={consent} error={e.consentConfirmed} hint="Vink dit pas aan als de klant akkoord ging om deze review met naam op de website te tonen." />
		<Check name="isPublished" label="Zichtbaar op de website" bind:checked={published} disabled={!consent} hint={consent ? undefined : 'Kan pas na toestemming van de klant.'} />
		{#if !consent}<input type="hidden" name="isPublished" value="" />{/if}
	</section>
	<SaveBar {saving} saved={!!form?.saved || page.url.searchParams.has('saved')} error={e._} />
</form>
{/key}
