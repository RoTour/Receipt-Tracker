<script lang="ts">
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let { ref = $bindable(null), class: className, children, ...restProps }: CalendarPrimitive.HeadProps = $props();
</script>

<CalendarPrimitive.Head
	bind:ref
	class={cn("flex", className)}
	{...restProps}
>
	{@render children()}
</CalendarPrimitive.Head>
