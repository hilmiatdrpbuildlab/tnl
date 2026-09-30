<script lang="ts">
	import { enhance } from '$app/forms';

	/**
	 * Deleting asks first, in a dialog that names the item. The delete form only exists inside
	 * the dialog, so nothing can be deleted without the confirmation (the One Man Agency defect).
	 */
	interface Props {
		/** What is deleted, e.g. `het project "Oprit in kasseien"`. */
		itemName: string;
		action?: string;
		label?: string;
		fields?: Record<string, string>;
		small?: boolean;
	}
	let { itemName, action = '?/delete', label = 'Verwijderen', fields = {}, small = false }: Props = $props();
	let dialog: HTMLDialogElement | undefined = $state();
</script>

<button type="button" class="adm-btn adm-btn--danger" class:adm-btn--sm={small} data-testid="delete-open" onclick={() => dialog?.showModal()}
	>{label}</button
>
<dialog class="adm-dialog" bind:this={dialog} aria-labelledby="confirm-title">
	<h2 id="confirm-title">Verwijderen?</h2>
	<p>U verwijdert {itemName}. Dit kan niet ongedaan worden gemaakt.</p>
	<form method="POST" {action} use:enhance={() => {
		return async ({ update }) => {
			dialog?.close();
			await update();
		};
	}}>
		{#each Object.entries(fields) as [k, v] (k)}<input type="hidden" name={k} value={v} />{/each}
		<div class="adm-actions">
			<button type="button" class="adm-btn" onclick={() => dialog?.close()}>Annuleren</button>
			<button type="submit" class="adm-btn adm-btn--danger" data-testid="delete-confirm">Ja, verwijderen</button>
		</div>
	</form>
</dialog>
