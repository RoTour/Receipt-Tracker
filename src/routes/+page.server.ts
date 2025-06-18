// src/routes/+page.server.ts

import { supabase } from '$lib/server/supabase';
import { fail } from '@sveltejs/kit';
import { env as publicEnv } from '$env/dynamic/public';
import { ocrReceipt, receiptZodSchema } from '$lib/server/ai';
import type { Actions } from './$types';

export const actions: Actions = {
	/**
	 * 'upload' action to handle file submissions, perform OCR, and save structured data.
	 */
	upload: async ({ request }) => {
		const formData = await request.formData();
		const files = formData.getAll('receipts') as File[];
		const bucketName = publicEnv.PUBLIC_SUPABASE_BUCKET_NAME;

		console.log(`Upload action started for ${files.length} file(s).`);

		if (!bucketName) {
			return fail(500, {
				error: 'Supabase bucket name is not configured.'
			});
		}
		if (files.length === 0 || (files.length === 1 && files[0].size === 0)) {
			return fail(400, { error: 'No files were uploaded.' });
		}

		const processedReceipts = [];

		for (const file of files) {
			console.log(`--- Processing file: ${file.name} ---`);
			try {
				// 1. Get structured data from AI
				const aiResult = await ocrReceipt(file);
				const validation = receiptZodSchema.safeParse(aiResult);
				if (!validation.success) {
					console.error('AI validation failed:', validation.error);
					throw new Error('AI returned data in an unexpected format.');
				}
				const { store_name, store_location, purchase_date, total, items } = validation.data;

				// 2. Find or Create the Store
				let storeId: string;
				// The schema is now handled by the client, so we can simplify the call.
				const { data: existingStore } = await supabase
					.from('stores')
					.select('id')
					.eq('name', store_name)
					.eq('location', store_location)
					.maybeSingle();

				if (existingStore) {
					storeId = existingStore.id;
					console.log(`Found existing store: ${store_name}`);
				} else {
					const { data: newStore, error: storeError } = await supabase
						.from('stores')
						.insert({ name: store_name, location: store_location })
						.select('id')
						.single();
					if (storeError) throw new Error(`Failed to create store: ${storeError.message}`);
					storeId = newStore.id;
					console.log(`Created new store: ${store_name}`);
				}

				// 3. Upload the receipt image
				const fileName = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
				const { data: uploadData, error: uploadError } = await supabase.storage
					.from(bucketName)
					.upload(fileName, file);
				if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

				// 4. Create the Receipt record
				const { data: receiptRecord, error: receiptError } = await supabase
					.from('receipts')
					.insert({
						store_id: storeId,
						purchase_date: purchase_date,
						total: total,
						file_path: uploadData.path
					})
					.select('id')
					.single();
				if (receiptError) throw new Error(`Failed to create receipt: ${receiptError.message}`);
				const receiptId = receiptRecord.id;

				// 5. Process each receipt item
				for (const item of items) {
					// Find or Create the Product
					const { data: newProduct, error: productError } = await supabase
						.from('products')
						.insert({
							normalized_name: item.normalized_name,
							brand: item.brand,
							is_verified: false // Crucial for our curation workflow
						})
						.select('id')
						.single();
					if (productError) throw new Error(`Failed to create product: ${productError.message}`);
					const productId = newProduct.id;

					// Create the Receipt Item linking everything together
					const { error: itemError } = await supabase.from('receipt_items').insert({
						receipt_id: receiptId,
						product_id: productId,
						raw_text: item.raw_text,
						quantity: item.quantity,
						price: item.price
					});
					if (itemError) throw new Error(`Failed to create receipt item: ${itemError.message}`);
				}
				console.log(`Successfully processed and saved receipt with ID: ${receiptId}`);
				processedReceipts.push(validation.data);
			} catch (error) {
				console.error(`Error processing file ${file.name}:`, error);
				const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
				return fail(500, { error: `Failed to process ${file.name}: ${errorMessage}` });
			}
		}

		return {
			success: true,
			message: `${files.length} receipt(s) processed and saved successfully!`,
			receipts: processedReceipts
		};
	}
};
