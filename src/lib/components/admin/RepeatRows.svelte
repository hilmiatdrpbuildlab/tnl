<script lang="ts">
	import { untrack } from 'svelte';
	import Icon from '$lib/components/icons/Icon.svelte';

	/** Repeatable rows (sub-services: name + detail), sent as JSON in one hidden field. */
	interface Row {
		name: string;
		detail: string;
	}
	interface Props {
		name: string;
		label: string;
		rows: Row[];
		max?: number;
		error?: string;
		namePlaceholder?: string;
		detailPlaceholder?: string;
	}
	let { name, label, rows = [], max = 12, error, namePlaceholder = 'Naam', detailPlaceholder = 'Uitleg (optioneel)' }: Props = $props();
	let list = $state(untrack(() => rows.map((r) => ({ ...r }))));
	const move = (i: number, d: number) => {
		const j = i + d;
		if (j < 0 || j >= list.length) return;
		[list[i], list[j]] = [list[j]!, list[i]!];
	};
</script>

<fieldset class="adm-field" data-invalid={error ? '' : undefined} style="border:0;padding:0;margin:0">
	<legend class="adm-label">{label}</legend>
	<input type="hidden" {name} value={JSON.stringify(list.filter((r) => r.name.trim() || r.detail.trim()))} />
	<div class="adm-rows">
		{#each list as row, i (i)}
			<div class="adm-rows__row">
				<input aria-label="{namePlaceholder} {i + 1}" placeholder={namePlaceholder} bind:value={row.name} />
				<input aria-label="{detailPlaceholder} {i + 1}" placeholder={detailPlaceholder} bind:value={row.detail} />
				<div class="adm-actions" style="gap:4px">
					<button type="button" class="adm-btn adm-btn--sm adm-iconbtn" aria-label="Rij {i + 1} omhoog" onclick={() => move(i, -1)} disabled={i === 0}>↑</button>
					<button type="button" class="adm-btn adm-btn--sm adm-iconbtn" aria-label="Rij {i + 1} omlaag" onclick={() => move(i, 1)} disabled={i === list.length - 1}>↓</button>
					<button type="button" class="adm-btn adm-btn--sm adm-iconbtn" aria-label="Rij {i + 1} verwijderen" onclick={() => list.splice(i, 1)}><Icon name="x" /></button>
				</div>
			</div>
		{/each}
	</div>
	<div>
		<button type="button" class="adm-btn adm-btn--sm" disabled={list.length >= max} onclick={() => list.push({ name: '', detail: '' })}>
			<Icon name="plus" /> Rij toevoegen
		</button>
	</div>
	{#if error}<p class="adm-error">{error}</p>{/if}
</fieldset>
