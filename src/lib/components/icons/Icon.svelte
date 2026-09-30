<script lang="ts">
	import { icons, type IconName } from './icons';

	interface Props {
		name: IconName;
		/** Extra classes, e.g. `tnl-icon--open`. */
		class?: string;
		/** Set for an icon that carries meaning on its own; otherwise it is hidden from screen readers. */
		label?: string;
	}
	let { name, class: className = '', label }: Props = $props();
	const icon = $derived(icons[name]);
</script>

{#if icon.filled}
	<svg
		class="tnl-icon {className}"
		aria-hidden={label ? undefined : 'true'}
		aria-label={label}
		role={label ? 'img' : undefined}
		focusable="false"
		fill="currentColor"
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
		>{@html icon.body}</svg
	>
{:else}
	<svg
		class="tnl-icon {className}"
		aria-hidden={label ? undefined : 'true'}
		aria-label={label}
		role={label ? 'img' : undefined}
		focusable="false"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		>{@html icon.body}</svg
	>
{/if}
