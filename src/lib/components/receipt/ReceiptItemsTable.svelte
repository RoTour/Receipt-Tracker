<!-- src/lib/components/receipt/ReceiptItemsTable.svelte -->
<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import * as ContextMenu from '$lib/components/ui/context-menu/index.js';
	import { Pencil, Edit, Link } from 'lucide-svelte';
	import type { PageData } from '../../../../routes/dashboard/receipt/[id]/$types';
	import EditItemDialog from './EditItemDialog.svelte';
	import RenameProductDialog from './RenameProductDialog.svelte';
	import LinkProductDialog from './LinkProductDialog.svelte';

	type ReceiptItem = PageData['receipt']['receipt_items'][0];

	type Props = {
		items: ReceiptItem[];
	};
	let { items }: Props = $props();

	let isEditItemOpen = $state(false);
	let isRenameProductOpen = $state(false);
	let isLinkProductOpen = $state(false);
	let selectedItem: ReceiptItem | null = $state(null);

	function openEditItemModal(item: ReceiptItem) {
		selectedItem = item;
		isEditItemOpen = true;
	}

	function openRenameProductModal(item: ReceiptItem) {
		selectedItem = item;
		isRenameProductOpen = true;
	}

	function openLinkProductModal(item: ReceiptItem) {
		selectedItem = item;
		isLinkProductOpen = true;
	}
</script>

{#if items.length > 0}
	<Table.Root class="w-full">
		<Table.Body>
			{#each items as item (item.id)}
				<ContextMenu.Root>
					<ContextMenu.Trigger>
						<Table.Row class="cursor-pointer select-none active:bg-muted/75 grid-cols-[65%_15%_20%]">
							<Table.Cell>
								<div class="truncate font-medium">
									{item.products?.normalized_name ?? 'N/A'}
								</div>
								<div class="text-muted-foreground truncate text-xs">{item.raw_text}</div>
							</Table.Cell>
							<Table.Cell class="text-right">{item.quantity}</Table.Cell>
							<Table.Cell class="text-right font-mono">€{item.price.toFixed(2)}</Table.Cell>
						</Table.Row>
					</ContextMenu.Trigger>
					<ContextMenu.Content>
						<ContextMenu.Item onclick={() => openEditItemModal(item)}>
							<Pencil class="mr-2 h-4 w-4" />
							Edit price and quantity
						</ContextMenu.Item>
						<ContextMenu.Item onclick={() => openRenameProductModal(item)}>
							<Edit class="mr-2 h-4 w-4" />
							Rename Product
						</ContextMenu.Item>
						<ContextMenu.Item onclick={() => openLinkProductModal(item)}>
							<Link class="mr-2 h-4 w-4" />
							Link to Product
						</ContextMenu.Item>
					</ContextMenu.Content>
				</ContextMenu.Root>
			{/each}
		</Table.Body>
	</Table.Root>
{:else}
	<div class="text-muted-foreground rounded-md border border-dashed py-10 text-center">
		<p>No items were found on this receipt.</p>
		<p class="mt-1 text-xs">Try reprocessing to scan the image again.</p>
	</div>
{/if}

<EditItemDialog bind:open={isEditItemOpen} item={selectedItem} />
<RenameProductDialog bind:open={isRenameProductOpen} item={selectedItem} />
<LinkProductDialog bind:open={isLinkProductOpen} item={selectedItem} />
