<script lang="ts">
	/** A labelled CMS field. With `max`, it counts characters left (the 62 / 158 SEO limits). */
	interface Props {
		name: string;
		label: string;
		value?: string | number | null;
		type?: 'text' | 'email' | 'url' | 'date' | 'number' | 'password' | 'textarea' | 'markdown';
		hint?: string;
		error?: string;
		required?: boolean;
		max?: number;
		/** Show the counter even when there is no hard limit on input. */
		counted?: boolean;
		placeholder?: string;
		id?: string;
		autocomplete?: HTMLInputElement['autocomplete'];
		rows?: number;
	}
	let {
		name,
		label,
		value = $bindable(''),
		type = 'text',
		hint,
		error,
		required = false,
		max,
		counted = false,
		placeholder,
		id = `f-${name.replace(/[^a-z0-9]+/gi, '-')}`,
		autocomplete,
		rows
	}: Props = $props();
	let text = $state(value == null ? '' : String(value));
	$effect(() => {
		value = text;
	});
	const left = $derived(max ? max - text.length : 0);
	const describedBy = $derived([hint && `${id}-hint`, error && `${id}-err`, max && `${id}-count`].filter(Boolean).join(' ') || undefined);
</script>

<div class="adm-field" data-invalid={error ? '' : undefined}>
	<label for={id}>{label}{required ? ' *' : ''}</label>
	{#if type === 'textarea' || type === 'markdown'}
		<textarea
			{id}
			{name}
			{required}
			{placeholder}
			{rows}
			class:adm-md={type === 'markdown'}
			bind:value={text}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={describedBy}
		></textarea>
	{:else}
		<input
			{id}
			{name}
			{type}
			{required}
			{placeholder}
			{autocomplete}
			bind:value={text}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={describedBy}
		/>
	{/if}
	{#if max && (counted || max)}
		<span class="adm-counter" id="{id}-count" data-over={left < 0 ? '' : undefined} aria-live="polite"
			>{left >= 0 ? `nog ${left} tekens` : `${-left} tekens te veel`}</span
		>
	{/if}
	{#if hint}<p class="adm-hint" id="{id}-hint">{hint}</p>{/if}
	{#if error}<p class="adm-error" id="{id}-err">{error}</p>{/if}
</div>
