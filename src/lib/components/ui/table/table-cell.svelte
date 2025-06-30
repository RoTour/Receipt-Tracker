<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="table-cell"
	role="cell"
	class={cn("whitespace-nowrap p-2 align-middle [&:has([role=checkbox])]:pr-0", className)}
	{...restProps}
>
	{@render children?.()}
</div>
