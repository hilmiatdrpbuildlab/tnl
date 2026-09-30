<script lang="ts">
	import '$lib/styles/layout.css';
	import '$lib/styles/admin.css';

	let { children } = $props();
</script>

<svelte:head><meta name="robots" content="noindex, nofollow" /></svelte:head>
{@render children()}
