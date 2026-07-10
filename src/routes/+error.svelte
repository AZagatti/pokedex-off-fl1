<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>{page.status} — Pokédex</title>
</svelte:head>

<div class="flex flex-col items-center gap-4 py-24 text-center">
	<p class="font-black text-7xl text-accent tracking-tight">{page.status}</p>
	<h1 class="font-bold text-xl text-ink">
		{page.status === 404 ? 'This Pokémon fled!' : 'Something went wrong'}
	</h1>
	<p class="max-w-sm text-sm text-muted">
		{page.error?.message ?? 'An unexpected error occurred.'}
	</p>
	<a
		href="{base}/"
		class="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105"
	>
		Back to the Pokédex
	</a>
</div>
