// src/lib/server/db_helpers.ts

import type { SupabaseClient } from '@supabase/supabase-js';
import type { z } from 'zod';
import type { receiptZodSchema } from './ai';
import { generateProductKey } from './normalization';

type ItemsArray = z.infer<typeof receiptZodSchema>['items'];

/**
 * Processes and saves the items for a given receipt.
 * It generates a normalized key for each product to robustly find or create a canonical product record.
 * @param supabase - The Supabase client instance.
 * @param receiptId - The UUID of the parent receipt.
 * @param items - The array of item objects from the AI.
 */
export async function processAndSaveReceiptItems(
	supabase: SupabaseClient,
	receiptId: string,
	items: ItemsArray
) {
	if (!items || items.length === 0) {
		console.log(`No items to process for receipt ID: ${receiptId}`);
		return;
	}

	for (const item of items) {
		// 1. Generate the robust normalized key for the product
		const normalizedKey = generateProductKey(item.normalized_name, item.brand);

		// 2. Find or Create the Product using the new normalized_key
		// This is much more reliable than relying on name/brand alone.
		const { data: product, error: productError } = await supabase
			.from('products')
			.upsert(
				{
					normalized_key: normalizedKey,
					normalized_name: item.normalized_name,
					brand: item.brand,
					is_verified: false
				},
				{ onConflict: 'normalized_key', ignoreDuplicates: false }
			)
			.select('id')
			.single();

		if (productError) {
			throw new Error(
				`Failed to upsert product with key '${normalizedKey}': ${productError.message}`
			);
		}
		const productId = product.id;

		// 3. Create the Receipt Item, linking everything together
		const { error: itemError } = await supabase.from('receipt_items').insert({
			receipt_id: receiptId,
			product_id: productId,
			raw_text: item.raw_text,
			quantity: item.quantity,
			price: item.price
		});

		if (itemError) {
			throw new Error(
				`Failed to create receipt item for product ID ${productId}: ${itemError.message}`
			);
		}
	}
	console.log(`Successfully processed ${items.length} items for receipt ID: ${receiptId}`);
}
