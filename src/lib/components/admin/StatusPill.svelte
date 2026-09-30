<script lang="ts">
	let { on, onText = 'Zichtbaar', offText = 'Verborgen' }: { on: boolean; onText?: string; offText?: string } = $props();
</script>

<span class="adm-pill" class:adm-pill--on={on}>{on ? onText : offText}</span>
