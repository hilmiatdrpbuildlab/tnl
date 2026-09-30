<script lang="ts">
	import { untrack } from 'svelte';
	import { renderMarkdown } from '$lib/markdown';

	/** Markdown editor with a preview tab. Raw HTML is shown as text, never rendered. */
	interface Props {
		name: string;
		label: string;
		value: string;
		hint?: string;
		error?: string;
	}
	let { name, label, value, hint, error }: Props = $props();
	let text = $state(untrack(() => value ?? ''));
	let tab = $state<'edit' | 'preview'>('edit');
	const id = $derived(`md-${name}`);
</script>

<div class="adm-field" data-invalid={error ? '' : undefined}>
	<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;min-width:0">
		<label for={id}>{label}</label>
		<div class="adm-tabs" role="group" aria-label="Weergave">
			<button type="button" aria-pressed={tab === 'edit'} onclick={() => (tab = 'edit')}>Bewerken</button>
			<button type="button" aria-pressed={tab === 'preview'} onclick={() => (tab = 'preview')}>Voorbeeld</button>
		</div>
	</div>
	<textarea {id} {name} class="adm-md" bind:value={text} hidden={tab !== 'edit'}></textarea>
	{#if tab === 'preview'}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<div class="adm-preview l-prose">{@html renderMarkdown(text) || '<p class="adm-muted">Nog geen tekst.</p>'}</div>
	{/if}
	<p class="adm-hint">
		{hint ?? 'Markdown: ## voor een tussentitel, - voor een lijst, [tekst](https://…) voor een link. Een witregel begint een nieuwe alinea.'}
	</p>
	{#if error}<p class="adm-error">{error}</p>{/if}
</div>
