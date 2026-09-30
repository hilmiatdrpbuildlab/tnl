<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'surface' | 'accent' | 'outline';
		class?: string;
		children: Snippet;
	}
	let { variant = 'surface', class: className = '', children }: Props = $props();
</script>

<span
	class="tnl-badge {className}"
	class:tnl-badge--accent={variant === 'accent'}
	class:tnl-badge--outline={variant === 'outline'}>{@render children()}</span
>
