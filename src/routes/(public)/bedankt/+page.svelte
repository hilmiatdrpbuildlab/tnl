<script lang="ts">
	import { page } from '$app/state';
	import MessageView from '$lib/views/MessageView.svelte';

	let { data } = $props();
	const ctx = $derived({ content: data.content, layout: data.layout, path: page.url.pathname });
</script>

<MessageView {ctx} eyebrow="Contact" title="Hartelijk bedankt!" lead="Wij hebben uw bericht goed ontvangen en nemen zo snel mogelijk contact met u op." links={[{ href: "/", label: "Naar de homepage" }, { href: "/projecten", label: "Bekijk projecten" }]} />
