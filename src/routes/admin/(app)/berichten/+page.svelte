<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();
	const fmt = (iso: string) =>
		new Intl.DateTimeFormat('nl-BE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Brussels' }).format(new Date(iso));
</script>

<svelte:head><title>Berichten | TNL Group CMS</title></svelte:head>
<header class="adm-head">
	<div>
		<h1>Berichten</h1>
		<p>Berichten via het contactformulier. Ze komen ook per e-mail binnen. Berichten ouder dan 12 maanden worden automatisch verwijderd; exporteer ze eerst als u ze wilt bewaren.</p>
	</div>
	<a class="adm-btn" href="/admin/berichten/export" download>Exporteren (CSV)</a>
</header>
{#if data.messages.length}
	<table class="adm-table">
		<thead><tr><th>Van</th><th>Onderwerp</th><th>Ontvangen</th><th></th></tr></thead>
		<tbody>
			{#each data.messages as m (m.id)}
				<tr>
					<td>
						<a href="/admin/berichten/{m.id}" style:font-weight={m.isRead ? '400' : '600'}>{m.firstName} {m.lastName ?? ''}</a>
						{#if !m.isRead}<span class="adm-pill adm-pill--on">Nieuw</span>{/if}
						{#if !m.notifiedAt}<span class="adm-pill adm-pill--warn" title="De e-mailmelding kon niet worden verstuurd">Geen e-mail</span>{/if}
					</td>
					<td class="adm-muted">{m.subject ?? m.message.slice(0, 60)}</td>
					<td class="adm-muted">{fmt(m.createdAt)}</td>
					<td class="adm-num">
						<form method="POST" action="?/markRead" use:enhance>
							<input type="hidden" name="id" value={m.id} />
							<input type="hidden" name="read" value={m.isRead ? '0' : '1'} />
							<button class="adm-btn adm-btn--sm">{m.isRead ? 'Markeer ongelezen' : 'Markeer gelezen'}</button>
						</form>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p class="adm-muted">Nog geen berichten.</p>
{/if}
