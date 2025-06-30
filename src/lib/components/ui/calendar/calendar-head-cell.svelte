<script lang="ts">
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let { ref = $bindable(null), class: className, children, ...restProps }: CalendarPrimitive.HeadCellProps = $props();
</script>

<CalendarPrimitive.HeadCell
	bind:ref
	class={cn(
		"text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
		className
	)}
	{...restProps}
>
	{@render children()}
</CalendarPrimitive.HeadCell>
