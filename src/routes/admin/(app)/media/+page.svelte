<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import MediaPicker from '$lib/components/admin/MediaPicker.svelte';
	import ReplaceButton from '$lib/components/admin/ReplaceButton.svelte';

	let { data, form } = $props();
	let picker: MediaPicker | undefined = $state();
	const kb = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} kB`);
</script>

<svelte:head><title>Media | TNL Group CMS</title></svelte:head>
<header class="adm-head">
	<div>
		<h1>Media</h1>
		<p>Alle foto's met de plekken waar ze gebruikt worden. Een foto die nergens meer gebruikt wordt, wordt automatisch verwijderd.</p>
	</div>
	<button type="button" class="adm-btn adm-btn--primary" onclick={() => picker?.open()}>Foto uploaden</button>
</header>
<MediaPicker bind:this={picker} onpick={() => invalidateAll()} />

{#if form && 'usedBy' in form && form.usedBy}
	<p class="adm-notice adm-notice--bad" role="alert">Deze foto wordt nog gebruikt en kan niet worden verwijderd: {form.usedBy.join(', ')}.</p>
{/if}

<div class="adm-media">
	{#each data.media as m (m.id)}
		<figure>
			<img src="/admin/api/media/{m.id}" alt="" loading="lazy" width="160" height="120" />
			<form method="POST" action="?/alt" use:enhance={() => async ({ update }) => update({ reset: false })} class="adm-field">
				<input type="hidden" name="id" value={m.id} />
				<label for="alt-{m.id}" class="adm-sr">Alt-tekst</label>
				<input id="alt-{m.id}" name="alt" type="text" value={m.alt} placeholder="Alt-tekst ontbreekt" style="min-height:34px;padding:6px 10px;font-size:13px" />
				<button class="adm-btn adm-btn--sm" type="submit">Alt-tekst opslaan</button>
			</form>
			<span class="adm-muted">{m.width}×{m.height} · {kb(m.bytes)}</span>
			<div class="adm-actions" style="gap:6px"><ReplaceButton id={m.id} /></div>
			{#if m.usages.length}
				<span>Gebruikt op:</span>
				<ul style="margin:0;padding-left:1.1em">
					{#each m.usages as u, i (i)}<li><a href={u.href}>{u.label}</a></li>{/each}
				</ul>
			{:else}
				<span class="adm-pill adm-pill--warn">Niet gebruikt</span>
				<ConfirmDialog itemName={`de foto "${m.alt || m.fileName}"`} fields={{ id: m.id }} small />
			{/if}
		</figure>
	{:else}
		<p class="adm-muted">Nog geen foto's.</p>
	{/each}
</div>
