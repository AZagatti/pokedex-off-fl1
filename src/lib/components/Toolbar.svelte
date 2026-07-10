<script lang="ts">
	import { ArrowUpDown, Search, X } from 'lucide-svelte';
	import { ALL_TYPES, formatName } from '$lib/api/client';

	let {
		search = $bindable(''),
		generation = $bindable(0),
		selectedTypes = $bindable([]),
		sort = $bindable('dex'),
	}: {
		search: string;
		generation: number;
		selectedTypes: string[];
		sort: 'dex' | 'stats';
	} = $props();

	const generations = [1, 2, 3, 4, 5, 6, 7, 8, 9];

	const hasFilters = $derived(
		search !== '' || generation !== 0 || selectedTypes.length > 0 || sort !== 'dex',
	);

	const toggleType = (type: string): void => {
		selectedTypes = selectedTypes.includes(type)
			? selectedTypes.filter((t) => t !== type)
			: [...selectedTypes, type];
	};

	const clearAll = (): void => {
		search = '';
		generation = 0;
		selectedTypes = [];
		sort = 'dex';
	};
</script>

<div
	class="sticky top-[57px] z-30 -mx-4 mb-6 border-b border-edge bg-bg/85 px-4 py-3 backdrop-blur"
	data-testid="toolbar"
>
	<div class="flex flex-wrap items-center gap-2">
		<label class="relative min-w-0 flex-1 basis-56">
			<span class="sr-only">Search Pokémon by name</span>
			<Search
				size={16}
				class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
				aria-hidden="true"
			/>
			<input
				type="search"
				placeholder="Search Pokémon…"
				bind:value={search}
				data-testid="search-input"
				class="w-full rounded-full border border-edge bg-elevated py-2 pr-4 pl-9 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
			/>
		</label>

		<label class="flex items-center gap-1.5 text-sm text-muted">
			<span class="sr-only sm:not-sr-only">Generation</span>
			<select
				bind:value={generation}
				data-testid="generation-select"
				aria-label="Filter by generation"
				class="rounded-full border border-edge bg-elevated px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
			>
				<option value={0}>All gens</option>
				{#each generations as gen (gen)}
					<option value={gen}>Gen {gen}</option>
				{/each}
			</select>
		</label>

		<button
			type="button"
			data-testid="sort-toggle"
			class="flex items-center gap-1.5 rounded-full border border-edge bg-elevated px-3 py-2 text-sm text-ink transition-colors hover:border-accent"
			onclick={() => {
				sort = sort === 'dex' ? 'stats' : 'dex';
			}}
			aria-label="Sort order: currently {sort === 'dex' ? 'dex number' : 'base-stat total'}"
		>
			<ArrowUpDown size={14} aria-hidden="true" />
			{sort === 'dex' ? 'Dex №' : 'Stat total'}
		</button>

		{#if hasFilters}
			<button
				type="button"
				data-testid="clear-filters"
				class="flex items-center gap-1 rounded-full bg-accent-soft px-3 py-2 text-sm font-medium text-accent transition-transform hover:scale-105"
				onclick={clearAll}
			>
				<X size={14} aria-hidden="true" />
				Clear filters
			</button>
		{/if}
	</div>

	<div class="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Filter by type">
		{#each ALL_TYPES as type (type)}
			{@const active = selectedTypes.includes(type)}
			<button
				type="button"
				data-testid="type-filter-{type}"
				class="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-all {active
					? 'text-white shadow'
					: 'bg-subtle text-muted hover:text-ink'}"
				style={active ? `background: var(--type-${type})` : ''}
				aria-pressed={active}
				onclick={() => toggleType(type)}
			>
				{formatName(type)}
			</button>
		{/each}
	</div>
</div>
