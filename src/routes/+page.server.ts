// src/routes/+page.server.ts

import { supabase } from '$lib/server/supabase';
import { fail } from '@sveltejs/kit';
import { env as publicEnv } from '$env/dynamic/public';
import { ocrReceipt, receiptZodSchema } from '$lib/server/ai';
import type { Actions } from './$types';
import { createHash } from 'crypto';
import { processAndSaveReceiptItems } from '$lib/server/db_helpers';

/**
 * Creates a SHA-256 hash from a buffer.
 * @param {Buffer} buffer - The buffer to hash.
 * @returns {string} The SHA-256 hash as a hex string.
 */
function sha256(buffer: Buffer): string {
	return createHash('sha256').update(buffer).digest('hex');
}

/**
 * Creates a stable SHA-256 hash from a JavaScript object.
 * It sorts the object keys to ensure the hash is consistent.
 * @param {object} obj - The object to hash.
 * @returns {string} The resulting SHA-256 hash.
 */
function createContentHash(obj: object): string {
	const stableString = JSON.stringify(obj, Object.keys(obj).sort());
	return sha256(Buffer.from(stableString));
}

export const actions: Actions = {
	/**
	 * 'upload' action to handle file submissions, perform OCR, and save structured data.
	 */
	upload: async ({ request }) => {
		const formData = await request.formData();
		const files = formData.getAll('receipts') as File[];
		const bucketName = publicEnv.PUBLIC_SUPABASE_BUCKET_NAME;

		if (!bucketName) {
			return fail(500, {
				error: 'Supabase bucket name is not configured.'
			});
		}
		if (files.length === 0 || (files.length === 1 && files[0].size === 0)) {
			return fail(400, { error: 'No files were uploaded.' });
		}

		const processedReceipts = [];
		const skippedFiles = [];

		for (const file of files) {
			console.log(`--- Processing file: ${file.name} ---`);
			try {
				// 1. Calculate File Hash and check for exact duplicates
				const fileBuffer = Buffer.from(await file.arrayBuffer());
				const fileHash = sha256(fileBuffer);

				const { data: existingFile } = await supabase
					.from('receipts')
					.select('id')
					.eq('file_hash', fileHash)
					.single();

				if (existingFile) {
					console.log(`Skipping file ${file.name} - already exists (file hash match).`);
					skippedFiles.push({ name: file.name, reason: 'Duplicate file' });
					continue;
				}

				// 2. Get structured data from AI
				const aiResult = await ocrReceipt(file);
				const validation = receiptZodSchema.safeParse(aiResult);
				if (!validation.success) {
					console.error('AI validation failed:', validation.error);
					throw new Error('AI result did not match the expected format.');
				}
				const { store_name, store_location, purchase_date, total, items } = validation.data;

				// 3. Calculate Content Hash and check for semantic duplicates
				const contentHash = createContentHash(validation.data);
				const { data: existingContent } = await supabase
					.from('receipts')
					.select('id')
					.eq('content_hash', contentHash)
					.single();

				if (existingContent) {
					console.log(`Skipping file ${file.name} - already exists (content hash match).`);
					skippedFiles.push({ name: file.name, reason: 'Duplicate content' });
					continue;
				}

				// 4. Upload the original receipt image to Supabase Storage
				const filePath = `public/${Date.now()}-${file.name}`;
				const { error: uploadError } = await supabase.storage
					.from(bucketName)
					.upload(filePath, file);
				if (uploadError) throw new Error(`Storage error: ${uploadError.message}`);

				// 5. Find or create the store
				const { data: store, error: storeError } = await supabase
					.from('stores')
					.upsert(
						{
							name: store_name,
							location: store_location
						},
						{ onConflict: 'name, location', ignoreDuplicates: false }
					)
					.select('id')
					.single();
				if (storeError) throw new Error(`Failed to find/create store: ${storeError.message}`);
				const storeId = store.id;

				// 6. Create the main receipt record with the new hashes
				const { data: receiptRecord, error: receiptError } = await supabase
					.from('receipts')
					.insert({
						store_id: storeId,
						purchase_date,
						total,
						file_path: filePath,
						file_hash: fileHash,
						content_hash: contentHash
					})
					.select('id')
					.single();
				if (receiptError) throw new Error(`Failed to create receipt: ${receiptError.message}`);
				const receiptId = receiptRecord.id;

				// 7. Process and save items using the new helper function
				await processAndSaveReceiptItems(supabase, receiptId, items);

				console.log(`Successfully processed and saved receipt with ID: ${receiptId}`);
				processedReceipts.push(validation.data);
			} catch (error) {
				console.error(`Error processing file ${file.name}:`, error);
				const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
				return fail(500, { error: `Failed to process ${file.name}: ${errorMessage}` });
			}
		}

		let message = `${processedReceipts.length} receipt(s) processed and saved successfully!`;
		if (skippedFiles.length > 0) {
			message += ` ${skippedFiles.length} file(s) were skipped as duplicates.`;
		}

		return {
			success: true,
			message,
			processedReceipts
		};
	}
};
