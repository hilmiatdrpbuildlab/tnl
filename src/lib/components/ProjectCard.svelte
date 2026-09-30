<script lang="ts">
	import Image from './Image.svelte';
	import type { Project } from '$lib/types';
	
	import TextLink from './TextLink.svelte';

	interface Props {
		project: Project;
		/** `wide`: text beside the photo. `stack`: photo on top, for grids. */
		variant?: 'wide' | 'stack';
		headingLevel?: 2 | 3;
	}
	let { project, variant = 'wide', headingLevel = 3 }: Props = $props();
	const meta = $derived(
		[project.serviceTitle, project.subService, project.location].filter(Boolean).join(' · ')
	);
	const img = $derived(project.cover ?? project.after);
	const tag = $derived(`h${headingLevel}`);
</script>

<article class="tnl-project" class:tnl-project--stack={variant === 'stack'}>
	{#if variant === 'stack' && img}
		<Image class="tnl-project__media" img={img} sizes='(max-width: 820px) 100vw, 33vw' loading="lazy" />
	{/if}
	<div class="tnl-project__text">
		{#if meta}<span class="t-label tnl-project__meta">{meta}</span>{/if}
		<svelte:element this={tag} class={variant === 'stack' ? 't-h4' : 't-h3'}>{project.title}</svelte:element>
		{#if project.summary}<p>{project.summary}</p>{/if}
		<TextLink href="/projecten/{project.slug}">Bekijk project</TextLink>
	</div>
	{#if variant === 'wide' && img}
		<Image class="tnl-project__media" img={img} sizes='(max-width: 820px) 100vw, 58vw' loading="lazy" />
	{/if}
</article>
