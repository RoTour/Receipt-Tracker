<script lang="ts">
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";
	import { Button } from "$lib/components/ui/button";
	import { ChevronRight } from "lucide-svelte";

	let { ref = $bindable(null), class: className, children, ...restProps }: CalendarPrimitive.NextButtonProps = $props();
</script>

<CalendarPrimitive.NextButton
	bind:ref
	class={cn("absolute right-4 top-4", className)}
	{...restProps}
>
	<Button variant="ghost" size="icon" class="h-9 w-9">
		<ChevronRight class="h-4 w-4" />
	</Button>
	{@render children()}
</CalendarPrimitive.NextButton>
