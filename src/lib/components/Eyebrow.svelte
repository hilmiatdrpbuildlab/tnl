<script lang="ts">
	import Icon from './icons/Icon.svelte';

	let { text }: { text: string } = $props();
</script>

<span class="tnl-eyebrow"><Icon name="leaf" /> {text}</span>
