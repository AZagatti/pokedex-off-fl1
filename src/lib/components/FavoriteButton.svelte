<script lang="ts">
	import { Heart } from 'lucide-svelte';
	import { formatName } from '$lib/api/client';
	import { favorites } from '$lib/stores/favorites.svelte';

	let { name, size = 18 }: { name: string; size?: number } = $props();

	const active = $derived(favorites.has(name));
</script>

<button
	type="button"
	class="rounded-full p-2 transition-transform duration-150 hover:scale-110 active:scale-90 {active
		? 'text-accent'
		: 'text-muted hover:text-accent'}"
	aria-pressed={active}
	aria-label={active ? `Remove ${formatName(name)} from favorites` : `Add ${formatName(name)} to favorites`}
	onclick={(event) => {
		event.preventDefault();
		event.stopPropagation();
		favorites.toggle(name);
	}}
>
	<Heart {size} fill={active ? 'currentColor' : 'none'} aria-hidden="true" />
</button>
