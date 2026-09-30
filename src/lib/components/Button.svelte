<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './icons/Icon.svelte';

	interface Props {
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'outline';
		size?: 'md' | 'sm';
		block?: boolean;
		/** The round arrow dot: for buttons that lead to another page or section. */
		dot?: boolean;
		disabled?: boolean;
		name?: string;
		value?: string;
		children: Snippet;
		onclick?: (e: MouseEvent) => void;
	}
	let {
		href,
		type = 'button',
		variant = 'primary',
		size = 'md',
		block = false,
		dot = !!href,
		disabled = false,
		name,
		value,
		children,
		onclick
	}: Props = $props();
	const cls = $derived(
		[
			'tnl-btn',
			variant === 'outline' && 'tnl-btn--outline',
			size === 'sm' && 'tnl-btn--sm',
			block && 'tnl-btn--block'
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

{#if href}
	<a class={cls} {href}
		>{@render children()}{#if dot}
			<span class="tnl-btn__dot"><Icon name="arrow-up-right" /></span>{/if}</a
	>
{:else}
	<button class={cls} {type} {disabled} {name} {value} {onclick}
		>{@render children()}{#if dot}
			<span class="tnl-btn__dot"><Icon name="arrow-up-right" /></span>{/if}</button
	>
{/if}
