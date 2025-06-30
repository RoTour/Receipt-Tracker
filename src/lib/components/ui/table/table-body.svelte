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
	data-slot="table-body"
	role="rowgroup"
	class={cn("[&_[role=row]]:last:border-0", className)}
	{...restProps}
>
	{@render children?.()}
</div>
