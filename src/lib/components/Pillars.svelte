<script lang="ts">
	import type { Pillar } from '$lib/types';

	/** Three items, four at most, in the order TNL works. */
	let { items }: { items: Pillar[] } = $props();
</script>

<ol class="tnl-pillars">
	{#each items as item, i (item.title)}
		<li>
			<span class="tnl-pillars__index">[{i + 1}]</span>
			<h3>{item.title}</h3>
			<p>{item.text}</p>
		</li>
	{/each}
</ol>
