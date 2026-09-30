<script lang="ts">
	import MoveButtons from '$lib/components/admin/MoveButtons.svelte';
	import StatusPill from '$lib/components/admin/StatusPill.svelte';

	let { data } = $props();
</script>

<svelte:head><title>Diensten | TNL Group CMS</title></svelte:head>
<header class="adm-head">
	<div><h1>Diensten</h1><p>De volgorde hier is de volgorde op de website.</p></div>
	<a class="adm-btn adm-btn--primary" href="/admin/diensten/nieuw">Nieuwe dienst</a>
</header>
<table class="adm-table">
	<thead><tr><th>Dienst</th><th>Adres</th><th>Status</th><th>Volgorde</th></tr></thead>
	<tbody>
		{#each data.services as s, i (s.id)}
			<tr>
				<td><a href="/admin/diensten/{s.id}">{s.title}</a></td>
				<td class="adm-muted">/diensten/{s.slug}</td>
				<td><StatusPill on={s.isPublished} /></td>
				<td class="adm-num"><MoveButtons id={s.id} first={i === 0} last={i === data.services.length - 1} label={s.title} /></td>
			</tr>
		{/each}
	</tbody>
</table>
