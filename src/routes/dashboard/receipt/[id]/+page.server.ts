// src/routes/dashboard/receipt/[id]/+page.server.ts

import { error, fail } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';
import type { PageServerLoad, Actions } from './$types';
import { env as publicEnv } from '$env/dynamic/public';
import { ocrReceipt, receiptZodSchema } from '$lib/server/ai';
import { processAndSaveReceiptItems } from '$lib/server/db_helpers';
import { generateProductKey } from '$lib/server/normalization';

function sha256(buffer: Buffer): string {
	return createHash('sha256').update(buffer).digest('hex');
}
function createContentHash(obj: object): string {
	const stableString = JSON.stringify(obj, Object.keys(obj).sort());
	return sha256(Buffer.from(stableString));
}

const getReceiptQuery = (id: string) => {
	return supabase
		.from('receipts')
		.select(
			`
      id,
      total,
      purchase_date,
      file_path,
      stores ( id, name, location ),
      receipt_items (
        id,
        raw_text,
        quantity,
        price,
        products ( id, normalized_name, brand )
      )
    `
		)
		.eq('id', id)
		.single();
};

export const load: PageServerLoad = async ({ params }) => {
	console.log(`Loading details for receipt ID: ${params.id}`);
	const bucketName = publicEnv.PUBLIC_SUPABASE_BUCKET_NAME;

	if (!bucketName) {
		throw error(500, 'Supabase bucket name is not configured.');
	}

	const { data: receipt, error: dbError } = await getReceiptQuery(params.id);

	if (dbError) {
		console.error('Error fetching receipt details:', dbError);
		throw error(500, 'Failed to fetch receipt details from the database.');
	}

	if (!receipt) {
		throw error(404, 'Receipt not found.');
	}

	let imageUrl = null;
	if (receipt.file_path) {
		const { data, error: urlError } = await supabase.storage
			.from(bucketName)
			.createSignedUrl(receipt.file_path, 60 * 5);

		if (urlError) {
			console.error('Error creating signed URL:', urlError);
		} else {
			imageUrl = data.signedUrl;
		}
	}

	const { data: stores, error: storesError } = await supabase.from('stores').select('id, name, location');

	if (storesError) {
		console.error('Error fetching stores:', storesError);
		// Not throwing an error here, as the page can still be useful without the stores list.
	}


	return {
		receipt,
		imageUrl,
		stores: stores ?? []
	};
};

