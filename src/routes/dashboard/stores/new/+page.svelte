<!-- src/routes/dashboard/stores/new/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { ArrowLeft } from 'lucide-svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
	<div class="flex items-center gap-4">
		<Button href="/dashboard/stores" variant="outline" size="icon">
			<ArrowLeft class="h-4 w-4" />
			<span class="sr-only">Back to Stores</span>
		</Button>
		<h1 class="text-xl font-semibold">Create New Store</h1>
	</div>

	{#if form?.message}
		<div
			class="rounded-md p-3 text-sm font-medium {form.success
				? 'bg-green-100 text-green-800'
				: 'bg-red-100 text-red-800'}"
		>
			{form.message}
		</div>
	{/if}

	<Card.Root>
		<form method="POST" action="?/create" use:enhance>
			<Card.Header>
				<Card.Title>Store Details</Card.Title>
				<Card.Description>Enter the details for the new store.</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-4">
				<div class="grid gap-2">
					<Label for="name">Store Name</Label>
					<Input id="name" name="name" placeholder="e.g., Carrefour City" required />
				</div>
				<div class="grid gap-2">
					<Label for="location">Location</Label>
					<Input id="location" name="location" placeholder="e.g., Rue de Metz, Toulouse" />
				</div>
			</Card.Content>
			<Card.Footer class="border-t px-6 py-4">
				<Button type="submit">Create Store</Button>
			</Card.Footer>
		</form>
	</Card.Root>
</main>
