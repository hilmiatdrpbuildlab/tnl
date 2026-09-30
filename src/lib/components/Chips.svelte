<script lang="ts">
	import Icon from './icons/Icon.svelte';

	/** Labels, not filters. The client's own service words. */
	let { items }: { items: string[] } = $props();
</script>

{#if items.length}
	<div class="tnl-chips">
		{#each items as item, i (i)}
			<span class="tnl-chip"><Icon name="plus" /> {item}</span>
		{/each}
	</div>
{/if}
