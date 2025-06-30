<script lang="ts">
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let { ref = $bindable(null), class: className, children, ...restProps }: CalendarPrimitive.GridProps = $props();
</script>

<CalendarPrimitive.Grid
	bind:ref
	class={cn("w-full border-collapse space-y-px", className)}
	{...restProps}
>
	{@render children()}
</CalendarPrimitive.Grid>
