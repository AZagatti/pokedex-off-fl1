<script lang="ts">
	let { label, value, color, max = 255 }: { label: string; value: number; color: string; max?: number } =
		$props();

	const percent = $derived(Math.min(100, (value / max) * 100));
</script>

<div class="grid grid-cols-[7rem_2.5rem_1fr] items-center gap-2 text-sm">
	<span class="font-medium text-muted">{label}</span>
	<span class="text-right font-bold text-ink tabular-nums">{value}</span>
	<div
		class="h-2.5 overflow-hidden rounded-full bg-subtle"
		role="meter"
		aria-valuenow={value}
		aria-valuemin={0}
		aria-valuemax={max}
		aria-label="{label}: {value} of {max}"
	>
		<div class="stat-bar-fill h-full rounded-full" style="width: {percent}%; background: {color}"></div>
	</div>
</div>
