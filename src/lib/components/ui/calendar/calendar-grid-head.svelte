<script lang="ts">
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let { ref = $bindable(null), class: className, children, ...restProps }: CalendarPrimitive.GridHeadProps = $props();
</script>

<CalendarPrimitive.GridHead
	bind:ref
	class={cn("w-full", className)}
	{...restProps}
>
	{@render children()}
</CalendarPrimitive.GridHead>
