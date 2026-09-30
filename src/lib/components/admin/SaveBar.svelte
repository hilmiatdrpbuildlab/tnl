<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		saving?: boolean;
		saved?: boolean;
		error?: string;
		extra?: Snippet;
	}
	let { saving = false, saved = false, error, extra }: Props = $props();
</script>

<div class="adm-actions" style="position:sticky;bottom:0;padding:12px 0;background:var(--bg);border-top:1px solid var(--line)">
	<button class="adm-btn adm-btn--primary" type="submit" disabled={saving} data-testid="save">{saving ? 'Bezig met opslaan…' : 'Opslaan'}</button>
	{#if extra}{@render extra()}{/if}
	<span aria-live="polite">
		{#if error}<span class="adm-error">{error}</span>
		{:else if saved && !saving}<span class="adm-pill adm-pill--on">Opgeslagen. Nog niet online: klik op Publiceren.</span>{/if}
	</span>
</div>
