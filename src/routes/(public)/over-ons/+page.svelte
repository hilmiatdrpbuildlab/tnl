<script lang="ts">
	import { page } from '$app/state';
	import AboutView from '$lib/views/AboutView.svelte';

	let { data } = $props();
	const ctx = $derived({ content: data.content, layout: data.layout, path: page.url.pathname, turnstileSiteKey: data.turnstileSiteKey });
</script>

<AboutView {ctx} />
