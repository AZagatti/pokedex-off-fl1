<script lang="ts">
	import { base } from '$app/paths';
	import { fetchPokemon } from '$lib/api/client';
	import type { Pokemon } from '$lib/api/schemas';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import PokemonCard from '$lib/components/PokemonCard.svelte';
	import SkeletonCard from '$lib/components/SkeletonCard.svelte';
	import { favorites } from '$lib/stores/favorites.svelte';

	let loaded = $state<Pokemon[]>([]);
	let loading = $state(true);
	let loadError = $state<string | null>(null);

	$effect(() => {
		const names = [...favorites.names];
		(async () => {
			try {
				const details = await Promise.all(names.map((name) => fetchPokemon(name)));
				loaded = details.toSorted((a, b) => a.id - b.id);
				loading = false;
			} catch (error) {
				loadError = error instanceof Error ? error.message : 'Failed to load favorites';
				loading = false;
			}
		})();
	});
</script>

<svelte:head>
	<title>Favorites — Pokédex</title>
</svelte:head>

<h1 class="mb-1 font-black text-2xl text-ink tracking-tight">Favorites</h1>
<p class="mb-6 text-sm text-muted">Your favorited Pokémon, saved on this device.</p>

{#if loadError}
	<EmptyState title="Something went wrong" message={loadError} />
{:else if loading}
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
		{#each Array.from({ length: 5 }, (_, i) => i) as i (i)}
			<SkeletonCard />
		{/each}
	</div>
{:else if loaded.length === 0}
	<EmptyState
		title="No favorites yet"
		message="Tap the heart on any Pokémon card or detail page to save it here."
	>
		<a
			href="{base}/"
			class="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105"
		>
			Browse the Pokédex
		</a>
	</EmptyState>
{:else}
	<div
		class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
		data-testid="favorites-grid"
	>
		{#each loaded as pokemon (pokemon.id)}
			<PokemonCard {pokemon} />
		{/each}
	</div>
{/if}
