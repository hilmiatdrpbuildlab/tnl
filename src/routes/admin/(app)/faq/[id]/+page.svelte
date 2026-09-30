<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Check from '$lib/components/admin/Check.svelte';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import Field from '$lib/components/admin/Field.svelte';
	import SaveBar from '$lib/components/admin/SaveBar.svelte';

	let { data, form } = $props();
	const q = $derived(data.faq);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	let saving = $state(false);
</script>

<svelte:head><title>{q.question || 'Nieuwe vraag'} | TNL Group CMS</title></svelte:head>
<header class="adm-head">
	<div><p><a href="/admin/faq">FAQ</a></p><h1>{q.question || 'Nieuwe vraag'}</h1></div>
	{#if !data.isNew}<ConfirmDialog itemName={`de vraag "${q.question}"`} />{/if}
</header>
{#key page.url.pathname}
<form method="POST" action="?/save" class="adm-form" use:enhance={() => { saving = true; return async ({ update }) => { await update({ reset: false }); saving = false; }; }}>
	<section class="adm-card">
		<Field name="question" label="Vraag" value={q.question} required error={e.question} hint="Zoals een klant ze zou stellen." />
		<Field name="answer" label="Antwoord" type="textarea" rows={4} value={q.answer} required error={e.answer} hint="Eén of twee zinnen, met uw eigen feiten." />
		<div class="adm-field">
			<label for="serviceId">Waar tonen?</label>
			<select id="serviceId" name="serviceId" value={q.serviceId ?? ''}>
				<option value="">Algemeen (homepage en contact)</option>
				{#each data.services as s (s.id)}<option value={s.id}>Bij de dienst {s.title}</option>{/each}
			</select>
		</div>
		<Check name="isPublished" label="Zichtbaar op de website" checked={q.isPublished} />
	</section>
	<SaveBar {saving} saved={!!form?.saved || page.url.searchParams.has('saved')} error={e._} />
</form>
{/key}
