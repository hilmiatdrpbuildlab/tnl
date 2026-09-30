<script lang="ts">
	import Icon from './icons/Icon.svelte';

	interface Props {
		id: string;
		name: string;
		label: string;
		type?: 'text' | 'email' | 'tel' | 'textarea' | 'select';
		value?: string;
		required?: boolean;
		full?: boolean;
		placeholder?: string;
		autocomplete?: HTMLInputElement['autocomplete'];
		hint?: string;
		/** Shown only while `invalid` is true. Says what to fix. */
		error?: string;
		invalid?: boolean;
		maxlength?: number;
		options?: string[];
	}
	let {
		id,
		name,
		label,
		type = 'text',
		value = $bindable(''),
		required = false,
		full = false,
		placeholder,
		autocomplete,
		hint,
		error,
		invalid = false,
		maxlength,
		options = []
	}: Props = $props();
	const describedBy = $derived(
		[hint ? `${id}-hint` : '', error && invalid ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined
	);
</script>

<div class="tnl-field" class:tnl-field--full={full} class:tnl-field--error={invalid}>
	<label for={id}>{label}</label>
	{#if type === 'textarea'}
		<textarea
			class="tnl-textarea"
			{id}
			{name}
			{required}
			{placeholder}
			{maxlength}
			bind:value
			aria-invalid={invalid ? 'true' : undefined}
			aria-describedby={describedBy}
		></textarea>
	{:else if type === 'select'}
		<div class="tnl-select-wrap">
			<select class="tnl-select" {id} {name} {required} bind:value aria-describedby={describedBy}>
				{#each options as o (o)}<option value={o}>{o}</option>{/each}
			</select>
			<Icon name="chevron-down" />
		</div>
	{:else}
		<input
			class="tnl-input"
			{id}
			{name}
			{type}
			{required}
			{placeholder}
			{autocomplete}
			{maxlength}
			bind:value
			aria-invalid={invalid ? 'true' : undefined}
			aria-describedby={describedBy}
		/>
	{/if}
	{#if hint}<p class="tnl-field__hint" id="{id}-hint">{hint}</p>{/if}
	{#if error}<p class="tnl-field__error" id="{id}-err"><Icon name="x" /> {error}</p>{/if}
</div>
