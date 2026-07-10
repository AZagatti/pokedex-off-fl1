<script lang="ts">
	let {
		src,
		alt,
		size = 96,
		eager = false,
		pixelated = false,
	}: {
		src: string | null;
		alt: string;
		size?: number;
		eager?: boolean;
		pixelated?: boolean;
	} = $props();

	let loaded = $state(false);
	let failed = $state(false);
	let img = $state<HTMLImageElement | null>(null);

	// After hydration the image may already be complete — onload won't refire.
	$effect(() => {
		if (img?.complete) {
			loaded = true;
		}
	});
</script>

<div class="relative flex items-center justify-center" style="width: {size}px; height: {size}px">
	{#if src && !failed}
		{#if !loaded}
			<div class="skeleton absolute inset-2 rounded-full" aria-hidden="true"></div>
		{/if}
		<img
			bind:this={img}
			{src}
			{alt}
			width={size}
			height={size}
			loading={eager ? 'eager' : 'lazy'}
			fetchpriority={eager ? 'high' : 'auto'}
			decoding="async"
			class="relative h-full w-full object-contain transition-opacity duration-300 {loaded
				? 'opacity-100'
				: 'opacity-0'}"
			style={pixelated ? 'image-rendering: pixelated' : ''}
			onload={() => {
				loaded = true;
			}}
			onerror={() => {
				failed = true;
			}}
		/>
	{:else}
		<div
			class="flex h-full w-full items-center justify-center rounded-full bg-subtle text-muted"
			role="img"
			aria-label={alt}
		>
			?
		</div>
	{/if}
</div>
