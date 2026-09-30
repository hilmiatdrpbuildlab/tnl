<script lang="ts">
	import { page } from '$app/state';
	import ServiceView from '$lib/views/ServiceView.svelte';

	let { data } = $props();
	const ctx = $derived({ content: data.content, layout: data.layout, path: page.url.pathname, turnstileSiteKey: data.turnstileSiteKey });
</script>

<ServiceView {ctx} slug={data.slug} />
