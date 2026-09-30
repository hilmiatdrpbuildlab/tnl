<script lang="ts">
	import MoveButtons from '$lib/components/admin/MoveButtons.svelte';
	import StatusPill from '$lib/components/admin/StatusPill.svelte';

	let { data } = $props();
</script>

<svelte:head><title>Reviews | TNL Group CMS</title></svelte:head>
<header class="adm-head">
	<div><h1>Reviews</h1><p>Alleen echte reviews, met toestemming van de klant. Zonder toestemming blijft een review verborgen.</p></div>
	<a class="adm-btn adm-btn--primary" href="/admin/reviews/nieuw">Nieuwe review</a>
</header>
{#if data.reviews.length}
	<table class="adm-table">
		<thead><tr><th>Klant</th><th>Review</th><th>Status</th><th>Volgorde</th></tr></thead>
		<tbody>
			{#each data.reviews as r, i (r.id)}
				<tr>
					<td><a href="/admin/reviews/{r.id}">{r.authorName}</a></td>
					<td class="adm-muted">{r.quote.slice(0, 80)}{r.quote.length > 80 ? '…' : ''}</td>
					<td>
						<StatusPill on={r.isPublished} />
						{#if !r.consentConfirmed}<span class="adm-pill adm-pill--warn">Geen toestemming</span>{/if}
					</td>
					<td class="adm-num"><MoveButtons id={r.id} first={i === 0} last={i === data.reviews.length - 1} label={r.authorName} /></td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p class="adm-muted">Nog geen reviews. Vraag tevreden klanten om een review, bijvoorbeeld op Google, en vraag of u die op de website mag tonen.</p>
{/if}
