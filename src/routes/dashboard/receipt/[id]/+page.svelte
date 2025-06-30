<!-- src/routes/dashboard/receipt/[id]/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { ArrowLeft, RefreshCw, Pencil } from 'lucide-svelte';
	import type { ActionData, PageData } from './$types';
	import ReceiptItemsTable from '$lib/components/receipt/ReceiptItemsTable.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let { receipt, imageUrl, stores } = $derived(data);

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
				<ReceiptItemsTable items={receipt.receipt_items} />
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

