<script lang="ts">
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let { ref = $bindable(null), class: className, children, ...restProps }: CalendarPrimitive.Props = $props();
</script>

<div
	bind:this={ref}
	class={cn("p-3", className)}
	data-melt-calendar=""
	{...restProps}
>
	{@render children()}
</div>
