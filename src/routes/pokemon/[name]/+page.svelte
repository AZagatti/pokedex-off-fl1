<script lang="ts">
	import { ArrowLeft, Volume2 } from 'lucide-svelte';
	import { base } from '$app/paths';
	import { formatDexNumber, formatName, idFromUrl, statTotal } from '$lib/api/client';
	import type { ChainLink } from '$lib/api/schemas';
	import FavoriteButton from '$lib/components/FavoriteButton.svelte';
	import PokemonImage from '$lib/components/PokemonImage.svelte';
	import TypeBadge from '$lib/components/TypeBadge.svelte';
	import StatBar from '$lib/components/StatBar.svelte';

	let { data } = $props();

	const pokemon = $derived(data.pokemon);
	const primaryType = $derived(pokemon.types[0]?.type.name ?? 'normal');

	const STAT_LABELS: Record<string, string> = {
		hp: 'HP',
		attack: 'Attack',
		defense: 'Defense',
		'special-attack': 'Sp. Atk',
		'special-defense': 'Sp. Def',
		speed: 'Speed',
	};

	interface Variant {
		key: string;
		label: string;
		src: string | null;
	}
	const variants = $derived<Variant[]>([
		{ key: 'front', label: 'Front', src: pokemon.sprites.front_default },
		{ key: 'back', label: 'Back', src: pokemon.sprites.back_default },
		{ key: 'shiny-front', label: 'Shiny', src: pokemon.sprites.front_shiny },
		{ key: 'shiny-back', label: 'Shiny back', src: pokemon.sprites.back_shiny },
	]);
	let variantKey = $state('front');
	const availableVariants = $derived(variants.filter((v) => v.src));
	const activeVariant = $derived(variants.find((v) => v.key === variantKey) ?? variants[0]);

	const artwork = $derived(
		pokemon.sprites.other?.['official-artwork']?.front_default ?? pokemon.sprites.front_default,
	);

	const flavor = $derived(
		data.species?.flavor_text_entries
			.find((entry) => entry.language.name === 'en')
			?.flavor_text.replaceAll(/[\n\f]/gu, ' ') ?? null,
	);
	const genus = $derived(
		data.species?.genera.find((g) => g.language.name === 'en')?.genus ?? null,
	);

	interface Stage {
		name: string;
		id: number;
	}
	const toStage = (l: ChainLink): Stage => ({
		name: l.species.name,
		id: idFromUrl(l.species.url),
	});
	const flattenChain = (link: ChainLink): Stage[][] => {
		const stages: Stage[][] = [[toStage(link)]];
		let current = link.evolves_to;
		while (current.length > 0) {
			stages.push(current.map(toStage));
			current = current.flatMap((c) => c.evolves_to);
		}
		return stages;
	};
	const evolutionStages = $derived(data.evolution ? flattenChain(data.evolution.chain) : []);

	const cryUrl = $derived(pokemon.cries?.latest ?? pokemon.cries?.legacy ?? null);
	let playingCry = $state(false);
	const playCry = (): void => {
		if (!cryUrl || playingCry) {
			return;
		}
		const audio = new Audio(cryUrl);
		audio.volume = 0.4;
		playingCry = true;
		audio.addEventListener('ended', () => {
			playingCry = false;
		});
		audio.addEventListener('error', () => {
			playingCry = false;
		});
		void (async () => {
			try {
				await audio.play();
			} catch {
				playingCry = false;
			}
		})();
	};
</script>

<svelte:head>
	<title>{formatName(pokemon.name)} — Pokédex</title>
</svelte:head>

<a
	href="{base}/"
	class="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
	data-testid="back-link"
>
	<ArrowLeft size={16} aria-hidden="true" />
	Back to Pokédex
</a>

