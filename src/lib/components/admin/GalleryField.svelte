<script lang="ts">
	import { untrack } from 'svelte';
	import type { UploadedMedia } from '$lib/admin/upload';
	import Icon from '$lib/components/icons/Icon.svelte';
	import MediaPicker from './MediaPicker.svelte';

	/** Extra photos for a project, in order. Sent as a JSON array of media ids. */
	interface Props {
		name: string;
		label: string;
		items: { id: string; alt: string }[];
	}
	let { name, label, items }: Props = $props();
	let list = $state(untrack(() => items.map((i) => ({ ...i }))));
	let picker: MediaPicker | undefined = $state();
	const add = (m: UploadedMedia) => {
		if (!list.some((i) => i.id === m.id)) list.push({ id: m.id, alt: m.alt });
	};
	const move = (i: number, d: number) => {
		const j = i + d;
		if (j >= 0 && j < list.length) [list[i], list[j]] = [list[j]!, list[i]!];
	};
</script>

<div class="adm-field">
	<span class="adm-label">{label}</span>
	<input type="hidden" {name} value={JSON.stringify(list.map((i) => i.id))} />
	{#if list.length}
		<div class="adm-media">
			{#each list as item, i (item.id)}
				<figure>
					<img src="/admin/api/media/{item.id}" alt="" width="160" height="120" loading="lazy" />
					<div class="adm-actions" style="gap:4px">
						<button type="button" class="adm-btn adm-btn--sm adm-iconbtn" aria-label="Foto {i + 1} naar voren" onclick={() => move(i, -1)} disabled={i === 0}>←</button>
						<button type="button" class="adm-btn adm-btn--sm adm-iconbtn" aria-label="Foto {i + 1} naar achteren" onclick={() => move(i, 1)} disabled={i === list.length - 1}>→</button>
						<button type="button" class="adm-btn adm-btn--sm adm-iconbtn" aria-label="Foto {i + 1} weghalen" onclick={() => list.splice(i, 1)}><Icon name="x" /></button>
					</div>
					<figcaption>{item.alt}</figcaption>
				</figure>
			{/each}
		</div>
	{:else}
		<p class="adm-hint">Nog geen extra foto's.</p>
	{/if}
	<div><button type="button" class="adm-btn adm-btn--sm" onclick={() => picker?.open()}><Icon name="plus" /> Foto toevoegen</button></div>
	<MediaPicker bind:this={picker} onpick={add} />
</div>
