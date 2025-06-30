<!-- src/lib/components/receipt/EditItemDialog.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { PageData } from '../../../../routes/dashboard/receipt/[id]/$types';
	import { invalidateAll } from '$app/navigation';

	type ReceiptItem = PageData['receipt']['receipt_items'][0];

	type Props = {
		open: boolean;
		item: ReceiptItem | null;
	};
	let { open = $bindable(), item }: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Item</Dialog.Title>
			<Dialog.Description>
				Update the quantity and price for this specific item. This will not affect other receipts.
			</Dialog.Description>
		</Dialog.Header>
		{#if item}
			<form
				method="POST"
				action="?/updateItem"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success' && result.data?.success) {
							await invalidateAll();
							open = false;
						}
						await update({ reset: false });
					};
				}}
				class="grid gap-4 py-4"
			>
				<input type="hidden" name="receipt_item_id" value={item.id} />
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="quantity" class="text-right">Quantity</Label>
					<Input
						id="quantity"
						name="quantity"
						type="number"
						value={item.quantity}
						class="col-span-3"
					/>
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="price" class="text-right">Price (€)</Label>
					<Input
						id="price"
						name="price"
						type="number"
						step="0.01"
						value={item.price}
						class="col-span-3"
					/>
				</div>
				<Dialog.Footer>
					<Button type="submit">Save Changes</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
