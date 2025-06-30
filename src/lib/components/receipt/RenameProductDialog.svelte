<!-- src/lib/components/receipt/RenameProductDialog.svelte -->
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
			<Dialog.Title>Rename Product</Dialog.Title>
			<Dialog.Description>
				This will update the product's name and brand across all receipts.
			</Dialog.Description>
		</Dialog.Header>
		{#if item}
			<form
				method="POST"
				action="?/renameProduct"
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
				<input type="hidden" name="product_id" value={item.products.id} />
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="name" class="text-right">Name</Label>
					<Input
						id="name"
						name="normalized_name"
						value={item.products?.normalized_name ?? ''}
						class="col-span-3"
					/>
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="brand" class="text-right">Brand</Label>
					<Input
						id="brand"
						name="brand"
						value={item.products?.brand ?? ''}
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

