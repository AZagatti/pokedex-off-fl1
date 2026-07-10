<script lang="ts">
	import { base } from '$app/paths';
	import { formatDexNumber, formatName } from '$lib/api/client';
	import type { Pokemon } from '$lib/api/schemas';
	import FavoriteButton from './FavoriteButton.svelte';
	import PokemonImage from './PokemonImage.svelte';
	import TypeBadge from './TypeBadge.svelte';

	let { pokemon, eager = false }: { pokemon: Pokemon; eager?: boolean } = $props();

	// Pixel sprite (~3 KB) instead of official artwork (~300 KB) — keeps the
	// grid light; detail pages show the full artwork.
	const sprite = $derived(
		pokemon.sprites.front_default ??
			pokemon.sprites.other?.['official-artwork']?.front_default ??
			null,
	);
	const primaryType = $derived(pokemon.types[0]?.type.name ?? 'normal');
</script>

<div
	class="card-lift group relative rounded-2xl border border-edge bg-elevated p-4"
	data-testid="pokemon-card"
>
	<div
		class="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.08] transition-opacity duration-300 group-hover:opacity-[0.16]"
		style="background: linear-gradient(135deg, var(--type-{primaryType}), transparent 70%)"
		aria-hidden="true"
	></div>
	<a
		href="{base}/pokemon/{pokemon.name}"
		class="absolute inset-0 z-0 rounded-2xl"
		aria-label="{formatName(pokemon.name)}, {formatDexNumber(pokemon.id)}"
	></a>
	<div class="pointer-events-none absolute top-2 right-2 z-10 [&>*]:pointer-events-auto">
		<FavoriteButton name={pokemon.name} />
	</div>
	<div class="pointer-events-none relative flex flex-col items-center gap-2">
		<PokemonImage src={sprite} alt="" size={120} {eager} pixelated />
		<span class="text-xs font-medium text-muted">{formatDexNumber(pokemon.id)}</span>
		<h2 class="font-bold text-ink">{formatName(pokemon.name)}</h2>
		<div class="flex gap-1.5">
			{#each pokemon.types as t (t.slot)}
				<TypeBadge type={t.type.name} />
			{/each}
		</div>
	</div>
</div>
