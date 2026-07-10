<script lang="ts">
	import { Cherry, Heart, Moon, Sun, Zap } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { theme } from '$lib/stores/theme.svelte';
	import '../app.css';

	let { children }: { children: Snippet } = $props();

	const links = [
		{ href: `${base}/`, label: 'Pokédex', icon: Zap },
		{ href: `${base}/berries`, label: 'Berries', icon: Cherry },
		{ href: `${base}/favorites`, label: 'Favorites', icon: Heart },
	];

	const isActive = (href: string): boolean => {
		const path = page.url.pathname;
		if (href === `${base}/`) {
			return path === `${base}/` || path === base;
		}
		return path.startsWith(href);
	};
</script>

<svelte:head>
	<title>Pokédex</title>
	<meta
		name="description"
		content="A polished, animated Pokédex powered by PokeAPI — browse, search and filter Pokémon, explore berries, and save your favorites."
	/>
</svelte:head>

<div class="min-h-screen bg-bg">
	<header
		class="sticky top-0 z-40 border-b border-edge bg-bg/80 backdrop-blur supports-[backdrop-filter]:bg-bg/60"
	>
		<div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
			<a href="{base}/" class="flex items-center gap-2 font-black text-lg text-ink tracking-tight">
				<span
					class="inline-block h-5 w-5 rounded-full border-2 border-ink"
					style="background: linear-gradient(to bottom, var(--accent) 45%, var(--bg-elevated) 45%)"
					aria-hidden="true"
				></span>
				Pokédex
			</a>
			<nav aria-label="Main navigation" class="flex items-center gap-1">
				{#each links as link (link.href)}
					<a
						href={link.href}
						class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors {isActive(
							link.href,
						)
							? 'bg-accent-soft text-accent'
							: 'text-muted hover:bg-subtle hover:text-ink'}"
						aria-current={isActive(link.href) ? 'page' : undefined}
					>
						<link.icon size={16} aria-hidden="true" />
						<span class="hidden sm:inline">{link.label}</span>
						<span class="sr-only sm:hidden">{link.label}</span>
					</a>
				{/each}
				<button
					type="button"
					class="ml-1 rounded-full p-2 text-muted transition-colors hover:bg-subtle hover:text-ink"
					onclick={() => theme.toggle()}
					aria-label={theme.current === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
					data-testid="theme-toggle"
				>
					{#if theme.current === 'dark'}
						<Sun size={18} aria-hidden="true" />
					{:else}
						<Moon size={18} aria-hidden="true" />
					{/if}
				</button>
			</nav>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-4 py-6">
		{@render children()}
	</main>

	<footer class="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-muted">
		Data from <a class="underline hover:text-ink" href="https://pokeapi.co">PokeAPI</a>. Pokémon and
		Pokémon character names are trademarks of Nintendo.
	</footer>
</div>
