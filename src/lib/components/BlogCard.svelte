<script lang="ts">
	import Image from './Image.svelte';
	import type { Post } from '$lib/types';
	import { formatDate } from '$lib/format';

	/** The whole card is one link (the title's ::after stretches over it). */
	let { post }: { post: Post } = $props();
</script>

<article class="tnl-post">
	{#if post.cover}
		<div class="tnl-post__media">
			<Image img={post.cover} sizes='(max-width: 640px) 100vw, 33vw' alt="" loading="lazy" />
		</div>
	{/if}
	<p class="tnl-post__meta">
		{#if post.category}<span class="t-label">{post.category}</span>{/if}
		{#if post.publishedOn}<span>{formatDate(post.publishedOn)}</span>{/if}
	</p>
	<h3><a href="/blog/{post.slug}">{post.title}</a></h3>
</article>
