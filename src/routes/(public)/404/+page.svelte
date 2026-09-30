<script lang="ts">
	import { page } from '$app/state';
	import MessageView from '$lib/views/MessageView.svelte';

	let { data } = $props();
	const ctx = $derived({ content: data.content, layout: data.layout, path: page.url.pathname });
</script>

<MessageView {ctx} eyebrow="Fout 404" title="Deze pagina bestaat niet" lead="Misschien vindt u wat u zoekt via een van deze pagina’s." links={[{ href: "/diensten", label: "Diensten" }, { href: "/projecten", label: "Projecten" }, { href: "/over-ons", label: "Over ons" }, { href: "/contact", label: "Contact" }]} />
