<script lang="ts">
	import { page } from '$app/state';
	import ContactView from '$lib/views/ContactView.svelte';

	let { data } = $props();
	const ctx = $derived({ content: data.content, layout: data.layout, path: page.url.pathname, turnstileSiteKey: data.turnstileSiteKey });
</script>

<ContactView {ctx} />
