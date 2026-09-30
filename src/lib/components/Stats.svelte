<script lang="ts">
	import type { Stat } from '$lib/types';

	/** Only real, checkable facts from TNL. The CMS publishes three at most. */
	let { stats }: { stats: Stat[] } = $props();
</script>

{#if stats.length}
	<div class="tnl-stats">
		{#each stats as s (s.id)}
			<div class="tnl-stat">
				<p class="t-stat">{s.value}</p>
				<p class="tnl-stat__label">{s.label}</p>
			</div>
		{/each}
	</div>
{/if}
