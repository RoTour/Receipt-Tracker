// src/routes/dashboard/receipt/[id]/+page.server.ts

import { error } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	console.log(`Loading details for receipt ID: ${params.id}`);

	const { data: receipt, error: dbError } = await supabase
		.from('receipts')
		.select(
			`
      id,
      total,
      purchase_date,
      file_path,
      stores ( name, location ),
      receipt_items (
        id,
        raw_text,
        quantity,
        price,
        products ( normalized_name, brand )
      )
    `
		)
		.eq('id', params.id)
		.single();

	if (dbError) {
		console.error('Error fetching receipt details:', dbError);
		throw error(500, 'Failed to fetch receipt details from the database.');
	}

	if (!receipt) {
		throw error(404, 'Receipt not found.');
	}

	// --- FIX: Generate a secure, signed URL for the image ---
	// This is the correct way to access files in private buckets.
	let imageUrl = null;
	if (receipt.file_path) {
		const { data, error: urlError } = await supabase.storage
			.from('receipts') // Use the bucket name from your .env
			.createSignedUrl(receipt.file_path, 60 * 5); // URL is valid for 5 minutes

		if (urlError) {
			console.error('Error creating signed URL:', urlError);
			// Don't block the page load, just means the image won't show.
		} else {
			imageUrl = data.signedUrl;
		}
	}

	console.log('Receipt details loaded successfully.');

	return {
		receipt,
		imageUrl
	};
};
