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

	let { data = $bindable() }: { data: PageData } = $props();
	let stores = $derived(data.stores);

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

	function setAsPrimary(event: Event, storeId: string) {
		e.stopPropagation();
		primaryStoreId = storeId;
	}

	const duplicateStoreIds = $derived(
		Array.from(selectedStoreIds).filter((id) => id !== primaryStoreId)
	);
</script>

<main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
	<div class="flex items-center gap-2">
		<div>
			<h1 class="text-2xl font-bold">Store Management</h1>
			<p class="text-muted-foreground">Create, view, and edit your store locations.</p>
		</div>
		<div class="ml-auto flex items-center gap-2">
			{#if !isSelectionMode}
				<Button href="/dashboard/stores/new" size="sm" class="hidden sm:flex">
					<PlusCircle class="mr-2 h-4 w-4" />
					Add New Store
				</Button>
				<Button href="/dashboard/stores/new" size="icon" class="sm:hidden">
					<PlusCircle class="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={() => (isSelectionMode = true)}
					class="hidden sm:flex"
				>
					<Merge class="mr-2 h-4 w-4" />
					Merge Stores
				</Button>
				<Button
					variant="outline"
					size="icon"
					onclick={() => (isSelectionMode = true)}
					class="sm:hidden"
				>
					<Merge class="h-4 w-4" />
				</Button>
			{/if}
		</div>
	</div>

	<Card.Root class="pt-0 mb-24">
		<Card.Content class="p-0">
			<!-- Mobile-friendly List View -->
			<div class="block md:hidden">
				{#if stores && stores.length > 0}
					{#each stores as store (store.id)}
						<div
							role="button"
							tabindex="0"
							onclick={() => handleRowClick(store.id)}
							onkeydown={(e) => e.key === 'Enter' && handleRowClick(store.id)}
							oncontextmenu={(e) => startSelectionMode(store.id, e)}
							class="block border-b p-4 transition-colors last:border-b-0 {isSelectionMode
								? ''
								: 'hover:bg-muted/50'} {primaryStoreId === store.id
								? 'bg-green-100 dark:bg-green-900/30'
								: ''}"
							aria-label="Select or edit store {store.name ?? 'N/A'}"
						>
							<div class="flex items-center justify-between">
								<div class="flex flex-1 items-center gap-4 overflow-hidden">
									{#if isSelectionMode}
										<Checkbox
											checked={selectedStoreIds.has(store.id)}
											aria-label="Select store"
										/>
									{/if}
									<div class="flex-1 overflow-hidden">
										<p class="truncate font-semibold">{store.name ?? 'N/A'}</p>
									</div>
								</div>
								{#if !isSelectionMode}
									<Button
										href={`/dashboard/stores/${store.id}`}
										variant="ghost"
										size="icon"
										aria-label="Edit store"
										onclick={(e) => {
											e.stopPropagation();
											goto(`/dashboard/stores/${store.id}`);
										}}
									>
										<Pencil class="h-4 w-4" />
									</Button>
								{/if}
							</div>
							<div
								class="mt-1 max-w-3/5 truncate text-sm text-muted-foreground {isSelectionMode ? 'pl-10' : ''}"
							>
								{store.location ?? 'No location specified'}
							</div>
							{#if isSelectionMode && primaryStoreId === store.id}
								<div class="mt-2 pl-10 text-xs font-bold text-green-600">PRIMARY</div>
							{/if}
							{#if isSelectionMode && selectedStoreIds.has(store.id) && primaryStoreId !== store.id}
								<div class="mt-4 flex justify-end">
									<Button
										variant="outline"
										size="sm"
										onclick={(e) => setAsPrimary(e, store.id)}
									>
										Set as Primary
									</Button>
								</div>
							{/if}
						</div>
					{/each}
				{:else}
					<div class="px-4 py-10 text-center text-muted-foreground">No stores found.</div>
				{/if}
			</div>

			<!-- Desktop Table View -->
			<div class="hidden md:block">
				<Table.Root>
					<Table.Header>
						<Table.Row gridCols="grid-cols-[auto_1fr_1fr_150px]">
							{#if isSelectionMode}
								<Table.Head class="w-[50px]"></Table.Head>
							{/if}
							<Table.Head>Name</Table.Head>
							<Table.Head>Location</Table.Head>
							<Table.Head class="w-[150px] text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#if stores && stores.length > 0}
							{#each stores as store (store.id)}
								<Table.Row
									class="cursor-pointer {isSelectionMode ? '' : 'hover:bg-muted/50'} {primaryStoreId ===
									store.id
										? 'bg-green-100'
										: ''}"
									gridCols="grid-cols-[auto_1fr_1fr_150px]"
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
											<p class="truncate">{store.name}</p>
											{#if primaryStoreId === store.id}
												<span class="rounded-full bg-green-500 px-2 py-0.5 text-xs text-white"
													>Primary</span
												>
											{/if}
										</div>
									</Table.Cell>
									<Table.Cell class="text-muted-foreground">
										<p class="truncate">{store.location ?? 'N/A'}</p>
									</Table.Cell>
									<Table.Cell class="text-right">
										{#if isSelectionMode && selectedStoreIds.has(store.id) && primaryStoreId !== store.id}
											<Button
												variant="outline"
												size="sm"
												onclick={(e) => setAsPrimary(e, store.id)}
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
								<Table.Cell colspan={4} class="h-24 text-center">
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
									console.log('Stores merged successfully, invalidating all');
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
