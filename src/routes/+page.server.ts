// src/routes/+page.server.ts

import { supabase } from '$lib/server/supabase';
import { fail } from '@sveltejs/kit';
import { env as publicEnv } from '$env/dynamic/public';
import { ocrReceipt, receiptZodSchema } from '$lib/server/ai';
import type { Actions } from './$types';

export const actions: Actions = {
	/**
	 * 'upload' action to handle file submissions, perform OCR, and save data.
	 */
	upload: async ({ request }) => {
		const formData = await request.formData();
		const files = formData.getAll('receipts') as File[];
		const bucketName = publicEnv.PUBLIC_SUPABASE_BUCKET_NAME;

		console.log('Upload action started.');

		if (!bucketName) {
			console.error('Supabase bucket name is not configured.');
			return fail(500, {
				error: 'Supabase bucket name is not configured in environment variables.'
			});
		}

		if (!files || files.length === 0 || (files.length === 1 && files[0].size === 0)) {
			console.warn('No files were uploaded.');
			return fail(400, { error: 'No files were uploaded. Please select at least one file.' });
		}

		console.log(`Processing ${files.length} file(s).`);
		const allExtractedData = [];

		for (const file of files) {
			console.log(`--- Starting processing for: ${file.name} ---`);
			try {
				// Step 1: Perform OCR with our AI service
				console.log('Step 1: Calling ocrReceipt...');
				const extractedData = await ocrReceipt(file);
				console.log('Step 1: ocrReceipt completed.');

				// Validate the data against our schema before proceeding
				const validation = receiptZodSchema.safeParse(extractedData);
				if (!validation.success) {
					console.error('AI response validation failed:', validation.error);
					return fail(500, { error: 'AI returned data in an unexpected format.' });
				}
				console.log('AI response validated successfully.');

				const { store, date, total, items } = validation.data;

				// Step 2: Upload the file to Supabase Storage
				console.log('Step 2: Uploading file to Supabase Storage...');
				const fileName = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
				const { data: uploadData, error: uploadError } = await supabase.storage
					.from(bucketName)
					.upload(fileName, file, {
						cacheControl: '3600',
						contentType: file.type || 'application/octet-stream'
					});

				if (uploadError) {
					throw new Error(`Supabase upload failed: ${uploadError.message}`);
				}
				console.log('Step 2: File uploaded successfully to:', uploadData.path);

				// Step 3: Insert the extracted data into the Supabase database
				console.log('Step 3: Inserting data into Supabase DB...');
				const { error: dbError } = await supabase.from('receipts').insert([
					{
						store: store,
						purchase_date: date,
						total: total,
						items: items, // Save the items array as JSONB
						file_path: uploadData.path
					}
				]);

				if (dbError) {
					// Add detailed logging to inspect the full error object
					console.error('Supabase DB Error Object:', JSON.stringify(dbError, null, 2));
					// Throw a more informative error
					throw new Error(`Supabase DB insert failed: ${dbError.message || 'No message property. See logs for full error object.'}`);
				}
				console.log('Step 3: DB insert successful.');

				allExtractedData.push(validation.data);
				console.log(`--- Finished processing for: ${file.name} ---`);
			} catch (error) {
				console.error('Error processing file:', file.name, error);
				const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
				return fail(500, { error: `Failed to process ${file.name}: ${errorMessage}` });
			}
		}

		console.log('Upload action completed successfully.');
		// On complete success, return the extracted data.
		return {
			success: true,
			message: `${files.length} receipt(s) processed and saved successfully!`,
			receipts: allExtractedData
		};
	}
};
