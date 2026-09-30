<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { ACCEPT_ATTR, scaleImage, UploadError } from '$lib/admin/upload';

	let { id }: { id: string } = $props();
	let input: HTMLInputElement | undefined = $state();
	let busy = $state(false);
	let error = $state('');

	async function replace() {
		const file = input?.files?.[0];
		if (!file) return;
		busy = true;
		error = '';
		try {
			const blob = await scaleImage(file);
			const body = new FormData();
			body.set('file', blob, file.name.replace(/\.[^.]+$/, '') + '.jpg');
			const res = await fetch(`/admin/api/media/${id}`, { method: 'PUT', body });
			const data = (await res.json().catch(() => ({}))) as { error?: string };
			if (!res.ok) throw new UploadError(data.error ?? 'Vervangen is mislukt.');
			await invalidateAll();
		} catch (e) {
			error = e instanceof UploadError ? e.message : 'Vervangen is mislukt.';
		} finally {
			busy = false;
			if (input) input.value = '';
		}
	}
</script>

<label class="adm-btn adm-btn--sm" style="position:relative">
	{busy ? 'Bezig…' : 'Vervangen'}
	<input type="file" accept={ACCEPT_ATTR} bind:this={input} onchange={replace} class="adm-sr" />
</label>
{#if error}<span class="adm-error" role="alert">{error}</span>{/if}
