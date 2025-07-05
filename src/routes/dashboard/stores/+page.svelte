<!-- src/routes/dashboard/stores/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Merge, Pencil, PlusCircle, X } from 'lucide-svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { stores } = data;

	let isSelectionMode = $state(false);
	let selectedStoreIds = $state(new SvelteSet<string>());
	let primaryStoreId = $state<string | null>(null);

	function handleRowClick(storeId: string) {
		if (!isSelectionMode) {
			goto(`/dashboard/stores/${storeId}`);
			return;
		}

		if (selectedStoreIds.has(storeId)) {
			selectedStoreIds.delete(storeId);
			if (primaryStoreId === storeId) {
				primaryStoreId = selectedStoreIds.values().next().value || null;
			}
		} else {
			selectedStoreIds.add(storeId);
			if (!primaryStoreId) {
				primaryStoreId = storeId;
			}
		}

		if (selectedStoreIds.size === 0) {
			isSelectionMode = false;
			primaryStoreId = null;
		}
	}

	function startSelectionMode(storeId: string, e: MouseEvent) {
		e.preventDefault();
		isSelectionMode = true;
		primaryStoreId = storeId;
		selectedStoreIds.add(storeId);
	}

	function cancelSelectionMode() {
		isSelectionMode = false;
		selectedStoreIds.clear();
		primaryStoreId = null;
	}

	function setAsPrimary(storeId: string) {
		primaryStoreId = storeId;
	}

	const duplicateStoreIds = $derived(
		Array.from(selectedStoreIds).filter((id) => id !== primaryStoreId)
	);
</script>

<main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
	<div class="flex items-center">
		<div>
			<h1 class="text-2xl font-bold">Store Management</h1>
			<p class="text-muted-foreground">Create, view, and edit your store locations.</p>
		</div>
		<div class="ml-auto flex items-center gap-2">
			{#if !isSelectionMode}
				<Button href="/dashboard/stores/new" size="sm">
					<PlusCircle class="mr-2 h-4 w-4" />
					Add New Store
				</Button>
				<Button variant="outline" size="sm" onclick={() => (isSelectionMode = true)}>
					<Merge class="mr-2 h-4 w-4" />
					Merge Stores
				</Button>
			{/if}
		</div>
	</div>

	<Card.Root class="py-0">
		<Card.Content class="px-0 pt-0 md:px-6 md:pt-6">
			<div class="hidden md:block">
				<Table.Root>
					<Table.Header>
						<Table.Row gridCols="grid-cols-[auto_1fr_1fr_100px]">
							{#if isSelectionMode}
								<Table.Head class="w-[50px]"></Table.Head>
							{/if}
							<Table.Head>Name</Table.Head>
							<Table.Head>Location</Table.Head>
							<Table.Head class="w-[100px] text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#if stores && stores.length > 0}
							{#each stores as store (store.id)}
								<Table.Row
									class="cursor-pointer {isSelectionMode ? '' : 'hover:bg-muted/50'}"
									gridCols="grid-cols-[auto_1fr_1fr_100px]"
									oncontextmenu={(e) => startSelectionMode(store.id, e)}
									onclick={() => handleRowClick(store.id)}
								>
									{#if isSelectionMode}
										<Table.Cell class="w-[50px]">
											<Checkbox checked={selectedStoreIds.has(store.id)} />
										</Table.Cell>
									{/if}
									<Table.Cell class="font-medium">
										<div class="flex items-center gap-2">
											{store.name}
											{#if primaryStoreId === store.id}
												<span class="rounded-full bg-green-500 px-2 py-0.5 text-xs text-white"
													>Primary</span
												>
											{/if}
										</div>
									</Table.Cell>
									<Table.Cell class="text-muted-foreground"
										>{store.location ?? 'N/A'}</Table.Cell
									>
									<Table.Cell class="text-right">
										{#if isSelectionMode && selectedStoreIds.has(store.id) && primaryStoreId !== store.id}
											<Button variant="outline" size="sm" onclick={() => setAsPrimary(store.id)}
												>Set as Primary</Button
											>
										{:else if !isSelectionMode}
											<Button href={`/dashboard/stores/${store.id}`} variant="outline" size="sm">
												<Pencil class="mr-2 h-4 w-4" />
												Edit
											</Button>
										{/if}
									</Table.Cell>
								</Table.Row>
							{/each}
						{:else}
							<Table.Row>
								<Table.Cell class="h-24 text-center">
									No stores found.
								</Table.Cell>
							</Table.Row>
						{/if}
					</Table.Body>
				</Table.Root>
			</div>
		</Card.Content>
	</Card.Root>

	{#if isSelectionMode}
		<div class="fixed inset-x-0 bottom-0 border-t bg-background/95 p-4 shadow-lg backdrop-blur-sm">
			<div class="container mx-auto flex items-center justify-between">
				<span class="text-muted-foreground text-sm"
					>{selectedStoreIds.size} store(s) selected</span
				>
				<div class="flex items-center gap-2">
					<Button variant="ghost" onclick={cancelSelectionMode}>
						<X class="mr-2 h-4 w-4" />
						Cancel
					</Button>
					<form
						method="POST"
						action="?/merge"
						use:enhance={() => {
							return async ({ result, update }) => {
								await update({ reset: false });
								if (result.type === 'success' && result.data?.success) {
									cancelSelectionMode();
									await invalidateAll();
								}
							};
						}}
					>
						<input type="hidden" name="primaryStoreId" value={primaryStoreId} />
						{#each duplicateStoreIds as id}
							<input type="hidden" name="duplicateStoreIds" value={id} />
						{/each}
						<Button type="submit" disabled={selectedStoreIds.size < 2}>
							<Merge class="mr-2 h-4 w-4" />
							Merge Selected
						</Button>
					</form>
				</div>
			</div>
		</div>
	{/if}
</main>