<!-- src/routes/dashboard/stores/[id]/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { ArrowLeft, Trash2 } from 'lucide-svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let { store } = data;

	let isDeleting = $state(false);
</script>

<main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
	<div class="flex items-center gap-4">
		<Button href="/dashboard/stores" variant="outline" size="icon" class="h-7 w-7">
			<ArrowLeft class="h-4 w-4" />
			<span class="sr-only">Back to Stores</span>
		</Button>
		<h1 class="text-xl font-semibold">Edit Store</h1>
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

	<div class="grid gap-6">
		<Card.Root>
			<form method="POST" action="?/update" use:enhance>
				<Card.Header>
					<Card.Title>Store Details</Card.Title>
					<Card.Description>Update the name and location for this store.</Card.Description>
				</Card.Header>
				<Card.Content class="grid gap-4">
					<div class="grid gap-2">
						<Label for="name">Store Name</Label>
						<Input id="name" name="name" value={store.name} required />
					</div>
					<div class="grid gap-2">
						<Label for="location">Location</Label>
						<Input
							id="location"
							name="location"
							value={store.location ?? ''}
							placeholder="e.g., City, Street"
						/>
					</div>
				</Card.Content>
				<Card.Footer class="border-t px-6 py-4">
					<Button type="submit">Save Changes</Button>
				</Card.Footer>
			</form>
		</Card.Root>

		<Card.Root class="border-destructive">
			<Card.Header>
				<Card.Title>Delete Store</Card.Title>
				<Card.Description>
					Permanently delete this store. This action cannot be undone. You can only delete stores
					that are not linked to any receipts.
				</Card.Description>
			</Card.Header>
			<Card.Footer class="flex justify-between border-t px-6 py-4">
				{#if isDeleting}
					<p class="text-sm text-destructive-foreground">Are you sure?</p>
					<div class="flex gap-2">
						<Button variant="ghost" onclick={() => (isDeleting = false)}>Cancel</Button>
						<form method="POST" action="?/delete" use:enhance>
							<Button variant="destructive">Yes, Delete</Button>
						</form>
					</div>
				{:else}
					<Button variant="destructive" onclick={() => (isDeleting = true)}>
						<Trash2 class="mr-2 h-4 w-4" />
						Delete Store
					</Button>
				{/if}
			</Card.Footer>
		</Card.Root>
	</div>
</main>
