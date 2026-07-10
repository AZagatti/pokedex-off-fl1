<script lang="ts">
	import type { Snippet } from 'svelte';
	import { SearchX } from 'lucide-svelte';

	let {
		title,
		message,
		children,
	}: { title: string; message: string; children?: Snippet } = $props();
</script>

<div class="flex flex-col items-center gap-3 py-20 text-center">
	<SearchX size={48} class="text-muted" aria-hidden="true" />
	<h2 class="text-lg font-bold text-ink">{title}</h2>
	<p class="max-w-sm text-sm text-muted">{message}</p>
	{#if children}
		{@render children()}
	{/if}
</div>
