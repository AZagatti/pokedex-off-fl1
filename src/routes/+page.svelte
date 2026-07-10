<script lang="ts">
	import EmptyState from '$lib/components/EmptyState.svelte';
	import PokemonCard from '$lib/components/PokemonCard.svelte';
	import SkeletonCard from '$lib/components/SkeletonCard.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import {
		fetchGeneration,
		fetchPokemon,
		fetchPokemonList,
		fetchType,
		idFromUrl,
		PAGE_SIZE,
		POKEMON_COUNT,
		statTotal,
	} from '$lib/api/client';
	import type { Pokemon } from '$lib/api/schemas';

	let search = $state('');
	let debouncedSearch = $state('');
	let generation = $state(0);
	let selectedTypes = $state<string[]>([]);
	let sort = $state<'dex' | 'stats'>('dex');

	let allNames = $state<{ name: string; id: number }[] | null>(null);
	let loaded = $state<Pokemon[]>([]);
	let visibleCount = $state(PAGE_SIZE);
	let loading = $state(true);
	let loadingMore = $state(false);
	let loadError = $state<string | null>(null);
	let requestToken = 0;

	let searchTimer: ReturnType<typeof setTimeout>;
	$effect(() => {
		const value = search;
		searchTimer = setTimeout(() => {
			debouncedSearch = value.trim().toLowerCase();
		}, 250);
		return () => clearTimeout(searchTimer);
	});

	const candidateNames = async (): Promise<{ name: string; id: number }[]> => {
		if (allNames === null) {
			const list = await fetchPokemonList(POKEMON_COUNT, 0);
			allNames = list.results.map((r) => ({ id: idFromUrl(r.url), name: r.name }));
		}
		let candidates = allNames;

		if (generation !== 0) {
			const gen = await fetchGeneration(generation);
			const genNames = new Set(gen.pokemon_species.map((s) => s.name));
			candidates = candidates.filter((c) => genNames.has(c.name));
		}
		const typeSets = await Promise.all(selectedTypes.map((type) => fetchType(type)));
		for (const typeData of typeSets) {
			const typeNames = new Set(typeData.pokemon.map((p) => p.pokemon.name));
			candidates = candidates.filter((c) => typeNames.has(c.name));
		}
		if (debouncedSearch !== '') {
			candidates = candidates.filter((c) => c.name.includes(debouncedSearch));
		}
		return candidates.toSorted((a, b) => a.id - b.id);
	};

	let rankProgress = $state(0);

	const fetchDetails = async (names: string[]): Promise<Pokemon[]> => {
		// Fetch in chunks of 100 so a big stat-sort doesn't fire 1000+ requests
		// at once; every response lands in the URL cache for later pages.
		const results: Pokemon[] = [];
		rankProgress = 0;
		for (let start = 0; start < names.length; start += 100) {
			const chunk = names.slice(start, start + 100);
			// oxlint-disable-next-line eslint/no-await-in-loop -- chunks are intentionally sequential to throttle the API
			const settled = await Promise.allSettled(chunk.map((name) => fetchPokemon(name)));
			results.push(
				...settled
					.filter((r): r is PromiseFulfilledResult<Pokemon> => r.status === 'fulfilled')
					.map((r) => r.value),
			);
			rankProgress = Math.round((Math.min(start + 100, names.length) / names.length) * 100);
		}
		return results;
	};

	let matches = $state<{ name: string; id: number }[]>([]);

	$effect(() => {
		// Track filter inputs so the effect reruns when any change.
		void debouncedSearch;
		void generation;
		void selectedTypes.length;
		void sort;
		requestToken += 1;
		const token = requestToken;
		loading = true;
		loadError = null;
		visibleCount = PAGE_SIZE;

		(async () => {
			try {
				const candidates = await candidateNames();
				if (token !== requestToken) {
					return;
				}
				matches = candidates;
				let details: Pokemon[];
				if (sort === 'stats') {
					const fetched = await fetchDetails(candidates.map((c) => c.name));
					details = fetched.toSorted((a, b) => statTotal(b) - statTotal(a));
				} else {
					const fetched = await fetchDetails(candidates.slice(0, PAGE_SIZE).map((c) => c.name));
					details = fetched.toSorted((a, b) => a.id - b.id);
				}
				if (token !== requestToken) {
					return;
				}
				loaded = details;
				loading = false;
			} catch (error) {
				if (token === requestToken) {
					loadError = error instanceof Error ? error.message : 'Something went wrong';
					loading = false;
				}
			}
		})();
	});

	const visible = $derived(sort === 'stats' ? loaded.slice(0, visibleCount) : loaded);
	const hasMore = $derived(
		sort === 'stats' ? visibleCount < loaded.length : loaded.length < matches.length,
	);

	const loadMore = async (): Promise<void> => {
		if (loadingMore || loading || !hasMore) {
			return;
		}
		loadingMore = true;
		const token = requestToken;
		if (sort === 'stats') {
			visibleCount += PAGE_SIZE;
		} else {
			const next = matches.slice(loaded.length, loaded.length + PAGE_SIZE);
			const details = await fetchDetails(next.map((c) => c.name));
			if (token === requestToken) {
				loaded = [...loaded, ...details].toSorted((a, b) => a.id - b.id);
			}
		}
		loadingMore = false;
	};

	const sentinel = (node: HTMLElement) => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					void loadMore();
				}
			},
			{ rootMargin: '600px' },
		);
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
			},
		};
	};
</script>

<svelte:head>
	<title>Pokédex — browse all Pokémon</title>
</svelte:head>

<h1 class="mb-1 font-black text-2xl text-ink tracking-tight">Pokédex</h1>
<p class="mb-4 text-sm text-muted">
	Browse {POKEMON_COUNT} Pokémon across nine generations. Search, filter and favorite.
</p>

<Toolbar bind:search bind:generation bind:selectedTypes bind:sort />

{#if loadError}
	<EmptyState title="Something went wrong" message={loadError} />
{:else if loading}
	{#if sort === 'stats' && matches.length > 100}
		<p class="mb-3 text-sm text-muted" role="status">
			Ranking {matches.length} Pokémon by stat total… {rankProgress}%
		</p>
	{/if}
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
		{#each Array.from({ length: 10 }, (_, i) => i) as i (i)}
			<SkeletonCard />
		{/each}
	</div>
{:else if visible.length === 0}
	<EmptyState
		title="No Pokémon found"
		message="No Pokémon match your current search and filters. Try clearing them."
	/>
{:else}
	<div
		class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
		data-testid="pokemon-grid"
	>
		{#each visible as pokemon (pokemon.id)}
			<PokemonCard {pokemon} />
		{/each}
		{#if loadingMore}
			{#each Array.from({ length: 5 }, (_, i) => i) as i (i)}
				<SkeletonCard />
			{/each}
		{/if}
	</div>
	{#if hasMore}
		<div use:sentinel class="h-4" aria-hidden="true"></div>
	{/if}
{/if}
