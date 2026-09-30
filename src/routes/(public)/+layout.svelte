<script lang="ts">
	import '$lib/styles/layout.css';
	import Shell from '$lib/views/Shell.svelte';

	let { data, children } = $props();
</script>

<svelte:head>
	<!-- Public pages are plain HTML (csr = false); this small script adds tabs, slider, menu and form. -->
	<script src={data.siteJs} defer></script>
</svelte:head>
<Shell layout={data.layout}>{@render children()}</Shell>
