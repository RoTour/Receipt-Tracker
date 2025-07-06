// src/lib/server/db_helpers.ts

import type { SupabaseClient } from '@supabase/supabase-js';
import type { z } from 'zod';
import type { receiptZodSchema } from './ai';
import { generateProductKey } from './normalization';

type ItemsArray = z.infer<typeof receiptZodSchema>['items'];

/**
 * Processes and saves the items for a given receipt.
 * It first checks for a user-defined product alias for the item's raw text.
 * If no alias is found, it generates a normalized key to find or create a canonical product record.
 * It uses an in-memory map to prevent duplicate database calls for the same product within a single receipt.
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

	// In-memory cache to track product IDs for keys processed in this run.
	const processedProductKeys = new Map<string, string>();

	for (const item of items) {
		// The alias key is the normalized version of the raw text.
		const aliasKey = generateProductKey(item.raw_text);
		let productId: string;

		// Check if we've already processed this product key for this receipt
		if (processedProductKeys.has(aliasKey)) {
			productId = processedProductKeys.get(aliasKey)!;
		} else {
			// --- New Logic: Check for a product alias first ---
			const { data: alias } = await supabase
				.from('product_aliases')
				.select('product_id')
				.eq('alias_text', aliasKey)
				.single();

			if (alias) {
				// If an alias exists, use its product_id
				productId = alias.product_id;
			} else {
				// --- Fallback to original logic if no alias is found ---
				// The normalized_key for the products table is the same as the aliasKey
				const { data: product, error: productError } = await supabase
					.from('products')
					.upsert(
						{
							normalized_key: aliasKey, // Use the same key
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
						`Failed to upsert product with key '${aliasKey}': ${productError.message}`
					);
				}
				productId = product.id;
			}

			// Cache the result for subsequent items in the same receipt
			processedProductKeys.set(aliasKey, productId);
		}

		// Create the Receipt Item, linking everything together
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
