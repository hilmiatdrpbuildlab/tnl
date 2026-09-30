<script lang="ts">
	import { META_DESCRIPTION_MAX, SEO_TITLE_MAX } from '$lib/seo';
	import Field from './Field.svelte';

	interface Props {
		seoTitle: string | null;
		metaDescription: string | null;
		errors?: Record<string, string>;
		/** What is used when the SEO title is empty. */
		fallbackTitle?: string;
	}
	let { seoTitle, metaDescription, errors = {}, fallbackTitle = '' }: Props = $props();
</script>

<section class="adm-card">
	<h2>Zoekmachines (SEO)</h2>
	<Field
		name="seoTitle"
		label="SEO-titel"
		value={seoTitle}
		max={SEO_TITLE_MAX}
		hint={fallbackTitle ? `Leeg = "${fallbackTitle} | TNL Group".` : undefined}
		error={errors.seoTitle}
	/>
	<Field
		name="metaDescription"
		label="Beschrijving"
		type="textarea"
		rows={3}
		value={metaDescription}
		max={META_DESCRIPTION_MAX}
		hint="Eén of twee zinnen die Google onder de titel toont."
		error={errors.metaDescription}
	/>
</section>
