<script lang="ts">
	import { enhance } from '$app/forms';
	import Check from '$lib/components/admin/Check.svelte';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import Field from '$lib/components/admin/Field.svelte';
	import MoveButtons from '$lib/components/admin/MoveButtons.svelte';

	let { data, form } = $props();
	const errs = (id: string) => (form && 'id' in form && form.id === id ? ((form.errors ?? {}) as Record<string, string>) : {});
	const published = $derived(data.stats.filter((s) => s.isPublished).length);
</script>

<svelte:head><title>Cijfers | TNL Group CMS</title></svelte:head>
<header class="adm-head">
	<div>
		<h1>Cijfers</h1>
		<p>Maximaal {data.max} cijfers staan online ({published} nu). Alleen echte, controleerbare feiten: nooit een schatting.</p>
	</div>
</header>

{#each data.stats as s, i (s.id)}
	<div class="adm-card">
	<form method="POST" action="?/save" class="adm-form" use:enhance={() => async ({ update }) => update({ reset: false })}>
		<input type="hidden" name="id" value={s.id} />
		<div class="adm-row">
			<Field name="value" id="v-{s.id}" label="Cijfer" value={s.value} required max={12} error={errs(s.id).value} />
			<Field name="label" id="l-{s.id}" label="Uitleg" value={s.label} required max={160} error={errs(s.id).label} />
		</div>
		<Check name="isPublished" id="p-{s.id}" label="Zichtbaar op de website" checked={s.isPublished} error={errs(s.id).isPublished} />
		<div class="adm-actions">
			<button class="adm-btn adm-btn--primary" type="submit">Opslaan</button>
			{#if form && 'id' in form && form.id === s.id && 'saved' in form}<span class="adm-pill adm-pill--on">Opgeslagen</span>{/if}
		</div>
	</form>
	<div class="adm-actions">
		<MoveButtons id={s.id} first={i === 0} last={i === data.stats.length - 1} label={s.value} />
		<ConfirmDialog itemName={`het cijfer "${s.value}"`} fields={{ id: s.id }} small />
	</div>
	</div>
{/each}

<form method="POST" action="?/save" class="adm-card" use:enhance>
	<h2>Nieuw cijfer</h2>
	<input type="hidden" name="id" value="" />
	<div class="adm-row">
		<Field name="value" id="v-new" label="Cijfer" placeholder="100%" max={12} error={errs('').value} />
		<Field name="label" id="l-new" label="Uitleg" max={160} error={errs('').label} />
	</div>
	<Check name="isPublished" id="p-new" label="Zichtbaar op de website" error={errs('').isPublished} />
	<div class="adm-actions"><button class="adm-btn adm-btn--primary" type="submit">Toevoegen</button></div>
</form>
