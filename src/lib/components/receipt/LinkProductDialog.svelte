<!-- src/lib/components/receipt/LinkProductDialog.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { ActionData, PageData } from '../../../../routes/dashboard/receipt/[id]/$types';
	import { invalidateAll } from '$app/navigation';

	type ReceiptItem = PageData['receipt']['receipt_items'][0];
	type Product = { id: string; normalized_name: string; brand: string | null };

	type Props = {
		open: boolean;
		item: ReceiptItem | null;
	};
	let { open = $bindable(), item }: Props = $props();

	let searchResults: Product[] = $state([]);
	let searchQuery = $state('');
	let debounceTimer: number;

	async function searchProducts() {
		const res = await fetch(`/api/products?q=${encodeURIComponent(searchQuery)}`);

		if (res.ok) {
			const data = await res.json();
			if (data.products) {
				searchResults = data.products;
			}
		}
	}

	function handleInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			if (searchQuery.length > 2) {
				searchProducts();
			}
		}, 300);
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Link Product</Dialog.Title>
			<Dialog.Description>
				Link the raw text <span class="font-mono">"{item?.raw_text}"</span> to an existing product. This
				will apply to all future receipts.
			</Dialog.Description>
		</Dialog.Header>

		<div class="py-4">
			<Input
				name="search"
				placeholder="Search for a product..."
				bind:value={searchQuery}
				oninput={handleInput}
			/>
		</div>

		{#if searchResults.length > 0}
			<div class="-mx-6 max-h-64 overflow-y-auto px-6">
				<div class="divide-y border-t">
					{#each searchResults as product (product.id)}
						<form
							method="POST"
							action="?/linkProduct"
							use:enhance={() => {
								return async ({ result, update }) => {
									if (result.type === 'success' && result.data?.success) {
										await invalidateAll();
										open = false;
									}
									await update({ reset: false });
								};
							}}
						>
							<input type="hidden" name="receipt_item_id" value={item?.id} />
							<input type="hidden" name="product_id" value={product.id} />
							<input type="hidden" name="raw_text" value={item?.raw_text} />
							<button
								type="submit"
								class="hover:bg-muted/50 flex w-full items-center justify-between p-4 text-left transition-colors"
							>
								<div>
									<p class="font-medium">{product.normalized_name}</p>
									<p class="text-muted-foreground text-sm">{product.brand}</p>
								</div>
								<span class="text-sm text-blue-500">Link</span>
							</button>
						</form>
					{/each}
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
