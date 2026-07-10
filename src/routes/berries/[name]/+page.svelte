<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
	import { base } from '$app/paths';
	import { formatName } from '$lib/api/client';
	import PokemonImage from '$lib/components/PokemonImage.svelte';
	import StatBar from '$lib/components/StatBar.svelte';

	let { data } = $props();
	const berry = $derived(data.berry);

	const FLAVOR_COLORS: Record<string, string> = {
		spicy: 'var(--type-fire)',
		dry: 'var(--type-ground)',
		sweet: 'var(--type-fairy)',
		bitter: 'var(--type-grass)',
		sour: 'var(--type-electric)',
	};
</script>

<svelte:head>
	<title>{formatName(berry.name)} Berry — Pokédex</title>
</svelte:head>

<a
	href="{base}/berries"
	class="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
	data-testid="back-link"
>
	<ArrowLeft size={16} aria-hidden="true" />
	Back to berries
</a>

<article class="hero-enter mx-auto max-w-2xl">
	<div class="rounded-3xl border border-edge bg-elevated p-6 sm:p-8">
		<div class="flex items-center gap-6">
			<div class="rounded-2xl bg-subtle p-4">
				<PokemonImage
					src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/{berry.name}-berry.png"
					alt="{formatName(berry.name)} berry"
					size={72}
					eager
				/>
			</div>
			<div>
				<span class="font-semibold text-muted">#{berry.id}</span>
				<h1 class="font-black text-3xl text-ink tracking-tight" data-testid="berry-name">
					{formatName(berry.name)} Berry
				</h1>
				<p class="mt-1 text-sm text-muted">Firmness: {formatName(berry.firmness.name)}</p>
			</div>
		</div>

		<dl class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
			{#each [
				{ label: 'Growth time', value: `${berry.growth_time}h` },
				{ label: 'Max harvest', value: String(berry.max_harvest) },
				{ label: 'Size', value: `${(berry.size / 10).toFixed(1)} cm` },
				{ label: 'Smoothness', value: String(berry.smoothness) },
			] as item (item.label)}
				<div class="rounded-2xl bg-subtle p-3 text-center">
					<dt class="text-xs text-muted uppercase tracking-wide">{item.label}</dt>
					<dd class="mt-1 font-bold text-lg text-ink">{item.value}</dd>
				</div>
			{/each}
		</dl>

		<h2 class="mt-6 mb-3 font-bold text-lg text-ink">Flavors</h2>
		<div class="space-y-3">
			{#each berry.flavors as flavor (flavor.flavor.name)}
				<StatBar
					label={formatName(flavor.flavor.name)}
					value={flavor.potency}
					max={40}
					color={FLAVOR_COLORS[flavor.flavor.name] ?? 'var(--accent)'}
				/>
			{/each}
		</div>
	</div>
</article>