export const actions: Actions = {
	/**
	 * Reprocesses the receipt image to refresh its item data.
	 */
	reprocess: async ({ params }) => {
		const receiptId = params.id;
		const bucketName = publicEnv.PUBLIC_SUPABASE_BUCKET_NAME;

		console.log(`Reprocessing receipt ID: ${receiptId}`);

		const { data: originalReceipt, error: fetchError } = await supabase
			.from('receipts')
			.select('file_path')
			.eq('id', receiptId)
			.single();

		if (fetchError || !originalReceipt || !originalReceipt.file_path) {
			return fail(404, { message: 'Could not find original receipt file.' });
		}

		try {
			const { data: fileBlob, error: downloadError } = await supabase.storage
				.from(bucketName)
				.download(originalReceipt.file_path);

			if (downloadError)
				throw new Error(`Failed to download receipt image: ${downloadError.message}`);

			const file = new File(
				[fileBlob],
				originalReceipt.file_path.split('/').pop() || 'receipt.jpg',
				{ type: fileBlob.type }
			);

			const aiResult = await ocrReceipt(file);
			const validation = receiptZodSchema.safeParse(aiResult);

			if (!validation.success) {
				throw new Error(`AI validation failed: ${validation.error.message}`);
			}
			const { total, items } = validation.data;

			const { error: deleteError } = await supabase
				.from('receipt_items')
				.delete()
				.eq('receipt_id', receiptId);

			if (deleteError) {
				throw new Error(`Failed to delete old items: ${deleteError.message}`);
			}

			const newContentHash = createContentHash(validation.data);
			const { error: updateError } = await supabase
				.from('receipts')
				.update({
					total: total,
					content_hash: newContentHash
				})
				.eq('id', receiptId);

			if (updateError) {
				throw new Error(`Failed to update receipt: ${updateError.message}`);
			}

			await processAndSaveReceiptItems(supabase, receiptId, items);

			// Re-fetch the entire receipt with the new data
			const { data: updatedReceipt, error: refetchError } = await getReceiptQuery(receiptId);

			if (refetchError) {
				throw new Error(`Failed to refetch receipt data after update: ${refetchError.message}`);
			}

			return { success: true, message: 'Receipt reprocessed successfully!', updatedReceipt };
		} catch (e) {
			const errorMessage =
				e instanceof Error ? e.message : 'An unknown error occurred during reprocessing.';
			console.error('Reprocessing failed:', errorMessage);
			return fail(500, { message: errorMessage });
		}
	},

	/**
	 * Updates the store associated with the receipt.
	 */
	updateStore: async ({ request, params }) => {
		const receiptId = params.id;
		const formData = await request.formData();
		const storeId = formData.get('storeId') as string;

		if (!storeId) {
			return fail(400, { success: false, message: 'No store was selected.' });
		}

		console.log(`Updating store for receipt ${receiptId} to store ${storeId}`);

		try {
			const { error: updateError } = await supabase
				.from('receipts')
				.update({ store_id: storeId })
				.eq('id', receiptId);

			if (updateError) {
				throw new Error(`Failed to update store: ${updateError.message}`);
			}

			// Re-fetch the receipt data to get the updated store name
			const { data: updatedReceipt, error: refetchError } = await getReceiptQuery(receiptId);

			if (refetchError) {
				throw new Error(
					`Failed to refetch receipt data after store update: ${refetchError.message}`
				);
			}

			return {
				success: true,
				message: 'Store updated successfully!',
				updatedReceipt
			};
		} catch (e) {
			const errorMessage =
				e instanceof Error ? e.message : 'An unknown error occurred during the update.';
			console.error('Store update failed:', errorMessage);
			return fail(500, { success: false, message: errorMessage });
		}
	},

	updateItem: async ({ request, params }) => {
		const receiptId = params.id;
		const formData = await request.formData();
		const receiptItemId = formData.get('receipt_item_id') as string;
		const quantity = parseFloat(formData.get('quantity') as string);
		const price = parseFloat(formData.get('price') as string);

		if (isNaN(quantity) || isNaN(price)) {
			return fail(400, { success: false, message: 'Invalid quantity or price.' });
		}

		try {
			const { error: updateError } = await supabase
				.from('receipt_items')
				.update({ quantity, price })
				.eq('id', receiptItemId);

			if (updateError) throw new Error(`Failed to update item: ${updateError.message}`);

			const { data: items } = await supabase
				.from('receipt_items')
				.select('price')
				.eq('receipt_id', receiptId);

			const newTotal = items?.reduce((acc, item) => acc + item.price, 0) ?? 0;

			const { error: receiptUpdateError } = await supabase
				.from('receipts')
				.update({ total: newTotal })
				.eq('id', receiptId);

			if (receiptUpdateError) throw new Error('Failed to update receipt total.');

			const { data: updatedReceipt } = await getReceiptQuery(receiptId);

			return { success: true, message: 'Item updated!', updatedReceipt };
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(500, { success: false, message });
		}
	},

	renameProduct: async ({ request, params }) => {
		const receiptId = params.id;
		const formData = await request.formData();
		const productId = formData.get('product_id') as string;
		const normalized_name = formData.get('normalized_name') as string;
		const brand = formData.get('brand') as string;

		if (!productId || !normalized_name) {
			return fail(400, { success: false, message: 'Product ID and name are required.' });
		}

		try {
			const { error: updateError } = await supabase
				.from('products')
				.update({ normalized_name, brand })
				.eq('id', productId);

			if (updateError) throw new Error(`Failed to rename product: ${updateError.message}`);

			const { data: updatedReceipt } = await getReceiptQuery(receiptId);

			return { success: true, message: 'Product renamed!', updatedReceipt };
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(500, { success: false, message });
		}
	},

	searchProducts: async ({ request }) => {
		const formData = await request.formData();
		const query = formData.get('query') as string;

		if (!query) {
			return { products: [] };
		}

		const { data: products, error } = await supabase
			.from('products')
			.select('id, normalized_name, brand')
			.ilike('normalized_name', `%${query}%`)
			.limit(10);

		if (error) {
			return fail(500, { message: 'Failed to search for products.' });
		}

		console.debug('Search results:', products);

		return { products };
	},

	linkProduct: async ({ request, params }) => {
		const receiptId = params.id;
		const formData = await request.formData();
		const receiptItemId = formData.get('receipt_item_id') as string;
		const productId = formData.get('product_id') as string;
		const rawText = formData.get('raw_text') as string;

		if (!receiptItemId || !productId || !rawText) {
			return fail(400, { success: false, message: 'Missing required fields.' });
		}

		const aliasKey = generateProductKey(rawText);

		try {
			const { error: aliasError } = await supabase.from('product_aliases').upsert(
				{
					alias_text: aliasKey,
					product_id: productId
				},
				{ onConflict: 'alias_text' }
			);

			if (aliasError) throw new Error(`Failed to create alias: ${aliasError.message}`);

			const { error: itemUpdateError } = await supabase
				.from('receipt_items')
				.update({ product_id: productId })
				.eq('id', receiptItemId);

			if (itemUpdateError) throw new Error(`Failed to update item: ${itemUpdateError.message}`);

			const { data: updatedReceipt } = await getReceiptQuery(receiptId);

			return { success: true, message: 'Product linked!', updatedReceipt };
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			return fail(500, { success: false, message });
		}
	}
};
