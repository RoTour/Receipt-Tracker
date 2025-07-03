<script lang="ts">
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let { ref = $bindable(null), class: className, children, ...restProps }: CalendarPrimitive.DayProps = $props();
</script>

<CalendarPrimitive.Day
	bind:ref
	class={cn(
		"h-10 w-10 p-0 relative focus:z-10 rounded-md text-base md:text-sm",
		"data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground data-[selected]:focus:bg-primary data-[selected]:focus:text-primary-foreground",
		"data-[disabled]:text-muted-foreground data-[disabled]:opacity-50",
		"data-[range-end]:rounded-r-md data-[range-start]:rounded-l-md",
		"data-[outside]:text-muted-foreground data-[outside]:opacity-50",
		"data-[today]:bg-accent data-[today]:text-accent-foreground",
		className
	)}
	{...restProps}
>
	{@render children()}
</CalendarPrimitive.Day>
