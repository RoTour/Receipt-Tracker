<script lang="ts">
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";
	import { Button } from "$lib/components/ui/button";
	import { ChevronLeft } from "lucide-svelte";

	let { ref = $bindable(null), class: className, children, ...restProps }: CalendarPrimitive.PrevButtonProps = $props();
</script>

<CalendarPrimitive.PrevButton
	bind:ref
	class={cn("absolute left-4 top-4", className)}
	{...restProps}
>
	<Button variant="ghost" size="icon" class="h-7 w-7">
		<ChevronLeft class="h-4 w-4" />
	</Button>
	{@render children()}
</CalendarPrimitive.PrevButton>
