<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	/**
	 * On every CMS screen: how many changes are not live yet, and the Publiceren button.
	 * It never shows "Live" before /build-info.json on the live site carries the new publish id.
	 */
	interface Props {
		unpublished: number;
		build: { id: string; status: string; triggeredAt: string } | null;
		buildLogUrl?: string;
	}
	let { unpublished, build, buildLogUrl = '' }: Props = $props();

	const TIMEOUT_MS = 15 * 60 * 1000;
	let phase = $state<'idle' | 'busy' | 'live' | 'failed'>('idle');
	let message = $state('');
	let publishId = $state<string | null>(null);
	let startedAt = 0;
	let timer: ReturnType<typeof setTimeout> | undefined;

	onMount(() => {
		if (build && (build.status === 'pending' || build.status === 'building')) {
			publishId = build.id;
			startedAt = new Date(build.triggeredAt).getTime();
			phase = 'busy';
			poll();
		} else if (build?.status === 'failed' && unpublished > 0) {
			phase = 'failed';
		}
		return () => clearTimeout(timer);
	});

	async function poll() {
		clearTimeout(timer);
		if (!publishId) return;
		try {
			const res = await fetch(`/build-info.json?t=${Date.now()}`, { cache: 'no-store' });
			const info = (await res.json()) as { publishId?: string | null };
			if (info.publishId === publishId) {
				phase = 'live';
				await fetch('/admin/api/publish-status', { method: 'POST', body: JSON.stringify({ id: publishId, live: true }) });
				await invalidateAll();
				return;
			}
		} catch {
			/* keep polling */
		}
		if (Date.now() - startedAt > TIMEOUT_MS) {
			phase = 'failed';
			await fetch('/admin/api/publish-status', { method: 'POST', body: JSON.stringify({ id: publishId, live: false }) });
			return;
		}
		timer = setTimeout(poll, 8000);
	}

	async function publish() {
		if (phase === 'busy') return;
		phase = 'busy';
		message = '';
		try {
			const res = await fetch('/admin/api/publish', { method: 'POST', headers: { accept: 'application/json' } });
			const data = (await res.json()) as { id?: string; triggeredAt?: string; error?: string };
			if (!res.ok || !data.id) throw new Error(data.error ?? 'Publiceren kon niet starten.');
			publishId = data.id;
			startedAt = data.triggeredAt ? new Date(data.triggeredAt).getTime() : Date.now();
			poll();
		} catch (e) {
			phase = 'failed';
			message = e instanceof Error ? e.message : 'Publiceren kon niet starten.';
		}
	}

	const dataState = $derived(phase === 'idle' ? (unpublished > 0 ? 'changes' : 'idle') : phase);
</script>

<div class="adm-banner" data-state={dataState} role="region" aria-label="Publiceren">
	<p class="adm-banner__text" aria-live="polite">
		<span class="adm-banner__dot" aria-hidden="true"></span>
		{#if phase === 'busy'}
			Bezig met publiceren. Dit duurt meestal een paar minuten; u kunt verder werken.
		{:else if phase === 'live'}
			Live. De website toont nu de laatste versie.
		{:else if phase === 'failed'}
			Mislukt. Uw wijzigingen zijn bewaard, maar staan nog niet online.
			{#if message}{message}{/if}
			{#if buildLogUrl}<a href={buildLogUrl} target="_blank" rel="noopener">Bekijk het build-log</a>{/if}
		{:else if unpublished > 0}
			{unpublished === 1 ? '1 wijziging staat' : `${unpublished} wijzigingen staan`} nog niet online.
		{:else}
			Alles staat online.
		{/if}
	</p>
	<button
		type="button"
		class="adm-btn adm-btn--primary"
		data-testid="publish"
		onclick={publish}
		disabled={phase === 'busy' || (unpublished === 0 && phase !== 'failed')}
		>{phase === 'busy' ? 'Bezig met publiceren' : 'Publiceren'}</button
	>
</div>