{#key pokemon.id}
	<article class="hero-enter">
		<div
			class="relative overflow-hidden rounded-3xl border border-edge bg-elevated p-6 sm:p-8"
			style="background-image: linear-gradient(135deg, color-mix(in srgb, var(--type-{primaryType}) 22%, transparent), transparent 60%)"
		>
			<div class="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
				<div class="shrink-0">
					<PokemonImage src={artwork} alt="Official artwork of {formatName(pokemon.name)}" size={240} eager />
				</div>
				<div class="min-w-0 flex-1 text-center sm:text-left">
					<div class="flex items-center justify-center gap-2 sm:justify-start">
						<span class="font-semibold text-muted">{formatDexNumber(pokemon.id)}</span>
						{#if genus}<span class="text-sm text-muted">· {genus}</span>{/if}
					</div>
					<div class="mt-1 flex items-center justify-center gap-2 sm:justify-start">
						<h1 class="font-black text-3xl text-ink tracking-tight" data-testid="pokemon-name">
							{formatName(pokemon.name)}
						</h1>
						<FavoriteButton name={pokemon.name} size={22} />
						{#if cryUrl}
							<button
								type="button"
								class="rounded-full bg-accent-soft p-2 text-accent transition-transform hover:scale-110 active:scale-90 disabled:opacity-50"
								onclick={playCry}
								disabled={playingCry}
								aria-label="Play {formatName(pokemon.name)}'s cry"
								data-testid="play-cry"
							>
								<Volume2 size={18} aria-hidden="true" />
							</button>
						{/if}
					</div>
					<div class="mt-3 flex justify-center gap-2 sm:justify-start">
						{#each pokemon.types as t (t.slot)}
							<TypeBadge type={t.type.name} size="md" />
						{/each}
					</div>
					{#if flavor}
						<p class="mt-4 max-w-prose text-sm text-muted">{flavor}</p>
					{/if}
					<dl class="mt-4 flex justify-center gap-8 sm:justify-start">
						<div>
							<dt class="text-xs text-muted uppercase tracking-wide">Height</dt>
							<dd class="font-bold text-ink">{(pokemon.height / 10).toFixed(1)} m</dd>
						</div>
						<div>
							<dt class="text-xs text-muted uppercase tracking-wide">Weight</dt>
							<dd class="font-bold text-ink">{(pokemon.weight / 10).toFixed(1)} kg</dd>
						</div>
						<div>
							<dt class="text-xs text-muted uppercase tracking-wide">Stat total</dt>
							<dd class="font-bold text-ink">{statTotal(pokemon)}</dd>
						</div>
					</dl>
				</div>
			</div>
		</div>

		<div class="mt-6 grid gap-6 md:grid-cols-2">
			<section class="rounded-3xl border border-edge bg-elevated p-6" aria-labelledby="stats-heading">
				<h2 id="stats-heading" class="mb-4 font-bold text-lg text-ink">Base stats</h2>
				<div class="space-y-3">
					{#each pokemon.stats as stat (stat.stat.name)}
						<StatBar
							label={STAT_LABELS[stat.stat.name] ?? formatName(stat.stat.name)}
							value={stat.base_stat}
							color="var(--type-{primaryType})"
						/>
					{/each}
				</div>
			</section>

			<div class="space-y-6">
				<section class="rounded-3xl border border-edge bg-elevated p-6" aria-labelledby="abilities-heading">
					<h2 id="abilities-heading" class="mb-3 font-bold text-lg text-ink">Abilities</h2>
					<ul class="flex flex-wrap gap-2">
						{#each pokemon.abilities as ability (ability.ability.name)}
							<li
								class="flex items-center gap-1.5 rounded-full bg-subtle px-3 py-1.5 text-sm font-medium text-ink"
							>
								{formatName(ability.ability.name)}
								{#if ability.is_hidden}
									<span class="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold text-accent uppercase">
										Hidden
									</span>
								{/if}
							</li>
						{/each}
					</ul>
				</section>

				<section class="rounded-3xl border border-edge bg-elevated p-6" aria-labelledby="moves-heading">
					<h2 id="moves-heading" class="mb-3 font-bold text-lg text-ink">Example moves</h2>
					<ul class="flex flex-wrap gap-2">
						{#each pokemon.moves.slice(0, 8) as move (move.move.name)}
							<li class="rounded-full bg-subtle px-3 py-1.5 text-sm text-muted">
								{formatName(move.move.name)}
							</li>
						{/each}
					</ul>
				</section>

				<section class="rounded-3xl border border-edge bg-elevated p-6" aria-labelledby="sprites-heading">
					<h2 id="sprites-heading" class="mb-3 font-bold text-lg text-ink">Sprites</h2>
					<div class="flex items-center gap-4">
						<div class="rounded-2xl bg-subtle p-2">
							<PokemonImage
								src={activeVariant.src}
								alt="{activeVariant.label} sprite of {formatName(pokemon.name)}"
								size={96}
							/>
						</div>
						{#if availableVariants.length > 1}
						<div class="flex flex-wrap gap-1.5" role="group" aria-label="Sprite variant">
							{#each availableVariants as variant (variant.key)}
								<button
									type="button"
									class="rounded-full px-3 py-1.5 text-xs font-semibold transition-colors {variantKey ===
									variant.key
										? 'bg-accent-soft text-accent'
										: 'bg-subtle text-muted hover:text-ink'}"
									aria-pressed={variantKey === variant.key}
									onclick={() => {
										variantKey = variant.key;
									}}
								>
									{variant.label}
								</button>
							{/each}
						</div>
						{/if}
					</div>
				</section>
			</div>
		</div>

		{#if evolutionStages.length > 1}
			<section class="mt-6 rounded-3xl border border-edge bg-elevated p-6" aria-labelledby="evolution-heading">
				<h2 id="evolution-heading" class="mb-4 font-bold text-lg text-ink">Evolution chain</h2>
				<div class="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
					{#each evolutionStages as stage, i (i)}
						{#if i > 0}
							<span class="text-xl text-muted" aria-hidden="true">→</span>
						{/if}
						<div class="flex flex-wrap justify-center gap-2">
							{#each stage as entry (entry.name)}
								<a
									href="{base}/pokemon/{entry.name}"
									class="card-lift flex flex-col items-center gap-1 rounded-2xl border border-edge p-3 {entry.name ===
									pokemon.name
										? 'bg-accent-soft'
										: 'bg-subtle'}"
									aria-current={entry.name === pokemon.name ? 'page' : undefined}
								>
									<PokemonImage
										src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{entry.id}.png"
										alt="{formatName(entry.name)} artwork"
										size={72}
									/>
									<span class="text-sm font-semibold text-ink">{formatName(entry.name)}</span>
								</a>
							{/each}
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</article>
{/key}
