<script lang="ts">
	import { ACCEPT_ATTR, uploadImage, UploadError, type UploadedMedia } from '$lib/admin/upload';

	/** The media library in a dialog: pick an existing photo or upload a new one. */
	interface Props {
		onpick: (m: UploadedMedia) => void;
	}
	let { onpick }: Props = $props();
	let dialog: HTMLDialogElement | undefined = $state();
	let items = $state<UploadedMedia[]>([]);
	let loading = $state(false);
	let error = $state('');
	let alt = $state('');
	let busy = $state(false);
	let fileInput: HTMLInputElement | undefined = $state();

	export async function open() {
		error = '';
		alt = '';
		dialog?.showModal();
		loading = true;
		try {
			const res = await fetch('/admin/api/media');
			items = ((await res.json()) as { media: UploadedMedia[] }).media;
		} catch {
			error = 'De mediabibliotheek kon niet worden geladen.';
		} finally {
			loading = false;
		}
	}

	function pick(m: UploadedMedia) {
		onpick(m);
		dialog?.close();
	}

	async function upload() {
		const file = fileInput?.files?.[0];
		if (!file) return (error = 'Kies eerst een foto.');
		if (!alt.trim()) return (error = 'Beschrijf wat er op de foto staat (alt-tekst). Dat helpt blinde bezoekers en Google.');
		busy = true;
		error = '';
		try {
			pick(await uploadImage(file, alt.trim()));
		} catch (e) {
			error = e instanceof UploadError ? e.message : 'Uploaden is mislukt. Probeer het opnieuw.';
		} finally {
			busy = false;
		}
	}
</script>

<dialog class="adm-dialog adm-dialog--wide" bind:this={dialog} aria-labelledby="picker-title">
	<h2 id="picker-title">Foto kiezen</h2>
	<div class="adm-card" style="margin-bottom:16px">
		<h3>Nieuwe foto uploaden</h3>
		<div class="adm-row">
			<div class="adm-field">
				<label for="picker-file">Foto (JPG, PNG of WebP, max. 10 MB)</label>
				<input id="picker-file" type="file" accept={ACCEPT_ATTR} bind:this={fileInput} />
			</div>
			<div class="adm-field">
				<label for="picker-alt">Wat staat er op de foto? *</label>
				<input id="picker-alt" type="text" bind:value={alt} placeholder="Bijvoorbeeld: oprit in kasseien tussen hagen" />
			</div>
		</div>
		<div class="adm-actions">
			<button type="button" class="adm-btn adm-btn--primary" onclick={upload} disabled={busy}>{busy ? 'Bezig met uploaden…' : 'Uploaden en kiezen'}</button>
		</div>
	</div>
	{#if error}<p class="adm-notice adm-notice--bad" role="alert">{error}</p>{/if}
	{#if loading}
		<p>Laden…</p>
	{:else if items.length}
		<div class="adm-media" style="max-height:50vh;overflow:auto">
			{#each items as m (m.id)}
				<figure>
					<button type="button" class="adm-media__pick" onclick={() => pick(m)} aria-label="Kies {m.alt || m.fileName}">
						<img src={m.src} alt="" loading="lazy" width="160" height="120" />
					</button>
					<figcaption>{m.alt || m.fileName}</figcaption>
				</figure>
			{/each}
		</div>
	{:else}
		<p class="adm-muted">Nog geen foto's in de bibliotheek.</p>
	{/if}
	<div class="adm-actions" style="margin-top:16px">
		<button type="button" class="adm-btn" onclick={() => dialog?.close()}>Sluiten</button>
	</div>
</dialog>
