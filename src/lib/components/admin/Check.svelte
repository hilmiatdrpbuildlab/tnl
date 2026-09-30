<script lang="ts">
	interface Props {
		name: string;
		label: string;
		checked?: boolean;
		hint?: string;
		error?: string;
		disabled?: boolean;
		id?: string;
	}
	let { name, label, checked = $bindable(false), hint, error, disabled = false, id = `c-${name}` }: Props = $props();
</script>

<div class="adm-field" data-invalid={error ? '' : undefined}>
	<label class="adm-check" for={id}>
		<input type="checkbox" {id} {name} bind:checked {disabled} aria-describedby={hint ? `${id}-hint` : undefined} />
		<span>{label}</span>
	</label>
	{#if hint}<p class="adm-hint" id="{id}-hint">{hint}</p>{/if}
	{#if error}<p class="adm-error">{error}</p>{/if}
</div>
