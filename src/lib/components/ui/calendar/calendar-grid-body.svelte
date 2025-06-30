<script lang="ts">
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let { ref = $bindable(null), class: className, children, ...restProps }: CalendarPrimitive.GridBodyProps = $props();
</script>

<CalendarPrimitive.GridBody
	bind:ref
	class={cn("w-full", className)}
	{...restProps}
>
	{@render children()}
</CalendarPrimitive.GridBody>
