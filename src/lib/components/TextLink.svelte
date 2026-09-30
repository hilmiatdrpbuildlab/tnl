<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './icons/Icon.svelte';

	let { href, children }: { href: string; children: Snippet } = $props();
</script>

<a class="tnl-textlink" {href}>{@render children()} <Icon name="arrow-up-right" /></a>
