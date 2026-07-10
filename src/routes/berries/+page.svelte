<script lang="ts">
	import { base } from '$app/paths';
	import { formatName, idFromUrl } from '$lib/api/client';
	import PokemonImage from '$lib/components/PokemonImage.svelte';

	let { data } = $props();

	const spriteUrl = (name: string): string =>
		`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${name}-berry.png`;
</script>

<svelte:head>
	<title>Berries — Pokédex</title>
</svelte:head>

<h1 class="mb-1 font-black text-2xl text-ink tracking-tight">Berries</h1>
<p class="mb-6 text-sm text-muted">All {data.berries.length} berries, with growth and flavor data.</p>

<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" data-testid="berry-grid">
	{#each data.berries as berry (berry.name)}
		<a
			href="{base}/berries/{berry.name}"
			class="card-lift flex flex-col items-center gap-2 rounded-2xl border border-edge bg-elevated p-4"
			data-testid="berry-card"
		>
			<PokemonImage src={spriteUrl(berry.name)} alt="{formatName(berry.name)} berry" size={64} />
			<span class="text-xs font-medium text-muted">#{idFromUrl(berry.url)}</span>
			<h2 class="font-bold text-sm text-ink">{formatName(berry.name)}</h2>
		</a>
	{/each}
</div>
