<script lang="ts">
	import StatusPill from '$lib/components/admin/StatusPill.svelte';
	import { formatDate } from '$lib/format';

	let { data } = $props();
</script>

<svelte:head><title>Blog | TNL Group CMS</title></svelte:head>
<header class="adm-head">
	<div><h1>Blog</h1><p>De blog verschijnt in het menu zodra er minstens één artikel zichtbaar is.</p></div>
	<a class="adm-btn adm-btn--primary" href="/admin/blog/nieuw">Nieuw artikel</a>
</header>
{#if data.posts.length}
	<table class="adm-table">
		<thead><tr><th>Titel</th><th>Datum</th><th>Status</th></tr></thead>
		<tbody>
			{#each data.posts as p (p.id)}
				<tr>
					<td><a href="/admin/blog/{p.id}">{p.title}</a></td>
					<td class="adm-muted">{formatDate(p.publishedOn) || '–'}</td>
					<td><StatusPill on={p.isPublished} /></td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p class="adm-muted">Nog geen artikels.</p>
{/if}
