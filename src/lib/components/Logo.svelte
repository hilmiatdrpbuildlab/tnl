<script lang="ts">
	import logo from '$lib/assets/logo/tnl-logo.svg';
	import logoOnDark from '$lib/assets/logo/tnl-logo-on-dark.svg';
	import monoMoss from '$lib/assets/logo/tnl-logo-mono-moss.svg';
	import monoWhite from '$lib/assets/logo/tnl-logo-mono-white.svg';
	import mark from '$lib/assets/logo/tnl-mark.svg';
	import markOnDark from '$lib/assets/logo/tnl-mark-on-dark.svg';

	/** The six approved logo files from design-system-v2/assets/logo. Never recolour or stretch. */
	type Variant = 'default' | 'on-dark' | 'mono-moss' | 'mono-white' | 'mark' | 'mark-on-dark';
	interface Props {
		variant?: Variant;
		width?: number;
	}
	let { variant = 'default', width }: Props = $props();
	const files: Record<Variant, { src: string; ratio: number }> = {
		default: { src: logo, ratio: 1260 / 2394 },
		'on-dark': { src: logoOnDark, ratio: 1260 / 2394 },
		'mono-moss': { src: monoMoss, ratio: 1260 / 2394 },
		'mono-white': { src: monoWhite, ratio: 1260 / 2394 },
		mark: { src: mark, ratio: 974 / 2394 },
		'mark-on-dark': { src: markOnDark, ratio: 974 / 2394 }
	};
	const file = $derived(files[variant]);
	const w = $derived(width ?? 88);
</script>

<img src={file.src} alt="TNL Group" width={w} height={Math.round(w * file.ratio)} />
