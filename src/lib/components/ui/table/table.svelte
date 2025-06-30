<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div data-slot="table-container" class="relative w-full overflow-x-auto">
	<div
		bind:this={ref}
		data-slot="table"
		role="table"
		class={cn("w-full caption-bottom text-sm", className)}
		{...restProps}
	>
		{@render children?.()}
	</div>
</div>
