<script lang="ts">
	let { data } = $props();
	const path = (slug: string) => (slug === 'home' ? '/' : `/${slug}`);
</script>

<svelte:head><title>Pagina's | TNL Group CMS</title></svelte:head>
<header class="adm-head">
	<div>
		<h1>Pagina's</h1>
		<p>De vaste pagina's van de website. Diensten, projecten en blogartikels bewerkt u in hun eigen scherm.</p>
	</div>
</header>
<table class="adm-table">
	<thead><tr><th>Pagina</th><th>Adres</th><th></th></tr></thead>
	<tbody>
		{#each data.pages as p (p.id)}
			<tr>
				<td><a href="/admin/paginas/{p.id}">{p.slug === 'home' ? 'Home' : p.title}</a></td>
				<td class="adm-muted">{path(p.slug)}</td>
				<td class="adm-num"><a class="adm-btn adm-btn--sm" href="/admin/preview{path(p.slug)}" target="_blank" rel="noopener">Voorbeeld</a></td>
			</tr>
		{/each}
	</tbody>
</table>
