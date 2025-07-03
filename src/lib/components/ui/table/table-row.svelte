<!-- src/lib/components/ui/table/table-row.svelte -->
<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		gridCols = "",
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		gridCols?: string;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="table-row"
	role="row"
	class={cn(
		"hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors grid",
		gridCols,
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>