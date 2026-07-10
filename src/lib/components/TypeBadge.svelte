<script lang="ts">
	import { formatName } from '$lib/api/client';

	let { type, size = 'sm' }: { type: string; size?: 'sm' | 'md' } = $props();

	// Only these type colors are dark enough for white text at AA contrast;
	// the rest get near-black text.
	const WHITE_TEXT_TYPES = new Set(['fighting', 'poison', 'ghost', 'dragon', 'dark']);
</script>

<span
	class="inline-flex items-center rounded-full font-semibold uppercase tracking-wide shadow-sm {size ===
	'sm'
		? 'px-2 py-0.5 text-[10px]'
		: 'px-3 py-1 text-xs'}"
	style="background: var(--type-{type}, var(--type-normal)); color: {WHITE_TEXT_TYPES.has(type)
		? '#ffffff'
		: '#131a2a'}"
>
	{formatName(type)}
</span>
