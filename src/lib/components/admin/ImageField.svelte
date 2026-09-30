<script lang="ts">
	import { untrack } from 'svelte';
	import type { UploadedMedia } from '$lib/admin/upload';
	import MediaPicker from './MediaPicker.svelte';

	/**
	 * One photo field. Sends `<name>` (media id, empty = none) and `<name>__alt` (alt text, saved
	 * on the media row). Replacing or removing a photo and saving deletes the old file when no
	 * other page uses it.
	 */
	interface Props {
		name: string;
		label: string;
		media: { id: string; alt: string } | null;
		hint?: string;
		error?: string;
	}
	let { name, label, media, hint, error }: Props = $props();
	let current = $state(untrack(() => (media ? { ...media } : null)));
	let picker: MediaPicker | undefined = $state();
	const pick = (m: UploadedMedia) => (current = { id: m.id, alt: m.alt });
</script>

<div class="adm-field adm-img" data-invalid={error ? '' : undefined}>
	<span class="adm-label">{label}</span>
	<input type="hidden" {name} value={current?.id ?? ''} />
	<div class="adm-img__box">
		{#if current}
			<img class="adm-img__thumb" src="/admin/api/media/{current.id}" alt="" width="160" height="120" />
		{:else}
			<div class="adm-img__empty">Geen foto</div>
		{/if}
		<div class="adm-actions">
			<button type="button" class="adm-btn adm-btn--sm" onclick={() => picker?.open()}>{current ? 'Vervangen' : 'Foto kiezen'}</button>
			{#if current}<button type="button" class="adm-btn adm-btn--sm" onclick={() => (current = null)}>Weghalen</button>{/if}
		</div>
	</div>
	{#if current}
		<div class="adm-field">
			<label for="{name}-alt">Alt-tekst (wat staat er op de foto?)</label>
			<input id="{name}-alt" type="text" name="{name}__alt" bind:value={current.alt} />
		</div>
	{/if}
	{#if hint}<p class="adm-hint">{hint}</p>{/if}
	{#if error}<p class="adm-error">{error}</p>{/if}
	<MediaPicker bind:this={picker} onpick={pick} />
</div>
