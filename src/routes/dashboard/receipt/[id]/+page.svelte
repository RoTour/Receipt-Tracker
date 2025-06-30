<!-- src/routes/dashboard/receipt/[id]/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { ArrowLeft, RefreshCw, Pencil } from 'lucide-svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	// The receipt object is now mutable so we can update it from the form action result.
	let { receipt, imageUrl, stores } = data;

	let receiptItems = $derived(receipt.receipt_items);

	let isReprocessing = $state(false);
	let isEditingStore = $state(false);
</script>

<main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
	<div class="flex items-center gap-4">
		<Button href="/dashboard" variant="outline" size="icon" class="h-7 w-7">
			<ArrowLeft class="h-4 w-4" />
			<span class="sr-only">Back</span>
		</Button>
		<h1 class="flex-1 shrink-0 text-xl font-semibold tracking-tight whitespace-nowrap sm:grow-0">
			Receipt Details
		</h1>
		<form
			method="POST"
			action="?/reprocess"
			use:enhance={() => {
				isReprocessing = true;
				return async ({ result, update }) => {
					// Manually handle the form result update
					if (result.type === 'success' && result.data?.success) {
						// As you suggested, we now get the updated receipt from the action.
						// We directly assign it to our local `receipt` variable to update the UI.
						receipt = result.data.updatedReceipt;
						receiptItems = result.data.updatedReceipt?.receipt_items;
					}

					// We need to call `update` to apply the result to the `form` prop
					// and prevent the default full-page reload.
					await update({ reset: false });
					isReprocessing = false;
				};
			}}
			class="ml-auto"
		>
			<Button variant="outline" size="sm" disabled={isReprocessing} type="submit">
				<RefreshCw class="mr-2 h-4 w-4 {isReprocessing ? 'animate-spin' : ''}" />
				Reprocess
			</Button>
		</form>
	</div>

	{#if form?.message}
		<div
			class="rounded-md p-3 text-sm font-medium {form.success
				? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
				: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}"
		>
			{form.message}
		</div>
	{/if}

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
		<Card.Root class="lg:col-span-4">
			<Card.Header class="relative">
				{#if isEditingStore}
					<form
						method="POST"
						action="?/updateStore"
						use:enhance={() => {
							return async ({ result, update }) => {
								if (result.type === 'success' && result.data?.success) {
									receipt = result.data.updatedReceipt;
									isEditingStore = false;
								}
								await update({ reset: false });
							};
						}}
						class="space-y-4"
					>
						<select
              name="storeId"
              class="border-input bg-background selection:bg-primary dark:bg-input/30 selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground shadow-xs flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
							{#each stores as store}
								<option value={store.id} selected={store.id === receipt.stores?.id}>
									{store.name} - {store.location}
								</option>
							{/each}
						</select>
						<div class="flex justify-end gap-2">
							<Button type="button" variant="ghost" onclick={() => (isEditingStore = false)}>
								Cancel
							</Button>
							<Button type="submit">Save</Button>
						</div>
					</form>
				{:else}
					<Button
						variant="ghost"
						size="icon"
						class="absolute right-2 top-2"
						onclick={() => (isEditingStore = true)}
					>
						<Pencil class="h-4 w-4" />
					</Button>
					<Card.Title>{receipt.stores?.name ?? 'Unknown Store'}</Card.Title>
					<Card.Description>
						{receipt.stores?.location ?? 'No location specified'}
					</Card.Description>
				{/if}
			</Card.Header>
			<Card.Content class="grid gap-4">
				<div class=" flex items-center space-x-4 rounded-md border p-4">
					<div class="flex-1 space-y-1">
						<p class="text-sm leading-none font-medium">Purchase Date</p>
						<p class="text-muted-foreground text-sm">
							{new Date(receipt.purchase_date).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</p>
					</div>
					<div class="flex-1 space-y-1 text-right">
						<p class="text-sm leading-none font-medium">Total</p>
						<p class="text-primary text-2xl font-bold">€{(receipt.total ?? 0).toFixed(2)}</p>
					</div>
				</div>
				<Separator />
				{#if receiptItems.length > 0}
					<Table.Root class="w-full table-fixed">
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-[65%]">Item</Table.Head>
								<Table.Head class="w-[15%] text-right">Qty</Table.Head>
								<Table.Head class="w-[20%] text-right">Price</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each receiptItems as item (item.id)}
								<Table.Row>
									<Table.Cell>
										<div class="truncate font-medium">
											{item.products?.normalized_name ?? 'N/A'}
										</div>
										<div class="text-muted-foreground truncate text-xs">{item.raw_text}</div>
									</Table.Cell>
									<Table.Cell class="text-right">{item.quantity}</Table.Cell>
									<Table.Cell class="text-right font-mono">€{item.price.toFixed(2)}</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				{:else}
					<div class="text-muted-foreground rounded-md border border-dashed py-10 text-center">
						<p>No items were found on this receipt.</p>
						<p class="mt-1 text-xs">Try reprocessing to scan the image again.</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
		<Card.Root class="lg:col-span-3">
			<Card.Header>
				<Card.Title>Original Receipt</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if imageUrl}
					<a href={imageUrl} target="_blank" rel="noopener noreferrer">
						<img
							src={imageUrl}
							alt="Scanned receipt"
							class="aspect-[9/16] w-full rounded-md object-cover transition-transform hover:scale-105"
						/>
					</a>
				{:else}
					<div
						class="flex aspect-[9/16] w-full items-center justify-center rounded-md border border-dashed"
					>
						<p class="text-muted-foreground text-sm">No image available</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</main>
