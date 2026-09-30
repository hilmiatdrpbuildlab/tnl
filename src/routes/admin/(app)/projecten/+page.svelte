<script lang="ts">
	import MoveButtons from '$lib/components/admin/MoveButtons.svelte';
	import StatusPill from '$lib/components/admin/StatusPill.svelte';

	let { data } = $props();
</script>

<svelte:head><title>Projecten | TNL Group CMS</title></svelte:head>
<header class="adm-head">
	<div><h1>Projecten</h1><p>Uitgelichte projecten staan op de homepage. De volgorde hier is de volgorde op de website.</p></div>
	<a class="adm-btn adm-btn--primary" href="/admin/projecten/nieuw">Nieuw project</a>
</header>
{#if data.projects.length}
	<table class="adm-table">
		<thead><tr><th>Project</th><th>Dienst</th><th>Status</th><th>Volgorde</th></tr></thead>
		<tbody>
			{#each data.projects as p, i (p.id)}
				<tr>
					<td>
						<a href="/admin/projecten/{p.id}">{p.title}</a>
						{#if p.isFeatured}<span class="adm-pill">Uitgelicht</span>{/if}
						{#if p.beforeMediaId}<span class="adm-pill">Voor/na</span>{/if}
					</td>
					<td class="adm-muted">{p.serviceTitle ?? '–'}</td>
					<td><StatusPill on={p.isPublished} /></td>
					<td class="adm-num"><MoveButtons id={p.id} first={i === 0} last={i === data.projects.length - 1} label={p.title} /></td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p class="adm-muted">Nog geen projecten.</p>
{/if}
