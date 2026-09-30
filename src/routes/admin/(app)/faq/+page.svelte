<script lang="ts">
	import MoveButtons from '$lib/components/admin/MoveButtons.svelte';
	import StatusPill from '$lib/components/admin/StatusPill.svelte';

	let { data } = $props();
</script>

<svelte:head><title>FAQ | TNL Group CMS</title></svelte:head>
<header class="adm-head">
	<div><h1>FAQ</h1><p>Algemene vragen staan op de homepage en de contactpagina; vragen bij een dienst op die dienstpagina. Vijf tot acht per plek.</p></div>
	<a class="adm-btn adm-btn--primary" href="/admin/faq/nieuw">Nieuwe vraag</a>
</header>
<table class="adm-table">
	<thead><tr><th>Vraag</th><th>Waar</th><th>Status</th><th>Volgorde</th></tr></thead>
	<tbody>
		{#each data.faqs as f, i (f.id)}
			<tr>
				<td><a href="/admin/faq/{f.id}">{f.question}</a></td>
				<td class="adm-muted">{f.serviceTitle ?? 'Algemeen'}</td>
				<td><StatusPill on={f.isPublished} /></td>
				<td class="adm-num"><MoveButtons id={f.id} first={i === 0} last={i === data.faqs.length - 1} label={f.question} /></td>
			</tr>
		{/each}
	</tbody>
</table>
