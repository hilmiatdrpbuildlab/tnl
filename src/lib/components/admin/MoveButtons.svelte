<script lang="ts">
	import { enhance } from '$app/forms';

	let { id, first, last, label }: { id: string; first: boolean; last: boolean; label: string } = $props();
</script>

<form method="POST" action="?/move" use:enhance style="display:inline-flex;gap:4px">
	<input type="hidden" name="id" value={id} />
	<button class="adm-btn adm-btn--sm adm-iconbtn" name="dir" value="-1" disabled={first} aria-label="{label} omhoog">↑</button>
	<button class="adm-btn adm-btn--sm adm-iconbtn" name="dir" value="1" disabled={last} aria-label="{label} omlaag">↓</button>
</form>
