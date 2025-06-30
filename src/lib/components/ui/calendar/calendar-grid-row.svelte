<script lang="ts">
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let { ref = $bindable(null), class: className, children, ...restProps }: CalendarPrimitive.GridRowProps = $props();
</script>

<CalendarPrimitive.GridRow
	bind:ref
	class={cn("mt-2 flex w-full", className)}
	{...restProps}
>
	{@render children()}
</CalendarPrimitive.GridRow>
