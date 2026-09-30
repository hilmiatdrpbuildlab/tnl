<script lang="ts">
	import { page } from '$app/state';
	import MessageView from '$lib/views/MessageView.svelte';

	let { data } = $props();
	const ctx = $derived({ content: data.content, layout: data.layout, path: page.url.pathname });
</script>

<MessageView {ctx} eyebrow="Contact" title="Uw bericht is niet verzonden" lead="Er ging iets mis bij het verzenden. Probeer het opnieuw, of mail of bel ons rechtstreeks: {data.content.settings.company.email}, {data.content.settings.company.phone}." links={[{ href: "/contact", label: "Opnieuw proberen" }, { href: "mailto:" + data.content.settings.company.email, label: "Stuur een e-mail" }]} />
